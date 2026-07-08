"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { AudioPlayer } from "./AudioPlayer";
import { saveProgress } from "@/lib/courses/actions";
import type { CourseData, InspirationData } from "@/lib/courses/queries";

type Props = {
  course: CourseData;
  progress: { done: boolean; verset: string | null; notes: string | null } | null;
  onToggleDone: (courseId: number, currentDone: boolean) => Promise<InspirationData | null>;
  variant?: "orientation" | "default";
};

export function CourseCard({ course, progress, onToggleDone, variant = "default" }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [verset, setVerset] = useState(progress?.verset ?? "");
  const [notes, setNotes] = useState(progress?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const versetDebounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const notesDebounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const isDone = progress?.done ?? false;

  const flashSaved = () => {
    setSaved(true);
    if (savedTimerRef.current !== undefined) clearTimeout(savedTimerRef.current);
    savedTimerRef.current = setTimeout(() => setSaved(false), 2000);
  };

  const handleVersetChange = (val: string) => {
    setVerset(val);
    setSaved(false);
    if (versetDebounceRef.current !== undefined) clearTimeout(versetDebounceRef.current);
    versetDebounceRef.current = setTimeout(async () => {
      setSaving(true);
      await saveProgress(course.id, { verset: val }).catch(() => null);
      setSaving(false);
      flashSaved();
    }, 800);
  };

  const handleNotesChange = (val: string) => {
    setNotes(val);
    setSaved(false);
    if (notesDebounceRef.current !== undefined) clearTimeout(notesDebounceRef.current);
    notesDebounceRef.current = setTimeout(async () => {
      setSaving(true);
      await saveProgress(course.id, { notes: val }).catch(() => null);
      setSaving(false);
      flashSaved();
    }, 800);
  };

  const isOrientation = variant === "orientation";

  return (
    <div
      className={`rounded-2xl border transition-all ${
        isOrientation
          ? "border-vh-green-200 bg-vh-green-50"
          : isDone
          ? "border-green-100 bg-green-50/50"
          : "border-gray-100 bg-white"
      }`}
    >
      {/* Header row — always visible */}
      <button
        className="flex w-full items-start gap-3 px-4 py-4 text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Done checkbox */}
        <span
          role="checkbox"
          aria-checked={isDone}
          tabIndex={0}
          onClick={async (e) => {
            e.stopPropagation();
            await onToggleDone(course.id, isDone);
          }}
          onKeyDown={async (e) => {
            if (e.key === " " || e.key === "Enter") {
              e.preventDefault();
              e.stopPropagation();
              await onToggleDone(course.id, isDone);
            }
          }}
          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all active:scale-90 ${
            isDone
              ? "border-green-500 bg-green-500 text-white"
              : isOrientation
              ? "border-vh-green-300 bg-white"
              : "border-gray-300 bg-white"
          }`}
        >
          {isDone && <CheckIcon />}
        </span>

        {/* Title */}
        <div className="flex-1 min-w-0">
          {course.numero && (
            <span className={`text-xs font-medium ${isOrientation ? "text-vh-green-500" : "text-gray-400"}`}>
              {isOrientation ? "Module d'orientation" : `Cours ${course.numero}`}
            </span>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`font-semibold leading-snug ${
              isDone ? "text-gray-400" : isOrientation ? "text-vh-green-900" : "text-gray-900"
            }`}>
              {course.titre}
            </p>
            {course.hasSubmission && (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                <MicIcon />
                Entraîné
              </span>
            )}
          </div>
          {course.statutAudio === "manquant" && (
            <span className="mt-0.5 inline-block text-xs text-amber-500">Audio non disponible</span>
          )}
          {!expanded && course.audioParts.length > 0 && (
            <span className={`text-xs ${isOrientation ? "text-vh-green-400" : "text-gray-400"}`}>
              {course.audioParts.length} partie{course.audioParts.length > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Chevron */}
        <ChevronIcon
          className={`mt-1 h-4 w-4 shrink-0 transition-transform ${
            expanded ? "rotate-180" : ""
          } ${isOrientation ? "text-vh-green-400" : "text-gray-300"}`}
        />
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-dashed border-gray-100">
          {/* Audio player */}
          {course.audioParts.length > 0 ? (
            <div className="pt-4">
              <AudioPlayer parts={course.audioParts} />
            </div>
          ) : course.statutAudio === "manquant" ? (
            <div className="pt-4 rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3">
              <p className="text-sm text-amber-700">
                L&apos;audio de ce cours n&apos;est pas encore disponible.
              </p>
            </div>
          ) : null}

          {/* Verset de base */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500">
              Verset de base{" "}
              <span className="text-gray-400 font-normal">(facultatif)</span>
            </label>
            <input
              value={verset}
              onChange={(e) => handleVersetChange(e.target.value)}
              placeholder="Ex. Jean 3:16"
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-300 focus:border-vh-green-400 focus:outline-none focus:ring-2 focus:ring-vh-green-100"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500">
              Notes{" "}
              <span className="text-gray-400 font-normal">(facultatif)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="Tes réflexions sur ce cours…"
              rows={3}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-300 focus:border-vh-green-400 focus:outline-none focus:ring-2 focus:ring-vh-green-100 resize-none"
            />
            {saving ? (
              <p className="mt-1 text-xs text-gray-400">Enregistrement…</p>
            ) : saved ? (
              <p className="mt-1 text-xs text-green-500">✓ Enregistré</p>
            ) : null}
          </div>

          {/* Train button */}
          {isDone ? (
            <Link
              href={`/etudiant/entrainer?courseId=${course.id}`}
              className={`flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-semibold transition-transform active:scale-95 ${
                isOrientation
                  ? "bg-vh-green-600 text-white"
                  : "bg-gray-900 text-white"
              }`}
            >
              <span>S&apos;entraîner sur ce thème</span>
              <ArrowIcon />
            </Link>
          ) : (
            <p className="text-xs text-gray-400 text-center py-1">
              Écoute ce cours pour débloquer l&apos;entraînement
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function MicIcon() {
  return (
    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
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
