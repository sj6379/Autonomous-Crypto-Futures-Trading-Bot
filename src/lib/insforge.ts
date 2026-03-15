import { createClient } from '@insforge/sdk';

if (!process.env.NEXT_PUBLIC_INSFORGE_BASE_URL) {
  throw new Error('NEXT_PUBLIC_INSFORGE_BASE_URL is not defined');
}

if (!process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY) {
  throw new Error('NEXT_PUBLIC_INSFORGE_ANON_KEY is not defined');
}

export const insforge = createClient({
  baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL,
  anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY,
});
