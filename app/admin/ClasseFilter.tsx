"use client";

import { useRouter, useSearchParams } from "next/navigation";

const OPTIONS = [
  { label: "Tous", value: "" },
  { label: "Classe 1", value: "1" },
  { label: "Classe 2", value: "2" },
  { label: "Classe 3", value: "3" },
  { label: "Classe 4", value: "4" },
];

export function ClasseFilter({ active }: { active: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleClick(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("classe", value);
    } else {
      params.delete("classe");
    }
    router.push(`/admin?${params.toString()}`);
  }

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-none pb-0.5">
      {OPTIONS.map(({ label, value }) => (
        <button
          key={value}
          onClick={() => handleClick(value)}
          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            active === value
              ? "bg-vh-green-600 text-white"
              : "bg-gray-100 text-gray-600 active:bg-gray-200"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
