/**
 * YUBER V2 Brand Kit
 * ===================
 * Central source of truth for all brand-related design tokens.
 */

// ============================================================================
// SCREEN IDS
// ============================================================================

export const SCREENS = {
  // Onboarding
  S01_SPLASH: 'S01',
  S02_VALUE_CAROUSEL: 'S02',
  S03_PERMISSIONS: 'S03',
  S04_SIGNUP: 'S04',
  // Conversation
  S05_CONVERSATION_HUB: 'S05',
  S06_CONVERSATION_PROGRESS: 'S06',
  S07_AI_SEARCH_RADAR: 'S07',
  S08_AI_CLARIFICATION: 'S08',
  S09_AI_RECOMMENDATION: 'S09',
  S10_MULTIPLE_OPTIONS: 'S10',
  S11_PROVIDER_DETAILS: 'S11',
  S12_CONVERSATION_HISTORY: 'S12',
  // Booking
  S13_BOOKING_CONFIRM: 'S13',
  S14_ADD_PAYMENT: 'S14',
  S15_PAYMENT_SUCCESS: 'S15',
  S16_DISPATCH_PROGRESS: 'S16',
  S17_LIVE_TRACKING: 'S17',
  S18_JOB_IN_PROGRESS: 'S18',
  S19_JOB_COMPLETE: 'S19',
  S20_PROBLEM_RESOLUTION: 'S20',
  // Retention
  S21_RATE_REVIEW: 'S21',
  S22_SHARE_EXPERIENCE: 'S22',
  S23_REFERRAL_REWARDS: 'S23',
  // Account & Settings
  S24_FAVORITE_PROVIDERS: 'S24',
  S25_REBOOKING_PROMPT: 'S25',
  S26_PROFILE_SETTINGS: 'S26',
  S27_BOOKING_HISTORY: 'S27',
  S28_MANAGE_PAYMENTS: 'S28',
  S29_NOTIFICATION_SETTINGS: 'S29',
  S30_HELP_SUPPORT: 'S30',
} as const

export type ScreenId = typeof SCREENS[keyof typeof SCREENS]

