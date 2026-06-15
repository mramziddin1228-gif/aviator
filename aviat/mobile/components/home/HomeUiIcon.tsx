import { MaterialCommunityIcons } from '@expo/vector-icons';

import { type HomeUiIconSpec, homeTheme } from '../../theme/homeTheme';
import { HomeBrandIcon } from './HomeBrandIcon';

type HomeUiIconProps = {
  color?: string;
  icon: HomeUiIconSpec;
  size?: number;
};

export function HomeUiIcon({
  color = homeTheme.colors.secondary,
  icon,
  size = 20,
}: HomeUiIconProps) {
  const resolvedSize = icon.size ?? size;

  if (icon.kind === 'brand') {
    return <HomeBrandIcon color={color} name={icon.name} size={resolvedSize} />;
  }

  return <MaterialCommunityIcons color={color} name={icon.name} size={resolvedSize} />;
}
