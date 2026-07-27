import { View, StyleSheet, type ViewProps } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const flatStyle = StyleSheet.flatten(style) || {};
  const hasBg = 'backgroundColor' in flatStyle;

  const themeBg = useThemeColor({ light: lightColor, dark: darkColor }, 'background');
  const backgroundColor = hasBg
    ? flatStyle.backgroundColor
    : (lightColor || darkColor ? themeBg : 'transparent');

  return <View style={[style, { backgroundColor }]} {...otherProps} />;
}

