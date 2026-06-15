import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { Prisma, OrderStatus } from '@prisma/client';
import * as emailService from '../services/email.service';

export const placeOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { addressId, couponCode, notes } = req.body;

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      res.status(400).json({ success: false, message: 'Checkout pipeline aborted. Active allocations map is void' });
      return;
    }

    // Verify system warehouse bounds prior to processing financial data
    for (const entry of cart.items) {
      if (entry.product.stock < entry.quantity || !entry.product.isActive) {
        res.status(400).json({ success: false, message: `Stock depletion exception: ${entry.product.name} cannot satisfy demand requirements.` });
        return;
      }
    }

    let subtotalNum = cart.items.reduce((sum, item) => {
      return sum + Number(item.product.price) * item.quantity;
    }, 0);

    let discountNum = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
      if (coupon && coupon.isActive && coupon.expiresAt > new Date() && coupon.usedCount < coupon.maxUses) {
        if (subtotalNum >= Number(coupon.minOrderAmount)) {
          if (coupon.discountType === 'PERCENTAGE') {
            discountNum = subtotalNum * (Number(coupon.discountValue) / 100);
          } else {
            discountNum = Number(coupon.discountValue);
          }
        }
      }
    }

    const baseTaxableAmount = subtotalNum - discountNum;
    const taxNum = baseTaxableAmount * 0.18; // 18% standard GST matrix calculation
    const shippingNum = subtotalNum > 500 ? 0 : 50; // Threshold limit calculation vector
    const totalNum = baseTaxableAmount + taxNum + shippingNum;

    // Isolate financial data mutation loops inside an atomic database isolation context
    const order = await prisma.$transaction(async (tx) => {
      // Decrement product volumes inside explicit line item locks
      for (const entry of cart.items) {
        await tx.product.update({
          where: { id: entry.productId },
          data: { stock: { decrement: entry.quantity } },
        });
      }

      const newOrder = await tx.order.create({
        data: {
          userId,
          subtotal: new Prisma.Decimal(subtotalNum),
          tax: new Prisma.Decimal(taxNum),
          shippingFee: new Prisma.Decimal(shippingNum),
          total: new Prisma.Decimal(totalNum),
          addressId,
          notes,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
              productName: item.product.name,
              productImage: item.product.images[0] || '',
            })),
          },
        },
        include: { items: true },
      });

      if (couponCode) {
        await tx.coupon.update({
          where: { code: couponCode },
          data: { usedCount: { increment: 1 } },
        });
      }

      // Clear customer's digital cart after successfully writing the order record
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return newOrder;
    });

    const userProfile = await prisma.user.findUnique({ where: { id: userId } });
    if (userProfile?.email) {
      emailService.sendOrderConfirmationEmail(userProfile.email, order.id, totalNum).catch(console.error);
    }

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

export const getUserOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { status, page = '1', limit = '10' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: Prisma.OrderWhereInput = { userId };
    if (status) where.status = status as OrderStatus;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      }),
      prisma.order.count({ where }),
    ]);

    res.status(200).json({ success: true, meta: { total }, data: orders });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true, address: true },
    });

    if (!order || (order.userId !== req.user!.id && req.user!.role !== 'ADMIN')) {
      res.status(404).json({ success: false, message: 'Order reference trace mismatch' });
      return;
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order || order.userId !== req.user!.id) {
      res.status(404).json({ success: false, message: 'Order reference trace context missing' });
      return;
    }

    if (order.status !== OrderStatus.PENDING) {
      res.status(400).json({ success: false, message: 'Cancellation rejected. Order status is irreversible' });
      return;
    }

    await prisma.$transaction(async (tx) => {
      // Re-inject allocated stock metrics back to operational warehouse matrices
      for (const entry of order.items) {
        await tx.product.update({
          where: { id: entry.productId },
          data: { stock: { increment: entry.quantity } },
        });
      }

      await tx.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.CANCELLED },
      });
    });

    res.status(200).json({ success: true, message: 'Order trace tracking altered to CANCELLED state' });
  } catch (error) {
    next(error);
  }
};