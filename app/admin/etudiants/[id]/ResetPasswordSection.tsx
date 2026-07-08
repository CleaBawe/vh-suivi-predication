"use client";

import { useState } from "react";
import { resetStudentPasswordAction } from "@/lib/auth/actions";

type State = "idle" | "confirm" | "done" | "error";

type Props = {
  studentId: number;
  mustChangePassword: boolean;
};

export function ResetPasswordSection({ studentId, mustChangePassword }: Props) {
  const [state, setState] = useState<State>("idle");
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    const result = await resetStudentPasswordAction(studentId);
    setLoading(false);

    if ("tempPassword" in result) {
      setTempPassword(result.tempPassword);
      setState("done");
    } else {
      setErrorMsg(result.error);
      setState("error");
    }
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 space-y-3">
      <h2 className="font-semibold text-gray-900">Mot de passe</h2>

      {mustChangePassword && state === "idle" && (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Mot de passe temporaire en attente de changement
        </p>
      )}

      {state === "idle" && (
        <button
          onClick={() => setState("confirm")}
          className="w-full rounded-2xl border border-gray-200 py-3 px-4 text-sm font-semibold text-gray-700 transition-transform active:scale-95"
        >
          Réinitialiser le mot de passe
        </button>
      )}

      {state === "confirm" && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Un mot de passe temporaire à 6 chiffres sera généré et l&apos;étudiant devra le changer à la prochaine connexion. Cette action est irréversible.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setState("idle")}
              disabled={loading}
              className="flex-1 rounded-2xl border border-gray-200 py-3 px-4 text-sm font-semibold text-gray-600 transition-transform active:scale-95 disabled:opacity-60"
            >
              Annuler
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 rounded-2xl bg-red-500 py-3 px-4 text-sm font-semibold text-white transition-transform active:scale-95 disabled:opacity-60"
            >
              {loading ? "En cours…" : "Confirmer"}
            </button>
          </div>
        </div>
      )}

      {state === "done" && tempPassword && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Mot de passe temporaire généré. Communiquez-le à l&apos;étudiant :
          </p>
          <div className="rounded-2xl bg-vh-green-50 border border-vh-green-200 px-4 py-3 text-center">
            <p className="text-2xl font-bold tracking-widest text-vh-green-700">{tempPassword}</p>
            <p className="mt-1 text-xs text-vh-green-600">Appuyez pour copier</p>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(tempPassword)}
            className="w-full rounded-2xl border border-vh-green-200 py-2 px-4 text-sm font-medium text-vh-green-700 transition-transform active:scale-95"
          >
            Copier le mot de passe
          </button>
        </div>
      )}

      {state === "error" && (
        <div className="space-y-3">
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {errorMsg}
          </p>
          <button
            onClick={() => setState("idle")}
            className="text-sm font-medium text-gray-600 underline"
          >
            Réessayer
          </button>
        </div>
      )}
    </div>
  );
}
