import { startTransition, useEffect, useRef, useState } from 'react';
import {
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  type ImageStyle,
  type ImageSourcePropType,
  View,
} from 'react-native';
import type { Session } from '@supabase/supabase-js';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ImpactFeedbackStyle } from 'expo-haptics';
import Animated, {
  FadeInRight,
  FadeInUp,
  FadeOutDown,
  FadeOutLeft,
  LinearTransition,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { impactHaptic, selectionHaptic } from '../../src/lib/haptics';
import { type Profile } from '../../src/lib/auth';
import { homeGameAssets } from '../../theme/homeAssets';
import {
  homeBanners,
  homeBottomTabs,
  homeEventsLine,
  homeEventsLive,
  homeGameCategories,
  homeGameFavoriteIds,
  homeGameSections,
  homeGameSpotlight,
  homeSpecialEvents,
  homeSports,
  homeTheme,
  homeTopTabs,
  type HomeBottomTabId,
  type HomeEvent,
  type HomeGameCategoryId,
  type HomeGameItem,
  type HomeGameSection,
  type HomeSportId,
  type HomeTopTabId,
  type HomeUiIconSpec,
} from '../../theme/homeTheme';
import { HomeBetSheet } from './HomeBetSheet';
import { HomeBrandIcon } from './HomeBrandIcon';
import { usePullToRefresh } from '../shared/usePullToRefresh';
import {
  HomeCouponPage,
  type HomeCouponActionId,
  type HomeCouponBetItem,
} from './HomeCouponPage';
import { HomeAviatorScreen } from './HomeAviatorScreen';
import { HomeEventCard } from './HomeEventCard';
import {
  HomeFavoritesPage,
  type HomeFavoriteGamePreview,
} from './HomeFavoritesPage';
import { HomeHistoryScreen } from './HomeHistoryScreen';
import { HomeHotMenuSheet, type HomeHotMenuActionId } from './HomeHotMenuSheet';
import { HomeNotificationsSheet } from './HomeNotificationsSheet';
import { HomeSearchOverlay } from './HomeSearchOverlay';
import { HomeSettingsScreen } from './HomeSettingsScreen';
import { HomeSupportScreen } from './HomeSupportScreen';
import { HomeTopUpSheet } from './HomeTopUpSheet';
import { HomeUiIcon } from './HomeUiIcon';

type HomeScreenProps = {
  profile: Profile | null;
  profileLoading?: boolean;
  refreshProfile?: () => Promise<void>;
  session: Session;
};

type SelectedBet = {
  eventId: string;
  oddLabel: string;
  oddValue: string;
  stake: number;
};

type BetSheetState = {
  event: HomeEvent;
  initialOddLabel?: string | null;
};

type HomeOverlayId =
  | 'aviator'
  | 'deposit'
  | 'history'
  | 'menu'
  | 'notifications'
  | 'settings'
  | 'support';

type GameArtworkLayer = {
  resizeMode?: 'contain' | 'cover';
  source: ImageSourcePropType;
  style: ImageStyle;
};

type GameArtworkPreset = {
  layers: GameArtworkLayer[];
  tint?: string;
};

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

const GAME_ARTWORK_PRESETS: Record<string, GameArtworkPreset> = {
  'apple-fortune': {
    layers: [
      {
        source: homeGameAssets.appleCell,
        style: { height: '62%', left: '19%', top: '18%', width: '62%' },
      },
    ],
  },
  'apple-fortune-dices': {
    layers: [
      {
        source: homeGameAssets.appleCell,
        style: { height: '62%', left: '19%', top: '18%', width: '62%' },
      },
    ],
  },
  'dice-arena': {
    layers: [
      {
        source: homeGameAssets.gamesManiaBackIcon,
        style: { height: '58%', left: '21%', top: '20%', width: '58%' },
      },
      {
        source: homeGameAssets.gamesMania5Puzzle,
        style: { height: '30%', left: '34%', top: '34%', width: '30%' },
      },
    ],
    tint: '#140a2f55',
  },
  domino: {
    layers: [
      {
        source: homeGameAssets.dominoPlaceholder,
        style: { height: '100%', left: 0, opacity: 0.28, top: 0, width: '100%' },
      },
    ],
  },
  'domino-dices': {
    layers: [
      {
        source: homeGameAssets.dominoPlaceholder,
        style: { height: '100%', left: 0, opacity: 0.28, top: 0, width: '100%' },
      },
    ],
  },
  'dragons-gold': {
    layers: [
      {
        source: homeGameAssets.dragonsGoldArrowCell,
        style: { height: '50%', left: '25%', top: '24%', width: '50%' },
      },
    ],
    tint: '#24110533',
  },
  'dragons-gold-classic': {
    layers: [
      {
        source: homeGameAssets.dragonsGoldArrowCell,
        style: { height: '50%', left: '25%', top: '24%', width: '50%' },
      },
    ],
    tint: '#24110533',
  },
  'eastern-nights': {
    layers: [
      {
        source: homeGameAssets.easternNightsArrowCell,
        style: { height: '74%', left: '13%', top: '13%', width: '74%' },
      },
    ],
  },
  'eastern-nights-classic': {
    layers: [
      {
        source: homeGameAssets.easternNightsArrowCell,
        style: { height: '74%', left: '13%', top: '13%', width: '74%' },
      },
    ],
  },
  'games-mania-1': {
    layers: [
      {
        source: homeGameAssets.gamesMania1Puzzle,
        style: { height: '66%', left: '17%', top: '17%', width: '66%' },
      },
    ],
    tint: '#140a2f55',
  },
  'games-mania-2': {
    layers: [
      {
        source: homeGameAssets.gamesMania2Puzzle,
        style: { height: '66%', left: '17%', top: '17%', width: '66%' },
      },
    ],
    tint: '#140a2f55',
  },
  'games-mania-3': {
    layers: [
      {
        source: homeGameAssets.gamesMania3Puzzle,
        style: { height: '66%', left: '17%', top: '17%', width: '66%' },
      },
    ],
    tint: '#140a2f55',
  },
  'games-mania-4': {
    layers: [
      {
        source: homeGameAssets.gamesMania4Puzzle,
        style: { height: '66%', left: '17%', top: '17%', width: '66%' },
      },
    ],
    tint: '#140a2f55',
  },
  'guess-hand': {
    layers: [
      {
        source: homeGameAssets.guessWhichHandGirlPlaceholder,
        style: { height: '86%', right: '-2%', top: '14%', width: '78%' },
      },
      {
        source: homeGameAssets.guessWhichHandLeft,
        style: { bottom: '8%', height: '26%', left: '8%', width: '28%' },
      },
    ],
  },
  'guess-hand-classic': {
    layers: [
      {
        source: homeGameAssets.guessWhichHandGirlPlaceholder,
        style: { height: '86%', right: '-2%', top: '14%', width: '78%' },
      },
      {
        source: homeGameAssets.guessWhichHandLeft,
        style: { bottom: '8%', height: '26%', left: '8%', width: '28%' },
      },
    ],
  },
  'guess-hand-dices': {
    layers: [
      {
        source: homeGameAssets.guessWhichHandGirlPlaceholder,
        style: { height: '86%', right: '-2%', top: '14%', width: '78%' },
      },
      {
        source: homeGameAssets.guessWhichHandLeft,
        style: { bottom: '8%', height: '26%', left: '8%', width: '28%' },
      },
    ],
  },
  minesweeper: {
    layers: [
      {
        source: homeGameAssets.cellBlackBig,
        style: { height: '24%', left: '10%', top: '14%', width: '42%' },
      },
      {
        source: homeGameAssets.cellRedBig,
        style: { bottom: '12%', height: '24%', left: '14%', width: '42%' },
      },
      {
        source: homeGameAssets.bomb,
        style: { height: '34%', right: '12%', top: '22%', width: '24%' },
      },
    ],
  },
  'minesweeper-classic': {
    layers: [
      {
        source: homeGameAssets.cellBlackBig,
        style: { height: '24%', left: '10%', top: '14%', width: '42%' },
      },
      {
        source: homeGameAssets.cellRedBig,
        style: { bottom: '12%', height: '24%', left: '14%', width: '42%' },
      },
      {
        source: homeGameAssets.bomb,
        style: { height: '34%', right: '12%', top: '22%', width: '24%' },
      },
    ],
  },
  resident: {
    layers: [
      {
        source: homeGameAssets.residentDoorClosed,
        style: { bottom: 0, height: '78%', left: '5%', width: '30%' },
      },
      {
        source: homeGameAssets.residentPersonDefault1,
        style: { bottom: '2%', height: '60%', left: '34%', width: '22%' },
      },
      {
        source: homeGameAssets.residentSafeGold,
        style: { bottom: '8%', height: '50%', right: '8%', width: '34%' },
      },
    ],
  },
  'resident-classic': {
    layers: [
      {
        source: homeGameAssets.residentDoorClosed,
        style: { bottom: 0, height: '78%', left: '5%', width: '30%' },
      },
      {
        source: homeGameAssets.residentPersonWin,
        style: { bottom: '4%', height: '60%', left: '34%', width: '22%' },
      },
      {
        source: homeGameAssets.residentSafeGold,
        style: { bottom: '8%', height: '50%', right: '8%', width: '34%' },
      },
    ],
  },
};

const HOME_SEARCH_EVENTS: SearchEventEntry[] = [
  ...homeEventsLive.map((event) => ({ event, tabId: 'live' as const })),
  ...homeEventsLine.map((event) => ({ event, tabId: 'line' as const })),
];

const HOME_SEARCH_GAMES = buildSearchGames();

function buildSearchGames() {
  const seenIds = new Set<string>();
  const results: SearchGameEntry[] = [];

  homeGameSections.forEach((section) => {
    const categoryId =
      section.categoryIds.find((id) => id !== 'all') ?? ('all' as HomeGameCategoryId);

    section.games.forEach((game) => {
      if (seenIds.has(game.id)) {
        return;
      }

      seenIds.add(game.id);
      results.push({
        categoryId,
        id: game.id,
        image: game.image,
        subtitle: game.subtitle ?? section.title,
        title: game.title,
      });
    });
  });

  return results;
}

function formatBalance(balance: number | null | undefined, currency: string | null | undefined) {
  const normalizedCurrency = currency?.toUpperCase() || 'RUB';
  const numericBalance = Number.isFinite(balance ?? NaN) ? balance ?? 0 : 0;
  const formattedValue = new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 0,
  }).format(numericBalance);

  return `${formattedValue} ${normalizedCurrency === 'RUB' ? '₽' : normalizedCurrency}`;
}

function matchesSport(event: HomeEvent, sportId: HomeSportId) {
  return sportId === 'all' || event.sportId === sportId;
}

function getEventTitle(event: HomeEvent) {
  return event.teams.map((team) => team.name).join(' - ');
}

function filterGameSections(
  activeCategory: HomeGameCategoryId,
  favoriteGameIds: string[],
) {
  return homeGameSections.reduce<HomeGameSection[]>((sections, section) => {
    if (activeCategory === 'favorites') {
      const favoriteGames = section.games.filter((game) => favoriteGameIds.includes(game.id));

      if (favoriteGames.length) {
        sections.push({
          ...section,
          games: favoriteGames,
        });
      }

      return sections;
    }

    if (activeCategory !== 'all' && !section.categoryIds.includes(activeCategory)) {
      return sections;
    }

    sections.push(section);
    return sections;
  }, []);
}

export function HomeScreen({
  profile,
  profileLoading = false,
  refreshProfile,
  session,
}: HomeScreenProps) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView | null>(null);
  const [activeTopTab, setActiveTopTab] = useState<HomeTopTabId>(
    homeTopTabs[0]?.id ?? 'popular',
  );
  const [activeBottomTab, setActiveBottomTab] = useState<HomeBottomTabId>('popular');
  const [activeSport, setActiveSport] = useState<HomeSportId>(homeSports[0]?.id ?? 'all');
  const [activeGameCategory, setActiveGameCategory] = useState<HomeGameCategoryId>(
    homeGameCategories[0]?.id ?? 'all',
  );
  const [selectedBets, setSelectedBets] = useState<SelectedBet[]>([]);
  const [betSheetState, setBetSheetState] = useState<BetSheetState | null>(null);
  const [favoriteGameIds, setFavoriteGameIds] = useState<string[]>([
    ...homeGameFavoriteIds,
  ]);
  const [activeOverlay, setActiveOverlay] = useState<HomeOverlayId | null>(null);
  const [searchVisible, setSearchVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timeout = setTimeout(() => {
      setToastMessage(null);
    }, 2200);

    return () => {
      clearTimeout(timeout);
    };
  }, [toastMessage]);

  const filteredLiveEvents = homeEventsLive.filter((event) => matchesSport(event, activeSport));
  const filteredLineEvents = homeEventsLine.filter((event) => matchesSport(event, activeSport));
  const filteredGameSections = filterGameSections(activeGameCategory, favoriteGameIds);
  const selectedBetCount = selectedBets.length;
  const favoriteEvents = HOME_SEARCH_EVENTS.slice(0, 4).map((entry) => entry.event);
  const favoriteGames: HomeFavoriteGamePreview[] = HOME_SEARCH_GAMES.filter((game) =>
    favoriteGameIds.includes(game.id),
  );
  const selectedOddsByEventId = selectedBets.reduce<Record<string, string | null>>(
    (map, bet) => ({
      ...map,
      [bet.eventId]: bet.oddLabel,
    }),
    {},
  );
  const couponBets: HomeCouponBetItem[] = selectedBets.flatMap((bet) => {
    const sourceEvent = HOME_SEARCH_EVENTS.find((entry) => entry.event.id === bet.eventId)?.event;

    if (!sourceEvent) {
      return [];
    }

    return [
      {
        detail: sourceEvent.detail,
        eventId: bet.eventId,
        league: sourceEvent.league,
        oddLabel: bet.oddLabel,
        oddValue: bet.oddValue,
        stake: bet.stake,
        title: getEventTitle(sourceEvent),
      },
    ];
  });
  const balanceAmount = formatBalance(profile?.balance, profile?.currency);
  const balanceMeta = profile?.user_id ? `ID ${profile.user_id}` : homeTheme.strings.balanceMeta;
  const balanceCurrency = profile?.currency?.toUpperCase() || homeTheme.strings.balanceCurrency;
  const { refreshControl: homeRefreshControl } = usePullToRefresh({
    onRefresh: async () => {
      await refreshProfile?.();
    },
    refreshingOverride: profileLoading,
  });

  const setTopTab = (nextTab: HomeTopTabId) => {
    if (nextTab === activeTopTab) {
      return;
    }

    void selectionHaptic();
    scrollRef.current?.scrollTo({ animated: true, y: 0 });
    startTransition(() => {
      setActiveTopTab(nextTab);
    });
  };

  const setSport = (nextSport: HomeSportId) => {
    if (nextSport === activeSport) {
      return;
    }

    void selectionHaptic();
    startTransition(() => {
      setActiveSport(nextSport);
    });
  };

  const setGameCategory = (nextCategory: HomeGameCategoryId) => {
    if (nextCategory === activeGameCategory) {
      return;
    }

    void selectionHaptic();
    startTransition(() => {
      setActiveGameCategory(nextCategory);
    });
  };

  const openToast = (message: string) => {
    setToastMessage(message);
  };

  const openOverlay = (overlay: HomeOverlayId) => {
    void impactHaptic(ImpactFeedbackStyle.Light);
    setSearchVisible(false);
    setActiveOverlay(overlay);
  };

  const closeOverlay = () => {
    setActiveOverlay(null);
  };

  const openSearch = () => {
    void selectionHaptic();
    setActiveOverlay(null);
    setSearchVisible(true);
  };

  const openBetSheet = (event: HomeEvent, initialOddLabel?: string | null) => {
    void impactHaptic(ImpactFeedbackStyle.Medium);
    setBetSheetState({ event, initialOddLabel });
  };

  const handleConfirmBet = (payload: {
    event: HomeEvent;
    oddLabel: string;
    oddValue: string;
    stake: number;
  }) => {
    setSelectedBets((currentBets) => {
      const nextBet: SelectedBet = {
        eventId: payload.event.id,
        oddLabel: payload.oddLabel,
        oddValue: payload.oddValue,
        stake: payload.stake,
      };

      return [
        ...currentBets.filter((bet) => bet.eventId !== payload.event.id),
        nextBet,
      ];
    });
    setBetSheetState(null);
    openToast(`Купон обновлён: ${getEventTitle(payload.event)} • ${payload.oddLabel}`);
  };

  const handleStubAction = (label: string) => {
    void impactHaptic(ImpactFeedbackStyle.Light);
    openToast(`${label} откроем следующим этапом`);
  };

  const handleOpenGame = ({
    categoryId,
    id,
    title,
  }: {
    categoryId?: HomeGameCategoryId;
    id: string;
    title: string;
  }) => {
    scrollRef.current?.scrollTo({ animated: true, y: 0 });
    setActiveBottomTab('popular');
    startTransition(() => {
      setActiveTopTab('games');

      if (categoryId) {
        setActiveGameCategory(categoryId);
      }
    });

    if (id === 'aviator') {
      openOverlay('aviator');
      return;
    }

    handleStubAction(title);
  };

  const toggleFavoriteGame = (gameId: string) => {
    void selectionHaptic();
    setFavoriteGameIds((currentIds) =>
      currentIds.includes(gameId)
        ? currentIds.filter((id) => id !== gameId)
        : [...currentIds, gameId],
    );
  };

  const openBottomTab = (tabId: HomeBottomTabId) => {
    void selectionHaptic();

    if (tabId === 'balance') {
      openOverlay('deposit');
      return;
    }

    if (tabId === 'menu') {
      openOverlay('menu');
      return;
    }

    setSearchVisible(false);
    setActiveOverlay(null);
    setActiveBottomTab(tabId);

    if (tabId === 'popular') {
      scrollRef.current?.scrollTo({ animated: true, y: 0 });
    }
  };

  const handleHotMenuAction = (action: HomeHotMenuActionId) => {
    if (action === 'deposit') {
      openOverlay('deposit');
      return;
    }

    if (action === 'notifications') {
      openOverlay('notifications');
      return;
    }

    if (action === 'history') {
      openOverlay('history');
      return;
    }

    if (action === 'settings') {
      openOverlay('settings');
      return;
    }

    if (action === 'support') {
      openOverlay('support');
      return;
    }

    closeOverlay();
    setActiveBottomTab('popular');
    setTopTab(action);
  };

  const handleCouponAction = (action: HomeCouponActionId) => {
    if (action === 'deposit') {
      openOverlay('deposit');
      return;
    }

    if (action === 'search') {
      setActiveBottomTab('popular');
      openSearch();
      return;
    }

    if (action === 'express') {
      setActiveBottomTab('popular');
      setTopTab('line');
      openToast('Day Express откроем следующим этапом');
      return;
    }

    if (action === 'generate') {
      setActiveBottomTab('popular');
      setTopTab('line');
      openToast('Генератор купона откроем следующим этапом');
      return;
    }

    openToast('Загрузка купона откроем следующим этапом');
  };

  const handleSearchOpenEvent = (entry: SearchEventEntry) => {
    setSearchVisible(false);
    scrollRef.current?.scrollTo({ animated: true, y: 0 });
    setActiveBottomTab('popular');
    startTransition(() => {
      setActiveSport(entry.event.sportId);
      setActiveTopTab(entry.tabId);
    });
    openBetSheet(entry.event);
  };

  const handleSearchOpenGame = (entry: SearchGameEntry) => {
    setSearchVisible(false);
    handleOpenGame(entry);
  };

  const renderEventList = (
    events: HomeEvent[],
    emptyLabel: string,
    horizontal = false,
  ) => {
    if (events.length === 0) {
      return (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons
            color={homeTheme.colors.secondary}
            name="calendar-remove-outline"
            size={22}
          />
          <Text style={styles.emptyStateText}>{emptyLabel}</Text>
        </View>
      );
    }

    if (horizontal) {
      return (
        <ScrollView
          contentContainerStyle={styles.horizontalCardsContent}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {events.map((event) => (
            <View key={event.id} style={styles.horizontalCardWrap}>
              <HomeEventCard
                event={event}
                onOpen={(currentEvent) => openBetSheet(currentEvent)}
                onSelectOdd={(currentEvent, odd) => openBetSheet(currentEvent, odd.label)}
                selectedOddLabel={
                  selectedBets.find((bet) => bet.eventId === event.id)?.oddLabel ?? null
                }
              />
            </View>
          ))}
        </ScrollView>
      );
    }

    return (
      <View style={styles.sectionStack}>
        {events.map((event) => (
          <HomeEventCard
            event={event}
            key={event.id}
            onOpen={(currentEvent) => openBetSheet(currentEvent)}
            onSelectOdd={(currentEvent, odd) => openBetSheet(currentEvent, odd.label)}
            selectedOddLabel={
              selectedBets.find((bet) => bet.eventId === event.id)?.oddLabel ?? null
            }
          />
        ))}
      </View>
    );
  };

  const renderPopularContent = () => (
    <>
      <View style={styles.tabSectionStack}>
        <SectionTitle
          actionLabel={homeTheme.strings.showAll}
          icon={{ kind: 'brand', name: 'live-shortcut', size: 18 }}
          onActionPress={() => setTopTab('live')}
          title={homeTheme.strings.liveSection}
        />
        {renderEventList(
          filteredLiveEvents,
          'Для выбранного фильтра сейчас нет live-событий',
          true,
        )}

        <SectionTitle
          actionLabel={homeTheme.strings.showAll}
          icon={{ kind: 'brand', name: 'line-shortcut', size: 18 }}
          onActionPress={() => setTopTab('line')}
          title={homeTheme.strings.lineSection}
        />
        {renderEventList(
          filteredLineEvents,
          'Для выбранного фильтра сейчас нет событий линии',
          true,
        )}
      </View>
    </>
  );

  const renderLiveContent = () => (
    <>
      <SectionTitle title="LIVE события" />
      {renderEventList(filteredLiveEvents, 'LIVE сейчас пуст для этого вида спорта')}
    </>
  );

  const renderLineContent = () => (
    <>
      <SectionTitle title="Линия" />
      {renderEventList(filteredLineEvents, 'Линия пока пуста для этого фильтра')}
    </>
  );

  const renderHomeHeaderContent = () => {
    const headerCollection = homeGameSections[0];
    const headerGames = headerCollection?.games.slice(0, 8) ?? [];

    return (
      <View style={styles.classicHeaderStack}>
        <View style={styles.sportsCollectionBlock}>
          <View style={styles.sportsCollectionHeader}>
            <Text style={styles.sportsCollectionTitle}>{homeTheme.strings.sportsSection}</Text>

            <Pressable
              onPress={() => handleStubAction(homeTheme.strings.filterLabel)}
              style={({ pressed }) => [styles.filterButton, pressed && styles.pressed]}
            >
              <HomeBrandIcon
                color={homeTheme.colors.secondary}
                name="filter-line"
                size={16}
              />
              <Text style={styles.filterButtonText}>{homeTheme.strings.filterLabel}</Text>
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.sportsRow}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {homeSports.map((sport) => {
              const active = sport.id === activeSport;

              return (
                <Pressable
                  key={sport.id}
                  onPress={() => setSport(sport.id)}
                  style={({ pressed }) => [
                    styles.sportChip,
                    active && styles.sportChipActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <MaterialCommunityIcons
                    color={
                      active
                        ? homeTheme.colors.primaryForeground
                        : homeTheme.colors.secondary
                    }
                    name={sport.icon}
                    size={18}
                  />
                  <Text style={[styles.sportChipText, active && styles.sportChipTextActive]}>
                    {sport.title}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <ScrollView
          contentContainerStyle={styles.bannerRow}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {homeBanners.map((banner) => (
            <Pressable
              key={banner.id}
              onPress={() => handleStubAction(banner.title)}
              style={({ pressed }) => [styles.bannerCard, pressed && styles.pressed]}
            >
              <ImageBackground
                imageStyle={styles.bannerImage}
                resizeMode="cover"
                source={banner.image}
                style={styles.bannerImageWrap}
              >
                <View style={styles.bannerOverlay}>
                  <Text style={styles.bannerTitle}>{banner.title}</Text>
                  <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>
                </View>
              </ImageBackground>
            </Pressable>
          ))}
        </ScrollView>

        <ScrollView
          contentContainerStyle={styles.specialEventsRow}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {homeSpecialEvents.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => handleStubAction(item.title)}
              style={({ pressed }) => [styles.specialEventCard, pressed && styles.pressed]}
            >
              <ImageBackground
                imageStyle={styles.specialEventImage}
                resizeMode="cover"
                source={item.image}
                style={styles.specialEventImageWrap}
              >
                <View style={styles.specialEventGradient}>
                  <Text numberOfLines={1} style={styles.specialEventTitle}>
                    {item.title}
                  </Text>
                  <Text numberOfLines={2} style={styles.specialEventSubtitle}>
                    {item.subtitle}
                  </Text>
                </View>
              </ImageBackground>
            </Pressable>
          ))}
        </ScrollView>

        {headerCollection ? (
          <View style={styles.headerGameCollection}>
            <View style={styles.headerGameCollectionHeader}>
              <View style={styles.sectionHeaderMain}>
                <View style={styles.sectionHeaderIconWrap}>
                  <HomeUiIcon
                    color={homeTheme.colors.primary}
                    icon={headerCollection.icon}
                    size={18}
                  />
                </View>
                <Text style={styles.sectionTitle}>{headerCollection.title}</Text>
                <View style={styles.headerGameCollectionTag}>
                  <Text style={styles.headerGameCollectionTagText}>
                    {homeGameSpotlight.tag}
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={() => setTopTab('games')}
                style={({ pressed }) => [styles.sectionAction, pressed && styles.pressed]}
              >
                <Text style={styles.sectionActionText}>{homeTheme.strings.showAll}</Text>
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={styles.headerGameCollectionRail}
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {headerGames.map((game) => (
                <GameTile
                  favorite={favoriteGameIds.includes(game.id)}
                  game={game}
                  key={game.id}
                  onPress={() =>
                    handleOpenGame({
                      id: game.id,
                      title: game.title,
                    })
                  }
                  onToggleFavorite={() => toggleFavoriteGame(game.id)}
                  variant="showcase"
                />
              ))}
            </ScrollView>
          </View>
        ) : null}
      </View>
    );
  };

  const renderGamesContent = () => (
    <>
      <Pressable
        onPress={() => handleStubAction(homeGameSpotlight.title)}
        style={({ pressed }) => [styles.gamesSpotlight, pressed && styles.pressed]}
      >
        <ImageBackground
          imageStyle={styles.gamesSpotlightImage}
          resizeMode="cover"
          source={homeGameSpotlight.image}
          style={styles.gamesSpotlightImageWrap}
        >
          <View style={styles.gamesSpotlightGradient}>
            <View style={styles.gamesSpotlightTag}>
              <Text style={styles.gamesSpotlightTagText}>{homeGameSpotlight.tag}</Text>
            </View>
            <Text style={styles.gamesSpotlightTitle}>{homeGameSpotlight.title}</Text>
            <Text numberOfLines={1} style={styles.gamesSpotlightSubtitle}>
              {homeGameSpotlight.subtitle}
            </Text>
          </View>
        </ImageBackground>
      </Pressable>

      <ScrollView
        contentContainerStyle={styles.gamesCategoryRow}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {homeGameCategories.map((chip) => {
          const active = chip.id === activeGameCategory;

          return (
            <Pressable
              key={chip.id}
              onPress={() => setGameCategory(chip.id)}
              style={({ pressed }) => [
                styles.gameCategoryChip,
                active && styles.gameCategoryChipActive,
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.gameCategoryChipText,
                  active && styles.gameCategoryChipTextActive,
                ]}
              >
                {chip.title}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {filteredGameSections.length ? (
        <View style={styles.gamesSectionStack}>
          {filteredGameSections.map((section) => (
            <View key={section.id} style={styles.gamesSectionCard}>
              <View style={styles.gamesSectionHeader}>
                <View style={styles.gamesSectionHeaderMain}>
                  <View style={styles.gamesSectionIconWrap}>
                    <HomeUiIcon color={homeTheme.colors.primary} icon={section.icon} size={18} />
                  </View>
                  <Text style={styles.gamesSectionTitle}>{section.title}</Text>
                </View>

                {section.actionLabel ? (
                  <Pressable
                    onPress={() => handleStubAction(section.title)}
                    style={({ pressed }) => [styles.sectionAction, pressed && styles.pressed]}
                  >
                    <Text style={styles.gamesSectionActionText}>{section.actionLabel}</Text>
                  </Pressable>
                ) : null}
              </View>

              <ScrollView
                contentContainerStyle={styles.gameRail}
                horizontal
                showsHorizontalScrollIndicator={false}
              >
                {section.games.map((game) => {
                  const favorite = favoriteGameIds.includes(game.id);

                  return (
                    <GameTile
                      favorite={favorite}
                      game={game}
                      key={game.id}
                      onPress={() =>
                        handleOpenGame({
                          categoryId:
                            section.categoryIds.find((id) => id !== 'all') ?? undefined,
                          id: game.id,
                          title: game.title,
                        })
                      }
                      onToggleFavorite={() => toggleFavoriteGame(game.id)}
                      variant={section.variant}
                    />
                  );
                })}
              </ScrollView>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons
            color={homeTheme.colors.secondary}
            name="cards-outline"
            size={22}
          />
          <Text style={styles.emptyStateText}>Для выбранной категории игры не найдены</Text>
        </View>
      )}
    </>
  );

  const renderActiveContent = () => {
    if (activeTopTab === 'live') {
      return renderLiveContent();
    }

    if (activeTopTab === 'line') {
      return renderLineContent();
    }

    if (activeTopTab === 'games') {
      return renderGamesContent();
    }

    return renderPopularContent();
  };

  return (
    <View style={styles.root}>
      {activeBottomTab === 'popular' ? (
        <>
          <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
            <View style={styles.headerSurface}>
              <View style={styles.headerRow}>
                <View style={styles.headerLeading}>
                  {profile?.user_id ? (
                    <Pressable
                      onPress={() => openOverlay('deposit')}
                      style={({ pressed }) => [
                        styles.toolbarAmountButton,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text numberOfLines={1} style={styles.toolbarAmountText}>
                        {balanceAmount}
                      </Text>
                    </Pressable>
                  ) : (
                    <View style={styles.toolbarSideSpacer} />
                  )}
                </View>

                <View pointerEvents="none" style={styles.headerLogoWrap}>
                  <HomeBrandIcon name="popular-logo" />
                </View>

                <View style={styles.headerActions}>
                  <Pressable
                    onPress={openSearch}
                    style={({ pressed }) => [styles.headerIconButton, pressed && styles.pressed]}
                  >
                    <HomeBrandIcon color={homeTheme.colors.secondary} name="search-new" size={20} />
                  </Pressable>
                </View>
              </View>

              {!profile?.user_id ? (
                <View style={styles.authButtonsStrip}>
                  <Pressable
                    onPress={() => handleStubAction('Войти')}
                    style={({ pressed }) => [
                      styles.authActionButton,
                      styles.authActionButtonPrimary,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={styles.authActionButtonPrimaryText}>Войти</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => handleStubAction('Регистрация')}
                    style={({ pressed }) => [
                      styles.authActionButton,
                      styles.authActionButtonSecondary,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={styles.authActionButtonSecondaryText}>Регистрация</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          </SafeAreaView>

          <ScrollView
            alwaysBounceVertical
            keyboardShouldPersistTaps="handled"
            ref={scrollRef}
            refreshControl={homeRefreshControl}
            showsVerticalScrollIndicator={false}
            stickyHeaderIndices={[1]}
            contentContainerStyle={{
              paddingBottom: insets.bottom + homeTheme.sizes.bottomBar + 24,
            }}
          >
            {renderHomeHeaderContent()}

            <View style={styles.stickyTabsSurface}>
              <ScrollView
                contentContainerStyle={styles.topTabsContent}
                horizontal
                showsHorizontalScrollIndicator={false}
              >
                {homeTopTabs.map((tab) => {
                  const active = tab.id === activeTopTab;

                  return (
                    <Pressable
                      key={tab.id}
                      onPress={() => setTopTab(tab.id)}
                      style={({ pressed }) => [
                        styles.topTab,
                        active && styles.topTabActive,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={[styles.topTabText, active && styles.topTabTextActive]}>
                        {tab.title}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
              <View style={styles.stickyTabsDivider} />
            </View>

            <Animated.View
              entering={FadeInRight.duration(220)}
              exiting={FadeOutLeft.duration(180)}
              key={`${activeTopTab}:${activeSport}:${activeGameCategory}`}
              layout={LinearTransition.springify().damping(18).stiffness(180)}
              style={styles.tabContent}
            >
              {renderActiveContent()}
            </Animated.View>
          </ScrollView>
        </>
      ) : null}

      {activeBottomTab === 'favorites' ? (
        <HomeFavoritesPage
          balanceAmount={balanceAmount}
          events={favoriteEvents}
          games={favoriteGames}
          onOpenBalance={() => openOverlay('deposit')}
          onOpenEvent={(event, initialOddLabel) => openBetSheet(event, initialOddLabel)}
          onOpenGame={(game) => {
            handleOpenGame(game);
          }}
          onToggleFavoriteGame={toggleFavoriteGame}
          selectedOddsByEventId={selectedOddsByEventId}
        />
      ) : null}

      {activeBottomTab === 'coupon' ? (
        <HomeCouponPage
          bets={couponBets}
          isAuthorized={Boolean(profile?.user_id)}
          onLogin={() => openToast('Вы уже авторизованы')}
          onOpenAction={handleCouponAction}
          onOpenBet={(bet) => {
            const event = HOME_SEARCH_EVENTS.find((entry) => entry.event.id === bet.eventId)?.event;

            if (!event) {
              openToast('Событие больше недоступно');
              return;
            }

            openBetSheet(event, bet.oddLabel);
          }}
          onRegister={() => openToast('Аккаунт уже активен')}
          onSubmitCoupon={() => openToast('Оформление ставки подключим следующим этапом')}
        />
      ) : null}

      {toastMessage ? (
        <Animated.View
          entering={FadeInUp.duration(180)}
          exiting={FadeOutDown.duration(180)}
          style={[
            styles.toastWrap,
            { bottom: insets.bottom + homeTheme.sizes.bottomBar + 16 },
          ]}
        >
          <View style={styles.toast}>
            <Text numberOfLines={2} style={styles.toastText}>
              {toastMessage}
            </Text>
          </View>
        </Animated.View>
      ) : null}

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 10 }]}>
        {homeBottomTabs.map((tab) => {
          const active = activeBottomTab === tab.id;
          const badge =
            tab.id === 'coupon' && selectedBetCount > 0
              ? String(selectedBetCount)
              : tab.badge;

          return (
            <Pressable
              key={tab.id}
              onPress={() => openBottomTab(tab.id)}
              style={({ pressed }) => [styles.bottomTab, pressed && styles.pressed]}
            >
              <View>
                <HomeUiIcon
                  color={active ? homeTheme.colors.primary : homeTheme.colors.tabInactive}
                  icon={tab.icon}
                  size={20}
                />
                {badge ? (
                  <View style={styles.bottomBadge}>
                    <Text style={styles.bottomBadgeText}>{badge}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={[styles.bottomTabText, active && styles.bottomTabTextActive]}>
                {tab.title}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <HomeBetSheet
        event={betSheetState?.event ?? null}
        initialOddLabel={betSheetState?.initialOddLabel ?? null}
        onClose={() => setBetSheetState(null)}
        onConfirm={handleConfirmBet}
        visible={Boolean(betSheetState)}
      />

      <HomeTopUpSheet
        balanceAmount={balanceAmount}
        balanceCurrency={balanceCurrency}
        balanceMeta={balanceMeta}
        onClose={closeOverlay}
        onSubmit={({ amount, methodTitle }) => {
          closeOverlay();
          openToast(amount > 0 ? `${methodTitle}: ${amount} ₽` : methodTitle);
        }}
        visible={activeOverlay === 'deposit'}
      />

      <HomeAviatorScreen
        onClose={closeOverlay}
        onRefreshProfile={refreshProfile}
        profile={profile}
        session={session}
        visible={activeOverlay === 'aviator'}
      />

      <HomeNotificationsSheet
        onClose={closeOverlay}
        onOpenItem={(title) => {
          closeOverlay();
          openToast(title);
        }}
        visible={activeOverlay === 'notifications'}
      />

      <HomeHotMenuSheet
        balanceAmount={balanceAmount}
        balanceCurrency={balanceCurrency}
        balanceMeta={balanceMeta}
        onClose={closeOverlay}
        onSelectAction={handleHotMenuAction}
        visible={activeOverlay === 'menu'}
      />

      <HomeHistoryScreen
        balanceAmount={balanceAmount}
        onClose={closeOverlay}
        onOpenItem={(title) => {
          closeOverlay();
          openToast(title);
        }}
        userId={profile?.user_id ?? null}
        visible={activeOverlay === 'history'}
      />

      <HomeSupportScreen
        onClose={closeOverlay}
        onOpenItem={(title) => {
          closeOverlay();
          openToast(title);
        }}
        visible={activeOverlay === 'support'}
      />

      <HomeSettingsScreen
        onClose={closeOverlay}
        onOpenItem={(title) => openToast(title)}
        visible={activeOverlay === 'settings'}
      />

      {searchVisible ? (
        <HomeSearchOverlay
          events={HOME_SEARCH_EVENTS}
          games={HOME_SEARCH_GAMES}
          onClose={() => setSearchVisible(false)}
          onOpenEvent={handleSearchOpenEvent}
          onOpenGame={handleSearchOpenGame}
        />
      ) : null}
    </View>
  );
}

type SectionTitleProps = {
  actionLabel?: string;
  icon?: HomeUiIconSpec;
  onActionPress?: () => void;
  title: string;
};

function SectionTitle({
  actionLabel,
  icon,
  onActionPress,
  title,
}: SectionTitleProps) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderMain}>
        {icon ? (
          <View style={styles.sectionHeaderIconWrap}>
            <HomeUiIcon color={homeTheme.colors.primary} icon={icon} size={18} />
          </View>
        ) : null}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>

      {actionLabel ? (
        <Pressable
          onPress={onActionPress}
          style={({ pressed }) => [styles.sectionAction, pressed && styles.pressed]}
        >
          <Text style={styles.sectionActionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function renderGameArtwork(game: HomeGameItem, variant: HomeGameSection['variant']) {
  const showcase = variant === 'showcase';
  const rectangle = variant === 'rectangle';
  const classic = variant === 'classic';
  const artworkPreset = GAME_ARTWORK_PRESETS[game.id];
  const frameStyle = [
    styles.gameTileArtwork,
    showcase && styles.gameTileImageShowcase,
    rectangle && styles.gameTileImageRectangle,
    classic && styles.gameTileImageClassic,
  ];

  if (!artworkPreset) {
    return (
      <Image
        resizeMode="cover"
        source={game.image}
        style={[
          styles.gameTileImage,
          showcase && styles.gameTileImageShowcase,
          rectangle && styles.gameTileImageRectangle,
          classic && styles.gameTileImageClassic,
        ]}
      />
    );
  }

  return (
    <View style={frameStyle}>
      <Image
        resizeMode="cover"
        source={game.image}
        style={styles.gameTileArtworkBackground}
      />
      {artworkPreset.tint ? (
        <View
          style={[
            styles.gameTileArtworkTint,
            { backgroundColor: artworkPreset.tint },
          ]}
        />
      ) : null}
      {artworkPreset.layers.map((layer, index) => (
        <Image
          key={`${game.id}-layer-${index}`}
          resizeMode={layer.resizeMode ?? 'contain'}
          source={layer.source}
          style={[styles.gameTileArtworkLayer, layer.style]}
        />
      ))}
    </View>
  );
}

type GameTileProps = {
  favorite: boolean;
  game: HomeGameItem;
  onPress: () => void;
  onToggleFavorite: () => void;
  variant: HomeGameSection['variant'];
};

function GameTile({
  favorite,
  game,
  onPress,
  onToggleFavorite,
  variant,
}: GameTileProps) {
  const showcase = variant === 'showcase';
  const rectangle = variant === 'rectangle';
  const classic = variant === 'classic';
  const iconLike = game.imagePresentation === 'icon';
  const withMetaRow = rectangle || classic;

  return (
    <View
      style={[
        styles.gameTileWrap,
        showcase && styles.gameTileWrapShowcase,
        rectangle && styles.gameTileWrapRectangle,
        classic && styles.gameTileWrapClassic,
      ]}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.gameTilePressable,
          showcase && styles.gameTileShowcase,
          rectangle && styles.gameTileRectangle,
          classic && styles.gameTileClassic,
          iconLike && styles.gameTilePressableIcon,
          iconLike && showcase && styles.gameTileShowcaseIconCard,
          iconLike && rectangle && styles.gameTileRectangleIconCard,
          iconLike && classic && styles.gameTileClassicIconCard,
          pressed && styles.pressed,
        ]}
      >
        {iconLike ? (
          <View
            style={[
              styles.gameTileImageFrame,
              showcase && styles.gameTileImageShowcase,
              classic && styles.gameTileImageClassic,
              variant === 'rectangle' && styles.gameTileImageRectangle,
            ]}
          >
            <Image
              resizeMode="contain"
              source={game.image}
              style={[
                styles.gameTileIconImage,
                showcase && styles.gameTileIconImageShowcase,
                rectangle && styles.gameTileIconImageRectangle,
                classic && styles.gameTileIconImageClassic,
              ]}
            />
          </View>
        ) : (
          renderGameArtwork(game, variant)
        )}

        {game.badge ? (
          <View style={styles.gameBadge}>
            <Text style={styles.gameBadgeText}>{game.badge}</Text>
          </View>
        ) : null}

        {classic && game.subtitle ? (
          <View style={styles.gameTileImageCaption}>
            <Text numberOfLines={1} style={styles.gameTileImageCaptionText}>
              {game.subtitle}
            </Text>
          </View>
        ) : null}
      </Pressable>

      {showcase ? (
        <Text numberOfLines={2} style={styles.gameTileTitle}>
          {game.title}
        </Text>
      ) : null}

      {withMetaRow ? (
        <View
          style={[
            styles.gameCardMeta,
            classic && styles.gameCardMetaClassic,
          ]}
        >
          <View style={styles.gameClassicCopy}>
            <Text numberOfLines={1} style={styles.gameClassicTitle}>
              {game.title}
            </Text>
            {rectangle && game.subtitle ? (
              <Text numberOfLines={1} style={styles.gameClassicSubtitle}>
                {game.subtitle}
              </Text>
            ) : null}
          </View>

          <Pressable
            hitSlop={8}
            onPress={onToggleFavorite}
            style={({ pressed }) => [
              styles.gameClassicFavoriteButton,
              pressed && styles.pressed,
            ]}
          >
            <MaterialCommunityIcons
              color={favorite ? homeTheme.colors.favorite : homeTheme.colors.secondary}
              name={favorite ? 'heart' : 'heart-outline'}
              size={18}
            />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: homeTheme.colors.background,
    flex: 1,
  },
  safeArea: {
    backgroundColor: homeTheme.colors.headerSurface,
  },
  headerSurface: {
    backgroundColor: homeTheme.colors.headerSurface,
    paddingBottom: homeTheme.spacing.sm,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: homeTheme.spacing.md,
    paddingTop: 4,
  },
  headerLeading: {
    width: 120,
  },
  headerIconButton: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: homeTheme.radii.full,
    height: homeTheme.sizes.headerButton,
    justifyContent: 'center',
    width: homeTheme.sizes.headerButton,
  },
  headerLogoWrap: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  headerActions: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: 120,
  },
  toolbarAmountButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: homeTheme.colors.sectionSurface,
    borderRadius: homeTheme.radii.full,
    height: 32,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  toolbarAmountText: {
    color: homeTheme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 16,
  },
  toolbarSideSpacer: {
    height: 32,
    width: 88,
  },
  authButtonsStrip: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: homeTheme.spacing.md,
    paddingTop: homeTheme.spacing.sm,
  },
  authActionButton: {
    alignItems: 'center',
    borderRadius: 14,
    flex: 1,
    justifyContent: 'center',
    minHeight: 40,
    paddingHorizontal: 12,
  },
  authActionButtonPrimary: {
    backgroundColor: homeTheme.colors.primary,
  },
  authActionButtonSecondary: {
    backgroundColor: homeTheme.colors.sectionSurface,
  },
  authActionButtonPrimaryText: {
    color: homeTheme.colors.primaryForeground,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  authActionButtonSecondaryText: {
    color: homeTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  accountCard: {
    alignItems: 'center',
    backgroundColor: homeTheme.colors.accountSurface,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: homeTheme.spacing.md,
    marginTop: homeTheme.spacing.md,
    padding: homeTheme.spacing.md,
  },
  balanceCopy: {
    flex: 1,
    marginRight: homeTheme.spacing.md,
  },
  balanceLabel: {
    color: homeTheme.colors.secondary,
    fontSize: 12,
    lineHeight: 16,
  },
  balanceAmount: {
    color: homeTheme.colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
    marginTop: 4,
  },
  balanceMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: homeTheme.spacing.xs,
    marginTop: homeTheme.spacing.sm,
  },
  balanceMetaPill: {
    backgroundColor: homeTheme.colors.backgroundGroup,
    borderRadius: homeTheme.radii.full,
    paddingHorizontal: homeTheme.spacing.sm,
    paddingVertical: 5,
  },
  balanceMetaPillMuted: {
    backgroundColor: homeTheme.colors.background,
  },
  balanceMetaText: {
    color: homeTheme.colors.secondary,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
  },
  topUpButton: {
    alignItems: 'center',
    backgroundColor: homeTheme.colors.primary,
    borderRadius: 14,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 14,
  },
  topUpButtonText: {
    color: homeTheme.colors.primaryForeground,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 16,
  },
  topTabsContent: {
    gap: 8,
    minHeight: homeTheme.sizes.tabsHeight,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  topTab: {
    alignItems: 'center',
    borderRadius: 16,
    justifyContent: 'center',
    minHeight: 40,
    paddingHorizontal: 16,
  },
  topTabActive: {
    backgroundColor: homeTheme.colors.sectionSurface,
  },
  topTabText: {
    color: homeTheme.colors.tabInactive,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  topTabTextActive: {
    color: homeTheme.colors.textPrimary,
  },
  scrollContent: {
    paddingTop: homeTheme.spacing.md,
  },
  classicHeaderStack: {
    gap: 16,
    paddingBottom: 8,
    paddingTop: 8,
  },
  sportsCollectionBlock: {
    gap: 8,
  },
  sportsCollectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: homeTheme.spacing.md,
  },
  sportsCollectionTitle: {
    color: homeTheme.colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
  },
  filterButton: {
    alignItems: 'center',
    backgroundColor: homeTheme.colors.sectionSurface,
    borderRadius: homeTheme.radii.full,
    flexDirection: 'row',
    gap: 6,
    height: 32,
    paddingHorizontal: 12,
  },
  filterButtonText: {
    color: homeTheme.colors.secondary,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 14,
  },
  stickyTabsSurface: {
    backgroundColor: homeTheme.colors.background,
  },
  stickyTabsDivider: {
    backgroundColor: homeTheme.colors.sectionDivider,
    height: StyleSheet.hairlineWidth,
  },
  tabContent: {
    paddingTop: 12,
  },
  tabSectionStack: {
    gap: 16,
    paddingBottom: 4,
  },
  sectionStack: {
    gap: homeTheme.spacing.sm,
    paddingHorizontal: homeTheme.spacing.md,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 2,
    paddingHorizontal: homeTheme.spacing.md,
  },
  sectionHeaderMain: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
  },
  sectionHeaderIconWrap: {
    alignItems: 'center',
    backgroundColor: homeTheme.colors.sectionSurface,
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
    marginRight: 8,
    width: 24,
  },
  sectionTitle: {
    color: homeTheme.colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
  },
  sectionAction: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  sectionActionText: {
    color: homeTheme.colors.primary,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  sportsRow: {
    gap: 8,
    paddingHorizontal: homeTheme.spacing.md,
    paddingTop: 2,
  },
  sportChip: {
    alignItems: 'center',
    backgroundColor: homeTheme.colors.sportsCard,
    borderRadius: 16,
    flexDirection: 'row',
    height: 40,
    paddingHorizontal: 12,
  },
  sportChipActive: {
    backgroundColor: homeTheme.colors.chipSurfaceActive,
  },
  sportChipText: {
    color: homeTheme.colors.secondary,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 16,
    marginLeft: 8,
  },
  sportChipTextActive: {
    color: homeTheme.colors.primaryForeground,
  },
  bannerRow: {
    gap: 12,
    paddingHorizontal: homeTheme.spacing.md,
  },
  bannerCard: {
    width: 292,
  },
  bannerImageWrap: {
    height: homeTheme.sizes.bannerHeight,
    justifyContent: 'flex-end',
    width: 292,
  },
  bannerImage: {
    borderRadius: homeTheme.radii.md,
  },
  bannerOverlay: {
    backgroundColor: homeTheme.colors.bannerOverlay,
    borderRadius: homeTheme.radii.md,
    justifyContent: 'flex-end',
    minHeight: homeTheme.sizes.bannerHeight,
    paddingHorizontal: homeTheme.spacing.md,
    paddingVertical: 14,
  },
  bannerTitle: {
    color: homeTheme.colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 26,
  },
  bannerSubtitle: {
    color: homeTheme.colors.primaryForeground80,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
  specialEventsRow: {
    gap: 8,
    paddingHorizontal: homeTheme.spacing.md,
  },
  specialEventCard: {
    width: homeTheme.sizes.specialEventWidth,
  },
  specialEventImageWrap: {
    height: homeTheme.sizes.specialEventHeight,
    justifyContent: 'flex-end',
    width: homeTheme.sizes.specialEventWidth,
  },
  specialEventImage: {
    borderRadius: 16,
  },
  specialEventGradient: {
    backgroundColor: '#05080d6e',
    borderRadius: 16,
    justifyContent: 'flex-end',
    minHeight: homeTheme.sizes.specialEventHeight,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  specialEventTitle: {
    color: homeTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  specialEventSubtitle: {
    color: homeTheme.colors.primaryForeground80,
    fontSize: 11,
    lineHeight: 14,
    marginTop: 2,
  },
  headerGameCollection: {
    gap: 10,
  },
  headerGameCollectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: homeTheme.spacing.md,
  },
  headerGameCollectionTag: {
    backgroundColor: homeTheme.colors.sectionSurface,
    borderRadius: homeTheme.radii.full,
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  headerGameCollectionTagText: {
    color: homeTheme.colors.primary,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 12,
  },
  headerGameCollectionRail: {
    gap: 0,
    paddingHorizontal: 8,
  },
  quickMenuRow: {
    gap: 12,
    paddingHorizontal: homeTheme.spacing.md,
  },
  menuSection: {
    marginTop: homeTheme.spacing.sm,
  },
  horizontalCardsContent: {
    gap: 12,
    paddingHorizontal: homeTheme.spacing.md,
  },
  horizontalCardWrap: {
    width: homeTheme.sizes.eventCardWidth,
  },
  gamesSpotlight: {
    marginHorizontal: homeTheme.spacing.md,
    marginTop: 2,
  },
  gamesSpotlightImageWrap: {
    height: homeTheme.sizes.gameHeroHeight,
    justifyContent: 'flex-end',
    width: '100%',
  },
  gamesSpotlightImage: {
    borderRadius: 24,
  },
  gamesSpotlightGradient: {
    backgroundColor: '#00000038',
    borderRadius: 24,
    justifyContent: 'flex-end',
    minHeight: homeTheme.sizes.gameHeroHeight,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  gamesSpotlightTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#111821e8',
    borderRadius: homeTheme.radii.full,
    borderColor: '#51d5ca',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  gamesSpotlightTagText: {
    color: '#7be8e0',
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
  },
  gamesSpotlightTitle: {
    color: homeTheme.colors.primaryForeground,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 32,
  },
  gamesSpotlightSubtitle: {
    color: homeTheme.colors.primaryForeground80,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  gamesCategoryRow: {
    gap: 8,
    paddingHorizontal: homeTheme.spacing.md,
    paddingTop: homeTheme.spacing.md,
  },
  gameCategoryChip: {
    alignItems: 'center',
    backgroundColor: homeTheme.colors.chipSurface,
    borderColor: homeTheme.colors.sectionDivider,
    borderRadius: 16,
    borderWidth: 1,
    height: 32,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  gameCategoryChipActive: {
    backgroundColor: homeTheme.colors.primary,
    borderColor: homeTheme.colors.primary,
  },
  gameCategoryChipText: {
    color: homeTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  gameCategoryChipTextActive: {
    color: homeTheme.colors.primaryForeground,
  },
  gamesSectionStack: {
    gap: homeTheme.spacing.md,
    marginTop: homeTheme.spacing.md,
  },
  gamesSectionCard: {
    backgroundColor: homeTheme.colors.sectionSurface,
    borderRadius: 16,
    marginHorizontal: homeTheme.spacing.md,
    overflow: 'hidden',
  },
  gamesSectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  gamesSectionHeaderMain: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
  },
  gamesSectionIconWrap: {
    alignItems: 'center',
    backgroundColor: homeTheme.colors.background,
    borderRadius: 12,
    height: 28,
    justifyContent: 'center',
    marginRight: 8,
    width: 28,
  },
  gamesSectionTitle: {
    color: homeTheme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
  },
  gamesSectionActionText: {
    color: homeTheme.colors.primary,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  gameSection: {
    marginTop: homeTheme.spacing.md,
  },
  gameRail: {
    gap: 8,
    paddingBottom: 16,
    paddingHorizontal: 8,
    paddingTop: 12,
  },
  gameTileWrap: {
    width: homeTheme.sizes.gameRectWidth,
  },
  gameTileWrapShowcase: {
    width: 112,
  },
  gameTileWrapRectangle: {
    width: homeTheme.sizes.gameRectWidth,
  },
  gameTileWrapClassic: {
    width: homeTheme.sizes.gameRectWidth,
  },
  gameTilePressable: {
    backgroundColor: homeTheme.colors.background,
    overflow: 'hidden',
    position: 'relative',
  },
  gameTilePressableIcon: {
    backgroundColor: '#1e2631',
    borderColor: '#324150',
    borderWidth: 1,
  },
  gameTileShowcase: {
    alignSelf: 'center',
    borderRadius: 24,
    width: homeTheme.sizes.gameSquare,
  },
  gameTileShowcaseIconCard: {
    borderRadius: 24,
  },
  gameTileRectangle: {
    borderRadius: 16,
    width: homeTheme.sizes.gameRectWidth,
  },
  gameTileRectangleIconCard: {
    justifyContent: 'center',
  },
  gameTileClassic: {
    borderRadius: 16,
    width: homeTheme.sizes.gameRectWidth,
  },
  gameTileClassicIconCard: {
    justifyContent: 'center',
  },
  gameTileImage: {
    backgroundColor: homeTheme.colors.sectionSurface,
  },
  gameTileArtwork: {
    overflow: 'hidden',
    position: 'relative',
  },
  gameTileArtworkBackground: {
    ...StyleSheet.absoluteFillObject,
    height: undefined,
    width: undefined,
  },
  gameTileArtworkLayer: {
    position: 'absolute',
  },
  gameTileArtworkTint: {
    ...StyleSheet.absoluteFillObject,
  },
  gameTileImageFrame: {
    alignItems: 'center',
    backgroundColor: '#1e2631',
    justifyContent: 'center',
  },
  gameTileImageShowcase: {
    alignSelf: 'center',
    borderRadius: 24,
    height: homeTheme.sizes.gameSquare,
    width: homeTheme.sizes.gameSquare,
  },
  gameTileImageRectangle: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: homeTheme.sizes.gameRectHeight,
    width: homeTheme.sizes.gameRectWidth,
  },
  gameTileImageClassic: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: 96,
    width: homeTheme.sizes.gameRectWidth,
  },
  gameTileIconImage: {
    tintColor: undefined,
  },
  gameTileIconImageShowcase: {
    height: 54,
    width: 54,
  },
  gameTileIconImageRectangle: {
    height: 56,
    width: 56,
  },
  gameTileIconImageClassic: {
    height: 52,
    width: 52,
  },
  gameBadge: {
    backgroundColor: homeTheme.colors.badgeBlue,
    borderRadius: homeTheme.radii.full,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    position: 'absolute',
    top: 8,
  },
  gameBadgeText: {
    color: homeTheme.colors.primaryForeground,
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 12,
  },
  gameTileTitle: {
    color: homeTheme.colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 15,
    marginTop: 6,
    paddingHorizontal: 2,
    textAlign: 'center',
  },
  gameTileImageCaption: {
    backgroundColor: '#111821d9',
    bottom: 0,
    left: 0,
    paddingHorizontal: 8,
    paddingVertical: 5,
    position: 'absolute',
    right: 0,
  },
  gameTileImageCaptionText: {
    color: homeTheme.colors.primaryForeground,
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
  },
  gameCardMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 44,
    paddingHorizontal: 8,
  },
  gameCardMetaClassic: {
    marginTop: 2,
  },
  gameClassicCopy: {
    flex: 1,
    marginRight: 8,
    paddingVertical: 8,
  },
  gameClassicTitle: {
    color: homeTheme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 17,
  },
  gameClassicSubtitle: {
    color: homeTheme.colors.secondary,
    fontSize: 11,
    lineHeight: 14,
    marginTop: 2,
  },
  gameClassicFavoriteButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  gamesShortcutRow: {
    gap: 12,
    paddingHorizontal: homeTheme.spacing.md,
  },
  gamesShortcutCell: {
    alignItems: 'center',
    backgroundColor: homeTheme.colors.sectionSurface,
    borderRadius: 16,
    justifyContent: 'center',
    minHeight: 96,
    paddingHorizontal: 16,
    width: 108,
  },
  gamesShortcutIconWrap: {
    alignItems: 'center',
    backgroundColor: homeTheme.colors.background,
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    marginBottom: 10,
    width: 36,
  },
  gamesShortcutTitle: {
    color: homeTheme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 16,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: homeTheme.colors.sectionSurface,
    borderRadius: 16,
    marginHorizontal: homeTheme.spacing.md,
    padding: 20,
  },
  emptyStateText: {
    color: homeTheme.colors.secondary,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
    textAlign: 'center',
  },
  toastWrap: {
    alignItems: 'center',
    left: homeTheme.spacing.md,
    position: 'absolute',
    right: homeTheme.spacing.md,
  },
  toast: {
    backgroundColor: '#10161dee',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  toastText: {
    color: homeTheme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    textAlign: 'center',
  },
  bottomBar: {
    backgroundColor: homeTheme.colors.headerSurface,
    borderTopColor: homeTheme.colors.sectionDivider,
    borderTopWidth: StyleSheet.hairlineWidth,
    bottom: 0,
    flexDirection: 'row',
    left: 0,
    paddingTop: 10,
    position: 'absolute',
    right: 0,
  },
  bottomTab: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
  },
  bottomTabText: {
    color: homeTheme.colors.tabInactive,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
    marginTop: 4,
  },
  bottomTabTextActive: {
    color: homeTheme.colors.primary,
  },
  bottomBadge: {
    alignItems: 'center',
    backgroundColor: homeTheme.colors.primary,
    borderRadius: 9,
    minWidth: 18,
    paddingHorizontal: 4,
    position: 'absolute',
    right: -10,
    top: -6,
  },
  bottomBadgeText: {
    color: homeTheme.colors.primaryForeground,
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 14,
  },
  pressed: {
    opacity: 0.84,
  },
});
