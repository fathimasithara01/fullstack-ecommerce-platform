import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';

export const getAllCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      include: { subCategories: true },
    });
    // Filter out root layers to expose explicit relational branching tree architectures
    const rootTree = categories.filter((c) => !c.parentId);
    res.status(200).json({ success: true, data: rootTree });
  } catch (error) {
    next(error);
  }
};

export const getCategoryBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { slug } = req.params;
    const category = await prisma.category.findUnique({
      where: { slug },
      include: { products: { where: { isActive: true } } },
    });
    if (!category) {
      res.status(404).json({ success: false, message: 'Category reference not found' });
      return;
    }
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, parentId, image } = req.body;
    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;
    const category = await prisma.category.create({
      data: { name, slug, parentId, image },
    });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, parentId, image } = req.body;
    const data: any = { name, parentId, image };
    if (name) data.slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;

    const category = await prisma.category.update({ where: { id }, data });
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.category.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Category collection mapping detached and purged' });
  } catch (error) {
    next(error);
  }
};