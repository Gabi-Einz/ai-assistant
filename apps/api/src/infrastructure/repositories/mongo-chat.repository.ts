import { ObjectId, type Db, type Collection } from 'mongodb';
import type { Chat } from '../../domain/entities/chat.entity';
import type { IChatRepository } from '../../domain/ports/chat-repository.port';

interface ChatDocument {
  _id: ObjectId;
  userId: string;
  title: string;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function toChat(doc: ChatDocument): Chat {
  return {
    _id: doc._id.toHexString(),
    userId: doc.userId,
    title: doc.title,
    isPinned: doc.isPinned,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export class MongoChatRepository implements IChatRepository {
  private readonly collection: Collection<ChatDocument>;

  constructor(db: Db) {
    this.collection = db.collection<ChatDocument>('chats');
  }

  async create(userId: string, title: string): Promise<Chat> {
    const now = new Date();
    const doc: ChatDocument = {
      _id: new ObjectId(),
      userId,
      title,
      isPinned: false,
      createdAt: now,
      updatedAt: now,
    };
    await this.collection.insertOne(doc);
    return toChat(doc);
  }

  async findById(id: string): Promise<Chat | null> {
    let objectId: ObjectId;
    try {
      objectId = new ObjectId(id);
    } catch {
      return null;
    }
    const doc = await this.collection.findOne({ _id: objectId });
    return doc ? toChat(doc) : null;
  }

  async listByUser(userId: string, cursor: string | null, limit: number): Promise<Chat[]> {
    const filter: Record<string, unknown> = { userId };
    if (cursor) {
      filter['_id'] = { $lt: new ObjectId(cursor) };
    }
    const docs = await this.collection
      .find(filter)
      .sort({ isPinned: -1, updatedAt: -1 })
      .limit(limit)
      .toArray();
    return docs.map(toChat);
  }

  async searchByTitle(userId: string, query: string): Promise<Chat[]> {
    const docs = await this.collection
      .find({ userId, $text: { $search: query } })
      .toArray();
    return docs.map(toChat);
  }

  async rename(id: string, title: string): Promise<void> {
    await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { title, updatedAt: new Date() } },
    );
  }

  async togglePin(id: string): Promise<void> {
    await this.collection.updateOne(
      { _id: new ObjectId(id) },
      [{ $set: { isPinned: { $not: '$isPinned' }, updatedAt: '$$NOW' } }],
    );
  }

  async delete(id: string): Promise<void> {
    await this.collection.deleteOne({ _id: new ObjectId(id) });
  }
}
