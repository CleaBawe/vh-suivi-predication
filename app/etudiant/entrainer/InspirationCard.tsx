"use client";

import type { InspirationData } from "@/lib/courses/queries";

type Props = {
  inspiration: InspirationData;
  onContinue: () => void;
};

export function InspirationCard({ inspiration, onContinue }: Props) {
  return (
    <div className="flex min-h-[calc(100dvh-80px)] flex-col items-center justify-between px-4 py-8">
      {/* Success header */}
      <div className="flex flex-col items-center gap-3 pt-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckIcon />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Entraînement enregistré !</h2>
        <p className="text-sm text-gray-500 text-center">
          Continue comme ça — chaque prédication te rapproche de l&apos;excellence.
        </p>
      </div>

      {/* Inspiration card */}
      <div className="w-full max-w-md rounded-2xl border border-vh-green-200 bg-vh-green-50 px-5 py-5 shadow-sm shadow-vh-green-100">
        <div className="flex items-start gap-3 mb-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-vh-green-100">
            <BookIcon />
          </div>
          <div>
            <p className="text-xs font-semibold text-vh-green-500">
              {inspiration.personnage} · {inspiration.reference}
            </p>
          </div>
        </div>
        <p className="text-sm italic text-vh-green-900 leading-relaxed mb-3">
          &ldquo;{inspiration.versetTexte}&rdquo;
        </p>
        <p className="text-sm text-vh-green-700 leading-snug">{inspiration.conseil}</p>
      </div>

      {/* CTA */}
      <button
        onClick={onContinue}
        className="w-full max-w-md rounded-2xl bg-vh-green-600 px-4 py-4 text-base font-semibold text-white shadow-sm active:scale-95 transition-transform"
      >
        Retour aux cours
      </button>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg className="h-8 w-8 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg className="h-4 w-4 text-vh-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  );
}
