import Link from "next/link";
import { redirect } from "next/navigation";
import { getStudentDetail } from "@/lib/admin/queries";
import { ResetPasswordSection } from "./ResetPasswordSection";
import { SubmissionsSection } from "./SubmissionsSection";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const student = await getStudentDetail(Number(id));
  return { title: student ? (student.nom || student.matricule) : "Étudiant" };
}

export default async function StudentDetailPage({ params }: Props) {
  const { id } = await params;
  const studentId = Number(id);

  if (isNaN(studentId)) redirect("/admin");

  const student = await getStudentDetail(studentId);
  if (!student) redirect("/admin");

  const totalOfficial = student.progressByClasse.reduce((s, p) => s + p.total, 0);
  const overallPercent =
    totalOfficial > 0 ? Math.round((student.totalDone / totalOfficial) * 100) : 0;

  return (
    <div className="flex flex-1 flex-col">
      {/* Sticky header */}
      <header className="sticky top-0 z-10 bg-gray-50 px-4 pt-3 pb-2">
        <div className="rounded-2xl bg-white border border-gray-100 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-gray-200 text-gray-600 active:bg-gray-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="min-w-0">
              <p className="truncate font-semibold text-gray-900">
                {student.nom || student.matricule}
              </p>
              {student.nom && (
                <p className="text-xs text-gray-400">{student.matricule}</p>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 px-4 py-4">
        {/* Progression */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Progression</h2>

          {/* Overall */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">Total</span>
              <span className="font-semibold text-vh-green-600">
                {student.totalDone} / {totalOfficial} cours officiels
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-vh-green-100">
              <div
                className="h-full rounded-full bg-vh-green-600 transition-all"
                style={{ width: `${overallPercent}%` }}
              />
            </div>
            <p className="text-right text-xs text-gray-400">{overallPercent}%</p>
          </div>

          {/* Per-class */}
          <div className="space-y-3">
            {student.progressByClasse.map(({ classe, done, total }) => {
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
              return (
                <div key={classe} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-gray-600">Classe {classe}</span>
                    <span className="text-gray-500">
                      {done}/{total}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-vh-green-100">
                    <div
                      className="h-full rounded-full bg-vh-green-600 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reset password */}
        <ResetPasswordSection
          studentId={student.id}
          mustChangePassword={student.mustChangePassword}
        />

        {/* Submissions */}
        <SubmissionsSection submissions={student.submissions} />
      </div>
    </div>
  );
}
