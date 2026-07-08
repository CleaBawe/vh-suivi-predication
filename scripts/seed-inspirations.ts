import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../lib/db/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const data = [
  {
    personnage: "Salomon",
    reference: "Proverbes 16:23",
    versetTexte:
      "Celui qui est sage règle sa conduite, et celui qui a de l'intelligence marche avec prudence. Le cœur du sage rend sa bouche sensée, et augmente l'instruction sur ses lèvres.",
    conseil:
      "La sagesse se prépare dans le cœur avant de sortir par la bouche — prends le temps d'écouter avant de parler.",
  },
  {
    personnage: "David",
    reference: "Psaume 27:14",
    versetTexte:
      "Espère en l'Éternel! Fortifie-toi et que ton cœur s'affermisse! Espère en l'Éternel!",
    conseil:
      "Le trac avant de prêcher se combat par la confiance en Dieu, pas en tes propres capacités.",
  },
  {
    personnage: "Ézéchiel",
    reference: "Ézéchiel 3:10-11",
    versetTexte:
      "Fils de l'homme, reçois dans ton cœur toutes les paroles que je te dis, et écoute-les de tes oreilles! Va vers les captifs, vers les enfants de ton peuple; tu leur parleras...",
    conseil:
      "Reçois le message pour toi-même avant de penser à le transmettre aux autres.",
  },
  {
    personnage: "Jérémie",
    reference: "Jérémie 1:7-9",
    versetTexte:
      "Ne dis pas: Je suis un enfant. Car tu iras vers tous ceux auprès de qui je t'enverrai, et tu diras tout ce que je t'ordonnerai... Voici, je mets mes paroles dans ta bouche.",
    conseil:
      "Ton âge ou ton manque d'expérience ne te disqualifient pas quand c'est Dieu qui t'envoie.",
  },
  {
    personnage: "Paul",
    reference: "2 Timothée 4:2",
    versetTexte:
      "Prêche la parole, insiste en toute occasion, favorable ou non, reprends, censure, exhorte, avec toute douceur et en instruisant.",
    conseil:
      "La constance et la douceur comptent plus que l'éloquence.",
  },
  {
    personnage: "Jésus",
    reference: "Luc 4:18",
    versetTexte:
      "L'Esprit du Seigneur est sur moi, parce qu'il m'a oint pour annoncer une bonne nouvelle aux pauvres...",
    conseil:
      "C'est l'onction, pas la performance, qui porte le message.",
  },
  {
    personnage: "Paul",
    reference: "1 Corinthiens 2:4",
    versetTexte:
      "Et ma parole et ma prédication ne consistaient pas dans les discours persuasifs de la sagesse, mais dans une démonstration d'Esprit et de puissance.",
    conseil:
      "Cherche la simplicité et l'Esprit plutôt que l'éloquence.",
  },
  {
    personnage: "Josué",
    reference: "Josué 1:9",
    versetTexte:
      "Fortifie-toi et prends courage... ne t'effraie point et ne t'épouvante point, car l'Éternel, ton Dieu, est avec toi partout où tu iras.",
    conseil:
      "Avant d'entrer en scène, rappelle-toi que tu n'es pas seul.",
  },
  {
    personnage: "Ésaïe",
    reference: "Ésaïe 6:8",
    versetTexte:
      "Et j'entendis la voix du Seigneur, disant: Qui enverrai-je, et qui marchera pour nous? Je répondis: Me voici, envoie-moi.",
    conseil:
      "La disponibilité compte plus que le talent.",
  },
  {
    personnage: "Moïse",
    reference: "Exode 4:12",
    versetTexte:
      "Va, je serai avec ta bouche, et je t'enseignerai ce que tu auras à dire.",
    conseil:
      "Même si tu te sens incapable de parler, Dieu instruit ceux qu'il envoie.",
  },
];

async function main() {
  const existing = await db.select({ id: schema.inspirations.id }).from(schema.inspirations);
  if (existing.length > 0) {
    console.log(`${existing.length} inspirations déjà présentes — skip.`);
    process.exit(0);
  }
  await db.insert(schema.inspirations).values(data);
  console.log(`✓ ${data.length} inspirations insérées.`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
