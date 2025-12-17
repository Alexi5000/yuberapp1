import type { ScreenId } from '@shared/lib/brand';

// ============================================================================
// MESSAGE TYPES
// ============================================================================

export type MessageRole = 'user' | 'ai' | 'system';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  quickReplies?: string[];
  recommendation?: Provider;
  isTyping?: boolean;
}

// ============================================================================
// PROVIDER TYPES
// ============================================================================

export interface Provider {
  id: string;
  name: string;
  photo: string;
  rating: number;
  reviewCount: number;
  distance: number;
  eta: number;
  hourlyRate: number;
  callOutFee: number;
  specialties: string[];
  available: boolean;
  whyChosen: string[];
  yelpId?: string | null; // Yelp business ID for fetching real data
}

// ============================================================================
// BOOKING TYPES
// ============================================================================

export interface BookingDetails {
  id: string;
  provider: Provider;
  serviceType: string;
  status: BookingStatus;
  scheduledTime?: Date;
  estimatedCost: number;
  actualCost?: number;
  duration?: number;
  createdAt: Date;
}

export type BookingStatus = 
  | 'pending'
  | 'confirmed'
  | 'provider_en_route'
  | 'provider_arrived'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

// ============================================================================
// APP STATE TYPES
// ============================================================================

export interface AppState {
  screen: ScreenId;
  previousScreen?: ScreenId;
  conversationHistory: Message[];
  currentConversation: Message[];
  selectedProvider: Provider | null;
  currentBooking: BookingDetails | null;
  user: User | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  savedPaymentMethods: PaymentMethod[];
  favoriteProviders: string[];
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'apple_pay' | 'google_pay';
  last4?: string;
  brand?: string;
  isDefault: boolean;
}

// ============================================================================
// MOCK DATA - REMOVED: All data must come from API
// ============================================================================

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

