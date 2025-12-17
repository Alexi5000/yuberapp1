import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";
import { updateSettingsTool } from "../tools/updateSettingsTool";

/**
 * SettingsAgent - Handles user preference updates.
 *
 * This agent interprets natural language requests to change app settings
 * and applies them using the updateSettingsTool.
 *
 * Requirements: Screen 29 (Notification Settings)
 */
export const settingsAgent = new Agent({
  name: "SettingsAgent",
  instructions: `You are a settings assistant for Yuber.
  
Your goal is to help users manage their notification preferences.

You can update:
- Email notifications (emailEnabled)
- Push notifications (pushEnabled)
- SMS/Text messages (smsEnabled)
- Promotional offers (promotions)

Guidelines:
- If a user says "Stop emailing me", set emailEnabled to false.
- If a user says "I want text alerts", set smsEnabled to true.
- Confirm changes after applying them.
- If the request is ambiguous, ask for clarification.
- Be concise and helpful.`,
  model: openai("gpt-4o"),
  tools: {
    updateSettingsTool,
  },
});

