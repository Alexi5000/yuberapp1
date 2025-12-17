
import { createClient } from "@libsql/client";
import OpenAI from "openai";

async function verifyKeys() {
  console.log("🔑 Verifying API Keys...");
  let successCount = 0;
  const totalChecks = 3;

  // 1. OpenAI Verification
  console.log("\n🤖 Checking OpenAI API...");
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: "Ping" }],
      max_tokens: 5,
    });
    console.log("✅ OpenAI Connected. Response:", response.choices[0]?.message?.content);
    successCount++;
  } catch (error: any) {
    console.error("❌ OpenAI Failed:", error.message);
  }

  // 2. Turso (Database) Verification
  console.log("\n💾 Checking Turso Database...");
  try {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;
    
    if (!url || !authToken) throw new Error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN");

    const db = createClient({ url, authToken });
    const result = await db.execute("SELECT 1 as val");
    console.log("✅ Turso Connected. Result:", result.rows[0]);
    successCount++;
  } catch (error: any) {
    console.error("❌ Turso Failed:", error.message);
  }

  // 3. Yelp API Verification
  console.log("\n🍕 Checking Yelp API...");
  try {
    const apiKey = process.env.YELP_API_KEY;
    if (!apiKey) throw new Error("Missing YELP_API_KEY");

    const res = await fetch("https://api.yelp.com/v3/businesses/search?term=coffee&location=San+Francisco&limit=1", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        accept: "application/json",
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errText}`);
    }

    const data = await res.json();
    console.log("✅ Yelp Connected. Found:", data.businesses?.[0]?.name || "No business found (but auth worked)");
    successCount++;
  } catch (error: any) {
    console.error("❌ Yelp Failed:", error.message);
  }

  // Summary
  console.log("\n--------------------------------");
  if (successCount === totalChecks) {
    console.log("🎉 All systems operational! (3/3 passed)");
    process.exit(0);
  } else {
    console.error(`⚠️  Verification incomplete. Only ${successCount}/${totalChecks} passed.`);
    process.exit(1);
  }
}

verifyKeys();

