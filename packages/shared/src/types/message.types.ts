import type { ToolResult } from './chat.types';

export type MessageRole = 'user' | 'assistant';

export interface Message {
  _id: string;
  chatId: string;
  userId: string;
  role: MessageRole;
  content: string;
  toolResults: ToolResult[];
  createdAt: Date;
}

export interface MessageDto {
  _id: string;
  chatId: string;
  userId: string;
  role: MessageRole;
  content: string;
  toolResults: ToolResult[];
  createdAt: string;
}
