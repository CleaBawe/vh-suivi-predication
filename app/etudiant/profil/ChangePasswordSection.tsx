"use client";

import { useRef, useState } from "react";
import { changeOwnPasswordAction } from "@/lib/auth/actions";

export function ChangePasswordSection() {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    const result = await changeOwnPasswordAction(formData);

    if ("ok" in result) {
      setStatus("success");
      formRef.current?.reset();
    } else {
      setStatus("error");
      setErrorMsg(result.error);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 space-y-4">
      <h2 className="font-semibold text-gray-900">Changer le mot de passe</h2>

      {status === "success" && (
        <p className="rounded-2xl border border-vh-green-200 bg-vh-green-50 px-4 py-3 text-sm font-medium text-vh-green-700">
          Mot de passe mis à jour
        </p>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Mot de passe actuel
          </label>
          <input
            name="currentPassword"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-base focus:border-vh-green-500 focus:outline-none focus:ring-2 focus:ring-vh-green-100"
            placeholder="Votre mot de passe actuel"
          />
        </div>

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
            Confirmer le nouveau mot de passe
          </label>
          <input
            name="confirm"
            type="password"
            required
            autoComplete="new-password"
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-base focus:border-vh-green-500 focus:outline-none focus:ring-2 focus:ring-vh-green-100"
            placeholder="Répétez le nouveau mot de passe"
          />
        </div>

        {status === "error" && errorMsg && (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {errorMsg}
          </p>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className="mt-1 w-full rounded-2xl bg-vh-green-600 py-3 px-4 text-base font-semibold text-white transition-transform active:scale-95 disabled:opacity-60"
        >
          {status === "loading" ? "Enregistrement…" : "Mettre à jour le mot de passe"}
        </button>
      </form>
    </div>
  );
}
