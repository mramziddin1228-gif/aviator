import * as Haptics from 'expo-haptics';

export async function selectionHaptic() {
  try {
    await Haptics.selectionAsync();
  } catch {
    // Ignore unsupported environments such as web previews.
  }
}

export async function impactHaptic(style = Haptics.ImpactFeedbackStyle.Light) {
  try {
    await Haptics.impactAsync(style);
  } catch {
    // Ignore unsupported environments such as web previews.
  }
}
