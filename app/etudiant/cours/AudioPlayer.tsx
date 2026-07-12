"use client";

import { useEffect, useRef, useState } from "react";
import type { AudioPartData } from "@/lib/courses/queries";

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];

function fmt(s: number) {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

export function AudioPlayer({ parts }: { parts: AudioPartData[] }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [partIdx, setPartIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const volRef = useRef<HTMLDivElement>(null);

  const part = parts[partIdx];

  // Close volume popover on outside click/tap
  useEffect(() => {
    if (!showVolume) return;
    const handler = (e: PointerEvent) => {
      if (volRef.current && !volRef.current.contains(e.target as Node)) {
        setShowVolume(false);
      }
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, [showVolume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onDuration = () => setDuration(audio.duration);
    const onEnded = () => {
      if (partIdx < parts.length - 1) {
        setPartIdx((i) => i + 1);
      } else {
        setPlaying(false);
        setCurrentTime(0);
      }
    };
    const onWaiting = () => setLoading(true);
    const onCanPlay = () => setLoading(false);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("durationchange", onDuration);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("canplay", onCanPlay);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("durationchange", onDuration);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("canplay", onCanPlay);
    };
  }, [partIdx, parts.length]);

  const wasPlayingRef = useRef(false);
  const handlePartChange = (idx: number) => {
    wasPlayingRef.current = playing;
    setPartIdx(idx);
    setCurrentTime(0);
    setDuration(0);
  };
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.load();
    audio.playbackRate = speed;
    audio.volume = muted ? 0 : volume;
    if (wasPlayingRef.current) {
      audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partIdx]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      try {
        await audio.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const t = Number(e.target.value);
    audio.currentTime = t;
    setCurrentTime(t);
  };

  const cycleSpeed = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const idx = SPEEDS.indexOf(speed);
    const next = SPEEDS[(idx + 1) % SPEEDS.length];
    audio.playbackRate = next;
    setSpeed(next);
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const v = Number(e.target.value);
    audio.volume = v;
    setVolume(v);
    setMuted(v === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (muted) {
      const v = volume || 1;
      audio.volume = v;
      setVolume(v);
      setMuted(false);
    } else {
      audio.volume = 0;
      setMuted(true);
    }
  };

  const handleDownload = () => {
    if (!part?.url) return;
    const a = document.createElement("a");
    a.href = part.url;
    a.download = part.titre ?? `cours-partie-${partIdx + 1}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volPct = muted ? 0 : volume * 100;

  return (
    <div className="rounded-2xl bg-vh-green-50 p-4 space-y-3">
      <audio ref={audioRef} src={part?.url} preload="metadata" />

      {/* Part selector (only if multiple parts) */}
      {parts.length > 1 && (
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-vh-green-600 shrink-0">
            Partie {partIdx + 1}/{parts.length}
          </span>
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
            {parts.map((_, i) => (
              <button
                key={i}
                onClick={() => handlePartChange(i)}
                className={`h-6 min-w-6 rounded-full text-xs font-semibold transition-colors shrink-0 ${
                  i === partIdx
                    ? "bg-vh-green-600 text-white"
                    : "bg-vh-green-100 text-vh-green-500 active:bg-vh-green-200"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main controls — single row */}
      <div className="flex items-center gap-2">
        {/* Play / Pause */}
        <button
          onClick={togglePlay}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-vh-green-600 text-white shadow-sm active:scale-95 transition-transform"
          aria-label={playing ? "Pause" : "Lecture"}
        >
          {loading ? <SpinnerIcon /> : playing ? <PauseIcon /> : <PlayIcon />}
        </button>

        {/* Speed — cycles on tap */}
        <button
          onClick={cycleSpeed}
          className="shrink-0 h-8 min-w-[3.25rem] rounded-full bg-vh-green-100 px-2 text-xs font-semibold text-vh-green-700 active:bg-vh-green-200 transition-colors"
          aria-label={`Vitesse de lecture : ${speed}×`}
        >
          {speed}×
        </button>

        {/* Progress bar + time */}
        <div className="flex-1 space-y-1 min-w-0">
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.5}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 rounded-full appearance-none bg-vh-green-200 cursor-pointer"
            style={{
              background: `linear-gradient(to right, #0F6E56 ${pct}%, #a1e1cd ${pct}%)`,
            }}
          />
          <div className="flex justify-between text-xs text-vh-green-400">
            <span>{fmt(currentTime)}</span>
            <span>{fmt(duration)}</span>
          </div>
        </div>

        {/* Volume — icon + popover slider */}
        <div ref={volRef} className="relative shrink-0">
          <button
            onClick={() => setShowVolume((v) => !v)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-vh-green-100 text-vh-green-700 active:bg-vh-green-200 transition-colors"
            aria-label="Volume"
          >
            <VolumeIcon muted={muted} level={volume} />
          </button>

          {showVolume && (
            <div className="absolute bottom-full mb-2 right-0 z-50 rounded-2xl bg-white shadow-xl border border-vh-green-100 p-3 w-44">
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="shrink-0 text-vh-green-600 active:text-vh-green-800"
                  aria-label={muted ? "Réactiver le son" : "Couper le son"}
                >
                  <VolumeIcon muted={muted} level={volume} />
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={muted ? 0 : volume}
                  onChange={handleVolume}
                  className="flex-1 h-1.5 cursor-pointer appearance-none rounded-full"
                  style={{
                    background: `linear-gradient(to right, #0F6E56 ${volPct}%, #a1e1cd ${volPct}%)`,
                  }}
                  aria-label="Niveau du volume"
                />
                <span className="text-xs text-vh-green-500 w-7 shrink-0 text-right">
                  {Math.round(volPct)}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Download */}
        <button
          onClick={handleDownload}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-vh-green-100 text-vh-green-700 active:bg-vh-green-200 transition-colors"
          aria-label="Télécharger l'audio"
        >
          <DownloadIcon />
        </button>
      </div>

      {/* Prev / Next (only if multiple parts) */}
      {parts.length > 1 && (
        <div className="flex gap-2 pt-1">
          <button
            disabled={partIdx === 0}
            onClick={() => handlePartChange(partIdx - 1)}
            className="flex-1 rounded-2xl border border-vh-green-200 py-2 text-sm font-medium text-vh-green-600 disabled:opacity-30 active:bg-vh-green-50 transition-colors"
          >
            ← Précédente
          </button>
          <button
            disabled={partIdx === parts.length - 1}
            onClick={() => handlePartChange(partIdx + 1)}
            className="flex-1 rounded-2xl border border-vh-green-200 py-2 text-sm font-medium text-vh-green-600 disabled:opacity-30 active:bg-vh-green-50 transition-colors"
          >
            Suivante →
          </button>
        </div>
      )}
    </div>
  );
}

function PlayIcon() {
  return (
    <svg className="h-5 w-5 translate-x-0.5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" d="M12 2a10 10 0 0 1 10 10" strokeWidth={2.5} />
    </svg>
  );
}

function VolumeIcon({ muted, level }: { muted: boolean; level: number }) {
  if (muted || level === 0) {
    return (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
      </svg>
    );
  }
  if (level < 0.5) {
    return (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
      </svg>
    );
  }
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
    </svg>
  );
}
