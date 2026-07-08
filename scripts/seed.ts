import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { hash } from "bcryptjs";
import * as schema from "../lib/db/schema";
import coursesData from "../docs/courses_seed.json";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

type CourseEntry = {
  classe?: number;
  numero?: number;
  titre: string;
  type: "officiel" | "orientation" | "bonus";
  audio: string[];
  note?: string | null;
};

async function seedAdmin() {
  const matricule = process.env.ADMIN_MATRICULE!;
  const password = process.env.ADMIN_PASSWORD!;
  const passwordHash = await hash(password, 12);

  const existing = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.matricule, matricule),
  });

  if (existing) {
    console.log(`Admin "${matricule}" already exists — skipping.`);
    return;
  }

  await db.insert(schema.users).values({
    matricule,
    passwordHash,
    role: "admin",
    nom: "Administrateur",
  });

  console.log(`✓ Admin "${matricule}" created.`);
}

async function seedCourses(entries: CourseEntry[]) {
  for (const entry of entries) {
    const statutAudio =
      entry.audio.length === 0 ? "manquant" : "ok";

    const [course] = await db
      .insert(schema.courses)
      .values({
        classe: entry.classe ?? null,
        numero: entry.numero ?? null,
        titre: entry.titre,
        type: entry.type,
        statutAudio,
      })
      .onConflictDoNothing()
      .returning();

    if (!course) {
      console.log(`  skipped (conflict): ${entry.titre}`);
      continue;
    }

    if (entry.audio.length > 0) {
      await db.insert(schema.courseAudioParts).values(
        entry.audio.map((url, i) => ({
          courseId: course.id,
          ordre: i + 1,
          url,
        }))
      );
    }

    console.log(
      `  ✓ ${entry.titre} (${entry.audio.length} partie(s)${entry.note ? " — NOTE: " + entry.note : ""})`
    );
  }
}

async function main() {
  console.log("=== Seed admin ===");
  await seedAdmin();

  console.log("\n=== Seed orientation ===");
  await seedCourses(coursesData.orientation as CourseEntry[]);

  console.log("\n=== Seed cours officiels ===");
  await seedCourses(coursesData.courses as CourseEntry[]);

  console.log("\n=== Seed cours bonus ===");
  await seedCourses(coursesData.bonus as CourseEntry[]);

  console.log("\n✅ Seed terminé.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
