// file: scripts/seed-columbus.ts
// description: Seeds Columbus, OH providers into Turso/libSQL
// reference: server/mastra/data/mockProviders.ts

import { createClient } from '@libsql/client';

const mockProviders = [
  // Plumbers
  {
    name: "Columbus Plumbing Pros",
    category: "plumber",
    rating: 4.9,
    reviewCount: 287,
    available: true,
    phone: "+1-614-555-0101",
    imageUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=150&h=150&fit=crop",
    location: { lat: 39.9652, lng: -83.1189 },
    description: "Licensed master plumber with 15+ years experience in residential and commercial plumbing.",
    specialties: "emergency repairs, pipe installations"
  },
  {
    name: "West Side Drain Masters",
    category: "plumber",
    rating: 4.7,
    reviewCount: 156,
    available: true,
    phone: "+1-614-555-0102",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=150&h=150&fit=crop",
    location: { lat: 39.9542, lng: -83.1359 },
    description: "Family-owned plumbing business serving the West Side.",
    specialties: "drain cleaning, clogs"
  },
  {
    name: "Emergency Pipe Fixers",
    category: "plumber",
    rating: 4.8,
    reviewCount: 203,
    available: true,
    phone: "+1-614-555-0103",
    imageUrl: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=150&h=150&fit=crop",
    location: { lat: 39.9712, lng: -83.1109 },
    description: "24/7 emergency response for burst pipes and leaks.",
    specialties: "emergency, pipes"
  },
  {
    name: "Buckeye Plumbing Co",
    category: "plumber",
    rating: 4.6,
    reviewCount: 134,
    available: true,
    phone: "+1-614-555-0104",
    imageUrl: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=150&h=150&fit=crop",
    location: { lat: 39.9482, lng: -83.1459 },
    description: "Reliable plumbing service for all your home needs.",
    specialties: "general plumbing, maintenance"
  },
  {
    name: "24/7 Leak Stoppers",
    category: "plumber",
    rating: 4.5,
    reviewCount: 98,
    available: true,
    phone: "+1-614-555-0105",
    imageUrl: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=150&h=150&fit=crop",
    location: { lat: 39.9782, lng: -83.0989 },
    description: "We stop leaks fast. Residential and commercial.",
    specialties: "leaks, waterproofing"
  },

  // Electricians
  {
    name: "Spark Electric Columbus",
    category: "electrician",
    rating: 4.9,
    reviewCount: 342,
    available: true,
    phone: "+1-614-555-0201",
    imageUrl: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=150&h=150&fit=crop",
    location: { lat: 39.9592, lng: -83.1209 },
    description: "Certified electricians for smart home and standard electrical work.",
    specialties: "smart home, panels"
  },
  {
    name: "PowerUp Electrical Services",
    category: "electrician",
    rating: 4.8,
    reviewCount: 189,
    available: true,
    phone: "+1-614-555-0202",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=150&h=150&fit=crop",
    location: { lat: 39.9682, lng: -83.1329 },
    description: "Full service electrical contractor.",
    specialties: "wiring, lighting"
  },
  {
    name: "Ohio Voltage Experts",
    category: "electrician",
    rating: 4.7,
    reviewCount: 267,
    available: true,
    phone: "+1-614-555-0203",
    imageUrl: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=150&h=150&fit=crop",
    location: { lat: 39.9512, lng: -83.1089 },
    description: "Experts in high voltage and residential systems.",
    specialties: "voltage, safety"
  },
  {
    name: "Circuit Masters LLC",
    category: "electrician",
    rating: 4.6,
    reviewCount: 145,
    available: true,
    phone: "+1-614-555-0204",
    imageUrl: "https://images.unsplash.com/photo-1555963153-11ff60182d08?w=150&h=150&fit=crop",
    location: { lat: 39.9442, lng: -83.1389 },
    description: "Master electricians for complex circuits.",
    specialties: "circuits, breakers"
  },
  {
    name: "Rapid Response Electric",
    category: "electrician",
    rating: 4.5,
    reviewCount: 112,
    available: true,
    phone: "+1-614-555-0205",
    imageUrl: "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=150&h=150&fit=crop",
    location: { lat: 39.9762, lng: -83.1509 },
    description: "Fast electrical repairs when you need them.",
    specialties: "emergency, repairs"
  },

  // Locksmiths
  {
    name: "Columbus Lock & Key",
    category: "locksmith",
    rating: 4.9,
    reviewCount: 198,
    available: true,
    phone: "+1-614-555-0301",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=150&h=150&fit=crop",
    location: { lat: 39.9632, lng: -83.1229 },
    description: "Professional locksmith for automotive and residential.",
    specialties: "lockouts, keys"
  },
  {
    name: "Quick Entry Locksmiths",
    category: "locksmith",
    rating: 4.8,
    reviewCount: 167,
    available: true,
    phone: "+1-614-555-0302",
    imageUrl: "https://images.unsplash.com/photo-1582139329536-e7284fece509?w=150&h=150&fit=crop",
    location: { lat: 39.9572, lng: -83.1359 },
    description: "Fast lockout service.",
    specialties: "emergency entry"
  },
  {
    name: "24 Hour Key Solutions",
    category: "locksmith",
    rating: 4.7,
    reviewCount: 234,
    available: true,
    phone: "+1-614-555-0303",
    imageUrl: "https://images.unsplash.com/photo-1558002038-1055907df827?w=150&h=150&fit=crop",
    location: { lat: 39.9722, lng: -83.1159 },
    description: "Round the clock key replacement.",
    specialties: "keys, fobs"
  },
  {
    name: "West Columbus Locks",
    category: "locksmith",
    rating: 4.6,
    reviewCount: 89,
    available: true,
    phone: "+1-614-555-0304",
    imageUrl: "https://images.unsplash.com/photo-1505798577917-a65157d3320a?w=150&h=150&fit=crop",
    location: { lat: 39.9462, lng: -83.1429 },
    description: "Local locksmith you can trust.",
    specialties: "locks, deadbolts"
  },
  {
    name: "Secure Access Pro",
    category: "locksmith",
    rating: 4.5,
    reviewCount: 76,
    available: true,
    phone: "+1-614-555-0305",
    imageUrl: "https://images.unsplash.com/photo-1558002038-bb4237b50b11?w=150&h=150&fit=crop",
    location: { lat: 39.9812, lng: -83.0959 },
    description: "Security system and lock specialists.",
    specialties: "security, access control"
  },

  // Handyman
  {
    name: "Columbus Handyman Services",
    category: "handyman",
    rating: 4.8,
    reviewCount: 256,
    available: true,
    phone: "+1-614-555-0501",
    imageUrl: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=150&h=150&fit=crop",
    location: { lat: 39.9622, lng: -83.1179 },
    description: "General repairs and home improvements.",
    specialties: "repairs, assembly"
  },
  {
    name: "Fix-It-All Pros",
    category: "handyman",
    rating: 4.6,
    reviewCount: 178,
    available: true,
    phone: "+1-614-555-0502",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=150&h=150&fit=crop",
    location: { lat: 39.9502, lng: -83.1379 },
    description: "We fix everything.",
    specialties: "maintenance, fix"
  }
];

