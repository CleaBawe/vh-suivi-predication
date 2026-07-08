"use client";

import { useState, useCallback } from "react";
import { CourseCard } from "./CourseCard";
import { InspirationToast } from "./InspirationToast";
import { toggleListened } from "@/lib/courses/actions";
import type { CourseData, InspirationData } from "@/lib/courses/queries";

type Props = {
  orientation: CourseData | null;
  classesCourses: { classe: number; courses: CourseData[] }[];
  bannerInspiration: InspirationData | null;
};

export function CoursesPageClient({
  orientation,
  classesCourses,
  bannerInspiration,
}: Props) {
  // Local progress state — start from server data, update optimistically
  const [progressMap, setProgressMap] = useState<
    Map<number, { done: boolean; verset: string | null; notes: string | null }>
  >(() => {
    const m = new Map<number, { done: boolean; verset: string | null; notes: string | null }>();
    if (orientation?.progress) m.set(orientation.id, orientation.progress);
    for (const { courses } of classesCourses)
      for (const c of courses)
        if (c.progress) m.set(c.id, c.progress);
    return m;
  });

  const [toast, setToast] = useState<InspirationData | null>(null);
  const [lastInspirationId, setLastInspirationId] = useState<number | undefined>(
    bannerInspiration?.id
  );
  const [openClasses, setOpenClasses] = useState<Set<number>>(new Set([1]));

  const handleToggleDone = useCallback(
    async (courseId: number, currentDone: boolean): Promise<InspirationData | null> => {
      // Optimistic update
      setProgressMap((prev) => {
        const next = new Map(prev);
        const existing = next.get(courseId) ?? { done: false, verset: null, notes: null };
        next.set(courseId, { ...existing, done: !currentDone });
        return next;
      });

      try {
        const { done, inspiration } = await toggleListened(courseId, lastInspirationId);
        // Sync with server response (in case of conflict)
        setProgressMap((prev) => {
          const next = new Map(prev);
          const existing = next.get(courseId) ?? { done: false, verset: null, notes: null };
          next.set(courseId, { ...existing, done });
          return next;
        });
        if (inspiration) {
          setToast(inspiration);
          setLastInspirationId(inspiration.id);
        }
        return inspiration;
      } catch {
        // Revert on error
        setProgressMap((prev) => {
          const next = new Map(prev);
          const existing = next.get(courseId) ?? { done: false, verset: null, notes: null };
          next.set(courseId, { ...existing, done: currentDone });
          return next;
        });
        return null;
      }
    },
    [lastInspirationId]
  );

  const toggleClass = (classe: number) => {
    setOpenClasses((prev) => {
      const next = new Set(prev);
      if (next.has(classe)) next.delete(classe);
      else next.add(classe);
      return next;
    });
  };

  return (
    <div className="pb-8 space-y-6">
      {/* Inspiration banner */}
      {bannerInspiration && (
        <div className="mx-4 mt-4 rounded-2xl border-l-4 border-vh-green-400 bg-vh-green-50 px-4 py-3">
          <p className="text-xs font-semibold text-vh-green-500 mb-1">
            {bannerInspiration.personnage} · {bannerInspiration.reference}
          </p>
          <p className="text-sm italic text-vh-green-800 leading-snug line-clamp-2">
            &ldquo;{bannerInspiration.versetTexte}&rdquo;
          </p>
          <p className="mt-1.5 text-xs text-vh-green-600">{bannerInspiration.conseil}</p>
        </div>
      )}

      {/* Module d'orientation */}
      {orientation && (
        <section className="px-4 space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-widest text-vh-green-500">
            À écouter en premier
          </h2>
          <CourseCard
            course={orientation}
            progress={progressMap.get(orientation.id) ?? null}
            onToggleDone={handleToggleDone}
            variant="orientation"
          />
        </section>
      )}

      {/* Classes en accordéon */}
      {classesCourses.map(({ classe, courses }) => {
        const doneCount = courses.filter(
          (c) => progressMap.get(c.id)?.done
        ).length;
        const isOpen = openClasses.has(classe);

        return (
          <section key={classe} className="px-4 space-y-2">
            <button
              onClick={() => toggleClass(classe)}
              className="flex w-full items-center justify-between rounded-2xl bg-gray-100 px-4 py-3 text-left active:bg-gray-200 transition-colors"
            >
              <div>
                <span className="font-bold text-gray-900">Classe {classe}</span>
                <span className="ml-2 text-sm text-gray-500">
                  {doneCount}/{courses.length} terminé{doneCount !== 1 ? "s" : ""}
                </span>
              </div>
              <ChevronIcon
                className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isOpen && (
              <div className="space-y-2">
                {courses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    progress={progressMap.get(course.id) ?? null}
                    onToggleDone={handleToggleDone}
                  />
                ))}
              </div>
            )}
          </section>
        );
      })}

      {/* Toast inspiration */}
      {toast && (
        <InspirationToast
          key={toast.id}
          inspiration={toast}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}
