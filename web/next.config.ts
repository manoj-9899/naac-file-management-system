import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // When multiple lockfiles exist (e.g. parent folder), pin Turbopack to this app.
  turbopack: {
    root: path.join(process.cwd()),
  },
  serverExternalPackages: [
    "@react-pdf/renderer",
    "bcrypt",
    "exceljs",
    "mongoose",
  ],
};

export default nextConfig;
