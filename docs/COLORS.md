# Màu giao diện dùng chung

`src/views/styles/colors.ts` là nơi khai báo màu của ứng dụng. Login, Senior
Home, Create Senior và Family Home dùng cùng bảng màu sáng cố định; màu không
đổi theo chế độ sáng/tối của thiết bị. Muốn đổi màu dùng chung, sửa token tại
đây để các màn hình và component nhận cùng thay đổi.

Màu thuộc View trong [kiến trúc MVC](MVC_ARCHITECTURE.md). File `colors.ts` chỉ
chứa hằng số và kiểu dữ liệu, không phụ thuộc framework. Import trực tiếp từ
`@/views/styles/colors`, hoặc từ `@/views/styles/theme` khi cần thêm spacing,
font và style dùng chung.

## Chọn token theo vai trò

| Token/nhóm | Vai trò |
| --- | --- |
| `AppColors.background` (`#f9f9ff`) | Nền màn hình |
| `AppColors.surface` (`#ffffff`) | Nền thẻ, form và khối nội dung |
| `AppColors.surfaceMuted`, `surfaceSelected` | Nền phụ và trạng thái được chọn |
| `AppColors.text` (`#111c2d`), `textSecondary` (`#3e4947`) | Chữ chính và chữ phụ |
| `AppColors.primary` (`#005c55`) | Chữ/icon thương hiệu và điểm nhấn |
| `AppColors.action` (`#0f766e`), `onPrimary` (`#ffffff`) | Nền nút chính và chữ/icon trên nút |
| `AppColors.border` | Viền form, thẻ và đường phân cách |
| `AppColors.error`, `errorSurface` | Thông báo lỗi và nền lỗi |
| `PrimaryColors` | Nền, viền và hiệu ứng nhấn màu teal |
| `StatusColors` | Nhóm màu success, warning, tired, error, info và emergency |
| `OverlayColors` | Nền header, navigation, lớp phủ và đường phân cách có độ trong suốt |

Ưu tiên token đúng vai trò thay vì viết lại mã hex trong màn hình. Ví dụ, nút
chính dùng `action`; chữ thương hiệu dùng `primary`. Trạng thái lỗi/cảnh báo
dùng `StatusColors` tương ứng để giữ màu có cùng ý nghĩa trên các màn hình.

`Colors` giữ các token cũ để những component hiện có tiếp tục hoạt động.
`useTheme()` cũng trả bảng màu cố định để giữ tương thích. Màn hình mới nên
dùng `AppColors` trực tiếp, không chọn `Colors.light`/`Colors.dark` theo thiết bị.

## Thêm màn hình

```tsx
import { StyleSheet, View } from 'react-native';

import { Button, Text } from '@/views/components/ui';
import { AppColors } from '@/views/styles/colors';

export default function ExampleScreen() {
  return (
    <View style={styles.screen}>
      <Text color={AppColors.text}>Hồ sơ người thân</Text>
      <Text color={AppColors.textSecondary}>Cập nhật thông tin chăm sóc.</Text>
      <Button title="Tiếp tục" onPress={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AppColors.background,
    padding: 20,
    gap: 16,
  },
});
```

`Text` và `Button` dùng màu mặc định từ bảng màu chung; có thể truyền màu cho
`Text` theo ý nghĩa nội dung. `Button` mặc định dùng `AppColors.action` làm nền
và `AppColors.onPrimary` cho chữ/spinner.

`app.json` đặt `userInterfaceStyle: "light"`; layout gốc dùng theme điều hướng
sáng với các token chung và status bar chữ tối. Web đặt `color-scheme: light`
trong stylesheet. Khi kiểm tra trên hệ thống bật chế độ tối, giao diện ứng dụng
vẫn cần giữ bảng màu trên.
