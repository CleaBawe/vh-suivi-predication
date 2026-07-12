/**
 * Migration v2 : remplace les colonnes obsolètes de themes_exercice
 *  Retire  : pensee_centrale, fil_conducteur, tips
 *  Ajoute  : cours_correspondant, classe, approche_apotre,
 *            construction_predication, question_coeur
 */
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function columnExists(table: string, col: string): Promise<boolean> {
  const r = await sql`
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = ${table} AND column_name = ${col}
  `;
  return r.length > 0;
}

async function main() {
  console.log("=== Migration themes_exercice v2 ===\n");

  // ── Retirer les anciennes colonnes ──────────────────────────────────────────
  if (await columnExists("themes_exercice", "pensee_centrale")) {
    await sql`ALTER TABLE themes_exercice DROP COLUMN pensee_centrale`;
    console.log('✓ Colonne "pensee_centrale" retirée');
  } else {
    console.log('· Colonne "pensee_centrale" déjà absente');
  }

  if (await columnExists("themes_exercice", "fil_conducteur")) {
    await sql`ALTER TABLE themes_exercice DROP COLUMN fil_conducteur`;
    console.log('✓ Colonne "fil_conducteur" retirée');
  } else {
    console.log('· Colonne "fil_conducteur" déjà absente');
  }

  if (await columnExists("themes_exercice", "tips")) {
    await sql`ALTER TABLE themes_exercice DROP COLUMN tips`;
    console.log('✓ Colonne "tips" retirée');
  } else {
    console.log('· Colonne "tips" déjà absente');
  }

  // ── Ajouter les nouvelles colonnes ──────────────────────────────────────────
  if (!(await columnExists("themes_exercice", "cours_correspondant"))) {
    await sql`ALTER TABLE themes_exercice ADD COLUMN cours_correspondant TEXT NOT NULL DEFAULT ''`;
    console.log('✓ Colonne "cours_correspondant" ajoutée');
  } else {
    console.log('· Colonne "cours_correspondant" déjà présente');
  }

  if (!(await columnExists("themes_exercice", "classe"))) {
    await sql`ALTER TABLE themes_exercice ADD COLUMN classe VARCHAR(100) NOT NULL DEFAULT ''`;
    console.log('✓ Colonne "classe" ajoutée');
  } else {
    console.log('· Colonne "classe" déjà présente');
  }

  if (!(await columnExists("themes_exercice", "approche_apotre"))) {
    await sql`ALTER TABLE themes_exercice ADD COLUMN approche_apotre TEXT NOT NULL DEFAULT ''`;
    console.log('✓ Colonne "approche_apotre" ajoutée');
  } else {
    console.log('· Colonne "approche_apotre" déjà présente');
  }

  if (!(await columnExists("themes_exercice", "construction_predication"))) {
    await sql`ALTER TABLE themes_exercice ADD COLUMN construction_predication TEXT NOT NULL DEFAULT ''`;
    console.log('✓ Colonne "construction_predication" ajoutée');
  } else {
    console.log('· Colonne "construction_predication" déjà présente');
  }

  if (!(await columnExists("themes_exercice", "question_coeur"))) {
    await sql`ALTER TABLE themes_exercice ADD COLUMN question_coeur TEXT NOT NULL DEFAULT ''`;
    console.log('✓ Colonne "question_coeur" ajoutée');
  } else {
    console.log('· Colonne "question_coeur" déjà présente');
  }

  // ── Vérification finale ─────────────────────────────────────────────────────
  const cols = await sql`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'themes_exercice'
    ORDER BY ordinal_position
  `;
  console.log("\n=== themes_exercice (colonnes après migration) ===");
  for (const c of cols) console.log(`  ${c.column_name}  (${c.data_type})`);

  console.log("\n✅ Migration v2 terminée.");
  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });
