import { NextResponse, type NextRequest } from "next/server";
import { reconcilePlanWithAccount } from "@/app/auth-actions";
import { exchangeCode, lineConfigured, verifyIdToken } from "@/lib/line";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** LINE redirects here with ?code&state. Bridge the LINE identity into Supabase. */
export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const fail = (reason: string) =>
    NextResponse.redirect(new URL(`/login?error=${reason}`, origin));

  if (!lineConfigured()) {
    return fail("line_unconfigured");
  }

  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const savedState = req.cookies.get("line_oauth_state")?.value;
  if (!code || !state || !savedState || state !== savedState) {
    return fail("line_state");
  }

  try {
    const tokens = await exchangeCode(code, `${origin}/auth/line/callback`);
    if (!tokens.id_token) {
      return fail("line_token");
    }
    const profile = await verifyIdToken(tokens.id_token);

    // Stable identity tied to the LINE user id (email scope may be unavailable).
    const email = `line_${profile.sub}@line.local`;
    const admin = createAdminClient();

    const { error: createError } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        provider: "line",
        line_id: profile.sub,
        name: profile.name ?? null,
        avatar: profile.picture ?? null,
        line_email: profile.email ?? null,
      },
    });
    // "already registered" just means a returning user — anything else is fatal.
    if (createError && !/registered|exists/i.test(createError.message)) {
      return fail("line_user");
    }

    const { data: link, error: linkError } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
    });
    const tokenHash = link?.properties?.hashed_token;
    if (linkError || !tokenHash) {
      return fail("line_link");
    }

    const supabase = await createClient();
    const { data: verified, error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: "email",
    });
    if (verifyError || !verified.user) {
      return fail("line_session");
    }

    await reconcilePlanWithAccount(supabase, verified.user.id);

    const res = NextResponse.redirect(new URL("/plan", origin));
    res.cookies.delete("line_oauth_state");
    return res;
  } catch {
    return fail("line_failed");
  }
}
