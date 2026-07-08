import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getCoursesWithProgress, getRandomInspiration } from "@/lib/courses/queries";
import { CoursesPageClient } from "./CoursesPageClient";

export const metadata = { title: "Mes cours" };

export default async function CoursPage() {
  const session = await getSession();
  if (!session) redirect("/");

  const [courses, bannerInspiration] = await Promise.all([
    getCoursesWithProgress(session.userId),
    getRandomInspiration(),
  ]);

  const orientation = courses.find((c) => c.type === "orientation") ?? null;

  const classesCourses = [1, 2, 3, 4].map((classe) => ({
    classe,
    courses: courses.filter((c) => c.type === "officiel" && c.classe === classe),
  }));

  return (
    <div className="flex flex-col min-h-full bg-gray-50">
      <header className="sticky top-0 z-10 bg-gray-50 px-4 pt-3 pb-2">
        <div className="rounded-2xl bg-white border border-gray-100 px-4 py-3">
          <h1 className="font-bold text-gray-900">Mes cours</h1>
          <p className="text-xs text-gray-400">
            {courses.filter((c) => c.progress?.done).length}/{courses.filter((c) => c.type === "officiel").length} cours officiels terminés · Chaque cours t&apos;équipe davantage
          </p>
        </div>
      </header>

      <CoursesPageClient
        orientation={orientation}
        classesCourses={classesCourses}
        bannerInspiration={bannerInspiration}
      />
    </div>
  );
}
