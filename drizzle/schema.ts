// file: drizzle/schema.ts
// description: Drizzle ORM schema definitions targeting Turso/libSQL
// reference: server/db.ts, drizzle.config.ts

import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

/**
 * Core user table backing auth flow.
 */
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  openId: text('openId').notNull().unique(),
  name: text('name'),
  email: text('email'),
  phone: text('phone'),
  avatarUrl: text('avatarUrl'),
  loginMethod: text('loginMethod'),
  role: text('role', { enum: ['user', 'admin'] }).notNull().default('user'),
  locationEnabled: integer('locationEnabled', { mode: 'boolean' }).notNull().default(false),
  notificationsEnabled: integer('notificationsEnabled', { mode: 'boolean' }).notNull().default(false),
  onboardingCompleted: integer('onboardingCompleted', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  lastSignedIn: integer('lastSignedIn', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Conversations - stores chat sessions
 */
export const conversations = sqliteTable('conversations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  oderId: text('oderId').notNull().unique(),
  userId: integer('userId').notNull(),
  title: text('title'),
  status: text('status', { enum: ['active', 'completed', 'cancelled'] }).notNull().default('active'),
  serviceType: text('serviceType'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

/**
 * Messages - individual chat messages
 */
export const messages = sqliteTable('messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  conversationId: integer('conversationId').notNull(),
  role: text('role', { enum: ['user', 'assistant', 'system'] }).notNull(),
  content: text('content').notNull(),
  messageType: text('messageType', { enum: ['text', 'clarification', 'recommendation', 'status'] }).notNull().default('text'),
  metadata: text('metadata', { mode: 'json' }),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

/**
 * Providers - service providers/businesses
 */
export const providers = sqliteTable('providers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  category: text('category').notNull(),
  description: text('description'),
  imageUrl: text('imageUrl'),
  bannerUrl: text('bannerUrl'),
  rating: integer('rating').default(0),
  reviewCount: integer('reviewCount').default(0),
  hourlyRate: integer('hourlyRate'),
  callOutFee: integer('callOutFee').default(0),
  address: text('address'),
  latitude: text('latitude'),
  longitude: text('longitude'),
  phone: text('phone'),
  website: text('website'),
  hoursJson: text('hoursJson', { mode: 'json' }),
  servicesJson: text('servicesJson', { mode: 'json' }),
  amenitiesJson: text('amenitiesJson', { mode: 'json' }),
  isAvailable: integer('isAvailable', { mode: 'boolean' }).notNull().default(true),
  availableIn: integer('availableIn').default(5),
  specialties: text('specialties'),
  ecoFriendly: integer('ecoFriendly', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
}, (table) => ({ nameUnique: uniqueIndex('providers_name_unique').on(table.name) }));

export type Provider = typeof providers.$inferSelect;
export type InsertProvider = typeof providers.$inferInsert;

/**
 * Bookings - service bookings
 */
export const bookings = sqliteTable('bookings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orderId: text('orderId').notNull().unique(),
  userId: integer('userId').notNull(),
  providerId: integer('providerId').notNull(),
  conversationId: integer('conversationId'),
  serviceType: text('serviceType').notNull(),
  serviceDescription: text('serviceDescription'),
  status: text('status', { enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'] }).notNull().default('pending'),
  scheduledAt: integer('scheduledAt', { mode: 'timestamp' }),
  isAsap: integer('isAsap', { mode: 'boolean' }).notNull().default(true),
  locationAddress: text('locationAddress'),
  locationLat: text('locationLat'),
  locationLng: text('locationLng'),
  specialInstructions: text('specialInstructions'),
  estimatedCostMin: integer('estimatedCostMin'),
  estimatedCostMax: integer('estimatedCostMax'),
  finalCost: integer('finalCost'),
  durationMinutes: integer('durationMinutes'),
  providerEta: integer('providerEta'),
  providerLat: text('providerLat'),
  providerLng: text('providerLng'),
  startedAt: integer('startedAt', { mode: 'timestamp' }),
  completedAt: integer('completedAt', { mode: 'timestamp' }),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

/**
 * Reviews - user reviews for providers
 */
export const reviews = sqliteTable('reviews', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('userId').notNull(),
  providerId: integer('providerId').notNull(),
  bookingId: integer('bookingId').notNull(),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  tipAmount: integer('tipAmount').default(0),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

/**
 * Payment Methods - saved cards
 */
export const paymentMethods = sqliteTable('paymentMethods', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('userId').notNull(),
  cardType: text('cardType').notNull(),
  lastFour: text('lastFour').notNull(),
  expiryMonth: integer('expiryMonth').notNull(),
  expiryYear: integer('expiryYear').notNull(),
  isDefault: integer('isDefault', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type InsertPaymentMethod = typeof paymentMethods.$inferInsert;

/**
 * Favorite Providers - user's saved providers
 */
export const favoriteProviders = sqliteTable('favoriteProviders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('userId').notNull(),
  providerId: integer('providerId').notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

export type FavoriteProvider = typeof favoriteProviders.$inferSelect;
export type InsertFavoriteProvider = typeof favoriteProviders.$inferInsert;

/**
 * Referrals - referral tracking
 */
export const referrals = sqliteTable('referrals', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  referrerId: integer('referrerId').notNull(),
  referredUserId: integer('referredUserId'),
  referralCode: text('referralCode').notNull().unique(),
  status: text('status', { enum: ['pending', 'completed', 'expired'] }).notNull().default('pending'),
  rewardAmount: integer('rewardAmount').default(10),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = typeof referrals.$inferInsert;

/**
 * Search history - track user searches with optional coordinates
 */
export const searchHistory = sqliteTable('searchHistory', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('userId'),
  query: text('query').notNull(),
  latitude: text('latitude'),
  longitude: text('longitude'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
}, (table) => ({ idxUserCreatedAt: index('searchHistory_user_createdAt_idx').on(table.userId, table.createdAt) }));

export type SearchHistory = typeof searchHistory.$inferSelect;
export type InsertSearchHistory = typeof searchHistory.$inferInsert;
