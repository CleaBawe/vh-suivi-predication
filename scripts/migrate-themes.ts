/**
 * Migration ciblée :
 *  1. Crée la table themes_exercice
 *  2. Rend submissions.course_id nullable
 *  3. Ajoute submissions.theme_id (FK vers themes_exercice)
 */
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  console.log("=== Migration themes_exercice ===\n");

  // 1. Créer themes_exercice
  await sql`
    CREATE TABLE IF NOT EXISTS themes_exercice (
      id               serial PRIMARY KEY,
      titre            varchar(200) NOT NULL,
      pensee_centrale  varchar(300) NOT NULL,
      personnage_biblique varchar(100) NOT NULL,
      versets_base     text[]       NOT NULL,
      fil_conducteur   text         NOT NULL,
      tips             text[]       NOT NULL
    )
  `;
  console.log("✓ Table themes_exercice créée (ou déjà existante)");

  // 2. Rendre course_id nullable dans submissions
  await sql`
    ALTER TABLE submissions
      ALTER COLUMN course_id DROP NOT NULL
  `;
  console.log("✓ submissions.course_id rendu nullable");

  // 3. Ajouter theme_id s'il n'existe pas
  const col = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'submissions' AND column_name = 'theme_id' AND table_schema = 'public'
  `;
  if (col.length === 0) {
    await sql`
      ALTER TABLE submissions
        ADD COLUMN theme_id integer REFERENCES themes_exercice(id) ON DELETE CASCADE
    `;
    console.log("✓ submissions.theme_id ajouté avec FK");
  } else {
    console.log("· submissions.theme_id déjà présent — ignoré");
  }

  // Vérification finale
  const cols = await sql`
    SELECT column_name, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'submissions' AND table_schema = 'public'
    ORDER BY ordinal_position
  `;
  console.log("\n=== submissions (après migration) ===");
  for (const c of cols) console.log(`  ${c.column_name}  nullable=${c.is_nullable}`);

  console.log("\n✅ Migration terminée.");
  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });
