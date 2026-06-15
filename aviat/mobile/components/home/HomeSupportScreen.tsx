import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { impactHaptic, selectionHaptic } from '../../src/lib/haptics';
import { type HomeUiIconSpec, homeTheme } from '../../theme/homeTheme';
import { HomeUiIcon } from './HomeUiIcon';
import { HomeSideModal } from './HomeSideModal';
import { usePullToRefresh } from '../shared/usePullToRefresh';

type HomeSupportScreenProps = {
  onClose: () => void;
  onOpenItem: (title: string) => void;
  visible: boolean;
};

type SupportItem = {
  icon: HomeUiIconSpec;
  id: string;
  subtitle: string;
  title: string;
};

const SUPPORT_ITEMS: SupportItem[] = [
  {
    icon: { kind: 'material', name: 'message-text-outline', size: 20 },
    id: 'chat',
    subtitle: 'Связь с оператором прямо внутри приложения',
    title: 'Онлайн-чат',
  },
  {
    icon: { kind: 'material', name: 'phone-in-talk-outline', size: 20 },
    id: 'call',
    subtitle: 'Закажите звонок от службы поддержки',
    title: 'Заказать звонок',
  },
  {
    icon: { kind: 'brand', name: 'deposit-account', size: 20 },
    id: 'payments',
    subtitle: 'Помощь по пополнению счёта и выводу средств',
    title: 'Платёжный консультант',
  },
  {
    icon: { kind: 'material', name: 'help-circle-outline', size: 20 },
    id: 'faq',
    subtitle: 'Ответы на частые вопросы по аккаунту и ставкам',
    title: 'FAQ и правила',
  },
];

export function HomeSupportScreen({
  onClose,
  onOpenItem,
  visible,
}: HomeSupportScreenProps) {
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
                color={homeTheme.colors.secondary}
                icon={{ kind: 'brand', name: 'arrow-left', size: 24 }}
                size={24}
              />
            </Pressable>

            <Text numberOfLines={1} style={styles.navTitle}>
              Поддержка
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
          <View style={styles.heroCard}>
            <Text style={styles.heroTitle}>Мы на связи 24/7</Text>
            <Text style={styles.heroSubtitle}>
              Выберите нужный раздел и продолжайте прямо из главной страницы, как в Android-референсе.
            </Text>
          </View>

          <View style={styles.list}>
            {SUPPORT_ITEMS.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => {
                  void impactHaptic();
                  onOpenItem(item.title);
                }}
                style={({ pressed }) => [styles.cell, pressed && styles.pressed]}
              >
                <View style={styles.iconWrap}>
                  <HomeUiIcon color={homeTheme.colors.primary} icon={item.icon} size={20} />
                </View>

                <View style={styles.copy}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.subtitle}>{item.subtitle}</Text>
                </View>

                <HomeUiIcon
                  color={homeTheme.colors.secondary}
                  icon={{ kind: 'brand', name: 'chevron-right-small', size: 20 }}
                  size={20}
                />
              </Pressable>
            ))}
          </View>
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
    color: homeTheme.colors.secondary,
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
    paddingHorizontal: homeTheme.spacing.md,
    paddingTop: homeTheme.spacing.md,
  },
  heroCard: {
    backgroundColor: homeTheme.colors.sectionSurface,
    borderRadius: 24,
    marginBottom: homeTheme.spacing.lg,
    padding: homeTheme.spacing.lg,
  },
  heroTitle: {
    color: homeTheme.colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 24,
  },
  heroSubtitle: {
    color: homeTheme.colors.secondary,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
  },
  list: {
    gap: homeTheme.spacing.sm,
  },
  cell: {
    alignItems: 'center',
    backgroundColor: homeTheme.colors.sectionSurface,
    borderRadius: 18,
    flexDirection: 'row',
    minHeight: 72,
    paddingHorizontal: homeTheme.spacing.md,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: homeTheme.colors.background,
    borderRadius: 18,
    height: 40,
    justifyContent: 'center',
    marginRight: homeTheme.spacing.sm,
    width: 40,
  },
  copy: {
    flex: 1,
    paddingVertical: 14,
  },
  title: {
    color: homeTheme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 18,
  },
  subtitle: {
    color: homeTheme.colors.secondary,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
  pressed: {
    opacity: 0.84,
  },
});
