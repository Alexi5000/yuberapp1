// file: server/routers.ts
// description: tRPC application router exposing auth, user, conversation, provider APIs
// reference: server/_core/trpc.ts, server/_core/cookies.ts
import { COOKIE_NAME } from '@shared/const';
import { z } from 'zod';
import { getSessionCookieOptions } from './_core/cookies';
import { invokeLLM, searchProvidersWithLogging } from './_core/llm';
import { systemRouter } from './_core/systemRouter';
import { protectedProcedure, publicProcedure, router } from './_core/trpc';
import { agentRouter } from './routers/agent';
import { getYelpBusinessDetails, getYelpBusinessReviews, searchYelpBusinesses, type YelpRestBusiness } from './_core/yelp_rest_search';
import * as db from './db';

const DEFAULT_SEARCH_LOCATION = { latitude: 39.9612, longitude: -83.1259 }; // Columbus, OH
const DEFAULT_AVAILABLE_MINUTES = 10;
const YELP_TIMEOUT_MS = 3000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))
  ]);
}

const SERVICE_QUERY_MAP: Record<string, string> = {
  'car wash': 'carwash',
  wash: 'carwash',
  detailing: 'carwash',
  plumber: 'plumber',
  plumbing: 'plumber',
  electrician: 'electrician',
  electric: 'electrician',
  sushi: 'restaurant',
  restaurant: 'restaurant',
  haircut: 'haircut',
  salon: 'haircut',
  cleaning: 'cleaning',
  cleaner: 'cleaning',
  handyman: 'handyman',
  repair: 'handyman'
};

function normalizeServiceQuery(raw: string): string {
  const lower = raw.toLowerCase();
  for (const [keyword, mapped] of Object.entries(SERVICE_QUERY_MAP)) {
    if (lower.includes(keyword)) {
      return mapped;
    }
  }
  return raw.trim();
}

function mapToCategory(raw: string): string | undefined {
  const normalized = normalizeServiceQuery(raw);
  switch (normalized) {
    case 'carwash':
      return 'carwash';
    case 'plumber':
      return 'plumbing';
    case 'electrician':
      return 'electrician';
    case 'restaurant':
      return 'restaurants';
    case 'haircut':
      return 'hair';
    case 'cleaning':
      return 'homecleaning';
    case 'handyman':
      return 'handyman';
    default:
      return undefined;
  }
}

