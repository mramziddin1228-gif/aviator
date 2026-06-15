import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  authTheme,
  registrationTypeOptions,
  type RegistrationTypeOption,
} from '../../theme/authTheme';
import { AuthBrandIcon } from './AuthBrandIcon';

type RegistrationTypeChoiceProps = {
  onOpenLogin: () => void;
  onSelect: (option: RegistrationTypeOption) => void;
};

export function RegistrationTypeChoice({ onOpenLogin, onSelect }: RegistrationTypeChoiceProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{authTheme.strings.registration}</Text>

      <View style={styles.list}>
        {registrationTypeOptions.map((option) => (
          <Pressable
            key={option.id}
            onPress={() => onSelect(option)}
            style={({ pressed }) => [styles.optionCell, pressed && styles.pressed]}
          >
            <View style={styles.iconWrap}>
              <AuthBrandIcon
                color={authTheme.colors.primary}
                name={option.iconName}
                size={20}
              />
            </View>

            <Text style={styles.optionTitle}>{option.title}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.footerText}>{authTheme.strings.alreadyHaveAnAccount}</Text>
        <Pressable onPress={onOpenLogin} style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]}>
          <Text style={styles.linkButtonText}>{authTheme.strings.login}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  title: {
    color: authTheme.colors.textPrimary,
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 38,
    minHeight: authTheme.sizes.titleRegister,
  },
  list: {
    gap: authTheme.spacing.sm,
    marginTop: authTheme.spacing.md,
  },
  optionCell: {
    alignItems: 'center',
    backgroundColor: authTheme.colors.backgroundContent,
    borderRadius: authTheme.radii.md,
    flexDirection: 'row',
    minHeight: authTheme.sizes.menuCell,
    paddingHorizontal: authTheme.spacing.md,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: authTheme.colors.background,
    borderRadius: authTheme.radii.full,
    height: authTheme.sizes.social,
    justifyContent: 'center',
    marginRight: authTheme.spacing.sm,
    width: authTheme.sizes.social,
  },
  optionTitle: {
    color: authTheme.colors.textPrimary,
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  footerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: authTheme.spacing.xl,
    rowGap: authTheme.spacing.xs,
  },
  footerText: {
    color: authTheme.colors.secondary,
    fontSize: 14,
    lineHeight: 20,
    maxWidth: authTheme.sizes.footerMaxWidth,
    minHeight: authTheme.sizes.social,
    paddingTop: authTheme.spacing.sm,
    textAlign: 'right',
  },
  linkButton: {
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: authTheme.sizes.footerMaxWidth,
    minHeight: authTheme.sizes.social,
    paddingHorizontal: authTheme.spacing.sm,
  },
  linkButtonText: {
    color: authTheme.colors.secondaryButtonForeground,
    fontSize: 16,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.82,
  },
});
