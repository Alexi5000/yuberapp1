import type { ServiceAgent } from "@/mastra/schemas";
import { MILES_PER_DEGREE_LATITUDE } from "@/lib/constants";

/**
 * Zip Code 43228 Configuration (Columbus, Ohio - West Side)
 * Center coordinates for provider location calculations
 */
export const ZIP_43228_CONFIG = {
  zipCode: "43228",
  city: "Columbus",
  state: "OH",
  center: {
    lat: 39.9612,
    lng: -83.1259,
  },
  // Approximate bounds for the zip code area
  bounds: {
    north: 39.99,
    south: 39.93,
    east: -83.08,
    west: -83.18,
  },
};

/**
 * Mock service provider data for zip code 43228 (Columbus, Ohio).
 * 5 providers each for plumber, electrician, and locksmith categories.
 * All providers include location coordinates for map visualization.
 */
export const mockProviders: Record<string, ServiceAgent[]> = {
  plumber: [
    {
      id: "plumber-43228-001",
      name: "Columbus Plumbing Pros",
      category: "plumber",
      rating: 4.9,
      reviewCount: 287,
      distance: 0.8,
      available: true,
      yelpBusinessId: "columbus-plumbing-pros-43228",
      phone: "+1-614-555-0101",
      imageUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=150&h=150&fit=crop",
      location: { lat: 39.9652, lng: -83.1189 },
    },
    {
      id: "plumber-43228-002",
      name: "West Side Drain Masters",
      category: "plumber",
      rating: 4.7,
      reviewCount: 156,
      distance: 1.5,
      available: true,
      yelpBusinessId: "west-side-drain-masters-43228",
      phone: "+1-614-555-0102",
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=150&h=150&fit=crop",
      location: { lat: 39.9542, lng: -83.1359 },
    },
    {
      id: "plumber-43228-003",
      name: "Emergency Pipe Fixers",
      category: "plumber",
      rating: 4.8,
      reviewCount: 203,
      distance: 2.1,
      available: true,
      yelpBusinessId: "emergency-pipe-fixers-43228",
      phone: "+1-614-555-0103",
      imageUrl: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=150&h=150&fit=crop",
      location: { lat: 39.9712, lng: -83.1109 },
    },
    {
      id: "plumber-43228-004",
      name: "Buckeye Plumbing Co",
      category: "plumber",
      rating: 4.6,
      reviewCount: 134,
      distance: 3.2,
      available: true,
      yelpBusinessId: "buckeye-plumbing-co-43228",
      phone: "+1-614-555-0104",
      imageUrl: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=150&h=150&fit=crop",
      location: { lat: 39.9482, lng: -83.1459 },
    },
    {
      id: "plumber-43228-005",
      name: "24/7 Leak Stoppers",
      category: "plumber",
      rating: 4.5,
      reviewCount: 98,
      distance: 4.2,
      available: true,
      yelpBusinessId: "247-leak-stoppers-43228",
      phone: "+1-614-555-0105",
      imageUrl: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=150&h=150&fit=crop",
      location: { lat: 39.9782, lng: -83.0989 },
    },
  ],
  electrician: [
    {
      id: "electrician-43228-001",
      name: "Spark Electric Columbus",
      category: "electrician",
      rating: 4.9,
      reviewCount: 342,
      distance: 0.5,
      available: true,
      yelpBusinessId: "spark-electric-columbus-43228",
      phone: "+1-614-555-0201",
      imageUrl: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=150&h=150&fit=crop",
      location: { lat: 39.9592, lng: -83.1209 },
    },
    {
      id: "electrician-43228-002",
      name: "PowerUp Electrical Services",
      category: "electrician",
      rating: 4.8,
      reviewCount: 189,
      distance: 1.2,
      available: true,
      yelpBusinessId: "powerup-electrical-43228",
      phone: "+1-614-555-0202",
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=150&h=150&fit=crop",
      location: { lat: 39.9682, lng: -83.1329 },
    },
    {
      id: "electrician-43228-003",
      name: "Ohio Voltage Experts",
      category: "electrician",
      rating: 4.7,
      reviewCount: 267,
      distance: 2.0,
      available: true,
      yelpBusinessId: "ohio-voltage-experts-43228",
      phone: "+1-614-555-0203",
      imageUrl: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=150&h=150&fit=crop",
      location: { lat: 39.9512, lng: -83.1089 },
    },
    {
      id: "electrician-43228-004",
      name: "Circuit Masters LLC",
      category: "electrician",
      rating: 4.6,
      reviewCount: 145,
      distance: 2.8,
      available: true,
      yelpBusinessId: "circuit-masters-43228",
      phone: "+1-614-555-0204",
      imageUrl: "https://images.unsplash.com/photo-1555963153-11ff60182d08?w=150&h=150&fit=crop",
      location: { lat: 39.9442, lng: -83.1389 },
    },
    {
      id: "electrician-43228-005",
      name: "Rapid Response Electric",
      category: "electrician",
      rating: 4.5,
      reviewCount: 112,
      distance: 3.8,
      available: true,
      yelpBusinessId: "rapid-response-electric-43228",
      phone: "+1-614-555-0205",
      imageUrl: "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=150&h=150&fit=crop",
      location: { lat: 39.9762, lng: -83.1509 },
    },
  ],
  locksmith: [
    {
      id: "locksmith-43228-001",
      name: "Columbus Lock & Key",
      category: "locksmith",
      rating: 4.9,
      reviewCount: 198,
      distance: 0.6,
      available: true,
      yelpBusinessId: "columbus-lock-key-43228",
      phone: "+1-614-555-0301",
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=150&h=150&fit=crop",
      location: { lat: 39.9632, lng: -83.1229 },
    },
    {
      id: "locksmith-43228-002",
      name: "Quick Entry Locksmiths",
      category: "locksmith",
      rating: 4.8,
      reviewCount: 167,
      distance: 1.3,
      available: true,
      yelpBusinessId: "quick-entry-locksmiths-43228",
      phone: "+1-614-555-0302",
      imageUrl: "https://images.unsplash.com/photo-1582139329536-e7284fece509?w=150&h=150&fit=crop",
      location: { lat: 39.9572, lng: -83.1359 },
    },
    {
      id: "locksmith-43228-003",
      name: "24 Hour Key Solutions",
      category: "locksmith",
      rating: 4.7,
      reviewCount: 234,
      distance: 2.4,
      available: true,
      yelpBusinessId: "24hour-key-solutions-43228",
      phone: "+1-614-555-0303",
      imageUrl: "https://images.unsplash.com/photo-1558002038-1055907df827?w=150&h=150&fit=crop",
      location: { lat: 39.9722, lng: -83.1159 },
    },
    {
      id: "locksmith-43228-004",
      name: "West Columbus Locks",
      category: "locksmith",
      rating: 4.6,
      reviewCount: 89,
      distance: 3.1,
      available: true,
      yelpBusinessId: "west-columbus-locks-43228",
      phone: "+1-614-555-0304",
      imageUrl: "https://images.unsplash.com/photo-1505798577917-a65157d3320a?w=150&h=150&fit=crop",
      location: { lat: 39.9462, lng: -83.1429 },
    },
    {
      id: "locksmith-43228-005",
      name: "Secure Access Pro",
      category: "locksmith",
      rating: 4.5,
      reviewCount: 76,
      distance: 4.5,
      available: true,
      yelpBusinessId: "secure-access-pro-43228",
      phone: "+1-614-555-0305",
      imageUrl: "https://images.unsplash.com/photo-1558002038-bb4237b50b11?w=150&h=150&fit=crop",
      location: { lat: 39.9812, lng: -83.0959 },
    },
  ],
  // Keep existing categories for backward compatibility
  glass: [
    {
      id: "glass-43228-001",
      name: "Crystal Clear Glass Columbus",
      category: "glass",
      rating: 4.7,
      reviewCount: 123,
      distance: 1.8,
      available: true,
      yelpBusinessId: "crystal-clear-glass-43228",
      phone: "+1-614-555-0401",
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=150&h=150&fit=crop",
      location: { lat: 39.9552, lng: -83.1309 },
    },
    {
      id: "glass-43228-002",
      name: "Ohio Window Repair",
      category: "glass",
      rating: 4.5,
      reviewCount: 87,
      distance: 2.9,
      available: true,
      yelpBusinessId: "ohio-window-repair-43228",
      phone: "+1-614-555-0402",
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=150&h=150&fit=crop",
      location: { lat: 39.9702, lng: -83.1409 },
    },
  ],
  handyman: [
    {
      id: "handyman-43228-001",
      name: "Columbus Handyman Services",
      category: "handyman",
      rating: 4.8,
      reviewCount: 256,
      distance: 1.1,
      available: true,
      yelpBusinessId: "columbus-handyman-43228",
      phone: "+1-614-555-0501",
      imageUrl: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=150&h=150&fit=crop",
      location: { lat: 39.9622, lng: -83.1179 },
    },
    {
      id: "handyman-43228-002",
      name: "Fix-It-All Pros",
      category: "handyman",
      rating: 4.6,
      reviewCount: 178,
      distance: 2.3,
      available: true,
      yelpBusinessId: "fix-it-all-pros-43228",
      phone: "+1-614-555-0502",
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=150&h=150&fit=crop",
      location: { lat: 39.9502, lng: -83.1379 },
    },
  ],
};

