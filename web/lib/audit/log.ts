import { connectToDb } from "@/lib/db/mongoose";
import type { AuditAction } from "@/lib/audit/actions";
import { ActivityLog } from "@/lib/models/ActivityLog";

export type { AuditAction } from "@/lib/audit/actions";

export async function logActivity(input: {
  actorId: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await connectToDb();
    await ActivityLog.create({
      actorId: input.actorId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      metadata: input.metadata ?? {},
    });
  } catch {
    // Never fail main request on audit failure
  }
}

export async function touchUserActivity(userId: string) {
  try {
    await connectToDb();
    const { User } = await import("@/lib/models/User");
    await User.updateOne({ _id: userId }, { $set: { lastActivityAt: new Date() } });
  } catch {
    // ignore
  }
}
