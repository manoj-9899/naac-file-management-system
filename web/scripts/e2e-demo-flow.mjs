/**
 * Self-contained smoke test: in-memory MongoDB + Next dev server + HTTP flow.
 * Run: npm run demo:e2e
 * Uses port 3010 (change PORT if needed).
 */
import { spawn } from "node:child_process";
import { once } from "node:events";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { MongoMemoryServer } from "mongodb-memory-server";

const PORT = process.env.E2E_PORT ?? "3010";
const BASE = `http://127.0.0.1:${PORT}`;
const WEB_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const E2E_ENV = {
  MONGODB_URI: "",
  NEXTAUTH_SECRET: "e2e-demo-secret-do-not-use-in-prod-32chars!!",
  NEXTAUTH_URL: BASE,
  HOD_INVITE_CODE: "demo-hod-invite",
  // Avoid Cloudinary errors if any code path touches it during e2e
  CLOUDINARY_CLOUD_NAME: "e2e",
  CLOUDINARY_API_KEY: "1",
  CLOUDINARY_API_SECRET: "e2e",
};

function cookieJar() {
  /** @type {Map<string, string>} */
  const jar = new Map();
  return {
    store(res) {
      const list =
        typeof res.headers.getSetCookie === "function"
          ? res.headers.getSetCookie()
          : [];
      for (const c of list) {
        const pair = c.split(";")[0]?.trim();
        if (!pair.includes("=")) continue;
        const name = pair.split("=")[0];
        jar.set(name, pair);
      }
    },
    header() {
      return [...jar.values()].join("; ");
    },
  };
}

async function fetchJson(url, opts = {}, jar) {
  const headers = { ...(opts.headers || {}) };
  if (jar) {
    const h = jar.header();
    if (h) headers.cookie = h;
  }
  const res = await fetch(url, { ...opts, headers });
  if (jar) jar.store(res);
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { _raw: text };
  }
  return { res, json };
}

async function waitForHttpOk(url, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const r = await fetch(url);
      if (r.ok) return;
    } catch {
      // ignore
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  throw new Error(`Timeout waiting for ${url}`);
}

async function signInCredentials(jar, email, password) {
  let { res, json } = await fetchJson(`${BASE}/api/auth/csrf`, { method: "GET" }, jar);
  if (!res.ok) throw new Error(`CSRF failed: ${res.status}`);
  const csrfToken = json?.csrfToken;
  if (!csrfToken) throw new Error("No csrfToken");

  const body = new URLSearchParams({
    csrfToken,
    email,
    password,
    callbackUrl: BASE,
    json: "true",
  });

  ({ res, json } = await fetchJson(
    `${BASE}/api/auth/callback/credentials`,
    {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    },
    jar,
  ));

  if (!res.ok && res.status !== 302) {
    throw new Error(`Sign-in failed: ${res.status} ${JSON.stringify(json)}`);
  }
}

