import { Alert, Linking } from 'react-native';

export function useSpeedDialController(phoneNumber: string, onPress?: () => void) {
  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }
    Linking.openURL(`tel:${phoneNumber}`).catch(() => {
      Alert.alert('Gọi điện', `Vui lòng gọi đến số: ${phoneNumber}`);
    });
  };

  return { handlePress };
}