/**
 * Get mock providers for a given category.
 * Returns handyman providers as fallback if category not found.
 */
export function getMockProviders(category: string): ServiceAgent[] {
  // logger isn't imported here, use console
  console.log(`[MockProviders] Getting providers for: "${category}"`);
  
  if (!category) return mockProviders.handyman;
  
  const normalized = category.toLowerCase();
  // Direct match
  if (mockProviders[normalized]) {
    console.log(`[MockProviders] Found direct match for "${normalized}"`);
    return mockProviders[normalized];
  }
  
  // Handle simple plural 's' (e.g. "plumbers" -> "plumber")
  if (normalized.endsWith("s")) {
    const singular = normalized.slice(0, -1);
    if (mockProviders[singular]) {
      console.log(`[MockProviders] Found singular match for "${singular}"`);
      return mockProviders[singular];
    }
  }
  
  console.log(`[MockProviders] No match, returning handyman`);
  return mockProviders.handyman;
}

/**
 * Get all providers within a specific zip code area.
 * Currently returns all mock providers as they're all in 43228.
 */
export function getProvidersByZipCode(zipCode: string): ServiceAgent[] {
  if (zipCode === "43228") {
    return Object.values(mockProviders).flat();
  }
  // Return empty array for other zip codes (or could return subset)
  return [];
}

/**
 * Get providers by category within a radius of given coordinates.
 * @param category - Service category (plumber, electrician, locksmith)
 * @param lat - Center latitude
 * @param lng - Center longitude
 * @param radiusMiles - Search radius in miles (default 5)
 */
export function getProvidersByLocation(
  category: string,
  lat: number,
  lng: number,
  radiusMiles: number = 5
): ServiceAgent[] {
  const providers = getMockProviders(category);
  
  // Filter by distance (approximate - 1 degree ≈ MILES_PER_DEGREE_LATITUDE miles)
  const degreeRadius = radiusMiles / MILES_PER_DEGREE_LATITUDE;
  
  return providers.filter((provider) => {
    if (!provider.location) return true; // Include providers without location
    
    const latDiff = Math.abs(provider.location.lat - lat);
    const lngDiff = Math.abs(provider.location.lng - lng);
    
    return latDiff <= degreeRadius && lngDiff <= degreeRadius;
  });
}

/**
 * Default user location for 43228 zip code testing
 */
export const DEFAULT_USER_LOCATION = {
  lat: 39.9612,
  lng: -83.1259,
  zipCode: "43228",
  address: "Columbus, OH 43228",
};
