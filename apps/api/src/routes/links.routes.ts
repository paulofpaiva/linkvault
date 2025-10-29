import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { db } from '../db/index.js';
import { links, linkCategories, categories } from '../db/schema.js';
import { eq, and, count, inArray } from 'drizzle-orm';
import { AppError } from '../middleware/errorHandler.middleware.js';
import { AuthRequest, requireAuth } from '../middleware/auth.middleware.js';
import { createLinkSchema, updateLinkSchema, linkStatusSchema } from '@linkvault/shared';

const router: import('express').Router = Router();

router.use(requireAuth);

const statusQuerySchema = linkStatusSchema.optional();

// GET /links
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const statusFilter = req.query.status as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const offset = (page - 1) * limit;

    let parsedStatus: 'unread' | 'read' | 'archived' | undefined;
    if (statusFilter) {
      parsedStatus = statusQuerySchema.parse(statusFilter);
    }

    const whereCondition = parsedStatus
      ? and(eq(links.userId, userId), eq(links.status, parsedStatus))
      : eq(links.userId, userId);

    const [totalResult] = await db
      .select({ count: count() })
      .from(links)
      .where(whereCondition);

    const total = totalResult.count;
    const totalPages = Math.ceil(total / limit);

    const userLinks = await db.query.links.findMany({
      where: whereCondition,
      orderBy: (links, { desc }) => [desc(links.createdAt)],
      limit,
      offset,
      with: {
        linkCategories: {
          with: {
            category: true,
          },
        },
      },
    });

    const linksWithCategories = userLinks.map(link => ({
      ...link,
      categories: link.linkCategories.map(lc => lc.category),
    }));

    res.success(
      {
        links: linksWithCategories,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
      'Links retrieved successfully'
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.error('Invalid status. Use: unread, read or archived', 400);
      return;
    }
    next(error);
  }
});

// POST /links
router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const body = createLinkSchema.parse(req.body);

    if (body.categoryIds && body.categoryIds.length > 0) {
      const userCategories = await db.query.categories.findMany({
        where: and(
          eq(categories.userId, userId),
          inArray(categories.id, body.categoryIds)
        ),
      });

      if (userCategories.length !== body.categoryIds.length) {
        return res.error('One or more categories are invalid', 400);
      }
    }

    const [newLink] = await db
      .insert(links)
      .values({
        userId,
        url: body.url,
        title: body.title,
        notes: body.notes || null,
        status: 'unread',
      })
      .returning();

    if (body.categoryIds && body.categoryIds.length > 0) {
      await db.insert(linkCategories).values(
        body.categoryIds.map((categoryId: string) => ({
          linkId: newLink.id,
          categoryId,
        }))
      );
    }

    res.status(201).success(newLink, 'Link created successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.error(error.errors[0].message, 400);
      return;
    }
    next(error);
  }
});

// GET /links/:id
router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const linkId = req.params.id;

    const link = await db.query.links.findFirst({
      where: and(
        eq(links.id, linkId),
        eq(links.userId, userId)
      ),
    });

    if (!link) {
      throw new AppError(404, 'Link not found');
    }

    res.success(link, 'Link retrieved successfully');
  } catch (error) {
    next(error);
  }
});

// PATCH /links/:id - Update link details
router.patch('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const linkId = req.params.id;
    const body = updateLinkSchema.parse(req.body);

    const link = await db.query.links.findFirst({
      where: and(
        eq(links.id, linkId),
        eq(links.userId, userId)
      ),
    });

    if (!link) {
      throw new AppError(404, 'Link not found');
    }

    if (body.categoryIds !== undefined) {
      if (body.categoryIds.length > 0) {
        const userCategories = await db.query.categories.findMany({
          where: and(
            eq(categories.userId, userId),
            inArray(categories.id, body.categoryIds)
          ),
        });

        if (userCategories.length !== body.categoryIds.length) {
          return res.error('One or more categories are invalid', 400);
        }
      }

      await db.delete(linkCategories).where(eq(linkCategories.linkId, linkId));

      if (body.categoryIds.length > 0) {
        await db.insert(linkCategories).values(
          body.categoryIds.map((categoryId: string) => ({
            linkId,
            categoryId,
          }))
        );
      }
    }

    const updateData: any = {};
    if (body.url !== undefined) updateData.url = body.url;
    if (body.title !== undefined) updateData.title = body.title;
    if (body.notes !== undefined) updateData.notes = body.notes || null;

    if (Object.keys(updateData).length > 0) {
      updateData.updatedAt = new Date();
      
      const [updatedLink] = await db
        .update(links)
        .set(updateData)
        .where(eq(links.id, linkId))
        .returning();

      res.success(updatedLink, 'Link updated successfully');
    } else {
      res.success(link, 'No changes made');
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.error(error.errors[0].message, 400);
      return;
    }
    next(error);
  }
});

// PATCH /links/:id/read
router.patch('/:id/read', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const linkId = req.params.id;

    const link = await db.query.links.findFirst({
      where: and(
        eq(links.id, linkId),
        eq(links.userId, userId)
      ),
    });

    if (!link) {
      throw new AppError(404, 'Link not found');
    }

    const newStatus = link.status === 'read' ? 'unread' : 'read';

    const [updatedLink] = await db
      .update(links)
      .set({ status: newStatus, updatedAt: new Date() })
      .where(eq(links.id, linkId))
      .returning();

    const message = newStatus === 'read' ? 'Link marked as read' : 'Link marked as unread';
    res.success(updatedLink, message);
  } catch (error) {
    next(error);
  }
});

// PATCH /links/:id/archive
router.patch('/:id/archive', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const linkId = req.params.id;

    const link = await db.query.links.findFirst({
      where: and(
        eq(links.id, linkId),
        eq(links.userId, userId)
      ),
    });

    if (!link) {
      throw new AppError(404, 'Link not found');
    }

    const newStatus = link.status === 'archived' ? 'unread' : 'archived';
    const message = newStatus === 'archived' ? 'Link archived' : 'Link unarchived';

    const [updatedLink] = await db
      .update(links)
      .set({ status: newStatus, updatedAt: new Date() })
      .where(eq(links.id, linkId))
      .returning();

    res.success(updatedLink, message);
  } catch (error) {
    next(error);
  }
});

// DELETE /links/:id
router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const linkId = req.params.id;

    const link = await db.query.links.findFirst({
      where: and(
        eq(links.id, linkId),
        eq(links.userId, userId)
      ),
    });

    if (!link) {
      throw new AppError(404, 'Link not found');
    }

    await db.delete(links).where(eq(links.id, linkId));

    res.success(null, 'Link deleted successfully');
  } catch (error) {
    next(error);
  }
});

export default router;

