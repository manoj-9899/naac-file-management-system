/**
 * Real Chromium (Playwright): open sign-in, submit demo teacher credentials, assert redirect.
 * Requires: npm run dev on BASE_URL, npm run seed:demo, playwright browsers (npx playwright install chromium).
 *
 *   node scripts/browser-verify-teacher.mjs
 *   BASE_URL=http://127.0.0.1:3000 node scripts/browser-verify-teacher.mjs
 */
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const email = "demo.teacher@naac.local";
const password = "DemoNaac2024!";

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

try {
  await page.goto(`${BASE}/auth/sign-in`, { waitUntil: "networkidle", timeout: 60_000 });
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.locator('button[type="submit"]').click();

  await page.waitForURL(
    (url) =>
      !url.pathname.includes("/auth/sign-in") &&
      (url.pathname.startsWith("/teacher") || url.pathname.startsWith("/onboarding")),
    { timeout: 30_000 },
  );

  const sessionRes = await page.request.get(`${BASE}/api/auth/session`);
  const session = await sessionRes.json();
  if (!session?.user || session.user.role !== "TEACHER") {
    throw new Error(`Unexpected session: ${JSON.stringify(session)}`);
  }

  console.log("OK: Playwright (Chromium) teacher login succeeded.");
  console.log("Final URL:", page.url());
  console.log("Session:", {
    email: session.user.email,
    role: session.user.role,
    approvalStatus: session.user.approvalStatus,
  });
} catch (e) {
  const shotPath = path.join(__dirname, "teacher-login-failure.png");
  await page.screenshot({ path: shotPath, fullPage: true }).catch(() => {});
  console.error("Browser verify failed:", e?.message ?? e);
  console.error("Screenshot:", shotPath);
  process.exitCode = 1;
} finally {
  await browser.close();
}
