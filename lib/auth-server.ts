// lib/auth-server.ts  (NEW FILE)
// Server-side: find out WHO is calling an API route, from their login token.
// Never trust a userId that the browser sends in a form or JSON body.
import { supabaseAdmin } from "@/lib/supabase"

// An error that is safe to show to the user, with the right HTTP status
export class HttpError extends Error {
  status: number
  constructor(message: string, status = 400) {
    super(message)
    this.status = status
  }
}

export async function requireUser(req: Request): Promise<string> {
  const header = req.headers.get("authorization")
  if (!header?.startsWith("Bearer ")) {
    throw new HttpError("Authentication required. Please sign in.", 401)
  }

  const { data, error } = await supabaseAdmin.auth.getUser(header.slice(7))
  if (error || !data?.user) {
    throw new HttpError("Your session has expired. Please sign in again.", 401)
  }

  return data.user.id
}

// Best-effort caller IP (for rate limits)
export function getClientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
}