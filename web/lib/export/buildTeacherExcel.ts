import ExcelJS from "exceljs";
import { NAAC_CRITERIA, NAAC_SUB_CRITERIA } from "@/lib/naac";
import { getFormDef } from "@/lib/forms/definitions";
import { criterionBreakdown, overallCompletionPercent } from "@/lib/forms/progress";
import { collectTeacherData } from "./collectTeacherData";

function formatValue(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (Array.isArray(v)) return v.join(", ");
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

export async function buildTeacherExcelBuffer(teacherId: string): Promise<Buffer | null> {
  const data = await collectTeacherData(teacherId);
  if (!data) return null;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "NAAC File Management";

  const summary = workbook.addWorksheet("Summary");
  summary.addRow(["NAAC export — teacher workbook"]);
  summary.addRow(["Teacher", data.teacher.name]);
  summary.addRow(["Email", data.teacher.email ?? ""]);
  summary.addRow(["Department", data.teacher.department ?? ""]);
  summary.addRow([
    "Subjects",
    Array.isArray(data.teacher.subjects) ? data.teacher.subjects.join(", ") : "",
  ]);
  summary.addRow([]);
  summary.addRow([
    "Overall completion %",
    overallCompletionPercent({ submissions: data.submissions, files: data.files }),
  ]);
  summary.addRow([]);
  summary.addRow(["Criterion", "Name", "Completion %"]);
  for (const row of criterionBreakdown({
    submissions: data.submissions,
    files: data.files,
  })) {
    summary.addRow([row.criterionId, row.name, row.percent]);
  }

  for (const c of NAAC_CRITERIA) {
    const sheet = workbook.addWorksheet(c.id);
    sheet.views = [{ state: "frozen", ySplit: 2 }];
    sheet.mergeCells(1, 1, 1, 4);
    sheet.getCell(1, 1).value = `${c.code} — ${c.name} (${c.maxMarks} marks)`;
    sheet.getRow(2).values = ["Field Name", "Value", "Supporting Document", "Status"];
    sheet.getRow(2).font = { bold: true };

    const subs = NAAC_SUB_CRITERIA.filter((s) => s.criterionId === c.id);
    let rowIdx = 3;
    for (const meta of subs) {
      const def = getFormDef(meta.id);
      const sub = data.submissions.find((s) => s.subCriterionId === meta.id);
      const fl = data.files.filter((f) => f.subCriterionId === meta.id);
      const ver = data.verifications.find((v) => v.subCriterionId === meta.id);
      const status = ver?.status ?? "PENDING";
      const fileNames = fl.map((f) => f.displayName).join("; ");

      if (!def) continue;

      if (!sub || !sub.items.length) {
        const r = sheet.getRow(rowIdx++);
        r.values = [`${meta.id} — ${meta.title}`, "(no data)", fileNames, status];
        continue;
      }

      for (const item of sub.items) {
        for (const field of def.fields) {
          const r = sheet.getRow(rowIdx++);
          r.values = [
            `${meta.id} — ${field.label}`,
            formatValue((item as Record<string, unknown>)[field.key]),
            fileNames,
            status,
          ];
          if (rowIdx % 2 === 0) {
            r.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFF3F4F6" },
            };
          }
        }
      }
    }
  }

  const buf = await workbook.xlsx.writeBuffer();
  return Buffer.from(buf);
}
