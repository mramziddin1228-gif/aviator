import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { impactHaptic, selectionHaptic } from '../../src/lib/haptics';
import { homeTheme } from '../../theme/homeTheme';
import { HomeUiIcon } from './HomeUiIcon';
import { HomeSideModal } from './HomeSideModal';
import { usePullToRefresh } from '../shared/usePullToRefresh';

type HomeHistoryScreenProps = {
  balanceAmount: string;
  onClose: () => void;
  onOpenItem: (title: string) => void;
  userId?: string | null;
  visible: boolean;
};

type HistoryTone = 'cancel' | 'credit' | 'debit' | 'pending';

type HistorySection = {
  id: string;
  items: Array<{
    amount: string;
    description: string;
    iconName: 'cancel-small' | 'minus-small' | 'plus-small' | 'waiting';
    id: string;
    time: string;
    tone: HistoryTone;
  }>;
  title: string;
};

const historyPalette = {
  background: homeTheme.colors.background,
  cardSurface: homeTheme.colors.sectionSurface,
  divider: homeTheme.colors.separator,
  primary: homeTheme.colors.primary,
  secondary: homeTheme.colors.secondary,
  textPrimary: homeTheme.colors.textPrimary,
  ticketShadow: '#10161d',
  white: '#FFFFFF',
} as const;

const HISTORY_SUMMARY_ROWS = [
  { id: 'operations', label: 'Операций', value: '14' },
  { id: 'topup', label: 'Пополнено', value: '+ 12 400 ₽' },
  { id: 'withdraw', label: 'Выведено', value: '- 2 850 ₽' },
  { id: 'balance', label: 'Текущий баланс', value: '8 910 ₽' },
] as const;

const HISTORY_SECTIONS: HistorySection[] = [
  {
    id: 'today',
    title: 'Сегодня',
    items: [
      {
        amount: '+ 5 000 ₽',
        description: 'Пополнение счёта',
        iconName: 'plus-small',
        id: 'history-1',
        time: '15:42',
        tone: 'credit',
      },
      {
        amount: '- 1 250 ₽',
        description: 'Вывод средств',
        iconName: 'minus-small',
        id: 'history-2',
        time: '13:18',
        tone: 'debit',
      },
      {
        amount: 'В обработке',
        description: 'Запрос на пополнение',
        iconName: 'waiting',
        id: 'history-3',
        time: '11:04',
        tone: 'pending',
      },
    ],
  },
  {
    id: 'yesterday',
    title: 'Вчера',
    items: [
      {
        amount: '+ 900 ₽',
        description: 'Возврат на счёт',
        iconName: 'plus-small',
        id: 'history-4',
        time: '21:09',
        tone: 'credit',
      },
      {
        amount: 'Отклонено',
        description: 'Отмена операции',
        iconName: 'cancel-small',
        id: 'history-5',
        time: '18:27',
        tone: 'cancel',
      },
    ],
  },
];

function getAmountColor(tone: HistoryTone) {
  if (tone === 'credit') {
    return homeTheme.colors.commerce;
  }

  if (tone === 'debit') {
    return homeTheme.colors.primary;
  }

  return historyPalette.secondary;
}

