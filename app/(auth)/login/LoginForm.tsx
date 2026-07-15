"use client";

import Link from "next/link";
import { useState } from "react";
import { useActionState } from "react";
import { loginAction } from "@/lib/auth/actions";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/Logo";

export function LoginForm() {
  const [error, action, isPending] = useActionState(loginAction, null);
  const [showForgot, setShowForgot] = useState(false);

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
          <h1 className="text-xl font-bold text-gray-900">Connexion</h1>
          <p className="mt-0.5 text-sm text-gray-500">École Porteur de Vie — Classe 4</p>

          <form action={action} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Matricule
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
                Mot de passe
              </label>
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="Votre mot de passe"
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900 placeholder-gray-400 focus:border-vh-green-500 focus:outline-none focus:ring-2 focus:ring-vh-green-100"
              />
              <button
                type="button"
                onClick={() => setShowForgot((v) => !v)}
                className="mt-2 text-xs text-gray-400 underline underline-offset-2 hover:text-gray-600"
              >
                Mot de passe oublié ?
              </button>
            </div>

            {showForgot && (
              <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                Contactez l&apos;administrateur de la plateforme pour réinitialiser votre mot de passe.
              </div>
            )}

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
              {isPending ? "Connexion…" : "Se connecter"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-vh-green-300">
          Pas encore de compte ?{" "}
          <Link href="/register" className="font-medium text-white underline underline-offset-2">
            Créer un compte
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
