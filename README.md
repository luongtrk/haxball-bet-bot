# Hướng Dẫn Cài Đặt Và Sử Dụng HaxBall Auto Room (Bet, Shop & Minigames)

Tài liệu hướng dẫn chi tiết cách cài đặt, cấu hình và vận hành bot phòng Haxball tự động có hệ thống cá cược, shop đồ, minigame và kết nối Discord.

---

## 1. Những thứ cần chuẩn bị trước

1. **Node.js**: Máy tính hoặc VPS cần cài sẵn Node.js (khuyên dùng bản 18 hoặc 20 LTS).
   - Tải Node.js tại: https://nodejs.org
2. **Token phòng Haxball (Headless Token)**:
   - Truy cập: https://www.haxball.com/headlesstoken
   - Tích vào ô xác minh robot (hCaptcha) để lấy một đoạn mã token (dạng `thr1.AAAA...`).
   - *Lưu ý:* Mã token này chỉ dùng được 1 lần và có thời hạn ngắn, mỗi lần bật lại bot bạn cần lấy token mới.
3. **Mã Auth của Admin (để nhận quyền quản trị)**:
   - Trong Haxball, mỗi người chơi có một chuỗi định danh duy nhất gọi là **Auth** (Public ID).
   - *Cách lấy:* Mở trình duyệt vào trang **https://www.haxball.com/playerauth**, nhìn vào mục **Public ID** và copy toàn bộ đoạn mã phía sau chữ `ID: ` (Ví dụ: `_uCVm_mwqFh_...`).
   - *Lưu ý:* Chỉ copy dòng **Public ID**, tuyệt đối không copy hay chia sẻ dòng Private Key.

---

## 2. Các bước cài đặt và chạy bot

### Bước 1: Cài đặt thư viện cần thiết
Mở cửa sổ dòng lệnh (Terminal / PowerShell / CMD) tại thư mục chứa bot và gõ:
```bash
npm install
```
Đợi vài giây để hệ thống tự động tải các gói thư viện (`haxball.js`, `dotenv`, `discord.js`).

---

### Bước 2: Tạo và chỉnh sửa file cấu hình `.env`
Trong thư mục đã có sẵn file mẫu `.env.example`. Bạn cần tạo một file tên là `.env`:

- **Trên Windows (CMD / PowerShell):**
  ```powershell
  copy .env.example .env
  ```
- **Trên Linux / VPS:**
  ```bash
  cp .env.example .env
  ```

Mở file `.env` vừa tạo bằng Notepad hoặc VS Code và điền các thông tin:
```env
# Dán mã token bạn vừa lấy từ web vào đây:
HAXBALL_TOKEN=thr1.AAAA...

# Điền mã Auth của bạn để nhận quyền Super Admin:
SUPER_ADMIN_AUTHS=ma_auth_cua_ban_o_day

# Link Discord của bạn (để khi người chơi gõ !discord sẽ hiện ra):
DISCORD_LINK=https://discord.gg/link_server_cua_ban
```

---

### Bước 3: Khởi động phòng

#### Cách 1: Chạy trực tiếp trên máy tính (để test)
Gõ lệnh:
```bash
npm start
```
Khi thấy hiện dòng chữ:
```
==========================================
⚽ LINK PHÒNG CỦA BẠN: https://www.haxball.com/play?c=...
==========================================
```
Nghĩa là phòng đã mở thành công. Bạn copy link đó dán vào trình duyệt để vào phòng chơi.

#### Cách 2: Chạy nền 24/7 trên VPS (dùng PM2)
Nếu thuê VPS chạy lâu dài, bạn nên cài `pm2` để bot tự chạy ngầm và tự bật lại nếu bị crash:
1. Cài PM2 (chỉ cần cài 1 lần đầu):
   ```bash
   npm install -g pm2
   ```
2. Bật bot:
   ```bash
   npm run pm2
   ```
3. Một số lệnh quản lý bot khi dùng PM2:
   - Xem log phòng / lấy link phòng: `pm2 logs haxball-bet-room`
   - Tắt phòng: `pm2 stop haxball-bet-room`
   - Bật lại phòng: `pm2 restart haxball-bet-room`

---

## 3. Hướng dẫn kết nối Discord (Webhook & Bot)

*Phần này không bắt buộc. Nếu bạn không muốn kết nối Discord, cứ để trống trong file `.env`, bot vẫn hoạt động bình thường.*

### A. Cách tạo Webhook trên Discord
Webhook giúp bot tự động bắn kết quả trận đấu, video quay lại trận (replay) và lịch sử tiền lên các kênh chat Discord.

