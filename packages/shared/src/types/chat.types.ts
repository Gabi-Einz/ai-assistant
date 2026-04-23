import type { ToolPayload } from '../schemas/tool-payloads.schema';

export interface ToolResult {
  toolName: string;
  payload: ToolPayload;
}

export interface Chat {
  _id: string;
  userId: string;
  title: string;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatDto {
  _id: string;
  userId: string;
  title: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}
