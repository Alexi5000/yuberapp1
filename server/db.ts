// file: server/db.ts
// description: Data access helpers using Drizzle with Turso/libSQL backend
// reference: drizzle/schema.ts, server/_core/env.ts

import { createClient } from '@libsql/client';
import { type LibsqlError } from '@libsql/client';
import { and, desc, eq, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/libsql';
import { nanoid } from 'nanoid';
import { Booking, bookings, Conversation, conversations, favoriteProviders, InsertBooking, InsertConversation, InsertFavoriteProvider, InsertMessage, InsertPaymentMethod, InsertProvider, InsertReferral, InsertReview, InsertSearchHistory, InsertUser, Message, messages, PaymentMethod, paymentMethods, Provider, providers, referrals, Review, reviews, SearchHistory, searchHistory, users } from '../drizzle/schema';
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (_db) {
    return _db;
  }

  if (!ENV.databaseUrl) {
    console.warn('[Database] TURSO_DATABASE_URL is not configured');
    return null;
  }

  try {
    const client = createClient({ url: ENV.databaseUrl, authToken: ENV.databaseAuthToken ?? '' });
    _db = drizzle(client);
  } catch (error) {
    console.warn('[Database] Failed to connect:', error);
    _db = null;
  }

  return _db;
}

type DatabaseClient = NonNullable<Awaited<ReturnType<typeof getDb>>>;
let hasEnsuredSearchHistory = false;

function isMissingSearchHistoryTable(error: unknown): boolean {
  const isLibsqlMissingTable = (error as LibsqlError)?.code === 'SQLITE_UNKNOWN';
  const message = error instanceof Error ? error.message : '';
  return isLibsqlMissingTable || message.includes('no such table: searchHistory');
}

async function ensureSearchHistorySchema(db: DatabaseClient): Promise<boolean> {
  try {
    await db.$client.execute(`
      CREATE TABLE IF NOT EXISTS searchHistory (
        id integer PRIMARY KEY AUTOINCREMENT,
        userId integer,
        query text NOT NULL,
        latitude text,
        longitude text,
        createdAt integer NOT NULL DEFAULT (unixepoch())
      )
    `);

    await db.$client.execute('CREATE INDEX IF NOT EXISTS searchHistory_user_createdAt_idx ON searchHistory (userId, createdAt)');
    return true;
  } catch (error) {
    console.warn('[Database] Failed to ensure searchHistory schema', error);
    return false;
  }
}

// ============ USER FUNCTIONS ============
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error('User openId is required for upsert');
  }

  const db = await getDb();
  if (!db) {
    console.warn('[Database] Cannot upsert user: database not available');
    return;
  }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Partial<InsertUser> = {};

    const textFields = ['name', 'email', 'loginMethod', 'phone', 'avatarUrl'] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    updateSet.updatedAt = new Date();

    await db.insert(users).values(values).onConflictDoUpdate({ target: users.openId, set: updateSet });
  } catch (error) {
    console.error('[Database] Failed to upsert user:', error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserOnboarding(
  userId: number,
  data: { locationEnabled?: boolean, notificationsEnabled?: boolean, onboardingCompleted?: boolean }
) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ ...data, updatedAt: new Date() }).where(eq(users.id, userId));
}

// ============ CONVERSATION FUNCTIONS ============
export async function createConversation(userId: number, title?: string): Promise<Conversation | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const orderId = nanoid(12);
  await db.insert(conversations).values({ userId, title: title || 'New conversation', oderId: orderId });
  const result = await db.select().from(conversations).where(eq(conversations.oderId, orderId)).limit(1);
  return result[0];
}

export async function getConversationsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(conversations).where(eq(conversations.userId, userId)).orderBy(desc(conversations.updatedAt));
}

export async function getConversationById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(conversations).where(eq(conversations.id, id)).limit(1);
  return result[0];
}

export async function updateConversation(id: number, data: Partial<InsertConversation>) {
  const db = await getDb();
  if (!db) return;
  await db.update(conversations).set({ ...data, updatedAt: new Date() }).where(eq(conversations.id, id));
}

// ============ MESSAGE FUNCTIONS ============
export async function addMessage(data: InsertMessage): Promise<Message | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  await db.insert(messages).values(data);
  const result = await db.select().from(messages).where(eq(messages.conversationId, data.conversationId)).orderBy(desc(messages.id)).limit(
    1
  );
  return result[0];
}

export async function getMessagesByConversation(conversationId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(messages.createdAt);
}

// ============ PROVIDER FUNCTIONS ============
export async function getAllProviders() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(providers).orderBy(desc(providers.rating));
}

export async function getProvidersByCategory(category: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(providers).where(eq(providers.category, category)).orderBy(desc(providers.rating));
}

export async function getProviderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(providers).where(eq(providers.id, id)).limit(1);
  return result[0];
}

export async function searchProviders(query: string) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(providers).where(
      sql`${providers.name} LIKE ${`%${query}%`} OR ${providers.category} LIKE ${`%${query}%`} OR ${providers.specialties} LIKE ${`%${query}%`}`
    ).orderBy(desc(providers.rating));
  } catch (error) {
    console.error('[Database] searchProviders failed', error);
    return [];
  }
}

