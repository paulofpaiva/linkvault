import { pgTable, uuid, text, timestamp, pgEnum, boolean, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const linkStatusEnum = pgEnum('link_status', ['unread', 'read', 'archived']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
});

export const links = pgTable('links', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  title: text('title').notNull(),
  notes: text('notes'),
  status: linkStatusEnum('status').notNull().default('unread'),
  isFavorite: boolean('is_favorite').notNull().default(false),
  isPrivate: boolean('is_private').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
});

export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  color: text('color').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
});

export const linkCategories = pgTable('link_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  linkId: uuid('link_id').notNull().references(() => links.id, { onDelete: 'cascade' }),
  categoryId: uuid('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const collections = pgTable('collections', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  color: text('color').notNull(),
  isPrivate: boolean('is_private').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
});

export const collectionLinks = pgTable(
  'collection_links',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    collectionId: uuid('collection_id').notNull().references(() => collections.id, { onDelete: 'cascade' }),
    linkId: uuid('link_id').notNull().references(() => links.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => ({
    collectionLinkUnique: uniqueIndex('collection_links_collectionId_linkId_unique').on(
      t.collectionId,
      t.linkId
    ),
  })
);

export const usersRelations = relations(users, ({ many }) => ({
  links: many(links),
  refreshTokens: many(refreshTokens),
  categories: many(categories),
  collections: many(collections),
}));

export const linksRelations = relations(links, ({ one, many }) => ({
  user: one(users, {
    fields: [links.userId],
    references: [users.id],
  }),
  linkCategories: many(linkCategories),
  collectionLinks: many(collectionLinks),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, {
    fields: [categories.userId],
    references: [users.id],
  }),
  linkCategories: many(linkCategories),
}));

export const linkCategoriesRelations = relations(linkCategories, ({ one }) => ({
  link: one(links, {
    fields: [linkCategories.linkId],
    references: [links.id],
  }),
  category: one(categories, {
    fields: [linkCategories.categoryId],
    references: [categories.id],
  }),
}));

export const collectionsRelations = relations(collections, ({ one, many }) => ({
  user: one(users, {
    fields: [collections.userId],
    references: [users.id],
  }),
  collectionLinks: many(collectionLinks),
}));

export const collectionLinksRelations = relations(collectionLinks, ({ one }) => ({
  link: one(links, {
    fields: [collectionLinks.linkId],
    references: [links.id],
  }),
  collection: one(collections, {
    fields: [collectionLinks.collectionId],
    references: [collections.id],
  }),
}));

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, {
    fields: [refreshTokens.userId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Link = typeof links.$inferSelect;
export type NewLink = typeof links.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type LinkCategory = typeof linkCategories.$inferSelect;
export type NewLinkCategory = typeof linkCategories.$inferInsert;
export type Collection = typeof collections.$inferSelect;
export type NewCollection = typeof collections.$inferInsert;
export type CollectionLink = typeof collectionLinks.$inferSelect;
export type NewCollectionLink = typeof collectionLinks.$inferInsert;
export type RefreshToken = typeof refreshTokens.$inferSelect;
export type NewRefreshToken = typeof refreshTokens.$inferInsert;

