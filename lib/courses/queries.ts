import { and, desc, eq, isNotNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { courses, progress, inspirations, submissions, users, themesExercice } from "@/lib/db/schema";

export type InspirationData = {
  id: number;
  personnage: string;
  reference: string;
  versetTexte: string;
  conseil: string;
};

export type AudioPartData = {
  id: number;
  ordre: number;
  url: string;
  titre: string | null;
};

export type ProgressData = {
  done: boolean;
  verset: string | null;
  notes: string | null;
} | null;

export type CourseData = {
  id: number;
  classe: number | null;
  numero: number | null;
  titre: string;
  type: "officiel" | "orientation" | "bonus";
  statutAudio: "ok" | "manquant" | "en_attente";
  audioParts: AudioPartData[];
  progress: ProgressData;
  hasSubmission: boolean;
};

export type ThemeData = {
  id: number;
  titre: string;
  coursCorrespondant: string;
  classe: string;
  versetsBase: string[];
  personnageBiblique: string;
  approcheApotre: string;
  constructionPredication: string[];
  questionCoeur: string;
};

export async function getCoursesWithProgress(userId: number): Promise<CourseData[]> {
  const [allCourses, progressRecords, submittedRecords] = await Promise.all([
    db.query.courses.findMany({
      with: { audioParts: { orderBy: (p, { asc }) => [asc(p.ordre)] } },
      orderBy: (c, { asc }) => [asc(c.classe), asc(c.numero)],
    }),
    db.select().from(progress).where(eq(progress.userId, userId)),
    db
      .selectDistinct({ courseId: submissions.courseId })
      .from(submissions)
      .where(and(eq(submissions.userId, userId), isNotNull(submissions.courseId))),
  ]);

  const progressMap = new Map(
    progressRecords.map((p) => [
      p.courseId,
      { done: p.done, verset: p.verset, notes: p.notes },
    ])
  );

  const submittedIds = new Set(
    submittedRecords.map((r) => r.courseId).filter((id): id is number => id !== null)
  );

  return allCourses.map((c) => ({
    id: c.id,
    classe: c.classe,
    numero: c.numero,
    titre: c.titre,
    type: c.type,
    statutAudio: c.statutAudio,
    audioParts: c.audioParts,
    progress: progressMap.get(c.id) ?? null,
    hasSubmission: submittedIds.has(c.id),
  }));
}

export async function getThemesExercice(): Promise<ThemeData[]> {
  const rows = await db.select().from(themesExercice).orderBy(themesExercice.id);
  return rows.map((r) => ({
    id: r.id,
    titre: r.titre,
    coursCorrespondant: r.coursCorrespondant,
    classe: r.classe,
    versetsBase: r.versetsBase,
    personnageBiblique: r.personnageBiblique,
    approcheApotre: r.approcheApotre,
    constructionPredication: r.constructionPredication,
    questionCoeur: r.questionCoeur,
  }));
}

export type CommunauteSubmission = {
  id: number;
  type: "audio" | "texte";
  contenuOuUrl: string;
  versetPorteur: string | null;
  createdAt: Date;
  auteurNom: string | null;
  auteurMatricule: string;
  // Course submission fields
  courseId: number | null;
  courseTitre: string | null;
  courseClasse: number | null;
  courseNumero: number | null;
  courseType: "officiel" | "orientation" | "bonus" | null;
  // Theme submission fields
  themeId: number | null;
  themeTitre: string | null;
};

export async function getCommunauteSubmissions(): Promise<CommunauteSubmission[]> {
  const rows = await db
    .select({
      id: submissions.id,
      type: submissions.type,
      contenuOuUrl: submissions.contenuOuUrl,
      versetPorteur: submissions.versetPorteur,
      createdAt: submissions.createdAt,
      auteurNom: users.nom,
      auteurMatricule: users.matricule,
      courseId: courses.id,
      courseTitre: courses.titre,
      courseClasse: courses.classe,
      courseNumero: courses.numero,
      courseType: courses.type,
      themeId: themesExercice.id,
      themeTitre: themesExercice.titre,
    })
    .from(submissions)
    .innerJoin(users, eq(submissions.userId, users.id))
    .leftJoin(courses, eq(submissions.courseId, courses.id))
    .leftJoin(themesExercice, eq(submissions.themeId, themesExercice.id))
    .where(eq(submissions.partageCommunaute, true))
    .orderBy(desc(submissions.createdAt));

  return rows as CommunauteSubmission[];
}

export async function getRandomInspiration(
  excludeId?: number
): Promise<InspirationData | null> {
  const all = await db.select().from(inspirations);
  if (all.length === 0) return null;
  const pool =
    excludeId && all.length > 1 ? all.filter((i) => i.id !== excludeId) : all;
  return pool[Math.floor(Math.random() * pool.length)];
}
