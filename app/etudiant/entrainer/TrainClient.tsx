"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTimer } from "./useTimer";
import { AudioRecorder } from "./AudioRecorder";
import { InspirationCard } from "./InspirationCard";
import { submitTraining, uploadAudioBlob } from "@/lib/courses/actions";
import type { InspirationData } from "@/lib/courses/queries";

// ─── Step machine ────────────────────────────────────────────────────────────

type Step =
  | { name: "prep" }
  | { name: "choosing" }
  | { name: "preaching"; mode: "audio" | "texte" }
  | { name: "submitting" }
  | { name: "done"; inspiration: InspirationData | null };

// ─── Circular timer ──────────────────────────────────────────────────────────

const CIRCUMFERENCE = 2 * Math.PI * 52; // r=52

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

type CircularTimerProps = {
  remaining: number;
  duration: number;
  isFinished: boolean;
};

function CircularTimer({ remaining, duration, isFinished }: CircularTimerProps) {
  const progress = remaining / duration;
  const offset = CIRCUMFERENCE * (1 - progress);

  return (
    <div className="relative flex items-center justify-center">
      <svg width="120" height="120" viewBox="0 0 120 120">
        {/* Background circle */}
        <circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          stroke="#ede9fe"
          strokeWidth="8"
        />
        {/* Progress arc */}
        <circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          stroke={isFinished ? "#22c55e" : "#7c3aed"}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
          style={{ transition: "stroke-dashoffset 0.5s linear, stroke 0.3s ease" }}
        />
      </svg>
      {/* Time display centered over SVG */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-2xl font-bold tabular-nums ${isFinished ? "text-green-600" : "text-vh-green-700"}`}>
          {formatTime(remaining)}
        </span>
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

type Props = {
  courseId: number;
  courseTitre: string;
};

export function TrainClient({ courseId, courseTitre }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<Step>({ name: "prep" });

  const prepTimer = useTimer(300);
  const preachTimer = useTimer(300);

  // Prep step state
  const [versetPorteur, setVersetPorteur] = useState("");

  // Preaching step state
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [texte, setTexte] = useState("");
  const [partager, setPartager] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Track last inspiration ID to avoid repeats
  const lastInspirationIdRef = useRef<number | undefined>(undefined);

  // Auto-start prep timer on mount
  useEffect(() => {
    prepTimer.start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-advance from prep to choosing when timer finishes
  useEffect(() => {
    if (prepTimer.isFinished && step.name === "prep") {
      setStep({ name: "choosing" });
    }
  }, [prepTimer.isFinished, step.name]);

  const goToChoosing = useCallback(() => {
    setStep({ name: "choosing" });
  }, []);

  const chooseMode = useCallback(
    (mode: "audio" | "texte") => {
      preachTimer.start();
      setStep({ name: "preaching", mode });
    },
    [preachTimer]
  );

  const handleSubmit = useCallback(async () => {
    if (step.name !== "preaching") return;
    const mode = step.mode;

    setUploadError(null);
    setUploading(true);

    try {
      let contenuOuUrl = "";

      if (mode === "audio") {
        if (!audioBlob) throw new Error("Aucun enregistrement audio");
        const fd = new FormData();
        fd.append("file", audioBlob, `recording.${audioBlob.type.includes("mp4") ? "mp4" : "webm"}`);
        fd.append("courseId", String(courseId));
        contenuOuUrl = await uploadAudioBlob(fd);
      } else {
        contenuOuUrl = texte.trim();
        if (!contenuOuUrl) throw new Error("Le texte est vide");
      }

      setUploading(false);
      setStep({ name: "submitting" });

      const { inspiration } = await submitTraining(
        courseId,
        mode,
        contenuOuUrl,
        partager,
        versetPorteur.trim() || null,
        lastInspirationIdRef.current
      );

      if (inspiration) lastInspirationIdRef.current = inspiration.id;
      setStep({ name: "done", inspiration });
    } catch (err) {
      setUploading(false);
      setUploadError(
        err instanceof Error ? err.message : "Une erreur est survenue. Réessaie."
      );
    }
  }, [step, audioBlob, texte, courseId, partager, versetPorteur]);

  // ── Render: done ────────────────────────────────────────────────────────────
  if (step.name === "done") {
    if (!step.inspiration) {
      return (
        <div className="flex min-h-[calc(100dvh-80px)] flex-col items-center justify-center gap-6 px-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Entraînement enregistré !</h2>
          <button
            onClick={() => router.push("/etudiant/cours")}
            className="w-full max-w-md rounded-2xl bg-vh-green-600 px-4 py-4 text-base font-semibold text-white active:scale-95 transition-transform"
          >
            Retour aux cours
          </button>
        </div>
      );
    }
    return (
      <InspirationCard
        inspiration={step.inspiration}
        onContinue={() => router.push("/etudiant/cours")}
      />
    );
  }

  // ── Render: submitting ───────────────────────────────────────────────────────
  if (step.name === "submitting") {
    return (
      <div className="flex min-h-[calc(100dvh-80px)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-vh-green-200 border-t-vh-green-600" />
          <p className="text-sm text-gray-500">Enregistrement de ta prédication…</p>
        </div>
      </div>
    );
  }

  // ── Render: prep ────────────────────────────────────────────────────────────
  if (step.name === "prep") {
    return (
      <div className="flex flex-col px-4 pt-4 pb-8 space-y-8">
        {/* Back */}
        <Link href="/etudiant/cours" className="inline-flex items-center gap-1.5 text-sm text-gray-400 active:text-gray-600">
          <BackIcon />
          Mes cours
        </Link>

        {/* Title */}
        <div>
          <p className="text-xs text-gray-400 mb-0.5">S&apos;entraîner sur</p>
          <h1 className="text-lg font-bold text-gray-900 leading-snug">{courseTitre}</h1>
        </div>

        {/* Timer */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm font-medium text-gray-600">Temps de préparation</p>
          <CircularTimer
            remaining={prepTimer.remaining}
            duration={300}
            isFinished={prepTimer.isFinished}
          />
          {prepTimer.isFinished && (
            <p className="text-xs text-green-600 font-medium">Temps écoulé !</p>
          )}
        </div>

        {/* Verset porteur */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Verset porteur{" "}
            <span className="text-gray-400 font-normal">(facultatif)</span>
          </label>
          <input
            value={versetPorteur}
            onChange={(e) => setVersetPorteur(e.target.value)}
            placeholder="Écris le verset qui porte ton message…"
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-900 placeholder-gray-300 focus:border-vh-green-400 focus:outline-none focus:ring-2 focus:ring-vh-green-100"
          />
        </div>

        {/* CTA */}
        <button
          onClick={goToChoosing}
          className="flex w-full items-center justify-between rounded-2xl bg-vh-green-600 px-4 py-4 text-sm font-semibold text-white shadow-sm active:scale-95 transition-transform"
        >
          <span>Je suis prêt</span>
          <ArrowIcon />
        </button>
      </div>
    );
  }

  // ── Render: choosing ────────────────────────────────────────────────────────
  if (step.name === "choosing") {
    return (
      <div className="flex flex-col px-4 pt-4 pb-8 space-y-6">
        <Link href="/etudiant/cours" className="inline-flex items-center gap-1.5 text-sm text-gray-400 active:text-gray-600">
          <BackIcon />
          Mes cours
        </Link>

        <div>
          <h1 className="text-lg font-bold text-gray-900">Comment veux-tu t&apos;entraîner ?</h1>
          <p className="mt-1 text-sm text-gray-500">{courseTitre}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
          <button
            onClick={() => chooseMode("audio")}
            className="flex flex-col items-center gap-3 rounded-2xl border-2 border-vh-green-200 bg-vh-green-50 px-4 py-6 text-center active:border-vh-green-400 active:bg-vh-green-100 transition-colors min-h-[160px] justify-center"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-vh-green-100">
              <MicIcon />
            </div>
            <div>
              <p className="font-semibold text-vh-green-900">Enregistrer ma voix</p>
              <p className="text-xs text-vh-green-500 mt-0.5">Upload audio</p>
            </div>
          </button>

          <button
            onClick={() => chooseMode("texte")}
            className="flex flex-col items-center gap-3 rounded-2xl border-2 border-gray-200 bg-gray-50 px-4 py-6 text-center active:border-gray-400 active:bg-gray-100 transition-colors min-h-[160px] justify-center"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <PencilIcon />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Écrire ma prédication</p>
              <p className="text-xs text-gray-500 mt-0.5">Saisie texte</p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // ── Render: preaching ───────────────────────────────────────────────────────
  const mode = step.mode;
  const isAudio = mode === "audio";
  const canSubmit = isAudio ? audioBlob !== null : texte.trim().length > 0;

  return (
    <div className="flex flex-col px-4 pt-4 pb-8 space-y-6">
      <Link href="/etudiant/cours" className="inline-flex items-center gap-1.5 text-sm text-gray-400 active:text-gray-600">
        <BackIcon />
        Mes cours
      </Link>

      <div>
        <h1 className="text-lg font-bold text-gray-900">
          {isAudio ? "Enregistre ta prédication" : "Écris ta prédication"}
        </h1>
        <p className="mt-1 text-sm text-gray-500">{courseTitre}</p>
      </div>

      {/* Timer */}
      <div className="flex flex-col items-center gap-2">
        <CircularTimer
          remaining={preachTimer.remaining}
          duration={300}
          isFinished={preachTimer.isFinished}
        />
        {preachTimer.isFinished && (
          <div className="w-full rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2.5">
            <p className="text-sm text-amber-700 font-medium text-center">
              Temps écoulé — soumets ta prédication
            </p>
          </div>
        )}
      </div>

      {/* Mode-specific input */}
      {isAudio ? (
        <AudioRecorder
          shouldStop={preachTimer.isFinished}
          onReady={(blob) => setAudioBlob(blob)}
        />
      ) : (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Ta prédication
          </label>
          <textarea
            value={texte}
            onChange={(e) => setTexte(e.target.value)}
            placeholder="Écris ta prédication ici…"
            rows={6}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-900 placeholder-gray-300 focus:border-vh-green-400 focus:outline-none focus:ring-2 focus:ring-vh-green-100 resize-none"
          />
        </div>
      )}

      {/* Privacy toggle */}
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={!partager}
          onChange={(e) => setPartager(!e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-vh-green-600 focus:ring-vh-green-500"
        />
        <span className="text-sm text-gray-600">
          Ne pas partager à la communauté
        </span>
      </label>

      {/* Upload error */}
      {uploadError && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">{uploadError}</p>
        </div>
      )}

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit || uploading}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-vh-green-600 px-4 py-4 text-sm font-semibold text-white shadow-sm active:scale-95 transition-transform disabled:opacity-50 disabled:active:scale-100"
      >
        {uploading ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            <span>Upload en cours…</span>
          </>
        ) : (
          <span>Soumettre ma prédication</span>
        )}
      </button>
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

function MicIcon() {
  return (
    <svg className="h-6 w-6 text-vh-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg className="h-6 w-6 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  );
}
