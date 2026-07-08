"use client";

import { useEffect } from "react";
import type { InspirationData } from "@/lib/courses/queries";

type Props = {
  inspiration: InspirationData;
  onClose: () => void;
};

export function InspirationToast({ inspiration, onClose }: Props) {
  useEffect(() => {
    const t = setTimeout(onClose, 6000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className="fixed bottom-24 left-4 right-4 z-50 animate-slide-up"
      onClick={onClose}
    >
      <div className="rounded-2xl border border-vh-green-200 bg-white shadow-lg shadow-vh-green-100 p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-vh-green-100">
            <BookIcon />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-vh-green-500 mb-0.5">
              {inspiration.personnage} · {inspiration.reference}
            </p>
            <p className="text-sm text-gray-700 leading-snug line-clamp-2 italic">
              &ldquo;{inspiration.versetTexte}&rdquo;
            </p>
            <p className="mt-1.5 text-xs text-gray-500 leading-snug">
              {inspiration.conseil}
            </p>
          </div>
          <button className="shrink-0 text-gray-300 active:text-gray-500 mt-0.5">
            <CloseIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

function BookIcon() {
  return (
    <svg className="h-4 w-4 text-vh-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
