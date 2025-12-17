// file: scripts/seed-providers.mjs
// description: Seeds demo providers into Turso/libSQL using @libsql/client
// reference: drizzle/schema.ts, server/db.ts
import { createClient } from '@libsql/client';

const demoProviders = [
  // Plumbers
  {
    name: 'Jake Williams',
    category: 'plumber',
    description:
      'Licensed master plumber with 15+ years experience in residential and commercial plumbing. Specializing in emergency repairs, pipe installations, and water heater services.',
    imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=400&fit=crop',
    rating: 49,
    reviewCount: 152,
    hourlyRate: 85,
    callOutFee: 0,
    address: '123 Main St, Austin, TX',
    latitude: '30.2672',
    longitude: '-97.7431',
    phone: '(512) 555-0123',
    isAvailable: true,
    availableIn: 5,
    specialties: 'emergency pipe repairs, water heater installation',
    ecoFriendly: false
  },
  {
    name: "Mike's Plumbing Pro",
    category: 'plumber',
    description:
      'Family-owned plumbing business serving the community for over 20 years. We handle everything from small leaks to major renovations.',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&h=400&fit=crop',
    rating: 47,
    reviewCount: 89,
    hourlyRate: 75,
    callOutFee: 25,
    address: '456 Oak Ave, Austin, TX',
    latitude: '30.2849',
    longitude: '-97.7341',
    phone: '(512) 555-0456',
    isAvailable: true,
    availableIn: 15,
    specialties: 'drain cleaning, bathroom remodeling',
    ecoFriendly: true
  },
  // Electricians
  {
    name: 'Sarah Chen Electric',
    category: 'electrician',
    description:
      'Certified electrician specializing in smart home installations, EV charger setup, and electrical panel upgrades. Safety-first approach.',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&h=400&fit=crop',
    rating: 50,
    reviewCount: 203,
    hourlyRate: 95,
    callOutFee: 0,
    address: '789 Tech Blvd, Austin, TX',
    latitude: '30.2500',
    longitude: '-97.7500',
    phone: '(512) 555-0789',
    isAvailable: true,
    availableIn: 10,
    specialties: 'smart home, EV chargers, panel upgrades',
    ecoFriendly: true
  },
  // Car Wash
  {
    name: 'Sparkle Auto Spa',
    category: 'carwash',
    description: 'Premium hand car wash and detailing service. We use only eco-friendly products and treat every car like our own.',
    imageUrl: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=200&h=200&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=800&h=400&fit=crop',
    rating: 49,
    reviewCount: 243,
    hourlyRate: 35,
    callOutFee: 0,
    address: '321 Wash Way, Austin, TX',
    latitude: '30.2900',
    longitude: '-97.7200',
    phone: '(512) 555-0321',
    isAvailable: true,
    availableIn: 0,
    specialties: 'premium hand wash, ceramic coating, interior detailing',
    ecoFriendly: true
  },
  {
    name: 'Quick Clean Auto',
    category: 'carwash',
    description: 'Fast and affordable car wash with express options. Get in and out in under 15 minutes!',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1552930294-6b595f4c2974?w=800&h=400&fit=crop',
    rating: 44,
    reviewCount: 156,
    hourlyRate: 20,
    callOutFee: 0,
    address: '555 Express Lane, Austin, TX',
    latitude: '30.2600',
    longitude: '-97.7600',
    phone: '(512) 555-0555',
    isAvailable: true,
    availableIn: 5,
    specialties: 'express wash, basic detailing',
    ecoFriendly: false
  },
  // Restaurants
  {
    name: 'Bella Vita Italian',
    category: 'restaurant',
    description: 'Authentic Northern Italian cuisine in a romantic setting. Fresh pasta made daily, extensive wine list.',
    imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&h=200&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=400&fit=crop',
    rating: 48,
    reviewCount: 312,
    hourlyRate: 45,
    callOutFee: 0,
    address: '100 Italian Way, Austin, TX',
    latitude: '30.2700',
    longitude: '-97.7400',
    phone: '(512) 555-0100',
    isAvailable: true,
    availableIn: 30,
    specialties: 'fresh pasta, wood-fired pizza, tiramisu',
    ecoFriendly: true
  },
  {
    name: 'Sakura Sushi House',
    category: 'restaurant',
    description: "Traditional Japanese sushi and sashimi. Our fish is flown in fresh daily from Tokyo's Tsukiji market.",
    imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=200&h=200&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&h=400&fit=crop',
    rating: 49,
    reviewCount: 278,
    hourlyRate: 55,
    callOutFee: 0,
    address: '200 Sushi Blvd, Austin, TX',
    latitude: '30.2750',
    longitude: '-97.7350',
    phone: '(512) 555-0200',
    isAvailable: true,
    availableIn: 15,
    specialties: 'omakase, fresh sashimi, sake pairing',
    ecoFriendly: true
  },
  // Hair Salon
  {
    name: 'The Cut Studio',
    category: 'haircut',
    description:
      'Modern hair salon offering cuts, color, and styling for all hair types. Our stylists are trained in the latest techniques.',
    imageUrl: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=200&h=200&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=400&fit=crop',
    rating: 47,
    reviewCount: 189,
    hourlyRate: 65,
    callOutFee: 0,
    address: '400 Style St, Austin, TX',
    latitude: '30.2650',
    longitude: '-97.7450',
    phone: '(512) 555-0400',
    isAvailable: true,
    availableIn: 45,
    specialties: 'balayage, precision cuts, keratin treatments',
    ecoFriendly: true
  },
  // Cleaning
  {
    name: 'Pristine Home Cleaning',
    category: 'cleaning',
    description: 'Professional home cleaning services. We bring our own eco-friendly supplies and leave your home sparkling.',
    imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=200&h=200&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1527515545081-5db817172677?w=800&h=400&fit=crop',
    rating: 48,
    reviewCount: 167,
    hourlyRate: 45,
    callOutFee: 0,
    address: '500 Clean Ave, Austin, TX',
    latitude: '30.2800',
    longitude: '-97.7300',
    phone: '(512) 555-0500',
    isAvailable: true,
    availableIn: 60,
    specialties: 'deep cleaning, move-in/out, recurring service',
    ecoFriendly: true
  },
  // Handyman
  {
    name: 'Fix-It Fred',
    category: 'handyman',
    description: 'Your neighborhood handyman for all small repairs and home improvements. No job too small!',
    imageUrl: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=200&h=200&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&h=400&fit=crop',
    rating: 46,
    reviewCount: 134,
    hourlyRate: 55,
    callOutFee: 15,
    address: '600 Repair Rd, Austin, TX',
    latitude: '30.2550',
    longitude: '-97.7550',
    phone: '(512) 555-0600',
    isAvailable: true,
    availableIn: 30,
    specialties: 'furniture assembly, drywall repair, painting',
    ecoFriendly: false
  }
];

