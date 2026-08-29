import type { Context } from "@netlify/edge-functions";

export default async (_request: Request, context: Context) => {
  const response = await context.next();
  const country = context.geo?.country?.code?.toUpperCase() || "ZZ";
  const headers = new Headers(response.headers);

  // First-party, non-HttpOnly cookie so the bootstrap script can read it before
  // the existing KO/EN runtime initializes. Session scope avoids stale location
  // data across future browser sessions.
  headers.append(
    "Set-Cookie",
    `padiem-geo-country=${encodeURIComponent(country)}; Path=/; SameSite=Lax; Secure`,
  );

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};