export function HomeHistoryScreen({
  balanceAmount,
  onClose,
  onOpenItem,
  userId,
  visible,
}: HomeHistoryScreenProps) {
  const insets = useSafeAreaInsets();
  const { refreshControl } = usePullToRefresh();

  const handleClose = () => {
    void selectionHaptic();
    onClose();
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
              <HomeUiIcon
                color={historyPalette.secondary}
                icon={{ kind: 'brand', name: 'arrow-left', size: 24 }}
                size={24}
              />
            </Pressable>

            <Text numberOfLines={1} style={styles.navTitle}>
              История операций
            </Text>

            <View style={styles.navSpacer} />
          </View>
        </View>

        <ScrollView
          alwaysBounceVertical
          contentContainerStyle={[
            styles.content,
            { paddingBottom: Math.max(insets.bottom, homeTheme.spacing.xl) + homeTheme.spacing.md },
          ]}
          refreshControl={refreshControl}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.ticketWrap}>
            <View style={styles.ticketShadow} />

            <View style={styles.ticketTop}>
              <Text style={styles.ticketDate}>08 апреля 2026</Text>
              <View style={styles.ticketTitleRow}>
                <Text style={styles.ticketTitle}>Основной счёт</Text>
                <Text style={styles.ticketNumber}>{userId ? `ID ${userId}` : 'ID 492631'}</Text>
              </View>
            </View>

            <View style={styles.ticketDivider}>
              <View style={styles.ticketDividerLine} />
            </View>

            <View style={styles.ticketBottom}>
              {HISTORY_SUMMARY_ROWS.map((row, index) => {
                const value = row.id === 'balance' ? balanceAmount : row.value;

                return (
                  <View
                    key={row.id}
                    style={[styles.ticketMetricRow, index > 0 && styles.ticketMetricRowGap]}
                  >
                    <Text style={styles.ticketMetricLabel}>{row.label}</Text>
                    <Text style={styles.ticketMetricValue}>{value}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {HISTORY_SECTIONS.map((section) => (
            <View key={section.id} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>

              <View style={styles.historyCard}>
                {section.items.map((item, index) => (
                  <Pressable
                    key={item.id}
                    onPress={() => {
                      void impactHaptic();
                      onOpenItem(item.description);
                    }}
                    style={({ pressed }) => [styles.historyRow, pressed && styles.pressed]}
                  >
                    <Text style={styles.historyTime}>{item.time}</Text>

                    <View style={styles.historyIconWrap}>
                      <HomeUiIcon
                        color={getAmountColor(item.tone)}
                        icon={{ kind: 'brand', name: item.iconName, size: 16 }}
                        size={16}
                      />
                    </View>

                    <Text numberOfLines={2} style={styles.historyDescription}>
                      {item.description}
                    </Text>

                    <Text
                      numberOfLines={1}
                      style={[styles.historyAmount, { color: getAmountColor(item.tone) }]}
                    >
                      {item.amount}
                    </Text>

                    {index < section.items.length - 1 ? <View style={styles.rowSeparator} /> : null}
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
    backgroundColor: historyPalette.background,
    flex: 1,
  },
  header: {
    backgroundColor: historyPalette.background,
    paddingHorizontal: homeTheme.spacing.md,
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
    color: historyPalette.secondary,
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 24,
    textAlign: 'center',
  },
  navSpacer: {
    width: 40,
  },
  content: {
    paddingHorizontal: homeTheme.spacing.sm,
    paddingTop: homeTheme.spacing.sm,
  },
  ticketWrap: {
    marginBottom: homeTheme.spacing.lg,
    position: 'relative',
  },
  ticketShadow: {
    backgroundColor: historyPalette.ticketShadow,
    borderRadius: 18,
    bottom: -3,
    left: homeTheme.spacing.sm,
    opacity: 0.52,
    position: 'absolute',
    right: homeTheme.spacing.sm,
    top: 72,
  },
  ticketTop: {
    backgroundColor: historyPalette.cardSurface,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingBottom: 10,
    paddingHorizontal: homeTheme.spacing.lg,
    paddingTop: homeTheme.spacing.lg,
  },
  ticketDate: {
    color: historyPalette.secondary,
    fontSize: 12,
    lineHeight: 16,
  },
  ticketTitleRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    marginTop: 4,
  },
  ticketTitle: {
    color: historyPalette.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 24,
  },
  ticketNumber: {
    color: historyPalette.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 16,
    marginBottom: 2,
    marginLeft: 8,
  },
  ticketDivider: {
    alignItems: 'center',
    backgroundColor: historyPalette.cardSurface,
    paddingVertical: 4,
  },
  ticketDividerLine: {
    borderStyle: 'dashed',
    borderTopColor: historyPalette.divider,
    borderTopWidth: 1,
    width: '100%',
  },
  ticketBottom: {
    backgroundColor: historyPalette.cardSurface,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    paddingBottom: homeTheme.spacing.lg,
    paddingHorizontal: homeTheme.spacing.lg,
    paddingTop: 14,
  },
  ticketMetricRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ticketMetricRowGap: {
    marginTop: 10,
  },
  ticketMetricLabel: {
    color: historyPalette.secondary,
    fontSize: 13,
    lineHeight: 16,
  },
  ticketMetricValue: {
    color: historyPalette.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 16,
  },
  section: {
    marginTop: homeTheme.spacing.sm,
  },
  sectionTitle: {
    color: historyPalette.secondary,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 16,
    marginBottom: 8,
    marginLeft: 4,
  },
  historyCard: {
    backgroundColor: historyPalette.cardSurface,
    borderRadius: 18,
    overflow: 'hidden',
  },
  historyRow: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 52,
    paddingHorizontal: 12,
    position: 'relative',
  },
  historyTime: {
    color: historyPalette.secondary,
    fontSize: 12,
    lineHeight: 16,
    width: 42,
  },
  historyIconWrap: {
    alignItems: 'center',
    height: 16,
    justifyContent: 'center',
    marginLeft: 8,
    width: 16,
  },
  historyDescription: {
    color: historyPalette.textPrimary,
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    marginHorizontal: 8,
  },
  historyAmount: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    marginLeft: 8,
    maxWidth: '40%',
    textAlign: 'right',
  },
  rowSeparator: {
    backgroundColor: historyPalette.divider,
    bottom: 0,
    left: 86,
    opacity: 0.55,
    position: 'absolute',
    right: 12,
    height: StyleSheet.hairlineWidth,
  },
  pressed: {
    opacity: 0.84,
  },
});
