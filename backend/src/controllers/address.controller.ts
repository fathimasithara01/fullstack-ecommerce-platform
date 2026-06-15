import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';

export const getUserAddresses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user!.id },
      orderBy: { isDefault: 'desc' },
    });
    res.status(200).json({ success: true, data: addresses });
  } catch (error) {
    next(error);
  }
};

export const addAddress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { fullName, phone, street, city, state, country, pincode, isDefault } = req.body;

    if (isDefault) {
      await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
    }

    const address = await prisma.address.create({
      data: { userId, fullName, phone, street, city, state, country, pincode, isDefault: !!isDefault },
    });

    res.status(201).json({ success: true, data: address });
  } catch (error) {
    next(error);
  }
};

export const updateAddress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { isDefault } = req.body;

    const exists = await prisma.address.findUnique({ where: { id } });
    if (!exists || exists.userId !== userId) {
      res.status(404).json({ success: false, message: 'Address vector link mismatch' });
      return;
    }

    if (isDefault) {
      await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
    }

    const updated = await prisma.address.update({
      where: { id },
      data: { ...req.body },
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const address = await prisma.address.findUnique({ where: { id } });

    if (!address || address.userId !== req.user!.id) {
      res.status(404).json({ success: false, message: 'Address configuration missing' });
      return;
    }

    await prisma.address.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Address routing entry unmapped.' });
  } catch (error) {
    next(error);
  }
};