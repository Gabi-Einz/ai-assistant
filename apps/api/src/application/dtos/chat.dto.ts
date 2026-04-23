export interface CreateChatInput {
  userId: string;
  title: string;
}

export interface ListChatsInput {
  userId: string;
  cursor: string | null;
  limit: number;
}

export interface SearchChatsInput {
  userId: string;
  query: string;
}

export interface RenameChatInput {
  chatId: string;
  userId: string;
  title: string;
}

export interface PinChatInput {
  chatId: string;
  userId: string;
}

export interface DeleteChatInput {
  chatId: string;
  userId: string;
}
