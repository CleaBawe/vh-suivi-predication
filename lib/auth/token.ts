import { SignJWT, jwtVerify, type JWTPayload } from "jose";

export type SessionPayload = {
  userId: number;
  matricule: string;
  role: "student" | "admin";
  nom: string | null;
  mustChangePassword: boolean;
};

function secret(): Uint8Array {
  return new TextEncoder().encode(process.env.SESSION_SECRET!);
}

export async function signToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload as unknown as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
