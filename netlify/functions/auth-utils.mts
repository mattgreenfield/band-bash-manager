// Shared auth utilities for Netlify functions

const TOKEN_SECRET = "setlist-manager-secret-key-2024";

export function verifyToken(token: string): { valid: boolean; username?: string } {
  try {
    const [payloadBase64, signature] = token.split(".");
    if (!payloadBase64 || !signature) {
      return { valid: false };
    }

    // Verify signature
    const expectedSignature = Buffer.from(`${payloadBase64}.${TOKEN_SECRET}`).toString("base64");
    if (signature !== expectedSignature) {
      return { valid: false };
    }

    // Decode and check expiration
    const payload = JSON.parse(Buffer.from(payloadBase64, "base64").toString());
    if (payload.exp < Date.now()) {
      return { valid: false };
    }

    return { valid: true, username: payload.username };
  } catch {
    return { valid: false };
  }
}

export function extractBearerToken(request: Request): string | null {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
}

export function unauthorizedResponse(headers: Record<string, string>): Response {
  return new Response(
    JSON.stringify({ error: "Unauthorized" }),
    { status: 401, headers }
  );
}
