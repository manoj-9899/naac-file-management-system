import { connectToDb } from "@/lib/db/mongoose";
import { User } from "@/lib/models/User";
import { SubCriterionSubmission } from "@/lib/models/SubCriterionSubmission";
import { EvidenceFile } from "@/lib/models/EvidenceFile";
import { SubCriterionVerification } from "@/lib/models/SubCriterionVerification";

export async function collectTeacherData(teacherId: string) {
  await connectToDb();
  const teacher = await User.findOne({ _id: teacherId, role: "TEACHER" })
    .select({ name: 1, email: 1, department: 1, subjects: 1 })
    .lean();
  if (!teacher) return null;

  const [submissions, files, verifications] = await Promise.all([
    SubCriterionSubmission.find({ userId: teacherId }).lean(),
    EvidenceFile.find({ userId: teacherId }).lean(),
    SubCriterionVerification.find({ teacherId }).lean(),
  ]);

  return { teacher, submissions, files, verifications };
}
