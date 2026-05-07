import { renderToBuffer } from "@react-pdf/renderer";
import { TeacherPdfDocument } from "./TeacherPdfDocument";
import type { collectTeacherData } from "./collectTeacherData";

type TeacherBundle = NonNullable<Awaited<ReturnType<typeof collectTeacherData>>>;

export async function buildTeacherPdfBuffer(
  data: TeacherBundle,
  exportedAt: string,
): Promise<Buffer> {
  const buf = await renderToBuffer(
    <TeacherPdfDocument
      exportedAt={exportedAt}
      teacher={{
        name: data.teacher.name,
        email: data.teacher.email,
        department: data.teacher.department,
        subjects: data.teacher.subjects,
      }}
      submissions={data.submissions}
      files={data.files}
      verifications={data.verifications}
    />,
  );
  return Buffer.from(buf);
}
