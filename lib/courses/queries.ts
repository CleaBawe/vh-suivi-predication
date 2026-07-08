import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { courses, progress, inspirations, submissions, users } from "@/lib/db/schema";

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
      .where(eq(submissions.userId, userId)),
  ]);

  const progressMap = new Map(
    progressRecords.map((p) => [
      p.courseId,
      { done: p.done, verset: p.verset, notes: p.notes },
    ])
  );

  const submittedIds = new Set(submittedRecords.map((r) => r.courseId));

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

export type CommunauteSubmission = {
  id: number;
  type: "audio" | "texte";
  contenuOuUrl: string;
  versetPorteur: string | null;
  createdAt: Date;
  auteurNom: string | null;
  auteurMatricule: string;
  courseId: number;
  courseTitre: string;
  courseClasse: number | null;
  courseNumero: number | null;
  courseType: "officiel" | "orientation" | "bonus";
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
    })
    .from(submissions)
    .innerJoin(users, eq(submissions.userId, users.id))
    .innerJoin(courses, eq(submissions.courseId, courses.id))
    .where(eq(submissions.partageCommunaute, true))
    .orderBy(desc(submissions.createdAt));

  return rows;
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
