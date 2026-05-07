/**
 * Idempotent demo accounts for local / Atlas dev.
 * Run from web/: npm run seed:demo
 * Requires MONGODB_URI (e.g. via .env.local and --env-file).
 */
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const DEMO_PASSWORD = "DemoNaac2024!";

const USERS = [
  {
    email: "demo.hod@naac.local",
    name: "Demo HOD",
    role: "HOD",
    approvalStatus: "APPROVED",
    department: "Computer Science & Engineering",
    subjects: ["Department"],
  },
  {
    email: "demo.teacher@naac.local",
    name: "Demo Teacher",
    role: "TEACHER",
    approvalStatus: "APPROVED",
    department: "Computer Science & Engineering",
    subjects: ["Data Structures", "Database Systems"],
  },
];

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true, enum: ["TEACHER", "HOD"] },
    department: { type: String },
    subjects: [{ type: String }],
    approvalStatus: {
      type: String,
      required: true,
      enum: ["PENDING", "APPROVED"],
    },
    isActive: { type: Boolean, required: true, default: true },
  },
  { timestamps: true },
);

UserSchema.index({ email: 1 }, { unique: true });

async function main() {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    console.error("Missing MONGODB_URI. Use: npm run seed:demo (loads .env.local).");
    process.exit(1);
  }

  await mongoose.connect(uri);
  const User = mongoose.models.User || mongoose.model("User", UserSchema);

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  for (const u of USERS) {
    await User.findOneAndUpdate(
      { email: u.email },
      {
        $set: {
          name: u.name,
          email: u.email,
          passwordHash,
          role: u.role,
          approvalStatus: u.approvalStatus,
          department: u.department,
          subjects: u.subjects,
          isActive: true,
        },
      },
      { upsert: true },
    );
    console.log(`Upserted ${u.role}: ${u.email}`);
  }

  await mongoose.disconnect();

  console.log("\nDemo password (both accounts):", DEMO_PASSWORD);
  console.log("Sign in at http://localhost:3000/auth/sign-in\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
