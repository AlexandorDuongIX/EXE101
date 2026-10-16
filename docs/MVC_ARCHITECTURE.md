# Kiến trúc MVC

Ứng dụng dùng MVC để tách dữ liệu, xử lý thao tác và giao diện. Expo Router vẫn
đọc route từ `src/route`; phần triển khai màn hình nằm trong View.

## Cấu trúc thư mục

```text
src/
├── route/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── (auth)/login.tsx
│   ├── (family)/create-senior.tsx
│   ├── (family)/(tabs)/{family-home,family-medications,add-more-senior}.tsx
│   ├── (senior)/link-senior.tsx
│   ├── (senior)/(tabs)/{senior-home,senior-medications}.tsx
│   └── (examples)/explore.tsx
├── models/
│   ├── auth/                  # Session, xác thực demo, xử lý số điện thoại
│   ├── seniors/               # Hồ sơ, validation, repository
│   ├── linking/               # Mã liên kết tài khoản–hồ sơ
│   ├── schedules/             # Lịch thuốc và lịch khám
│   └── health/                # Số đo, triệu chứng, biểu đồ, lịch chăm sóc trên Home
├── controllers/
│   ├── auth/                  # AuthProvider, đăng nhập, OTP, chọn route
│   ├── family/                # State và thao tác trang quản lý người thân
│   ├── seniors/               # Hồ sơ, ảnh và điều hướng Senior
│   ├── linking/               # Liên kết tài khoản với hồ sơ
│   ├── schedules/             # State và thao tác lịch chăm sóc
│   └── health/                # Dữ liệu sức khỏe chia sẻ, Home và ghi nhận
├── views/
│   ├── screens/{auth,family,seniors,examples}/
│   ├── components/            # UI dùng chung, ui/, senior/
│   ├── hooks/                 # Theme dùng chung, trạng thái hiển thị khi cuộn
│   └── styles/                # colors.ts, theme.ts, global.css

assets/                        # Hình ảnh, font và tài nguyên tĩnh
tests/                         # Kiểm thử domain và smoke test trình duyệt
scripts/                       # Công cụ dự án, gồm reset-project.js
docs/                          # Hướng dẫn kiến trúc và luồng demo
```

`app.json`, `package.json`, lockfile, `tsconfig.json` và cấu hình công cụ nằm ở
gốc dự án để Expo và các công cụ đọc đúng vị trí. Các thư mục sinh ra như `.expo`,
`node_modules`, output bundle cũng giữ vai trò riêng, không thuộc ba lớp MVC.

## Trách nhiệm và hướng phụ thuộc

| Lớp | Trách nhiệm | Ví dụ |
| --- | --- | --- |
| Model | Kiểu dữ liệu, quy tắc thuần, dữ liệu demo, service và repository; kiểm tra dữ liệu trước khi lưu | `models/seniors/form-model.ts`, `senior-repository.ts`, `models/auth/demo-auth-service.ts` |
| Controller | Quản lý state và session; gọi Model; xử lý async, submit, OTP, điều hướng và vòng đời ảnh | `controllers/auth/auth-context.tsx`, `controllers/seniors/senior-context.tsx`, các hook `use-*-controller.ts` |
| View | Render màn hình/component, style, theme, accessibility; chuyển sự kiện UI cho Controller | `views/screens/seniors/create-senior-screen.tsx`, `views/components/ui/`, `views/hooks/use-theme.ts` |
| Route | Export View và ghép navigator/provider tại layout | `route/(family)/create-senior.tsx`, `route/_layout.tsx` |

```text
Route → View → Controller → Model
                    ↓          ↓
                   Config     Config
```

View có thể import kiểu dữ liệu và hằng số hiển thị từ Model. Model không import
React, React Native, Expo, Controller hoặc View. Controller có thể dùng React,
Expo Router và API thiết bị để điều phối thao tác, nhưng không import View.
`src/route/_layout.tsx` là điểm ghép ứng dụng: gắn providers, theme, splash và Stack.
Hooks về hiển thị thuộc View; hooks về nghiệp vụ và thao tác thuộc Controller.

Màu sắc thuộc View và được khai báo chung ở `src/views/styles/colors.ts`.
Màn hình/component dùng `AppColors`; `theme.ts` re-export các bảng màu cùng
spacing, font và style dùng chung. `useTheme()` giữ tương thích cho các
component hiện có và trả cùng bảng màu cố định. Xem [quy ước màu](COLORS.md)
khi thêm View; không đưa màu giao diện vào Model hoặc Controller.

`eslint.config.js` kiểm tra ranh giới này: Model không được import React,
React Native, Expo, Controller hay View; Controller không được import View.
Chạy lint để phát hiện phụ thuộc sai lớp trước khi thêm hoặc chuyển file.

Các group `(auth)`, `(family)`, `(senior)`, `(examples)` sắp xếp route và không thêm
phần vào URL theo [quy ước Expo Router](https://docs.expo.dev/router/basics/notation/).
Các URL `/`, `/login`, `/family-home`, `/create-senior`, `/senior-home`, `/explore`
giữ nguyên. `/` và `/login` cùng mở View đăng nhập.

`app.json` đặt custom root bằng plugin `["expo-router", { "root": "./src/route" }]`.
Expo CLI của dự án đọc cấu hình này để tìm route, export và tạo typed routes.
Khi thay đổi công cụ hoặc nâng SDK, kiểm tra lại
[cấu hình custom directory](https://docs.expo.dev/router/reference/src-directory/#custom-directory).

Mỗi URL được định nghĩa bằng một file route riêng. Route chỉ export View,
không có UI hay tạo thêm màn hình trung gian:

```tsx
// src/route/(family)/create-senior.tsx
export { default } from '@/views/screens/seniors/create-senior-screen';

// src/route/(family)/(tabs)/family-home.tsx
export { default } from '@/views/screens/family/family-home-screen';
```

Các View và component giữ các file riêng theo miền; logic vẫn ở Controller
và Model.

## Thêm chức năng

1. Thêm kiểu dữ liệu, validation và service/repository vào `src/models/<domain>/`.
2. Thêm controller hook trong `src/controllers/<domain>/`; trả state và các
   callback mà UI cần. Dùng provider khi state cần chia sẻ giữa nhiều màn hình.
3. Tạo View ở `src/views/screens/<domain>/`; dùng component chung trong
   `src/views/components/`, màu từ `AppColors` và chuyển thao tác cho Controller.
4. Thêm file route mỏng trong group của `src/route`, export View tương ứng. Nếu
   khai báo `Stack.Screen` ở layout gốc, dùng tên chứa group, ví dụ
   `(family)/create-senior`.
5. Thêm kiểm thử cho quy tắc mới và kiểm tra luồng thao tác bị ảnh hưởng.

Alias `@/` trỏ tới `src/`, ví dụ `@/models/seniors/types` hoặc
`@/controllers/seniors/use-create-senior-controller`.

## Kiểm tra

Chạy từ gốc dự án:

```powershell
npm run test:senior
npm run lint
npx tsc --noEmit
```

`tests/senior-domain.test.ts` kiểm tra nghiệp vụ và luồng demo;
`tests/run-senior-domain-tests.cjs` biên dịch và chạy chúng. Smoke test UI nằm ở
`tests/senior-ui.smoke.py`; cách khởi động app và chạy kiểm thử được ghi trong
[SENIOR_DEMO.md](SENIOR_DEMO.md). Kiểm tra bundle không thay thế việc chạy trên
thiết bị Android/iOS khi thay đổi API native.

`npm run reset-project` tạo lại scaffold MVC và màn hình trống sau lựa chọn
chuyển/xóa mã nguồn hiện có; route mới nằm trong `src/route`, cấu hình custom
root trong `app.json` được giữ lại. Đây là công cụ reset, không phải lệnh kiểm thử.
