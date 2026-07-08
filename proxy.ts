import { type NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/token";

const PUBLIC = new Set(["/", "/login", "/register"]);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC.has(pathname)) return NextResponse.next();

  const token = request.cookies.get("__session")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const session = await verifyToken(token);

  if (!session) {
    const res = NextResponse.redirect(new URL("/", request.url));
    res.cookies.delete("__session");
    return res;
  }

  if (
    session.mustChangePassword &&
    !pathname.startsWith("/changer-mot-de-passe")
  ) {
    return NextResponse.redirect(
      new URL("/changer-mot-de-passe", request.url)
    );
  }

  if (pathname.startsWith("/admin") && session.role !== "admin") {
    return NextResponse.redirect(new URL("/etudiant", request.url));
  }

  if (pathname.startsWith("/etudiant") && session.role !== "student") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
