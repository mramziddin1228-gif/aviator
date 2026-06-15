import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { env } from './src/config/env';
import { countries, formatPhoneNumber, type Country } from './src/constants/countries';
import {
  getGameState,
  loadProfile,
  registerWithPhone,
  signInWithEmail,
  signInWithPhone,
  type GameStateSnapshot,
  type Profile,
} from './src/lib/auth';
import { supabase } from './src/lib/supabase';

type AuthMode = 'login' | 'register';
type LoginMethod = 'phone' | 'email';
type ConnectionState = 'checking' | 'connected' | 'failed';

const mapAuthError = (message: string, loginMethod: LoginMethod) => {
  if (message.includes('Invalid login credentials')) {
    return loginMethod === 'phone'
      ? 'Invalid phone number or password'
      : 'Invalid email or password';
  }

  if (message.includes('User already registered')) {
    return 'This account already exists';
  }

  return message;
};

export default function App() {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('phone');
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>('checking');
  const [gameState, setGameState] = useState<GameStateSnapshot | null>(null);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      try {
        const [{ data: sessionData }, currentGameState] = await Promise.all([
          supabase.auth.getSession(),
          getGameState(),
        ]);

        if (!active) {
          return;
        }

        if (sessionData.session?.user) {
          setProfileLoading(true);
          const nextProfile = await loadProfile(sessionData.session.user.id).catch(() => null);
          if (active) {
            setProfile(nextProfile);
          }
        }

        setGameState(currentGameState);
        setConnectionState('connected');
      } catch {
        if (active) {
          setConnectionState('failed');
        }
      } finally {
        if (active) {
          setAuthLoading(false);
          setProfileLoading(false);
        }
      }
    };

    bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!active) {
        return;
      }

      setError('');

      if (!session?.user) {
        setProfile(null);
        return;
      }

      setProfileLoading(true);
      const nextProfile = await loadProfile(session.user.id).catch(() => null);

      if (active) {
        setProfile(nextProfile);
        setProfileLoading(false);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const handlePhoneChange = (value: string) => {
    setPhoneNumber(formatPhoneNumber(value, selectedCountry.format));
  };

  const refreshConnection = async () => {
    setConnectionState('checking');
    setError('');

    try {
      const currentGameState = await getGameState();
      setGameState(currentGameState);
      setConnectionState('connected');
    } catch {
      setConnectionState('failed');
      setError('Backend check failed. Verify that the web app is reachable on the public domain.');
    }
  };

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      if (!password) {
        throw new Error('Password is required');
      }

      if (loginMethod === 'phone') {
        if (!phoneNumber) {
          throw new Error('Phone number is required');
        }

        await signInWithPhone(selectedCountry, phoneNumber, password);
      } else {
        if (!email.trim()) {
          throw new Error('Email is required');
        }

        await signInWithEmail(email.trim(), password);
      }
    } catch (currentError) {
      const message =
        currentError instanceof Error ? currentError.message : 'Unable to login right now';
      setError(mapAuthError(message, loginMethod));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setError('');
    setLoading(true);

    try {
      if (!phoneNumber) {
        throw new Error('Phone number is required');
      }

      if (password.trim().length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      await registerWithPhone({
        country: selectedCountry,
        phoneNumber,
        email,
        password,
      });
    } catch (currentError) {
      const message =
        currentError instanceof Error ? currentError.message : 'Unable to create the account';
      setError(mapAuthError(message, 'phone'));
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    setError('');

    try {
      await supabase.auth.signOut();
      setProfile(null);
    } catch (currentError) {
      const message =
        currentError instanceof Error ? currentError.message : 'Unable to sign out right now';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const openUrl = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Unable to open link', url);
    }
  };

  const renderConnectionBadge = () => {
    if (connectionState === 'checking') {
      return <Text style={[styles.badge, styles.badgeNeutral]}>Checking backend</Text>;
    }

    if (connectionState === 'connected') {
      return <Text style={[styles.badge, styles.badgeSuccess]}>Connected to web backend</Text>;
    }

    return <Text style={[styles.badge, styles.badgeError]}>Backend unreachable</Text>;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.hero}>
            <Text style={styles.overline}>aviator mobile</Text>
            <Text style={styles.title}>Expo app linked to the existing Next.js backend</Text>
            <Text style={styles.subtitle}>
              Domain: {env.webUrl.replace(/^https?:\/\//, '')}
            </Text>
            <View style={styles.badgeRow}>{renderConnectionBadge()}</View>
            {gameState ? (
              <Text style={styles.gameState}>
                Round #{gameState.roundId} · {gameState.phase} · {gameState.multiplier.toFixed(2)}x
              </Text>
            ) : null}
          </View>

          <View style={styles.card}>
            <View style={styles.segment}>
              <Pressable
                onPress={() => {
                  setAuthMode('login');
                  setError('');
                }}
                style={[styles.segmentButton, authMode === 'login' && styles.segmentButtonActive]}
              >
                <Text
                  style={[
                    styles.segmentButtonText,
                    authMode === 'login' && styles.segmentButtonTextActive,
                  ]}
                >
                  Login
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setAuthMode('register');
                  setError('');
                }}
                style={[
                  styles.segmentButton,
                  authMode === 'register' && styles.segmentButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.segmentButtonText,
                    authMode === 'register' && styles.segmentButtonTextActive,
                  ]}
                >
                  Register
                </Text>
              </Pressable>
            </View>

            {authLoading ? (
              <View style={styles.centerState}>
                <ActivityIndicator color="#0f172a" />
                <Text style={styles.centerStateText}>Loading session</Text>
              </View>
            ) : profile ? (
              <View style={styles.dashboard}>
                <Text style={styles.dashboardTitle}>Session is active</Text>
                {profileLoading ? (
                  <ActivityIndicator color="#0f172a" />
                ) : (
                  <>
                    <Text style={styles.dashboardText}>User ID: {profile.user_id ?? 'n/a'}</Text>
                    <Text style={styles.dashboardText}>Balance: {profile.balance ?? 0}</Text>
                    <Text style={styles.dashboardText}>Country: {profile.country ?? 'n/a'}</Text>
                    <Text style={styles.dashboardText}>Currency: {profile.currency ?? 'n/a'}</Text>
                    <Text style={styles.dashboardText}>Phone: {profile.phone ?? 'n/a'}</Text>
                    <Text style={styles.dashboardText}>Email: {profile.email ?? 'n/a'}</Text>
                  </>
                )}

                <Pressable style={styles.primaryButton} onPress={() => openUrl(env.webUrl)}>
                  <Text style={styles.primaryButtonText}>Open web version</Text>
                </Pressable>

                <Pressable
                  style={styles.secondaryButton}
                  onPress={() => openUrl(`https://t.me/${env.supportTelegram}`)}
                >
                  <Text style={styles.secondaryButtonText}>Open support Telegram</Text>
                </Pressable>

                <Pressable
                  style={styles.ghostButton}
                  onPress={handleSignOut}
                  disabled={loading}
                >
                  <Text style={styles.ghostButtonText}>{loading ? 'Signing out' : 'Sign out'}</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.form}>
                {authMode === 'login' ? (
                  <View style={styles.segment}>
                    <Pressable
                      onPress={() => {
                        setLoginMethod('phone');
                        setError('');
                      }}
                      style={[
                        styles.segmentButton,
                        loginMethod === 'phone' && styles.segmentButtonActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.segmentButtonText,
                          loginMethod === 'phone' && styles.segmentButtonTextActive,
                        ]}
                      >
                        Phone
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        setLoginMethod('email');
                        setError('');
                      }}
                      style={[
                        styles.segmentButton,
                        loginMethod === 'email' && styles.segmentButtonActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.segmentButtonText,
                          loginMethod === 'email' && styles.segmentButtonTextActive,
                        ]}
                      >
                        Email
                      </Text>
                    </Pressable>
                  </View>
                ) : null}

                {authMode === 'login' && loginMethod === 'email' ? (
                  <TextInput
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholder="Email"
                    placeholderTextColor="#64748b"
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                  />
                ) : (
                  <>
                    <Text style={styles.label}>Country and phone</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.countryList}
                    >
                      {countries.map((country) => {
                        const selected = country.code === selectedCountry.code;

                        return (
                          <Pressable
                            key={country.code}
                            onPress={() => {
                              setSelectedCountry(country);
                              setPhoneNumber('');
                            }}
                            style={[styles.countryChip, selected && styles.countryChipActive]}
                          >
                            <Text
                              style={[
                                styles.countryChipText,
                                selected && styles.countryChipTextActive,
                              ]}
                            >
                              {country.flag} {country.dialCode}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </ScrollView>

                    <View style={styles.countryMeta}>
                      <Text style={styles.countryMetaText}>{selectedCountry.name}</Text>
                      <Text style={styles.countryMetaText}>
                        {selectedCountry.currency} · {selectedCountry.currencyName}
                      </Text>
                    </View>

                    <TextInput
                      keyboardType="phone-pad"
                      placeholder={selectedCountry.format}
                      placeholderTextColor="#64748b"
                      style={styles.input}
                      value={phoneNumber}
                      onChangeText={handlePhoneChange}
                    />
                  </>
                )}

                {authMode === 'register' ? (
                  <TextInput
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholder="Email (optional)"
                    placeholderTextColor="#64748b"
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                  />
                ) : null}

                <TextInput
                  autoCapitalize="none"
                  placeholder="Password"
                  placeholderTextColor="#64748b"
                  secureTextEntry
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                />

                {error ? <Text style={styles.error}>{error}</Text> : null}

                <Pressable
                  style={styles.primaryButton}
                  onPress={authMode === 'login' ? handleLogin : handleRegister}
                  disabled={loading}
                >
                  <Text style={styles.primaryButtonText}>
                    {loading
                      ? authMode === 'login'
                        ? 'Logging in'
                        : 'Creating account'
                      : authMode === 'login'
                        ? 'Login'
                        : 'Create account'}
                  </Text>
                </Pressable>

                <Pressable style={styles.secondaryButton} onPress={refreshConnection}>
                  <Text style={styles.secondaryButtonText}>Recheck backend connection</Text>
                </Pressable>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#020617',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 20,
  },
  hero: {
    padding: 24,
    borderRadius: 24,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    gap: 12,
  },
  overline: {
    color: '#38bdf8',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    color: '#f8fafc',
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: 15,
    lineHeight: 22,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    overflow: 'hidden',
    fontSize: 12,
    fontWeight: '700',
  },
  badgeNeutral: {
    backgroundColor: '#1e293b',
    color: '#e2e8f0',
  },
  badgeSuccess: {
    backgroundColor: '#052e16',
    color: '#86efac',
  },
  badgeError: {
    backgroundColor: '#450a0a',
    color: '#fca5a5',
  },
  gameState: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#f8fafc',
    borderRadius: 24,
    padding: 20,
    gap: 16,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: 16,
    padding: 4,
    gap: 6,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  segmentButtonActive: {
    backgroundColor: '#0f172a',
  },
  segmentButtonText: {
    color: '#334155',
    fontSize: 15,
    fontWeight: '700',
  },
  segmentButtonTextActive: {
    color: '#f8fafc',
  },
  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  centerStateText: {
    color: '#475569',
    fontSize: 14,
  },
  form: {
    gap: 14,
  },
  label: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#0f172a',
    backgroundColor: '#ffffff',
    fontSize: 16,
  },
  countryList: {
    gap: 10,
    paddingVertical: 2,
  },
  countryChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#e2e8f0',
  },
  countryChipActive: {
    backgroundColor: '#0f172a',
  },
  countryChipText: {
    color: '#334155',
    fontWeight: '700',
  },
  countryChipTextActive: {
    color: '#f8fafc',
  },
  countryMeta: {
    gap: 4,
  },
  countryMetaText: {
    color: '#475569',
    fontSize: 13,
  },
  error: {
    color: '#b91c1c',
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryButton: {
    backgroundColor: '#e2e8f0',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '700',
  },
  ghostButton: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingVertical: 14,
    alignItems: 'center',
  },
  ghostButtonText: {
    color: '#334155',
    fontSize: 15,
    fontWeight: '700',
  },
  dashboard: {
    gap: 12,
  },
  dashboardTitle: {
    color: '#0f172a',
    fontSize: 22,
    fontWeight: '800',
  },
  dashboardText: {
    color: '#334155',
    fontSize: 15,
    lineHeight: 21,
  },
});
