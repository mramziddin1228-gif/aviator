import type { ComponentProps } from 'react';
import type { KeyboardTypeOptions } from 'react-native';
import type MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export type LoginMethod = 'phone' | 'email';
export type RegistrationTypeId = 'phone' | 'email' | 'oneClick' | 'social';
export type AuthIconName = ComponentProps<typeof MaterialCommunityIcons>['name'];
export type AuthBrandIconName =
  | 'reg-phone'
  | 'reg-email'
  | 'reg-one-click'
  | 'reg-social'
  | 'social-google'
  | 'social-telegram'
  | 'social-vk'
  | 'social-mail'
  | 'social-ok'
  | 'social-yandex'
  | 'social-x'
  | 'social-apple'
  | 'social-discord'
  | 'social-itsme';

export type RegistrationTypeOption = {
  id: RegistrationTypeId;
  iconName: AuthBrandIconName;
  title: string;
};

export type SocialProvider = {
  id: string;
  iconName: AuthBrandIconName;
  title: string;
};

export type RegistrationFieldDescriptor = {
  key: string;
  kind: 'text' | 'phone' | 'password' | 'select' | 'date';
  keyboardType?: KeyboardTypeOptions;
  label: string;
  placeholder: string;
};

export const authTheme = {
  colors: {
    background: '#1d222a',
    backgroundContent: '#292f39',
    backgroundGroup: '#3a4250',
    backgroundLight60: '#995a6272',
    commerce: '#ffa300',
    commerceForeground: '#ffffff',
    inputBackground: '#9915181e',
    overlay40: '#66000000',
    overlay60: '#99000000',
    primary: '#0075ff',
    primary20: '#330075ff',
    primaryForeground: '#ffffff',
    primaryHighlight: '#0867d7',
    secondary: '#8c94a4',
    secondary20: '#338c94a4',
    secondary40: '#668c94a4',
    secondaryButtonBackground: '#2e3e54',
    secondaryButtonBackgroundHighlight: '#2c3747',
    secondaryButtonForeground: '#0075ff',
    separator: '#424957',
    separator30: '#4d424957',
    staticRed: '#f54b4b',
    textPrimary: '#eeeff1',
    white80: '#ccffffff',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  radii: {
    xs: 6,
    sm: 12,
    md: 16,
    full: 999,
    xl: 24,
  },
  sizes: {
    authContentMinHeight: 436,
    button: 48,
    footerMaxWidth: 144,
    input: 56,
    menuCell: 64,
    social: 40,
    titleLogin: 42,
    titleRegister: 44,
    toolbar: 56,
  },
  elevation: {
    md: 8,
  },
  strings: {
    accountNotExist: 'Нет аккаунта?',
    alreadyHaveAnAccount: 'Уже есть аккаунт?',
    authorization: 'Авторизация',
    chooseRegistrationType: 'Выберите предпочитаемый тип\nрегистрации:',
    chooseSocialNetwork: 'Выберите социальную сеть',
    country: 'Страна',
    countryPlaceholder: 'Выберите страну',
    currency: 'Валюта',
    currencyPlaceholder: 'Выберите валюту',
    dateOfBirth: 'Дата рождения',
    day: 'День',
    email: 'Email',
    enterEmail: 'Введите email',
    forgotPassword: 'Забыли пароль?',
    login: 'Войти',
    month: 'Месяц',
    name: 'Имя',
    offerToAuthRegistrationButton: 'Зарегистрироваться',
    offerToRegistration: 'Зарегистрируйтесь',
    password: 'Пароль',
    personalData: 'Личные данные',
    phone: 'Телефон',
    phoneNumber: 'Номер телефона',
    politicallyExposed:
      'Являетесь ли вы политически значимым лицом, его/её близким членом семьи или близким деловым партнером?',
    promo: 'Промо',
    promoPlaceholder: 'Введите промокод',
    registration: 'Регистрация',
    registrationMarketing:
      'Я согласен получать маркетинговые уведомления и предложения через SMS, email, телефонные звонки',
    registrationRules: 'Я соглашаюсь с правилами и условиями компании',
    socialNetwork: 'Социальная сеть',
    year: 'Год',
    cancel: 'Отмена',
    apply: 'Применить',
    authPickerPhoneTitle: 'Выберите код страны',
  },
} as const;

export const loginSocialProviders: SocialProvider[] = [
  { id: 'vk', iconName: 'social-vk', title: 'ВКонтакте' },
  { id: 'google', iconName: 'social-google', title: 'Google' },
  { id: 'telegram', iconName: 'social-telegram', title: 'Telegram' },
  { id: 'mail', iconName: 'social-mail', title: 'Mail.ru' },
];

export const registrationTypeOptions: RegistrationTypeOption[] = [
  { id: 'phone', iconName: 'reg-phone', title: 'По телефону' },
  { id: 'email', iconName: 'reg-email', title: 'По Email' },
  { id: 'oneClick', iconName: 'reg-one-click', title: 'В один клик' },
  { id: 'social', iconName: 'reg-social', title: 'Через социальные сети' },
];

export const registrationSocialProviders: SocialProvider[] = [
  { id: 'vk', iconName: 'social-vk', title: 'ВКонтакте' },
  { id: 'ok', iconName: 'social-ok', title: 'Одноклассники' },
  { id: 'yandex', iconName: 'social-yandex', title: 'Яндекс' },
  { id: 'mail', iconName: 'social-mail', title: 'Mail.ru' },
  { id: 'google', iconName: 'social-google', title: 'Google' },
  { id: 'x', iconName: 'social-x', title: 'X' },
  { id: 'telegram', iconName: 'social-telegram', title: 'Telegram' },
  { id: 'apple', iconName: 'social-apple', title: 'Apple ID' },
  { id: 'discord', iconName: 'social-discord', title: 'Discord' },
  { id: 'itsme', iconName: 'social-itsme', title: 'Its Me' },
];

export const registrationAgreementItems = [
  {
    id: 'rules',
    label: authTheme.strings.registrationRules,
  },
  {
    id: 'marketing',
    label: authTheme.strings.registrationMarketing,
  },
  {
    id: 'politicallyExposed',
    label: authTheme.strings.politicallyExposed,
  },
] as const;

export function getRegistrationAgreementItems(type: RegistrationTypeId) {
  if (type === 'oneClick' || type === 'social') {
    return registrationAgreementItems.filter((item) => item.id !== 'politicallyExposed');
  }

  return registrationAgreementItems;
}

export function getRegistrationFields(type: RegistrationTypeId): RegistrationFieldDescriptor[] {
  const commonSelects: RegistrationFieldDescriptor[] = [
    {
      key: 'country',
      kind: 'select',
      label: authTheme.strings.country,
      placeholder: authTheme.strings.countryPlaceholder,
    },
    {
      key: 'currency',
      kind: 'select',
      label: authTheme.strings.currency,
      placeholder: authTheme.strings.currencyPlaceholder,
    },
  ];

  if (type === 'phone') {
    return [
      commonSelects[0],
      {
        key: 'phone',
        kind: 'phone',
        label: authTheme.strings.phoneNumber,
        placeholder: authTheme.strings.phone,
      },
      {
        key: 'birthDate',
        kind: 'date',
        label: authTheme.strings.dateOfBirth,
        placeholder: authTheme.strings.dateOfBirth,
      },
      commonSelects[1],
      {
        key: 'password',
        kind: 'password',
        label: authTheme.strings.password,
        placeholder: authTheme.strings.password,
      },
      {
        key: 'promo',
        kind: 'text',
        label: authTheme.strings.promo,
        placeholder: authTheme.strings.promoPlaceholder,
      },
    ];
  }

  if (type === 'email') {
    return [
      commonSelects[0],
      {
        key: 'email',
        kind: 'text',
        keyboardType: 'email-address',
        label: authTheme.strings.email,
        placeholder: authTheme.strings.enterEmail,
      },
      {
        key: 'birthDate',
        kind: 'date',
        label: authTheme.strings.dateOfBirth,
        placeholder: authTheme.strings.dateOfBirth,
      },
      commonSelects[1],
      {
        key: 'password',
        kind: 'password',
        label: authTheme.strings.password,
        placeholder: authTheme.strings.password,
      },
      {
        key: 'promo',
        kind: 'text',
        label: authTheme.strings.promo,
        placeholder: authTheme.strings.promoPlaceholder,
      },
    ];
  }

  if (type === 'oneClick') {
    return [
      commonSelects[0],
      {
        key: 'phone',
        kind: 'phone',
        label: authTheme.strings.phoneNumber,
        placeholder: authTheme.strings.phone,
      },
      commonSelects[1],
      {
        key: 'promo',
        kind: 'text',
        label: authTheme.strings.promo,
        placeholder: authTheme.strings.promoPlaceholder,
      },
    ];
  }

  return [
    commonSelects[0],
    commonSelects[1],
    {
      key: 'promo',
      kind: 'text',
      label: authTheme.strings.promo,
      placeholder: authTheme.strings.promoPlaceholder,
    },
  ];
}
