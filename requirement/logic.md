# TÀI LIỆU LOGIC VẬN HÀNH — ENGLISH GAME DINOSAUR

## 1. Luồng trạng thái tổng thể (State Machine)

Ứng dụng vận hành theo State Machine tập trung (`src/core/state-manager.ts`), đảm bảo tại mỗi thời điểm chỉ có duy nhất một màn hình hiển thị:

`LOGIN` → `MAIN_MENU` → (`PLAYING` → `GAME_OVER`) / `SKIN_COLLECTION` / `LEADERBOARD` / `CERTIFICATE`.

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
  - **Trả lời đúng**: +1 điểm.
  - **Trả lời sai hoặc hết thời gian**: không có điểm, hiện đáp án đúng; khủng long vẫn nhảy và chạy tiếp.
- Chỉ thua (`GAME_OVER`) khi khủng long đâm vào chướng ngại vật (xương rồng, đá, thằn lằn bay).
- Ba chế độ chơi (`BASIC`, `MEDIUM`, `HARDCORE`) khác nhau về tốc độ, mật độ chướng ngại vật và thời gian trả lời (15s / 10s / 7s), cấu hình trong `data/config/game-config.js`.

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
