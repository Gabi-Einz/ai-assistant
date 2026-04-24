import { MongoClient, type Db } from 'mongodb';
import { env } from '../../env';

export async function connectDb(): Promise<{ client: MongoClient; db: Db }> {
  const client = new MongoClient(env.MONGODB_URI);
  await client.connect();
  await client.db().command({ ping: 1 });

  const db = client.db();

  await db.collection('chats').createIndex({ userId: 1, updatedAt: -1 });
  await db.collection('chats').createIndex({ title: 'text' });
  await db.collection('messages').createIndex({ chatId: 1, createdAt: 1 });

  return { client, db };
}
