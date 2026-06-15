import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { stripe } from '../config/stripe';
import * as paymentService from '../services/payment.service';
import { OrderStatus, PaymentStatus } from '@prisma/client';

export const createPaymentIntent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { orderId } = req.body;
    const userId = req.user!.id;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order || order.userId !== userId) {
      res.status(404).json({ success: false, message: 'Order reference validation trace mismatch' });
      return;
    }

    const amountPaise = await paymentService.calculateOrderAmount(orderId);
    const intent = await paymentService.createStripePaymentIntent(orderId, amountPaise, order.user.email);

    // Persist intent metadata frame back into transactional database layer
    await prisma.payment.upsert({
      where: { orderId },
      update: { stripePaymentIntentId: intent.id, amount: order.total },
      create: {
        orderId,
        stripePaymentIntentId: intent.id,
        amount: order.total,
        status: PaymentStatus.PENDING,
      },
    });

    res.status(200).json({
      success: true,
      data: {
        clientSecret: intent.client_secret,
        paymentIntentId: intent.id,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const confirmPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { paymentIntentId, orderId } = req.body;

    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (intent.status === 'succeeded') {
      await prisma.$transaction([
        prisma.payment.update({
          where: { orderId },
          data: { status: PaymentStatus.SUCCESS, stripeChargeId: intent.latest_charge as string },
        }),
        prisma.order.update({
          where: { id: orderId },
          data: { status: OrderStatus.PROCESSING }, // Status advanced past PENDING bounds
        }),
      ]);

      res.status(200).json({ success: true, message: 'Payment states synchronized successfully.' });
      return;
    }

    res.status(400).json({ success: false, message: 'Stripe verification matrix check unfulfilled.' });
  } catch (error) {
    next(error);
  }
};

export const createRefund = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { orderId } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { orderId },
      include: { order: { include: { items: true } } },
    });

    if (!payment || !payment.stripeChargeId) {
      res.status(404).json({ success: false, message: 'Live valid charge track profile absent from memory allocation ledger' });
      return;
    }

    const refund = await paymentService.executeStripeRefund(payment.stripeChargeId);

    // Rollback stock levels and change transaction status within an isolated database context
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { orderId },
        data: { status: PaymentStatus.REFUNDED },
      });

      await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.CANCELLED },
      });

      for (const item of payment.order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    });

    res.status(200).json({ success: true, data: refund });
  } catch (error) {
    next(error);
  }
};

export const getPaymentByOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { orderId } = req.params;
    const payment = await prisma.payment.findUnique({ where: { orderId } });
    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

export const stripeWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const sig = req.headers['stripe-signature'] as string;
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    res.status(400).send(`Webhook Cryptographic Signature Verification Aborted: ${err.message}`);
    return;
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const intent = event.data.object as any;
        const orderId = intent.metadata.orderId;

        await prisma.$transaction([
          prisma.payment.updateMany({
            where: { stripePaymentIntentId: intent.id },
            data: { status: PaymentStatus.SUCCESS, stripeChargeId: intent.latest_charge },
          }),
          prisma.order.update({
            where: { id: orderId },
            data: { status: OrderStatus.PROCESSING },
          }),
        ]);
        break;
      }
      case 'payment_intent.payment_failed': {
        const intent = event.data.object as any;
        const orderId = intent.metadata.orderId;

        const orderDetails = await prisma.order.findUnique({
          where: { id: orderId },
          include: { items: true },
        });

        if (orderDetails) {
          await prisma.$transaction(async (tx) => {
            await tx.payment.updateMany({
              where: { stripePaymentIntentId: intent.id },
              data: { status: PaymentStatus.FAILED },
            });
            await tx.order.update({
              where: { id: orderId },
              data: { status: OrderStatus.CANCELLED },
            });
            // Re-inject catalog stock metrics back to the marketplace pools
            for (const item of orderDetails.items) {
              await tx.product.update({
                where: { id: item.productId },
                data: { stock: { increment: item.quantity } },
              });
            }
          });
        }
        break;
      }
    }
    res.json({ received: true });
  } catch (error) {
    next(error);
  }
};