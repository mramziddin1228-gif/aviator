import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { homeTheme } from '../../theme/homeTheme';
import { HomeBrandIcon } from './HomeBrandIcon';
import { usePullToRefresh } from '../shared/usePullToRefresh';

export type HomeCouponActionId =
  | 'deposit'
  | 'express'
  | 'generate'
  | 'search'
  | 'upload';

export type HomeCouponBetItem = {
  detail: string;
  eventId: string;
  league: string;
  oddLabel: string;
  oddValue: string;
  stake: number;
  title: string;
};

type HomeCouponPageProps = {
  bets: HomeCouponBetItem[];
  isAuthorized: boolean;
  onLogin: () => void;
  onOpenAction: (action: HomeCouponActionId) => void;
  onOpenBet: (bet: HomeCouponBetItem) => void;
  onRegister: () => void;
  onSubmitCoupon: () => void;
};

const COUPON_ACTIONS: Array<{
  action: HomeCouponActionId;
  icon: Parameters<typeof HomeBrandIcon>[0]['name'];
  id: string;
  subtitle: string;
  title: string;
}> = [
  {
    action: 'deposit',
    icon: 'plus-small',
    id: 'refill',
    subtitle: 'Быстрое пополнение активного счёта',
    title: 'Пополнить счёт',
  },
  {
    action: 'search',
    icon: 'search-new',
    id: 'search',
    subtitle: 'Найдите нужные события и добавьте их в купон',
    title: 'Поиск событий',
  },
  {
    action: 'express',
    icon: 'express',
    id: 'day-express',
    subtitle: 'Готовые подборки событий на сегодня',
    title: 'Day Express',
  },
  {
    action: 'generate',
    icon: 'filter-line',
    id: 'generate',
    subtitle: 'Соберите ставку по нужным параметрам',
    title: 'Сгенерировать купон',
  },
  {
    action: 'upload',
    icon: 'upload',
    id: 'upload',
    subtitle: 'Загрузить сохранённый купон или QR',
    title: 'Загрузить купон',
  },
];

