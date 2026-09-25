/**
 * Authenticated fetch for admin API routes.
 * Automatically includes cookies so the server-side requireAdmin() check passes.
 * Use this everywhere you call /api/admin/* from client components.
 */
export async function adminFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  return fetch(input, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers as Record<string, string> | undefined),
    },
  });
}
