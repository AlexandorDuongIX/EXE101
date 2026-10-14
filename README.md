# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

Edit screens inside **src/views/screens** and define their URLs inside **src/route**. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Tổ chức mã nguồn theo MVC

```text
src/
├── route/        # Route và layout Expo Router
├── models/       # Kiểu dữ liệu, quy tắc nghiệp vụ, service và repository
├── controllers/  # State, xử lý thao tác, session và điều hướng
├── views/        # screens/, components/, hooks/ giao diện, styles/
└── config/       # Cờ cấu hình ứng dụng
```

Model và Controller được chia tiếp theo miền `auth`, `family`, `seniors` khi cần.
View lấy state và các thao tác từ controller hooks. Model giữ quy tắc và dữ liệu,
không phụ thuộc React, Expo, Controller hay View; Controller không import View.
Xem [kiến trúc MVC, quy tắc phụ thuộc và cách thêm chức năng](docs/MVC_ARCHITECTURE.md).

Màu giao diện dùng chung trong `src/views/styles/colors.ts`. Login, Senior Home,
Create Senior và Family Home dùng bảng màu sáng cố định, kể cả khi thiết bị bật
chế độ tối. Khi thêm màn hình, dùng `AppColors` và các nhóm màu ngữ nghĩa;
xem [quy ước màu và ví dụ](docs/COLORS.md).

`src/route` chứa các route Expo Router và layout gốc:

```text
src/route/
├── _layout.tsx
├── index.tsx
├── (auth)/
│   └── login.tsx
├── (family)/
│   ├── family-home.tsx
│   └── create-senior.tsx
├── (senior)/
│   └── senior-home.tsx
└── (examples)/
    └── explore.tsx
```

Các thư mục trong ngoặc là [route groups](https://docs.expo.dev/router/basics/notation/),
giúp sắp xếp màn hình mà không thêm phần vào URL. Các đường dẫn `/`, `/login`,
`/family-home`, `/create-senior`, `/senior-home` và `/explore` giữ nguyên.
`index.tsx` và `(auth)/login.tsx` cùng dùng màn đăng nhập.

`app.json` cấu hình plugin `["expo-router", { "root": "./src/route" }]` để Expo
Router đọc thư mục này. [Custom root](https://docs.expo.dev/router/reference/src-directory/#custom-directory)
phụ thuộc vào Expo CLI của dự án; giữ cấu hình đó khi thay đổi công cụ hoặc reset.

Mỗi file route chỉ export màn hình từ `src/views/screens/<domain>/`:

```tsx
// src/route/(family)/create-senior.tsx
export { default } from '@/views/screens/seniors/create-senior-screen';

// src/route/(family)/family-home.tsx
export { default } from '@/views/screens/family/family-home-screen';
```

Hai file route cần riêng để Expo Router tạo `/create-senior` và `/family-home`;
chúng không tạo thêm màn hình trung gian. Các View và component tiếp tục nằm
trong những file riêng theo cấu trúc MVC.
Khi thêm màn hình, tạo Model, Controller và View theo trách nhiệm rồi thêm
file route trong group tương ứng.
Các group hiện không có `_layout.tsx` riêng; tất cả màn dùng Stack trong
`src/route/_layout.tsx`. Nếu cấu hình `Stack.Screen` ở layout gốc, tên screen phải
gồm group, ví dụ `(family)/create-senior`; các lệnh điều hướng vẫn dùng URL
`/create-senior`.

## Demo tạo hồ sơ người thân

Đăng nhập với loại tài khoản **Con cái / Người thân**, nhập mã OTP demo gồm 6 chữ
số bất kỳ để mở form tạo Senior. Hồ sơ được lưu trong bộ nhớ của phiên và hiển
thị ở trang quản lý người thân. Xem [hướng dẫn luồng demo, cờ cấu hình, service và
kiểm thử](docs/SENIOR_DEMO.md). Checkbox SOS chỉ lưu cờ demo, chưa cấu hình người
nhận cảnh báo.

## Dependency audits

Keep dependency updates compatible with Expo SDK 57. Use `npx expo install --check`
and `npx expo-doctor` to check compatibility. Avoid `npm audit fix --force`: the
current audit proposes downgrading Expo to SDK 44 and upgrading Expo Router to SDK
58, which would break the SDK 57 dependency set.

`npm warn ERESOLVE` means dependency peer versions conflict. If a forced audit fix
changes the Expo, Router, React Native, Reanimated, or Worklets versions, restore
the SDK 57 versions in `package.json` before installing. Use `npx expo install`
for new libraries and `npx expo install --fix` to align versions with the SDK.

The reviewed `unrs-resolver@1.12.2` postinstall script is approved explicitly in
`allowScripts`. It prepares the platform-specific native binding used by the
ESLint TypeScript import resolver. npm pins this approval to the reviewed version;
review the script again before approving a newer version. See
[npm install-script approvals](https://docs.npmjs.com/cli/v11/commands/npm-install-scripts/).

ESLint 9 is deprecated, but the current Expo lint configuration uses
`eslint-plugin-react@7`, whose peer dependency does not support ESLint 10. Keep
ESLint 9 until that plugin supports the newer major version. The package funding
message is informational and needs no fix.

The scoped `xcode@3.0.1` override uses `uuid@11.1.1` to address
[GHSA-w5hq-g745-h8pq](https://github.com/advisories/GHSA-w5hq-g745-h8pq) and the UUID
deprecation warning. Version 11 retains CommonJS support and the `v4()` API used by
Xcode tooling. Recheck this override when upgrading `xcode`.

As of October 14, 2026, other audit findings remain:

- [braces](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) and
  [node-forge](https://github.com/advisories/GHSA-86w9-cpqp-85rv) have no published
  patched versions. These packages are pulled in by Expo's build tooling.
- [decode-uri-component](https://github.com/advisories/GHSA-vcc3-ghjq-m6fr) is fixed
  in 0.5.0, but that version exports an ESM default. SDK 57's Expo Router uses
  `query-string@7`, which expects a callable CommonJS decoder. A direct decoder
  override or `query-string` major upgrade would break that interface. Recheck
  the upstream Router fix during a planned Expo SDK upgrade.

`npm audit` counts affected parent packages as well as the vulnerable packages,
so its total is larger than the number of distinct advisories. Continue checking
`npm audit` for upstream fixes; these remaining findings are unresolved.

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command asks whether to move the current `src` and `scripts` directories to
`example` or delete them. It then creates an MVC scaffold under `src`, with a thin
`src/route/index.tsx` route exporting `src/views/screens/home-screen.tsx` and an Expo
Router layout. The custom route root in `app.json` is preserved. Use it only when
you intend to reset the current application.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
