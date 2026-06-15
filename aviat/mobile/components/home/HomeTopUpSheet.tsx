import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ImpactFeedbackStyle } from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { impactHaptic, selectionHaptic } from '../../src/lib/haptics';
import { homeTheme, type HomeBrandGlyphName } from '../../theme/homeTheme';
import { HomeUiIcon } from './HomeUiIcon';
import { HomeSideModal } from './HomeSideModal';
import { usePullToRefresh } from '../shared/usePullToRefresh';

type HomeTopUpSheetProps = {
  balanceAmount: string;
  balanceCurrency: string;
  balanceMeta: string;
  onClose: () => void;
  onSubmit: (payload: { amount: number; methodTitle: string }) => void;
  visible: boolean;
};

const balanceManagementPalette = {
  actionPayInBackground: '#305358',
  actionPayOutBackground: '#375272',
  background: '#223040',
  backgroundContent: '#2A3E54',
  commerce: '#4AB868',
  primary: '#589ADA',
  secondary: '#8D97A3',
  separator: '#3E576F',
  textPrimary: '#EDF2F8',
  white: '#FFFFFF',
  white40: '#66FFFFFF',
} as const;

type TransactionTone = 'cancel' | 'credit' | 'debit' | 'pending';

type TransactionHistoryItem = {
  amount: string;
  description: string;
  iconName: HomeBrandGlyphName;
  id: string;
  time: string;
  tone: TransactionTone;
};

type TransactionHistorySection = {
  id: string;
  items: TransactionHistoryItem[];
  title: string;
};

const HISTORY_SECTIONS: TransactionHistorySection[] = [
  {
    id: 'today',
    items: [
      {
        amount: '+ 5 000 RUB',
        description: 'Пополнение счёта',
        iconName: 'plus-small',
        id: 'today-1',
        time: '15:42',
        tone: 'credit',
      },
      {
        amount: '- 1 250 RUB',
        description: 'Вывод средств',
        iconName: 'minus-small',
        id: 'today-2',
        time: '13:18',
        tone: 'debit',
      },
      {
        amount: 'В обработке',
        description: 'Запрос на пополнение',
        iconName: 'waiting',
        id: 'today-3',
        time: '11:04',
        tone: 'pending',
      },
    ],
    title: 'Сегодня',
  },
  {
    id: 'yesterday',
    items: [
      {
        amount: '+ 900 RUB',
        description: 'Возврат на счёт',
        iconName: 'plus-small',
        id: 'yesterday-1',
        time: '21:09',
        tone: 'credit',
      },
      {
        amount: 'Отклонено',
        description: 'Отмена операции',
        iconName: 'cancel-small',
        id: 'yesterday-2',
        time: '18:27',
        tone: 'cancel',
      },
    ],
    title: 'Вчера',
  },
];

function getMoneyColor(tone: TransactionTone) {
  if (tone === 'credit') {
    return balanceManagementPalette.commerce;
  }

  if (tone === 'debit') {
    return balanceManagementPalette.primary;
  }

  if (tone === 'cancel') {
    return balanceManagementPalette.secondary;
  }

  return balanceManagementPalette.secondary;
}

function getIconColor(tone: TransactionTone) {
  if (tone === 'credit') {
    return balanceManagementPalette.commerce;
  }

  if (tone === 'debit') {
    return balanceManagementPalette.primary;
  }

  return balanceManagementPalette.secondary;
}

