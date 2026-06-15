import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { Prisma } from '@prisma/client';

const generateSlug = (name: string): string => {
  return `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;
};

export const getProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, category, minPrice, maxPrice, tags, inStock, sortBy, page = '1', limit = '12' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.ProductWhereInput = { isActive: true };

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = { slug: category as string };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = new Prisma.Decimal(minPrice as string);
      if (maxPrice) where.price.lte = new Prisma.Decimal(maxPrice as string);
    }

    if (tags) {
      const tagList = (tags as string).split(',');
      where.tags = { hasSome: tagList };
    }

    if (inStock === 'true') {
      where.stock = { gt: 0 };
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    if (sortBy === 'price_asc') orderBy = { price: 'asc' };
    if (sortBy === 'price_desc') orderBy = { price: 'desc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, skip, take: limitNum, orderBy, include: { category: true } }),
      prisma.product.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      meta: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { slug } = req.params;
    const product = await prisma.product.findUnique({
      where: { slug },
      include: { category: true, reviews: { include: { user: { select: { name: true, avatar: true } } } } },
    });

    if (!product || !product.isActive) {
      res.status(404).json({ success: false, message: 'Product record variant not found' });
      return;
    }

    const related = await prisma.product.findMany({
      where: { categoryId: product.categoryId, NOT: { id: product.id }, isActive: true },
      take: 4,
    });

    res.status(200).json({ success: true, data: { product, related } });
  } catch (error) {
    next(error);
  }
};

export const getFeaturedProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const featured = await prisma.product.findMany({
      where: { isActive: true },
      take: 6,
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json({ success: true, data: featured });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, description, price, comparePrice, stock, categoryId, tags } = req.body;
    const images = req.body.images || [];

    const slug = generateSlug(name);
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: new Prisma.Decimal(price),
        comparePrice: comparePrice ? new Prisma.Decimal(comparePrice) : null,
        stock: parseInt(stock, 10),
        categoryId,
        tags: Array.isArray(tags) ? tags : tags ? tags.split(',') : [],
        images,
      },
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData: any = { ...req.body };

    if (updateData.price) updateData.price = new Prisma.Decimal(updateData.price);
    if (updateData.comparePrice) updateData.comparePrice = new Prisma.Decimal(updateData.comparePrice);
    if (updateData.stock) updateData.stock = parseInt(updateData.stock, 10);
    if (updateData.name && !updateData.slug) updateData.slug = generateSlug(updateData.name);

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.product.update({ where: { id }, data: { isActive: false } });
    res.status(200).json({ success: true, message: 'Product execution frame soft-deleted' });
  } catch (error) {
    next(error);
  }
};

export const bulkUpdateStock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { updates } = req.body; // Expects array element: { id: string, quantity: number }
    
    await prisma.$transaction(
      updates.map((u: { id: string; quantity: number }) =>
        prisma.product.update({
          where: { id: u.id },
          data: { stock: { decrement: u.quantity } },
        })
      )
    );

    res.status(200).json({ success: true, message: 'Stock matrix synchronization complete' });
  } catch (error) {
    next(error);
  }
};