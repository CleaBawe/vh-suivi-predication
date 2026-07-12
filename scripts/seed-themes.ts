import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../lib/db/schema";
import themesData from "../docs/themes_exercice.json";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function main() {
  console.log("=== Seed thèmes d'exercice ===");

  const existing = await db.select().from(schema.themesExercice);
  if (existing.length > 0) {
    console.log(`${existing.length} thèmes déjà présents — suppression et remplacement.`);
    await db.delete(schema.themesExercice);
  }

  for (const t of themesData.themes) {
    await db.insert(schema.themesExercice).values({
      titre: t.titre,
      penseeCentrale: t.pensee_centrale,
      personnageBiblique: t.personnage_biblique,
      versetsBase: t.versets_base,
      filConducteur: t.fil_conducteur,
      tips: t.tips,
    });
    console.log(`  ✓ ${t.titre}`);
  }

  console.log(`\n✅ ${themesData.themes.length} thèmes insérés.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
