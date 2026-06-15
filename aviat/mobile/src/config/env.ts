const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const requireEnv = (value: string | undefined, name: string) => {
  if (!value) {
    throw new Error(`Missing required env variable: ${name}`);
  }

  return value;
};

const fallbackWebUrl = 'https://aviatorz.bounceme.net';

const webUrl = trimTrailingSlash(
  process.env.EXPO_PUBLIC_WEB_URL ?? process.env.EXPO_PUBLIC_API_URL ?? fallbackWebUrl
);

export const env = {
  apiUrl: trimTrailingSlash(process.env.EXPO_PUBLIC_API_URL ?? webUrl),
  webUrl,
  supportTelegram: process.env.EXPO_PUBLIC_SUPPORT_TELEGRAM ?? 'aviatr_admin',
  supabaseUrl: requireEnv(process.env.EXPO_PUBLIC_SUPABASE_URL, 'EXPO_PUBLIC_SUPABASE_URL'),
  supabaseAnonKey: requireEnv(
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    'EXPO_PUBLIC_SUPABASE_ANON_KEY'
  ),
};
