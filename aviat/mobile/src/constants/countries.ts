export type Country = {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  format: string;
  currency: string;
  currencyName: string;
};

export const countries: Country[] = [
  {
    code: 'UZ',
    name: 'Uzbekistan',
    dialCode: '+998',
    flag: '🇺🇿',
    format: '## ### ## ##',
    currency: 'UZS',
    currencyName: "Uzbek so'm (UZS)",
  },
  {
    code: 'RU',
    name: 'Russia',
    dialCode: '+7',
    flag: '🇷🇺',
    format: '### ### ## ##',
    currency: 'RUB',
    currencyName: 'Russian ruble (RUB)',
  },
  {
    code: 'US',
    name: 'United States',
    dialCode: '+1',
    flag: '🇺🇸',
    format: '### ### ####',
    currency: 'USD',
    currencyName: 'US Dollar (USD)',
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    dialCode: '+44',
    flag: '🇬🇧',
    format: '#### ######',
    currency: 'GBP',
    currencyName: 'British Pound (GBP)',
  },
  {
    code: 'DE',
    name: 'Germany',
    dialCode: '+49',
    flag: '🇩🇪',
    format: '### #######',
    currency: 'EUR',
    currencyName: 'Euro (EUR)',
  },
  {
    code: 'FR',
    name: 'France',
    dialCode: '+33',
    flag: '🇫🇷',
    format: '# ## ## ## ##',
    currency: 'EUR',
    currencyName: 'Euro (EUR)',
  },
  {
    code: 'KZ',
    name: 'Kazakhstan',
    dialCode: '+7',
    flag: '🇰🇿',
    format: '### ### ## ##',
    currency: 'KZT',
    currencyName: 'Kazakh tenge (KZT)',
  },
  {
    code: 'TJ',
    name: 'Tajikistan',
    dialCode: '+992',
    flag: '🇹🇯',
    format: '## ### ## ##',
    currency: 'TJS',
    currencyName: 'Tajik somoni (TJS)',
  },
  {
    code: 'KG',
    name: 'Kyrgyzstan',
    dialCode: '+996',
    flag: '🇰🇬',
    format: '### ### ###',
    currency: 'KGS',
    currencyName: 'Kyrgyz som (KGS)',
  },
  {
    code: 'TM',
    name: 'Turkmenistan',
    dialCode: '+993',
    flag: '🇹🇲',
    format: '## ## ## ##',
    currency: 'TMT',
    currencyName: 'Turkmen manat (TMT)',
  },
  {
    code: 'AZ',
    name: 'Azerbaijan',
    dialCode: '+994',
    flag: '🇦🇿',
    format: '## ### ## ##',
    currency: 'AZN',
    currencyName: 'Azerbaijani manat (AZN)',
  },
  {
    code: 'TR',
    name: 'Turkey',
    dialCode: '+90',
    flag: '🇹🇷',
    format: '### ### ## ##',
    currency: 'TRY',
    currencyName: 'Turkish lira (TRY)',
  },
  {
    code: 'AE',
    name: 'UAE',
    dialCode: '+971',
    flag: '🇦🇪',
    format: '## ### ####',
    currency: 'AED',
    currencyName: 'UAE dirham (AED)',
  },
  {
    code: 'IN',
    name: 'India',
    dialCode: '+91',
    flag: '🇮🇳',
    format: '##### #####',
    currency: 'INR',
    currencyName: 'Indian rupee (INR)',
  },
  {
    code: 'CN',
    name: 'China',
    dialCode: '+86',
    flag: '🇨🇳',
    format: '### #### ####',
    currency: 'CNY',
    currencyName: 'Chinese yuan (CNY)',
  },
  {
    code: 'JP',
    name: 'Japan',
    dialCode: '+81',
    flag: '🇯🇵',
    format: '## #### ####',
    currency: 'JPY',
    currencyName: 'Japanese yen (JPY)',
  },
  {
    code: 'KR',
    name: 'South Korea',
    dialCode: '+82',
    flag: '🇰🇷',
    format: '## #### ####',
    currency: 'KRW',
    currencyName: 'South Korean won (KRW)',
  },
  {
    code: 'UA',
    name: 'Ukraine',
    dialCode: '+380',
    flag: '🇺🇦',
    format: '## ### ## ##',
    currency: 'UAH',
    currencyName: 'Ukrainian hryvnia (UAH)',
  },
  {
    code: 'BY',
    name: 'Belarus',
    dialCode: '+375',
    flag: '🇧🇾',
    format: '## ### ## ##',
    currency: 'BYN',
    currencyName: 'Belarusian ruble (BYN)',
  },
  {
    code: 'PL',
    name: 'Poland',
    dialCode: '+48',
    flag: '🇵🇱',
    format: '### ### ###',
    currency: 'PLN',
    currencyName: 'Polish zloty (PLN)',
  },
];

export const formatPhoneNumber = (value: string, format: string) => {
  const digits = value.replace(/\D/g, '');
  let result = '';
  let digitIndex = 0;

  for (let index = 0; index < format.length && digitIndex < digits.length; index += 1) {
    if (format[index] === '#') {
      result += digits[digitIndex];
      digitIndex += 1;
    } else {
      result += format[index];
    }
  }

  return result;
};

export const normalizePhoneNumber = (country: Country, value: string) =>
  `${country.dialCode}${value.replace(/\D/g, '')}`;

export const buildPhoneLoginEmail = (phone: string) =>
  `${phone.replace('+', '')}@number.login`;
