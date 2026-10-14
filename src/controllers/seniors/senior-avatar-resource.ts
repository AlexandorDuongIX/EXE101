import { Platform } from 'react-native';

/** Release a discarded web preview. Submitted previews belong to session state. */
export function releaseSeniorAvatarUri(uri?: string) {
  if (
    Platform.OS === 'web' &&
    uri?.startsWith('blob:') &&
    typeof URL !== 'undefined' &&
    typeof URL.revokeObjectURL === 'function'
  ) {
    URL.revokeObjectURL(uri);
  }
}
