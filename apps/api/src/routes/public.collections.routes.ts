import { Router, Response, NextFunction } from 'express';
import { db } from '../db/index.js';
import { collections, collectionLinks, links, users } from '../db/schema.js';
import { and, count, eq } from 'drizzle-orm';
import { AppError } from '../middleware/errorHandler.middleware.js';

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


