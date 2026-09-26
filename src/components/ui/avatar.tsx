import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { User } from 'lucide-react-native';
import { Text } from './text';
import { Colors } from '@/constants/theme';

export interface AvatarProps {
  /** Image URI — leave empty to show icon/initials fallback */
  source?: string | { uri: string };
  /** Diameter of the inner area in px */
  size?: number;
  /** Color of the outer ring */
  ringColor?: string;
  /** Width of the outer ring in px */
  ringWidth?: number;
  /** Initials to display when no image (e.g. "BL" for Bác Lan) */
  initials?: string;
  /** Background color for the icon/initials fallback */
  fallbackBg?: string;
  /** Icon color for the fallback person icon */
  fallbackIconColor?: string;
  /** Optional container style override */
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  size = 40,
  ringColor = Colors.surfaceContainer,
  ringWidth = 2,
  initials,
  fallbackBg = Colors.surfaceContainerHigh,
  fallbackIconColor = Colors.onSurfaceVariant,
  style,
}) => {
  const uri = source
    ? typeof source === 'string'
      ? source
      : source.uri
    : null;
  const outerSize = size + ringWidth * 2;

  return (
    <View
      style={[
        {
          width: outerSize,
          height: outerSize,
          borderRadius: outerSize / 2,
          borderWidth: ringWidth,
          borderColor: ringColor,
          overflow: 'hidden',
          backgroundColor: fallbackBg,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
          }}
          contentFit="cover"
          transition={200}
        />
      ) : initials ? (
        <Text
          variant="labelMd"
          bold
          color={fallbackIconColor}
          align="center"
          style={{ fontSize: size * 0.38, lineHeight: size * 0.45 }}
        >
          {initials}
        </Text>
      ) : (
        <User
          size={size * 0.55}
          color={fallbackIconColor}
        />
      )}
    </View>
  );
};
