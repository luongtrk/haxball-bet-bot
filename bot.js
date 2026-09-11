"use strict";
require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const fs = require("fs");
const path = require("path");
// Lưu trữ dữ liệu qua file data.json
const DATA_FILE = path.join(__dirname, "data.json");

function _loadJsonStore() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(DATA_FILE, "utf8")) || {};
    } catch (e) {
      console.error("Lỗi khi đọc file data.json:", e);
      return {};
    }
  }
  const db = {};
  _saveJsonStore(db);
  return db;
}

function _saveJsonStore(db) {
  try {
    const tmp = DATA_FILE + ".tmp";
    fs.writeFileSync(tmp, JSON.stringify(db, null, 2), "utf8");
    fs.renameSync(tmp, DATA_FILE);
  } catch (e) {
    console.error("Lỗi khi lưu file data.json:", e);
  }
}

class JsonLocalStorage {
  constructor() {
    this._db = _loadJsonStore();
  }
  get length() {
    return Object.keys(this._db).length;
  }
  key(i) {
    const keys = Object.keys(this._db);
    return (i >= 0 && i < keys.length) ? keys[i] : null;
  }
  getItem(k) {
    k = String(k);
    return Object.prototype.hasOwnProperty.call(this._db, k) ? String(this._db[k]) : null;
  }
  setItem(k, v) {
    k = String(k);
    this._db[k] = String(v);
    _saveJsonStore(this._db);
  }
  removeItem(k) {
    k = String(k);
    delete this._db[k];
    _saveJsonStore(this._db);
  }
  clear() {
    this._db = {};
    _saveJsonStore(this._db);
  }
  *[Symbol.iterator]() {
    for (const key of Object.keys(this._db)) {
      yield key;
    }
  }
}

let localStorage = (typeof window !== 'undefined' && window.localStorage)
    ? window.localStorage
    : new JsonLocalStorage();

if (typeof global !== 'undefined') {
  global.localStorage = localStorage;
}

process.on('uncaughtException', (err) => {
  if (err.message && err.message.includes('DataChannel is closed')) return;
  console.error('Lỗi hệ thống:', err);
});

async function initHaxballBot() {
  const hb = require("haxball.js");
  let exported = (hb && hb.default) ? hb.default : hb;
  let engine;
  if (typeof exported === "function") {
    engine = await exported();
  } else if (exported && typeof exported.then === "function") {
    engine = await exported;
  } else {
    engine = exported;
  }
  const HBInit = engine.HBInit || engine;

// Token Haxball headless (lấy tại https://www.haxball.com/headlesstoken)
const HAXBALL_TOKEN = process.env.HAXBALL_TOKEN || "";

const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || "";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
const SUPER_ADMIN_AUTHS = process.env.SUPER_ADMIN_AUTHS ? process.env.SUPER_ADMIN_AUTHS.split(",").map(a => a.trim()) : [];
const ROOM_NAME = `⚽𝘼𝙪𝙩𝙤 𝙍𝙤𝙤𝙢 (BET, FUN & SHOP) | LỎ NHẤT VN`;
const PUBLIC = true;
const ACTIVITY_TIMEOUT = 10;
const AFK_TIMEOUT = 10 * 60;
const PAUSE_TIMEOUT = 15;
const PENALTY_TIMEOUT = 10;
const AFTER_GAME_REST = 2.5;
const PREDICTION_PERIOD = 60;
const MAX_SUBSTITUTIONS = 2;
const MAX_PLAYERS = 5;
const TIME_LIMIT = 4;
const SCORE_LIMIT = 4;
const MIN_PLAYERS_FOR_STATS = MAX_PLAYERS - 1;
const MIN_VOTES_FOR_SURRENDER = MAX_PLAYERS - 2;
const MAX_ADDED_TIME = 30;
const NOTIFICATION_INTERVAL = 5 * 60;
const LATE_SUBSTITUTION_PERIOD = 30;
const MAX_AFK_PLAYERS = 3;
const MAX_SIZE_ADJUSTMENT_RATIO = 0.3;
const SAVE_RECORDINGS = true;
const MAX_WARNINGS_PER_PLAYER = 6;
const VIOLATION_BAN_PERIOD = 3;
const YELLOW_BAN_PERIOD = 10;
const RED = 0xFA3E3E;
const GREEN = 0x5DB899;
const YELLOW = 0xF1CC81;
const BLUE = 0x047CC4;
const BALL_COLORS = [0xFFFFCC, 0xCCFFFF, 0xE5CCFF, 0xCCFFCC, 0xFFCCFF, 0xE5E7E9];
const TEAM_NAMES = {
  1: "RED",
  2: "BLUE",
};
const ROLE = {
  PLAYER: 0,
  ADMIN: 1,
  SUPER_ADMIN: 2,
};
const PLAYER_SCORING_RULES = {
  goals: 5,
  assists: 2,
  ownGoals: -3,
  passes: 1,
  shotsOnTarget: 0.5,
  stoppedShots: 2,
  errorsLeadingToGoal: -2,
  attemptsLeadingToOG: 2,
  penaltiesScored: 1,
  penaltiesMissed: -1,
  touches: 0.01,           // Tính điểm chạm bóng (55 touches ≈ 0.55đ — có ý nghĩa)
};
const EFFECT_NAMES = [
  "Hào Quang Super Saiyan",      // 0 (Đã nâng cấp bốc lửa)
  "Động Đất Kinh Hoàng",         // 1 (Đã nâng cấp rung nảy sân)
  "Vũ Điệu Chiến Thắng",         // 2 (Đã nâng cấp xếp vòng tròn)
  "Sàn Nhảy Disco",              // 3 (Đổi từ Bóng 7 sắc)
  "Thần La Thiên Chinh",         // 4 (Sóng xung kích Shinra Tensei)
  "Khung Thành Bùng Nổ",         // 5 (Đổi từ Gôn nổ tùm lum)
  "Mảnh Vỡ Hỗn Độn",             // 6 (Đổi từ Vỡ bóng tùm lum)
  "Pháo Sáng Di Động",           // 7 (Nghe chuyên nghiệp hơn)
  "Cơn Mưa Đạn Xuyên Thấu",      // 8 (Machine Gun)
  "Siêu Hố Đen Vũ Trụ",          // 9 (Nâng cấp Accretion Disk)
  "Dải Ngân Hà Hoàng Kim",       // 10 (Nâng cấp 3 lớp quỹ đạo vệ tinh)
  "Phi Lôi Thần Thuật",          // 11 (Tên này cực ngầu rồi, giữ nguyên)
  "Bom Hạt Nhân (Nuke)",         // 12 (Đổi từ Bom hẹn giờ)
  "Mưa Sao Băng Chói Lòa",       // 13 (Thêm tính từ cho ngầu)
  "Bão Cuồng Phong Càn Quét"     // 14 (Đổi từ Lốc xoáy)
];
const EFFECT_PRICES = [10, 10, 10, 12, 12, 12, 15, 15, 15, 18, 18, 20, 20, 25, 25]; // in Gems
const RANDOM_PACK_PRICE = 30; // in Gems
const SHOP_ITEMS = [
  // === ROLES ===
  // 🌟 Phân khúc Tier 1: ĐẠI GIA TINH HOA (Bán bằng GEMS - Đẳng cấp vĩnh viễn)
  { id: "vip_diamond", name: "Diamond", color: 0x00FFFF, price: 500, type: "role", currency: "gems" },
  { id: "vip_gold", name: "Gold", color: 0xFCF803, price: 350, type: "role", currency: "gems" },
  { id: "vip_ruby", name: "Ruby", color: 0xFF0066, price: 200, type: "role", currency: "gems" },

  // 🌟 Phân khúc Tier 2: TRUNG LƯU KHÁ GIẢ (Cày 2-3 tuần)
  { id: "vip_magenta", name: "Magenta", color: 0xFF00FF, price: 150, type: "role", currency: "gems" },
  { id: "vip_sapphire", name: "Sapphire", color: 0x0F52BA, price: 120, type: "role", currency: "gems" },
  { id: "vip_lime", name: "Lime", color: 0x00FF00, price: 100, type: "role", currency: "gems" },
  { id: "vip_emerald", name: "Emerald", color: 0x50C878, price: 90, type: "role", currency: "gems" },
  { id: "vip_teal", name: "Teal", color: 0x008080, price: 90, type: "role", currency: "gems" },
  { id: "vip_amethyst", name: "Amethyst", color: 0x9966CC, price: 80, type: "role", currency: "gems" },
  { id: "vip_coral", name: "Coral", color: 0xFF1493, price: 80, type: "role", currency: "gems" },
  { id: "vip_navy", name: "Navy", color: 0x000080, price: 80, type: "role", currency: "gems" },

  // 🌟 Phân khúc Tier 3: DÂN CHƠI MỚI NỔI (Cày 1 tuần)
  { id: "vip_maroon", name: "Maroon", color: 0x800000, price: 60, type: "role", currency: "gems" },
  { id: "vip_neon", name: "Neon", color: 0xFF5C00, price: 50, type: "role", currency: "gems" },
  { id: "vip_olive", name: "Olive", color: 0x808000, price: 50, type: "role", currency: "gems" },
  { id: "vip_obsidian", name: "Obsidian", color: 0x681CFF, price: 40, type: "role", currency: "gems" },

  // === LOOT BOX ===
  { id: "lootbox_basic", name: "Loot Box Cơ Bản", color: 0xAAAAAA, price: 5, type: "lootbox", tier: "basic", currency: "gems" },
  { id: "lootbox_premium", name: "Loot Box Cao Cấp", color: 0xFFD700, price: 15, type: "lootbox", tier: "premium", currency: "gems" },

  // === FEATURES ===
  { id: "x2coins", name: "Gói x2 Coins (20 trận)", price: 2000000, type: "feature", feature: "doublecoins", uses: 20, currency: "coins" },
  { id: "afk40", name: "Thẻ AFK VIP (40p, vượt slot)", price: 10, type: "feature", feature: "afkextend", currency: "gems" },
  { id: "vip_starter", type: "feature", name: "Vé VIP Ưu Tiên Đá Chính (5 Trận)", price: 5, feature: "starterboost", uses: 5, description: "Luôn được ưu tiên bốc vào sân khi chia đội", currency: "gems" },


  // === CHAT TOYS ===
  { id: "cc_red", name: "Màu chat Đỏ (10p)", color: 0xFF0000, price: 3, type: "chat_toy", toy: "chatcolor", param: "red", duration: 600, currency: "gems" },
  { id: "cc_blue", name: "Màu chat Xanh (10p)", color: 0x0000FF, price: 3, type: "chat_toy", toy: "chatcolor", param: "blue", duration: 600, currency: "gems" },
  { id: "cc_gold", name: "Màu chat Vàng Gold (10p)", color: 0xFFD700, price: 5, type: "chat_toy", toy: "chatcolor", param: "#FFD700", duration: 600, currency: "gems" },
  { id: "cc_random", name: "Màu chat Ngẫu nhiên (10p)", color: 0xFFFFFF, price: 1500000, type: "chat_toy", toy: "chatcolor", param: "random", duration: 600, currency: "coins" },
  { id: "bomb", name: "💣 Chat Bomb", color: 0xFF6600, price: 2, type: "chat_toy", toy: "bomb", param: null, count: 1, currency: "gems" },
  { id: "whisper", name: "👂 Nhắn riêng", color: 0xCCCCCC, price: 2, type: "chat_toy", toy: "whisper", param: null, count: 1, currency: "gems" },
  { id: "sparkle", name: "✨ Tên lấp lánh (10p)", color: 0xFFD700, price: 4, type: "chat_toy", toy: "sparkle", param: null, duration: 600, currency: "gems" },
  { id: "spam_shield", name: "🛡️ Miễn spam (5s)", color: 0x00FF00, price: 3, type: "chat_toy", toy: "spam_shield", param: 5, count: 1, currency: "gems" },
  { id: "megaphone", name: "📢 Loa phường", color: 0xFF00FF, price: 10, type: "chat_toy", toy: "megaphone", param: null, count: 1, currency: "gems" },

  // === TITLES CAO CẤP (BÁN BẰNG GEMS) ===
  { id: "title_king", name: "👑 King", color: null, price: 120, type: "title", currency: "gems" },
  { id: "title_legend", name: "🌟 Legend", color: null, price: 120, type: "title", currency: "gems" },
  { id: "title_god", name: "⚡ God", color: null, price: 120, type: "title", currency: "gems" },
  { id: "title_dragon", name: "🐐 Goat", color: null, price: 150, type: "title", currency: "gems" },
  { id: "title_star", name: "⭐ Ngôi sao", color: null, price: 100, type: "title", currency: "gems" },

  // === TITLES THƯỜNG ===
  { id: "title_pro", name: "🔥 Pro", color: null, price: 30, type: "title", currency: "gems" },
  { id: "title_elite", name: "💠 Elite", color: null, price: 25, type: "title", currency: "gems" },
  { id: "title_beast", name: "🦁 Beast", color: null, price: 20, type: "title", currency: "gems" },
  { id: "title_goat", name: "🐉 Rồng", color: null, price: 25, type: "title", currency: "gems" },
  { id: "title_master", name: "🏆 Master", color: null, price: 15, type: "title", currency: "gems" },
  { id: "title_dog", name: "🐶 Chó", color: null, price: 5, type: "title", currency: "gems" },
  { id: "title_cat", name: "🐱 Mèo", color: null, price: 5, type: "title", currency: "gems" },
  { id: "title_gamer", name: "🎮 Gamer", color: null, price: 10, type: "title", currency: "gems" },
  { id: "title_hacker", name: "💻 Hacker", color: null, price: 10, type: "title", currency: "gems" },
  { id: "title_fox", name: "🦊 Cáo", color: null, price: 5, type: "title", currency: "gems" },
  { id: "title_eagle", name: "🦅 Đại bàng", color: null, price: 10, type: "title", currency: "gems" },
  { id: "title_storm", name: "🌪️ Bão tố", color: null, price: 8, type: "title", currency: "gems" },
  { id: "title_fire", name: "🔥 Lửa", color: null, price: 8, type: "title", currency: "gems" },
  { id: "title_ice", name: "❄️ Băng", color: null, price: 8, type: "title", currency: "gems" },
  { id: "title_lightning", name: "⚡ Sấm sét", color: null, price: 12, type: "title", currency: "gems" },
  { id: "title_assassin", name: "🗡️ Sát thủ", color: null, price: 10, type: "title", currency: "gems" },
  { id: "title_ghost", name: "👻 Ma", color: null, price: 8, type: "title", currency: "gems" },

  // Các món rẻ tiền mua bằng coins
  { id: "title_dumb", name: "Ngu", color: null, price: 10000, type: "title", currency: "coins" },
  { id: "title_shit", name: "Ăn Cứt", color: null, price: 10000, type: "title", currency: "coins" }];
const SHOP_ROLES = SHOP_ITEMS.filter(i => i.type === "role");
const MAX_TRANSFER_AMOUNT = 50000; // Số tiền tối đa cho 1 lần chuyển
const MAX_DAILY_TRANSFERS = 5;     // Số lần chuyển tối đa trong 1 ngày
// Thử thách trận đấu (Match Quests)
const MATCH_CHALLENGES = [
  { id: "hattrick", name: "⚽ HATTRICK HERO", desc: "Ghi ít nhất 3 bàn thắng trong trận", bonus: 3000, check: (s) => s.goals >= 3 },
  { id: "poker", name: "🔥 POKER LỬA", desc: "Ghi 4 bàn thắng trong trận", bonus: 10000, check: (s) => s.goals >= 4 },
  { id: "playmaker", name: "🎯 NHẠC TRƯỞNG", desc: "Có ít nhất 2 pha kiến tạo thành bàn", bonus: 2000, check: (s) => s.assists >= 2 },
  { id: "assist_king", name: "👑 VUA KIẾN TẠO", desc: "Có ít nhất 3 pha kiến tạo thành bàn", bonus: 3500, check: (s) => s.assists >= 3 },
  { id: "first_blood", name: "🗡️ CHIẾN CÔNG ĐẦU", desc: "Là người ghi bàn thắng ĐẦU TIÊN của trận", bonus: 1500, check: (s) => s.firstBlood === true },
  { id: "carry", name: "💪 GÁNH TEAM", desc: "Ghi ít nhất 1 bàn VÀ 1 kiến tạo trong trận", bonus: 2500, check: (s) => s.goals >= 1 && s.assists >= 1 },
  { id: "super_carry", name: "🚀 SIÊU NHÂN", desc: "Ghi ít nhất 2 bàn VÀ 2 kiến tạo trong trận", bonus: 5000, check: (s) => s.goals >= 2 && s.assists >= 2 }
];

let currentChallenge = null;
let challengeTracker = {}; // Bộ nhớ tạm để theo dõi tiến độ của người chơi
// Hệ thống Votekick
const BAD_WORDS = ["chịch", "buòi", "buồi", "buoi", "đit", "fucking", "cunt", "dcmm", "đcmm", "me may", "con mẹ mày", "con me may", "loz", "lòn", "lon", "lồn", "cặc", "fuck", "bitch", "shit", "concac", "nigga", "địt", "con cac", "dit", "đmm", "ad ngu", "duma", "đụ", "backy", "namky", "bắc kỳ", "nam kỳ", "namki", "backi", "bac ky", "nam ky", "nam kì", "bắc kì", "parky"];
const MAX_BAD_WORDS = 4;
let badWordCounts = {};
let activeVoteKick = null;
const TEAM_COLORS = [
  // [angle, avatarBgColor, [stripeColors]] — avatar phải tương phản với stripe chính
  // Đỏ thuần vs Xanh Navy (avatar vàng nổi bật trên cả 2)
  [[60, 0xFFFF00, [0xFF3030, 0xFF6060]], [60, 0xFFFF00, [0x003EA6, 0x0060D0]]],
  // Đỏ rực vs Xanh Cyan (avatar trắng vs avatar đen, sọc tương phản rõ)
  [[60, 0xFF0000, [0xFFFFFF, 0xFFE000]], [60, 0x000000, [0x00E5FF, 0x00BFFF]]],
  // Đỏ Cam vs Xanh Lam (avatar đen vs avatar trắng)
  [[45, 0x000000, [0xFF4500, 0xFFAA00, 0xFF4500]], [45, 0xFFFFFF, [0x0044CC, 0x00AAFF, 0x0044CC]]],
  // Cam rực vs Xanh Navy (avatar đen vs avatar trắng)
  [[0, 0x000000, [0xFF6600, 0xFFCC00]], [0, 0xFFFFFF, [0x000066, 0x0000CC]]],
  // Đỏ Mận sọc vs Cyan Sọc (avatar trắng cho cả 2, sọc đối lập)
  [[0, 0xFFFFFF, [0xCC0000, 0x880000, 0xCC0000]], [0, 0x000000, [0x00CCCC, 0x008888, 0x00CCCC]]],
  // Hồng Đỏ vs Xanh Dương Đậm (avatar trắng vs avatar đen)
  [[90, 0xFFFFFF, [0xFF0055, 0xFF5580, 0xFF0055]], [90, 0xFFFFFF, [0x0011CC, 0x4455FF, 0x0011CC]]],
  // Đen Đỏ vs Trắng Xanh (avatar đỏ vs avatar xanh - tương phản tuyệt đối)
  [[45, 0xFFFFFF, [0x000000, 0xFF0000, 0x000000]], [45, 0x000000, [0xFFFFFF, 0x00AAFF, 0xFFFFFF]]],
  // Trắng sọc Đỏ vs Đen sọc Xanh (avatar đỏ vs avatar xanh)
  [[45, 0x000000, [0xFFFFFF, 0xDD0000, 0xFFFFFF]], [45, 0xFFFFFF, [0x000000, 0x0066FF, 0x000000]]],
  // Vàng Đỏ vs Đen Cyan (avatar đen vs avatar vàng)
  [[-45, 0x000000, [0xFF2200, 0xFFDD00, 0xFF2200]], [-45, 0xFFDD00, [0x004466, 0x00BBEE, 0x004466]]],
  // Hồng Tươi vs Tím Xanh (avatar trắng vs avatar đen)
  [[232, 0xFFFFFF, [0xFF0077, 0xFF44AA, 0xFF0077]], [129, 0x000000, [0x5522CC, 0x8866FF, 0x5522CC]]],
  // Xanh Lá Sáng vs Tím Đậm (avatar đen vs avatar trắng — tương phản cao)
  [[45, 0x000000, [0x00FF44, 0x00BB33]], [45, 0xFFFFFF, [0x8800CC, 0x5500AA]]],
  // Vàng Đen vs Xanh Trắng (avatar đen vs avatar trắng)
  [[90, 0x000000, [0xFFDD00, 0xFF8800, 0xFFDD00]], [90, 0xFFFFFF, [0x002299, 0x0055CC, 0x002299]]],
  // Xám Đen vs Trắng Vàng (avatar đỏ vs avatar xanh - highlight màu đối lập)
  [[135, 0xFF2200, [0x222222, 0x000000, 0x222222]], [135, 0x0044FF, [0xEEEEEE, 0xFFFFFF, 0xEEEEEE]]],
  // Cam Đỏ vs Xanh Navy (avatar đen vs avatar vàng)
  [[60, 0x000000, [0xFF6600, 0xFF2200, 0xFF6600]], [60, 0xFFDD00, [0x000044, 0x0000AA, 0x000044]]],
  // Xanh Lá Neon vs Đỏ (avatar đen cho cả 2, sọc đối nghịch hoàn toàn)
  [[90, 0x000000, [0x00FF66, 0x00AA44]], [90, 0x000000, [0xFF2200, 0xAA0000]]],
  // Hồng Tím vs Xanh Rêu (avatar trắng vs avatar đen)
  [[45, 0xFFFFFF, [0xFF00CC, 0x9900CC]], [45, 0x000000, [0x006633, 0x003300]]],
  // Xanh Lá Matrix vs Đỏ Lửa (avatar đen cho cả 2, cực kỳ tương phản)
  [[0, 0x000000, [0x00FF44, 0x008822]], [0, 0x000000, [0xFF2200, 0x880000]]],
  // Vàng Cyan vs Đỏ Tím (avatar đen vs avatar đen, sọc 2 màu đối nghịch)
  [[60, 0x000000, [0xFFDD00, 0x00FFFF]], [60, 0x000000, [0xFF0033, 0x6600CC]]],
  // Hồng Pastel vs Xanh Pastel (avatar tím vs avatar cam - tương phản ngầm)
  [[120, 0xAA0055, [0xFFCCDD, 0xFFAABB]], [120, 0xFFFFFF, [0x004499, 0x002266]]],
  // Hoàng Hôn Đỏ vs Đêm Tối (avatar trắng vs avatar trắng, sọc đối lập)
  [[135, 0xFFFFFF, [0xFF4400, 0xCC0033, 0xFF4400]], [135, 0xFFFFFF, [0x001166, 0x003399, 0x001166]]],
  // Vàng Hoàng Gia vs Tím Ngọc (avatar đen vs avatar vàng)
  [[45, 0x000000, [0xFFCC00, 0xFFFF66, 0xFFCC00]], [45, 0xFFFF00, [0x5500AA, 0x8800DD, 0x5500AA]]],
  // Hồng Neon vs Cyan Đậm (avatar trắng vs avatar đen)
  [[90, 0xFFFFFF, [0xFF0077, 0xFF6600]], [90, 0x000000, [0x00CCEE, 0x001188]]],
  // Đỏ Sẫm Cam vs Xanh Lá Thẫm (avatar vàng vs avatar tím)
  [[60, 0xFFAA00, [0xFF0000, 0xAA0000, 0xFF5500]], [60, 0x9900CC, [0x003322, 0x006644, 0x00AA77]]],
  // Navy vs Vàng (avatar trắng vs avatar đen — cổ điển tương phản)
  [[0, 0xFFFFFF, [0x000055, 0x0000AA, 0x000055]], [0, 0x000000, [0xFFCC00, 0xFFFF44, 0xFFCC00]]],
  // Tím Đêm vs Xanh Neon (avatar vàng vs avatar đen)
  [[135, 0xFFCC00, [0x220044, 0x110022]], [135, 0x000000, [0x99FF00, 0x66CC00]]],
  // Xanh Bầu Trời vs Vàng Kim (avatar đen vs avatar đen)
  [[90, 0x000000, [0x88BBDD, 0xFFFFFF, 0x88BBDD]], [90, 0x000000, [0xFFDD00, 0xCC9900, 0xFFDD00]]],
  // Đỏ Thẫm vs Xanh Thép (avatar trắng vs avatar trắng)
  [[-45, 0xFFFFFF, [0xCC2200, 0x990000]], [-45, 0xFFFFFF, [0x223355, 0x445577]]],
  // Cam Lửa vs Xanh Lam (avatar đen vs avatar trắng)
  [[45, 0x000000, [0xFF5500, 0xFFAA00, 0xFF5500]], [45, 0xFFFFFF, [0x0033AA, 0x0066DD, 0x0033AA]]],
  // Trắng Đỏ vs Xanh Vàng (Real Madrid vs Barcelona)
  [[0, 0xAA8800, [0xFFFFFF, 0xEEEEEE]], [0, 0xFFDD00, [0x003366, 0x990033, 0x003366]]],
  // Đỏ Đậm vs Xanh Nhạt (Man Utd vs Man City)
  [[0, 0xFFFFFF, [0xBB0011, 0x880011]], [0, 0xFFFFFF, [0x55AADD, 0x7FCCEE]]],
  // Đen Đỏ vs Đen Xanh (AC Milan vs Inter)
  [[0, 0xFFFFFF, [0xDD0011, 0x000000, 0xDD0011]], [0, 0xFFEE00, [0x0022BB, 0x000000, 0x0022BB]]],
  // Đỏ vs Vàng Đen (Bayern vs Dortmund)
  [[0, 0xFFFFFF, [0xCC0022, 0x880011]], [0, 0xFFFFFF, [0xFFDD00, 0x000000, 0xFFDD00]]],
  // Đỏ vs Xanh (Arsenal vs Chelsea)
  [[0, 0xFFFFFF, [0xEE0000, 0xCC0000]], [0, 0xFFFFFF, [0x0033AA, 0x0033AA]]],
  // Trắng Đen vs Xanh (Juventus vs Napoli)
  [[0, 0xFFD700, [0xFFFFFF, 0x000000, 0xFFFFFF]], [0, 0x000000, [0x0099CC, 0x0099CC]]],
  // Đỏ Trắng vs Xanh Trắng (Croatia vs England)
  [[0, 0xFFDD00, [0xAA0000, 0xFF2200, 0xAA0000]], [0, 0xCC0000, [0x000066, 0xFFFFFF, 0x000066]]],
  // Đen Tím vs Tím Hồng (Cyberpunk)
  [[135, 0xFFFFFF, [0x000000, 0x111111, 0x000000]], [135, 0xFFFFFF, [0x9900CC, 0x5500AA, 0xFF0099]]],
  // Đỏ Vàng vs Xanh (Việt Nam vs Thái Lan)
  [[0, 0xFFFF00, [0xDD0000, 0xBB0000]], [0, 0xFFFFFF, [0x0000EE, 0x000099]]],
  // Hồng Nhạt vs Xanh Da Trời (bé gái vs bé trai)
  [[45, 0x990055, [0xFF99BB, 0xFFBBCC, 0xFFCCDD]], [45, 0xFFFFFF, [0x004499, 0x002266, 0x004499]]],
  // Cam Lửa vs Xanh Lá Đậm (đối lập mạnh)
  [[90, 0x000000, [0xFF4400, 0x882200]], [90, 0x000000, [0x00FF44, 0x008822]]],
  // Đen Vàng vs Đen Vàng Xanh (Golden Night)
  [[0, 0xBB8800, [0x000000, 0x111111, 0x000000]], [0, 0x000000, [0xBBAA00, 0xFFDD00, 0xBBAA00]]],
  // Cam Hà Lan vs Xanh Croatia (quốc kỳ)
  [[0, 0xFFFFFF, [0xFF5500, 0xFF5500]], [90, 0x0000BB, [0xFFFFFF, 0xFF2200, 0xFFFFFF]]],
  // Vàng Lá vs Đen Xanh (Brazil vs Argentina)
  [[0, 0x006622, [0xFFCC00, 0xFFCC00]], [0, 0x000000, [0x5588BB, 0x5588BB]]],
  // Vàng Colombia vs Đỏ Chile
  [[0, 0x003399, [0xFFCC00, 0xFFCC00]], [0, 0xFFFFFF, [0xCC0011, 0x002288, 0xCC0011]]],
  // Xanh Nhật vs Đỏ Hàn
  [[0, 0xFFFFFF, [0x000066, 0x0000AA]], [0, 0xFFFFFF, [0xCC0011, 0xCC0011]]],
  // Xanh Ả Rập vs Vàng Úc
  [[0, 0xFFFFFF, [0x006633, 0x006633]], [0, 0x00AA44, [0xFFCC00, 0xFFCC00]]],
  // Tím Lavender vs Xanh Navy (avatar đen vs avatar tím)
  [[60, 0x000033, [0x9988EE, 0xBBAEFF]], [60, 0x5500AA, [0xFFFFFF, 0xFFFFFF]]],
  // Cyan vs Vàng (biển vs cát)
  [[0, 0xFFFFFF, [0x00AAAA, 0x0088BB]], [0, 0x000000, [0xFFDD00, 0xFFBB00]]],
  // Cam Chanh vs Xanh Bạc Hà (avatar đen vs avatar trắng)
  [[45, 0x000000, [0xFFAA00, 0xFFEE44]], [45, 0xFFFFFF, [0x00AA55, 0x008844]]],
  // Hồng Dạ Quang vs Xanh Đậm (avatar trắng vs avatar trắng)
  [[45, 0xFFFFFF, [0xFF0077, 0xDD0022]], [45, 0x000000, [0x00FFFF, 0x0088FF]]],
  // Hoàng Hôn vs Đêm Sâu (avatar trắng vs avatar trắng)
  [[135, 0xFFFFFF, [0xFF0000, 0x880000, 0xCC2266]], [135, 0xFFFFFF, [0x000044, 0x000088, 0x000044]]],
  // --- THÊM CÁC CÂU LẠC BỘ CHÂU ÂU ---
  [[0, 0x0000FF, [0xCB3524, 0xFFFFFF, 0xCB3524]], [0, 0x000000, [0xFFFFFF, 0xFFFFFF]]],
  [[0, 0xFFFFFF, [0x004170, 0xE30613, 0x004170]], [45, 0x000000, [0xFFFFFF, 0xED1C24]]],
  [[0, 0xFFD700, [0xFFFFFF, 0x000000, 0xFFFFFF]], [0, 0x000000, [0x87CEEB, 0x87CEEB]]],
  [[0, 0xFFD700, [0x8E1F2F, 0x8E1F2F]], [0, 0xFFFFFF, [0x12A0D7, 0x12A0D7]]],
  [[0, 0xFFFFFF, [0xA32638, 0xF2A900]], [0, 0xFFFFFF, [0xFEDD00, 0x002395, 0xFEDD00]]],
  [[0, 0xFFFFFF, [0x6CABDD, 0x6CABDD]], [0, 0xD4AF37, [0x000000, 0xFFFFFF, 0x000000]]],
  [[0, 0x000000, [0xFDE100, 0xFDE100]], [0, 0x000000, [0xDD013F, 0xFFFFFF, 0xDD013F]]],
];
let colorHistory = []; // Lưu trữ chỉ số (index) của các màu đã dùng gần đây
const HISTORY_LIMIT = 20;
// Tạo một danh sách các trận đấu đặc biệt.
const SPECIAL_MATCHES = {
  // 🏆 CÂU LẠC BỘ CHÂU ÂU - khớp với TEAM_COLORS index 50-56

  // Index 50: Atletico vs Valencia
  [JSON.stringify([[0, 0x0000FF, [0xCB3524, 0xFFFFFF, 0xCB3524]], [0, 0x000000, [0xFFFFFF, 0xFFFFFF]]])]: {
    name: "⚔️ LA LIGA: ATLETICO MADRID vs VALENCIA", color: 0xCB3524, icon: "🛡️"
  },
  // Index 51: PSG vs Monaco
  [JSON.stringify([[0, 0xFFFFFF, [0x004170, 0xE30613, 0x004170]], [45, 0x000000, [0xFFFFFF, 0xED1C24]]])]: {
    name: "🗼 LIGUE 1: PSG vs AS MONACO", color: 0x004170, icon: "🗼"
  },
  // Index 52: Juventus vs Lazio
  [JSON.stringify([[0, 0xFFD700, [0xFFFFFF, 0x000000, 0xFFFFFF]], [0, 0x000000, [0x87CEEB, 0x87CEEB]]])]: {
    name: "🦓 SERIE A: JUVENTUS vs LAZIO", color: 0xFFFFFF, icon: "🦓"
  },
  // Index 53: AS Roma vs Napoli
  [JSON.stringify([[0, 0xFFD700, [0x8E1F2F, 0x8E1F2F]], [0, 0xFFFFFF, [0x12A0D7, 0x12A0D7]]])]: {
    name: "☀️ DERBY DEL SOLE: AS ROMA vs NAPOLI", color: 0x8E1F2F, icon: "☀️"
  },
  // Index 54: Galatasaray vs Fenerbahce
  [JSON.stringify([[0, 0xFFFFFF, [0xA32638, 0xF2A900]], [0, 0xFFFFFF, [0xFEDD00, 0x002395, 0xFEDD00]]])]: {
    name: "🔥 KITALARARASI DERBI: GALATASARAY vs FENERBAHCE", color: 0xA32638, icon: "🔥"
  },
  // Index 55: Man City vs Newcastle
  [JSON.stringify([[0, 0xFFFFFF, [0x6CABDD, 0x6CABDD]], [0, 0xD4AF37, [0x000000, 0xFFFFFF, 0x000000]]])]: {
    name: "🦅 NGOẠI HẠNG ANH: MAN CITY vs NEWCASTLE", color: 0x6CABDD, icon: "🦅"
  },
  // Index 56: Dortmund vs RB Leipzig
  [JSON.stringify([[0, 0x000000, [0xFDE100, 0xFDE100]], [0, 0x000000, [0xDD013F, 0xFFFFFF, 0xDD013F]]])]: {
    name: "🐝 BUNDESLIGA: DORTMUND vs RB LEIPZIG", color: 0xFDE100, icon: "🐝"
  },

  // 🌍 ĐỘI TUYỂN - khớp với TEAM_COLORS index 39-46
  // Index 34: Croatia vs England
  [JSON.stringify([[0, 0xFFDD00, [0xAA0000, 0xFF2200, 0xAA0000]], [0, 0xCC0000, [0x000066, 0xFFFFFF, 0x000066]]])]: {
    name: "⚔️ EURO ĐẠI CHIẾN: CROATIA vs ANH", color: 0xCC0000, icon: "⚔️"
  },
  // Index 39: Cam Hà Lan vs Croatia
  [JSON.stringify([[0, 0xFFFFFF, [0xFF5500, 0xFF5500]], [90, 0x0000BB, [0xFFFFFF, 0xFF2200, 0xFFFFFF]]])]: {
    name: "🌪️ ĐẠI CHIẾN CHÂU ÂU: HÀ LAN vs CROATIA", color: 0xFF5500, icon: "🌪️"
  },
  // Index 40: Brazil vs Argentina
  [JSON.stringify([[0, 0x006622, [0xFFCC00, 0xFFCC00]], [0, 0x000000, [0x5588BB, 0x5588BB]]])]: {
    name: "🌞 SIÊU KINH ĐIỂN NAM MỸ: BRAZIL vs ARGENTINA", color: 0xFFCC00, icon: "🌞"
  },
  // Index 41: Colombia vs Chile
  [JSON.stringify([[0, 0x003399, [0xFFCC00, 0xFFCC00]], [0, 0xFFFFFF, [0xCC0011, 0x002288, 0xCC0011]]])]: {
    name: "☕ RỰC LỬA NAM MỸ: COLOMBIA vs CHILE", color: 0xFFCC00, icon: "☕"
  },
  // Index 42: Nhật Bản vs Hàn Quốc
  [JSON.stringify([[0, 0xFFFFFF, [0x000066, 0x0000AA]], [0, 0xFFFFFF, [0xCC0011, 0xCC0011]]])]: {
    name: "⛩️ DERBY ĐÔNG Á: NHẬT BẢN vs HÀN QUỐC", color: 0x0000AA, icon: "⛩️"
  },
  // Index 43: Ả Rập Xê Út vs Australia
  [JSON.stringify([[0, 0xFFFFFF, [0x006633, 0x006633]], [0, 0x00AA44, [0xFFCC00, 0xFFCC00]]])]: {
    name: "🐪 CHÂU Á TRANH BÁ: Ả RẬP XÊ ÚT vs AUSTRALIA", color: 0x006633, icon: "🐪"
  },

  // 🚀 SỰ KIỆN ĐẶC BIỆT - khớp với TEAM_COLORS index 35-38
  // Index 35: Cyberpunk (Đen Tím vs Tím Hồng)
  [JSON.stringify([[135, 0xFFFFFF, [0x000000, 0x111111, 0x000000]], [135, 0xFFFFFF, [0x9900CC, 0x5500AA, 0xFF0099]]])]: {
    name: "🤖 CHẾ ĐỘ CYBERPUNK 2077 KÍCH HOẠT", color: 0x9900CC, icon: "🤖"
  },
  // Index 36: Việt Nam vs Thái Lan
  [JSON.stringify([[0, 0xFFFF00, [0xDD0000, 0xBB0000]], [0, 0xFFFFFF, [0x0000EE, 0x000099]]])]: {
    name: "⭐ DERBY ĐÔNG NAM Á: VIỆT NAM vs THÁI LAN", color: 0xFFFF00, icon: "⭐"
  },
  // Index 38: Cam Lửa vs Xanh Lá (Rồng Lửa vs Rồng Độc)
  [JSON.stringify([[90, 0x000000, [0xFF4400, 0x882200]], [90, 0x000000, [0x00FF44, 0x008822]]])]: {
    name: "🐉 TRẬN CHIẾN QUÁI THÚ: RỒNG LỬA vs RỒNG ĐỘC", color: 0xFF4400, icon: "🐉"
  },
  // Index 33: Đỏ Trắng vs Xanh Trắng (Juventus vs Napoli kiểu mới)
  [JSON.stringify([[0, 0xFFD700, [0xFFFFFF, 0x000000, 0xFFFFFF]], [0, 0x000000, [0x0099CC, 0x0099CC]]])]: {
    name: "🍕 ĐẠI CHIẾN NƯỚC Ý: JUVENTUS vs NAPOLI", color: 0x0099CC, icon: "🍕"
  },
  // Index 30: Đen Đỏ vs Đen Xanh (AC Milan vs Inter)
  [JSON.stringify([[0, 0xFFFFFF, [0xDD0011, 0x000000, 0xDD0011]], [0, 0xFFEE00, [0x0022BB, 0x000000, 0x0022BB]]])]: {
    name: "🏟️ DERBY DELLA MADONNINA: AC MILAN vs INTER MILAN", color: 0xDD0011, icon: "🏟️"
  },
  // Index 31: Đỏ vs Vàng Đen (Bayern vs Dortmund)
  [JSON.stringify([[0, 0xFFFFFF, [0xCC0022, 0x880011]], [0, 0xFFFFFF, [0xFFDD00, 0x000000, 0xFFDD00]]])]: {
    name: "⚡ DER KLASSIKER: BAYERN MUNICH vs DORTMUND", color: 0xFFDD00, icon: "⚡"
  },
  // Index 32: Đỏ vs Xanh (Arsenal vs Chelsea)
  [JSON.stringify([[0, 0xFFFFFF, [0xEE0000, 0xCC0000]], [0, 0xFFFFFF, [0x0033AA, 0x0033AA]]])]: {
    name: "🛡️ ĐẠI CHIẾN LONDON: ARSENAL vs CHELSEA", color: 0xEE0000, icon: "🛡️"
  },
  // Index 29: Man Utd vs Man City
  [JSON.stringify([[0, 0xFFFFFF, [0xBB0011, 0x880011]], [0, 0xFFFFFF, [0x55AADD, 0x7FCCEE]]])]: {
    name: "⚔️ DERBY MANCHESTER: MAN UTD vs MAN CITY", color: 0xBB0011, icon: "⚔️"
  },
  // Index 28: Real Madrid vs Barcelona
  [JSON.stringify([[0, 0xAA8800, [0xFFFFFF, 0xEEEEEE]], [0, 0xFFDD00, [0x003366, 0x990033, 0x003366]]])]: {
    name: "🔥 EL CLÁSICO: REAL MADRID vs BARCELONA", color: 0xFFDD00, icon: "🔥"
  },
  // Index 39 Golden Night (Đen Vàng)
  [JSON.stringify([[0, 0xBB8800, [0x000000, 0x111111, 0x000000]], [0, 0x000000, [0xBBAA00, 0xFFDD00, 0xBBAA00]]])]: {
    name: "👑 SỰ KIỆN VIP: ĐÊM HOÀNG KIM (GOLDEN NIGHT)", color: 0xFFDD00, icon: "👑"
  },
};
const NORMAL_MATCHES = {
  // 1. Đỏ thuần vs Xanh Navy
  [JSON.stringify([[60, 0xFFFF00, [0xFF3030, 0xFF6060]], [60, 0xFFFF00, [0x003EA6, 0x0060D0]]])]: {
    name: "🔴 Đỏ Rực vs 🔵 Xanh Navy", icon: "⚔️"
  },
  // 2. Đỏ rực vs Cyan (avatar đỏ vs avatar đen)
  [JSON.stringify([[60, 0xFF0000, [0xFFFFFF, 0xFFE000]], [60, 0x000000, [0x00E5FF, 0x00BFFF]]])]: {
    name: "🔥 Đỏ Lửa vs 💎 Xanh Băng", icon: "☄️"
  },
  // 3. Đỏ Cam vs Xanh Lam
  [JSON.stringify([[45, 0x000000, [0xFF4500, 0xFFAA00, 0xFF4500]], [45, 0xFFFFFF, [0x0044CC, 0x00AAFF, 0x0044CC]]])]: {
    name: "🌅 Solar Flare vs ⚡ Electric Blue", icon: "🌋"
  },
  // 4. Cam rực vs Xanh Navy
  [JSON.stringify([[0, 0x000000, [0xFF6600, 0xFFCC00]], [0, 0xFFFFFF, [0x000066, 0x0000CC]]])]: {
    name: "🟠 Cam Rực vs 🌊 Navy Đêm", icon: "🔆"
  },
  // 5. Đỏ Mận sọc vs Cyan Sọc
  [JSON.stringify([[0, 0xFFFFFF, [0xCC0000, 0x880000, 0xCC0000]], [0, 0x000000, [0x00CCCC, 0x008888, 0x00CCCC]]])]: {
    name: "🌋 Magma Đỏ vs 🌊 Aqua Sọc", icon: "🌋"
  },
  // 6. Hồng Đỏ vs Xanh Dương Đậm
  [JSON.stringify([[90, 0xFFFFFF, [0xFF0055, 0xFF5580, 0xFF0055]], [90, 0xFFFFFF, [0x0011CC, 0x4455FF, 0x0011CC]]])]: {
    name: "💗 Hồng Dạ Quang vs 🌑 Xanh Đêm", icon: "💫"
  },
  // 7. Đen Đỏ vs Trắng Xanh
  [JSON.stringify([[45, 0xFFFFFF, [0x000000, 0xFF0000, 0x000000]], [45, 0x000000, [0xFFFFFF, 0x00AAFF, 0xFFFFFF]]])]: {
    name: "⚫ Đen Đỏ vs ⚪ Trắng Xanh", icon: "🦓"
  },
  // 8. Trắng sọc Đỏ vs Đen sọc Xanh
  [JSON.stringify([[45, 0x000000, [0xFFFFFF, 0xDD0000, 0xFFFFFF]], [45, 0xFFFFFF, [0x000000, 0x0066FF, 0x000000]]])]: {
    name: "🔴 Đỏ Cổ Điển vs 🔵 Xanh Cổ Điển", icon: "🛡️"
  },
  // 9. Vàng Đỏ vs Đen Cyan
  [JSON.stringify([[-45, 0x000000, [0xFF2200, 0xFFDD00, 0xFF2200]], [-45, 0xFFDD00, [0x004466, 0x00BBEE, 0x004466]]])]: {
    name: "🟡 Vàng Nóng vs 💎 Xanh Kim Cương", icon: "🔆"
  },
  // 10. Hồng Tươi vs Tím Xanh
  [JSON.stringify([[232, 0xFFFFFF, [0xFF0077, 0xFF44AA, 0xFF0077]], [129, 0x000000, [0x5522CC, 0x8866FF, 0x5522CC]]])]: {
    name: "💖 Hồng Neon vs 🌌 Tím Galaxy", icon: "✨"
  },
  // 11. Xanh Lá Sáng vs Tím Đậm
  [JSON.stringify([[45, 0x000000, [0x00FF44, 0x00BB33]], [45, 0xFFFFFF, [0x8800CC, 0x5500AA]]])]: {
    name: "🌿 Xanh Lá Neon vs 🍇 Tím Đậm", icon: "🍃"
  },
  // 12. Vàng Đen vs Xanh Trắng
  [JSON.stringify([[90, 0x000000, [0xFFDD00, 0xFF8800, 0xFFDD00]], [90, 0xFFFFFF, [0x002299, 0x0055CC, 0x002299]]])]: {
    name: "🟡 Vàng Đen vs 🔵 Neon Blue", icon: "⚡"
  },
  // 13. Xám Đen vs Trắng Vàng
  [JSON.stringify([[135, 0xFF2200, [0x222222, 0x000000, 0x222222]], [135, 0x0044FF, [0xEEEEEE, 0xFFFFFF, 0xEEEEEE]]])]: {
    name: "🌑 Bóng Đêm vs ⚪ Ánh Trăng", icon: "🌘"
  },
  // 14. Cam Đỏ vs Xanh Navy
  [JSON.stringify([[60, 0x000000, [0xFF6600, 0xFF2200, 0xFF6600]], [60, 0xFFDD00, [0x000044, 0x0000AA, 0x000044]]])]: {
    name: "🟠 Lửa Cam vs ⚓ Navy Đêm", icon: "🔥"
  },
  // 15. Xanh Lá Neon vs Đỏ Lửa
  [JSON.stringify([[90, 0x000000, [0x00FF66, 0x00AA44]], [90, 0x000000, [0xFF2200, 0xAA0000]]])]: {
    name: "🌿 Matrix Xanh vs 🔥 Rồng Lửa", icon: "🐉"
  },
  // 16. Hồng Tím vs Xanh Rêu
  [JSON.stringify([[45, 0xFFFFFF, [0xFF00CC, 0x9900CC]], [45, 0x000000, [0x006633, 0x003300]]])]: {
    name: "🔮 Tím Ma Thuật vs 🌲 Lục Lâm", icon: "🪄"
  },
  // 17. Xanh Lá Matrix vs Đỏ Lửa
  [JSON.stringify([[0, 0x000000, [0x00FF44, 0x008822]], [0, 0x000000, [0xFF2200, 0x880000]]])]: {
    name: "💻 Hacker Matrix vs 🔥 Firewall", icon: "💻"
  },
  // 18. Vàng Hoàng Gia vs Tím Ngọc
  [JSON.stringify([[45, 0x000000, [0xFFCC00, 0xFFFF66, 0xFFCC00]], [45, 0xFFFF00, [0x5500AA, 0x8800DD, 0x5500AA]]])]: {
    name: "👑 Vàng Hoàng Gia vs 🟣 Tím Hoàng Gia", icon: "⚜️"
  },
  // 19. Đỏ Sẫm Cam vs Xanh Lá Thẫm
  [JSON.stringify([[60, 0xFFAA00, [0xFF0000, 0xAA0000, 0xFF5500]], [60, 0x9900CC, [0x003322, 0x006644, 0x00AA77]]])]: {
    name: "🩸 Máu Đỏ vs 🌿 Thợ Săn Rừng", icon: "🏹"
  },
  // 20. Tím Đêm vs Xanh Neon
  [JSON.stringify([[135, 0xFFCC00, [0x220044, 0x110022]], [135, 0x000000, [0x99FF00, 0x66CC00]]])]: {
    name: "🟣 Đêm Tím vs 🟢 Neon Lime", icon: "🎮"
  },
  // 21. Đỏ Thẫm vs Xanh Thép
  [JSON.stringify([[-45, 0xFFFFFF, [0xCC2200, 0x990000]], [-45, 0xFFFFFF, [0x223355, 0x445577]]])]: {
    name: "🔴 Đỏ Thẫm vs 🌑 Thép Xanh", icon: "⚔️"
  },
  // 22. Cam Lửa vs Xanh Lam
  [JSON.stringify([[45, 0x000000, [0xFF5500, 0xFFAA00, 0xFF5500]], [45, 0xFFFFFF, [0x0033AA, 0x0066DD, 0x0033AA]]])]: {
    name: "🔥 Hỏa Diệm vs ❄️ Băng Sương", icon: "☄️"
  },
  // 23. Navy vs Vàng
  [JSON.stringify([[0, 0xFFFFFF, [0x000055, 0x0000AA, 0x000055]], [0, 0x000000, [0xFFCC00, 0xFFFF44, 0xFFCC00]]])]: {
    name: "⚓ Navy vs 🌟 Vàng Rực", icon: "⭐"
  },
  // 24. Cyan vs Vàng
  [JSON.stringify([[0, 0xFFFFFF, [0x00AAAA, 0x0088BB]], [0, 0x000000, [0xFFDD00, 0xFFBB00]]])]: {
    name: "🌊 Biển Ban Mai vs 🏜️ Cát Vàng", icon: "🌊"
  },
  // 25. Cam Chanh vs Xanh Bạc Hà
  [JSON.stringify([[45, 0x000000, [0xFFAA00, 0xFFEE44]], [45, 0xFFFFFF, [0x00AA55, 0x008844]]])]: {
    name: "🍊 Cam Chanh vs 🌿 Xanh Bạc Hà", icon: "🍃"
  },
  // 26. Hồng Dạ Quang vs Xanh Đậm
  [JSON.stringify([[45, 0xFFFFFF, [0xFF0077, 0xDD0022]], [45, 0x000000, [0x00FFFF, 0x0088FF]]])]: {
    name: "💖 Hồng Dạ Quang vs 🔵 Thiên Thanh", icon: "💫"
  },
  // 27. Hoàng Hôn vs Đêm Sâu
  [JSON.stringify([[135, 0xFFFFFF, [0xFF0000, 0x880000, 0xCC2266]], [135, 0xFFFFFF, [0x000044, 0x000088, 0x000044]]])]: {
    name: "🌇 Chiều Tà vs 🌃 Màn Đêm", icon: "🌆"
  },
  // 28. Xanh Bầu Trời vs Vàng Kim
  [JSON.stringify([[90, 0x000000, [0x88BBDD, 0xFFFFFF, 0x88BBDD]], [90, 0x000000, [0xFFDD00, 0xCC9900, 0xFFDD00]]])]: {
    name: "🌀 Bầu Trời vs 🌟 Hoàng Kim", icon: "🌤️"
  },
  // 29. Hồng Neon vs Cyan Đậm
  [JSON.stringify([[90, 0xFFFFFF, [0xFF0077, 0xFF6600]], [90, 0x000000, [0x00CCEE, 0x001188]]])]: {
    name: "💗 Hồng Cyberpunk vs 🌊 Xanh Neon", icon: "🌴"
  },
  // 30. Hoàng Hôn Đỏ vs Đêm Tối
  [JSON.stringify([[135, 0xFFFFFF, [0xFF4400, 0xCC0033, 0xFF4400]], [135, 0xFFFFFF, [0x001166, 0x003399, 0x001166]]])]: {
    name: "🌇 Hoàng Hôn vs 🌙 Biển Đêm", icon: "🌆"
  },
  // 31. Vàng Cyan vs Đỏ Tím
  [JSON.stringify([[60, 0x000000, [0xFFDD00, 0x00FFFF]], [60, 0x000000, [0xFF0033, 0x6600CC]]])]: {
    name: "💛 Vàng Cyan vs 💜 Đỏ Tím", icon: "💫"
  },
  // 32. Hồng Pastel vs Xanh Pastel
  [JSON.stringify([[120, 0xAA0055, [0xFFCCDD, 0xFFAABB]], [120, 0xFFFFFF, [0x004499, 0x002266]]])]: {
    name: "🌸 Hồng Pastel vs 🌊 Xanh Pastel", icon: "💮"
  },
  // 33. Hồng Nhạt vs Xanh Da Trời
  [JSON.stringify([[45, 0x990055, [0xFF99BB, 0xFFBBCC, 0xFFCCDD]], [45, 0xFFFFFF, [0x004499, 0x002266, 0x004499]]])]: {
    name: "🎀 Bé Gái vs 🍼 Bé Trai", icon: "🧸"
  },
  // 34. Tím Lavender vs Xanh Navy
  [JSON.stringify([[60, 0x000033, [0x9988EE, 0xBBAEFF]], [60, 0x5500AA, [0xFFFFFF, 0xFFFFFF]]])]: {
    name: "🪻 Tím Lavender vs ⚓ Xanh Navy", icon: "🪻"
  }
};

const GOALKEEPER_COLORS = {
  red: [0, 0xFFFFFF, [0x363636, 0x262626, 0x363636]],
  blue: [0, 0xFFFFFF, [0x13A720, 0x2FD835, 0x13A720]],
};
const GOAL_COMMENTARIES = {
  "-3": [
    "Bàn thắng rút ngắn cách biệt. Tuy nhiên khoảng cách vẫn còn rất lớn.",
    "Một bàn gỡ danh dự, thế trận vẫn đang hoàn toàn nghiêng về đối thủ.",
  ],
  "-2": [
    "Cách biệt được rút ngắn xuống còn 2 bàn. Áp lực bắt đầu xuất hiện.",
    "Bàn thắng quan trọng để nuôi lại hy vọng bám đuổi tỉ số.",
    "Lưới đã rung. Đội bị dẫn trước đang cố gắng giành lại thế trận.",
  ],
  "-1": [
    "Chỉ còn cách biệt đúng 1 bàn. Trận đấu đang trở nên căng thẳng.",
    "Bàn rút ngắn tỉ số cực kỳ sát nút. Mọi thứ đều có thể xảy ra.",
    "Khoảng cách giờ chỉ là 1 bàn. Sai lầm lúc này sẽ phải trả giá đắt.",
  ],
  "0": [
    "Tỉ số đã được cân bằng. Trận đấu chính thức quay lại vạch xuất phát.",
    "Bàn thắng gỡ hòa chuẩn xác. Không bên nào nắm lợi thế lúc này.",
    "Thế quân bình được thiết lập. Một đòn giáng mạnh vào sự chủ quan của hàng thủ.",
    "Lưới rung và tỉ số là hòa. Hai đội sẽ phải làm lại từ đầu.",
  ],
  "1": [
    "Vươn lên dẫn trước. Thế bế tắc đã được phá vỡ.",
    "Một bàn lợi thế. Cục diện trận đấu bắt đầu thay đổi.",
    "Bàn thắng bản lề giúp đội bóng nắm quyền chủ động trên sân.",
  ],
  "2": [
    "Nhân đôi cách biệt. Một khoảng cách an toàn đang được thiết lập.",
    "Hai bàn dẫn trước. Đối phương bắt đầu bộc lộ sự lúng túng.",
    "Lợi thế được gia tăng. Hệ thống phòng ngự của đối thủ đang gặp rắc rối.",
  ],
  "3": [
    "Cách biệt 3 bàn. Trận đấu dường như đã được an bài.",
    "Sự áp đảo hoàn toàn được thể hiện rõ ràng trên bảng tỉ số.",
    "Ba bàn không gỡ. Một kịch bản rất khó để lật ngược thế cờ.",
  ],
  "4": [
    "4 bàn cách biệt. Hệ thống của đối thủ đã hoàn toàn vỡ trận.",
    "Không còn cơ hội phản kháng. Khoảng cách là quá lớn để san lấp.",
    "Một màn trình diễn áp đảo. Thế trận hoàn toàn thuộc về một bên.",
  ],
  "5": [
    "5 bàn cách biệt. Một trận đấu chênh lệch đẳng cấp rõ rệt.",
    "Hủy diệt hoàn toàn đối thủ. Không còn bất kỳ sự kháng cự nào.",
    "Kết liễu trận đấu bằng một tỉ số không tưởng.",
  ],
};

const WINNING_GOAL_COMMENTARIES = [
  "Trận đấu kết thúc. Bàn thắng ấn định tỉ số cuối cùng.",
  "Dấu chấm hết cho mọi nỗ lực bám đuổi của đối thủ.",
  "Chiến thắng đã được khẳng định một cách tuyệt đối.",
  "Bàn thắng chốt hạ. Không còn cơ hội nào để lật ngược thế cờ.",
  "Mọi thứ đã ngã ngũ. Một kết quả hoàn toàn xứng đáng.",
];

const SCORER_COMMENTARIES = {
  "1": "Bàn thắng mở tài khoản trong trận đấu này của",
  "2": "Cú đúp gọn gàng và chính xác được lập bởi",
  "3": "Hattrick xuất sắc! Màn trình diễn đẳng cấp đến từ",
  "4": "Cú Poker không khoan nhượng. Tiền đạo xuất sắc nhất lúc này là",
  "5": "Bàn thắng thứ 5 cá nhân. Hiệu suất ghi bàn hủy diệt của",
};

const PENALTY_GOAL_COMMENTARIES = [
  "Cú sút penalty thành công. Chính xác và lạnh lùng.",
  "Không có sai lầm nào trên chấm 11m. Bàn thắng được ghi.",
  "Thủ môn đã bị đánh lừa hoàn toàn. Một pha dứt điểm cơ bản.",
  "Áp lực được giải tỏa bằng cú sút penalty chuẩn mực.",
];

const PENALTY_MISS_COMMENTARIES = [
  "Cú sút hỏng ăn đáng tiếc trên chấm phạt đền.",
  "Không vào. Áp lực tâm lý đã khiến cú sút đi không như ý muốn.",
  "Cơ hội bị bỏ lỡ một cách khó hiểu từ khoảng cách 11m.",
  "Sút hỏng. Đối thủ đã phán đoán thành công ý đồ dứt điểm.",
];

const DISCORD_COIN_LOG_WEBHOOK = process.env.DISCORD_COIN_LOG_WEBHOOK || "";
const DISCORD_LOG_WEBHOOK = process.env.DISCORD_LOG_WEBHOOK || "";
const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK || "";
// ⚠️ WEBHOOK BÁO CÁO LỖI: Dùng cùng DISCORD_WEBHOOK hoặc thay bằng webhook riêng nếu muốn kênh riêng
const DISCORD_REPORT_WEBHOOK = process.env.DISCORD_REPORT_WEBHOOK || ""; // ← Đổi thành URL webhook khác nếu muốn gửi vào kênh riêng
// Discord User ID của các admin cần được tag khi có báo cáo lỗi
// Hướng dẫn lấy ID: Bật Developer Mode trong Discord → chuột phải vào tên user → "Copy User ID"
const REPORT_TAG_USER_IDS = process.env.REPORT_TAG_USER_IDS ? process.env.REPORT_TAG_USER_IDS.split(",").map(id => id.trim()) : []; // ← Điền ID thật vào đây!
const STADIUM_TRAINING = '{"name": "Practice","width": 250,"height": 250,"cameraWidth": 0,"cameraHeight": 0,"maxViewWidth": 0,"cameraFollow": "ball","spawnDistance": 170,"redSpawnPoints": [],"blueSpawnPoints": [],"kickOffReset": "partial","bg": {"color": "718C5A","type": "grass","height": 150,"width": 150,"cornerRadius": 0,"kickOffRadius": 0},"traits": {"ballArea": {"vis": false,"bCoef": 1,"cMask": ["ball"]},"goalPost": {"radius": 8,"invMass": 0,"bCoef": 0.5},"goalNet": {"vis": true,"bCoef": 0.1,"cMask": ["ball"]},"kickOffBarrier": {"vis": false,"bCoef": 0.1,"cGroup": ["redKO","blueKO"],"cMask": ["red","blue"]},"line": {"vis": true,"bCoef": 0,"cMask": [""]}},"vertexes": [],"segments": [],"goals": [],"discs": [],"planes": [{"normal": [0,-1],"dist": -200},{"normal": [0,1],"dist": -200},{"normal": [-1,0],"dist": -200},{"normal": [1,0],"dist": -200},{"normal": [0,-1],"dist": -150,"trait": "ballArea"},{"normal": [0,1],"dist": -150,"trait": "ballArea"},{"normal": [-1,0],"dist": -150,"bCoef": 1,"cMask": ["ball"],"trait": "ballArea"},{"normal": [1,0],"dist": -150,"bCoef": 1,"cMask": ["ball"],"trait": "ballArea"}],"joints": [],"playerPhysics": {"radius": 15.5,"bCoef": 0.35,"invMass": 0.5,"damping": 0.96,"cGroup": ["red","blue"],"acceleration": 0.118,"gravity": [0,0],"kickingAcceleration": 0.083,"kickingDamping": 0.96,"kickStrength": 4.7,"kickback": 0},"ballPhysics": {"radius": 6,"bCoef": 0.468,"cMask": ["all"],"damping": 0.99,"invMass": 1.4,"gravity": [0,0],"color": "BDFF80","cGroup": ["ball"],"canBeStored": true},"canBeStored": true}';
const STADIUM_1v1 = '{"name":"KFL 1v1 2v2 By DaYo from HaxMaps","width":480,"height":230,"bg":{"kickOffRadius":60,"color":"525252"},"vertexes":[{"x":-401.4,"y":-200,"cMask":[],"cGroup":[],"color":"ffffff"},{"x":401.4,"y":-200,"cMask":[],"cGroup":[],"color":"ffffff"},{"x":401.4,"y":200,"cMask":[],"cGroup":[],"color":"ffffff"},{"x":-401.4,"y":200,"cMask":[],"cGroup":[],"color":"ffffff"},{"x":0,"y":200,"cMask":[],"cGroup":[],"color":"ffffff"},{"x":0,"y":-200,"cMask":[],"cGroup":[],"color":"ffffff"},{"x":0,"y":-80,"cMask":["red","blue"],"cGroup":["redKO","blueKO"],"color":"ffffff"},{"x":0,"y":80,"cMask":["red","blue"],"cGroup":["redKO","blueKO"],"color":"ffffff"},{"x":-400,"y":60,"cMask":[],"cGroup":[],"color":"ffffff"},{"x":-400,"y":-60,"cMask":[],"cGroup":[],"color":"ffffff"},{"x":400,"y":-60,"cMask":[],"cGroup":[],"color":"ffffff"},{"x":400,"y":60,"cMask":[],"cGroup":[],"color":"ffffff"},{"x":0,"y":230,"cMask":[],"cGroup":[]},{"x":0,"y":-230,"cMask":[],"cGroup":[]},{"x":436.4,"y":-60,"cMask":[],"cGroup":[],"color":"5957ff"},{"x":436.4,"y":60,"cMask":[],"cGroup":[],"color":"5957ff"},{"x":-436.4,"y":-60,"cMask":[],"cGroup":[],"color":"ff5757"},{"x":-436.4,"y":60,"cMask":[],"cGroup":[],"color":"ff5757"},{"x":400,"y":-135,"cMask":["wall"],"cGroup":["wall"]},{"x":400,"y":135,"cMask":["wall"],"cGroup":["wall"],"curve":180},{"x":-400,"y":-135,"cMask":["wall"],"cGroup":["wall"],"curve":180,"_data":{"mirror":{}}},{"x":-400,"y":135,"cMask":["wall"],"cGroup":["wall"]},{"x":-400,"y":-201.4,"cMask":[],"cGroup":[],"color":"ffffff"},{"x":400,"y":-201.4,"cMask":[],"cGroup":[],"color":"ffffff"},{"x":400,"y":201.4,"cMask":[],"cGroup":[],"color":"ffffff"},{"x":-400,"y":201.4,"cMask":[],"cGroup":[],"color":"ffffff"},{"x":435,"y":-61.4,"cMask":[],"cGroup":[],"color":"5957ff"},{"x":435,"y":61.4,"cMask":[],"cGroup":[],"color":"5957ff"},{"x":-435,"y":-61.4,"cMask":[],"cGroup":[],"color":"ff5757"},{"x":-435,"y":61.4,"cMask":[],"cGroup":[],"color":"ff5757"},{"x":-400,"y":135,"cMask":["wall"],"cGroup":["wall"],"curve":180},{"x":400,"y":-135,"cMask":["wall"],"cGroup":["wall"],"curve":180},{"x":-39.70962850170082,"y":-47.002316878116766,"cMask":["wall"],"cGroup":["wall"],"_data":{"mirror":{}}},{"x":-39.439628568644224,"y":45.33391918015176,"cMask":["wall"],"cGroup":["wall"]},{"x":-38.599457340390344,"y":8.577657186753411,"cMask":["wall"],"cGroup":["wall"]},{"x":-12.167333969347064,"y":-39.86836860352869,"cMask":["wall"],"cGroup":["wall"]},{"x":-9.864305764766423,"y":45.33391918015176,"cMask":["wall"],"cGroup":["wall"]},{"x":-3.160793923255983,"y":-45.4438457749184,"cMask":["wall"],"cGroup":["wall"],"_data":{"mirror":{}}},{"x":0,"y":45.33391918015176,"cMask":["wall"],"cGroup":["wall"]},{"x":23.85882621501726,"y":-45.28500027146,"cMask":["wall"],"cGroup":["wall"],"_data":{"mirror":{}}},{"x":-1.715531437350682,"y":-23.15967440423421,"cMask":["wall"],"cGroup":["wall"]},{"x":23.15967440423421,"y":-22.730791544896537,"cMask":["wall"],"cGroup":["wall"]},{"x":31.57871768309533,"y":-47.002316878116766,"cMask":["wall"],"cGroup":["wall"],"_data":{"mirror":{}}},{"x":32.16621445032529,"y":45.33391918015176,"cMask":["wall"],"cGroup":["wall"]},{"x":55,"y":45.33391918015176,"cMask":["wall"],"cGroup":["wall"]},{"x":-37.56521420501247,"y":-47.002316878116766,"cMask":["wall"],"cGroup":["wall"],"_data":{"mirror":{}}},{"x":-37.29521427195587,"y":45.33391918015176,"cMask":["wall"],"cGroup":["wall"]},{"x":-37.56521420501247,"y":-47.002316878116766,"cMask":["wall"],"cGroup":["wall"],"_data":{"mirror":{}}},{"x":-37.29521427195587,"y":45.33391918015176,"cMask":["wall"],"cGroup":["wall"]},{"x":-35.13279364200405,"y":-47.002316878116766,"cMask":["wall"],"cGroup":["wall"],"_data":{"mirror":{}}},{"x":-34.86279370894746,"y":45.33391918015176,"cMask":["wall"],"cGroup":["wall"]},{"x":-40.10095151508689,"y":7.826910099405138,"cMask":["wall"],"cGroup":["wall"]},{"x":-13.668828144043612,"y":-40.61911569087696,"cMask":["wall"],"cGroup":["wall"],"_data":{"mirror":{}}},{"x":-36.8477141365777,"y":9.828902332333866,"cMask":["wall"],"cGroup":["wall"]},{"x":-10.415590765534422,"y":-38.61712345794823,"cMask":["wall"],"cGroup":["wall"]},{"x":-36.613888547160386,"y":8.180543428107411,"cMask":["wall"],"cGroup":["wall"]},{"x":-7.878736971536467,"y":45.33391918015176,"cMask":["wall"],"cGroup":["wall"]},{"x":-38.99657109903633,"y":10.960339738629349,"cMask":["wall"],"cGroup":["wall"]},{"x":-10.261419523412414,"y":45.33391918015176,"cMask":["wall"],"cGroup":["wall"]},{"x":-1.175225130026027,"y":-45.04673201627241,"cMask":["wall"],"cGroup":["wall"],"_data":{"mirror":{}}},{"x":1.9855687932299562,"y":45.33391918015176,"cMask":["wall"],"cGroup":["wall"]},{"x":0.016116145911946544,"y":-44.64961825762642,"cMask":["wall"],"cGroup":["wall"],"_data":{"mirror":{}}},{"x":3.1769100691679295,"y":45.33391918015176,"cMask":["wall"],"cGroup":["wall"]},{"x":-1.3184176787046924,"y":-21.174105611004254,"cMask":["wall"],"cGroup":["wall"]},{"x":23.5567881628802,"y":-20.74522275166658,"cMask":["wall"],"cGroup":["wall"]},{"x":-0.5241901614127096,"y":-18.79142305912831,"cMask":["wall"],"cGroup":["wall"]},{"x":24.351015680172182,"y":-18.362540199790637,"cMask":["wall"],"cGroup":["wall"]},{"x":-3.160793923255983,"y":-42.26693570575047,"cMask":["wall"],"cGroup":["wall"],"_data":{"mirror":{}}},{"x":23.85882621501726,"y":-42.10809020229207,"cMask":["wall"],"cGroup":["wall"],"_data":{"mirror":{}}},{"x":-3.160793923255983,"y":-39.48713939522853,"cMask":["wall"],"cGroup":["wall"]},{"x":23.85882621501726,"y":-39.32829389177013,"cMask":["wall"],"cGroup":["wall"],"_data":{"mirror":{}}},{"x":-2.946245715851926,"y":-44.207199958117776,"cMask":["wall"],"cGroup":["wall"],"_data":{"mirror":{}}},{"x":24.073374422421317,"y":-44.048354454659375,"cMask":["wall"],"cGroup":["wall"],"_data":{"mirror":{}}},{"x":34.302406014000624,"y":-47.002316878116766,"cMask":["wall"],"cGroup":["wall"],"_data":{"mirror":{}}},{"x":34.88990278123059,"y":45.33391918015176,"cMask":["wall"],"cGroup":["wall"]},{"x":36.68563330354275,"y":-47.002316878116766,"cMask":["wall"],"cGroup":["wall"],"_data":{"mirror":{}}},{"x":37.273130070772716,"y":45.33391918015176,"cMask":["wall"],"cGroup":["wall"]},{"x":32.506675491688455,"y":45.33391918015176,"cMask":["wall"],"cGroup":["wall"]},{"x":55,"y":45.33391918015176,"cMask":["wall"],"cGroup":["wall"]},{"x":32.84713653305161,"y":45.33391918015176,"cMask":["wall"],"cGroup":["wall"]},{"x":55,"y":43.4945141098152,"cMask":["wall"],"cGroup":["wall"]},{"x":2.222303693945231,"y":-45.017316182298636,"cMask":["wall"],"cGroup":["wall"],"_data":{"mirror":{}}},{"x":5.383097617201214,"y":45.33391918015176,"cMask":["wall"],"cGroup":["wall"]},{"x":4.428491241978515,"y":-43.914222408281994,"cMask":["wall"],"cGroup":["wall"],"_data":{"mirror":{}}},{"x":7.5892851652344975,"y":45.33391918015176,"cMask":["wall"],"cGroup":["wall"]},{"x":-37.56521420501247,"y":-47.002316878116766,"cMask":["wall"],"cGroup":["wall"],"_data":{"mirror":{}}},{"x":-37.29521427195587,"y":45.33391918015176,"cMask":["wall"],"cGroup":["wall"]},{"x":-36.45504304370199,"y":9.006540046091088,"cMask":["wall"],"cGroup":["wall"]},{"x":-35.42079990832411,"y":-47.002316878116766,"cMask":["wall"],"cGroup":["wall"],"_data":{"mirror":{}}},{"x":-35.15079997526752,"y":45.33391918015176,"cMask":["wall"],"cGroup":["wall"]},{"x":-35.42079990832411,"y":-47.002316878116766,"cMask":["wall"],"cGroup":["wall"],"_data":{"mirror":{}}},{"x":-35.15079997526752,"y":45.33391918015176,"cMask":["wall"],"cGroup":["wall"]},{"x":-32.447841442424945,"y":-47.002316878116766,"cMask":["wall"],"cGroup":["wall"],"_data":{"mirror":{}}},{"x":-32.718379412259104,"y":45.33391918015176,"cMask":["wall"],"cGroup":["wall"]},{"x":-37.95653721839854,"y":8.255792958742814,"cMask":["wall"],"cGroup":["wall"]},{"x":-34.70329983988935,"y":10.257785191671543,"cMask":["wall"],"cGroup":["wall"]},{"x":-34.46947425047203,"y":8.609426287445087,"cMask":["wall"],"cGroup":["wall"]},{"x":-36.85215680234798,"y":11.389222597967025,"cMask":["wall"],"cGroup":["wall"]},{"x":-35.56106555856469,"y":11.54443376968455,"cMask":["wall"],"cGroup":["wall"]},{"x":-9.12894218752141,"y":-36.90159202059755,"cMask":["wall"],"cGroup":["wall"]},{"x":-35.56106555856469,"y":11.54443376968455,"cMask":["wall"],"cGroup":["wall"]},{"x":-9.12894218752141,"y":-36.90159202059755,"cMask":["wall"],"cGroup":["wall"]},{"x":-40.88802132883167,"y":12.536548263458796,"cMask":["wall"],"cGroup":["wall"]},{"x":-12.152869753207753,"y":45.33391918015176,"cMask":["wall"],"cGroup":["wall"]},{"x":-44.75098551676566,"y":-47.002316878116766,"cMask":["wall"],"cGroup":["wall"],"_data":{"mirror":{}}},{"x":-44.48098558370906,"y":45.33391918015176,"cMask":["wall"],"cGroup":["wall"]},{"x":-43.64081435545518,"y":8.577657186753411,"cMask":["wall"],"cGroup":["wall"]},{"x":-17.208690984411902,"y":-39.86836860352869,"cMask":["wall"],"cGroup":["wall"]},{"x":-14.905662779831259,"y":45.33391918015176,"cMask":["wall"],"cGroup":["wall"]},{"x":-8.20215093832082,"y":-45.4438457749184,"cMask":["wall"],"cGroup":["wall"],"_data":{"mirror":{}}},{"x":-5.041357015064836,"y":45.33391918015176,"cMask":["wall"],"cGroup":["wall"]},{"x":18.817469199952424,"y":-45.28500027146,"cMask":["wall"],"cGroup":["wall"],"_data":{"mirror":{}}},{"x":-6.756888452415518,"y":-23.15967440423421,"cMask":["wall"],"cGroup":["wall"]},{"x":18.118317389169373,"y":-22.730791544896537,"cMask":["wall"],"cGroup":["wall"]},{"x":26.537360668030495,"y":-47.002316878116766,"cMask":["wall"],"cGroup":["wall"],"_data":{"mirror":{}}},{"x":27.124857435260456,"y":45.33391918015176,"cMask":["wall"],"cGroup":["wall"]},{"x":55,"y":45.33391918015176,"cMask":["wall"],"cGroup":["wall"]},{"x":-42.606571220077306,"y":-47.002316878116766,"cMask":["wall"],"cGroup":["wall"],"_data":{"mirror":{}}},{"x":-42.3365712870207,"y":45.33391918015176,"cMask":["wall"],"cGroup":["wall"]},{"x":-42.606571220077306,"y":-47.002316878116766,"cMask":["wall"],"cGroup":["wall"],"_data":{"mirror":{}}},{"x":-42.3365712870207,"y":45.33391918015176,"cMask":["wall"],"cGroup":["wall"]},{"x":-40.174150657068886,"y":-47.002316878116766,"cMask":["wall"],"cGroup":["wall"],"_data":{"mirror":{}}},{"x":-39.9041507240123,"y":45.33391918015176,"cMask":["wall"],"cGroup":["wall"]},{"x":-45.14230853015172,"y":7.826910099405138,"cMask":["wall"],"cGroup":["wall"]},{"x":-18.71018515910845,"y":-40.61911569087696,"cMask":["wall"],"cGroup":["wall"],"_data":{"mirror":{}}},{"x":-41.88907115164254,"y":9.828902332333866,"cMask":["wall"],"cGroup":["wall"]},{"x":-15.456947780599258,"y":-38.61712345794823,"cMask":["wall"],"cGroup":["wall"]},{"x":-41.65524556222522,"y":8.180543428107411,"cMask":["wall"],"cGroup":["wall"]},{"x":-12.920093986601303,"y":45.33391918015176,"cMask":["wall"],"cGroup":["wall"]},{"x":-44.03792811410116,"y":10.960339738629349,"cMask":["wall"],"cGroup":["wall"]},{"x":-15.30277653847725,"y":45.33391918015176,"cMask":["wall"],"cGroup":["wall"]},{"x":-6.216582145090863,"y":-45.04673201627241,"cMask":["wall"],"cGroup":["wall"],"_data":{"mirror":{}}},{"x":-3.05578822183488,"y":45.33391918015176,"cMask":["wall"],"cGroup":["wall"]},{"x":-5.025240869152889,"y":-44.64961825762642,"cMask":["wall"],"cGroup":["wall"],"_data":{"mirror":{}}},{"x":-1.8644469458969066,"y":45.33391918015176,"cMask":["wall"],"cGroup":["wall"]},{"x":-6.359774693769529,"y":-21.174105611004254,"cMask":["wall"],"cGroup":["wall"]},{"x":18.515431147815363,"y":-20.74522275166658,"cMask":["wall"],"cGroup":["wall"]},{"x":-5.565547176477546,"y":-18.79142305912831,"cMask":["wall"],"cGroup":["wall"]},{"x":19.309658665107346,"y":-18.362540199790637,"cMask":["wall"],"cGroup":["wall"]},{"x":-8.20215093832082,"y":-42.26693570575047,"cMask":["wall"],"cGroup":["wall"],"_data":{"mirror":{}}},{"x":18.817469199952424,"y":-42.10809020229207,"cMask":["wall"],"cGroup":["wall"],"_data":{"mirror":{}}},{"x":-8.20215093832082,"y":-39.48713939522853,"cMask":["wall"],"cGroup":["wall"]},{"x":18.817469199952424,"y":-39.32829389177013,"cMask":["wall"],"cGroup":["wall"]},{"x":-7.9876027309167625,"y":-44.207199958117776,"cMask":["wall"],"cGroup":["wall"],"_data":{"mirror":{}}},{"x":19.03201740735648,"y":-44.048354454659375,"cMask":["wall"],"cGroup":["wall"],"_data":{"mirror":{}}},{"x":29.261048998935788,"y":-47.002316878116766,"cMask":["wall"],"cGroup":["wall"],"_data":{"mirror":{}}},{"x":29.848545766165753,"y":45.33391918015176,"cMask":["wall"],"cGroup":["wall"]},{"x":31.644276288477915,"y":-47.002316878116766,"cMask":["wall"],"cGroup":["wall"],"_data":{"mirror":{}}},{"x":33.854194221406914,"y":43.4945141098152,"cMask":["wall"],"cGroup":["wall"]},{"x":27.46531847662362,"y":45.33391918015176,"cMask":["wall"],"cGroup":["wall"]},{"x":55,"y":45.33391918015176,"cMask":["wall"],"cGroup":["wall"]},{"x":27.805779517986775,"y":45.33391918015176,"cMask":["wall"],"cGroup":["wall"]},{"x":55,"y":45.33391918015176,"cMask":["wall"],"cGroup":["wall"]},{"x":-2.819053321119605,"y":-45.017316182298636,"cMask":["wall"],"cGroup":["wall"],"_data":{"mirror":{}}},{"x":0.3417406021363778,"y":45.33391918015176,"cMask":["wall"],"cGroup":["wall"]},{"x":-0.6128657730863214,"y":-43.914222408281994,"cMask":["wall"],"cGroup":["wall"],"_data":{"mirror":{}}},{"x":2.5479281501696613,"y":45.33391918015176,"cMask":["wall"],"cGroup":["wall"]},{"x":-42.606571220077306,"y":-47.002316878116766,"cMask":["wall"],"cGroup":["wall"],"_data":{"mirror":{}}},{"x":-42.3365712870207,"y":45.33391918015176,"cMask":["wall"],"cGroup":["wall"]},{"x":-41.496400058766824,"y":9.006540046091088,"cMask":["wall"],"cGroup":["wall"]},{"x":-40.46215692338895,"y":-47.002316878116766,"cMask":["wall"],"cGroup":["wall"],"_data":{"mirror":{}}},{"x":-40.19215699033235,"y":45.33391918015176,"cMask":["wall"],"cGroup":["wall"]},{"x":-40.46215692338895,"y":-47.002316878116766,"cMask":["wall"],"cGroup":["wall"],"_data":{"mirror":{}}},{"x":-40.19215699033235,"y":45.33391918015176,"cMask":["wall"],"cGroup":["wall"]},{"x":-38.02973636038053,"y":-47.002316878116766,"cMask":["wall"],"cGroup":["wall"],"_data":{"mirror":{}}},{"x":-37.75973642732394,"y":45.33391918015176,"cMask":["wall"],"cGroup":["wall"]},{"x":-42.99789423346337,"y":8.255792958742814,"cMask":["wall"],"cGroup":["wall"]},{"x":-39.74465685495419,"y":10.257785191671543,"cMask":["wall"],"cGroup":["wall"]},{"x":-39.510831265536865,"y":8.609426287445087,"cMask":["wall"],"cGroup":["wall"]},{"x":-41.89351381741281,"y":11.389222597967025,"cMask":["wall"],"cGroup":["wall"]},{"x":-40.602422573629525,"y":11.54443376968455,"cMask":["wall"],"cGroup":["wall"]},{"x":-14.170299202586246,"y":-36.90159202059755,"cMask":["wall"],"cGroup":["wall"]},{"x":-40.602422573629525,"y":11.54443376968455,"cMask":["wall"],"cGroup":["wall"]},{"x":-14.170299202586246,"y":-36.90159202059755,"cMask":["wall"],"cGroup":["wall"]},{"x":-45.9293783438965,"y":12.536548263458796,"cMask":["wall"],"cGroup":["wall"]},{"x":-17.19422676827259,"y":45.33391918015176,"cMask":["wall"],"cGroup":["wall"]},{"x":55,"y":42,"cMask":["wall"],"cGroup":["wall"]},{"x":35.59589441669825,"y":42,"cMask":["wall"],"cGroup":["wall"]}],"segments":[{"v0":5,"v1":6,"color":"ffffff","bCoef":0,"cMask":[],"cGroup":[]},{"v0":4,"v1":7,"color":"ffffff","bCoef":0,"cMask":[],"cGroup":[]},{"v0":6,"v1":13,"vis":false,"bCoef":0.1,"cMask":["red","blue"],"cGroup":["redKO","blueKO"]},{"v0":7,"v1":12,"vis":false,"bCoef":0.1,"cMask":["red","blue"],"cGroup":["redKO","blueKO"]},{"v0":6,"v1":7,"curve":180,"color":"ffffff","bCoef":0.1,"cMask":["red","blue"],"cGroup":["redKO"],"curveF":6.123233995736766e-17},{"v0":7,"v1":6,"curve":180,"color":"ffffff","bCoef":0.1,"cMask":["red","blue"],"cGroup":["blueKO"],"curveF":6.123233995736766e-17},{"v0":10,"v1":14,"color":"5957ff","bCoef":0.1,"cMask":["ball"],"bias":-10},{"v0":26,"v1":27,"color":"5957ff","bCoef":0.1,"cMask":["ball"],"bias":-10},{"v0":15,"v1":11,"color":"5957ff","bCoef":0.1,"cMask":["ball"],"bias":-10},{"v0":8,"v1":17,"color":"ff5757","bCoef":0.1,"cMask":["ball"],"bias":-10,"y":60},{"v0":29,"v1":28,"color":"ff5757","bCoef":0.1,"cMask":["ball"],"bias":-10},{"v0":16,"v1":9,"color":"ff5757","bCoef":0.1,"cMask":["ball"],"bias":-10,"y":-60},{"v0":9,"v1":8,"color":"C5C5C5","bCoef":0,"cMask":[]},{"v0":10,"v1":11,"color":"C5C5C5","bCoef":0,"cMask":[]},{"v0":0,"v1":1,"color":"ffffff","cMask":["ball"],"bias":-10},{"v0":23,"v1":10,"color":"ffffff","cMask":["ball"],"bias":-10},{"v0":11,"v1":24,"color":"ffffff","cMask":["ball"],"bias":-10},{"v0":2,"v1":3,"color":"ffffff","cMask":["ball"],"bias":-10},{"v0":25,"v1":8,"color":"ffffff","cMask":["ball"],"bias":-10},{"v0":9,"v1":22,"color":"ffffff","cMask":["ball"],"bias":-10},{"v0":20,"v1":30,"curve":180,"color":"626262","cMask":["wall"],"cGroup":["wall"]},{"v0":19,"v1":31,"curve":180,"color":"626262","cMask":["wall"],"cGroup":["wall"]},{"v0":32,"v1":33,"color":"ffffff","cMask":["wall"],"cGroup":["wall"]},{"v0":34,"v1":35,"color":"ffffff","cMask":["wall"],"cGroup":["wall"]},{"v0":34,"v1":36,"color":"ffffff","cMask":["wall"],"cGroup":["wall"]},{"v0":37,"v1":38,"color":"ffffff","cMask":["wall"],"cGroup":["wall"]},{"v0":40,"v1":41,"color":"ffffff","cMask":["wall"],"cGroup":["wall"]},{"v0":42,"v1":43,"color":"ffffff","cMask":["wall"],"cGroup":["wall"]},{"v0":43,"v1":44,"color":"ffffff","cMask":["wall"],"cGroup":["wall"],"y":45.33391918015176},{"v0":45,"v1":46,"color":"ffffff","cMask":["wall"],"cGroup":["wall"]},{"v0":47,"v1":48,"color":"ffffff","cMask":["wall"],"cGroup":["wall"]},{"v0":49,"v1":50,"color":"ffffff","cMask":["wall"],"cGroup":["wall"]},{"v0":51,"v1":52,"color":"ffffff","cMask":["wall"],"cGroup":["wall"]},{"v0":53,"v1":54,"color":"ffffff","cMask":["wall"],"cGroup":["wall"]},{"v0":55,"v1":56,"color":"ffffff","cMask":["wall"],"cGroup":["wall"]},{"v0":57,"v1":58,"color":"ffffff","cMask":["wall"],"cGroup":["wall"]},{"v0":59,"v1":60,"color":"ffffff","cMask":["wall"],"cGroup":["wall"]},{"v0":61,"v1":62,"color":"ffffff","cMask":["wall"],"cGroup":["wall"]},{"v0":63,"v1":64,"color":"ffffff","cMask":["wall"],"cGroup":["wall"]},{"v0":65,"v1":66,"color":"ffffff","cMask":["wall"],"cGroup":["wall"]},{"v0":67,"v1":68,"color":"ffffff","cMask":["wall"],"cGroup":["wall"],"_data":{"mirror":{},"arc":{"a":[-3.160793923255983,-42.26693570575047],"b":[23.85882621501726,-42.10809020229207],"radius":null,"center":[null,null],"from":null,"to":null}}},{"v0":69,"v1":70,"color":"ffffff","cMask":["wall"],"cGroup":["wall"]},{"v0":71,"v1":72,"color":"ffffff","cMask":["wall"],"cGroup":["wall"],"_data":{"mirror":{},"arc":{"a":[-2.946245715851926,-44.207199958117776],"b":[24.073374422421317,-44.048354454659375],"radius":null,"center":[null,null],"from":null,"to":null}}},{"v0":73,"v1":74,"color":"ffffff","cMask":["wall"],"cGroup":["wall"]},{"v0":75,"v1":76,"color":"ffffff","cMask":["wall"],"cGroup":["wall"]},{"v0":77,"v1":78,"color":"ffffff","cMask":["wall"],"cGroup":["wall"],"y":45.33391918015176},{"v0":79,"v1":80,"color":"ffffff","cMask":["wall"],"cGroup":["wall"],"y":45.33391918015176},{"v0":81,"v1":82,"color":"ffffff","cMask":["wall"],"cGroup":["wall"]},{"v0":83,"v1":84,"color":"ffffff","cMask":["wall"],"cGroup":["wall"]},{"v0":85,"v1":86,"color":"ffffff","cMask":["wall"],"cGroup":["wall"]},{"v0":88,"v1":89,"color":"ffffff","cMask":["wall"],"cGroup":["wall"]},{"v0":90,"v1":91,"color":"ffffff","cMask":["wall"],"cGroup":["wall"]},{"v0":92,"v1":93,"color":"ffffff","cMask":["wall"],"cGroup":["wall"]},{"v0":98,"v1":99,"color":"ffffff","cMask":["wall"],"cGroup":["wall"]},{"v0":100,"v1":101,"color":"ffffff","cMask":["wall"],"cGroup":["wall"]},{"v0":102,"v1":103,"color":"ffffff","cMask":["wall"],"cGroup":["wall"]},{"v0":104,"v1":105,"color":"ffffff","cMask":["wall"],"cGroup":["wall"]},{"v0":106,"v1":107,"color":"ffffff","cMask":["wall"],"cGroup":["wall"]},{"v0":106,"v1":108,"color":"ffffff","cMask":["wall"],"cGroup":["wall"]},{"v0":109,"v1":110,"color":"ffffff","cMask":["wall"],"cGroup":["wall"]},{"v0":112,"v1":113,"color":"ffffff","cMask":["wall"],"cGroup":["wall"]},{"v0":114,"v1":115,"color":"ffffff","cMask":["wall"],"cGroup":["wall"]},{"v0":115,"v1":116,"color":"ffffff","cMask":["wall"],"cGroup":["wall"],"y":45.33391918015176},{"v0":117,"v1":118,"color":"ffffff","cMask":["wall"],"cGroup":["wall"]},{"v0":119,"v1":120,"color":"ffffff","cMask":["wall"],"cGroup":["wall"]},{"v0":121,"v1":122,"color":"ffffff","cMask":["wall"],"cGroup":["wall"]},{"v0":125,"v1":126,"color":"ffffff","cMask":["wall"],"cGroup":["wall"]},{"v0":127,"v1":128,"color":"ffffff","cMask":["wall"],"cGroup":["wall"]},{"v0":129,"v1":130,"color":"ffffff","cMask":["wall"],"cGroup":["wall"]},{"v0":131,"v1":132,"color":"ffffff","cMask":["wall"],"cGroup":["wall"]},{"v0":133,"v1":134,"color":"ffffff","cMask":["wall"],"cGroup":["wall"]},{"v0":135,"v1":136,"color":"ffffff","cMask":["wall"],"cGroup":["wall"]},{"v0":137,"v1":138,"color":"ffffff","cMask":["wall"],"cGroup":["wall"]},{"v0":139,"v1":140,"color":"ffffff","cMask":["wall"],"cGroup":["wall"],"_data":{"mirror":{},"arc":{"a":[-8.20215093832082,-42.26693570575047],"b":[18.817469199952424,-42.10809020229207],"radius":null,"center":[null,null],"from":null,"to":null}}},{"v0":141,"v1":142,"color":"ffffff","cMask":["wall"],"cGroup":["wall"]},{"v0":143,"v1":144,"color":"ffffff","cMask":["wall"],"cGroup":["wall"],"_data":{"mirror":{},"arc":{"a":[-7.9876027309167625,-44.207199958117776],"b":[19.03201740735648,-44.048354454659375],"radius":null,"center":[null,null],"from":null,"to":null}}},{"v0":145,"v1":146,"color":"ffffff","cMask":["wall"],"cGroup":["wall"]},{"v0":147,"v1":148,"color":"ffffff","cMask":["wall"],"cGroup":["wall"]},{"v0":149,"v1":150,"color":"ffffff","cMask":["wall"],"cGroup":["wall"],"y":45.33391918015176},{"v0":151,"v1":152,"color":"ffffff","cMask":["wall"],"cGroup":["wall"],"y":45.33391918015176},{"v0":153,"v1":154,"color":"ffffff","cMask":["wall"],"cGroup":["wall"]},{"v0":155,"v1":156,"color":"ffffff","cMask":["wall"],"cGroup":["wall"]},{"v0":157,"v1":158,"color":"ffffff","cMask":["wall"],"cGroup":["wall"]},{"v0":160,"v1":161,"color":"ffffff","cMask":["wall"],"cGroup":["wall"]},{"v0":162,"v1":163,"color":"ffffff","cMask":["wall"],"cGroup":["wall"]},{"v0":164,"v1":165,"color":"ffffff","cMask":["wall"],"cGroup":["wall"]},{"v0":170,"v1":171,"color":"ffffff","cMask":["wall"],"cGroup":["wall"]},{"v0":172,"v1":173,"color":"ffffff","cMask":["wall"],"cGroup":["wall"]},{"v0":80,"v1":148,"color":"ffffff","cMask":["wall"],"cGroup":["wall"]},{"v0":176,"v1":177,"color":"ffffff","cMask":["wall"],"cGroup":["wall"],"y":42}],"planes":[{"normal":[0,1],"dist":-230,"bCoef":0,"_data":{"extremes":{"normal":[0,1],"dist":-230,"canvas_rect":[-1651.0297475714392,-536.7697609817459,1652.880677781721,536.7697609817459],"a":[-1651.0297475714392,-230],"b":[1652.880677781721,-230]}}},{"normal":[0,-1],"dist":-230,"bCoef":0,"_data":{"extremes":{"normal":[0,-1],"dist":-230,"canvas_rect":[-1651.0297475714392,-536.7697609817459,1652.880677781721,536.7697609817459],"a":[-1651.0297475714392,230],"b":[1652.880677781721,230]}}},{"normal":[1,0],"dist":-480,"bCoef":0,"_data":{"extremes":{"normal":[1,0],"dist":-480,"canvas_rect":[-1651.0297475714392,-536.7697609817459,1652.880677781721,536.7697609817459],"a":[-480,-536.7697609817459],"b":[-480,536.7697609817459]}}},{"normal":[-1,0],"dist":-480,"bCoef":0,"_data":{"extremes":{"normal":[-1,0],"dist":-480,"canvas_rect":[-1651.0297475714392,-536.7697609817459,1652.880677781721,536.7697609817459],"a":[480,-536.7697609817459],"b":[480,536.7697609817459]}}}],"goals":[{"p0":[-407.9,60],"p1":[-407.9,-60],"team":"red"},{"p0":[407.9,60],"p1":[407.9,-60],"team":"blue"}],"discs":[{"radius":5.4,"invMass":0,"pos":[-400,-60],"color":"ffffff"},{"radius":5.4,"invMass":0,"pos":[-400,60],"color":"ffffff"},{"radius":5.4,"invMass":0,"pos":[400,-60],"color":"ffffff"},{"radius":5.4,"invMass":0,"pos":[400,60],"color":"ffffff"},{"radius":6,"invMass":0,"pos":[10000,10000],"color":"FF0000","bCoef":0,"cMask":[],"cGroup":[],"vis":false},{"radius":6,"invMass":0,"pos":[10000,10000],"color":"FF0000","bCoef":0,"cMask":[],"cGroup":[],"vis":false},{"radius":6,"invMass":0,"pos":[10000,10000],"color":"FF0000","bCoef":0,"cMask":[],"cGroup":[],"vis":false},{"radius":6,"invMass":0,"pos":[10000,10000],"color":"FF0000","bCoef":0,"cMask":[],"cGroup":[],"vis":false},{"radius":6,"invMass":0,"pos":[10000,10000],"color":"FF0000","bCoef":0,"cMask":[],"cGroup":[],"vis":false},{"radius":6,"invMass":0,"pos":[10000,10000],"color":"FF0000","bCoef":0,"cMask":[],"cGroup":[],"vis":false},{"radius":6,"invMass":0,"pos":[10000,10000],"color":"FF0000","bCoef":0,"cMask":[],"cGroup":[],"vis":false},{"radius":6,"invMass":0,"pos":[10000,10000],"color":"FF0000","bCoef":0,"cMask":[],"cGroup":[],"vis":false},{"radius":6,"invMass":0,"pos":[10000,10000],"color":"FF0000","bCoef":0,"cMask":[],"cGroup":[],"vis":false},{"radius":6,"invMass":0,"pos":[10000,10000],"color":"FF0000","bCoef":0,"cMask":[],"cGroup":[],"vis":false},{"radius":6,"invMass":0,"pos":[10000,10000],"color":"FF0000","bCoef":0,"cMask":[],"cGroup":[],"vis":false},{"radius":6,"invMass":0,"pos":[10000,10000],"color":"FF0000","bCoef":0,"cMask":[],"cGroup":[],"vis":false},{"radius":6,"invMass":0,"pos":[10000,10000],"color":"FF0000","bCoef":0,"cMask":[],"cGroup":[],"vis":false},{"radius":6,"invMass":0,"pos":[10000,10000],"color":"FF0000","bCoef":0,"cMask":[],"cGroup":[],"vis":false},{"radius":6,"invMass":0,"pos":[10000,10000],"color":"FF0000","bCoef":0,"cMask":[],"cGroup":[],"vis":false},{"radius":6,"invMass":0,"pos":[10000,10000],"color":"FF0000","bCoef":0,"cMask":[],"cGroup":[],"vis":false},{"radius":6,"invMass":0,"pos":[10000,10000],"color":"FF0000","bCoef":0,"cMask":[],"cGroup":[],"vis":false},{"radius":6,"invMass":0,"pos":[10000,10000],"color":"FF0000","bCoef":0,"cMask":[],"cGroup":[],"vis":false},{"radius":6,"invMass":0,"pos":[10000,10000],"color":"FF0000","bCoef":0,"cMask":[],"cGroup":[],"vis":false},{"radius":6,"invMass":0,"pos":[10000,10000],"color":"FF0000","bCoef":0,"cMask":[],"cGroup":[],"vis":false},{"radius":6,"invMass":0,"pos":[10000,10000],"color":"FF0000","bCoef":0,"cMask":[],"cGroup":[],"vis":false},{"radius":6,"invMass":0,"pos":[10000,10000],"color":"FF0000","bCoef":0,"cMask":[],"cGroup":[],"vis":false},{"radius":6,"invMass":0,"pos":[10000,10000],"color":"FF0000","bCoef":0,"cMask":[],"cGroup":[],"vis":false},{"radius":6,"invMass":0,"pos":[10000,10000],"color":"FF0000","bCoef":0,"cMask":[],"cGroup":[],"vis":false},{"radius":6,"invMass":0,"pos":[10000,10000],"color":"FF0000","bCoef":0,"cMask":[],"cGroup":[],"vis":false},{"radius":6,"invMass":0,"pos":[10000,10000],"color":"FF0000","bCoef":0,"cMask":[],"cGroup":[],"vis":false},{"radius":6,"invMass":0,"pos":[10000,10000],"color":"FF0000","bCoef":0,"cMask":[],"cGroup":[],"vis":false},{"radius":6,"invMass":0,"pos":[10000,10000],"color":"FF0000","bCoef":0,"cMask":[],"cGroup":[],"vis":false},{"radius":6,"invMass":0,"pos":[10000,10000],"color":"FF0000","bCoef":0,"cMask":[],"cGroup":[],"vis":false},{"radius":6,"invMass":0,"pos":[10000,10000],"color":"FF0000","bCoef":0,"cMask":[],"cGroup":[],"vis":false},{"radius":6,"invMass":0,"pos":[10000,10000],"color":"FF0000","bCoef":0,"cMask":[],"cGroup":[],"vis":false},{"radius":6,"invMass":0,"pos":[10000,10000],"color":"FF0000","bCoef":0,"cMask":[],"cGroup":[],"vis":false},{"radius":6,"invMass":0,"pos":[10000,10000],"color":"FF0000","bCoef":0,"cMask":[],"cGroup":[],"vis":false},{"radius":6,"invMass":0,"pos":[10000,10000],"color":"FF0000","bCoef":0,"cMask":[],"cGroup":[],"vis":false},{"radius":6,"invMass":0,"pos":[10000,10000],"color":"FF0000","bCoef":0,"cMask":[],"cGroup":[],"vis":false},{"radius":6,"invMass":0,"pos":[10000,10000],"color":"FF0000","bCoef":0,"cMask":[],"cGroup":[],"vis":false},{"radius":6,"invMass":0,"pos":[10000,10000],"color":"FF0000","bCoef":0,"cMask":[],"cGroup":[],"vis":false},{"radius":6,"invMass":0,"pos":[10000,10000],"color":"FF0000","bCoef":0,"cMask":[],"cGroup":[],"vis":false},{"radius":6,"invMass":0,"pos":[10000,10000],"color":"FF0000","bCoef":0,"cMask":[],"cGroup":[],"vis":false},{"radius":6,"invMass":0,"pos":[10000,10000],"color":"FF0000","bCoef":0,"cMask":[],"cGroup":[],"vis":false},{"radius":6,"invMass":0,"pos":[10000,10000],"color":"FF0000","bCoef":0,"cMask":[],"cGroup":[],"vis":false},{"radius":6,"invMass":0,"pos":[10000,10000],"color":"FF0000","bCoef":0,"cMask":[],"cGroup":[],"vis":false},{"radius":6,"invMass":0,"pos":[10000,10000],"color":"FF0000","bCoef":0,"cMask":[],"cGroup":[],"vis":false},{"radius":6,"invMass":0,"pos":[10000,10000],"color":"FF0000","bCoef":0,"cMask":[],"cGroup":[],"vis":false},{"radius":6,"invMass":0,"pos":[10000,10000],"color":"FF0000","bCoef":0,"cMask":[],"cGroup":[],"vis":false},{"radius":6,"invMass":0,"pos":[10000,10000],"color":"FF0000","bCoef":0,"cMask":[],"cGroup":[],"vis":false},{"radius":6,"invMass":0,"pos":[10000,10000],"color":"FF0000","bCoef":0,"cMask":[],"cGroup":[],"vis":false},{"radius":6,"invMass":0,"pos":[10000,10000],"color":"FF0000","bCoef":0,"cMask":[],"cGroup":[],"vis":false},{"radius":6,"invMass":0,"pos":[10000,10000],"color":"FF0000","bCoef":0,"cMask":[],"cGroup":[],"vis":false},{"radius":6,"invMass":0,"pos":[10000,10000],"color":"FF0000","bCoef":0,"cMask":[],"cGroup":[],"vis":false}],"playerPhysics":{"bCoef":0,"acceleration":0.11,"kickingAcceleration":0.083,"kickStrength":4.2},"ballPhysics":{"radius":5.8,"invMass":1.55,"pos":[0,0],"color":"FFF26D","bCoef":0.412,"cGroup":["ball","kick","score"]},"traits":{},"joints":[],"redSpawnPoints":[],"blueSpawnPoints":[],"canBeStored":false}';
const STADIUM_3v3 = '{"name": "lỏ | 3v3","width": 800,"height": 350,"spawnDistance": 350,"bg": {"type": "hockey","width": 700,"height": 320,"kickOffRadius": 100,"cornerRadius": 0,"color": "6D925C"},"vertexes": [{"x": 701,"y": 320,"trait": "ballArea"},{"x": 698,"y": -317,"trait": "ballArea"},{"x": 0,"y": 100,"bCoef": 0.15,"trait": "kickOffBarrier","color": "F8F8F8","vis": true,"curve": 180},{"x": 0,"y": -100,"bCoef": 0.15,"trait": "kickOffBarrier","color": "F8F8F8","vis": true,"curve": 180},{"x": 0,"y": -349,"trait": "kickOffBarrier"},{"x": -701,"y": -80,"cMask": ["ball"],"cGroup": ["red","blue"],"trait": "goalNet","curve": 0,"color": "FFFFFF","pos": [-700,-80],"p0": [-707.25,0]},{"x": -740,"y": -80,"cMask": ["ball"],"cGroup": ["red","blue"],"trait": "goalNet","curve": 0,"color": "FFFFFF","pos": [-700,-80],"p0": [-707.25,0]},{"x": -740,"y": 80,"cMask": ["ball"],"cGroup": ["red","blue"],"trait": "goalNet","curve": 0,"color": "FFFFFF","pos": [-700,80],"p0": [-707.25,0]},{"x": -701,"y": 80,"cMask": ["ball"],"cGroup": ["red","blue"],"trait": "goalNet","curve": 0,"color": "FFFFFF","pos": [-700,80],"p0": [-707.25,0]},{"x": 699,"y": -80,"cMask": ["ball"],"cGroup": ["red","blue"],"trait": "goalNet","curve": 0,"color": "FFFFFF","pos": [700,-80]},{"x": 740,"y": -80,"cMask": ["ball"],"cGroup": ["red","blue"],"trait": "goalNet","curve": 0,"color": "FFFFFF","pos": [700,-80]},{"x": 740,"y": 80,"cMask": ["ball"],"cGroup": ["red","blue"],"trait": "goalNet","curve": 0,"color": "FFFFFF","pos": [700,80]},{"x": 699,"y": 80,"cMask": ["ball"],"cGroup": ["red","blue"],"trait": "goalNet","curve": 0,"color": "FFFFFF","pos": [700,80]},{"x": -700,"y": 80,"bCoef": 1.15,"cMask": ["ball"],"trait": "ballArea","color": "F8F8F8","pos": [-700,80],"p0": [-707.25,0]},{"x": -700,"y": 321,"bCoef": 1.15,"cMask": ["ball"],"trait": "ballArea","color": "F8F8F8"},{"x": -700,"y": -80,"bCoef": 1.15,"cMask": ["ball"],"trait": "ballArea","color": "F8F8F8","pos": [-700,-80],"p0": [-707.25,0]},{"x": -700,"y": -319,"bCoef": 1.15,"cMask": ["ball"],"trait": "ballArea","color": "F8F8F8"},{"x": -700,"y": 320,"bCoef": 1,"cMask": ["ball"],"trait": "ballArea","color": "FFFFFF"},{"x": 701,"y": 320,"bCoef": 1,"cMask": ["ball"],"trait": "ballArea","color": "FFFFFF"},{"x": 700,"y": 80,"bCoef": 1.15,"cMask": ["ball"],"trait": "ballArea","pos": [700,80]},{"x": 700,"y": 320,"bCoef": 1.15,"cMask": ["ball"],"trait": "ballArea"},{"x": 700,"y": -317,"bCoef": 1.15,"cMask": ["ball"],"trait": "ballArea","color": "F8F8F8"},{"x": 700,"y": -80,"bCoef": 1.15,"cMask": ["ball"],"trait": "ballArea","color": "F8F8F8","pos": [700,-80]},{"x": 698,"y": -317,"bCoef": 0,"cMask": ["ball"],"trait": "ballArea"},{"x": 698,"y": -317,"bCoef": 0,"cMask": ["ball"],"trait": "ballArea"},{"x": -701,"y": -320,"bCoef": 1,"cMask": ["ball"],"trait": "ballArea","curve": 0,"color": "FFFFFF"},{"x": 698,"y": -320,"bCoef": 1,"cMask": ["ball"],"trait": "ballArea","curve": 0,"color": "FFFFFF"},{"x": 0,"y": -319,"bCoef": 0.1,"cMask": ["red","blue"],"cGroup": ["redKO","blueKO"],"trait": "kickOffBarrier","color": "FFFFFF"},{"x": 0,"y": -100,"bCoef": 0.1,"cMask": ["red","blue"],"cGroup": ["redKO","blueKO"],"trait": "kickOffBarrier","color": "FFFFFF"},{"x": 0,"y": 100,"bCoef": 0.1,"cMask": ["red","blue"],"cGroup": ["redKO","blueKO"],"trait": "kickOffBarrier","color": "FFFFFF"},{"x": 0,"y": 320,"bCoef": 0.1,"cMask": ["red","blue"],"cGroup": ["redKO","blueKO"],"trait": "kickOffBarrier","color": "FFFFFF"},{"x": 0,"y": -100,"bCoef": 0.1,"cMask": ["red","blue"],"trait": "kickOffBarrier","vis": true,"color": "F8F8F8"},{"x": 0,"y": -100,"trait": "kickOffBarrier","color": "F8F8F8","vis": true,"curve": -180},{"x": 0,"y": -100,"trait": "kickOffBarrier","color": "F8F8F8","vis": true,"curve": 0},{"x": -706.3571428571429,"y": 77.95238095238096,"bCoef": 1,"cMask": ["ball"],"trait": "ballArea","curve": 0,"vis": false,"pos": [-700,80],"p0": [-707.25,0]},{"x": -706.3571428571429,"y": 318.95238095238096,"bCoef": 1,"cMask": ["ball"],"trait": "ballArea","curve": 0,"vis": false},{"x": -706.3571428571429,"y": -320,"bCoef": 1,"cMask": ["ball"],"trait": "ballArea","vis": false,"curve": 0},{"x": -706.3571428571429,"y": -81,"bCoef": 1,"cMask": ["ball"],"trait": "ballArea","vis": false,"curve": 0,"pos": [-700,-80],"p0": [-707.25,0]},{"x": 708.2619047619047,"y": -319.0476190476191,"bCoef": 1,"cMask": ["ball"],"trait": "ballArea","vis": false,"curve": 0},{"x": 708.2619047619047,"y": -82.0476190476191,"bCoef": 1,"cMask": ["ball"],"trait": "ballArea","vis": false,"curve": 0,"pos": [700,-80]},{"x": 707.2619047619047,"y": 81.04761904761904,"bCoef": 1,"cMask": ["ball"],"trait": "ballArea","curve": 0,"vis": false,"pos": [700,80]},{"x": 707.2619047619047,"y": 321.04761904761904,"bCoef": 1,"cMask": ["ball"],"trait": "ballArea","curve": 0,"vis": false},{"x": 0,"y": -100,"bCoef": 0.1,"trait": "line"},{"x": -700,"y": -80,"bCoef": 0.1,"trait": "line","p0": [-707.25,0],"color": "ff9494"},{"x": -700,"y": 80,"bCoef": 0.1,"trait": "line","p0": [-707.25,0],"color": "ff9494"},{"x": 700,"y": -80,"bCoef": 0.1,"trait": "line","color": "a3baff"},{"x": 700,"y": 80,"bCoef": 0.1,"trait": "line","color": "a3baff"},{"x": -700,"y": 270,"bCoef": 0.1,"trait": "line","color": "FFFFFF","curve": 0},{"x": -470,"y": 270,"bCoef": 0.1,"trait": "line","color": "FFFFFF","curve": 0},{"x": -700,"y": 307,"bCoef": 0.1,"trait": "line","curve": -90,"color": "FFFFFF"},{"x": -686,"y": 320,"bCoef": 0.1,"trait": "line","curve": -90,"color": "FFFFFF"},{"x": -700,"y": -270,"bCoef": 0.1,"trait": "line","color": "FFFFFF","curve": 0},{"x": -470,"y": -270,"bCoef": 0.1,"trait": "line","color": "FFFFFF","curve": 0},{"x": -700,"y": -305,"bCoef": 0.1,"trait": "line","curve": 90,"color": "FFFFFF"},{"x": -687,"y": -320,"bCoef": 0.1,"trait": "line","curve": 90,"color": "FFFFFF"},{"x": 700,"y": -303,"bCoef": 0.1,"trait": "line","curve": -90,"color": "FFFFFF"},{"x": 684,"y": -320,"bCoef": 0.1,"trait": "line","curve": -90,"color": "FFFFFF"},{"x": 700,"y": 306,"bCoef": 0.1,"trait": "line","curve": 90,"color": "FFFFFF"},{"x": 687,"y": 320,"bCoef": 0.1,"trait": "line","curve": 90,"color": "FFFFFF"},{"x": 700,"y": 270,"bCoef": 0.1,"trait": "line","color": "FFFFFF","curve": 0},{"x": 470,"y": 270,"bCoef": 0.1,"trait": "line","color": "FFFFFF","curve": 0},{"x": 700,"y": -270,"bCoef": 0.1,"trait": "line","color": "FFFFFF","curve": 0},{"x": 470,"y": -270,"bCoef": 0.1,"trait": "line","color": "FFFFFF","curve": 0},{"x": 470,"y": 270,"bCoef": 0.1,"trait": "line","color": "FFFFFF","curve": 0},{"x": 470,"y": -270,"bCoef": 0.1,"trait": "line","color": "FFFFFF","curve": 0},{"x": -514,"y": 0.5555555555555562,"bCoef": 0.1,"trait": "line","curve": 180,"color": "FFFFFF"},{"x": -514,"y": -1.4444444444444438,"bCoef": 0.1,"trait": "line","curve": 180,"color": "FFFFFF"},{"x": -514,"y": 2.5555555555555562,"bCoef": 0.1,"trait": "line","curve": 180,"color": "FFFFFF"},{"x": -514,"y": -3.4444444444444438,"bCoef": 0.1,"trait": "line","curve": 180,"color": "FFFFFF"},{"x": -514,"y": -2.4444444444444438,"bCoef": 0.1,"trait": "line","curve": 180,"color": "FFFFFF"},{"x": -514,"y": 1.5555555555555562,"bCoef": 0.1,"trait": "line","curve": 180,"color": "FFFFFF"},{"x": -514,"y": -3.9444444444444438,"bCoef": 0.1,"trait": "line","curve": 180,"color": "FFFFFF"},{"x": -514,"y": 3.0555555555555562,"bCoef": 0.1,"trait": "line","curve": 180,"color": "FFFFFF"},{"x": 514,"y": -0.11111111111110983,"bCoef": 0.1,"trait": "line","curve": 180,"color": "FFFFFF"},{"x": 514,"y": -2.11111111111111,"bCoef": 0.1,"trait": "line","curve": 180,"color": "FFFFFF"},{"x": 514,"y": 1.8888888888888902,"bCoef": 0.1,"trait": "line","curve": 180,"color": "FFFFFF"},{"x": 514,"y": -4.11111111111111,"bCoef": 0.1,"trait": "line","curve": 180,"color": "FFFFFF"},{"x": 514,"y": -3.11111111111111,"bCoef": 0.1,"trait": "line","curve": 180,"color": "FFFFFF"},{"x": 514,"y": 0.8888888888888902,"bCoef": 0.1,"trait": "line","curve": 180,"color": "FFFFFF"},{"x": 514,"y": -4.61111111111111,"bCoef": 0.1,"trait": "line","curve": 180,"color": "FFFFFF"},{"x": 514,"y": 2.38888888888889,"bCoef": 0.1,"trait": "line","curve": 180,"color": "FFFFFF"},{"x": 703,"y": -319,"bCoef": 0,"cMask": ["ball"],"trait": "ballArea","color": "FFFFFF","vis": false,"curve": 0},{"x": 703,"y": -82,"bCoef": 0,"cMask": ["ball"],"trait": "ballArea","color": "FFFFFF","pos": [700,-80],"vis": false,"curve": 0},{"x": 703,"y": 81,"bCoef": 0,"cMask": ["ball"],"trait": "ballArea","pos": [700,80],"vis": false,"curve": 0,"color": "FFFFFF"},{"x": 703,"y": 321,"bCoef": 0,"cMask": ["ball"],"trait": "ballArea","vis": false,"curve": 0,"color": "FFFFFF"},{"x": -703,"y": 78,"bCoef": 0,"cMask": ["ball"],"trait": "ballArea","color": "FFFFFF","pos": [-700,80],"vis": false,"p0": [-707.25,0]},{"x": -703,"y": 319,"bCoef": 0,"cMask": ["ball"],"trait": "ballArea","color": "FFFFFF","vis": false},{"x": -703,"y": -82,"bCoef": 0,"cMask": ["ball"],"trait": "ballArea","color": "FFFFFF","pos": [-700,-80],"vis": false,"p0": [-707.25,0]},{"x": -703,"y": -321,"bCoef": 0,"cMask": ["ball"],"trait": "ballArea","color": "FFFFFF","vis": false},{"x": 0,"y": 100,"bCoef": 0.15,"trait": "kickOffBarrier","color": "FFFFFF","vis": true,"curve": 180},{"x": 0,"y": -100,"bCoef": 0.15,"trait": "kickOffBarrier","color": "FFFFFF","vis": true,"curve": 180},{"x": 0,"y": 100,"bCoef": 0.15,"trait": "kickOffBarrier","color": "FFFFFF","vis": true,"curve": 180},{"x": 0,"y": -100,"bCoef": 0.15,"trait": "kickOffBarrier","color": "FFFFFF","vis": true,"curve": 180},{"x": -0.13291470434327612,"y": 100,"bCoef": 0.1,"trait": "line","color": "FFFFFF","curve": 0},{"x": -0.13291470434327612,"y": -100.36002093144947,"bCoef": 0.1,"trait": "line","color": "FFFFFF","curve": 0},{"x": 0,"y": 99.04761904761905,"trait": "kickOffBarrier"},{"x": 0,"y": 350,"bCoef": 0.15,"trait": "kickOffBarrier","color": "F8F8F8","vis": true,"curve": 180},{"x": -699.4653214422947,"y": 168.7268590662594,"bCoef": 0.1,"trait": "line","color": "FFFFFF","curve": 0},{"x": -594.9755404186691,"y": 168.7268590662594,"bCoef": 0.1,"trait": "line","color": "FFFFFF","curve": 0},{"x": -699.4653214422947,"y": -168.7268590662594,"bCoef": 0.1,"trait": "line","color": "FFFFFF","curve": 0},{"x": -594.9755404186691,"y": -168.7268590662594,"bCoef": 0.1,"trait": "line","color": "FFFFFF","curve": 0},{"x": 700.7870182057165,"y": 167.8781102469103,"bCoef": 0.1,"trait": "line","color": "FFFFFF","curve": 0},{"x": 594.954218584181,"y": 167.8781102469103,"bCoef": 0.1,"trait": "line","color": "FFFFFF","curve": 0},{"x": 700.7870182057165,"y": -169.57560788560852,"bCoef": 0.1,"trait": "line","color": "FFFFFF","curve": 0},{"x": 594.954218584181,"y": -169.57560788560852,"bCoef": 0.1,"trait": "line","color": "FFFFFF","curve": 0},{"x": -470.00000000000006,"y": 120,"bCoef": 0.1,"trait": "line","color": "FFFFFF","curve": -100},{"x": -470.00000000000006,"y": -120,"bCoef": 0.1,"trait": "line","color": "FFFFFF","curve": -100},{"x": 469.9999999999995,"y": 120,"bCoef": 0.1,"trait": "line","color": "FFFFFF","curve": 100},{"x": 469.9999999999995,"y": -120,"bCoef": 0.1,"trait": "line","color": "FFFFFF","curve": 100}],"segments": [{"v0": 5,"v1": 6,"curve": 0,"color": "FFFFFF","cMask": ["ball"],"cGroup": ["red","blue"],"trait": "goalNet","pos": [-700,-80],"y": -80,"p0": [-707.25,0]},{"v0": 6,"v1": 7,"color": "FFFFFF","cMask": ["ball"],"cGroup": ["red","blue"],"trait": "goalNet","x": -740,"p0": [-707.25,0]},{"v0": 7,"v1": 8,"curve": 0,"color": "FFFFFF","cMask": ["ball"],"cGroup": ["red","blue"],"trait": "goalNet","pos": [-700,80],"y": 80,"p0": [-707.25,0]},{"v0": 9,"v1": 10,"curve": 0,"color": "FFFFFF","cMask": ["ball"],"cGroup": ["red","blue"],"trait": "goalNet","pos": [700,-80],"y": -80},{"v0": 10,"v1": 11,"color": "FFFFFF","cMask": ["ball"],"cGroup": ["red","blue"],"trait": "goalNet","x": 740},{"v0": 11,"v1": 12,"curve": 0,"color": "FFFFFF","cMask": ["ball"],"cGroup": ["red","blue"],"trait": "goalNet","pos": [700,80],"y": 80},{"v0": 2,"v1": 3,"curve": 180,"vis": true,"color": "F8F8F8","bCoef": 0.15,"cGroup": ["blueKO"],"trait": "kickOffBarrier"},{"v0": 2,"v1": 3,"curve": -180,"vis": true,"color": "F8F8F8","bCoef": 0.15,"cGroup": ["redKO"],"trait": "kickOffBarrier"},{"v0": 3,"v1": 4,"trait": "kickOffBarrier"},{"v0": 13,"v1": 14,"vis": true,"color": "F8F8F8","bCoef": 1.15,"cMask": ["ball"],"trait": "ballArea","x": -700},{"v0": 15,"v1": 16,"vis": true,"color": "F8F8F8","bCoef": 1.15,"cMask": ["ball"],"trait": "ballArea","x": -700},{"v0": 17,"v1": 18,"vis": true,"color": "FFFFFF","bCoef": 1,"cMask": ["ball"],"trait": "ballArea","y": 320},{"v0": 19,"v1": 20,"vis": true,"color": "F8F8F8","bCoef": 1.15,"cMask": ["ball"],"trait": "ballArea","x": 700},{"v0": 21,"v1": 22,"vis": true,"color": "F8F8F8","bCoef": 1.15,"cMask": ["ball"],"trait": "ballArea","x": 700},{"v0": 23,"v1": 24,"vis": true,"color": "F8F8F8","bCoef": 0,"cMask": ["ball"],"trait": "ballArea","x": 550,"y": -240},{"v0": 25,"v1": 26,"curve": 0,"vis": true,"color": "FFFFFF","bCoef": 1,"cMask": ["ball"],"trait": "ballArea","y": -320},{"v0": 27,"v1": 28,"vis": true,"color": "FFFFFF","bCoef": 0.1,"cMask": ["red","blue"],"cGroup": ["redKO","blueKO"],"trait": "kickOffBarrier"},{"v0": 29,"v1": 30,"vis": true,"color": "FFFFFF","bCoef": 0.1,"cMask": ["red","blue"],"cGroup": ["redKO","blueKO"],"trait": "kickOffBarrier"},{"v0": 34,"v1": 35,"curve": 0,"vis": false,"color": "F8F8F8","bCoef": 1,"cMask": ["ball"],"trait": "ballArea","x": -707.5},{"v0": 36,"v1": 37,"curve": 0,"vis": false,"color": "F8F8F8","bCoef": 1,"cMask": ["ball"],"trait": "ballArea","x": -707.5},{"v0": 38,"v1": 39,"curve": 0,"vis": false,"color": "F8F8F8","bCoef": 1,"cMask": ["ball"],"trait": "ballArea","x": 707.5},{"v0": 40,"v1": 41,"curve": 0,"vis": false,"color": "F8F8F8","bCoef": 1,"cMask": ["ball"],"trait": "ballArea","x": 707.5},{"v0": 43,"v1": 44,"curve": 0,"vis": true,"color": "ff9494","bCoef": 0.1,"trait": "line","x": -700,"p0": [-707.25,0]},{"v0": 45,"v1": 46,"curve": 0,"vis": true,"color": "a3baff","bCoef": 0.1,"trait": "line","x": 700},{"v0": 47,"v1": 48,"curve": 0,"vis": true,"color": "FFFFFF","bCoef": 0.1,"trait": "line"},{"v0": 50,"v1": 49,"curve": -90,"vis": true,"color": "FFFFFF","bCoef": 0.1,"trait": "line"},{"v0": 51,"v1": 52,"curve": 0,"vis": true,"color": "FFFFFF","bCoef": 0.1,"trait": "line"},{"v0": 48,"v1": 52,"curve": 0,"vis": true,"color": "FFFFFF","bCoef": 0.1,"trait": "line","x": -470},{"v0": 54,"v1": 53,"curve": 90,"vis": true,"color": "FFFFFF","bCoef": 0.1,"trait": "line"},{"v0": 56,"v1": 55,"curve": -90,"vis": true,"color": "FFFFFF","bCoef": 0.1,"trait": "line"},{"v0": 58,"v1": 57,"curve": 90,"vis": true,"color": "FFFFFF","bCoef": 0.1,"trait": "line"},{"v0": 59,"v1": 60,"curve": 0,"vis": true,"color": "FFFFFF","bCoef": 0.1,"trait": "line"},{"v0": 61,"v1": 62,"curve": 0,"vis": true,"color": "FFFFFF","bCoef": 0.1,"trait": "line"},{"v0": 63,"v1": 64,"curve": 0,"vis": true,"color": "FFFFFF","bCoef": 0.1,"trait": "line","x": 470},{"v0": 66,"v1": 65,"curve": 180,"vis": true,"color": "FFFFFF","bCoef": 0.1,"trait": "line","x": -514},{"v0": 65,"v1": 66,"curve": 180,"vis": true,"color": "FFFFFF","bCoef": 0.1,"trait": "line","x": -514},{"v0": 68,"v1": 67,"curve": 180,"vis": true,"color": "FFFFFF","bCoef": 0.1,"trait": "line","x": -514},{"v0": 67,"v1": 68,"curve": 180,"vis": true,"color": "FFFFFF","bCoef": 0.1,"trait": "line","x": -514},{"v0": 70,"v1": 69,"curve": 180,"vis": true,"color": "FFFFFF","bCoef": 0.1,"trait": "line","x": -514},{"v0": 69,"v1": 70,"curve": 180,"vis": true,"color": "FFFFFF","bCoef": 0.1,"trait": "line","x": -514},{"v0": 72,"v1": 71,"curve": 180,"vis": true,"color": "FFFFFF","bCoef": 0.1,"trait": "line","x": -514},{"v0": 71,"v1": 72,"curve": 180,"vis": true,"color": "FFFFFF","bCoef": 0.1,"trait": "line","x": -514},{"v0": 74,"v1": 73,"curve": 180,"vis": true,"color": "FFFFFF","bCoef": 0.1,"trait": "line","x": 514},{"v0": 73,"v1": 74,"curve": 180,"vis": true,"color": "FFFFFF","bCoef": 0.1,"trait": "line","x": 514},{"v0": 76,"v1": 75,"curve": 180,"vis": true,"color": "FFFFFF","bCoef": 0.1,"trait": "line","x": 514},{"v0": 75,"v1": 76,"curve": 180,"vis": true,"color": "FFFFFF","bCoef": 0.1,"trait": "line","x": 514},{"v0": 78,"v1": 77,"curve": 180,"vis": true,"color": "FFFFFF","bCoef": 0.1,"trait": "line","x": 514},{"v0": 77,"v1": 78,"curve": 180,"vis": true,"color": "FFFFFF","bCoef": 0.1,"trait": "line","x": 514},{"v0": 80,"v1": 79,"curve": 180,"vis": true,"color": "FFFFFF","bCoef": 0.1,"trait": "line","x": 514},{"v0": 79,"v1": 80,"curve": 180,"vis": true,"color": "FFFFFF","bCoef": 0.1,"trait": "line","x": 514},{"v0": 81,"v1": 82,"curve": 0,"vis": false,"color": "FFFFFF","bCoef": 0,"cMask": ["ball"],"trait": "ballArea","x": 703},{"v0": 83,"v1": 84,"curve": 0,"vis": false,"color": "FFFFFF","bCoef": 0,"cMask": ["ball"],"trait": "ballArea","x": 703},{"v0": 85,"v1": 86,"vis": false,"color": "FFFFFF","bCoef": 0,"cMask": ["ball"],"trait": "ballArea","x": -703},{"v0": 87,"v1": 88,"vis": false,"color": "FFFFFF","bCoef": 0,"cMask": ["ball"],"trait": "ballArea","x": -703},{"v0": 89,"v1": 90,"curve": -180,"vis": true,"color": "FFFFFF","bCoef": 0.15,"cGroup": ["redKO"],"trait": "kickOffBarrier"},{"v0": 91,"v1": 92,"curve": 180,"vis": true,"color": "FFFFFF","bCoef": 0.15,"cGroup": ["blueKO"],"trait": "kickOffBarrier"},{"v0": 95,"v1": 96,"trait": "kickOffBarrier"},{"v0": 97,"v1": 98,"curve": 0,"vis": true,"color": "FFFFFF","bCoef": 0.1,"trait": "line"},{"v0": 99,"v1": 100,"curve": 0,"vis": true,"color": "FFFFFF","bCoef": 0.1,"trait": "line"},{"v0": 98,"v1": 100,"curve": 0,"vis": true,"color": "FFFFFF","bCoef": 0.1,"trait": "line","x": -470},{"v0": 101,"v1": 102,"curve": 0,"vis": true,"color": "FFFFFF","bCoef": 0.1,"trait": "line"},{"v0": 103,"v1": 104,"curve": 0,"vis": true,"color": "FFFFFF","bCoef": 0.1,"trait": "line"},{"v0": 102,"v1": 104,"curve": 0,"vis": true,"color": "FFFFFF","bCoef": 0.1,"trait": "line","x": -470},{"v0": 105,"v1": 106,"curve": -100,"vis": true,"color": "FFFFFF","bCoef": 0.1,"trait": "line","x": -470},{"v0": 107,"v1": 108,"curve": 100,"vis": true,"color": "FFFFFF","bCoef": 0.1,"trait": "line","x": -470}],"goals": [{"p0": [-706.25,-75],"p1": [-706.25,80],"team": "red"},{"p0": [706.25,80],"p1": [706.25,-80],"team": "blue"}],"discs": [{"radius": 5,"pos": [-700,80],"color": "FFFFFF","trait": "goalPost","y": 80,"p0": [-707.25,0]},{"radius": 5,"pos": [-700,-80],"color": "FFFFFF","trait": "goalPost","y": -80,"x": -560,"p0": [-707.25,0]},{"radius": 5,"pos": [700,80],"color": "FFFFFF","trait": "goalPost","y": 80},{"radius": 5,"pos": [700,-80],"color": "FFFFFF","trait": "goalPost","y": -80},{"radius": 3,"invMass": 0,"pos": [-700,320],"color": "FFFFFF","bCoef": 0.1,"trait": "line"},{"radius": 3,"invMass": 0,"pos": [-700,-320],"color": "FFFFFF","bCoef": 0.1,"trait": "line"},{"radius": 3,"invMass": 0,"pos": [700,-320],"color": "FFFFFF","bCoef": 0.1,"trait": "line"},{"radius": 3,"invMass": 0,"pos": [700,320],"color": "FFFFFF","bCoef": 0.1,"trait": "line"},{"radius": 6,"invMass": 0,"pos": [10000,10000],"color": "FF0000","bCoef": 0,"cMask": [],"cGroup": [],"vis": false},{"radius": 6,"invMass": 0,"pos": [10000,10000],"color": "FF0000","bCoef": 0,"cMask": [],"cGroup": [],"vis": false},{"radius": 6,"invMass": 0,"pos": [10000,10000],"color": "FF0000","bCoef": 0,"cMask": [],"cGroup": [],"vis": false},{"radius": 6,"invMass": 0,"pos": [10000,10000],"color": "FF0000","bCoef": 0,"cMask": [],"cGroup": [],"vis": false},{"radius": 6,"invMass": 0,"pos": [10000,10000],"color": "FF0000","bCoef": 0,"cMask": [],"cGroup": [],"vis": false},{"radius": 6,"invMass": 0,"pos": [10000,10000],"color": "FF0000","bCoef": 0,"cMask": [],"cGroup": [],"vis": false},{"radius": 6,"invMass": 0,"pos": [10000,10000],"color": "FF0000","bCoef": 0,"cMask": [],"cGroup": [],"vis": false},{"radius": 6,"invMass": 0,"pos": [10000,10000],"color": "FF0000","bCoef": 0,"cMask": [],"cGroup": [],"vis": false},{"radius": 6,"invMass": 0,"pos": [10000,10000],"color": "FF0000","bCoef": 0,"cMask": [],"cGroup": [],"vis": false},{"radius": 6,"invMass": 0,"pos": [10000,10000],"color": "FF0000","bCoef": 0,"cMask": [],"cGroup": [],"vis": false},{"radius": 6,"invMass": 0,"pos": [10000,10000],"color": "FF0000","bCoef": 0,"cMask": [],"cGroup": [],"vis": false},{"radius": 6,"invMass": 0,"pos": [10000,10000],"color": "FF0000","bCoef": 0,"cMask": [],"cGroup": [],"vis": false},{"radius": 6,"invMass": 0,"pos": [10000,10000],"color": "FF0000","bCoef": 0,"cMask": [],"cGroup": [],"vis": false},{"radius": 6,"invMass": 0,"pos": [10000,10000],"color": "FF0000","bCoef": 0,"cMask": [],"cGroup": [],"vis": false},{"radius": 6,"invMass": 0,"pos": [10000,10000],"color": "FF0000","bCoef": 0,"cMask": [],"cGroup": [],"vis": false},{"radius": 6,"invMass": 0,"pos": [10000,10000],"color": "FF0000","bCoef": 0,"cMask": [],"cGroup": [],"vis": false},{"radius": 6,"invMass": 0,"pos": [10000,10000],"color": "FF0000","bCoef": 0,"cMask": [],"cGroup": [],"vis": false},{"radius": 6,"invMass": 0,"pos": [10000,10000],"color": "FF0000","bCoef": 0,"cMask": [],"cGroup": [],"vis": false},{"radius": 6,"invMass": 0,"pos": [10000,10000],"color": "FF0000","bCoef": 0,"cMask": [],"cGroup": [],"vis": false},{"radius": 6,"invMass": 0,"pos": [10000,10000],"color": "FF0000","bCoef": 0,"cMask": [],"cGroup": [],"vis": false},{"radius": 6,"invMass": 0,"pos": [10000,10000],"color": "FF0000","bCoef": 0,"cMask": [],"cGroup": [],"vis": false},{"radius": 6,"invMass": 0,"pos": [10000,10000],"color": "FF0000","bCoef": 0,"cMask": [],"cGroup": [],"vis": false},{"radius": 6,"invMass": 0,"pos": [10000,10000],"color": "FF0000","bCoef": 0,"cMask": [],"cGroup": [],"vis": false},{"radius": 6,"invMass": 0,"pos": [10000,10000],"color": "FF0000","bCoef": 0,"cMask": [],"cGroup": [],"vis": false},{"radius": 6,"invMass": 0,"pos": [10000,10000],"color": "FF0000","bCoef": 0,"cMask": [],"cGroup": [],"vis": false},{"radius": 6,"invMass": 0,"pos": [10000,10000],"color": "FF0000","bCoef": 0,"cMask": [],"cGroup": [],"vis": false},{"radius": 6,"invMass": 0,"pos": [10000,10000],"color": "FF0000","bCoef": 0,"cMask": [],"cGroup": [],"vis": false},{"radius": 6,"invMass": 0,"pos": [10000,10000],"color": "FF0000","bCoef": 0,"cMask": [],"cGroup": [],"vis": false},{"radius": 6,"invMass": 0,"pos": [10000,10000],"color": "FF0000","bCoef": 0,"cMask": [],"cGroup": [],"vis": false},{"radius": 6,"invMass": 0,"pos": [10000,10000],"color": "FF0000","bCoef": 0,"cMask": [],"cGroup": [],"vis": false}],"planes": [{"normal": [0,1],"dist": -320,"bCoef": 1,"trait": "ballArea","vis": false,"curve": 0,"_data": {"extremes": {"normal": [0,1],"dist": -320,"canvas_rect": [-800,-350,10006,10006],"a": [-800,-320],"b": [10006,-320]}}},{"normal": [0,-1],"dist": -320,"bCoef": 1,"trait": "ballArea","_data": {"extremes": {"normal": [0,-1],"dist": -320,"canvas_rect": [-800,-350,10006,10006],"a": [-800,320],"b": [10006,320]}}},{"normal": [0,1],"dist": -350,"bCoef": 0.1,"_data": {"extremes": {"normal": [0,1],"dist": -350,"canvas_rect": [-800,-350,10006,10006],"a": [-800,-350],"b": [10006,-350]}}},{"normal": [0,-1],"dist": -350,"bCoef": 0.1,"_data": {"extremes": {"normal": [0,-1],"dist": -350,"canvas_rect": [-800,-350,10006,10006],"a": [-800,350],"b": [10006,350]}}},{"normal": [1,0],"dist": -760,"bCoef": 0.1,"_data": {"extremes": {"normal": [1,0],"dist": -760,"canvas_rect": [-800,-350,10006,10006],"a": [-760,-350],"b": [-760,10006]}}},{"normal": [-1,0],"dist": -760,"bCoef": 0.1,"_data": {"extremes": {"normal": [-1,0],"dist": -760,"canvas_rect": [-800,-350,10006,10006],"a": [760,-350],"b": [760,10006]}}},{"normal": [1,0],"dist": -760,"bCoef": 0.1,"trait": "ballArea","vis": false,"curve": 0,"_data": {"extremes": {"normal": [1,0],"dist": -760,"canvas_rect": [-800,-350,10006,10006],"a": [-760,-350],"b": [-760,10006]}}},{"normal": [-1,0],"dist": -760,"bCoef": 0.1,"trait": "ballArea","vis": false,"curve": 0,"_data": {"extremes": {"normal": [-1,0],"dist": -760,"canvas_rect": [-800,-350,10006,10006],"a": [760,-350],"b": [760,10006]}}}],"traits": {"ballArea": {"vis": false,"bCoef": 1,"cMask": ["ball"]},"goalPost": {"radius": 8,"invMass": 0,"bCoef": 0.5},"goalNet": {"vis": true,"bCoef": 0.1,"cMask": ["all"]},"line": {"vis": true,"bCoef": 0.1,"cMask": [""]},"kickOffBarrier": {"vis": false,"bCoef": 0.1,"cGroup": ["redKO","blueKO"],"cMask": ["red","blue"]}},"playerPhysics": {"bCoef": 0,"acceleration": 0.11,"kickingAcceleration": 0.083,"kickStrength": 4.4},"ballPhysics": {"radius": 5.8,"bCoef": 0.412,"invMass": 1.5,"color": "BDFF80"},"joints": [],"redSpawnPoints": [[-200,0],[-200,-80],[-200,80]],"blueSpawnPoints": [[200,0],[200,-80],[200,80]],"cameraWidth": 0,"cameraHeight": 0,"maxViewWidth": 0,"cameraFollow": "ball","canBeStored": false,"kickOffReset": "partial"}';
const STADIUM = '{"name": "lỏ | Stadium","width": 900,"height": 400,"spawnDistance": 400,"bg": {"type": "grass","width": 800,"height": 350,"kickOffRadius": 95,"cornerRadius": 0,"color": "718B5B"},"vertexes": [{"x": -800,"y": 350,"bCoef": 1,"cMask": ["ball"],"trait": "ballArea","bias": 30,"color": "ffffff","curve": 0,"vis": false},{"x": -800,"y": 100,"bCoef": 0.95,"cMask": ["all"],"trait": "ballArea","bias": -30,"curve": 0,"vis": false,"color": "ffffff"},{"x": -800,"y": -100,"bCoef": 0.95,"cMask": ["all"],"trait": "ballArea","bias": 0,"curve": 0,"vis": true,"color": "ffffff"},{"x": -800,"y": -350,"bCoef": 0.95,"cMask": ["ball"],"trait": "ballArea","bias": -30,"color": "ffffff","curve": 0,"vis": false},{"x": 800,"y": 350,"bCoef": 1,"cMask": ["ball"],"trait": "ballArea","bias": 30,"color": "ffffff","curve": 0,"vis": false},{"x": 800,"y": 100,"bCoef": 0.95,"cMask": ["all"],"trait": "ballArea","bias": 0,"curve": 0,"color": "ffffff","vis": false},{"x": 800,"y": -100,"bCoef": 0.95,"cMask": ["all"],"trait": "ballArea","bias": 30,"curve": 0,"color": "ffffff"},{"x": 800,"y": -350,"bCoef": 0.95,"cMask": ["ball"],"trait": "ballArea","bias": -30,"color": "ffffff","curve": 0,"vis": false},{"x": 0,"y": 404,"trait": "kickOffBarrier"},{"x": 0,"y": 95,"trait": "line","color": "ffffff"},{"x": 0,"y": -95,"trait": "line","color": "ffffff"},{"x": 0,"y": -404,"trait": "kickOffBarrier"},{"x": -835,"y": -100,"bCoef": 0.05,"cMask": ["all"],"trait": "goalNet","radius": 0,"curve": 0,"color": "ffffff"},{"x": 835,"y": -100,"bCoef": 0.05,"cMask": ["all"],"trait": "goalNet","radius": 0,"curve": 0,"color": "ffffff"},{"x": -835,"y": 100,"bCoef": 0.05,"cMask": ["all"],"trait": "goalNet","radius": 0,"curve": 0,"color": "ffffff"},{"x": 835,"y": 100,"bCoef": 0.05,"cMask": ["all"],"trait": "goalNet","radius": 0,"curve": 0,"color": "ffffff"},{"x": 0,"y": 95,"trait": "kickOffBarrier","curve": 180,"color": "ffffff"},{"x": 0,"y": -95,"trait": "kickOffBarrier","curve": 180,"color": "ffffff"},{"x": 800,"y": -100,"bCoef": 1,"cMask": ["ball"],"trait": "ballArea","curve": 0,"bias": -30,"vis": false},{"x": 0,"y": 350,"bCoef": 0.1,"cMask": ["red","blue"],"cGroup": ["redKO","blueKO"],"trait": "kickOffBarrier","color": "ffffff"},{"x": 0,"y": -350,"bCoef": 0.1,"cMask": ["red","blue"],"cGroup": ["redKO","blueKO"],"trait": "kickOffBarrier","color": "ffffff"},{"x": -45,"y": -25,"bCoef": 0,"trait": "line"},{"x": -30,"y": -25,"bCoef": 0,"trait": "line"},{"x": -30,"y": 10,"bCoef": 0,"trait": "line"},{"x": -10,"y": 10,"bCoef": 0,"trait": "line"},{"x": -10,"y": 25,"bCoef": 0,"trait": "line"},{"x": -45,"y": 25,"bCoef": 0,"trait": "line"},{"x": 10,"y": -25,"bCoef": 0,"trait": "line"},{"x": 45,"y": -25,"bCoef": 0,"trait": "line"},{"x": 45,"y": 25,"bCoef": 0,"trait": "line"},{"x": 10,"y": 25,"bCoef": 0,"trait": "line"},{"x": 22,"y": -12,"bCoef": 0,"trait": "line"},{"x": 33,"y": -12,"bCoef": 0,"trait": "line"},{"x": 33,"y": 12,"bCoef": 0,"trait": "line"},{"x": 22,"y": 12,"bCoef": 0,"trait": "line"},{"x": 26.14449016918153,"y": -41,"bCoef": 0,"trait": "line","color": "ffffff","_data": {"mirror": {}}},{"x": 35.43832241020169,"y": -41.73215465122187,"bCoef": 0,"trait": "line","color": "ffffff","_data": {"mirror": {}}},{"x": 27.474013107757965,"y": -31.504851902657116,"bCoef": 0,"trait": "line","color": "ffffff","_data": {"mirror": {}}},{"x": 0,"y": 0,"bCoef": 0,"trait": "line","vis": false},{"x": 0,"y": 0,"bCoef": 0,"trait": "line","vis": false},{"x": 800,"y": 225,"bCoef": 0,"trait": "line","color": "ffffff"},{"x": 800,"y": -225,"bCoef": 0,"trait": "line","color": "ffffff"},{"x": 560,"y": -225,"bCoef": 0,"trait": "line","curve": 0,"color": "ffffff"},{"x": 560,"y": 225,"bCoef": 0,"trait": "line","curve": 0,"color": "ffffff"},{"x": 560,"y": 95,"bCoef": 0,"trait": "line","curve": 100,"color": "ffffff"},{"x": 560,"y": -95,"bCoef": 0,"trait": "line","curve": 100,"color": "ffffff"},{"x": -560,"y": -225,"bCoef": 0,"trait": "line","color": "ffffff"},{"x": -560,"y": 225,"bCoef": 0,"trait": "line","color": "ffffff"},{"x": -800,"y": 225,"bCoef": 0,"trait": "line","color": "ffffff"},{"x": -800,"y": -225,"bCoef": 0,"trait": "line","color": "ffffff"},{"x": -560,"y": 95,"bCoef": 0,"trait": "line","curve": 100,"color": "ffffff"},{"x": -560,"y": -95,"bCoef": 0,"trait": "line","curve": 100,"color": "ffffff"},{"x": -800,"y": 345,"bCoef": 0,"trait": "line","color": "ffffff","curve": 180,"vis": true},{"x": 795,"y": 350,"bCoef": 1,"trait": "line","curve": 0,"bias": 30},{"x": 800,"y": 345,"trait": "line","curve": 180},{"x": -800,"y": -345,"trait": "line","curve": -180},{"x": -795,"y": -350,"trait": "line","curve": -180},{"x": 795,"y": -350,"bCoef": 0.95,"trait": "line","curve": 0,"vis": false},{"x": 800,"y": -345,"trait": "line","curve": -180},{"x": -795,"y": 350,"bCoef": 0,"cMask": ["ball"],"trait": "line","vis": true,"color": "ffffff","curve": 180},{"x": -457.142857143,"y": -348,"bCoef": 0,"trait": "line","color": "718B5B"},{"x": -457.142857143,"y": 348,"bCoef": 0,"trait": "line","color": "718B5B"},{"x": 457.142857143,"y": -348,"bCoef": 0,"trait": "line"},{"x": 457.142857143,"y": 348,"bCoef": 0,"trait": "line"},{"x": -800,"y": -155,"trait": "line","color": "ffffff"},{"x": -700,"y": -155,"trait": "line","color": "ffffff"},{"x": -700,"y": 155,"trait": "line"},{"x": -800,"y": 155,"trait": "line"},{"x": -630,"y": -1.5,"bCoef": 0,"trait": "line","curve": 180},{"x": -630,"y": 1.5,"bCoef": 0,"trait": "line","curve": 180},{"x": -630,"y": 1.5,"bCoef": 0,"trait": "line","curve": 180},{"x": -630,"y": -1.5,"bCoef": 0,"trait": "line","curve": 180},{"x": 700,"y": -155,"bCoef": 0,"trait": "line","color": "ffffff"},{"x": 700,"y": 155,"bCoef": 0,"trait": "line","color": "ffffff"},{"x": 800,"y": 155,"bCoef": 0,"trait": "line"},{"x": 800,"y": -155,"bCoef": 0,"trait": "line"},{"x": 630,"y": 1.5,"bCoef": 0,"trait": "line","curve": 180},{"x": 630,"y": -1.5,"bCoef": 0,"trait": "line","curve": 180},{"x": 630,"y": -1.5,"bCoef": 0,"trait": "line","curve": 180},{"x": 630,"y": 1.5,"bCoef": 0,"trait": "line","curve": 180},{"x": -800,"y": -100,"bCoef": 0.95,"cMask": ["all"],"trait": "ballArea","bias": 0,"curve": 0,"vis": true,"color": "ffffff"},{"x": -800,"y": -350,"bCoef": 0.95,"cMask": ["ball"],"trait": "ballArea","bias": -30,"color": "ffffff","curve": 0,"vis": false},{"x": -457.142857143,"y": -348,"bCoef": 0,"trait": "line","color": "718B5B"},{"x": -457.142857143,"y": 348,"bCoef": 0,"trait": "line","color": "718B5B"},{"x": 457.142857143,"y": -348,"bCoef": 0,"trait": "line"},{"x": 457.142857143,"y": 348,"bCoef": 0,"trait": "line"},{"x": -490,"y": -450,"cGroup": ["c1"],"vis": false},{"x": -490,"y": 450,"cGroup": ["c1"],"vis": false},{"x": 490,"y": -450,"cGroup": ["c2"],"vis": false},{"x": 490,"y": 450,"cGroup": ["c2"],"vis": false}],"segments": [{"v0": 0,"v1": 1,"bCoef": 1,"trait": "ballArea","bias": -30},{"v0": 2,"v1": 3,"bCoef": 1,"trait": "ballArea","bias": -30},{"v0": 4,"v1": 5,"bCoef": 1,"trait": "ballArea","bias": 30},{"v0": 6,"v1": 7,"curve": 0,"bCoef": 1,"trait": "ballArea"},{"v0": 8,"v1": 9,"trait": "kickOffBarrier"},{"v0": 9,"v1": 10,"curve": 180,"cGroup": ["blueKO"],"trait": "kickOffBarrier"},{"v0": 9,"v1": 10,"curve": -180,"cGroup": ["redKO"],"trait": "kickOffBarrier"},{"v0": 10,"v1": 11,"trait": "kickOffBarrier"},{"v0": 2,"v1": 12,"curve": 0,"vis": true,"color": "ffffff","bCoef": 1,"cMask": ["all"],"trait": "goalNet","y": -100},{"v0": 6,"v1": 13,"curve": 0,"vis": true,"color": "ffffff","bCoef": 0.1,"cMask": ["all"],"trait": "goalNet","y": -100},{"v0": 1,"v1": 14,"curve": 0,"vis": true,"color": "ffffff","bCoef": 1,"cMask": ["all"],"trait": "goalNet","y": 100},{"v0": 5,"v1": 15,"curve": 0,"vis": true,"color": "ffffff","bCoef": 0.1,"cMask": ["all"],"trait": "goalNet","y": 100},{"v0": 1,"v1": 0,"curve": 0,"vis": true,"color": "ffffff","bCoef": 1,"cMask": ["ball"],"trait": "ballArea","bias": 30,"x": -800},{"v0": 5,"v1": 4,"curve": 0,"vis": true,"color": "ffffff","bCoef": 1,"cMask": ["ball"],"trait": "ballArea","bias": -30,"x": 800},{"v0": 2,"v1": 3,"curve": 0,"vis": true,"color": "ffffff","bCoef": 1,"cMask": ["ball"],"trait": "ballArea","bias": -30,"x": -800},{"v0": 6,"v1": 7,"curve": 0,"vis": true,"color": "ffffff","bCoef": 1,"cMask": ["ball"],"trait": "ballArea","bias": 30,"x": 800},{"v0": 10,"v1": 9,"curve": -180,"vis": true,"color": "ffffff","bCoef": 0,"trait": "line"},{"v0": 17,"v1": 16,"curve": 180,"vis": true,"color": "ffffff","bCoef": 0,"trait": "line"},{"v0": 2,"v1": 1,"curve": 0,"vis": true,"color": "ff9494","bCoef": 0,"trait": "line","x": -800},{"v0": 6,"v1": 5,"curve": 0,"vis": true,"color": "a3baff","bCoef": 0,"trait": "line","x": 795},{"v0": 17,"v1": 20,"vis": true,"color": "ffffff","bCoef": 0.1,"cMask": ["red","blue"],"cGroup": ["redKO","blueKO"],"trait": "kickOffBarrier"},{"v0": 16,"v1": 19,"vis": true,"color": "ffffff","bCoef": 0.1,"cMask": ["red","blue"],"cGroup": ["redKO","blueKO"],"trait": "kickOffBarrier","x": 0},{"v0": 7,"v1": 3,"curve": 0,"vis": true,"color": "ffffff","bCoef": 1,"cMask": ["ball"],"trait": "ballArea","bias": 30,"y": -350},{"v0": 0,"v1": 4,"curve": 0,"vis": false,"color": "ffffff","bCoef": 1,"cMask": ["ball"],"trait": "ballArea","y": 350},{"v0": 21,"v1": 22,"vis": true,"color": "ffffff","bCoef": 0,"trait": "line"},{"v0": 22,"v1": 23,"vis": true,"color": "ffffff","bCoef": 0,"trait": "line"},{"v0": 23,"v1": 24,"vis": true,"color": "ffffff","bCoef": 0,"trait": "line"},{"v0": 24,"v1": 25,"vis": true,"color": "ffffff","bCoef": 0,"trait": "line"},{"v0": 25,"v1": 26,"vis": true,"color": "ffffff","bCoef": 0,"trait": "line"},{"v0": 26,"v1": 21,"vis": true,"color": "ffffff","bCoef": 0,"trait": "line"},{"v0": 27,"v1": 28,"vis": true,"color": "ffffff","bCoef": 0,"trait": "line"},{"v0": 28,"v1": 29,"vis": true,"color": "ffffff","bCoef": 0,"trait": "line"},{"v0": 29,"v1": 30,"vis": true,"color": "ffffff","bCoef": 0,"trait": "line"},{"v0": 30,"v1": 27,"vis": true,"color": "ffffff","bCoef": 0,"trait": "line"},{"v0": 43,"v1": 40,"vis": true,"color": "ffffff","bCoef": 0,"trait": "line","y": 225},{"v0": 43,"v1": 42,"curve": 0,"vis": true,"color": "ffffff","bCoef": 0,"trait": "line","x": 560},{"v0": 42,"v1": 41,"vis": true,"color": "ffffff","bCoef": 0,"trait": "line","y": -225},{"v0": 44,"v1": 45,"curve": 100,"vis": true,"color": "ffffff","bCoef": 0,"trait": "line","x": 560},{"v0": 48,"v1": 47,"vis": true,"color": "ffffff","bCoef": 0,"trait": "line","y": 225},{"v0": 47,"v1": 46,"vis": true,"color": "ffffff","bCoef": 0,"trait": "line","x": -560},{"v0": 46,"v1": 49,"vis": true,"color": "ffffff","bCoef": 0,"trait": "line","y": -225},{"v0": 51,"v1": 50,"curve": 100,"vis": true,"color": "ffffff","bCoef": 0,"trait": "line","x": -560},{"v0": 15,"v1": 13,"curve": 0,"vis": true,"color": "ffffff","bCoef": 0.05,"cMask": ["all"],"trait": "goalNet","x": 835},{"v0": 12,"v1": 14,"curve": 0,"vis": true,"color": "ffffff","bCoef": 0.05,"cMask": ["all"],"trait": "goalNet","x": -835},{"v0": 53,"v1": 54,"curve": 180,"color": "ffffff","trait": "line"},{"v0": 55,"v1": 56,"curve": -180,"color": "ffffff","trait": "line"},{"v0": 57,"v1": 58,"curve": -180,"color": "ffffff","trait": "line"},{"v0": 0,"v1": 4,"curve": 0,"vis": false,"color": "ffffff","bCoef": 1,"cMask": ["ball"],"trait": "ballArea","bias": 30},{"v0": 0,"v1": 53,"curve": 0,"vis": true,"color": "ffffff","bCoef": 1,"cMask": ["ball"],"trait": "ballArea","bias": 30},{"v0": 3,"v1": 57,"curve": 0,"vis": false,"color": "ffffff","bCoef": 1,"cMask": ["ball"],"trait": "ballArea"},{"v0": 3,"v1": 7,"curve": 0,"vis": false,"color": "ffffff","bCoef": 1,"cMask": ["ball"],"trait": "ballArea","bias": -30},{"v0": 7,"v1": 18,"curve": 0,"vis": false,"color": "ffffff","bCoef": 1,"cMask": ["ball"],"trait": "ballArea","bias": -30},{"v0": 4,"v1": 5,"curve": 0,"vis": false,"color": "ffffff","bCoef": 1,"cMask": ["ball"],"trait": "ballArea","bias": 0},{"v0": 0,"v1": 1,"curve": 0,"vis": false,"color": "FFFFFF","bCoef": 1,"trait": "ballArea","bias": 0},{"v0": 3,"v1": 2,"curve": 0,"vis": false,"bCoef": 1,"cMask": ["ball"],"trait": "ballArea","bias": 0},{"v0": 52,"v1": 59,"curve": 180,"vis": true,"color": "ffffff","bCoef": 0,"trait": "line","bias": 0},{"v0": 64,"v1": 65,"curve": 0,"vis": true,"color": "ffffff","trait": "line"},{"v0": 66,"v1": 67,"curve": 0,"vis": true,"color": "ffffff","trait": "line"},{"v0": 65,"v1": 66,"curve": 0,"vis": true,"color": "ffffff","bCoef": 0,"trait": "line"},{"v0": 68,"v1": 69,"curve": 180,"vis": true,"color": "ffffff","bCoef": 0,"trait": "line"},{"v0": 70,"v1": 71,"curve": 180,"vis": true,"color": "ffffff","bCoef": 0,"trait": "line"},{"v0": 72,"v1": 73,"color": "ffffff","bCoef": 0,"trait": "line","x": 710},{"v0": 73,"v1": 74,"vis": true,"color": "ffffff","bCoef": 0,"trait": "line"},{"v0": 72,"v1": 75,"vis": true,"color": "ffffff","bCoef": 0,"trait": "line"},{"v0": 76,"v1": 77,"curve": 180,"vis": true,"color": "ffffff","bCoef": 0,"trait": "line","x": 642.5},{"v0": 78,"v1": 79,"curve": 180,"vis": true,"color": "ffffff","bCoef": 0,"trait": "line"},{"v0": 81,"v1": 80,"curve": 0,"vis": false,"bCoef": 1,"cMask": ["ball"],"trait": "ballArea","bias": 0},{"v0": 86,"v1": 87,"vis": false,"color": "eb387a","cMask": ["c1"]},{"v0": 88,"v1": 89,"vis": false,"color": "eb387a","cMask": ["c2"]},{"v0": 31,"v1": 32,"vis": true,"color": "ffffff","bCoef": 0,"trait": "line"},{"v0": 32,"v1": 33,"vis": true,"color": "ffffff","bCoef": 0,"trait": "line"},{"v0": 33,"v1": 34,"vis": true,"color": "ffffff","bCoef": 0,"trait": "line"},{"v0": 34,"v1": 31,"vis": true,"color": "ffffff","bCoef": 0,"trait": "line"},{"v0": 35,"v1": 36,"curve": 208.0275647476128,"vis": true,"color": "ffffff","bCoef": 0,"trait": "line","_data": {"mirror": {},"arc": {"a": [26.14449016918153,-41],"b": [35.43832241020169,-41.73215465122187],"curve": 208.0275647476128,"radius": 4.804301335717605,"center": [30.700039422357595,-42.525871005775045],"from": 2.81838982199157,"to": 0.16597045456351098}}},{"v0": 36,"v1": 37,"curve": 70.09948797392062,"vis": true,"color": "ffffff","bCoef": 0,"trait": "line","_data": {"mirror": {},"arc": {"a": [35.43832241020169,-41.73215465122187],"b": [27.474013107757965,-31.504851902657116],"curve": 70.09948797392062,"radius": 11.285777131053878,"center": [24.166594833963302,-42.29511370735805],"from": 0.04990287982944615,"to": 1.2733697489365303}}}],"goals": [{"p0": [-809.5,-99.5],"p1": [-809.5,99.5],"team": "red"},{"p0": [809.5,99.5],"p1": [809.5,-99.5],"team": "blue"}],"discs": [{"radius": 0,"pos": [-490,-350],"color": "ffffff","bCoef": 0,"cMask": ["c1"],"cGroup": ["none"],"trait": "line"},{"radius": 0,"pos": [-490,350],"color": "ffffff","bCoef": 0,"cMask": ["c1"],"cGroup": ["none"],"trait": "line"},{"radius": 0,"pos": [490,-350],"color": "ffffff","bCoef": 0,"cMask": ["c2"],"cGroup": ["none"],"trait": "line"},{"radius": 0,"pos": [490,350],"color": "ffffff","bCoef": 0,"cMask": ["c2"],"cGroup": ["none"],"trait": "line"},{"radius": 5.5,"pos": [-800,100],"color": "FFFFFF","bCoef": 1.35,"trait": "goalPost"},{"radius": 5.5,"pos": [-800,-100],"color": "FFFFFF","bCoef": 1.35,"trait": "goalPost"},{"radius": 5.5,"pos": [800,100],"color": "FFFFFF","bCoef": 1.35,"trait": "goalPost"},{"radius": 5.5,"pos": [800,-100],"color": "FFFFFF","bCoef": 1.35,"trait": "goalPost"},{"radius": 6,"invMass": 0,"pos": [10000,10000],"color": "FF0000","bCoef": 0,"cMask": [],"cGroup": [],"vis": false},{"radius": 6,"invMass": 0,"pos": [10000,10000],"color": "FF0000","bCoef": 0,"cMask": [],"cGroup": [],"vis": false},{"radius": 6,"invMass": 0,"pos": [10000,10000],"color": "FF0000","bCoef": 0,"cMask": [],"cGroup": [],"vis": false},{"radius": 6,"invMass": 0,"pos": [10000,10000],"color": "FF0000","bCoef": 0,"cMask": [],"cGroup": [],"vis": false},{"radius": 6,"invMass": 0,"pos": [10000,10000],"color": "FF0000","bCoef": 0,"cMask": [],"cGroup": [],"vis": false},{"radius": 6,"invMass": 0,"pos": [10000,10000],"color": "FF0000","bCoef": 0,"cMask": [],"cGroup": [],"vis": false},{"radius": 6,"invMass": 0,"pos": [10000,10000],"color": "FF0000","bCoef": 0,"cMask": [],"cGroup": [],"vis": false},{"radius": 6,"invMass": 0,"pos": [10000,10000],"color": "FF0000","bCoef": 0,"cMask": [],"cGroup": [],"vis": false},{"radius": 6,"invMass": 0,"pos": [10000,10000],"color": "FF0000","bCoef": 0,"cMask": [],"cGroup": [],"vis": false},{"radius": 6,"invMass": 0,"pos": [10000,10000],"color": "FF0000","bCoef": 0,"cMask": [],"cGroup": [],"vis": false},{"radius": 6,"invMass": 0,"pos": [10000,10000],"color": "FF0000","bCoef": 0,"cMask": [],"cGroup": [],"vis": false},{"radius": 6,"invMass": 0,"pos": [10000,10000],"color": "FF0000","bCoef": 0,"cMask": [],"cGroup": [],"vis": false},{"radius": 6,"invMass": 0,"pos": [10000,10000],"color": "FF0000","bCoef": 0,"cMask": [],"cGroup": [],"vis": false},{"radius": 6,"invMass": 0,"pos": [10000,10000],"color": "FF0000","bCoef": 0,"cMask": [],"cGroup": [],"vis": false},{"radius": 6,"invMass": 0,"pos": [10000,10000],"color": "FF0000","bCoef": 0,"cMask": [],"cGroup": [],"vis": false},{"radius": 6,"invMass": 0,"pos": [10000,10000],"color": "FF0000","bCoef": 0,"cMask": [],"cGroup": [],"vis": false},{"radius": 6,"invMass": 0,"pos": [10000,10000],"color": "FF0000","bCoef": 0,"cMask": [],"cGroup": [],"vis": false},{"radius": 6,"invMass": 0,"pos": [10000,10000],"color": "FF0000","bCoef": 0,"cMask": [],"cGroup": [],"vis": false},{"radius": 6,"invMass": 0,"pos": [10000,10000],"color": "FF0000","bCoef": 0,"cMask": [],"cGroup": [],"vis": false},{"radius": 6,"invMass": 0,"pos": [10000,10000],"color": "FF0000","bCoef": 0,"cMask": [],"cGroup": [],"vis": false},{"radius": 6,"invMass": 0,"pos": [10000,10000],"color": "FF0000","bCoef": 0,"cMask": [],"cGroup": [],"vis": false},{"radius": 6,"invMass": 0,"pos": [10000,10000],"color": "FF0000","bCoef": 0,"cMask": [],"cGroup": [],"vis": false},{"radius": 6,"invMass": 0,"pos": [10000,10000],"color": "FF0000","bCoef": 0,"cMask": [],"cGroup": [],"vis": false},{"radius": 6,"invMass": 0,"pos": [10000,10000],"color": "FF0000","bCoef": 0,"cMask": [],"cGroup": [],"vis": false},{"radius": 6,"invMass": 0,"pos": [10000,10000],"color": "FF0000","bCoef": 0,"cMask": [],"cGroup": [],"vis": false},{"radius": 6,"invMass": 0,"pos": [10000,10000],"color": "FF0000","bCoef": 0,"cMask": [],"cGroup": [],"vis": false},{"radius": 6,"invMass": 0,"pos": [10000,10000],"color": "FF0000","bCoef": 0,"cMask": [],"cGroup": [],"vis": false},{"radius": 6,"invMass": 0,"pos": [10000,10000],"color": "FF0000","bCoef": 0,"cMask": [],"cGroup": [],"vis": false},{"radius": 6,"invMass": 0,"pos": [10000,10000],"color": "FF0000","bCoef": 0,"cMask": [],"cGroup": [],"vis": false},{"radius": 6,"invMass": 0,"pos": [10000,10000],"color": "FF0000","bCoef": 0,"cMask": [],"cGroup": [],"vis": false}],"planes": [{"normal": [0,1],"dist": -404,"bCoef": 0.2,"cMask": ["all"],"_data": {"extremes": {"normal": [0,1],"dist": -404,"canvas_rect": [-1133.7408,-508.92364800000007,12604.678272000001,12604.678272000001],"a": [-1133.7408,-404],"b": [12604.678272000001,-404]}}},{"normal": [0,-1],"dist": -404,"bCoef": 0.2,"cMask": ["all"],"_data": {"extremes": {"normal": [0,-1],"dist": -404,"canvas_rect": [-1133.7408,-508.92364800000007,12604.678272000001,12604.678272000001],"a": [-1133.7408,404],"b": [12604.678272000001,404]}}},{"normal": [1,0],"dist": -900,"bCoef": 0.2,"cMask": ["all"],"_data": {"extremes": {"normal": [1,0],"dist": -900,"canvas_rect": [-1133.7408,-508.92364800000007,12604.678272000001,12604.678272000001],"a": [-900,-508.92364800000007],"b": [-900,12604.678272000001]}}},{"normal": [-1,0],"dist": -900,"bCoef": 0.2,"cMask": ["all"],"_data": {"extremes": {"normal": [-1,0],"dist": -900,"canvas_rect": [-1133.7408,-508.92364800000007,12604.678272000001,12604.678272000001],"a": [900,-508.92364800000007],"b": [900,12604.678272000001]}}}],"traits": {"ballArea": {"vis": false,"bCoef": 1,"cMask": ["ball"]},"goalPost": {"radius": 8,"invMass": 0,"bCoef": 1},"goalNet": {"vis": true,"bCoef": 0.1,"cMask": ["all"]},"kickOffBarrier": {"vis": false,"bCoef": 0.1,"cGroup": ["redKO","blueKO"],"cMask": ["red","blue"]},"line": {"vis": true,"bCoef": 0,"cMask": [""]},"arco": {"radius": 2,"cMask": ["n/d"],"color": "cccccc"}},"playerPhysics": {"bCoef": 0,"acceleration": 0.11,"kickingAcceleration": 0.083,"kickStrength": 4.4},"ballPhysics": {"radius": 5.8,"bCoef": 0.412,"invMass": 1.5,"color": "BDFF80"},"joints": [{"d0": 1,"d1": 2,"strength": "rigid","color": "eb387a","length": null},{"d0": 3,"d1": 4,"strength": "rigid","color": "15bcd6","length": null}],"canBeStored": false,"redSpawnPoints": [[-400,0],[-400,50],[-400,-50],[-400,100],[-400,-100],[-400,380]],"blueSpawnPoints": [[400,0],[400,50],[400,-50],[400,100],[400,-100],[400,380]],"kickOffReset": "full"}';
const PENALTY_STADIUM = '{"name":"lỏ Stadium | PEN","width":420,"height":200,"spawnDistance":310,"bg":{"type":"grass","width":400,"height":260,"kickOffRadius":0,"cornerRadius":0,"color":"718B5B"},"vertexes":[{"x":323,"y":260,"bCoef":1,"cMask":["ball"],"trait":"ballArea","bias":-30},{"x":323,"y":100,"bCoef":1,"cMask":["ball"],"trait":"ballArea","bias":-30},{"x":323,"y":-100,"bCoef":1,"cMask":["ball"],"trait":"ballArea","bias":30},{"x":323,"y":-260,"bCoef":1,"cMask":["ball"],"trait":"ballArea","bias":30},{"x":370,"y":-100,"bCoef":0.1,"cMask":["ball"],"trait":"goalNet","radius":0},{"x":370,"y":100,"bCoef":0.1,"cMask":["ball"],"trait":"goalNet","radius":0},{"x":332,"y":-98,"bCoef":1,"cMask":["ball"],"trait":"line"},{"x":323,"y":260,"bCoef":0,"trait":"line"},{"x":323,"y":-260,"bCoef":0,"trait":"line"},{"x":0,"y":-260,"bCoef":0,"trait":"line"},{"x":0,"y":260,"bCoef":0,"trait":"line"},{"x":323,"y":200,"bCoef":0,"trait":"line"},{"x":110,"y":200,"bCoef":0,"trait":"line"},{"x":110,"y":-200,"bCoef":0,"trait":"line"},{"x":323,"y":-200,"bCoef":0,"trait":"line"},{"x":0,"y":100,"bCoef":0,"trait":"line"},{"x":0,"y":-100,"bCoef":0,"trait":"line"},{"x":110,"y":5,"bCoef":0,"trait":"line"},{"x":110,"y":-5,"bCoef":0,"trait":"line"},{"x":55,"y":-260,"bCoef":0,"cMask":["red"],"trait":"penArea"},{"x":65,"y":260,"bCoef":0,"cMask":["red"],"trait":"penArea"},{"x":300,"y":-90,"bCoef":0.1,"cMask":["red","blue"],"cGroup":["redKO","blueKO"],"trait":"kickOffBarrier"},{"x":365,"y":-90,"bCoef":0.1,"cMask":["red","blue"],"cGroup":["redKO","blueKO"],"trait":"kickOffBarrier"},{"x":365,"y":90,"bCoef":0.1,"cMask":["red","blue"],"cGroup":["redKO","blueKO"],"trait":"kickOffBarrier"},{"x":300,"y":90,"bCoef":0.1,"cMask":["red","blue"],"cGroup":["redKO","blueKO"],"trait":"kickOffBarrier"}],"segments":[{"v0":0,"v1":1,"trait":"ballArea"},{"v0":2,"v1":3,"trait":"ballArea"},{"v0":2,"v1":4,"vis":true,"color":"FFFFFF","cMask":["ball"],"trait":"goalNet","y":-100},{"v0":1,"v1":5,"vis":true,"color":"FFFFFF","cMask":["ball"],"trait":"goalNet","y":100},{"v0":1,"v1":0,"vis":true,"color":"FFFFFF","bCoef":1,"cMask":["ball"],"trait":"ballArea","bias":-30,"x":665},{"v0":2,"v1":3,"vis":true,"color":"FFFFFF","bCoef":1,"cMask":["ball"],"trait":"ballArea","bias":30,"x":665},{"v0":2,"v1":1,"curve":0,"vis":true,"color":"FFFFFF","bCoef":0,"trait":"line"},{"v0":10,"v1":7,"vis":true,"color":"FFFFFF","bCoef":0,"trait":"line"},{"v0":10,"v1":9,"vis":true,"color":"FFFFFF","bCoef":0,"trait":"line"},{"v0":9,"v1":8,"vis":true,"color":"FFFFFF","bCoef":0,"trait":"line"},{"v0":11,"v1":12,"vis":true,"color":"FFFFFF","bCoef":0,"trait":"line"},{"v0":12,"v1":13,"vis":true,"color":"FFFFFF","bCoef":0,"trait":"line"},{"v0":13,"v1":14,"vis":true,"color":"FFFFFF","bCoef":0,"trait":"line"},{"v0":15,"v1":16,"curve":150,"vis":true,"color":"FFFFFF","bCoef":0,"trait":"line"},{"v0":18,"v1":17,"curve":180,"vis":true,"color":"FFFFFF","bCoef":0,"trait":"line"},{"v0":17,"v1":18,"curve":180,"vis":true,"color":"FFFFFF","bCoef":0,"trait":"line"},{"v0":5,"v1":4,"vis":true,"color":"FFFFFF","cMask":["ball"],"trait":"goalNet"},{"v0":19,"v1":20,"curve":45,"vis":false,"bCoef":0,"cMask":["red"],"trait":"penArea"},{"v0":21,"v1":22,"vis":false,"color":"FFFFFF","bCoef":0.1,"cMask":["red","blue"],"cGroup":["redKO","blueKO"],"trait":"kickOffBarrier"},{"v0":22,"v1":23,"vis":false,"color":"FFFFFF","bCoef":0.1,"cMask":["red","blue"],"cGroup":["redKO","blueKO"],"trait":"kickOffBarrier"},{"v0":23,"v1":24,"vis":false,"color":"FFFFFF","bCoef":0.1,"cMask":["red","blue"],"cGroup":["redKO","blueKO"],"trait":"kickOffBarrier"},{"v0":24,"v1":21,"vis":false,"color":"FFFFFF","bCoef":0.1,"cMask":["red","blue"],"cGroup":["redKO","blueKO"],"trait":"kickOffBarrier"}],"goals":[{"p0":[332,100],"p1":[332,-100],"team":"blue"},{"p0":[325,-100],"p1":[100,0],"team":"red"},{"p0":[100,0],"p1":[320,100],"team":"red"}],"discs":[{"radius":5.75,"color":"FFDEAD","bCoef":0.4,"invMass":1.4,"pos":[110,0],"cGroup":["ball","kick","score"]},{"pos":[323,100],"trait":"goalPost"},{"pos":[323,-100],"trait":"goalPost"}],"planes":[{"normal":[0,1],"dist":-260,"bCoef":0.2,"cMask":["all"],"_data":{"extremes":{"normal":[0,1],"dist":-260,"canvas_rect":[-710,-260,710,260],"a":[-710,-260],"b":[710,-260]}}},{"normal":[0,-1],"dist":-260,"bCoef":0.2,"cMask":["all"],"_data":{"extremes":{"normal":[0,-1],"dist":-260,"canvas_rect":[-710,-260,710,260],"a":[-710,260],"b":[710,260]}}},{"normal":[1,0],"dist":-499,"bCoef":0.2,"cMask":["all"],"_data":{"extremes":{"normal":[1,0],"dist":-499,"canvas_rect":[-710,-260,710,260],"a":[-499,-260],"b":[-499,260]}}},{"normal":[-1,0],"dist":-376,"bCoef":0.2,"cMask":["all"],"_data":{"extremes":{"normal":[-1,0],"dist":-376,"canvas_rect":[-710,-260,710,260],"a":[376,-260],"b":[376,260]}}}],"traits":{"ballArea":{"vis":false,"bCoef":1,"cMask":["ball"]},"goalPost":{"radius":4.65,"invMass":0,"color":"C6D881","bCoef":1.25},"goalNet":{"vis":true,"bCoef":0.2,"cMask":["all"]},"kickOffBarrier":{"vis":false,"bCoef":0.1,"cGroup":["redKO","blueKO"],"cMask":["red","blue"]},"line":{"vis":true,"bCoef":0,"cMask":[""]},"arco":{"radius":2,"cMask":["n/d"],"color":"cccccc"},"penArea":{"vis":false,"bCoef":0,"cMask":["red"]}},"playerPhysics":{"radius":14.5,"acceleration":0.11,"kickingAcceleration":0.083,"kickStrength":4.655,"bCoef":0.25},"ballPhysics":"disc0","joints":[],"canBeStored":false,"redSpawnPoints":[[-100,0]],"blueSpawnPoints":[[323,0]],"kickOffReset":"full"}';
const DISCORD_LINK = process.env.DISCORD_LINK || "";
const COMMANDS_TO_VALIDATE = ["discord", "kickafk", "afk", "unmute", "clearmutes", "report"]; // These commands can cause spam in the chat or bypass the mute
const INVISIBLE_CHARACTERS = ["	", "ㅤ"];
var logMsg = "";

class Setting {
  constructor(setting) {
    this.msgColor = "normal";
    this.sizeAdjustment = 0;
    if (setting !== null) {
      Object.assign(this, setting);
    };
  };
};
class Kick {
  constructor(ballProperties, byPlayer) {
    this.properties = ballProperties;
    this.player = byPlayer;
    this.time = room.getScores() ? room.getScores().time : 0;

    let xOpponentGoal = (byPlayer.team == 1) ? stadium.goalLine.x : -stadium.goalLine.x; // The x position value of the opponent's goal
    this.isAShot = (
      Math.abs(ballProperties.xspeed) + Math.abs(ballProperties.yspeed) > 1.5 && // ✅ Bỏ qua nếu bóng gần đứng yên
      (xOpponentGoal * ballProperties.xspeed > 0) && // It's a kick toward the opponent goal
      (Math.abs(ballProperties.x + ballProperties.xspeed * 97.5) > stadium.goalLine.x) && // At this speed, the ball can cross the goal line
      (Math.abs(ballProperties.y + ballProperties.yspeed * (xOpponentGoal - ballProperties.x) / ballProperties.xspeed) < stadium.goalLine.y) // Check if it's on target (not really accurate because it might hit the post)
    );
  }
};
class PlayerReport {
  constructor(player) {
    this.name = "";
    this.goals = 0;
    this.assists = 0;
    this.ownGoals = 0;
    this.cleansheets = 0;
    this.wins = 0;
    this.games = 0;
    this.motms = 0;
    this.auth = null;
    if (player !== null) {
      Object.assign(this, player);
    };
  }
  getWinRate() {
    if (this.games == 0) return 0;
    return (this.wins / this.games * 100).toFixed(2);
  }
};
class PlayerStats {
  constructor(name) {
    this.name = name;
    this.goals = 0;
    this.assists = 0;
    this.ownGoals = 0;
    this.touches = 0;
    this.passes = 0;
    this.shotsOnTarget = 0;
    this.stoppedShots = 0;
    this.errorsLeadingToGoal = 0;
    this.attemptsLeadingToOG = 0;
    this.penaltiesScored = 0;
    this.penaltiesMissed = 0;
    this.meanPosition = 0;
    this.positionSum = 0;
    this.positionTicks = 0;
  }
  getPoints() {
    let points = 0;
    for (const [statName, value] of Object.entries(this)) {
      if (PLAYER_SCORING_RULES[statName] === undefined) continue;
      points += PLAYER_SCORING_RULES[statName] * value;
    };
    return points; // 🎯 Trả về điểm nguyên bản, không cộng thêm Bonus nữa
  }
};
class TeamStats {
  constructor() {
    this.substitutions = 0;
    this.possession = 0;
    this.players = {};
  }
  resetStats() {
    this.substitutions = 0;
    this.possession = 0;
    for (const playerId in this.players) {
      delete this.players[playerId];
    };
  }
};
class Penalty {
  constructor() {
    this.groups = [[], []]; // Penalty takers
    this.results = [[], []]; // Results of taken penalties (first for RED, second for BLUE)
  }
  getTurn() {
    return this.results[0].length - this.results[1].length;
  }
  // Returns the team that wins the penalty shootout
  getPenaltyWinner() {
    if (this.results[0].length > 5) { // "Sudden Death" round
      if (this.results[0].length != this.results[1].length) return null;
      if (this.results[0].at(-1) == this.results[1].at(-1)) return null;
      return this.results[0].at(-1) ? 1 : 2;
    };

    // One team has more penalties scored than the other team even if the other team scores all the remaining penalties
    if (this.results[0].filter(result => result).length > 5 - this.results[1].filter(result => !result).length) {
      return 1;
    } else if (this.results[1].filter(result => result).length > 5 - this.results[0].filter(result => !result).length) {
      return 2;
    };
    return null;
  }
  getPenaltyTakers() {
    let turn = this.getTurn();
    return [this.groups[turn].at(this.results[1].length % this.groups[turn].length), this.groups[turn ^ 1].at(-1)];
  }
  push(result) {
    this.results[this.getTurn()].push(result);
  }
  clear() {
    this.groups = [[], []];
    this.results = [[], []];
  }
};
class Game {
  constructor() {
    this.teams = {
      1: new TeamStats(),
      2: new TeamStats(),
    };
    this.penalty = new Penalty();
    this.ballRecords = [null, null, null];
  }

  getStats() {
    let stats = {
      possession: [50, 50],
      passes: [0, 0],
      shotsOnTarget: [0, 0],
    };

    // Đã sửa: Dùng 'this' thay vì 'game' để code linh hoạt và chuẩn OOP
    if (this.teams[1].possession + this.teams[2].possession != 0) {
      stats.possession[0] = ~~(this.teams[1].possession / (this.teams[1].possession + this.teams[2].possession) * 100);
      stats.possession[1] = 100 - stats.possession[0];
    };

    for (let i = 0; i < 2; i++) {
      for (const player of Object.values(this.teams[i + 1].players)) {
        stats.passes[i] += player.passes;
        stats.shotsOnTarget[i] += player.shotsOnTarget;
      };
    };

    return stats;
  }

  resetBallRecords() {
    this.ballRecords = [null, null, null];
  }

  reset() {
    this.resetBallRecords();
    this.penalty.clear();
    this.teams[1].resetStats();
    this.teams[2].resetStats();

    // Đã sửa: Trả bets về dạng Object thay vì Array để đồng bộ toàn hệ thống
    bets = [];

    // Fallback an toàn (tránh lỗi nếu oddsUpdateInterval chưa được khai báo)
    if (typeof oddsUpdateInterval !== "undefined" && oddsUpdateInterval) {
      clearInterval(oddsUpdateInterval);
    }
  }
};
class BallColor {
  constructor() {
    this.index = 0;
  }
  getColor() {
    this.index++;
    return BALL_COLORS[this.index % BALL_COLORS.length];
  }
}
class Surrender {
  constructor() {
    this.votes = [new Set, new Set];
  }
  surrender(teamId) {
    isPlaying = false;
    let scores = room.getScores();
    prevScore = `${scores.red}-${scores.blue}`;
    surrenderedTeam = teamId; // LƯU LẠI ID CỦA ĐỘI VỪA ĐẦU HÀNG
    handlePostGame(getOppositeTeamId(teamId));
    room.stopGame();
    room.sendAnnouncement(`🏴 Đội ${TEAM_NAMES[teamId]} đã xin chui háng`, null, 0x00FFFF, "small-italic", 0)
  }
  vote(player) {
    if (player.team == 0) return;
    if (isCaptain(player.id)) {
      this.surrender(player.team); // Captains can surrender anytime
      return;
    }

    this.votes[player.team - 1].add(player.id);
    let count = 0;
    for (const voterId of this.votes[player.team - 1]) {
      let voter = room.getPlayer(voterId);
      if (voter && (voter.team == player.team)) count++;
    };
    room.sendAnnouncement(`${player.name} đã bỏ phiếu chui háng cho ${TEAM_NAMES[player.team]} (${count}/${MIN_VOTES_FOR_SURRENDER})`, null, GREEN, "small", 0);

    if (count >= MIN_VOTES_FOR_SURRENDER) this.surrender(player.team);
  }
  hasVoted(player) {
    if (player.team == 0) return false;
    return this.votes[player.team - 1].has(player.id);
  }
  reset() {
    this.votes.every((votes) => votes.clear());
  }
}

var commands = { // Format: "alias: [function, availableModes, minimumRole, captainOnly]"
  help: [helpFunc, ["rand", "pick"], ROLE.PLAYER, false],
  discord: [discordFunc, ["rand", "pick"], ROLE.PLAYER, false],
  bye: [byeFunc, ["rand", "pick"], ROLE.PLAYER, false],
  stat: [showStatsFunc, ["rand", "pick"], ROLE.PLAYER, false],
  rank: [showRankingsFunc, ["rand", "pick"], ROLE.PLAYER, false],
  top: [checkTopFunc, ["rand", "pick"], ROLE.PLAYER, false],
  kickafk: [kickAfkFunc, ["rand", "pick"], ROLE.PLAYER, false],
  spec: [specFunc, ["rand", "pick"], ROLE.PLAYER, false],
  login: [loginFunc, ["rand", "pick"], ROLE.PLAYER, false],
  afk: [afkFunc, ["rand", "pick"], ROLE.PLAYER, false],
  afks: [showAfksFunc, ["rand", "pick"], ROLE.PLAYER, false],
  predict: [predictFunc, ["rand", "pick"], ROLE.PLAYER, false],

  //msgcolor: [setMsgColorFunc, ["rand", "pick"], ROLE.PLAYER, false],
  adjustsize: [adjustSizeFunc, ["rand", "pick"], ROLE.PLAYER, false],
  yellow: [yellowCardFunc, ["rand", "pick"], ROLE.ADMIN, false],
  clearyellow: [clearYellowCardFunc, ["rand", "pick"], ROLE.ADMIN, false],
  mute: [muteFunc, ["rand", "pick"], ROLE.ADMIN, false],
  unmute: [unmuteFunc, ["rand", "pick"], ROLE.ADMIN, false],
  clearmutes: [clearMutesFunc, ["rand", "pick"], ROLE.ADMIN, false],
  ban: [banFunc, ["rand", "pick"], ROLE.ADMIN, false],
  bans: [showBansFunc, ["rand", "pick"], ROLE.ADMIN, false],
  unban: [unbanFunc, ["rand", "pick"], ROLE.ADMIN, false],
  clearbans: [clearBansFunc, ["rand", "pick"], ROLE.ADMIN, false],
  lock: [lockFunc, ["rand", "pick"], ROLE.ADMIN, false],
  unlock: [unlockFunc, ["rand", "pick"], ROLE.ADMIN, false],
  seteffect: [setEffectFunc, ["rand", "pick"], ROLE.PLAYER, false],
  effects: [listEffectsFunc, ["rand", "pick"], ROLE.PLAYER, false],
  report: [reportFunc, ["rand", "pick"], ROLE.PLAYER, false], // Lệnh báo cáo lỗi room
  money: [moneyFunc, ["rand", "pick"], ROLE.PLAYER, false],
  coins: [moneyFunc, ["rand", "pick"], ROLE.PLAYER, false], // alias
  gems: [moneyFunc, ["rand", "pick"], ROLE.PLAYER, false], // THÊM DÒNG NÀY ĐỂ SOI GEMS
  pay: [safeTradeFunc, ["rand", "pick"], ROLE.PLAYER, false],
  bank: [safeTradeFunc, ["rand", "pick"], ROLE.PLAYER, false],
  chuyentien: [safeTradeFunc, ["rand", "pick"], ROLE.PLAYER, false],
  shop: [shopFunc, ["rand", "pick"], ROLE.PLAYER, false],
  buy: [buyFunc, ["rand", "pick"], ROLE.PLAYER, false],
  role: [roleFunc, ["rand", "pick"], ROLE.PLAYER, false],
  bet: [betFunc, ["rand", "pick"], ROLE.PLAYER, false],
  title: [titleFunc, ["rand", "pick"], ROLE.PLAYER, false],
  buffcoins: [buffCoinsFunc, ["rand", "pick"], ROLE.ADMIN, false],
  buffgems: [buffGemsFunc, ["rand", "pick"], ROLE.ADMIN, false],
  topcoins: [topCoinsFunc, ["rand", "pick"], ROLE.PLAYER, false],
  rich: [topCoinsFunc, ["rand", "pick"], ROLE.PLAYER, false],
  huongdan: [huongDanFunc, ["rand", "pick"], ROLE.PLAYER, false],
  whisper: [whisperFunc, ["rand", "pick"], ROLE.PLAYER, false],
  megaphone: [megaphoneFunc, ["rand", "pick"], ROLE.PLAYER, false],
  bomb: [bombFunc, ["rand", "pick"], ROLE.PLAYER, false],
  use: [useFunc, ["rand", "pick"], ROLE.PLAYER, false],
  equip: [useFunc, ["rand", "pick"], ROLE.PLAYER, false],
  spin: [spinFunc, ["rand", "pick"], ROLE.PLAYER, false],
  slot: [slotFunc, ["rand", "pick"], ROLE.PLAYER, false],
  bounty: [bountyFunc, ["rand", "pick"], ROLE.PLAYER, false],
  unbet: [unbetFunc, ["rand", "pick"], ROLE.PLAYER, false],
  huybet: [unbetFunc, ["rand", "pick"], ROLE.PLAYER, false],
  buyvip: [buyVipFunc, ["rand", "pick"], ROLE.PLAYER, false],
  daily: [dailyFunc, ["rand", "pick"], ROLE.PLAYER, false],
  ve: [buyTicketFunc, ["rand", "pick"], ROLE.PLAYER, false],
  doigems: [exchangeGemsFunc, ["rand", "pick"], ROLE.PLAYER, false],
  vipforever: [setVipPermanentFunc, ["rand", "pick"], ROLE.PLAYER, false],
  naptien: [napTienFunc, ["rand", "pick"], ROLE.PLAYER, false],
  cf: [coinflipFunc, ["rand", "pick"], ROLE.PLAYER, false],
  kbb: [kbbFunc, ["rand", "pick"], ROLE.PLAYER, false],
  cauca: [cauCaFunc, ["rand", "pick"], ROLE.PLAYER, false],
  fun: [funMenuFunc, ["rand", "pick"], ROLE.PLAYER, false],
  games: [funMenuFunc, ["rand", "pick"], ROLE.PLAYER, false],
  menu: [menuFunc, ["rand", "pick"], ROLE.PLAYER, false],
  jackpot: [checkJackpotFunc, ["rand", "pick"], ROLE.PLAYER, false],
  hu: [checkJackpotFunc, ["rand", "pick"], ROLE.PLAYER, false],
  thachdau: [thachDauFunc, ["rand", "pick"], ROLE.PLAYER, false],
  solo: [thachDauFunc, ["rand", "pick"], ROLE.PLAYER, false],
  chapnhan: [chapNhanFunc, ["rand", "pick"], ROLE.PLAYER, false],
  nemca: [(val, p) => trollFunc(val, p, "nemca"), ["rand", "pick"], ROLE.PLAYER, false],
tanghoa: [(val, p) => trollFunc(val, p, "tanghoa"), ["rand", "pick"], ROLE.PLAYER, false],

};
var identities = {}; // Store connection string/public IDs of players
var adminAuths = new Set(); // Remember admin's auth for auto-login
var afkList = new Set([0]); // Host player is always in AFK mode
var muteList = new Set();
var banList = [];
var isPlaying = false;
var isGameOver = false;
var isGoalCelebration = false;
var isArrangingTeams = false;
var isTakingPenalty = false;
var postGameHandled = false;
var isChatLocked = false;
var canPause = false;
var winningStreak = 0;
var prevWinner = 1;
var pausedBy = 0;
var kits = { red: null, blue: null };
var prevScore = null;
var predictions = {};
var warnings = {};
var lastMessages = []; // The last 4 messages in the form of [message, playerId, sendingTime]
var game = new Game;
var surrenderVoter = new Surrender;
var stadium = { // Stadium attributes
  goalLine: { x: 0, y: 0 },
  ballRadius: 0,
  playerRadius: 0,
};
var timeouts = {
  toResume: null,
  toTakePenalty: null,
  toAct: {},
  toQuitAfk: {},
};
var quotes = [];
var currentStadium = null;
var ballColor = new BallColor();

var room = HBInit({
  roomName: ROOM_NAME,
  maxPlayers: 30,
  playerName: "BLV Niko Bellic",
  public: PUBLIC,
  geo: { "code": "VN", "lat": 21.0285, "lon": 105.8542 },
  token: HAXBALL_TOKEN || (typeof process !== "undefined" && process.env && process.env.HAXBALL_TOKEN) || (typeof window !== "undefined" && window.HAXBALL_TOKEN ? window.HAXBALL_TOKEN : "")
});

room.onRoomLink = function(url) {
  console.log("\n==========================================");
  console.log("⚽ LINK PHÒNG CỦA BẠN: " + url);
  console.log("==========================================\n");
};

const MAX_CB_PLAYERS = 4; // Tối đa 4 người được lui về thủ
let lastDisc2Y = null;
let lastDisc4Y = null;

function checkCbLimit() {
  // Chỉ hoạt động khi trận đấu đang diễn ra
  if (typeof isPlaying !== 'undefined' && !isPlaying || MAX_CB_PLAYERS == 0) return;

  let redPlayers = room.getPlayerList().filter((player) => player.team == 1);
  let bluePlayers = room.getPlayerList().filter((player) => player.team == 2);
  if (redPlayers.length < 4 || bluePlayers.length < 4) return;

  const disc1 = room.getDiscProperties(1);
  const disc3 = room.getDiscProperties(3);
  if (!disc1 || !disc3) return;

  const redLimitX = disc1.x;
  const blueLimitX = disc3.x;

  let players = room.getPlayerList().filter((player) => player.team != 0);
  let redCount = 0, blueCount = 0;

  // TẠO CACHE: Lưu trước kích thước/thuộc tính của toàn bộ cầu thủ để tránh lag
  let pProps = {};
  players.forEach(p => {
    let props = room.getPlayerDiscProperties(p.id);
    if (props) pProps[p.id] = props;
  });

  // Đếm số người dùng size thực tế (radius)
  players.forEach(function (player) {
    let props = pProps[player.id];
    if (!props) return;
    let radius = props.radius; // Tự động lấy kích thước to/nhỏ của cầu thủ

    if (player.team == 1) {
      if (player.position && player.position.x - radius <= redLimitX - 0.1) ++redCount;
    } else if (player.team == 2) {
      if (player.position && player.position.x + radius >= blueLimitX + 0.1) ++blueCount;
    }
  });

  // Áp dụng cGroup cho Đội Đỏ
  players.forEach(function (player) {
    if (player.team == 2) return;
    let currentProps = pProps[player.id];
    if (!currentProps) return;
    let radius = currentProps.radius;

    let targetGroup = (redCount >= MAX_CB_PLAYERS && player.position && player.position.x - radius > redLimitX - 0.1) ? 536870914 : 2;
    if (currentProps.cGroup !== targetGroup) {
      room.setPlayerDiscProperties(player.id, { cGroup: targetGroup });
    }
  });

  // Đẩy khớp nối tường Đội Đỏ (Disc 2)
  if (redCount >= MAX_CB_PLAYERS) {
    if (room.getDiscProperties(2) && room.getDiscProperties(2).y != 350) room.setDiscProperties(2, { y: 350 });
  } else {
    if (room.getDiscProperties(2) && room.getDiscProperties(2).y != -350) room.setDiscProperties(2, { y: -350 });
  }

  // Áp dụng cGroup cho Đội Xanh
  players.forEach(function (player) {
    if (player.team == 1) return;
    let currentProps = pProps[player.id];
    if (!currentProps) return;
    let radius = currentProps.radius;

    let targetGroup = (blueCount >= MAX_CB_PLAYERS && player.position && player.position.x + radius < blueLimitX + 0.1) ? 1073741828 : 4;
    if (currentProps.cGroup !== targetGroup) {
      room.setPlayerDiscProperties(player.id, { cGroup: targetGroup });
    }
  });

  // Đẩy khớp nối tường Đội Xanh (Disc 4)
  if (blueCount >= MAX_CB_PLAYERS) {
    if (room.getDiscProperties(4) && room.getDiscProperties(4).y != 350) room.setDiscProperties(4, { y: 350 });
  } else {
    if (room.getDiscProperties(4) && room.getDiscProperties(4).y != -350) room.setDiscProperties(4, { y: -350 });
  }
}


let tickCounter = 0;

room.onGameTick = function () {
  if (!isPlaying) return;

  tickCounter++;
  if (tickCounter >= 60) tickCounter = 0;

  // CHỐNG BÓNG VĂNG KHỎI MAP 5V5 (Chạy 5 tick/lần (~12 FPS) để tối ưu CPU & Gói tin)
  if (tickCounter % 5 === 0 && !isGoalCelebration && typeof stadium !== "undefined" && stadium.name && stadium.name.includes("5v5")) {
    let ballDisc = room.getDiscProperties(0);
    if (ballDisc && stadium.width && stadium.height) {
      if (Math.abs(ballDisc.x) > stadium.width + 30 || Math.abs(ballDisc.y) > stadium.height + 30) {
        room.setDiscProperties(0, { x: 0, y: 0 });
        room.sendAnnouncement("⚠️ BÓNG ĐÃ BAY RA KHỎI SÂN! Tự động trả bóng về giữa sân.", null, 0xFFFF00, "bold", 1);
      }
    }
  }

  // HỆ THỐNG ANTI-CB (Chạy 6 tick/lần (~10 FPS) để giảm 83% gói tin & IPC API)
  if (tickCounter % 6 === 0 && typeof checkCbLimit === "function") {
    checkCbLimit();
  }

  // CẬP NHẬT ANTI-GHOST & CHỐNG KICK OAN AFK (Chạy đúng 1 lần/giây)
  if (tickCounter === 0) {
    // 🛡️ LỆNH MIỄN TỬ: Liên tục xóa án tích AFK nếu đang đá 1v1 hoặc Training
    if (stadium && stadium.name && (stadium.name.includes("1v1") || stadium.name.includes("training"))) {
      if (typeof clearAfkRecords === "function") clearAfkRecords();
    }

    let players = room.getPlayerList();
    for (let i = 0; i < players.length; i++) {
      let p = players[i];
      if (p.team === 0) continue;

      let props = room.getPlayerDiscProperties(p.id);

      // 🛡️ ANTI-GHOST: Chỉ đảm bảo cMask luôn có bit 1 (chạm được Bóng)
      if (props && (props.cMask & 1) === 0) {
        room.setPlayerDiscProperties(p.id, {
          cMask: props.cMask | 1
        });
      }
    }
  }
};


var surrenderedTeam = 0; // Biến lưu vết đội nào đã đầu hàng

var bets = [];
var betOdds = { winner: { red: 1.5, blue: 1.5 }, taixiu: { tai: 1.8, xiu: 1.8 }, keochap: { red: 1.5, blue: 1.5 }, btts: { yes: 1.8, no: 1.8 }, tiso: {}, scorer: {}, motm: {} };
const BET_MARGIN = 0.92;
const MIN_BET = 100;
const MAX_BET = 5000;
const ODDS_UPDATE_INTERVAL = 10 * 1000;
let oddsUpdateInterval = null;
let currentHandicap = { team: "draw", value: 0 }; // Lưu trữ kèo chấp của ván hiện tại
let isBettingClosedEarly = false;
let rungBets = []; // Lưu các vé cược Rung
let activeBounties = {}; // Lưu trữ: { "auth_nguoi_bi_truy_na": { name: "Tên", amount: 10000 } }

// Biến lưu trữ kèo gạ 1v1
let pendingDuels = {}; // Lưu lời mời đang chờ
let activeDuels = [];  // Lưu kèo đã chốt chờ kết quả cuối trận


let playerCards = {};
var activeSpeedBuffs = {};
var giantExpirations = {};
var invisExpirations = {};
var xoacExpirations = {};
var exhaustedPlayers = {};
var injuredPlayers = {};
var silencedPlayers = {};
var lastPlayerDirection = {};
var invisUsesThisMatch = 0;


// --- HÀM HỖ TRỢ CẬP NHẬT NGOẠI HÌNH CẦU THỦ DỰA TRÊN CÁC HIỆU ỨNG ĐANG ACTIVE ---
const updatePlayerAppearance = (id) => {
  id = parseInt(id, 10);
  if (!room.getPlayer(id)) return;

  let hasRedCard = playerCards[id] === 2;
  let hasYellowCard = playerCards[id] === 1;

  let updateObj = {};
  let newAvatar = null;

  let baseRadius = (typeof stadium !== "undefined" && stadium.playerRadius) ? stadium.playerRadius : 15;
  let vipAdjustment = 0;
  if (typeof getSetting === "function") {
    let setting = getSetting(id);
    if (setting && setting.sizeAdjustment) vipAdjustment = +setting.sizeAdjustment;
  }
  let defaultRadius = baseRadius + vipAdjustment;

  updateObj.radius = defaultRadius;
  updateObj.invMass = 0.5;

  let pDisc = room.getPlayerDiscProperties(id);
  if (pDisc && pDisc.color === 0x718C5A) {
    updateObj.color = null;
  }

  // Set avatar cho người bị dính thẻ phạt
  if (hasRedCard) newAvatar = "🟥";
  else if (hasYellowCard) newAvatar = "🟨";

  room.setPlayerDiscProperties(id, updateObj);
  room.setPlayerAvatar(id, newAvatar);
};



let lastMatchAuths = new Set();

var gkCleanStreak = {};

// ==========================================================
// 🎯 MÁY QUÉT TÌM THỦ MÔN SIÊU NHẸ (1 GIÂY QUÉT 1 LẦN)
// ==========================================================
setInterval(() => {
  // Chỉ quét khi bóng đang lăn
  if (!isPlaying) return;

  let players = room.getPlayerList();
  for (let i = 0; i < players.length; i++) {
    let p = players[i];

    // Bỏ qua khán giả hoặc người chưa load xong nhân vật
    if (p.team === 0 || !p.position) continue;

    let pStats = getGameStats(p);

    // Lấy mẫu tọa độ X cộng dồn lại để cuối trận tính trung bình
    pStats.positionSum = (pStats.positionSum || 0) + p.position.x;
    pStats.positionTicks = (pStats.positionTicks || 0) + 1;
    pStats.meanPosition = pStats.positionSum / pStats.positionTicks;
  }
}, 1000); // 1000 mili-giây = 1 giây quét 1 lần
function getVotesNeeded() {
  if (!stadium || !stadium.name) return 6; // Đề phòng lỗi chưa tải map
  if (stadium.name.includes("1v1")) return 2;
  if (stadium.name.includes("3v3")) return 3;
  return 6; // Các map còn lại (5v5...)
}

function setEffectFunc(value, player) {
  let auth = getAuth(player.id);
  if (!auth) return false;

  const data = getPlayerData(auth);
  const ownedEffects = data.ownedEffects || [];

  if (value.toLowerCase() === "random") {
    if (!ownedEffects.includes(-1)) {
      room.sendAnnouncement("Bạn chưa mua gói Random. Dùng !shop để xem và !buy effect random để mua.", player.id, RED);
      return false;
    }

    // Đang dùng mà nhập lại thì tắt
    if (data.activeEffect === -1) {
      data.activeEffect = null;
    savePlayerData(auth, data);
    room.sendAnnouncement("Đã gỡ bỏ hiệu ứng ngẫu nhiên (Random). Trở về mặc định.", player.id, YELLOW, "bold", 0);
      return false;
    }

    data.activeEffect = -1;
    savePlayerData(auth, data);
    room.sendAnnouncement("Đã kích hoạt hiệu ứng ngẫu nhiên (Random). Mỗi bàn thắng sẽ có hiệu ứng khác nhau!", player.id, GREEN, "bold", 0);
    return false;
  }

  if (!/^[0-9]+$/.test(value)) {
    room.sendAnnouncement("Sử dụng: !seteffect <số> hoặc !seteffect random. Dùng !effects để xem danh sách hiệu ứng đã sở hữu.", player.id, RED);
    return false;
  }

  let effectId = parseInt(value, 10);
  if (effectId >= 0 && effectId <= 14) {
    if (!ownedEffects.includes(effectId)) {
      room.sendAnnouncement(`Bạn chưa mua hiệu ứng [${effectId}] ${EFFECT_NAMES[effectId]}. Dùng !buy effect ${effectId} để mua.`, player.id, RED);
      return false;
    }

    // Đang dùng mà nhập lại thì tắt
    if (data.activeEffect === effectId) {
      data.activeEffect = null;
      savePlayerData(auth, data);
      room.sendAnnouncement(`Đã gỡ bỏ hiệu ứng [${effectId}] ${EFFECT_NAMES[effectId]}. Trở về mặc định.`, player.id, YELLOW, "bold", 2);
      return false;
    }

    data.activeEffect = effectId;
    savePlayerData(auth, data);
    room.sendAnnouncement(`Đã kích hoạt hiệu ứng [${effectId}] ${EFFECT_NAMES[effectId]}!`, player.id, GREEN, "bold", 2);
    return false;
  }

  room.sendAnnouncement("Sử dụng: !seteffect <số> hoặc !seteffect random. Dùng !effects để xem danh sách hiệu ứng đã sở hữu.", player.id, RED);
  return false;
}
function moneyFunc(value, player) {
  // 1. NẾU CÓ NHẬP TÊN NGƯỜI KHÁC ĐỂ SOI VÍ
  if (value && value.trim() !== "") {
    let targetName = value.trim();
    if (targetName.startsWith("@")) targetName = targetName.substring(1);
    targetName = targetName.replace(/_/g, " ");

    let targetPlayer = room.getPlayerList().find(p => p.id !== 0 && p.name.toLowerCase() === targetName.toLowerCase());
    if (!targetPlayer) targetPlayer = room.getPlayerList().find(p => p.id !== 0 && p.name.toLowerCase().includes(targetName.toLowerCase()));

    if (!targetPlayer) {
      room.sendAnnouncement(`❌ Không tìm thấy người chơi "${value}" trong phòng.`, player.id, 0xFF4444, "bold", 1);
      return false;
    }

    const targetAuth = getAuth(targetPlayer.id);
    if (!targetAuth) return false;
    const targetData = getPlayerData(targetAuth);

    let vipStatus = targetData.vipExpiry && Date.now() < targetData.vipExpiry ? "👑 VIP" : "Dân thường";
    room.sendAnnouncement(`👀 [SOI VÍ] ${targetPlayer.name} (LV${targetData.level || 1} | ${vipStatus}) đang có: ${targetData.coins} 🪙 | ${targetData.gems} 💎.`, player.id, 0x00FFFF, "bold", 1);
    return false;
  }

  // 2. XEM TÀI SẢN CỦA BẢN THÂN
  const auth = getAuth(player.id);
  if (!auth) return false;
  const data = getPlayerData(auth);

  let vipStatus = "❌ Chưa kích hoạt";
  if (data.vipExpiry && Date.now() < data.vipExpiry) {
    let daysLeft = Math.ceil((data.vipExpiry - Date.now()) / (1000 * 60 * 60 * 24));
    vipStatus = `👑 ĐANG KÍCH HOẠT (Còn ${daysLeft} ngày)`;
  }

  let reqXp = 300;
  room.sendAnnouncement(
    `💰 TÀI SẢN CỦA [${player.name}]:\n` +
    `📈 Cấp độ: LV${data.level || 1} (Kinh nghiệm: ${Math.floor(data.xp || 0)}/${reqXp})\n` +
    `🪙 Coins: ${data.coins.toLocaleString()} 🪙\n` +
    `💎 Gems: ${data.gems.toLocaleString()} 💎\n` +
    `🎫 Thẻ VIP Tháng: ${vipStatus}`,
    player.id, 0xFFD700, "bold", 2
  );
  return false;
}
let cachedTopList = null;
let lastTopListUpdate = 0;

function updateTopCoinsCache() {
  let list = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith("pd_")) continue;
    const auth = key.slice(3);
    if (auth.length !== 43) continue;
    try {
      const data = getPlayerData(auth);
      const coins = data.coins || 0;
      const gems = data.gems || 0;
      const stats = getStats(auth);
      const name = stats.name || auth.substring(0, 8) + ".";
      list.push({ auth, name, coins, gems });
    } catch (e) { }
  }

  list.sort((a, b) => b.coins - a.coins);
  cachedTopList = list.slice(0, 10);
  lastTopListUpdate = Date.now();
}

function topCoinsFunc(value, player) {
  if (!cachedTopList || Date.now() - lastTopListUpdate > 5 * 60 * 1000) {
    updateTopCoinsCache();
  }

  if (!cachedTopList || cachedTopList.length === 0) {
    room.sendAnnouncement("Chưa có dữ liệu coins nào.", player.id, 0xFF0000);
    return false;
  }

  room.sendAnnouncement("==== TOP 10 ĐẠI GIA HAXBALL ====", player.id, 0xFFD700, "bold", 1);
  cachedTopList.forEach((item, index) => {
    room.sendAnnouncement(`${index + 1}. ${item.name} - ${item.coins.toLocaleString()} 🪙 | ${item.gems.toLocaleString()} 💎`, player.id, 0xFFFFFF);
  });
  return false;
}



function shopFunc(value, player) {
  const auth = getAuth(player.id);
  if (!auth) return false;
  const data = getPlayerData(auth);

  // Nếu không có tham số -> hiển thị menu danh mục
  if (!value || !value.trim()) {
    room.sendAnnouncement("📋 DANH MỤC SHOP", player.id, 0xFFD700, "bold", 0);
    room.sendAnnouncement(
      "👑 !shop roles - Xem các màu Role VIP\n" +
      "🎨 !shop effects - Xem hiệu ứng ghi bàn\n" +
      "🎁 !shop lootbox - Xem Loot Box (Túi Mù)\n" +
      "⚡ !shop features - Xem tính năng đặc biệt\n" +
      "🧸 !shop chattoys - Xem chat toys\n" +
      "🏅 !shop titles - Xem danh hiệu",
      player.id, 0x00FFFF, "small", 0
    );
    return false;
  }

  // Xử lý tham số: chuyển về chữ thường, bỏ khoảng trắng thừa
  const category = value.trim().toLowerCase();

  // Ánh xạ alias về tên danh mục chuẩn
  let type = null;
  if (category === "roles" || category === "role") type = "role";
  else if (category === "effects" || category === "effect") type = "effect";
  else if (category === "lootbox" || category === "lootboxes") type = "lootbox";
  else if (category === "features" || category === "feature") type = "feature";
  else if (category === "chattoys" || category === "chat_toy" || category === "chattoy") type = "chat_toy";
  else if (category === "titles" || category === "title") type = "title";
  else {
    room.sendAnnouncement("Danh mục không tồn tại. Gõ !shop để xem danh sách danh mục.", player.id, RED);
    return false;
  }

  // === XỬ LÝ ĐẶC BIỆT CHO EFFECTS (vì không có trong SHOP_ITEMS, bán hoàn toàn bằng Coins) ===
  if (type === "effect") {
    room.sendAnnouncement("🎨 Effects (Hiệu Ứng Ghi Bàn)", player.id, 0xFFD700, "bold", 0);
    for (let idx = 0; idx < EFFECT_NAMES.length; idx++) {
      const name = EFFECT_NAMES[idx];
      const owned = data.ownedEffects.includes(idx);
      const active = data.activeEffect === idx;
      let status = active ? "[Đang dùng]" : (owned ? "[Đã sở hữu]" : `${EFFECT_PRICES[idx]} 💎`);
      room.sendAnnouncement(`🎨 [${idx}] ${name} - ${status}`, player.id, 0x00FF00, "small", 0);
    }
    const hasRandom = data.ownedEffects.includes(-1);
    const activeRandom = data.activeEffect === -1;
    let randomStatus = activeRandom ? "[Đang dùng]" : (hasRandom ? "[Đã sở hữu]" : `${RANDOM_PACK_PRICE} 💎`);
    room.sendAnnouncement(`🎲 [Random] Ngẫu nhiên - ${randomStatus}`, player.id, 0x00FF00, "small", 0);

    room.sendAnnouncement("👉 Dùng !buy effect <số> để mua, !buy effect random để mua gói Random, !seteffect <số> để chọn.", player.id, 0xAAAAAA, "small-italic", 0);
    return false;
  }

  // Lọc item từ SHOP_ITEMS cho các loại còn lại
  const items = SHOP_ITEMS.filter(i => i.type === type);
  if (items.length === 0) {
    room.sendAnnouncement("Danh mục này hiện chưa có vật phẩm nào.", player.id, YELLOW);
    return false;
  }

  // Tiêu đề danh mục
  const titles = {
    "role": "👑 Roles (Màu VIP)",
    "effect": "🎨 Effects (Hiệu Ứng Ghi Bàn)",
    "lootbox": "🎁 Loot Box (Túi Mù)",
    "feature": "⚡ Features (Tính Năng)",
    "chat_toy": "🧸 Chat Toys (Đồ Chơi Chat)",
    "title": "🏅 Titles (Danh Hiệu)"
  };
  room.sendAnnouncement(titles[type], player.id, 0xFFD700, "bold", 0);

  // Hiển thị từng item tùy theo loại (Có tích hợp check Coins/Gems)
  if (type === "role") {
    for (const item of items) {
      const curIcon = item.currency === "gems" ? "💎" : "🪙"; // Lấy đúng Icon
      const owned = data.ownedRoles.includes(item.id);
      const active = data.activeRole === item.id;
      let status = active ? "[Đang dùng]" : (owned ? "[Đã sở hữu]" : `${item.price} ${curIcon}`);
      room.sendAnnouncement(`👑 ${item.name} [${item.id}] - ${status}`, player.id, item.color, "small", 0);
    }
  }
  else if (type === "lootbox") {
    for (const item of items) {
      const curIcon = item.currency === "gems" ? "💎" : "🪙";
      room.sendAnnouncement(`🎁 ${item.name} [${item.id}] - ${item.price} ${curIcon}`, player.id, 0xAA44FF, "small", 0);
    }
  }
  else if (type === "feature") {
    for (const item of items) {
      const curIcon = item.currency === "gems" ? "💎" : "🪙";
      let owned = false;
      if (item.uses > 0) {
        owned = (item.feature === "doublecoins") ? (data.doubleCoinsLeft > 0) : (item.feature === "starterboost" ? (data.starterboostUses > 0) : false);
      } else {
        owned = data.features[item.feature];
      }
      let status = owned ? "[Đã sở hữu]" : `${item.price} ${curIcon}`;
      room.sendAnnouncement(`⚡ ${item.name} [${item.id}] - ${status}`, player.id, 0xFF8800, "small", 0);
    }
  }
  else if (type === "chat_toy") {
    for (const item of items) {
      const curIcon = item.currency === "gems" ? "💎" : "🪙";
      let ownedCount = data.chatToys[item.id] || 0;
      let status = ownedCount > 0 ? `(có ${ownedCount})` : `${item.price} ${curIcon}`;
      room.sendAnnouncement(`${item.name} [${item.id}] - ${status}`, player.id, item.color, "small", 0);
    }
  }
  else if (type === "title") {
    for (const item of items) {
      const curIcon = item.currency === "gems" ? "💎" : "🪙";
      const owned = data.ownedTitles.includes(item.id);
      const active = data.activeTitle === item.id;
      let status = active ? "[Đang dùng]" : (owned ? "[Đã sở hữu]" : `${item.price} ${curIcon}`);
      room.sendAnnouncement(`🏅 ${item.name} [${item.id}] - ${status}`, player.id, 0xFFFFFF, "small", 0);
    }
  }

  room.sendAnnouncement("👉 Dùng !buy <id> để mua. VD: !buy vip_gold | !buy effect 5 | !buy effect random", player.id, 0xAAAAAA, "small-italic", 0);
  return false;
}
function buyFunc(value, player) {
  const auth = getAuth(player.id);
  if (!auth) return false;
  if (!value) {
    room.sendAnnouncement("Dùng: !buy <id> hoặc !buy effect <số>. Xem !shop.", player.id, RED);
    return false;
  }

  const data = getPlayerData(auth);

  // Xử lý mua effect (Mua bằng Gems)
  if (value.startsWith("effect ")) {
    const param = value.split(" ")[1];
    if (param === "random") {
      if (data.ownedEffects.includes(-1)) { room.sendAnnouncement("Bạn đã sở hữu gói Random rồi.", player.id, RED); return false; }
      if ((data.gems || 0) < RANDOM_PACK_PRICE) { room.sendAnnouncement(`Cần ${RANDOM_PACK_PRICE} 💎, có ${data.gems || 0} 💎.`, player.id, RED); return false; }
      data.gems = (data.gems || 0) - RANDOM_PACK_PRICE;
      data.ownedEffects.push(-1);
      if (data.activeEffect === null) data.activeEffect = -1;
      if (typeof logCoinTransaction === "function") logCoinTransaction(player.name, auth, -RANDOM_PACK_PRICE, "Mua gói Random Effect (💎)", data.gems);
      savePlayerData(auth, data); // lưu xuống ổ cứng trước khi return
      room.sendAnnouncement("🎉 Đã mua gói Random Effect!", player.id, 0x00FF00, "bold", 0);
      return false;
    }

    if (!/^[0-9]+$/.test(param)) {
      room.sendAnnouncement("ID hiệu ứng không hợp lệ (phải là số từ 0 đến 14).", player.id, RED);
      return false;
    }
    const effectId = parseInt(param, 10);
    if (effectId < 0 || effectId > 14) { room.sendAnnouncement("ID hiệu ứng không hợp lệ (0-14).", player.id, RED); return false; }
    if (data.ownedEffects.includes(effectId)) { room.sendAnnouncement("Bạn đã sở hữu hiệu ứng này.", player.id, RED); return false; }
    const price = EFFECT_PRICES[effectId];
    if ((data.gems || 0) < price) { room.sendAnnouncement(`Cần ${price} 💎, có ${data.gems || 0} 💎.`, player.id, RED); return false; }
    data.gems = (data.gems || 0) - price;
    data.ownedEffects.push(effectId);
    if (data.activeEffect === null) data.activeEffect = effectId;
    if (typeof logCoinTransaction === "function") logCoinTransaction(player.name, auth, -price, `Mua hiệu ứng [${effectId}] ${EFFECT_NAMES[effectId]} (💎)`, data.gems);
    savePlayerData(auth, data); // lưu xuống ổ cứng trước khi return
    room.sendAnnouncement(`✅ Đã mua hiệu ứng [${effectId}] ${EFFECT_NAMES[effectId]}!`, player.id, 0x00FF00, "bold", 0);
    return false;
  }

  let args = value.split(" ");
  let targetId = args[0];
  let quantity = 1;
  if (args.length > 1) {
    let q = parseInt(args[1], 10);
    if (!isNaN(q) && q > 0) {
      if (q > 50) {
        room.sendAnnouncement("❌ Chỉ có thể mua tối đa 50 mặt hàng cùng lúc để chống kẹt server!", player.id, RED);
        return false;
      }
      quantity = q;
    }
  }

  const item = SHOP_ITEMS.find(i => i.id === targetId);
  if (!item) {
    room.sendAnnouncement("Mặt hàng không tồn tại.", player.id, RED);
    return false;
  }

  let canBuyMultiple = item.type === "lootbox" || item.type === "chat_toy" || (item.type === "feature" && item.uses > 0);
  if (quantity > 1 && !canBuyMultiple) {
    room.sendAnnouncement("Mặt hàng này không thể mua nhiều lượng cùng lúc.", player.id, RED);
    return false;
  }


  // Kiểm tra sở hữu trước khi trừ tiền
  if (item.type === "role" && data.ownedRoles.includes(item.id)) {
    room.sendAnnouncement("Bạn đã sở hữu role này rồi.", player.id, RED);
    return false;
  }
  if (item.type === "title" && data.ownedTitles.includes(item.id)) {
    room.sendAnnouncement("Bạn đã sở hữu danh hiệu này rồi.", player.id, RED);
    return false;
  }
  // 🎯 KIỂM TRA & TRỪ TIỀN THEO ĐÚNG LOẠI TIỀN TỆ (COINS hoặc GEMS)
  const currencyType = item.currency || "coins";
  let totalPrice = item.price * quantity;
  if (currencyType === "gems") {
    if ((data.gems || 0) < totalPrice) {
      room.sendAnnouncement(`❌ Cần ${totalPrice} 💎, có ${data.gems || 0} 💎.`, player.id, RED);
      return false;
    }
    data.gems -= totalPrice;
    if (typeof logCoinTransaction === "function") logCoinTransaction(player.name, auth, -totalPrice, `Mua ${quantity}x ${item.name} (💎)`, data.gems);
  } else {
    if (data.coins < totalPrice) {
      room.sendAnnouncement(`❌ Cần ${totalPrice} 🪙, có ${data.coins} 🪙.`, player.id, RED);
      return false;
    }
    data.coins -= totalPrice;
    if (typeof logCoinTransaction === "function") logCoinTransaction(player.name, auth, -totalPrice, `Mua ${quantity}x ${item.name} (🪙)`, data.coins);
  }

  switch (item.type) {
    case "role":
      data.ownedRoles.push(item.id);
      if (!data.activeRole) data.activeRole = item.id;
      break;
    case "feature":
      if (item.uses > 0) {
        let totalUses = item.uses * quantity;
        if (item.feature === "doublecoins") {
          data.doubleCoinsLeft = (data.doubleCoinsLeft || 0) + totalUses;
        } else if (item.feature === "starterboost") {
          data.starterboostUses = (data.starterboostUses || 0) + totalUses;
        } else {
          data[item.feature + "Uses"] = (data[item.feature + "Uses"] || 0) + totalUses;
        }
        data.features[item.feature] = true;
      } else {
        data.features[item.feature] = true;
      }

      break;
    case "lootbox": {
      for (let q = 0; q < quantity; q++) {
        const rewards = openLootBox(item.tier);
        let rewardMsg = [];
        for (const reward of rewards) {
          if (reward.type === "coins") {
            data.coins += reward.amount;
            if (typeof logCoinTransaction === "function") logCoinTransaction(player.name, auth, reward.amount, `Mở ${item.name} trúng 🪙`, data.coins);
            rewardMsg.push(`💰 ${reward.amount} 🪙`);
          }
          else if (reward.type === "role") {
            const roleItem = SHOP_ROLES.find(r => r.id === reward.id);
            const roleName = roleItem ? roleItem.name : reward.id;
            if (!data.ownedRoles.includes(reward.id)) {
              data.ownedRoles.push(reward.id);
              if (!data.activeRole) data.activeRole = reward.id;
              rewardMsg.push(`👑 Role ${roleName}`);
            } else {
              data.coins += 200;
              if (typeof logCoinTransaction === "function") logCoinTransaction(player.name, auth, 200, `Mở ${item.name} bồi thường trùng role ${roleName}`, data.coins);
              rewardMsg.push(`👑 Role ${roleName} (đã có → +200 🪙)`);
            }
          }
          else if (reward.type === "effect") {
            if (!data.ownedEffects.includes(reward.id)) {
              data.ownedEffects.push(reward.id);
              if (data.activeEffect === null) data.activeEffect = reward.id;
              rewardMsg.push(`🎨 Hiệu ứng "${EFFECT_NAMES[reward.id]}"`);
            } else {
              data.coins += 150;
              if (typeof logCoinTransaction === "function") logCoinTransaction(player.name, auth, 150, `Mở ${item.name} bồi thường trùng effect`, data.coins);
              rewardMsg.push(`🎨 Hiệu ứng "${EFFECT_NAMES[reward.id]}" (đã có → +150 🪙)`);
            }
          }
          else if (reward.type === "feature") {
            const featItem = SHOP_ITEMS.find(i => i.type === "feature" && i.feature === reward.feature);
            if (featItem && featItem.uses > 0) {
              if (featItem.feature === "doublecoins") {
                data.doubleCoinsLeft = (data.doubleCoinsLeft || 0) + featItem.uses;
              } else if (featItem.feature === "starterboost") {
                data.starterboostUses = (data.starterboostUses || 0) + featItem.uses;
              } else {
                data[featItem.feature + "Uses"] = (data[featItem.feature + "Uses"] || 0) + featItem.uses;
              }
            }
            data.features[reward.feature] = true;

            rewardMsg.push(`⚡ ${featItem ? featItem.name : reward.feature}`);
          }
          else if (reward.type === "title") {
            const titleItem = SHOP_ITEMS.find(i => i.type === "title" && i.id === reward.id);
            const titleName = titleItem ? titleItem.name : reward.id;
            if (!data.ownedTitles.includes(reward.id)) {
              data.ownedTitles.push(reward.id);
              if (!data.activeTitle) data.activeTitle = reward.id;
              rewardMsg.push(`🏅 ${titleName}`);
            } else {
              const compensation = 150;
              data.coins += compensation;
              if (typeof logCoinTransaction === "function") logCoinTransaction(player.name, auth, compensation, `Mở ${item.name} bồi thường trùng title`, data.coins);
              rewardMsg.push(`🏅 ${titleName} (đã có → +${compensation} 🪙)`);
            }
          }
          else if (reward.type === "chat_toy") {
            const toyItem = SHOP_ITEMS.find(i => i.type === "chat_toy" && (i.id === reward.id || i.toy === reward.toy));
            const itemId = toyItem ? toyItem.id : (reward.id || reward.toy);
            const amount = reward.amount || 1;
            data.chatToys[itemId] = (data.chatToys[itemId] || 0) + amount;
            const toyName = toyItem ? toyItem.name : itemId;
            rewardMsg.push(`🧸 ${toyName} x${amount}`);
          }
        }
        let boxSuffix = quantity > 1 ? ` (hộp ${q + 1}/${quantity})` : "";
        room.sendAnnouncement(`🎁 Mở ${item.name}${boxSuffix} nhận được: ${rewardMsg.join(", ")}`, player.id, 0xFFD700, "bold", 2);
      }
      break;
    }
    case "chat_toy":
      let totalCount = (item.count || 1) * quantity;
      data.chatToys[item.id] = (data.chatToys[item.id] || 0) + totalCount;
      let usageMsg = `!use ${item.id}`;
      if (["whisper", "megaphone", "bomb"].includes(item.toy)) {
        usageMsg = `!${item.toy}`;
        if (item.toy === "whisper") usageMsg = "!whisper @tên <nội_dung>";
        if (item.toy === "megaphone") usageMsg = "!megaphone <nội_dung>";
      }
      savePlayerData(auth, data); // 🛡️ FIX BUG #3: Lưu trước khi return
      room.sendAnnouncement(`✅ Đã mua ${quantity}x ${item.name}! Được cất vào túi đồ. Dùng lệnh: ${usageMsg}. (Số dư: ${currencyType === "gems" ? data.gems + " 💎" : data.coins + " 🪙"})`, player.id, item.color || 0x00FF00, "bold");
      return false;
    case "title":
      data.ownedTitles.push(item.id);
      if (!data.activeTitle) data.activeTitle = item.id;
      savePlayerData(auth, data); // 🛡️ FIX BUG #3: Lưu trước khi return
      room.sendAnnouncement(`✅ Đã mua danh hiệu ${item.name}! (Số dư: ${currencyType === "gems" ? data.gems + " 💎" : data.coins + " 🪙"})`, player.id, 0x00FF00, "bold", 0);
      return false;
  }

  savePlayerData(auth, data);
  const curName = currencyType === "gems" ? "💎 Gems" : "🪙 Coins";
  let qtyString = quantity > 1 ? `${quantity}x ` : "";
  room.sendAnnouncement(`✅ Thanh toán thành công ${totalPrice} ${curName}! Bạn đã sở hữu ${qtyString}${item.name}. (Số dư: ${currencyType === "gems" ? data.gems + " 💎" : data.coins + " 🪙"})`, player.id, 0x00FF00, "bold", 0);
  return false;
}
function buyVipFunc(value, player) {
  const auth = getAuth(player.id);
  if (!auth) return false;
  let data = getPlayerData(auth);

  const VIP_PRICE = 1500000; // Giá thẻ VIP 1 tháng (2.5 Triệu)

  // Kiểm tra xem đã có VIP chưa và còn hạn không
  if (data.vipExpiry && Date.now() < data.vipExpiry) {
    let daysLeft = Math.ceil((data.vipExpiry - Date.now()) / (1000 * 60 * 60 * 24));
    room.sendAnnouncement(`❌ Bạn đã là VIP rồi! Thời gian còn lại: ${daysLeft} ngày. Không thể mua chồng kính.`, player.id, 0xFF4444);
    return false;
  }

  if (data.coins < VIP_PRICE) {
    room.sendAnnouncement(`❌ Bạn không đủ tiền mua Thẻ VIP Tháng! Cần ${VIP_PRICE} 🪙 (Hiện có: ${data.coins} 🪙).`, player.id, 0xFF4444);
    return false;
  }

  // Thực thi trừ tiền và cấp hạn VIP (30 ngày = 30 * 24 * 60 * 60 * 1000 ms)
  data.coins -= VIP_PRICE;
  data.vipExpiry = Date.now() + (30 * 24 * 60 * 60 * 1000);
  savePlayerData(auth, data);

  // Ghi log hệ thống
  if (typeof logCoinTransaction === "function") {
    logCoinTransaction(player.name, auth, -VIP_PRICE, "Mua Thẻ VIP 30 Ngày", data.coins);
  }

  room.sendAnnouncement(`🎉 KÍCH HOẠT THÀNH CÔNG: Chúc mừng đại gia [${player.name}] đã sở hữu THỂ VIP THÁNG! Nhận ngay toàn bộ đặc quyền VIP từ hôm nay! (Số dư: ${data.coins} 🪙)`, null, 0xFFD700, "bold", 2);
  return false;
}
function setVipPermanentFunc(value, player) {
  const currentAuth = getAuth(player.id);

  // 🔒 BẢO MẬT: Chỉ cho phép Super Admin thực hiện lệnh này
  if (!SUPER_ADMIN_AUTHS.includes(currentAuth)) {
    room.sendAnnouncement("❌ Bạn không có quyền hạn sử dụng đặc quyền tối cao này!", player.id, 0xFF4444, "bold");
    return false;
  }

  if (!value || !value.trim()) {
    room.sendAnnouncement("👑 Cú pháp Admin: !vipforever <tên_người_chơi>", player.id, 0xFFD700);
    return false;
  }

  const targetName = value.trim().replace("@", "");
  // Tìm kiếm người chơi linh hoạt (Không phân biệt hoa thường)
  const targetPlayer = room.getPlayerList().find(p => p.id !== 0 && p.name.toLowerCase().includes(targetName.toLowerCase()));

  if (!targetPlayer) {
    room.sendAnnouncement(`❌ Không tìm thấy người chơi nào có tên chứa chữ "${targetName}".`, player.id, 0xFF4444);
    return false;
  }

  const targetAuth = getAuth(targetPlayer.id);
  if (!targetAuth) return false;

  let targetData = getPlayerData(targetAuth);

  // 👑 Đặt thời hạn VIP là 100 năm kể từ thời điểm gõ lệnh (Coi như vĩnh viễn)
  const ONE_HUNDRED_YEARS = 100 * 365 * 24 * 60 * 60 * 1000;
  targetData.vipExpiry = Date.now() + ONE_HUNDRED_YEARS;

  savePlayerData(targetAuth, targetData);

  // Phát thông báo long trọng ra toàn server kèm icon quý tộc
  room.sendAnnouncement(`👑 ĐẶC QUYỀN TỐI THƯỢNG: Người chơi [${targetPlayer.name}] đã được Đại Admin nâng cấp lên Thẻ Thành Viên VIP VĨNH VIỄN! 🎉💎`, null, 0x00FFFF, "bold", 2);
  room.sendAnnouncement(`💖 Xin chân thành cảm ơn sự ủng hộ và đóng góp của bạn dành cho sự phát triển của server! 🪙✨`, null, 0xFFD700, "bold", 1);
  return false;
}
// ==========================================
// Lệnh nạp tiền
// ==========================================
const BANK_NAME = process.env.BANK_NAME || "";
const BANK_ACCOUNT = process.env.BANK_ACCOUNT || "";
const BANK_QR_URL = process.env.BANK_QR_URL || "";

function napTienFunc(value, player) {
  if (!BANK_ACCOUNT) {
    room.sendAnnouncement("💳 Hiện tại thông tin nạp tiền chưa được cấu hình. Vui lòng liên hệ trực tiếp Admin!", player.id, 0xFFD700, "bold", 2);
    return false;
  }
  room.sendAnnouncement("💳 THÔNG TIN NẠP TIỀN ỦNG HỘ SERVER", player.id, 0xFFD700, "bold", 2);
  room.sendAnnouncement(
    `🏦 Ngân hàng: ${BANK_NAME}\n` +
    `🔢 Số tài khoản: ${BANK_ACCOUNT}\n` +
    `📝 Nội dung CK: NapTien + Tên Ingame của bạn`,
    player.id, 0x00FFFF, "bold", 1
  );
  if (BANK_QR_URL) {
    room.sendAnnouncement(
      `🔗 Link mở mã QR quét tự động:\n` +
      `👉 ${BANK_QR_URL}`,
      player.id, 0x00FF00, "italic", 1
    );
  }
  room.sendAnnouncement("📩 Chuyển khoản xong, hãy nhắn tin cho Admin trên Discord để được cấp thẻ VIP hoặc nạp Coins/Gems nhé!", player.id, 0xFF4444, "small-bold", 0);
  return false;
}
function useFunc(value, player) {
  if (!value || value.trim() === "") {
    room.sendAnnouncement("❌ Cú pháp sai. Dùng: !use <ID_Vật_Phẩm> (Xem ID trong !shop)", player.id, RED, "small", 1);
    return false;
  }

  const itemId = value.trim().toLowerCase();
  const auth = getAuth(player.id);
  if (!auth) return false;
  let data = getPlayerData(auth);

  // Tìm vật phẩm trong SHOP_ITEMS
  const item = SHOP_ITEMS.find(i => String(i.id).toLowerCase() === itemId);
  if (!item) {
    room.sendAnnouncement(`❌ ID Vật phẩm "${itemId}" không tồn tại.`, player.id, RED, "small", 1);
    return false;
  }

  // 1. Dùng Danh hiệu (Title)
  if (item.type === "title") {
    if (!data.ownedTitles.includes(item.id)) {
      room.sendAnnouncement("❌ Bạn chưa sở hữu Danh hiệu này! Hãy mua trong !shop.", player.id, RED, "small", 1);
      return false;
    }
    data.activeTitle = item.id;
    savePlayerData(auth, data);
    room.sendAnnouncement(`Đã trang bị Danh hiệu: ${item.name}`, player.id, GREEN, "small", 1);
    return false;
  }

  // 2. Dùng Đồ chơi Chat (Chat Toys)
  if (item.type === "chat_toy") {
    if (["whisper", "megaphone", "bomb"].includes(item.toy)) {
      let usageMsg = `!${item.toy}`;
      if (item.toy === "whisper") usageMsg = "!whisper @tên <nội_dung>";
      if (item.toy === "megaphone") usageMsg = "!megaphone <nội_dung>";
      room.sendAnnouncement(`❌ Vật phẩm này không dùng qua lệnh !use. Hãy dùng lệnh: ${usageMsg}`, player.id, RED, "small", 1);
      return false;
    }

    let ownedCount = data.chatToys[item.id] || 0;
    if (ownedCount <= 0) {
      room.sendAnnouncement(`❌ Bạn không còn ${item.name} trong túi đồ. Hãy mua thêm trong !shop hoặc mở Lootbox.`, player.id, RED, "small", 1);
      return false;
    }

    // Trừ 1 lượt dùng
    data.chatToys[item.id] -= 1;

    // Kích hoạt
    if (item.toy === "chatcolor") {
      data.activeChatColor = { color: item.param, expiry: Date.now() + item.duration * 1000 };
    } else if (item.toy === "sparkle") {
      data.activeSparkle = true;
      data.activeSparkleExpiry = Date.now() + item.duration * 1000;
    } else if (item.toy === "spam_shield") {
      if (!data.activeToys) data.activeToys = {};
      // Sửa thời lượng hiệu ứng
      data.activeToys.spam_shield = Date.now() + (item.param * 1000);
    }

    savePlayerData(auth, data);
    room.sendAnnouncement(`Đã kích hoạt thành công: ${item.name}! (Còn ${data.chatToys[item.id]} lượt)`, player.id, item.color || GREEN, "bold");
    return false;
  }

  // 3. Mở Lootbox từ túi đồ
  if (item.type === "lootbox") {
    let ownedCount = data.chatToys[item.id] || 0;
    if (ownedCount <= 0) {
      room.sendAnnouncement(`❌ Bạn không còn ${item.name} trong túi đồ.`, player.id, RED, "small", 1);
      return false;
    }

    data.chatToys[item.id] -= 1;
    const rewards = openLootBox(item.tier);
    let rewardMsg = [];
    for (const reward of rewards) {
      if (reward.type === "coins") {
        data.coins += reward.amount;
        if (typeof logCoinTransaction === "function") logCoinTransaction(player.name, auth, reward.amount, `Mở ${item.name} trúng 🪙`, data.coins);
        rewardMsg.push(`💰 ${reward.amount} 🪙`);
      }
      else if (reward.type === "role") {
        const roleItem = SHOP_ROLES.find(r => r.id === reward.id);
        const roleName = roleItem ? roleItem.name : reward.id;
        if (!data.ownedRoles.includes(reward.id)) {
          data.ownedRoles.push(reward.id);
          if (!data.activeRole) data.activeRole = reward.id;
          rewardMsg.push(`👑 Role ${roleName}`);
        } else {
          data.coins += 200;
          if (typeof logCoinTransaction === "function") logCoinTransaction(player.name, auth, 200, `Mở ${item.name} bồi thường trùng role ${roleName}`, data.coins);
          rewardMsg.push(`👑 Role ${roleName} (đã có → +200 🪙)`);
        }
      }
      else if (reward.type === "effect") {
        if (!data.ownedEffects.includes(reward.id)) {
          data.ownedEffects.push(reward.id);
          if (data.activeEffect === null) data.activeEffect = reward.id;
          rewardMsg.push(`🎨 Hiệu ứng "${EFFECT_NAMES[reward.id]}"`);
        } else {
          data.coins += 150;
          if (typeof logCoinTransaction === "function") logCoinTransaction(player.name, auth, 150, `Mở ${item.name} bồi thường trùng effect`, data.coins);
          rewardMsg.push(`🎨 Hiệu ứng "${EFFECT_NAMES[reward.id]}" (đã có → +150 🪙)`);
        }
      }
      else if (reward.type === "feature") {
        const featItem = SHOP_ITEMS.find(i => i.type === "feature" && i.feature === reward.feature);
        if (featItem && featItem.uses > 0) {
          if (featItem.feature === "doublecoins") {
            data.doubleCoinsLeft = (data.doubleCoinsLeft || 0) + featItem.uses;
          } else if (featItem.feature === "starterboost") {
            data.starterboostUses = (data.starterboostUses || 0) + featItem.uses;
          } else {
            data[featItem.feature + "Uses"] = (data[featItem.feature + "Uses"] || 0) + featItem.uses;
          }
        }
        data.features[reward.feature] = true;

        rewardMsg.push(`⚡ ${featItem ? featItem.name : reward.feature}`);
      }
      else if (reward.type === "title") {
        const titleItem = SHOP_ITEMS.find(i => i.type === "title" && i.id === reward.id);
        const titleName = titleItem ? titleItem.name : reward.id;
        if (!data.ownedTitles.includes(reward.id)) {
          data.ownedTitles.push(reward.id);
          if (!data.activeTitle) data.activeTitle = reward.id;
          rewardMsg.push(`🏅 ${titleName}`);
        } else {
          data.coins += 150;
          if (typeof logCoinTransaction === "function") logCoinTransaction(player.name, auth, 150, `Mở ${item.name} bồi thường trùng title`, data.coins);
          rewardMsg.push(`🏅 ${titleName} (đã có → +150 🪙)`);
        }
      }
      else if (reward.type === "chat_toy") {
        const toyItem = SHOP_ITEMS.find(i => i.type === "chat_toy" && (i.id === reward.id || i.toy === reward.toy));
        const itemId = toyItem ? toyItem.id : (reward.id || reward.toy);
        const amount = reward.amount || 1;
        data.chatToys[itemId] = (data.chatToys[itemId] || 0) + amount;
        const toyName = toyItem ? toyItem.name : itemId;
        rewardMsg.push(`🧸 ${toyName} x${amount}`);
      }
    }
    room.sendAnnouncement(`🎁 Mở ${item.name} nhận được: ${rewardMsg.join(", ")}`, player.id, 0xFFD700, "bold", 2);
    savePlayerData(auth, data); // lưu xuống ổ cứng sau khi mở hộp
    return false;
  }

  // 4. Các loại khác
  room.sendAnnouncement("❌ Vật phẩm này không thể trang bị (Chỉ áp dụng cho Chat Color, Sparkle, Khiên, Lootbox hoặc Titles).", player.id, RED, "small", 1);
  return false;
}
function dailyFunc(value, player) {
  const auth = getAuth(player.id);
  if (!auth) return false;
  let data = getPlayerData(auth);

  let todayStr = new Date().toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
  let yesterdayStr = new Date(Date.now() - 86400000).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

  if (data.lastDailyDate === todayStr) {
    room.sendAnnouncement("❌ Hôm nay bạn đã nhận trợ cấp rồi!", player.id, 0xFF4444);
    return false;
  }

  // Kiểm tra chuỗi ngày
  if (data.lastDailyDate === yesterdayStr) {
    data.dailyStreak = (data.dailyStreak || 0) + 1;
  } else {
    data.dailyStreak = 1; // Gãy chuỗi, reset về 1
  }
  data.lastDailyDate = todayStr;

  let isVip = data.vipExpiry && Date.now() < data.vipExpiry;
  let gemBonus = 0;
  let gemChance = isVip ? 0.2 : 0.1;
  if (Math.random() < gemChance) {
    gemBonus = 1;
    data.gems = (data.gems || 0) + gemBonus;
    if (typeof logCoinTransaction === "function") logCoinTransaction(player.name, auth, gemBonus, "Điểm danh (💎)", data.gems);
  }

  if (isVip) {
    if (!data.chatToys) data.chatToys = {};
    data.chatToys["lootbox_basic"] = (data.chatToys["lootbox_basic"] || 0) + 1;
    let msg = `🎁 [VIP ĐIỂM DANH]: Bạn nhận 1 [Loot Box Cơ Bản]! (Chuỗi chuyên cần: ${data.dailyStreak} ngày)`;
    if (gemBonus > 0) msg += ` 💎 Tặng kèm 1 Kim Cương ngẫu nhiên!`;
    room.sendAnnouncement(msg + ` (Số dư: ${data.coins} 🪙, ${data.gems || 0} 💎)`, player.id, 0x00FFFF, "bold", 2);
  } else {
    data.coins += 200;
    let msg = `✅ Điểm danh nhận +200 🪙. (Chuỗi chuyên cần: ${data.dailyStreak} ngày)`;
    if (gemBonus > 0) msg += ` 💎 May mắn nhặt được 1 Kim Cương!`;
    if (typeof logCoinTransaction === "function") logCoinTransaction(player.name, auth, 200, `Điểm danh hàng ngày (Chuỗi ${data.dailyStreak} ngày)`, data.coins);
    room.sendAnnouncement(msg + ` (Số dư: ${data.coins} 🪙, ${data.gems || 0} 💎)`, player.id, 0x00FF00);
  }

  // Thử thách chuyên cần
  if (data.dailyStreak === 14) {
    data.gems = (data.gems || 0) + 5; // Thưởng 5 Gems
    data.dailyStreak = 0; // Thưởng xong bắt cày lại
    if (typeof logCoinTransaction === "function") logCoinTransaction(player.name, auth, 5, "Chuỗi 14 ngày điểm danh (💎)", data.gems);
    room.sendAnnouncement(`💎 [KỶ LỤC CHUYÊN CẦN]: KHÔNG THỂ TIN NỔI! [${player.name}] đã điểm danh 14 ngày liên tiếp và được Thần linh ban tặng 5 💎!`, null, 0xFFD700, "bold", 2);
  }

  savePlayerData(auth, data);
  return false;
}
function roleFunc(value, player) {
  const auth = getAuth(player.id);
  if (!auth) return false;
  const data = getPlayerData(auth);

  if (!value) {
    if (!data.activeRole) {
      room.sendAnnouncement("Bạn chưa kích hoạt role VIP nào. Dùng !buy để mua và tự động kích hoạt.", player.id, YELLOW);
    } else {
      const cur = SHOP_ITEMS.filter(i => i.type === "role").find(r => r.id === data.activeRole);
      room.sendAnnouncement(`Role hiện tại: ${cur.name}. Dùng !role <id> để đổi.`, player.id, 0xFFD700, "bold", 0);
    }
    // Hiện danh sách role đã mua
    if (data.ownedRoles.length > 0) {
      let list = "Role đã mua: " + data.ownedRoles.map(id => SHOP_ROLES.find(r => r.id === id)?.name || id).join(", ");
      room.sendAnnouncement(list, player.id, 0xAAAAAA, "small", 0);
    }
    return false;
  }

  if (!data.ownedRoles.includes(value)) {
    room.sendAnnouncement("Bạn chưa sở hữu role này.", player.id, RED);
    return false;
  }

  // Đang dùng mà nhập lại thì tắt
  if (data.activeRole === value) {
    data.activeRole = null;
    savePlayerData(auth, data);
    const role = SHOP_ROLES.find(r => r.id === value);
    room.sendAnnouncement(`❌ Bạn đã gỡ bỏ role ${role.name}. Khôi phục màu gốc!`, player.id, YELLOW, "bold", 0);
    return false;
  }

  data.activeRole = value;
  savePlayerData(auth, data);
  const role = SHOP_ROLES.find(r => r.id === value);
  room.sendAnnouncement(`✨ Bạn đã chuyển sang role ${role.name}!`, player.id, role.color, "bold", 0);
  return false;
}
function titleFunc(value, player) {
  const auth = getAuth(player.id);
  if (!auth) return false;
  const data = getPlayerData(auth);

  if (!value) {
    if (!data.activeTitle) {
      room.sendAnnouncement("Bạn chưa kích hoạt danh hiệu nào. Dùng !buy để mua.", player.id, YELLOW);
    } else {
      const cur = SHOP_ITEMS.find(i => i.type === "title" && i.id === data.activeTitle);
      room.sendAnnouncement(`Danh hiệu hiện tại: ${cur.name}. Dùng !title <id> để đổi.`, player.id, 0xFFD700, "bold", 0);
    }
    if (data.ownedTitles.length > 0) {
      let list = "Danh hiệu đã mua: " + data.ownedTitles.map(id => SHOP_ITEMS.find(i => i.id === id)?.name || id).join(", ");
      room.sendAnnouncement(list, player.id, 0xAAAAAA, "small", 0);
    }
    return false;
  }

  if (!data.ownedTitles.includes(value)) {
    room.sendAnnouncement("Bạn chưa sở hữu danh hiệu này.", player.id, RED);
    return false;
  }

  // Đang dùng mà nhập lại thì tắt
  if (data.activeTitle === value) {
    data.activeTitle = null;
    savePlayerData(auth, data);
    const cur = SHOP_ITEMS.find(i => i.type === "title" && i.id === value);
    room.sendAnnouncement(`❌ Bạn đã gỡ bỏ danh hiệu ${cur.name}!`, player.id, YELLOW, "bold", 0);
    return false;
  }

  data.activeTitle = value;
  savePlayerData(auth, data);
  const cur = SHOP_ITEMS.find(i => i.type === "title" && i.id === value);
  room.sendAnnouncement(`✅ Đã trang bị danh hiệu ${cur.name}!`, player.id, 0x00FF00, "bold", 0);
  return false;
}
function openLootBox(tier) {
  const rewards = [];

  const basicPool = [
    // === Coins ===
    { type: "coins", amount: 50, weight: 25 },
    { type: "coins", amount: 100, weight: 15 },
    { type: "coins", amount: 200, weight: 5 },

    // === Effects ===
    { type: "effect", id: 0, weight: 5 },
    { type: "effect", id: 1, weight: 5 },

    // === Roles (cơ bản) ===
    { type: "role", id: "vip_neon", weight: 8 },
    { type: "role", id: "vip_coral", weight: 7 },
    { type: "role", id: "vip_olive", weight: 7 },
    { type: "role", id: "vip_teal", weight: 6 },
    { type: "role", id: "vip_maroon", weight: 6 },
    { type: "role", id: "vip_navy", weight: 6 },

    // === Titles (cơ bản) ===
    { type: "title", id: "title_pro", weight: 6 },
    { type: "title", id: "title_beast", weight: 6 },
    { type: "title", id: "title_dog", weight: 5 },
    { type: "title", id: "title_cat", weight: 5 },
    { type: "title", id: "title_fox", weight: 5 },
    { type: "title", id: "title_gamer", weight: 5 },
    { type: "title", id: "title_dumb", weight: 10 },
    { type: "title", id: "title_shit", weight: 10 },

    // === Chat Toys ===
    { type: "chat_toy", toy: "bomb", amount: 1, weight: 5 },
    { type: "chat_toy", toy: "whisper", amount: 1, weight: 5 },
    { type: "chat_toy", id: "cc_red", toy: "chatcolor", amount: 1, weight: 4 },
    { type: "chat_toy", id: "cc_blue", toy: "chatcolor", amount: 1, weight: 4 },
    { type: "chat_toy", id: "cc_random", toy: "chatcolor", amount: 1, weight: 3 },

    // === Features ===
    { type: "feature", feature: "afkextend", weight: 4 },
  ];

  const premiumPool = [
    // === Coins ===
    { type: "coins", amount: 300, weight: 18 },
    { type: "coins", amount: 500, weight: 12 },
    { type: "coins", amount: 1000, weight: 5 },
    { type: "coins", amount: 2000, weight: 2 },

    // === Roles (cao cấp) ===
    { type: "role", id: "vip_gold", weight: 8 },
    { type: "role", id: "vip_diamond", weight: 5 },
    { type: "role", id: "vip_ruby", weight: 6 },
    { type: "role", id: "vip_magenta", weight: 6 },
    { type: "role", id: "vip_lime", weight: 6 },
    { type: "role", id: "vip_teal", weight: 5 },
    { type: "role", id: "vip_maroon", weight: 5 },
    { type: "role", id: "vip_navy", weight: 5 },

    // === Effects ===
    { type: "effect", id: 5, weight: 5 },
    { type: "effect", id: 10, weight: 5 },
    { type: "effect", id: 14, weight: 5 },

    // === Titles (cao cấp) ===
    { type: "title", id: "title_king", weight: 5 },
    { type: "title", id: "title_legend", weight: 5 },
    { type: "title", id: "title_master", weight: 5 },
    { type: "title", id: "title_goat", weight: 4 },
    { type: "title", id: "title_god", weight: 4 },
    { type: "title", id: "title_dragon", weight: 4 },
    { type: "title", id: "title_eagle", weight: 4 },
    { type: "title", id: "title_storm", weight: 3 },
    { type: "title", id: "title_fire", weight: 3 },
    { type: "title", id: "title_ice", weight: 3 },
    { type: "title", id: "title_lightning", weight: 3 },

    // === Chat Toys (cao cấp) ===
    { type: "chat_toy", toy: "megaphone", amount: 2, weight: 4 },
    { type: "chat_toy", toy: "spam_shield", amount: 1, weight: 4 },
    { type: "chat_toy", id: "cc_gold", toy: "chatcolor", amount: 1, weight: 3 },
    { type: "chat_toy", toy: "sparkle", amount: 1, weight: 3 },

    // === Features ===
    { type: "feature", feature: "doublecoins", weight: 4 },
    { type: "feature", feature: "afkextend", weight: 4 },

  ];

  const pool = tier === "premium" ? premiumPool : basicPool;
  const numRewards = tier === "premium" ? 2 : 1;
  let totalWeight = pool.reduce((s, r) => s + r.weight, 0);
  for (let i = 0; i < numRewards; i++) {
    let rand = Math.random() * totalWeight;
    for (const reward of pool) {
      rand -= reward.weight;
      if (rand <= 0) {
        rewards.push(reward);
        break;
      }
    }
  }
  return rewards;
}
function generateHandicap() {
  let redPower = 0, bluePower = 0;
  const players = getNonAfkPlayers();

  for (const p of players) {
    const auth = getAuth(p.id);
    if (!auth) continue;
    let s = getStats(auth); // Điểm sức mạnh dựa trên tổng bàn thắng, kiến tạo...
    if (p.team == 1) {
      redPower += s.goals + s.assists + s.motms * 2;
    } else if (p.team == 2) {
      bluePower += s.goals + s.assists + s.motms * 2;
    }
  }

  let totalPower = redPower + bluePower || 1;
  let rawHandicap = Math.abs(redPower - bluePower) / Math.max(totalPower / 10, 1);

  // Làm tròn kèo chấp về các mốc 0.5, 1.0, 1.5, 2.0... (Giới hạn tối đa chấp 4 trái)
  let roundedHandicap = Math.min(4.0, Math.max(0, Math.round(rawHandicap * 2) / 2));

  if (roundedHandicap === 0) {
    currentHandicap = { team: "draw", value: 0 }; // Đồng banh
  } else if (redPower > bluePower) {
    currentHandicap = { team: "red", value: roundedHandicap };
  } else {
    currentHandicap = { team: "blue", value: roundedHandicap };
  }
}
function betFunc(value, player) {
  if (typeof stadium !== "undefined" && stadium.name && (stadium.name.includes("1v1") || stadium.name.includes("3v3") || stadium.name.includes("training"))) {
    room.sendAnnouncement("❌ Hệ thống Cá Cược (!bet) chỉ mở tại Map thi đấu chính thức (5v5)!", player.id, 0xFF4444, "bold", 2);
    return false;
  }

  const auth = getAuth(player.id);
  if (!auth) return false;
  const data = getPlayerData(auth);

  if (!value || value.trim() === "") {
    room.sendAnnouncement(`📊 CÁC KÈO CƯỢC:\n` +
      `!bet list - Xem bảng kèo\n` +
      `!bet winner <red/blue> <tiền> - Đội thắng\n` +
      `!bet taixiu <tai/xiu> <tiền> - Tài/xỉu 3.5 bàn\n` +
      `!bet keochap <red/blue> <tiền> - Kèo chấp\n` +
      `!bet btts <yes/no> <tiền> - Hai đội ghi bàn\n` +
      `!bet tiso <tỉ số> <tiền> - Tỉ số chính xác\n` +
      `!bet scorer <tên> <tiền> - Cầu thủ ghi bàn\n` +
      `!bet motm <tên> <tiền> - Cầu thủ xuất sắc nhất\n` +
      `!bet mybets - Xem cược của bạn\n` +
      `💰 Mức cược: tối thiểu ${typeof MIN_BET !== 'undefined' ? MIN_BET : 10} 🪙, hoặc "all".`, player.id, 0xFFD700, "small-bold", 0);
    return false;
  }

  const parts = value.trim().split(/\s+/);
  const sub = parts[0].toLowerCase();

  if (sub === "list") {
    if (typeof updateOdds === "function") updateOdds();

    let handicapText = currentHandicap.value === 0
      ? "Đồng banh"
      : `${currentHandicap.team.toUpperCase()} chấp ${currentHandicap.value}`;

    let msg = "📊 BẢNG TỶ LỆ KÈO TRẬN ĐẤU\n";
    msg += `⚽ THẮNG [Đỏ: ${betOdds.winner.red.toFixed(2)} | Xanh: ${betOdds.winner.blue.toFixed(2)}] ➖ 📈 T/X 3.5 [Tài: ${betOdds.taixiu.tai.toFixed(2)} | Xỉu: ${betOdds.taixiu.xiu.toFixed(2)}]\n`;
    msg += `🎯 CHẤP (${handicapText}) [Đỏ: ${betOdds.keochap.red.toFixed(2)} | Xanh: ${betOdds.keochap.blue.toFixed(2)}]`;
    if (betOdds.btts) {
      msg += ` ➖ 🔥 2 ĐỘI GHI BÀN [Có: ${betOdds.btts.yes.toFixed(2)} | Không: ${betOdds.btts.no.toFixed(2)}]`;
    }
    msg += "\n";

    if (Object.keys(betOdds.scorer).length) {
      let scorers = Object.entries(betOdds.scorer).map(([n, o]) => `${n}: ${o.toFixed(2)}`).join(" | ");
      msg += `⚡ GHI BÀN: ${scorers}\n`;
    }

    if (Object.keys(betOdds.motm).length) {
      let motms = Object.entries(betOdds.motm).map(([n, o]) => `${n}: ${o.toFixed(2)}`).join(" | ");
      msg += `🏅 MOTM: ${motms}`;
    }
    room.sendAnnouncement(msg.trim(), player.id, 0x00FFFF, "small-bold", 1);
    return false;
  }

  if (sub === "mybets") {
    let mybets = bets.filter(b => b.auth === auth);
    if (!mybets.length) {
      room.sendAnnouncement("Bạn chưa cược trận này.", player.id, YELLOW);
      return false;
    }
    let msg = "🎫 CƯỢC CỦA BẠN:\n";
    for (const b of mybets) msg += `- ${b.type}: ${b.choice} - ${b.amount} 🪙 (Tỉ lệ: ${b.odds.toFixed(2)})\n`;
    room.sendAnnouncement(msg, player.id, 0x00FF00, "small", 0);
    return false;
  }

  if (parts.length < 3) {
    room.sendAnnouncement("Cú pháp: !bet <loại> <chọn> <tiền>. Xem !bet để biết thêm.", player.id, 0xFF4444);
    return false;
  }

  const type = sub;
  const choice = parts[1].toLowerCase();
  const validTypes = ["winner", "taixiu", "keochap", "btts", "tiso", "scorer", "motm"];
  if (!validTypes.includes(type)) {
    room.sendAnnouncement("❌ Loại kèo không hợp lệ. Hãy dùng !bet list để xem.", player.id, 0xFF4444, "bold", 1);
    return false;
  }

  if (typeof isTakingPenalty !== "undefined" && isTakingPenalty) {
    room.sendAnnouncement("🚫 Cổng cược đã đóng! Không thể đặt cược mới khi đang trong loạt sút luân lưu!", player.id, 0xFF4444, "bold", 2);
    return false;
  }

  if (type === "winner" || type === "keochap") {
    if (choice !== "red" && choice !== "blue") {
      room.sendAnnouncement(`❌ Nhập sai tên đội! Kèo ${type} chỉ nhận 'red' hoặc 'blue'. VD: !bet ${type} red <tiền>`, player.id, 0xFF4444, "bold", 2);
      return false;
    }
  }
  else if (type === "taixiu") {
    if (choice !== "tai" && choice !== "xiu") {
      room.sendAnnouncement("❌ Nhập sai kèo! Kèo tài xỉu chỉ nhận 'tai' hoặc 'xiu'. VD: !bet taixiu tai <tiền>", player.id, 0xFF4444, "bold", 2);
      return false;
    }
  }
  else if (type === "btts") {
    if (choice !== "yes" && choice !== "no") {
      room.sendAnnouncement("❌ Nhập sai kèo! Kèo BTTS chỉ nhận 'yes' hoặc 'no'. VD: !bet btts yes <tiền>", player.id, 0xFF4444, "bold", 2);
      return false;
    }
  }
  else if (type === "tiso") {
    if (!/^\d+-\d+$/.test(choice)) {
      room.sendAnnouncement("❌ Định dạng tỉ số sai! Hãy nhập theo dạng Số-Số. VD: !bet tiso 2-1 <tiền>", player.id, 0xFF4444, "bold", 2);
      return false;
    }
  }

  if (player.team === 1 || player.team === 2) {
    if (type !== "winner" && type !== "keochap") {
      room.sendAnnouncement("🚫 CHỐNG BÁN ĐỘ: Cầu thủ đang thi đấu trên sân CHỈ ĐƯỢC phép cược '!bet winner' hoặc '!bet keochap'!", player.id, 0xFF4444, "bold", 2);
      return false;
    }
    let myTeam = player.team === 1 ? "red" : "blue";
    if (choice !== myTeam) {
      room.sendAnnouncement(`🚫 CHỐNG BÁN ĐỘ: Bạn là cầu thủ nên CHỈ ĐƯỢC cược cho đội nhà (${myTeam}).`, player.id, 0xFF4444, "bold", 2);
      return false;
    }
  }

  const amountStr = parts[2];
  let amount;
  if (amountStr.toLowerCase() === "all") {
    amount = data.coins;
  } else {
    if (!/^[0-9]+$/.test(amountStr)) {
      room.sendAnnouncement("❌ Số tiền không hợp lệ. Vui lòng nhập một số nguyên hoặc 'all'.", player.id, 0xFF4444, "bold");
      return false;
    }
    amount = parseInt(amountStr, 10);
  }

  if (amount <= 0) {
    room.sendAnnouncement("❌ Số tiền cược phải lớn hơn 0.", player.id, 0xFF4444, "bold");
    return false;
  }

  // =========================================================================
  // GIỚI HẠN MAX BET (Chống spam & Bóp tiền Spec Bán độ)
  // =========================================================================
  let isVip = data.vipExpiry && Date.now() < data.vipExpiry;

  // Cầu thủ trên sân (Team 1, 2) được cược tối đa 50 triệu (VIP: 200 triệu)
  // Khán giả (Team 0 - Spec) chỉ được cược tối đa 5 triệu để chặn bơm tiền bán độ
  let MAX_BET = 5000000;
  if (player.team === 1 || player.team === 2) {
    MAX_BET = isVip ? 200000000 : 50000000;
  }

  if ((type === "scorer" || type === "motm") && amount > 20000) {
    room.sendAnnouncement(`❌ Kèo Cá nhân (Ghi bàn, MOTM) chỉ cho phép cược tối đa 20,000 🪙 để chống in tiền từ Hư vô!`, player.id, 0xFF4444, "bold", 2);
    return false;
  }

  if (amount > MAX_BET) {
    if (player.team === 0) {
      room.sendAnnouncement(`❌ [CHỐNG BÁN ĐỘ]: Khán giả (Spec) chỉ được cược tối đa ${MAX_BET.toLocaleString()} 🪙 mỗi vé!`, player.id, 0xFF4444, "bold", 2);
    } else {
      room.sendAnnouncement(`❌ ${isVip ? "Giới hạn VIP" : "Nhà cái"} không nhận vé cược quá ${MAX_BET.toLocaleString()} 🪙 để chống lạm phát!`, player.id, 0xFF4444, "bold", 2);
    }
    return false;
  }

  // =========================================================================
  // GIỚI HẠN TỔNG CƯỢC TOÀN TRẬN
  // =========================================================================
  // Tổng số tiền cược tối đa cho 1 trận: Cầu thủ 100 triệu (VIP: 1 Tỷ), Khán giả 10 triệu
  let MAX_TOTAL_BET = 10000000;
  if (player.team === 1 || player.team === 2) {
    MAX_TOTAL_BET = isVip ? 1000000000 : 100000000;
  }
  let currentTotalBet = bets.filter(b => b.auth === auth).reduce((sum, b) => sum + b.amount, 0);

  if (currentTotalBet + amount > MAX_TOTAL_BET) {
    let remaining = MAX_TOTAL_BET - currentTotalBet;
    if (remaining <= 0) {
      room.sendAnnouncement(`❌ Bạn đã chạm mức TỔNG CƯỢC tối đa trong trận này (${MAX_TOTAL_BET.toLocaleString()} 🪙)!`, player.id, 0xFF4444, "bold", 2);
    } else {
      room.sendAnnouncement(`❌ Trận này bạn chỉ được cược thêm tối đa ${remaining.toLocaleString()} 🪙 nữa (Giới hạn: ${MAX_TOTAL_BET.toLocaleString()} 🪙).`, player.id, 0xFF4444, "bold", 2);
    }
    return false;
  }

  let minBetLimit = typeof MIN_BET !== "undefined" ? MIN_BET : 10;
  if (amount < minBetLimit || amount > data.coins) {
    room.sendAnnouncement(`Cược tối thiểu ${minBetLimit} 🪙, tối đa ${data.coins} 🪙.`, player.id, 0xFF4444);
    return false;
  }

  const scores = room.getScores();
  let predictTime = typeof PREDICTION_PERIOD !== "undefined" ? PREDICTION_PERIOD : 60;

  if (!scores) {
    room.sendAnnouncement(`❌ Trận đấu chưa bắt đầu, vui lòng đợi bóng lăn!`, player.id, 0xFF4444, "bold");
    return false;
  }

  if (!scores || (typeof isPlaying !== 'undefined' && !isPlaying)) {
    room.sendAnnouncement("Trận đấu chưa diễn ra hoặc đã kết thúc, không thể đặt cược!", player.id, 0xFF4444);
    return false;
  }
  if (scores.time > predictTime || scores.red + scores.blue > 0) {
    room.sendAnnouncement(`Đã hết thời gian cược (chỉ trong ${predictTime}s đầu, tỉ số 0-0).`, player.id, 0xFF4444);
    return false;
  }

  if (bets.some(b => b.auth === auth && b.type === type)) {
    room.sendAnnouncement(`Bạn đã cược loại kèo ${type} rồi, không thể cược nhồi thêm!`, player.id, 0xFF4444);
    return false;
  }

  let odds = 1.5;
  let targetAuth = null;
  let targetName = null;

  if (type === "scorer" || type === "motm") {
    const targetPlayer = getPlayerByName(parts[1]);
    if (!targetPlayer || targetPlayer.team === 0) {
      room.sendAnnouncement(`❌ Không tìm thấy cầu thủ "${parts[1]}" trên sân! Hãy nhập đúng TÊN VIẾT LIỀN của cầu thủ đang đá.`, player.id, 0xFF4444, "bold", 2);
      return false;
    }
    targetAuth = getAuth(targetPlayer.id);
    if (!targetAuth) {
      room.sendAnnouncement("Lỗi xác thực cầu thủ.", player.id, 0xFF4444);
      return false;
    }
    targetName = targetPlayer.name;
    if (betOdds[type] && betOdds[type][targetName]) {
      odds = betOdds[type][targetName];
    } else {
      odds = 3.5;
    }
  } else {
    if (typeof updateOdds === "function") updateOdds();
    if (type === "tiso") {
      odds = 5.0;
    } else if (betOdds[type] && betOdds[type][choice]) {
      odds = betOdds[type][choice];
    }
  }

  let actualBetAmount = amount;

  data.coins -= amount;
  savePlayerData(auth, data);

  if (typeof logCoinTransaction === "function") {
    logCoinTransaction(player.name, auth, -amount, `Đặt cược ${type}: ${choice}`, data.coins);
  }

  bets.push({
    playerId: player.id,
    auth: auth,
    name: player.name,
    type: type,
    choice: (type === "scorer" || type === "motm") ? targetName : choice,
    amount: actualBetAmount,
    odds: odds,
    placedTime: Date.now(),
    targetAuth: targetAuth,
    targetName: targetName,
  });

  room.sendAnnouncement(`✅ Bạn xuống xác ${amount} 🪙 vào kèo ${type}: ${(type === "scorer" || type === "motm") ? targetName : choice.toUpperCase()} (Tỉ lệ HIỆN TẠI: ${odds.toFixed(2)}). Số dư: ${data.coins} 🪙`, player.id, 0x00FF00, "bold", 2);


  // =========================================================================
  // Thông báo cho khán giả
  // =========================================================================
  let specList = room.getPlayerList().filter(p => p.team === 0);

  for (let spec of specList) {
    room.sendAnnouncement(`🎲 [KHÁN GIẢ] ${player.name} vừa đặt ${amount.toLocaleString()} 🪙 vào kèo ${type.toUpperCase()}!`, spec.id, 0xFFA500, "small", 1);
  }

  return false;
}

function unbetFunc(value, player) {
  const auth = getAuth(player.id);
  if (!auth) return false;

  const scores = room.getScores();
  const predictTime = typeof PREDICTION_PERIOD !== "undefined" ? PREDICTION_PERIOD : 90;

  if (scores && (scores.time > predictTime || scores.red + scores.blue > 0)) {
    room.sendAnnouncement(`❌ Đã quá thời gian được hủy cược! (Chỉ áp dụng trong ${predictTime}s đầu và tỉ số phải là 0-0).`, player.id, 0xFF4444, "bold", 2);
    return false;
  }

  let playerBets = bets.filter(b => b.auth === auth);
  if (playerBets.length === 0) {
    room.sendAnnouncement("❌ Bạn chưa đặt vé cược nào trong trận này để hủy!", player.id, 0xFF4444);
    return false;
  }

  let data = getPlayerData(auth);
  if (!data) return false;

  let totalRefund = 0;
  let cancelCount = 0;

  let typeToCancel = value ? value.trim().toLowerCase() : null;

  if (typeToCancel) {
    const validTypes = ["winner", "taixiu", "keochap", "btts", "tiso", "scorer", "motm"];
    if (!validTypes.includes(typeToCancel)) {
      room.sendAnnouncement("❌ Loại kèo muốn hủy không hợp lệ! Ví dụ: !unbet winner", player.id, 0xFF4444);
      return false;
    }
    playerBets = playerBets.filter(b => b.type === typeToCancel);
    if (playerBets.length === 0) {
      room.sendAnnouncement(`❌ Bạn không có vé cược nào thuộc kèo [${typeToCancel.toUpperCase()}] trong trận này!`, player.id, 0xFF4444);
      return false;
    }
  }

  for (const bet of playerBets) {
    let refundAmount = bet.amount;

    data.coins += refundAmount;
    totalRefund += refundAmount;
    cancelCount++;

    bets = bets.filter(b => b !== bet);

    if (typeof logCoinTransaction === "function") {
      logCoinTransaction(player.name, auth, refundAmount, `Hủy vé cược kèo ${bet.type} [${bet.choice}]`, data.coins);
    }
  }

  savePlayerData(auth, data);

  if (typeof updateOdds === "function") updateOdds();

  room.sendAnnouncement(`✅ HỦY CƯỢC THÀNH CÔNG: Đã hoàn trả ${totalRefund} 🪙 cho ${cancelCount} vé cược của bạn. Số dư: ${data.coins} 🪙.`, player.id, 0x00FF00, "bold", 2);

  // =========================================================================
  // Thông báo cho khán giả
  // =========================================================================
  let specList = room.getPlayerList().filter(p => p.team === 0);
  for (let spec of specList) {
    room.sendAnnouncement(`🎲 [KHÁN GIẢ] ${player.name} vừa hủy kèo và rút lại ${totalRefund.toLocaleString()} 🪙 từ quỹ cược!`, spec.id, 0xFFA500, "small", 1);
  }

  return false;
}


function bountyFunc(value, player) {
  if (!value) {
    room.sendAnnouncement("⚔️ Cú pháp: !bounty <tên_người_chơi> <số_tiền>", player.id, 0xFF4444);
    return false;
  }

  const parts = value.trim().split(/\s+/);
  if (parts.length < 2) return false;

  const amountStr = parts.pop();
  // Tự động loại bỏ ký tự @ nếu người dùng gõ nhầm
  const targetName = parts.join(" ").toLowerCase().replace("@", "");
  const amount = parseInt(amountStr, 10);

  if (isNaN(amount) || amount < 1000) {
    room.sendAnnouncement("❌ Số tiền truy nã tối thiểu là 1,000 🪙.", player.id, 0xFF4444);
    return false;
  }

  const auth = getAuth(player.id);
  if (!auth) return false;
  const data = getPlayerData(auth);

  if (data.coins < amount) {
    room.sendAnnouncement(`❌ Bạn không đủ tiền! (Hiện có: ${data.coins} 🪙)`, player.id, 0xFF4444);
    return false;
  }

  // Tìm kiếm linh hoạt hơn (Partial match thay vì Exact match)
  const targetPlayer = room.getPlayerList().find(p => p.id !== 0 && p.name.toLowerCase().includes(targetName));

  if (!targetPlayer) {
    room.sendAnnouncement(`❌ Không tìm thấy người chơi nào tên "${targetName}".`, player.id, 0xFF4444);
    return false;
  }

  if (targetPlayer.id === player.id) {
    room.sendAnnouncement(`❌ Bạn không thể tự treo thưởng chính mình!`, player.id, 0xFF4444);
    return false;
  }

  if (player.team !== 0 && targetPlayer.team === player.team) {
    room.sendAnnouncement(`❌ Không thể treo thưởng đồng đội cùng đội!`, player.id, 0xFF4444);
    return false;
  }

  if (targetPlayer.team === 0) {
    room.sendAnnouncement(`❌ Chỉ có thể truy nã cầu thủ ĐANG ĐÁ TRÊN SÂN (${targetPlayer.name} đang là Spec).`, player.id, 0xFF4444);
    return false;
  }

  const targetAuth = getAuth(targetPlayer.id);
  if (!targetAuth) return false;

  // Trừ tiền người đặt
  data.coins -= amount;
  savePlayerData(auth, data);
  if (typeof logCoinTransaction === "function") {
    logCoinTransaction(player.name, auth, -amount, `Treo thưởng truy nã ${targetPlayer.name}`, data.coins);
  }

  // Cộng dồn tiền truy nã, lưu lại thông tin người đặt (hỗ trợ hoàn tiền khi trận hòa)
  if (!activeBounties[targetAuth]) {
    activeBounties[targetAuth] = { name: targetPlayer.name, amount: 0, team: targetPlayer.team, depositors: [] };
  }
  activeBounties[targetAuth].amount += amount;
  activeBounties[targetAuth].depositors.push({ auth: auth, amount: amount }); // Lưu người đặt để hoàn tiền nếu cần

  room.sendAnnouncement(`☠️ LỆNH TRUY NÃ: ${player.name} vừa treo thưởng ${amount} 🪙 cho cái đầu của [${targetPlayer.name}]! (Số dư: ${data.coins} 🪙)`, null, 0xFF0000, "bold", 2);
  room.sendAnnouncement(`🔥 (Tổng tiền truy nã ${targetPlayer.name} đang là: ${activeBounties[targetAuth].amount} 🪙)`, null, 0xFFD700, "bold", 1);
  return false;
}
function huongDanFunc(value, player) {
  const GUIDE_URL = "https://huongdandungbetshopcoins.netlify.app/";
  room.sendAnnouncement(
    `📖 Copy link sau để xem hướng dẫn về cách dùng lệnh BET, SHOP, COINS trong room: ${GUIDE_URL}`,
    player.id,
    0x00FFFF,
    "bold",
    1
  );
  return false;
}
function buffCoinsFunc(value, player) {
  if (!value) {
    room.sendAnnouncement("Sử dụng: !buffcoins <tên hoặc @tag> <số tiền> (VD: !buffcoins @32MBVRAM 500 hoặc !buffcoins 32 -200)", player.id, RED);
    return false;
  }

  // Tách tham số: phần cuối là số tiền, phần đầu là tên
  let args = value.split(" ");
  let amount = parseInt(args.pop());
  let name = args.join(" ");

  if (isNaN(amount)) {
    room.sendAnnouncement("Lỗi: Số tiền phải là một số nguyên.", player.id, RED);
    return false;
  }

  let targetPlayer = getPlayerByName(name);
  if (!targetPlayer) {
    room.sendAnnouncement(`Không tìm thấy người chơi "${name}" trong phòng.`, player.id, RED);
    return false;
  }

  let targetAuth = getAuth(targetPlayer.id);
  if (!targetAuth) {
    room.sendAnnouncement("Không thể xác định người chơi (lỗi auth).", player.id, RED);
    return false;
  }

  const data = getPlayerData(targetAuth);
  data.coins = (data.coins || 0) + amount;
  if (data.coins < 0) data.coins = 0; // Không cho âm coins
  savePlayerData(targetAuth, data);
  if (typeof logCoinTransaction === "function") {
    logCoinTransaction(targetPlayer.name, targetAuth, amount, `Admin ${player.name} buff coins`, data.coins);
  }

  let actionText = amount >= 0 ? "thêm" : "trừ";
  room.sendAnnouncement(
    `[ADMIN] ${player.name} đã ${actionText} ${Math.abs(amount)} 🪙 cho ${targetPlayer.name}. Số dư hiện tại: ${data.coins} 🪙.`,
    null, 0xFFD700, "bold", 1
  );
  // Thông báo riêng cho người được buff
  room.sendAnnouncement(
    `💰 Bạn đã được admin ${actionText} ${Math.abs(amount)} 🪙. Số dư: ${data.coins} 🪙.`,
    targetPlayer.id, 0xFFD700, "bold", 2
  );

  log(`${player.name} buffcoins ${targetPlayer.name} amount=${amount}`);
  return false;
}
function buffGemsFunc(value, player) {
  const currentAuth = getAuth(player.id);
  if (!SUPER_ADMIN_AUTHS.includes(currentAuth)) {
    room.sendAnnouncement("❌ Lệnh này chỉ dành cho Super Admin!", player.id, RED, "bold"); return false;
  }

  let args = value.split(" ");
  let amount = parseInt(args.pop());
  let name = args.join(" ");

  if (isNaN(amount)) {
    room.sendAnnouncement("❌ Lỗi: Số Gems phải là số nguyên.", player.id, RED); return false;
  }

  let targetPlayer = getPlayerByName(name);
  if (!targetPlayer) {
    room.sendAnnouncement(`❌ Không tìm thấy người chơi "${name}" trong phòng.`, player.id, RED);
    return false;
  }

  let targetAuth = getAuth(targetPlayer.id);
  if (!targetAuth) {
    room.sendAnnouncement("❌ Không thể xác định người chơi (lỗi auth).", player.id, RED);
    return false;
  }
  const data = getPlayerData(targetAuth);

  data.gems = (data.gems || 0) + amount;
  if (data.gems < 0) data.gems = 0;
  savePlayerData(targetAuth, data);
  if (typeof logCoinTransaction === "function") {
    logCoinTransaction(targetPlayer.name, targetAuth, amount, `Admin ${player.name} buff gems (💎)`, data.gems);
  }

  let actionText = amount >= 0 ? "thưởng" : "trừ";
  room.sendAnnouncement(`💎 [ADMIN] Hệ thống vừa ${actionText} ${Math.abs(amount)} GEMS cho [${targetPlayer.name}]. Số dư: ${data.gems} 💎.`, null, 0x00FFFF, "bold", 2);
  room.sendAnnouncement(`💎 Bạn đã được admin ${actionText} ${Math.abs(amount)} GEMS. Số dư hiện tại: ${data.gems} 💎.`, targetPlayer.id, 0x00FFFF, "bold", 2);
  return false;
}
const TAX_RATE = 0.10; // Thuế 10%
const MIN_GAMES_TO_TRADE = 10; // Phải đá đủ 10 trận mới được chuyển/nhận tiền

function safeTradeFunc(value, player) {
  if (!value) {
    room.sendAnnouncement("💸 Cú pháp: !pay <tên_người_nhận> <số_tiền>\n📌 5 lượt chuyển đầu trong ngày MIỄN PHÍ. Từ lượt thứ 6 sẽ thu thuế 15%. Yêu cầu đá đủ 10 trận.", player.id, 0xFFD700, "small-bold", 0);
    return false;
  }

  const parts = value.trim().split(" ");
  if (parts.length < 2) {
    room.sendAnnouncement("❌ Cú pháp sai! Vui lòng gõ: !pay <tên_người_nhận> <số_tiền>", player.id, 0xFF4444, "bold");
    return false;
  }

  const amountStr = parts.pop();
  const targetName = parts.join(" ");
  if (!/^[0-9]+$/.test(amountStr)) {
    room.sendAnnouncement("❌ Số tiền giao dịch không hợp lệ (phải là số nguyên dương)!", player.id, 0xFF4444, "bold");
    return false;
  }
  const amount = parseInt(amountStr, 10);

  // Chống nhập số 0
  if (amount <= 0) {
    room.sendAnnouncement("❌ Số tiền giao dịch phải lớn hơn 0!", player.id, 0xFF4444, "bold");
    return false;
  }

  // Giới hạn số tiền tối đa 1 lần chuyển
  const maxAmount = typeof MAX_TRANSFER_AMOUNT !== "undefined" ? MAX_TRANSFER_AMOUNT : 50000;
  if (amount > maxAmount) {
    room.sendAnnouncement(`❌ Số tiền quá lớn! Bạn chỉ được phép chuyển tối đa ${maxAmount} 🪙/lần.`, player.id, 0xFF4444, "bold");
    return false;
  }

  // Lấy trạng thái trận đấu (bóng có đang lăn không)
  let isGamePlaying = room.getScores() !== null;

  // Không cho phép thao tác khi đang thi đấu trên sân
  if (player.team !== 0 && isGamePlaying) {
    room.sendAnnouncement("🚫 Để chống bán độ, cầu thủ đang thi đấu trên sân không được phép chuyển tiền!", player.id, 0xFF4444, "bold", 2);
    return false;
  }

  const targetPlayer = getPlayerByName(targetName);
  if (!targetPlayer) {
    room.sendAnnouncement(`❌ Không tìm thấy người chơi "${targetName}" trong phòng.`, player.id, 0xFF4444, "bold");
    return false;
  }

  if (targetPlayer.id === player.id) {
    room.sendAnnouncement("❌ Bạn không thể tự chuyển tiền cho chính mình!", player.id, 0xFF4444, "bold");
    return false;
  }

  // Khóa nhận tiền nếu người nhận đang ở trên sân
  if (targetPlayer.team !== 0 && isGamePlaying) {
    room.sendAnnouncement(`🚫 ${targetPlayer.name} đang thi đấu trên sân nên không thể nhận tiền lúc này!`, player.id, 0xFF4444, "bold", 2);
    return false;
  }

  const senderAuth = getAuth(player.id);
  const targetAuth = getAuth(targetPlayer.id);

  if (!senderAuth || !targetAuth) return false;

  // CHỐNG HACK NHÂN BẢN TIỀN
  if (senderAuth === targetAuth) {
    room.sendAnnouncement("❌ Cảnh báo hệ thống: Hai tài khoản có cùng dữ liệu xác thực (Auth/Chơi cùng máy). Giao dịch bị hủy bỏ!", player.id, 0xFF4444, "bold", 2);
    return false;
  }
  const senderStats = getStats(senderAuth);
  const targetStats = getStats(targetAuth);

  // Khai báo số trận tối thiểu, nếu biến toàn cục chưa có thì mặc định là 10
  const minGamesReq = typeof MIN_GAMES_TO_TRADE !== "undefined" ? MIN_GAMES_TO_TRADE : 10;

  // Chống cày Clone (Yêu cầu đủ số trận)
  if (senderStats.games < minGamesReq) {
    room.sendAnnouncement(`❌ Tài khoản của bạn mới đá ${senderStats.games}/${minGamesReq} trận. Chưa đủ điều kiện sử dụng Ngân hàng!`, player.id, 0xFF4444, "bold");
    return false;
  }
  if (targetStats.games < minGamesReq) {
    room.sendAnnouncement(`❌ Người nhận (${targetPlayer.name}) chưa đá đủ ${minGamesReq} trận nên không thể nhận tiền!`, player.id, 0xFF4444, "bold");
    return false;
  }

  const senderData = getPlayerData(senderAuth);

  // =========================================================================
  // 💸 XỬ LÝ SỐ LƯỢT MIỄN PHÍ VÀ ĐÁNH THUẾ
  // =========================================================================
  // Lấy ngày định dạng VN để reset tự động vào lúc 0h đêm
  const today = new Date().toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

  // Nếu sang ngày mới, reset bộ đếm lượt chuyển tiền
  if (senderData.lastTransferDate !== today) {
    senderData.lastTransferDate = today;
    senderData.dailyTransfers = 0;
    senderData.dailyTransferAmount = 0;
  }

  // Giới hạn tổng số tiền chuyển trong ngày
  if ((senderData.dailyTransferAmount || 0) + amount > 500000) {
    room.sendAnnouncement(`❌ Bạn đã đạt giới hạn chuyển tiền trong ngày (500,000 🪙)!`, player.id, 0xFF4444, "bold");
    return false;
  }

  // Tính thuế (Chỉ thu 15% từ lần chuyển thứ 6 trở đi)
  let taxAmount = 0;
  let isTaxed = false;

  if (senderData.dailyTransfers >= 5) {
    taxAmount = Math.ceil(amount * 0.15); // Thuế 15% làm tròn lên
    isTaxed = true;
  }

  // Tổng tiền người gửi bị trừ (Bao gồm gốc + thuế nếu có)
  const totalDeduction = amount + taxAmount;

  if (senderData.coins < totalDeduction) {
    if (isTaxed) {
      room.sendAnnouncement(`❌ Không đủ tiền! Chuyển ${amount} 🪙 cần thêm ${taxAmount} 🪙 tiền thuế do vượt 5 lượt. (Tổng cần: ${totalDeduction}). Hiện có: ${senderData.coins} 🪙.`, player.id, 0xFF4444, "bold");
    } else {
      room.sendAnnouncement(`❌ Không đủ tiền! Bạn cần ${amount} 🪙 nhưng chỉ có: ${senderData.coins} 🪙.`, player.id, 0xFF4444, "bold");
    }
    return false;
  }

  // ==========================================
  // 🔄 THỰC THI GIAO DỊCH
  // ==========================================
  const targetData = getPlayerData(targetAuth);

  senderData.coins -= totalDeduction;
  senderData.dailyTransfers += 1; // Tăng biến đếm số lần giao dịch trong ngày lên 1
  senderData.dailyTransferAmount = (senderData.dailyTransferAmount || 0) + amount;
  targetData.coins += amount;

  savePlayerData(senderAuth, senderData);
  savePlayerData(targetAuth, targetData);

  // Ghi log chi tiết để Admin kiểm toán (Audit) khi có nghi ngờ
  if (typeof logCoinTransaction === "function") {
    let logDetail = `Chuyển cho ${targetPlayer.name}`;
    if (isTaxed) logDetail += ` (Bị đánh thuế: ${taxAmount})`;
    logCoinTransaction(player.name, senderAuth, -totalDeduction, logDetail, senderData.coins);
    logCoinTransaction(targetPlayer.name, targetAuth, amount, `Nhận từ ${player.name}`, targetData.coins);
  }

  // Thông báo trả về cho người chuyển
  if (isTaxed) {
    room.sendAnnouncement(`💸 Đã chuyển ${amount} 🪙 cho ${targetPlayer.name}. (Lượt chuyển thứ ${senderData.dailyTransfers} - Bị thu phí dịch vụ ${taxAmount} 🪙). Số dư còn lại: ${senderData.coins} 🪙.`, player.id, 0xFFCC00, "bold", 2);
  } else {
    let leftFree = 5 - senderData.dailyTransfers;
    room.sendAnnouncement(`✅ Đã chuyển miễn phí ${amount} 🪙 cho ${targetPlayer.name}. (Bạn còn ${leftFree} lượt chuyển miễn phí hôm nay). Số dư còn lại: ${senderData.coins} 🪙.`, player.id, 0x00FF00, "bold", 2);
  }

  // Thông báo trả về cho người nhận
  room.sendAnnouncement(`💰 Ting Ting! Nhận được ${amount} 🪙 từ ${player.name}. (Số dư: ${targetData.coins})`, targetPlayer.id, 0x00FF00, "bold", 2);

  // Lên Tivi chung cho cả phòng
  room.sendAnnouncement(`🏦 [NGÂN HÀNG] ${player.name} vừa chuyển khoản cho ${targetPlayer.name}!`, null, 0x00FFFF, "small-bold", 0);

  return false;
}
function updateOdds() {
  let totals = {
    winner: { red: 0, blue: 0 },
    taixiu: { tai: 0, xiu: 0 },
    keochap: { red: 0, blue: 0 },
    btts: { yes: 0, no: 0 } // Thêm khối đếm tổng tiền cho BTTS
  };

  for (const bet of bets) {
    if (totals[bet.type] && bet.choice in totals[bet.type]) {
      totals[bet.type][bet.choice] += bet.amount;
    }
  }

  // Winner odds
  const totalRed = totals.winner.red;
  const totalBlue = totals.winner.blue;
  if (totalRed + totalBlue > 0) {
    betOdds.winner.red = Math.min(100, Math.max(1.05,
      ((totalRed + totalBlue) / Math.max(totalRed, 1)) * BET_MARGIN));
    betOdds.winner.blue = Math.min(100, Math.max(1.05,
      ((totalRed + totalBlue) / Math.max(totalBlue, 1)) * BET_MARGIN));
  }

  // OverUnder (Tài xỉu) odds
  const totalOver = totals.taixiu.tai;
  const totalUnder = totals.taixiu.xiu;
  if (totalOver + totalUnder > 0) {
    betOdds.taixiu.tai = Math.min(100, Math.max(1.05,
      ((totalOver + totalUnder) / Math.max(totalOver, 1)) * BET_MARGIN));
    betOdds.taixiu.xiu = Math.min(100, Math.max(1.05,
      ((totalOver + totalUnder) / Math.max(totalUnder, 1)) * BET_MARGIN));
  }

  // Handicap (Kèo chấp) odds
  const totalHandiRed = totals.keochap.red;
  const totalHandiBlue = totals.keochap.blue;
  if (totalHandiRed + totalHandiBlue > 0) {
    betOdds.keochap.red = Math.min(100, Math.max(1.05,
      ((totalHandiRed + totalHandiBlue) / Math.max(totalHandiRed, 1)) * BET_MARGIN));
    betOdds.keochap.blue = Math.min(100, Math.max(1.05,
      ((totalHandiRed + totalHandiBlue) / Math.max(totalHandiBlue, 1)) * BET_MARGIN));
  }

  // BTTS (2 Đội ghi bàn) odds - Áp dụng cùng công thức
  // BTTS (2 Đội ghi bàn) odds - Áp dụng cùng công thức
  const totalBttsYes = totals.btts.yes;
  const totalBttsNo = totals.btts.no;
  if (totalBttsYes + totalBttsNo > 0) {
    if (!betOdds.btts) betOdds.btts = { yes: 1.5, no: 1.5 }; // 🛡️ BẢO VỆ CHỐNG CRASH HOST

    betOdds.btts.yes = Math.min(100, Math.max(1.05, ((totalBttsYes + totalBttsNo) / Math.max(totalBttsYes, 1)) * BET_MARGIN));
    betOdds.btts.no = Math.min(100, Math.max(1.05, ((totalBttsYes + totalBttsNo) / Math.max(totalBttsNo, 1)) * BET_MARGIN));
  }
}
function generateSpecialOdds() {
  betOdds.scorer = {};
  betOdds.motm = {};

  const players = getNonAfkPlayers().filter(p => p.team !== 0);

  // 📉 ĐÃ HẠ BASE ODDS (Hút máu hơn): Giảm từ 3.5 xuống 2.5
  const baseOdds = 2.5;

  for (const p of players) {
    const auth = getAuth(p.id);
    if (!auth) continue;

    // Ngẫu nhiên hóa odds: Với base 2.5, tỉ lệ lớn nhất chỉ có thể chạm mốc x3.5 (Thay vì x4.9 như cũ)
    const randomFactor = 0.6 + Math.random() * 0.8;
    const scorerOdds = Math.max(1.5, baseOdds * randomFactor);
    const motmOdds = Math.max(1.5, baseOdds * randomFactor);

    betOdds.scorer[p.name] = scorerOdds;
    betOdds.motm[p.name] = motmOdds;
  }

  // Kèo không ai ghi bàn (0-0) cũng hạ tỉ lệ ăn xuống
  betOdds.scorer["Không ai ghi bàn"] = 3.5;
}
function startOddsUpdater() {
  if (typeof oddsUpdateInterval !== 'undefined' && oddsUpdateInterval) {
    clearInterval(oddsUpdateInterval);
  }

  let predictTime = typeof PREDICTION_PERIOD !== "undefined" ? PREDICTION_PERIOD : 60;
  let lastAnnouncedOdds = ""; // Lưu lại trạng thái tỉ lệ cũ
  let lastAnnounceTime = 0;   // Lưu thời điểm thông báo cuối cùng
  let hasAnnouncedClosed = false; // Tránh báo đóng kèo 2 lần

  const COOLDOWN_TIME = 20000; // Cooldown 20 giây giữa 2 lần thông báo

  oddsUpdateInterval = setInterval(() => {
    if (typeof updateOdds === "function") updateOdds();

    let scores = room.getScores();
    if (!scores) return;

    // 🛑 DỪNG PHÁT THANH NẾU KÈO ĐÃ BỊ KHÓA SỚM (CÓ BÀN THẮNG)
    if (isBettingClosedEarly) {
      clearInterval(oddsUpdateInterval);
      return;
    }

    // NẾU CÒN THỜI GIAN ĐẶT CƯỢC
    if (scores.time <= predictTime) {
      // Chỉ báo tỉ lệ nếu KHÔNG PHẢI map 1v1, 3v3, training
      let isOfficialMap = typeof stadium !== "undefined" && stadium.name &&
        !stadium.name.includes("1v1") &&
        !stadium.name.includes("3v3") &&
        !stadium.name.includes("training");

      if (isOfficialMap) {
        // Tạo một chuỗi ID đại diện cho tất cả tỉ lệ cược hiện tại
        let currentOddsState = `${betOdds.winner.red.toFixed(2)}-${betOdds.winner.blue.toFixed(2)}-` +
          `${betOdds.taixiu.tai.toFixed(2)}-${betOdds.taixiu.xiu.toFixed(2)}-` +
          `${betOdds.keochap.red.toFixed(2)}-${betOdds.keochap.blue.toFixed(2)}-` +
          `${betOdds.btts.yes.toFixed(2)}-${betOdds.btts.no.toFixed(2)}`;

        let now = Date.now();

        // CHỈ THÔNG BÁO NẾU: Tỉ lệ có thay đổi SO VỚI LẦN TRƯỚC + Đã qua Cooldown 20s
        if (currentOddsState !== lastAnnouncedOdds && (now - lastAnnounceTime >= COOLDOWN_TIME)) {
          let msg = `📊 TỈ LỆ LIVE (Còn ${Math.ceil(predictTime - scores.time)}s):\n`;
          msg += `🔴 RED: x${betOdds.winner.red.toFixed(2)} | 🔵 BLUE: x${betOdds.winner.blue.toFixed(2)}\n`;
          msg += `📈 TÀI: x${betOdds.taixiu.tai.toFixed(2)} | 📉 XỈU: x${betOdds.taixiu.xiu.toFixed(2)}\n`;
          msg += `⚔️ Chấp RED: x${betOdds.keochap.red.toFixed(2)} | 🛡️ Chấp BLUE: x${betOdds.keochap.blue.toFixed(2)}\n`;
          msg += `🔥 BTTS (2 Đội ghi bàn): YES (x${betOdds.btts.yes.toFixed(2)}) | NO (x${betOdds.btts.no.toFixed(2)})`;

          room.sendAnnouncement(msg, null, 0x00FFFF, "bold", 1);

          // Cập nhật lại lịch sử để so sánh cho lần sau
          lastAnnouncedOdds = currentOddsState;
          lastAnnounceTime = now;
        }
      }
    }
    // KHI VỪA HẾT GIỜ BÌNH THƯỜNG
    else if (!hasAnnouncedClosed) {
      room.sendAnnouncement("🔒 ĐÃ HẾT THỜI GIAN ĐẶT CƯỢC! Bảng kèo đã đóng, chúc anh em may mắn!", null, 0xFF4444, "bold", 2);
      hasAnnouncedClosed = true;
      clearInterval(oddsUpdateInterval);
    }
  }, typeof ODDS_UPDATE_INTERVAL !== "undefined" ? ODDS_UPDATE_INTERVAL : 5000);
  // Rút ngắn vòng lặp kiểm tra của setInterval xuống còn 5s để hệ thống phản ứng mượt hơn, do đã có cooldown 20s bảo vệ phía trên.
}
function settleBets(winner, score, scorers, motmAuth) {
  // 1. CHUẨN BỊ KẾT QUẢ TRẬN ĐẤU
  const result = {
    winner: winner === 1 ? "red" : (winner === 2 ? "blue" : "draw"),
    totalGoals: score.red + score.blue,
    taixiu: (score.red + score.blue) > 3.5 ? "tai" : "xiu",
    btts: (score.red > 0 && score.blue > 0) ? "yes" : "no",
    handicapWinner: null,
    tiso: `${score.red}-${score.blue}`,
    scorers: scorers,
    motm: motmAuth
  };

  // ===============================================================
  // ⚔️ THANH TOÁN TIỀN TRUY NÃ (BOUNTY)
  // ===============================================================
  // Nếu hoà thì hoàn lại tiền truy nã cho người đặt
  if (typeof activeBounties !== "undefined" && Object.keys(activeBounties).length > 0 && result.winner === "draw") {
    for (let targetAuth in activeBounties) {
      let bounty = activeBounties[targetAuth];
      if (bounty.depositors && bounty.depositors.length > 0) {
        for (let dep of bounty.depositors) {
          let depData = getPlayerData(dep.auth);
          if (depData) {
            depData.coins += dep.amount;
            savePlayerData(dep.auth, depData);
            if (typeof logCoinTransaction === "function") {
              let depName = room.getPlayerList().find(p => getAuth(p.id) === dep.auth);
              let dName = depName ? depName.name : dep.auth;
              logCoinTransaction(dName, dep.auth, dep.amount, `Hoàn truy nã (Trận hòa - ${bounty.name})`, depData.coins);
            }
          }
        }
      }
    }
    room.sendAnnouncement(`🏳️ TRẪN HÒA: Toàn bộ tiền truy nã đã được hoàn trả cho người đặt!`, null, 0xAAAAAA, "bold", 1);
    activeBounties = {};
  }

  if (typeof activeBounties !== "undefined" && Object.keys(activeBounties).length > 0 && result.winner !== "draw") {
    let winTeamId = result.winner === "red" ? 1 : 2;

    for (let targetAuth in activeBounties) {
      let bounty = activeBounties[targetAuth];
      let winningPlayers = room.getPlayerList().filter(p => p.team === winTeamId);

      if (bounty.team === winTeamId) {
        let targetData = getPlayerData(targetAuth);
        if (targetData) {
          let survivalReward = Math.floor(bounty.amount * 0.9);
          targetData.coins += survivalReward;
          savePlayerData(targetAuth, targetData);
          if (typeof logCoinTransaction === "function") logCoinTransaction(bounty.name, targetAuth, survivalReward, "Sống sót truy nã", targetData.coins);
          room.sendAnnouncement(`🛡️ KẺ SỐNG SÓT: [${bounty.name}] đã chiến thắng trận đấu và ẵm trọn ${survivalReward} 🪙 tiền truy nã!`, null, 0x00FFFF, "bold", 2);
        }
      } else {
        if (winningPlayers.length > 0) {
          let splitAmount = Math.floor(bounty.amount / winningPlayers.length);
          for (let p of winningPlayers) {
            let pAuth = getAuth(p.id);
            if (!pAuth) continue;
            let pData = getPlayerData(pAuth);
            if (pData) {
              pData.coins += splitAmount;
              savePlayerData(pAuth, pData);
              if (typeof logCoinTransaction === "function") logCoinTransaction(p.name, pAuth, splitAmount, `Hạ gục truy nã ${bounty.name}`, pData.coins);
            }
          }
          room.sendAnnouncement(`🔪 SĂN TIỀN THƯỞNG: [${bounty.name}] đã bị hạ gục! Đội ${result.winner.toUpperCase()} được chia đều mỗi người ${splitAmount} 🪙 tiền truy nã!`, null, 0xFF00FF, "bold", 2);
        }
      }
    }
    activeBounties = {};
  }

  // ===============================================================
  // 🛑 KIỂM TRA ĐIỀU KIỆN CÁ CƯỢC (BET)
  // ===============================================================
  const resetOdds = () => {
    betOdds = {
      winner: { red: 1.5, blue: 1.5 }, taixiu: { tai: 1.8, xiu: 1.8 },
      keochap: { red: 1.5, blue: 1.5 }, btts: { yes: 1.8, no: 1.8 },
      tiso: {}, scorer: {}, motm: {}
    };
  };

  if (bets.length === 0) {
    resetOdds();
    return;
  }

  // Chống bào tiền Nhà cái (Hoàn trả chuẩn có Phí phụ trội)
  const uniqueBettors = new Set(bets.map(b => b.auth)).size;
  if (uniqueBettors < 2) {
    for (const bet of bets) {
      if (!bet.auth) continue;
      const data = getPlayerData(bet.auth);
      if (data) {
        let refundAmount = bet.amount;
        data.coins += refundAmount;
        savePlayerData(bet.auth, data);
        if (typeof logCoinTransaction === "function") {
          let betName = bet.name || "OfflinePlayer";
          logCoinTransaction(betName, bet.auth, refundAmount, "Hủy kèo vì thiếu người cược", data.coins);
        }

        let pInRoom = room.getPlayerList().find(p => p.id !== 0 && getAuth(p.id) === bet.auth);
        if (pInRoom) {
          room.sendAnnouncement(`🔄 HỦY KÈO: Hệ thống hoàn trả ${refundAmount} 🪙 vì không đủ người cá cược (Yêu cầu >= 2).`, pInRoom.id, 0xFFFF00, "bold", 2);
        }
      }
    }
    bets = [];
    resetOdds();
    return;
  }

  // ==========================================
  // 🎯 LOGIC TÍNH THẮNG THUA KÈO CHẤP
  // ==========================================
  if (currentHandicap.value === 0) {
    result.handicapWinner = result.winner;
  } else {
    let adjustedRedScore = score.red;
    let adjustedBlueScore = score.blue;
    if (currentHandicap.team === "red") adjustedRedScore -= currentHandicap.value;
    else if (currentHandicap.team === "blue") adjustedBlueScore -= currentHandicap.value;

    if (adjustedRedScore > adjustedBlueScore) result.handicapWinner = "red";
    else if (adjustedBlueScore > adjustedRedScore) result.handicapWinner = "blue";
    else result.handicapWinner = "draw";
  }

  // ==========================================
  // 💰 TÍNH TOÁN QUỸ THƯỞNG VÀ TRẢ THƯỞNG
  // ==========================================
  let pools = {
    winner: { red: 0, blue: 0, total: 0 },
    taixiu: { tai: 0, xiu: 0, total: 0 },
    keochap: { red: 0, blue: 0, draw: 0, total: 0 },
    btts: { yes: 0, no: 0, total: 0 }
  };

  for (const bet of bets) {
    if (pools[bet.type] && pools[bet.type][bet.choice] !== undefined) {
      pools[bet.type][bet.choice] += bet.amount;
      pools[bet.type].total += bet.amount;
    }
  }

  const HOUSE_EDGE = 0.05;

  for (const bet of bets) {
    let win = false;
    let isDrawRefund = false;

    switch (bet.type) {
      case "winner":
        if (result.winner === "draw") isDrawRefund = true;
        else win = bet.choice === result.winner;
        break;
      case "taixiu": win = bet.choice === result.taixiu; break;
      case "btts": win = bet.choice === result.btts; break;
      case "keochap":
        if (result.handicapWinner === "draw") isDrawRefund = true;
        else win = bet.choice === result.handicapWinner;
        break;
      case "tiso": win = bet.choice === result.tiso; break;
      case "scorer": win = result.scorers.includes(bet.targetAuth); break;
      case "motm": win = bet.targetAuth === result.motm; break;
    }

    if (!bet.auth) continue;
    const data = getPlayerData(bet.auth);
    if (!data) continue;

    let pInRoom = room.getPlayerList().find(p => p.id !== 0 && getAuth(p.id) === bet.auth);
    const bettorName = pInRoom ? pInRoom.name : (bet.name || "OfflinePlayer");

    // 🎯 THỰC THI HOÀN TIỀN CHO TRƯỜNG HỢP HÒA KÈO
    if (isDrawRefund) {
      data.coins += bet.amount;
      savePlayerData(bet.auth, data);
      if (typeof logCoinTransaction === "function") {
        logCoinTransaction(bettorName, bet.auth, bet.amount, `Hòa kèo ${bet.type.toUpperCase()}`, data.coins);
      }
      if (pInRoom) room.sendAnnouncement(`🤝 HÒA KÈO ${bet.type.toUpperCase()}! Hệ thống hoàn trả lại ${bet.amount} coins tiền gốc.`, pInRoom.id, 0xFFFF00, "bold", 2);
      continue;
    }

    // TIẾP TỤC LOGIC TRẢ THƯỞNG CŨ NẾU THẮNG
    if (win) {
      let payout = 0;
      let finalOdds = 0;

      if (pools[bet.type]) {
        let rewardPool = pools[bet.type].total * (1 - HOUSE_EDGE);
        let winningPool = pools[bet.type][bet.choice];

        if (winningPool > 0) {
          let userShare = bet.amount / winningPool;
          payout = Math.floor(rewardPool * userShare);

          if (payout <= bet.amount) {
            let defaultOdd = 1.5;
            if (bet.type === "taixiu" || bet.type === "btts") defaultOdd = 1.8;
            let appliedOdd = bet.odds ? Math.max(bet.odds, defaultOdd) : defaultOdd;
            let minPayout = Math.floor(bet.amount * appliedOdd);
            // Chỉ áp dụng minimum odds nếu quỹ đủ chi trả, tránh tạo coin từ hư vô
            if (minPayout * (winningPool / bet.amount) <= rewardPool) {
              payout = minPayout;
              finalOdds = appliedOdd;
            } else {
              payout = Math.floor(rewardPool * bet.amount / winningPool);
              if (payout < bet.amount) {
                payout = bet.amount; // 🛡️ Bảo hiểm: Thắng cược chắc chắn không bị lỗ tiền gốc
              }
              finalOdds = payout / bet.amount;
            }
          } else {
            finalOdds = payout / bet.amount;
          }
        } else {
          payout = bet.amount;
          finalOdds = 1;
        }
      } else {
        let staticOdd = bet.odd || bet.odds || 1;
        payout = Math.floor(bet.amount * staticOdd);
        finalOdds = staticOdd;
      }

      data.coins += payout;
      savePlayerData(bet.auth, data);

      if (pInRoom) {
        let oddMsg = finalOdds === 1 ? "Hoàn gốc" : `x${finalOdds.toFixed(2)}`;
        room.sendAnnouncement(`🎉 Thắng cược ${bet.type}: ${bet.choice}! Nhận ${payout} 🪙 (${oddMsg})`, pInRoom.id, 0x00FF00, "bold", 2);
      }

      setTimeout(() => {
        if (typeof logCoinTransaction === "function") logCoinTransaction(bettorName, bet.auth, payout, `Thắng cược kèo ${bet.type} [${bet.choice}]`, data.coins);
      }, Math.random() * 3000);

    } else {
      if (pInRoom) room.sendAnnouncement(`😞 Thua cược ${bet.type}: ${bet.choice}. Mất ${bet.amount} 🪙.`, pInRoom.id, 0xFF4444, "small", 0);
    }
  }

  bets = [];
  resetOdds();
  // ===============================================================
  // 🏆 KIỂM TRA THỬ THÁCH HARDCORE (KỶ LỤC TRẬN ĐẤU)
  // Chỉ chạy nếu phòng có từ 4 người trở lên (Chống cày clone 1v1)
  // ===============================================================
  let activePlayers = room.getPlayerList().filter(p => p.id !== 0 && p.team !== 0);

  if (activePlayers.length >= 4) {

    // 1. KỶ LỤC BẤT BẠI (Chuỗi 15 Trận Thắng) - Chỉ tính khi CÓ ĐỘI THẮNG
    if (result.winner !== "draw") {
      let winTeamId = result.winner === "red" ? 1 : 2;
      let winningPlayers = activePlayers.filter(p => p.team === winTeamId);
      let losingPlayers = activePlayers.filter(p => p.team !== winTeamId);

      // Đội thắng được cộng dồn chuỗi
      for (let p of winningPlayers) {
        let pAuth = getAuth(p.id);
        if (!pAuth) continue;
        let data = getPlayerData(pAuth); // 🛡️ FIX BUG #2: Dùng pAuth thay vì p.id để không ghi đè data gốc
        data.currentWinStreak = (data.currentWinStreak || 0) + 1;

        if (data.currentWinStreak === 15) {
          data.gems = (data.gems || 0) + 5;
          data.currentWinStreak = 0; // Đạt mốc thì reset lại cày vòng mới
          if (typeof logCoinTransaction === "function") logCoinTransaction(p.name, pAuth, 5, "Chuỗi 15 trận thắng (💎)", data.gems);
          room.sendAnnouncement(`🏆 [KỶ LỤC BẤT BẠI]: KHÔNG THỂ CẢN PHÁ! [${p.name}] vừa đạt chuỗi 15 TRẬN THẮNG LIÊN TIẾP và nhận được 5 💎 CAO CẤP!`, null, 0xFFD700, "bold", 2);
        }
        savePlayerData(pAuth, data);
      }

      // Đội thua bị bẻ gãy chuỗi về 0
      for (let p of losingPlayers) {
        let pAuth = getAuth(p.id);
        if (!pAuth) continue;
        let data = getPlayerData(pAuth);
        if (data.currentWinStreak && data.currentWinStreak > 0) {
          data.currentWinStreak = 0;
          savePlayerData(pAuth, data);
        }
      }
    }

    // 2. KỶ LỤC POKER (Ghi 4 Bàn/Trận) - Bất chấp Thắng/Thua hay Hòa
    for (let i = 1; i <= 2; i++) {
      for (const [sAuth, stats] of Object.entries(game.teams[i].players)) {
        // Truy xuất trực tiếp số bàn thắng thực tế (stats.goals)
        if (stats.goals >= 4) {
          let sData = getPlayerData(sAuth);
          if (sData) {
            sData.gems = (sData.gems || 0) + 2;
            savePlayerData(sAuth, sData);

            // Lấy tên hiện tại, nếu cầu thủ vừa Out game thì lấy tên lưu trong stats
            let pObj = activePlayers.find(p => getAuth(p.id) === sAuth);
            let pName = pObj ? pObj.name : stats.name;
            if (typeof logCoinTransaction === "function") logCoinTransaction(pName, sAuth, 2, "Ghi 4 bàn/trận (💎)", sData.gems);

            room.sendAnnouncement(`⚽ [KỶ LỤC POKER]: QUÁ KHỦNG KHIẾP!!! [${pName}] vừa ghi ${stats.goals} bàn trong một trận đấu và được thưởng nóng 2 💎!`, null, 0x00FFFF, "bold", 2);
          }
        }
      }
    }
  }
}
// Biến lưu thời gian chờ để chống spam làm lag server
const gamblingCooldowns = {};

function spinFunc(value, player) {
  // 1. Chống Spam (Cooldown 3 giây)
  if (gamblingCooldowns[player.id] && Date.now() < gamblingCooldowns[player.id]) {
    room.sendAnnouncement(`⏳ Vui lòng đợi ${((gamblingCooldowns[player.id] - Date.now()) / 1000).toFixed(1)}s để quay tiếp!`, player.id, 0xFF4444);
    return false;
  }

  const auth = getAuth(player.id);
  if (!auth) return false;
  let data = getPlayerData(auth);

  // 2. Xử lý tiền cược
  let amount;
  if (value.trim().toLowerCase() === "all") amount = data.coins;
  else amount = parseInt(value.trim(), 10);

  let minSpin = 100; // Giá tối thiểu 100 để hạn chế spam lẻ tẻ
  if (isNaN(amount) || amount < minSpin) {
    room.sendAnnouncement(`❌ Lệnh sai hoặc cược quá nhỏ! Tối thiểu ${minSpin} 🪙. Cú pháp: !spin <số tiền>`, player.id, 0xFF4444);
    return false;
  }
  if (amount > 1000) {
    room.sendAnnouncement(`❌ Vòng quay chỉ chấp nhận tối đa 1000 🪙 mỗi lần để chống lạm phát!`, player.id, 0xFF4444, "bold", 2);
    return false;
  }
  if (amount > data.coins) {
    room.sendAnnouncement(`❌ Bạn không đủ tiền! (Hiện có: ${data.coins} 🪙)`, player.id, 0xFF4444);
    return false;
  }

  // Khóa cooldown và trừ tiền gốc
  gamblingCooldowns[player.id] = Date.now() + 3000;
  data.coins -= amount;

  // ==========================================================
  // Tỉ lệ trúng thưởng
  // ==========================================================
  const rand = Math.random();
  let mult = 0, msg = "", color = 0xFFFFFF;

  if (rand < 0.80) { mult = 0; msg = "Mất Trắng 😭"; color = 0xFF4444; }       // 80% Thua sạch
  else if (rand < 0.90) { mult = 0.5; msg = "Gãy một nửa 📉"; color = 0xFFA500; }       // 10% Thua nửa
  else if (rand < 0.96) { mult = 1.2; msg = "Lời cái nịt 🤏"; color = 0x00FF00; }       // 6% Ăn 1.2x
  else if (rand < 0.99) { mult = 2.0; msg = "X2 TÀI KHOẢN ✌️"; color = 0x00FFFF; }       // 3% Ăn 2x
  else if (rand < 0.999) { mult = 5.0; msg = "NỔ HŨ X5 🎰"; color = 0xFF00FF; }          // 0.9% Ăn 5x
  else { mult = 10.0; msg = "👑 JACKPOT X10 ĐẠI GIA 💎"; color = 0xFFD700; } // 0.1% Trúng độc đắc
  // ==========================================================

  // 4. Trả thưởng
  let winAmount = Math.floor(amount * mult);
  data.coins += winAmount;
  savePlayerData(auth, data);

  // 5. Ghi Log Discord
  if (typeof logCoinTransaction === "function") {
    let profit = winAmount - amount;
    logCoinTransaction(player.name, auth, profit, `Vòng quay may mắn (!spin): Cược ${amount} 🪙, Hệ số x${mult}`, data.coins);
  }

  // 6. Thông báo
  room.sendAnnouncement(`🎡 VÒNG QUAY MAY MẮN: [ ${msg} ]`, player.id, color, "bold", 2);

  // Phát loa toàn phòng nếu trúng lớn
  if (mult >= 2.0) {
    room.sendAnnouncement(`🎉 ĐẠI GIA ${player.name} vừa nổ vòng quay x${mult}! Đổi ${amount} 🪙 ➡️ ${winAmount} 🪙!`, null, color, "bold", 2);
    room.sendAnnouncement(`💸 Bạn cược ${amount} 🪙, thu về ${winAmount} 🪙. Số dư: ${data.coins} 🪙`, player.id, color);
  } else {
    room.sendAnnouncement(`💸 Bạn cược ${amount} 🪙, thu về ${winAmount} 🪙. Số dư: ${data.coins} 🪙`, player.id, color);
  }
}

function slotFunc(value, player) {
  if (gamblingCooldowns[player.id] && Date.now() < gamblingCooldowns[player.id]) {
    room.sendAnnouncement(`⏳ Máy Slot đang kẹt, đợi ${((gamblingCooldowns[player.id] - Date.now()) / 1000).toFixed(1)}s nữa!`, player.id, 0xFF4444);
    return false;
  }

  const auth = getAuth(player.id);
  if (!auth) return false;
  let data = getPlayerData(auth);

  let amount;
  if (value.trim().toLowerCase() === "all") amount = data.coins;
  else amount = parseInt(value.trim(), 10);

  let minSlot = 100;
  if (isNaN(amount) || amount < minSlot) {
    room.sendAnnouncement(`❌ Kéo máy Slot tối thiểu ${minSlot} coins. Cú pháp: !slot <số tiền>`, player.id, 0xFF4444);
    return false;
  }
  if (amount > 1000) {
    room.sendAnnouncement(`❌ Máy Slot chỉ nhận tối đa 1000 🪙 mỗi lần để chống lạm phát!`, player.id, 0xFF4444, "bold", 2);
    return false;
  }
  if (amount > data.coins) {
    room.sendAnnouncement(`❌ Bạn không đủ tiền! (Hiện có: ${data.coins} 🪙)`, player.id, 0xFF4444);
    return false;
  }

  gamblingCooldowns[player.id] = Date.now() + 4000; // Slot quay lâu hơn chút
  data.coins -= amount;

  // 6 Biểu tượng ngẫu nhiên (Làm cho khó trúng hơn)
  const symbols = ["🍒", "🍋", "🍇", "🔔", "💎", "7️⃣"];
  let s1 = symbols[Math.floor(Math.random() * symbols.length)];
  let s2 = symbols[Math.floor(Math.random() * symbols.length)];
  let s3 = symbols[Math.floor(Math.random() * symbols.length)];

  let mult = 0;
  let resultMsg = "Trắng tay...";
  let color = 0xAAAAAA;

  // Tính kết quả
  if (s1 === s2 && s2 === s3) {
    // 3 biểu tượng giống hệt nhau
    if (s1 === "7️⃣") { mult = 30; resultMsg = "👑 SIÊU JACKPOT!!!"; color = 0xFFD700; }
    else if (s1 === "💎") { mult = 15; resultMsg = "💎 Bão Kim Cương!"; color = 0x00FFFF; }
    else if (s1 === "🔔") { mult = 8; resultMsg = "🔔 Chuông Vàng!"; color = 0xFFFF00; }
    else if (s1 === "🍇") { mult = 4; resultMsg = "🍇 Chùm Nho May Mắn!"; color = 0xAA00FF; }
    else { mult = 2; resultMsg = "🍒 Trúng Trái Cây!"; color = 0xFF00FF; }
  } else if (s1 === s2 || s2 === s3 || s1 === s3) {
    // Có 2 biểu tượng giống nhau (Giải khuyến khích)
    mult = 0.2; resultMsg = "Hoàn 20% tiền gốc!"; color = 0x00FF00;
  }

  let winAmount = Math.floor(amount * mult);
  data.coins += winAmount;
  savePlayerData(auth, data);

  if (typeof logCoinTransaction === "function") {
    logCoinTransaction(player.name, auth, winAmount - amount, `Slot Machine (!slot): Cược ${amount} 🪙 [${s1}${s2}${s3}]`, data.coins);
  }

  // In kết quả máy Slot
  room.sendAnnouncement(`🎰 [ ${s1} | ${s2} | ${s3} ] 🎰`, player.id, 0xFFFFFF, "bold", 2);
  room.sendAnnouncement(`Kết quả: ${resultMsg} (x${mult}) | Nhận: ${winAmount} 🪙. Số dư: ${data.coins} 🪙`, player.id, color, "bold", 1);

  if (mult >= 5) {
    room.sendAnnouncement(`🎰 THẦN BÀI ${player.name} vừa kéo trúng [ ${s1} | ${s2} | ${s3} ] ăn được ${winAmount} 🪙!`, null, color, "bold", 2);
  }
}
// ==========================================
// 🎲 MINIGAME 1: TUNG ĐỒNG XU (TÀI / XỈU)
// ==========================================
function coinflipFunc(value, player) {
  const auth = getAuth(player.id);
  if (!auth) return false;
  const data = getPlayerData(auth);

  if (!value) {
    room.sendAnnouncement("🎲 Cú pháp: !cf <tai/xiu> <tiền>", player.id, 0xFFD700);
    return false;
  }
  const parts = value.trim().split(/\s+/);
  if (parts.length < 2) return false;

  const choice = parts[0].toLowerCase();
  const amountStr = parts[1];
  if (choice !== "tai" && choice !== "xiu") {
    room.sendAnnouncement("❌ Lựa chọn không hợp lệ! Vui lòng chọn 'tai' hoặc 'xiu'.", player.id, 0xFF4444);
    return false;
  }

  let amount = amountStr.toLowerCase() === "all" ? data.coins : parseInt(amountStr, 10);
  if (isNaN(amount) || amount < 100) {
    room.sendAnnouncement("❌ Tiền cược tối thiểu 100 🪙.", player.id, 0xFF4444);
    return false;
  }
  if (amount > 1000) {
    room.sendAnnouncement(`❌ Tung đồng xu chỉ nhận tối đa 1000 🪙 mỗi lần để chống lạm phát!`, player.id, 0xFF4444, "bold", 2);
    return false;
  }
  if (amount > data.coins) {
    room.sendAnnouncement(`❌ Không đủ tiền! Hiện có: ${data.coins} 🪙.`, player.id, 0xFF4444);
    return false;
  }

  // Khấu trừ tiền cược
  data.coins -= amount;

  // ==========================================
  // Tỉ lệ tung đồng xu
  // ==========================================

  // Bot ép lật ngược kết quả, người chơi chỉ còn 10% cơ hội thắng
  const winRate = 0.1;

  let result;
  if (Math.random() < winRate) {
    // Rơi vào % may mắn: Bot cho ra kết quả trùng với lựa chọn của người chơi
    result = choice;
  } else {
    // Rơi vào % xui xẻo: Bot cố tình lật ngược kết quả lại để thu tiền
    result = (choice === "tai") ? "xiu" : "tai";
  }

  const resultName = result === "tai" ? "TÀI" : "XỈU";

  // Quyết toán
  if (choice === result) {
    let winAmount = Math.floor(amount * 1.95); // Nhà cái thu phế 5%
    data.coins += winAmount;
    room.sendAnnouncement(`🎲 TUNG ĐỒNG XU: Kết quả là [${resultName}]! Bạn đã xuất sắc lách khe và húp ${winAmount} 🪙. (Số dư: ${data.coins} 🪙)`, player.id, 0x00FF00, "bold", 1);
  } else {
    room.sendAnnouncement(`🎲 TUNG ĐỒNG XU: Kết quả là [${resultName}]! Bạn đã đoán sai và mất trắng ${amount} 🪙. (Số dư: ${data.coins} 🪙)`, player.id, 0xFF4444, "bold", 1);
  }

  savePlayerData(auth, data);
  if (typeof logCoinTransaction === "function") {
    let profit = (choice === result) ? Math.floor(amount * 1.95) - amount : -amount;
    let resultLog = (choice === result) ? "Thắng" : "Thua";
    logCoinTransaction(player.name, auth, profit, `Tung đồng xu (!cf) ${resultLog} [${choice}]`, data.coins);
  }
  return false;
}

// ==========================================
// ✌️ MINIGAME 2: KÉO - BÚA - BAO
// ==========================================
function kbbFunc(value, player) {
  const auth = getAuth(player.id);
  if (!auth) return false;
  const data = getPlayerData(auth);

  if (!value) {
    room.sendAnnouncement("✌️ Cú pháp: !kbb <keo/bua/bao> <tiền>", player.id, 0xFFD700);
    return false;
  }
  const parts = value.trim().split(/\s+/);
  if (parts.length < 2) return false;

  const choice = parts[0].toLowerCase();
  const amountStr = parts[1];
  const validChoices = ["keo", "bua", "bao"];
  if (!validChoices.includes(choice)) {
    room.sendAnnouncement("❌ Lựa chọn không hợp lệ! Vui lòng chọn: keo, bua, hoặc bao.", player.id, 0xFF4444);
    return false;
  }

  let amount = amountStr.toLowerCase() === "all" ? data.coins : parseInt(amountStr, 10);
  if (isNaN(amount) || amount < 100) {
    room.sendAnnouncement("❌ Tiền cược tối thiểu 100 🪙.", player.id, 0xFF4444);
    return false;
  }
  if (amount > 1000) {
    room.sendAnnouncement(`❌ Oẳn tù tì chỉ nhận tối đa 1000 🪙 mỗi lần để chống lạm phát!`, player.id, 0xFF4444, "bold", 2);
    return false;
  }
  if (amount > data.coins) {
    room.sendAnnouncement(`❌ Bạn không đủ tiền! (Hiện có: ${data.coins} 🪙)`, player.id, 0xFF4444);
    return false;
  }

  data.coins -= amount;

  // Bot ép lật tỉ lệ: 10% người thắng, 15% hòa, 75% bot thắng
  let botChoice;
  let rand = Math.random();
  const winningCounter = { "keo": "bua", "bua": "bao", "bao": "keo" }; // bot thắng
  const losingCounter = { "keo": "bao", "bua": "keo", "bao": "bua" }; // người thắng

  if (rand < 0.10) {
    botChoice = losingCounter[choice]; // 10% người chơi thắng
  } else if (rand < 0.25) {
    botChoice = choice; // 15% hòa
  } else {
    botChoice = winningCounter[choice]; // 75% bot thắng
  }
  const icons = { "keo": "✌️ Kéo", "bua": "✊ Búa", "bao": "🖐️ Bao" };

  let resultMsg = "";
  let color = 0xFFFFFF;
  let profit = 0;

  if (choice === botChoice) {
    data.coins += amount; // Hòa trả lại tiền
    resultMsg = `HÒA NHAU! Hệ thống hoàn trả ${amount} 🪙.`;
    color = 0xFFA500;
  } else if (
    (choice === "keo" && botChoice === "bao") ||
    (choice === "bua" && botChoice === "keo") ||
    (choice === "bao" && botChoice === "bua")
  ) {
    let winAmount = Math.floor(amount * 1.95);
    data.coins += winAmount; // Thắng
    resultMsg = `BẠN THẮNG! Húp trọn ${winAmount} 🪙.`;
    color = 0x00FF00;
    profit = winAmount - amount;
  } else {
    resultMsg = `BẠN THUA! Mất sạch ${amount} 🪙.`;
    color = 0xFF4444;
    profit = -amount;
  }

  room.sendAnnouncement(`🤖 Máy ra [${icons[botChoice]}] VS Bạn ra [${icons[choice]}] 👤`, player.id, 0x00FFFF, "bold", 1);
  room.sendAnnouncement(`👉 KẾT QUẢ: ${resultMsg} (Số dư: ${data.coins} 🪙)`, player.id, color, "bold", 1);
  savePlayerData(auth, data);
  if (typeof logCoinTransaction === "function") {
    let kbbResult = profit > 0 ? "Thắng" : profit < 0 ? "Thua" : "Hòa";
    logCoinTransaction(player.name, auth, profit, `Oẳn tù tì (!kbb) - ${kbbResult}`, data.coins);
  }
  return false;
}

// ==========================================
// 🎣 MINIGAME 3: CÂU CÁ (TÌM KIM CƯƠNG)
// ==========================================
let fishingCooldowns = {};
function cauCaFunc(value, player) {
  const auth = getAuth(player.id);
  if (!auth) return false;
  const data = getPlayerData(auth);

  let now = Date.now();
  if (fishingCooldowns[auth] && now < fishingCooldowns[auth]) {
    let left = Math.ceil((fishingCooldowns[auth] - now) / 60000);
    room.sendAnnouncement(`⏳ Hồ câu đang cạn cá! Hãy quay lại sau ${left} phút nữa.`, player.id, 0xFF4444);
    return false;
  }

  const FISHING_COST = 300; // Giá mua mồi câu
  if (data.coins < FISHING_COST) {
    room.sendAnnouncement(`❌ Bạn không đủ ${FISHING_COST} 🪙 để mua mồi câu cá!`, player.id, 0xFF4444);
    return false;
  }

  // Thu tiền mồi và set thời gian hồi chiêu (5 phút)
  data.coins -= FISHING_COST;
  fishingCooldowns[auth] = now + (5 * 60 * 1000);

  // Gieo xúc xắc tỉ lệ câu cá (TỈ LỆ CỰC KHÓ)
  const rand = Math.random();
  let msg = "";
  let color = 0xFFFFFF;
  let netProfit = -FISHING_COST;

  if (rand < 0.70) { // 70% Câu trúng rác (Lỗ)
    msg = `Bạn quăng cần và câu được một chiếc [Chiếc Giày Rách] 🥾! Lỗ mất ${FISHING_COST} 🪙 tiền mồi.`;
    color = 0xAAAAAA;
  }
  else if (rand < 0.90) { // 20% Cá Cơm (Lời ít)
    let reward = Math.floor(Math.random() * 150) + 300; // 300 - 450
    data.coins += reward;
    netProfit += reward;
    msg = `Cá cắn câu! Bạn giật được một chú [Cá Cơm] 🐟 và bán được ${reward} 🪙.`;
    color = 0x00FF00;
  }
  else if (rand < 0.98) { // 8% Cá Chép (Lời vừa)
    let reward = Math.floor(Math.random() * 400) + 700; // 700 - 1100
    data.coins += reward;
    netProfit += reward;
    msg = `Quá đỉnh! Bạn câu được một con [Cá Chép Khổng Lồ] 🎏! Thương lái thu mua với giá ${reward} 🪙.`;
    color = 0x00FFFF;
  }
  else if (rand < 0.998) { // 1.8% Cá Mập (Lời khủng)
    let reward = Math.floor(Math.random() * 1000) + 2000; // 2000 - 3000
    data.coins += reward;
    netProfit += reward;
    msg = `CẢNH BÁO!!! Bạn dũng cảm tay không kéo lên bờ một con [CÁ MẬP TRẮNG] 🦈! Nhận ngay phần thưởng ${reward} 🪙!`;
    color = 0xFF8800;
  }
  else { // 0.2% Rương kho báu (Kim cương)
    data.gems = (data.gems || 0) + 1;
    if (typeof logCoinTransaction === "function") logCoinTransaction(player.name, auth, 1, "Rương báu câu cá (💎)", data.gems);
    msg = `Trời ơi!!! Bạn vô tình câu được một [RƯƠNG BÁU VẬT CỔ] 🏴☠️! Bên trong có chứa 1 💎 KIM CƯƠNG CAO CẤP!`;
    color = 0xFF00FF;
    room.sendAnnouncement(`🎉 TIN CHẤN ĐỘNG: Ngư dân [${player.name}] vừa câu được KIM CƯƠNG 💎 tại Hồ câu Haxball!`, null, 0xFF00FF, "bold", 2);
  }

  savePlayerData(auth, data);
  if (typeof logCoinTransaction === "function") {
    logCoinTransaction(player.name, auth, netProfit, "Câu cá (!cauca)", data.coins);
  }
  room.sendAnnouncement(`🎣 ${msg} (Số dư: ${data.coins} 🪙, ${data.gems || 0} 💎)`, player.id, color, "bold", 1);
  return false;
}
// ==========================================
// ⚔️ Ý TƯỞNG 1: THÁCH ĐẤU 1V1 (GẠ KÈO CÁ NHÂN)
// ==========================================
function thachDauFunc(value, player) {
  if (!isPlaying) {
    room.sendAnnouncement("❌ Chỉ có thể gạ kèo khi trận đấu đang diễn ra trên sân!", player.id, 0xFF4444);
    return false;
  }

  // 🛑 GIỚI HẠN MAP: CHỈ MỞ Ở MAP 5V5
  if (typeof stadium === "undefined" || !stadium.name.includes("5v5")) {
    room.sendAnnouncement("❌ Hệ thống Gạ kèo 1v1 (!thachdau) chỉ mở tại Map 5v5!", player.id, 0xFF4444, "bold", 2);
    return false;
  }

  if (player.team === 0) {
    room.sendAnnouncement("❌ Khán giả không được gạ kèo, hãy vào sân thi đấu!", player.id, 0xFF4444);
    return false;
  }

  const parts = value.trim().split(/\s+/);
  if (parts.length < 2) {
    room.sendAnnouncement("⚔️ Cú pháp: !thachdau <@Tên> <Số_tiền>", player.id, 0xFFD700);
    return false;
  }
  const amountStr = parts.pop();
  const targetName = parts.join(" ").toLowerCase().replace("@", "");
  const amount = parseInt(amountStr, 10);

  if (isNaN(amount) || amount < 100) {
    room.sendAnnouncement("❌ Số tiền gạ kèo tối thiểu là 100 🪙.", player.id, 0xFF4444);
    return false;
  }
  if (amount > 50000) {
    room.sendAnnouncement("❌ Số tiền gạ kèo tối đa là 50.000 🪙 để chống lạm phát!", player.id, 0xFF4444, "bold", 2);
    return false;
  }

  const auth = getAuth(player.id);
  const data = getPlayerData(auth);
  if (data.coins < amount) {
    room.sendAnnouncement(`❌ Bạn không đủ tiền! (Hiện có: ${data.coins} 🪙)`, player.id, 0xFF4444);
    return false;
  }

  const targetPlayer = room.getPlayerList().find(p => p.id !== 0 && p.name.toLowerCase().includes(targetName));
  if (!targetPlayer) {
    room.sendAnnouncement(`❌ Không tìm thấy cầu thủ nào tên "${targetName}".`, player.id, 0xFF4444);
    return false;
  }
  if (targetPlayer.team === 0) {
    room.sendAnnouncement("❌ Đối thủ đang ngồi ghế Khán giả, không thể gạ kèo!", player.id, 0xFF4444);
    return false;
  }
  if (targetPlayer.team === player.team) {
    room.sendAnnouncement("❌ Không thể thách đấu đồng đội của mình!", player.id, 0xFF4444);
    return false;
  }

  const targetAuth = getAuth(targetPlayer.id);
  if (!targetAuth) return false;

  // 🛡️ CHỐT CHẶN CHỐNG SPAM KÈO
  if (typeof activeDuels !== "undefined") {
    let isChallengerInDuel = activeDuels.some(d => d.p1Auth === auth || d.p2Auth === auth);
    let isTargetInDuel = activeDuels.some(d => d.p1Auth === targetAuth || d.p2Auth === targetAuth);
    if (isChallengerInDuel) {
      room.sendAnnouncement("❌ Bạn đang trong một kèo khô máu khác! Hãy giải quyết xong trận này đã.", player.id, 0xFF4444);
      return false;
    }
    if (isTargetInDuel) {
      room.sendAnnouncement("❌ Đối thủ này đã chốt kèo với người khác rồi. Hãy chọn đối tượng rảnh rỗi hơn!", player.id, 0xFF4444);
      return false;
    }
  }

  let isAlreadyChallenging = Object.values(pendingDuels).some(d => d.challengerAuth === auth);
  if (isAlreadyChallenging) {
    room.sendAnnouncement("❌ Bạn đã gửi một lời gạ kèo trước đó, vui lòng chờ đối phương phản hồi (30s)!", player.id, 0xFF4444);
    return false;
  }

  if (pendingDuels[targetAuth]) {
    room.sendAnnouncement("❌ Đối thủ này đang phải suy nghĩ một lời gạ kèo khác, vui lòng chờ!", player.id, 0xFF4444);
    return false;
  }

  pendingDuels[targetAuth] = {
    challengerId: player.id, challengerName: player.name, challengerAuth: auth,
    targetId: targetPlayer.id, targetName: targetPlayer.name, amount: amount
  };

  room.sendAnnouncement(`⚔️ LỜI THÁCH ĐẤU: [${player.name}] vừa gạ kèo 1v1 [${targetPlayer.name}] với giá ${amount} 🪙!`, null, 0xFF8800, "bold", 2);
  room.sendAnnouncement(`👉 [${targetPlayer.name}], hãy gõ !chapnhan để khô máu hoặc phớt lờ nếu sợ hãi! (30s suy nghĩ)`, targetPlayer.id, 0x00FFFF, "bold", 2);

  setTimeout(() => {
    // CHỈ XÓA KHI LỜI GẠ KÈO ĐÓ ĐÚNG LÀ CỦA CHỦ NHÂN CŨ
    if (pendingDuels[targetAuth] && pendingDuels[targetAuth].challengerAuth === auth) {
      delete pendingDuels[targetAuth];
      room.sendAnnouncement(`⏳ Lời gạ kèo của [${player.name}] đã bị phớt lờ và hết hạn.`, player.id, 0xAAAAAA);
    }
  }, 30000);
  return false;
}

function chapNhanFunc(value, player) {
  // Tránh trường hợp Admin chuyển Map giữa chừng người chơi mới gõ nhận kèo
  if (typeof stadium === "undefined" || !stadium.name.includes("5v5")) {
    room.sendAnnouncement("❌ Trận đấu 5v5 đã kết thúc hoặc bị đổi Map. Lời thách đấu đã bị hủy!", player.id, 0xFF4444, "bold", 2);
    return false;
  }

  const auth = getAuth(player.id);
  if (!pendingDuels[auth]) {
    room.sendAnnouncement("❌ Không có lời thách đấu nào dành cho bạn hoặc đã hết hạn!", player.id, 0xFF4444);
    return false;
  }

  const duel = pendingDuels[auth];
  const p1Player = room.getPlayer(duel.challengerId);
  const p2Player = room.getPlayer(player.id);
  if (!p1Player || !p2Player || p1Player.team === 0 || p2Player.team === 0 || p1Player.team === p2Player.team) {
    room.sendAnnouncement("Hai người chơi phải ở 2 đội đối đầu trên sân để chốt kèo!", player.id, 0xFF4444);
    delete pendingDuels[auth];
    return false;
  }
  const dataP2 = getPlayerData(auth);
  const dataP1 = getPlayerData(duel.challengerAuth);

  if (dataP2.coins < duel.amount) {
    room.sendAnnouncement(`❌ Bạn không đủ ${duel.amount} 🪙 để nhận kèo!`, player.id, 0xFF4444);
    return false;
  }
  if (dataP1.coins < duel.amount) {
    room.sendAnnouncement(`❌ Đối thủ đã tiêu mất tiền cược! Lời thách đấu bị hủy.`, player.id, 0xFF4444);
    delete pendingDuels[auth];
    return false;
  }

  dataP1.coins -= duel.amount;
  dataP2.coins -= duel.amount;
  savePlayerData(duel.challengerAuth, dataP1);
  savePlayerData(auth, dataP2);
  if (typeof logCoinTransaction === "function") {
    logCoinTransaction(duel.challengerName, duel.challengerAuth, -duel.amount, `Gạ kèo 1v1 (!thachdau) với ${player.name}`, dataP1.coins);
    logCoinTransaction(player.name, auth, -duel.amount, `Nhận kèo 1v1 (!thachdau) từ ${duel.challengerName}`, dataP2.coins);
  }

  const p1Team = room.getPlayer(duel.challengerId) ? room.getPlayer(duel.challengerId).team : 0;
  const p2Team = room.getPlayer(player.id) ? room.getPlayer(player.id).team : 0;

  activeDuels.push({
    p1Auth: duel.challengerAuth, p1Name: duel.challengerName, p1Team: p1Team,
    p2Auth: auth, p2Name: player.name, p2Team: p2Team, amount: duel.amount, pot: duel.amount * 2
  });

  delete pendingDuels[auth];
  room.sendAnnouncement(`🔥 KÈO ĐÃ CHỐT: [${duel.challengerName}] ⚔️ [${player.name}]. Hũ: ${duel.amount * 2} 🪙! Kẻ thắng trận sẽ ăn tất cả!`, null, 0xFF0000, "bold", 2);
  if (p1Player) room.sendAnnouncement(`⚔️ Bạn đã vào kèo 1v1 (${duel.amount} 🪙). Số dư còn: ${dataP1.coins} 🪙`, p1Player.id, 0x00FF00);
  room.sendAnnouncement(`⚔️ Bạn đã nhận kèo 1v1 (${duel.amount} 🪙). Số dư còn: ${dataP2.coins} 🪙`, player.id, 0x00FF00);
  return false;
}

// ==========================================
// 🍅 Ý TƯỞNG 3: NÉM CÀ CHUA & TẶNG HOA (TROLL)
// ==========================================
function trollFunc(value, player, type) {
  if (!value) {
    room.sendAnnouncement(`🎯 Cú pháp: !${type} <@Tên>`, player.id, 0xFFD700);
    return false;
  }

  const cost = 100;
  const auth = getAuth(player.id);
  const data = getPlayerData(auth);
  if (data.coins < cost) {
    room.sendAnnouncement(`❌ Nghèo quá không đủ ${cost} 🪙 để mua đồ troll!`, player.id, 0xFF4444);
    return false;
  }

  const targetName = value.trim().replace("@", "").toLowerCase();
  const targetPlayer = room.getPlayerList().find(p => p.id !== 0 && p.name.toLowerCase().includes(targetName));

  if (!targetPlayer) return room.sendAnnouncement(`❌ Không tìm thấy ai tên "${targetName}".`, player.id, 0xFF4444), false;
  if (targetPlayer.id === player.id) return room.sendAnnouncement("❌ Tự kỷ à? Hãy chọn người khác!", player.id, 0xFF4444), false;

  data.coins -= cost;
  savePlayerData(auth, data);
  if (typeof logCoinTransaction === "function") {
    logCoinTransaction(player.name, auth, -cost, `Troll (!${type}) ${targetPlayer.name}`, data.coins);
  }

  if (type === "nemca") {
    room.sendAnnouncement(`🍅 BỘP!!! Khán giả [${player.name}] vừa ném một quả CÀ CHUA THỐI vào mặt [${targetPlayer.name}] vì pha xử lý cồng kềnh! 👎`, null, 0xFF4444, "bold", 1);
  } else {
    room.sendAnnouncement(`🌹 TUYỆT VỜI! Khán giả [${player.name}] vừa ném một bó HOA HỒNG tặng [${targetPlayer.name}] cho pha bóng đỉnh cao! 👏`, null, 0xFF66B2, "bold", 1);
  }
  room.sendAnnouncement(`✨ Bạn đã dùng 100 🪙 để ${type === "nemca" ? "ném cà chua" : "tặng hoa"}. Số dư: ${data.coins} 🪙`, player.id, 0x00FF00);
  return false;
}
// Thay 'scores' bằng 'winner'
function resolveDuels(winner) {
  if (typeof activeDuels === "undefined" || activeDuels.length === 0) return;

  // 🏆 LẤY TRỰC TIẾP KẾT QUẢ ĐỘI THẮNG CHUNG CUỘC (Bao gồm cả kết quả Penalty)
  let winningTeam = winner;

  for (let duel of activeDuels) {
    // --- QUYẾT TOÁN HỢP LỆ ---
    if (winningTeam === 0) { // HÒA (Chỉ xảy ra nếu phòng tắt Penalty)
      let d1 = getPlayerData(duel.p1Auth);
      if (d1) {
        d1.coins += duel.amount; savePlayerData(duel.p1Auth, d1);
        if (typeof logCoinTransaction === "function") logCoinTransaction(duel.p1Name, duel.p1Auth, duel.amount, "Hoàn tiền hòa kèo 1v1", d1.coins);
      }
      let d2 = getPlayerData(duel.p2Auth);
      if (d2) {
        d2.coins += duel.amount; savePlayerData(duel.p2Auth, d2);
        if (typeof logCoinTransaction === "function") logCoinTransaction(duel.p2Name, duel.p2Auth, duel.amount, "Hoàn tiền hòa kèo 1v1", d2.coins);
      }
      room.sendAnnouncement(`🤝 Kèo 1v1: Trận đấu HÒA! Hoàn trả ${duel.amount} 🪙 cho [${duel.p1Name}] và [${duel.p2Name}].`, null, 0xAAAAAA, "bold", 1);
    } else { // CÓ ĐỘI THẮNG TỔNG
      let winnerAuth = null, winnerName = "", loserName = "";

      // Xét team dựa vào lịch sử lúc chốt kèo ban đầu, không quan tâm hiện tại họ ở Spec hay sân
      if (duel.p1Team === winningTeam) { winnerAuth = duel.p1Auth; winnerName = duel.p1Name; loserName = duel.p2Name; }
      else if (duel.p2Team === winningTeam) { winnerAuth = duel.p2Auth; winnerName = duel.p2Name; loserName = duel.p1Name; }

      if (winnerAuth) {
        let dw = getPlayerData(winnerAuth);
        if (dw) {
          dw.coins += duel.pot; savePlayerData(winnerAuth, dw);
          if (typeof logCoinTransaction === "function") logCoinTransaction(winnerName, winnerAuth, duel.pot, `Thắng kèo 1v1 trước ${loserName}`, dw.coins);
        }
        room.sendAnnouncement(`🏆 KÈO 1V1 KẾT THÚC: [${winnerName}] đã giành chiến thắng chung cuộc trước [${loserName}] và ôm trọn hũ ${duel.pot} 🪙!`, null, 0xFFD700, "bold", 2);
      } else {
        // Cả 2 người đều ở Spec khi trận kết thúc → Hoàn tiền cho cả 2
        let d1 = getPlayerData(duel.p1Auth);
        if (d1) { d1.coins += duel.amount; savePlayerData(duel.p1Auth, d1); if (typeof logCoinTransaction === "function") logCoinTransaction(duel.p1Name, duel.p1Auth, duel.amount, "Hoàn kèo 1v1 (Cả 2 đều spec)", d1.coins); }
        let d2 = getPlayerData(duel.p2Auth);
        if (d2) { d2.coins += duel.amount; savePlayerData(duel.p2Auth, d2); if (typeof logCoinTransaction === "function") logCoinTransaction(duel.p2Name, duel.p2Auth, duel.amount, "Hoàn kèo 1v1 (Cả 2 đều spec)", d2.coins); }
        room.sendAnnouncement(`🛡️ Kèo 1v1 HỦY: Cả 2 người cùng ra Spec khi trận kết thúc. Hoàn trả ${duel.amount} 🪙 mỗi người.`, null, 0xAAAAAA, "bold", 1);
      }
    }
  }

  // Xóa sạch lịch sử kèo sau khi quyết toán xong
  activeDuels = [];
}
// ==========================================
// 🎰 MENU MINIGAMES & GIẢI TRÍ
// ==========================================
function funMenuFunc(value, player) {
  room.sendAnnouncement("🎰 DANH SÁCH MINIGAMES & GIẢI TRÍ 🥷", player.id, 0xFFD700, "bold", 2);

  let menu = "🎡 !spin <tiền> - Vòng quay may mắn (Cơ hội x2, x5, x10)\n" +
    "🎰 !slot <tiền> - Quay máy xèng nổ hũ siêu to\n" +
    "🎲 !cf <tai/xiu> <tiền> - Tung đồng xu Tài/Xỉu\n" +
    "✌️ !kbb <keo/bua/bao> <tiền> - Oẳn tù tì với Bot\n" +
    "🎣 !cauca - Câu cá tìm rương báu (Phí mồi: 300 🪙)\n" +
    "🎟️ !ve <1-999> | !jackpot - Mua vé số săn 💎 | Xem Hũ\n" +
    "☠️ !bounty <@Tên> <tiền> - Truy nã cầu thủ trên sân\n" +
    "⚔️ !thachdau <@Tên> <tiền> - Gạ kèo 1v1 khô máu trên sân\n" +
    "🍅 !nemca / 🌹 !tanghoa <@Tên> - Troll cầu thủ (Phí: 100 🪙)\n" +
    "⚖️ !doigems - Chợ đen đổi 150,000 🪙 lấy 1 💎";

  room.sendAnnouncement(menu, player.id, 0x00FFFF, "small-bold", 1);
  room.sendAnnouncement("👉 Cần có 🪙 Coins để tham gia. Dùng lệnh !money hoặc !coins để xem số dư của bạn!", player.id, 0xAAAAAA, "small-italic", 0);

  return false;
}

// ==========================================
// 📜 MENU TỔNG QUÁT CHO TÂN THỦ
// ==========================================
function menuFunc(value, player) {
  room.sendAnnouncement("🌟 BẢNG HƯỚNG DẪN TÂN THỦ - DANH SÁCH LỆNH CHÍNH 🌟", player.id, 0xFFD700, "bold", 2);

  let menuMsg =
    "📖 Cẩm nang: !huongdan (Link tài liệu luật chơi chi tiết)\n" +
    "🪙 Kinh tế: !coins (Xem ví) | !daily (Điểm danh) | !pay (Chuyển tiền)\n" +
    "🛒 Cửa hàng: !shop (Xem đồ) | !buyvip (Mua VIP 30 Ngày giá 2.5 Triệu 🪙)\n" +
    "🎲 Cá cược: !bet (Mở lúc 0-0) | !bet list (Xem tỉ lệ cược)\n" +
    "🎰 Giải trí: !fun (Xem Minigames, Gạ kèo 1v1, Troll ném cà chua...)\n" +
    "💳 Donate: !naptien (Ủng hộ Admin để đổi Coins, lấy Thẻ VIP vĩnh viễn/Gems)";

  room.sendAnnouncement(menuMsg, player.id, 0x00FFFF, "bold", 1);
  room.sendAnnouncement("👉 Lời khuyên: Gõ !huongdan để lấy link đọc luật chơi và tỷ lệ cược chi tiết nhất!", player.id, 0xAAAAAA, "small-italic", 0);

  return false;
}
// ==========================================
// 🎟️ XỔ SỐ KIẾN THIẾT - JACKPOT LŨY TIẾN
// ==========================================

// 1. CÁC BIẾN QUẢN LÝ XỔ SỐ
let currentJackpot = 10; // Hũ khởi điểm luôn là 10 Kim cương (Gems)
let lotteryTickets = {}; // Cái giỏ dùng để đựng vé của tất cả người chơi
let nextRollTime = Date.now() + (60 * 60 * 1000); // Bộ đếm giờ: 60 phút quay 1 lần

// 2. HÀM MUA VÉ SỐ (!ve)
function buyTicketFunc(value, player) {
  let auth = getAuth(player.id);
  if (!auth) return false;

  let num = parseInt(value, 10);

  // Kiểm tra xem người chơi có nhập đúng số từ 1 đến 999 không
  if (isNaN(num) || num < 1 || num > 999) {
    room.sendAnnouncement(`🎟️ Cú pháp: !ve <1-999>. Giá vé: 5000 🪙. Thưởng nổ hũ: 💎 ${currentJackpot} GEMS!`, player.id, 0xFFD700);
    return false;
  }

  let data = getPlayerData(auth);
  if (data.coins < 5000) {
    room.sendAnnouncement(`❌ Bạn không đủ 5000 🪙 để mua vé số! (Hiện có: ${data.coins} 🪙)`, player.id, 0xFF4444);
    return false;
  }

  // Nếu người này chưa từng mua vé kỳ này, tạo 1 hồ sơ rỗng cho họ
  if (!lotteryTickets[auth]) {
    lotteryTickets[auth] = { name: player.name, numbers: [] };
  }

  // Chặn không cho mua trùng số
  if (lotteryTickets[auth].numbers.includes(num)) {
    room.sendAnnouncement(`❌ Bạn đã mua số [${num}] này rồi! Hãy chọn số khác.`, player.id, 0xFF4444);
    return false;
  }

  // Chặn không cho mua quá 5 vé
  if (lotteryTickets[auth].numbers.length >= 5) {
    room.sendAnnouncement("❌ Lòng tham vô đáy! Mỗi vòng xổ số chỉ được mua tối đa 5 vé.", player.id, 0xFF4444);
    return false;
  }

  // Trừ 5000 Coins và nhét số họ vừa chọn vào giỏ vé
  data.coins -= 5000;
  lotteryTickets[auth].numbers.push(num);
  savePlayerData(auth, data);
  if (typeof logCoinTransaction === "function") logCoinTransaction(player.name, auth, -5000, `Mua vé số ${num}`, data.coins);

  room.sendAnnouncement(`🎟️ Bạn đã mua vé số [${num}]. Chúc may mắn! (Jackpot: 💎 ${currentJackpot} Gems). Số dư: ${data.coins} 🪙`, player.id, 0x00FF00);
  return false;
}

// 3. HÀM KIỂM TRA HŨ XỔ SỐ (!jackpot) - TÍNH NĂNG MỚI
function checkJackpotFunc(value, player) {
  let timeLeft = Math.max(0, Math.ceil((nextRollTime - Date.now()) / 60000));
  room.sendAnnouncement(`🎰 THÔNG TIN JACKPOT HIỆN TẠI:\n💎 Quỹ thưởng: ${currentJackpot} GEMS\n⏳ Thời gian quay thưởng: Khoảng ${timeLeft} phút nữa.\n👉 Gõ !ve <số> để mua vé ngay!`, player.id, 0x00FFFF, "bold", 1);
  return false;
}

// 4. HÀM QUAY THƯỞNG (Hệ thống tự gọi chạy ngầm)
function rollLottery() {
  // Đặt lại thời gian đếm ngược cho 60 phút tiếp theo
  nextRollTime = Date.now() + (60 * 60 * 1000);

  // Nếu kỳ này không có ai mua vé nào cả
  if (Object.keys(lotteryTickets).length === 0) {
    currentJackpot += 1; // Hũ vẫn tăng nhẹ 1 Gem để kích thích
    if (currentJackpot > 100) currentJackpot = 100;
    return;
  }

  // Máy tính bốc ngẫu nhiên 1 số từ 1 đến 999
  let winningNumber = Math.floor(Math.random() * 999) + 1;
  room.sendAnnouncement(`🎰 KẾT QUẢ XỔ SỐ: Con số may mắn kỳ này là [${winningNumber}]!!!`, null, 0xFFD700, "bold", 2);

  let winners = [];

  // Dò tìm trong giỏ vé xem có ai trúng không
  for (let auth in lotteryTickets) {
    let ticketData = lotteryTickets[auth];
    // Nếu mảng vé của người này có chứa số trúng thưởng
    if (ticketData.numbers.includes(winningNumber)) {
      let data = getPlayerData(auth);
      data.gems = (data.gems || 0) + currentJackpot; // Cộng thẳng Gems vào ví
      savePlayerData(auth, data); // 🛡️ FIX BUG #1: Lưu lại sau khi cộng Gems
      winners.push(ticketData.name);

      if (typeof logCoinTransaction === "function") logCoinTransaction(ticketData.name, auth, currentJackpot, "Trúng Jackpot Xổ Số", data.gems);
    }
  }

  // Công bố kết quả
  if (winners.length > 0) {
    room.sendAnnouncement(`🎉 NỔ HŨ: Chúc mừng [${winners.join(", ")}] đã trúng độc đắc 💎 ${currentJackpot} GEMS!`, null, 0x00FFFF, "bold", 2);
    currentJackpot = 10; // Đã có người ăn, reset hũ về 10 Gems
  } else {
    currentJackpot += 2; // Không ai trúng, hũ phình to thêm 2 Gems
    if (currentJackpot > 100) currentJackpot = 100;
    room.sendAnnouncement(`😭 Không có ai trúng thưởng! Quỹ Jackpot kỳ sau sẽ tăng lên thành 💎 ${currentJackpot} GEMS!`, null, 0xAAAAAA, "italic", 1);
  }

  // Đốt sạch giỏ vé cũ để chuẩn bị cho kỳ bán vé tiếp theo
  lotteryTickets = {};
}

// Lệnh khởi động bộ đếm: Cứ 3,600,000 mili-giây (60 phút) thì gọi hàm rollLottery 1 lần
setInterval(rollLottery, 60 * 60 * 1000);

// ==========================================
// ⚖️ CHỢ ĐEN (ĐỔI COINS LẤY GEMS)
// ==========================================
function exchangeGemsFunc(value, player) {
  let auth = getAuth(player.id);
  if (!auth) return false;

  const EXCHANGE_RATE = 150000; // Tỷ giá mới 150k Coins = 1 Gem

  let data = getPlayerData(auth);

  // Đọc số lượng Gems muốn đổi (Mặc định là 1 nếu không nhập)
  let amountToBuy = 1;
  if (value) {
    let parsed = parseInt(value.trim(), 10);
    if (!isNaN(parsed) && parsed > 0) amountToBuy = parsed;
    else {
      room.sendAnnouncement("❌ Cú pháp: !doigems <số lượng> (Ví dụ: !doigems 10)", player.id, 0xFF4444);
      return false;
    }
  }

  let totalCost = EXCHANGE_RATE * amountToBuy;

  if (data.coins < totalCost) {
    room.sendAnnouncement(`❌ Tỷ giá Chợ Đen: ${EXCHANGE_RATE.toLocaleString()} 🪙 = 1 Gem. Bạn cần ${totalCost.toLocaleString()} 🪙 để đổi ${amountToBuy} Gems. (Hiện có: ${data.coins.toLocaleString()} 🪙)`, player.id, 0xFF4444);
    return false;
  }

  data.coins -= totalCost;
  data.gems = (data.gems || 0) + amountToBuy;
  savePlayerData(auth, data);

  if (typeof logCoinTransaction === "function") {
    logCoinTransaction(player.name, auth, -totalCost, `Đổi ${amountToBuy} Gems ở Chợ Đen`, data.coins);
    logCoinTransaction(player.name, auth, amountToBuy, "Mua Gems từ Chợ Đen (💎)", data.gems);
  }

  room.sendAnnouncement(`💎 GIAO DỊCH THÀNH CÔNG: Bạn đã dùng ${totalCost.toLocaleString()} 🪙 để mua ${amountToBuy} GEMS! (Số dư: ${data.coins.toLocaleString()} 🪙, ${data.gems} 💎)`, player.id, 0x00FF00, "bold", 2);
  return false;
}

function listEffectsFunc(value, player) {
  const auth = getAuth(player.id);
  if (!auth) return false;
  const data = getPlayerData(auth);
  let msg = "DANH SÁCH HIỆU ỨNG BÀN THẮNG:\n";
  EFFECT_NAMES.forEach((name, idx) => {
    const owned = data.ownedEffects.includes(idx);
    const active = data.activeEffect === idx;
    let status = active ? " [ĐANG DÙNG]" : (owned ? " [ĐÃ MUA]" : ` (${EFFECT_PRICES[idx]} 💎)`);
    msg += `[${idx}] ${name}${status}\n`;
  });
  const hasRandom = data.ownedEffects.includes(-1);
  const activeRandom = data.activeEffect === -1;
  msg += `[Random] Ngẫu nhiên${activeRandom ? " [ĐANG DÙNG]" : (hasRandom ? " [ĐÃ MUA]" : ` (${RANDOM_PACK_PRICE} 💎)`)}`;
  room.sendAnnouncement(msg, player.id, YELLOW, "small-bold", 0);
  room.sendAnnouncement("Dùng !buy effect <số> để mua, !buy effect random để mua gói Random, !seteffect <số> để chọn.", player.id, 0xFFFF00, "small", 0);
  return false;
}
function refundBets(reason) {
  // 1. HOÀN CƯỢC HỆ THỐNG (!bet)
  if (typeof bets !== "undefined" && bets.length > 0) {
    let totalRefund = 0;
    let count = 0;

    for (const bet of bets) {
      let auth = bet.auth;
      if (auth) {
        let data = getPlayerData(auth);
        if (data) {
          let refundAmount = bet.amount;

          data.coins += refundAmount;
          savePlayerData(auth, data); // Phải lưu ngay sau mỗi lượt hoàn trả

          if (typeof logCoinTransaction === "function") {
            let playerName = bet.name || (room.getPlayer(bet.playerId) ? room.getPlayer(bet.playerId).name : "OfflinePlayer");
            logCoinTransaction(playerName, auth, refundAmount, `Hoàn tiền cược (Gồm phí nếu có): ${reason}`, data.coins);
          }

          totalRefund += refundAmount;
          count++;
        }
      }
    }

    bets = [];
    if (typeof updateOdds === "function") updateOdds();

    room.sendAnnouncement(`💸 [HOÀN TIỀN CƯỢC] Đã hoàn trả tổng cộng ${totalRefund} 🪙 cho ${count} vé cược!`, null, 0x00FF00, "bold", 2);
    room.sendAnnouncement(`📌 Lý do: ${reason}`, null, 0xFFD700, "italic", 1);
  }

  // 2. HOÀN CƯỢC GẠ KÈO 1v1 (!thachdau)
  if (typeof activeDuels !== "undefined" && activeDuels.length > 0) {
    for (let duel of activeDuels) {
      let d1 = getPlayerData(duel.p1Auth);
      if (d1) {
        d1.coins += duel.amount; savePlayerData(duel.p1Auth, d1);
        if (typeof logCoinTransaction === "function") logCoinTransaction(duel.p1Name, duel.p1Auth, duel.amount, "Hủy kèo 1v1 (Trận dừng)", d1.coins);
      }
      let d2 = getPlayerData(duel.p2Auth);
      if (d2) {
        d2.coins += duel.amount; savePlayerData(duel.p2Auth, d2);
        if (typeof logCoinTransaction === "function") logCoinTransaction(duel.p2Name, duel.p2Auth, duel.amount, "Hủy kèo 1v1 (Trận dừng)", d2.coins);
      }
    }
    room.sendAnnouncement(`🛡️ TOÀN BỘ KÈO 1V1 Đã BỊ HỦY DO TRẬN ĐẤU DỪNG LẠI. Tiền cược đã được hoàn trả!`, null, 0xFF4444, "bold", 2);
    activeDuels = [];
  }

  // 3. HOÀN CƯỢC TREO THƯỞNG TRUY NÃ (!bounty)
  if (typeof activeBounties !== "undefined" && Object.keys(activeBounties).length > 0) {
    for (let targetAuth in activeBounties) {
      let bounty = activeBounties[targetAuth];
      if (bounty.depositors && bounty.depositors.length > 0) {
        for (let dep of bounty.depositors) {
          let depData = getPlayerData(dep.auth);
          if (depData) {
            depData.coins += dep.amount;
            savePlayerData(dep.auth, depData);
            if (typeof logCoinTransaction === "function") {
              let depPlayer = room.getPlayerList().find(p => getAuth(p.id) === dep.auth);
              let dName = depPlayer ? depPlayer.name : dep.auth;
              logCoinTransaction(dName, dep.auth, dep.amount, `Hoàn truy nã (${reason} - ${bounty.name})`, depData.coins);
            }
          }
        }
      }
    }
    room.sendAnnouncement(`☠️ TOÀN BỘ TIỀN TRUY NÃ ĐÃ ĐƯỢC HOÀN TRẢ DO TRẬN ĐẤU DỪNG LẠI!`, null, 0xFFA500, "bold", 2);
    activeBounties = {};
  }
}
function rewardCoins(motmAuth, winningStreak, gkCleanStreak) {
  if (!stadium || !stadium.name) return;

  // Tắt phát tiền Coins cho tất cả các map Giao Hữu (1v1, 3v3, training, Practice, PEN)
  if (stadium.name.includes("training") || stadium.name === "Practice" || stadium.name.includes("PEN") || stadium.name.includes("1v1") || stadium.name.includes("3v3")) {
    return;
  }

  let scoreArray = (prevScore || "0-0").split("-");
  let redGoals = parseInt(scoreArray[0], 10);
  let blueGoals = parseInt(scoreArray[1], 10);

  for (let teamId = 1; teamId < 3; teamId++) {
    let opponentScore = (teamId === 1) ? blueGoals : redGoals;
    let teamEntries = Object.entries(game.teams[teamId].players).sort((a, b) =>
      (teamId === 1) ? (a[1].meanPosition - b[1].meanPosition) : (b[1].meanPosition - a[1].meanPosition)
    );
    let gkAuth = teamEntries.length > 0 ? teamEntries[0][0] : null;

    for (const auth of Object.keys(game.teams[teamId].players)) {
      let data = getPlayerData(auth);
      let pStats = game.teams[teamId].players[auth];
      let playerInRoom = room.getPlayerList().find(p => getAuth(p.id) === auth);
      const playerName = playerInRoom ? playerInRoom.name : pStats.name;
      let earned = 0;

      earned += 50;
      if (teamId == prevWinner) earned += 100;
      if (auth === motmAuth) earned += 100;

      earned += pStats.goals * 30;
      earned += pStats.assists * 20;
      earned -= pStats.ownGoals * 10;

      if (pStats.goals === 3) earned += 30;
      else if (pStats.goals >= 4) earned += 50;

      if (auth === gkAuth && opponentScore === 0) {
        earned += 30;
        let streak = gkCleanStreak[auth] || 0;
        if (streak >= 3) earned += 50;
        if (streak >= 5) earned += 50;
      }

      let matchRating = pStats.getPoints();
      if (auth === gkAuth) {
        if (opponentScore === 0) matchRating += 5.0;
        else if (opponentScore === 1) matchRating += 2.5;
        else if (opponentScore === 2) matchRating += 1.0;
      }
      if (matchRating >= 15) earned += 50;
      else if (matchRating >= 10) earned += 30;

      if (teamId == prevWinner) {
        let streak = winningStreak;
        if (streak >= 3) earned += 50;
        if (streak >= 5) earned += 50;
        if (streak >= 10) earned += 100;
      }

      // Tránh việc người chơi phản lưới quá nhiều bị trừ vào vốn gốc
      if (earned < 0) earned = 0;

      let isVip = data.vipExpiry && Date.now() < data.vipExpiry;
      let vipBonusCoins = 0;
      let vipBonusGems = 0;

      if (isVip && earned > 0) {
        // VIP Bonus: Thêm 20% đến 50% Coins
        let bonusPercent = 0.2 + (Math.random() * 0.3);
        vipBonusCoins = Math.floor(earned * bonusPercent);
        earned += vipBonusCoins;

        // VIP Bonus: 15% tỷ lệ rơi ngọc (1-2 Gems)
        if (Math.random() < 0.15) {
          vipBonusGems = Math.floor(Math.random() * 2) + 1;
        }
      }

      // 💎 TÍNH NĂNG MỚI: Tỷ lệ rơi Gems dựa theo màn trình diễn
      if (auth === motmAuth && Math.random() < 0.2) {
        vipBonusGems += 1;
      }
      if (pStats.goals >= 4) {
        vipBonusGems += 1;
      }

      // ==========================================
      // 🌟 X2 COINS FEATURE (Đã hoàn thiện)
      // ==========================================
      let isDoubled = false; // Tạo một lá cờ

      // Chỉ nhân đôi và trừ lượt x2 khi người chơi THỰC SỰ kiếm được tiền (earned > 0)
      if (data.doubleCoinsLeft > 0 && earned > 0) {
        earned *= 2;
        data.doubleCoinsLeft--;
        isDoubled = true; // Bật cờ nếu thực sự bị trừ lượt
      }

      data.coins = (data.coins || 0) + earned;
      if (vipBonusGems > 0) {
        data.gems = (data.gems || 0) + vipBonusGems;
      }
      savePlayerData(auth, data);

      if (typeof logCoinTransaction === "function") {
        if (vipBonusGems > 0) {
          logCoinTransaction(playerName, auth, vipBonusGems, "Thưởng VIP cuối trận (💎)", data.gems);
        }
        if (earned > 0) {
          // Ghi log lên Discord có kèm chữ (x2) để Admin dễ theo dõi
          let logStr = "Thưởng trận đấu" + (isDoubled ? " (x2)" : "") + (isVip ? " [VIP]" : "");
          logCoinTransaction(playerName, auth, earned, logStr, data.coins);
        }
      }

      if (playerInRoom && earned > 0) {
        let details = [];
        details.push("Tham gia:50");
        if (teamId == prevWinner) details.push("Thắng:100");
        if (auth === motmAuth) details.push("MOTM:100");
        if (pStats.goals > 0) details.push(`Bàn:${pStats.goals * 30}`);
        if (pStats.assists > 0) details.push(`KT:${pStats.assists * 20}`);
        if (pStats.ownGoals > 0) details.push(`PL:${-pStats.ownGoals * 10}`);
        if (pStats.goals === 3) details.push("Hat-trick:30");
        else if (pStats.goals >= 4) details.push("Poker:50");

        if (auth === gkAuth && opponentScore === 0) {
          details.push("Sạch lưới:30");
          let streak = gkCleanStreak[auth] || 0;
          if (streak >= 3) details.push(`Chuỗi sạch lưới:${streak >= 5 ? 100 : 50}`);
        }
        if (matchRating >= 15) details.push("Rating cực cao:+50");
        else if (matchRating >= 10) details.push("Rating cao:+30");

        if (teamId == prevWinner) {
          let streak = winningStreak;
          if (streak >= 10) details.push("Siêu chuỗi thắng:+200");
          else if (streak >= 5) details.push("Chuỗi thắng 5:+100");
          else if (streak >= 3) details.push("Chuỗi thắng 3:+50");
        }

        // Bắt cờ in chữ x2 vào mảng details
        if (isDoubled) {
          details.push("(đã x2)");
        }

        if (vipBonusCoins > 0) {
          details.push(`VIP:+${vipBonusCoins}`);
        }

        let announcementMsg = `💰 Nhận ${earned} coins (${details.join(", ")})`;
        if (vipBonusGems > 0) {
          announcementMsg += ` 💎 RƠI NGỌC: +${vipBonusGems} Gems!`;
        }

        room.sendAnnouncement(announcementMsg, playerInRoom.id, 0xFFD700, "small", 0);

        // ⚠️ Tính năng nhắc nhở nạp tiền khi sắp hết x2
        if (isDoubled && data.doubleCoinsLeft <= 3 && data.doubleCoinsLeft > 0) {
          room.sendAnnouncement(`⚠️ Gói x2 Coins của bạn chỉ còn lại ${data.doubleCoinsLeft} trận!`, playerInRoom.id, 0x00FFFF, "small-italic", 0);
        } else if (isDoubled && data.doubleCoinsLeft === 0) {
          room.sendAnnouncement(`❌ Gói x2 Coins của bạn đã hết hạn! Hãy dùng !shop để mua thêm.`, playerInRoom.id, 0xFF4444, "small-italic", 0);
        }
      }
    }
  }
}


room.setTeamsLock(1);
room.setKickRateLimit(6, 0, 0);
loadStadium("training").then(_ => { room.startGame() });
setInterval(randomAnnouncement, NOTIFICATION_INTERVAL * 1000);
setInterval(randomGameStat, 2.5 * 60 * 1000);

// THÔNG BÁO NHẮC NHỞ ANTI-TOXIC & NỘI QUY (Lặp lại mỗi 5 phút)
// THÔNG BÁO NHẮC NHỞ ANTI-TOXIC & NỘI QUY (Lặp lại mỗi 5 phút)
setInterval(() => {
  room.sendAnnouncement("🥰Room lỏ nhưng cầu thủ thì không. Vui lòng anh em thi đấu hết mình và tôn trọng đối thủ.", null, 0x00FFFF, "small-bold", 0);

  // Gửi thêm dòng cảnh báo nội quy ngay sau đó 5 giây
  setTimeout(() => {
    room.sendAnnouncement("⚠️ CẢNH BÁO: Nghiêm cấm mọi hành vi toxic, xúc phạm người chơi hoặc phá game. Vi phạm sẽ bị cấm vĩnh viễn (Ban) không cần báo trước.", null, 0xFF4444, "small-bold", 0);
  }, 5000);
}, 5 * 60 * 1000); // Lưu ý: 5 * 60 * 1000 mới là 5 phút, 3000 là 15 phút nhé. Nếu muốn 5 phút thì đổi số 3000 thành 1000.

// 🚨 NHẮC NHỞ LỆNH BÁO CÁO LỖI ROOM (Mỗi 24 phút)
setInterval(() => {
  room.sendAnnouncement(
    "🚨 [BÁO CÁO LỖI ROOM] Nếu room bị lỗi (bug, lag, lỏ, v.v...) hãy dùng lệnh:",
    null, 0xFF6600, "bold", 0
  );
  setTimeout(() => {
    room.sendAnnouncement(
      "👉 !report [mô tả lỗi]   —   Ví dụ: !report room bị lỏ không đá được",
      null, 0xFFFF00, "small-bold", 0
    );
  }, 2000);
  setTimeout(() => {
    room.sendAnnouncement(
      "📨 Bot sẽ tự động tag Admin trên Discord để xử lý ngay. Cảm ơn anh em! 🙏",
      null, 0x00FF99, "small", 0
    );
  }, 4000);
}, 24 * 60 * 1000); // Nhắc nhở mỗi 24 phút

updateMetadata();


async function checkMapRotation() {
  if (typeof getNonAfkPlayers !== "function" || typeof loadStadium !== "function") return;

  let playerCount = getNonAfkPlayers().length;
  let targetMap;

  if (playerCount >= 8) targetMap = "5v5";
  else if (playerCount >= 6) targetMap = "3v3";
  else if (playerCount >= 2) targetMap = "1v1";
  else targetMap = "training";

  if (targetMap !== currentStadium) {
    await loadStadium(targetMap);
  }
}

async function loadStadium(name) {
  if ((isTakingPenalty && (name != "penalty")) || (name == currentStadium)) return;
  let _stadium = {
    "penalty": [PENALTY_STADIUM, 0, 0],
    "5v5": [STADIUM, SCORE_LIMIT, TIME_LIMIT],
    "3v3": [STADIUM_3v3, 5, 5],
    "1v1": [STADIUM_1v1, 5, 5],
    "training": [STADIUM_TRAINING, 0, 0],
  }[name];

  let wasPlaying = !!room.getScores();
  let oldStadium = currentStadium;

  // 💸 TỰ ĐỘNG HOÀN TIỀN CƯỢC KHI ĐỔI MAP (Trừ map PEN)
  if (oldStadium === "5v5" && (name === "3v3" || name === "1v1" || name === "training")) {
    if (typeof refundBets === "function") {
      refundBets(`Đổi bản đồ từ 5v5 sang ${name}`);
    }
  }

  room.stopGame();

  // Load nguyên bản chuỗi JSON của map
  room.setCustomStadium(_stadium[0]);
  room.setScoreLimit(_stadium[1]);
  room.setTimeLimit(_stadium[2]);

  currentStadium = name;
  stadium.name = name;

  // Phân tích Stadium mới để lấy thông số phục vụ cho logic của Bot
  let parsedStadium = JSON.parse(_stadium[0]);
  if (parsedStadium.goals && parsedStadium.goals.length != 0) {
    stadium.goalLine.x = Math.abs(parsedStadium.goals[0].p0[0]);
    stadium.goalLine.y = Math.abs(parsedStadium.goals[0].p0[1]);
  };
  stadium.width = parsedStadium.width || 800;
  stadium.height = parsedStadium.height || 400;
  stadium.ballRadius = (parsedStadium.ballPhysics && parsedStadium.ballPhysics.radius) || 10;
  stadium.playerRadius = (parsedStadium.playerPhysics && parsedStadium.playerPhysics.radius) || 15;

  if (name === "training") {
    room.startGame();
  }
}
// 🎯 HỆ THỐNG LUÂN CHUYỂN MAP TỰ ĐỘNG (ĐÃ FIX XUNG ĐỘT PAUSE PICK)

function getPlayerStats() {
  let playerList = [];
  for (let i = 0; i < localStorage.length; i++) {
    var key = localStorage.key(i);
    if (key.length != 43) continue;
    playerList.push(new PlayerReport({ ...JSON.parse(localStorage.getItem(key)), auth: key }));
  };
  return playerList;
}


async function randomAnnouncement() {
  let msg;
  switch (getRandomInt(2)) {
    case 0: // Send Discord link
      msg = "🔔 Mã nguồn được viết bởi shelld3v (Discord). Mã nguồn: https://github.com/shelld3v/haxball-host";
      break;
    default: // Send a random quote
      try {
        (quotes.length == 0) && await fetch("https://api.quotable.io/quotes/random?limit=50", { method: "GET" }) // Fetch new quotes
          .then(response => response.json())
          .then(json => quotes = json.map(quote => `"${quote.content}" - ${quote.author}`));
      } catch (error) {
        return;
      };
      msg = quotes.pop();
  }
  room.sendAnnouncement(msg, null, YELLOW, "small-italic", 0);
  sendLogWebhook(logMsg);
  logMsg = "";
}

function randomGameStat() {
  let scores = room.getScores();
  if ((scores == null) || (scores.time < 60)) return;
  let fact;
  try {
    switch (getRandomInt(5)) {
      case 0:
        fact = `Kiểm soát bóng: 🟥 ${game.getStats().possession.map(possession => possession + "%").join(" - ")} 🟦`;
        break;
      case 1:
        let passes = game.getStats().passes;
        if (passes[0] + passes[1] == 0) return;
        fact = `Lượt chuyền bóng: 🟥 ${passes.join(" - ")} 🟦`;
        break;
      case 2:
        fact = `Sút trúng đích: 🟥 ${game.getStats().shotsOnTarget.join(" - ")} 🟦`;
        break;
      case 3:
        if (winningStreak < 3) return;
        fact = `Chuỗi bất bại của ${TEAM_NAMES[prevWinner]}: ${winningStreak}`;
        break;
      case 4:
        let topPasser = new PlayerStats();
        for (let teamId = 1; teamId < 3; teamId++) {
          for (const stats of Object.values(game.teams[teamId].players)) {
            if (stats.passes <= topPasser.passes) continue;
            topPasser = stats;
          };
        };
        if (topPasser.passes == 0) return;
        fact = `Thực hiện nhiều đường chuyền nhất: ${topPasser.name} (${topPasser.passes} đường chuyền)`;
    };
    if (fact) room.sendAnnouncement(`⏩⏩    ${fact}    ⏪⏪`, null, 0xCF9FFF, "small-bold");
  } catch (e) { }
}

function updateMetadata() {
  let month = new Date().getMonth() + 1;
  let lastPlayedMonth = localStorage.getItem("last_played_month");
  // Assign missing metadata items (inaccurately)
  lastPlayedMonth || (lastPlayedMonth = month); // This also prevents `month != lastPlayedMonth` condition below, which is good because calling `resetStorage()` would cause bugs as it uses "last_played_month" from localStorage
  localStorage.getItem("starting_month") || localStorage.setItem("starting_month", lastPlayedMonth);

  if (month != lastPlayedMonth) {
    // Tự động chốt sổ, thông báo thống kê tháng cũ và reset sang tháng mới
    resetStorage();
  }

  localStorage.setItem("last_played_month", month);
}
setInterval(updateMetadata, 60000);

// ============================================================
// 🛡️ DỌN DẸP RAM ĐỊNH KỲ (Chạy mỗi 5 phút)
// Mục đích: Xóa các entry hết hạn trong các Map/Object global
// để tránh chúng phình to vô hạn và gây tràn RAM
// ============================================================
setInterval(() => {
  let now = Date.now();

  // 1. Xóa án phạt mute đã hết hạn (mutedPlayers Map)
  if (typeof mutedPlayers !== "undefined") {
    for (let [key, expiry] of mutedPlayers) {
      if (now >= expiry) mutedPlayers.delete(key);
    }
  }

  // 2. Xóa cooldown câu cá đã hết hạn (fishingCooldowns object)
  if (typeof fishingCooldowns !== "undefined") {
    for (let key in fishingCooldowns) {
      if (now >= fishingCooldowns[key]) delete fishingCooldowns[key];
    }
  }

  // 3. Giới hạn kích thước chuỗi logMsg tối đa 20KB
  // (logMsg nối chuỗi liên tục mỗi lần chat/lệnh, có thể lên hàng MB)
  if (typeof logMsg !== "undefined" && logMsg.length > 20000) {
    logMsg = logMsg.slice(-5000); // Chỉ giữ 5000 ký tự cuối
  }

  // 4. Xóa các entry gamblingCooldowns đã hết hạn
  // (Chỉ giữ những người còn trong phòng)
  if (typeof gamblingCooldowns !== "undefined") {
    let activeIds = new Set(room.getPlayerList().map(p => p.id));
    for (let id in gamblingCooldowns) {
      if (!activeIds.has(+id) || now >= gamblingCooldowns[id]) {
        delete gamblingCooldowns[id];
      }
    }
  }

  // 5. Xóa entry activeEffectIntervals/Timeouts đã chạy xong (đã bị clear)
  // Tránh mảng phình vì chỉ push không bao giờ splice
  // (cleanupEffectDiscs sẽ gán lại = [] khi cần, đây chỉ là backup)
  if (typeof activeEffectIntervals !== "undefined" && activeEffectIntervals.length > 500) {
    // Nếu mảng > 500 phần tử mà vẫn chưa được reset, buộc dọn sạch
    activeEffectIntervals.forEach(clearInterval);
    activeEffectIntervals = [];
  }
  if (typeof activeEffectTimeouts !== "undefined" && activeEffectTimeouts.length > 500) {
    activeEffectTimeouts.forEach(clearTimeout);
    activeEffectTimeouts = [];
  }

}, 5 * 60 * 1000); // Mỗi 5 phút

function resetStorage() {
  cachedRankings = null;
  cachedTopList = null;

  // 🚀 FLUSH CACHE TRƯỚC KHI ĐỌC: Đảm bảo dữ liệu mới nhất được ghi xuống đĩa trước khi tiín toán thống kê tháng
  if (typeof playerCache !== "undefined" && typeof dirtyPlayers !== "undefined") {
    for (let auth of dirtyPlayers) {
      if (playerCache[auth]) {
        try { localStorage.setItem("pd_" + auth, JSON.stringify(playerCache[auth])); } catch(e) {}
      }
    }
    dirtyPlayers.clear();
  }

  let playerList = [];
  for (let i = 0; i < localStorage.length; i++) {
    let key = localStorage.key(i);
    if (key && key.length === 43) {
      let item = JSON.parse(localStorage.getItem(key));
      item.auth = key;
      playerList.push(item);
    }
  }

  let topScorers = [...playerList].sort((p1, p2) => (p2.goals || 0) - (p1.goals || 0)).slice(0, 5);
  let topAssisters = [...playerList].sort((p1, p2) => (p2.assists || 0) - (p1.assists || 0)).slice(0, 5);
  let topMOTMs = [...playerList].sort((p1, p2) => (p2.motms || 0) - (p1.motms || 0)).slice(0, 5);
  let topGoalkeepers = [...playerList].sort((p1, p2) => (p2.cleansheets || 0) - (p1.cleansheets || 0)).slice(0, 5);

  let msg = `Danh sách ghi bàn tháng ${getMonths()}:\n\n${topScorers.map((player, index) => `${index + 1}. ${player.name} - ${player.goals} bàn thắng (${player.assists} kiến tạo)`).join("\n")}`;
  room.sendAnnouncement(msg, null, BLUE, "small-bold", 0);

  let discordFields = [
    { name: "Vua phá lưới", value: `============================\n\n*${topScorers.map((p, i) => `${i + 1}. ${p.name} - ${p.goals} bàn`).join("\n")}*` },
    { name: "Vua kiến tạo", value: `============================\n\n*${topAssisters.map((p, i) => `${i + 1}. ${p.name} - ${p.assists} kiến tạo`).join("\n")}*` },
    { name: "Cầu thủ xuất sắc nhất", value: `============================\n\n*${topMOTMs.map((p, i) => `${i + 1}. ${p.name} - ${p.motms} lần MOTM`).join("\n")}*` },
    { name: "Găng tay vàng", value: `============================\n\n*${topGoalkeepers.map((p, i) => `${i + 1}. ${p.name} - ${p.cleansheets} trận sạch lưới`).join("\n")}*` }
  ];
  if (typeof sendWebhook === "function") sendWebhook(`✨ Số liệu thống kê trong tháng ${getMonths()}`, null, discordFields);

  // Xóa sạch dữ liệu cũ
  let keysToDelete = [];
  for (let i = 0; i < localStorage.length; i++) {
    let k = localStorage.key(i);
    if (k && k.length === 43) keysToDelete.push(k);
  }
  keysToDelete.forEach(k => localStorage.removeItem(k));

  localStorage.setItem("starting_month", new Date().getMonth() + 1);
}

// Get months that are being monitored for statistics
function getMonths() {
  let starting_month = localStorage.getItem("starting_month");
  let ending_month = localStorage.getItem("last_played_month");
  if (starting_month != ending_month) return `${starting_month}-${ending_month}`;
  return starting_month;
}

// Get a chat-pingable tag from player's name
function getTag(name) {
  return "@" + name.replace(/ /g, "_");
}

// Tính độ dài chuỗi bằng thuật toán nội suy (Cực nhẹ, RAM tốn 0 MB)
function getDisplayLength(string) {
  let len = 0;
  for (let i = 0; i < string.length; i++) {
    // Ký tự thường tính 1, ký tự Kanji/Emoji/Có dấu tính 1.8
    len += string.charCodeAt(i) > 255 ? 1.8 : 1;
  }
  return Math.round(len);
}

// Get a random number from a range (start from 0)
function getRandomInt(rangeEnd) {
  return Math.floor(Math.random() * rangeEnd);
}

// Get a random element from an array
function randomChoice(array) {
  return array[getRandomInt(array.length)];
}

// Get value in meters from haxball length unit
function convertToMeters(value) {
  // 37 is the ratio I got by comparing a haxball pitch with a real-life futsal pitch
  return ~~(value / 37);
}

// Get the distance knowing the coordinates of 2 points
function getDistance(x, y) {
  // Use Pythagoras
  return Math.sqrt(x ** 2 + y ** 2);
}

// Return the opposite team ID of a team ID
function getOppositeTeamId(id) {
  return (id == 1) ? 2 : (id == 2) ? 1 : 0;
}
async function sendLogWebhook(msg) {
  if (!DISCORD_LOG_WEBHOOK || msg.length == 0) return;
  try {
    await fetch(DISCORD_LOG_WEBHOOK, {
      method: "POST",
      body: JSON.stringify({ content: `\`\`\`${msg}\`\`\`` }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return;
  };
}

// Gửi thông báo và File Replay lên Discord
async function sendWebhook(title, content, fields, attachments) {
  if (!DISCORD_WEBHOOK) return; // 🔪 Đổi chữ WEBHOOK_URL ở đây thành DISCORD_WEBHOOK
  try {
    await fetch(DISCORD_WEBHOOK, { // 🔪 Và đổi chữ WEBHOOK_URL ở đây thành DISCORD_WEBHOOK
      method: "POST",
      body: JSON.stringify({
        embeds: [{
          color: 1752220,
          title: title,
          description: content,
          fields: fields,
        }],
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return;
  };

  if (!attachments) return;

  for (let i = 0; i < attachments.length; i++) {
    let attachment = attachments[i];
    if (!attachment[1]) continue;

    let form = new FormData();
    form.append(`files[${i}]`, new Blob([attachment[1]]), attachment[0]);

    await fetch(DISCORD_WEBHOOK, { // 🔪 Và đổi chữ WEBHOOK_URL ở đây nữa (nếu có)
      method: "POST",
      body: form,
    });
  };
}

function log(msg) {
  console.log(msg);
  if (!DISCORD_LOG_WEBHOOK) return;
  logMsg += msg + "\n";
}

// Move AFK player to bottom of the Spectators list
function reorderPlayers() {
  room.reorderPlayers(Array.from(afkList), false);
}
// =========================================================================
// 🚀 HỆ THỐNG CACHE RAM - CHỐNG NGHẼN I/O Ổ CỨNG (GIẢM LAG VPS)
// Thay vì ghi xuống ổ cứng mỗi lần savePlayerData() được gọi,
// dữ liệu được giữ trên RAM và chỉ ghi xuống mỗi 15 giây 1 lần.
// =========================================================================
let playerCache = {};        // Lưu trữ tạm dữ liệu người chơi trên RAM
let dirtyPlayers = new Set(); // Danh sách auth có dữ liệu thay đổi, chờ ghi xuống đĩa
let statsCache = {};         // Lưu trữ tạm dữ liệu thống kê trên RAM
let dirtyStats = new Set();   // Danh sách auth có thống kê thay đổi, chờ ghi xuống đĩa

// Vòng lặp ghi đĩa định kỳ: Cứ 15 giây, ghi tất cả dữ liệu có thay đổi xuống ổ cứng
setInterval(() => {
  if (dirtyPlayers.size > 0) {
    for (let auth of dirtyPlayers) {
      if (playerCache[auth]) {
        try {
          localStorage.setItem("pd_" + auth, JSON.stringify(playerCache[auth]));
        } catch(e) {
          console.error("[Cache Flush] Lỗi ghi dữ liệu auth:", auth, e);
        }
      }
    }
    dirtyPlayers.clear();
  }

  if (dirtyStats.size > 0) {
    for (let auth of dirtyStats) {
      if (statsCache[auth]) {
        try {
          localStorage.setItem(auth, JSON.stringify(statsCache[auth]));
        } catch(e) {
          console.error("[Cache Flush] Lỗi ghi stats auth:", auth, e);
        }
      }
    }
    dirtyStats.clear();
  }
}, 15000); // 15 giây / lần

function _normalizePlayerData(data) {
  // Chuẩn hóa tất cả các trường dữ liệu (dùng chung cho cả đọc mới & cache)
  data.coins = data.coins || 0;
  data.gems = data.gems || 0;
  data.vipExpiry = data.vipExpiry || 0;
  data.level = data.level || 1;
  data.xp = data.xp || 0;
  data.dailyBetsCount = data.dailyBetsCount || 0;
  data.lastBetDate = data.lastBetDate || "";
  data.dailyTransfers = data.dailyTransfers || 0;
  data.lastTransferDate = data.lastTransferDate || "";
  data.dailyStreak = data.dailyStreak || 0;
  data.lastDailyDate = data.lastDailyDate || "";
  data.currentWinStreak = data.currentWinStreak || 0;
  data.dailyGemExchange = data.dailyGemExchange || 0;
  data.lastGemExchangeDate = data.lastGemExchangeDate || "";
  data.ownedEffects = data.ownedEffects || [];
  data.activeEffect = data.activeEffect !== undefined ? data.activeEffect : null;
  data.ownedRoles = data.ownedRoles || [];
  data.activeRole = data.activeRole || null;
  data.ownedTitles = data.ownedTitles || [];
  data.activeTitle = data.activeTitle || null;
  data.chatToys = data.chatToys || {};
  data.features = data.features || {};
  data.doubleCoinsLeft = data.doubleCoinsLeft || 0;
  return data;
}

function getPlayerData(auth) {
  // 1. ĐỌC TỪ RAM (Tốc độ ánh sáng, không tốn I/O ổ cứng)
  if (playerCache[auth]) {
    return JSON.parse(JSON.stringify(playerCache[auth]));
  }

  // 2. CHƯA CÓ TRONG RAM → ĐỌC TỪ Ổ CỨNG (Chỉ tốn I/O đúng 1 lần đầu tiên)
  const raw = localStorage.getItem("pd_" + auth);
  let data;

  if (raw) {
    try {
      data = JSON.parse(raw);

      // ⚔️ ƯỚC LƯỢNG LEVEL CHO NGƯỜI CHƠI CŨ (chưa có level)
      if (data.level === 1 && data.xp === 0) {
        try {
          const statsStr = localStorage.getItem(auth);
          if (statsStr) {
            const stats = JSON.parse(statsStr);
            if (stats && stats.games > 0) {
              let estimatedXp = (stats.games * 10) +
                                (stats.wins * 20) +
                                ((stats.games - stats.wins) * 3) +
                                (stats.goals * 10) +
                                (stats.assists * 5) +
                                (stats.motms * 50) +
                                (stats.cleansheets * 30);
              data.level = Math.floor(estimatedXp / 300) + 1;
              data.xp = Math.floor(estimatedXp % 300);
            }
          }
        } catch(e) {}
      }
    } catch (e) {
      console.error("Lỗi đọc dữ liệu người chơi, khởi tạo mới!", e);
      data = null;
    }
  }

  // 3. NẾU KHÔNG CÓ DỮ LIỆU → TẠO TÀI KHOẢN MỚI
  if (!data) {
    data = {
      coins: 200, gems: 0, vipExpiry: 0, level: 1, xp: 0,
      dailyBetsCount: 0, lastBetDate: "",
      dailyTransfers: 0, lastTransferDate: "",
      dailyStreak: 0, lastDailyDate: "",
      currentWinStreak: 0,
      dailyGemExchange: 0, lastGemExchangeDate: "",
      ownedEffects: [], activeEffect: null,
      ownedRoles: [], activeRole: null,
      ownedTitles: [], activeTitle: null,
      chatToys: {}, features: {}, doubleCoinsLeft: 0
    };
  }

  // 4. CHUẨN HÓA VÀ LƯU VÀO RAM CACHE ĐỂ DÙNG LẠI
  data = _normalizePlayerData(data);
  playerCache[auth] = data;
  return data;
}

function savePlayerData(auth, data) {
  // Ghi vào RAM cache và đánh dấu dirty để lưu xuống đĩa sau
  data = _normalizePlayerData(data);
  playerCache[auth] = JSON.parse(JSON.stringify(data));
  dirtyPlayers.add(auth);
}

function logCoinTransaction(playerName, auth, amount, reason, balance) {
  if (!DISCORD_COIN_LOG_WEBHOOK) return;
  const embed = {
    color: amount > 0 ? 0x2ECC71 : 0xE74C3C,
    title: `🪙 Biến động số dư | ${playerName}`,
    fields: [
      { name: "💱 Biến động", value: `**${amount > 0 ? "+" : ""}${amount} coins**`, inline: true },
      { name: "💰 Số dư mới", value: `**${balance} coins**`, inline: true },
      { name: "📝 Lý do", value: reason, inline: false }
    ]
  };
  fetch(DISCORD_COIN_LOG_WEBHOOK, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ embeds: [embed] }) }).catch(() => { });
}
function getAuth(id) {
  if (identities[id] === undefined) return null; // Nếu không tìm thấy ID (như ID 0 của Bot) thì trả về null thay vì sập
  return identities[id][0];
}

function getConn(id) {
  return identities[id][1];
}

function getRole(player) {
  return player.admin ? ROLE.SUPER_ADMIN : adminAuths.has(getAuth(player.id)) ? ROLE.ADMIN : ROLE.PLAYER;
}

function getSetting(id) {
  return new Setting(JSON.parse(localStorage.getItem(`setting_${getAuth(id)}`)));
}

function saveSetting(id, setting) {
  localStorage.setItem(`setting_${getAuth(id)}`, JSON.stringify(setting));
}

// Return player's statistics in the room
function getStats(auth) {
  if (statsCache[auth]) {
    return new PlayerReport(statsCache[auth]);
  }
  const raw = localStorage.getItem(auth);
  let data = null;
  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch(e) {}
  }
  if (!data) {
    data = {};
  }
  statsCache[auth] = data;
  return new PlayerReport(data);
}

function saveStatsCache(auth, stats) {
  let copy = Object.assign({}, stats);
  delete copy.auth;
  statsCache[auth] = copy;
  dirtyStats.add(auth);
}

function getGameStats(player, team) {
  if (identities[player.id] === undefined) return new PlayerStats();
  let auth = getAuth(player.id);

  try {
    if (isTakingPenalty && game.penalty) {
      if (game.penalty.groups[0].includes(player.id)) team = 1;
      else if (game.penalty.groups[1].includes(player.id)) team = 2;
      else team = team || player.team;
    } else {
      team = team || player.team;
    }

    if (game.teams[team].players[auth] === undefined) {
      game.teams[team].players[auth] = new PlayerStats(player.name);
    };
    return game.teams[team].players[auth];
  } catch (e) {
    return new PlayerStats(player.name);
  }
}

// Get a player by name or tag

function getPlayerByName(value) {
  if (!value) return null;
  // Find player by tag
  if (value.startsWith("@")) {
    return room.getPlayerList().find(player => getTag(player.name) == value);
  };
  // Find player by part of the name
  value = value.toLowerCase();
  return room.getPlayerList().find(player => player.name.toLowerCase().includes(value));
}

// Exclude AFK players from player list
function getNonAfkPlayers() {
  return room.getPlayerList().filter(player => !afkList.has(player.id));
}

function getSpectators() {
  return room.getPlayerList().filter(player => (player.team == 0) && !afkList.has(player.id));
}

// Get a player by position in Spectators list
function getPlayerByPos(number) {
  return getNonAfkPlayers().filter(player => player.team == 0)[number - 1];
}

function getMotm() {
  let participantsCount = Object.keys(game.teams[1].players).length + Object.keys(game.teams[2].players).length;
  // Thay MAX_PLAYERS thành MIN_PLAYERS_FOR_STATS để 8 người vẫn được tính MOTM
  if (participantsCount < MIN_PLAYERS_FOR_STATS * 2) return [null, new PlayerStats("")];
  let motm;
  let highestPoints = Number.NEGATIVE_INFINITY;
  for (let teamId = 1; teamId < 3; teamId++) {
    for (const [auth, stats] of Object.entries(game.teams[teamId].players)) {
      let points = 0;
      for (const [statName, value] of Object.entries(stats)) {
        if (PLAYER_SCORING_RULES[statName] === undefined) continue;
        points += PLAYER_SCORING_RULES[statName] * value;
      };
      if (teamId == prevWinner) points++; // Winners get an extra point
      if ((points > highestPoints) || ((points == highestPoints) && (stats.touches > motm[1].touches))) {
        highestPoints = points;
        motm = [auth, stats];
      };
    };
  };
  return motm;
}

function getPredictionWinners() {
  return (predictions[prevScore] || []).reduce(function (players, id) {
    if (afkList.has(id)) return players;
    let player = room.getPlayer(id);
    (player !== null) && (player.team !== prevWinner) && players.push(player);
    return players;
  }, []);
}

// Get the spectator with the most points
function getBestSpectatorByStats() {
  let bestPlayer = null;
  let highest = -1;
  for (const player of getSpectators()) {
    let stats = getStats(getAuth(player.id));
    let score = (stats.goals || 0) + (stats.assists || 0); // Ưu tiên người ghi bàn/kiến tạo nhiều
    if (score < highest) continue;
    bestPlayer = player;
    highest = score;
  };
  return bestPlayer;
}

function isCaptain(id) {
  return false;
}

function resizePlayer(id) {
  let setting = getSetting(id);
  let baseRadius = stadium.playerRadius || 15; // Lấy kích thước chuẩn
  // Bắt buộc reset lại kích thước về mặc định (có cộng thêm size của VIP nếu có)
  room.setPlayerDiscProperties(id, { radius: baseRadius + (+setting.sizeAdjustment) });
}

// Change players' size according to their settings
function resizePlayers() {
  for (const player of room.getPlayerList()) {
    if (player.team == 0) continue;
    resizePlayer(player.id);
  };
}

// Set random colors for 2 teams
function setRandomColors() {
  let randomIndex;
  do {
    randomIndex = getRandomInt(TEAM_COLORS.length);
  } while (colorHistory.includes(randomIndex));

  colorHistory.push(randomIndex);
  if (colorHistory.length > HISTORY_LIMIT) colorHistory.shift();

  let colors = TEAM_COLORS[randomIndex];

  kits.red = colors[0];
  kits.blue = colors[1];

  room.setTeamColors(1, ...colors[0]);
  room.setTeamColors(2, ...colors[1]);

  // --- THÔNG BÁO TỐI GIẢN (KHÔNG DELAY) ---
  if (stadium && stadium.name && stadium.name.includes("5v5")) {
    let colorString = JSON.stringify(colors);
    let special = SPECIAL_MATCHES[colorString];
    let normal = NORMAL_MATCHES[colorString];

    if (special) {
      room.sendAnnouncement(`${special.icon} SPECIAL MATCH: ${special.name} ${special.icon}`, null, special.color, "bold", 2);
    } else if (normal) {
      room.sendAnnouncement(`${normal.icon} Chủ đề trận đấu: ${normal.name} ${normal.icon}`, null, 0x00FFFF, "bold", 1);
    } else {
      room.sendAnnouncement("⚽ Trận đấu bắt đầu. Đề nghị anh em thi đấu fair-play!", null, 0x00FFFF, "bold", 1);
    }
  } else {
    // Không phải 5v5
    room.sendAnnouncement("⚽ Trận đấu bắt đầu. Đề nghị anh em thi đấu fair-play!", null, 0x00FFFF, "bold", 1);
  }
}
// 👑 HÀM KIỂM TRA ĐẶC QUYỀN VIP
function checkVip(playerId) {
  let auth = getAuth(playerId);
  if (!auth) return false;
  let data = getPlayerData(auth);
  return data && data.vipExpiry && Date.now() < data.vipExpiry;
}

async function avatarEffect(playerId, avatars) {
  for (const avatar of avatars) {
    await room.setPlayerAvatar(playerId, avatar);
    await new Promise(r => setTimeout(r, 500));
  };
  room.setPlayerAvatar(playerId, null);
}

// Thêm forceEffectId = null vào tham số
async function celebrationEffect(playerEventObj, hasScored, forceEffectId = null) {
  // FIX LỖI: Lấy dữ liệu cầu thủ ĐẦY ĐỦ từ hệ thống để có tọa độ (.position)
  let player = room.getPlayer(playerEventObj.id);

  // Nếu cầu thủ không ở trên sân (đang ở Spectator) thì không chạy hiệu ứng
  if (!player || !player.position) return;

  let playerIds;

  // 1. Đọc dữ liệu cá nhân của người chơi từ hệ thống Economy
  let auth = getAuth(player.id);
  let data = auth ? getPlayerData(auth) : null;
  let activeEffect = (data !== null) ? data.activeEffect : null;

  // 🎯 QUAN TRỌNG: Nếu chưa mua/chưa cài hiệu ứng (null) thì thoát luôn, không nổ
  if (activeEffect === null || activeEffect === undefined) return;

  // 2. Lựa chọn hiệu ứng theo thứ tự ưu tiên: Lệnh test -> Random (nếu cài -1) -> Hiệu ứng cụ thể
  let targetEffect;
  if (forceEffectId !== null) {
    targetEffect = forceEffectId;
  } else if (activeEffect === -1) {
    targetEffect = getRandomInt(15); // Gói Random: Quay từ 0 đến 14
  } else {
    targetEffect = activeEffect;
  }

  // 3. Thực thi hiệu ứng
  switch (targetEffect) {
    case 0: {
      // --- HIỆU ỨNG 0: SUPER SAIYAN (Hào quang rực cháy) ---
      if (!player.position) return;
      let originalRadius = room.getPlayerDiscProperties(player.id).radius;
      room.setPlayerAvatar(player.id, "🔥");

      let ssjInterval = setSafeInterval(() => {
        let pProps = room.getPlayerDiscProperties(player.id);
        if (!pProps) return;

        // Nhấp nháy kích thước
        room.setPlayerDiscProperties(player.id, { radius: originalRadius * 1.5 });
        setTimeout(() => room.setPlayerDiscProperties(player.id, { radius: originalRadius }), 100);

        // Phóng hào quang (đĩa) bay lượn lên trên
        for (let i = 9; i <= 15; i++) { // Dùng 7 đĩa làm aura
          room.setDiscProperties(i, {
            x: pProps.x + (Math.random() * 30 - 15),
            y: pProps.y + 15,
            xspeed: Math.random() * 2 - 1,
            yspeed: -(Math.random() * 5 + 5), // Bay ngược lên
            vis: true, color: 0xFFD700, radius: 3 + Math.random() * 3,
            invMass: 0, bCoef: 0, cMask: 0, cGroup: 0
          });
        }
      }, 200);

      setSafeTimeout(() => {
        clearInterval(ssjInterval);
        room.setPlayerAvatar(player.id, null);
        room.setPlayerDiscProperties(player.id, { radius: originalRadius });
        for (let i = 9; i <= 15; i++) room.setDiscProperties(i, { x: 10000, y: 10000, vis: false });
      }, 2500);
      break;
    }

    case 1: {
      // --- HIỆU ỨNG 1: ĐỘNG ĐẤT (Earthquake) ---
      if (!player.position) return;
      let originalRadius = room.getPlayerDiscProperties(player.id).radius;
      room.setPlayerDiscProperties(player.id, { radius: originalRadius * 2.5 });
      room.setPlayerAvatar(player.id, "🦍");

      // Làm tất cả những người khác trên sân bị nảy bần bật (Earthquake effect)
      let quakeInterval = setSafeInterval(() => {
        let players = room.getPlayerList();
        for (let p of players) {
          if (p.team === 0 || p.id === player.id || !p.position) continue;
          room.setPlayerDiscProperties(p.id, { yspeed: -7 + Math.random() * 14, xspeed: -3 + Math.random() * 6 });
          room.setPlayerAvatar(p.id, "😵");
        }
      }, 300);

      setSafeTimeout(() => {
        clearInterval(quakeInterval);
        room.setPlayerDiscProperties(player.id, { radius: originalRadius });
        for (let p of room.getPlayerList()) {
          if (p.team !== 0) room.setPlayerAvatar(p.id, null);
        }
      }, 2000);
      break;
    }

    case 2: {
      // --- HIỆU ỨNG 2: VÒNG TRÒN TÌNH BẠN (Team Dance) ---
      if (!player.position) return;
      room.setPlayerAvatar(player.id, "🕺");

      let orbitAngle = 0;
      let danceInterval = setSafeInterval(() => {
        let pProps = room.getPlayerDiscProperties(player.id);
        if (!pProps) return;
        orbitAngle += 0.2;

        let teammates = room.getPlayerList().filter(p => p.team === player.team && p.id !== player.id && p.position);
        if (teammates.length === 0) return;

        let angleStep = (Math.PI * 2) / teammates.length;

        for (let i = 0; i < teammates.length; i++) {
          let tProps = room.getPlayerDiscProperties(teammates[i].id);
          if (!tProps) continue;

          let targetX = pProps.x + Math.cos(orbitAngle + i * angleStep) * 60;
          let targetY = pProps.y + Math.sin(orbitAngle + i * angleStep) * 60;

          let dx = targetX - tProps.x;
          let dy = targetY - tProps.y;

          // Kéo đồng đội mượt mà vào vị trí vòng tròn
          room.setPlayerDiscProperties(teammates[i].id, { xspeed: dx / 5, yspeed: dy / 5 });
          room.setPlayerAvatar(teammates[i].id, "🎉");
        }
      }, 50);

      setSafeTimeout(() => {
        clearInterval(danceInterval);
        for (let p of room.getPlayerList()) {
          if (p.team !== 0) room.setPlayerAvatar(p.id, null);
        }
      }, 2500);
      break;
    }

    case 3: {
      // --- HIỆU ỨNG 3: QUẢ CẦU DISCO ---
      let ball = room.getDiscProperties(0);
      if (!ball) return;

      let originalColor = ball.color;
      let discoColors = [0xFF0000, 0xFF8000, 0xFFFF00, 0x00FF00, 0x00FFFF, 0x0000FF, 0xFF00FF];
      let colorIndex = 0;
      let discIndex = 9;

      let discoInterval = setSafeInterval(() => {
        let currentBall = room.getDiscProperties(0);
        if (!currentBall) return;

        // Đổi màu bóng liên tục
        room.setDiscProperties(0, { color: discoColors[colorIndex % discoColors.length] });
        colorIndex++;

        // Bắn tia sáng từ bóng
        for (let i = 0; i < 3; i++) {
          let angle = Math.random() * Math.PI * 2;
          room.setDiscProperties(discIndex, {
            x: currentBall.x, y: currentBall.y,
            xspeed: Math.cos(angle) * 12, yspeed: Math.sin(angle) * 12,
            vis: true, color: discoColors[getRandomInt(discoColors.length)], radius: 4,
            invMass: 0, bCoef: 0, cMask: 0, cGroup: 0
          });
          discIndex++;
          if (discIndex > 38) discIndex = 9;
        }
      }, 100);

      setSafeTimeout(() => {
        clearInterval(discoInterval);
        room.setDiscProperties(0, { color: originalColor }); // Trả lại màu gốc
        for (let i = 9; i <= 38; i++) room.setDiscProperties(i, { x: 10000, y: 10000, vis: false });
      }, 2500);
      break;
    }

    case 4: {
      // --- HIỆU ỨNG 4: THẦN LA THIÊN CHINH (Shinra Tensei) ---
      if (!player.position) return;
      room.setPlayerAvatar(player.id, "💢");

      // 1. Đẩy văng đối thủ theo hình tròn (Radial)
      let players = room.getPlayerList();
      for (let p of players) {
        if (p.team === 0 || p.id === player.id) continue;
        if (p.team !== player.team && p.position) {
          let dx = p.position.x - player.position.x;
          let dy = p.position.y - player.position.y;
          let dist = Math.hypot(dx, dy) || 1;

          if (dist < 350) { // Bán kính đẩy
            room.setPlayerDiscProperties(p.id, {
              xspeed: (dx / dist) * 22,
              yspeed: (dy / dist) * 22
            });
            room.setPlayerAvatar(p.id, "💨");
          }
        }
      }

      // 2. Vòng sóng xung kích (bung 30 đĩa ra cùng lúc)
      let count = 30;
      for (let i = 1; i <= count; i++) {
        let angle = (Math.PI * 2 * i) / count;
        room.setDiscProperties(i + 8, {
          x: player.position.x, y: player.position.y,
          xspeed: Math.cos(angle) * 25, // Bay cực nhanh
          yspeed: Math.sin(angle) * 25,
          vis: true, color: 0xFFFFFF, radius: 4,
          invMass: 0, bCoef: 0, cMask: 0, cGroup: 0
        });
      }

      setSafeTimeout(() => {
        for (let p of room.getPlayerList()) {
          if (p.team !== 0) room.setPlayerAvatar(p.id, null);
        }
        for (let i = 9; i <= 38; i++) {
          room.setDiscProperties(i, { x: 10000, y: 10000, vis: false, xspeed: 0, yspeed: 0 });
        }
      }, 1500);
      break;
    }

    case 5: {
      if (!player.position) return;
      let goalX = (player.team == 1) ? stadium.goalLine.x : -stadium.goalLine.x;
      let colors = [0xFF0000, 0x00FF00, 0xFFFF00, 0x00FFFF, 0xFF00FF, 0xFFFFFF, 0xFFA500];
      let count = 30;

      let players = room.getPlayerList();
      for (let i = 0; i < players.length; i++) {
        let p = players[i];
        if (p.team === 0 || !p.position) continue;
        let distanceToGoal = Math.abs(p.position.x - goalX);
        if (distanceToGoal < 250) {
          let pushForce = (player.team == 1 ? -15 : 15);
          room.setPlayerDiscProperties(p.id, {
            xspeed: pushForce,
            yspeed: (p.position.y > 0 ? 5 : -5)
          });
          room.setPlayerAvatar(p.id, "😱");
        }
      }

      // 🎯 Dịch index lên +8 (Bắt đầu từ Đĩa 9)
      for (let i = 1; i <= count; i++) {
        room.setDiscProperties(i + 8, {
          x: goalX,
          y: (Math.random() * 100) - 50,
          xspeed: (player.team == 1 ? -1 : 1) * (Math.random() * 15 + 10),
          yspeed: Math.random() * 12 - 6,
          vis: true,
          color: colors[getRandomInt(colors.length)],
          radius: 4 + Math.random() * 4,
          invMass: 0, bCoef: 0, cMask: 0, cGroup: 0
        });
      }

      setSafeTimeout(() => {
        let currentPlayers = room.getPlayerList();
        for (let i = 0; i < currentPlayers.length; i++) {
          if (currentPlayers[i].team !== 0) room.setPlayerAvatar(currentPlayers[i].id, null);
        }
        // 🎯 Xả tàng hình cho Đĩa 9 đến 38
        for (let i = 9; i <= 38; i++) {
          room.setDiscProperties(i, { x: 10000, y: 10000, vis: false, xspeed: 0, yspeed: 0 });
        }
      }, 2300);
      break;
    }

    case 6: {
      let ball = room.getDiscProperties(0);
      if (!ball) return;
      let count = 30;
      let colors = [0xFF0000, 0x00FF00, 0xFFFF00, 0x00FFFF, 0xFF00FF, 0xFFFFFF, 0xFFA500];

      // 🎯 Bắt đầu từ Đĩa 9
      for (let i = 1; i <= count; i++) {
        let angle = (Math.PI * 2 * i) / count;
        let blastSpeed = Math.random() * 8 + 8;
        room.setDiscProperties(i + 8, {
          x: ball.x, y: ball.y,
          xspeed: Math.cos(angle) * blastSpeed,
          yspeed: Math.sin(angle) * blastSpeed,
          vis: true, color: colors[getRandomInt(colors.length)],
          radius: 4 + Math.random() * 2,
          invMass: 1, bCoef: 0.5, cMask: 0, cGroup: 0,
          damping: 0.90
        });
      }

      let scatterInterval = setSafeInterval(() => {
        let activePlayers = [];
        let players = room.getPlayerList();
        for (let i = 0; i < players.length; i++) {
          if (players[i].team !== 0 && players[i].position) {
            let props = room.getPlayerDiscProperties(players[i].id);
            if (props) activePlayers.push({ id: players[i].id, props: props });
          }
        }
        if (activePlayers.length === 0) return;

        for (let i = 1; i <= count; i++) {
          let piece = room.getDiscProperties(i + 8);
          if (!piece || piece.x > 9000) continue;

          for (let j = 0; j < activePlayers.length; j++) {
            let pProps = activePlayers[j].props;
            let dx = piece.x - pProps.x;
            let dy = piece.y - pProps.y;
            let distSq = dx * dx + dy * dy;

            if (distSq < 400) {
              let angle = Math.atan2(dy, dx);
              let playerSpeed = Math.hypot(pProps.xspeed, pProps.yspeed) || 0;
              let scatterForce = playerSpeed + 4;
              room.setDiscProperties(i + 8, {
                xspeed: piece.xspeed + Math.cos(angle) * scatterForce,
                yspeed: piece.yspeed + Math.sin(angle) * scatterForce
              });
            }
          }
        }
      }, 150);

      setSafeTimeout(() => {
        clearInterval(scatterInterval);
        for (let i = 9; i <= 38; i++) {
          room.setDiscProperties(i, { x: 10000, y: 10000, vis: false, xspeed: 0, yspeed: 0 });
        }
      }, 2500);
      break;
    }

    case 7: {
      if (!player.position) return;
      let colors = [0xFF0000, 0x00FF00, 0xFFFF00, 0x00FFFF, 0xFF00FF, 0xFFFFFF, 0xFFA500];
      let discIndex = 9; // 🎯 Khởi đầu từ 9

      let lastAngle = (player.team === 1) ? 0 : Math.PI;
      room.setPlayerAvatar(player.id, "🎆");

      let sparklerInterval = setSafeInterval(() => {
        let pProps = room.getPlayerDiscProperties(player.id);
        if (!pProps) return;

        let speedSq = pProps.xspeed * pProps.xspeed + pProps.yspeed * pProps.yspeed;
        if (speedSq > 0.5) lastAngle = Math.atan2(pProps.yspeed, pProps.xspeed);

        let spawnX = pProps.x - Math.cos(lastAngle) * 12;
        let spawnY = pProps.y - Math.sin(lastAngle) * 12;

        let numParticles = 7;
        let baseAngle = Math.random() * Math.PI * 2;
        let spreadAngle = Math.PI / 3;

        for (let i = 0; i < numParticles; i++) {
          let angle = baseAngle - (spreadAngle / 2) + (spreadAngle * (i / (numParticles - 1)));
          let speed = Math.random() * 6 + 9;

          room.setDiscProperties(discIndex, {
            x: spawnX, y: spawnY,
            xspeed: Math.cos(angle) * speed, yspeed: Math.sin(angle) * speed,
            vis: true, color: colors[getRandomInt(colors.length)],
            radius: 4 + Math.random() * 2,
            invMass: 0, bCoef: 0, cMask: 0, cGroup: 0
          });

          discIndex++;
          if (discIndex > 38) discIndex = 9; // 🎯 Quay vòng từ 9 -> 38
        }
      }, 400);

      setSafeTimeout(() => {
        clearInterval(sparklerInterval);
        for (let i = 9; i <= 38; i++) {
          room.setDiscProperties(i, { x: 10000, y: 10000, vis: false, xspeed: 0, yspeed: 0 });
        }
        room.setPlayerAvatar(player.id, null);
      }, 2500);
      break;
    }

    case 8: {
      if (!player.position) return;
      let discIndex = 9; // 🎯 Khởi đầu từ 9
      let lastAngle = (player.team === 1) ? 0 : Math.PI;
      room.setPlayerAvatar(player.id, "🔫");

      let machineGunInterval = setSafeInterval(() => {
        let discProps = room.getPlayerDiscProperties(player.id);
        if (!discProps) return;

        let speedSq = discProps.xspeed * discProps.xspeed + discProps.yspeed * discProps.yspeed;
        if (speedSq > 0.5) lastAngle = Math.atan2(discProps.yspeed, discProps.xspeed);

        let bulletSpeed = 12;
        let randomColor = Math.floor(Math.random() * 16777215);

        let spawnX = discProps.x - Math.cos(lastAngle) * 12;
        let spawnY = discProps.y - Math.sin(lastAngle) * 12;

        room.setDiscProperties(discIndex, {
          x: spawnX, y: spawnY,
          xspeed: Math.cos(lastAngle) * bulletSpeed + (discProps.xspeed * 0.8),
          yspeed: Math.sin(lastAngle) * bulletSpeed + (discProps.yspeed * 0.8),
          vis: true, color: randomColor, radius: 3.5,
          invMass: 0, bCoef: 0, cMask: 0, cGroup: 0
        });

        discIndex++;
        if (discIndex > 38) discIndex = 9; // 🎯 Tận dụng full 30 viên đạn
      }, 50);

      setSafeTimeout(() => {
        clearInterval(machineGunInterval);
        for (let i = 9; i <= 38; i++) {
          room.setDiscProperties(i, { x: 10000, y: 10000, vis: false, xspeed: 0, yspeed: 0 });
        }
        room.setPlayerAvatar(player.id, null);
      }, 2300);
      break;
    }

    case 9: {
      // --- HIỆU ỨNG 9: SIÊU HỐ ĐEN VŨ TRỤ (Mở rộng & Có ranh giới) ---
      if (!player.position) return;
      room.setPlayerAvatar(player.id, "🌌");
      let bhAngle = 0;

      let blackHoleInterval = setSafeInterval(() => {
        let pProps = room.getPlayerDiscProperties(player.id);
        if (!pProps) return;

        bhAngle += 0.2;

        // 1. Mở rộng bán kính vòng xoáy lên 130 (thay vì 60 như cũ)
        for (let i = 0; i < 30; i++) {
          let spiralRadius = 130 - ((bhAngle * 12 + i * 6) % 130);
          let angleOffset = bhAngle + (i * (Math.PI * 2) / 30);

          room.setDiscProperties(i + 9, {
            x: pProps.x + Math.cos(angleOffset) * spiralRadius,
            y: pProps.y + Math.sin(angleOffset) * spiralRadius,
            vis: true, color: (i % 2 === 0) ? 0x4B0082 : 0x000000,
            radius: 3 + (spiralRadius / 25), // Chỉnh lại tỷ lệ size để đĩa không bị to quá đà
            invMass: 0, bCoef: 0, cMask: 0, cGroup: 0
          });
        }

        // 2. Lực hút thông minh (Quỹ đạo lơ lửng)
        let players = room.getPlayerList();
        for (let i = 0; i < players.length; i++) {
          let p = players[i];
          if (p.team === 0 || p.id === player.id || !p.position) continue;

          let p2Props = room.getPlayerDiscProperties(p.id);
          if (!p2Props) continue;

          let dx = pProps.x - p2Props.x;
          let dy = pProps.y - p2Props.y;
          let dist = Math.hypot(dx, dy) || 1;

          if (dist > 55) {
            // Nếu ở xa > Bị hút vào với vận tốc ổn định
            room.setPlayerDiscProperties(p.id, {
              xspeed: (dx / dist) * 7,
              yspeed: (dy / dist) * 7
            });
            room.setPlayerAvatar(p.id, "😵");
          } else {
            // Nếu đã vào gần tới tâm > Ngừng hút, chuyển sang xoáy lơ lửng quanh tâm
            room.setPlayerDiscProperties(p.id, {
              xspeed: (-dy / dist) * 4, // Lực tiếp tuyến xoay tròn
              yspeed: (dx / dist) * 4
            });
            room.setPlayerAvatar(p.id, "💫"); // Đổi avatar chóng mặt
          }
        }
      }, 50);

      setSafeTimeout(() => {
        clearInterval(blackHoleInterval);
        room.setPlayerAvatar(player.id, null);

        let currentPlayers = room.getPlayerList();
        for (let i = 0; i < currentPlayers.length; i++) {
          if (currentPlayers[i].team !== 0) room.setPlayerAvatar(currentPlayers[i].id, null);
        }
        for (let i = 9; i <= 38; i++) {
          room.setDiscProperties(i, { x: 10000, y: 10000, vis: false });
        }

        // Vụ nổ đẩy ra nhẹ khi hố đen biến mất (có điều chỉnh lực dội)
        let pProps = room.getPlayerDiscProperties(player.id);
        if (pProps) {
          for (let p of currentPlayers) {
            if (p.team === 0 || p.id === player.id) continue;
            let p2Props = room.getPlayerDiscProperties(p.id);
            if (p2Props) {
              let dx = p2Props.x - pProps.x;
              let dy = p2Props.y - pProps.y;
              let dist = Math.hypot(dx, dy) || 1;
              room.setPlayerDiscProperties(p.id, {
                xspeed: (dx / dist) * 10, // Đẩy văng ra theo hướng vector
                yspeed: (dy / dist) * 10
              });
            }
          }
        }
      }, 2500);
      break;
    }

    case 10: {
      // --- HIỆU ỨNG 10: DẢI NGÂN HÀ HOÀNG KIM ---
      if (!player.position) return;
      room.setPlayerAvatar(player.id, "👑");
      let angle = 0;

      let auraInterval = setSafeInterval(() => {
        let pProps = room.getPlayerDiscProperties(player.id);
        if (!pProps) return;
        angle += 0.15;

        // Phân bổ 30 đĩa thành 3 lớp quỹ đạo (10 đĩa/lớp)
        for (let i = 0; i < 30; i++) {
          let layer = Math.floor(i / 10); // Lớp 0, 1, 2
          let orbitRadius = 25 + (layer * 15); // Bán kính: 25, 40, 55
          let speedMultiplier = 3 - layer; // Lớp trong quay nhanh hơn lớp ngoài
          let offset = (angle * speedMultiplier) + ((i % 10) * (Math.PI * 2 / 10));

          let colors = [0xFFD700, 0xFFA500, 0xFFFFFF]; // Vàng, Cam, Trắng

          room.setDiscProperties(i + 9, {
            x: pProps.x + Math.cos(offset) * orbitRadius,
            y: pProps.y + Math.sin(offset) * orbitRadius,
            vis: true, color: colors[layer], radius: 4 - (layer * 0.5),
            invMass: 0, bCoef: 0, cMask: 0, cGroup: 0
          });
        }
      }, 50);

      setSafeTimeout(() => {
        clearInterval(auraInterval);
        for (let i = 9; i <= 38; i++) {
          room.setDiscProperties(i, { x: 10000, y: 10000, vis: false });
        }
        room.setPlayerAvatar(player.id, null);
      }, 3500);
      break;
    }

    case 11: {
      if (!player.position) return;
      room.setPlayerAvatar(player.id, "⚡");

      let blinkInterval = setSafeInterval(() => {
        room.setPlayerDiscProperties(player.id, {
          xspeed: Math.random() * 40 - 20,
          yspeed: Math.random() * 40 - 20
        });
      }, 200);

      setSafeTimeout(() => {
        clearInterval(blinkInterval);
        room.setPlayerAvatar(player.id, null);
      }, 2300);
      break;
    }

    case 12: {
      // --- HIỆU ỨNG 12: BOM HẠT NHÂN (Nuke Bomb) ---
      if (!player.position) return;
      let bombTimer = 3;
      room.setPlayerAvatar(player.id, "☢️");
      let dangerRadius = 150;

      let countdown = setSafeInterval(() => {
        let pProps = room.getPlayerDiscProperties(player.id);
        if (!pProps) return;

        bombTimer--;
        if (bombTimer > 0) {
          room.setPlayerAvatar(player.id, bombTimer.toString());
          dangerRadius -= 40; // Vòng nguy hiểm siết lại

          // Hiển thị vòng tròn cảnh báo
          for (let i = 0; i < 30; i++) {
            let angle = i * (Math.PI * 2 / 30);
            room.setDiscProperties(i + 9, {
              x: pProps.x + Math.cos(angle) * dangerRadius,
              y: pProps.y + Math.sin(angle) * dangerRadius,
              vis: true, color: 0xFF0000, radius: 3,
              invMass: 0, bCoef: 0, cMask: 0, cGroup: 0
            });
          }
        }
      }, 500);

      setSafeTimeout(() => {
        clearInterval(countdown);
        room.setPlayerAvatar(player.id, "💥");
        let pProps = room.getPlayerDiscProperties(player.id);
        if (!pProps) return;

        // Đẩy văng tất cả mọi người trên sân (Áp lực cực mạnh)
        let playersOnField = room.getPlayerList();
        for (let p of playersOnField) {
          if (p.team === 0 || p.id === player.id) continue;
          let p2Props = room.getPlayerDiscProperties(p.id);
          if (!p2Props) continue;
          let dx = p2Props.x - pProps.x;
          let dy = p2Props.y - pProps.y;
          let dist = Math.hypot(dx, dy) || 1;

          room.setPlayerDiscProperties(p.id, { xspeed: (dx / dist) * 25, yspeed: (dy / dist) * 25 });
          room.setPlayerAvatar(p.id, "🚀");
        }

        // Bắn 30 đĩa ra mọi hướng như sóng xung kích
        for (let i = 0; i < 30; i++) {
          let angle = i * (Math.PI * 2 / 30);
          room.setDiscProperties(i + 9, {
            x: pProps.x, y: pProps.y,
            xspeed: Math.cos(angle) * 25, yspeed: Math.sin(angle) * 25,
            vis: true, color: 0xFF4500, radius: 8,
            invMass: 0, bCoef: 0, cMask: 0, cGroup: 0
          });
        }
      }, 1500);

      setSafeTimeout(() => {
        room.setPlayerAvatar(player.id, null);
        for (let p of room.getPlayerList()) {
          if (p.team !== 0) room.setPlayerAvatar(p.id, null);
        }
        for (let i = 9; i <= 38; i++) {
          room.setDiscProperties(i, { x: 10000, y: 10000, vis: false, xspeed: 0, yspeed: 0 });
        }
      }, 2300);
      break;
    }

    case 13: {
      if (!player.position) return;
      room.setPlayerAvatar(player.id, "☄️");
      let discIndex = 9; // 🎯 Bắt đầu từ 9

      let meteorInterval = setSafeInterval(() => {
        let pProps = room.getPlayerDiscProperties(player.id);
        if (!pProps) return;

        for (let i = 0; i < 2; i++) {
          let randomX = pProps.x - 400 + Math.random() * 800;
          room.setDiscProperties(discIndex, {
            x: randomX, y: -350,
            xspeed: 4 + Math.random() * 4, yspeed: 12 + Math.random() * 6,
            vis: true, color: 0xFF8C00,
            radius: 5 + Math.random() * 5,
            invMass: 0, bCoef: 0, cMask: 0, cGroup: 0
          });
          discIndex++;
          if (discIndex > 38) discIndex = 9; // 🎯 Tận dụng full 30 đĩa
        }
      }, 130);

      setSafeTimeout(() => {
        clearInterval(meteorInterval);
        for (let i = 9; i <= 38; i++) {
          room.setDiscProperties(i, { x: 10000, y: 10000, vis: false, xspeed: 0, yspeed: 0 });
        }
        room.setPlayerAvatar(player.id, null);
      }, 2500);
      break;
    }

    case 14: {
      // --- HIỆU ỨNG 14: BÃO CUỒNG PHONG ---
      if (!player.position) return;
      room.setPlayerAvatar(player.id, "🌪️");
      let tornadoAngle = 0;

      let tornadoInterval = setSafeInterval(() => {
        let pProps = room.getPlayerDiscProperties(player.id);
        if (!pProps) return;
        tornadoAngle += 0.4;

        // Tạo 3 tầng lốc xoáy (10 đĩa mỗi tầng)
        for (let i = 0; i < 30; i++) {
          let layer = Math.floor(i / 10);
          let layerRadius = 20 + (layer * 15); // Lốc xoáy to dần ra ngoài
          let offsetAngle = tornadoAngle + (i * (Math.PI * 2 / 10)) + (layer * 0.5); // Xoắn ốc

          room.setDiscProperties(i + 9, {
            x: pProps.x + Math.cos(offsetAngle) * layerRadius,
            y: pProps.y + Math.sin(offsetAngle) * layerRadius,
            xspeed: Math.cos(offsetAngle + Math.PI / 2) * 5, // Vận tốc xoay
            yspeed: Math.sin(offsetAngle + Math.PI / 2) * 5,
            vis: true, color: 0x87CEEB, radius: 4 + layer,
            invMass: 0, bCoef: 0, cMask: 0, cGroup: 0
          });
        }

        // Kéo và xoáy đối thủ
        let currentPlayers = room.getPlayerList();
        for (let p of currentPlayers) {
          if (p.team === 0 || p.id === player.id) continue;
          let p2Props = room.getPlayerDiscProperties(p.id);
          if (!p2Props) continue;

          let dx = pProps.x - p2Props.x;
          let dy = pProps.y - p2Props.y;
          let distSq = dx * dx + dy * dy;

          if (distSq < 40000) { // Phạm vi bão rộng hơn
            let dist = Math.hypot(dx, dy) || 1;
            room.setPlayerDiscProperties(p.id, {
              xspeed: p2Props.xspeed * 0.7 + (dx / dist) * 3 + (-dy / dist) * 4,
              yspeed: p2Props.yspeed * 0.7 + (dy / dist) * 3 + (dx / dist) * 4
            });
            room.setPlayerAvatar(p.id, "😵‍💫");
          }
        }
      }, 50); // Tick rate nhanh hơn để lốc xoáy mượt hơn

      setSafeTimeout(() => {
        clearInterval(tornadoInterval);
        for (let i = 9; i <= 38; i++) {
          room.setDiscProperties(i, { x: 10000, y: 10000, vis: false, xspeed: 0, yspeed: 0 });
        }
        for (let p of room.getPlayerList()) {
          if (p.team !== 0) room.setPlayerAvatar(p.id, null);
        }
      }, 2500);
      break;
    }
  };
}

// === BỘ QUẢN LÝ TIẾN TRÌNH HIỆU ỨNG (CHỐNG RÒ RỈ RAM) ===
let activeEffectIntervals = [];
let activeEffectTimeouts = [];

// Hàm bao bọc an toàn để ghi nhớ tiến trình
// 🛡️ FIX TRÀN RAM: setSafeTimeout tự xóa ID khỏi mảng sau khi callback chạy xong
// Trước đây chỉ push mãi → mảng phình to sau hàng trăm bàn thắng
function setSafeInterval(callback, ms) {
  let id = setInterval(callback, ms);
  activeEffectIntervals.push(id);
  return id;
}

function setSafeTimeout(callback, ms) {
  let id = setTimeout(() => {
    callback();
    // Tự xóa ID này khỏi mảng sau khi đã chạy xong (tránh mảng phình to)
    let idx = activeEffectTimeouts.indexOf(id);
    if (idx !== -1) activeEffectTimeouts.splice(idx, 1);
  }, ms);
  activeEffectTimeouts.push(id);
  return id;
}

function cleanupEffectDiscs() {
  // Thêm ngoặc đơn () quanh cụm check stadium để logic AND/OR chạy chuẩn xác
  if ((stadium && stadium.name === "penalty") || isTakingPenalty) return;

  // 1. DẬP TẮT TOÀN BỘ ĐỒNG HỒ NGẦM ĐANG CHẠY (Chống tràn RAM cực mạnh)
  if (typeof activeEffectIntervals !== 'undefined') {
    activeEffectIntervals.forEach(clearInterval);
    activeEffectIntervals = [];
  }
  if (typeof activeEffectTimeouts !== 'undefined') {
    activeEffectTimeouts.forEach(clearTimeout);
    activeEffectTimeouts = [];
  }

  // 2. 🎯 Dọn 30 đĩa hiệu ứng rác (Từ ID 9 đến 38) & Chống Crash
  for (let i = 9; i <= 38; i++) {
    try {
      room.setDiscProperties(i, {
        x: 10000, y: 10000,
        vis: false, xspeed: 0, yspeed: 0
      });
    } catch (e) {
      // Nhẹ nhàng bỏ qua nếu map hiện tại không có đủ 38 đĩa
    }
  }

  // 3. Xóa mọi Emoji (Avatar) bị kẹt do hiệu ứng ngắt giữa chừng
  let players = room.getPlayerList();
  for (let i = 0; i < players.length; i++) {
    if (players[i].team !== 0) room.setPlayerAvatar(players[i].id, null);
  }
}

function isPlayerValid(player) {
  // Players without a name are not allowed
  if (player.name.trim().length == 0) {
    room.kickPlayer(player.id, "Người chơi không có tên");
    return false;
  };
  // Invisible characters aren't allowed
  if (INVISIBLE_CHARACTERS.some(char => player.name.includes(char))) {
    room.kickPlayer(player.id, "Tên người chơi chứa kí tự không hợp lệ");
    return false;
  };

  let tag = getTag(player.name.trim());
  for (const _player of room.getPlayerList()) {
    if (_player.id == player.id) continue;
    // Player joined by 2 tabs
    if ((_player.id != 0) && (getConn(_player.id) == player.conn)) {
      room.kickPlayer(_player.id, "Bạn đã vào room bằng 1 tab khác");
      continue;
    };
    // Duplicate tag
    if (getTag(_player.name.trim()) == tag) {
      room.kickPlayer(player.id, "Bạn đã trùng tên với một người khác trong room, xin vui lòng đổi lại");
      return false;
    };
  };
  return true;
}

async function checkBan(player) {
  let bans = JSON.parse(localStorage.getItem("bans")) || [];
  for (let i = 0; i < bans.length; i++) {
    if (bans[i][0] != player.conn) continue;
    bans[i][0] = player.id;
    setTimeout(ban.bind(null, ...bans[i]), 3000);
    bans.splice(i, 1);
    break;
  };
  localStorage.setItem("bans", JSON.stringify(bans));
}

function saveIdentities(player) {
  identities[player.id] = [player.auth, player.conn];
}

function canUseCommand(command, player) {
  if (getRole(player) < command[2]) return false; // Role is not high enough
  return true;
}

let afkPositions = {};

function afkCallback(id) {
  let player = room.getPlayer(id);
  if (!player || player.team === 0) {
    delete timeouts.toAct[id];
    delete afkPositions[id];
    return;
  }

  // 🎯 THÊM DÒNG NÀY ĐỂ KHÓA VAN AN TOÀN CHO 1V1 VÀ TRAINING
  if (stadium && (stadium.name === "1v1" || stadium.name === "training")) return;

  // 🛡️ BẢO HIỂM 1: Người chơi vừa vào sân, nhân vật chưa kịp Load.
  if (!player.position) {
    //... (phần code dưới giữ nguyên)
    timeouts.toAct[id] = setTimeout(afkCallback.bind(null, id), ACTIVITY_TIMEOUT * 1000);
    return;
  }

  // 🛡️ BẢO HIỂM 2: Nếu Radar bị mất dấu tọa độ gốc của họ
  // -> Lưu lại tọa độ hiện tại làm mốc và bắt đầu đếm 10s.
  if (!afkPositions[id]) {
    afkPositions[id] = { x: player.position.x, y: player.position.y };
    timeouts.toAct[id] = setTimeout(afkCallback.bind(null, id), ACTIVITY_TIMEOUT * 1000);
    return;
  }

  // 🎯 KIỂM TRA CHUYỂN ĐỘNG VẬT LÝ
  let dx = player.position.x - afkPositions[id].x;
  let dy = player.position.y - afkPositions[id].y;
  let dist = Math.hypot(dx, dy);

  // Nếu có di chuyển hơn 5 đơn vị -> Đang đá bình thường! Reset giờ.
  if (dist > 5) {
    afkPositions[id] = { x: player.position.x, y: player.position.y };
    timeouts.toAct[id] = setTimeout(afkCallback.bind(null, id), ACTIVITY_TIMEOUT * 1000);
    return;
  }

  // Nếu thực sự đứng im phăng phắc suốt 10 giây -> Trảm!
  room.kickPlayer(id, "AFK");
  delete timeouts.toAct[id];
  delete afkPositions[id];
}

// Kick if player doesn't quit AFK mode in time
function oversleepCallback(id) {
  let player = room.getPlayer(id);
  if (player && getRole(player) >= ROLE.ADMIN) {
    // Hủy lệnh kick nếu người đó là Admin
    delete timeouts.toQuitAfk[id];
    return;
  }
  room.kickPlayer(id, "Bạn đã AFK quá lâu");
  delete timeouts.toQuitAfk[id];
}

function penaltyTimeoutCallback() {
  if (!isTakingPenalty) return;
  room.sendChat("Cầu thủ đã không thực hiện penalty trong thời gian quy định");
  // Count as a miss if player doesn't perform the penalty in time
  game.penalty.push(false);
  takePenalty();
}

// Return true if the game is ongoing, false if the game is not yet started or is technically "over"
function getGameStatus() {
  let scores = room.getScores();
  return (
    (scores !== null) &&
    (Math.max(scores.red, scores.blue, 0.5) != scores.scoreLimit) &&
    ((scores.red == scores.blue) || (scores.time < scores.timeLimit))
  );
}

let isUpdatingTeams = false;
async function updateTeamPlayers() {
  if (getGameStatus() === false || isUpdatingTeams) return;

  isUpdatingTeams = true;
  try {
    let players = getNonAfkPlayers();
    let redPlayers = players.filter(player => player.team == 1);
    let bluePlayers = players.filter(player => player.team == 2);

    // ✅ BẢN SỬA: Đưa subPlayers lên đây để khởi tạo trước khi dùng
    let subPlayers = players.filter(player => player.team == 0);

    let currentMaxPlayers = MAX_PLAYERS;
    if (typeof stadium !== "undefined" && stadium.name) {
      if (stadium.name.includes("3v3")) currentMaxPlayers = 3;
      if (stadium.name.includes("1v1")) currentMaxPlayers = 2;

      // Xử lý riêng cho map training: Cho phép người chơi tự động vào sân đá tập, không bị kẹt ở spec
      if (stadium.name.includes("training") || stadium.name === "Practice") {
        if (subPlayers.length > 0) {
          let targetTeam = (redPlayers.length <= bluePlayers.length) ? 1 : 2;
          room.setPlayerTeam(subPlayers[0].id, targetTeam);
        }
        return;
      }
    }
    if (typeof isTakingPenalty !== "undefined" && isTakingPenalty) currentMaxPlayers = 1;

    if ((redPlayers.length >= currentMaxPlayers) && (bluePlayers.length >= currentMaxPlayers)) return;

    let missingTeam = (redPlayers.length > bluePlayers.length) ? 2 : (redPlayers.length < bluePlayers.length) ? 1 : 0;

    // NẾU CÓ NGƯỜI DỰ BỊ
    if (subPlayers.length > 0) {
      // 1. Ưu tiên lấp chỗ trống cho đội đang thiếu trước
      if (missingTeam !== 0) {
        room.setPlayerTeam(subPlayers[0].id, missingTeam);
        subPlayers.shift();
        if (missingTeam === 1) redPlayers.push({}); else bluePlayers.push({});
        missingTeam = 0;
      }

      // 2. Nếu vẫn còn dư 2 người trở lên VÀ cả 2 đội đều còn slot trống -> Thêm vào mỗi đội 1 người
      if (subPlayers.length >= 2 && redPlayers.length < currentMaxPlayers && bluePlayers.length < currentMaxPlayers) {
        room.setPlayerTeam(subPlayers[0].id, 1);
        room.setPlayerTeam(subPlayers[1].id, 2);
      }

    }
    // NẾU KHÔNG CÓ DỰ BỊ nhưng đội hình lại lệch (vd 5 vs 4 do có người out)
    else if (subPlayers.length === 0 && missingTeam !== 0 && players.length > 1) {
      let excessTeam = (missingTeam === 1) ? bluePlayers : redPlayers;
      room.setPlayerTeam(excessTeam.at(-1).id, 0);
    }

  } finally {
    isUpdatingTeams = false;
  }
}
// Update information to monitor last kickers, possession and passing accuracy
function updateBallKick(player) {
  if (!isPlaying) return;
  let ballProperties = room.getDiscProperties(0);
  game.ballRecords.unshift(new Kick(ballProperties, player));
  game.ballRecords.pop();

  if (game.ballRecords[1] === null) { // Kick-off pass
    // Disallow pausing after kick-off
    canPause = false;
    return;
  };

  let timeGap = game.ballRecords[0].time - game.ballRecords[1].time;
  let travelingDistance = getDistance(ballProperties.x - game.ballRecords[1].properties.x, ballProperties.y - game.ballRecords[1].properties.y);
  let stats = getGameStats(player);
  stats.touches++;
  // If the previous kick was a shot on goal, check whether it was blocked and exclude that shot if it was
  if (
    game.ballRecords[1].isAShot &&
    (timeGap < 1) &&
    (travelingDistance < stadium.playerRadius)
  ) {
    getGameStats(game.ballRecords[1].player).shotsOnTarget--;
    game.ballRecords[1].isAShot = false;
  } else if (game.ballRecords[0].isAShot) {
    stats.shotsOnTarget++;
  } else if (Math.abs(ballProperties.x + ballProperties.xspeed * 100) < stadium.goalLine.x) { // Switch to penalty shootout when maximum added time reached
    let scores = room.getScores();
    if (scores && (scores.timeLimit != 0) && (scores.time - scores.timeLimit > MAX_ADDED_TIME)) {
      startPenaltyShootout();
      return;
    };
  };

  stats = getGameStats(game.ballRecords[1].player);
  if ((game.ballRecords[2] !== null) && game.ballRecords[2].isAShot && (game.ballRecords[1].player.team != game.ballRecords[2].player.team)) stats.stoppedShots++;
  if (player.team != game.ballRecords[1].player.team) return; // Received the ball from an opponent player
  if ((player.id != game.ballRecords[1].player.id) && (travelingDistance > 12)) stats.passes++; // Received the ball from a teammate, so the previous kick was a pass
  game.teams[player.team].possession += timeGap; // Received the ball from a teammate or from yourself, so it was in possession
}

function helpFunc(value, player) {
  let allAlias = Object.keys(commands).filter(alias => canUseCommand(commands[alias], player));
  allAlias = allAlias.map(alias => "!" + alias)
  room.sendAnnouncement(`Các câu lệnh có sẵn: ${allAlias.join(", ")}`, player.id, GREEN);
  return false;
}

function discordFunc(value, player) {
  if (!DISCORD_LINK) {
    room.sendAnnouncement(`Room hiện chưa có server Discord`, player.id, YELLOW, "normal", 0);
    return false;
  };
  room.sendAnnouncement(`Vào server Discord của Admin(Dyck Gang) 🥰: ${DISCORD_LINK}`, null, GREEN, "normal", 0);
  return true;
}

// 🚨 HÀM BÁO CÁO LỖI ROOM - Gửi webhook lên Discord và tag Admin
const reportCooldowns = new Map(); // Chống spam lệnh !report
const REPORT_COOLDOWN_MS = 60 * 1000; // 60 giây cooldown mỗi người

function reportFunc(value, player) {
  if (!value || value.trim().length < 5) {
    room.sendAnnouncement(
      "❌ Vui lòng mô tả lỗi rõ hơn (ít nhất 5 ký tự). Ví dụ: !report room bị lỏ không đá được",
      player.id, 0xFF4444, "bold", 0
    );
    return false;
  }

  // Kiểm tra cooldown
  let now = Date.now();
  let lastUsed = reportCooldowns.get(player.id) || 0;
  if (now - lastUsed < REPORT_COOLDOWN_MS) {
    let remaining = Math.ceil((REPORT_COOLDOWN_MS - (now - lastUsed)) / 1000);
    room.sendAnnouncement(
      `⏳ Bạn đã gửi báo cáo gần đây. Vui lòng đợi thêm ${remaining} giây.`,
      player.id, YELLOW, "bold", 0
    );
    return false;
  }
  reportCooldowns.set(player.id, now);

  // Thông báo trong phòng
  room.sendAnnouncement(
    `🚨 ${player.name} đã gửi báo cáo lỗi: "${value}" — Admin đang được thông báo trên Discord!`,
    null, 0xFF6600, "bold", 0
  );

  // Gửi lên Discord webhook dạng Embed
  let tags = REPORT_TAG_USER_IDS.map(id => `<@${id}>`).join(" ");
  let payload = {
    content: tags,
    embeds: [{ color: 0xFF4400, title: "🚨 Báo cáo lỗi room(BET, SHOP)", description: `**${player.name}:** ${value}` }],
  };

  fetch(DISCORD_REPORT_WEBHOOK, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(err => console.error("Report webhook error:", err));

  return true;
}


function byeFunc(value, player) {
  room.kickPlayer(player.id, "Bye, sớm quay lại room nha 👋🏻??");
  return false;
}

function showStatsFunc(value, player) {
  let showPlayer;
  if (!value) {
    showPlayer = player;
  } else {
    showPlayer = getPlayerByName(value);
    if (showPlayer === undefined) {
      room.sendAnnouncement(`Người chơi "${value}" không tồn tại hoặc đã rời đi`, player.id, RED);
      return false;
    };
  };
  let auth = getAuth(showPlayer.id);
  let item = getStats(auth);
  let pData = getPlayerData(auth);
  let reqXp = 300;
  room.sendAnnouncement(`Thống kê trong tháng ${getMonths()} của ${showPlayer.name} (Cấp: ${pData.level || 1} | XP: ${Math.floor(pData.xp || 0)}/${reqXp}):`, player.id, BLUE, "bold", 0);
  room.sendAnnouncement(`│⚽ Bàn thắng: ${item.goals}
│🤝🏻 Kiến tạo: ${item.assists}
│❌ Bàn thắng phản lưới nhà: ${item.ownGoals}
│🧤 Sạch lưới: ${item.cleansheets}
│✨ Cầu thủ xuất sắc nhất trận: ${item.motms}
│🔰 Số trận đã chơi: ${item.games}
│🏆 Tỉ lệ thắng: ${item.getWinRate()}%`, player.id, BLUE, "small-bold", 0);
  return false;
}

let cachedRankings = null;
let lastRankingsUpdate = 0;

function updateRankingsCache() {
  let playerList = getPlayerStats();
  if (playerList.length == 0) {
    cachedRankings = { playerList: [], byLevel: [], byGoals: [], byAssists: [] };
    lastRankingsUpdate = Date.now();
    return;
  }

  for (let p of playerList) {
    p.level = getPlayerData(p.auth).level || 1;
  }

  let byLevel = [...playerList].sort((a, b) => b.level - a.level || b.games - a.games);
  let byGoals = [...playerList].sort((a, b) => b.goals - a.goals || b.assists - a.assists);
  let byAssists = [...playerList].sort((a, b) => b.assists - a.assists || b.goals - a.goals);

  cachedRankings = { playerList, byLevel, byGoals, byAssists };
  lastRankingsUpdate = Date.now();
}

function showRankingsFunc(value, player) {
  if (!cachedRankings || Date.now() - lastRankingsUpdate > 10 * 60 * 1000) {
    updateRankingsCache();
  }

  const { playerList, byLevel, byGoals, byAssists } = cachedRankings;

  if (playerList.length == 0) {
    room.sendAnnouncement("Chưa có dữ liệu người chơi", player.id, RED);
    return false;
  }

  let pAuth = getAuth(player.id);
  let levelRank = 1 + byLevel.findIndex(s => s.auth == pAuth);
  let goalsRank = 1 + byGoals.findIndex(s => s.auth == pAuth);
  let assistsRank = 1 + byAssists.findIndex(s => s.auth == pAuth);

  let msg = `🌟 Top Cấp độ: ${byLevel.slice(0, 5).map((p, i) => `${i + 1}. ${p.name} (LV${p.level})`).join(" • ")}`;
  msg += `\n (Hạng của bạn: ${levelRank > 0 ? levelRank : "N/A"})`;
  msg += `\n⚽ Top ghi bàn tháng ${getMonths()}: ${byGoals.slice(0, 5).map((p, i) => `${i + 1}. ${p.name} (${p.goals}⚽)`).join(" • ")}`;
  msg += `\n (Hạng của bạn: ${goalsRank > 0 ? goalsRank : "N/A"})`;
  msg += `\n👟 Top kiến tạo tháng ${getMonths()}: ${byAssists.slice(0, 5).map((p, i) => `${i + 1}. ${p.name} (${p.assists}👟)`).join(" • ")}`;
  msg += `\n (Hạng của bạn: ${assistsRank > 0 ? assistsRank : "N/A"})`;

  room.sendAnnouncement(msg, player.id, YELLOW, "small-italic", 0);
  return false;
}

// =========================================================================
// 🏆 HỆ THỐNG PHÁT THƯỞNG COINS CUỐI NGÀY VÀ RESET (LÚC 23:59)
// =========================================================================
let hasSentDailyReport = false;

function distributeDailyCoinRewards() {
  try {
    let rawData = localStorage.getItem("daily_stats");
    if (!rawData || rawData === "{}") {
      localStorage.removeItem("daily_stats");
      room.sendAnnouncement("♻️ Hôm nay không có ai thi đấu. Đã reset đồng hồ sang ngày mới!", null, 0xCCCCCC, "small-italic", 0);
      return;
    }

    let parsedData = JSON.parse(rawData);
    // Chỉ xét những ai đá từ 3 trận trở lên
    let players = Object.keys(parsedData).filter(k => k !== "_date" && parsedData[k].games >= 3).map(k => ({ ...parsedData[k], auth: k }));

    if (players.length === 0) {
      localStorage.removeItem("daily_stats");
      room.sendAnnouncement("♻️ Dữ liệu hôm nay chưa đủ tiêu chuẩn vinh danh (cần 3 trận). Đã reset sang ngày mới!", null, 0xCCCCCC, "small-italic", 0);
      return;
    }

    let rankByGoals = [...players].sort((a, b) => (b.goals || 0) - (a.goals || 0));
    let rankByAssists = [...players].sort((a, b) => (b.assists || 0) - (a.assists || 0));
    let rankByMotms = [...players].sort((a, b) => (b.motms || 0) - (a.motms || 0));
    let rankByPoints = [...players].sort((a, b) => (b.points || 0) - (a.points || 0));
    let rankByCleanSheets = [...players].sort((a, b) => (b.cleansheets || 0) - (a.cleansheets || 0));

    const getFairRank = (list, key, value) => {
      return list.findIndex(x => (x[key] || 0) === (value || 0)) + 1;
    };

    players.forEach(p => {
      p.avgRank = (
        getFairRank(rankByGoals, 'goals', p.goals) +
        getFairRank(rankByAssists, 'assists', p.assists) +
        getFairRank(rankByMotms, 'motms', p.motms) +
        getFairRank(rankByPoints, 'points', p.points) +
        getFairRank(rankByCleanSheets, 'cleansheets', p.cleansheets)
      ) / 5;
    });

    let dailyMVP = [...players].sort((a, b) => a.avgRank - b.avgRank)[0];

    // 1. TRẢ THƯỞNG MVP TOÀN DIỆN
    if (dailyMVP && dailyMVP.auth) {
      let pData = getPlayerData(dailyMVP.auth);
      pData.coins = (pData.coins || 0) + 15000;
      pData.gems = (pData.gems || 0) + 5;
      savePlayerData(dailyMVP.auth, pData);

      if (typeof logCoinTransaction === "function") {
        logCoinTransaction(dailyMVP.name, dailyMVP.auth, 15000, "Thưởng MVP Toàn Diện Của Ngày", pData.coins);
        logCoinTransaction(dailyMVP.name, dailyMVP.auth, 5, "Thưởng MVP Toàn Diện Của Ngày (💎)", pData.gems);
      }
      room.sendAnnouncement(`👑 MVP TOÀN DIỆN: ${dailyMVP.name} với phong độ áp đảo trên mọi BXH đã được thưởng nóng +15,000 Coins và 5 💎 Gems!`, null, 0xFFD700, "bold", 2);
    }

    // 2. TRẢ THƯỞNG TOP 3 CÁC HẠNG MỤC
    let topCategories = [
      { list: rankByGoals, stat: 'goals', title: 'Vua Phá Lưới' },
      { list: rankByAssists, stat: 'assists', title: 'Vua Kiến Tạo' },
      { list: rankByMotms, stat: 'motms', title: 'Nhiều MOTM Nhất' },
      { list: rankByCleanSheets, stat: 'cleansheets', title: 'Găng Tay Vàng' }
    ];

    let rewardTiers = [10000, 5000, 2500]; // Top 1, Top 2, Top 3

    topCategories.forEach(cat => {
      let top3 = cat.list.slice(0, 3);
      top3.forEach((player, index) => {
        if (player && player.auth && player[cat.stat] > 0) {
          let auth = player.auth;
          let pData = getPlayerData(auth);
          let rewardPoint = rewardTiers[index];
          let rankTitle = `Top ${index + 1} ${cat.title}`;

          pData.coins = (pData.coins || 0) + rewardPoint;
          if (index === 0) {
            pData.gems = (pData.gems || 0) + 2;
          }
          savePlayerData(auth, pData);

          if (typeof logCoinTransaction === "function") {
            logCoinTransaction(player.name, auth, rewardPoint, `Thưởng ${rankTitle} Ngày`, pData.coins);
            if (index === 0) logCoinTransaction(player.name, auth, 2, `Thưởng ${rankTitle} Ngày (💎)`, pData.gems);
          }

          if (index === 0) {
            room.sendAnnouncement(`🥇 [${rankTitle}]: ${player.name} được thưởng nóng +${rewardPoint} Coins và 2 💎 Gems!`, null, 0x00FF00, "bold", 0);
          }
        }
      });
    });

    localStorage.removeItem("daily_stats");
    room.sendAnnouncement("♻️ Đã trả thưởng và reset toàn bộ dữ liệu ngày. Bắt đầu cuộc đua mới!", null, 0x00FFFF, "bold", 1);

  } catch (error) {
    console.error("Lỗi gửi phát thưởng Daily:", error);
  }
}

function checkDailyReportTimer() {
  let now = new Date();
  let vnTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
  let hours = vnTime.getUTCHours();
  let minutes = vnTime.getUTCMinutes();

  if (hours === 23 && minutes === 59) {
    if (!hasSentDailyReport) {
      distributeDailyCoinRewards();
      hasSentDailyReport = true;
    }
  } else {
    hasSentDailyReport = false;
  }
}
setInterval(checkDailyReportTimer, 30000);

function checkTopFunc(value, player) {
  let rawData = localStorage.getItem("daily_stats");
  if (!rawData) {
    room.sendAnnouncement("Chưa có dữ liệu thi đấu hôm nay!", player.id, 0xFF4444);
    return false;
  }
  let parsedData = JSON.parse(rawData);
  let players = Object.keys(parsedData).filter(k => k !== "_date" && parsedData[k].games >= 1).map(k => ({ ...parsedData[k], auth: k }));
  if (players.length === 0) {
    room.sendAnnouncement("Chưa có dữ liệu thi đấu hôm nay!", player.id, 0xFF4444);
    return false;
  }

  let byGoals = [...players].sort((a, b) => (b.goals || 0) - (a.goals || 0));
  let byAssists = [...players].sort((a, b) => (b.assists || 0) - (a.assists || 0));
  let byCleanSheets = [...players].sort((a, b) => (b.cleansheets || 0) - (a.cleansheets || 0));
  let byMotms = [...players].sort((a, b) => (b.motms || 0) - (a.motms || 0));

  const getFairRank = (list, key, value) => {
    return list.findIndex(x => (x[key] || 0) === (value || 0)) + 1;
  };

  players.forEach(p => {
    p.avgRank = (
      getFairRank(byGoals, 'goals', p.goals) +
      getFairRank(byAssists, 'assists', p.assists) +
      getFairRank(byMotms, 'motms', p.motms) +
      getFairRank(byCleanSheets, 'cleansheets', p.cleansheets)
    ) / 4;
  });

  let currentMVP = [...players].sort((a, b) => a.avgRank - b.avgRank)[0];

  const getTop3Str = (list, key, suffix) => {
    let top3 = list.slice(0, 3).filter(p => p[key] > 0);
    if (top3.length === 0) return "_Chưa có_";
    let medals = ["🥇", "🥈", "🥉"];
    return top3.map((p, i) => `${medals[i]} ${p.name} (${p[key]}${suffix})`).join("   ");
  };

  room.sendAnnouncement(`📊 BẢNG VÀNG HÔM NAY 📊`, player.id, 0x00FF00, "bold", 1);
  room.sendAnnouncement(`⚽ Vua Phá Lưới: ${getTop3Str(byGoals, 'goals', '⚽')}`, player.id, 0xFFFFFF, "normal", 1);
  room.sendAnnouncement(`👟 Vua Kiến Tạo: ${getTop3Str(byAssists, 'assists', '👟')}`, player.id, 0xFFFFFF, "normal", 1);
  room.sendAnnouncement(`🏅 Nhiều MOTM Nhất: ${getTop3Str(byMotms, 'motms', ' lần')}`, player.id, 0xFFFFFF, "normal", 1);
  room.sendAnnouncement(`🧤 Găng Tay Vàng: ${getTop3Str(byCleanSheets, 'cleansheets', '🧤')}`, player.id, 0xFFFFFF, "normal", 1);

  if (currentMVP) {
    room.sendAnnouncement(`👑 (DỰ KIẾN) MVP TOÀN DIỆN: ${currentMVP.name} (Hạng TB: Top ${currentMVP.avgRank.toFixed(1)})`, player.id, 0xFFD700, "bold", 1);
  }

  return false;
}


function showAfksFunc(value, player) {
  let afkNames = [];
  for (let id of afkList) {
    if (id !== 0) {
      let p = room.getPlayer(id);
      if (p) afkNames.push(p.name);
    }
  }
  if (afkNames.length === 0) {
    room.sendAnnouncement("Hiện tại không có ai đang AFK.", player.id, GREEN);
  } else {
    room.sendAnnouncement(`Danh sách AFK: ${afkNames.join(", ")}`, player.id, YELLOW);
  }
  return false;
}

function kickAfkFunc(value, player) {
  if (!isPlaying) {
    room.sendAnnouncement("Chỉ có thể báo cáo AFK khi trận đấu đang diễn ra", player.id, RED);
    return false;
  };

  trackAfk();
  room.sendAnnouncement("Đang theo dõi AFK, AFK sẽ sớm bị kick", null, GREEN);
  return true;
}

function specFunc(value, player) {
  let scores = room.getScores();
  let isSuperAdmin = (typeof getRole === "function" && getRole(player) >= ROLE.SUPER_ADMIN);

  if (!isSuperAdmin) {
    if (typeof isTakingPenalty !== 'undefined' && isTakingPenalty) {
      room.sendAnnouncement("⚠️ Lệnh bị khóa: Cấm đào ngũ khi đang sút Luân lưu!", player.id, 0xFF4444, "bold", 2);
      return false;
    }
  }

  if (player.team === 0) {
    room.sendAnnouncement("Bạn đã ở Spectators", player.id, 0xFF4444);
    return false;
  }

  let spectatorsCount = room.getPlayerList().filter(p => p.team === 0 && !afkList.has(p.id)).length;
  if (spectatorsCount === 0 && !isSuperAdmin) {
    room.sendAnnouncement("Đã hết người chơi để thay vào", player.id, 0xFF4444);
    return false;
  };

  room.setPlayerTeam(player.id, 0);
  room.sendAnnouncement("Bạn đã được di chuyển ra Spectators", player.id, 0x22C55E);

  if (typeof updateTeamPlayers === "function") updateTeamPlayers();
  if (typeof punishQuitGame === "function" && !isSuperAdmin) punishQuitGame(player);
  return true;
}
function predictFunc(prediction, player) {
  if (player.team != 0) {
    room.sendAnnouncement("Cầu thủ không được tham gia dự đoán để tránh hiện tượng bán độ", player.id, RED);
    return false;
  };
  if (!prediction) {
    room.sendAnnouncement("Vui lòng cung cấp một tỉ số hợp lệ, có dạng RED-BLUE (VD: 3-1)", player.id, RED);
    return false;
  };
  if (Object.values(predictions).some(predictors => predictors.includes(player.id))) { // Has already had a prediction
    room.sendAnnouncement("Bạn chỉ có thể thực hiện một dự đoán trong một trận đấu", player.id, RED);
    return false;
  };
  let scores = room.getScores();
  if (isTakingPenalty || (scores === null) || (scores.time > PREDICTION_PERIOD) || (scores.red + scores.blue != 0)) {
    room.sendAnnouncement("Chưa thể đoán tỉ số hoặc đã hết thời hạn dự đoán tỉ số", player.id, RED);
    return false;
  };

  let score = prediction.split("-").map(goals => Number(goals));
  if ((score.length != 2) || score.some(goals => goals % 1 !== 0)) {
    room.sendAnnouncement("Tỉ số không hợp lệ, vui lòng đảm bảo tỉ số có dạng RED-BLUE (VD: 2-1)", player.id, RED);
    return false;
  };
  let scoresObj = room.getScores();
  if (!scoresObj) return false;
  let scoreLimit = scoresObj.scoreLimit;
  if ((scoreLimit != 0) && (score.some(goals => goals > scoreLimit) || (score[0] + score[1] == scoreLimit * 2))) {
    room.sendAnnouncement("Tỉ số không thể xảy ra", player.id, RED);
    return false;
  };
  prediction = score.join("-"); // Re-format weird scores like "0x01-0x02", even though I don't know why I should even care
  if (predictions[prediction] === undefined) {
    predictions[prediction] = [player.id];
  } else if (predictions[prediction].length <= MAX_PLAYERS) {
    predictions[prediction].push(player.id);
  } else {
    room.sendAnnouncement("Đã có đủ người dự đoán tỉ số này, vui lòng dự đoán tỉ số khác", player.id, RED);
    return false;
  };

  room.sendAnnouncement(`${player.name} đã dự đoán tỉ số RED ${prediction} BLUE`, null, GREEN);
  return false;
}

function setMsgColorFunc(value, player) {
  if (value != "normal") {
    if (!/^[0-9A-F]{6}$/i.test(value)) {
      room.sendAnnouncement('Vui lòng nhập một mã màu hợp lệ hoặc dùng "normal" để đặt lại về mặc định (VD: !msgcolor 00FFFF hoặc !msgcolor normal)', player.id, RED);
      return false;
    };
    value = `0x${value}`;
  };
  let setting = getSetting(player.id);
  setting.msgColor = value;
  saveSetting(player.id, setting);
  return false;
}

function adjustSizeFunc(value, player) {
  if (!value || isNaN(value)) {
    room.sendAnnouncement("Vui lòng cung cấp số đơn vị muốn thay đổi, dùng 0 để chỉnh lại về bình thường (VD: !adjustsize -2)", player.id, RED);
    return false;
  };
  if (value > 0) {
    room.sendAnnouncement("Bạn không thể tăng kích cỡ cầu thủ", player.id, RED);
    return false;
  };
  if (Math.abs(value) > stadium.playerRadius * MAX_SIZE_ADJUSTMENT_RATIO) {
    room.sendAnnouncement("Kích cỡ cầu thủ đã bị chỉnh tới mức không hợp lệ", player.id, RED);
    return false;
  };
  let setting = getSetting(player.id);
  let gap = value - setting.sizeAdjustment;
  setting.sizeAdjustment = value;
  saveSetting(player.id, setting);

  let playerDiscProperties = room.getPlayerDiscProperties(player.id);
  (playerDiscProperties !== null) && room.setPlayerDiscProperties(player.id, { radius: playerDiscProperties.radius + gap });
  room.sendAnnouncement("Đã chỉnh và lưu kích thước cầu thủ", player.id, GREEN);
  return false;
}

function loginFunc(password, player) {
  // 🎯 PHONG ẤN TẬN GỐC: Khóa vĩnh viễn mọi hành vi đăng nhập bằng pass
  room.sendChat("❌ Hệ thống đăng nhập bằng mật khẩu đã bị khóa!", player.id);

  // Trả về false để bắt buộc tàng hình dòng lệnh nếu có kẻ gõ bậy
  return false;
}

function yellowCardFunc(value, player) {
  if (!value) {
    room.sendAnnouncement("Vui lòng cung cấp một người chơi hợp lệ và lý do phạt nếu có (VD: !yellow @32MBVRAM hoặc !yellow 32 ác)", player.id, RED);
    return false;
  };

  value = value.split(" ");
  let [name, reason] = [value.shift(), value.join(" ")];
  let toPlayer = getPlayerByName(name); // Tạo biến toPlayer

  if (!toPlayer) { // Kiểm tra nếu không tìm thấy người chơi
    room.sendAnnouncement(`Không thể tìm thấy người chơi "${name}"`, player.id, RED);
    return false; // Dừng lệnh ngay lập tức
  };

  if (getRole(player) < getRole(toPlayer)) {
    room.sendAnnouncement(`Bạn không có quyền phạt thẻ vàng người chơi "${name}"`, player.id, RED);
    return false;
  };

  let yellowCards = JSON.parse(localStorage.getItem("yellow_cards")) || [];
  let index = yellowCards.indexOf(getConn(toPlayer.id));
  if (index != -1) {
    yellowCards.splice(index, 1);
    ban(toPlayer.id, "Bạn đã nhận 2 thẻ vàng", YELLOW_BAN_PERIOD);
    var msg = `🟨🟨 ${toPlayer.name} đã nhận thẻ vàng thứ 2 từ ${player.name}`;
  } else {
    yellowCards.push(getConn(toPlayer.id));
    var msg = `🟨 ${toPlayer.name} đã nhận một thẻ vàng từ ${player.name} (2 thẻ vàng = ban)`;
  };
  reason && (msg += `: ${reason}`);
  room.sendAnnouncement(msg, null, YELLOW);
  localStorage.setItem("yellow_cards", JSON.stringify(yellowCards));

  // LOG ĐƯỢC ĐẶT Ở CUỐI CÙNG (Lúc này chắc chắn toPlayer đã tồn tại)
  log(`${toPlayer.name} was given a yellow card by ${player.name} (reason: ${reason})`);
  return false;
}

function clearYellowCardFunc(value, player) {
  if (!value) {
    room.sendAnnouncement("Vui lòng cung cấp một người chơi hợp lệ (VD: !clearyellow @32MBVRAM hoặc !clearyellow 32)", player.id, RED);
    return false;
  };

  let toPlayer = getPlayerByName(value);
  if (!toPlayer) {
    room.sendAnnouncement(`Không thể tìm thấy người chơi "${value}"`, player.id, RED);
    return false;
  };

  let yellowCards = JSON.parse(localStorage.getItem("yellow_cards")) || [];
  let index = yellowCards.indexOf(getConn(toPlayer.id));
  if (index == -1) {
    room.sendAnnouncement(`${toPlayer.name} chưa nhận thẻ vàng nào`, player.id, RED);
    return false;
  };
  yellowCards.splice(index, 1);
  localStorage.setItem("yellow_cards", JSON.stringify(yellowCards));
  room.sendAnnouncement(`🟨❌ ${toPlayer.name} đã được xóa thẻ vàng`, null, YELLOW);
  return false;
}

function muteFunc(value, player) {
  if (!value) {
    room.sendAnnouncement("Vui lòng cung cấp người chơi, thời hạn cấm chat (đơn vị phút, để 0 để cấm vĩnh viễn) và lý do nếu có (VD: !mute @32MBVRAM 1 / !mute 32 0 Ngu)", player.id, RED);
    return false;
  };

  value = value.split(" ");
  let [name, period, reason] = [value.shift(), value.shift(), value.join(" ")];
  let toPlayer = getPlayerByName(name);
  if (!toPlayer) {
    room.sendAnnouncement(`Không thể tìm thấy người chơi "${name}"`, player.id, RED);
    return false;
  };
  if (getRole(player) < getRole(toPlayer)) {
    room.sendAnnouncement(`Bạn không có quyền cấm chat người chơi "${name}"`, player.id, RED);
    return false;
  };

  if (isNaN(period) || period < 0) {
    room.sendAnnouncement("Vui lòng cung cấp một thời hạn cấm chat hợp lệ (VD: !mute @32MBVRAM 3)", player.id, RED);
    return false;
  };

  muteList.add(getConn(toPlayer.id));
  if (period == 0) {
    var msg = `${toPlayer.name} đã bị cấm chat bởi ${player.name}`;
    // Thêm vào trong cả 2 trường hợp (period == 0 và else):
    log(`${toPlayer.name} was muted by ${player.name} (reason: ${reason})`);
  } else {
    setTimeout(muteList.delete.bind(muteList, getConn(toPlayer.id)), period * 60 * 1000);
    var msg = `${toPlayer.name} đã bị cấm chat trong ${period} phút bởi ${player.name}`;
    // Thêm vào trong cả 2 trường hợp (period == 0 và else):
    log(`${toPlayer.name} was muted by ${player.name} (reason: ${reason})`);
  };
  reason && (msg += `: ${reason}`);
  room.sendAnnouncement(msg, null, RED, "bold", 0);
  return false;
}

function unmuteFunc(value, player) {
  if (!value) {
    room.sendAnnouncement("Vui lòng cung cấp một người chơi hợp lệ (VD: !unmute @32MBVRAM hoặc !unmute 32)", player.id, RED);
    return false;
  };

  let toPlayer = getPlayerByName(value);
  if (!toPlayer) {
    room.sendAnnouncement(`Không thể tìm thấy người chơi "${value}"`, player.id, RED);
    return false;
  };

  muteList.delete(getConn(toPlayer.id));
  room.sendAnnouncement(`${toPlayer.name} đã có thể chat trở lại`, null, GREEN);
  log(`${toPlayer.name} was unmuted by ${player.name}`);
  return false;
}

function clearMutesFunc(value, player) {
  muteList.clear();
  room.sendAnnouncement("Đã xóa các lượt cấm chat", null, GREEN);
  return false;
}

function lockFunc(value, player) {
  if (isChatLocked) return false;
  isChatLocked = true;
  room.sendAnnouncement(`${player.name} đã khóa khung chat`, null, YELLOW);
  log(`${player.name} locked the chat`); // hoặc unlocked
  return false;
}

function unlockFunc(value, player) {
  if (!isChatLocked) return false;
  isChatLocked = false;
  room.sendAnnouncement(`${player.name} đã mở khóa khung chat`, null, YELLOW);
  log(`${player.name} unlocked the chat`); // hoặc unlocked
  return false
}

function banFunc(value, player) {
  if (!value) {
    room.sendAnnouncement("Vui lòng cung cấp người chơi, thời hạn ban (đơn vị giờ, để 0 để cấm vĩnh viễn) và lý do nếu có (VD: !ban @32MBVRAM 24 / !ban 32 0 Phá room)", player.id, RED);
    return false;
  };

  value = value.split(" ");
  let [name, period, reason] = [value.shift(), value.shift(), value.join(" ")];
  let toPlayer = getPlayerByName(name);
  if (!toPlayer) {
    room.sendAnnouncement(`Không thể tìm thấy người chơi "${name}"`, player.id, RED);
    return false;
  };
  if (getRole(player) < getRole(toPlayer)) {
    room.sendAnnouncement(`Bạn không có quyền cấm người chơi "${name}"`, player.id, RED);
    return false;
  };
  if (isNaN(period) || period < 0) {
    room.sendAnnouncement("Vui lòng cung cấp một thời hạn ban hợp lệ (VD: !ban @32MBVRAM 24)", player.id, RED);
    return false;
  };
  ban(toPlayer.id, reason, +period);
  return false;
}

function whisperFunc(value, player) {
  const auth = getAuth(player.id);
  if (!auth) return false;
  const data = getPlayerData(auth);
  if ((data.chatToys["whisper"] || 0) <= 0) {
    room.sendAnnouncement("Bạn không có Whisper. Hãy mua trong cửa hàng (!shop)!", player.id, RED);
    return false;
  }

  const spaceIndex = value.indexOf(" ");
  if (spaceIndex === -1) {
    room.sendAnnouncement("Sử dụng: !whisper @tên <nội_dung>", player.id, RED);
    return false;
  }

  const targetName = value.substring(0, spaceIndex);
  const message = value.substring(spaceIndex + 1);
  const targetPlayer = getPlayerByName(targetName);

  if (!targetPlayer) {
    room.sendAnnouncement(`Không tìm thấy người chơi ${targetName}.`, player.id, RED);
    return false;
  }

  data.chatToys["whisper"]--;
  savePlayerData(auth, data);

  room.sendAnnouncement(`[Thầm kín] ${player.name}: ${message}`, targetPlayer.id, 0xFF69B4, "bold", 2);
  room.sendAnnouncement(`[Đã gửi thì thầm cho ${targetPlayer.name}]: ${message}`, player.id, 0xFF69B4, "bold", 1);
  return false;
}

function megaphoneFunc(value, player) {
  const auth = getAuth(player.id);
  if (!auth) return false;
  const data = getPlayerData(auth);
  if ((data.chatToys["megaphone"] || 0) <= 0) {
    room.sendAnnouncement("Bạn không có Megaphone. Hãy mua trong cửa hàng (!shop)!", player.id, RED);
    return false;
  }

  if (!value) {
    room.sendAnnouncement("Sử dụng: !megaphone <nội_dung>", player.id, RED);
    return false;
  }

  data.chatToys["megaphone"]--;
  savePlayerData(auth, data);

  room.sendAnnouncement(`📢 [LOA PHÓNG THANH] ${player.name}: ${value.toUpperCase()}`, null, 0xFFD700, "bold", 2);
  return false;
}

function bombFunc(value, player) {
  const auth = getAuth(player.id);
  if (!auth) return false;
  const data = getPlayerData(auth);
  if ((data.chatToys["bomb"] || 0) <= 0) {
    room.sendAnnouncement("Bạn không có Bomb. Hãy mua trong cửa hàng (!shop)!", player.id, RED);
    return false;
  }

  data.chatToys["bomb"]--;
  savePlayerData(auth, data);

  room.sendAnnouncement(`💣 ${player.name} VỪA NÉM BOM MÙ VÀO KHUNG CHAT!!!`, null, 0xFF0000, "bold", 2);
  for (let i = 0; i < 5; i++) {
    room.sendAnnouncement(`💥💥💥 BOOM 💥💥💥`, null, 0xFF4500, "bold", 2);
  }
  return false;
}

function showBansFunc(value, player) {
  room.sendAnnouncement(`Danh sách người chơi đã bị ban:`, player.id, GREEN);
  for (const details of banList) {
    room.sendAnnouncement(`• [${details[0]}] ${details[1]} (Lí do: ${details[2]})`, player.id, GREEN, "small", 0);
  };
  return false;
}

function unbanFunc(value, player) {
  if (!value || isNaN(value)) {
    room.sendAnnouncement("Vui lòng cung cấp ID người chơi bị cấm, dùng !bans để xem danh sách cấm (VD: !clearban 133)", player.id, RED);
    return false;
  };
  let banDetails = banList.find(details => details[0] == value);
  if (!banDetails) {
    room.sendAnnouncement(`Không tìm thấy người chơi bị cấm với ID ${value}`, player.id, RED);
    return false;
  }
  unban(banDetails[0]);
  room.sendAnnouncement(`Đã bỏ cấm người chơi ${banDetails[1]}`, null, GREEN);
  return false;
}

function clearBansFunc(value, player) {
  room.clearBans();
  banList.length = 0;
  room.sendAnnouncement("Đã xóa các lượt ban", null, GREEN);
  return false;
}

// ==========================================
// 💤 HỆ THỐNG AFK (ĐÃ TÍCH HỢP ĐẶC QUYỀN VIP)
// ==========================================
function afkFunc(value, player) {
  let scores = room.getScores();
  let isSuperAdmin = (typeof getRole === "function" && getRole(player) >= ROLE.SUPER_ADMIN);
  let isVip = typeof checkVip === "function" && checkVip(player.id); // 👑 Kiểm tra thẻ VIP

  // Không cho AFK lúc nhạy cảm (Super Admin được ngoại lệ)
  if (!isSuperAdmin) {
    if (typeof isTakingPenalty !== 'undefined' && isTakingPenalty) {
      room.sendAnnouncement("⚠️ Lệnh bị khóa: Dậy mà sút đi, không AFK lúc Luân lưu được đâu!", player.id, 0xFF4444, "bold", 2);
      return false;
    }
  }

  // 🟢 TRƯỜNG HỢP 1: ĐANG AFK -> QUAY LẠI
  if (typeof afkList !== 'undefined' && afkList.has(player.id)) {
    afkList.delete(player.id);

    // Xóa bộ đếm giờ kick AFK (nếu có)
    if (typeof timeouts !== 'undefined' && timeouts.toQuitAfk && timeouts.toQuitAfk[player.id]) {
      clearTimeout(timeouts.toQuitAfk[player.id]);
      delete timeouts.toQuitAfk[player.id];
    }
    room.sendAnnouncement(`👋 ${player.name} đã thoát chế độ AFK và sẵn sàng thi đấu!`, null, 0x22C55E, "bold", 1);

    // Tự động nâng Map nếu đủ người
    if (typeof checkMapRotation === "function") {
      checkMapRotation();
    }
  }
  // 🔴 TRƯỜNG HỢP 2: ĐANG BÌNH THƯỜNG -> CHUYỂN SANG AFK
  else {
    let maxAfk = typeof MAX_AFK_PLAYERS !== 'undefined' ? MAX_AFK_PLAYERS : 3;

    // 🔍 Kiểm tra xem có mua gói AFK 40 phút trong Shop không
    let auth = getAuth(player.id);
    let data = auth ? getPlayerData(auth) : null;
    let hasAfkExtend = data && data.features && data.features["afkextend"];

    // 🛡️ KIỂM TRA SLOT AFK (Chỉ chặn dân thường, VIP và người mua gói được qua)
    if (!isSuperAdmin && !isVip && !hasAfkExtend && afkList.size >= maxAfk) {
      room.sendAnnouncement(`❌ Đã hết chỗ AFK (Tối đa ${maxAfk} người). Vui lòng đợi người khác quay lại!`, player.id, 0xFF4444);
      return false;
    }

    // ⏳ XỬ LÝ THỜI GIAN TREO MÁY THEO TỪNG ĐẲNG CẤP
    if (!isSuperAdmin && !isVip) {
      // Nếu là dân thường hoặc người mua gói 40 phút
      let timeoutSeconds = hasAfkExtend ? (40 * 60) : (typeof AFK_TIMEOUT !== 'undefined' ? AFK_TIMEOUT : 600);

      if (typeof timeouts !== 'undefined') {
        if (!timeouts.toQuitAfk) timeouts.toQuitAfk = {};
        timeouts.toQuitAfk[player.id] = setTimeout(
          typeof oversleepCallback === "function" ? oversleepCallback.bind(null, player.id) : () => { },
          timeoutSeconds * 1000
        );
      }

      // Thông báo cho người mua gói
      if (hasAfkExtend) {
        room.sendAnnouncement(`🛒 Kích hoạt AFK Extend: Bạn được phép treo máy tối đa 40 phút và vượt Slot!`, player.id, 0x00FFFF, "small-italic", 1);
      }
    } else if (isVip || isSuperAdmin) {
      // Nếu là VIP hoặc Admin
      room.sendAnnouncement(`👑 [VIP] Kích hoạt Đặc quyền: Bạn được phép treo máy vĩnh viễn và vượt giới hạn Slot AFK!`, player.id, 0xFFD700, "small-bold", 1);
    }

    // Xác nhận vào AFK
    afkList.add(player.id);
    room.sendAnnouncement(`💤 ${player.name} đã đi ngủ (AFK), dùng !afk lần nữa để tỉnh dậy.`, null, 0xAAAAAA, "italic", 1);

    // Đưa ra Spec và phạt trừ sao (nếu đang đá mà trốn)
    if (player.team != 0) {
      room.setPlayerTeam(player.id, 0);
      if (typeof punishQuitGame === "function" && !isSuperAdmin) punishQuitGame(player);
    }

    // Tự động hạ Map nếu thiếu người
    if (typeof checkMapRotation === "function") {
      checkMapRotation();
    }
  }

  // Cập nhật giao diện vị trí người chơi
  if (typeof updateTeamPlayers === "function") updateTeamPlayers();
  if (typeof reorderPlayers === "function") reorderPlayers();
  return false;
}

function showAfksFunc(value, player) {
  room.sendAnnouncement(`Danh sách những người chơi đang AFK: ${Array.from(afkList).map(id => room.getPlayer(id).name).join(", ")}`, player.id, GREEN);
  return false;
}

function punishQuitGame(player) {
  if (
    (getRole(player) >= ROLE.ADMIN) || // Admins receive no punishment
    (getGameStatus() === false) || // No punishment if the player quits after the game is over
    (getNonAfkPlayers().length < MAX_PLAYERS * 2 + 3) // No punishment if there are less than 3 spectators (the "captain slot" isn't that desired)
  ) return;
  let banMessage = "Bạn đã mắc quá nhiều lỗi vi phạm";
  let playerConn = getConn(player.id);
  if (playerConn in warnings) {
    warnings[playerConn]++;
  } else {
    warnings[playerConn] = 1;
  };
  room.sendAnnouncement(`${player.name} đã nhận ${warnings[playerConn]}/${MAX_WARNINGS_PER_PLAYER} cảnh cáo trong ngày do hành vi rời trận`, null, RED, "small-italic", 0);
  if (warnings[playerConn] < MAX_WARNINGS_PER_PLAYER) return;
  delete warnings[playerConn]; // Reset warnings record after punishment
  room.sendAnnouncement(`${player.name} đã nhận hình phạt (ban ${VIOLATION_BAN_PERIOD} giờ) do mắc quá nhiều lỗi vi phạm`, null, RED, "small-bold", 0);
  if (room.getPlayer(player.id) === null) { // Player left, save ban record so the next time the player joins, ban them
    let bans = JSON.parse(localStorage.getItem("bans")) || [];
    bans.push([playerConn, banMessage, VIOLATION_BAN_PERIOD]);
    localStorage.setItem("bans", JSON.stringify(bans));
    return;
  };
  ban(player.id, banMessage, VIOLATION_BAN_PERIOD);
}

function unban(playerId) {
  room.clearBan(playerId);
  banList = banList.filter(details => details[0] != playerId);
}

function ban(playerId, reason, timeout) {
  if (timeout != 0) {
    reason = reason.length ? reason + `. Cấm sẽ hết hạn sau ${timeout} giờ` : `Cấm sẽ hết hạn sau ${timeout} giờ`;
    setTimeout(unban.bind(null, playerId), timeout * 60 * 60 * 1000);
  };
  room.kickPlayer(playerId, reason, true);
}

function handleCommand(player, input) {
  // Get alias and value from command
  let splitIndex = input.indexOf(" ");
  splitIndex = (splitIndex != -1) ? splitIndex : input.length;
  let [alias, value] = [input.slice(0, splitIndex).toLowerCase(), input.slice(splitIndex + 1).trim()];
  let command = commands[alias];
  if (!command || !canUseCommand(command, player)) {
    room.sendAnnouncement(`Không thể xác định lệnh !${alias}, dùng !help để xem các lệnh`, player.id, RED);
    return false;
  };

  return command[0](value, player);
}

// Update stats about goals, assists and own goals
function updateGoalStats(team) {
  let [shot, assist] = game.ballRecords;
  if (shot === null) return;

  if (shot.player.team != team) { // Own goal
    // Not an own goal but probably a clearing/goalkeeping effort
    if (
      assist && // Someone's kick resulted in this goal
      assist.isAShot && // The previous kick was a shot on target
      (assist.player.team == team) && // The previous kick came from an opponent player
      (stadium.goalLine.x - Math.abs(shot.properties.x) < stadium.playerRadius * 4) && // The gap between the ball and the goal-line was pretty small it probably was an effort to clear the ball
      (shot.time - assist.time < 3) // The time between 2 kicks wasn't too big, otherwise, it sounds nothing like a save
    ) {
      // Correct the credits
      [shot, assist] = game.ballRecords.slice(1);
    } else {
      getGameStats(shot.player).ownGoals++;
      room.sendChat(`Một bàn phản lưới nhà do sai lầm của ${getTag(shot.player.name)}`);
      (assist !== null) && (assist.player.team == team) && getGameStats(assist.player).attemptsLeadingToOG++;
      return;
    };
  };

  let ballPosition = room.getBallPosition();
  let shooterStats = getGameStats(shot.player);
  shooterStats.goals++;
  let comment = SCORER_COMMENTARIES[shooterStats.goals] || `Thật điên rồ, bàn thắng thứ ${shooterStats.goals} trong trận đấu này của`;
  comment = comment.concat(" ", getTag(shot.player.name));
  celebrationEffect(shot.player, shooterStats.goals);
  if (assist !== null) {
    let assisterStats = getGameStats(assist.player);
    if (assist.player.team != team) {
      assisterStats.errorsLeadingToGoal++;
    } else if (assist.player.id != shot.player.id) { // Not a solo goal
      assisterStats.assists++;
      if (assisterStats.assists != 1) { // Multiple assists O_O
        comment = comment.concat(", ", `${getTag(assist.player.name)} đã có cho mình kiến tạo thứ ${assisterStats.assists} trong trận đấu`);
      } else {
        comment = comment.concat(", ", `đường kiến tạo từ ${getTag(assist.player.name)}`);
      };
    };
  };
  room.sendChat(comment);

  // Calculate goal stats
  let speed = convertToMeters(getDistance(shot.properties.xspeed, shot.properties.yspeed) * 60); // There are 60 frames per second
  let distance = convertToMeters(getDistance(shot.properties.x - ballPosition.x, shot.properties.y - ballPosition.y));
  room.sendAnnouncement(`Khoảng cách: ${distance || "dưới 1"}m | Lực sút: ${speed} (m/s)`, null, 0x00FF00, "small", 0);
}

function saveStats() {
  let motmAuth = getMotm()[0];
  let dailyDb = JSON.parse(localStorage.getItem("daily_stats")) || {};
  let today = new Date().toDateString();
  if (dailyDb._date !== today) dailyDb = { _date: today };
  let scoreArray = (prevScore || "0-0").split("-");
  let redGoals = parseInt(scoreArray[0], 10);
  let blueGoals = parseInt(scoreArray[1], 10);

  for (let teamId = 1; teamId < 3; teamId++) {
    let teamEntries = Object.entries(game.teams[teamId].players);
    let gkAuth = null;
    if (teamEntries.length > 0) {
      let defensiveEntries = [...teamEntries].sort((a, b) =>
        (teamId === 1) ? (a[1].meanPosition - b[1].meanPosition) : (b[1].meanPosition - a[1].meanPosition)
      ).slice(0, Math.min(2, teamEntries.length));
      gkAuth = defensiveEntries.sort((a, b) =>
        (b[1].stoppedShots - a[1].stoppedShots) || (b[1].touches - a[1].touches)
      )[0][0];
    }

    let opponentScore = (teamId === 1) ? blueGoals : redGoals;

    for (const [auth, report] of Object.entries(game.teams[teamId].players)) {
      let item = getStats(auth);
      item.name = report.name;

      item.goals += report.goals;
      item.assists += report.assists;
      item.ownGoals += report.ownGoals;
      item.games++;

      if (teamId == prevWinner && surrenderedTeam === 0) item.wins++;
      if (auth == motmAuth) item.motms++;

      // ⚔️ TÍNH TOÁN XP VÀ LEVEL (RẤT KHÓ LÊN CẤP)
      let pData = getPlayerData(auth);
      let xpEarned = 10; // XP cơ bản khi tham gia trận đấu
      if (teamId == prevWinner && surrenderedTeam === 0) xpEarned += 20; // Thắng
      else if (prevWinner === 0) xpEarned += 5; // Hòa
      else xpEarned += 2; // Thua

      xpEarned += report.goals * 10;
      xpEarned += report.assists * 5;
      if (auth == motmAuth) xpEarned += 50;
      if (gkAuth === auth && opponentScore === 0) xpEarned += 30; // Thủ môn sạch lưới

      if (pData.vipExpiry && Date.now() < pData.vipExpiry) {
         xpEarned = Math.floor(xpEarned * 1.5); // VIP được +50% XP
      }

      pData.level = pData.level || 1;
      pData.xp = pData.xp || 0;
      pData.xp += xpEarned;

      let levelUp = false;
      let reqXp = 300;
      let levelsGained = 0;
      while (pData.xp >= reqXp) {
        pData.xp -= reqXp;
        pData.level++;
        levelsGained++;
        levelUp = true;
      }

      if (levelUp) {
        let levelReward = 500; // Số coins thưởng mỗi khi lên 1 cấp (cố định)
        let totalCoinsGained = levelReward * levelsGained;
        pData.coins = (pData.coins || 0) + totalCoinsGained;
        if (typeof logCoinTransaction === "function") logCoinTransaction(report.name, auth, totalCoinsGained, `Thưởng thăng cấp (Tăng ${levelsGained} cấp)`, pData.coins);
      }

      let pInRoom = room.getPlayerList().find(p => p.id !== 0 && getAuth(p.id) === auth);
      if (pInRoom) {
        if (levelUp) {
          let totalReward = 500 * levelsGained;
          room.sendAnnouncement(`🌟 [THĂNG CẤP] CHÚC MỪNG ${report.name} đã đạt CẤP ĐỘ ${pData.level} và nhận được ${totalReward} 🪙 thưởng! 🌟`, null, 0xFFD700, "bold", 2);
        }

        let bars = 20;
        let filled = Math.floor((pData.xp / reqXp) * bars);
        let empty = bars - filled;
        let barStr = "█".repeat(filled) + "░".repeat(empty);
        room.sendAnnouncement(`📈 LV${pData.level} [${barStr}] ${Math.floor(pData.xp)}/${reqXp} (+${xpEarned} XP)`, pInRoom.id, 0xFFD700, "small", 1);
      }
      savePlayerData(auth, pData);

      saveStatsCache(auth, item);

      if (!dailyDb[auth]) dailyDb[auth] = { name: report.name, goals: 0, assists: 0, games: 0, cleansheets: 0, motms: 0 };
      dailyDb[auth].name = report.name;
      dailyDb[auth].goals += report.goals;
      dailyDb[auth].assists += report.assists;
      dailyDb[auth].games++;
      if (auth === motmAuth) {
        dailyDb[auth].motms = (dailyDb[auth].motms || 0) + 1;
      }
    };

    if (gkAuth !== null && opponentScore === 0) {
      let stats = getStats(gkAuth); stats.cleansheets++; saveStatsCache(gkAuth, stats);
      if (!dailyDb[gkAuth]) dailyDb[gkAuth] = { name: game.teams[teamId].players[gkAuth].name, goals: 0, assists: 0, games: 0, cleansheets: 0 };
      dailyDb[gkAuth].cleansheets++;
    };
  };
  localStorage.setItem("daily_stats", JSON.stringify(dailyDb));
}

function reportStats() {
  // Clear Top list & Rankings cache when match stats change
  cachedRankings = null;
  cachedTopList = null;

  // 🛡️ BẮT BUỘC DỪNG GHI HÌNH VÀ XẢ RAM NGAY LẬP TỨC (CHỐNG TRÀN RAM OOM)
  let recordData = null;
  try {
    recordData = room.stopRecording();
  } catch (e) {
    console.log("Lỗi xả RAM ghi hình: ", e);
  }

  let scoreline = ` RED ${prevScore} BLUE`;
  let time;
  if (game.penalty.results[0].length != 0) {
    scoreline += ` (Luân lưu: ${game.penalty.results.map(results => results.filter(Boolean).length).join("-")})`;
    time = 60 * TIME_LIMIT + MAX_ADDED_TIME;
  } else {
    time = room.getScores() ? room.getScores().time : 0;
  };
  let minutes = Math.floor(time / 60);
  let elapsedTime = `${minutes}:${Math.round(time - minutes * 60).toString().padStart(2, "0")}`;
  room.sendAnnouncement(scoreline, null, YELLOW, "bold", 0);

  let stats = game.getStats();

  // Lấy dữ liệu MOTM
  let motmData = getMotm();
  let motm = motmData[1].name;

  // Tách 2 danh sách riêng cho Game và cho Discord
  let inGameContributions = [[], []];
  let discordContributions = [[], []];

  let playerStats = [["Người chơi                        ", "Đội ", "Bàn", "Kiến tạo", "Phản lưới", "Đường chuyền", "Sút trúng đích", "Chặn cú sút", "Nỗ lực tạo ra bàn thắng phản lưới", "Sai lầm dẫn đến bàn thua", "Penalty thành công", "Penalty không thành công", "Chạm bóng"]];
  playerStats.push(["-".repeat(playerStats[0].reduce((length, name) => length + name.length + 3, 0) - 3)]);

  for (let i = 0; i < 2; i++) {
    let teamId = i + 1;
    for (const [auth, player] of Object.entries(game.teams[teamId].players)) {
      playerStats.push([
        player.name.padEnd(33 + player.name.length - getDisplayLength(player.name), " "),
        TEAM_NAMES[teamId].padEnd(4, " "),
        player.goals.toString().padEnd(playerStats[0][2].length, " "),
        player.assists.toString().padEnd(playerStats[0][3].length, " "),
        player.ownGoals.toString().padEnd(playerStats[0][4].length, " "),
        player.passes.toString().padEnd(playerStats[0][5].length, " "),
        player.shotsOnTarget.toString().padEnd(playerStats[0][6].length, " "),
        player.stoppedShots.toString().padEnd(playerStats[0][7].length, " "),
        player.attemptsLeadingToOG.toString().padEnd(playerStats[0][8].length, " "),
        player.errorsLeadingToGoal.toString().padEnd(playerStats[0][9].length, " "),
        player.penaltiesScored.toString().padEnd(playerStats[0][10].length, " "),
        player.penaltiesMissed.toString().padEnd(playerStats[0][11].length, " "),
        player.touches.toString().padEnd(playerStats[0][12].length, " ")
      ]);

      let statsStr = "";
      if (player.goals == 1) statsStr += "⚽"; else if (player.goals > 1) statsStr += `${player.goals}⚽`;
      if (player.assists == 1) statsStr += "👟"; else if (player.assists > 1) statsStr += `${player.assists}👟`;
      if (player.ownGoals == 1) statsStr += "🥅"; else if (player.ownGoals > 1) statsStr += `${player.ownGoals}🥅`;

      if (statsStr !== "") inGameContributions[i].push(`${player.name} (${statsStr})`);

      let discordPlayerStr = player.name;
      if (statsStr !== "") discordPlayerStr += ` (${statsStr})`;

      discordContributions[i].push(discordPlayerStr);
    };
  };
  playerStats.push([""], [`Man of the Match: ${motm}`]);

  // Generate a room message about game statistics
  let statsMsg = `Thống kê kiểm soát bóng: 🔴 ${stats.possession.map(possession => possession + "%").join(" - ")} 🔵
Số pha dứt điểm trúng đích: 🔴 ${stats.shotsOnTarget.join(" - ")} 🔵
Số đường chuyền thành công: 🔴 ${stats.passes.join(" - ")} 🔵`;

  if (inGameContributions[0].length != 0) {
    statsMsg += `\n🔴 ĐỎ: ${inGameContributions[0].join("  •  ")}`;
  };
  if (inGameContributions[1].length != 0) {
    statsMsg += `\n🔵 XANH: ${inGameContributions[1].join("  •  ")}`;
  };
  statsMsg += `\n🏅 Cầu thủ xuất sắc nhất trận (MOTM): ${motm}`;
  statsMsg += `\n🔥 Chuỗi trận thắng liên tiếp: ${winningStreak} trận`;

  // Đổi sang màu Trắng sáng (0xFFFFFF) để nổi bật và dễ đọc hơn
  room.sendAnnouncement(statsMsg, null, 0xFFFFFF, "small-bold", 0);

  // Generate a Discord embed about game statistics
  let discordMsg = `**RED**
\`\`\`ansi
\x1b[1;31m${discordContributions[0].join("\n")}\`\`\`
**BLUE**
\`\`\`ansi
\x1b[1;34m${discordContributions[1].join("\n")}\`\`\``;

  let discordFields = [
    {
      name: "Thống kê trận đấu",
      value: "=======================\n\n**Kiểm soát bóng**\n**Sút trúng đích**\n**Lượt chuyền bóng**",
      inline: true,
    },
    {
      name: "🔴 **RED**",
      value: `==========\n\n${stats.possession[0]}%\n${stats.shotsOnTarget[0]}\n${stats.passes[0]}`,
      inline: true,
    },
    {
      name: "🔵 **BLUE**",
      value: `==========\n\n${stats.possession[1]}%\n${stats.shotsOnTarget[1]}\n${stats.passes[1]}`,
      inline: true,
    },
    {
      name: "📺 Thông tin & Xem lại Replay",
      value: `MOTM: ${motm}\nThời gian: ${elapsedTime}\nChuỗi bất bại: ${winningStreak} trận\n\n📥 **CÁCH XEM LẠI TRẬN ĐẤU:**\n1. Tải file \`.hbr2\` đính kèm ở dưới.\n2. Truy cập: [Haxball Replay Viewer](https://www.haxball.com/replay)\n3. Kéo thả file vừa tải vào trang web để thưởng thức highlight!`,
      inline: false,
    },
  ];

  // 🛡️ DÙNG BIẾN recordData THAY VÌ room.stopRecording() BỊ LỒNG BÊN TRONG
  if (typeof sendWebhook === "function" && recordData) {
    sendWebhook(`🌟 ${scoreline}`, discordMsg, discordFields, [[new Date().toString().slice(0, 21).replace(":", "h") + ".hbr2", recordData], ["players_report.txt", playerStats.map(arr => arr.join(" | ")).join("\n")]]);
  }

  // 🎯 BẮN THÔNG BÁO VÀO TRONG GAME CHO CẦU THỦ BIẾT
  room.sendAnnouncement(`📺 Video Replay trận đấu đã được lưu trên Server Discord! Gõ !discord để lấy link tham gia nhóm và xem lại nhé.`, null, 0x00FFFF, "bold", 2);
}

function celebrateGoal(team) {
  let scores = room.getScores();
  if (!scores) return;
  let goalDiff = scores.red - scores.blue;
  if (team == 2) goalDiff = -goalDiff;
  let scoreline = `${scores.red}-${scores.blue}`;

  var scream = "VÀO!";
  var comment = "Pha dứt điểm thành công. Bàn thắng được công nhận.";

  if (
    ((scores.scoreLimit != 0) && [scores.red, scores.blue].includes(scores.scoreLimit)) ||
    ((scores.timeLimit != 0) && (scores.time > scores.timeLimit - 7.5))
  ) {
    scream = "BÀN THẮNG ẤN ĐỊNH TRẬN ĐẤU!";
    comment = randomChoice(WINNING_GOAL_COMMENTARIES);
  } else {
    if ((scores.timeLimit != 0) && (scores.time > scores.timeLimit - 10)) goalDiff = -3;
    var comments = GOAL_COMMENTARIES[goalDiff];
    if (comments) comment = comments[Math.floor(Math.random() * comments.length)];
  };

  room.sendChat(`⚽ ${scream} [${scoreline}] - ${comment}`);
}


function celebratePenalty(team) {
  if (team == 1) {
    room.sendChat(randomChoice(PENALTY_GOAL_COMMENTARIES));
  } else {
    room.sendChat(randomChoice(PENALTY_MISS_COMMENTARIES));
  };
}

function checkSpam(player, message) {
  let time = new Date().getTime();
  if (
    (lastMessages.length >= 4) &&
    (message === lastMessages[0][0]) &&
    (message === lastMessages[1][0]) &&
    (message === lastMessages[2][0]) &&
    (message === lastMessages[3][0]) &&
    (time - lastMessages[0][2] < 8000)
  ) { // 5 duplicate messages in a row
    muteFunc(`${getTag(player.name)} 1 Spam`, room.getPlayer(0));
    return true;
  } else if (
    (lastMessages.length == 4) &&
    (lastMessages.every(message => message[1] == player.id)) &&
    (time - lastMessages[3][2] < 8000)
  ) { // Sending too many messages in a short period of time
    muteFunc(`${getTag(player.name)} 1 Nhắn quá nhanh`, room.getPlayer(0));
    return true;
  };
  lastMessages.unshift([message, player.id, time]);
  if (lastMessages.length > 5) lastMessages.pop();
  return false;
}

function trackAfk() {
  // 🛡️ MIỄN TỬ: Bỏ qua máy quét AFK ở map Training và map 1v1
  if (stadium && (stadium.name === "training" || stadium.name === "1v1")) return;

  room.getPlayerList().forEach(function (player) {
    if (player.team == 0) return;
    if (timeouts.toAct[player.id] !== undefined) return;

    if (player.position) afkPositions[player.id] = { x: player.position.x, y: player.position.y };
    timeouts.toAct[player.id] = setTimeout(afkCallback.bind(null, player.id), ACTIVITY_TIMEOUT * 1000);
  });
}

function clearAfkRecords() {
  for (const id of Object.keys(timeouts.toAct)) {
    clearTimeout(timeouts.toAct[id]);
    delete timeouts.toAct[id];
  };
  afkPositions = {};
}

function clearAfkRecord(id) {
  if (!timeouts.toAct[id]) return;
  clearTimeout(timeouts.toAct[id]);
  delete timeouts.toAct[id];
  delete afkPositions[id];
}

function initiateChat(player) {
  // 1. Lời chào và Hướng dẫn Tân thủ
  let discordUrl = typeof DISCORD_LINK !== "undefined" ? DISCORD_LINK : "";
  room.sendAnnouncement(`🌟 Chào mừng đến với Server! Nhập !menu hoặc !huongdan để xem luật chơi.\n💬 Discord: ${discordUrl}`, player.id, 0x00FF00, "bold", 0);

  // Thay đoạn cũ bằng đoạn này:
  if (typeof warnings !== "undefined" && warnings[player.conn] !== undefined) {
    let warningCount = warnings[player.conn];
    room.sendAnnouncement(`⚠️ Số cảnh cáo bạn đã nhận: ${warningCount}/${MAX_WARNINGS_PER_PLAYER}`, player.id, 0xFF4444, "small-italic", 0);
  }


  // 3. Truy xuất dữ liệu cá nhân
  const auth = getAuth(player.id);
  if (auth) {
    const data = getPlayerData(auth);

    // Kiểm tra trạng thái VIP
    let isVip = data && data.vipExpiry && Date.now() < data.vipExpiry;
    let vipText = isVip ? "👑 [VIP]" : "👤 [Thường]";

    // Hiển thị Tài sản (Coins & Gems)
    let coins = (data && typeof data.coins === "number") ? data.coins : 0;
    let gems = (data && typeof data.gems === "number") ? data.gems : 0;
    room.sendAnnouncement(`💰 TÀI KHOẢN ${vipText}: ${coins.toLocaleString()} 🪙 | ${gems.toLocaleString()} 💎`, player.id, 0xFFD700, "bold", 0);

    // Hiển thị Hiệu ứng vòng chân đang dùng
    if (data && data.activeEffect !== null && data.activeEffect !== undefined) {
      let effName = data.activeEffect === -1 ? "Ngẫu nhiên" : EFFECT_NAMES[data.activeEffect];
      room.sendAnnouncement(`🎨 Hiệu ứng bàn thắng: ${effName}`, player.id, 0x00FFFF, "small", 0);
    }

    // Hiển thị Danh hiệu đang dùng
    if (data && data.activeTitle) {
      const title = SHOP_ITEMS.find(i => i.type === "title" && i.id === data.activeTitle);
      if (title) {
        room.sendAnnouncement(`🏅 Danh hiệu: ${title.name}`, player.id, 0xFFFFFF, "small", 0);
      }
    }

    // Hiển thị Đồ chơi Chat (Chat Toys)
    const toyCount = Object.values((data && data.chatToys) || {}).reduce((a, b) => a + b, 0);
    if (toyCount > 0) {
      room.sendAnnouncement(`🧸 Bạn đang có ${toyCount} chattoys. Dùng !shop để mua sắm thêm.`, player.id, 0xFF66B2, "small", 0);
    }
  }
}
async function startPenaltyShootout() {
  isTakingPenalty = true;
  let curScores = room.getScores();
  prevScore = curScores ? Array(2).fill(curScores.red).join("-") : "0-0";

  // FIX LỖI TÌM THỦ MÔN: Dùng Number.MAX_VALUE và -Number.MAX_VALUE
  // thay vì MAX_NUMBER (chữ này không tồn tại trong JS)
  let deepestPositions = [Number.MAX_VALUE, -Number.MAX_VALUE];

  // Store players' team and role (GK or not) for the penalty shootout
  room.getPlayerList().forEach(function (player) {
    if (player.team == 0) return;
    let group = game.penalty.groups[player.team - 1];
    if (
      (group.length == 0) ||
      ((player.position.x - deepestPositions[player.team - 1]) * (player.team * 2 - 3) > 0)
    ) { // The lowest player will be assigned to the GK role
      group.push(player.id); // GK is the player in the last index of the array
      deepestPositions[player.team - 1] = player.position.x;
    } else {
      group.unshift(player.id);
    };
  });
  await room.stopGame();
  loadStadium("penalty");
  room.sendChat("Thời gian thi đấu chính thức đã kết thúc. Hai đội sẽ phân định thắng thua trên chấm luân lưu 11m!");
  await new Promise(r => setTimeout(r, AFTER_GAME_REST * 1000));
  takePenalty();
}

async function endPenaltyShootout(winner) {
  clearTimeout(timeouts.toTakePenalty);

  // 1. Trả cầu thủ về đúng đội để chuẩn bị tổng kết
  for (let i = 0; i < 2; i++) {
    for (const id of game.penalty.groups[i]) {
      await room.setPlayerTeam(id, i + 1);
    };
  };

  // 2. Ghi nhớ các cầu thủ đã tham gia trận đấu vào lastMatchAuths để chống lách luật khi chia đội
  if (typeof lastMatchAuths !== 'undefined') {
    lastMatchAuths.clear();
    for (let i = 0; i < 2; i++) {
      for (const id of game.penalty.groups[i]) {
        let auth = getAuth(id);
        if (auth) lastMatchAuths.add(auth);
      }
    }
  }

  // 3. Cập nhật người thắng chung cuộc
  prevWinner = winner;

  // 🎯 GỌI HÀM TỔNG KẾT TẠI ĐÂY
  // Lúc này dữ liệu Pen (+1/-1 điểm) đã được cộng thẳng vào object của trận 120p
  handlePostGame(winner);

  // --- XÉT DUYỆT & TRAO THƯỞNG THỬ THÁCH ---
  if (typeof currentChallenge !== "undefined" && currentChallenge) {
    let winners = [];
    for (let auth in challengeTracker) {
      let stats = challengeTracker[auth];
      if (currentChallenge.check(stats)) {
        winners.push(stats.name);
        let pData = getPlayerData(auth);
        if (pData) {
          pData.coins += currentChallenge.bonus;
          savePlayerData(auth, pData);
          if (typeof logCoinTransaction === "function") {
            logCoinTransaction(stats.name, auth, currentChallenge.bonus, `Hoàn thành thử thách: ${currentChallenge.name}`, pData.coins);
          }
        }
      }
    }
    if (winners.length > 0) {
      room.sendAnnouncement(`🎉 CHÚC MỪNG: ${winners.join(", ")} đã hoàn thành Thử thách [${currentChallenge.name}] và nhận +${currentChallenge.bonus} Coins! 💰`, null, 0x00FF00, "bold", 2);
    } else {
      room.sendAnnouncement(`❌ Rất tiếc, trận này không có cầu thủ nào hoàn thành Thử thách [${currentChallenge.name}].`, null, 0xCCCCCC, "small", 1);
    }
  }

  await room.stopGame(); // Dừng trận đấu

  isTakingPenalty = false;

  // 4. Load lại map phù hợp
  let playerCount = getNonAfkPlayers().length;
  if (playerCount >= 8) await loadStadium("5v5");
  else if (playerCount >= 6) await loadStadium("3v3");
  else if (playerCount >= 2) await loadStadium("1v1");
  else await loadStadium("training");

  // 5. Đợi nghỉ ngơi sau trận rồi chia lại đội hình ngẫu nhiên (Đội thắng giữ lại, đội thua ra Spectators nhường chỗ cho khán giả)
  await new Promise(r => setTimeout(r, AFTER_GAME_REST * 1000));
  if (room.getScores() !== null) return;
  await randPlayers();
}

async function takePenalty() {
  let winner = game.penalty.getPenaltyWinner();
  // Found the winner in this penalty shootout
  if (winner !== null) {
    room.sendChat(`Loạt sút luân lưu kết thúc. Đội ${TEAM_NAMES[winner]} giành chiến thắng chung cuộc!`);
    endPenaltyShootout(winner);
    return;
  };

  room.stopGame();
  // Put previous penalty taker and goalkeeper back to the Spectators
  for (const player of room.getPlayerList()) {
    await room.setPlayerTeam(player.id, 0);
  };
  switch (game.penalty.getTurn()) {
    case 0:
      room.setTeamColors(1, ...kits.red);
      room.setTeamColors(2, ...GOALKEEPER_COLORS.blue);
      break;
    case 1:
      room.setTeamColors(1, ...kits.blue);
      room.setTeamColors(2, ...GOALKEEPER_COLORS.red);
  };

  let [penaltyTaker, goalkeeper] = game.penalty.getPenaltyTakers();
  await room.setPlayerTeam(penaltyTaker, 1);
  await room.setPlayerTeam(goalkeeper, 2);
  room.startGame();
  room.setPlayerDiscProperties(penaltyTaker, { invMass: 9999 }); // Prevent penalty taker from mis-kicking the ball (in some penalty stadiums the ball's invMass is bigger than players')

  let penResults = [[], []];
  for (let i = 0; i < 2; i++) {
    game.penalty.results[i].forEach(function (result) {
      switch (result) {
        case (true):
          penResults[i].push("🟢");
          break;
        case (false):
          penResults[i].push("🔴");
      };
    });
    if (penResults[i].length < 5) {
      penResults[i].push("⚪".repeat(5 - penResults[i].length));
    } else if (game.penalty.getTurn() <= i) {
      penResults[i].push("⚪");
    };
  };
  room.sendAnnouncement(` RED ${penResults[0].reverse().join("")} - ${penResults[1].join("")} BLUE`, null, BLUE, "bold", 0);
  if (game.penalty.results.flat(1).length == 10) {
    room.sendChat('Hai đội bước vào loạt sút "Sudden Death" (Cái chết bất ngờ). Mỗi cú sút từ bây giờ đều mang tính chất quyết định!');
  };
  room.sendChat(`Cầu thủ ${getTag(room.getPlayer(penaltyTaker).name)} bước lên thực hiện quả luân lưu.`);
  room.sendAnnouncement(`Bạn có ${PENALTY_TIMEOUT} giây để thực hiện cú sút.`, penaltyTaker, 0x00FFFF, "bold", 2);
  timeouts.toTakePenalty = setTimeout(penaltyTimeoutCallback, PENALTY_TIMEOUT * 1000);
}

async function randPlayers() {
  if (isArrangingTeams) return;
  isArrangingTeams = true;
  try {
    if (typeof checkMapRotation === "function") {
      await checkMapRotation();
    }
    const players = getNonAfkPlayers();
    if (players.length < 2) {
      if (currentStadium !== "training") await loadStadium("training");
      return;
    }

    // 1. Xác định số slot tối đa của map hiện tại
    let currentMaxPlayers = MAX_PLAYERS;
    if (stadium && stadium.name && stadium.name.includes("3v3")) currentMaxPlayers = 3;
    if (stadium && stadium.name && stadium.name.includes("1v1")) currentMaxPlayers = 2;

    const targetTeamSize = Math.min(currentMaxPlayers, Math.floor(players.length / 2));

    const winnerTeam = prevWinner || 1;
    const loserTeam = getOppositeTeamId(winnerTeam);

    let winnerPlayers = players.filter(p => p.team === winnerTeam);
    let loserPlayers = players.filter(p => p.team === loserTeam);
    let currentSpecs = players.filter(p => p.team === 0);

    // Đẩy bớt người xuống Spec nếu dư thừa (do map nhỏ lại hoặc lỗi thừa slot)
    while (winnerPlayers.length > targetTeamSize) {
      currentSpecs.push(winnerPlayers.pop());
    }
    // LƯU Ý: Đã gỡ bỏ tính năng luân phiên bớt đội thắng để đảm bảo luật "Đội thắng được đá tiếp" (Winner stays on)

    // 2. Lọc danh sách Predictor (Dự đoán đúng) và VIP Boost
    const predictionWinners = getPredictionWinners();
    const predictIds = new Set(predictionWinners.map(p => p.id));

    const allSpecsAndLosers = [...currentSpecs, ...loserPlayers];

    // Lọc ra những người có vé VIP ưu tiên
    const boostPlayers = allSpecsAndLosers.filter(p => !predictIds.has(p.id) && getPlayerData(getAuth(p.id)).starterboostUses > 0);
    const boostIds = new Set(boostPlayers.map(p => p.id));

    // 🛡️ BỘ LỌC CHỐNG LÁCH LUẬT (QUEUE JUMPING)
    let trueSpecs = [];
    let sneakyPlayers = [];

    currentSpecs.forEach(p => {
      if (predictIds.has(p.id) || boostIds.has(p.id)) return; // Bỏ qua nếu đã có slot VIP/Dự đoán

      let auth = getAuth(p.id);
      // Nếu Auth này vừa đứng trên sân ở trận trước -> Phân loại thành "Kẻ lách luật"
      if (auth && typeof lastMatchAuths !== 'undefined' && lastMatchAuths.has(auth)) {
        sneakyPlayers.push(p);
      } else {
        trueSpecs.push(p); // Khán giả chờ chân chính
      }
    });

    const remainingLosers = loserPlayers.filter(p => !predictIds.has(p.id) && !boostIds.has(p.id));

    // LẤY CẢ NHỮNG NGƯỜI LÁCH LUẬT BẰNG !AFK (thuộc lastMatchAuths nhưng đang bị coi là AFK)
    let allPlayers = room.getPlayerList();
    let afkDodgers = allPlayers.filter(p => {
      if (predictIds.has(p.id) || boostIds.has(p.id)) return false;
      if (!afkList.has(p.id)) return false; // Chỉ xét ai đang AFK
      let auth = getAuth(p.id);
      return auth && typeof lastMatchAuths !== 'undefined' && lastMatchAuths.has(auth);
    });

    const shuffle = arr => arr.sort(() => Math.random() - 0.5);

    // 3. Xếp hàng thứ tự ưu tiên: Dự đoán đúng -> Thẻ VIP -> Khán giả THẬT SỰ (ưu tiên trên xuống) -> Cầu thủ thua + Kẻ lách luật -> Kẻ lách luật AFK
    const priorityQueue = [
      ...predictionWinners,
      ...boostPlayers,
      ...trueSpecs, // Lấy theo thứ tự từ trên xuống (dựa vào danh sách của phòng)
      ...shuffle([...remainingLosers, ...sneakyPlayers]),
      ...shuffle(afkDodgers)
    ];

    // 4. LẤP ĐẦY ĐỘI THẮNG
    let neededForWinner = targetTeamSize - winnerPlayers.length;
    if (neededForWinner > 0) {
      let fillersForWinner = priorityQueue.splice(0, neededForWinner);
      winnerPlayers.push(...fillersForWinner);
    }

    // 5. LẤP ĐẦY ĐỘI THUA
    let neededForLoser = targetTeamSize;
    let chosenPlayersForLoser = priorityQueue.splice(0, neededForLoser);

    // Xóa AFK cho những ai bị bốc vào từ afkDodgers
    const allPlayingNow = [...winnerPlayers, ...chosenPlayersForLoser];
    for (let p of allPlayingNow) {
      if (afkList.has(p.id)) afkList.delete(p.id);
    }

    // 6. TRỪ VÉ VIP VÀ THÔNG BÁO
    const boostedChosen = boostPlayers.filter(p => allPlayingNow.includes(p));
    for (const p of boostedChosen) {
      const auth = getAuth(p.id);
      if (auth) {
        const data = getPlayerData(auth);
        data.starterboostUses--;
      }
    }
    if (boostedChosen.length > 0) {
      room.sendChat(`🎫 Đã áp dụng vé VIP ưu tiên bốc vào sân cho: ${boostedChosen.map(p => p.name).join(", ")}`);
    }

    const selectedPredictIds = allPlayingNow.filter(p => predictIds.has(p.id));
    if (selectedPredictIds.length > 0) {
      room.sendChat(`🎉 Chúc mừng ${selectedPredictIds.map(p => getTag(p.name)).join(", ")} đã dự đoán đúng và được ưu tiên đá chính!`);
    }

    // 7. THỰC THI GÁN ĐỘI HÌNH ĐỒNG LOẠT
    const finalWinnerIds = new Set(winnerPlayers.map(p => p.id));
    const finalLoserIds = new Set(chosenPlayersForLoser.map(p => p.id));

    for (const p of allPlayers) {
      if (finalWinnerIds.has(p.id)) {
        if (p.team !== winnerTeam) await room.setPlayerTeam(p.id, winnerTeam);
      } else if (finalLoserIds.has(p.id)) {
        if (p.team !== loserTeam) await room.setPlayerTeam(p.id, loserTeam);
      } else {
        if (p.team !== 0) await room.setPlayerTeam(p.id, 0); // Ra spec
      }
    }

    room.startGame();
  } catch (err) {
    console.error("randPlayers error:", err);
    room.sendChat("⚠️ Có lỗi khi chia đội ngẫu nhiên. Hệ thống sẽ thử lại sau.");
  } finally {
    isArrangingTeams = false;
  }
}
function personalizeMsg(message, player) {
  const role = getRole(player);
  const auth = getAuth(player.id);
  const data = auth ? getPlayerData(auth) : {}; // Lấy 1 lần duy nhất ở đây

  // Ưu tiên chat color đồ chơi nếu còn hạn
  let color = 0xFFFFFF;
  if (data.activeChatColor && data.activeChatColor.expiry > Date.now()) {
    let cc = data.activeChatColor.color;
    if (cc === "random") color = Math.floor(Math.random() * 0xFFFFFF);
    else if (cc === "red") color = 0xFF0000;
    else if (cc === "blue") color = 0x0000FF;
    else {
      // BẢO VỆ: Tránh lỗi NaN làm sập phòng
      let parsedColor = parseInt(cc.replace("#", ""), 16);
      color = isNaN(parsedColor) ? 0xFFFFFF : parsedColor;
    }
  }
  // Nếu không có chat color, mới dùng màu role VIP
  else if (role === ROLE.SUPER_ADMIN) {
    color = 0xFBFC92;
  } else if (role === ROLE.ADMIN) {
    color = 0x2ECC71;
  } else if (data.activeRole) { // TỐI ƯU: Đã có data, không cần gọi lại getPlayerData
    const shopRole = SHOP_ITEMS.find(i => i.type === "role" && i.id === data.activeRole);
    if (shopRole && shopRole.color) color = shopRole.color;
  }

  // Tạo tiền tố tên
  let prefix = "";
  if (data.activeSparkle && data.activeSparkleExpiry > Date.now()) {
    prefix = "✨ ";
  }
  let rolePrefix = "";
  if (role === ROLE.SUPER_ADMIN) {
    rolePrefix = "[👑 VUA] ";
  } else if (role === ROLE.ADMIN) {
    rolePrefix = "[🐦‍🔥 PHÓ VUA] ";
  } else if (data.activeRole) { // TỐI ƯU: Đã có data
    const shopRole = SHOP_ITEMS.find(i => i.type === "role" && i.id === data.activeRole);
    if (shopRole) rolePrefix = `[${shopRole.name}] `;
  }

  // Thêm title prefix (danh hiệu) nếu có
  let titlePrefix = "";
  if (data.activeTitle) {
    const title = SHOP_ITEMS.find(i => i.type === "title" && i.id === data.activeTitle);
    if (title) titlePrefix = title.name + " ";
  }

  let levelPrefix = `[LV${data.level || 1}] `;
  let newMsg = prefix + titlePrefix + rolePrefix + levelPrefix + player.name.trim() + ": " + message;

  let isVip = data.vipExpiry && Date.now() < data.vipExpiry;
  let baseStyle = isVip ? "bold" : null;

  // Xử lý tag @
  if (message.includes("@")) {
    for (const _player of room.getPlayerList()) {
      // BẢO VỆ: Nếu bạn chưa định nghĩa hàm getTag ở ngoài, nó sẽ lấy tự động
      const tag = typeof getTag === "function" ? getTag(_player.name) : "@" + _player.name.replace(/ /g, "");
      const isTagged = tag ? message.includes(tag) : false;
      let finalStyle = isTagged ? "bold" : baseStyle;
      room.sendAnnouncement(newMsg, _player.id, color, finalStyle, isTagged ? 2 : null);
    }
    return;
  }
  room.sendAnnouncement(newMsg, null, color, baseStyle);
}

function reset() {
  game.reset();
  surrenderVoter.reset();
  predictions = {};
}

function handlePostGame(winner) {
  if (postGameHandled) return; // Chặn gọi lại
  postGameHandled = true;
  if (winner == prevWinner) {
    winningStreak++;
  } else {
    winningStreak = 1;
    prevWinner = winner;
  }

  let scores = room.getScores();
  let matchTime = scores ? scores.time : 0;
  let MIN_MATCH_TIME = 40; // Tối thiểu 40s mới tính trận

  // 🛡️ FIX: Khi kết thúc penalty, scores.time chỉ là thời gian penalty game (rất ngắn)
  // Phải bypass check MIN_MATCH_TIME để tránh hủy kết quả trận hợp lệ
  if (stadium.name === "penalty" || stadium.name.includes("PEN")) matchTime = MIN_MATCH_TIME + 1;

  if (matchTime < MIN_MATCH_TIME && stadium.name !== "penalty") {
    room.sendChat(`Trận đấu kết thúc quá sớm (${Math.floor(matchTime)} giây). Hệ thống hủy kết quả do không đủ thời gian thi đấu tối thiểu.`);
    refundBets("Trận đấu quá ngắn (< 40s)");

    // ⚔️ DỌN DẸP: Hủy toàn bộ kèo 1v1 nếu trận đấu không hợp lệ
    if (typeof activeDuels !== "undefined") activeDuels = [];

    // Xả RAM ghi hình khi trận đấu bị hủy sớm
    room.stopRecording();
    return;
  }

  let initialParticipantsCount = Object.keys(game.teams[1].players).length + Object.keys(game.teams[2].players).length;
  let timeRatio = Math.min(1, matchTime / (TIME_LIMIT * 60));

  // 🎯 NỚI LỎNG 1: Tiêu chuẩn cho người vào muộn (L1)
  let reqTouchesL1 = Math.max(1, Math.round(3 * timeRatio));

  // 🎯 NỚI LỎNG 2: Tiêu chuẩn cơ bản để không bị coi là tàng hình (L2)
  let reqTouchesL2 = Math.max(2, Math.round(6 * timeRatio));

  let filteredPlayersToNotify = [];

  for (let i = 1; i <= 2; i++) {
    // 🎯 TÌM THỦ MÔN TRƯỚC TIÊN ĐỂ BẢO VỆ
    let scoreArray = (prevScore || "0-0").split("-");
    let opponentScore = (i === 1) ? parseInt(scoreArray[1], 10) : parseInt(scoreArray[0], 10);
    let teamEntries = Object.entries(game.teams[i].players).sort((a, b) =>
      (i === 1) ? (a[1].meanPosition - b[1].meanPosition) : (b[1].meanPosition - a[1].meanPosition)
    );
    let gkAuth = teamEntries.length > 0 ? teamEntries[0][0] : null;

    for (const auth in game.teams[i].players) {
      let pStats = game.teams[i].players[auth];
      let matchRating = pStats.getPoints();

      // 🎯 VÁ LỖI OAN SAI: Đồng bộ điểm thưởng chuẩn xác
      if (auth === gkAuth) {
        if (opponentScore === 0) matchRating += 6.0;
        else if (opponentScore === 1) matchRating += 3.5;
        else if (opponentScore === 2) matchRating += 2.0;
      }

      // 🎯 BẢO VỆ THỦ MÔN: Miễn trừ hoàn toàn khỏi filter chạm bóng
      if (auth === gkAuth) continue;

      // 🎯 BẢO VỆ PENALTY
      if (stadium.name === "penalty") continue;

      let isTooLate = (pStats.touches < reqTouchesL1 && pStats.goals === 0 && pStats.assists === 0 && pStats.stoppedShots === 0);

      // 🎯 NỚI LỎNG 3: Hạ mốc Rating xuống < 0.5
      let isUseless = (pStats.touches < reqTouchesL2 && matchRating < 0.5);

      if (isTooLate || isUseless) {
        delete game.teams[i].players[auth];

        let pInRoom = room.getPlayerList().find(p => p.id !== 0 && getAuth(p.id) === auth);
        if (pInRoom) {
          let reasonMsg = isTooLate
            ? `chỉ chạm bóng ${pStats.touches} lần (Không đủ định mức thi đấu)`
            : `không có đóng góp chuyên môn (Rating < 0.5)`;

          filteredPlayersToNotify.push({ id: pInRoom.id, reason: reasonMsg });
        }
      }
    }
  }

  let validRed = Object.keys(game.teams[1].players).length;
  let validBlue = Object.keys(game.teams[2].players).length;
  let isBalanced = (validRed >= 1 && validBlue >= 1);

  if (stadium.name && (stadium.name.includes("5v5") || stadium.name.includes("PEN") || stadium.name.includes("penalty")) && initialParticipantsCount >= MIN_PLAYERS_FOR_STATS * 2) {
    if (isBalanced) {
      reportStats();
      saveStats();

      // 🛡️ ĐÃ FIX LỖI TỈ SỐ TRẢ THƯỞNG CHO PENALTY (Dùng biến prevScore gốc)
      let scoreArray = (prevScore || "0-0").split("-");
      let finalScoreToSettle = {
        red: parseInt(scoreArray[0], 10),
        blue: parseInt(scoreArray[1], 10)
      };

      if (typeof settleBets === "function") {
        let scorers = [];
        for (let i = 1; i <= 2; i++) {
          for (const [auth, stats] of Object.entries(game.teams[i].players)) {
            if (stats.goals > 0) scorers.push(auth);
          }
        }
        settleBets(winner, finalScoreToSettle, scorers, getMotm()[0]);
      }

      // ⚔️ TÍNH NĂNG MỚI: QUYẾT TOÁN KÈO THÁCH ĐẤU 1V1
      if (typeof resolveDuels === "function") {
        resolveDuels(winner);
      }

      if (typeof rewardCoins === "function") {
        rewardCoins(getMotm()[0], winningStreak, gkCleanStreak);
      }

      filteredPlayersToNotify.forEach(p => {
        room.sendAnnouncement(`[HỆ THỐNG]: Bạn bị xác định là thiếu đóng góp trong trận đấu (${p.reason}). Kết quả trận này sẽ không được ghi nhận cho bạn.`, p.id, 0xFFFFFF, "italic", 0);
      });

    } else {
      room.sendChat(`Trận đấu bị hủy kết quả do có một đội đã bị gạch tên gần như toàn bộ thành viên (Đỏ hợp lệ: ${validRed} - Xanh hợp lệ: ${validBlue}).`);
      refundBets("Đội hình không hợp lệ (AFK/Tàng hình)");

      // Hoàn tiền kèo 1v1 trước khi xóa mảng
      if (typeof activeDuels !== "undefined" && activeDuels.length > 0) {
        for (let duel of activeDuels) {
          let d1 = getPlayerData(duel.p1Auth);
          if (d1) { d1.coins += duel.amount; savePlayerData(duel.p1Auth, d1); if (typeof logCoinTransaction === "function") logCoinTransaction(duel.p1Name, duel.p1Auth, duel.amount, "Hoàn kèo 1v1 (Đội hình không hợp lệ)", d1.coins); }
          let d2 = getPlayerData(duel.p2Auth);
          if (d2) { d2.coins += duel.amount; savePlayerData(duel.p2Auth, d2); if (typeof logCoinTransaction === "function") logCoinTransaction(duel.p2Name, duel.p2Auth, duel.amount, "Hoàn kèo 1v1 (Đội hình không hợp lệ)", d2.coins); }
        }
        activeDuels = [];
      }

      // Xả RAM khi đội hình không hợp lệ
      room.stopRecording();
    }
  } else {
    if (stadium.name && (stadium.name.includes("5v5") || stadium.name.includes("PEN") || stadium.name.includes("penalty"))) {
      room.sendChat(`Không đủ số lượng người chơi tối thiểu ban đầu để ghi nhận dữ liệu thi đấu.`);
      refundBets("Không đủ số lượng người chơi tối thiểu");

      // Hoàn tiền kèo 1v1 trước khi xóa mảng
      if (typeof activeDuels !== "undefined" && activeDuels.length > 0) {
        for (let duel of activeDuels) {
          let d1 = getPlayerData(duel.p1Auth);
          if (d1) { d1.coins += duel.amount; savePlayerData(duel.p1Auth, d1); if (typeof logCoinTransaction === "function") logCoinTransaction(duel.p1Name, duel.p1Auth, duel.amount, "Hoàn kèo 1v1 (Thiếu người)", d1.coins); }
          let d2 = getPlayerData(duel.p2Auth);
          if (d2) { d2.coins += duel.amount; savePlayerData(duel.p2Auth, d2); if (typeof logCoinTransaction === "function") logCoinTransaction(duel.p2Name, duel.p2Auth, duel.amount, "Hoàn kèo 1v1 (Thiếu người)", d2.coins); }
        }
        activeDuels = [];
      }
    }

    // Xả RAM cho map 1v1, 3v3, training
    room.stopRecording();
  }
}
room.onPlayerJoin = async function (player) {
  if (!isPlayerValid(player)) return;
  saveIdentities(player);
  const auth = getAuth(player.id);

  // 🎯 NHẬN DIỆN LẠI VÉ CƯỢC CHO KHÁN GIẢ RỚT MẠNG VÀO LẠI
  if (typeof bets !== 'undefined' && auth) {
    bets.forEach(b => {
      // Nếu tìm thấy vé cược trùng với Auth của người vừa vào
      if (b.auth === auth) {
        b.playerId = player.id; // Cập nhật ID mới để bot nhận diện và thông báo trả thưởng
      }
    });
  }

  if (auth && !localStorage.getItem("pd_" + auth)) {
    savePlayerData(auth, { coins: 200, ownedRoles: [], activeRole: null, ownedEffects: [], activeEffect: null, features: {}, ownedTitles: [], activeTitle: null });
    logCoinTransaction(player.name, auth, 200, "Khởi nghiệp", 200);
    room.sendAnnouncement(`🎁 Chào mừng tân binh ${player.name}! Bạn nhận được 200 coins khởi nghiệp.`, player.id, 0xFFD700, "bold", 2);
  }

  // Cập nhật bộ đệm kỹ năng power_shot
  if (auth) {
    let playerData = getPlayerData(auth);
  }

  // 💎 HỆ THỐNG KIỂM TRA VÀ CHÀO MỪNG ĐẠI QUÝ TỘC VIP VĨNH VIỄN
  if (auth) {
    let playerData = getPlayerData(auth);
    // Nếu có dữ liệu và thời gian hết hạn VIP lớn hơn thời điểm hiện tại
    if (playerData && playerData.vipExpiry && playerData.vipExpiry > Date.now()) {
      setTimeout(() => {
        room.sendAnnouncement(`💎 ĐẠI QUÝ TỘC LỘ DIỆN: Chào mừng Thành Viên VIP [${player.name}] đã trở lại ROOM! ✨🎉`, null, 0x00FFFF, "bold", 2);
      }, 750); // Phát sau 750ms để không bị đè chữ với thông báo tân binh/nha vua
    }
  }

  if (SUPER_ADMIN_AUTHS.includes(player.auth)) {
    room.setPlayerAdmin(player.id, true);
    setTimeout(() => {
      room.sendAnnouncement(`👑 NHA VUA ${player.name} DA DEN. Cúi đầu chào đi các con dân!`, null, 0xFBFC92, "bold", 2);
    }, 500);
  }

  initiateChat(player);
  await updateTeamPlayers();
  reorderPlayers();
  checkBan(player);

  // 🎯 CƠ CHẾ ĐỔI MAP CHUẨN CỦA ROOM3.JS (Lúc người vào)
  if (typeof checkMapRotation === "function") {
    checkMapRotation();
  }
}

room.onPlayerLeave = async function (player) {


  const auth = getAuth(player.id);

  // ⚔️ BẢO HIỂM 1V1: HỦY KÈO NẾU ĐẤU THỦ THOÁT GAME (DISCONNECT)
  if (typeof activeDuels !== "undefined" && activeDuels.length > 0) {
    let newDuels = [];
    for (let duel of activeDuels) {
      if (duel.p1Auth === auth || duel.p2Auth === auth) {
        let d1 = getPlayerData(duel.p1Auth);
        if (d1) {
          d1.coins += duel.amount; savePlayerData(duel.p1Auth, d1);
          if (typeof logCoinTransaction === "function") logCoinTransaction(duel.p1Name, duel.p1Auth, duel.amount, "Hủy kèo 1v1 (Thoát game)", d1.coins);
        }
        let d2 = getPlayerData(duel.p2Auth);
        if (d2) {
          d2.coins += duel.amount; savePlayerData(duel.p2Auth, d2);
          if (typeof logCoinTransaction === "function") logCoinTransaction(duel.p2Name, duel.p2Auth, duel.amount, "Hủy kèo 1v1 (Thoát game)", d2.coins);
        }
        room.sendAnnouncement(`🛡️ Kèo 1v1 BỊ HỦY: [${player.name}] đã thoát khỏi phòng. Hoàn trả ${duel.amount} 🪙.`, null, 0xFF4444, "bold", 1);
      } else {
        newDuels.push(duel);
      }
    }
    activeDuels = newDuels;
  }

  if (typeof bets !== 'undefined') {
    // 1. HOÀN TIỀN CHO NGƯỜI KHÁC (Nếu họ lỡ cược kèo Scorer/MOTM vào cầu thủ vừa thoát)
    let betsOnTarget = bets.filter(b => (b.type === "scorer" || b.type === "motm") && b.targetAuth === auth);
    for (let bet of betsOnTarget) {
      let bettorData = getPlayerData(bet.auth);
      if (bettorData) {
        let refundAmount = bet.amount;
        bettorData.coins += refundAmount;
        savePlayerData(bet.auth, bettorData);
        if (typeof logCoinTransaction === "function") {
          let bName = bet.name || (room.getPlayer(bet.playerId) ? room.getPlayer(bet.playerId).name : "OfflinePlayer");
          logCoinTransaction(bName, bet.auth, refundAmount, "Hoàn tiền kèo (Cầu thủ thoát trận)", bettorData.coins);
        }
        let bettorInRoom = room.getPlayer(bet.playerId);
        if (bettorInRoom) {
          room.sendAnnouncement(`💸 Cầu thủ [${player.name}] đã rời trận. Hệ thống hoàn trả ${refundAmount} 🪙 kèo ${bet.type.toUpperCase()} cho bạn!`, bettorInRoom.id, 0x00FF00, "italic", 2);
        }
      }
    }
    // Xóa các vé cược vào mục tiêu (Scorer/MOTM) vừa thoát
    bets = bets.filter(b => !((b.type === "scorer" || b.type === "motm") && b.targetAuth === auth));

    // ====================================================
    // 2. XỬ LÝ VÉ CƯỢC CỦA CHÍNH NGƯỜI VỪA THOÁT
    // ====================================================
    if (player.team === 1 || player.team === 2) {
      // CẦU THỦ ĐANG ĐÁ MÀ OUT GAME → HOÀN TIỀN vé cược của chính họ
      let myBets = bets.filter(b => b.auth === auth);
      for (let bet of myBets) {
        let betData = getPlayerData(auth);
        if (betData) {
          betData.coins += bet.amount;
          savePlayerData(auth, betData);
          if (typeof logCoinTransaction === "function") {
            logCoinTransaction(player.name, auth, bet.amount, `Hoàn tiền cược (Cầu thủ thoát game)`, betData.coins);
          }
        }
      }
      bets = bets.filter(b => b.auth !== auth);
    }
    else if (player.team === 0) {
      // ✅ TRƯỜNG HỢP 2: KHÁN GIẢ (SPEC) OUT GAME
      // KHÔNG LÀM GÌ CẢ! Hệ thống sẽ giữ nguyên vé cược của họ trong mảng 'bets'.
    }
  }

  // [LOGIC ROOM3.JS]
  if (player.team != 0) {
    await updateTeamPlayers();
    punishQuitGame(player);
  } else if (typeof afkList !== "undefined" && afkList.has(player.id)) {
    afkList.delete(player.id);
  };
  delete identities[player.id];

  if (typeof isTakingPenalty !== "undefined" && isTakingPenalty) {
    for (let i = 0; i < 2; i++) {
      let index = game.penalty.groups[i].indexOf(player.id);
      if (index == -1) continue;
      game.penalty.groups[i].splice(index, 1);
      if (game.penalty.groups[i].length == 0) {
        room.sendChat(`Toàn bộ cầu thủ sút luân lưu của ${TEAM_NAMES[i + 1]} đã rời phòng, ${TEAM_NAMES[i + 1]} đã bị xử thua`);
        await endPenaltyShootout(2 - i);
        break;
      };
    };
  } else {
    if (typeof checkMapRotation === "function") {
      checkMapRotation();
    }
  };

  // 🛡️ CHỐNG TRÀN RAM: Xóa sạch toàn bộ state/cooldown của player vừa rời phòng
  // Không xóa = các object này phình to mãi theo số người từng vào room
  delete gamblingCooldowns[player.id];
  delete badWordCounts[player.id];

  delete activeSpeedBuffs[player.id];
  delete giantExpirations[player.id];
  delete invisExpirations[player.id];
  delete xoacExpirations[player.id];
  delete exhaustedPlayers[player.id];
  delete injuredPlayers[player.id];
  delete silencedPlayers[player.id];
  delete lastPlayerDirection[player.id];
  delete afkPositions[player.id];
  reportCooldowns.delete(player.id);

  // 🚀 CACHE RAM: Flush dữ liệu người chơi và stats vừa thoát xuống ổ cứng ngay lập tức,
  // rồi giải phóng RAM (xóa khỏi cache để tránh cache phình to vô hạn)
  if (auth) {
    if (playerCache[auth]) {
      try {
        localStorage.setItem("pd_" + auth, JSON.stringify(playerCache[auth]));
      } catch(e) {
        console.error("[OnLeave Flush] Lỗi lưu dữ liệu:", auth, e);
      }
      delete playerCache[auth];
      dirtyPlayers.delete(auth);
    }
    if (statsCache[auth]) {
      try {
        localStorage.setItem(auth, JSON.stringify(statsCache[auth]));
      } catch(e) {
        console.error("[OnLeave Stats Flush] Lỗi lưu stats:", auth, e);
      }
      delete statsCache[auth];
      dirtyStats.delete(auth);
    }
  }

};
room.onPlayerTeamChange = async function (changedPlayer, byPlayer) {

  if (typeof isTakingPenalty !== "undefined" && isTakingPenalty) {
    // Nếu cầu thủ đang sút penalty bị Admin chuyển sang Spectators, coi như sút hỏng
    if ((changedPlayer.team == 0) && (byPlayer.id != 0) && Object.values(game.penalty.groups).some(group => group.includes(changedPlayer.id))) {
      clearTimeout(timeouts.toTakePenalty);
      penaltyTimeoutCallback();
    };
    return;
  };

  // ⚔️ BẢO HIỂM 1V1: HỦY NẾU BỊ ĐỔI TEAM HOẶC RA SPEC BỞI ADMIN/AUTO-BALANCE
  if (typeof activeDuels !== "undefined" && activeDuels.length > 0) {
    let auth = getAuth(changedPlayer.id);
    let newDuels = [];
    for (let duel of activeDuels) {
      if (duel.p1Auth === auth || duel.p2Auth === auth) {
        let d1 = getPlayerData(duel.p1Auth);
        if (d1) {
          d1.coins += duel.amount; savePlayerData(duel.p1Auth, d1);
          if (typeof logCoinTransaction === "function") logCoinTransaction(duel.p1Name, duel.p1Auth, duel.amount, "Hủy kèo 1v1 (Đổi team)", d1.coins);
        }
        let d2 = getPlayerData(duel.p2Auth);
        if (d2) {
          d2.coins += duel.amount; savePlayerData(duel.p2Auth, d2);
          if (typeof logCoinTransaction === "function") logCoinTransaction(duel.p2Name, duel.p2Auth, duel.amount, "Hủy kèo 1v1 (Đổi team)", d2.coins);
        }
        room.sendAnnouncement(`🛡️ Kèo 1v1 BỊ HỦY: [${changedPlayer.name}] đã rời vị trí gốc. Hoàn trả ${duel.amount} 🪙.`, null, 0xFF4444, "bold", 1);
      } else {
        newDuels.push(duel);
      }
    }
    activeDuels = newDuels;
  }

  if (changedPlayer.team == 0) {
    // 🎯 HOÀN TIỀN KÈO CÁ NHÂN KHI BỊ THAY RA NGOÀI DỰ BỊ
    const changedAuth = getAuth(changedPlayer.id);
    if (typeof bets !== 'undefined' && changedAuth) {
      let betsOnTarget = bets.filter(b => (b.type === "scorer" || b.type === "motm") && b.targetAuth === changedAuth);
      for (let bet of betsOnTarget) {
        let bettorData = getPlayerData(bet.auth);
        if (bettorData) {
          let refundAmount = bet.amount;
          bettorData.coins += refundAmount;
          savePlayerData(bet.auth, bettorData);
          if (typeof logCoinTransaction === "function") {
            let bName = bet.name || (room.getPlayer(bet.playerId) ? room.getPlayer(bet.playerId).name : "OfflinePlayer");
            logCoinTransaction(bName, bet.auth, refundAmount, "Hoàn tiền kèo (Cầu thủ ra dự bị)", bettorData.coins);
          }

          let bettorInRoom = room.getPlayer(bet.playerId);
          if (bettorInRoom) {
            room.sendAnnouncement(`💸 [BẢO HIỂM]: Cầu thủ [${changedPlayer.name}] đã bị thay ra ngoài. Hoàn trả ${refundAmount} 🪙 kèo ${bet.type.toUpperCase()} cho bạn!`, bettorInRoom.id, 0x00FF00, "italic", 2);
          }
        }
      }
      bets = bets.filter(b => !((b.type === "scorer" || b.type === "motm") && b.targetAuth === changedAuth));
    }
    clearAfkRecord(changedPlayer.id);
    reorderPlayers();

    // 🎯 FIX ĐIỂM MÙ 2: Khi Admin kéo một người từ sân ra Spec (gây ra 4v5), Bot lập tức đếm lại và bốc 1 Spec khác lấp vào
    setTimeout(updateTeamPlayers, 100);

  } else if (typeof afkList !== "undefined" && afkList.has(changedPlayer.id)) {
    room.setPlayerTeam(changedPlayer.id, 0);
    room.sendAnnouncement("Người chơi đang ở trạng thái AFK", byPlayer.id, 0xFF4444);
  } else {
    // =========================================================
    // 🎯 HOÀN TIỀN VÉ CƯỢC LỖI NẾU ĐANG LÀ SPEC MÀ BỊ ĐƯA VÀO SÂN
    // =========================================================
    const changedAuth = getAuth(changedPlayer.id);
    if (typeof bets !== 'undefined' && changedAuth) {
      let myTeam = changedPlayer.team === 1 ? "red" : "blue";

      // CHỈ TÌM NHỮNG VÉ CƯỢC SAI LUẬT (Không phải kèo đội thắng/chấp HOẶC cược cho đội đối thủ)
      let illegalBets = bets.filter(b => b.auth === changedAuth &&
        ((b.type !== "winner" && b.type !== "keochap") || (b.choice !== myTeam))
      );

      if (illegalBets.length > 0) {
        let bettorData = getPlayerData(changedAuth);
        let totalRefund = 0;
        if (bettorData) {
          for (let bet of illegalBets) {
            let refundAmount = bet.amount;
            bettorData.coins += refundAmount;
            totalRefund += refundAmount;
          }
          savePlayerData(changedAuth, bettorData);
          if (totalRefund > 0 && typeof logCoinTransaction === "function") {
            logCoinTransaction(changedPlayer.name, changedAuth, totalRefund, "Hoàn tiền vé cược sai luật", bettorData.coins);
          }
        }
        // Xóa vé lỗi khỏi hệ thống, GIỮ LẠI vé hợp lệ cược cho đội nhà
        bets = bets.filter(b => !illegalBets.includes(b));
        room.sendAnnouncement(`💸 [BẢO HIỂM]: Bạn đã thành Cầu thủ đội ${myTeam.toUpperCase()}. Hệ thống tự động HỦY ${illegalBets.length} vé cược sai luật và hoàn trả ${totalRefund} 🪙! (Chỉ giữ lại vé cược cho đội nhà)`, changedPlayer.id, 0x00FF00, "bold", 2);
      }
    }

    // Khi người chơi vào sân
    let scores = room.getScores();
    if (scores === null) return;
    resizePlayer(changedPlayer.id);
    getGameStats(changedPlayer);

    room.sendAnnouncement("Bạn đã được thay vào sân", changedPlayer.id, 0x0000FF, "small", 2);

    if (isPlaying) {
      timeouts.toAct[changedPlayer.id] = setTimeout(afkCallback.bind(null, changedPlayer.id), ACTIVITY_TIMEOUT * 1000);
    };

    if (byPlayer !== null && byPlayer.id !== 0) {
      setTimeout(updateTeamPlayers, 100);
    }
  };
}

room.onPlayerBallKick = function (player) {
  if (isTakingPenalty) return;
  updateBallKick(player);



  // (getRole(player) == ROLE.VIP) && room.setDiscProperties(0, {color: ballColor.getColor()}); // Switch ball color
}

room.onTeamGoal = function (team) {
  isGoalCelebration = true;
  // 🛑 ĐÓNG KÈO & DỪNG BÁO TỈ LỆ NẾU CÓ BÀN THẮNG SỚM
  let scores = room.getScores();
  let predictTime = typeof PREDICTION_PERIOD !== "undefined" ? PREDICTION_PERIOD : 60;

  // 👉 FIX: Thêm điều kiện !isTakingPenalty để không bị nhận nhầm lúc đá luân lưu
  if (scores && scores.time <= predictTime && !isBettingClosedEarly && typeof isTakingPenalty !== "undefined" && !isTakingPenalty) {
    isBettingClosedEarly = true;
    room.sendAnnouncement("🔒 ĐÃ CÓ BÀN THẮNG! Bảng kèo đã đóng sớm để đảm bảo công bằng!", null, 0xFF4444, "bold", 2);

    // Tắt luôn vòng lặp báo tỉ lệ
    if (typeof oddsUpdateInterval !== 'undefined') clearInterval(oddsUpdateInterval);
  }

  // 🛑 XỬ LÝ PENALTY
  if (typeof isTakingPenalty !== "undefined" && isTakingPenalty) {
    clearTimeout(timeouts.toTakePenalty);
    getGameStats(room.getPlayerList().find(player => player.team == 1), game.penalty.getTurn() + 1)[(team == 1) ? "penaltiesScored" : "penaltiesMissed"]++;
    celebratePenalty(team);
    game.penalty.push(team == 1);
    return; // Dừng tại đây, không chạy các code bên dưới
  };

  // --- 🏆 GHI NHẬN TIẾN ĐỘ THỬ THÁCH TRẬN ĐẤU (RẤT QUAN TRỌNG) ---
  let shot = game.ballRecords[0];
  let assist = game.ballRecords[1];

  if (typeof currentChallenge !== "undefined" && currentChallenge && shot && shot.player.team === team) {
    let scorer = shot.player;
    let scorerAuth = getAuth(scorer.id);

    // Khởi tạo hồ sơ cho người ghi bàn nếu chưa có
    if (!challengeTracker[scorerAuth]) challengeTracker[scorerAuth] = { name: scorer.name, goals: 0, assists: 0, firstBlood: false };

    challengeTracker[scorerAuth].goals += 1; // Cộng 1 bàn thắng

    // Kiểm tra Chiến công đầu (First Blood)
    if (scores && (scores.red + scores.blue === 1)) {
      challengeTracker[scorerAuth].firstBlood = true;
    }

    // Khởi tạo hồ sơ và ghi nhận cho người Kiến tạo (Assists)
    if (assist && assist.player.id !== scorer.id && assist.player.team === team) {
      let assister = assist.player;
      let assistAuth = getAuth(assister.id);

      if (!challengeTracker[assistAuth]) challengeTracker[assistAuth] = { name: assister.name, goals: 0, assists: 0, firstBlood: false };
      challengeTracker[assistAuth].assists += 1; // Cộng 1 kiến tạo
    }
  }
  // ---------------------------------------------------------------

  // ===============================================================
  // ⚡ TRẢ THƯỞNG KÈO RUNG NGAY LẬP TỨC ⚡
  // ===============================================================
  if (typeof rungBets !== "undefined" && rungBets.length > 0) {
    let scoringTeam = team === 1 ? "red" : "blue";
    room.sendAnnouncement(`🔥 BÀN THẮNG DÀNH CHO ${scoringTeam.toUpperCase()}! ĐANG CHỐT KÈO RUNG...`, null, 0xFFD700, "bold", 2);

    for (let bet of rungBets) {
      if (!bet.auth) continue;
      let data = getPlayerData(bet.auth);
      if (!data) continue;

      if (bet.choice === scoringTeam) {
        let winAmount = Math.floor(bet.amount * 1.85); // Kèo rung ăn x1.85
        data.coins += winAmount;
        room.sendAnnouncement(`✅ ${bet.name} đã bắt trúng Kèo Rung! Nhận được ${winAmount} coins.`, null, 0x00FF00, "bold", 1);
        if (typeof logCoinTransaction === "function") logCoinTransaction(bet.name, bet.auth, winAmount - bet.amount, `Thắng Kèo Rung`, data.coins);
      } else {
        room.sendAnnouncement(`❌ ${bet.name} đã tạch Kèo Rung (-${bet.amount} coins).`, null, 0xFF4444, "small", 1);
      }
      savePlayerData(bet.auth, data);
    }
    rungBets = []; // Chốt xong thì dọn sạch kèo rung
  }
  // ===============================================================

  if (typeof cleanupEffectDiscs === "function") cleanupEffectDiscs();
  isPlaying = false;
  if (typeof celebrateGoal === "function") celebrateGoal(team);
  if (typeof updateGoalStats === "function") updateGoalStats(team);
}

room.onPositionsReset = function () {
  isGoalCelebration = false;
  playerBlockCache = {};
  cleanupEffectDiscs(); // <--- THÊM DÒNG NÀY VÀO ĐÂY
  // --- CÁC TÍNH NĂNG CŨ BÊN DƯỚI GIỮ NGUYÊN ---
  if (isTakingPenalty) {
    takePenalty();
    return;
  };

  resizePlayers();
  isPlaying = true;
  game.resetBallRecords();

  room.getPlayerList().forEach(player => {
    if (player.team === 1 || player.team === 2) {
      getGameStats(player);
    }
  });

}
// 💬 Webhook Discord để theo dõi Chat của người chơi trong room
const DISCORD_CHAT_WEBHOOK = process.env.DISCORD_CHAT_WEBHOOK || ""; // Thay link webhook của bạn vào đây
var isDiscordChatEnabled = false; // Mặc định là TẮT

async function sendChatToDiscord(playerName, message) {
  if (!isDiscordChatEnabled) return; // Chỉ đẩy lên Discord khi lệnh !xemchat được bật
  if (!DISCORD_CHAT_WEBHOOK || DISCORD_CHAT_WEBHOOK === "YOUR_WEBHOOK_URL_HERE") return;
  try {
    await fetch(DISCORD_CHAT_WEBHOOK, {
      method: "POST",
      body: JSON.stringify({
        content: `**[${playerName}]**: ${message}`
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Lỗi gửi chat webhook: ", error);
  }
}

// 🎯 Khai báo sổ đen chứa án phạt Mute (lưu ở ngay trên hàm onPlayerChat)
const mutedPlayers = new Map();

// Global error handlers to prevent PM2 crashes
if (typeof process !== "undefined") {
  process.on("uncaughtException", function (err) {
    console.log("UNCAUGHT EXCEPTION:", err);
  });
  process.on("unhandledRejection", function (reason) {
    console.log("UNHANDLED REJECTION:", reason);
  });

  // Hàm dùng chung: Hoàn tiền + Flush cache trước khi thoát
  function gracefulShutdown(signal) {
    console.log(`[${signal}] Nhận lệnh tắt. Đang hoàn tiền và flush cache...`);

    // 1. Hoàn tiền cược chính
    if (typeof refundBets === "function") {
      refundBets("Server khởi động lại (PM2 Restart)");
    }

    // 2. Hoàn tiền kèo 1v1
    if (typeof activeDuels !== "undefined" && activeDuels.length > 0) {
      for (let duel of activeDuels) {
        let d1 = getPlayerData(duel.p1Auth);
        if (d1) { d1.coins += duel.amount; savePlayerData(duel.p1Auth, d1); }
        let d2 = getPlayerData(duel.p2Auth);
        if (d2) { d2.coins += duel.amount; savePlayerData(duel.p2Auth, d2); }
      }
      activeDuels = [];
    }

    // 3. FLUSH CACHE RAM XUỐNG Ổ CỨNG TRƯỚC KHI TẮT
    if (typeof playerCache !== "undefined" && typeof dirtyPlayers !== "undefined") {
      console.log(`[${signal}] Flushing ${dirtyPlayers.size} dirty players to disk...`);
      for (let auth of dirtyPlayers) {
        if (playerCache[auth]) {
          try {
            localStorage.setItem("pd_" + auth, JSON.stringify(playerCache[auth]));
          } catch(e) {
            console.error(`[${signal} Flush] Lỗi lưu auth:`, auth, e);
          }
        }
      }
      dirtyPlayers.clear();
    }
    if (typeof statsCache !== "undefined" && typeof dirtyStats !== "undefined") {
      console.log(`[${signal}] Flushing ${dirtyStats.size} dirty stats to disk...`);
      for (let auth of dirtyStats) {
        if (statsCache[auth]) {
          try {
            localStorage.setItem(auth, JSON.stringify(statsCache[auth]));
          } catch(e) {
            console.error(`[${signal} Flush Stats] Lỗi lưu stats:`, auth, e);
          }
        }
      }
      dirtyStats.clear();
      console.log(`[${signal}] Cache flush xong. An toàn thoát.`);
    }

    process.exit(0);
  }

  // 🚨 PM2 restart gửi SIGTERM (mặc định), Ctrl+C gửi SIGINT
  // Cần lắng nghe CẢ HAI để đảm bảo không bao giờ bị mất dữ liệu
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM")); // PM2 restart/stop
  process.on("SIGINT",  () => gracefulShutdown("SIGINT"));  // Ctrl+C
}

room.onPlayerChat = function (player, message) {
  if (player.id == 0) return;
  message = message.trim();
  if (!message) return false;

  // Gửi tin nhắn lên Discord Webhook
  sendChatToDiscord(player.name, message);

  clearAfkRecord(player.id); // Tránh bị kick AFK khi đang thao tác


  // =========================================================================
  // 🛑 HỆ THỐNG KIỂM TRA ÁN PHẠT MUTE (ĐỊNH DANH KÉP CHỐNG F5)
  // =========================================================================
  let playerKey = getAuth(player.id) || getConn(player.id) || player.id;

  if (mutedPlayers.has(playerKey)) {
    let expireTime = mutedPlayers.get(playerKey);
    if (Date.now() < expireTime) {
      let remainingMinutes = Math.ceil((expireTime - Date.now()) / 60000);
      room.sendAnnouncement(`🔇 Bạn đang bị KHÓA MÕM. Thời gian cấm chat còn lại: ${remainingMinutes} phút.`, player.id, 0xFF0000, "bold", 2);
      return false; // Chặn không cho tin nhắn hiển thị ra phòng
    } else {
      mutedPlayers.delete(playerKey); // Đã hết thời gian phạt, thả tự do
    }
  }

  // =========================================================================
  // 🛑 BỘ LỌC TỪ NGỮ CHỬI BẬY & AUTO-MUTE
  // =========================================================================
  let msg = message.toLowerCase();
  let wordsInMsg = msg.split(/[\s,.\?!]+/);
  let containsBadWord = wordsInMsg.some(word => {
    if (BAD_WORDS.includes(word)) return true;
    let normalizedWord = word.replace(/(.)\1+/g, '$1'); // Ép chữ "cccc" -> "c"
    if (BAD_WORDS.includes(normalizedWord)) return true;
    return false;
  });

  if (containsBadWord) {
    badWordCounts[player.id] = (badWordCounts[player.id] || 0) + 1;
    let count = badWordCounts[player.id];

    if (count > MAX_BAD_WORDS) {
      if (checkVip(player.id)) {
        room.sendAnnouncement(`👑 ĐẶC QUYỀN VIP: [${player.name}] đã vi phạm từ ngữ nhưng được MIỄN NHIỄM lệnh Mute!`, player.id, 0xFFD700, "bold", 2);
        badWordCounts[player.id] = 0; // Xóa án tích
        return false;
      }
      let auth = getAuth(player.id);
      let data = auth ? getPlayerData(auth) : null;

      // 👉 ĐÃ SỬA: KIỂM TRA THỜI GIAN KHIÊN KÍCH HOẠT THAY VÌ TRỪ KHIÊN TRONG KHO
      if (data && data.activeToys && data.activeToys.spam_shield) {
        if (Date.now() < data.activeToys.spam_shield) {
          // Khiên đang có hiệu lực (Trong 5 giây) -> Cứu!
          delete badWordCounts[player.id];
          room.sendAnnouncement(`🛡️ [KHIÊN KÍCH HOẠT] ${player.name} vừa được bảo vệ khỏi lệnh CẤM CHAT nhờ Spam Shield!`, null, 0x00FFFF, "bold", 2);
          return false;
        } else {
          // Khiên đã quá hạn 5 giây -> Xóa khỏi hệ thống
          delete data.activeToys.spam_shield;
        }
      }

      // Án phạt Mute nếu không có khiên hoặc khiên hết hạn
      mutedPlayers.set(playerKey, Date.now() + 10 * 60 * 1000);
      room.sendAnnouncement(`🔇 Hệ thống đã KHÓA MÕM [${player.name}] 10 phút vì chửi bậy quá ${MAX_BAD_WORDS} lần!`, null, 0xFF0000, "bold", 2);
      delete badWordCounts[player.id];
    } else {
      room.sendAnnouncement(`⚠️ CẢNH BÁO TỪ NGỮ [${count}/${MAX_BAD_WORDS}]: Vui lòng không sử dụng từ ngữ thô tục!`, player.id, 0xFFCC00, "bold", 2);
      if (count === MAX_BAD_WORDS) {
        room.sendAnnouncement(`🚨 ĐÂY LÀ CẢNH BÁO CUỐI CÙNG! Vi phạm thêm 1 lần nữa bạn sẽ bị CẤM CHAT 10 phút!`, player.id, 0xFF0000, "bold", 2);
      }
    }
    return false;
  }

  // Perform some validations on the message
  if (!message.startsWith("!") || COMMANDS_TO_VALIDATE.some(command => message.substring(1).startsWith(command))) {
    if (muteList.has(getConn(player.id))) {
      room.sendAnnouncement("Không thể chat, bạn đã bị cấm", player.id, RED);
      return false;
    };
    if (getRole(player) < ROLE.ADMIN) {
      if (isChatLocked) {
        room.sendAnnouncement("Khung chat hiện đang bị khóa", player.id, RED);
        return false;
      }
      // Disallow Spectators from messaging when 2 teams are taking penalty
      if (isTakingPenalty && (player.team == 0)) {
        room.sendAnnouncement("Bạn chưa thể chat vào lúc này", player.id, RED);
        return false;
      };
      // Sửa lại dòng này
      if ((getRole(player) < ROLE.ADMIN) && !checkVip(player.id) && checkSpam(player, message)) return false;
    };
  };
  // =========================================================================
  // 🎯 LỆNH ẨN DANH: CHỈ DÀNH CHO SUPER ADMIN
  // =========================================================================
  if (message.toLowerCase() === "!logout") {
    let currentAuth = getAuth(player.id);
    if (SUPER_ADMIN_AUTHS.includes(currentAuth)) {
      room.setPlayerAdmin(player.id, false);
      room.sendAnnouncement(`👋 nha vua [${player.name}] đã cởi bỏ hoàng bào và trở lại làm người thường!`, null, 0x00FF00, "bold", 2);
    } else {
      room.sendChat("❌ Lệnh này chỉ có nha vua da den mới có thể sử dụng!", player.id);
    }
    return false;
  }
  // =========================================================================
  // 💰 LỆNH RESET COINS: DÀNH CHO SUPER ADMIN
  // =========================================================================
  if (message.toLowerCase() === "!resetgems") {
    let currentAuth = getAuth(player.id);
    if (SUPER_ADMIN_AUTHS.includes(currentAuth)) {
      let count = 0;
      for (let i = 0; i < localStorage.length; i++) {
        let key = localStorage.key(i);
        if (key.startsWith("pd_")) {
          try {
            let data = JSON.parse(localStorage.getItem(key));
            if (data !== null && typeof data === 'object') {
              data.gems = 0;
              let auth = key.slice(3);
              savePlayerData(auth, data);
              count++;
            }
          } catch (e) {
            continue;
          }
        }
      }
      cachedTopList = null;
      cachedRankings = null;
      room.sendAnnouncement(`✅ Đã reset GEMS cho ${count} tài khoản về 0!`, player.id, 0x00FF00);
      if (typeof log === "function") log(`${player.name} đã chạy lệnh !resetgems cho ${count} tài khoản.`);
    } else {
      room.sendAnnouncement("❌ Lệnh này chỉ dành cho Super Admin!", player.id, 0xFF0000, "bold");
    }
    return false;
  }


  if (message.toLowerCase() === "!resetcoins") {
    let currentAuth = getAuth(player.id);
    if (SUPER_ADMIN_AUTHS.includes(currentAuth)) {
      let count = 0;
      // Duyệt qua toàn bộ localStorage để tìm data người chơi
      for (let i = 0; i < localStorage.length; i++) {
        let key = localStorage.key(i);

        // Dữ liệu shop/coins của bạn được lưu với tiền tố "pd_"
        if (key.startsWith("pd_")) {
          try {
            let data = JSON.parse(localStorage.getItem(key));
            // Kiểm tra chắc chắn là object và gán lại 500 coins
            if (data !== null && typeof data === 'object') {
              data.coins = 500;
              let auth = key.slice(3);
              savePlayerData(auth, data);
              count++;
            }
          } catch (e) {
            continue; // Bỏ qua nếu key bị lỗi định dạng
          }
        }
      }
      cachedTopList = null;
      cachedRankings = null;

      room.sendAnnouncement(`✅ Đại xá thiên hạ! Đã reset tiền của ${count} tài khoản về mức 500 Coins!`, null, 0x00FF00, "bold", 2);
      if (typeof log === "function") log(`${player.name} đã chạy lệnh !resetcoins cho ${count} tài khoản.`);
    } else {
      room.sendAnnouncement("❌ Lệnh này chỉ có nha vua da den mới có thể sử dụng!", player.id, 0xFF0000, "bold");
    }
    return false;
  }
  // 🛑 CHỐT CHẶN SAU 10 GIÂY DÀNH CHO AFK VÀ SPEC
  let msgLower = message.toLowerCase();
  if (msgLower === "!afk" || msgLower.startsWith("!afk ") || msgLower === "!spec") {
    let scores = room.getScores();

    // 👑 Tấm kim bài: Kiểm tra Super Admin
    let isSuperAdmin = (typeof getRole === "function" && getRole(player) >= ROLE.SUPER_ADMIN);

    // CHỈ CHẶN NẾU:
    // 1. Không phải Super Admin
    // 2. Trận đấu đang diễn ra (isPlaying)
    // 3. Đang trong map 5v5 hoặc Penalty
    // 4. Người chơi đang ở Team (Red/Blue)
    // 5. Trận đấu đã qua 10 giây đầu
    if (!isSuperAdmin && isPlaying && scores !== null && stadium.name && (stadium.name.includes("5v5") || stadium.name.includes("PEN") || stadium.name.includes("penalty")) && player.team !== 0) {

      // SỬA LỖI Ở ĐÂY: Dùng Math.floor để đảm bảo lấy số nguyên giây và kiểm tra an toàn
      if (Math.floor(scores.time) > 10) {
        room.sendAnnouncement("🚫 Trận đấu đã qua 10s đầu! Không thể dùng !afk hoặc !spec lúc này. Hãy nhờ đồng đội !sub.", player.id, 0xFF4444, "bold", 2);
        return false;
      }
    }
  }

  // =========================================================================
  // 🎯 BỘ XỬ LÝ TẤT CẢ CÁC LỆNH KHÁC (!help, !afk, !sub...) - KHÔNG ĐƯỢC XÓA
  // =========================================================================
  if (message.startsWith("!") && !handleCommand(player, message.slice(1))) {
    return false;
  };

  personalizeMsg(message, player);
  console.log(`${player.name}: ${message}`);
  log(`[${player.name}]: ${message}`);
  return false;
}

room.onPlayerActivity = function (player) {
  // 🛡️ MIỄN TỬ: Không bật Radar nếu đang ở map Training hoặc 1v1
  if (!isPlaying || player.team === 0 || (stadium && (stadium.name === "training" || stadium.name === "1v1"))) return;

  clearAfkRecord(player.id);

  // Ghi nhận tọa độ mới và reset lại đồng hồ 10 giây
  if (player.position) afkPositions[player.id] = { x: player.position.x, y: player.position.y };
  timeouts.toAct[player.id] = setTimeout(afkCallback.bind(null, player.id), ACTIVITY_TIMEOUT * 1000);
}
room.onPlayerKicked = function (kickedPlayer, reason, banned, byPlayer) {
  let action = "kicked";
  if (banned) {
    banList.push([kickedPlayer.id, kickedPlayer.name, reason]);
    action = "banned";
  };
  // Log this to monitor kicking activity
  console.log(`${kickedPlayer.name} was ${action} by ${byPlayer.name} (reason: ${reason})`);
  log(`${kickedPlayer.name} was ${action} by ${byPlayer.name} (Lý do: ${reason})`);
}

room.onTeamVictory = function (scores) {
  // Bỏ qua khi đang đá penalty shootout.
  if (typeof isTakingPenalty !== "undefined" && isTakingPenalty) return;

  // 🛡️ BỘ LỌC CHỐNG LÁCH LUẬT: Ghi nhớ toàn bộ cầu thủ ĐÃ THAM GIA trận đấu (Bao gồm cả người lách luật bằng !spec/thoát giữa chừng)
  if (typeof lastMatchAuths !== 'undefined') {
    lastMatchAuths.clear();
    if (typeof game !== 'undefined' && game && game.teams) {
      for (let t = 1; t <= 2; t++) {
        if (game.teams[t] && game.teams[t].players) {
          for (let auth in game.teams[t].players) {
            lastMatchAuths.add(auth);
          }
        }
      }
    } else {
      room.getPlayerList().filter(p => p.team !== 0).forEach(p => {
        let auth = getAuth(p.id);
        if (auth) lastMatchAuths.add(auth);
      });
    }
  }

  isPlaying = false;
  isGameOver = true; // <--- KHÓA BOT LẠI: Trận đấu đã an bài!
  prevScore = `${scores.red}-${scores.blue}`;
  handlePostGame((scores.red > scores.blue) ? 1 : 2);

  // --- XÉT DUYỆT & TRAO THƯỞNG THỬ THÁCH ---
  if (typeof currentChallenge !== "undefined" && currentChallenge && (typeof isTakingPenalty === "undefined" || !isTakingPenalty)) {
    let winners = [];

    // Quét toàn bộ người chơi có tham gia ghi bàn/kiến tạo
    for (let auth in challengeTracker) {
      let stats = challengeTracker[auth];

      // Nếu vượt qua bài kiểm tra của nhiệm vụ (Bao gồm cả Chiến công đầu đã sửa đổi)
      if (currentChallenge.check(stats)) {
        winners.push(stats.name);

        // Cộng Coins thưởng thử thách trận đấu
        let pData = getPlayerData(auth);
        if (pData) {
          pData.coins += currentChallenge.bonus;
          savePlayerData(auth, pData);

          // Ghi Log lên Discord nếu có hàm log
          if (typeof logCoinTransaction === "function") {
            logCoinTransaction(stats.name, auth, currentChallenge.bonus, `Hoàn thành thử thách: ${currentChallenge.name}`, pData.coins);
          }
        }
      }
    }

    // Thông báo kết quả thử thách công khai
    if (winners.length > 0) {
      room.sendAnnouncement(`🎉 CHÚC MỪNG: ${winners.join(", ")} đã hoàn thành Thử thách [${currentChallenge.name}] và nhận +${currentChallenge.bonus} Coins! 💰`, null, 0x00FF00, "bold", 2);
    } else {
      room.sendAnnouncement(`❌ Rất tiếc, trận này không có cầu thủ nào hoàn thành Thử thách [${currentChallenge.name}].`, null, 0xCCCCCC, "small", 1);
    }

    currentChallenge = null; // Đóng thử thách trận này
  }
}


room.onGameStart = function (byPlayer) {
  isGoalCelebration = false;

  silencedPlayers = {};
  invisUsesThisMatch = 0;
  giantExpirations = {};
  invisExpirations = {};
  xoacExpirations = {};
  injuredPlayers = {};
  lastPlayerDirection = {};

  // 🛑 KIỂM TRA ĐIỀU KIỆN: Chỉ kích hoạt ở Map 5v5 và không phải Penalty
  let isOfficialMap = typeof stadium !== "undefined" && stadium.name &&
    !stadium.name.includes("1v1") &&
    !stadium.name.includes("3v3") &&
    !stadium.name.includes("training");

  if (isOfficialMap && (typeof isTakingPenalty === "undefined" || !isTakingPenalty)) {
    // Kích hoạt Thử Thách ngẫu nhiên
    currentChallenge = MATCH_CHALLENGES[Math.floor(Math.random() * MATCH_CHALLENGES.length)];
    challengeTracker = {}; // Làm sạch bộ nhớ tiến độ

    // Thông báo Delay 1 chút để mọi người vào sân kịp đọc
    setTimeout(() => {
      room.sendAnnouncement(`🏆 THỬ THÁCH TRẬN ĐẤU: ${currentChallenge.name} 🏆\n📜 Nhiệm vụ: ${currentChallenge.desc}\n💰 Phần thưởng: +${currentChallenge.bonus} Coins cho ai hoàn thành!`, null, 0xFFD700, "bold", 2);
    }, 2000);
  } else {
    currentChallenge = null; // Tắt thử thách nếu map không hợp lệ
  }
  isBettingClosedEarly = false;
  isPlaying = true;
  isGameOver = false;
  surrenderedTeam = 0; // Đặt lại = 0 khi bắt đầu ván mới
  // 🛡️ FIX: Chỉ reset flag khi KHÔNG phải penalty — tránh handlePostGame chạy nhiều lần
  if (!isTakingPenalty) postGameHandled = false;
  clearTimeout(timeouts.toResume);
  pausedBy = 0;

  resizePlayers();
  if (isTakingPenalty) return;
  reset();
  setRandomColors();
  trackAfk();
  startOddsUpdater();
  generateSpecialOdds();
  generateHandicap(); // <--- TẠO KÈO CHẤP NGAY KHI BẮT ĐẦU VÁN
  if (DISCORD_WEBHOOK && SAVE_RECORDINGS) room.startRecording();
  room.sendChat(`Quý vị khán giả có ${PREDICTION_PERIOD} giây để dự đoán tỉ số với !predict và có cơ hội nhận 1 suất đá chính.`);

  // 🎯 Thêm thông báo cá cược riêng cho map 5v5
  if (typeof stadium !== "undefined" && stadium.name && stadium.name.includes("5v5")) {
    room.sendAnnouncement(
      `💸 HỆ THỐNG BET BỦNG ĐÃ MỞ! Dùng !bet <loại> <chọn> <tiền> để đặt cược (${PREDICTION_PERIOD}s đầu, khi 0-0). Xem bảng kèo: !bet list`,
      null,
      YELLOW,
      "bold",
      2
    );
  }

  let players = getNonAfkPlayers();
  if (players.length >= 8) {
    let points = [0, 0];
    for (const player of players) {
      if (player.team == 0) continue;
      points[player.team - 1] += (getStats(getAuth(player.id)).wins || 0);
    };
    let red_chance = ~~((50 + points[0]) / (100 + points[0] + points[1]) * 100);
    setTimeout(
      room.sendAnnouncement.bind(
        null,
        `Máy tính dự đoán tỉ lệ thắng: ${red_chance}% ${"🟥".repeat(Math.round(red_chance / 10))}${"🟦".repeat(10 - Math.round(red_chance / 10))} ${100 - red_chance}%`,
        null,
        YELLOW,
        "small",
        0
      ),
      3000,
    );
  };
}

room.onGameStop = async function (byPlayer) {
  isGoalCelebration = false;
  isPlaying = false;
  isGameOver = true; // <--- CHỐT CHẶN: Game đã dừng hoàn toàn
  clearAfkRecords();
  cleanupEffectDiscs(); // <--- THÊM DÒNG NÀY VÀO ĐÂY

  clearTimeout(timeouts.toResume);

  // Nếu Admin chủ động bấm Stop bằng tay thì hủy ghi hình và dừng
  if ((byPlayer !== null) && (byPlayer.id != 0)) {
    room.sendChat("Trận đấu đã bị hủy bỏ bởi Admin");
    refundBets("Admin dừng trận đấu");
    room.stopRecording();
    postGameHandled = false;
    return; // Đã xóa dòng midGamePick.active thừa ở đây vì đã dọn dẹp ở trên
  };

  if (isTakingPenalty) return;

  // Đợi một chút để mọi người nhìn kết quả
  await new Promise(r => setTimeout(r, AFTER_GAME_REST * 1000));

  if (room.getScores() !== null) return;

  randPlayers();
}


room.onGamePause = function (byPlayer) {
  isPlaying = false;
  clearAfkRecords(); // Stop monitoring AFK when the game is paused
}

room.onGameUnpause = function (byPlayer) {
  isPlaying = true;
  canPause = false;
  pausedBy = 0;
}

room.onTeamsLockChange = function (locked, byPlayer) {
  // 🎯 MỞ KHÓA TỰ DO: Không ép khóa Team nếu đang ở map Training hoặc phòng chỉ có 1 người
  let activeCount = room.getPlayerList().filter(p => !afkList.has(p.id)).length;
  let isFreeMode = (stadium && stadium.name === "training") || activeCount <= 1;

  if (!isFreeMode && !locked) {
    room.setTeamsLock(true); // Chỉ khóa lại khi bắt đầu đá giải
  }
};



// Tích hợp Discord Bot
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || ""; // Thay Token Bot của bạn vào đây
const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID || ""; // Thay ID kênh Discord vào đây

try {
  if (typeof process !== "undefined") {
    const { Client, GatewayIntentBits } = require('discord.js');
    const discordClient = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
    });

    discordClient.on('messageCreate', message => {
      if (message.author.bot) return; // Bỏ qua tin nhắn của bot
      if (message.channelId === DISCORD_CHANNEL_ID) {
        const text = message.content.trim().toLowerCase();
        if (text === '!xemchat') {
          isDiscordChatEnabled = true;
          message.reply('✅ Đã BẬT theo dõi chat: Tin nhắn trong game sẽ được chuyển tiếp lên đây!');
          return;
        }
        if (text === '!tatchat') {
          isDiscordChatEnabled = false;
          message.reply('🚫 Đã TẮT theo dõi chat: Dừng nhận tin nhắn từ game.');
          return;
        }

        if (typeof room !== 'undefined' && room.sendChat) {
          // Đẩy tin nhắn vào Haxball
          room.sendAnnouncement(`[ADMIN]: ${message.content}`, null, 0xFFD700, "bold", 2);
        }
      }
    });

    if (DISCORD_BOT_TOKEN && DISCORD_BOT_TOKEN !== "YOUR_BOT_TOKEN_HERE") {
      discordClient.login(DISCORD_BOT_TOKEN).then(() => {
        console.log("✅ Đã kết nối Discord Bot (Nhận tin nhắn) thành công!");
      }).catch(err => {
        console.error("❌ Lỗi đăng nhập Discord Bot:", err);
      });
    }
  }
} catch (e) {
  console.log("⚠️ Bạn chưa cài discord.js, hãy mở CMD chạy lệnh: npm install discord.js");
}
}

initHaxballBot().catch(err => {
  console.error("Lỗi khi khởi tạo HaxballJS:", err);
});
