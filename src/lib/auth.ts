import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "kt_admin";

function adminPassword(): string | null {
  return process.env["ADMIN_PASSWORD"] || null;
}

/** ערך העוגייה נגזר מהסיסמה: החלפת הסיסמה מנתקת אוטומטית את כל החיבורים הקיימים. */
export function sessionToken(): string | null {
  const pw = adminPassword();
  return pw ? createHmac("sha256", pw).update("kivrei-tzadikim-admin-v1").digest("hex") : null;
}

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function checkPassword(input: string): boolean {
  const pw = adminPassword();
  return Boolean(pw) && safeEqual(input, pw!);
}

export async function isAdmin(): Promise<boolean> {
  const token = sessionToken();
  if (!token) return false;
  const v = (await cookies()).get(ADMIN_COOKIE)?.value;
  return Boolean(v) && safeEqual(v!, token);
}

export const adminConfigured = () => Boolean(adminPassword());

export const unauthorized = () => Response.json({ error: "נדרשת כניסה" }, { status: 401 });
