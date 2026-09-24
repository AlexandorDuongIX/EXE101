import React from 'react';
import { View, ViewStyle } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { Colors } from '@/constants/theme';

export interface IconProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

// Voice Over / Person Speaking Icon Component
export const VoiceOverIcon: React.FC<IconProps> = ({
  size = 20,
  color = Colors.secondary,
  style,
}) => {
  return (
    <View style={[{ width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* Person head circle */}
        <Circle cx="9" cy="8" r="3.5" stroke={color} strokeWidth="2" />
        {/* Shoulder / Body profile */}
        <Path
          d="M3 19c0-3.3 2.7-6 6-6s6 2.7 6 6"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Sound / Voice waves radiating out */}
        <Path
          d="M16 8a3.5 3.5 0 0 1 0 5"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <Path
          d="M19 6a6.5 6.5 0 0 1 0 9"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
};
