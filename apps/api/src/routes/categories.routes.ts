import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { db } from '../db/index.js';
import { categories, linkCategories } from '../db/schema.js';
import { eq, and, count } from 'drizzle-orm';
import { AppError } from '../middleware/errorHandler.middleware.js';
import { AuthRequest, requireAuth } from '../middleware/auth.middleware.js';
import { createCategorySchema, updateCategorySchema } from '@linkvault/shared';

const router = Router();

router.use(requireAuth);

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const whereCondition = eq(categories.userId, userId);

    const [totalResult] = await db
      .select({ count: count() })
      .from(categories)
      .where(whereCondition);

    const total = totalResult.count;
    const totalPages = Math.ceil(total / limit);

    const userCategories = await db.query.categories.findMany({
      where: whereCondition,
      orderBy: (categories, { desc }) => [desc(categories.createdAt)],
      limit,
      offset,
    });

    res.success(
      {
        categories: userCategories,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
      'Categories retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
});

// POST /categories - Criar nova categoria
router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const body = createCategorySchema.parse(req.body);

    const existingCategory = await db.query.categories.findFirst({
      where: and(
        eq(categories.userId, userId),
        eq(categories.name, body.name)
      ),
    });

    if (existingCategory) {
      return res.error('A category with this name already exists', 400);
    }

    const [newCategory] = await db
      .insert(categories)
      .values({
        userId,
        name: body.name,
        color: body.color,
      })
      .returning();

    res.status(201).success(newCategory, 'Category created successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.error(error.errors[0].message, 400);
      return;
    }
    next(error);
  }
});

// GET /categories/:id - Obter uma categoria específica
router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const categoryId = req.params.id;

    const category = await db.query.categories.findFirst({
      where: and(
        eq(categories.id, categoryId),
        eq(categories.userId, userId)
      ),
    });

    if (!category) {
      return res.error('Category not found', 404);
    }

    res.success(category, 'Category retrieved successfully');
  } catch (error) {
    next(error);
  }
});

// PATCH /categories/:id - Atualizar categoria
router.patch('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const categoryId = req.params.id;
    const body = updateCategorySchema.parse(req.body);

    const category = await db.query.categories.findFirst({
      where: and(
        eq(categories.id, categoryId),
        eq(categories.userId, userId)
      ),
    });

    if (!category) {
      return res.error('Category not found', 404);
    }

    if (body.name) {
      const existingCategory = await db.query.categories.findFirst({
        where: and(
          eq(categories.userId, userId),
          eq(categories.name, body.name)
        ),
      });

      if (existingCategory && existingCategory.id !== categoryId) {
        return res.error('A category with this name already exists', 400);
      }
    }

    const [updatedCategory] = await db
      .update(categories)
      .set({
        ...(body.name && { name: body.name }),
        ...(body.color && { color: body.color }),
      })
      .where(eq(categories.id, categoryId))
      .returning();

    res.success(updatedCategory, 'Category updated successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.error(error.errors[0].message, 400);
      return;
    }
    next(error);
  }
});

// DELETE /categories/:id - Deletar categoria
router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const categoryId = req.params.id;

    const category = await db.query.categories.findFirst({
      where: and(
        eq(categories.id, categoryId),
        eq(categories.userId, userId)
      ),
    });

    if (!category) {
      return res.error('Category not found', 404);
    }

    await db
      .delete(linkCategories)
      .where(eq(linkCategories.categoryId, categoryId));

    await db
      .delete(categories)
      .where(eq(categories.id, categoryId));

    res.success(null, 'Category deleted successfully');
  } catch (error) {
    next(error);
  }
});

export default router;

