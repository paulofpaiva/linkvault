import { Router, Response, NextFunction } from 'express';
import { db } from '../db/index.js';
import { collections, collectionLinks, links, users } from '../db/schema.js';
import { and, count, eq, inArray } from 'drizzle-orm';
import { AppError } from '../middleware/errorHandler.middleware.js';
import { AuthRequest, requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

// GET /public/collections/:id - public view of a collection with pagination
router.get('/:id', async (req: any, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const collection = await db.query.collections.findFirst({ where: eq(collections.id, id) });
    if (!collection) {
      throw new AppError(404, 'Collection not found');
    }
    if (collection.isPrivate) {
      // For private collections, return minimal payload indicating privacy
      return res.success(
        {
          collection: {
            id: collection.id,
            isPrivate: true,
          },
        },
        'Collection is private'
      );
    }

    const owner = await db.query.users.findFirst({
      columns: { id: false, name: true },
      where: eq(users.id, collection.userId),
    });

    const [totalResult] = await db
      .select({ count: count() })
      .from(collectionLinks)
      .where(eq(collectionLinks.collectionId, id));
    const total = totalResult.count;
    const totalPages = Math.ceil(total / limit);

    const items = await db.query.collectionLinks.findMany({
      where: eq(collectionLinks.collectionId, id),
      with: { link: true },
      orderBy: (cl, { desc }) => [desc(cl.createdAt)],
      limit,
      offset,
    });

    // For public view, include only public links
    const linksList = items.map((i) => i.link).filter((l) => !l.isPrivate);

    const linkCount = total;

    res.success(
      {
        collection: {
          id: collection.id,
          title: collection.title,
          description: collection.description,
          color: collection.color,
          createdAt: collection.createdAt,
          linkCount,
          isPrivate: false,
        },
        owner: { name: owner?.name ?? 'Unknown' },
        links: linksList,
        pagination: { page, limit, total, totalPages },
      },
      'Public collection retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
});

export default router;

// POST /public/collections/:id/clone - clone a public collection into current user's space
router.post('/:id/clone', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const id = req.params.id;

    const sourceCollection = await db.query.collections.findFirst({ where: eq(collections.id, id) });
    if (!sourceCollection) {
      throw new AppError(404, 'Collection not found');
    }
    if (sourceCollection.isPrivate) {
      return res.error('Private collections cannot be cloned', 400);
    }

    // Fetch only public links from the source collection
    const relations = await db.query.collectionLinks.findMany({
      where: eq(collectionLinks.collectionId, id),
      with: { link: true },
    });
    const publicLinks = relations.map(r => r.link).filter(l => !l.isPrivate);

    // Build unique title for the target user, similar to internal clone
    const baseTitle = sourceCollection.title;
    let newTitle = `${baseTitle} (Cloned)`;
    const existingTitles = await db.query.collections.findMany({
      where: eq(collections.userId, userId),
      columns: { title: true },
    });
    const titleSet = new Set(existingTitles.map(t => t.title));
    if (titleSet.has(newTitle)) {
      let i = 2;
      while (titleSet.has(`${baseTitle} (Cloned ${i})`)) i += 1;
      newTitle = `${baseTitle} (Cloned ${i})`;
    }

    const created = await db.transaction(async (tx) => {
      const [newCollection] = await tx
        .insert(collections)
        .values({
          userId,
          title: newTitle,
          description: sourceCollection.description,
          color: sourceCollection.color,
          isPrivate: sourceCollection.isPrivate,
        })
        .returning();

      if (publicLinks.length > 0) {
        // Duplicate links for current user
        const duplicatedLinks = await tx
          .insert(links)
          .values(
            publicLinks.map((l) => ({
              userId,
              url: l.url,
              title: l.title,
              notes: l.notes ?? null,
              status: l.status,
              isPrivate: false,
            }))
          )
          .returning({ id: links.id });

        const values = duplicatedLinks.map((dl) => ({
          collectionId: newCollection.id,
          linkId: dl.id,
        }));
        await tx.insert(collectionLinks).values(values);
      }

      return newCollection;
    });

    // Artificial delay to enhance UI skeleton visibility
    await new Promise((resolve) => setTimeout(resolve, 500));

    res.status(201).success(
      { ...created, linkCount: publicLinks.length },
      'Collection cloned successfully'
    );
  } catch (error) {
    next(error);
  }
});


