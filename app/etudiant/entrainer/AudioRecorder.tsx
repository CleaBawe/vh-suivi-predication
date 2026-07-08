"use client";

import { useEffect, useRef, useState } from "react";

type RecorderStatus = "idle" | "recording" | "stopped" | "error";

type Props = {
  shouldStop: boolean;
  onReady: (blob: Blob) => void;
};

function getBestMimeType(): string {
  const types = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
  for (const t of types) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)) return t;
  }
  return "";
}

export function AudioRecorder({ shouldStop, onReady }: Props) {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // When shouldStop becomes true while recording, stop
  useEffect(() => {
    if (shouldStop && status === "recording" && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  }, [shouldStop, status]);

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [audioUrl]);

  async function startRecording() {
    setErrorMsg(null);
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = getBestMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, {
          type: mimeType || "audio/webm",
        });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setStatus("stopped");
        onReady(blob);
      };

      recorder.start();
      setStatus("recording");
    } catch (err) {
      const name = err instanceof Error ? err.name : "";
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        setErrorMsg(
          "Accès au microphone refusé. Pour autoriser l'accès, ouvre les réglages de ton navigateur → Permissions → Microphone."
        );
      } else {
        setErrorMsg("Impossible d'accéder au microphone. Vérifie tes réglages.");
      }
      setStatus("error");
    }
  }

  function resetRecorder() {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setErrorMsg(null);
    setStatus("idle");
    mediaRecorderRef.current = null;
    chunksRef.current = [];
  }

  if (status === "error") {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-4 space-y-3">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 shrink-0 text-red-400">
            <MicOffIcon />
          </span>
          <p className="text-sm text-red-700 leading-snug">{errorMsg}</p>
        </div>
        <button
          onClick={resetRecorder}
          className="w-full rounded-2xl bg-red-100 px-4 py-2.5 text-sm font-medium text-red-700 active:bg-red-200"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (status === "stopped" && audioUrl) {
    return (
      <div className="space-y-3">
        <div className="rounded-2xl border border-green-100 bg-green-50 px-4 py-3">
          <p className="mb-2 text-xs font-medium text-green-700">Enregistrement prêt</p>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <audio src={audioUrl} controls className="w-full" />
        </div>
        <button
          onClick={resetRecorder}
          className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 active:bg-gray-50"
        >
          Recommencer
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {status === "recording" && (
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
          <span className="text-sm font-medium text-red-600">Enregistrement en cours…</span>
        </div>
      )}

      <button
        onClick={status === "idle" ? startRecording : undefined}
        disabled={status === "recording" && !shouldStop}
        className={`flex h-16 w-16 items-center justify-center rounded-full shadow-lg transition-all active:scale-90 ${
          status === "recording"
            ? "bg-red-500 text-white"
            : "bg-vh-green-600 text-white"
        }`}
        aria-label={status === "recording" ? "En cours d'enregistrement" : "Démarrer l'enregistrement"}
      >
        {status === "recording" ? <StopIcon /> : <MicLargeIcon />}
      </button>

      {status === "idle" && (
        <p className="text-xs text-gray-400">Appuie pour commencer à enregistrer</p>
      )}
    </div>
  );
}

function MicLargeIcon() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}

function MicOffIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <line x1="1" y1="1" x2="23" y2="23" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23M12 19v4M8 23h8" />
    </svg>
  );
}
