import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { courses } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { TrainClient } from "./TrainClient";

export const metadata = { title: "S'entraîner" };

type Props = {
  searchParams: Promise<Record<string, string | string[]>>;
};

export default async function EntrainerPage({ searchParams }: Props) {
  const params = await searchParams;
  const raw = params.courseId;
  const courseIdNum = parseInt(Array.isArray(raw) ? raw[0] : (raw ?? ""), 10);
  if (isNaN(courseIdNum)) redirect("/etudiant/cours");

  const session = await getSession();
  if (!session) redirect("/");

  const course = await db.query.courses.findFirst({
    where: eq(courses.id, courseIdNum),
  });
  if (!course) redirect("/etudiant/cours");

  return (
    <div className="flex flex-col min-h-full bg-white">
      <TrainClient courseId={course.id} courseTitre={course.titre} />
    </div>
  );
}
