import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ImpactFeedbackStyle } from 'expo-haptics';

import { BottomSheetScrollView, NativeBottomSheet } from '../auth/NativeBottomSheet';
import { impactHaptic, selectionHaptic } from '../../src/lib/haptics';
import { homeQuickBetAmounts, homeTheme, type HomeEvent } from '../../theme/homeTheme';
import { usePullToRefresh } from '../shared/usePullToRefresh';

type HomeBetSheetProps = {
  event: HomeEvent | null;
  initialOddLabel?: string | null;
  onClose: () => void;
  onConfirm: (payload: {
    event: HomeEvent;
    oddLabel: string;
    oddValue: string;
    stake: number;
  }) => void;
  visible: boolean;
};

function formatTeams(event: HomeEvent) {
  return event.teams.map((team) => team.name).join(' - ');
}

export function HomeBetSheet({
  event,
  initialOddLabel = null,
  onClose,
  onConfirm,
  visible,
}: HomeBetSheetProps) {
  const [selectedOddLabel, setSelectedOddLabel] = useState<string | null>(initialOddLabel);
  const [selectedStake, setSelectedStake] = useState<number>(homeQuickBetAmounts[1] ?? 250);
  const { refreshControl } = usePullToRefresh();

  useEffect(() => {
    setSelectedOddLabel(initialOddLabel);
    setSelectedStake(homeQuickBetAmounts[1] ?? 250);
  }, [event?.id, initialOddLabel, visible]);

  const selectedOdd = event?.odds.find((odd) => odd.label === selectedOddLabel) ?? null;
  const possibleWin =
    selectedOdd && selectedStake ? Number.parseFloat(selectedOdd.value) * selectedStake : 0;

  return (
    <NativeBottomSheet
      initialSnapIndex={1}
      onClose={onClose}
      snapPoints={[0.56, 0.72, 0.88]}
      title={event ? formatTeams(event) : 'Ставка'}
      visible={visible && Boolean(event)}
    >
      {event ? (
        <BottomSheetScrollView
          alwaysBounceVertical
          contentContainerStyle={styles.content}
          refreshControl={refreshControl}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <View style={styles.leagueWrap}>
                <MaterialCommunityIcons
                  color={event.live ? homeTheme.colors.live : homeTheme.colors.primary}
                  name={event.sportIcon}
                  size={16}
                />
                <Text numberOfLines={1} style={styles.league}>
                  {event.league}
                </Text>
              </View>

              <View style={[styles.statusPill, event.live && styles.statusPillLive]}>
                <Text style={[styles.statusText, event.live && styles.statusTextLive]}>
                  {event.status}
                </Text>
              </View>
            </View>

            {event.teams.map((team) => (
              <View key={team.name} style={styles.teamRow}>
                <View style={styles.teamCopy}>
                  <View
                    style={[
                      styles.teamAccent,
                      team.accent === 'commerce' && styles.teamAccentCommerce,
                    ]}
                  />
                  <Text numberOfLines={1} style={styles.teamName}>
                    {team.name}
                  </Text>
                </View>

                <Text style={styles.teamScore}>{team.score}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Исходы</Text>
            <View style={styles.oddsRow}>
              {event.odds.map((odd) => {
                const active = odd.label === selectedOddLabel;

                return (
                  <Pressable
                    key={odd.label}
                    onPress={() => {
                      void selectionHaptic();
                      setSelectedOddLabel(odd.label);
                    }}
                    style={({ pressed }) => [
                      styles.oddButton,
                      active && styles.oddButtonActive,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={[styles.oddLabel, active && styles.oddLabelActive]}>
                      {odd.label}
                    </Text>
                    <Text style={[styles.oddValue, active && styles.oddValueActive]}>
                      {odd.value}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Сумма ставки</Text>
            <View style={styles.stakeRow}>
              {homeQuickBetAmounts.map((stake) => {
                const active = stake === selectedStake;

                return (
                  <Pressable
                    key={stake}
                    onPress={() => {
                      void selectionHaptic();
                      setSelectedStake(stake);
                    }}
                    style={({ pressed }) => [
                      styles.stakeChip,
                      active && styles.stakeChipActive,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={[styles.stakeChipText, active && styles.stakeChipTextActive]}>
                      {stake} ₽
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Выбрано</Text>
              <Text style={styles.summaryValue}>
                {selectedOdd ? `${selectedOdd.label} • ${selectedOdd.value}` : 'Выберите исход'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Ставка</Text>
              <Text style={styles.summaryValue}>{selectedStake} ₽</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Потенциальный выигрыш</Text>
              <Text style={styles.summaryAccent}>{possibleWin.toFixed(2)} ₽</Text>
            </View>
          </View>

          <Pressable
            disabled={!selectedOdd}
            onPress={() => {
              if (!selectedOdd) {
                return;
              }

              void impactHaptic(ImpactFeedbackStyle.Medium);
              onConfirm({
                event,
                oddLabel: selectedOdd.label,
                oddValue: selectedOdd.value,
                stake: selectedStake,
              });
            }}
            style={({ pressed }) => [
              styles.confirmButton,
              !selectedOdd && styles.confirmButtonDisabled,
              pressed && selectedOdd && styles.pressed,
            ]}
          >
            <Text style={styles.confirmButtonText}>Добавить в купон</Text>
          </Pressable>
        </BottomSheetScrollView>
      ) : null}
    </NativeBottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: homeTheme.spacing.xl,
    paddingHorizontal: homeTheme.spacing.md,
  },
  heroCard: {
    backgroundColor: homeTheme.colors.background,
    borderRadius: homeTheme.radii.md,
    padding: homeTheme.spacing.md,
  },
  heroTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: homeTheme.spacing.md,
  },
  leagueWrap: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    marginRight: homeTheme.spacing.sm,
  },
  league: {
    color: homeTheme.colors.secondary,
    fontSize: 12,
    lineHeight: 16,
    marginLeft: homeTheme.spacing.xs,
  },
  statusPill: {
    backgroundColor: homeTheme.colors.backgroundGroup,
    borderRadius: 10,
    paddingHorizontal: homeTheme.spacing.sm,
    paddingVertical: 4,
  },
  statusPillLive: {
    backgroundColor: homeTheme.colors.liveMuted,
  },
  statusText: {
    color: homeTheme.colors.textPrimary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  statusTextLive: {
    color: homeTheme.colors.live,
  },
  teamRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: homeTheme.spacing.xs,
  },
  teamCopy: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    marginRight: homeTheme.spacing.md,
  },
  teamAccent: {
    backgroundColor: homeTheme.colors.primary,
    borderRadius: homeTheme.radii.full,
    height: 8,
    marginRight: homeTheme.spacing.sm,
    width: 8,
  },
  teamAccentCommerce: {
    backgroundColor: homeTheme.colors.commerce,
  },
  teamName: {
    color: homeTheme.colors.textPrimary,
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  teamScore: {
    color: homeTheme.colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
  },
  section: {
    marginTop: homeTheme.spacing.lg,
  },
  sectionTitle: {
    color: homeTheme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: homeTheme.spacing.sm,
  },
  oddsRow: {
    flexDirection: 'row',
    gap: homeTheme.spacing.sm,
  },
  oddButton: {
    backgroundColor: homeTheme.colors.oddsBackground,
    borderColor: 'transparent',
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    minHeight: 60,
    paddingHorizontal: homeTheme.spacing.sm,
    paddingVertical: homeTheme.spacing.sm,
  },
  oddButtonActive: {
    backgroundColor: homeTheme.colors.primary20,
    borderColor: homeTheme.colors.primary,
  },
  oddLabel: {
    color: homeTheme.colors.secondary,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
    textTransform: 'uppercase',
  },
  oddLabelActive: {
    color: homeTheme.colors.primaryForeground80,
  },
  oddValue: {
    color: homeTheme.colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
    marginTop: 6,
  },
  oddValueActive: {
    color: homeTheme.colors.primaryForeground,
  },
  stakeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: homeTheme.spacing.sm,
  },
  stakeChip: {
    backgroundColor: homeTheme.colors.background,
    borderRadius: homeTheme.radii.full,
    minWidth: 82,
    paddingHorizontal: homeTheme.spacing.md,
    paddingVertical: 10,
  },
  stakeChipActive: {
    backgroundColor: homeTheme.colors.commerce,
  },
  stakeChipText: {
    color: homeTheme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 16,
    textAlign: 'center',
  },
  stakeChipTextActive: {
    color: '#5f3816',
  },
  summaryCard: {
    backgroundColor: homeTheme.colors.background,
    borderRadius: homeTheme.radii.md,
    marginTop: homeTheme.spacing.lg,
    padding: homeTheme.spacing.md,
  },
  summaryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    color: homeTheme.colors.secondary,
    fontSize: 12,
    lineHeight: 16,
  },
  summaryValue: {
    color: homeTheme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  summaryAccent: {
    color: homeTheme.colors.commerce,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 22,
  },
  confirmButton: {
    alignItems: 'center',
    backgroundColor: homeTheme.colors.primary,
    borderRadius: homeTheme.radii.md,
    justifyContent: 'center',
    marginTop: homeTheme.spacing.lg,
    minHeight: 52,
  },
  confirmButtonDisabled: {
    backgroundColor: homeTheme.colors.secondaryButtonBackground,
  },
  confirmButtonText: {
    color: homeTheme.colors.primaryForeground,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 18,
  },
  pressed: {
    opacity: 0.84,
  },
});
