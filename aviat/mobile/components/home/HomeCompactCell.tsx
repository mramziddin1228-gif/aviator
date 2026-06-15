import { Pressable, StyleSheet, Text, View } from 'react-native';

import { homeTheme, type HomeQuickMenuItem } from '../../theme/homeTheme';
import { HomeUiIcon } from './HomeUiIcon';

type HomeCompactCellProps = {
  item: HomeQuickMenuItem;
  onPress?: () => void;
};

export function HomeCompactCell({ item, onPress }: HomeCompactCellProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.cell, pressed && styles.pressed]}
    >
      <View style={styles.iconWrap}>
        <HomeUiIcon color={homeTheme.colors.primary} icon={item.icon} size={24} />
      </View>

      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.subtitle}>{item.subtitle}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cell: {
    backgroundColor: homeTheme.colors.sectionSurface,
    borderRadius: 16,
    minHeight: 112,
    paddingHorizontal: homeTheme.spacing.md,
    paddingVertical: 14,
    width: homeTheme.sizes.quickMenuWidth,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: homeTheme.colors.background,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    marginBottom: 10,
    width: 40,
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