export const appRouter = router({
  system: systemRouter,
  agent: agentRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      const parts = [
        `${COOKIE_NAME}=`,
        `Path=${cookieOptions.path}`,
        'Max-Age=0',
        `SameSite=${cookieOptions.sameSite === 'none' ? 'None' : cookieOptions.sameSite === 'strict' ? 'Strict' : 'Lax'}`,
        cookieOptions.secure ? 'Secure' : '',
        cookieOptions.httpOnly ? 'HttpOnly' : ''
      ].filter(Boolean);
      ctx.responseHeaders.append('Set-Cookie', parts.join('; '));
      return { success: true } as const;
    })
  }),

  // ============ USER PROCEDURES ============
  user: router({
    updateOnboarding: protectedProcedure.input(
      z.object({
        locationEnabled: z.boolean().optional(),
        notificationsEnabled: z.boolean().optional(),
        onboardingCompleted: z.boolean().optional()
      })
    ).mutation(async ({ ctx, input }) => {
      const onboardingUpdate = {
        ...(input.locationEnabled === undefined ? {} : { locationEnabled: input.locationEnabled }),
        ...(input.notificationsEnabled === undefined ? {} : { notificationsEnabled: input.notificationsEnabled }),
        ...(input.onboardingCompleted === undefined ? {} : { onboardingCompleted: input.onboardingCompleted })
      };

      await db.updateUserOnboarding(ctx.user.id, onboardingUpdate);
      return { success: true };
    }),

    getProfile: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserById(ctx.user.id);
    })
  }),

  // ============ CONVERSATION PROCEDURES ============
  conversation: router({
    create: protectedProcedure.input(z.object({ title: z.string().optional() })).mutation(async ({ ctx, input }) => {
      return db.createConversation(ctx.user.id, input.title);
    }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getConversationsByUser(ctx.user.id);
    }),

    get: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return db.getConversationById(input.id);
    }),

    getMessages: protectedProcedure.input(z.object({ conversationId: z.number() })).query(async ({ input }) => {
      return db.getMessagesByConversation(input.conversationId);
    }),

    sendMessage: protectedProcedure.input(z.object({ conversationId: z.number(), content: z.string() })).mutation(
      async ({ ctx, input }) => {
        // Save user message
        await db.addMessage({ conversationId: input.conversationId, role: 'user', content: input.content, messageType: 'text' });

        // Get conversation history for context
        const history = await db.getMessagesByConversation(input.conversationId);
        const messagesForLLM = history.map(m => ({ role: m.role as 'user' | 'assistant' | 'system', content: m.content }));

        // Generate AI response
        const systemPrompt =
          `You are YUBER, an AI agent for local services. You help users find and book local service providers like plumbers, electricians, car washes, restaurants, hair salons, etc.

Your personality is helpful, efficient, and friendly. You understand natural language requests and help match users with the best service providers.

When a user asks for a service:
1. Understand their need clearly
2. Ask clarifying questions if needed (e.g., "Are you looking for emergency service or can it wait?")
3. When ready to search, indicate you're searching for providers
4. Recommend the best match with clear reasoning

Keep responses concise and conversational. Use emojis sparingly for warmth.`;

        const response = await invokeLLM({
          messages: [{ role: 'system', content: systemPrompt }, ...messagesForLLM],
          conversationId: input.conversationId
        });

        const aiContent = response.text || "I'm sorry, I couldn't process that request. Could you try again?";

        // Determine message type based on content
        let messageType: 'text' | 'clarification' | 'recommendation' | 'status' = 'text';
        if (
          aiContent.includes('searching') || aiContent.includes('Searching') || aiContent.includes('looking for') ||
          aiContent.includes('Looking for')
        ) {
          messageType = 'status';
        }

        // Save AI response
        const aiMessage = await db.addMessage({ conversationId: input.conversationId, role: 'assistant', content: aiContent, messageType });

        // Update conversation title if first message
        if (history.length <= 1) {
          const title = input.content.slice(0, 50) + (input.content.length > 50 ? '...' : '');
          await db.updateConversation(input.conversationId, { title, serviceType: detectServiceType(input.content) });
        }

        return aiMessage;
      }
    )
  }),

  // ============ PROVIDER PROCEDURES ============
  provider: router({
    list: publicProcedure.query(async () => {
      return db.getAllProviders();
    }),

    getByCategory: publicProcedure.input(z.object({ category: z.string() })).query(async ({ input }) => {
      return db.getProvidersByCategory(input.category);
    }),

    get: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return db.getProviderById(input.id);
    }),

    search: publicProcedure.input(z.object({ query: z.string(), location: z.object({ lat: z.number(), lng: z.number() }).optional() }))
      .query(async ({ input, ctx }) => {
        const location = input.location ? { latitude: input.location.lat, longitude: input.location.lng } : DEFAULT_SEARCH_LOCATION;

        const normalizedQuery = normalizeServiceQuery(input.query);
        // 1) Try direct Yelp REST first (cheaper and less rate-limited), with category hint and retry
        const restCategory = mapToCategory(input.query);
        try {
          const restBusinesses: YelpRestBusiness[] = await withTimeout(
            searchYelpBusinesses(normalizedQuery, location, restCategory),
            YELP_TIMEOUT_MS
          ).catch(err => {
            console.error('[YelpREST] Search timed out or failed:', err);
            return [] as YelpRestBusiness[];
          });
          
          console.info('[YelpREST] search result', {
            query: normalizedQuery,
            category: restCategory,
            location,
            count: restBusinesses.length
          });

          if (!restBusinesses.length && normalizedQuery !== input.query) {
            const secondPass: YelpRestBusiness[] = await withTimeout(
              searchYelpBusinesses(input.query, location, restCategory),
              YELP_TIMEOUT_MS
            ).catch(err => {
               console.error('[YelpREST] Second pass failed:', err);
               return [] as YelpRestBusiness[];
            });
            console.info('[YelpREST] second pass result', {
              query: input.query,
              category: restCategory,
              location,
              count: secondPass.length
            });
            if (secondPass.length) {
              restBusinesses.push(...secondPass);
            }
          }

          if (restBusinesses.length > 0) {
            await db.addSearchHistory({
              userId: ctx.user?.id,
              query: input.query,
              latitude: String(location.latitude),
              longitude: String(location.longitude)
            });

            return restBusinesses.map((business, index) => ({
              id: index + 1,
              source: 'yelp' as const,
              yelpId: business.id,
              name: business.name,
              category: business.categories?.[0]?.title ?? 'Local Service',
              description: business.location?.display_address?.join(', ') ?? business.location?.address1 ?? business.location?.city ?? 'Trusted local provider',
              imageUrl: business.image_url ?? null,
              bannerUrl: business.image_url ?? null,
              rating: business.rating ? Math.round(business.rating * 10) : null,
              reviewCount: business.review_count ?? 0,
              hourlyRate: null,
              callOutFee: 0,
              distance: business.distance ? Number((business.distance / 1609).toFixed(1)) : null,
              address: business.location?.display_address?.join(', ') ?? business.location?.address1 ?? null,
              latitude: business.coordinates?.latitude ?? null,
              longitude: business.coordinates?.longitude ?? null,
              phone: business.display_phone ?? business.phone ?? null,
              website: business.url ?? null,
              isAvailable: true,
              availableIn: DEFAULT_AVAILABLE_MINUTES,
              specialties: business.categories?.map((c) => c.title).join(', ') ?? null,
              servicesOffered: (business as { transactions?: string[] | null }).transactions ?? null,
              ecoFriendly: null
            }));
          }
        } catch (restError) {
          console.error('[Provider.search] Yelp REST search failed', restError);
        }

        // 2) Try Yelp AI only if REST returned nothing
        try {
          let yelpResult = await withTimeout(
            searchProvidersWithLogging(normalizedQuery, location),
            YELP_TIMEOUT_MS
          );

          if (!yelpResult.businesses.length && normalizedQuery !== input.query) {
            yelpResult = await withTimeout(
              searchProvidersWithLogging(`${normalizedQuery} near me`, location),
              YELP_TIMEOUT_MS
            );
          }

          const mapped = yelpResult.businesses.map((business, index) => ({
            id: index + 1,
            source: 'yelp' as const,
            yelpId: business.id,
            name: business.name,
            category: business.categories?.[0]?.title ?? 'Local Service',
            description: business.location.address1 ?? business.location.city ?? 'Trusted local provider',
            imageUrl: business.image_url ?? null,
            bannerUrl: business.image_url ?? null,
            rating: Math.round((business.rating ?? 4.5) * 10),
            reviewCount: business.review_count ?? 0,
            hourlyRate: null,
            callOutFee: 0,
            distance: business.distance ? Number((business.distance / 1609).toFixed(1)) : null,
            address: business.location.address1 ?? null,
            phone: business.phone ?? null,
            website: business.url ?? null,
            isAvailable: true,
            availableIn: DEFAULT_AVAILABLE_MINUTES,
            specialties: business.categories?.map((c) => c.title).join(', ') ?? null,
            servicesOffered: (business as { transactions?: string[] | null }).transactions ?? null,
            ecoFriendly: null
          }));

          await db.addSearchHistory({
            userId: ctx.user?.id,
            query: input.query,
            latitude: String(location.latitude),
            longitude: String(location.longitude)
          });

          if (mapped.length > 0) {
            return mapped;
          }
        } catch (error) {
          console.error('[Provider.search] Yelp AI lookup failed, will use DB fallback', error);
        }

        // 3) Final fallback: internal DB so UI still shows providers
        const fallback = await db.searchProviders(normalizedQuery);
        return fallback.map((provider) => ({ ...provider, distance: null, source: 'internal' as const, yelpId: null }));
      }),

    getReviews: publicProcedure.input(
      z.object({
        providerId: z.number().optional(),
        yelpBusinessId: z.string().optional()
      }).refine((value) => Boolean(value.providerId) || Boolean(value.yelpBusinessId), { message: 'providerId or yelpBusinessId is required' })
    ).query(async ({ input }) => {
      if (input.yelpBusinessId) {
        try {
          const yelpReviews = await getYelpBusinessReviews(input.yelpBusinessId);
          return yelpReviews.map(review => ({
            id: review.id,
            rating: review.rating,
            comment: review.text,
            createdAt: review.time_created,
            authorName: review.user?.name ?? 'Yelp user',
            source: 'yelp' as const,
            url: review.url ?? null
          }));
        } catch (error) {
          console.error('[Provider.getReviews] Yelp reviews fetch failed', error);
        }
      }

      if (!input.providerId) {
        return [];
      }

      return db.getReviewsByProvider(input.providerId);
    }),

    getYelpBusiness: publicProcedure.input(z.object({ yelpBusinessId: z.string() })).query(async ({ input }) => {
      try {
        const business = await getYelpBusinessDetails(input.yelpBusinessId);
        return {
          id: 0,
          source: 'yelp' as const,
          yelpId: business.id,
          name: business.name,
          category: business.categories?.[0]?.title ?? 'Local Service',
          description: business.location?.display_address?.join(', ') ?? business.location?.address1 ?? null,
          imageUrl: business.image_url ?? null,
          bannerUrl: business.photos?.[0] ?? business.image_url ?? null,
          photos: business.photos ?? null, // Include full photos array
          rating: business.rating ? Math.round(business.rating * 10) : null,
          reviewCount: business.review_count ?? 0,
          hourlyRate: null,
          callOutFee: 0,
          distance: null,
          address: business.location?.display_address?.join(', ') ?? business.location?.address1 ?? null,
          isAvailable: true,
          availableIn: DEFAULT_AVAILABLE_MINUTES,
          specialties: business.categories?.map((c) => c.title).join(', ') ?? null,
          servicesOffered: (business as { transactions?: string[] | null }).transactions ?? null,
          ecoFriendly: null,
          phone: business.display_phone ?? business.phone ?? null,
          website: business.url ?? null
        };
      } catch (error) {
        console.error('[Provider.getYelpBusiness] Yelp business fetch failed', error);
        return null;
      }
    }),

    getRecommendation: protectedProcedure.input(
      z.object({ serviceType: z.string(), userLocation: z.object({ lat: z.number(), lng: z.number() }).optional() })
    ).query(async ({ input }) => {
      // Get providers matching the service type
      const allProviders = await db.searchProviders(input.serviceType);
      if (allProviders.length === 0) {
        return null;
      }

      // For demo, return top provider with AI-generated reasoning
      const topProvider = allProviders[0];
      if (!topProvider) {
        return null;
      }

      // Generate personalized reasoning
      const reasons = generateRecommendationReasons(topProvider, input.serviceType);

      return {
        provider: topProvider,
        reasons,
        estimatedCost: { min: topProvider.hourlyRate || 50, max: (topProvider.hourlyRate || 50) * 2 }
      };
    })
  }),

  // ============ BOOKING PROCEDURES ============
  booking: router({
    create: protectedProcedure.input(
      z.object({
        providerId: z.number(),
        serviceType: z.string(),
        serviceDescription: z.string().optional(),
        scheduledAt: z.string().optional(),
        isAsap: z.boolean().default(true),
        locationAddress: z.string().optional(),
        specialInstructions: z.string().optional(),
        estimatedCostMin: z.number().optional(),
        estimatedCostMax: z.number().optional(),
        conversationId: z.number().optional()
      })
    ).mutation(async ({ ctx, input }) => {
      return db.createBooking({
        userId: ctx.user.id,
        providerId: input.providerId,
        serviceType: input.serviceType,
        serviceDescription: input.serviceDescription,
        scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : undefined,
        isAsap: input.isAsap,
        locationAddress: input.locationAddress,
        specialInstructions: input.specialInstructions,
        estimatedCostMin: input.estimatedCostMin,
        estimatedCostMax: input.estimatedCostMax,
        conversationId: input.conversationId,
        status: 'confirmed',
        providerEta: Math.floor(Math.random() * 15) + 5 // 5-20 min ETA for demo
      });
    }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getBookingsByUser(ctx.user.id);
    }),

    get: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return db.getBookingById(input.id);
    }),

    updateStatus: protectedProcedure.input(
      z.object({ id: z.number(), status: z.enum(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']) })
    ).mutation(async ({ input }) => {
      const updateData: Record<string, unknown> = { status: input.status };
      if (input.status === 'in_progress') {
        updateData.startedAt = new Date();
      } else if (input.status === 'completed') {
        updateData.completedAt = new Date();
      }
      await db.updateBooking(input.id, updateData);
      return { success: true };
    }),

    updateProviderLocation: protectedProcedure.input(z.object({ id: z.number(), lat: z.string(), lng: z.string(), eta: z.number() }))
      .mutation(async ({ input }) => {
        await db.updateBooking(input.id, { providerLat: input.lat, providerLng: input.lng, providerEta: input.eta });
        return { success: true };
      })
  }),

  // ============ REVIEW PROCEDURES ============
  review: router({
    create: protectedProcedure.input(
      z.object({
        providerId: z.number(),
        bookingId: z.number(),
        rating: z.number().min(1).max(5),
        comment: z.string().optional(),
        tipAmount: z.number().optional()
      })
    ).mutation(async ({ ctx, input }) => {
      return db.createReview({
        userId: ctx.user.id,
        providerId: input.providerId,
        bookingId: input.bookingId,
        rating: input.rating,
        comment: input.comment,
        tipAmount: input.tipAmount
      });
    })
  }),

  // ============ PAYMENT METHOD PROCEDURES ============
  paymentMethod: router({
    add: protectedProcedure.input(
      z.object({
        cardType: z.string(),
        lastFour: z.string().length(4),
        expiryMonth: z.number().min(1).max(12),
        expiryYear: z.number(),
        isDefault: z.boolean().default(false)
      })
    ).mutation(async ({ ctx, input }) => {
      return db.addPaymentMethod({ userId: ctx.user.id, ...input });
    }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getPaymentMethodsByUser(ctx.user.id);
    }),

    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      await db.deletePaymentMethod(input.id, ctx.user.id);
      return { success: true };
    })
  }),

  // ============ FAVORITE PROVIDERS PROCEDURES ============
  favorites: router({
    add: protectedProcedure.input(z.object({ providerId: z.number() })).mutation(async ({ ctx, input }) => {
      await db.addFavoriteProvider(ctx.user.id, input.providerId);
      return { success: true };
    }),

    remove: protectedProcedure.input(z.object({ providerId: z.number() })).mutation(async ({ ctx, input }) => {
      await db.removeFavoriteProvider(ctx.user.id, input.providerId);
      return { success: true };
    }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getFavoriteProvidersByUser(ctx.user.id);
    })
  }),

  // ============ REFERRAL PROCEDURES ============
  referral: router({
    create: protectedProcedure.mutation(async ({ ctx }) => {
      const code = await db.createReferral(ctx.user.id);
      return { code };
    }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getReferralsByUser(ctx.user.id);
    })
  })
});

