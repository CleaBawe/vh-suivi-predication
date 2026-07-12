import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getThemesExercice } from "@/lib/courses/queries";
import { ExerciceClient } from "./ExerciceClient";

export const metadata = { title: "Exercice" };

export default async function ExercicePage() {
  const session = await getSession();
  if (!session) redirect("/");

  const themes = await getThemesExercice();

  return (
    <div className="flex flex-col min-h-full bg-white">
      <ExerciceClient themes={themes} />
    </div>
  );
}
