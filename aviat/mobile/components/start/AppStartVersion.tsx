import { I18nManager, StyleSheet, Text } from 'react-native';

import { appStartTheme } from '../../theme/appStartTheme';

type AppStartVersionProps = {
  label: string;
};

export function AppStartVersion({ label }: AppStartVersionProps) {
  return (
    <Text
      numberOfLines={1}
      style={[
        styles.label,
        { textAlign: I18nManager.isRTL ? 'left' : 'right' },
      ]}
    >
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  label: {
    color: appStartTheme.colors.staticWhite80,
    fontSize: appStartTheme.version.fontSize,
    lineHeight: appStartTheme.version.lineHeight,
    marginBottom: appStartTheme.spacing.s4,
    marginTop: appStartTheme.spacing.s4,
    paddingHorizontal: appStartTheme.spacing.s12,
    width: '100%',
  },
});
