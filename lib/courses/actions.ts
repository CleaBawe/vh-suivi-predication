"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { progress, submissions } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { getRandomInspiration, type InspirationData } from "./queries";

export async function toggleListened(
  courseId: number,
  excludeInspirationId?: number
): Promise<{ done: boolean; inspiration: InspirationData | null }> {
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

  return { done: newDone, inspiration };
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

export async function uploadAudioBlob(formData: FormData): Promise<string> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN non configuré");
  }

  const session = await getSession();
  if (!session) throw new Error("Non authentifié");

  const file = formData.get("file") as File;
  const courseId = formData.get("courseId") as string;
  if (!file) throw new Error("Fichier manquant");

  const ext = file.type.includes("mp4") ? "mp4" : "webm";
  const path = `submissions/${session.userId}/${courseId}_${Date.now()}.${ext}`;

  const { put } = await import("@vercel/blob");
  const blob = await put(path, file, {
    access: "public",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  return blob.url;
}