// Helper function to detect service type from user message
function detectServiceType(message: string): string {
  const lowerMessage = message.toLowerCase();
  const serviceKeywords: Record<string, string[]> = {
    plumber: ['plumb', 'pipe', 'leak', 'drain', 'faucet', 'toilet', 'water'],
    electrician: ['electric', 'wiring', 'outlet', 'power', 'light', 'circuit'],
    carwash: ['car wash', 'wash my car', 'auto detail', 'detailing'],
    restaurant: ['restaurant', 'food', 'eat', 'dinner', 'lunch', 'sushi', 'italian'],
    haircut: ['hair', 'haircut', 'salon', 'barber', 'style'],
    cleaning: ['clean', 'maid', 'housekeep'],
    handyman: ['handyman', 'fix', 'repair', 'broken']
  };

  for (const [service, keywords] of Object.entries(serviceKeywords)) {
    if (keywords.some(kw => lowerMessage.includes(kw))) {
      return service;
    }
  }
  return 'general';
}

// Helper function to generate recommendation reasons
function generateRecommendationReasons(provider: any, serviceType: string): string[] {
  const reasons: string[] = [];

  if (provider.rating) {
    reasons.push(`Highest-rated ${serviceType} provider within 5 miles with ${(provider.rating / 10).toFixed(1)} stars`);
  }

  if (provider.isAvailable) {
    reasons.push(`Available now with ${provider.availableIn || 5}-minute ETA`);
  }

  if (provider.specialties) {
    reasons.push(`Specializes in ${provider.specialties}`);
  }

  if (provider.reviewCount) {
    reasons.push(`${provider.reviewCount} verified reviews averaging ${(provider.rating / 10).toFixed(1)} stars`);
  }

  if (provider.callOutFee === 0) {
    reasons.push('No call-out fee for your area');
  }

  if (provider.ecoFriendly) {
    reasons.push('Eco-friendly products and practices');
  }

  // Ensure we have at least 3 reasons
  if (reasons.length < 3) {
    reasons.push('Highly recommended by local customers');
  }

  return reasons.slice(0, 5);
}

export type AppRouter = typeof appRouter;
