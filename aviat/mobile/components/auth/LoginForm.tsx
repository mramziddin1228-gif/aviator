import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { authTheme, loginSocialProviders, type LoginMethod } from '../../theme/authTheme';
import { AuthPickerSheet, type AuthPickerOption } from './AuthPickerSheet';
import { countries, formatPhoneNumber, type Country } from '../../src/constants/countries';
import { AuthBrandIcon } from './AuthBrandIcon';

export type LoginFormSubmission = {
  country: Country;
  email: string;
  loginMethod: LoginMethod;
  password: string;
  phone: string;
  socialProviderId: string | null;
};

type LoginFormProps = {
  errorMessage?: string | null;
  loading?: boolean;
  onLogin: (payload: LoginFormSubmission) => void;
  onOpenRegister: () => void;
};

export function LoginForm({
  errorMessage,
  loading = false,
  onLogin,
  onOpenRegister,
}: LoginFormProps) {
  const colorScheme = useColorScheme();
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('phone');
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    countries.find((country) => country.code === 'RU') ?? countries[0],
  );
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [countryPickerVisible, setCountryPickerVisible] = useState(false);
  const [selectedSocialId, setSelectedSocialId] = useState<string | null>(null);
  const keyboardAppearance = colorScheme ?? 'default';

  const toggleLoginMethod = () => {
    setLoginMethod((currentMode) => (currentMode === 'phone' ? 'email' : 'phone'));
  };

  useEffect(() => {
    setPhone((currentPhone) => formatPhoneNumber(currentPhone, selectedCountry.format));
  }, [selectedCountry]);

  const countryOptions: AuthPickerOption[] = countries.map((country) => ({
    id: country.code,
    label: country.name,
    subtitle: country.dialCode,
    leading: country.flag,
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{authTheme.strings.authorization}</Text>
      {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}

      <View style={styles.loginWayRow}>
        <View style={styles.loginFieldWrap}>
          {loginMethod === 'phone' ? (
            <View style={styles.phoneField}>
              <Pressable
                onPress={() => setCountryPickerVisible(true)}
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
                keyboardAppearance={keyboardAppearance}
                keyboardType="phone-pad"
                onChangeText={(value) => setPhone(formatPhoneNumber(value, selectedCountry.format))}
                placeholder={authTheme.strings.phone}
                placeholderTextColor={authTheme.colors.secondary}
                selectionColor={authTheme.colors.primary}
                style={styles.phoneInput}
                value={phone}
              />
            </View>
          ) : (
            <View style={styles.textField}>
              <TextInput
                autoCapitalize="none"
                keyboardAppearance={keyboardAppearance}
                keyboardType="email-address"
                onChangeText={setEmail}
                placeholder={authTheme.strings.enterEmail}
                placeholderTextColor={authTheme.colors.secondary}
                selectionColor={authTheme.colors.primary}
                style={styles.input}
                value={email}
              />
            </View>
          )}
        </View>

        <Pressable onPress={toggleLoginMethod} style={({ pressed }) => [styles.toggleButton, pressed && styles.pressed]}>
          <AuthBrandIcon
            color={authTheme.colors.primaryForeground}
            name={loginMethod === 'phone' ? 'reg-email' : 'reg-phone'}
            size={22}
          />
        </Pressable>
      </View>

      <View style={[styles.textField, styles.passwordField]}>
        <TextInput
          autoCapitalize="none"
          keyboardAppearance={keyboardAppearance}
          onChangeText={setPassword}
          placeholder={authTheme.strings.password}
          placeholderTextColor={authTheme.colors.secondary}
          secureTextEntry={secureTextEntry}
          selectionColor={authTheme.colors.primary}
          style={styles.input}
          value={password}
        />

        <Pressable
          hitSlop={8}
          onPress={() => setSecureTextEntry((currentValue) => !currentValue)}
          style={({ pressed }) => [styles.eyeButton, pressed && styles.pressed]}
        >
          <MaterialCommunityIcons
            color={authTheme.colors.secondary}
            name={secureTextEntry ? 'eye-outline' : 'eye-off-outline'}
            size={22}
          />
        </Pressable>
      </View>

      <Pressable
        disabled={loading}
        onPress={() =>
          onLogin({
            country: selectedCountry,
            email: email.trim(),
            loginMethod,
            password,
            phone,
            socialProviderId: selectedSocialId,
          })
        }
        style={({ pressed }) => [
          styles.primaryButton,
          loading && styles.primaryButtonDisabled,
          pressed && styles.pressed,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={authTheme.colors.primaryForeground} size="small" />
        ) : (
          <Text style={styles.primaryButtonText}>{authTheme.strings.login}</Text>
        )}
      </Pressable>

      <Pressable style={({ pressed }) => [styles.tertiaryButton, pressed && styles.pressed]}>
        <Text style={styles.tertiaryButtonText}>{authTheme.strings.forgotPassword}</Text>
      </Pressable>

      <View style={styles.socialRow}>
        {loginSocialProviders.map((provider) => (
          <Pressable
            key={provider.id}
            onPress={() =>
              setSelectedSocialId((currentValue) =>
                currentValue === provider.id ? null : provider.id,
              )
            }
            style={({ pressed }) => [
              styles.socialButton,
              selectedSocialId === provider.id && styles.socialButtonSelected,
              pressed && styles.pressed,
            ]}
          >
            <AuthBrandIcon name={provider.iconName} size={authTheme.sizes.social} />
          </Pressable>
        ))}
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.footerText}>{authTheme.strings.accountNotExist}</Text>
        <Pressable onPress={onOpenRegister} style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]}>
          <Text style={styles.linkButtonText}>{authTheme.strings.offerToRegistration}</Text>
        </Pressable>
      </View>

      <AuthPickerSheet
        onClose={() => setCountryPickerVisible(false)}
        onSelect={(option) => {
          const nextCountry = countries.find((country) => country.code === option.id);
          if (nextCountry) {
            setSelectedCountry(nextCountry);
          }
        }}
        options={countryOptions}
        selectedId={selectedCountry.code}
        title={authTheme.strings.authPickerPhoneTitle}
        visible={countryPickerVisible}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  title: {
    color: authTheme.colors.textPrimary,
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 38,
    minHeight: authTheme.sizes.titleLogin,
  },
  errorMessage: {
    color: authTheme.colors.staticRed,
    fontSize: 13,
    lineHeight: 18,
    marginTop: authTheme.spacing.sm,
  },
  loginWayRow: {
    alignItems: 'stretch',
    flexDirection: 'row',
    marginTop: authTheme.spacing.md,
  },
  loginFieldWrap: {
    flex: 1,
    marginRight: authTheme.spacing.lg,
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
  textField: {
    alignItems: 'center',
    backgroundColor: authTheme.colors.inputBackground,
    borderRadius: authTheme.radii.md,
    flexDirection: 'row',
    minHeight: authTheme.sizes.input,
    paddingHorizontal: authTheme.spacing.lg,
  },
  passwordField: {
    marginTop: authTheme.spacing.md,
  },
  input: {
    color: authTheme.colors.textPrimary,
    flex: 1,
    fontSize: 16,
    minHeight: authTheme.sizes.input,
  },
  eyeButton: {
    paddingLeft: authTheme.spacing.sm,
  },
  toggleButton: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: authTheme.colors.primary,
    borderRadius: authTheme.radii.md,
    height: authTheme.sizes.input,
    justifyContent: 'center',
    width: authTheme.sizes.input,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: authTheme.colors.primary,
    borderRadius: authTheme.radii.md,
    justifyContent: 'center',
    marginTop: authTheme.spacing.lg,
    minHeight: authTheme.sizes.button,
    width: '100%',
  },
  primaryButtonText: {
    color: authTheme.colors.primaryForeground,
    fontSize: 16,
    fontWeight: '700',
  },
  primaryButtonDisabled: {
    opacity: 0.88,
  },
  tertiaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: authTheme.spacing.lg,
    minHeight: authTheme.sizes.button,
    width: '100%',
  },
  tertiaryButtonText: {
    color: authTheme.colors.secondaryButtonForeground,
    fontSize: 16,
    fontWeight: '600',
  },
  socialRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: authTheme.spacing.md,
    justifyContent: 'center',
    marginTop: authTheme.spacing.xl,
  },
  socialButton: {
    alignItems: 'center',
    borderColor: 'transparent',
    borderRadius: authTheme.radii.full,
    borderWidth: 2,
    height: authTheme.sizes.social + authTheme.spacing.xs,
    justifyContent: 'center',
    width: authTheme.sizes.social + authTheme.spacing.xs,
  },
  socialButtonSelected: {
    borderColor: authTheme.colors.primary,
    borderWidth: 1.5,
    shadowColor: authTheme.colors.primary,
    shadowOpacity: 0.22,
    shadowRadius: 10,
    transform: [{ scale: 1.04 }],
  },
  footerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: authTheme.spacing.lg,
    marginTop: authTheme.spacing.xl,
    rowGap: authTheme.spacing.xs,
  },
  footerText: {
    color: authTheme.colors.secondary,
    fontSize: 14,
    lineHeight: 20,
    maxWidth: authTheme.sizes.footerMaxWidth,
    minHeight: authTheme.sizes.social,
    paddingTop: authTheme.spacing.sm,
    textAlign: 'right',
  },
  linkButton: {
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: authTheme.sizes.footerMaxWidth,
    minHeight: authTheme.sizes.social,
    paddingHorizontal: authTheme.spacing.sm,
  },
  linkButtonText: {
    color: authTheme.colors.secondaryButtonForeground,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.82,
  },
});
