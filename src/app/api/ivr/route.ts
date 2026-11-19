import type { NextRequest } from "next/server";
import { handleIvr } from "@/lib/ivr";

/**
 * נקודת הקצה שמגדירים בשלוחת API במרכזייה, לדוגמה:
 * https://<domain>/api/ivr
 * המרכזייה תמיד מצפה ל-JSON. בכל תקלה מחזירים תפריט תקין כדי שהשיחה לא "תחזור אחורה".
 */
async function respond(req: NextRequest) {
  const params: Record<string, string> = {};
  req.nextUrl.searchParams.forEach((v, k) => (params[k] = v));
  if (req.method === "POST") {
    const ct = req.headers.get("content-type") ?? "";
    if (ct.includes("form")) (await req.formData()).forEach((v, k) => (params[k] = String(v)));
  }
  try {
    return Response.json(await handleIvr(params));
  } catch (e) {
    console.error("ivr error", e);
    return Response.json({
      type: "simpleMessage",
      files: [{ text: "אירעה תקלה זמנית. נסו שוב מאוחר יותר." }],
    });
  }
}

export const GET = respond;
export const POST = respond;
