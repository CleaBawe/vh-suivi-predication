import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { RegisterForm } from "./RegisterForm";

export const metadata = { title: "Créer un compte" };

export default async function RegisterPage() {
  const session = await getSession();
  if (session) {
    redirect(session.role === "admin" ? "/admin" : "/etudiant");
  }
  return <RegisterForm />;
}
