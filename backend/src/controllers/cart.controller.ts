import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';

export const getCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: { items: { include: { product: true } } },
      });
    }

    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { productId, quantity } = req.body;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.isActive) {
      res.status(404).json({ success: false, message: 'Target inventory item could not be found' });
      return;
    }

    if (product.stock < quantity) {
      res.status(400).json({ success: false, message: 'Requested allocation quantity exceeds physical warehouse stock availability' });
      return;
    }

    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });

    if (existingItem) {
      const newQty = existingItem.quantity + quantity;
      if (product.stock < newQty) {
        res.status(400).json({ success: false, message: 'Combined line item totals exceed maximum allocations' });
        return;
      }
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQty },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity },
      });
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    res.status(200).json({ success: true, data: updatedCart });
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { product: true, cart: true },
    });

    if (!cartItem || cartItem.cart.userId !== userId) {
      res.status(404).json({ success: false, message: 'Cart allocation record context missing' });
      return;
    }

    if (cartItem.product.stock < quantity) {
      res.status(400).json({ success: false, message: 'Stock variance ceiling exceeded' });
      return;
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    const updatedCart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    res.status(200).json({ success: true, data: updatedCart });
  } catch (error) {
    next(error);
  }
};

export const removeCartItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { itemId } = req.params;

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });

    if (!cartItem || cartItem.cart.userId !== userId) {
      res.status(404).json({ success: false, message: 'Line item matrix context mismatch' });
      return;
    }

    await prisma.cartItem.delete({ where: { id: itemId } });

    const updatedCart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    res.status(200).json({ success: true, data: updatedCart });
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const cart = await prisma.cart.findUnique({ where: { userId } });
    
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    res.status(200).json({ success: true, message: 'Cart storage allocation wiped successfully.' });
  } catch (error) {
    next(error);
  }
};

export const syncCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { items } = req.body; // Expects array element: { productId: string, quantity: number }

    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    for (const entry of items) {
      const prod = await prisma.product.findUnique({ where: { id: entry.productId } });
      if (!prod || !prod.isActive || prod.stock <= 0) continue;

      const boundedQty = Math.min(entry.quantity, prod.stock);

      await prisma.cartItem.upsert({
        where: { cartId_productId: { cartId: cart.id, productId: entry.productId } },
        update: { quantity: { increment: boundedQty } },
        create: { cartId: cart.id, productId: entry.productId, quantity: boundedQty },
      });
    }

    const aggregatedCart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    res.status(200).json({ success: true, data: aggregatedCart });
  } catch (error) {
    next(error);
  }
};