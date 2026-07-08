"use client";

import { useState, useRef, useEffect, useCallback } from "react";

export type TimerState = {
  remaining: number;
  isRunning: boolean;
  isFinished: boolean;
  start: () => void;
  skip: () => void;
};

export function useTimer(durationSeconds: number): TimerState {
  const [remaining, setRemaining] = useState<number>(durationSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const startTimeRef = useRef<number>(0);
  const startRemainingRef = useRef<number>(durationSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tick = useCallback(() => {
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const left = Math.max(0, startRemainingRef.current - elapsed);
    setRemaining(left);
    if (left <= 0) {
      setIsFinished(true);
      setIsRunning(false);
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, []);

  const start = useCallback(() => {
    if (intervalRef.current !== null) clearInterval(intervalRef.current);
    startTimeRef.current = Date.now();
    startRemainingRef.current = durationSeconds;
    setRemaining(durationSeconds);
    setIsFinished(false);
    setIsRunning(true);
    intervalRef.current = setInterval(tick, 500);
  }, [durationSeconds, tick]);

  const skip = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRemaining(0);
    setIsRunning(false);
    setIsFinished(true);
  }, []);

  // Handle visibility change — recalculate remaining immediately on tab focus
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && isRunning) {
        tick();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [isRunning, tick]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
    };
  }, []);

  return { remaining, isRunning, isFinished, start, skip };
}
