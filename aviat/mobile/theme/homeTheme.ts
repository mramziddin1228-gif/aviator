import type { ComponentProps } from 'react';
import type { ImageSourcePropType } from 'react-native';
import type MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { authTheme } from './authTheme';
import { homeBannerAssets, homeGameAssets, homePromoAssets } from './homeAssets';

export type HomeIconName = ComponentProps<typeof MaterialCommunityIcons>['name'];
export type HomeBrandGlyphName =
  | 'arrow-left'
  | 'balance'
  | 'cancel-small'
  | 'cards-tab'
  | 'chevron-right-small'
  | 'coefficient'
  | 'dark-theme'
  | 'deposit-account'
  | 'delete-basket'
  | 'coupon'
  | 'express'
  | 'favorites'
  | 'favorites-circle'
  | 'filter-line'
  | 'fast-bet'
  | 'games-tab'
  | 'games-shortcut'
  | 'history'
  | 'line-shortcut'
  | 'light-theme'
  | 'live-shortcut'
  | 'menu-grid'
  | 'minus-small'
  | 'night-theme'
  | 'notification-new'
  | 'other-tab'
  | 'plus-small'
  | 'popular-fire'
  | 'popular-logo'
  | 'promo-wheel'
  | 'proxy'
  | 'qr-scanner'
  | 'replenish'
  | 'search-new'
  | 'settings-inactive'
  | 'sport-tab'
  | 'support'
  | 'top-tab'
  | 'upload'
  | 'virtual-tab'
  | 'waiting'
  | 'withdraw-account';
export type HomeUiIconSpec =
  | {
      kind: 'brand';
      name: HomeBrandGlyphName;
      size?: number;
    }
  | {
      kind: 'material';
      name: HomeIconName;
      size?: number;
    };
export type HomeTopTabId = 'popular' | 'live' | 'line' | 'games';
export type HomeSportId = 'all' | 'football' | 'basketball' | 'tennis' | 'esports';
export type HomeBottomTabId = 'popular' | 'favorites' | 'coupon' | 'balance' | 'menu';
export type HomeGameCategoryId =
  | 'all'
  | 'new'
  | 'lotteries'
  | 'stairs'
  | 'dices'
  | 'cards'
  | 'other'
  | 'favorites';

export type HomeTopTab = {
  id: HomeTopTabId;
  title: string;
};

export type HomeSportChip = {
  id: HomeSportId;
  icon: HomeIconName;
  title: string;
};

export type HomePromoBanner = {
  id: string;
  image: ImageSourcePropType;
  kicker: string;
  subtitle: string;
  title: string;
};

export type HomeSpecialEventCard = {
  id: string;
  image: ImageSourcePropType;
  subtitle: string;
  title: string;
};

export type HomeQuickMenuItem = {
  actionTarget?: HomeTopTabId;
  icon: HomeUiIconSpec;
  id: string;
  subtitle: string;
  title: string;
};

export type HomeMenuListItem = {
  icon: HomeUiIconSpec;
  id: string;
  subtitle: string;
  title: string;
};

export type HomeMenuSection = {
  id: string;
  items: HomeMenuListItem[];
  title: string;
};

export type HomeBottomTab = {
  badge?: string;
  icon: HomeUiIconSpec;
  id: HomeBottomTabId;
  title: string;
};

export type HomeEvent = {
  detail: string;
  id: string;
  league: string;
  live: boolean;
  marketsLabel: string;
  odds: Array<{
    label: string;
    value: string;
  }>;
  sportId: HomeSportId;
  sportIcon: HomeIconName;
  status: string;
  teams: Array<{
    accent: 'primary' | 'commerce';
    name: string;
    score: string;
  }>;
};

export type HomeGameCategoryChip = {
  id: HomeGameCategoryId;
  title: string;
};

export type HomeGameItem = {
  badge?: string;
  id: string;
  image: ImageSourcePropType;
  imagePresentation?: 'cover' | 'icon';
  subtitle?: string;
  title: string;
};

export type HomeGameSection = {
  actionLabel?: string;
  categoryIds: HomeGameCategoryId[];
  games: HomeGameItem[];
  icon: HomeUiIconSpec;
  id: string;
  title: string;
  variant: 'classic' | 'rectangle' | 'showcase';
};

export const homeTheme = {
  colors: {
    ...authTheme.colors,
    accountSurface: '#242b34',
    bannerOverlay: '#5408141f',
    badgeBlue: '#4d0075ff',
    badgeTeal: '#0db3aa',
    chipSurface: '#242b34',
    chipSurfaceActive: '#0075ff',
    eventStageLine: '#434d59',
    eventStageLive: '#314150',
    favorite: '#ffbf4b',
    headerSurface: '#292f39',
    live: '#f54b4b',
    liveMuted: '#33f54b4b',
    oddsBackground: '#232a31',
    primaryForeground80: '#d9ffffff',
    sectionDivider: '#26303a',
    sectionSurface: '#242b34',
    sportsCard: '#242b34',
    tabInactive: '#9aa5b4',
    tileOverlay: '#82000000',
  },
  sizes: {
    ...authTheme.sizes,
    bannerHeight: 110,
    bottomBar: 76,
    eventCardWidth: 284,
    gameHeroHeight: 232,
    gameRectHeight: 98,
    gameRectWidth: 164,
    gameSquare: 96,
    headerButton: 40,
    quickMenuWidth: 160,
    specialEventHeight: 80,
    specialEventWidth: 176,
    tabsHeight: 56,
  },
  strings: {
    balanceCurrency: 'RUB',
    balanceLabel: 'Основной счёт',
    balanceMeta: 'ID 492631',
    filterLabel: 'Фильтр',
    gamesSpotlightTag: 'HOT',
    lineSection: 'Popular pre-match',
    liveSection: 'Popular live',
    quickAccessSection: 'Быстрый доступ',
    showAll: 'Все',
    sportsSection: 'Виды спорта',
    topUp: 'Пополнить',
  },
  spacing: authTheme.spacing,
  radii: authTheme.radii,
} as const;

export const homeTopTabs: HomeTopTab[] = [
  { id: 'popular', title: 'Популярное' },
  { id: 'live', title: 'LIVE' },
  { id: 'line', title: 'Линия' },
  { id: 'games', title: '1xGames' },
];

export const homeSports: HomeSportChip[] = [
  { id: 'all', icon: 'view-grid-outline', title: 'Все' },
  { id: 'football', icon: 'soccer', title: 'Футбол' },
  { id: 'basketball', icon: 'basketball', title: 'Баскетбол' },
  { id: 'tennis', icon: 'tennis-ball', title: 'Теннис' },
  { id: 'esports', icon: 'sword-cross', title: 'Киберспорт' },
];

export const homeBanners: HomePromoBanner[] = [
  {
    id: 'popular-live',
    image: homeBannerAssets.aggregatorPopular,
    kicker: 'LIVE',
    subtitle: 'Быстрый вход в горячие события и основные маркеты',
    title: 'Popular live',
  },
  {
    id: 'category-best',
    image: homeBannerAssets.categoryBest,
    kicker: '1xGAMES',
    subtitle: 'Локальный баннер из Android-ресурсов для витрины лучших игр',
    title: 'Лучшие игры',
  },
  {
    id: 'popular-line',
    image: homeBannerAssets.jackpotPopular,
    kicker: 'LINE',
    subtitle: 'События до матча, экспрессы и крупные коэффициенты',
    title: 'Popular pre-match',
  },
  {
    id: 'category-for-you',
    image: homeBannerAssets.categoryForYou,
    kicker: 'PERSONAL',
    subtitle: 'Карточка “For you” из APK, без hotlink-URL и временных артов',
    title: 'Для вас',
  },
  {
    id: 'wheel',
    image: homeBannerAssets.luckyWheelPopular,
    kicker: 'PROMO',
    subtitle: 'Колесо фортуны, бонусы и игровые витрины 1xGames',
    title: 'Промо и бонусы',
  },
];

export const homeSpecialEvents: HomeSpecialEventCard[] = [
  {
    id: 'special-1',
    image: homePromoAssets.specialEventDefault,
    subtitle: 'Топ матчей и повышенные коэффициенты',
    title: 'Спецсобытие',
  },
  {
    id: 'special-2',
    image: homePromoAssets.specialEventSmall,
    subtitle: 'Экспрессы дня и быстрый вход',
    title: 'Day Express',
  },
  {
    id: 'special-3',
    image: homePromoAssets.specialEventTablet,
    subtitle: 'Игры, турниры и витрины 1xGames',
    title: '1xGames',
  },
];

export const homeEventsLive: HomeEvent[] = [
  {
    detail: '1-й тайм • Основное время',
    id: 'live-1',
    league: 'Лига чемпионов UEFA',
    live: true,
    marketsLabel: 'Ещё 126 маркетов',
    odds: [
      { label: '1', value: '1.74' },
      { label: 'X', value: '3.90' },
      { label: '2', value: '4.25' },
    ],
    sportId: 'football',
    sportIcon: 'soccer',
    status: '67:12',
    teams: [
      { accent: 'primary', name: 'PSG', score: '2' },
      { accent: 'commerce', name: 'Arsenal', score: '1' },
    ],
  },
  {
    detail: '3-я четверть • Тотал 214.5',
    id: 'live-2',
    league: 'NBA. Регулярный сезон',
    live: true,
    marketsLabel: 'Ещё 98 маркетов',
    odds: [
      { label: '1', value: '1.58' },
      { label: 'Ф1', value: '-4.5' },
      { label: 'ТБ', value: '214.5' },
    ],
    sportId: 'basketball',
    sportIcon: 'basketball',
    status: 'Q3 08:41',
    teams: [
      { accent: 'primary', name: 'Lakers', score: '74' },
      { accent: 'commerce', name: 'Celtics', score: '69' },
    ],
  },
  {
    detail: 'Dust2 • Серия до 3 карт',
    id: 'live-3',
    league: 'ESL Pro League',
    live: true,
    marketsLabel: 'Ещё 64 маркета',
    odds: [
      { label: '1', value: '1.82' },
      { label: '2', value: '1.94' },
      { label: 'ТБ', value: '2.5' },
    ],
    sportId: 'esports',
    sportIcon: 'sword-cross',
    status: 'MAP 2',
    teams: [
      { accent: 'primary', name: 'Natus Vincere', score: '10' },
      { accent: 'commerce', name: 'FaZe Clan', score: '8' },
    ],
  },
];

export const homeEventsLine: HomeEvent[] = [
  {
    detail: 'Сегодня • ATP Miami',
    id: 'line-1',
    league: 'ATP Miami',
    live: false,
    marketsLabel: 'Ещё 42 маркета',
    odds: [
      { label: '1', value: '2.31' },
      { label: '2', value: '1.63' },
      { label: 'ТБ', value: '22.5' },
    ],
    sportId: 'tennis',
    sportIcon: 'tennis-ball',
    status: '19:30',
    teams: [
      { accent: 'primary', name: 'Даниил Медведев', score: '-' },
      { accent: 'commerce', name: 'Янник Синнер', score: '-' },
    ],
  },
  {
    detail: 'Сегодня • Серия A',
    id: 'line-2',
    league: 'Италия. Серия A',
    live: false,
    marketsLabel: 'Ещё 74 маркета',
    odds: [
      { label: '1', value: '1.91' },
      { label: 'X', value: '3.30' },
      { label: '2', value: '4.60' },
    ],
    sportId: 'football',
    sportIcon: 'soccer',
    status: '22:00',
    teams: [
      { accent: 'primary', name: 'Milan', score: '-' },
      { accent: 'commerce', name: 'Roma', score: '-' },
    ],
  },
  {
    detail: 'Завтра • EuroLeague',
    id: 'line-3',
    league: 'EuroLeague',
    live: false,
    marketsLabel: 'Ещё 57 маркетов',
    odds: [
      { label: '1', value: '1.88' },
      { label: 'Ф1', value: '-3.5' },
      { label: 'ТБ', value: '161.5' },
    ],
    sportId: 'basketball',
    sportIcon: 'basketball',
    status: '02:30',
    teams: [
      { accent: 'primary', name: 'Real Madrid', score: '-' },
      { accent: 'commerce', name: 'Fenerbahce', score: '-' },
    ],
  },
];

export const homeQuickMenu: HomeQuickMenuItem[] = [
  {
    actionTarget: 'line',
    icon: { kind: 'brand', name: 'line-shortcut', size: 40 },
    id: 'line',
    subtitle: 'Популярные события до матча',
    title: 'Линия',
  },
  {
    actionTarget: 'live',
    icon: { kind: 'brand', name: 'live-shortcut', size: 40 },
    id: 'live',
    subtitle: 'Ставки в реальном времени',
    title: 'LIVE',
  },
  {
    actionTarget: 'games',
    icon: { kind: 'brand', name: 'games-shortcut', size: 40 },
    id: 'games',
    subtitle: 'Игры, слоты и моментальные раунды',
    title: '1xGames',
  },
  {
    actionTarget: 'popular',
    icon: { kind: 'brand', name: 'promo-wheel', size: 28 },
    id: 'promo',
    subtitle: 'Колесо фортуны и бонусы',
    title: 'Промо',
  },
];

export const homeListMenuSections: HomeMenuSection[] = [
  {
    id: 'main',
    items: [
      {
        icon: { kind: 'brand', name: 'favorites', size: 20 },
        id: 'favorites',
        subtitle: 'Команды и турниры под рукой',
        title: 'Избранное',
      },
      {
        icon: { kind: 'brand', name: 'coupon', size: 20 },
        id: 'coupon',
        subtitle: 'Сохраняйте и редактируйте ставки',
        title: 'Купон',
      },
      {
        icon: { kind: 'material', name: 'history', size: 20 },
        id: 'history',
        subtitle: 'История ставок и операций',
        title: 'История',
      },
      {
        icon: { kind: 'brand', name: 'settings-inactive', size: 20 },
        id: 'settings',
        subtitle: 'Профиль и настройки',
        title: 'Настройки',
      },
    ],
    title: 'Меню',
  },
  {
    id: 'support',
    items: [
      {
        icon: { kind: 'material', name: 'wallet-outline', size: 20 },
        id: 'payments',
        subtitle: 'Пополнение и вывод средств',
        title: 'Управление счётом',
      },
      {
        icon: { kind: 'material', name: 'message-text-outline', size: 20 },
        id: 'support-chat',
        subtitle: 'Чат и ответы поддержки',
        title: 'Поддержка',
      },
    ],
    title: 'Сервис',
  },
];

export const homeBottomTabs: HomeBottomTab[] = [
  {
    icon: { kind: 'brand', name: 'popular-fire', size: 22 },
    id: 'popular',
    title: 'Главное',
  },
  {
    icon: { kind: 'brand', name: 'favorites', size: 20 },
    id: 'favorites',
    title: 'Избранное',
  },
  {
    icon: { kind: 'brand', name: 'coupon', size: 20 },
    id: 'coupon',
    title: 'Купон',
  },
  {
    icon: { kind: 'brand', name: 'balance', size: 20 },
    id: 'balance',
    title: 'Счёт',
  },
  {
    icon: { kind: 'brand', name: 'menu-grid', size: 20 },
    id: 'menu',
    title: 'Меню',
  },
];

export const homeGameCategories: HomeGameCategoryChip[] = [
  { id: 'all', title: 'Все' },
  { id: 'new', title: 'Новинка' },
  { id: 'lotteries', title: 'Лотереи' },
  { id: 'stairs', title: 'Лестница' },
  { id: 'dices', title: 'Кости' },
  { id: 'cards', title: 'Карточные' },
  { id: 'other', title: 'Другие игры' },
  { id: 'favorites', title: 'Избранное' },
];

export const homeGameSpotlight = {
  image: homeGameAssets.wheelOfFortune,
  subtitle: 'Реальная локальная обложка из Android-ресурсов вместо временного cover-арта',
  tag: '1xGames',
  title: 'Колесо фортуны',
};

export const homeGameFavoriteIds = [
  'lucky-wheel',
  'guess-hand',
  'dragons-gold',
  'scratch-card',
] as const;

export const homeGameSections: HomeGameSection[] = [
  {
    actionLabel: homeTheme.strings.showAll,
    categoryIds: ['all'],
    games: [
      {
        badge: 'HOT',
        id: 'aviator',
        image: homeGameAssets.genericCategoryPlaceholder,
        title: 'Aviator',
      },
      {
        id: 'lucky-wheel',
        image: homeGameAssets.wheelOfFortune,
        title: 'Lucky Wheel',
      },
      {
        id: 'wheel-of-fortune',
        image: homeGameAssets.wheelOfFortune,
        title: 'Wheel of Fortune',
      },
      {
        id: 'resident',
        image: homeGameAssets.residentPlaceholder,
        title: 'Resident',
      },
      {
        id: 'dragons-gold',
        image: homeGameAssets.dragonsGoldLoseCell,
        title: 'Dragons Gold',
      },
      {
        id: 'minesweeper',
        image: homeGameAssets.minesweeperPlaceholder,
        title: 'Minesweeper',
      },
      {
        id: 'guess-hand',
        image: homeGameAssets.guessWhichHandLight,
        title: 'Guess Which Hand',
      },
      {
        id: 'scratch-card',
        image: homeGameAssets.scratchCardPlaceholder,
        title: 'Scratch Card',
      },
    ],
    icon: { kind: 'brand', name: 'games-shortcut', size: 22 },
    id: 'all-games',
    title: 'Все игры',
    variant: 'showcase',
  },
  {
    actionLabel: homeTheme.strings.showAll,
    categoryIds: ['all', 'new'],
    games: [
      {
        badge: 'NEW',
        id: 'apple-fortune',
        image: homeGameAssets.appleFortunePlaceholder,
        title: 'Apple of Fortune',
      },
      {
        id: 'domino',
        image: homeGameAssets.dominoPlaceholder,
        title: 'Domino',
      },
      {
        id: 'fruit-blast',
        image: homeGameAssets.fruitBlastPlaceholder,
        title: 'Fruit Blast',
      },
      {
        id: 'eastern-nights',
        image: homeGameAssets.easternNightsPlaceholder,
        title: 'Eastern Nights',
      },
    ],
    icon: { kind: 'material', name: 'star-outline', size: 18 },
    id: 'new-games',
    title: 'Новинка',
    variant: 'rectangle',
  },
  {
    actionLabel: homeTheme.strings.showAll,
    categoryIds: ['all', 'lotteries'],
    games: [
      {
        id: 'lucky-wheel-ny',
        image: homeGameAssets.wheelOfFortune,
        title: 'Lucky Wheel NY',
      },
      {
        id: 'spin-and-win',
        image: homeGameAssets.spinAndWinWheelCover,
        title: 'Spin and Win',
      },
      {
        id: 'wheel-icon',
        image: homeGameAssets.wheelOfFortune,
        title: 'Wheel of Fortune',
      },
      {
        id: 'scratch-card-lottery',
        image: homeGameAssets.scratchCardPlaceholder,
        title: 'Scratch Card',
      },
    ],
    icon: { kind: 'material', name: 'ticket-confirmation-outline', size: 18 },
    id: 'lotteries',
    title: 'Лотереи',
    variant: 'showcase',
  },
  {
    actionLabel: homeTheme.strings.showAll,
    categoryIds: ['all', 'stairs'],
    games: [
      {
        id: 'games-mania-1',
        image: homeGameAssets.gamesManiaFieldCell,
        title: 'Games Mania 1',
      },
      {
        id: 'games-mania-2',
        image: homeGameAssets.gamesManiaSelectedCell,
        title: 'Games Mania 2',
      },
      {
        id: 'games-mania-3',
        image: homeGameAssets.gamesManiaFieldCell,
        title: 'Games Mania 3',
      },
      {
        id: 'games-mania-4',
        image: homeGameAssets.gamesManiaSelectedCell,
        title: 'Games Mania 4',
      },
    ],
    icon: { kind: 'material', name: 'stairs', size: 18 },
    id: 'stairs',
    title: 'Лестница',
    variant: 'showcase',
  },
  {
    actionLabel: homeTheme.strings.showAll,
    categoryIds: ['all', 'dices'],
    games: [
      {
        id: 'dice-arena',
        image: homeGameAssets.gamesManiaSelectedCell,
        title: 'Games Mania 5',
      },
      {
        id: 'domino-dices',
        image: homeGameAssets.dominoPlaceholder,
        title: 'Domino',
      },
      {
        id: 'guess-hand-dices',
        image: homeGameAssets.guessWhichHandLight,
        title: 'Guess Which Hand',
      },
      {
        id: 'apple-fortune-dices',
        image: homeGameAssets.appleFortunePlaceholder,
        title: 'Apple of Fortune',
      },
    ],
    icon: { kind: 'material', name: 'dice-5-outline', size: 18 },
    id: 'dices',
    title: 'Кости',
    variant: 'rectangle',
  },
  {
    actionLabel: homeTheme.strings.showAll,
    categoryIds: ['all', 'cards'],
    games: [
      {
        id: 'scratch-card-classic',
        image: homeGameAssets.scratchCardPlaceholder,
        subtitle: 'Моментальная игра',
        title: 'Scratch Card',
      },
      {
        id: 'resident-classic',
        image: homeGameAssets.residentPlaceholder,
        subtitle: 'Классика',
        title: 'Resident',
      },
      {
        id: 'guess-hand-classic',
        image: homeGameAssets.guessWhichHandLight,
        subtitle: '1xGames',
        title: 'Guess Which Hand',
      },
      {
        id: 'eastern-nights-classic',
        image: homeGameAssets.easternNightsPlaceholder,
        subtitle: 'Новая игра',
        title: 'Eastern Nights',
      },
    ],
    icon: { kind: 'material', name: 'cards-playing-outline', size: 18 },
    id: 'cards',
    title: 'Карточные',
    variant: 'classic',
  },
  {
    actionLabel: homeTheme.strings.showAll,
    categoryIds: ['all', 'other'],
    games: [
      {
        id: 'odyssey-classic',
        image: homeGameAssets.backgroundOdysseyField,
        subtitle: '1xGames',
        title: 'Odyssey',
      },
      {
        id: 'dragons-gold-classic',
        image: homeGameAssets.dragonsGoldLoseCell,
        subtitle: 'Популярная',
        title: "Dragon's Gold",
      },
      {
        id: 'minesweeper-classic',
        image: homeGameAssets.minesweeperPlaceholder,
        subtitle: 'Моментальная игра',
        title: 'Minesweeper',
      },
      {
        id: 'fruit-blast-classic',
        image: homeGameAssets.fruitBlastPlaceholder,
        subtitle: 'Новая игра',
        title: 'Fruit Blast',
      },
    ],
    icon: { kind: 'material', name: 'shape-outline', size: 18 },
    id: 'other',
    title: 'Другие игры',
    variant: 'classic',
  },
];

export const homeQuickBetAmounts = [100, 250, 500, 1000] as const;