export function HomeCouponPage({
  bets,
  isAuthorized,
  onLogin,
  onOpenAction,
  onOpenBet,
  onRegister,
  onSubmitCoupon,
}: HomeCouponPageProps) {
  const insets = useSafeAreaInsets();
  const { refreshControl } = usePullToRefresh();
  const totalStake = bets.reduce((sum, bet) => sum + bet.stake, 0);
  const totalCoefficient = bets.reduce((sum, bet) => {
    const value = Number.parseFloat(bet.oddValue);
    return Number.isFinite(value) ? sum * value : sum;
  }, 1);
  const possibleWin = totalStake * totalCoefficient;

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
        <View style={styles.headerSurface}>
          <View style={styles.navBar}>
            <View style={styles.navSpacer} />
            <Text numberOfLines={1} style={styles.navTitle}>
              Купон
            </Text>
            <View style={styles.navSpacer} />
          </View>

          {!isAuthorized ? (
            <View style={styles.authButtonsRow}>
              <Pressable
                onPress={onLogin}
                style={({ pressed }) => [styles.authButtonSecondary, pressed && styles.pressed]}
              >
                <Text style={styles.authButtonSecondaryText}>Войти</Text>
              </Pressable>
              <Pressable
                onPress={onRegister}
                style={({ pressed }) => [styles.authButtonPrimary, pressed && styles.pressed]}
              >
                <Text style={styles.authButtonPrimaryText}>Регистрация</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </SafeAreaView>

      <ScrollView
        alwaysBounceVertical
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom:
              bets.length > 0
                ? insets.bottom + homeTheme.sizes.bottomBar + 160
                : insets.bottom + homeTheme.sizes.bottomBar + homeTheme.spacing.xl,
          },
        ]}
        refreshControl={refreshControl}
        showsVerticalScrollIndicator={false}
      >
        {bets.length ? (
          <>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <SummaryMetric label="Событий" value={String(bets.length)} />
                <SummaryMetric
                  label="Коэф"
                  value={totalCoefficient.toFixed(2)}
                />
              </View>
              <View style={styles.summaryRow}>
                <SummaryMetric
                  label="Сумма"
                  value={`${formatRub(totalStake)} ₽`}
                />
                <SummaryMetric
                  label="Выигрыш"
                  value={`${formatRub(possibleWin)} ₽`}
                />
              </View>
            </View>

            <View style={styles.betsStack}>
              {bets.map((bet) => (
                <Pressable
                  key={bet.eventId}
                  onPress={() => onOpenBet(bet)}
                  style={({ pressed }) => [styles.betCard, pressed && styles.pressed]}
                >
                  <View style={styles.betTopRow}>
                    <Text numberOfLines={1} style={styles.betLeague}>
                      {bet.league}
                    </Text>
                    <Text numberOfLines={1} style={styles.betDetail}>
                      {bet.detail}
                    </Text>
                  </View>

                  <Text numberOfLines={2} style={styles.betTitle}>
                    {bet.title}
                  </Text>

                  <View style={styles.betBottomRow}>
                    <View style={styles.oddChip}>
                      <Text style={styles.oddLabel}>{bet.oddLabel}</Text>
                      <Text style={styles.oddValue}>{bet.oddValue}</Text>
                    </View>

                    <View style={styles.stakePill}>
                      <Text style={styles.stakePillText}>{formatRub(bet.stake)} ₽</Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          </>
        ) : (
          <>
            <Text style={styles.emptyTitle}>Купон пуст</Text>
            <Text style={styles.emptySubtitle}>
              Добавьте исходы на главной странице или воспользуйтесь готовыми действиями ниже
            </Text>

            <View style={styles.actionStack}>
              {COUPON_ACTIONS.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => onOpenAction(item.action)}
                  style={({ pressed }) => [styles.actionCell, pressed && styles.pressed]}
                >
                  <View style={styles.actionIconWrap}>
                    <HomeBrandIcon
                      color={homeTheme.colors.primaryForeground}
                      name={item.icon}
                      size={18}
                    />
                  </View>

                  <View style={styles.actionCopy}>
                    <Text style={styles.actionTitle}>{item.title}</Text>
                    <Text style={styles.actionSubtitle}>{item.subtitle}</Text>
                  </View>

                  <HomeBrandIcon
                    color={homeTheme.colors.secondary}
                    name="chevron-right-small"
                    size={20}
                  />
                </Pressable>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {bets.length ? (
        <View style={[styles.footerWrap, { bottom: insets.bottom + homeTheme.sizes.bottomBar + 8 }]}>
          <View style={styles.footerCard}>
            <View style={styles.footerMeta}>
              <Text style={styles.footerLabel}>Сделать ставку</Text>
              <Text style={styles.footerValue}>
                {bets.length} • {totalCoefficient.toFixed(2)}
              </Text>
            </View>

            <Pressable
              onPress={onSubmitCoupon}
              style={({ pressed }) => [styles.makeBetButton, pressed && styles.pressed]}
            >
              <Text style={styles.makeBetButtonText}>Сделать ставку</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}

type SummaryMetricProps = {
  label: string;
  value: string;
};

function SummaryMetric({ label, value }: SummaryMetricProps) {
  return (
    <View style={styles.summaryMetric}>
      <Text style={styles.summaryMetricLabel}>{label}</Text>
      <Text style={styles.summaryMetricValue}>{value}</Text>
    </View>
  );
}

function formatRub(value: number) {
  return new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: homeTheme.colors.background,
    flex: 1,
  },
  safeArea: {
    backgroundColor: homeTheme.colors.headerSurface,
  },
  headerSurface: {
    backgroundColor: homeTheme.colors.headerSurface,
    borderBottomColor: homeTheme.colors.separator,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: homeTheme.spacing.sm,
    paddingHorizontal: homeTheme.spacing.md,
  },
  navBar: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 56,
  },
  navSpacer: {
    width: 40,
  },
  navTitle: {
    color: homeTheme.colors.secondary,
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 24,
    textAlign: 'center',
  },
  authButtonsRow: {
    flexDirection: 'row',
    gap: homeTheme.spacing.sm,
    paddingBottom: homeTheme.spacing.xs,
  },
  authButtonSecondary: {
    alignItems: 'center',
    backgroundColor: homeTheme.colors.sectionSurface,
    borderRadius: 14,
    flex: 1,
    justifyContent: 'center',
    minHeight: 42,
  },
  authButtonPrimary: {
    alignItems: 'center',
    backgroundColor: homeTheme.colors.primary,
    borderRadius: 14,
    flex: 1,
    justifyContent: 'center',
    minHeight: 42,
  },
  authButtonSecondaryText: {
    color: homeTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  authButtonPrimaryText: {
    color: homeTheme.colors.primaryForeground,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  content: {
    paddingHorizontal: homeTheme.spacing.md,
    paddingTop: homeTheme.spacing.lg,
  },
  emptyTitle: {
    color: homeTheme.colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 22,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: homeTheme.colors.secondary,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
    textAlign: 'center',
  },
  actionStack: {
    gap: homeTheme.spacing.sm,
    marginTop: homeTheme.spacing.lg,
  },
  actionCell: {
    alignItems: 'center',
    backgroundColor: homeTheme.colors.sectionSurface,
    borderRadius: 18,
    flexDirection: 'row',
    minHeight: 72,
    paddingHorizontal: homeTheme.spacing.md,
  },
  actionIconWrap: {
    alignItems: 'center',
    backgroundColor: homeTheme.colors.background,
    borderRadius: 18,
    height: 40,
    justifyContent: 'center',
    marginRight: homeTheme.spacing.sm,
    width: 40,
  },
  actionCopy: {
    flex: 1,
    paddingVertical: 14,
  },
  actionTitle: {
    color: homeTheme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 18,
  },
  actionSubtitle: {
    color: homeTheme.colors.secondary,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
  summaryCard: {
    backgroundColor: homeTheme.colors.sectionSurface,
    borderRadius: 18,
    gap: homeTheme.spacing.sm,
    padding: homeTheme.spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: homeTheme.spacing.sm,
  },
  summaryMetric: {
    backgroundColor: homeTheme.colors.background,
    borderRadius: 14,
    flex: 1,
    minHeight: 64,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  summaryMetricLabel: {
    color: homeTheme.colors.secondary,
    fontSize: 12,
    lineHeight: 16,
  },
  summaryMetricValue: {
    color: homeTheme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 20,
    marginTop: 6,
  },
  betsStack: {
    gap: homeTheme.spacing.sm,
    marginTop: homeTheme.spacing.md,
  },
  betCard: {
    backgroundColor: homeTheme.colors.sectionSurface,
    borderRadius: 18,
    padding: homeTheme.spacing.md,
  },
  betTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  betLeague: {
    color: homeTheme.colors.primary,
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  betDetail: {
    color: homeTheme.colors.secondary,
    fontSize: 11,
    lineHeight: 14,
    marginLeft: homeTheme.spacing.sm,
  },
  betTitle: {
    color: homeTheme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    marginTop: 10,
  },
  betBottomRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  oddChip: {
    backgroundColor: homeTheme.colors.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  oddLabel: {
    color: homeTheme.colors.secondary,
    fontSize: 11,
    lineHeight: 14,
  },
  oddValue: {
    color: homeTheme.colors.primaryForeground,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
    marginTop: 2,
  },
  stakePill: {
    backgroundColor: homeTheme.colors.primary20,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  stakePillText: {
    color: homeTheme.colors.primary,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 16,
  },
  footerWrap: {
    left: homeTheme.spacing.md,
    position: 'absolute',
    right: homeTheme.spacing.md,
  },
  footerCard: {
    alignItems: 'center',
    backgroundColor: homeTheme.colors.headerSurface,
    borderRadius: 20,
    flexDirection: 'row',
    padding: 12,
  },
  footerMeta: {
    flex: 1,
    marginRight: homeTheme.spacing.sm,
    paddingHorizontal: 4,
  },
  footerLabel: {
    color: homeTheme.colors.secondary,
    fontSize: 12,
    lineHeight: 16,
  },
  footerValue: {
    color: homeTheme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 20,
    marginTop: 2,
  },
  makeBetButton: {
    alignItems: 'center',
    backgroundColor: homeTheme.colors.primary,
    borderRadius: 16,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 18,
  },
  makeBetButtonText: {
    color: homeTheme.colors.primaryForeground,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  pressed: {
    opacity: 0.84,
  },
});
