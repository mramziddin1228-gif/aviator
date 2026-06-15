import { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  type ImageSourcePropType,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { selectionHaptic } from '../../src/lib/haptics';
import {
  homeTheme,
  type HomeEvent,
  type HomeGameCategoryId,
} from '../../theme/homeTheme';
import { HomeBrandIcon } from './HomeBrandIcon';
import { HomeEventCard } from './HomeEventCard';
import { usePullToRefresh } from '../shared/usePullToRefresh';

type FavoritesPageTabId = 'events' | 'games';

export type HomeFavoriteGamePreview = {
  categoryId: HomeGameCategoryId;
  id: string;
  image: ImageSourcePropType;
  subtitle: string;
  title: string;
};

type HomeFavoritesPageProps = {
  balanceAmount: string;
  events: HomeEvent[];
  games: HomeFavoriteGamePreview[];
  onOpenBalance: () => void;
  onOpenEvent: (event: HomeEvent, initialOddLabel?: string | null) => void;
  onOpenGame: (game: HomeFavoriteGamePreview) => void;
  onToggleFavoriteGame: (gameId: string) => void;
  selectedOddsByEventId: Record<string, string | null>;
};

const FAVORITES_TABS: Array<{ id: FavoritesPageTabId; title: string }> = [
  { id: 'events', title: 'События' },
  { id: 'games', title: '1xGames' },
];

export function HomeFavoritesPage({
  balanceAmount,
  events,
  games,
  onOpenBalance,
  onOpenEvent,
  onOpenGame,
  onToggleFavoriteGame,
  selectedOddsByEventId,
}: HomeFavoritesPageProps) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<FavoritesPageTabId>('events');
  const { refreshControl } = usePullToRefresh();

  const handleTabPress = (tabId: FavoritesPageTabId) => {
    if (tabId === activeTab) {
      return;
    }

    void selectionHaptic();
    setActiveTab(tabId);
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.navRow}>
            <Pressable
              onPress={onOpenBalance}
              style={({ pressed }) => [styles.balanceControl, pressed && styles.pressed]}
            >
              <Text numberOfLines={1} style={styles.balanceControlText}>
                {balanceAmount}
              </Text>
            </Pressable>

            <Text numberOfLines={1} style={styles.navTitle}>
              Избранное
            </Text>

            <View style={styles.navSpacer} />
          </View>

          <View style={styles.tabsWrap}>
            {FAVORITES_TABS.map((tab) => {
              const active = tab.id === activeTab;

              return (
                <Pressable
                  key={tab.id}
                  onPress={() => handleTabPress(tab.id)}
                  style={({ pressed }) => [
                    styles.tabButton,
                    active && styles.tabButtonActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.tabText, active && styles.tabTextActive]}>
                    {tab.title}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        alwaysBounceVertical
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: insets.bottom + homeTheme.sizes.bottomBar + homeTheme.spacing.xl,
          },
        ]}
        refreshControl={refreshControl}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'events' ? (
          events.length ? (
            <View style={styles.eventsStack}>
              {events.map((event) => (
                <HomeEventCard
                  event={event}
                  key={event.id}
                  onOpen={(currentEvent) => onOpenEvent(currentEvent)}
                  onSelectOdd={(currentEvent, odd) => onOpenEvent(currentEvent, odd.label)}
                  selectedOddLabel={selectedOddsByEventId[event.id] ?? null}
                />
              ))}
            </View>
          ) : (
            <FavoritesEmptyState
              subtitle="Пока нет сохранённых матчей и турниров"
              title="Избранное пусто"
            />
          )
        ) : games.length ? (
          <View style={styles.gamesGrid}>
            {games.map((game) => (
              <View key={game.id} style={styles.gameCard}>
                <Pressable
                  onPress={() => onOpenGame(game)}
                  style={({ pressed }) => [styles.gameMainPressable, pressed && styles.pressed]}
                >
                  <Image resizeMode="cover" source={game.image} style={styles.gameImage} />

                  <View style={styles.gameCopy}>
                    <Text numberOfLines={1} style={styles.gameTitle}>
                      {game.title}
                    </Text>
                    <Text numberOfLines={1} style={styles.gameSubtitle}>
                      {game.subtitle}
                    </Text>
                  </View>
                </Pressable>

                <Pressable
                  hitSlop={10}
                  onPress={() => onToggleFavoriteGame(game.id)}
                  style={({ pressed }) => [
                    styles.favoriteButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <HomeBrandIcon color={homeTheme.colors.favorite} name="favorites" size={18} />
                </Pressable>
              </View>
            ))}
          </View>
        ) : (
          <FavoritesEmptyState
            subtitle="Добавьте игры в избранное прямо из каталога 1xGames"
            title="Список игр пуст"
          />
        )}
      </ScrollView>
    </View>
  );
}

type FavoritesEmptyStateProps = {
  subtitle: string;
  title: string;
};

function FavoritesEmptyState({ subtitle, title }: FavoritesEmptyStateProps) {
  return (
    <View style={styles.emptyWrap}>
      <View style={styles.emptyIconWrap}>
        <HomeBrandIcon color={homeTheme.colors.secondary} name="favorites-circle" size={34} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: homeTheme.colors.background,
    flex: 1,
  },
  safeArea: {
    backgroundColor: homeTheme.colors.background,
  },
  header: {
    backgroundColor: homeTheme.colors.background,
    paddingBottom: homeTheme.spacing.sm,
    paddingHorizontal: homeTheme.spacing.md,
  },
  navRow: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 56,
  },
  balanceControl: {
    alignItems: 'center',
    backgroundColor: homeTheme.colors.sectionSurface,
    borderRadius: homeTheme.radii.full,
    justifyContent: 'center',
    minHeight: 34,
    minWidth: 88,
    paddingHorizontal: 12,
  },
  balanceControlText: {
    color: homeTheme.colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  navTitle: {
    color: homeTheme.colors.secondary,
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 24,
    textAlign: 'center',
  },
  navSpacer: {
    width: 88,
  },
  tabsWrap: {
    backgroundColor: homeTheme.colors.headerSurface,
    borderRadius: 18,
    flexDirection: 'row',
    padding: 4,
  },
  tabButton: {
    alignItems: 'center',
    borderRadius: 14,
    flex: 1,
    justifyContent: 'center',
    minHeight: 40,
  },
  tabButtonActive: {
    backgroundColor: homeTheme.colors.background,
  },
  tabText: {
    color: homeTheme.colors.tabInactive,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  tabTextActive: {
    color: homeTheme.colors.textPrimary,
  },
  content: {
    paddingHorizontal: homeTheme.spacing.md,
    paddingTop: homeTheme.spacing.md,
  },
  eventsStack: {
    gap: homeTheme.spacing.sm,
  },
  gamesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: homeTheme.spacing.sm,
  },
  gameCard: {
    backgroundColor: homeTheme.colors.sectionSurface,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    width: '48%',
  },
  gameMainPressable: {
    flex: 1,
  },
  gameImage: {
    height: 112,
    width: '100%',
  },
  favoriteButton: {
    alignItems: 'center',
    backgroundColor: '#10161de0',
    borderRadius: homeTheme.radii.full,
    height: 30,
    justifyContent: 'center',
    position: 'absolute',
    right: 10,
    top: 10,
    width: 30,
  },
  gameCopy: {
    padding: 12,
  },
  gameTitle: {
    color: homeTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  gameSubtitle: {
    color: homeTheme.colors.secondary,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingHorizontal: homeTheme.spacing.xl,
    paddingTop: 68,
  },
  emptyIconWrap: {
    alignItems: 'center',
    backgroundColor: homeTheme.colors.sectionSurface,
    borderRadius: 24,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  emptyTitle: {
    color: homeTheme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: homeTheme.colors.secondary,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.84,
  },
});