export function HomeTopUpSheet({
  balanceAmount,
  balanceCurrency,
  balanceMeta,
  onClose,
  onSubmit,
  visible,
}: HomeTopUpSheetProps) {
  const insets = useSafeAreaInsets();
  const { refreshControl } = usePullToRefresh();

  const handleClose = () => {
    void selectionHaptic();
    onClose();
  };

  const handleActionPress = (methodTitle: string) => {
    void impactHaptic(ImpactFeedbackStyle.Medium);
    onSubmit({ amount: 0, methodTitle });
  };

  return (
    <HomeSideModal onRequestClose={handleClose} visible={visible}>
      <View style={styles.screen}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <View style={styles.navBar}>
            <Pressable
              hitSlop={10}
              onPress={handleClose}
              style={({ pressed }) => [styles.navIconButton, pressed && styles.pressed]}
            >
              <HomeUiIcon
                color={balanceManagementPalette.secondary}
                icon={{ kind: 'brand', name: 'arrow-left', size: 24 }}
                size={24}
              />
            </Pressable>

            <Text numberOfLines={1} style={styles.navTitle}>
              Управление счётом
            </Text>

            <View style={styles.navSpacer} />
          </View>

          <View style={styles.headerSeparator} />

          <View style={styles.heroContent}>
            <View style={styles.balanceCard}>
              <Text numberOfLines={1} style={styles.balanceLabel}>
                {homeTheme.strings.balanceLabel}
              </Text>
              <Text numberOfLines={1} style={styles.balanceAmount}>
                {balanceAmount}
              </Text>
              <Text numberOfLines={1} style={styles.balanceMeta}>
                {balanceMeta}
              </Text>

              <Pressable
                onPress={() => {
                  void selectionHaptic();
                }}
                style={({ pressed }) => [styles.balanceButton, pressed && styles.pressed]}
              >
                <Text style={styles.balanceButtonText}>Все счета</Text>
                <HomeUiIcon
                  color={balanceManagementPalette.primary}
                  icon={{ kind: 'brand', name: 'chevron-right-small', size: 20 }}
                  size={20}
                />
              </Pressable>
            </View>

            <View style={styles.actionRow}>
              <Pressable
                onPress={() => handleActionPress('Пополнить')}
                style={({ pressed }) => [
                  styles.transactionButton,
                  styles.transactionButtonCommerce,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.transactionButtonIconCircle}>
                  <HomeUiIcon
                    color={balanceManagementPalette.commerce}
                    icon={{ kind: 'brand', name: 'replenish', size: 20 }}
                    size={20}
                  />
                </View>
                <Text style={[styles.transactionButtonText, styles.transactionButtonTextCommerce]}>
                  Пополнить
                </Text>
              </Pressable>

              <Pressable
                onPress={() => handleActionPress('Вывести')}
                style={({ pressed }) => [
                  styles.transactionButton,
                  styles.transactionButtonSecondary,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.transactionButtonIconCircle}>
                  <HomeUiIcon
                    color={balanceManagementPalette.primary}
                    icon={{ kind: 'brand', name: 'minus-small', size: 20 }}
                    size={20}
                  />
                </View>
                <Text style={styles.transactionButtonText}>Вывести</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.contentPanel}>
          <ScrollView
            alwaysBounceVertical
            contentContainerStyle={[
              styles.contentScroll,
              { paddingBottom: Math.max(insets.bottom, homeTheme.spacing.lg) + homeTheme.spacing.sm },
            ]}
            refreshControl={refreshControl}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.sectionTitle}>История операций</Text>

            {HISTORY_SECTIONS.map((section) => (
              <View key={section.id} style={styles.sectionBlock}>
                <Text style={styles.sectionHeader}>{section.title}</Text>

                <View style={styles.sectionSurface}>
                  {section.items.map((item, index) => (
                    <View key={item.id}>
                      <Pressable
                        onPress={() => {
                          void selectionHaptic();
                        }}
                        style={({ pressed }) => [
                          styles.historyRow,
                          pressed && styles.pressed,
                        ]}
                      >
                        <Text style={styles.historyTime}>{item.time}</Text>

                        <View style={styles.historyStatusIcon}>
                          <HomeUiIcon
                            color={getIconColor(item.tone)}
                            icon={{ kind: 'brand', name: item.iconName, size: 16 }}
                            size={16}
                          />
                        </View>

                        <Text numberOfLines={2} style={styles.historyDescription}>
                          {item.description}
                        </Text>

                        <Text
                          numberOfLines={1}
                          style={[styles.historyAmount, { color: getMoneyColor(item.tone) }]}
                        >
                          {item.amount.replace('RUB', balanceCurrency)}
                        </Text>
                      </Pressable>

                      {index < section.items.length - 1 ? (
                        <View style={styles.historySeparator} />
                      ) : null}
                    </View>
                  ))}
                </View>
              </View>
            ))}

            <Pressable
              onPress={() => {
                void selectionHaptic();
              }}
              style={({ pressed }) => [styles.historyFooterButton, pressed && styles.pressed]}
            >
              <Text style={styles.historyFooterButtonText}>Смотреть всю историю</Text>
              <HomeUiIcon
                color={balanceManagementPalette.primary}
                icon={{ kind: 'brand', name: 'chevron-right-small', size: 18 }}
                size={18}
              />
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </HomeSideModal>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: balanceManagementPalette.backgroundContent,
    flex: 1,
  },
  header: {
    backgroundColor: balanceManagementPalette.backgroundContent,
  },
  navBar: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 56,
    paddingHorizontal: homeTheme.spacing.xs,
  },
  navIconButton: {
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  navTitle: {
    color: balanceManagementPalette.textPrimary,
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 22,
    textAlign: 'center',
  },
  navSpacer: {
    width: 48,
  },
  headerSeparator: {
    backgroundColor: balanceManagementPalette.separator,
    height: StyleSheet.hairlineWidth,
  },
  heroContent: {
    paddingBottom: homeTheme.spacing.md,
    paddingHorizontal: homeTheme.spacing.lg,
    paddingTop: homeTheme.spacing.lg,
  },
  balanceCard: {
    backgroundColor: balanceManagementPalette.background,
    borderRadius: homeTheme.radii.md,
    paddingHorizontal: homeTheme.spacing.lg,
    paddingVertical: homeTheme.spacing.lg,
  },
  balanceLabel: {
    color: balanceManagementPalette.secondary,
    fontSize: 13,
    lineHeight: 16,
  },
  balanceAmount: {
    color: balanceManagementPalette.textPrimary,
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 36,
    marginTop: 4,
  },
  balanceMeta: {
    color: balanceManagementPalette.secondary,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
  balanceButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 2,
    marginTop: homeTheme.spacing.md,
  },
  balanceButtonText: {
    color: balanceManagementPalette.primary,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    gap: homeTheme.spacing.sm,
    marginTop: homeTheme.spacing.sm,
  },
  transactionButton: {
    alignItems: 'center',
    borderRadius: homeTheme.radii.md,
    flex: 1,
    flexDirection: 'row',
    minHeight: 52,
    paddingHorizontal: homeTheme.spacing.md,
  },
  transactionButtonCommerce: {
    backgroundColor: balanceManagementPalette.actionPayInBackground,
  },
  transactionButtonSecondary: {
    backgroundColor: balanceManagementPalette.actionPayOutBackground,
  },
  transactionButtonIconCircle: {
    alignItems: 'center',
    backgroundColor: balanceManagementPalette.white,
    borderRadius: homeTheme.radii.full,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  transactionButtonText: {
    color: balanceManagementPalette.primary,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
    marginLeft: homeTheme.spacing.sm,
  },
  transactionButtonTextCommerce: {
    color: balanceManagementPalette.commerce,
  },
  contentPanel: {
    backgroundColor: balanceManagementPalette.background,
    borderTopLeftRadius: homeTheme.radii.xl,
    borderTopRightRadius: homeTheme.radii.xl,
    flex: 1,
    overflow: 'hidden',
  },
  contentScroll: {
    paddingTop: homeTheme.spacing.sm,
  },
  sectionTitle: {
    color: balanceManagementPalette.textPrimary,
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: homeTheme.spacing.sm,
    marginHorizontal: homeTheme.spacing.sm,
    marginTop: homeTheme.spacing.xs,
  },
  sectionBlock: {
    marginBottom: homeTheme.spacing.sm,
  },
  sectionHeader: {
    color: balanceManagementPalette.secondary,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    paddingHorizontal: homeTheme.spacing.lg,
    paddingVertical: homeTheme.spacing.sm,
  },
  sectionSurface: {
    backgroundColor: balanceManagementPalette.backgroundContent,
  },
  historyRow: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 48,
    paddingHorizontal: homeTheme.spacing.md,
    paddingVertical: homeTheme.spacing.sm,
  },
  historyTime: {
    color: balanceManagementPalette.secondary,
    fontSize: 12,
    lineHeight: 16,
    width: 42,
  },
  historyStatusIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: homeTheme.spacing.sm,
    width: 16,
  },
  historyDescription: {
    color: balanceManagementPalette.textPrimary,
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    marginLeft: homeTheme.spacing.sm,
    marginRight: homeTheme.spacing.sm,
  },
  historyAmount: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    maxWidth: '40%',
    textAlign: 'right',
  },
  historySeparator: {
    backgroundColor: balanceManagementPalette.separator,
    height: StyleSheet.hairlineWidth,
    marginLeft: 78,
  },
  historyFooterButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 2,
    marginLeft: homeTheme.spacing.lg,
    marginTop: homeTheme.spacing.xs,
    paddingVertical: homeTheme.spacing.sm,
  },
  historyFooterButtonText: {
    color: balanceManagementPalette.primary,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  pressed: {
    opacity: 0.84,
  },
});
