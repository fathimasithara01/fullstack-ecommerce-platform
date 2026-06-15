import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';

export const getProductReviews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { productId } = req.params;
    const { page = '1', limit = '5' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { productId },
        skip,
        take: parseInt(limit as string),
        include: { user: { select: { name: true, avatar: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.review.count({ where: { productId } }),
    ]);

    res.status(200).json({ success: true, meta: { total }, data: reviews });
  } catch (error) {
    next(error);
  }
};

export const createReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.user!.id;

    // Verify user purchased the item before accepting the review entry
    const verifiedPurchase = await prisma.order.findFirst({
      where: {
        userId,
        status: 'DELIVERED',
        items: { some: { productId } },
      },
    });

    if (!verifiedPurchase) {
      res.status(403).json({ success: false, message: 'Review rejected. Verified tracking delivery footprint required.' });
      return;
    }

    const review = await prisma.review.create({
      data: { userId, productId, rating: parseInt(rating), comment },
    });

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

export const updateReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review || review.userId !== req.user!.id) {
      res.status(403).json({ success: false, message: 'Mutation rejected. Ownership matrix fault.' });
      return;
    }

    const updated = await prisma.review.update({
      where: { id },
      data: { rating: parseInt(rating), comment },
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const review = await prisma.review.findUnique({ where: { id } });

    if (!review) {
      res.status(404).json({ success: false, message: 'Review data context missing' });
      return;
    }

    if (review.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Purge instruction dropped due to privilege constraints' });
      return;
    }

    await prisma.review.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Review purged' });
  } catch (error) {
    next(error);
  }
};