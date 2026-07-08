"use client";

import { useEffect, useRef, useState } from "react";
import type { AudioPartData } from "@/lib/courses/queries";

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

  const part = parts[partIdx];

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

  // When part changes: reload and auto-play if was playing
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

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

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

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-vh-green-600 text-white shadow-sm active:scale-95 transition-transform"
          aria-label={playing ? "Pause" : "Lecture"}
        >
          {loading ? (
            <SpinnerIcon />
          ) : playing ? (
            <PauseIcon />
          ) : (
            <PlayIcon />
          )}
        </button>

        <div className="flex-1 space-y-1">
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
