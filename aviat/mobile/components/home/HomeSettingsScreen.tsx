import { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { selectionHaptic } from '../../src/lib/haptics';
import { homeTheme, type HomeBrandGlyphName } from '../../theme/homeTheme';
import { HomeBrandIcon } from './HomeBrandIcon';
import { HomeSideModal } from './HomeSideModal';
import { usePullToRefresh } from '../shared/usePullToRefresh';

type ThemeMode = 'dark' | 'light' | 'system';
type SettingsRoute = 'bets' | 'notifications' | 'proxy' | 'root' | 'theme';
type SoundMode = 'muted' | 'system' | 'vibrate';
type BetCoefMode = 'accept-any' | 'accept-increase' | 'confirm';

type HomeSettingsScreenProps = {
  onClose: () => void;
  onOpenItem: (title: string) => void;
  visible: boolean;
};

const QUICK_BET_AMOUNT_OPTIONS = [300, 500, 1000, 2000, 3000, 5000] as const;
const SOUND_MODE_OPTIONS = ['system', 'vibrate', 'muted'] as const;
const THEME_ON_TIME_OPTIONS = ['21:00', '22:00', '23:00'] as const;
const THEME_OFF_TIME_OPTIONS = ['07:00', '08:00', '09:00'] as const;

const THEME_LABELS: Record<ThemeMode, string> = {
  dark: 'Тёмная',
  light: 'Светлая',
  system: 'Системная',
};

const SOUND_LABELS: Record<SoundMode, string> = {
  muted: 'Без звука',
  system: 'Системные',
  vibrate: 'Вибрация',
};

const BET_COEF_LABELS: Record<BetCoefMode, string> = {
  'accept-any': 'Любые',
  'accept-increase': 'Только повышение',
  confirm: 'Подтверждать',
};

const THEME_OPTIONS: Array<{
  icon: HomeBrandGlyphName;
  id: ThemeMode;
  label: string;
}> = [
  { icon: 'light-theme', id: 'light', label: 'Светлая' },
  { icon: 'dark-theme', id: 'dark', label: 'Тёмная' },
  { icon: 'night-theme', id: 'system', label: 'Системная' },
];

function cycleValue<T>(current: T, values: readonly T[]) {
  const currentIndex = values.indexOf(current);
  if (currentIndex === -1) {
    return values[0];
  }
  return values[(currentIndex + 1) % values.length];
}

function formatRubAmount(amount: number) {
  return `${new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(amount)} ₽`;
}

export function HomeSettingsScreen({
  onClose,
  onOpenItem,
  visible,
}: HomeSettingsScreenProps) {
  const insets = useSafeAreaInsets();
  const { refreshControl } = usePullToRefresh();
  const [activeRoute, setActiveRoute] = useState<SettingsRoute>('root');
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [soundMode, setSoundMode] = useState<SoundMode>('system');
  const [notificationSettings, setNotificationSettings] = useState({
    favoriteEvents: true,
    indicator: false,
    matchEvents: true,
  });
  const [betSettings, setBetSettings] = useState({
    autoClearCouponEnd: true,
    autoMax: false,
    clearCoupon: true,
    confirmLineToLive: true,
    quickBet: true,
    resetCoefOnScoreChange: true,
  });
  const [quickBetAmounts, setQuickBetAmounts] = useState<number[]>([500, 1000, 3000]);
  const [betCoefMode, setBetCoefMode] = useState<BetCoefMode>('confirm');
  const [themeScheduleEnabled, setThemeScheduleEnabled] = useState(false);
  const [themeTurnOnTime, setThemeTurnOnTime] = useState<(typeof THEME_ON_TIME_OPTIONS)[number]>(
    '22:00',
  );
  const [themeTurnOffTime, setThemeTurnOffTime] = useState<
    (typeof THEME_OFF_TIME_OPTIONS)[number]
  >('08:00');
  const [proxyEnabled, setProxyEnabled] = useState(false);
  const [proxyValues, setProxyValues] = useState({
    password: '',
    port: '',
    server: '',
    username: '',
  });

  useEffect(() => {
    if (!visible) {
      setActiveRoute('root');
    }
  }, [visible]);

  const currentTitle =
    activeRoute === 'notifications'
      ? 'Push-уведомления'
      : activeRoute === 'bets'
        ? 'Настройки ставок'
        : activeRoute === 'theme'
          ? 'Тема'
          : activeRoute === 'proxy'
            ? 'Прокси'
            : 'Настройки';

  const handleClose = () => {
    void selectionHaptic();
    onClose();
  };

  const handleBack = () => {
    void selectionHaptic();
    if (activeRoute === 'root') {
      onClose();
      return;
    }
    setActiveRoute('root');
  };

  const handleRequestClose = () => {
    if (activeRoute === 'root') {
      handleClose();
      return true;
    }
    handleBack();
    return false;
  };

  const openRoute = (route: Exclude<SettingsRoute, 'root'>) => {
    void selectionHaptic();
    setActiveRoute(route);
  };

  const toggleNotification = (key: keyof typeof notificationSettings) => {
    void selectionHaptic();
    setNotificationSettings((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const toggleBetSetting = (key: keyof typeof betSettings) => {
    void selectionHaptic();
    setBetSettings((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const cycleQuickBetAmount = (index: number) => {
    void selectionHaptic();
    setQuickBetAmounts((current) =>
      current.map((value, valueIndex) =>
        valueIndex === index ? cycleValue(value, QUICK_BET_AMOUNT_OPTIONS) : value,
      ),
    );
  };

  const updateProxyField = (key: keyof typeof proxyValues, value: string) => {
    setProxyValues((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSaveProxy = () => {
    void selectionHaptic();
    onOpenItem(proxyEnabled ? 'Прокси сохранён' : 'Прокси выключен');
    setActiveRoute('root');
  };

  const rootBottomPadding =
    Math.max(insets.bottom, homeTheme.spacing.xl) + homeTheme.spacing.lg;

  const renderRootScreen = () => (
    <ScrollView
      alwaysBounceVertical
      contentContainerStyle={[styles.content, { paddingBottom: rootBottomPadding }]}
      keyboardShouldPersistTaps="handled"
      refreshControl={refreshControl}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.accountCard}>
        <View style={styles.accountAvatar}>
          <Text style={styles.accountAvatarText}>A</Text>
        </View>

        <View style={styles.accountCopy}>
          <Text numberOfLines={1} style={styles.accountTitle}>
            Основной счёт
          </Text>
          <Text numberOfLines={1} style={styles.accountAmount}>
            125 430 ₽
          </Text>
          <Text numberOfLines={1} style={styles.accountSubtitle}>
            {homeTheme.strings.balanceMeta} • {homeTheme.strings.balanceCurrency}
          </Text>
        </View>

        <Pressable
          onPress={() => onOpenItem('Управление счётом')}
          style={({ pressed }) => [styles.accountAction, pressed && styles.pressed]}
        >
          <HomeBrandIcon color={homeTheme.colors.primary} name="balance" size={18} />
        </Pressable>
      </View>

      <View style={styles.alertCard}>
        <View style={styles.alertIconWrap}>
          <HomeBrandIcon color={homeTheme.colors.primaryForeground} name="notification-new" size={18} />
        </View>
        <View style={styles.alertCopy}>
          <Text style={styles.alertTitle}>Синхронизация времени</Text>
          <Text style={styles.alertSubtitle}>
            Для корректных push и котировок держите дату и время устройства в авто-режиме
          </Text>
        </View>
      </View>

      <SectionHeader title="Основные" />
      <View style={styles.sectionCard}>
        <SettingsValueCell
          icon="notification-new"
          onPress={() => openRoute('notifications')}
          subtitle="Push, избранные матчи и звук уведомлений"
          title="Push-уведомления"
          value={SOUND_LABELS[soundMode]}
        />
        <SettingsValueCell
          icon="fast-bet"
          onPress={() => openRoute('bets')}
          subtitle="Купон, коэффициенты и быстрые суммы"
          title="Настройки ставок"
          value={BET_COEF_LABELS[betCoefMode]}
        />
        <SettingsValueCell
          icon="night-theme"
          onPress={() => openRoute('theme')}
          subtitle="Светлая, тёмная и системная тема"
          title="Тема"
          value={THEME_LABELS[themeMode]}
        />
        <SettingsValueCell
          icon="proxy"
          last
          onPress={() => openRoute('proxy')}
          subtitle="Ручная настройка соединения"
          title="Прокси"
          value={proxyEnabled ? 'Включен' : 'Выкл.'}
        />
      </View>

      <SectionHeader title="Приложение" />
      <View style={styles.sectionCard}>
        <SettingsValueCell
          icon="upload"
          onPress={() => onOpenItem('Aviator iOS-style UI clone')}
          subtitle="Информация о сборке и устройстве"
          title="О приложении"
          value="1.0.0"
        />
        <SettingsValueCell
          icon="history"
          last
          onPress={() => onOpenItem('Кэш очищен')}
          subtitle="Временные данные интерфейса"
          title="Очистить кэш"
          value="28 МБ"
        />
      </View>
    </ScrollView>
  );

  const renderNotificationsScreen = () => (
    <ScrollView
      alwaysBounceVertical
      contentContainerStyle={[styles.content, { paddingBottom: rootBottomPadding }]}
      keyboardShouldPersistTaps="handled"
      refreshControl={refreshControl}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.sectionCard}>
        <SettingsSwitchCell
          onPress={() => toggleNotification('matchEvents')}
          title="События матчей"
          value={notificationSettings.matchEvents}
        />
        <SettingsSwitchCell
          onPress={() => toggleNotification('favoriteEvents')}
          subtitle="Уведомления по избранным событиям и турнирам"
          title="Избранные события"
          value={notificationSettings.favoriteEvents}
        />
        <SettingsSwitchCell
          onPress={() => toggleNotification('indicator')}
          title="Световой индикатор"
          value={notificationSettings.indicator}
        />
        <SettingsValueCell
          last
          onPress={() => {
            void selectionHaptic();
            setSoundMode((current) => cycleValue(current, SOUND_MODE_OPTIONS));
          }}
          title="Звуки push"
          value={SOUND_LABELS[soundMode]}
        />
      </View>
    </ScrollView>
  );

  const renderBetSettingsScreen = () => (
    <ScrollView
      alwaysBounceVertical
      contentContainerStyle={[styles.content, { paddingBottom: rootBottomPadding }]}
      keyboardShouldPersistTaps="handled"
      refreshControl={refreshControl}
      showsVerticalScrollIndicator={false}
    >
      <SectionHeader title="Купон" />
      <View style={styles.sectionCard}>
        <SettingsSwitchCell
          onPress={() => toggleBetSetting('clearCoupon')}
          title="Очищать купон"
          value={betSettings.clearCoupon}
        />
        <SettingsSwitchCell
          onPress={() => toggleBetSetting('autoClearCouponEnd')}
          title="Автоочистка завершённых событий"
          value={betSettings.autoClearCouponEnd}
        />
        <SettingsSwitchCell
          last
          onPress={() => toggleBetSetting('confirmLineToLive')}
          title="Подтверждать перенос линии в LIVE"
          value={betSettings.confirmLineToLive}
        />
      </View>

      <SectionHeader title="Быстрые ставки" />
      <View style={styles.sectionCard}>
        <SettingsSwitchCell
          onPress={() => toggleBetSetting('quickBet')}
          title="Быстрые ставки"
          value={betSettings.quickBet}
        />
        <SettingsValueCell
          onPress={() => cycleQuickBetAmount(0)}
          title="Сумма 1"
          value={formatRubAmount(quickBetAmounts[0] ?? 500)}
        />
        <SettingsValueCell
          onPress={() => cycleQuickBetAmount(1)}
          title="Сумма 2"
          value={formatRubAmount(quickBetAmounts[1] ?? 1000)}
        />
        <SettingsValueCell
          last
          onPress={() => cycleQuickBetAmount(2)}
          title="Сумма 3"
          value={formatRubAmount(quickBetAmounts[2] ?? 3000)}
        />
      </View>

      <SectionHeader title="Коэффициенты" />
      <View style={styles.sectionCard}>
        <SettingsRadioCell
          onPress={() => {
            void selectionHaptic();
            setBetCoefMode('confirm');
          }}
          selected={betCoefMode === 'confirm'}
          title="Подтверждать изменения"
        />
        <SettingsRadioCell
          onPress={() => {
            void selectionHaptic();
            setBetCoefMode('accept-any');
          }}
          selected={betCoefMode === 'accept-any'}
          title="Принимать любые изменения"
        />
        <SettingsRadioCell
          last
          onPress={() => {
            void selectionHaptic();
            setBetCoefMode('accept-increase');
          }}
          selected={betCoefMode === 'accept-increase'}
          title="Принимать только повышение"
        />
      </View>

      <SectionHeader title="Дополнительно" />
      <View style={styles.sectionCard}>
        <SettingsSwitchCell
          onPress={() => toggleBetSetting('resetCoefOnScoreChange')}
          title="Сбрасывать коэффициент при изменении счёта"
          value={betSettings.resetCoefOnScoreChange}
        />
        <SettingsSwitchCell
          last
          onPress={() => toggleBetSetting('autoMax')}
          title="Авто-максимум"
          value={betSettings.autoMax}
        />
      </View>
    </ScrollView>
  );

  const renderThemeScreen = () => (
    <ScrollView
      alwaysBounceVertical
      contentContainerStyle={[styles.content, { paddingBottom: rootBottomPadding }]}
      keyboardShouldPersistTaps="handled"
      refreshControl={refreshControl}
      showsVerticalScrollIndicator={false}
    >
      <SectionHeader title="Выбор темы" />
      <View style={styles.themeCardWrap}>
        {THEME_OPTIONS.map((option) => {
          const active = option.id === themeMode;

          return (
            <Pressable
              key={option.id}
              onPress={() => {
                if (option.id === themeMode) {
                  return;
                }
                void selectionHaptic();
                setThemeMode(option.id);
              }}
              style={({ pressed }) => [
                styles.themeOption,
                active && styles.themeOptionActive,
                pressed && styles.pressed,
              ]}
            >
              <ThemePreview tone={option.id} />
              <Text style={[styles.themeOptionLabel, active && styles.themeOptionLabelActive]}>
                {option.label}
              </Text>
              <View style={[styles.radioOuter, active && styles.radioOuterActive]}>
                {active ? <View style={styles.radioInner} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>

      <SectionHeader title="Настройки" />
      <View style={styles.sectionCard}>
        <SettingsSwitchCell
          onPress={() => {
            void selectionHaptic();
            setThemeScheduleEnabled((current) => !current);
          }}
          title="По расписанию"
          value={themeScheduleEnabled}
        />
        <SettingsValueCell
          onPress={() => {
            void selectionHaptic();
            setThemeTurnOnTime((current) => cycleValue(current, THEME_ON_TIME_OPTIONS));
          }}
          title="Включить тему"
          value={themeTurnOnTime}
        />
        <SettingsValueCell
          last
          onPress={() => {
            void selectionHaptic();
            setThemeTurnOffTime((current) => cycleValue(current, THEME_OFF_TIME_OPTIONS));
          }}
          title="Выключить тему"
          value={themeTurnOffTime}
        />
      </View>
    </ScrollView>
  );

  const renderProxyScreen = () => (
    <View style={styles.proxyScreen}>
      <ScrollView
        alwaysBounceVertical
        contentContainerStyle={[
          styles.content,
          { paddingBottom: rootBottomPadding + 88 },
        ]}
        keyboardShouldPersistTaps="handled"
        refreshControl={refreshControl}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionCard}>
          <SettingsSwitchCell
            last
            onPress={() => {
              void selectionHaptic();
              setProxyEnabled((current) => !current);
            }}
            title="Использовать прокси"
            value={proxyEnabled}
          />
        </View>

        <View style={styles.formCard}>
          <FieldLabel label="Сервер" />
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            editable={proxyEnabled}
            onChangeText={(value) => updateProxyField('server', value)}
            placeholder="proxy.example.com"
            placeholderTextColor={homeTheme.colors.secondary}
            style={[styles.textField, !proxyEnabled && styles.textFieldDisabled]}
            value={proxyValues.server}
          />

          <FieldLabel label="Порт" />
          <TextInput
            editable={proxyEnabled}
            keyboardType="number-pad"
            onChangeText={(value) => updateProxyField('port', value)}
            placeholder="8080"
            placeholderTextColor={homeTheme.colors.secondary}
            style={[styles.textField, !proxyEnabled && styles.textFieldDisabled]}
            value={proxyValues.port}
          />

          <FieldLabel label="Имя пользователя" />
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            editable={proxyEnabled}
            onChangeText={(value) => updateProxyField('username', value)}
            placeholder="username"
            placeholderTextColor={homeTheme.colors.secondary}
            style={[styles.textField, !proxyEnabled && styles.textFieldDisabled]}
            value={proxyValues.username}
          />

          <FieldLabel label="Пароль" />
          <TextInput
            editable={proxyEnabled}
            onChangeText={(value) => updateProxyField('password', value)}
            placeholder="Пароль"
            placeholderTextColor={homeTheme.colors.secondary}
            secureTextEntry
            style={[styles.textField, !proxyEnabled && styles.textFieldDisabled]}
            value={proxyValues.password}
          />
        </View>
      </ScrollView>

      <View style={[styles.bottomActionBar, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable
          onPress={handleSaveProxy}
          style={({ pressed }) => [
            styles.primaryButton,
            !proxyEnabled && styles.primaryButtonDisabled,
            pressed && proxyEnabled && styles.pressed,
          ]}
        >
          <Text style={styles.primaryButtonText}>Сохранить</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <HomeSideModal onRequestClose={handleRequestClose} visible={visible}>
      <View style={styles.screen}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <View style={styles.navBar}>
            <Pressable
              hitSlop={10}
              onPress={activeRoute === 'root' ? handleClose : handleBack}
              style={({ pressed }) => [styles.navButton, pressed && styles.pressed]}
            >
              <HomeBrandIcon color={homeTheme.colors.secondary} name="arrow-left" size={24} />
            </Pressable>

            <Text numberOfLines={1} style={styles.navTitle}>
              {currentTitle}
            </Text>

            <View style={styles.navSpacer} />
          </View>
        </View>

        <View style={styles.headerDivider} />

        {activeRoute === 'root'
          ? renderRootScreen()
          : activeRoute === 'notifications'
            ? renderNotificationsScreen()
            : activeRoute === 'bets'
              ? renderBetSettingsScreen()
              : activeRoute === 'theme'
                ? renderThemeScreen()
                : renderProxyScreen()}
      </View>
    </HomeSideModal>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionLabel}>{title}</Text>;
}

function FieldLabel({ label }: { label: string }) {
  return <Text style={styles.fieldLabel}>{label}</Text>;
}

type SettingsValueCellProps = {
  icon?: HomeBrandGlyphName;
  last?: boolean;
  onPress: () => void;
  subtitle?: string;
  title: string;
  value?: string;
};

function SettingsValueCell({
  icon,
  last = false,
  onPress,
  subtitle,
  title,
  value,
}: SettingsValueCellProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.cell, pressed && styles.pressed]}>
      {icon ? (
        <View style={styles.cellIconWrap}>
          <HomeBrandIcon color={homeTheme.colors.primary} name={icon} size={18} />
        </View>
      ) : null}

      <View style={styles.cellCopy}>
        <Text style={styles.cellTitle}>{title}</Text>
        {subtitle ? <Text style={styles.cellSubtitle}>{subtitle}</Text> : null}
      </View>

      <View style={styles.cellRightWrap}>
        {value ? <Text style={styles.cellValue}>{value}</Text> : null}
        <HomeBrandIcon color={homeTheme.colors.secondary} name="chevron-right-small" size={18} />
      </View>

      {!last ? <View style={[styles.separator, icon && styles.separatorInset]} /> : null}
    </Pressable>
  );
}

type SettingsSwitchCellProps = {
  last?: boolean;
  onPress: () => void;
  subtitle?: string;
  title: string;
  value: boolean;
};

function SettingsSwitchCell({
  last = false,
  onPress,
  subtitle,
  title,
  value,
}: SettingsSwitchCellProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.cell, pressed && styles.pressed]}>
      <View style={styles.cellCopy}>
        <Text style={styles.cellTitle}>{title}</Text>
        {subtitle ? <Text style={styles.cellSubtitle}>{subtitle}</Text> : null}
      </View>

      <Switch
        ios_backgroundColor={homeTheme.colors.sectionDivider}
        pointerEvents="none"
        thumbColor={homeTheme.colors.primaryForeground}
        trackColor={{
          false: homeTheme.colors.sectionDivider,
          true: homeTheme.colors.primary,
        }}
        value={value}
      />

      {!last ? <View style={styles.separator} /> : null}
    </Pressable>
  );
}

type SettingsRadioCellProps = {
  last?: boolean;
  onPress: () => void;
  selected: boolean;
  title: string;
};

function SettingsRadioCell({
  last = false,
  onPress,
  selected,
  title,
}: SettingsRadioCellProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.cell, pressed && styles.pressed]}>
      <View style={styles.cellCopy}>
        <Text style={styles.cellTitle}>{title}</Text>
      </View>

      <View style={[styles.radioOuter, selected && styles.radioOuterActive]}>
        {selected ? <View style={styles.radioInner} /> : null}
      </View>

      {!last ? <View style={styles.separator} /> : null}
    </Pressable>
  );
}

function ThemePreview({ tone }: { tone: ThemeMode }) {
  return (
    <View style={styles.previewShell}>
      <View
        style={[
          styles.previewChrome,
          tone === 'light'
            ? styles.previewChromeLight
            : tone === 'dark'
              ? styles.previewChromeDark
              : styles.previewChromeSystem,
        ]}
      >
        <View
          style={[
            styles.previewHero,
            tone === 'light'
              ? styles.previewHeroLight
              : tone === 'dark'
                ? styles.previewHeroDark
                : styles.previewHeroSystem,
          ]}
        />
        <View style={styles.previewRow}>
          <View style={styles.previewLine} />
          <View style={[styles.previewLine, styles.previewLineShort]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: homeTheme.colors.background,
    flex: 1,
  },
  header: {
    backgroundColor: homeTheme.colors.background,
    paddingHorizontal: 12,
  },
  navBar: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 56,
  },
  navButton: {
    alignItems: 'center',
    borderRadius: homeTheme.radii.full,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  navTitle: {
    color: homeTheme.colors.textPrimary,
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 24,
    textAlign: 'center',
  },
  navSpacer: {
    width: 40,
  },
  headerDivider: {
    backgroundColor: homeTheme.colors.sectionDivider,
    height: 1,
    opacity: 0.5,
  },
  content: {
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  accountCard: {
    alignItems: 'center',
    backgroundColor: homeTheme.colors.sectionSurface,
    borderRadius: 16,
    flexDirection: 'row',
    marginBottom: 16,
    minHeight: 84,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  accountAvatar: {
    alignItems: 'center',
    backgroundColor: homeTheme.colors.background,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  accountAvatarText: {
    color: homeTheme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 20,
  },
  accountCopy: {
    flex: 1,
    marginLeft: 12,
  },
  accountTitle: {
    color: homeTheme.colors.secondary,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  accountAmount: {
    color: homeTheme.colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 26,
    marginTop: 4,
  },
  accountSubtitle: {
    color: homeTheme.colors.secondary,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
  accountAction: {
    alignItems: 'center',
    backgroundColor: homeTheme.colors.background,
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  alertCard: {
    alignItems: 'center',
    backgroundColor: homeTheme.colors.primary,
    borderRadius: 16,
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  alertIconWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    marginRight: 12,
    width: 32,
  },
  alertCopy: {
    flex: 1,
  },
  alertTitle: {
    color: homeTheme.colors.primaryForeground,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 18,
  },
  alertSubtitle: {
    color: homeTheme.colors.primaryForeground80,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
  sectionLabel: {
    color: homeTheme.colors.secondary,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 16,
    marginBottom: 8,
    marginLeft: 4,
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: homeTheme.colors.sectionSurface,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cell: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 56,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  cellIconWrap: {
    alignItems: 'center',
    backgroundColor: homeTheme.colors.primary20,
    borderRadius: 16,
    height: 40,
    justifyContent: 'center',
    marginRight: 12,
    width: 40,
  },
  cellCopy: {
    flex: 1,
    paddingVertical: 2,
  },
  cellTitle: {
    color: homeTheme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
  },
  cellSubtitle: {
    color: homeTheme.colors.secondary,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
  cellRightWrap: {
    alignItems: 'center',
    flexDirection: 'row',
    marginLeft: 12,
  },
  cellValue: {
    color: homeTheme.colors.secondary,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 16,
    marginRight: 8,
  },
  separator: {
    backgroundColor: homeTheme.colors.sectionDivider,
    bottom: 0,
    height: 1,
    left: 12,
    opacity: 0.45,
    position: 'absolute',
    right: 12,
  },
  separatorInset: {
    left: 64,
  },
  themeCardWrap: {
    backgroundColor: homeTheme.colors.sectionSurface,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  themeOption: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 6,
  },
  themeOptionActive: {
    opacity: 1,
  },
  themeOptionLabel: {
    color: homeTheme.colors.secondary,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    marginTop: 8,
  },
  themeOptionLabelActive: {
    color: homeTheme.colors.textPrimary,
  },
  previewShell: {
    borderRadius: 12,
    height: 88,
    overflow: 'hidden',
    width: '100%',
  },
  previewChrome: {
    borderRadius: 12,
    flex: 1,
    padding: 8,
  },
  previewChromeLight: {
    backgroundColor: '#edf1f6',
  },
  previewChromeDark: {
    backgroundColor: '#202733',
  },
  previewChromeSystem: {
    backgroundColor: '#293244',
  },
  previewHero: {
    borderRadius: 8,
    height: 40,
  },
  previewHeroLight: {
    backgroundColor: '#ffffff',
  },
  previewHeroDark: {
    backgroundColor: '#11161e',
  },
  previewHeroSystem: {
    backgroundColor: '#5a6678',
  },
  previewRow: {
    gap: 6,
    marginTop: 8,
  },
  previewLine: {
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: 4,
    height: 6,
    width: '100%',
  },
  previewLineShort: {
    width: '72%',
  },
  radioOuter: {
    alignItems: 'center',
    borderColor: homeTheme.colors.sectionDivider,
    borderRadius: 9,
    borderWidth: 2,
    height: 18,
    justifyContent: 'center',
    width: 18,
  },
  radioOuterActive: {
    borderColor: homeTheme.colors.primary,
  },
  radioInner: {
    backgroundColor: homeTheme.colors.primary,
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  proxyScreen: {
    flex: 1,
  },
  formCard: {
    backgroundColor: homeTheme.colors.sectionSurface,
    borderRadius: 16,
    padding: 16,
  },
  fieldLabel: {
    color: homeTheme.colors.secondary,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    marginBottom: 8,
    marginTop: 12,
  },
  textField: {
    backgroundColor: homeTheme.colors.background,
    borderRadius: 14,
    color: homeTheme.colors.textPrimary,
    fontSize: 15,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  textFieldDisabled: {
    opacity: 0.55,
  },
  bottomActionBar: {
    backgroundColor: homeTheme.colors.background,
    borderTopColor: homeTheme.colors.sectionDivider,
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: homeTheme.colors.primary,
    borderRadius: 16,
    height: 48,
    justifyContent: 'center',
  },
  primaryButtonDisabled: {
    backgroundColor: homeTheme.colors.sectionDivider,
  },
  primaryButtonText: {
    color: homeTheme.colors.primaryForeground,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 18,
  },
  pressed: {
    opacity: 0.84,
  },
});
