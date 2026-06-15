import { useState } from 'react';
import { useRouter } from 'expo-router';

import { AuthShell } from '../../components/auth/AuthShell';
import { LoginForm, type LoginFormSubmission } from '../../components/auth/LoginForm';
import {
  signInWithEmail,
  signInWithPhone,
  signInWithSocial,
} from '../../src/lib/auth';

const mapLoginError = (message: string, payload: LoginFormSubmission) => {
  if (message.includes('Invalid login credentials')) {
    if (payload.loginMethod === 'email') {
      return 'Неверный email или пароль';
    }

    if (payload.loginMethod === 'phone' && payload.phone.trim()) {
      return 'Неверный номер телефона или пароль';
    }

    return 'Социальный вход для этого устройства не найден';
  }

  if (message.includes('Email is required')) {
    return 'Введите email';
  }

  if (message.includes('Phone number is required')) {
    return 'Введите номер телефона';
  }

  if (message.includes('Password is required')) {
    return payload.socialProviderId ? 'Выберите соцсеть или введите пароль' : 'Введите пароль';
  }

  if (message.includes('Social network is required')) {
    return 'Выберите социальную сеть';
  }

  if (message.includes('Invalid API key')) {
    return 'Неверный ключ Supabase в мобильной конфигурации';
  }

  return message;
};

export default function LoginScreen() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (payload: LoginFormSubmission) => {
    setErrorMessage(null);
    setLoading(true);

    try {
      if (payload.loginMethod === 'phone' && payload.phone.trim()) {
        await signInWithPhone(payload.country, payload.phone, payload.password);
      } else if (payload.loginMethod === 'email' && payload.email.trim()) {
        await signInWithEmail(payload.email, payload.password);
      } else if (payload.socialProviderId) {
        await signInWithSocial(payload.socialProviderId);
      } else if (payload.loginMethod === 'email') {
        throw new Error('Email is required');
      } else {
        throw new Error('Phone number is required');
      }

      router.replace('/main');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось выполнить вход';
      setErrorMessage(mapLoginError(message, payload));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell scene="login">
      <LoginForm
        errorMessage={errorMessage}
        loading={loading}
        onLogin={handleLogin}
        onOpenRegister={() => router.push('/auth/register')}
      />
    </AuthShell>
  );
}
