import Link from "next/link";
import { CreateAdminForm } from "./CreateAdminForm";

export const metadata = { title: "Créer un compte admin" };

export default function CreerAdminPage() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-gray-50 px-4 pt-3 pb-2">
        <div className="rounded-2xl bg-white border border-gray-100 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-gray-200 text-gray-600 active:bg-gray-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <p className="font-semibold text-gray-900">Créer un compte admin</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col px-4 py-6">
        <p className="mb-6 text-sm text-gray-500">
          Créez un nouveau compte administrateur. Le compte aura accès au tableau de bord admin.
        </p>
        <CreateAdminForm />
      </main>
    </div>
  );
}
