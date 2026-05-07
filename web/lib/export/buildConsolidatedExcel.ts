import ExcelJS from "exceljs";
import { connectToDb } from "@/lib/db/mongoose";
import { User } from "@/lib/models/User";
import { NAAC_CRITERIA, NAAC_SUB_CRITERIA } from "@/lib/naac";
import { getFormDef } from "@/lib/forms/definitions";
import { overallCompletionPercent } from "@/lib/forms/progress";
import { SubCriterionSubmission } from "@/lib/models/SubCriterionSubmission";
import { EvidenceFile } from "@/lib/models/EvidenceFile";
import { SubCriterionVerification } from "@/lib/models/SubCriterionVerification";

function formatValue(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (Array.isArray(v)) return v.join(", ");
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

export async function buildConsolidatedExcelBuffer(): Promise<Buffer> {
  await connectToDb();
  const teachers = await User.find({ role: "TEACHER" })
    .select({ name: 1, email: 1, department: 1, approvalStatus: 1, isActive: 1 })
    .lean();
  const ids = teachers.map((t) => String(t._id));

  const [submissions, files, verifications] = await Promise.all([
    SubCriterionSubmission.find({ userId: { $in: ids } }).lean(),
    EvidenceFile.find({ userId: { $in: ids } }).lean(),
    SubCriterionVerification.find({ teacherId: { $in: ids } }).lean(),
  ]);

  const subsByUser = new Map<string, typeof submissions>();
  const filesByUser = new Map<string, typeof files>();
  const verByUserSub = new Map<string, (typeof verifications)[number]>();
  for (const s of submissions) {
    const k = String(s.userId);
    const arr = subsByUser.get(k) ?? [];
    arr.push(s);
    subsByUser.set(k, arr);
  }
  for (const f of files) {
    const k = String(f.userId);
    const arr = filesByUser.get(k) ?? [];
    arr.push(f);
    filesByUser.set(k, arr);
  }
  for (const v of verifications) {
    verByUserSub.set(`${String(v.teacherId)}:${v.subCriterionId}`, v);
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "NAAC File Management — HOD consolidated";

  const summary = workbook.addWorksheet("Summary");
  summary.addRow([
    "Teacher",
    "Email",
    "Department",
    "Active",
    "Approval",
    "Overall %",
  ]);
  for (const t of teachers) {
    const id = String(t._id);
    const s = subsByUser.get(id) ?? [];
    const fl = filesByUser.get(id) ?? [];
    summary.addRow([
      t.name,
      t.email,
      t.department ?? "",
      t.isActive ? "Yes" : "No",
      t.approvalStatus ?? "APPROVED",
      overallCompletionPercent({ submissions: s, files: fl }),
    ]);
  }

  for (const c of NAAC_CRITERIA) {
    const sheet = workbook.addWorksheet(c.id);
    sheet.addRow([
      "Teacher email",
      "Sub-criterion",
      "Field",
      "Value",
      "Files",
      "Verification",
    ]);
    sheet.getRow(1).font = { bold: true };

    const subsMeta = NAAC_SUB_CRITERIA.filter((s) => s.criterionId === c.id);
    for (const t of teachers) {
      const tid = String(t._id);
      const tSubs = subsByUser.get(tid) ?? [];
      const tFiles = filesByUser.get(tid) ?? [];
      for (const meta of subsMeta) {
        const def = getFormDef(meta.id);
        const sub = tSubs.find((x) => x.subCriterionId === meta.id);
        const fl = tFiles.filter((f) => f.subCriterionId === meta.id);
        const ver = verByUserSub.get(`${tid}:${meta.id}`);
        const fileNames = fl.map((f) => f.displayName).join("; ");
        const vstatus = ver?.status ?? "PENDING";
        if (!def || !sub?.items?.length) {
          sheet.addRow([t.email, `${meta.id} ${meta.title}`, "(no data)", "", fileNames, vstatus]);
          continue;
        }
        for (const item of sub.items) {
          for (const field of def.fields) {
            sheet.addRow([
              t.email,
              `${meta.id} ${meta.title}`,
              field.label,
              formatValue((item as Record<string, unknown>)[field.key]),
              fileNames,
              vstatus,
            ]);
          }
        }
      }
    }
  }

  const docIdx = workbook.addWorksheet("DocumentIndex");
  docIdx.addRow([
    "Teacher email",
    "Criterion",
    "Sub-criterion",
    "Display name",
    "Original filename",
    "MIME",
    "Upload status",
    "Created",
    "FileId",
    "Cloudinary public id",
  ]);
  docIdx.getRow(1).font = { bold: true };
  for (const f of files) {
    const teacher = teachers.find((t) => String(t._id) === String(f.userId));
    docIdx.addRow([
      teacher?.email ?? String(f.userId),
      f.criterionId,
      f.subCriterionId,
      f.displayName,
      f.originalFilename,
      f.mimeType,
      f.uploadStatus,
      f.createdAt?.toISOString?.() ?? "",
      String(f._id),
      f.cloudinaryPublicId,
    ]);
  }

  const buf = await workbook.xlsx.writeBuffer();
  return Buffer.from(buf);
}
