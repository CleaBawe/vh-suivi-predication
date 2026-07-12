import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  const r = await sql`SELECT COUNT(*) as n, array_agg(titre ORDER BY id) as titres FROM themes_exercice`;
  console.log(`themes_exercice : ${r[0].n} lignes`);
  for (const t of r[0].titres as string[]) console.log(` · ${t}`);
  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });
