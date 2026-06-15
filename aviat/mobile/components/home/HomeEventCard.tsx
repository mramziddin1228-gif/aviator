import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';

import { homeTheme, type HomeEvent } from '../../theme/homeTheme';

type HomeEventCardProps = {
  event: HomeEvent;
  onOpen?: (event: HomeEvent) => void;
  onSelectOdd?: (event: HomeEvent, odd: HomeEvent['odds'][number]) => void;
  selectedOddLabel?: string | null;
};

function TeamLogoPlaceholder() {
  return (
    <Svg height={24} viewBox="0 0 24 24" width={24}>
      <Path
        d="M12 1C5.9 1 1 5.9 1 12c0 6.1 4.9 11 11 11 6.1 0 11-4.9 11-11C23 5.9 18.1 1 12 1Zm0 3.5c1.9 0 3.5 1.8 3.5 4S13.9 12.5 12 12.5 8.5 10.7 8.5 8.5 10.1 4.5 12 4.5Zm0 15.8c-3.3 0-6.6-1.7-7-4.4.2-.9.8-1.6 2-2.3.5-.3 1.1-.5 1.7-.7.9.8 2.1 1.3 3.4 1.3 1.3 0 2.5-.5 3.4-1.3.6.2 1.2.4 1.7.7 1.1.7 1.8 1.5 2 2.3-.5 2.7-3.8 4.4-7 4.4h-.2Z"
        fill="#998C94A4"
      />
    </Svg>
  );
}

export function HomeEventCard({
  event,
  onOpen,
  onSelectOdd,
  selectedOddLabel,
}: HomeEventCardProps) {
  const scoreText = event.live
    ? `${event.teams[0]?.score ?? '0'}:${event.teams[1]?.score ?? '0'}`
    : 'VS';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <MaterialCommunityIcons color={homeTheme.colors.secondary} name={event.sportIcon} size={16} />
        <Text numberOfLines={2} style={styles.headerTitle}>
          {event.league}
        </Text>
      </View>

      <View style={styles.middle}>
        <Text numberOfLines={3} style={[styles.teamName, styles.teamNameLeft]}>
          {event.teams[0]?.name ?? ''}
        </Text>

        <View style={styles.teamLogoWrap}>
          <TeamLogoPlaceholder />
        </View>

        <Text style={styles.score}>{scoreText}</Text>

        <View style={styles.teamLogoWrap}>
          <TeamLogoPlaceholder />
        </View>

        <Text numberOfLines={3} style={[styles.teamName, styles.teamNameRight]}>
          {event.teams[1]?.name ?? ''}
        </Text>
      </View>

      <View style={styles.info}>
        {event.status ? (
          <Text numberOfLines={1} style={styles.infoStatus}>
            {event.status}
          </Text>
        ) : null}
        <Text numberOfLines={2} style={styles.infoText}>
          {event.detail}
        </Text>
      </View>

      <View style={styles.oddsRow}>
        {event.odds.map((odd) => (
          <Pressable
            key={odd.label}
            onPress={() => onSelectOdd?.(event, odd)}
            style={({ pressed }) => [
              styles.oddButton,
              selectedOddLabel === odd.label && styles.oddButtonActive,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.oddLabel}>{odd.label}</Text>
            <Text
              style={[
                styles.oddValue,
                selectedOddLabel === odd.label && styles.oddValueActive,
              ]}
            >
              {odd.value}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        onPress={() => onOpen?.(event)}
        style={({ pressed }) => [styles.footerRow, pressed && styles.pressed]}
      >
        <Text style={styles.footerText}>{event.marketsLabel}</Text>
        <MaterialCommunityIcons
          color={homeTheme.colors.secondary}
          name="chevron-right"
          size={18}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: homeTheme.colors.sectionSurface,
    borderRadius: 16,
    minHeight: 198,
    overflow: 'hidden',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 38,
    paddingHorizontal: 8,
  },
  headerTitle: {
    color: homeTheme.colors.secondary,
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    marginLeft: 8,
  },
  middle: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 52,
    paddingHorizontal: 8,
  },
  teamName: {
    color: homeTheme.colors.primaryForeground,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 16,
    flex: 1,
    maxWidth: 96,
  },
  teamNameLeft: {
    marginRight: 8,
    textAlign: 'right',
  },
  teamNameRight: {
    marginLeft: 8,
    textAlign: 'left',
  },
  teamLogoWrap: {
    alignItems: 'center',
    borderRadius: 8,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  score: {
    color: homeTheme.colors.primaryForeground,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 24,
    marginHorizontal: 8,
    minWidth: 64,
    textAlign: 'center',
  },
  info: {
    alignItems: 'center',
    minHeight: 26,
    paddingHorizontal: 8,
    paddingTop: 2,
    paddingBottom: 6,
  },
  infoStatus: {
    color: homeTheme.colors.secondary,
    fontSize: 11,
    lineHeight: 14,
  },
  infoText: {
    color: homeTheme.colors.secondary,
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
  oddsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 8,
  },
  oddButton: {
    backgroundColor: homeTheme.colors.oddsBackground,
    borderColor: 'transparent',
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  oddButtonActive: {
    backgroundColor: homeTheme.colors.primary20,
    borderColor: homeTheme.colors.primary,
  },
  oddLabel: {
    color: homeTheme.colors.secondary,
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 14,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  oddValue: {
    color: homeTheme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
    marginTop: 2,
    textAlign: 'center',
  },
  oddValueActive: {
    color: homeTheme.colors.primaryForeground,
  },
  footerRow: {
    alignItems: 'center',
    borderTopColor: homeTheme.colors.separator30,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 30,
    marginTop: 6,
    paddingHorizontal: 12,
  },
  footerText: {
    color: homeTheme.colors.secondary,
    fontSize: 12,
    lineHeight: 16,
  },
  pressed: {
    opacity: 0.84,
  },
});
