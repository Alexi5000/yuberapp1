// file: server/_core/yelp_rest_search.ts
// description: Direct Yelp REST business search using coordinates and term
// reference: server/_core/env.ts

import { ENV } from './env';

const YELP_API_BASE = 'https://api.yelp.com/v3';

type YelpLocation = {
  address1?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  display_address?: string[] | null;
};

export type YelpRestBusiness = {
  id: string;
  name: string;
  rating: number | null;
  review_count: number | null;
  distance: number | null;
  image_url: string | null;
  url?: string | null;
  coordinates?: { latitude?: number | null; longitude?: number | null } | null;
  categories: { title: string }[] | null;
  location: YelpLocation | null;
  phone: string | null;
  display_phone?: string | null;
  transactions?: string[] | null;
};

export type YelpRestBusinessDetails = YelpRestBusiness & {
  photos?: string[] | null;
  hours?: { is_open_now?: boolean | null, open?: { start?: string, end?: string, day?: number }[] }[] | null;
};

export type YelpRestReview = {
  id: string;
  rating: number;
  text: string;
  url?: string | null;
  time_created: string;
  user?: { name?: string | null };
};

async function callYelpApi<T>(path: string, searchParams?: Record<string, string | undefined>): Promise<T> {
  if (!ENV.yelpApiKey) {
    throw new Error('YELP_API_KEY is not configured');
  }

  const url = new URL(path.startsWith('http') ? path : `${YELP_API_BASE}/${path}`);
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, value);
      }
    });
  }

  const res = await fetch(url.toString(), {
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${ENV.yelpApiKey}`
    }
  });

  const text = await res.text();
  if (!res.ok) {
    console.error(`[Yelp API Error] ${res.status}: ${text}`);
    throw new Error(`Yelp API request failed (${res.status}): ${text || res.statusText}`);
  }

  try {
    return JSON.parse(text) as T;
  } catch (e) {
    console.error(`[Yelp API Error] Invalid JSON response: ${text.slice(0, 100)}...`);
    throw new Error('Yelp API returned invalid JSON');
  }
}

export async function searchYelpBusinesses(
  term: string,
  coords: { latitude: number, longitude: number },
  category?: string
): Promise<YelpRestBusiness[]> {
  const data = await callYelpApi<{ businesses?: YelpRestBusiness[] }>('businesses/search', {
    term,
    categories: category,
    latitude: String(coords.latitude),
    longitude: String(coords.longitude),
    limit: '10',
    sort_by: 'best_match'
  });

  return data.businesses ?? [];
}

export async function getYelpBusinessDetails(id: string): Promise<YelpRestBusinessDetails> {
  return callYelpApi<YelpRestBusinessDetails>(`businesses/${id}`);
}

export async function getYelpBusinessReviews(id: string): Promise<YelpRestReview[]> {
  const data = await callYelpApi<{ reviews?: YelpRestReview[] }>(`businesses/${id}/reviews`);
  return data.reviews ?? [];
}
