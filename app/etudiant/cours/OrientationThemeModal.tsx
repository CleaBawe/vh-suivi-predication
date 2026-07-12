"use client";

import Link from "next/link";
import type { ThemeData } from "@/lib/courses/queries";

type Props = {
  theme: ThemeData;
  onClose: () => void;
};

export function OrientationThemeModal({ theme, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Card */}
      <div className="relative mx-4 mb-4 sm:mb-0 w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl animate-slide-up">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-300 active:text-gray-500"
          aria-label="Fermer"
        >
          <CloseIcon />
        </button>

        {/* Icon + badge */}
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-vh-gold-300/25">
            <DiceIcon />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-vh-gold-500">
              Premier entraînement
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Module d&apos;orientation terminé 🎉</p>
          </div>
        </div>

        {/* Intro */}
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          Tu as terminé le module d&apos;orientation. Voici un premier thème pour t&apos;entraîner :
        </p>

        {/* Theme */}
        <div className="rounded-2xl border border-vh-green-200 bg-vh-green-50 px-4 py-3 mb-5">
          <p className="text-xs font-semibold text-vh-green-500 mb-0.5">
            {theme.coursCorrespondant} · {theme.classe}
          </p>
          <p className="font-bold text-gray-900 leading-snug">{theme.titre}</p>
        </div>

        {/* CTAs */}
        <div className="space-y-2">
          <Link
            href={`/etudiant/exercice/entrainer?themeId=${theme.id}`}
            className="flex w-full items-center justify-between rounded-2xl bg-vh-green-600 px-4 py-3.5 text-sm font-semibold text-white active:scale-95 transition-transform"
            onClick={onClose}
          >
            <span>Commencer l&apos;entraînement</span>
            <ArrowIcon />
          </Link>

          <Link
            href="/etudiant/exercice"
            className="flex w-full items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-600 active:bg-gray-50 transition-colors"
            onClick={onClose}
          >
            Voir tous les thèmes
          </Link>
        </div>
      </div>
    </div>
  );
}

function DiceIcon() {
  return (
    <svg className="h-5 w-5 text-vh-gold-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
      <rect x="3" y="3" width="18" height="18" rx="3" ry="3" />
      <circle cx="8.5" cy="8.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="8.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="8.5" cy="15.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="15.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
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

function CloseIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
