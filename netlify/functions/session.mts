import { Context } from "@netlify/functions";

// Hardcoded credentials - in production, use environment variables
const VALID_USERNAME = "southern_blues";
const VALID_PASSWORD = "collective";

// Simple token generation - includes username and timestamp, signed with a secret
const TOKEN_SECRET = "setlist-manager-secret-key-2024";

function generateToken(username: string): string {
  const payload = {
    username,
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString("base64");
  // Simple HMAC-like signature using the secret
  const signature = Buffer.from(`${payloadBase64}.${TOKEN_SECRET}`).toString("base64");
  return `${payloadBase64}.${signature}`;
}

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

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

export default async (
  request: Request,
  context: Context
): Promise<Response> => {
  if (request.method === "OPTIONS") {
    return new Response("", { status: 200, headers });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers,
    });
  }

  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return new Response(
        JSON.stringify({ error: "Username and password required" }),
        { status: 400, headers }
      );
    }

    if (username !== VALID_USERNAME || password !== VALID_PASSWORD) {
      return new Response(
        JSON.stringify({ error: "Invalid credentials" }),
        { status: 401, headers }
      );
    }

    const token = generateToken(username);

    return new Response(
      JSON.stringify({ token, username }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error("Error in session function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers }
    );
  }
};
