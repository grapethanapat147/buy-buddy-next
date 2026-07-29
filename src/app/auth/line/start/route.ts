import { NextResponse, type NextRequest } from "next/server";
import { buildAuthorizeUrl, lineConfigured } from "@/lib/line";

/** Kick off LINE Login: set a CSRF state cookie and redirect to LINE. */
export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;

  if (!lineConfigured()) {
    return NextResponse.redirect(new URL("/login?error=line_unconfigured", origin));
  }

  const state = crypto.randomUUID();
  const redirectUri = `${origin}/auth/line/callback`;
  const res = NextResponse.redirect(buildAuthorizeUrl(state, redirectUri));
  res.cookies.set("line_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: origin.startsWith("https"),
    path: "/",
    maxAge: 60 * 10,
  });
  return res;
}
