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

export default async (
  request: Request,
  context: Context
): Promise<Response | undefined> => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Content-Type": "application/json",
  };

  if (request.method === "OPTIONS") {
    return new Response("", { status: 200, headers });
  }

  try {
    const client = await connectToDatabase();
    const db = client.db("setlist_organiser");
    const collection = db.collection("setlists");
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    // GET - Fetch all setlists or single by id
    if (request.method === "GET") {
      if (id) {
        const setlist = await collection.findOne({ _id: new ObjectId(id) });
        if (!setlist) {
          return new Response(JSON.stringify({ error: "Setlist not found" }), {
            status: 404,
            headers,
          });
        }
        return new Response(JSON.stringify(setlist), { status: 200, headers });
      }
      const setlists = await collection.find({}).toArray();
      return new Response(JSON.stringify(setlists), { status: 200, headers });
    }

    // POST - Create new setlist
    if (request.method === "POST") {
      const body = await request.json();
      const { name, description, songIds } = body;

      if (!name || typeof name !== "string" || name.trim().length === 0) {
        return new Response(JSON.stringify({ error: "Name is required" }), {
          status: 400,
          headers,
        });
      }

      const newSetlist = {
        name: name.trim(),
        description: description?.trim() || "",
        songIds: songIds || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = await collection.insertOne(newSetlist);
      const created = await collection.findOne({ _id: result.insertedId });

      return new Response(JSON.stringify(created), { status: 201, headers });
    }

    // PUT - Update existing setlist
    if (request.method === "PUT") {
      if (!id) {
        return new Response(JSON.stringify({ error: "ID is required" }), {
          status: 400,
          headers,
        });
      }

      const body = await request.json();
      const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };

      if (body.name !== undefined) updates.name = body.name.trim();
      if (body.description !== undefined) updates.description = body.description.trim();
      if (body.songIds !== undefined) updates.songIds = body.songIds;

      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updates },
        { returnDocument: "after" }
      );

      if (!result) {
        return new Response(JSON.stringify({ error: "Setlist not found" }), {
          status: 404,
          headers,
        });
      }

      return new Response(JSON.stringify(result), { status: 200, headers });
    }

    // DELETE - Remove setlist
    if (request.method === "DELETE") {
      if (!id) {
        return new Response(JSON.stringify({ error: "ID is required" }), {
          status: 400,
          headers,
        });
      }

      const result = await collection.deleteOne({ _id: new ObjectId(id) });

      if (result.deletedCount === 0) {
        return new Response(JSON.stringify({ error: "Setlist not found" }), {
          status: 404,
          headers,
        });
      }

      return new Response(JSON.stringify({ success: true }), { status: 200, headers });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers,
    });
  } catch (error) {
    console.error("Error in setlists function:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers,
    });
  }
};
