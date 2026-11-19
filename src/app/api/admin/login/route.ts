import { ADMIN_COOKIE, checkPassword, sessionToken } from "@/lib/auth";

export async function POST(req: Request) {
  const { password } = (await req.json().catch(() => ({}))) as { password?: string };
  if (!password || !checkPassword(password)) {
    await new Promise((r) => setTimeout(r, 800)); // האטה מול ניחושים
    return Response.json({ error: "סיסמה שגויה" }, { status: 401 });
  }
  const res = Response.json({ ok: true });
  res.headers.append(
    "Set-Cookie",
    `${ADMIN_COOKIE}=${sessionToken()}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`,
  );
  return res;
}