function assertEnv() {
  if (!Bun.env.TURSO_DATABASE_URL) {
    throw new Error('TURSO_DATABASE_URL is required to seed the database');
  }
}

function buildArgs(provider: any) {
  return [
    provider.name,
    provider.category,
    provider.description ?? 'Trusted local provider',
    provider.imageUrl ?? null,
    provider.imageUrl ?? null, // bannerUrl
    provider.rating ? Math.round(provider.rating * 10) : 0, // Convert 4.9 -> 49
    provider.reviewCount ?? 0,
    75, // hourlyRate
    0, // callOutFee
    'Columbus, OH 43228', // address
    provider.location.lat,
    provider.location.lng,
    provider.phone ?? null,
    provider.available ? 1 : 0,
    15, // availableIn
    provider.specialties ?? null,
    0, // ecoFriendly
    null, // website
    null, // hoursJson
    null, // servicesJson
    null // amenitiesJson
  ];
}

async function seed() {
  assertEnv();

  const client = createClient({ url: Bun.env.TURSO_DATABASE_URL!, authToken: Bun.env.TURSO_AUTH_TOKEN });

  console.log('🌱 Seeding Columbus providers...');

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

  for (const provider of mockProviders) {
    try {
      await client.execute({ sql: upsertSql, args: buildArgs(provider) });
      console.log(`  ✓ ${provider.name}`);
    } catch (error: any) {
      console.error(`  ✗ ${provider.name}:`, error?.message ?? error);
    }
  }

  console.log('✅ Done!');
  await client.close();
}

seed().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

