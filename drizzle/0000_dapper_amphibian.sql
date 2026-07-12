CREATE TYPE "public"."audio_status" AS ENUM('ok', 'manquant', 'en_attente');--> statement-breakpoint
CREATE TYPE "public"."course_type" AS ENUM('officiel', 'orientation', 'bonus');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('student', 'admin');--> statement-breakpoint
CREATE TYPE "public"."submission_type" AS ENUM('audio', 'texte');--> statement-breakpoint
CREATE TABLE "admin_feedback" (
	"id" serial PRIMARY KEY NOT NULL,
	"submission_id" integer NOT NULL,
	"admin_id" integer NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_audio_parts" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_id" integer NOT NULL,
	"ordre" integer NOT NULL,
	"url" text NOT NULL,
	"titre" varchar(200)
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" serial PRIMARY KEY NOT NULL,
	"classe" integer,
	"numero" integer,
	"titre" varchar(200) NOT NULL,
	"type" "course_type" NOT NULL,
	"statut_audio" "audio_status" DEFAULT 'ok' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inspirations" (
	"id" serial PRIMARY KEY NOT NULL,
	"personnage" varchar(100) NOT NULL,
	"reference" varchar(150) NOT NULL,
	"verset_texte" text NOT NULL,
	"conseil" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"course_id" integer NOT NULL,
	"done" boolean DEFAULT false NOT NULL,
	"verset" text,
	"notes" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "progress_user_course_unique" UNIQUE("user_id","course_id")
);
--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"course_id" integer,
	"theme_id" integer,
	"type" "submission_type" NOT NULL,
	"contenu_ou_url" text NOT NULL,
	"partage_communaute" boolean DEFAULT true NOT NULL,
	"verset_porteur" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "themes_exercice" (
	"id" serial PRIMARY KEY NOT NULL,
	"titre" varchar(200) NOT NULL,
	"pensee_centrale" varchar(300) NOT NULL,
	"personnage_biblique" varchar(100) NOT NULL,
	"versets_base" text[] NOT NULL,
	"fil_conducteur" text NOT NULL,
	"tips" text[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"matricule" varchar(50) NOT NULL,
	"password_hash" text NOT NULL,
	"role" "role" DEFAULT 'student' NOT NULL,
	"nom" varchar(100),
	"must_change_password" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_matricule_unique" UNIQUE("matricule")
);
--> statement-breakpoint
ALTER TABLE "admin_feedback" ADD CONSTRAINT "admin_feedback_submission_id_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_feedback" ADD CONSTRAINT "admin_feedback_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_audio_parts" ADD CONSTRAINT "course_audio_parts_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progress" ADD CONSTRAINT "progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progress" ADD CONSTRAINT "progress_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_theme_id_themes_exercice_id_fk" FOREIGN KEY ("theme_id") REFERENCES "public"."themes_exercice"("id") ON DELETE cascade ON UPDATE no action;