// ============ SEARCH HISTORY FUNCTIONS ============
export async function addSearchHistory(entry: InsertSearchHistory): Promise<SearchHistory | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const insertHistory = async () => {
    await db.insert(searchHistory).values(entry);
    const result = await db.select().from(searchHistory).orderBy(desc(searchHistory.id)).limit(1);
    return result[0];
  };

  try {
    if (!hasEnsuredSearchHistory) {
      const ensured = await ensureSearchHistorySchema(db);
      hasEnsuredSearchHistory = ensured;
      if (!ensured) {
        console.warn('[Database] Skipping search history insert; schema ensure failed.');
        return undefined;
      }
    }

    return await insertHistory();
  } catch (error) {
    if (isMissingSearchHistoryTable(error)) {
      const ensured = await ensureSearchHistorySchema(db);
      if (ensured) {
        hasEnsuredSearchHistory = true;
        try {
          return await insertHistory();
        } catch (retryError) {
          console.warn('[Database] Failed to record search history after ensuring schema', retryError);
          return undefined;
        }
      }
    }

    console.warn('[Database] Failed to record search history (is migration applied?)', error);
    return undefined;
  }
}

export async function getSearchHistoryByUser(userId: number): Promise<SearchHistory[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(searchHistory).where(eq(searchHistory.userId, userId)).orderBy(desc(searchHistory.createdAt));
}

export async function createProvider(data: InsertProvider) {
  const db = await getDb();
  if (!db) return undefined;
  await db.insert(providers).values(data);
  const result = await db.select().from(providers).where(eq(providers.name, data.name)).limit(1);
  return result[0];
}

// ============ BOOKING FUNCTIONS ============
export async function createBooking(data: Omit<InsertBooking, 'orderId'>): Promise<Booking | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const orderId = `BK-${nanoid(10)}`;
  await db.insert(bookings).values({ ...data, orderId });
  const result = await db.select().from(bookings).where(eq(bookings.orderId, orderId)).limit(1);
  return result[0];
}

export async function getBookingsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bookings).where(eq(bookings.userId, userId)).orderBy(desc(bookings.createdAt));
}

export async function getBookingById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
  return result[0];
}

export async function updateBooking(id: number, data: Partial<InsertBooking>) {
  const db = await getDb();
  if (!db) return;
  await db.update(bookings).set({ ...data, updatedAt: new Date() }).where(eq(bookings.id, id));
}

// ============ REVIEW FUNCTIONS ============
export async function createReview(data: InsertReview) {
  const db = await getDb();
  if (!db) return undefined;
  await db.insert(reviews).values(data);
  // Update provider rating
  const providerReviews = await db.select().from(reviews).where(eq(reviews.providerId, data.providerId));
  const avgRating = Math.round(providerReviews.reduce((sum, r) => sum + r.rating, 0) / providerReviews.length * 10);
  await db.update(providers).set({ rating: avgRating, reviewCount: providerReviews.length, updatedAt: new Date() }).where(
    eq(providers.id, data.providerId)
  );
  return data;
}

export async function getReviewsByProvider(providerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reviews).where(eq(reviews.providerId, providerId)).orderBy(desc(reviews.createdAt));
}

// ============ PAYMENT METHOD FUNCTIONS ============
export async function addPaymentMethod(data: InsertPaymentMethod) {
  const db = await getDb();
  if (!db) return undefined;
  if (data.isDefault) {
    await db.update(paymentMethods).set({ isDefault: false }).where(eq(paymentMethods.userId, data.userId));
  }
  await db.insert(paymentMethods).values(data);
  const result = await db.select().from(paymentMethods).where(
    and(eq(paymentMethods.userId, data.userId), eq(paymentMethods.lastFour, data.lastFour))
  ).limit(1);
  return result[0];
}

export async function getPaymentMethodsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(paymentMethods).where(eq(paymentMethods.userId, userId)).orderBy(desc(paymentMethods.isDefault));
}

export async function deletePaymentMethod(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(paymentMethods).where(and(eq(paymentMethods.id, id), eq(paymentMethods.userId, userId)));
}

// ============ FAVORITE PROVIDERS FUNCTIONS ============
export async function addFavoriteProvider(userId: number, providerId: number) {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select().from(favoriteProviders).where(
    and(eq(favoriteProviders.userId, userId), eq(favoriteProviders.providerId, providerId))
  ).limit(1);
  if (existing.length === 0) {
    await db.insert(favoriteProviders).values({ userId, providerId });
  }
}

export async function removeFavoriteProvider(userId: number, providerId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(favoriteProviders).where(and(eq(favoriteProviders.userId, userId), eq(favoriteProviders.providerId, providerId)));
}

export async function getFavoriteProvidersByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const favorites = await db.select().from(favoriteProviders).where(eq(favoriteProviders.userId, userId));
  if (favorites.length === 0) return [];
  const providerIds = favorites.map(f => f.providerId);
  return db.select().from(providers).where(sql`${providers.id} IN (${sql.join(providerIds.map(id => sql`${id}`), sql`, `)})`);
}

// ============ REFERRAL FUNCTIONS ============
export async function createReferral(referrerId: number): Promise<string> {
  const db = await getDb();
  if (!db) return '';
  const referralCode = `YUBER${nanoid(6).toUpperCase()}`;
  await db.insert(referrals).values({ referrerId, referralCode });
  return referralCode;
}

export async function getReferralsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(referrals).where(eq(referrals.referrerId, userId));
}
