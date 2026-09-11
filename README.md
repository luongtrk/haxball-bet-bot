# HaxBall Auto Room (Bet, Shop & Minigames)

Bot tự động mở phòng Haxball (headless) tích hợp hệ thống cá cược bóng đá, shop vật phẩm, tiền ảo (coins/gems), minigame và kết nối Discord.

---

## 1. Hướng dẫn cài đặt và chạy

### Yêu cầu
- Máy tính hoặc VPS đã cài **Node.js 18** trở lên.

### Cài đặt
Mở terminal tại thư mục này và chạy:
```bash
npm install
```

### Cấu hình
1. Tạo file `.env` từ file mẫu:
   ```bash
   cp .env.example .env
   ```
2. Mở file `.env` lên và điền cấu hình:
   - `HAXBALL_TOKEN`: Vào https://www.haxball.com/headlesstoken để lấy token mới (token thay đổi liên tục mỗi lần mở phòng).
   - `SUPER_ADMIN_AUTHS`: Điền mã Auth của bạn (hoặc các admin) để tự động nhận quyền Super Admin khi vào phòng.

### Chạy bot
- **Chạy trực tiếp (test thử):**
  ```bash
  npm start
  ```
- **Chạy nền trên VPS (chạy 24/7):**
  ```bash
  npm run pm2
  ```

Dữ liệu tiền, cấp độ và đồ mua trong shop của người chơi được lưu tự động trong file `data.json`.

---

## 2. Cấu hình Discord & Webhook

Nếu không dùng Discord, bạn có thể để trống tất cả phần này trong `.env`. Bot vẫn chạy bình thường.

### Cách tạo Webhook trên Discord:
1. Mở Discord -> Vào Cài đặt kênh chat bạn muốn bot gửi tin nhắn vào -> Chọn **Tích hợp (Integrations)**.
2. Bấm **Webhook** -> **Tạo Webhook mới**.
3. Bấm **Sao chép URL Webhook** rồi dán link vào file `.env`.

### Các biến Webhook trong `.env`:
- `DISCORD_LINK`: Link mời vào server Discord của bạn. Khi người chơi gõ `!discord`, bot sẽ gửi link này.
- `DISCORD_WEBHOOK`: Gửi kết quả sau mỗi trận kèm file video replay (`.hbr2`) lên Discord.
- `DISCORD_COIN_LOG_WEBHOOK`: Ghi lại toàn bộ lịch sử nạp/chuyển tiền, thắng thua cược để admin soi khi nghi ngờ hack coin.
- `DISCORD_LOG_WEBHOOK`: Ghi log người chơi vào/ra, bị kick, ban hoặc bị phạt.
- `DISCORD_REPORT_WEBHOOK`: Khi người chơi trong phòng gõ `!report <lý do>`, bot sẽ bắn thông báo vào kênh này.
- `REPORT_TAG_USER_IDS`: Điền ID tài khoản Discord của admin (cách nhau bằng dấu phẩy) để bot tự động tag admin khi có report.
  - *Cách lấy ID:* Vào Discord -> Cài đặt -> Nâng cao -> Bật **Chế độ nhà phát triển (Developer Mode)**. Sau đó bấm chuột phải vào tên bạn trên Discord chọn **Sao chép ID người dùng**.
- `DISCORD_CHAT_WEBHOOK`: Đẩy toàn bộ chat trong room lên Discord (khi admin bật tính năng xem chat).

### Tính năng chat 2 chiều từ Discord vào room:
Nếu muốn admin gõ tin nhắn trên Discord và tin nhắn đó hiện thẳng vào room Haxball:
1. Tạo một bot trên [Discord Developer Portal](https://discord.com/developers/applications).
2. Vào mục **Bot** -> Bật **Message Content Intent** -> Copy Token dán vào `DISCORD_BOT_TOKEN`.
3. Mời bot vào server Discord.
4. Chuột phải vào kênh chat bạn muốn dùng -> Chọn **Sao chép ID kênh** -> Dán vào `DISCORD_CHANNEL_ID`.
- Khi bot chạy, bất kỳ tin nhắn nào bạn gửi ở kênh đó sẽ hiện trong room dưới dạng `[ADMIN]: nội dung`.
- Gõ `!xemchat` trên Discord để bật theo dõi chat từ game sang Discord, `!tatchat` để tắt.

---

## 3. Danh sách lệnh chính trong phòng

### Tiền tệ & Giao dịch
- `!coins` hoặc `!tien`: Xem số coins, gems và cấp độ của mình.
- `!coins @tên`: Soi số dư của người khác.
- `!pay <tên> <số tiền>`: Chuyển coins cho người khác (5 lần đầu mỗi ngày miễn phí, từ lần 6 thu phí 15%).
- `!doigems <số lượng>`: Đổi coins lấy gems tại Chợ Đen.
- `!diemdanh`: Điểm danh hàng ngày nhận coins và gems.

### Cá cược trận đấu (chỉ áp dụng map 5v5)
- `!bet`: Xem danh sách các kèo cược.
- `!bet winner <red/blue> <tiền>`: Cược đội thắng.
- `!bet taixiu <tai/xiu> <tiền>`: Cược tài xỉu bàn thắng (mốc 3.5).
- `!bet keochap <red/blue> <tiền>`: Cược kèo chấp.
- `!bet btts <yes/no> <tiền>`: Cược cả hai đội đều ghi bàn.
- `!bet tiso <tỉ số> <tiền>`: Cược tỉ số chính xác.
- `!bet scorer <tên> <tiền>`: Cược cầu thủ ghi bàn.
- `!bet motm <tên> <tiền>`: Cược cầu thủ xuất sắc nhất trận.
- `!unbet`: Hủy cược (chỉ được hủy trong thời gian quy định trước trận).
- `!thachdau <@tên> <tiền>`: Gạ kèo solo 1v1 ăn tiền với đối thủ khác đội.
- `!chapnhan`: Nhận kèo thách đấu.
- `!bounty <@tên> <tiền>`: Treo thưởng đầu cầu thủ đội bạn (trận hòa hoặc hủy sẽ được hoàn tiền).

### Minigame giải trí
- `!kbb <keo/bua/bao> <tiền>`: Oẳn tù tì với máy.
- `!slot <tiền>`: Quay máy xèng nổ hũ.
- `!cf <tai/xiu> <tiền>`: Tung đồng xu may rủi.
- `!spin <tiền>`: Vòng quay may mắn.
- `!cauca`: Thả cần câu kiếm coins và gems.
- `!ve <1-999>`: Mua vé số kiến thiết (trúng nổ hũ gems).

### Cửa hàng & VIP
- `!shop`: Xem danh mục hiệu ứng, màu chat, danh hiệu.
- `!buy <loại> <mã/tên>`: Mua đồ trong shop.
- `!buyvip`: Mua thẻ VIP tháng (tăng hạn mức cược, màu chat VIP, quà điểm danh VIP).
- `!nemca <@tên>`: Dùng 100 coins ném cà chua vào người khác.
- `!tanghoa <@tên>`: Dùng 100 coins tặng hoa cho người khác.
- `!report <nội dung>`: Gửi báo cáo lỗi hoặc hành vi phá hoại về Discord cho Admin.
