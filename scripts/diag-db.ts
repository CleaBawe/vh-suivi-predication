import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  // Progress records
  const prog = await sql`SELECT COUNT(*) as n, COUNT(*) FILTER (WHERE done) as done FROM progress`;
  console.log(`\n=== progress: ${prog[0].n} lignes (${prog[0].done} écoutés) ===`);

  const progSample = await sql`
    SELECT p.user_id, p.course_id, p.done, p.verset IS NOT NULL as has_verset, p.notes IS NOT NULL as has_notes
    FROM progress p ORDER BY p.updated_at DESC LIMIT 10
  `;
  for (const r of progSample) {
    console.log(`  user=${r.user_id} course=${r.course_id} done=${r.done} verset=${r.has_verset} notes=${r.has_notes}`);
  }

  // Submissions
  const subs = await sql`
    SELECT COUNT(*) as total,
           COUNT(*) FILTER (WHERE partage_communaute) as shared,
           COUNT(*) FILTER (WHERE course_id IS NOT NULL) as with_course,
           COUNT(*) FILTER (WHERE theme_id IS NOT NULL) as with_theme,
           COUNT(*) FILTER (WHERE course_id IS NULL AND theme_id IS NULL) as orphan
    FROM submissions
  `;
  const s = subs[0];
  console.log(`\n=== submissions: ${s.total} total, ${s.shared} partagées, ${s.with_course} cours, ${s.with_theme} thèmes, ${s.orphan} orphelines ===`);

  const subSample = await sql`
    SELECT id, user_id, course_id, theme_id, type, partage_communaute, created_at
    FROM submissions ORDER BY created_at DESC LIMIT 10
  `;
  for (const r of subSample) {
    console.log(`  id=${r.id} user=${r.user_id} course=${r.course_id ?? '-'} theme=${r.theme_id ?? '-'} type=${r.type} partage=${r.partage_communaute}`);
  }

  // Community query simulation
  const community = await sql`
    SELECT s.id, s.type, s.partage_communaute,
           c.titre as course_titre, te.titre as theme_titre
    FROM submissions s
    INNER JOIN users u ON s.user_id = u.id
    LEFT JOIN courses c ON s.course_id = c.id
    LEFT JOIN themes_exercice te ON s.theme_id = te.id
    WHERE s.partage_communaute = true
    ORDER BY s.created_at DESC
    LIMIT 20
  `;
  console.log(`\n=== communauté query: ${community.length} résultats ===`);
  for (const r of community) {
    const source = r.course_titre ?? r.theme_titre ?? 'ORPHELIN';
    console.log(`  id=${r.id} [${r.type}] "${source}"`);
  }

  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });
