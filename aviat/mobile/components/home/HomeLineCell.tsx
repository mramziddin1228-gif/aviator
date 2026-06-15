import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { homeTheme, type HomeMenuListItem } from '../../theme/homeTheme';
import { HomeUiIcon } from './HomeUiIcon';

type HomeLineCellProps = {
  item: HomeMenuListItem;
  onPress?: () => void;
};

export function HomeLineCell({ item, onPress }: HomeLineCellProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.cell, pressed && styles.pressed]}
    >
      <View style={styles.iconWrap}>
        <HomeUiIcon color={homeTheme.colors.primary} icon={item.icon} size={20} />
      </View>

      <View style={styles.copy}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
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
  cell: {
    alignItems: 'center',
    backgroundColor: homeTheme.colors.sectionSurface,
    borderRadius: 16,
    flexDirection: 'row',
    minHeight: 64,
    paddingHorizontal: homeTheme.spacing.md,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: homeTheme.colors.background,
    borderRadius: 16,
    height: 40,
    justifyContent: 'center',
    marginRight: homeTheme.spacing.sm,
    width: 40,
  },
  copy: {
    flex: 1,
    paddingVertical: homeTheme.spacing.sm,
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
    marginTop: 2,
  },
  pressed: {
    opacity: 0.84,
  },
});
