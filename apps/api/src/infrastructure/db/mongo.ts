import { MongoClient, type Db } from 'mongodb';
import { env } from '../../env';

export async function connectDb(maxRetries = 10, delayMs = 2000): Promise<{ client: MongoClient; db: Db }> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const client = new MongoClient(env.MONGODB_URI);
      await client.connect();
      await client.db().command({ ping: 1 });

      const db = client.db();
      await db.collection('chats').createIndex({ userId: 1, updatedAt: -1 });
      await db.collection('chats').createIndex({ title: 'text' });
      await db.collection('messages').createIndex({ chatId: 1, createdAt: 1 });

      return { client, db };
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        console.warn(`MongoDB connection attempt ${attempt}/${maxRetries} failed, retrying in ${delayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
  throw lastError;
}
