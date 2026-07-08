import { cache } from "react";
import { cookies } from "next/headers";
import { signToken, verifyToken, type SessionPayload } from "./token";

export type { SessionPayload };

const COOKIE = "__session";

export async function createSession(payload: SessionPayload): Promise<void> {
  const token = await signToken(payload);
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export const getSession = cache(async (): Promise<SessionPayload | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
});

export async function deleteSession(): Promise<void> {
  (await cookies()).delete(COOKIE);
}
