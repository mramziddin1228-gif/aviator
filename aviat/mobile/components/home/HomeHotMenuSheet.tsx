import { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { selectionHaptic } from '../../src/lib/haptics';
import { homeBannerAssets, homeGameAssets } from '../../theme/homeAssets';
import { homeTheme, type HomeBrandGlyphName } from '../../theme/homeTheme';
import { HomeBrandIcon } from './HomeBrandIcon';
import { HomeUiIcon } from './HomeUiIcon';
import { HomeSideModal } from './HomeSideModal';
import { usePullToRefresh } from '../shared/usePullToRefresh';

export type HomeHotMenuActionId =
  | 'popular'
  | 'live'
  | 'line'
  | 'games'
  | 'deposit'
  | 'notifications'
  | 'history'
  | 'settings'
  | 'support';

type HomeHotMenuSheetProps = {
  balanceAmount: string;
  balanceCurrency: string;
  balanceMeta: string;
  onClose: () => void;
  onSelectAction: (action: HomeHotMenuActionId) => void;
  visible: boolean;
};

type MenuTabId = 'casino' | 'games' | 'other' | 'sports' | 'top' | 'virtual';

type MenuLineItem = {
  action: HomeHotMenuActionId;
  icon: Parameters<typeof HomeUiIcon>[0]['icon'];
  id: string;
  subtitle?: string;
  title: string;
};

type MenuCompactItem = {
  action: HomeHotMenuActionId;
  icon: Parameters<typeof HomeUiIcon>[0]['icon'];
  id: string;
  subtitle: string;
  title: string;
};

type MenuDecoratedItem = {
  action: HomeHotMenuActionId;
  icon: HomeBrandGlyphName;
  id: string;
  image: number;
  subtitle: string;
  title: string;
};

const MENU_TABS: Array<{ id: MenuTabId; icon: HomeBrandGlyphName; title: string }> = [
  { id: 'top', icon: 'top-tab', title: 'Топ' },
  { id: 'sports', icon: 'sport-tab', title: 'Спорт' },
  { id: 'casino', icon: 'cards-tab', title: 'Казино' },
  { id: 'virtual', icon: 'virtual-tab', title: 'Virtual' },
  { id: 'games', icon: 'games-tab', title: '1xGames' },
  { id: 'other', icon: 'other-tab', title: 'Разное' },
];

const MENU_DECORATED: Record<MenuTabId, MenuDecoratedItem | null> = {
  casino: {
    action: 'games',
    icon: 'cards-tab',
    id: 'casino-vip',
    image: homeBannerAssets.jackpotPopular,
    subtitle: 'Слоты, live-игры и быстрый вход в казино-категории',
    title: 'Казино и live-столы',
  },
  games: {
    action: 'games',
    icon: 'games-tab',
    id: 'games-aviator',
    image: homeBannerAssets.popularVirtual,
    subtitle: 'Быстрый вход в `Aviator`, TV Games и моментальные раунды',
    title: '1xGames и Aviator',
  },
  other: null,
  sports: {
    action: 'live',
    icon: 'sport-tab',
    id: 'sport-live',
    image: homeBannerAssets.aggregatorPopular,
    subtitle: 'LIVE, линия и быстрый переход к главным спортивным разделам',
    title: 'Спортивное меню',
  },
  top: {
    action: 'popular',
    icon: 'top-tab',
    id: 'top-main',
    image: homeBannerAssets.luckyWheelPopular,
    subtitle: 'Топ-экраны, бонусы и быстрый доступ к основным действиям',
    title: 'Главные разделы',
  },
  virtual: {
    action: 'popular',
    icon: 'virtual-tab',
    id: 'virtual-main',
    image: homeGameAssets.cellBlackBig,
    subtitle: 'Виртуальный спорт, гонки и моментальные ленты событий',
    title: 'Virtual и быстрые матчи',
  },
};

const MENU_COMPACT: Record<MenuTabId, MenuCompactItem[]> = {
  casino: [
    {
      action: 'games',
      icon: { kind: 'brand', name: 'cards-tab', size: 22 },
      id: 'casino-slots',
      subtitle: 'Каталог слотов и jackpot-лент',
      title: 'Слоты',
    },
    {
      action: 'games',
      icon: { kind: 'brand', name: 'promo-wheel', size: 22 },
      id: 'casino-bonus',
      subtitle: 'Бонусы и промо-активности',
      title: 'Бонусы',
    },
  ],
  games: [
    {
      action: 'games',
      icon: { kind: 'brand', name: 'games-tab', size: 22 },
      id: 'games-lobby',
      subtitle: 'Каталог игр 1xGames',
      title: 'Лобби игр',
    },
    {
      action: 'games',
      icon: { kind: 'brand', name: 'popular-fire', size: 22 },
      id: 'games-popular',
      subtitle: 'Популярные игры и хиты дня',
      title: 'Хиты',
    },
  ],
  other: [
    {
      action: 'settings',
      icon: { kind: 'brand', name: 'settings-inactive', size: 22 },
      id: 'other-settings',
      subtitle: 'Темы, ставки и системные параметры',
      title: 'Настройки',
    },
    {
      action: 'support',
      icon: { kind: 'brand', name: 'support', size: 22 },
      id: 'other-support',
      subtitle: 'Чат и ответы поддержки',
      title: 'Поддержка',
    },
  ],
  sports: [
    {
      action: 'popular',
      icon: { kind: 'brand', name: 'popular-fire', size: 22 },
      id: 'sports-top',
      subtitle: 'Топ матчей и быстрые маркет-листы',
      title: 'Популярное',
    },
    {
      action: 'live',
      icon: { kind: 'brand', name: 'live-shortcut', size: 22 },
      id: 'sports-live',
      subtitle: 'Матчи в реальном времени',
      title: 'LIVE',
    },
  ],
  top: [
    {
      action: 'deposit',
      icon: { kind: 'brand', name: 'deposit-account', size: 22 },
      id: 'top-deposit',
      subtitle: 'Пополнение и управление счётом',
      title: 'Счёт',
    },
    {
      action: 'notifications',
      icon: { kind: 'brand', name: 'notification-new', size: 22 },
      id: 'top-alerts',
      subtitle: 'Лента уведомлений и подписки',
      title: 'Уведомления',
    },
  ],
  virtual: [
    {
      action: 'popular',
      icon: { kind: 'brand', name: 'virtual-tab', size: 22 },
      id: 'virtual-sport',
      subtitle: 'Виртуальные дисциплины и матчи',
      title: 'Virtual sport',
    },
    {
      action: 'games',
      icon: { kind: 'brand', name: 'games-tab', size: 22 },
      id: 'virtual-races',
      subtitle: 'Гонки и instant-игры',
      title: 'Гонки',
    },
  ],
};

const MENU_LINES: Record<MenuTabId, MenuLineItem[]> = {
  casino: [
    {
      action: 'games',
      icon: { kind: 'brand', name: 'games-tab', size: 20 },
      id: 'casino-lobby',
      title: 'Игровое лобби',
    },
    {
      action: 'games',
      icon: { kind: 'brand', name: 'favorites', size: 20 },
      id: 'casino-favorites',
      title: 'Избранные игры',
    },
    {
      action: 'support',
      icon: { kind: 'brand', name: 'support', size: 20 },
      id: 'casino-rules',
      title: 'Помощь и правила',
    },
  ],
  games: [
    {
      action: 'games',
      icon: { kind: 'brand', name: 'games-tab', size: 20 },
      id: 'games-all',
      title: 'Все игры',
    },
    {
      action: 'games',
      icon: { kind: 'brand', name: 'favorites', size: 20 },
      id: 'games-favorites',
      title: 'Избранное',
    },
    {
      action: 'history',
      icon: { kind: 'brand', name: 'history', size: 20 },
      id: 'games-history',
      title: 'История игр',
    },
  ],
  other: [
    {
      action: 'notifications',
      icon: { kind: 'brand', name: 'notification-new', size: 20 },
      id: 'other-alerts',
      title: 'Уведомления',
    },
    {
      action: 'history',
      icon: { kind: 'brand', name: 'history', size: 20 },
      id: 'other-history',
      title: 'История',
    },
    {
      action: 'settings',
      icon: { kind: 'brand', name: 'settings-inactive', size: 20 },
      id: 'other-settings-2',
      title: 'Настройки',
    },
    {
      action: 'support',
      icon: { kind: 'brand', name: 'support', size: 20 },
      id: 'other-support-2',
      title: 'Поддержка',
    },
  ],
  sports: [
    {
      action: 'popular',
      icon: { kind: 'material', name: 'soccer', size: 20 },
      id: 'sports-football',
      title: 'Футбол',
    },
    {
      action: 'popular',
      icon: { kind: 'material', name: 'basketball', size: 20 },
      id: 'sports-basketball',
      title: 'Баскетбол',
    },
    {
      action: 'line',
      icon: { kind: 'material', name: 'tennis-ball', size: 20 },
      id: 'sports-tennis',
      title: 'Теннис',
    },
    {
      action: 'live',
      icon: { kind: 'material', name: 'sword-cross', size: 20 },
      id: 'sports-esports',
      title: 'Киберспорт',
    },
  ],
  top: [
    {
      action: 'deposit',
      icon: { kind: 'brand', name: 'deposit-account', size: 20 },
      id: 'top-balance',
      subtitle: 'Пополнение и вывод средств',
      title: 'Счёт и платежи',
    },
    {
      action: 'notifications',
      icon: { kind: 'brand', name: 'notification-new', size: 20 },
      id: 'top-notifications',
      subtitle: 'Подписки, матчи и системные сообщения',
      title: 'Уведомления',
    },
    {
      action: 'history',
      icon: { kind: 'brand', name: 'history', size: 20 },
      id: 'top-history',
      subtitle: 'История ставок и транзакций',
      title: 'История',
    },
  ],
  virtual: [
    {
      action: 'popular',
      icon: { kind: 'brand', name: 'virtual-tab', size: 20 },
      id: 'virtual-football',
      title: 'Virtual football',
    },
    {
      action: 'popular',
      icon: { kind: 'material', name: 'horse-variant-fast', size: 20 },
      id: 'virtual-races-line',
      title: 'Гонки',
    },
    {
      action: 'games',
      icon: { kind: 'brand', name: 'games-tab', size: 20 },
      id: 'virtual-games',
      title: 'Instant-игры',
    },
  ],
};

export function HomeHotMenuSheet({
  balanceAmount,
  balanceCurrency,
  balanceMeta,
  onClose,
  onSelectAction,
  visible,
}: HomeHotMenuSheetProps) {
  const insets = useSafeAreaInsets();
  const { refreshControl } = usePullToRefresh();
  const [activeTab, setActiveTab] = useState<MenuTabId>('top');

  const decoratedItem = MENU_DECORATED[activeTab];
  const compactItems = MENU_COMPACT[activeTab];
  const lineItems = MENU_LINES[activeTab];

  const handleClose = () => {
    void selectionHaptic();
    onClose();
  };

  const handleSelectAction = (action: HomeHotMenuActionId) => {
    void selectionHaptic();
    onSelectAction(action);
  };

  const handleSelectTab = (tabId: MenuTabId) => {
    if (tabId === activeTab) {
      return;
    }

    void selectionHaptic();
    setActiveTab(tabId);
  };

  return (
    <HomeSideModal onRequestClose={handleClose} visible={visible}>
      <View style={styles.screen}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <View style={styles.profileToolbar}>
            <Pressable
              hitSlop={10}
              onPress={handleClose}
              style={({ pressed }) => [styles.navButton, pressed && styles.pressed]}
            >
              <HomeBrandIcon color={homeTheme.colors.secondary} name="arrow-left" size={24} />
            </Pressable>

            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>A</Text>
            </View>

            <View style={styles.profileCopy}>
              <Text numberOfLines={1} style={styles.profileTitle}>
                Аккаунт
              </Text>
              <Text numberOfLines={1} style={styles.profileSubtitle}>
                Главное меню и быстрые переходы
              </Text>
            </View>
          </View>

          <View style={styles.accountCard}>
            <View style={styles.accountCopy}>
              <Text style={styles.accountLabel}>{homeTheme.strings.balanceLabel}</Text>
              <Text style={styles.accountAmount}>{balanceAmount}</Text>
              <View style={styles.accountMetaRow}>
                <Text style={styles.accountMetaText}>{balanceMeta}</Text>
                <View style={styles.metaDot} />
                <Text style={styles.accountMetaText}>{balanceCurrency}</Text>
              </View>
            </View>

            <Pressable
              onPress={() => handleSelectAction('deposit')}
              style={({ pressed }) => [styles.topUpButton, pressed && styles.pressed]}
            >
              <HomeBrandIcon
                color={homeTheme.colors.primaryForeground}
                name="deposit-account"
                size={18}
              />
              <Text style={styles.topUpButtonText}>Пополнить</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.headerDivider} />

        <ScrollView
          alwaysBounceVertical
          contentContainerStyle={[
            styles.content,
            { paddingBottom: Math.max(insets.bottom, homeTheme.spacing.xl) + homeTheme.spacing.lg },
          ]}
          refreshControl={refreshControl}
          showsVerticalScrollIndicator={false}
        >
          <ScrollView
            contentContainerStyle={styles.tabsRow}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {MENU_TABS.map((tab) => {
              const active = tab.id === activeTab;

              return (
                <Pressable
                  key={tab.id}
                  onPress={() => handleSelectTab(tab.id)}
                  style={({ pressed }) => [
                    styles.tabChip,
                    active && styles.tabChipActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={[styles.tabIconWrap, active && styles.tabIconWrapActive]}>
                    <HomeBrandIcon
                      color={active ? homeTheme.colors.primary : homeTheme.colors.secondary}
                      name={tab.icon}
                      size={18}
                    />
                  </View>
                  <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.title}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {decoratedItem ? (
            <Pressable
              onPress={() => handleSelectAction(decoratedItem.action)}
              style={({ pressed }) => [styles.decoratedCard, pressed && styles.pressed]}
            >
              <View style={styles.decoratedContent}>
                <View style={styles.decoratedIconWrap}>
                  <HomeBrandIcon
                    color={homeTheme.colors.primaryForeground}
                    name={decoratedItem.icon}
                    size={18}
                  />
                </View>
                <View style={styles.decoratedCopy}>
                  <Text numberOfLines={2} style={styles.decoratedTitle}>
                    {decoratedItem.title}
                  </Text>
                  <Text numberOfLines={2} style={styles.decoratedSubtitle}>
                    {decoratedItem.subtitle}
                  </Text>
                </View>
              </View>
              <Image source={decoratedItem.image} style={styles.decoratedImage} />
            </Pressable>
          ) : null}

          <View style={styles.compactGrid}>
            {compactItems.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => handleSelectAction(item.action)}
                style={({ pressed }) => [styles.compactCard, pressed && styles.pressed]}
              >
                <View style={styles.compactIconWrap}>
                  <HomeUiIcon color={homeTheme.colors.primary} icon={item.icon} size={22} />
                </View>
                <Text numberOfLines={1} style={styles.compactTitle}>
                  {item.title}
                </Text>
                <Text numberOfLines={2} style={styles.compactSubtitle}>
                  {item.subtitle}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.lineGroup}>
            {lineItems.map((item, index) => (
              <Pressable
                key={item.id}
                onPress={() => handleSelectAction(item.action)}
                style={({ pressed }) => [styles.lineCell, pressed && styles.pressed]}
              >
                <View style={styles.lineIconWrap}>
                  <HomeUiIcon color={homeTheme.colors.primary} icon={item.icon} size={20} />
                </View>

                <View style={styles.lineCopy}>
                  <Text numberOfLines={1} style={styles.lineTitle}>
                    {item.title}
                  </Text>
                  {item.subtitle ? (
                    <Text numberOfLines={2} style={styles.lineSubtitle}>
                      {item.subtitle}
                    </Text>
                  ) : null}
                </View>

                <HomeBrandIcon
                  color={homeTheme.colors.secondary}
                  name="chevron-right-small"
                  size={18}
                />

                {index !== lineItems.length - 1 ? <View style={styles.lineSeparator} /> : null}
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>
    </HomeSideModal>
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
  profileToolbar: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 56,
  },
  navButton: {
    alignItems: 'center',
    borderRadius: homeTheme.radii.full,
    height: 40,
    justifyContent: 'center',
    marginRight: 8,
    width: 40,
  },
  profileAvatar: {
    alignItems: 'center',
    backgroundColor: homeTheme.colors.sectionSurface,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  profileAvatarText: {
    color: homeTheme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 20,
  },
  profileCopy: {
    flex: 1,
    marginLeft: 12,
  },
  profileTitle: {
    color: homeTheme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 18,
  },
  profileSubtitle: {
    color: homeTheme.colors.secondary,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  accountCard: {
    alignItems: 'center',
    backgroundColor: homeTheme.colors.sectionSurface,
    borderRadius: 16,
    flexDirection: 'row',
    marginBottom: 8,
    minHeight: 84,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  accountCopy: {
    flex: 1,
    paddingRight: 12,
  },
  accountLabel: {
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
  accountMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 6,
  },
  accountMetaText: {
    color: homeTheme.colors.secondary,
    fontSize: 12,
    lineHeight: 16,
  },
  metaDot: {
    backgroundColor: homeTheme.colors.secondary,
    borderRadius: 2,
    height: 4,
    marginHorizontal: 8,
    opacity: 0.5,
    width: 4,
  },
  topUpButton: {
    alignItems: 'center',
    backgroundColor: homeTheme.colors.primary,
    borderRadius: 18,
    flexDirection: 'row',
    minHeight: 36,
    paddingHorizontal: 14,
  },
  topUpButtonText: {
    color: homeTheme.colors.primaryForeground,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
    marginLeft: 8,
  },
  headerDivider: {
    backgroundColor: homeTheme.colors.sectionDivider,
    height: 1,
    opacity: 0.5,
  },
  content: {
    paddingBottom: 24,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  tabsRow: {
    gap: 8,
    paddingBottom: 12,
  },
  tabChip: {
    alignItems: 'center',
    backgroundColor: homeTheme.colors.sectionSurface,
    borderRadius: 18,
    flexDirection: 'row',
    height: 48,
    paddingHorizontal: 12,
  },
  tabChipActive: {
    backgroundColor: homeTheme.colors.primary20,
  },
  tabIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  tabIconWrapActive: {
    opacity: 1,
  },
  tabLabel: {
    color: homeTheme.colors.secondary,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 16,
  },
  tabLabelActive: {
    color: homeTheme.colors.primary,
  },
  decoratedCard: {
    backgroundColor: homeTheme.colors.primary,
    borderRadius: 16,
    flexDirection: 'row',
    marginBottom: 12,
    minHeight: 92,
    overflow: 'hidden',
  },
  decoratedContent: {
    flex: 1,
    paddingBottom: 14,
    paddingLeft: 16,
    paddingTop: 14,
  },
  decoratedIconWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    marginBottom: 10,
    width: 32,
  },
  decoratedCopy: {
    maxWidth: '86%',
  },
  decoratedTitle: {
    color: homeTheme.colors.primaryForeground,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 18,
  },
  decoratedSubtitle: {
    color: homeTheme.colors.primaryForeground80,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
  decoratedImage: {
    alignSelf: 'stretch',
    resizeMode: 'cover',
    width: 110,
  },
  compactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  compactCard: {
    backgroundColor: homeTheme.colors.sectionSurface,
    borderRadius: 16,
    minHeight: 84,
    paddingHorizontal: 14,
    paddingVertical: 12,
    width: '48.2%',
  },
  compactIconWrap: {
    alignItems: 'center',
    backgroundColor: homeTheme.colors.background,
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    marginBottom: 10,
    width: 32,
  },
  compactTitle: {
    color: homeTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  compactSubtitle: {
    color: homeTheme.colors.secondary,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
  lineGroup: {
    backgroundColor: homeTheme.colors.sectionSurface,
    borderRadius: 16,
    overflow: 'hidden',
  },
  lineCell: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 64,
    paddingHorizontal: 12,
  },
  lineIconWrap: {
    alignItems: 'center',
    backgroundColor: homeTheme.colors.primary20,
    borderRadius: 16,
    height: 40,
    justifyContent: 'center',
    marginRight: 12,
    width: 40,
  },
  lineCopy: {
    flex: 1,
    paddingVertical: 10,
  },
  lineTitle: {
    color: homeTheme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 18,
  },
  lineSubtitle: {
    color: homeTheme.colors.secondary,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
  lineSeparator: {
    backgroundColor: homeTheme.colors.sectionDivider,
    bottom: 0,
    height: 1,
    left: 64,
    opacity: 0.45,
    position: 'absolute',
    right: 0,
  },
  pressed: {
    opacity: 0.84,
  },
});
