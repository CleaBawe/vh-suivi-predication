import {
  pgTable, serial, varchar, text, boolean, integer,
  timestamp, pgEnum, unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const roleEnum = pgEnum("role", ["student", "admin"]);
export const courseTypeEnum = pgEnum("course_type", ["officiel", "orientation", "bonus"]);
export const audioStatusEnum = pgEnum("audio_status", ["ok", "manquant", "en_attente"]);
export const submissionTypeEnum = pgEnum("submission_type", ["audio", "texte"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  matricule: varchar("matricule", { length: 50 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull().default("student"),
  nom: varchar("nom", { length: 100 }),
  mustChangePassword: boolean("must_change_password").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  classe: integer("classe"),
  numero: integer("numero"),
  titre: varchar("titre", { length: 200 }).notNull(),
  type: courseTypeEnum("type").notNull(),
  statutAudio: audioStatusEnum("statut_audio").notNull().default("ok"),
});

export const courseAudioParts = pgTable("course_audio_parts", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  ordre: integer("ordre").notNull(),
  url: text("url").notNull(),
  titre: varchar("titre", { length: 200 }),
});

export const progress = pgTable("progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  courseId: integer("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  done: boolean("done").notNull().default(false),
  verset: text("verset"),
  notes: text("notes"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  unique("progress_user_course_unique").on(t.userId, t.courseId),
]);

export const themesExercice = pgTable("themes_exercice", {
  id: serial("id").primaryKey(),
  titre: varchar("titre", { length: 200 }).notNull(),
  penseeCentrale: varchar("pensee_centrale", { length: 300 }).notNull(),
  personnageBiblique: varchar("personnage_biblique", { length: 100 }).notNull(),
  versetsBase: text("versets_base").array().notNull(),
  filConducteur: text("fil_conducteur").notNull(),
  tips: text("tips").array().notNull(),
});

export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  courseId: integer("course_id").references(() => courses.id, { onDelete: "cascade" }),
  themeId: integer("theme_id").references(() => themesExercice.id, { onDelete: "cascade" }),
  type: submissionTypeEnum("type").notNull(),
  contenuOuUrl: text("contenu_ou_url").notNull(),
  partageCommunaute: boolean("partage_communaute").notNull().default(true),
  versetPorteur: text("verset_porteur"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const adminFeedback = pgTable("admin_feedback", {
  id: serial("id").primaryKey(),
  submissionId: integer("submission_id").notNull().references(() => submissions.id, { onDelete: "cascade" }),
  adminId: integer("admin_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const inspirations = pgTable("inspirations", {
  id: serial("id").primaryKey(),
  personnage: varchar("personnage", { length: 100 }).notNull(),
  reference: varchar("reference", { length: 150 }).notNull(),
  versetTexte: text("verset_texte").notNull(),
  conseil: text("conseil").notNull(),
});

// ─── Relations ───────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  progress: many(progress),
  submissions: many(submissions),
}));

export const coursesRelations = relations(courses, ({ many }) => ({
  audioParts: many(courseAudioParts),
  progress: many(progress),
}));

export const courseAudioPartsRelations = relations(courseAudioParts, ({ one }) => ({
  course: one(courses, { fields: [courseAudioParts.courseId], references: [courses.id] }),
}));

export const progressRelations = relations(progress, ({ one }) => ({
  user: one(users, { fields: [progress.userId], references: [users.id] }),
  course: one(courses, { fields: [progress.courseId], references: [courses.id] }),
}));

export const themesExerciceRelations = relations(themesExercice, ({ many }) => ({
  submissions: many(submissions),
}));

export const submissionsRelations = relations(submissions, ({ one, many }) => ({
  user: one(users, { fields: [submissions.userId], references: [users.id] }),
  course: one(courses, { fields: [submissions.courseId], references: [courses.id] }),
  theme: one(themesExercice, { fields: [submissions.themeId], references: [themesExercice.id] }),
  feedback: many(adminFeedback),
}));

export const adminFeedbackRelations = relations(adminFeedback, ({ one }) => ({
  submission: one(submissions, { fields: [adminFeedback.submissionId], references: [submissions.id] }),
  admin: one(users, { fields: [adminFeedback.adminId], references: [users.id] }),
}));
