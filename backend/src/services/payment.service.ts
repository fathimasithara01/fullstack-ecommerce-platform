import { stripe } from '../config/stripe';
import { prisma } from '../config/db';

export const calculateOrderAmount = async (orderId: string): Promise<number> => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new Error('Target transaction ledger framework missing');
  }

  // Stripe handles INR transactions natively in the smallest currency unit (paise). 
  // Multiplier mapping logic: ₹1.00 INR = 100 Paise.
  return Math.round(Number(order.total) * 100);
};

export const createStripePaymentIntent = async (orderId: string, amountPaise: number, customerEmail: string) => {
  return await stripe.paymentIntents.create({
    amount: amountPaise,
    currency: 'inr',
    metadata: { orderId },
    receipt_email: customerEmail,
    automatic_payment_methods: {
      enabled: true,
    },
  });
};

export const executeStripeRefund = async (chargeId: string, amountPaise?: number) => {
  return await stripe.refunds.create({
    charge: chargeId,
    amount: amountPaise,
  });
};