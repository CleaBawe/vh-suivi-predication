"use client";

import { useActionState } from "react";
import { createAdminAction } from "@/lib/auth/actions";

export function CreateAdminForm() {
  const [error, action, isPending] = useActionState(createAdminAction, null);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Matricule <span className="text-red-500">*</span>
        </label>
        <input
          name="matricule"
          type="text"
          required
          autoComplete="off"
          className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-base uppercase focus:border-vh-green-500 focus:outline-none focus:ring-2 focus:ring-vh-green-100"
          placeholder="ex. ADM001"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Nom (optionnel)
        </label>
        <input
          name="nom"
          type="text"
          autoComplete="name"
          className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-base focus:border-vh-green-500 focus:outline-none focus:ring-2 focus:ring-vh-green-100"
          placeholder="Nom complet"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Mot de passe <span className="text-red-500">*</span>
        </label>
        <input
          name="password"
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
          Confirmer le mot de passe <span className="text-red-500">*</span>
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
        className="mt-2 w-full rounded-2xl bg-vh-green-600 py-3 px-4 text-base font-semibold text-white transition-transform active:scale-95 disabled:opacity-60"
      >
        {isPending ? "Création…" : "Créer le compte admin"}
      </button>
    </form>
  );
}
