import { Tool } from "@mastra/core/tools";
import { z } from "zod";

/**
 * UpdateSettingsTool - Modifies user notification preferences.
 */
export const updateSettingsTool = new Tool({
  label: "Update Settings",
  schema: z.object({
    emailEnabled: z.boolean().optional(),
    pushEnabled: z.boolean().optional(),
    smsEnabled: z.boolean().optional(),
    promotions: z.boolean().optional(),
  }),
  description: "Updates user notification preferences like email, push, sms, or promotions.",
  executor: async ({ data }) => {
    // In a real implementation, this would update the database.
    // For this POC, we'll simulate a successful update.
    console.log("[Tool] Updating settings:", data);
    return {
      success: true,
      message: `Settings updated successfully: ${Object.entries(data)
        .map(([k, v]) => `${k}=${v}`)
        .join(", ")}`,
      updatedSettings: data,
    };
  },
});

