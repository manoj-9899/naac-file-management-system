import HodTeacherClient from "./client";

export default async function HodTeacherPage({
  params,
}: {
  params: Promise<{ teacherId: string }>;
}) {
  const { teacherId } = await params;
  return <HodTeacherClient teacherId={teacherId} />;
}
