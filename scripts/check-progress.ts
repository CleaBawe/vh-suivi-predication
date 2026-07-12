import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  // 1. Check if unique constraint exists on progress
  const constraints = await sql`
    SELECT constraint_name, constraint_type
    FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'progress'
      AND constraint_type = 'UNIQUE'
  `;
  console.log("=== Contraintes UNIQUE sur progress ===");
  if (constraints.length === 0) {
    console.log("  ⚠️  AUCUNE contrainte unique trouvée !");
  } else {
    for (const c of constraints) console.log(`  ✓ ${c.constraint_name}`);
  }

  // 2. Check for duplicate (user_id, course_id) pairs
  const dupes = await sql`
    SELECT user_id, course_id, COUNT(*) as n
    FROM progress
    GROUP BY user_id, course_id
    HAVING COUNT(*) > 1
  `;
  console.log(`\n=== Doublons dans progress: ${dupes.length} ===`);
  for (const d of dupes) {
    console.log(`  user=${d.user_id} course=${d.course_id} → ${d.n} lignes`);
  }

  // 3. Show all progress rows (to understand data shape)
  const rows = await sql`
    SELECT id, user_id, course_id, done, verset IS NOT NULL as has_verset, notes IS NOT NULL as has_notes, updated_at
    FROM progress
    ORDER BY user_id, course_id, updated_at DESC
    LIMIT 20
  `;
  console.log(`\n=== progress (20 premières lignes) ===`);
  for (const r of rows) {
    console.log(`  id=${r.id} user=${r.user_id} course=${r.course_id} done=${r.done} verset=${r.has_verset} notes=${r.has_notes}`);
  }

  // 4. Check submissions table structure
  const subCols = await sql`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'submissions'
    ORDER BY ordinal_position
  `;
  console.log("\n=== submissions (colonnes) ===");
  for (const c of subCols) {
    console.log(`  ${c.column_name} (${c.data_type}, nullable=${c.is_nullable})`);
  }

  // 5. Check users
  const users = await sql`SELECT id, matricule, role FROM users LIMIT 10`;
  console.log("\n=== users ===");
  for (const u of users) {
    console.log(`  id=${u.id} matricule=${u.matricule} role=${u.role}`);
  }

  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });
