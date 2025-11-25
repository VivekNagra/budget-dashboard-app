import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { OpaqueColorValue, StyleProp, TextStyle } from 'react-native';

// Add your SFSymbol to Ionicons mappings here.
const MAPPING = {
    // See MaterialDesign icons on https://icons.expo.fyi/
    'house.fill': 'home',
    'paperplane.fill': 'send',
    'chevron.left.forwardslash.chevron.right': 'code',
    'chevron.right': 'chevron-forward',
    'folder.fill': 'folder',
    'chart.bar.fill': 'bar-chart',
    'bubble.left.fill': 'chatbubble',
    'plus': 'add',
} as Partial<
    Record<
        import('expo-symbols').SymbolViewProps['name'],
        React.ComponentProps<typeof Ionicons>['name']
    >
>;

export type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native SFSymbols on iOS, and MaterialIcons on Android and web. This ensures a consistent look across platforms, and optimal resource usage.
 *
 * Icon `name`s are based on SFSymbols and require manual mapping to MaterialIcons.
 */
export function IconSymbol({
    name,
    size = 24,
    color,
    style,
}: {
    name: IconSymbolName;
    size?: number;
    color: string | OpaqueColorValue;
    style?: StyleProp<TextStyle>;
    weight?: 'medium';
}) {
    return <Ionicons color={color} size={size} name={MAPPING[name]} style={style} />;
}
