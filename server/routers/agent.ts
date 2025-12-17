// file: server/routers/agent.ts
// description: TRPC router for AI Agent interactions (Help & Settings)
// reference: server/_core/trpc.ts

import { router, publicProcedure } from '../_core/trpc';
import { z } from 'zod';

const history_schema = z.array(z.object({ role: z.enum(['user', 'assistant', 'system']), content: z.string() })).optional();

function build_help_response(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes('refund')) return 'For refunds, open the booking in History and select “Problem Resolution” to submit a request.';
  if (normalized.includes('cancel')) return 'To cancel a booking, open it from History and choose “Cancel”. If it is already in progress, use “Problem Resolution”.';
  if (normalized.includes('payment')) return 'For payment issues, go to Profile → Payment Methods and confirm your default card. If a charge looks wrong, use “Problem Resolution” on the booking.';
  if (normalized.includes('account') || normalized.includes('login')) return 'If you are having trouble signing in, try logging out and back in. If it persists, tell me what error you see and on which screen.';

  return 'Tell me what you need help with (billing, bookings, provider issues, or account/login) and I will guide you to the right place in the app.';
}

function build_settings_response(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes('promotion') && (normalized.includes('off') || normalized.includes('disable') || normalized.includes('stop'))) {
    return 'Done — promotions have been turned off.';
  }
  if (normalized.includes('promotion') && (normalized.includes('on') || normalized.includes('enable') || normalized.includes('start'))) {
    return 'Done — promotions have been turned on.';
  }

  return 'Done — your notification settings request was received. If you tell me which toggle (booking updates, provider messages, promotions, reminders) and whether on/off, I can confirm the exact change.';
}

export const agentRouter = router({
  chatHelp: publicProcedure
    .input(z.object({
      message: z.string(),
      history: history_schema
    }))
    .mutation(async ({ input }) => {
      return { text: build_help_response(input.message), toolCalls: [] };
    }),

  chatSettings: publicProcedure
    .input(z.object({
      message: z.string(),
      history: history_schema
    }))
    .mutation(async ({ input }) => {
      return { text: build_settings_response(input.message), toolCalls: [] };
    }),
});

