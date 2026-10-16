# Home sức khỏe của Family và Senior

Family là người chăm sóc trong luồng này. Chọn người thân trên Home rồi dùng **Ghi chỉ số** hoặc **Ghi triệu chứng**. Senior xem dữ liệu của đúng hồ sơ đã liên kết bằng mã; không có thao tác ghi nhận ở vai trò này.

Mỗi số đo lưu người nhận, thời điểm đo, loại chỉ số, giá trị, đơn vị và ghi chú. Huyết áp có hai giá trị; đường huyết lưu thêm đơn vị mmol/L hoặc mg/dL và thời điểm so với bữa ăn. Đổi loại chỉ số hoặc đơn vị sẽ xóa số đang nhập để tránh dùng nhầm giá trị. Ngày và giờ dùng picker; không lưu thời điểm ở tương lai.

Nhật ký triệu chứng hỗ trợ nhiều triệu chứng, triệu chứng khác, mức độ tự ghi nhận và ghi chú. **Hôm nay thấy ổn** là một bản ghi chủ động; ngày chưa có nhật ký không được suy diễn là không có triệu chứng.

Ô tâm thu, tâm trương và nhịp tim giới hạn 3 chữ số nguyên dương; kiểm tra dữ liệu trước khi lưu cũng từ chối số quá dài, số thập phân hoặc giá trị không hữu hạn cho các chỉ số này. Đây là giới hạn định dạng nhập liệu, không phải ngưỡng đánh giá sức khỏe.

Home hiển thị số đo mới nhất theo **thời điểm đo**, không theo thứ tự nhập. Biểu đồ và nhật ký lọc 7/30/90 ngày theo ngày địa phương. Biểu đồ huyết áp có hai đường; đường huyết chỉ vẽ các số đo cùng đơn vị với bản ghi gần nhất. Các bản ghi khác đơn vị vẫn có trong nhật ký. Không tự gán nhãn bình thường, nguy hiểm hoặc chẩn đoán từ số đo.

Lịch thuốc tiếp theo và lịch khám sắp tới lấy từ lịch của đúng hồ sơ. Lịch thuốc tôn trọng ngày bắt đầu/kết thúc; không suy diễn đã uống hay bỏ liều. Các số đo, thuốc, lời nhắn, danh bạ và thời gian đo mẫu trước đây đã được gỡ khỏi Home; chưa có dữ liệu sẽ hiển thị trạng thái trống.

Ứng dụng vẫn chưa có backend. Dữ liệu ở bộ nhớ trong cùng phiên, giữ khi đăng xuất/đăng nhập để thử hai vai trò; tải lại hoặc khởi động lại sẽ mất dữ liệu. Hai thiết bị chưa đồng bộ. Repository tách khỏi giao diện, cần thay bằng backend có xác thực quyền khi triển khai thực tế.

Kiểm tra bằng `npx expo lint`, `npx tsc --noEmit`, `node tests/run-health-domain-tests.cjs`. Kiểm thử giao diện dùng `python tests/health-ui.smoke.py --base-url http://localhost:8084` với web export đang được phục vụ.
