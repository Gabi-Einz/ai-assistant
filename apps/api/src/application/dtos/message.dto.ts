export interface SendMessageInput {
  chatId: string;
  userId: string;
  content: string;
}

export interface ListMessagesInput {
  chatId: string;
  userId: string;
}
