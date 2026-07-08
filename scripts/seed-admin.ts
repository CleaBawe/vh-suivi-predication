import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { hash } from "bcryptjs";
import * as schema from "../lib/db/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function main() {
  const matricule = process.env.ADMIN_MATRICULE;
  const password = process.env.ADMIN_PASSWORD;

  if (!matricule || !password) {
    console.error("ADMIN_MATRICULE et ADMIN_PASSWORD sont requis dans .env.local");
    process.exit(1);
  }

  const existing = await db.query.users.findFirst({
    where: eq(schema.users.matricule, matricule),
  });

  if (existing) {
    console.log(`Admin "${matricule}" existe déjà — aucune modification.`);
    process.exit(0);
  }

  const passwordHash = await hash(password, 12);
  await db.insert(schema.users).values({
    matricule,
    passwordHash,
    role: "admin",
    nom: "Administrateur",
  });

  console.log(`✓ Compte admin "${matricule}" créé.`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
