import { MongoClient, type Db } from 'mongodb';

let client: MongoClient | null = null;

export async function connectDb(): Promise<Db> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');

  client = new MongoClient(uri);
  await client.connect();
  await client.db().command({ ping: 1 });

  const db = client.db();

  await db.collection('chats').createIndex({ userId: 1, updatedAt: -1 });
  await db.collection('chats').createIndex({ title: 'text' });
  await db.collection('messages').createIndex({ chatId: 1, createdAt: 1 });

  return db;
}
