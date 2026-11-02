import { MongoClient } from "mongodb";

let db;

export async function connectToDatabase() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  db = client.db();
  console.log("Connected to MongoDB");
}

export function getDb() {
  if (!db) {
    throw new Error("База данных не подключена");
  }
  return db;
}
