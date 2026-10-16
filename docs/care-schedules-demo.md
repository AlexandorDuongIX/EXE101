# Lịch chăm sóc và liên kết senior

## Thử luồng demo

1. Đăng nhập vai trò **Con cái / Người thân**, tạo hồ sơ người thân.
2. Mở **Thuốc**, chọn hồ sơ rồi dùng **Lịch thuốc** hoặc **Lịch khám** để tạo, xem, sửa, xóa lịch. Chạm vào ô ngày để mở lịch, chạm vào ô giờ để chọn giờ và phút. Ngày hiển thị theo ngày/tháng/năm. Lịch thuốc dùng **Thêm giờ uống** để chọn từng giờ; chạm giờ đã chọn để sửa hoặc nhấn dấu × để bỏ. Giờ trùng được giữ một lần, tối đa 12 giờ mỗi ngày. Ngày kết thúc là tùy chọn và có thể bỏ chọn.
3. Mở **Gia đình**, chọn hồ sơ để lấy mã liên kết 6 số. Mã có hiệu lực 10 phút và dùng một lần. **Tạo mã mới** sẽ vô hiệu mã trước.
4. Nhấn avatar → **Đăng xuất**, đăng nhập vai trò **Người cao tuổi** trong cùng ứng dụng đang mở. OTP hiện là demo: nhập đủ 6 chữ số.
5. Senior chưa liên kết phải nhập mã trước khi vào Home. Sau khi liên kết, mục **Thuốc** hiển thị lịch của đúng hồ sơ và chỉ cho xem.

Mỗi tài khoản senior liên kết một hồ sơ; mỗi hồ sơ nhận một tài khoản senior. Sau 5 lần nhập sai, tài khoản tạm chờ 10 phút. Khi đăng nhập lại trong cùng phiên, tài khoản đã liên kết đi thẳng vào Home.

Tài khoản Con cái đã có ít nhất một hồ sơ người thân cũng vào thẳng Home khi đăng nhập lại; chỉ tài khoản chưa có hồ sơ mới mở màn hình tạo senior. Vẫn thêm người thân qua **Gia đình** → **Thêm người thân**.

## Phạm vi dữ liệu

Hiện chưa có backend. Hồ sơ, mã, liên kết và lịch lưu trong bộ nhớ của phiên ứng dụng. Đăng xuất giữ dữ liệu để thử đổi vai trò; tải lại trang hoặc khởi động lại ứng dụng sẽ xóa dữ liệu demo. Hai thiết bị hoặc hai tab riêng chưa chia sẻ dữ liệu.

Lịch thuốc và lịch khám là dữ liệu nhập tay. Lịch gắn với `seniorId`; quyền xem của senior dựa trên liên kết tài khoản, không dựa trên số điện thoại trùng nhau.

Các repository ở `src/models/seniors`, `src/models/linking`, `src/models/schedules` tách khỏi giao diện. Khi nối NoSQL, thay các repository bằng API/subscription, lưu quan hệ UID–seniorId và đưa việc cấp/đổi/nhận mã vào backend. Backend cần xác thực quyền, tạo mã an toàn, giới hạn lượt thử và giao dịch dùng-mã-một-lần; logic demo ở client không thay thế được các bước này.

## Kiểm tra

```sh
npx expo lint
npx tsc --noEmit
node tests/run-senior-domain-tests.cjs
node tests/run-linking-domain-tests.cjs
node tests/run-schedule-domain-tests.cjs
python tests/schedule-ui.smoke.py --base-url http://localhost:8084
```

Browser smoke test chạy trên web export đã được phục vụ ở URL chỉ định, dùng dữ liệu giả và không tự khởi động server.
