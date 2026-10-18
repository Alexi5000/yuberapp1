import assert from "node:assert/strict";
import { SignJWT } from "jose";

for (const name of Object.keys(process.env)) {
  if (!["PATH", "HOME", "TMPDIR"].includes(name)) delete process.env[name];
}
process.env.JWT_SECRET = "offline-session-regression-secret-only";
process.env.NODE_ENV = "test";
globalThis.fetch = async () => { throw new Error("Network disabled in session regression"); };

const { localAuth } = await import("../server/_core/localAuth");
const token = await localAuth.createSessionToken("offline-user", { name: "Offline", expiresInMs: 60000 });
assert.deepEqual(await localAuth.verifySession(token), { openId: "offline-user", appId: "yuber-local", name: "Offline" });
assert.equal(await localAuth.verifySession(undefined), null);
const parts = token.split(".");
parts[2] = (parts[2][0] === "A" ? "B" : "A") + parts[2].slice(1);
assert.equal(await localAuth.verifySession(parts.join(".")), null);
const expired = await localAuth.createSessionToken("offline-user", { expiresInMs: -60000 });
assert.equal(await localAuth.verifySession(expired), null);
const wrongKey = await new SignJWT({ openId: "offline-user" }).setProtectedHeader({ alg: "HS256" }).sign(new TextEncoder().encode("wrong-offline-key"));
assert.equal(await localAuth.verifySession(wrongKey), null);
const wrongAlgorithm = await new SignJWT({ openId: "offline-user" }).setProtectedHeader({ alg: "HS384" }).sign(new TextEncoder().encode(process.env.JWT_SECRET));
assert.equal(await localAuth.verifySession(wrongAlgorithm), null);
const missingIdentity = await new SignJWT({ name: "Offline" }).setProtectedHeader({ alg: "HS256" }).sign(new TextEncoder().encode(process.env.JWT_SECRET));
assert.equal(await localAuth.verifySession(missingIdentity), null);
console.log("PASS: session round-trip, missing token, tampering, expiry, wrong key, algorithm restriction, missing identity");
