import type { StreamEvent } from '@repo/shared';
import type { Message } from '../entities/message.entity';

export interface IAIProvider {
  stream(history: Message[]): AsyncIterable<StreamEvent>;
}
