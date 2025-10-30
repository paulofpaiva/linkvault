import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { db } from '../db/index.js';
import { links, linkCategories, categories, collectionLinks, collections } from '../db/schema.js';
import { eq, and, count, inArray, or, ilike, notInArray } from 'drizzle-orm';
import { AppError } from '../middleware/errorHandler.middleware.js';
import { AuthRequest, requireAuth } from '../middleware/auth.middleware.js';
import { createLinkSchema, updateLinkSchema, linkStatusSchema } from '@linkvault/shared';

const router = Router();

router.use(requireAuth);

const statusQuerySchema = linkStatusSchema.optional();

// GET /links
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const statusFilter = req.query.status as string | undefined;
    const favoriteQuery = req.query.favorite as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const offset = (page - 1) * limit;
    const search = (req.query.search as string | undefined)?.trim();
    const excludeCollectionId = req.query.excludeCollectionId as string | undefined;

    let parsedStatus: 'unread' | 'read' | 'archived' | undefined;
    if (statusFilter) {
      parsedStatus = statusQuerySchema.parse(statusFilter);
    }

    const favorite = favoriteQuery === 'true' ? true : favoriteQuery === 'false' ? false : undefined;

    let whereCondition: any = eq(links.userId, userId);
    if (parsedStatus) {
      whereCondition = and(whereCondition, eq(links.status, parsedStatus));
    }
    if (favorite !== undefined) {
      whereCondition = and(whereCondition, eq(links.isFavorite, favorite));
    }
    if (search && search.length > 0) {
      const pattern = `%${search}%`;
      whereCondition = and(
        whereCondition,
        or(
          ilike(links.title, pattern),
          ilike(links.url, pattern),
          ilike(links.notes, pattern)
        )
      );
    }

    if (excludeCollectionId) {
      const existing = await db
        .select({ linkId: collectionLinks.linkId })
        .from(collectionLinks)
        .where(eq(collectionLinks.collectionId, excludeCollectionId));
      const excludeIds = existing.map((r) => r.linkId);
      if (excludeIds.length > 0) {
        whereCondition = and(whereCondition, notInArray(links.id, excludeIds));
      }
    }

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

// GET /links/public - list user's public links with pagination
router.get('/public', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const search = (req.query.search as string | undefined)?.trim();
    const excludeCollectionId = req.query.excludeCollectionId as string | undefined;

    let whereCondition: any = and(eq(links.userId, userId), eq(links.isPrivate, false));
    if (search && search.length > 0) {
      const pattern = `%${search}%`;
      whereCondition = and(
        whereCondition,
        or(
          ilike(links.title, pattern),
          ilike(links.url, pattern),
          ilike(links.notes, pattern)
        )
      );
    }

    if (excludeCollectionId) {
      const existing = await db
        .select({ linkId: collectionLinks.linkId })
        .from(collectionLinks)
        .where(eq(collectionLinks.collectionId, excludeCollectionId));
      const excludeIds = existing.map((r) => r.linkId);
      if (excludeIds.length > 0) {
        whereCondition = and(whereCondition, notInArray(links.id, excludeIds));
      }
    }

    const [totalResult] = await db
      .select({ count: count() })
      .from(links)
      .where(whereCondition);

    const total = totalResult.count;
    const totalPages = Math.ceil(total / limit);

    const publicLinks = await db.query.links.findMany({
      where: whereCondition,
      orderBy: (l, { desc }) => [desc(l.createdAt)],
      limit,
      offset,
      with: {
        linkCategories: {
          with: { category: true },
        },
      },
    });

    const linksWithCategories = publicLinks.map((link) => ({
      ...link,
      categories: link.linkCategories.map((lc) => lc.category),
    }));

    res.success(
      { links: linksWithCategories, pagination: { page, limit, total, totalPages } },
      'Public links retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
});

// GET /links/private - list user's private links with pagination
router.get('/private', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const search = (req.query.search as string | undefined)?.trim();
    const excludeCollectionId = req.query.excludeCollectionId as string | undefined;

    let whereCondition: any = and(eq(links.userId, userId), eq(links.isPrivate, true));
    if (search && search.length > 0) {
      const pattern = `%${search}%`;
      whereCondition = and(
        whereCondition,
        or(
          ilike(links.title, pattern),
          ilike(links.url, pattern),
          ilike(links.notes, pattern)
        )
      );
    }

    if (excludeCollectionId) {
      const existing = await db
        .select({ linkId: collectionLinks.linkId })
        .from(collectionLinks)
        .where(eq(collectionLinks.collectionId, excludeCollectionId));
      const excludeIds = existing.map((r) => r.linkId);
      if (excludeIds.length > 0) {
        whereCondition = and(whereCondition, notInArray(links.id, excludeIds));
      }
    }

    const [totalResult] = await db
      .select({ count: count() })
      .from(links)
      .where(whereCondition);

    const total = totalResult.count;
    const totalPages = Math.ceil(total / limit);

    const privateLinks = await db.query.links.findMany({
      where: whereCondition,
      orderBy: (l, { desc }) => [desc(l.createdAt)],
      limit,
      offset,
      with: {
        linkCategories: {
          with: { category: true },
        },
      },
    });

    const linksWithCategories = privateLinks.map((link) => ({
      ...link,
      categories: link.linkCategories.map((lc) => lc.category),
    }));

    res.success(
      { links: linksWithCategories, pagination: { page, limit, total, totalPages } },
      'Private links retrieved successfully'
    );
  } catch (error) {
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
        isPrivate: body.isPrivate || false,
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
    if (body.isPrivate !== undefined) updateData.isPrivate = body.isPrivate;

    if (Object.keys(updateData).length > 0) {
      updateData.updatedAt = new Date();

      const [updatedLink] = await db
        .update(links)
        .set(updateData)
        .where(eq(links.id, linkId))
        .returning();

      if (body.isPrivate === true) {
        await db
          .delete(collectionLinks)
          .where(
            and(
              eq(collectionLinks.linkId, linkId),
              inArray(
                collectionLinks.collectionId,
                db
                  .select({ id: collections.id })
                  .from(collections)
                  .where(and(eq(collections.userId, userId), eq(collections.isPrivate, false)))
              )
            )
          );
      }

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

// PATCH /links/:id/favorite
router.patch('/:id/favorite', async (req: AuthRequest, res: Response, next: NextFunction) => {
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

    const newValue = !link.isFavorite;

    const [updatedLink] = await db
      .update(links)
      .set({ isFavorite: newValue, updatedAt: new Date() })
      .where(eq(links.id, linkId))
      .returning();

    const message = newValue ? 'Link marked as favorite' : 'Link unmarked as favorite';
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

    await db.delete(linkCategories).where(eq(linkCategories.linkId, linkId));
    await db.delete(collectionLinks).where(eq(collectionLinks.linkId, linkId));
    await db.delete(links).where(eq(links.id, linkId));

    res.success(null, 'Link deleted successfully');
  } catch (error) {
    next(error);
  }
});

export default router;