async function main() {
  console.log("Starting MongoMemoryServer…");
  const mongod = await MongoMemoryServer.create();
  E2E_ENV.MONGODB_URI = mongod.getUri();

  const env = { ...process.env, ...E2E_ENV };

  console.log(`Starting Next.js on ${BASE}…`);
  const isWin = process.platform === "win32";
  // Avoid spawn EINVAL on Windows: npm.cmd is a batch file; run Next CLI with node directly.
  const nextCli = path.join(WEB_ROOT, "node_modules", "next", "dist", "bin", "next");
  const child = spawn(process.execPath, [nextCli, "dev", "-p", PORT], {
    cwd: WEB_ROOT,
    env,
    stdio: ["ignore", "pipe", "pipe"],
  });

  let stderr = "";
  child.stderr?.on("data", (d) => {
    stderr += d.toString();
  });

  try {
    await waitForHttpOk(`${BASE}/`, 180_000);

    console.log("— Register HOD —");
    const hodJar = cookieJar();
    let { res, json } = await fetchJson(
      `${BASE}/api/auth/register`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: "Demo HOD",
          email: "hod@demo.test",
          password: "DemoPass123456",
          role: "HOD",
          hodInviteCode: E2E_ENV.HOD_INVITE_CODE,
        }),
      },
      hodJar,
    );
    if (!res.ok) throw new Error(`HOD register failed: ${res.status} ${JSON.stringify(json)}`);

    await signInCredentials(hodJar, "hod@demo.test", "DemoPass123456");
    ({ res, json } = await fetchJson(`${BASE}/api/auth/session`, { method: "GET" }, hodJar));
    if (!json?.user || json.user.role !== "HOD") {
      throw new Error(`HOD session invalid: ${JSON.stringify(json)}`);
    }
    console.log("OK: HOD session");

    console.log("— Register Teacher —");
    const teacherJar = cookieJar();
    ({ res, json } = await fetchJson(
      `${BASE}/api/auth/register`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: "Demo Teacher",
          email: "teacher@demo.test",
          password: "DemoPass123456",
          role: "TEACHER",
        }),
      },
      teacherJar,
    ));
    if (!res.ok) throw new Error(`Teacher register failed: ${res.status} ${JSON.stringify(json)}`);

    await signInCredentials(teacherJar, "teacher@demo.test", "DemoPass123456");

    console.log("— Teacher PATCH profile (onboarding; allowed while pending) —");
    ({ res, json } = await fetchJson(
      `${BASE}/api/me/profile`,
      {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          department: "Computer Engineering",
          subjects: ["DBMS", "DSA"],
        }),
      },
      teacherJar,
    ));
    if (!res.ok) throw new Error(`Profile update failed: ${res.status} ${JSON.stringify(json)}`);

    await signInCredentials(teacherJar, "teacher@demo.test", "DemoPass123456");

    console.log("— HOD list teachers + approve (before teacher-only APIs) —");
    ({ res, json } = await fetchJson(`${BASE}/api/hod/teachers`, { method: "GET" }, hodJar));
    if (!res.ok) throw new Error(`HOD teachers list failed: ${res.status} ${JSON.stringify(json)}`);
    const teacherRow = json.teachers?.find((t) => t.email === "teacher@demo.test");
    if (!teacherRow) throw new Error("Teacher not found in HOD list");
    const teacherId = teacherRow.id;

    ({ res, json } = await fetchJson(
      `${BASE}/api/hod/teachers/${encodeURIComponent(teacherId)}/approve`,
      { method: "POST" },
      hodJar,
    ));
    if (!res.ok) throw new Error(`Approve failed: ${res.status} ${JSON.stringify(json)}`);
    console.log("OK: Teacher approved");

    console.log("— Teacher submission PUT / GET (requires APPROVED) —");
    await signInCredentials(teacherJar, "teacher@demo.test", "DemoPass123456");
    ({ res, json } = await fetchJson(
      `${BASE}/api/teacher/submissions/C1.1`,
      {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          items: [
            {
              programmeName: "B.E. Computer Engineering",
              academicYear: "2020-21",
              courseType: "Core",
              newProgrammeIntroduced: "No",
              bosMemberNameDate: "Dr. Demo — 2020-01-15",
            },
          ],
        }),
      },
      teacherJar,
    ));
    if (!res.ok) throw new Error(`Submission save failed: ${res.status} ${JSON.stringify(json)}`);

    ({ res, json } = await fetchJson(
      `${BASE}/api/teacher/submissions/C1.1`,
      { method: "GET" },
      teacherJar,
    ));
    if (!res.ok || !json?.ok) throw new Error(`Submission get failed: ${res.status}`);
    console.log("OK: Submission round-trip");

    console.log("— HOD snapshot —");
    ({ res, json } = await fetchJson(
      `${BASE}/api/hod/teachers/${encodeURIComponent(teacherId)}/snapshot`,
      { method: "GET" },
      hodJar,
    ));
    if (!res.ok || !json?.ok) throw new Error(`Snapshot failed: ${res.status}`);
    console.log("OK: HOD snapshot");

    console.log("\nAll e2e checks passed.");
  } finally {
    console.log("Stopping Next.js dev server…");
    if (isWin) {
      try {
        spawn("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore" });
      } catch {
        child.kill("SIGTERM");
      }
    } else {
      child.kill("SIGTERM");
    }
    await Promise.race([
      once(child, "close"),
      new Promise((r) => setTimeout(r, 5000)),
    ]);
    console.log("Stopping MongoMemoryServer…");
    await mongod.stop();
    if (stderr.includes("Error")) {
      console.log("(stderr tail may contain benign compile noise)\n");
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
