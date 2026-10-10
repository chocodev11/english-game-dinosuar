# Hướng dẫn deploy English Game Dinosaur

Ba nền tảng, mỗi nơi một việc:

| Nền tảng | Vai trò |
|---|---|
| GitHub | Lưu code. Mỗi lần push, Cloudflare tự build lại web. |
| Supabase | Database cho bảng xếp hạng trực tuyến, cập nhật realtime trên mọi máy. |
| Cloudflare Workers | Host web game, cấp link dạng `https://english-game-dinosaur.<tên-tài-khoản>.workers.dev`. |

Làm theo thứ tự: **Supabase → chạy thử ở máy → GitHub → Cloudflare**. Supabase làm trước vì Cloudflare cần key của Supabase khi build.

Chỉ bảng xếp hạng là trực tuyến. Tiến độ, skin và chứng chỉ của từng học sinh vẫn lưu trên máy đang chơi.

---

## 1. Supabase: tạo database cho bảng xếp hạng

1. Vào https://supabase.com, đăng nhập (có thể dùng tài khoản GitHub).
2. Bấm **New project** và điền:
   - **Name:** `english-game-dinosaur`
   - **Database password:** đặt mật khẩu mạnh và lưu lại (app không dùng, nhưng cần khi quản trị).
   - **Region:** `Southeast Asia (Singapore)`, gần Việt Nam nhất.
   - **Plan:** Free.
3. Đợi khoảng 2 phút để project khởi tạo xong.
4. Mở **SQL Editor**, bấm **New query**, dán **toàn bộ** nội dung file [`supabase/schema.sql`](supabase/schema.sql), rồi bấm **Run**. Kết quả đúng là `Success. No rows returned`. File này chạy lại nhiều lần vẫn an toàn.
5. Mở **Table Editor**, kiểm tra đã có bảng `leaderboard` (đang trống).
6. Bấm nút **Connect** ở đầu trang project và copy 2 giá trị:
   - **Project URL:** dạng `https://abcdxyz.supabase.co`
   - **Publishable key:** dạng `sb_publishable_...`

> Chỉ dùng **publishable key** trong web. Tuyệt đối không dán **secret key** (`sb_secret_...`) hay `service_role` vào code hoặc biến môi trường của web. Key đó có toàn quyền với database.

Phần `schema.sql` đã tạo sẵn:
- Bảng `leaderboard`: mỗi học sinh (họ tên + lớp, không phân biệt hoa thường) có đúng 1 dòng.
- Quyền: ai cũng được xem, không ai ghi trực tiếp được.
- Hàm `submit_score`: chặn dữ liệu vô lý, chỉ cho điểm tăng, trả về thứ hạng.
- Bật realtime cho bảng.

---

## 2. Chạy thử ở máy với Supabase

1. Copy file `.env.example` thành `.env.local` (cùng thư mục với `package.json`) rồi điền 2 giá trị vừa lấy:
   ```
   VITE_SUPABASE_URL=https://abcdxyz.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```
   File `.env.local` đã nằm trong `.gitignore`, nên không bị đẩy lên GitHub.
2. Chạy:
   ```
   npm install
   npm run dev
   ```
3. Mở http://localhost:3000, chơi một lượt rồi vào tab **Xếp hạng**. Bạn sẽ thấy tên mình, và dòng chữ cuối trang ghi "Bảng xếp hạng trực tuyến…".
4. Thử realtime: mở thêm game trên điện thoại cùng Wi-Fi (`http://<IP-máy-tính>:3000`, IP hiện ở terminal khi chạy `npm run dev`). Để điện thoại ở tab Xếp hạng, chơi trên máy tính. Khi lập kỷ lục mới, bảng trên điện thoại tự cập nhật.
5. Trên Supabase, mở **Table Editor → leaderboard**. Phải có dòng điểm mới.

Nếu thiếu file `.env.local`, game vẫn chạy bình thường với bảng xếp hạng lưu trên máy.

---

## 3. GitHub: đưa code lên

Repo: https://github.com/KhoaDang2011/english-game-dinosuar

```
git add -A
git commit -m "Mobile redesign, Unit 1-5 questions, Supabase leaderboard, Cloudflare config"
git push origin main
```

Trước khi push, chạy `git status` để chắc chắn không có file `.env.local` trong danh sách.

---

## 4. Cloudflare: host web, tự deploy mỗi lần push

1. Vào https://dash.cloudflare.com (đăng ký miễn phí nếu chưa có tài khoản).
2. Chọn **Workers & Pages**, rồi **Create application**, rồi **Get started** ở mục **Import a repository**.
3. Kết nối GitHub và cho phép Cloudflare truy cập repo `english-game-dinosuar`, sau đó chọn repo này.
4. Điền cấu hình:
   - **Project name:** `english-game-dinosaur`. Phải trùng `name` trong [`wrangler.jsonc`](wrangler.jsonc), nếu không build sẽ lỗi.
   - **Build command:** `npm run build`. Ô này mặc định để trống, bắt buộc phải điền.
   - **Deploy command:** giữ mặc định `npx wrangler deploy`.
   - **Branch:** `main`.
5. Thêm 2 biến build:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`

   Nếu màn tạo chưa có ô nhập biến: tạo xong, vào **Settings → Build → Build Variables and Secrets**, thêm 2 biến, rồi push một commit mới để build lại.

   > Vite chỉ đọc các biến này **lúc build**. Thiếu chúng, web vẫn lên nhưng bảng xếp hạng chỉ lưu trên từng máy.
6. Bấm **Save and Deploy**. Khoảng 1–2 phút sau bạn nhận được link `https://english-game-dinosaur.<tên-tài-khoản>.workers.dev`.
7. Mở link trên điện thoại (thử cả Chrome, Safari và trình duyệt trong Zalo hoặc Messenger), chơi một lượt và xem tab Xếp hạng.

**Cập nhật về sau:** sửa code (kể cả câu hỏi trong `data/`), rồi `git push`. Cloudflare tự build và cập nhật sau 1–2 phút. Push lên nhánh khác `main` thì nó tạo link xem thử riêng, không ảnh hưởng bản chính.

**Deploy từ máy, không cần GitHub (tùy chọn):**
```
npx wrangler login
npm run build
npx wrangler deploy
```
Lệnh build lúc này đọc biến từ `.env.local`.

**Tên miền riêng (tùy chọn):** vào Worker, mở **Settings → Domains & Routes**, chọn **Add custom domain**. Tên miền phải đang quản lý trên Cloudflare.

---

## 5. Quản lý bảng xếp hạng

- **Xóa điểm gian lận hoặc tên không phù hợp:** Supabase → **Table Editor → leaderboard**, chọn dòng rồi **Delete**. Bảng trên mọi máy tự cập nhật.
- **Xóa toàn bộ để làm lại (ví dụ đầu năm học):** chạy trong SQL Editor lệnh dưới đây. **Không hoàn tác được**, nên xuất file CSV trước.
  ```sql
  delete from public.leaderboard;
  ```
- **Sao lưu:** Table Editor → leaderboard → **Export** ra CSV.

---

## 6. Cần biết trước

- **Gian lận:** điểm được tính trong trình duyệt, nên học sinh rành kỹ thuật vẫn gửi được điểm giả. Database chỉ chặn được số vô lý, còn lại giáo viên xóa dòng sai.
- **Danh tính:** chỉ có họ tên và lớp, không có mật khẩu, nên ai cũng nhập được tên người khác. Điểm trên bảng chỉ tăng, không bao giờ bị giảm.
- **Quyền riêng tư:** họ tên và lớp hiện công khai với bất kỳ ai có link.
- **Gói Supabase miễn phí:**
  - Project tự **tạm dừng nếu ít hoạt động trong 7 ngày** (ví dụ kỳ nghỉ). Khi đó vào dashboard bấm khôi phục, trong lúc chờ game vẫn chơi được nhưng không tải được bảng xếp hạng.
  - Tối đa 200 kết nối realtime cùng lúc. Game chỉ mở kết nối khi đang xem tab Xếp hạng, nên đủ cho vài lớp chơi cùng lúc.

---

## 7. Xử lý lỗi

| Hiện tượng | Nguyên nhân thường gặp | Cách sửa |
|---|---|---|
| Web đã deploy nhưng chân trang Xếp hạng ghi "lưu trên máy này" | Thiếu biến `VITE_SUPABASE_*` lúc build | Thêm Build Variables trên Cloudflare rồi build lại |
| "Không tải được bảng xếp hạng" | Sai URL/key, project Supabase đang tạm dừng, hoặc chưa chạy `schema.sql` | Kiểm tra lại 2 biến, khôi phục project, chạy lại `schema.sql` |
| Chơi xong mà điểm không lên bảng | Chưa có hàm `submit_score` | Chạy lại `schema.sql`, xem Console trình duyệt có dòng "Không gửi được điểm lên Supabase" |
| Build Cloudflare báo tên Worker không khớp | Project name khác `name` trong `wrangler.jsonc` | Đặt cho trùng `english-game-dinosaur` |
| Build báo lỗi phiên bản Node | Hiếm gặp, Cloudflare build bằng Node 24 | Thêm biến `NODE_VERSION` = `22` |
| Deploy xong mà trang trống | Ô Build command để trống | Điền `npm run build` |
