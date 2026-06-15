import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  authTheme,
  getRegistrationAgreementItems,
  getRegistrationFields,
  registrationSocialProviders,
  type RegistrationTypeOption,
} from '../../theme/authTheme';
import {
  countries,
  formatPhoneNumber,
  type Country,
} from '../../src/constants/countries';
import { AuthDateSheet, formatBirthDate, type BirthDateValue } from './AuthDateSheet';
import { AuthBrandIcon } from './AuthBrandIcon';
import { AuthPickerSheet, type AuthPickerOption } from './AuthPickerSheet';

export type RegistrationFormSubmission = {
  birthDate: string | null;
  country: Country;
  currencyCode: string;
  email: string;
  password: string;
  phoneNumber: string;
  promoCode: string;
  registrationType: RegistrationTypeOption['id'];
  socialProviderId: string | null;
};

type RegistrationFormProps = {
  errorMessage?: string | null;
  loading?: boolean;
  onBack: () => void;
  onSubmit: (payload: RegistrationFormSubmission) => void;
  registrationType: RegistrationTypeOption;
};

type PickerTarget = 'country' | 'currency' | 'phoneCode' | null;

export function RegistrationForm({
  errorMessage,
  loading = false,
  onBack,
  onSubmit,
  registrationType,
}: RegistrationFormProps) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [birthDate, setBirthDate] = useState<BirthDateValue | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    rules: true,
    marketing: false,
    politicallyExposed: false,
  });
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries.find((country) => country.code === 'RU') ?? countries[0]);
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState((countries.find((country) => country.code === 'RU') ?? countries[0]).currency);
  const [selectedSocial, setSelectedSocial] = useState(registrationSocialProviders[0]?.id ?? '');
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [agreementErrors, setAgreementErrors] = useState<Record<string, boolean>>({});
  const [localErrorMessage, setLocalErrorMessage] = useState<string | null>(null);
  const keyboardAppearance = colorScheme ?? 'default';

  const fields = getRegistrationFields(registrationType.id);
  const agreementItems = getRegistrationAgreementItems(registrationType.id);
  const isSocialRegistration = registrationType.id === 'social';
  const currencyOptions = Array.from(
    new Map(
      countries.map((country) => [
        country.currency,
        {
          id: country.currency,
          label: country.currencyName,
          subtitle: country.currency,
        },
      ]),
    ).values(),
  );
  const countryOptions: AuthPickerOption[] = countries.map((country) => ({
    id: country.code,
    label: country.name,
    subtitle: country.dialCode,
    leading: country.flag,
  }));
  useEffect(() => {
    setFormValues((currentValues) => ({
      ...currentValues,
      phone: formatPhoneNumber(currentValues.phone ?? '', selectedCountry.format),
    }));
  }, [selectedCountry]);

  useEffect(() => {
    setSelectedSocial(registrationSocialProviders[0]?.id ?? '');
    setFieldErrors({});
    setAgreementErrors({});
    setLocalErrorMessage(null);
  }, [registrationType.id]);

  const clearFieldError = (fieldKey: string) => {
    setFieldErrors((currentErrors) => {
      if (!currentErrors[fieldKey]) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };
      delete nextErrors[fieldKey];
      return nextErrors;
    });
  };

  const clearAgreementError = (agreementId: string) => {
    setAgreementErrors((currentErrors) => {
      if (!currentErrors[agreementId]) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };
      delete nextErrors[agreementId];
      return nextErrors;
    });
  };

  const updateFieldValue = (fieldKey: string, value: string) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      [fieldKey]: value,
    }));
    clearFieldError(fieldKey);
    setLocalErrorMessage(null);
  };

  const toggleCheckbox = (id: string) => {
    setCheckedItems((currentState) => ({
      ...currentState,
      [id]: !currentState[id],
    }));
    clearAgreementError(id);
    setLocalErrorMessage(null);
  };

  const selectedCurrency =
    currencyOptions.find((currency) => currency.id === selectedCurrencyCode) ?? currencyOptions[0];

  const applyCountry = (country: Country) => {
    setSelectedCountry(country);
    setSelectedCurrencyCode(country.currency);
    clearFieldError('country');
    clearFieldError('currency');
    clearFieldError('phone');
    setLocalErrorMessage(null);
  };

  const validateForm = () => {
    const nextFieldErrors: Record<string, string> = {};
    const nextAgreementErrors: Record<string, boolean> = {};

    for (const field of fields) {
      if (field.key === 'promo') {
        continue;
      }

      if (field.key === 'country' && !selectedCountry.code) {
        nextFieldErrors[field.key] = 'Выберите страну';
        continue;
      }

      if (field.key === 'currency' && !selectedCurrencyCode.trim()) {
        nextFieldErrors[field.key] = 'Выберите валюту';
        continue;
      }

      if (field.key === 'birthDate' && !birthDate) {
        nextFieldErrors[field.key] = 'Выберите дату рождения';
        continue;
      }

      if (field.key === 'phone' && !(formValues.phone ?? '').replace(/\D/g, '')) {
        nextFieldErrors[field.key] = 'Введите номер телефона';
        continue;
      }

      if (field.key === 'email' && !(formValues.email ?? '').trim()) {
        nextFieldErrors[field.key] = 'Введите email';
        continue;
      }

      if (field.key === 'password') {
        const trimmedPassword = (formValues.password ?? '').trim();

        if (!trimmedPassword) {
          nextFieldErrors[field.key] = 'Введите пароль';
          continue;
        }

        if (trimmedPassword.length < 6) {
          nextFieldErrors[field.key] = 'Пароль должен содержать минимум 6 символов';
        }
      }
    }

    if (isSocialRegistration && !selectedSocial) {
      nextFieldErrors.social = 'Выберите социальную сеть';
    }

    for (const item of agreementItems) {
      if (!checkedItems[item.id]) {
        nextAgreementErrors[item.id] = true;
      }
    }

    setFieldErrors(nextFieldErrors);
    setAgreementErrors(nextAgreementErrors);

    if (Object.keys(nextFieldErrors).length > 0 || Object.keys(nextAgreementErrors).length > 0) {
      setLocalErrorMessage('Заполните обязательные поля и подтвердите согласия');
      return false;
    }

    setLocalErrorMessage(null);
    return true;
  };

  const getFieldDisplayValue = (fieldKey: string, placeholder: string) => {
    if (fieldKey === 'country') {
      return {
        text: selectedCountry.name,
        leading: selectedCountry.flag,
      };
    }

    if (fieldKey === 'currency') {
      return {
        text: selectedCurrency?.label ?? placeholder,
      };
    }

    if (fieldKey === 'birthDate') {
      return {
        text: birthDate ? formatBirthDate(birthDate) : placeholder,
      };
    }

    return {
      text: formValues[fieldKey] || placeholder,
    };
  };

  const renderPicker = () => {
    if (!pickerTarget) {
      return null;
    }

    if (pickerTarget === 'country' || pickerTarget === 'phoneCode') {
      return (
        <AuthPickerSheet
          onClose={() => setPickerTarget(null)}
          onSelect={(option) => {
            const nextCountry = countries.find((country) => country.code === option.id);
            if (nextCountry) {
              applyCountry(nextCountry);
            }
          }}
          options={countryOptions}
          selectedId={selectedCountry.code}
          title={authTheme.strings.authPickerPhoneTitle}
          visible
        />
      );
    }

    if (pickerTarget === 'currency') {
      return (
        <AuthPickerSheet
          onClose={() => setPickerTarget(null)}
          onSelect={(option) => {
            setSelectedCurrencyCode(option.id);
            clearFieldError('currency');
            setLocalErrorMessage(null);
          }}
          options={currencyOptions}
          selectedId={selectedCurrencyCode}
          title={authTheme.strings.currency}
          visible
        />
      );
    }

    return null;
  };

  const visibleErrorMessage = localErrorMessage ?? errorMessage;

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
        <View style={styles.root}>
          <View
            style={[
              styles.navigationBar,
              {
                minHeight: authTheme.sizes.toolbar + insets.top,
                paddingTop: insets.top,
              },
            ]}
          >
            <Pressable onPress={onBack} style={({ pressed }) => [styles.navButton, pressed && styles.pressed]}>
              <MaterialCommunityIcons
                color={authTheme.colors.secondary}
                name="chevron-left"
                size={24}
              />
            </Pressable>

            <View style={styles.navigationCenter}>
              <Text style={styles.navigationTitle}>{authTheme.strings.registration}</Text>
              <Text style={styles.navigationSubtitle}>{registrationType.title}</Text>
            </View>

            <View style={styles.navSpacer} />
          </View>

          <View style={styles.navigationSeparator} />

          <ScrollView
            automaticallyAdjustContentInsets={false}
            contentInsetAdjustmentBehavior="never"
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.sectionTitle}>{authTheme.strings.personalData}</Text>
            {visibleErrorMessage ? (
              <Text style={styles.errorMessage}>{visibleErrorMessage}</Text>
            ) : null}

            {isSocialRegistration ? (
              <View style={styles.socialSection}>
                <View style={styles.socialList}>
                  {registrationSocialProviders.map((provider) => {
                    const selected = provider.id === selectedSocial;

                    return (
                      <Pressable
                        key={provider.id}
                        onPress={() => {
                          setSelectedSocial(provider.id);
                          clearFieldError('social');
                          setLocalErrorMessage(null);
                        }}
                        style={({ pressed }) => [
                          styles.socialOption,
                          selected && styles.socialOptionSelected,
                          fieldErrors.social && styles.socialOptionError,
                          pressed && styles.pressed,
                        ]}
                      >
                        <AuthBrandIcon name={provider.iconName} size={20} />
                        <Text style={styles.socialOptionTitle}>{provider.title}</Text>
                      </Pressable>
                    );
                  })}
                </View>
                {fieldErrors.social ? (
                  <View style={styles.socialErrorRow}>
                    <MaterialCommunityIcons
                      color={authTheme.colors.staticRed}
                      name="alert-circle-outline"
                      size={16}
                    />
                    <Text style={styles.socialErrorText}>
                      {authTheme.strings.chooseSocialNetwork}
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : null}

            <View style={styles.fieldsGroup}>
              {fields.map((field) => {
                const fieldValue = formValues[field.key] ?? '';
                const isSelect = field.kind === 'select';
                const isDate = field.kind === 'date';
                const isPhone = field.kind === 'phone';
                const isPassword = field.kind === 'password';
                const fieldError = fieldErrors[field.key];
                const displayValue = getFieldDisplayValue(field.key, field.placeholder);
                const displayIsPlaceholder =
                  (field.key === 'birthDate' && !birthDate) ||
                  (field.key === 'country' && !selectedCountry.name) ||
                  (field.key === 'currency' && !selectedCurrency);

                return (
                  <View key={field.key} style={styles.fieldBlock}>
                    <Text style={[styles.fieldLabel, fieldError && styles.errorText]}>
                      {field.label}
                    </Text>

                    {isPhone ? (
                      <View style={[styles.phoneField, fieldError && styles.fieldInputError]}>
                        <Pressable
                          onPress={() => setPickerTarget('phoneCode')}
                          style={({ pressed }) => [styles.countryCodeButton, pressed && styles.pressed]}
                        >
                          <Text style={styles.countryCodeText}>{selectedCountry.dialCode}</Text>
                          <MaterialCommunityIcons
                            color={authTheme.colors.secondary}
                            name="chevron-down"
                            size={18}
                          />
                        </Pressable>

                        <TextInput
                          keyboardType="phone-pad"
                          keyboardAppearance={keyboardAppearance}
                          onChangeText={(value) =>
                            updateFieldValue(field.key, formatPhoneNumber(value, selectedCountry.format))
                          }
                          placeholder={field.placeholder}
                          placeholderTextColor={authTheme.colors.secondary}
                          selectionColor={authTheme.colors.primary}
                          style={styles.phoneInput}
                          value={fieldValue}
                        />
                      </View>
                    ) : null}

                    {isSelect ? (
                      <Pressable
                        onPress={() => {
                          if (field.key === 'country') {
                            setPickerTarget('country');
                          } else if (field.key === 'currency') {
                            setPickerTarget('currency');
                          }
                        }}
                        style={({ pressed }) => [
                          styles.fieldInputWrap,
                          fieldError && styles.fieldInputError,
                          pressed && styles.pressed,
                        ]}
                      >
                        <View style={styles.fieldValueWrap}>
                          {displayValue.leading ? (
                            <Text style={styles.fieldLeading}>{displayValue.leading}</Text>
                          ) : null}

                          <Text
                            style={[
                              styles.fieldValueText,
                              displayIsPlaceholder && styles.fieldValuePlaceholder,
                            ]}
                          >
                            {displayValue.text}
                          </Text>
                        </View>

                        <Pressable
                          onPress={() => {
                            if (field.key === 'country') {
                              setPickerTarget('country');
                            } else if (field.key === 'currency') {
                              setPickerTarget('currency');
                            }
                          }}
                          style={({ pressed }) => [styles.trailingButton, pressed && styles.pressed]}
                        >
                          <MaterialCommunityIcons
                            color={authTheme.colors.secondary}
                            name="chevron-down"
                            size={22}
                          />
                        </Pressable>
                      </Pressable>
                    ) : null}

                    {isDate ? (
                      <Pressable
                        onPress={() => {
                          setDatePickerVisible(true);
                          clearFieldError(field.key);
                          setLocalErrorMessage(null);
                        }}
                        style={({ pressed }) => [
                          styles.fieldInputWrap,
                          fieldError && styles.fieldInputError,
                          pressed && styles.pressed,
                        ]}
                      >
                        <View style={styles.fieldValueWrap}>
                          <Text
                            style={[
                              styles.fieldValueText,
                              !birthDate && styles.fieldValuePlaceholder,
                            ]}
                          >
                            {birthDate ? formatBirthDate(birthDate) : field.placeholder}
                          </Text>
                        </View>

                        <Pressable
                          onPress={() => {
                            setDatePickerVisible(true);
                            clearFieldError(field.key);
                            setLocalErrorMessage(null);
                          }}
                          style={({ pressed }) => [styles.trailingButton, pressed && styles.pressed]}
                        >
                          <MaterialCommunityIcons
                            color={authTheme.colors.secondary}
                            name="calendar-month-outline"
                            size={22}
                          />
                        </Pressable>
                      </Pressable>
                    ) : null}

                    {!isPhone && !isSelect && !isDate ? (
                      <View style={[styles.fieldInputWrap, fieldError && styles.fieldInputError]}>
                        <TextInput
                          autoCapitalize="none"
                          keyboardAppearance={keyboardAppearance}
                          keyboardType={field.keyboardType}
                          onChangeText={(value) => updateFieldValue(field.key, value)}
                          placeholder={field.placeholder}
                          placeholderTextColor={authTheme.colors.secondary}
                          secureTextEntry={isPassword && secureTextEntry}
                          selectionColor={authTheme.colors.primary}
                          style={styles.fieldInput}
                          value={fieldValue}
                        />

                        {isPassword ? (
                          <Pressable
                            hitSlop={8}
                            onPress={() => setSecureTextEntry((currentValue) => !currentValue)}
                            style={({ pressed }) => [styles.trailingButton, pressed && styles.pressed]}
                          >
                            <MaterialCommunityIcons
                              color={authTheme.colors.secondary}
                              name={secureTextEntry ? 'eye-outline' : 'eye-off-outline'}
                              size={22}
                            />
                          </Pressable>
                        ) : null}
                      </View>
                    ) : null}

                    {fieldError ? <Text style={styles.fieldErrorText}>{fieldError}</Text> : null}
                  </View>
                );
              })}
            </View>

            <View style={styles.checkboxGroup}>
              {agreementItems.map((item) => {
                const checked = checkedItems[item.id];
                const agreementHasError = Boolean(agreementErrors[item.id]);

                return (
                  <Pressable
                    key={item.id}
                    onPress={() => toggleCheckbox(item.id)}
                    style={({ pressed }) => [
                      styles.checkboxRow,
                      agreementHasError && styles.checkboxRowError,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        agreementHasError && styles.checkboxError,
                        checked && styles.checkboxChecked,
                      ]}
                    >
                      {checked ? (
                        <MaterialCommunityIcons
                          color={authTheme.colors.primaryForeground}
                          name="check"
                          size={14}
                        />
                      ) : null}
                    </View>

                    <Text style={[styles.checkboxText, agreementHasError && styles.errorText]}>
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          <View style={[styles.submitBar, { paddingBottom: authTheme.spacing.md + insets.bottom }]}>
            <Pressable
              disabled={loading}
              onPress={() => {
                if (!validateForm()) {
                  return;
                }

                onSubmit({
                  birthDate: birthDate ? formatBirthDate(birthDate) : null,
                  country: selectedCountry,
                  currencyCode: selectedCurrencyCode,
                  email: (formValues.email ?? '').trim(),
                  password: formValues.password ?? '',
                  phoneNumber: formValues.phone ?? '',
                  promoCode: (formValues.promo ?? '').trim(),
                  registrationType: registrationType.id,
                  socialProviderId: isSocialRegistration ? selectedSocial : null,
                });
              }}
              style={({ pressed }) => [
                styles.submitButton,
                loading && styles.submitButtonDisabled,
                pressed && styles.pressed,
              ]}
            >
              {loading ? (
                <ActivityIndicator color={authTheme.colors.commerceForeground} size="small" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {authTheme.strings.offerToAuthRegistrationButton}
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </SafeAreaView>

      {renderPicker()}

      <AuthDateSheet
        onClose={() => setDatePickerVisible(false)}
        onConfirm={(value) => {
          setBirthDate(value);
          clearFieldError('birthDate');
          setLocalErrorMessage(null);
          setDatePickerVisible(false);
        }}
        value={birthDate}
        visible={datePickerVisible}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: authTheme.colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: authTheme.colors.background,
  },
  root: {
    backgroundColor: authTheme.colors.background,
    flex: 1,
  },
  navigationBar: {
    alignItems: 'center',
    backgroundColor: authTheme.colors.backgroundContent,
    flexDirection: 'row',
    minHeight: authTheme.sizes.toolbar,
    paddingHorizontal: authTheme.spacing.sm,
  },
  navButton: {
    alignItems: 'center',
    height: authTheme.sizes.toolbar,
    justifyContent: 'center',
    width: authTheme.sizes.toolbar,
  },
  navigationCenter: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: authTheme.spacing.sm,
  },
  navigationTitle: {
    color: authTheme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
  },
  navigationSubtitle: {
    color: authTheme.colors.secondary,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  navSpacer: {
    width: authTheme.sizes.toolbar,
  },
  navigationSeparator: {
    backgroundColor: authTheme.colors.separator30,
    height: StyleSheet.hairlineWidth,
  },
  scrollContent: {
    paddingBottom: 128,
    paddingHorizontal: authTheme.spacing.md,
    paddingTop: authTheme.spacing.md,
  },
  sectionTitle: {
    color: authTheme.colors.secondary,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: authTheme.spacing.md,
  },
  errorMessage: {
    color: authTheme.colors.staticRed,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: authTheme.spacing.md,
  },
  socialSection: {
    marginBottom: authTheme.spacing.md,
  },
  socialList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: authTheme.spacing.sm,
    justifyContent: 'space-between',
  },
  socialOption: {
    alignItems: 'center',
    backgroundColor: authTheme.colors.backgroundContent,
    borderColor: 'transparent',
    borderRadius: authTheme.radii.sm,
    borderWidth: 2,
    flexBasis: '48%',
    minHeight: 56,
    justifyContent: 'center',
    paddingBottom: authTheme.spacing.sm,
    paddingHorizontal: authTheme.spacing.xs,
    paddingTop: authTheme.spacing.sm,
  },
  socialOptionSelected: {
    borderColor: authTheme.colors.primary,
  },
  socialOptionTitle: {
    color: authTheme.colors.textPrimary,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    marginTop: authTheme.spacing.xs,
    textAlign: 'center',
  },
  socialErrorRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: authTheme.spacing.sm,
    marginTop: authTheme.spacing.xs,
  },
  socialErrorText: {
    color: authTheme.colors.staticRed,
    fontSize: 12,
    lineHeight: 16,
  },
  fieldsGroup: {
    gap: authTheme.spacing.md,
  },
  fieldBlock: {
    gap: authTheme.spacing.xs,
  },
  fieldLabel: {
    color: authTheme.colors.secondary,
    fontSize: 12,
    lineHeight: 16,
  },
  fieldErrorText: {
    color: authTheme.colors.staticRed,
    fontSize: 12,
    lineHeight: 16,
  },
  phoneField: {
    alignItems: 'center',
    backgroundColor: authTheme.colors.inputBackground,
    borderRadius: authTheme.radii.md,
    flexDirection: 'row',
    minHeight: authTheme.sizes.input,
    overflow: 'hidden',
  },
  countryCodeButton: {
    alignItems: 'center',
    borderRightColor: authTheme.colors.separator30,
    borderRightWidth: 1,
    flexDirection: 'row',
    gap: authTheme.spacing.xs,
    height: '100%',
    justifyContent: 'center',
    minWidth: 84,
    paddingHorizontal: authTheme.spacing.md,
  },
  countryCodeText: {
    color: authTheme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  phoneInput: {
    color: authTheme.colors.textPrimary,
    flex: 1,
    fontSize: 16,
    minHeight: authTheme.sizes.input,
    paddingHorizontal: authTheme.spacing.md,
  },
  fieldInputWrap: {
    alignItems: 'center',
    backgroundColor: authTheme.colors.inputBackground,
    borderRadius: authTheme.radii.md,
    flexDirection: 'row',
    minHeight: authTheme.sizes.input,
    paddingHorizontal: authTheme.spacing.lg,
  },
  fieldInputError: {
    borderColor: authTheme.colors.staticRed,
    borderWidth: 1.5,
  },
  fieldValueWrap: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
  },
  fieldLeading: {
    fontSize: 16,
    marginRight: authTheme.spacing.sm,
  },
  fieldValueText: {
    color: authTheme.colors.textPrimary,
    flex: 1,
    fontSize: 16,
    minHeight: authTheme.sizes.input,
    lineHeight: authTheme.sizes.input,
  },
  fieldValuePlaceholder: {
    color: authTheme.colors.secondary,
  },
  fieldInput: {
    color: authTheme.colors.textPrimary,
    flex: 1,
    fontSize: 16,
    minHeight: authTheme.sizes.input,
  },
  trailingButton: {
    paddingLeft: authTheme.spacing.sm,
  },
  checkboxGroup: {
    gap: authTheme.spacing.sm,
    marginTop: authTheme.spacing.lg,
  },
  checkboxRow: {
    alignItems: 'flex-start',
    backgroundColor: authTheme.colors.backgroundContent,
    borderRadius: authTheme.radii.md,
    flexDirection: 'row',
    gap: authTheme.spacing.sm,
    padding: authTheme.spacing.md,
  },
  checkboxRowError: {
    borderColor: authTheme.colors.staticRed,
    borderWidth: 1,
  },
  checkbox: {
    alignItems: 'center',
    borderColor: authTheme.colors.separator,
    borderRadius: authTheme.radii.xs,
    borderWidth: 2,
    height: 20,
    justifyContent: 'center',
    marginTop: 2,
    width: 20,
  },
  checkboxError: {
    borderColor: authTheme.colors.staticRed,
  },
  checkboxChecked: {
    backgroundColor: authTheme.colors.primary,
    borderColor: authTheme.colors.primary,
  },
  checkboxText: {
    color: authTheme.colors.textPrimary,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  socialOptionError: {
    borderColor: authTheme.colors.staticRed,
  },
  errorText: {
    color: authTheme.colors.staticRed,
  },
  submitBar: {
    bottom: 0,
    left: 0,
    paddingHorizontal: authTheme.spacing.md,
    paddingTop: authTheme.spacing.sm,
    position: 'absolute',
    right: 0,
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: authTheme.colors.commerce,
    borderRadius: authTheme.radii.md,
    justifyContent: 'center',
    minHeight: authTheme.sizes.button,
    width: '100%',
  },
  submitButtonText: {
    color: authTheme.colors.commerceForeground,
    fontSize: 16,
    fontWeight: '700',
  },
  submitButtonDisabled: {
    opacity: 0.9,
  },
  pressed: {
    opacity: 0.82,
  },
});
