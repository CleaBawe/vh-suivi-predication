import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { logoutAction } from "@/lib/auth/actions";
import { getCoursesWithProgress } from "@/lib/courses/queries";
import { ChangePasswordSection } from "./ChangePasswordSection";

export const metadata = { title: "Mon profil" };

function getInitials(nom: string | null | undefined, matricule: string): string {
  if (nom) {
    const parts = nom.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }
  return matricule.slice(0, 2).toUpperCase();
}

export default async function ProfilPage() {
  const session = await getSession();
  if (!session) redirect("/");

  const courses = await getCoursesWithProgress(session.userId);
  const officialCourses = courses.filter((c) => c.type === "officiel");
  const totalDone = officialCourses.filter((c) => c.progress?.done).length;
  const totalOfficial = officialCourses.length;
  const overallPercent = totalOfficial > 0 ? Math.round((totalDone / totalOfficial) * 100) : 0;

  const classeStats = [1, 2, 3, 4].map((classe) => {
    const cc = officialCourses.filter((c) => c.classe === classe);
    const done = cc.filter((c) => c.progress?.done).length;
    return { classe, done, total: cc.length };
  });

  const initials = getInitials(session.nom, session.matricule);

  return (
    <div className="flex flex-col gap-4 px-4 pb-6">
      {/* Identity card */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-vh-green-600 text-xl font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0">
            {session.nom && (
              <p className="truncate font-bold text-gray-900">{session.nom}</p>
            )}
            <p className="text-sm font-medium text-gray-500">{session.matricule}</p>
          </div>
        </div>
      </div>

      {/* Progression */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Progression</h2>

        {/* Overall bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">Total</span>
            <span className="font-semibold text-vh-green-600">
              {totalDone} / {totalOfficial} cours officiels
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

        {/* Per-class bars */}
        <div className="space-y-3">
          {classeStats.map(({ classe, done, total }) => {
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

      {/* Change password */}
      <ChangePasswordSection />

      {/* Logout */}
      <form action={logoutAction}>
        <button
          type="submit"
          className="w-full rounded-2xl border border-gray-200 py-4 text-base font-semibold text-gray-600 transition-transform active:scale-95"
        >
          Se déconnecter
        </button>
      </form>
    </div>
  );
}
