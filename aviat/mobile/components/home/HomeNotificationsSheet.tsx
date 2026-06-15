import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { selectionHaptic } from '../../src/lib/haptics';
import { homeTheme } from '../../theme/homeTheme';
import { HomeBrandIcon } from './HomeBrandIcon';
import { HomeSideModal } from './HomeSideModal';
import { usePullToRefresh } from '../shared/usePullToRefresh';

type HomeNotificationsSheetProps = {
  onClose: () => void;
  onOpenItem: (title: string) => void;
  visible: boolean;
};

type SubscriptionSection = {
  id: string;
  rows: Array<{
    id: string;
    title: string;
  }>;
  title: string;
};

const SUBSCRIPTION_SECTIONS: SubscriptionSection[] = [
  {
    id: 'football',
    rows: [
      { id: 'football-goals', title: 'Футбол. Голы и ключевые события' },
      { id: 'football-odds', title: 'Футбол. Изменения коэффициентов' },
      { id: 'football-favorites', title: 'Футбол. Избранные матчи и турниры' },
    ],
    title: 'Футбол',
  },
  {
    id: 'basketball',
    rows: [
      { id: 'basketball-main', title: 'Баскетбол. Матчи и тоталы' },
      { id: 'basketball-favorites', title: 'Баскетбол. Избранные события' },
    ],
    title: 'Баскетбол',
  },
  {
    id: 'tennis',
    rows: [
      { id: 'tennis-main', title: 'Теннис. Счёт и сеты' },
      { id: 'tennis-favorites', title: 'Теннис. Избранные матчи' },
    ],
    title: 'Теннис',
  },
  {
    id: 'payments',
    rows: [
      { id: 'payments-deposit', title: 'Платежи. Пополнение счёта' },
      { id: 'payments-withdraw', title: 'Платежи. Вывод средств' },
    ],
    title: 'Платежи',
  },
];

const ALL_SUBSCRIPTION_IDS = SUBSCRIPTION_SECTIONS.flatMap((section) =>
  section.rows.map((row) => row.id),
);

export function HomeNotificationsSheet({
  onClose,
  onOpenItem,
  visible,
}: HomeNotificationsSheetProps) {
  const insets = useSafeAreaInsets();
  const { refreshControl } = usePullToRefresh();
  const [enabledMap, setEnabledMap] = useState<Record<string, boolean>>({
    'basketball-favorites': true,
    'football-favorites': true,
    'football-goals': true,
    'payments-deposit': true,
    'tennis-main': true,
  });

  const handleClose = () => {
    void selectionHaptic();
    onClose();
  };

  const handleClear = () => {
    void selectionHaptic();
    setEnabledMap({});
    onOpenItem('Подписки очищены');
  };

  const handleToggle = (rowId: string) => {
    void selectionHaptic();
    setEnabledMap((current) => ({
      ...current,
      [rowId]: !current[rowId],
    }));
  };

  const handleEnableAll = () => {
    void selectionHaptic();
    setEnabledMap(
      ALL_SUBSCRIPTION_IDS.reduce<Record<string, boolean>>((accumulator, rowId) => {
        accumulator[rowId] = true;
        return accumulator;
      }, {}),
    );
    onOpenItem('Подписки обновлены');
  };

  return (
    <HomeSideModal onRequestClose={handleClose} visible={visible}>
      <View style={styles.screen}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <View style={styles.navBar}>
            <Pressable
              hitSlop={10}
              onPress={handleClose}
              style={({ pressed }) => [styles.navButton, pressed && styles.pressed]}
            >
              <HomeBrandIcon color={homeTheme.colors.secondary} name="arrow-left" size={24} />
            </Pressable>

            <Text numberOfLines={1} style={styles.navTitle}>
              Уведомления
            </Text>

            <Pressable
              hitSlop={10}
              onPress={handleClear}
              style={({ pressed }) => [styles.navButton, pressed && styles.pressed]}
            >
              <HomeBrandIcon
                color={homeTheme.colors.secondary}
                name="delete-basket"
                size={22}
              />
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
          <Pressable
            onPress={handleEnableAll}
            style={({ pressed }) => [styles.bannerButton, pressed && styles.pressed]}
          >
            <View style={styles.bannerIconWrap}>
              <HomeBrandIcon color={homeTheme.colors.primaryForeground} name="notification-new" size={18} />
            </View>
            <View style={styles.bannerCopy}>
              <Text style={styles.bannerTitle}>Подписки на события</Text>
              <Text style={styles.bannerSubtitle}>
                Включите нужные уведомления и настройте ленту матчей под себя
              </Text>
            </View>
          </Pressable>

          {SUBSCRIPTION_SECTIONS.map((section) => (
            <View key={section.id} style={styles.sectionWrap}>
              <Text style={styles.sectionTitle}>{section.title}</Text>

              <View style={styles.sectionCard}>
                {section.rows.map((row, index) => (
                  <Pressable
                    key={row.id}
                    onPress={() => handleToggle(row.id)}
                    style={({ pressed }) => [styles.subscriptionRow, pressed && styles.pressed]}
                  >
                    <Text numberOfLines={2} style={styles.subscriptionTitle}>
                      {row.title}
                    </Text>

                    <Switch
                      ios_backgroundColor={homeTheme.colors.sectionDivider}
                      pointerEvents="none"
                      thumbColor={homeTheme.colors.primaryForeground}
                      trackColor={{
                        false: homeTheme.colors.sectionDivider,
                        true: homeTheme.colors.primary,
                      }}
                      value={Boolean(enabledMap[row.id])}
                    />

                    {index !== section.rows.length - 1 ? <View style={styles.rowSeparator} /> : null}
                  </Pressable>
                ))}
              </View>
            </View>
          ))}
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
  headerDivider: {
    backgroundColor: homeTheme.colors.sectionDivider,
    height: 1,
    opacity: 0.5,
  },
  content: {
    paddingHorizontal: 12,
    paddingTop: 4,
  },
  bannerButton: {
    alignItems: 'center',
    backgroundColor: homeTheme.colors.sectionSurface,
    borderRadius: 16,
    flexDirection: 'row',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  bannerIconWrap: {
    alignItems: 'center',
    backgroundColor: homeTheme.colors.primary,
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    marginRight: 12,
    width: 32,
  },
  bannerCopy: {
    flex: 1,
  },
  bannerTitle: {
    color: homeTheme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 18,
  },
  bannerSubtitle: {
    color: homeTheme.colors.secondary,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
  sectionWrap: {
    marginTop: 16,
  },
  sectionTitle: {
    color: homeTheme.colors.primary,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 16,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: homeTheme.colors.sectionSurface,
    borderRadius: 16,
    overflow: 'hidden',
  },
  subscriptionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  subscriptionTitle: {
    color: homeTheme.colors.textPrimary,
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
    paddingRight: 12,
  },
  rowSeparator: {
    backgroundColor: homeTheme.colors.sectionDivider,
    bottom: 0,
    height: 1,
    left: 16,
    opacity: 0.45,
    position: 'absolute',
    right: 16,
  },
  pressed: {
    opacity: 0.84,
  },
});
