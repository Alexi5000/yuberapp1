# `client/src/components/screens/`

Screen components grouped by product area. These map to `SCREENS` in `shared/lib/brand.ts` and are rendered from `client/src/App.tsx`.

## Groups

- `onboarding/`: early setup and signup flow
- `conversation/`: chat and AI search/recommendation flow
- `booking/`: booking confirmation, payment, tracking, and issue resolution
- `account/`: profile, settings, notification and support screens
- `retention/`: rating/review, sharing, referrals, and rebooking

# `client/src/components/screens/`

Primary “phone UI” screens, grouped by product flow.

## Flows

- `onboarding/`: splash, value carousel, permissions, signup
- `conversation/`: conversation hub, search radar, recommendation, provider details
- `booking/`: booking confirm, payment, dispatch/tracking, completion, problem resolution
- `retention/`: rating, share, referral/rewards, rebooking prompt
- `account/`: profile/settings, notifications, help/support

## Notes

These screens are typically rendered by `client/src/App.tsx` based on the current screen ID from `shared/lib/brand.ts`.


