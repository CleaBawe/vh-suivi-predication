import { getCommunauteSubmissions } from "@/lib/courses/queries";
import { CommunauteClient } from "./CommunauteClient";

export const metadata = { title: "Communauté" };

export default async function CommunautePage() {
  const submissions = await getCommunauteSubmissions();

  return (
    <div className="flex flex-col min-h-full bg-gray-50">
      <header className="sticky top-0 z-10 bg-gray-50 px-4 pt-3 pb-2">
        <div className="rounded-2xl bg-white border border-gray-100 px-4 py-3">
          <h1 className="font-bold text-gray-900">Communauté</h1>
          <p className="text-xs text-gray-400">
            {submissions.length} entraînement{submissions.length !== 1 ? "s" : ""} partagé{submissions.length !== 1 ? "s" : ""}
          </p>
        </div>
      </header>

      <CommunauteClient submissions={submissions} />
    </div>
  );
}
