/**
 * LINE Login (OAuth 2.0 / OIDC) helpers. Supabase has no native LINE provider,
 * so we run the LINE flow ourselves and bridge the identity into a Supabase user
 * in the callback route. Requires a LINE *Login* channel (not the Messaging/OA
 * channel): set LINE_CHANNEL_ID and LINE_CHANNEL_SECRET.
 */

const AUTHORIZE = "https://access.line.me/oauth2/v2.1/authorize";
const TOKEN = "https://api.line.me/oauth2/v2.1/token";
const VERIFY = "https://api.line.me/oauth2/v2.1/verify";

export function lineConfigured(): boolean {
  return Boolean(process.env.LINE_CHANNEL_ID && process.env.LINE_CHANNEL_SECRET);
}

export function buildAuthorizeUrl(state: string, redirectUri: string): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.LINE_CHANNEL_ID!,
    redirect_uri: redirectUri,
    state,
    scope: "openid profile email",
  });
  return `${AUTHORIZE}?${params.toString()}`;
}

type TokenResponse = { id_token?: string; access_token?: string };

export async function exchangeCode(code: string, redirectUri: string): Promise<TokenResponse> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: process.env.LINE_CHANNEL_ID!,
    client_secret: process.env.LINE_CHANNEL_SECRET!,
  });
  const res = await fetch(TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    throw new Error(`LINE token exchange failed: ${res.status}`);
  }
  return (await res.json()) as TokenResponse;
}

export type LineProfile = {
  /** LINE user id (stable, unique per Login channel). */
  sub: string;
  name?: string;
  picture?: string;
  email?: string;
};

/** Verify the id_token with LINE and return its verified payload. */
export async function verifyIdToken(idToken: string): Promise<LineProfile> {
  const body = new URLSearchParams({
    id_token: idToken,
    client_id: process.env.LINE_CHANNEL_ID!,
  });
  const res = await fetch(VERIFY, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    throw new Error(`LINE id_token verify failed: ${res.status}`);
  }
  const payload = (await res.json()) as LineProfile;
  if (!payload.sub) {
    throw new Error("LINE id_token has no sub");
  }
  return payload;
}
