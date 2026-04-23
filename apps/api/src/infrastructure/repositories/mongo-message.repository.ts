import { ObjectId, type Db, type Collection } from 'mongodb';
import type { Message, MessageRole } from '../../domain/entities/message.entity';
import type { ToolResult } from '@repo/shared';
import type { IMessageRepository } from '../../domain/ports/message-repository.port';

interface MessageDocument {
  _id: ObjectId;
  chatId: string;
  userId: string;
  role: MessageRole;
  content: string;
  toolResults: ToolResult[];
  createdAt: Date;
}

function toMessage(doc: MessageDocument): Message {
  return {
    _id: doc._id.toHexString(),
    chatId: doc.chatId,
    userId: doc.userId,
    role: doc.role,
    content: doc.content,
    toolResults: doc.toolResults,
    createdAt: doc.createdAt,
  };
}

export class MongoMessageRepository implements IMessageRepository {
  private readonly collection: Collection<MessageDocument>;

  constructor(db: Db) {
    this.collection = db.collection<MessageDocument>('messages');
  }

  async save(message: Omit<Message, '_id'>): Promise<Message> {
    const doc: MessageDocument = {
      _id: new ObjectId(),
      chatId: message.chatId,
      userId: message.userId,
      role: message.role,
      content: message.content,
      toolResults: message.toolResults,
      createdAt: message.createdAt,
    };
    await this.collection.insertOne(doc);
    return toMessage(doc);
  }

  async findByChatId(chatId: string): Promise<Message[]> {
    const docs = await this.collection
      .find({ chatId })
      .sort({ createdAt: 1 })
      .toArray();
    return docs.map(toMessage);
  }

  async deleteByChatId(chatId: string): Promise<void> {
    await this.collection.deleteMany({ chatId });
  }
}
