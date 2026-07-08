import Link from "next/link";
import { Suspense } from "react";
import { getSession } from "@/lib/auth/session";
import { logoutAction } from "@/lib/auth/actions";
import { getStudentList } from "@/lib/admin/queries";
import { ClasseFilter } from "./ClasseFilter";
import type { StudentListItem } from "@/lib/admin/queries";

export const metadata = { title: "Espace admin" };

type Props = {
  searchParams: Promise<{ classe?: string }>;
};

function formatRelativeDate(date: Date | null): string {
  if (!date) return "Aucune activité";
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Hier";
  if (days < 30) return `Il y a ${days} jours`;
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

function getInitials(nom: string | null, matricule: string): string {
  if (nom) {
    const parts = nom.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }
  return matricule.slice(0, 2).toUpperCase();
}

function StudentCard({
  student,
  classeFilter,
}: {
  student: StudentListItem;
  classeFilter: string;
}) {
  const classeNum = parseInt(classeFilter, 10);
  const showPerClasse = !isNaN(classeNum) && classeNum >= 1 && classeNum <= 4;

  const progressData = showPerClasse
    ? student.progressByClasse.find((p) => p.classe === classeNum) ?? null
    : null;

  const done = progressData ? progressData.done : student.totalDone;
  const total = progressData
    ? progressData.total
    : student.progressByClasse.reduce((s, p) => s + p.total, 0);
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const label = progressData ? `Classe ${classeNum}` : "Total";

  return (
    <Link href={`/admin/etudiants/${student.id}`} className="block">
      <div className="rounded-2xl border border-gray-100 bg-white p-4 space-y-3 active:scale-[0.99] transition-transform">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-600">
            {getInitials(student.nom, student.matricule)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-gray-900">
              {student.nom || student.matricule}
            </p>
            {student.nom && (
              <p className="text-xs text-gray-400">{student.matricule}</p>
            )}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <p className="text-xs text-gray-400">{formatRelativeDate(student.lastActivity)}</p>
            {student.submissionCount > 0 && (
              <span className="rounded-full bg-vh-green-100 px-2 py-0.5 text-xs font-medium text-vh-green-700">
                {student.submissionCount} envoi{student.submissionCount > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{label}</span>
            <span className="font-medium text-vh-green-600">
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
      </div>
    </Link>
  );
}

export default async function AdminPage({ searchParams }: Props) {
  const [session, params] = await Promise.all([getSession(), searchParams]);
  const classeFilter = params.classe ?? "";

  const students = await getStudentList();

  const sorted = [...students].sort((a, b) => {
    const ta = a.lastActivity?.getTime() ?? 0;
    const tb = b.lastActivity?.getTime() ?? 0;
    return tb - ta;
  });

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-gray-50 px-4 pt-3 pb-2">
        <div className="rounded-2xl bg-white border border-gray-100 px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-vh-green-600">
                Espace Admin
              </p>
              <p className="font-semibold text-gray-900">
                {session?.nom || session?.matricule}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/admin/creer-admin"
                className="rounded-2xl border border-vh-green-200 bg-vh-green-50 px-3 py-2 text-xs font-medium text-vh-green-700 transition-colors active:bg-vh-green-100"
              >
                + Admin
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-2xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 transition-transform active:scale-95"
                >
                  Déconnexion
                </button>
              </form>
            </div>
          </div>

          {/* Classe filter */}
          <div className="mt-3">
            <Suspense>
              <ClasseFilter active={classeFilter} />
            </Suspense>
          </div>
        </div>
      </header>

      {/* Student list */}
      <main className="flex flex-1 flex-col gap-3 px-4 py-4">
        {sorted.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center py-16 text-center text-gray-400">
            <p className="text-sm font-medium text-gray-500">Aucun étudiant inscrit.</p>
          </div>
        ) : (
          sorted.map((student) => (
            <StudentCard key={student.id} student={student} classeFilter={classeFilter} />
          ))
        )}
      </main>
    </div>
  );
}
