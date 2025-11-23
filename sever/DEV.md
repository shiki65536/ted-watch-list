# TED Manager - 完整 MERN Stack 應用

## 📋 專案概述

一個功能完整的 TED 影片管理系統，支援：
- ✅ TED、TED-Ed、TEDx 三個頻道
- ✅ 影片排序（最新/熱門）
- ✅ 收藏功能
- ✅ 已看過標記
- ✅ Bucket 清單（排除已看過的影片）
- ✅ RWD 響應式設計
- ✅ 用戶認證系統
- ✅ YouTube API 整合

## 🚀 快速開始

### 1. 前置需求

- Node.js >= 18.0.0
- MongoDB（本地或 MongoDB Atlas）
- YouTube Data API Key

### 2. 後端設定

```bash
# 進入後端目錄
cd ted-manager-backend

# 安裝依賴
npm install

# 設定環境變數
cp .env.example .env
# 編輯 .env 填入實際資料

# 啟動開發伺服器
npm run dev
```

### 3. 前端設定

```bash
# 進入前端目錄
cd ted-manager-frontend

# 安裝依賴
npm install

# 啟動開發伺服器
npm start
```

瀏覽器會自動開啟 http://localhost:3000

## 🔑 獲取 YouTube API Key

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 建立新專案或選擇現有專案
3. 啟用 "YouTube Data API v3"
4. 建立憑證 → API 金鑰
5. 將金鑰複製到 `.env` 的 `YOUTUBE_API_KEY`

**注意**：免費配額為每日 10,000 單位

## 📊 MongoDB 設定

### 選項 1：MongoDB Atlas（推薦）

1. 註冊 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. 建立免費叢集（Free Tier: 512MB）
3. 設定網路存取 (Network Access)：允許所有 IP (0.0.0.0/0)
4. 建立資料庫用戶
5. 取得連接字串，填入 `.env`

### 選項 2：本地 MongoDB

```bash
# macOS
brew install mongodb-community
brew services start mongodb-community

# Windows
# 下載並安裝 MongoDB Community Edition

# Linux
sudo apt-get install mongodb
sudo systemctl start mongodb
```

連接字串：`mongodb://localhost:27017/ted-manager`

## 🌐 部署指南

### 後端部署（Railway）

1. 註冊 [Railway.app](https://railway.app/)
2. 連接 GitHub Repository
3. 設定環境變數（與 .env 相同）
4. 自動部署

### 前端部署（Vercel）

```bash
# 安裝 Vercel CLI
npm i -g vercel

# 部署
cd ted-manager-frontend
vercel

# 設定環境變數
vercel env add REACT_APP_API_URL
# 輸入後端 API URL（例如：https://your-api.railway.app/api）

# 正式部署
vercel --prod
```

### 替代方案：Netlify

```bash
# 安裝 Netlify CLI
npm i -g netlify-cli

# 部署
cd ted-manager-frontend
netlify deploy --prod

# 在 Netlify Dashboard 設定環境變數
```

## 📱 功能說明

### 用戶認證
- 註冊/登入系統
- JWT Token 認證
- 密碼加密儲存

### 影片管理
- **最新影片**：依發布日期排序
- **熱門影片**：依觀看次數排序
- **Bucket**：排除已看過的熱門影片
- **我的收藏**：收藏的影片列表
- **已看過**：已標記的影片（可還原）

### 頻道選擇
- TED 官方演講
- TED-Ed 教育影片
- TEDx 獨立活動

## 🔧 API 端點

### 認證
- `POST /api/auth/register` - 註冊
- `POST /api/auth/login` - 登入
- `GET /api/auth/me` - 獲取當前用戶

### 影片
- `GET /api/videos/:channel` - 獲取影片列表
- `POST /api/videos/refresh` - 更新影片（管理員）

### 用戶操作
- `GET /api/user/favourites` - 獲取收藏
- `POST /api/user/favourites` - 新增收藏
- `DELETE /api/user/favourites/:id` - 移除收藏
- `GET /api/user/watched` - 獲取已看過
- `POST /api/user/watched` - 標記已看過
- `DELETE /api/user/watched/:id` - 移除標記
- `GET /api/user/bucket` - 獲取 Bucket

## 🎨 技術棧

### 前端
- React 18
- Tailwind CSS
- Lucide React Icons
- Context API (狀態管理)

### 後端
- Node.js + Express
- MongoDB + Mongoose
- JWT 認證
- YouTube Data API v3
- Node-cron (定時任務)

## 🔒 安全性

- ✅ 密碼 bcrypt 加密
- ✅ JWT Token 認證
- ✅ Helmet.js 安全標頭
- ✅ Rate Limiting
- ✅ CORS 設定
- ✅ 環境變數保護

## 📈 效能優化

- 影片資料快取（減少 API 呼叫）
- 定時更新（每 6 小時）
- MongoDB 索引優化
- 前端 RWD 響應式設計
- 圖片延遲載入

## 🐛 故障排除

### 後端無法連接 MongoDB
```bash
# 檢查 MongoDB 是否運行
mongosh

# 檢查連接字串格式
mongodb+srv://username:password@cluster.mongodb.net/database
```

### YouTube API 配額超限
- 每日配額：10,000 單位
- 減少更新頻率
- 使用快取資料

### CORS 錯誤
確保後端 `.env` 中的 `CLIENT_URL` 正確設定

## 📝 待辦事項

- [ ] 影片播放功能
- [ ] 搜尋功能
- [ ] 標籤篩選
- [ ] 匯出/匯入收藏清單
- [ ] 社交分享
- [ ] PWA 支援
- [ ] 深色/淺色主題切換

## 📄 授權

MIT License

## 🤝 貢獻

歡迎提交 Pull Requests！

## 📧 聯絡

有任何問題請開 Issue