import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/Logo";

export const metadata = { title: "Changer de mot de passe" };

export default async function ChangePasswordPage() {
  const session = await getSession();
  if (!session) redirect("/");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto flex min-h-screen max-w-[560px] flex-col px-6 py-12">
        <div className="flex justify-center pb-4">
          <Logo />
        </div>
        <ChangePasswordForm />
        <Footer />
      </div>
    </div>
  );
}
