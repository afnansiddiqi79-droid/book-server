import { MongoClient } from "mongodb";

let client;

export async function connectDB() {
  if (client) return client;

  client = new MongoClient(process.env.DB_URL);
  await client.connect();
  return client;
}

export function getDB() {
  if (!client) {
    throw new Error("Database client is not initialized");
  }
  return client.db(process.env.DB_NAME);
}
