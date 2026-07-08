"use server";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { adminFeedback } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";

export async function addFeedbackAction(
  submissionId: number,
  message: string
): Promise<{ ok: true } | { error: string }> {
  const session = await getSession();
  if (!session || session.role !== "admin") return { error: "Non autorisé." };
  if (!message.trim()) return { error: "Le message ne peut pas être vide." };

  await db.insert(adminFeedback).values({
    submissionId,
    adminId: session.userId,
    message: message.trim(),
    createdAt: new Date(),
  });

  return { ok: true };
}
