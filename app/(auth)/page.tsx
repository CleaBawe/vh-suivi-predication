import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/Logo";

export const metadata = {
  title: "Suivi Prédication — Classe 4",
};

export default async function HomePage() {
  const session = await getSession();
  if (session) {
    redirect(
      session.mustChangePassword
        ? "/changer-mot-de-passe"
        : session.role === "admin"
          ? "/admin"
          : "/etudiant"
    );
  }

  return (
    <main className="flex flex-1 flex-col justify-between px-6 py-12">
      {/* Branding */}
      <div className="flex flex-col items-center gap-3 text-center text-white">
        <div className="mb-2">
          <Logo />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-vh-green-300">
          École Porteur de Vie — Vases d&apos;Honneur
        </p>
        <h1 className="text-4xl font-bold tracking-tight">Suivi Prédication</h1>
        <p className="text-sm text-vh-green-200">Campus Afrique · Classe 4</p>
        <p className="mt-3 max-w-xs text-sm italic leading-relaxed text-white/60">
          «&nbsp;Équipe-toi pour porter la Parole avec excellence&nbsp;»
        </p>
      </div>

      {/* CTAs */}
      <div className="space-y-3">
        <Link
          href="/login"
          className="block w-full rounded-2xl bg-white py-4 text-center text-lg font-semibold text-vh-green-950 transition-transform active:scale-95"
        >
          Se connecter
        </Link>
        <Link
          href="/register"
          className="block w-full rounded-2xl border-2 border-white/30 py-4 text-center text-lg font-semibold text-white transition-transform active:scale-95"
        >
          Créer un compte
        </Link>
      </div>

      <Footer dark />
    </main>
  );
}
