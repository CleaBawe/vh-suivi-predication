"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ThemeData } from "@/lib/courses/queries";

type View = "grid" | "drawing" | "detail";

export function ExerciceClient({ themes }: { themes: ThemeData[] }) {
  const router = useRouter();
  const [view, setView] = useState<View>("grid");
  const [selected, setSelected] = useState<ThemeData | null>(null);
  const [drawnHighlight, setDrawnHighlight] = useState(false);

  const drawRandom = () => {
    setView("drawing");
    setDrawnHighlight(false);
    const theme = themes[Math.floor(Math.random() * themes.length)];
    setTimeout(() => {
      setSelected(theme);
      setDrawnHighlight(true);
      setView("detail");
    }, 700);
  };

  const selectTheme = (theme: ThemeData) => {
    setDrawnHighlight(false);
    setSelected(theme);
    setView("detail");
  };

  const backToGrid = () => {
    setView("grid");
    setSelected(null);
    setDrawnHighlight(false);
  };

  // ── Drawing animation ────────────────────────────────────────────────────────
  if (view === "drawing") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100dvh-80px)] gap-6 px-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-vh-gold-300/30">
          <DiceIcon className="h-10 w-10 text-vh-gold-500 animate-spin" />
        </div>
        <p className="text-lg font-bold text-gray-800">Tirage en cours…</p>
        <p className="text-sm text-gray-400">Un thème est sélectionné pour toi</p>
      </div>
    );
  }

  // ── Detail view ──────────────────────────────────────────────────────────────
  if (view === "detail" && selected) {
    return (
      <div className="flex flex-col px-4 pt-4 pb-8 space-y-5">
        {/* Back */}
        <button
          onClick={backToGrid}
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 active:text-gray-600 self-start"
        >
          <BackIcon />
          Exercice
        </button>

        {/* Drawn badge */}
        {drawnHighlight && (
          <div className="flex items-center gap-2 rounded-2xl bg-vh-gold-300/20 border border-vh-gold-300 px-4 py-2.5">
            <DiceIcon className="h-4 w-4 text-vh-gold-500 shrink-0" />
            <p className="text-sm font-semibold text-vh-gold-600">Thème tiré au sort</p>
          </div>
        )}

        {/* 1. Titre */}
        <div>
          <h1 className="text-xl font-bold text-gray-900 leading-snug">{selected.titre}</h1>
          {/* 2. Cours correspondant + Classe */}
          <p className="mt-1 text-sm text-gray-400">
            {selected.coursCorrespondant}
            {selected.classe && (
              <span className="ml-2 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                {selected.classe}
              </span>
            )}
          </p>
        </div>

        {/* 3. Personnage + 4. Versets — sur une ligne compacte */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 rounded-2xl bg-vh-gold-300/15 px-3 py-2">
            <PersonIcon className="h-4 w-4 text-vh-gold-500 shrink-0" />
            <span className="text-sm font-medium text-gray-800">{selected.personnageBiblique}</span>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-vh-green-100 px-3 py-2">
            <BookIcon className="h-4 w-4 text-vh-green-600 shrink-0" />
            <span className="text-sm font-medium text-vh-green-700">
              {selected.versetsBase.join(" · ")}
            </span>
          </div>
        </div>

        {/* 5. Approche de l'Apôtre Mohammed */}
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Approche de l&apos;Apôtre Mohammed
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">{selected.approcheApotre}</p>
        </div>

        {/* 6. Construction de la prédication */}
        <div className="rounded-2xl border border-vh-green-200 bg-vh-green-50 px-4 py-4 space-y-1.5">
          <div className="flex items-center gap-2">
            <ThreadIcon className="h-4 w-4 text-vh-green-600 shrink-0" />
            <p className="text-xs font-semibold text-vh-green-700 uppercase tracking-wide">
              Construction de la prédication
            </p>
          </div>
          <p className="text-sm text-vh-green-900 leading-relaxed">{selected.constructionPredication}</p>
        </div>

        {/* 7. Question qui touche le cœur — encadré or distinct */}
        <div className="rounded-2xl border border-vh-gold-400 bg-vh-gold-300/10 px-4 py-4 space-y-2">
          <div className="flex items-center gap-2">
            <HeartIcon className="h-4 w-4 text-vh-gold-500 shrink-0" />
            <p className="text-xs font-semibold text-vh-gold-600 uppercase tracking-wide">
              Question qui touche le cœur
            </p>
          </div>
          <p className="text-base font-medium text-gray-900 leading-snug italic">
            &ldquo;{selected.questionCoeur}&rdquo;
          </p>
          <p className="text-xs text-vh-gold-600">
            Pose-toi cette question avant de préparer ton message.
          </p>
        </div>

        {/* 8. CTA */}
        <button
          onClick={() => router.push(`/etudiant/exercice/entrainer?themeId=${selected.id}`)}
          className="flex w-full items-center justify-between rounded-2xl bg-vh-green-600 px-4 py-4 text-sm font-semibold text-white shadow-sm active:scale-95 transition-transform"
        >
          <span>S&apos;entraîner sur ce thème</span>
          <ArrowIcon />
        </button>
      </div>
    );
  }

  // ── Grid view ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col px-4 pt-4 pb-8 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Exercice de prédication</h1>
        <p className="text-sm text-gray-500 mt-0.5">12 thèmes tirés du programme de l&apos;école</p>
      </div>

      {/* Random draw button */}
      <button
        onClick={drawRandom}
        className="flex w-full items-center justify-between rounded-2xl bg-vh-gold-500 px-4 py-4 text-sm font-semibold text-white shadow-sm active:scale-95 transition-transform"
      >
        <div className="flex items-center gap-2.5">
          <DiceIcon className="h-5 w-5" />
          <span>Tirer un thème au hasard</span>
        </div>
        <ArrowIcon />
      </button>

      {/* Theme grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => selectTheme(theme)}
            className="rounded-2xl border border-gray-100 bg-white p-4 text-left space-y-2 active:border-vh-green-300 active:bg-vh-green-50 transition-colors shadow-sm"
          >
            <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
              {theme.titre}
            </p>
            <div className="space-y-1">
              <p className="text-xs text-vh-green-600 line-clamp-1">
                {theme.coursCorrespondant}
              </p>
              <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                {theme.classe}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Icons ───────────────────────────────────────────────────────────────────

function BackIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  );
}

function DiceIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
      <rect x="3" y="3" width="18" height="18" rx="3" ry="3" />
      <circle cx="8.5" cy="8.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="8.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="8.5" cy="15.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="15.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function PersonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="8" r="4" />
      <path strokeLinecap="round" d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  );
}

function ThreadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}
