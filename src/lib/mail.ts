import "server-only";
const env = (n: string) => process.env[n] || undefined;

export function siteUrl(): string {
  return (env("SITE_URL") ?? "https://kivrei-tzadikim.caprover.clicker.co.il").replace(/\/$/, "");
}

/** שליחה דרך Mailer API (mail.retsef.co.il). המפתח נשמר ב-MAILER_API_KEY. */
const API = () => (env("MAILER_API_URL") ?? "https://mail.retsef.co.il").replace(/\/$/, "");

export const mailConfigured = () => Boolean(env("MAILER_API_KEY") && env("MAIL_FROM"));

export async function sendMail(opts: { to: string; subject: string; html: string; text: string; idempotencyKey?: string; metadata?: Record<string, string> }) {
  if (!mailConfigured()) {
    console.warn("[mail] MAILER_API_KEY / MAIL_FROM not configured, skipping mail to", opts.to);
    return false;
  }
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(`${API()}/v1/emails`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env("MAILER_API_KEY")}`,
        "Content-Type": "application/json",
        ...(opts.idempotencyKey ? { "Idempotency-Key": opts.idempotencyKey } : {}),
      },
      body: JSON.stringify({
        from: { email: env("MAIL_FROM"), name: env("MAIL_FROM_NAME") ?? "קברי צדיקים" },
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
        text: opts.text,
        type: "transactional",
        metadata: opts.metadata,
      }),
    });
    if (res.ok) return true;
    if (res.status === 429) {
      await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
      continue;
    }
    const err = (await res.json().catch(() => ({}))) as { error?: { code?: string; message?: string } };
    throw new Error(`Mailer API ${res.status}: ${err.error?.code ?? ""} ${err.error?.message ?? ""}`);
  }
  throw new Error("Mailer API: too many requests");
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** תבנית מייל בעברית בצבעי האתר. body הוא HTML מוכן. */
export function layout(title: string, body: string, footerLinks: { label: string; url: string }[] = []) {
  const links = footerLinks.map((l) => `<a href="${l.url}" style="color:#a57a2c">${esc(l.label)}</a>`).join(" · ");
  return `<!doctype html><html lang="he" dir="rtl"><body style="margin:0;background:#f8f3e8;font-family:Arial,Helvetica,sans-serif;color:#1c1a17">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f3e8;padding:24px 0"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fffdf8;border:1px solid #e6dbc4;border-radius:16px;overflow:hidden">
<tr><td style="background:#0e1a2b;padding:24px;text-align:right">
<div style="font-size:24px;font-weight:bold;color:#d9b26a">🕯️ קברי צדיקים</div>
<div style="font-size:18px;color:#f6efe1;margin-top:6px">${esc(title)}</div></td></tr>
<tr><td style="padding:24px;text-align:right;font-size:16px;line-height:1.7">${body}</td></tr>
<tr><td style="padding:16px 24px;border-top:1px solid #e6dbc4;font-size:12px;color:#6f6556;text-align:right">
קיבלת את המייל כי נרשמת להתראות באתר <a href="${siteUrl()}" style="color:#a57a2c">קברי צדיקים</a>.<br>${links}</td></tr>
</table></td></tr></table></body></html>`;
}

export { esc };
