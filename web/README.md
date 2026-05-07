# NAAC File Management System (Web)

Next.js (App Router) portal for departmental NAAC documentation: **7 criteria**, **sub-criterion forms**, **Cloudinary evidence**, **teacher PDF/Excel exports**, and **HOD consolidated Excel** + verification, notifications, audit log, and teacher approvals.

## Prerequisites

- Node.js 20+
- MongoDB (Atlas recommended)
- Cloudinary account
- `openssl` (optional) to generate `NEXTAUTH_SECRET`

## Environment variables

Copy `.env.example` → `.env.local` and fill in:

| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` | Mongo connection string |
| `NEXTAUTH_SECRET` | Random secret (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | e.g. `http://localhost:3000` |
| `CLOUDINARY_*` | Cloud name, API key, API secret |
| `HOD_INVITE_CODE` | Shared secret required to register a **HOD** account |
| `NEXT_PUBLIC_APP_URL` | Optional public URL for links |

## Run locally

```bash
cd web
npm install
npm run dev
```

Open `http://localhost:3000`.

## Demo accounts

Create or refresh demo users in MongoDB (requires `MONGODB_URI` in `.env.local`):

```bash
npm run seed:demo
```

**Log in (demo or existing users):** open **`/auth/sign-in`** and use **email + password only**. No invite code is asked there.

The **HOD invite code** appears only on **`/auth/register`** when you choose **HOD** and create a **brand-new** account — it must match `HOD_INVITE_CODE` in `.env.local`. Demo HOD is already in the database; use **Sign in**, not Register.

| Role | Email (username) | Password |
|------|------------------|----------|
| HOD | `demo.hod@naac.local` | `DemoNaac2024!` |
| Teacher | `demo.teacher@naac.local` | `DemoNaac2024!` |

Both accounts are pre-approved and ready for teacher/HOD workspaces.

If sign-in says the credentials are wrong but `npm run seed:demo` succeeded: **stop and restart** `npm run dev` (Next.js must load native `bcrypt` from `serverExternalPackages`, not a broken bundle). Also set `NEXTAUTH_URL` to the **exact** origin you use in the browser (`http://localhost:3000` vs `http://127.0.0.1:3000`).

## Roles & flows

1. **Register HOD** — use role *HOD* and the `HOD_INVITE_CODE`.
2. **Register teachers** — teachers start as **`PENDING`** until a HOD approves them from **HOD → Teachers**.
3. **Teachers** — complete **Onboarding** (department + subjects), then fill **criterion/sub-criterion** forms and upload evidence (PDF / DOCX / JPG / PNG).
4. **HOD** — verify each sub-criterion (**Verified / Needs revision**), send **reminders**, view **audit log**, and download the **consolidated Excel** (Summary + C1–C7 + document index).

## Key routes

- Teacher: `/teacher`, `/teacher/criteria/C1` … `C7`
- HOD: `/hod`, `/hod/teachers`, `/hod/audit`
- Exports: `/api/export/teacher/pdf`, `/api/export/teacher/excel`, `/api/hod/export/consolidated`

## Database schema (MongoDB / Mongoose)

Models live in `lib/models/`:

- `User` — auth, profile, `approvalStatus` (`PENDING` \| `APPROVED`), `isActive`
- `SubCriterionSubmission` — `{ userId, criterionId, subCriterionId, items }`
- `EvidenceFile` — Cloudinary `publicId`, MIME, upload status, linkage to sub-criterion
- `SubCriterionVerification` — HOD status per teacher + sub-criterion
- `Notification` — in-app reminders
- `ActivityLog` — audit trail

## Demo artifacts

Place sample exports under `samples/exports/` for judging (see folder README).

## Scripts

```bash
npm run dev
npm run build
npm start
npm run lint
npm run seed:demo
npm run verify:browser   # Playwright Chromium: demo teacher sign-in smoke test (needs dev server)
```

## Deploy notes (e.g. Vercel)

- Set the same env vars in the hosting dashboard.
- Ensure `NEXTAUTH_URL` matches the production domain.
- MongoDB Atlas: allow access from Vercel egress IPs or `0.0.0.0/0` for hackathons (not production best practice).
