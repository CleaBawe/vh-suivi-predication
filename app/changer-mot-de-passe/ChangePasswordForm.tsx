"use client";

import { useActionState } from "react";
import { changePasswordAction } from "@/lib/auth/actions";

export function ChangePasswordForm() {
  const [error, action, isPending] = useActionState(changePasswordAction, null);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Choisir un nouveau mot de passe
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Votre administrateur vous a assigné un mot de passe temporaire.
          Choisissez un mot de passe personnel pour continuer.
        </p>
      </div>

      <form action={action} className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Nouveau mot de passe
          </label>
          <input
            name="newPassword"
            type="password"
            required
            autoComplete="new-password"
            minLength={6}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-base focus:border-vh-green-500 focus:outline-none focus:ring-2 focus:ring-vh-green-100"
            placeholder="6 caractères minimum"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Confirmer le mot de passe
          </label>
          <input
            name="confirm"
            type="password"
            required
            autoComplete="new-password"
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-base focus:border-vh-green-500 focus:outline-none focus:ring-2 focus:ring-vh-green-100"
            placeholder="Répétez le mot de passe"
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
          className="mt-2 w-full rounded-2xl bg-vh-green-600 py-4 text-lg font-semibold text-white transition-transform active:scale-95 disabled:opacity-60"
        >
          {isPending ? "Enregistrement…" : "Enregistrer"}
        </button>
      </form>
    </div>
  );
}
