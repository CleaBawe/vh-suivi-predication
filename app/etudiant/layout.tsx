import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { BottomNav } from "@/components/BottomNav";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/Logo";

export default async function EtudiantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/");
  if (session.mustChangePassword) redirect("/changer-mot-de-passe");
  if (session.role !== "student") redirect("/admin");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto flex min-h-screen max-w-[560px] flex-col pb-20">
        <div className="flex justify-center px-6 pt-6 pb-2">
          <Logo />
        </div>
        {children}
        <Footer />
      </div>
      <BottomNav />
    </div>
  );
}
