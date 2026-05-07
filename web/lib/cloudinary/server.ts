import { v2 as cloudinary } from "cloudinary";

function trimCred(v: string | undefined): string {
  return (v ?? "").trim();
}

export function configureCloudinary() {
  const cloud_name = trimCred(process.env.CLOUDINARY_CLOUD_NAME);
  const api_key = trimCred(process.env.CLOUDINARY_API_KEY);
  const api_secret = trimCred(process.env.CLOUDINARY_API_SECRET);
  if (!cloud_name || !api_key || !api_secret) {
    throw new Error("Missing Cloudinary env vars (check .env.local for typos or spaces)");
  }
  const signature_algorithm =
    trimCred(process.env.CLOUDINARY_SIGNATURE_ALGORITHM) === "sha256"
      ? "sha256"
      : ("sha1" as const);
  cloudinary.config({
    cloud_name,
    api_key,
    api_secret,
    secure: true,
    signature_algorithm,
  });
  return cloudinary;
}

export function getCloudinary() {
  return configureCloudinary();
}
