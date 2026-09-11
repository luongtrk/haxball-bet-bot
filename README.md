# ⚽ HaxBall Auto Room Bot (BET, SHOP & MINIGAMES)

Hệ thống Bot phòng HaxBall tự động hoàn chỉnh, tích hợp hệ thống kinh tế (Coins, Gems), cá cược đa dạng, cửa hàng vật phẩm, danh hiệu, thẻ VIP, minigames cân bằng và hệ thống giám sát Discord Webhook toàn diện.

---

## 🌟 Tính Năng Chính

### 1. Kinh Tế & Tài Chính Phòng
- **Tiền tệ kép**: `Coins 🪙` (tiền thông dụng) và `Gems 💎` (đá quý cao cấp).
- **Chợ đen (`!doigems`)**: Quy đổi Coins sang Gems theo tỷ giá quản trị.
- **Ngân hàng chuyển tiền (`!pay`)**: 
  - 5 lượt đầu miễn phí mỗi ngày. Từ lượt thứ 6 áp thuế 15%.
  - Yêu cầu người chơi đá đủ số trận tối thiểu (10 trận) để chống clone/gian lận.
  - Hiển thị số dư minh bạch sau mỗi lần giao dịch.
- **Điểm danh hàng ngày (`!diemdanh`)**: Thưởng Coins, tỉ lệ nhận Gems và chuỗi ngày chuyên cần.

### 2. Cá Cược Thi Đấu (Map 5v5)
- **Đa dạng kèo cược (`!bet`)**:
  - `!bet winner <red/blue> <tiền>`: Đội thắng.
  - `!bet taixiu <tai/xiu> <tiền>`: Tài/Xỉu số bàn thắng (mốc 3.5).
  - `!bet keochap <red/blue> <tiền>`: Kèo chấp Handicap.
  - `!bet btts <yes/no> <tiền>`: Hai đội cùng ghi bàn.
  - `!bet tiso <tỉ số> <tiền>`: Đoán chính xác tỉ số.
  - `!bet scorer <tên> <tiền>`: Cầu thủ ghi bàn.
  - `!bet motm <tên> <tiền>`: Cầu thủ xuất sắc nhất trận.
- **Hủy cược (`!unbet`)**: Hủy vé cược hợp lệ trong khoảng thời gian quy định trước trận.
- **Thách đấu 1v1 (`!thachdau` & `!chapnhan`)**: Khô máu solo cược giữa hai cầu thủ khác đội.
- **Lệnh truy nã (`!bounty`)**: Treo thưởng tiêu diệt đối thủ trên sân. Hoàn tiền tự động nếu trận hòa hoặc trận bị hủy.
- **Cơ chế chống bán độ**: Giới hạn mức cược tối đa theo quyền hạn (Cầu thủ, Khán giả, VIP).

### 3. Minigames (Cân Bằng - Lợi Thế Nhà Cái)
- **Oẳn tù tì (`!kbb <keo/bua/bao> <tiền>`)**: Tỉ lệ thắng đã được cân bằng (10% thắng, 15% hòa, 75% thua).
- **Máy xèng (`!slot <tiền>`)**: 6 biểu tượng may mắn, cơ hội nổ Jackpot x30 cực khủng.
- **Tung đồng xu (`!cf <tai/xiu> <tiền>`)**: Lách khe tài xỉu nhanh gọn.
- **Vòng quay may mắn (`!spin <tiền>`)**: Thử vận may với các mốc nhân tiền.
- **Câu cá (`!cauca`)**: Thư giãn giải trí kiếm Coins và Gems.
- **Xổ số kiến thiết (`!ve <1-999>`)**: Mua vé số săn Jackpot Gems tích lũy.

### 4. Cửa Hàng & Đặc Quyền VIP
- **Shop (`!shop`) & Mua sắm (`!buy`)**: Hiệu ứng bàn thắng, màu chat, danh hiệu độc quyền, hộp quà Lootbox.
- **Thẻ VIP Tháng (`!buyvip`)**: Nhân đôi giới hạn cược, quyền đổi màu chat VIP, nhận quà điểm danh VIP.
- **Troll vui nhộn (`!nemca`, `!tanghoa`)**: Ném cà chua thối hoặc tặng hoa cho người chơi.

---

## 📡 Hướng Dẫn Chi Tiết Về Discord & Webhook

