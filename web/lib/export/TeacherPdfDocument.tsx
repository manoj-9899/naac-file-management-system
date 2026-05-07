import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { NAAC_CRITERIA, NAAC_SUB_CRITERIA } from "@/lib/naac";
import { getFormDef } from "@/lib/forms/definitions";
import { criterionBreakdown, overallCompletionPercent } from "@/lib/forms/progress";

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 10, fontFamily: "Helvetica" },
  h1: { fontSize: 18, marginBottom: 12, fontFamily: "Helvetica-Bold" },
  h2: { fontSize: 12, marginTop: 12, marginBottom: 6, fontFamily: "Helvetica-Bold" },
  p: { marginBottom: 4 },
  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#eee", paddingVertical: 4 },
  cellKey: { width: "32%", fontFamily: "Helvetica-Bold" },
  cellVal: { width: "68%" },
});

function formatValue(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (Array.isArray(v)) return v.join(", ");
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

type LeanSubmission = {
  subCriterionId: string;
  items: Record<string, unknown>[];
};

type LeanFile = {
  _id: unknown;
  subCriterionId: string;
  displayName: string;
  uploadStatus: string;
  createdAt?: Date;
};

type LeanVerification = {
  subCriterionId: string;
  status: string;
  comment?: string;
};

export function TeacherPdfDocument(props: {
  exportedAt: string;
  teacher: { name: string; email?: string; department?: string; subjects?: string[] };
  submissions: LeanSubmission[];
  files: LeanFile[];
  verifications: LeanVerification[];
}) {
  const overall = overallCompletionPercent({
    submissions: props.submissions,
    files: props.files,
  });
  const breakdown = criterionBreakdown({
    submissions: props.submissions,
    files: props.files,
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>NAAC departmental documentation</Text>
        <Text style={styles.p}>Exported: {props.exportedAt}</Text>
        <Text style={styles.p}>Teacher: {props.teacher.name}</Text>
        <Text style={styles.p}>Email: {props.teacher.email ?? ""}</Text>
        <Text style={styles.p}>Department: {props.teacher.department ?? ""}</Text>
        <Text style={styles.p}>
          Subjects:{" "}
          {Array.isArray(props.teacher.subjects) ? props.teacher.subjects.join(", ") : ""}
        </Text>
        <Text style={styles.p}>Overall completion: {overall}%</Text>

        <Text style={styles.h2}>Completion by criterion</Text>
        {breakdown.map((b) => (
          <Text key={b.criterionId} style={styles.p}>
            {b.criterionId} — {b.name}: {b.percent}%
          </Text>
        ))}
      </Page>

      {NAAC_CRITERIA.map((c) => (
        <Page key={c.id} size="A4" style={styles.page}>
          <Text style={styles.h1}>
            {c.code} — {c.name} ({c.maxMarks} marks)
          </Text>
          {NAAC_SUB_CRITERIA.filter((s) => s.criterionId === c.id).map((meta) => {
            const def = getFormDef(meta.id);
            const sub = props.submissions.find((s) => s.subCriterionId === meta.id);
            const fl = props.files.filter((f) => f.subCriterionId === meta.id);
            const ver = props.verifications.find((v) => v.subCriterionId === meta.id);
            return (
              <View key={meta.id} wrap={false}>
                <Text style={styles.h2}>
                  {meta.id} {meta.title} — Verification: {ver?.status ?? "PENDING"}
                </Text>
                {ver?.comment ? <Text style={styles.p}>HOD comment: {ver.comment}</Text> : null}
                {!def || !sub?.items?.length ? (
                  <Text style={styles.p}>(No structured data)</Text>
                ) : (
                  sub.items.map((item, idx) => (
                    <View key={idx} style={{ marginBottom: 8 }}>
                      <Text style={styles.p}>Row {idx + 1}</Text>
                      {def.fields.map((field) => (
                        <View key={field.key} style={styles.row}>
                          <Text style={styles.cellKey}>{field.label}</Text>
                          <Text style={styles.cellVal}>{formatValue(item[field.key])}</Text>
                        </View>
                      ))}
                    </View>
                  ))
                )}
                {fl.length ? (
                  <View style={{ marginTop: 6 }}>
                    <Text style={styles.p}>Uploaded files:</Text>
                    {fl.map((f) => (
                      <Text key={String(f._id)} style={styles.p}>
                        - {f.displayName} ({f.uploadStatus}) —{" "}
                        {f.createdAt ? new Date(f.createdAt).toISOString() : ""}
                      </Text>
                    ))}
                  </View>
                ) : null}
              </View>
            );
          })}
        </Page>
      ))}
    </Document>
  );
}
