# ⚽ HaxBall Auto Room Bot (BET, SHOP & MINIGAMES)

Hệ thống Bot phòng HaxBall tự động hoàn chỉnh, tích hợp hệ thống kinh tế (Coins, Gems), cá cược đa dạng, cửa hàng vật phẩm, danh hiệu, thẻ VIP và các minigames giải trí đã được kiểm toán bảo mật và cân bằng tài chính.

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
  - `!bet taixiu <tai/xiu> <tiền>`: Tài/Xỉu số bàn thắng.
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
Mở file `.env` và điền các thông tin:
- `HAXBALL_TOKEN`: Lấy token phòng headless tại [Haxball Headless Token](https://www.haxball.com/headlesstoken).
- `SUPER_ADMIN_AUTHS`: Danh sách Auth ID của Super Admin (phân cách bằng dấu phẩy).
- `DISCORD_BOT_TOKEN` & `DISCORD_CHANNEL_ID`: Token bot Discord nếu muốn đồng bộ chat.

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
