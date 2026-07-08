import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, courses, progress, submissions, adminFeedback } from "@/lib/db/schema";

export type StudentListItem = {
  id: number;
  matricule: string;
  nom: string | null;
  createdAt: Date;
  totalDone: number;
  progressByClasse: { classe: number; done: number; total: number }[];
  submissionCount: number;
  lastActivity: Date | null;
};

export async function getStudentList(): Promise<StudentListItem[]> {
  const [allStudents, officialCourses, allProgress, allSubmissions] = await Promise.all([
    db.select().from(users).where(eq(users.role, "student")).orderBy(users.nom, users.matricule),
    db.select().from(courses).where(eq(courses.type, "officiel")),
    db.select().from(progress),
    db.select({ userId: submissions.userId, createdAt: submissions.createdAt }).from(submissions),
  ]);

  const progressByUser = new Map<number, typeof allProgress>();
  for (const p of allProgress) {
    if (!progressByUser.has(p.userId)) progressByUser.set(p.userId, []);
    progressByUser.get(p.userId)!.push(p);
  }

  const subsByUser = new Map<number, { createdAt: Date }[]>();
  for (const s of allSubmissions) {
    if (!subsByUser.has(s.userId)) subsByUser.set(s.userId, []);
    subsByUser.get(s.userId)!.push(s);
  }

  return allStudents.map((student) => {
    const progs = progressByUser.get(student.id) ?? [];
    const subs = subsByUser.get(student.id) ?? [];
    const doneIds = new Set(progs.filter((p) => p.done).map((p) => p.courseId));

    const progressByClasse = [1, 2, 3, 4].map((classe) => {
      const cc = officialCourses.filter((c) => c.classe === classe);
      return { classe, done: cc.filter((c) => doneIds.has(c.id)).length, total: cc.length };
    });

    const dates = [
      ...progs.map((p) => p.updatedAt),
      ...subs.map((s) => s.createdAt),
    ].sort((a, b) => b.getTime() - a.getTime());

    return {
      id: student.id,
      matricule: student.matricule,
      nom: student.nom,
      createdAt: student.createdAt,
      totalDone: doneIds.size,
      progressByClasse,
      submissionCount: subs.length,
      lastActivity: dates[0] ?? null,
    };
  });
}

export type StudentDetailSubmission = {
  id: number;
  type: "audio" | "texte";
  contenuOuUrl: string;
  versetPorteur: string | null;
  partageCommunaute: boolean;
  createdAt: Date;
  courseTitre: string;
  courseClasse: number | null;
  courseNumero: number | null;
  feedback: { id: number; adminNom: string | null; adminMatricule: string; message: string; createdAt: Date }[];
};

export type StudentDetail = {
  id: number;
  matricule: string;
  nom: string | null;
  totalDone: number;
  progressByClasse: { classe: number; done: number; total: number }[];
  submissions: StudentDetailSubmission[];
  mustChangePassword: boolean;
};

export async function getStudentDetail(studentId: number): Promise<StudentDetail | null> {
  const student = await db.query.users.findFirst({
    where: eq(users.id, studentId),
  });
  if (!student || student.role !== "student") return null;

  const [officialCourses, studentProgress, studentSubs] = await Promise.all([
    db.select().from(courses).where(eq(courses.type, "officiel")),
    db.select().from(progress).where(eq(progress.userId, studentId)),
    db
      .select({
        id: submissions.id,
        type: submissions.type,
        contenuOuUrl: submissions.contenuOuUrl,
        versetPorteur: submissions.versetPorteur,
        partageCommunaute: submissions.partageCommunaute,
        createdAt: submissions.createdAt,
        courseTitre: courses.titre,
        courseClasse: courses.classe,
        courseNumero: courses.numero,
      })
      .from(submissions)
      .innerJoin(courses, eq(submissions.courseId, courses.id))
      .where(eq(submissions.userId, studentId))
      .orderBy(desc(submissions.createdAt)),
  ]);

  const submissionIds = studentSubs.map((s) => s.id);
  const allFeedback =
    submissionIds.length > 0
      ? await db
          .select({
            id: adminFeedback.id,
            submissionId: adminFeedback.submissionId,
            message: adminFeedback.message,
            createdAt: adminFeedback.createdAt,
            adminNom: users.nom,
            adminMatricule: users.matricule,
          })
          .from(adminFeedback)
          .innerJoin(users, eq(adminFeedback.adminId, users.id))
          .where(inArray(adminFeedback.submissionId, submissionIds))
          .orderBy(adminFeedback.createdAt)
      : [];

  const feedbackBySubmission = new Map<number, typeof allFeedback>();
  for (const f of allFeedback) {
    if (!feedbackBySubmission.has(f.submissionId))
      feedbackBySubmission.set(f.submissionId, []);
    feedbackBySubmission.get(f.submissionId)!.push(f);
  }

  const doneIds = new Set(studentProgress.filter((p) => p.done).map((p) => p.courseId));
  const progressByClasse = [1, 2, 3, 4].map((classe) => {
    const cc = officialCourses.filter((c) => c.classe === classe);
    return { classe, done: cc.filter((c) => doneIds.has(c.id)).length, total: cc.length };
  });

  return {
    id: student.id,
    matricule: student.matricule,
    nom: student.nom,
    totalDone: doneIds.size,
    progressByClasse,
    mustChangePassword: student.mustChangePassword,
    submissions: studentSubs.map((s) => ({
      ...s,
      feedback: feedbackBySubmission.get(s.id) ?? [],
    })),
  };
}
