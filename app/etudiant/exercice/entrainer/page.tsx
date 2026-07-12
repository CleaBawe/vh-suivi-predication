import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { themesExercice } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { TrainClient } from "@/app/etudiant/entrainer/TrainClient";

export const metadata = { title: "S'entraîner — Exercice" };

type Props = {
  searchParams: Promise<Record<string, string | string[]>>;
};

export default async function ExerciceEntrainerPage({ searchParams }: Props) {
  const params = await searchParams;
  const raw = params.themeId;
  const themeIdNum = parseInt(Array.isArray(raw) ? raw[0] : (raw ?? ""), 10);
  if (isNaN(themeIdNum)) redirect("/etudiant/exercice");

  const session = await getSession();
  if (!session) redirect("/");

  const theme = await db.query.themesExercice.findFirst({
    where: eq(themesExercice.id, themeIdNum),
  });
  if (!theme) redirect("/etudiant/exercice");

  return (
    <div className="flex flex-col min-h-full bg-white">
      <TrainClient
        themeId={theme.id}
        titre={theme.titre}
        backHref="/etudiant/exercice"
        continueLabel="Retour aux exercices"
      />
    </div>
  );
}
