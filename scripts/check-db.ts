import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  // Tables présentes
  const tables = await sql`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `;
  console.log("=== Tables ===");
  for (const t of tables) console.log(" ", t.table_name);

  // Colonnes de submissions
  const cols = await sql`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'submissions' AND table_schema = 'public'
    ORDER BY ordinal_position
  `;
  console.log("\n=== submissions columns ===");
  for (const c of cols) console.log(`  ${c.column_name} (${c.data_type}, nullable=${c.is_nullable})`);

  // Contraintes sur progress
  const constraints = await sql`
    SELECT constraint_name, constraint_type
    FROM information_schema.table_constraints
    WHERE table_name = 'progress' AND table_schema = 'public'
  `;
  console.log("\n=== progress constraints ===");
  for (const c of constraints) console.log(`  ${c.constraint_name} (${c.constraint_type})`);

  // Lignes dans themes_exercice
  try {
    const count = await sql`SELECT COUNT(*) FROM themes_exercice`;
    console.log(`\n=== themes_exercice: ${count[0].count} lignes ===`);
  } catch {
    console.log("\n=== themes_exercice: table absente ===");
  }

  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });
