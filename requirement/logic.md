# TÀI LIỆU LOGIC VẬN HÀNH — ENGLISH GAME DINOSAUR

## 1. Luồng trạng thái tổng thể (State Machine)

Ứng dụng vận hành theo State Machine tập trung (`src/core/state-manager.ts`), đảm bảo tại mỗi thời điểm chỉ có duy nhất một màn hình hiển thị:

`LOGIN` → `MAIN_MENU` → (`PLAYING` → `GAME_OVER`) / `SKIN_COLLECTION` / `LEADERBOARD` / `CERTIFICATE` / `PADDLE_BUZZER`.

- Đã có hồ sơ lưu trên máy thì vào thẳng `MAIN_MENU`.
- Chọn chế độ chơi ngay tại `MAIN_MENU`; hướng dẫn ngắn hiển thị ở trạng thái "Chạm để bắt đầu" của `PLAYING` và trong bảng "Cách chơi".
- Bốn màn `MAIN_MENU`, `SKIN_COLLECTION`, `LEADERBOARD`, `CERTIFICATE` chuyển qua lại bằng thanh tab dưới đáy.

## 2. Quy tắc Đăng nhập & Hồ sơ Người chơi

- Màn hình đăng nhập chỉ yêu cầu đúng **2 trường bắt buộc**:
  1. **Họ và tên** (`fullName`)
  2. **Lớp** (`className`)
- Tuyệt đối không có trường ID tài khoản và không có trường OTP.
- Định danh nội bộ (`internalPlayerId`) được tự động sinh hoặc ánh xạ bởi `AuthService` phía ứng dụng mà không yêu cầu người chơi nhập.

## 3. Logic Gameplay & Câu hỏi khi nhảy

- Khủng long chạy liên tục trên HTML5 Canvas (`requestAnimationFrame` kết hợp `delta time`).
- Người chơi chạm màn hình (hoặc Space/↑) để nhảy bất kỳ lúc nào khi đang chạy trên mặt đất.
- Mỗi lần nhảy, game dừng lại và hiện một câu hỏi Tiếng Anh 10 (`{ q: string, a: string[], c: number }`). Cú nhảy chỉ diễn ra sau khi trả lời, nên thời điểm nhảy giữ nguyên như lúc chạm.
  - Câu hỏi theo các dạng bài của đề kiểm tra (phát âm, trọng âm, từ vựng, ngữ pháp, đồng nghĩa/trái nghĩa, tìm lỗi sai, giao tiếp); câu lệnh dùng chung nằm trong `data/question-formats.js`. Trong `q` và `a`, phần đặt trong `{…}` được gạch chân và ký tự xuống dòng tách câu lệnh với câu đề.
  - **Trả lời đúng**: +1 điểm.
  - **Trả lời sai hoặc hết thời gian**: không có điểm, hiện đáp án đúng; khủng long vẫn nhảy và chạy tiếp.
- Chỉ thua (`GAME_OVER`) khi khủng long đâm vào chướng ngại vật (xương rồng, đá, thằn lằn bay).
- Ba chế độ chơi (`BASIC`, `MEDIUM`, `HARDCORE`) khác nhau về tốc độ, mật độ chướng ngại vật và thời gian trả lời (15s / 10s / 7s), cấu hình trong `data/config/game-config.js`.

### Khối năng lượng (Power-up)

- Thỉnh thoảng một khối năng lượng lơ lửng giữa hai chướng ngại vật (`POWER_UP_SPAWN`); chạy bên dưới không chạm, phải nhảy lên để nhặt.
- Loại khối chọn theo trọng số trong `POWER_UPS`:
  - `SHIELD`: chặn 1 lần va chạm, chướng ngại vật bị phá vỡ.
  - `SLOW`: giảm tốc độ chạy trong vài giây (tăng/giảm tốc mượt).
  - `HINT` (50/50): loại 2 đáp án sai ở các câu hỏi khi nhảy tiếp theo.
  - `TIME`: cộng thêm giây cho các câu hỏi khi nhảy tiếp theo.
  - `STAR`: bất tử trong vài giây, chạy xuyên phá chướng ngại vật.
- Không ảnh hưởng cách tính điểm (vẫn là số câu trả lời đúng) và không áp dụng cho thử thách cột mốc.

### Môi trường nền

- Phần lớn thời gian là nền thường. Hết mỗi đoạn nền thường (tính theo thời gian chạy) có xác suất chuyển sang một môi trường đặc biệt chọn theo trọng số: mưa thiên thạch, mưa sao băng, dưới đáy biển, mưa hoa anh đào; hết thời lượng thì quay về nền thường (`ENVIRONMENT_SCHEDULE`, `ENVIRONMENTS`).
- Mọi môi trường giữ phong cách doodle của nền thường: nền phẳng, nét pixel một màu mực, chỉ thêm một màu nhấn cho hiệu ứng đặc trưng.
- Môi trường mới tràn vào từ mép phải sang trái cùng tốc độ chạy; mép chuyển cảnh là dải ô pixel lật dần kiểu 8-bit. Môi trường chỉ mang tính trang trí, không thêm chướng ngại vật.

## 4. Hệ thống Điểm & Thử thách Cột mốc (Milestones)

- Điểm của một lượt = **số câu trả lời đúng** (kể cả câu đúng trong thử thách cột mốc). Kỷ lục và bảng xếp hạng dùng điểm này, không tính quãng đường chạy.

| Cột mốc | Số câu hỏi phụ | Điều kiện vượt mốc |
|---|---:|---:|
| 10 câu đúng | 5 câu | Đúng tối thiểu 4/5 câu |
| 30 câu đúng | 10 câu | Đúng tối thiểu 8/10 câu (80%) |
| 60 câu đúng | 15 câu | Đúng tối thiểu 12/15 câu (80%) |
| Từ 100 câu đúng (mỗi nấc +50) | 20 câu | Đúng tối thiểu 16/20 câu (80%) |

- Vượt mốc được tính vào số cột mốc đã chinh phục, dùng để mở skin và cấp chứng chỉ.
- Mỗi cột mốc sử dụng khóa định danh duy nhất (`triggerKey`, ví dụ `MILESTONE_100@10`, `MILESTONE_2000_PLUS@100`, `MILESTONE_2000_PLUS@150`) để không mở lặp trong cùng một lượt.

## 5. Hệ thống Skin & Bộ sưu tập

- Gồm 5 cấp độ: `Basic`, `Rare`, `Legendary`, `God`, `Secret`.
- Chỉ những skin đã thỏa mãn điều kiện mở khóa mới hiển thị nút **Trang bị**.
- Khi nhấn **Trang bị**, skin được lưu ngay vào `localStorage` và cập nhật trực tiếp lên hình ảnh nhân vật ở cả Menu, Chứng chỉ và trong Canvas khi chạy.

## 6. Paddle Buzzer (thi theo nhóm bằng bảng bìa)

- Mở từ `MAIN_MENU`. Máy đặt trên bàn giáo viên, màn hình và camera cùng quay về phía lớp; không cần máy chiếu hay thiết bị cho học sinh.
- Lớp chia sẵn 12 nhóm, mỗi dãy bàn của một khối là một nhóm 4-5 bạn (`PADDLE_BUZZER.groupCount`), không phải nhập số nhóm. Mỗi nhóm cầm một bảng bìa in từ nút **In bảng**: mặt trước là mã vuông 4x4 (số mã = số nhóm − 1), mặt sau là số nhóm. Bốn cạnh ghi A/B/C/D; cạnh nào quay lên trên là đáp án của nhóm.
- Câu hỏi lấy ngẫu nhiên từ kho câu hỏi gameplay (Unit 1 - Unit 5). Mỗi câu đi qua ba bước, chuyển bằng Space/Enter hoặc nút trên màn hình:
  1. **Đọc đề**: chỉ hiện câu đề, giáo viên đọc to rồi nhấn Space. Máy không tự đọc.
  2. **Trả lời**: chuông kêu, bốn đáp án hiện ra, đồng hồ đếm ngược. Nhóm giơ bảng và giữ yên thì được chốt; đã chốt không đổi được. Bảng giơ sẵn từ lúc đọc đề phải hạ xuống rồi giơ lại. Hết giờ, đủ mọi nhóm hoặc giáo viên chốt sớm thì sang bước 3.
  3. **Công bố**: hiện đáp án đúng và lựa chọn của từng nhóm. Đúng +1 điểm, nhóm đúng và nhanh nhất +2 điểm nữa.
- Quét bảng: mỗi khung hình camera được cắt thành các dải dọc chồng mép và quét song song trên nhiều worker (số dải theo số nhân của máy), kèm một lượt quét cả khung hình thu nhỏ cho bảng đứng sát máy. Kết quả của một khung hình được gộp rồi mới dùng, và tính giờ theo lúc chụp khung hình, nên bảng gần hay xa đều được xếp nhanh chậm như nhau. Màn chuẩn bị hiện độ phân giải và số lần quét mỗi giây.
- Chốt đáp án: cùng một chữ được thấy ít nhất 3 lần trong 0,3 giây (`holdMs`). Một lần đọc lệch lẻ loi thì bỏ qua, hụt vài khung hình không làm đếm lại. Bảng cầm chéo gần 45° không rõ chọn chữ nào nên không được tính cho đến khi cầm thẳng lại.
- Lúc hỏi đáp, màn hình chuyển sang toàn màn hình: câu hỏi và bốn đáp án chiếm gần hết diện tích, cỡ chữ tự phóng to hết mức vừa khung để hàng bàn cuối đọc được. Lúc đọc đề chỉ có câu hỏi nên chữ to nhất.
- Hết số câu của lượt thì hiện bảng xếp hạng các nhóm. Điểm Paddle Buzzer không tính vào kỷ lục, skin hay chứng chỉ.
- Thông số (số nhóm, số câu, thời gian, điểm) nằm trong `PADDLE_BUZZER` của `data/config/game-config.js`.
