import { Context } from "@netlify/functions";
import { MongoClient, ObjectId } from "mongodb";

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

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Content-Type": "application/json",
};

export default async (
  request: Request,
  context: Context
): Promise<Response> => {
  if (request.method === "OPTIONS") {
    return new Response("", { status: 200, headers });
  }

  try {
    const client = await connectToDatabase();
    const db = client.db("setlist_organiser");
    const collection = db.collection("songs");

    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    // GET - Fetch all songs or single song by id
    if (request.method === "GET") {
      if (id) {
        const song = await collection.findOne({ _id: new ObjectId(id) });
        if (!song) {
          return new Response(JSON.stringify({ error: "Song not found" }), {
            status: 404,
            headers,
          });
        }
        return new Response(JSON.stringify(song), { status: 200, headers });
      }
      const songs = await collection.find({}).toArray();
      return new Response(JSON.stringify(songs), { status: 200, headers });
    }

    // POST - Create new song
    if (request.method === "POST") {
      const body = await request.json();
      const result = await collection.insertOne(body);
      const newSong = await collection.findOne({ _id: result.insertedId });
      return new Response(JSON.stringify(newSong), { status: 201, headers });
    }

    // PUT - Update song by id
    if (request.method === "PUT") {
      if (!id) {
        return new Response(JSON.stringify({ error: "Song ID required" }), {
          status: 400,
          headers,
        });
      }
      const body = await request.json();
      const { _id, ...updateData } = body;
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: "after" }
      );
      if (!result) {
        return new Response(JSON.stringify({ error: "Song not found" }), {
          status: 404,
          headers,
        });
      }
      return new Response(JSON.stringify(result), { status: 200, headers });
    }

    // DELETE - Delete song by id
    if (request.method === "DELETE") {
      if (!id) {
        return new Response(JSON.stringify({ error: "Song ID required" }), {
          status: 400,
          headers,
        });
      }
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      if (result.deletedCount === 0) {
        return new Response(JSON.stringify({ error: "Song not found" }), {
          status: 404,
          headers,
        });
      }
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers,
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers,
    });
  } catch (error) {
    // Safely extract errInfo.details if present; error is unknown so narrow its type
    const details =
      error &&
      typeof error === "object" &&
      "errInfo" in error &&
      (error as any).errInfo &&
      (error as any).errInfo.details
        ? (error as any).errInfo.details
        : error;
    console.error("Error in songs function:", JSON.stringify(details));
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers,
    });
  }
};
