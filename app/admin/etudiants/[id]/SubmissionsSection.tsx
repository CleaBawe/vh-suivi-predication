"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addFeedbackAction } from "@/lib/admin/actions";
import type { StudentDetailSubmission } from "@/lib/admin/queries";

type Props = {
  submissions: StudentDetailSubmission[];
};

function formatDate(date: Date): string {
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Hier";
  if (days < 30) return `Il y a ${days} jours`;
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

function SubmissionCard({ sub }: { sub: StudentDetailSubmission }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [sending, setSending] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const classeLabel = sub.courseClasse ? `Classe ${sub.courseClasse}` : null;

  async function handleSendFeedback() {
    if (!feedbackText.trim()) return;
    setSending(true);
    setFeedbackError(null);

    const result = await addFeedbackAction(sub.id, feedbackText);
    setSending(false);

    if ("ok" in result) {
      setFeedbackText("");
      router.refresh();
    } else {
      setFeedbackError(result.error);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            {classeLabel && (
              <span className="rounded-full bg-vh-green-100 px-2 py-0.5 text-xs font-medium text-vh-green-700">
                {classeLabel}
              </span>
            )}
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                sub.type === "audio"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {sub.type === "audio" ? "Audio" : "Texte"}
            </span>
          </div>
          <p className="mt-1 text-sm font-medium text-gray-900 leading-tight">
            {sub.courseTitre}
          </p>
        </div>
        <p className="shrink-0 text-xs text-gray-400">{formatDate(sub.createdAt)}</p>
      </div>

      {/* Verset porteur */}
      {sub.versetPorteur && (
        <p className="text-xs italic text-vh-green-600 border-l-2 border-vh-green-200 pl-2">
          {sub.versetPorteur}
        </p>
      )}

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="text-xs font-medium text-vh-green-600 active:text-vh-green-800"
      >
        {expanded ? "Masquer le contenu" : "Voir le contenu"}
      </button>

      {/* Content */}
      {expanded && (
        <div>
          {sub.type === "audio" ? (
            <audio
              controls
              src={sub.contenuOuUrl}
              className="w-full"
              style={{ height: 40 }}
              preload="none"
            />
          ) : (
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-2xl p-3">
              {sub.contenuOuUrl}
            </p>
          )}
        </div>
      )}

      {/* Existing feedback */}
      {sub.feedback.length > 0 && (
        <div className="space-y-2 border-t border-gray-100 pt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Retours
          </p>
          {sub.feedback.map((f) => (
            <div key={f.id} className="rounded-2xl bg-vh-green-50 border border-vh-green-100 px-3 py-2.5">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium text-vh-green-700">
                  {f.adminNom || f.adminMatricule}
                </p>
                <p className="text-xs text-gray-400">{formatDate(f.createdAt)}</p>
              </div>
              <p className="text-sm text-gray-700">{f.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Add feedback form */}
      <div className="space-y-2 border-t border-gray-100 pt-3">
        <textarea
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          placeholder="Ajouter un retour…"
          rows={3}
          className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 focus:border-vh-green-400 focus:outline-none focus:ring-2 focus:ring-vh-green-100"
        />
        {feedbackError && (
          <p className="text-xs text-red-600">{feedbackError}</p>
        )}
        <button
          onClick={handleSendFeedback}
          disabled={sending || !feedbackText.trim()}
          className="w-full rounded-2xl bg-vh-green-600 py-3 px-4 text-sm font-semibold text-white transition-transform active:scale-95 disabled:opacity-60"
        >
          {sending ? "Envoi…" : "Envoyer le retour"}
        </button>
      </div>
    </div>
  );
}

export function SubmissionsSection({ submissions }: Props) {
  if (submissions.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-5">
        <h2 className="font-semibold text-gray-900 mb-3">Entraînements</h2>
        <p className="text-sm text-gray-400">Aucun entraînement soumis.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="font-semibold text-gray-900">
        Entraînements ({submissions.length})
      </h2>
      {submissions.map((sub) => (
        <SubmissionCard key={sub.id} sub={sub} />
      ))}
    </div>
  );
}