Hệ thống hỗ trợ 2 cấp độ tích hợp Discord:
1. **Discord Webhooks (Khuyên dùng)**: Rất dễ tạo, không cần tạo bot Discord phức tạp. Bot sẽ gửi trực tiếp thông báo, file Replay, lịch sử tiền và báo cáo lỗi lên các kênh Discord bạn chỉ định.
2. **Discord Bot 2 Chiều (Tùy chọn)**: Cho phép Admin nhắn tin từ Discord bay thẳng vào phòng HaxBall và điều khiển theo dõi chat phòng.

### 1. Bảng Chi Tiết Các Biến Môi Trường Discord

| Tên biến trong `.env` | Mục đích & Chức năng | Hành vi của Bot |
| :--- | :--- | :--- |
| `DISCORD_LINK` | Link tham gia Server Discord của bạn (Ví dụ: `https://discord.gg/abcxyz`). | Khi người chơi gõ lệnh `!discord`, hoặc khi vừa vào phòng, hoặc khi kết thúc trận, bot sẽ gửi link này lên khung chat để người chơi tham gia. |
| `DISCORD_WEBHOOK` | **Webhook Kết Quả Trận & File Replay** | Cuối mỗi trận đấu, bot tự động xuất bảng thống kê (bàn thắng, kiến tạo, CS) và **tải kèm file video Replay (.hbr2)** lên kênh này để người xem tải về. |
| `DISCORD_COIN_LOG_WEBHOOK` | **Webhook Kiểm Toán Tiền Nong (Audit Coins/Gems)** | Ghi lại toàn bộ biến động tài chính: `!pay`, `!bet`, `!slot`, `!spin`, `!kbb`, `!cauca`, nạp tiền, buff admin kèm số dư trước và sau giao dịch để Admin chống hack/gian lận. |
| `DISCORD_LOG_WEBHOOK` | **Webhook Nhật Ký Phòng (System Logs)** | Ghi lại sự kiện: người chơi ra/vào phòng, lệnh Admin, cảnh cáo, kick, ban, vi phạm chat. |
| `DISCORD_REPORT_WEBHOOK` | **Webhook Nhận Báo Cáo Lỗi (`!report`)** | Khi người chơi gõ `!report <nội dung>`, thông báo khẩn cấp kèm tên, auth của người báo cáo sẽ được gửi vào kênh này. |
| `REPORT_TAG_USER_IDS` | **Danh sách ID Discord Admin cần Ping khi có Report** | Điền các Discord User ID (ngăn cách bằng dấu phẩy, ví dụ: `123456789,987654321`). Bot sẽ `@mention` trực tiếp các Admin này trên Discord để có chuông thông báo ngay. |
| `DISCORD_CHAT_WEBHOOK` | **Webhook Theo Dõi Chat Trong Game** | Đẩy toàn bộ nội dung trò chuyện trong phòng lên Discord khi Admin kích hoạt chế độ xem chat. |
| `DISCORD_BOT_TOKEN` | **Token Discord Bot 2 Chiều** | Dành cho việc chat 2 chiều từ kênh Discord vào trong game HaxBall. |
| `DISCORD_CHANNEL_ID` | **ID Kênh Discord Nhận/Gửi Tin Nhắn 2 Chiều** | Kênh cụ thể mà Admin sẽ gõ tin nhắn để chuyển tiếp vào game. |

---

### 2. Cách Tạo Webhook Trên Discord (Từng Bước)

Bạn có thể tạo 1 webhook dùng chung cho tất cả, hoặc tạo nhiều kênh riêng (ví dụ: kênh `#replay-tran-dau`, `#log-tien-te`, `#bao-cao-loi`) để quản lý chuyên nghiệp hơn:

1. Mở **Discord** trên máy tính hoặc trình duyệt.
2. Vào **Server Discord** của bạn → Chọn kênh văn bản muốn nhận thông báo (ví dụ: `#log-room`).
3. Bấm vào biểu tượng bánh răng **Chỉnh sửa kênh (Edit Channel)** kế bên tên kênh.
4. Chọn mục **Tích hợp (Integrations)** → Chọn **Webhook**.
5. Bấm **Tạo Webhook (New Webhook)** hoặc **Xem Webhook**.
6. Đặt tên cho Webhook (ví dụ: `HaxBall Logger`) và chọn ảnh đại diện tùy thích.
7. Bấm nút **Sao chép URL Webhook (Copy Webhook URL)**.
8. Dán đường link vừa sao chép vào biến tương ứng trong file `.env` (ví dụ: `DISCORD_WEBHOOK=https://discord.com/api/webhooks/...`).

---

### 3. Cách Lấy Discord User ID Để Tag Khi Có Báo Cáo (`REPORT_TAG_USER_IDS`)

1. Trên Discord, vào **Cài đặt người dùng (User Settings)** (biểu tượng bánh răng ở góc dưới bên trái cạnh Avatar của bạn).
2. Cuộn xuống chọn thẻ **Nâng cao (Advanced)** trong danh mục Cài đặt ứng dụng.
3. Bật công tắc **Chế độ nhà phát triển (Developer Mode)**.
4. Thoát ra màn hình Discord, **chuột phải vào tên tài khoản Discord của bạn** (hoặc của Admin khác) → Chọn **Sao chép ID người dùng (Copy User ID)**.
5. Dán ID đó vào biến `REPORT_TAG_USER_IDS` trong file `.env`:
   ```env
   REPORT_TAG_USER_IDS=312456789012345678,987654321098765432
   ```

---

### 4. Hướng Dẫn Tích Hợp Discord Bot 2 Chiều (Chat từ Discord vào HaxBall)

Nếu bạn muốn ngồi trên Discord gõ tin nhắn mà trong phòng HaxBall hiện thông báo `[ADMIN]: <nội dung>`, hãy làm theo các bước:

#### Bước 4.1: Tạo Bot trên Discord Developer Portal
1. Truy cập [Discord Developer Portal](https://discord.com/developers/applications) và đăng nhập.
2. Bấm nút **New Application**, đặt tên cho bot (ví dụ: `Haxball Room Manager`) → Bấm **Create**.
3. Vào mục **Bot** ở thanh menu bên trái.
4. Tại mục **Privileged Gateway Intents**, bật công tắc **Message Content Intent** (bắt buộc để bot đọc được tin nhắn). Bấm **Save Changes**.
5. Bấm nút **Reset Token** (hoặc **Copy Token**) để lấy mã Token của Bot. Dán token này vào `DISCORD_BOT_TOKEN=` trong file `.env`.

#### Bước 4.2: Mời Bot vào Server Discord của bạn
1. Ở menu bên trái, vào **OAuth2** → **URL Generator**.
2. Tại bảng **SCOPES**, tích chọn: `bot`.
3. Tại bảng **BOT PERMISSIONS**, tích chọn:
   - `Send Messages`
   - `Read Messages/View Channels`
   - `Read Message History`
4. Cuộn xuống cuối trang, copy đường link tại mục **Generated URL** và dán vào trình duyệt để mời Bot vào Server của bạn.

#### Bước 4.3: Lấy ID Kênh Discord (`DISCORD_CHANNEL_ID`)
1. Trên Server Discord, chuột phải vào kênh chat bạn muốn quản lý phòng → Chọn **Sao chép ID kênh (Copy Channel ID)**.
2. Dán ID đó vào `DISCORD_CHANNEL_ID=` trong file `.env`.

#### Bước 4.4: Sử Dụng Lệnh Tương Tác Trong Discord
Khi bot phòng đang chạy:
- Mọi tin nhắn bạn gõ vào kênh đó sẽ ngay lập tức được bot gửi vào phòng Haxball dưới dạng: `[ADMIN]: <tin nhắn của bạn>`.
- Gõ lệnh `!xemchat` trong kênh Discord: Bot sẽ bắt đầu chuyển tiếp toàn bộ tin nhắn chat của người chơi trong game Haxball lên Discord.
- Gõ lệnh `!tatchat` trong kênh Discord: Tắt tính năng chuyển tiếp chat.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Bot

### Yêu Cầu
- **Node.js**: Phiên bản 18.0.0 trở lên.

### Bước 1: Cài đặt thư viện
Mở terminal / cmd tại thư mục dự án và chạy:
```bash
npm install
```

### Bước 2: Cấu hình biến môi trường
Tạo file `.env` từ file `.env.example`:
```bash
cp .env.example .env
```
Mở file `.env` và điền:
- `HAXBALL_TOKEN`: Lấy token phòng headless tại [Haxball Headless Token](https://www.haxball.com/headlesstoken).
- `SUPER_ADMIN_AUTHS`: Danh sách Auth ID của Super Admin (phân cách bằng dấu phẩy).
- Các Webhook Discord tùy theo nhu cầu quản trị của bạn.

### Bước 3: Khởi động phòng
Chạy trực tiếp bằng Node:
```bash
npm start
```
Hoặc chạy ngầm 24/7 bằng PM2 trên VPS:
```bash
npm run pm2
```

---

## 📁 Cấu Trúc Dữ Liệu
Dữ liệu người chơi (Coins, Gems, Cấp độ, Túi đồ, Thẻ VIP) được tự động lưu trữ an toàn trong file `data.json` thông qua cơ chế tự động ghi nguyên tử (`atomic write`).
