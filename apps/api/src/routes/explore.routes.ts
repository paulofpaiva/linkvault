import { Router, Response, NextFunction, Request } from 'express'
import { db } from '../db/index.js'
import { users, collections, links, collectionLinks } from '../db/schema.js'
import { and, count, eq, ilike, or, inArray } from 'drizzle-orm'
import { exploreSearchUsersSchema, explorePagedSchema } from '@linkvault/shared'

const router = Router()


// GET /explore/users - search users by name/email (paginated)
router.get('/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q, page, limit } = exploreSearchUsersSchema.parse(req.query)
    const offset = (page - 1) * limit

    const whereClause = q ? ilike(users.name, `%${q}%`) : undefined

    const [totalRow] = await db
      .select({ count: count() })
      .from(users)
      .where(whereClause as any)

    const total = totalRow?.count ?? 0
    const totalPages = Math.max(1, Math.ceil(total / limit))

    const baseUsers = await db.query.users.findMany({
      where: whereClause as any,
      limit,
      offset,
      columns: { id: true, name: true },
      orderBy: (u, { asc }) => [asc(u.name)],
    })

    const result = await Promise.all(baseUsers.map(async (u) => {
      const [collectionsCountRow] = await db
        .select({ count: count() })
        .from(collections)
        .where(and(eq(collections.userId, u.id), eq(collections.isPrivate, false)))

      const [linksCountRow] = await db
        .select({ count: count() })
        .from(links)
        .where(and(eq(links.userId, u.id), eq(links.isPrivate, false)))

      return {
        id: u.id,
        name: u.name,
        publicCollectionsCount: collectionsCountRow?.count ?? 0,
        publicLinksCount: linksCountRow?.count ?? 0,
      }
    }))

    res.success(
      { users: result, pagination: { page, limit, total, totalPages } },
      'Users retrieved successfully'
    )
  } catch (error) {
    next(error)
  }
})

// GET /explore/users/:userId - get basic user data
router.get('/users/:userId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params
  const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { id: true, name: true, createdAt: true },
    })
    if (!user) {
      res.error('User not found', 404)
      return
    }
    res.success(user, 'User retrieved successfully')
  } catch (error) {
    next(error)
  }
})

// GET /explore/users/:userId/collections - public collections (paginated)
router.get('/users/:userId/collections', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params
    const { page, limit } = explorePagedSchema.parse(req.query)
    const offset = (page - 1) * limit

    const whereCondition = and(eq(collections.userId, userId), eq(collections.isPrivate, false))

    const [totalRow] = await db
      .select({ count: count() })
      .from(collections)
      .where(whereCondition)

    const total = totalRow?.count ?? 0
    const totalPages = Math.max(1, Math.ceil(total / limit))

    const rows = await db.query.collections.findMany({
      where: whereCondition,
      limit,
      offset,
      with: { collectionLinks: true },
      orderBy: (c, { desc }) => [desc(c.createdAt)],
    })

    const result = await Promise.all(rows.map(async (c) => {
      const linkIds = c.collectionLinks.map((cl) => cl.linkId)
      if (linkIds.length === 0) {
        return {
          id: c.id,
          title: c.title,
          description: c.description,
          color: c.color,
          isPrivate: c.isPrivate,
          createdAt: c.createdAt,
          linkCount: 0,
        }
      }

      const [publicCountRow] = await db
        .select({ count: count() })
        .from(links)
        .where(and(inArray(links.id, linkIds), eq(links.isPrivate, false)))

      const publicCount = publicCountRow?.count ?? 0

      return {
        id: c.id,
        title: c.title,
        description: c.description,
        color: c.color,
        isPrivate: c.isPrivate,
        createdAt: c.createdAt,
        linkCount: publicCount,
      }
    }))

    res.success(
      { collections: result, pagination: { page, limit, total, totalPages } },
      'Public collections retrieved successfully'
    )
  } catch (error) {
    next(error)
  }
})

// GET /explore/users/:userId/links - public links (paginated)
router.get('/users/:userId/links', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params
    const { page, limit } = explorePagedSchema.parse(req.query)
    const offset = (page - 1) * limit

    const whereCondition = and(eq(links.userId, userId), eq(links.isPrivate, false))

    const [totalRow] = await db
      .select({ count: count() })
      .from(links)
      .where(whereCondition)

    const total = totalRow?.count ?? 0
    const totalPages = Math.max(1, Math.ceil(total / limit))

    const items = await db.query.links.findMany({
      where: whereCondition,
      limit,
      offset,
      orderBy: (l, { desc }) => [desc(l.createdAt)],
    })

    const result = items.map((l) => ({
      id: l.id,
      url: l.url,
      title: l.title,
      notes: l.notes,
      createdAt: l.createdAt,
    }))

    res.success(
      { links: result, pagination: { page, limit, total, totalPages } },
      'Public links retrieved successfully'
    )
  } catch (error) {
    next(error)
  }
})

// GET /explore/users/:userId/collections/:collectionId/links - public links of a user's public collection (paginated)
router.get('/users/:userId/collections/:collectionId/links', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, collectionId } = req.params
    const { page, limit } = explorePagedSchema.parse(req.query)
    const offset = (page - 1) * limit

    const collection = await db.query.collections.findFirst({ where: and(eq(collections.id, collectionId), eq(collections.userId, userId)) })
    if (!collection) {
      res.error('Collection not found', 404)
      return
    }
    if (collection.isPrivate) {
      res.error('Collection not found', 404)
      return
    }

    const linkIdRows = await db
      .select({ linkId: collectionLinks.linkId })
      .from(collectionLinks)
      .where(eq(collectionLinks.collectionId, collectionId))

    const linkIds = linkIdRows.map((r) => r.linkId)
    if (linkIds.length === 0) {
      res.success({ links: [], pagination: { page, limit, total: 0, totalPages: 1 } }, 'Collection links retrieved successfully')
      return
    }

    const [totalRow] = await db
      .select({ count: count() })
      .from(links)
      .where(and(inArray(links.id, linkIds), eq(links.isPrivate, false)))

    const total = totalRow?.count ?? 0
    const totalPages = Math.max(1, Math.ceil(total / limit))

    const items = await db.query.links.findMany({
      where: (l) => and(inArray(l.id, linkIds), eq(l.isPrivate, false)),
      limit,
      offset,
      orderBy: (l, { desc }) => [desc(l.createdAt)],
    })

    const result = items.map((l) => ({
      id: l.id,
      url: l.url,
      title: l.title,
      notes: l.notes,
      createdAt: l.createdAt,
    }))

    res.success(
      { links: result, pagination: { page, limit, total, totalPages } },
      'Collection links retrieved successfully'
    )
  } catch (error) {
    next(error)
  }
})

export default router