function assertEnv() {
  if (!Bun.env.TURSO_DATABASE_URL) {
    throw new Error('TURSO_DATABASE_URL is required to seed the database');
  }
}

function buildArgs(provider) {
  return [
    provider.name,
    provider.category,
    provider.description ?? null,
    provider.imageUrl ?? null,
    provider.bannerUrl ?? null,
    provider.rating ?? 0,
    provider.reviewCount ?? 0,
    provider.hourlyRate ?? null,
    provider.callOutFee ?? 0,
    provider.address ?? null,
    provider.latitude ?? null,
    provider.longitude ?? null,
    provider.phone ?? null,
    provider.isAvailable ? 1 : 0,
    provider.availableIn ?? 0,
    provider.specialties ?? null,
    provider.ecoFriendly ? 1 : 0,
    provider.website ?? null,
    provider.hoursJson ?? null,
    provider.servicesJson ?? null,
    provider.amenitiesJson ?? null
  ];
}

async function seed() {
  assertEnv();

  const client = createClient({ url: Bun.env.TURSO_DATABASE_URL, authToken: Bun.env.TURSO_AUTH_TOKEN });

  console.log('Seeding providers...');

  const upsertSql = `
    INSERT INTO providers (
      name, category, description, imageUrl, bannerUrl, rating, reviewCount,
      hourlyRate, callOutFee, address, latitude, longitude, phone,
      isAvailable, availableIn, specialties, ecoFriendly, website,
      hoursJson, servicesJson, amenitiesJson
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(name) DO UPDATE SET
      category = excluded.category,
      description = excluded.description,
      imageUrl = excluded.imageUrl,
      bannerUrl = excluded.bannerUrl,
      rating = excluded.rating,
      reviewCount = excluded.reviewCount,
      hourlyRate = excluded.hourlyRate,
      callOutFee = excluded.callOutFee,
      address = excluded.address,
      latitude = excluded.latitude,
      longitude = excluded.longitude,
      phone = excluded.phone,
      isAvailable = excluded.isAvailable,
      availableIn = excluded.availableIn,
      specialties = excluded.specialties,
      ecoFriendly = excluded.ecoFriendly,
      website = excluded.website,
      hoursJson = excluded.hoursJson,
      servicesJson = excluded.servicesJson,
      amenitiesJson = excluded.amenitiesJson,
      updatedAt = unixepoch()
  `;

  for (const provider of demoProviders) {
    try {
      await client.execute({ sql: upsertSql, args: buildArgs(provider) });
      console.log(`  ✓ ${provider.name}`);
    } catch (error) {
      console.error(`  ✗ ${provider.name}:`, error?.message ?? error);
    }
  }

  console.log('Done!');
  await client.close();
}

seed().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
