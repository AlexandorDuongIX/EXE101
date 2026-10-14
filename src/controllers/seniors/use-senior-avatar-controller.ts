import * as ImagePicker from 'expo-image-picker';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

import { releaseSeniorAvatarUri } from './senior-avatar-resource';

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export type SeniorAvatarControllerOptions = {
  onChange: (uri?: string) => void;
  disabled?: boolean;
  onBusyChange?: (busy: boolean) => void;
};

export function useSeniorAvatarController({
  onChange,
  disabled = false,
  onBusyChange,
}: SeniorAvatarControllerOptions) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const mounted = useRef(true);
  const pending = useRef(false);
  const requestId = useRef(0);
  const disabledRef = useRef(disabled);
  const busyCallback = useRef(onBusyChange);
  const ownedPreview = useRef<string | undefined>(undefined);

  useLayoutEffect(() => {
    disabledRef.current = disabled;
    if (disabled) requestId.current += 1;
  }, [disabled]);

  useLayoutEffect(() => {
    busyCallback.current = onBusyChange;
  }, [onBusyChange]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      requestId.current += 1;
      // The form releases discarded previews; saved ones remain in session state.
    };
  }, []);

  const chooseImage = async () => {
    if (disabledRef.current || pending.current) return;

    pending.current = true;
    const currentRequest = ++requestId.current;
    setBusy(true);
    setError(undefined);
    busyCallback.current?.(true);

    try {
      // The system image picker needs no broad library permission. Calling it
      // directly from the press also preserves browser user activation.
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        preferredAssetRepresentationMode:
          ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
      });

      if (result.canceled) return;
      const asset = result.assets[0];

      if (!mounted.current || disabledRef.current || currentRequest !== requestId.current) {
        result.assets.forEach((item) => releaseSeniorAvatarUri(item.uri));
        return;
      }

      if (!asset?.uri || (asset.type && asset.type !== 'image')) {
        result.assets.forEach((item) => releaseSeniorAvatarUri(item.uri));
        setError('Vui lòng chọn một tệp ảnh.');
        return;
      }

      if ((asset.fileSize ?? 0) > MAX_IMAGE_BYTES) {
        releaseSeniorAvatarUri(asset.uri);
        setError('Ảnh quá lớn. Vui lòng chọn ảnh có dung lượng tối đa 10 MB.');
        return;
      }

      if (Platform.OS === 'web' && (!asset.width || !asset.height)) {
        releaseSeniorAvatarUri(asset.uri);
        setError('Không thể đọc ảnh này. Vui lòng chọn ảnh JPG, PNG hoặc ảnh khác.');
        return;
      }

      releaseSeniorAvatarUri(ownedPreview.current);
      ownedPreview.current = asset.uri;
      onChange(asset.uri);
    } catch {
      if (mounted.current && !disabledRef.current && currentRequest === requestId.current) {
        setError('Không thể mở hoặc đọc ảnh. Vui lòng kiểm tra quyền truy cập ảnh rồi thử lại.');
      }
    } finally {
      pending.current = false;
      if (mounted.current) {
        setBusy(false);
        busyCallback.current?.(false);
      }
    }
  };

  const removeImage = () => {
    if (disabledRef.current || pending.current) return;
    releaseSeniorAvatarUri(ownedPreview.current);
    ownedPreview.current = undefined;
    setError(undefined);
    onChange(undefined);
  };

  return { busy, error, chooseImage, removeImage };
}
