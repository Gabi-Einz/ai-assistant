import { createAnthropic } from '@ai-sdk/anthropic';
import type { Db } from 'mongodb';
import { env } from '../env';
import { MongoChatRepository } from './repositories/mongo-chat.repository';
import { MongoMessageRepository } from './repositories/mongo-message.repository';
import { AiSdkProvider } from './ai/ai-sdk.provider';
import { DateTimeProvider } from './providers/datetime.provider';
import { WeatherProvider } from './providers/weather.provider';
import { buildTools } from './tools';
import { CreateChatUseCase } from '../application/use-cases/chat/create-chat.use-case';
import { ListChatsUseCase } from '../application/use-cases/chat/list-chats.use-case';
import { SearchChatsUseCase } from '../application/use-cases/chat/search-chats.use-case';
import { RenameChatUseCase } from '../application/use-cases/chat/rename-chat.use-case';
import { PinChatUseCase } from '../application/use-cases/chat/pin-chat.use-case';
import { DeleteChatUseCase } from '../application/use-cases/chat/delete-chat.use-case';
import { SendMessageUseCase } from '../application/use-cases/message/send-message.use-case';
import { ListMessagesUseCase } from '../application/use-cases/message/list-messages.use-case';

export async function initContainer(db: Db) {
  const chatRepo = new MongoChatRepository(db);
  const messageRepo = new MongoMessageRepository(db);

  const dateTimeProvider = new DateTimeProvider();
  const weatherProvider = new WeatherProvider(env.WEATHER_API_KEY);
  const tools = buildTools({ dateTimeProvider, weatherProvider });

  const anthropic = createAnthropic({ apiKey: env.AI_API_KEY });
  const model = anthropic('claude-haiku-4-5');
  const aiProvider = new AiSdkProvider(model, tools);

  return {
    createChat: new CreateChatUseCase(chatRepo),
    listChats: new ListChatsUseCase(chatRepo),
    searchChats: new SearchChatsUseCase(chatRepo),
    renameChat: new RenameChatUseCase(chatRepo),
    pinChat: new PinChatUseCase(chatRepo),
    deleteChat: new DeleteChatUseCase(chatRepo, messageRepo),
    sendMessage: new SendMessageUseCase(chatRepo, messageRepo, aiProvider),
    listMessages: new ListMessagesUseCase(chatRepo, messageRepo),
  };
}

export type Container = Awaited<ReturnType<typeof initContainer>>;
