"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerAction } from "@/lib/auth/actions";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/Logo";

export function RegisterForm() {
  const [error, action, isPending] = useActionState(registerAction, null);

  return (
    <div className="flex flex-1 flex-col justify-between px-5 py-8">
      <div className="space-y-6">
        <div className="flex justify-center pb-2">
          <Logo />
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-vh-green-300"
        >
          <ChevronLeft />
          Retour
        </Link>

        {/* Form card */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-xl font-bold text-gray-900">Créer un compte</h1>
          <p className="mt-0.5 text-sm text-gray-500">Réservé aux étudiants de la Classe 4</p>

          <form action={action} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Matricule <span className="text-red-400">*</span>
              </label>
              <input
                name="matricule"
                required
                autoCapitalize="characters"
                autoComplete="username"
                placeholder="Ex. VH-C4-001"
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900 placeholder-gray-400 focus:border-vh-green-500 focus:outline-none focus:ring-2 focus:ring-vh-green-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Nom / Prénom{" "}
                <span className="text-xs font-normal text-gray-400">(facultatif)</span>
              </label>
              <input
                name="nom"
                autoComplete="name"
                placeholder="Votre nom"
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900 placeholder-gray-400 focus:border-vh-green-500 focus:outline-none focus:ring-2 focus:ring-vh-green-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Mot de passe <span className="text-red-400">*</span>
              </label>
              <input
                name="password"
                type="password"
                required
                autoComplete="new-password"
                minLength={6}
                placeholder="6 caractères minimum"
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900 placeholder-gray-400 focus:border-vh-green-500 focus:outline-none focus:ring-2 focus:ring-vh-green-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Confirmer le mot de passe <span className="text-red-400">*</span>
              </label>
              <input
                name="confirm"
                type="password"
                required
                autoComplete="new-password"
                placeholder="Répétez le mot de passe"
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900 placeholder-gray-400 focus:border-vh-green-500 focus:outline-none focus:ring-2 focus:ring-vh-green-100"
              />
            </div>

            {error && (
              <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="mt-2 w-full rounded-2xl bg-vh-green-600 py-4 text-base font-semibold text-white transition-transform active:scale-95 disabled:opacity-60"
            >
              {isPending ? "Création…" : "Créer mon compte"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-vh-green-300">
          Déjà un compte ?{" "}
          <Link href="/login" className="font-medium text-white underline underline-offset-2">
            Se connecter
          </Link>
        </p>
      </div>

      <Footer dark />
    </div>
  );
}

function ChevronLeft() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}
