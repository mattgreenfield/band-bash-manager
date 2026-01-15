import { Context } from "@netlify/functions";
import { MongoClient } from "mongodb";

let cachedClient: MongoClient | null = null;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }

  const dbURI = process.env.MONGODB_URI;
  if (!dbURI) {
    throw new Error("MONGODB_URI is not defined in environment variables");
  }

  const client = new MongoClient(dbURI);
  await client.connect();
  cachedClient = client;
  return client;
}

export default async (
  request: Request,
  context: Context
): Promise<Response | undefined> => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (request.method === "OPTIONS") {
    return new Response("", {
      status: 200,
      headers,
    });
  }

  try {
    const client = await connectToDatabase();
    const db = client.db("setlist_organiser");

    const songs = await db.collection("songs").find({}).toArray();

    return new Response(JSON.stringify(songs), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error fetching songs:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch songs" }), {
      status: 500,
      headers,
    });
  }
};
