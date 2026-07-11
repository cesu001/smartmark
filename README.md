# Smark

🚀 **AI 驅動的 Markdown 智能筆記與知識庫**

Smark（原 SmartMark）是一個結合 AI 的筆記編輯環境，能自動分類筆記，並透過語意關聯快速找出你需要的知識。支援 Markdown 即時渲染、資料夾與標籤分類、語意搜尋，以及可對話的 AI 助理。

---

## ✨ 核心功能

- **筆記與編輯系統**：所見即所得的 Markdown 編輯器（Tiptap），支援新增、編輯、儲存，並有 1 秒防抖動自動儲存。
- **組織與管理**：Collection（資料夾）分類、Tag 標籤、最愛（Favorite）與釘選（Pin）。
- **匯入 / 匯出**：支援匯入既有 `.md` / `.txt` 檔案，或將筆記匯出為 `.md`。
- **AI 賦能（Pro 專屬）**：
  - **語意關聯搜尋**：透過向量嵌入（Embeddings）比對，輸入自然語言即可找出高度相關的筆記。
  - **AI 摘要**：一鍵為筆記內容產生摘要，可複製或插入編輯器。
  - **AI Chatbot**：可對話的助理，能根據你的筆記內容回答問題，也能回答如何使用 Smark 本身。
- **會員與權限系統**：Email/密碼與 GitHub OAuth 登入、忘記密碼流程、依方案限制功能存取。
- **個人資料**：大頭貼上傳（Cloudflare R2）、修改顯示名稱、修改密碼、刪除帳號。

---

## 🧱 技術棧

| 類別               | 技術選擇                                                  |
| :----------------- | :---------------------------------------------------------- |
| **Framework**      | Next.js 16 (App Router)                                     |
| **UI**             | React 19、Tailwind CSS v4、shadcn/ui、Tiptap 編輯器          |
| **Database**       | PostgreSQL（Neon，啟用 `pgvector` 擴充支援向量檢索）          |
| **ORM**            | Prisma 7                                                     |
| **Auth**           | NextAuth v4（Credentials + GitHub OAuth）                    |
| **AI**             | Vercel AI SDK（`ai`、`@ai-sdk/openai`）＋ OpenAI API          |
| **檔案儲存**       | Cloudflare R2（大頭貼上傳）                                   |
| **Email**          | Resend                                                       |
| **Rate Limiting**  | Upstash Redis（`@upstash/ratelimit`）                        |
| **測試**           | Vitest                                                       |

---

## 🚀 開始使用

### 1. 安裝套件

```bash
npm install
```

### 2. 設定環境變數

複製 `.env.example` 為 `.env`，並依照下表填入對應的值：

| 變數 | 說明 |
| :--- | :--- |
| `DATABASE_URL` | Neon PostgreSQL 連線字串（pooled connection，執行期使用） |
| `DIRECT_URL` | Neon PostgreSQL 直連字串（Prisma CLI migration 使用） |
| `NEXT_PUBLIC_APP_URL` | 應用程式網址（本機開發為 `http://localhost:3000`） |
| `NEXTAUTH_SECRET` | NextAuth 加密金鑰，可用 `openssl rand -base64 32` 產生 |
| `RESEND_API_KEY` | [Resend](https://resend.com/api-keys) API 金鑰，用於寄送忘記密碼信件 |
| `GITHUB_ID` / `GITHUB_SECRET` | [GitHub OAuth App](https://github.com/settings/developers) 憑證 |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | [Upstash Redis](https://console.upstash.com)，用於登入/註冊等 API 的流量限制 |
| `R2_ACCOUNT_ID` / `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` / `R2_BUCKET_NAME` / `R2_PUBLIC_URL` | [Cloudflare R2](https://dash.cloudflare.com)，用於大頭貼圖片上傳 |
| `OPENAI_API_KEY` | OpenAI API 金鑰，用於 AI 摘要、語意搜尋與 Chatbot |

### 3. 設定資料庫

本專案使用 PostgreSQL（Neon）並啟用 `pgvector` 擴充功能來儲存筆記的向量嵌入資料。

```bash
# 執行資料庫遷移
npx prisma migrate dev

# （選用）灌入示範資料
npx prisma db seed
```

### 4. 啟動開發伺服器

```bash
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000) 即可看到結果。

---

## 📜 常用指令

```bash
npm run dev        # 啟動開發伺服器
npm run build      # 產生 Prisma Client 並建置正式版本
npm run start       # 啟動正式版伺服器
npm run lint        # 執行 ESLint
npm run test         # 執行 Vitest 單元測試
npm run test:watch  # 以 watch 模式執行測試
npm run test:db     # 測試資料庫連線
npm run test:seed   # 檢視已灌入的示範資料
```

---

## 🗄️ 資料庫模型

主要資料表包含 `User`、`Note`、`Collection`、`Tag`、`NoteTag`，以及 NextAuth 所需的 `Account`、`Session`、`VerificationToken`。`Note` 另有 `embedding vector(1536)` 欄位（採用 OpenAI `text-embedding-3-small` 模型），並建立 HNSW 索引以支援高效的語意搜尋。

完整 schema 定義請見 [prisma/schema.prisma](prisma/schema.prisma)。

---

## 📁 專案結構

```
src/
├── app/                # Next.js App Router 頁面與 API 路由
├── components/         # React 元件（依功能分類）
├── lib/
│   ├── db/              # 資料庫存取邏輯（依 model 分檔）
│   └── ai/               # AI 相關邏輯（embedding、摘要、對話）
├── actions/            # Server Actions
└── types/               # TypeScript 型別定義

context/                 # 專案規格與 AI 協作相關文件
prisma/                  # Schema、migrations、seed script
```

---

## 📖 進一步了解

更完整的專案規格、資料庫模型、UI/UX 設計、系統架構與開發藍圖，請參閱 [context/project-overview.md](context/project-overview.md)。

若想了解 Next.js 本身，可參考：

- [Next.js 官方文件](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
