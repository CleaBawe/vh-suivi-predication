"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { compare, hash } from "bcryptjs";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { createSession, deleteSession, getSession } from "./session";


export async function loginAction(
  _: string | null,
  formData: FormData
): Promise<string | null> {
  const matricule = (formData.get("matricule") as string | null)
    ?.trim()
    .toUpperCase();
  const password = formData.get("password") as string | null;

  if (!matricule || !password) return "Veuillez remplir tous les champs.";

  const user = await db.query.users.findFirst({
    where: eq(users.matricule, matricule),
  });

  if (!user || !(await compare(password, user.passwordHash))) {
    return "Matricule ou mot de passe incorrect.";
  }

  await createSession({
    userId: user.id,
    matricule: user.matricule,
    role: user.role,
    nom: user.nom,
    mustChangePassword: user.mustChangePassword,
  });

  if (user.mustChangePassword) redirect("/changer-mot-de-passe");
  redirect(user.role === "admin" ? "/admin" : "/etudiant");
}

export async function registerAction(
  _: string | null,
  formData: FormData
): Promise<string | null> {
  const matricule = (formData.get("matricule") as string | null)
    ?.trim()
    .toUpperCase();
  const nom = (formData.get("nom") as string | null)?.trim() || null;
  const password = formData.get("password") as string | null;
  const confirm = formData.get("confirm") as string | null;

  if (!matricule || !password)
    return "Le matricule et le mot de passe sont obligatoires.";
  if (matricule.length < 2) return "Le matricule est trop court.";
  if (password.length < 6) return "Le mot de passe doit faire 6 caractères minimum.";
  if (password !== confirm) return "Les mots de passe ne correspondent pas.";

  const existing = await db.query.users.findFirst({
    where: eq(users.matricule, matricule),
  });
  if (existing) return "Ce matricule est déjà utilisé.";

  const passwordHash = await hash(password, 12);
  const [newUser] = await db
    .insert(users)
    .values({ matricule, passwordHash, role: "student", nom })
    .returning();

  await createSession({
    userId: newUser.id,
    matricule: newUser.matricule,
    role: newUser.role,
    nom: newUser.nom,
    mustChangePassword: newUser.mustChangePassword,
  });

  redirect("/etudiant");
}

export async function logoutAction(): Promise<void> {
  await deleteSession();
  redirect("/");
}

export async function changePasswordAction(
  _: string | null,
  formData: FormData
): Promise<string | null> {
  const session = await getSession();
  if (!session) redirect("/");

  const newPassword = formData.get("newPassword") as string | null;
  const confirm = formData.get("confirm") as string | null;

  if (!newPassword || !confirm) return "Veuillez remplir tous les champs.";
  if (newPassword.length < 6)
    return "Le mot de passe doit faire 6 caractères minimum.";
  if (newPassword !== confirm) return "Les mots de passe ne correspondent pas.";

  const passwordHash = await hash(newPassword, 12);
  await db
    .update(users)
    .set({ passwordHash, mustChangePassword: false })
    .where(eq(users.id, session.userId));

  await createSession({ ...session, mustChangePassword: false });
  redirect(session.role === "admin" ? "/admin" : "/etudiant");
}

// Called directly from client (not useActionState form binding)
export async function changeOwnPasswordAction(
  formData: FormData
): Promise<{ ok: true } | { error: string }> {
  const session = await getSession();
  if (!session) return { error: "Non authentifié." };

  const current = formData.get("currentPassword") as string | null;
  const newPass = formData.get("newPassword") as string | null;
  const confirm = formData.get("confirm") as string | null;

  if (!current || !newPass || !confirm) return { error: "Tous les champs sont requis." };
  if (newPass.length < 6) return { error: "Le nouveau mot de passe doit faire au moins 6 caractères." };
  if (newPass !== confirm) return { error: "Les mots de passe ne correspondent pas." };

  const user = await db.query.users.findFirst({ where: eq(users.id, session.userId) });
  if (!user) return { error: "Utilisateur introuvable." };

  const valid = await compare(current, user.passwordHash);
  if (!valid) return { error: "Mot de passe actuel incorrect." };

  const passwordHash = await hash(newPass, 12);
  await db.update(users).set({ passwordHash }).where(eq(users.id, session.userId));
  return { ok: true };
}

// Admin: reset a student's password to a temp 6-digit code
export async function resetStudentPasswordAction(
  studentId: number
): Promise<{ tempPassword: string } | { error: string }> {
  const session = await getSession();
  if (!session || session.role !== "admin") return { error: "Non autorisé." };

  const tempPassword = Math.floor(100000 + Math.random() * 900000).toString();
  const passwordHash = await hash(tempPassword, 12);
  await db
    .update(users)
    .set({ passwordHash, mustChangePassword: true })
    .where(eq(users.id, studentId));

  return { tempPassword };
}

// Admin: create another admin account (useActionState form)
export async function createAdminAction(
  _prev: string | null,
  formData: FormData
): Promise<string | null> {
  const session = await getSession();
  if (!session || session.role !== "admin") return "Non autorisé.";

  const matricule = (formData.get("matricule") as string | null)?.trim().toUpperCase();
  const nom = (formData.get("nom") as string | null)?.trim() || null;
  const password = formData.get("password") as string | null;
  const confirm = formData.get("confirm") as string | null;

  if (!matricule || !password || !confirm) return "Matricule et mot de passe obligatoires.";
  if (password.length < 6) return "Le mot de passe doit faire au moins 6 caractères.";
  if (password !== confirm) return "Les mots de passe ne correspondent pas.";

  const existing = await db.query.users.findFirst({ where: eq(users.matricule, matricule) });
  if (existing) return "Ce matricule est déjà utilisé.";

  const passwordHash = await hash(password, 12);
  await db.insert(users).values({ matricule, nom, passwordHash, role: "admin", mustChangePassword: false, createdAt: new Date() });
  redirect("/admin");
}
