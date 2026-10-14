# Luồng tạo hồ sơ người thân trong bản demo

## Các file triển khai

| Nhóm | File thêm hoặc chỉnh sửa |
| --- | --- |
| Route | `src/route/(family)/create-senior.tsx`, `src/route/(family)/family-home.tsx`, `src/route/(auth)/login.tsx`, `src/route/index.tsx`, `src/route/_layout.tsx` |
| View đăng nhập và quản lý người thân | `src/views/screens/auth/login-screen.tsx`, `src/views/screens/family/family-home-screen.tsx` |
| Model xác thực | `src/models/auth/types.ts`, `src/models/auth/demo-auth-service.ts`, `src/models/auth/phone-model.ts` |
| Controller đăng nhập | `src/controllers/auth/auth-context.tsx`, `login-destination.ts`, `use-login-controller.ts`, `use-otp-controller.ts` |
| Model hồ sơ Senior | `src/models/seniors/types.ts`, `form-model.ts`, `senior-repository.ts` |
| Controller hồ sơ và danh sách | `src/controllers/seniors/senior-context.tsx`, `use-create-senior-controller.ts`, `use-senior-avatar-controller.ts`, `senior-avatar-resource.ts`; `src/controllers/family/use-family-home-controller.ts` |
| View hồ sơ Senior | `src/views/screens/seniors/create-senior-screen.tsx`, `src/views/components/senior/senior-avatar-picker.tsx`, `src/views/styles/colors.ts` |
| Cấu hình | `src/config/demo-flags.ts`, `app.json`, `package.json`, `package-lock.json` |
| Component tái sử dụng | `src/views/components/ui/button.tsx`, `input.tsx`, `chip.tsx`, `checkbox.tsx`; `src/views/components/otp-modal.tsx` |
| Kiểm thử | `tests/senior-domain.test.ts`, `run-senior-domain-tests.cjs`, `senior-ui.smoke.py`, `serve-web-export.py` |
| Hướng dẫn | `README.md`, `docs/MVC_ARCHITECTURE.md`, `docs/SENIOR_DEMO.md`, `docs/COLORS.md` |

## Điểm vào và điều hướng

- Plugin `expo-router` trong `app.json` đặt `root: "./src/route"`. Hai route
  `/create-senior` và `/family-home` export các View tương ứng từ file riêng;
  mỗi URL giữ một file route riêng.
- `/login` và `/` cùng export `src/views/screens/auth/login-screen.tsx` qua
  các file route. Các route group không làm thay đổi URL. Người dùng phải chọn loại tài khoản
  demo; `family` là Con cái, `senior` là người cao tuổi, `caregiver` là Điều dưỡng.
- `src/controllers/auth/use-login-controller.ts` chụp lại số điện thoại và vai trò khi mở OTP. Chỉ callback
  xác thực thành công gọi `getLoginDestination()`; không có redirect theo cờ demo
  trong effect, refresh, render hoặc chuyển tab.
- `src/config/demo-flags.ts` chứa
  `DEMO_FORCE_CREATE_SENIOR_AFTER_CHILD_LOGIN = true`. Đổi thành `false` để đưa
  Con cái đến `/family-home` sau đăng nhập. Senior vẫn vào `/senior-home`; Điều
  dưỡng giữ thông báo đăng nhập thành công trên màn đăng nhập hiện có.
- Demo bật: mỗi lần Con cái đăng nhập thành công đều vào `/create-senior`, kể cả
  đã có hồ sơ trong phiên. Tạo thành công thay route bằng `/family-home?created=1`,
  hiện “Đã tạo hồ sơ người thân” và bản ghi vừa tạo. Quay lại/Để sau đến danh sách;
  thêm hồ sơ khác là hành động chủ động của người dùng.

## Session và service

Ứng dụng chưa có backend/auth API. `demo-auth-service.ts` chấp nhận mã OTP gồm
6 chữ số bất kỳ và không gửi SMS/cuộc gọi. Vai trò demo được ghi vào session sau
callback xác thực; quan hệ trong form không thay đổi vai trò tài khoản.

`SeniorProvider` sử dụng `createDemoSeniorRepository()` trong bộ nhớ. Repository
đọc chủ sở hữu từ session đang hoạt động, từ chối tài khoản không phải Con cái,
kiểm tra dữ liệu ở biên service và không chấp nhận owner ID từ form. ID Senior
khác ID tài khoản. Các tài khoản chỉ nhìn thấy hồ sơ mình quản lý.

Hồ sơ/ảnh được giữ trong bộ nhớ qua các lần đăng xuất/đăng nhập trong cùng phiên
ứng dụng. Tải lại trang hoặc mở lại ứng dụng sẽ mất session và hồ sơ. Không lưu
thông tin sức khỏe vào localStorage/AsyncStorage, console hay analytics. Dùng
thông tin giả để demo. `avatarUri` chỉ là preview trong phiên, chưa phải ảnh đã
upload hoặc URL bền vững. Preview web bị bỏ được thu hồi; ảnh đã lưu thuộc bản
ghi trong phiên.

Khi tích hợp backend, thay auth mock bằng xác thực thật, lấy role từ phản hồi
server/token, thay repository bằng API và xác định owner từ phiên trên server.
Ảnh cần upload qua API rồi lưu file ID/URL do server trả về. UI đã có trạng thái
loading, lỗi, giữ dữ liệu để thử lại và chặn bấm tạo liên tiếp.

## Ngữ nghĩa SOS

`isPrimarySosContact` chỉ lưu cờ demo từ checkbox trên hồ sơ. Senior là người
được chăm sóc, không tự trở thành người nhận cuộc gọi/cảnh báo SOS. Chưa có
EmergencyContact API, số điện thoại người nhận hoặc chức năng gửi SOS trong
luồng này. Đánh dấu checkbox không kích hoạt SOS và không xác nhận SOS hoạt động.

## Kiểm tra

```powershell
npm run test:senior
npm run lint
npx tsc --noEmit
npx expo-doctor
npx expo export --platform web --platform android --output-dir .expo/senior-feature-build
```

Các kiểm thử domain kiểm tra vai trò/cờ demo, đăng nhập lại, snapshot OTP, trường
bắt buộc, năm sinh không có tuổi tối thiểu, bệnh nền loại trừ/trùng lặp, chủ sở
hữu, chống giả owner ID, submit đồng thời, phiên thay đổi và sao chép dữ liệu.

Kiểm thử trình duyệt sử dụng Python Playwright có Chromium. Chạy Expo trước:

```powershell
npx expo start --port 8083
# Trong terminal khác, với Python Playwright và Chromium đã được cài:
python tests/senior-ui.smoke.py --base-url http://localhost:8083
```

Script dùng dữ liệu giả; ảnh kiểm thử và screenshot nằm trong `.expo/senior-ui-tests`
(đã được Git bỏ qua). Các tình huống gồm validation, quan hệ Khác, bệnh nền loại
trừ, chọn/xóa/hủy ảnh, submit lặp, đăng nhập lại khi đã có hồ sơ, vai trò khác,
refresh, guard route trực tiếp, bố cục mobile, bật chế độ tối của hệ thống nhưng
giữ màu sáng cố định và hủy OTP trước xác nhận. Các màn dùng chung bảng màu ở
`src/views/styles/colors.ts`; xem [quy ước màu](COLORS.md).

Export Web/Android là kiểm tra bundle, không phải build APK/IPA hoặc kiểm tra trên
thiết bị thật. Picker thư viện ảnh sử dụng `expo-image-picker` tương thích SDK 57;
plugin không bật camera hay microphone. Cần kiểm tra quyền/picker trên thiết bị
khi triển khai bản native.
