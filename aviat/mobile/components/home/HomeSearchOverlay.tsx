import { useDeferredValue, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ImageSourcePropType,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { selectionHaptic } from '../../src/lib/haptics';
import {
  type HomeEvent,
  type HomeGameCategoryId,
  type HomeTopTabId,
  homeTheme,
} from '../../theme/homeTheme';
import { HomeUiIcon } from './HomeUiIcon';
import { usePullToRefresh } from '../shared/usePullToRefresh';

type SearchEventEntry = {
  event: HomeEvent;
  tabId: HomeTopTabId;
};

type SearchGameEntry = {
  categoryId: HomeGameCategoryId;
  id: string;
  image: ImageSourcePropType;
  subtitle: string;
  title: string;
};

type SearchScopeId = 'all' | 'events' | 'games';

type HomeSearchOverlayProps = {
  events: SearchEventEntry[];
  games: SearchGameEntry[];
  onClose: () => void;
  onOpenEvent: (entry: SearchEventEntry) => void;
  onOpenGame: (entry: SearchGameEntry) => void;
};

const SEARCH_SCOPES: Array<{ id: SearchScopeId; title: string }> = [
  { id: 'all', title: 'Все' },
  { id: 'events', title: 'События' },
  { id: 'games', title: 'Игры' },
];

const SEARCH_SUGGESTIONS = [
  'Aviator',
  'PSG',
  'Real Madrid',
  'Lucky Wheel',
  'Apple of Fortune',
  'ATP Miami',
] as const;

export function HomeSearchOverlay({
  events,
  games,
  onClose,
  onOpenEvent,
  onOpenGame,
}: HomeSearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [activeScope, setActiveScope] = useState<SearchScopeId>('all');
  const { refreshControl } = usePullToRefresh();
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim().toLowerCase();

  const eventResults = normalizedQuery
    ? events.filter(({ event }) => {
        const haystack = [
          event.league,
          event.detail,
          event.status,
          ...event.teams.map((team) => team.name),
        ]
          .join(' ')
          .toLowerCase();

        return haystack.includes(normalizedQuery);
      })
    : [];

  const gameResults = normalizedQuery
    ? games.filter((game) =>
        `${game.title} ${game.subtitle}`.toLowerCase().includes(normalizedQuery),
      )
    : [];

  const showingSuggestions = normalizedQuery.length === 0;
  const showEvents = activeScope === 'all' || activeScope === 'events';
  const showGames = activeScope === 'all' || activeScope === 'games';
  const hasResults =
    (showEvents && eventResults.length > 0) || (showGames && gameResults.length > 0);

  return (
    <Animated.View
      entering={FadeIn.duration(180)}
      exiting={FadeOut.duration(140)}
      style={styles.root}
    >
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <MaterialCommunityIcons
              color={homeTheme.colors.textPrimary}
              name="arrow-left"
              size={22}
            />
          </Pressable>

          <View style={styles.searchField}>
            <HomeUiIcon
              color={homeTheme.colors.secondary}
              icon={{ kind: 'brand', name: 'search-new', size: 18 }}
              size={18}
            />
            <TextInput
              autoFocus
              onChangeText={setQuery}
              placeholder="Поиск"
              placeholderTextColor={homeTheme.colors.secondary}
              selectionColor={homeTheme.colors.primary}
              style={styles.searchInput}
              value={query}
            />
            {query ? (
              <Pressable
                onPress={() => setQuery('')}
                style={({ pressed }) => [styles.clearButton, pressed && styles.pressed]}
              >
                <MaterialCommunityIcons
                  color={homeTheme.colors.secondary}
                  name="close"
                  size={18}
                />
              </Pressable>
            ) : null}
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        alwaysBounceVertical
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={refreshControl}
        showsVerticalScrollIndicator={false}
      >
        {showingSuggestions ? (
          <>
            <Text style={styles.sectionTitle}>Популярные запросы</Text>
            <View style={styles.suggestionRow}>
              {SEARCH_SUGGESTIONS.map((suggestion) => (
                <Pressable
                  key={suggestion}
                  onPress={() => {
                    void selectionHaptic();
                    setQuery(suggestion);
                  }}
                  style={({ pressed }) => [styles.suggestionChip, pressed && styles.pressed]}
                >
                  <Text style={styles.suggestionChipText}>{suggestion}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Быстрый доступ</Text>
            <View style={styles.cardStack}>
              {events.slice(0, 3).map((entry) => (
                <EventResultRow
                  entry={entry}
                  key={entry.event.id}
                  onPress={() => onOpenEvent(entry)}
                />
              ))}
              {games.slice(0, 3).map((entry) => (
                <GameResultRow entry={entry} key={entry.id} onPress={() => onOpenGame(entry)} />
              ))}
            </View>
          </>
        ) : (
          <>
            <ScrollView
              contentContainerStyle={styles.scopeRow}
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {SEARCH_SCOPES.map((scope) => {
                const active = scope.id === activeScope;

                return (
                  <Pressable
                    key={scope.id}
                    onPress={() => {
                      void selectionHaptic();
                      setActiveScope(scope.id);
                    }}
                    style={({ pressed }) => [
                      styles.scopeChip,
                      active && styles.scopeChipActive,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={[styles.scopeChipText, active && styles.scopeChipTextActive]}>
                      {scope.title}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {hasResults ? (
              <View style={styles.resultsStack}>
                {showEvents && eventResults.length ? (
                  <>
                    <Text style={styles.sectionTitle}>События</Text>
                    <View style={styles.cardStack}>
                      {eventResults.map((entry) => (
                        <EventResultRow
                          entry={entry}
                          key={entry.event.id}
                          onPress={() => onOpenEvent(entry)}
                        />
                      ))}
                    </View>
                  </>
                ) : null}

                {showGames && gameResults.length ? (
                  <>
                    <Text style={styles.sectionTitle}>Игры</Text>
                    <View style={styles.cardStack}>
                      {gameResults.map((entry) => (
                        <GameResultRow
                          entry={entry}
                          key={entry.id}
                          onPress={() => onOpenGame(entry)}
                        />
                      ))}
                    </View>
                  </>
                ) : null}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconWrap}>
                  <HomeUiIcon
                    color={homeTheme.colors.secondary}
                    icon={{ kind: 'brand', name: 'search-new', size: 24 }}
                    size={24}
                  />
                </View>
                <Text style={styles.emptyTitle}>Ничего не найдено</Text>
                <Text style={styles.emptySubtitle}>
                  Попробуйте изменить запрос или переключиться на другую категорию
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </Animated.View>
  );
}

type EventResultRowProps = {
  entry: SearchEventEntry;
  onPress: () => void;
};

function EventResultRow({ entry, onPress }: EventResultRowProps) {
  const { event, tabId } = entry;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.resultCard, pressed && styles.pressed]}>
      <View style={styles.resultIconWrap}>
        <MaterialCommunityIcons
          color={event.live ? homeTheme.colors.live : homeTheme.colors.primary}
          name={event.sportIcon}
          size={20}
        />
      </View>

      <View style={styles.resultCopy}>
        <Text numberOfLines={1} style={styles.resultTitle}>
          {event.teams.map((team) => team.name).join(' - ')}
        </Text>
        <Text numberOfLines={1} style={styles.resultSubtitle}>
          {event.league}
        </Text>
      </View>

      <View style={[styles.resultPill, tabId === 'live' && styles.resultPillLive]}>
        <Text style={[styles.resultPillText, tabId === 'live' && styles.resultPillTextLive]}>
          {tabId === 'live' ? 'LIVE' : event.status}
        </Text>
      </View>
    </Pressable>
  );
}

type GameResultRowProps = {
  entry: SearchGameEntry;
  onPress: () => void;
};

function GameResultRow({ entry, onPress }: GameResultRowProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.resultCard, pressed && styles.pressed]}>
      <Image source={entry.image} style={styles.gameThumb} />

      <View style={styles.resultCopy}>
        <Text numberOfLines={1} style={styles.resultTitle}>
          {entry.title}
        </Text>
        <Text numberOfLines={1} style={styles.resultSubtitle}>
          {entry.subtitle}
        </Text>
      </View>

      <MaterialCommunityIcons
        color={homeTheme.colors.secondary}
        name="chevron-right"
        size={22}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: homeTheme.colors.background,
    zIndex: 40,
  },
  safeArea: {
    backgroundColor: homeTheme.colors.headerSurface,
  },
  header: {
    alignItems: 'center',
    backgroundColor: homeTheme.colors.headerSurface,
    flexDirection: 'row',
    paddingBottom: homeTheme.spacing.md,
    paddingHorizontal: homeTheme.spacing.md,
    paddingTop: 4,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: homeTheme.colors.background,
    borderRadius: homeTheme.radii.full,
    height: 40,
    justifyContent: 'center',
    marginRight: homeTheme.spacing.sm,
    width: 40,
  },
  searchField: {
    alignItems: 'center',
    backgroundColor: homeTheme.colors.background,
    borderRadius: 18,
    flex: 1,
    flexDirection: 'row',
    minHeight: 44,
    paddingHorizontal: 14,
  },
  searchInput: {
    color: homeTheme.colors.textPrimary,
    flex: 1,
    fontSize: 15,
    lineHeight: 18,
    marginLeft: 10,
    paddingVertical: 10,
  },
  clearButton: {
    alignItems: 'center',
    height: 28,
    justifyContent: 'center',
    marginLeft: 8,
    width: 28,
  },
  content: {
    padding: homeTheme.spacing.md,
    paddingBottom: 36,
  },
  sectionTitle: {
    color: homeTheme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: homeTheme.spacing.sm,
  },
  suggestionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: homeTheme.spacing.sm,
    marginBottom: homeTheme.spacing.lg,
  },
  suggestionChip: {
    backgroundColor: homeTheme.colors.sectionSurface,
    borderRadius: homeTheme.radii.full,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  suggestionChipText: {
    color: homeTheme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 16,
  },
  scopeRow: {
    gap: homeTheme.spacing.sm,
    marginBottom: homeTheme.spacing.lg,
  },
  scopeChip: {
    backgroundColor: homeTheme.colors.sectionSurface,
    borderRadius: homeTheme.radii.full,
    minHeight: 36,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  scopeChipActive: {
    backgroundColor: homeTheme.colors.primary20,
    borderColor: homeTheme.colors.primary,
    borderWidth: 1,
  },
  scopeChipText: {
    color: homeTheme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 16,
  },
  scopeChipTextActive: {
    color: homeTheme.colors.primary,
  },
  resultsStack: {
    gap: homeTheme.spacing.lg,
  },
  cardStack: {
    gap: homeTheme.spacing.sm,
  },
  resultCard: {
    alignItems: 'center',
    backgroundColor: homeTheme.colors.sectionSurface,
    borderRadius: 18,
    flexDirection: 'row',
    paddingHorizontal: homeTheme.spacing.md,
    paddingVertical: homeTheme.spacing.md,
  },
  resultIconWrap: {
    alignItems: 'center',
    backgroundColor: homeTheme.colors.background,
    borderRadius: 16,
    height: 42,
    justifyContent: 'center',
    marginRight: homeTheme.spacing.sm,
    width: 42,
  },
  resultCopy: {
    flex: 1,
    marginRight: homeTheme.spacing.sm,
  },
  resultTitle: {
    color: homeTheme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 18,
  },
  resultSubtitle: {
    color: homeTheme.colors.secondary,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
  resultPill: {
    backgroundColor: homeTheme.colors.background,
    borderRadius: homeTheme.radii.full,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  resultPillLive: {
    backgroundColor: homeTheme.colors.liveMuted,
  },
  resultPillText: {
    color: homeTheme.colors.secondary,
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 12,
  },
  resultPillTextLive: {
    color: homeTheme.colors.live,
  },
  gameThumb: {
    borderRadius: 14,
    height: 42,
    marginRight: homeTheme.spacing.sm,
    width: 42,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 320,
    paddingHorizontal: homeTheme.spacing.xl,
  },
  emptyIconWrap: {
    alignItems: 'center',
    backgroundColor: homeTheme.colors.sectionSurface,
    borderRadius: 22,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  emptyTitle: {
    color: homeTheme.colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 22,
    marginTop: homeTheme.spacing.md,
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
