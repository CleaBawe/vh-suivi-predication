"use client";

import { useState } from "react";
import type { CommunauteSubmission } from "@/lib/courses/queries";

type Props = {
  submissions: CommunauteSubmission[];
};

type ClasseFilter = "tous" | "exercice" | "orientation" | 1 | 2 | 3 | 4;

function formatDate(date: Date): string {
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Hier";
  if (days < 7) return `Il y a ${days} jours`;
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function SubmissionCard({ s }: { s: CommunauteSubmission }) {
  const [expanded, setExpanded] = useState(false);
  const author = s.auteurNom || s.auteurMatricule;

  let sourceLabel: string;
  let sourceTitle: string;

  if (s.themeId) {
    sourceLabel = "Exercice";
    sourceTitle = s.themeTitre ?? "";
  } else {
    sourceLabel =
      s.courseType === "orientation"
        ? "Orientation"
        : s.courseClasse
        ? `Classe ${s.courseClasse}`
        : "";
    sourceTitle = s.courseTitre ?? "";
  }

  const isLong = s.type === "texte" && s.contenuOuUrl.length > 200;
  const isExercice = !!s.themeId;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">{author}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {sourceLabel && (
              <span className={`font-medium ${isExercice ? "text-vh-gold-500" : "text-vh-green-500"}`}>
                {sourceLabel}
                {sourceTitle ? " · " : ""}
              </span>
            )}
            {sourceTitle}
          </p>
        </div>
        <p className="text-xs text-gray-400 shrink-0 mt-0.5">{formatDate(s.createdAt)}</p>
      </div>

      {s.versetPorteur && (
        <p className="text-xs text-vh-green-600 italic border-l-2 border-vh-green-200 pl-2">
          {s.versetPorteur}
        </p>
      )}

      {s.type === "audio" ? (
        <audio
          controls
          src={s.contenuOuUrl}
          className="w-full"
          style={{ height: 40 }}
          preload="none"
        />
      ) : (
        <div>
          <p
            className={`text-sm text-gray-700 whitespace-pre-wrap leading-relaxed ${
              !expanded && isLong ? "line-clamp-4" : ""
            }`}
          >
            {s.contenuOuUrl}
          </p>
          {isLong && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="mt-1 text-xs font-medium text-vh-green-600 active:text-vh-green-800"
            >
              {expanded ? "Voir moins" : "Lire la suite"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function CommunauteClient({ submissions }: Props) {
  const [classeFilter, setClasseFilter] = useState<ClasseFilter>("tous");
  const [courseFilter, setCourseFilter] = useState<number | "tous">("tous");

  const classeOptions: { value: ClasseFilter; label: string }[] = [
    { value: "tous", label: "Tous" },
    { value: "exercice", label: "Exercice" },
    { value: "orientation", label: "Orientation" },
    { value: 1, label: "Classe 1" },
    { value: 2, label: "Classe 2" },
    { value: 3, label: "Classe 3" },
    { value: 4, label: "Classe 4" },
  ];

  const coursesInFilter = Array.from(
    new Map(
      submissions
        .filter((s) => {
          if (classeFilter === "tous") return true;
          if (classeFilter === "exercice") return !!s.themeId;
          if (classeFilter === "orientation") return s.courseType === "orientation";
          return s.courseClasse === classeFilter;
        })
        .filter((s) => !s.themeId) // course submissions only for dropdown
        .map((s) => [s.courseId, { id: s.courseId!, titre: s.courseTitre! }])
    ).values()
  ).sort((a, b) => a.titre.localeCompare(b.titre));

  const filtered = submissions.filter((s) => {
    if (classeFilter === "exercice") return !!s.themeId;
    if (s.themeId) return classeFilter === "tous"; // theme submissions only show under "Tous"
    if (classeFilter !== "tous") {
      if (classeFilter === "orientation" && s.courseType !== "orientation") return false;
      if (typeof classeFilter === "number" && s.courseClasse !== classeFilter) return false;
    }
    if (courseFilter !== "tous" && s.courseId !== courseFilter) return false;
    return true;
  });

  const handleClasseChange = (val: ClasseFilter) => {
    setClasseFilter(val);
    setCourseFilter("tous");
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Filters */}
      <div className="sticky top-0 z-10 bg-gray-50 px-4 pt-2 pb-2">
        <div className="rounded-2xl bg-white border border-gray-100 px-4 py-3 space-y-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-0.5">
            {classeOptions.map(({ value, label }) => (
              <button
                key={String(value)}
                onClick={() => handleClasseChange(value)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  classeFilter === value
                    ? value === "exercice"
                      ? "bg-vh-gold-500 text-white"
                      : "bg-vh-green-600 text-white"
                    : "bg-gray-100 text-gray-600 active:bg-gray-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {classeFilter !== "exercice" && coursesInFilter.length > 1 && (
            <select
              value={courseFilter === "tous" ? "tous" : String(courseFilter)}
              onChange={(e) =>
                setCourseFilter(e.target.value === "tous" ? "tous" : Number(e.target.value))
              }
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:border-vh-green-400 focus:outline-none focus:ring-2 focus:ring-vh-green-100"
            >
              <option value="tous">Tous les cours</option>
              {coursesInFilter.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.titre}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 px-4 py-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
            <MicIcon />
            <p className="mt-3 text-sm font-medium text-gray-500">
              {submissions.length === 0
                ? "Aucun entraînement partagé pour l'instant."
                : "Aucun résultat pour ce filtre."}
            </p>
            <p className="mt-1 text-xs">
              {submissions.length === 0
                ? "Les prédications partagées apparaîtront ici."
                : "Essaie un autre filtre."}
            </p>
          </div>
        ) : (
          filtered.map((s) => <SubmissionCard key={s.id} s={s} />)
        )}
      </div>
    </div>
  );
}

function MicIcon() {
  return (
    <svg className="h-10 w-10 text-gray-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
    </svg>
  );
}
