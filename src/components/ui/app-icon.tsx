import React from 'react';
import { View, ViewStyle } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Rect,
  G,
  Path,
  Circle,
} from 'react-native-svg';

export interface AppIconProps {
  size?: number;
  style?: ViewStyle;
}

export const AppIcon: React.FC<AppIconProps> = ({ size = 80, style }) => {
  const scale = size / 160;

  return (
    <View style={[{ width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox="0 0 160 160">
        <Defs>
          <LinearGradient id="careGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#0D9488" />
            <Stop offset="100%" stopColor="#047857" />
          </LinearGradient>
          <LinearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#F59E0B" />
            <Stop offset="100%" stopColor="#EA580C" />
          </LinearGradient>
        </Defs>

        <Rect width="160" height="160" rx="36" fill="#F0FDFA" />

        <G transform="translate(10, 10)">
          {/* Outer protecting arc */}
          <Path
            d="M 70 20 A 50 50 0 1 1 25 95"
            fill="none"
            stroke="url(#careGrad)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <Circle cx="25" cy="95" r="7" fill="#0D9488" />

          {/* Heart in center symbolizing family love & care */}
          <Path
            d="M 70 52 C 70 52, 60 40, 48 40 C 37 40, 32 49, 32 58 C 32 75, 55 92, 70 102 C 85 92, 108 75, 108 58 C 108 49, 103 40, 92 40 C 80 40, 70 52, 70 52 Z"
            fill="url(#heartGrad)"
          />

          {/* Cross/Plus accent for healthcare inside heart */}
          <Path
            d="M 70 58 L 70 78 M 60 68 L 80 68"
            stroke="#FFFFFF"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
        </G>
      </Svg>
    </View>
  );
};
