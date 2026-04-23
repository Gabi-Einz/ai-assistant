import type { IDateTimeProvider } from '../../domain/ports/datetime-provider.port';

export class DateTimeProvider implements IDateTimeProvider {
  getCurrentDate(): string {
    return new Date().toISOString().split('T')[0] ?? '';
  }

  getCurrentTime(): string {
    const now = new Date();
    const hh = String(now.getUTCHours()).padStart(2, '0');
    const mm = String(now.getUTCMinutes()).padStart(2, '0');
    const ss = String(now.getUTCSeconds()).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }
}