1. Mở Discord trên máy tính.
2. Chuột phải vào kênh chat bạn muốn bot gửi tin nhắn vào -> Chọn **Chỉnh sửa kênh (Edit Channel)**.
3. Chọn thẻ **Tích hợp (Integrations)** -> Chọn **Webhook** -> Bấm **Tạo Webhook mới**.
4. Bấm **Sao chép URL Webhook (Copy Webhook URL)**.
5. Dán link vừa copy vào các mục tương ứng trong file `.env`:

- `DISCORD_WEBHOOK`: Kênh nhận bảng tỷ số sau trận và tự động gửi kèm file video replay (`.hbr2`).
- `DISCORD_COIN_LOG_WEBHOOK`: Kênh ghi lại toàn bộ lịch sử tiền (ai chuyển tiền cho ai, ai thắng/thua cược bao nhiêu coins) để admin kiểm tra khi nghi ngờ có người hack.
- `DISCORD_LOG_WEBHOOK`: Kênh ghi lại nhật ký phòng (ai vào room, ai thoát ra, ai bị ban).
- `DISCORD_REPORT_WEBHOOK`: Kênh nhận tin báo lỗi khi người chơi trong game gõ lệnh `!report`.

### B. Cách để bot tự tag Admin khi có người báo lỗi (`REPORT_TAG_USER_IDS`)
Khi có người chơi gõ lệnh `!report <nội dung>`, bot sẽ gửi tin nhắn lên Discord và tag tên bạn vào để bạn nhận thông báo:
1. Mở Discord -> Bấm vào biểu tượng bánh răng **Cài đặt người dùng** (góc dưới bên trái).
2. Chọn mục **Nâng cao (Advanced)** -> Bật **Chế độ nhà phát triển (Developer Mode)**.
3. Ra ngoài kênh chat, **bấm chuột phải vào nick Discord của bạn** -> Chọn **Sao chép ID người dùng (Copy User ID)**.
4. Dán ID đó vào file `.env`:
   ```env
   REPORT_TAG_USER_IDS=123456789012345678
   ```
   *(Nếu có nhiều admin cần tag, điền các ID cách nhau bằng dấu phẩy: `id1,id2`)*

### C. Tính năng chat 2 chiều từ Discord vào trong game
Nếu bạn muốn ngồi trên Discord gõ tin nhắn mà trong phòng Haxball hiện chữ `[ADMIN]: tin nhắn của bạn`:
1. Truy cập: https://discord.com/developers/applications
2. Bấm **New Application** -> Đặt tên cho bot -> Bấm **Create**.
3. Vào mục **Bot** ở cột bên trái:
   - Kéo xuống tìm dòng **Message Content Intent** và gạt bật ON lên -> Bấm **Save Changes**.
   - Bấm **Reset Token** để lấy mã Token bot. Dán vào `DISCORD_BOT_TOKEN=` trong file `.env`.
4. Vào mục **OAuth2** -> **URL Generator**:
   - Tích chọn ô `bot`.
   - Bảng quyền hạn bên dưới tích chọn: `Send Messages`, `Read Messages/View Channels`, `Read Message History`.
   - Copy đường link ở cuối trang, dán vào trình duyệt để mời bot vào server Discord của bạn.
5. Chuột phải vào kênh chat Discord bạn muốn dùng -> Chọn **Sao chép ID kênh** -> Dán vào `DISCORD_CHANNEL_ID=` trong file `.env`.

*Cách dùng khi phòng đang mở:*
- Bất kỳ ai có quyền nhắn vào kênh đó trên Discord, tin nhắn sẽ hiện vào trong room Haxball.
- Gõ `!xemchat` trên Discord để xem toàn bộ tin nhắn trong game gửi ngược ra Discord.
- Gõ `!tatchat` trên Discord để tắt theo dõi chat.

---

## 4. Tùy chỉnh cài đặt phòng trong code (`bot.js`)

Nếu muốn thay đổi tên phòng hoặc luật chơi, bạn mở file `bot.js` và tìm các dòng ở gần đầu file:
- **Dòng 98**: `ROOM_NAME`: Đổi tên hiển thị của phòng trên danh sách phòng Haxball.
- **Dòng 1042**: `maxPlayers`: Số lượng người chơi tối đa được vào phòng (mặc định là 30).
- **Dòng 1045**: `geo`: Vị trí đặt phòng (mặc định để VN để người chơi Việt Nam có ping thấp nhất).
- **Dòng 99**: `TIME_LIMIT`: Thời gian mỗi hiệp đấu (phút).
- **Dòng 100**: `SCORE_LIMIT`: Số bàn thắng tối đa để kết thúc trận.

---

## 5. Danh sách toàn bộ lệnh trong phòng

