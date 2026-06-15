import { useState } from 'react';
import { useRouter } from 'expo-router';

import { AuthShell } from '../../components/auth/AuthShell';
import {
  RegistrationForm,
  type RegistrationFormSubmission,
} from '../../components/auth/RegistrationForm';
import { RegistrationTypeChoice } from '../../components/auth/RegistrationTypeChoice';
import { type RegistrationTypeOption } from '../../theme/authTheme';
import { registerAccount } from '../../src/lib/auth';

const mapRegistrationError = (message: string) => {
  if (message.includes('User already registered')) {
    return 'Такой аккаунт уже существует';
  }

  if (message.includes('Email is required')) {
    return 'Введите email';
  }

  if (message.includes('Phone number is required')) {
    return 'Введите номер телефона';
  }

  if (message.includes('Password must be at least 6 characters')) {
    return 'Пароль должен содержать минимум 6 символов';
  }

  if (message.includes('Birth date is required')) {
    return 'Выберите дату рождения';
  }

  if (message.includes('Invalid API key')) {
    return 'Неверный ключ Supabase в мобильной конфигурации';
  }

  if (message.includes('Social network is required')) {
    return 'Выберите социальную сеть';
  }

  return message;
};

export default function RegisterScreen() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<RegistrationTypeOption | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (payload: RegistrationFormSubmission) => {
    setErrorMessage(null);
    setLoading(true);

    try {
      await registerAccount({
        birthDate: payload.birthDate,
        country: payload.country,
        currencyCode: payload.currencyCode,
        email: payload.email,
        password: payload.password,
        phoneNumber: payload.phoneNumber,
        promoCode: payload.promoCode,
        registrationType: payload.registrationType,
        socialProviderId: payload.socialProviderId,
      });

      router.replace('/main');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Не удалось создать аккаунт';
      setErrorMessage(mapRegistrationError(message));
    } finally {
      setLoading(false);
    }
  };

  if (selectedType) {
    return (
      <RegistrationForm
        errorMessage={errorMessage}
        key={selectedType.id}
        loading={loading}
        onSubmit={handleSubmit}
        registrationType={selectedType}
        onBack={() => {
          setErrorMessage(null);
          setSelectedType(null);
        }}
      />
    );
  }

  return (
    <AuthShell scene="register">
      <RegistrationTypeChoice
        onOpenLogin={() => router.replace('/auth/login')}
        onSelect={(option) => {
          setErrorMessage(null);
          setSelectedType(option);
        }}
      />
    </AuthShell>
  );
}
