import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { authTheme, type AuthIconName } from '../../theme/authTheme';
import { BottomSheetScrollView, NativeBottomSheet } from './NativeBottomSheet';

export type AuthPickerOption = {
  id: string;
  label: string;
  subtitle?: string;
  leading?: string;
  icon?: AuthIconName;
};

type AuthPickerSheetProps = {
  onClose: () => void;
  onSelect: (option: AuthPickerOption) => void;
  options: AuthPickerOption[];
  selectedId?: string | null;
  title: string;
  visible: boolean;
};

export function AuthPickerSheet({
  onClose,
  onSelect,
  options,
  selectedId,
  title,
  visible,
}: AuthPickerSheetProps) {
  return (
    <NativeBottomSheet
      initialSnapIndex={1}
      onClose={onClose}
      snapPoints={[0.48, 0.8]}
      title={title}
      visible={visible}
    >
      <BottomSheetScrollView
        bounces={false}
        contentContainerStyle={styles.optionsContent}
        showsVerticalScrollIndicator={false}
      >
        {options.map((option) => {
          const selected = option.id === selectedId;

          return (
            <Pressable
              key={option.id}
              onPress={() => {
                onSelect(option);
                onClose();
              }}
              style={({ pressed }) => [
                styles.option,
                selected && styles.optionSelected,
                pressed && styles.optionPressed,
              ]}
            >
              <View style={styles.optionLeading}>
                {option.icon ? (
                  <MaterialCommunityIcons
                    color={selected ? authTheme.colors.primary : authTheme.colors.secondary}
                    name={option.icon}
                    size={20}
                  />
                ) : option.leading ? (
                  <Text style={styles.optionLeadingText}>{option.leading}</Text>
                ) : null}
              </View>

              <View style={styles.optionContent}>
                <Text style={styles.optionLabel}>{option.label}</Text>
                {option.subtitle ? <Text style={styles.optionSubtitle}>{option.subtitle}</Text> : null}
              </View>

              <View style={styles.optionTrailing}>
                {selected ? (
                  <MaterialCommunityIcons
                    color={authTheme.colors.primary}
                    name="check-circle"
                    size={20}
                  />
                ) : (
                  <MaterialCommunityIcons
                    color={authTheme.colors.secondary}
                    name="chevron-right"
                    size={20}
                  />
                )}
              </View>
            </Pressable>
          );
        })}
      </BottomSheetScrollView>
    </NativeBottomSheet>
  );
}

const styles = StyleSheet.create({
  optionsContent: {
    gap: authTheme.spacing.sm,
    paddingBottom: authTheme.spacing.lg,
    paddingHorizontal: authTheme.spacing.md,
  },
  option: {
    alignItems: 'center',
    backgroundColor: authTheme.colors.backgroundGroup,
    borderColor: 'transparent',
    borderRadius: authTheme.radii.md,
    borderWidth: 2,
    flexDirection: 'row',
    minHeight: authTheme.sizes.menuCell,
    paddingHorizontal: authTheme.spacing.md,
  },
  optionSelected: {
    backgroundColor: authTheme.colors.secondaryButtonBackgroundHighlight,
    borderColor: authTheme.colors.primary,
  },
  optionPressed: {
    opacity: 0.86,
  },
  optionLeading: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: authTheme.spacing.sm,
    minWidth: 24,
  },
  optionLeadingText: {
    color: authTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  optionContent: {
    flex: 1,
    paddingVertical: authTheme.spacing.md,
  },
  optionLabel: {
    color: authTheme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  optionSubtitle: {
    color: authTheme.colors.secondary,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  optionTrailing: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: authTheme.spacing.sm,
  },
});