### Lệnh cho người chơi (Tiền tệ & Giao dịch)
- `!coins` hoặc `!tien`: Xem số tiền Coins, Gems và Cấp độ của mình.
- `!coins @tên`: Xem số tiền và cấp độ của người chơi khác.
- `!pay <tên> <số tiền>`: Chuyển coins cho người khác (mỗi ngày miễn phí 5 lần chuyển đầu tiên, từ lần 6 chịu phí 15%). Yêu cầu phải đá đủ 10 trận mới được dùng.
- `!doigems <số lượng>`: Dùng coins đổi lấy gems ở Chợ Đen.
- `!diemdanh`: Điểm danh hàng ngày để nhận coins và có cơ hội nhặt được gems.

### Lệnh cá cược bóng đá (áp dụng khi đá map 5v5)
*Lưu ý: Chỉ được đặt cược trong vòng 60 giây đầu tiên của trận đấu khi tỉ số đang là 0-0.*
- `!bet`: Xem bảng hướng dẫn các loại kèo.
- `!bet list`: Xem tỷ lệ ăn tiền hiện tại của trận đấu.
- `!bet winner <red/blue> <tiền>`: Cược đội Đỏ hoặc Xanh thắng.
- `!bet taixiu <tai/xiu> <tiền>`: Cược tổng số bàn thắng trận đấu lớn hơn hoặc nhỏ hơn 3.5 bàn.
- `!bet keochap <red/blue> <tiền>`: Cược theo tỷ lệ kèo chấp.
- `!bet btts <yes/no> <tiền>`: Cược cả 2 đội đều có bàn thắng (Yes) hoặc không (No).
- `!bet tiso <tỉ số> <tiền>`: Đoán chính xác tỉ số (Ví dụ: `!bet tiso 2-1 500`).
- `!bet scorer <tên cầu thủ> <tiền>`: Cược cầu thủ nào sẽ ghi bàn trong trận.
- `!bet motm <tên cầu thủ> <tiền>`: Cược cầu thủ xuất sắc nhất trận đấu.
- `!unbet`: Hủy cược và nhận lại tiền (nếu trận đấu vẫn ở đầu hiệp 0-0).
- `!thachdau <@tên> <tiền>`: Gạ kèo đối thủ ở đội bên kia solo ăn tiền.
- `!chapnhan`: Đồng ý nhận kèo thách đấu từ đối thủ.
- `!bounty <@tên> <tiền>`: Treo thưởng đầu cầu thủ đội bạn (Ai sút tung lưới cầu thủ này sẽ ăn tiền thưởng. Nếu trận đấu hòa hoặc dừng thì tiền sẽ được trả lại).

### Minigame giải trí
- `!kbb <keo/bua/bao> <tiền>`: Chơi Oẳn tù tì với máy.
- `!slot <tiền>`: Quay máy xèng nổ hũ.
- `!cf <tai/xiu> <tiền>`: Chơi tung đồng xu may rủi.
- `!spin <tiền>`: Quay vòng quay may mắn với các mốc nhân tiền.
- `!cauca`: Thả cần câu giải trí kiếm coins và gems.
- `!ve <1-999>`: Mua vé số kiến thiết (quay thưởng hũ Gems định kỳ).

### Shop & Vật phẩm
- `!shop`: Mở menu cửa hàng xem danh sách hiệu ứng và danh hiệu.
- `!buy <loại> <mã/tên>`: Mua vật phẩm (ví dụ: `!buy effect 1`).
- `!buyvip`: Mua thẻ VIP 30 ngày (tăng giới hạn đặt cược, nhận quà điểm danh VIP, đổi màu chat VIP).
- `!nemca <@tên>`: Dùng 100 coins ném cà chua vào mặt người khác.
- `!tanghoa <@tên>`: Dùng 100 coins tặng hoa khen ngợi người khác.
- `!report <nội dung>`: Gửi báo cáo phá hoại hoặc lỗi phòng cho Admin qua Discord.

### Lệnh dành riêng cho Admin
- `!buffcoins <tên> <số tiền>`: Cộng hoặc trừ coins của một người chơi (chỉ Admin).
- `!buffgems <tên> <số gems>`: Cộng hoặc trừ gems của một người chơi (chỉ Super Admin).
- `!vipforever <tên>`: Cấp đặc quyền VIP vĩnh viễn cho một người chơi (chỉ Super Admin).
- `!resetcoins`: Reset tiền của toàn bộ người chơi về 500 Coins (chỉ Super Admin).

---

## 6. Dữ liệu người chơi được lưu ở đâu?

Toàn bộ thông tin tài khoản (coins, gems, cấp độ, số trận thắng, số bàn thắng, đồ đã mua) của tất cả người chơi được lưu trong file duy nhất là:
```
data.json
```
- File này tự động được lưu mỗi khi có thay đổi.
- Khi chuyển bot sang máy khác hoặc backup, bạn chỉ cần copy file `data.json` này sang thư mục mới là giữ nguyên toàn bộ dữ liệu người chơi cũ.
