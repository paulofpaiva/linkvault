import { Router, Response, NextFunction, Request } from 'express';
import { z } from 'zod';
import { db } from '../db/index.js';
import { collections, collectionLinks, links } from '../db/schema.js';
import { and, count, eq, inArray } from 'drizzle-orm';
import { AppError } from '../middleware/errorHandler.middleware.js';
import { AuthRequest, requireAuth } from '../middleware/auth.middleware.js';
import { createCollectionSchema, updateCollectionSchema, addLinksToCollectionSchema } from '@linkvault/shared';

const router = Router();

router.use(requireAuth);

// GET /collections - list user's collections
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const whereCondition = eq(collections.userId, userId);

    const [totalResult] = await db
      .select({ count: count() })
      .from(collections)
      .where(whereCondition);

    const total = totalResult.count;
    const totalPages = Math.ceil(total / limit);

    const userCollections = await db.query.collections.findMany({
      where: whereCondition,
      orderBy: (c, { desc }) => [desc(c.createdAt)],
      limit,
      offset,
      with: {
        collectionLinks: true,
      },
    });

    const result = userCollections.map((c) => ({
      ...c,
      linkCount: c.collectionLinks.length,
    }));

    res.success(
      {
        collections: result,
        pagination: { page, limit, total, totalPages },
      },
      'Collections retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
});

// POST /collections - create a collection
router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const body = createCollectionSchema.parse(req.body);

    const [created] = await db
      .insert(collections)
      .values({
        userId,
        title: body.title,
        description: body.description ?? null,
        color: body.color,
        isPrivate: body.isPrivate ?? false,
      })
      .returning();

    res.status(201).success(created, 'Collection created successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.error(error.errors[0].message, 400);
      return;
    }
    next(error);
  }
});

// GET /collections/:id - get collection (owner or public)
router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const id = req.params.id;

    const collection = await db.query.collections.findFirst({
      where: eq(collections.id, id),
    });

    if (!collection) {
      throw new AppError(404, 'Collection not found');
    }

    const isOwner = collection.userId === userId;
    if (!isOwner && collection.isPrivate) {
      throw new AppError(404, 'Collection not found');
    }

    res.success(collection, 'Collection retrieved successfully');
  } catch (error) {
    next(error);
  }
});

// PATCH /collections/:id - update collection
router.patch('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const id = req.params.id;
    const body = updateCollectionSchema.parse(req.body);

    const existing = await db.query.collections.findFirst({
      where: and(eq(collections.id, id), eq(collections.userId, userId)),
    });

    if (!existing) {
      throw new AppError(404, 'Collection not found');
    }

    const updateData: Partial<typeof collections.$inferInsert> = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description ?? null;
    if (body.color !== undefined) updateData.color = body.color;
    if (body.isPrivate !== undefined) updateData.isPrivate = body.isPrivate;

    let updated = existing;
    if (Object.keys(updateData).length > 0) {
      updateData.updatedAt = new Date();
      [updated] = await db
        .update(collections)
        .set(updateData)
        .where(eq(collections.id, id))
        .returning();
    }

    res.success(updated, 'Collection updated successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.error(error.errors[0].message, 400);
      return;
    }
    next(error);
  }
});

// DELETE /collections/:id - delete collection
router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const id = req.params.id;

    const collection = await db.query.collections.findFirst({
      where: and(eq(collections.id, id), eq(collections.userId, userId)),
    });

    if (!collection) {
      throw new AppError(404, 'Collection not found');
    }

    await db.delete(collectionLinks).where(eq(collectionLinks.collectionId, id));
    await db.delete(collections).where(eq(collections.id, id));

    res.success(null, 'Collection deleted successfully');
  } catch (error) {
    next(error);
  }
});

// POST /collections/:id/links - add links to collection
router.post('/:id/links', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const id = req.params.id;
    const body = addLinksToCollectionSchema.parse(req.body);

    const collection = await db.query.collections.findFirst({
      where: and(eq(collections.id, id), eq(collections.userId, userId)),
    });

    if (!collection) {
      throw new AppError(404, 'Collection not found');
    }

    // Ensure all links belong to user and are public
    const userLinks = await db.query.links.findMany({
      where: and(eq(links.userId, userId), inArray(links.id, body.linkIds)),
    });

    if (userLinks.length !== body.linkIds.length) {
      return res.error('One or more links are invalid', 400);
    }

    const nonPublic = userLinks.filter((l) => l.isPrivate);
    if (nonPublic.length > 0) {
      return res.error('Only public links can be added to collections', 400);
    }

    // Insert missing relations, ignoring duplicates by unique composite key constraint
    const values = body.linkIds.map((linkId: string) => ({ collectionId: id, linkId }));
    await db.insert(collectionLinks).values(values).onConflictDoNothing({
      target: [collectionLinks.collectionId, collectionLinks.linkId],
    });

    res.status(201).success(null, 'Links added to collection');
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.error(error.errors[0].message, 400);
      return;
    }
    next(error);
  }
});

// GET /collections/:id/links - list links in collection (owner or public)
router.get('/:id/links', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const id = req.params.id;

    const collection = await db.query.collections.findFirst({ where: eq(collections.id, id) });
    if (!collection) {
      throw new AppError(404, 'Collection not found');
    }
    const isOwner = collection.userId === userId;
    if (!isOwner && collection.isPrivate) {
      throw new AppError(404, 'Collection not found');
    }

    const items = await db.query.collectionLinks.findMany({
      where: eq(collectionLinks.collectionId, id),
      with: { link: true },
      orderBy: (cl, { desc }) => [desc(cl.createdAt)],
    });

    // Only public links will be present by construction, but we keep this guard
    const linksList = items.map((i) => i.link).filter((l) => !l.isPrivate);

    res.success({ links: linksList }, 'Collection links retrieved successfully');
  } catch (error) {
    next(error);
  }
});

// DELETE /collections/:id/links/:linkId - remove a link from collection
router.delete('/:id/links/:linkId', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const id = req.params.id;
    const linkId = req.params.linkId;

    const collection = await db.query.collections.findFirst({
      where: and(eq(collections.id, id), eq(collections.userId, userId)),
    });

    if (!collection) {
      throw new AppError(404, 'Collection not found');
    }

    await db
      .delete(collectionLinks)
      .where(and(eq(collectionLinks.collectionId, id), eq(collectionLinks.linkId, linkId)));

    res.success(null, 'Link removed from collection');
  } catch (error) {
    next(error);
  }
});

export default router;


