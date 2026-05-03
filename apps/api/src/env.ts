import { z } from 'zod';

const envSchema = z.object({
  MONGODB_URI: z.string().min(1),
  AI_API_KEY: z.string().min(1),
  WEATHER_API_KEY: z.string().min(1),
  BETTERAUTH_SECRET: z.string().min(1),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  API_URL: z.string().url().default('http://localhost:3000'),
  WEB_URL: z.string().url().default('http://localhost:3001'),
});

export const env = envSchema.parse(process.env);
