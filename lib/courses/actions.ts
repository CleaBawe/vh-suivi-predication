"use server";

import { and, eq, isNotNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { courses, progress, submissions } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { getRandomInspiration, getRandomTheme, type InspirationData, type ThemeData } from "./queries";

export async function toggleListened(
  courseId: number,
  excludeInspirationId?: number
): Promise<{ done: boolean; inspiration: InspirationData | null; orientationTheme: ThemeData | null }> {
  const session = await getSession();
  if (!session) throw new Error("Non authentifié");

  const existing = await db.query.progress.findFirst({
    where: and(
      eq(progress.userId, session.userId),
      eq(progress.courseId, courseId)
    ),
  });

  const newDone = !existing?.done;

  await db
    .insert(progress)
    .values({
      userId: session.userId,
      courseId,
      done: newDone,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [progress.userId, progress.courseId],
      set: { done: newDone, updatedAt: new Date() },
    });

  const inspiration = newDone
    ? await getRandomInspiration(excludeInspirationId)
    : null;

  // Suggest a random exercise theme when the orientation module is checked for
  // the first time, or again if the student hasn't done any exercise yet.
  let orientationTheme: ThemeData | null = null;
  if (newDone) {
    const course = await db.query.courses.findFirst({ where: eq(courses.id, courseId) });
    if (course?.type === "orientation") {
      const [exerciseSubmission] = await db
        .select({ id: submissions.id })
        .from(submissions)
        .where(and(eq(submissions.userId, session.userId), isNotNull(submissions.themeId)))
        .limit(1);
      if (!exerciseSubmission) {
        orientationTheme = await getRandomTheme();
      }
    }
  }

  return { done: newDone, inspiration, orientationTheme };
}

export async function saveProgress(
  courseId: number,
  data: { verset?: string; notes?: string }
): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error("Non authentifié");

  await db
    .insert(progress)
    .values({
      userId: session.userId,
      courseId,
      done: false,
      verset: data.verset ?? null,
      notes: data.notes ?? null,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [progress.userId, progress.courseId],
      set: {
        ...(data.verset !== undefined && { verset: data.verset || null }),
        ...(data.notes !== undefined && { notes: data.notes || null }),
        updatedAt: new Date(),
      },
    });
}

export async function submitTraining(
  courseId: number,
  type: "audio" | "texte",
  contenuOuUrl: string,
  partageCommunaute: boolean,
  versetPorteur: string | null,
  excludeInspirationId?: number
): Promise<{ inspiration: InspirationData | null }> {
  const session = await getSession();
  if (!session) throw new Error("Non authentifié");

  await db.insert(submissions).values({
    userId: session.userId,
    courseId,
    type,
    contenuOuUrl,
    partageCommunaute,
    versetPorteur: versetPorteur || null,
    createdAt: new Date(),
  });

  if (versetPorteur) {
    await db
      .insert(progress)
      .values({
        userId: session.userId,
        courseId,
        done: false,
        verset: versetPorteur,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [progress.userId, progress.courseId],
        set: {
          verset: versetPorteur,
          updatedAt: new Date(),
        },
      });
  }

  const inspiration = await getRandomInspiration(excludeInspirationId);
  return { inspiration };
}

export async function submitTrainingForTheme(
  themeId: number,
  type: "audio" | "texte",
  contenuOuUrl: string,
  partageCommunaute: boolean,
  versetPorteur: string | null,
  excludeInspirationId?: number
): Promise<{ inspiration: InspirationData | null }> {
  const session = await getSession();
  if (!session) throw new Error("Non authentifié");

  await db.insert(submissions).values({
    userId: session.userId,
    themeId,
    type,
    contenuOuUrl,
    partageCommunaute,
    versetPorteur: versetPorteur || null,
    createdAt: new Date(),
  });

  const inspiration = await getRandomInspiration(excludeInspirationId);
  return { inspiration };
}

export async function uploadAudioBlob(formData: FormData): Promise<string> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN non configuré");
  }

  const session = await getSession();
  if (!session) throw new Error("Non authentifié");

  const file = formData.get("file") as File;
  if (!file) throw new Error("Fichier manquant");

  // Accept either courseId (existing flow) or themeId (exercise flow)
  const courseId = formData.get("courseId") as string | null;
  const themeId = formData.get("themeId") as string | null;
  const slug = themeId ? `theme${themeId}` : (courseId ?? "unknown");

  const ext = file.type.includes("mp4") ? "mp4" : "webm";
  const path = `submissions/${session.userId}/${slug}_${Date.now()}.${ext}`;

  const { put } = await import("@vercel/blob");
  const blob = await put(path, file, {
    access: "public",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  return blob.url;
}
