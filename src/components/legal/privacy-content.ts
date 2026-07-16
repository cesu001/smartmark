// Bilingual privacy policy content, rendered via react-markdown on /privacy.
// Source of truth: docs/privacy-policy-draft.md. Keep this file in sync with it.

export const LAST_UPDATED = "2026-07-16";

export const PRIVACY_ZH = `
Smark（「本服務」，網站 \`smark.tw\`）是一款結合 AI 的 Markdown 智慧筆記與知識庫。本隱私權政策說明我們收集哪些個人資料、如何使用、與哪些第三方分享，以及您就個人資料所享有的權利。

## 1. 我們是誰（資料控管者）

- **服務名稱：** Smark（\`smark.tw\`）
- **經營者／資料控管者：** Mike Su
- **聯絡方式（隱私相關請求）：** michaelsu101@gmail.com

## 2. 我們收集的個人資料

### 2.1 帳號與身分資料

- 姓名（選填，註冊時可為空白）
- 電子郵件地址
- 密碼（以 bcrypt 雜湊儲存，**我們絕不儲存或記錄明文密碼**）
- 大頭貼圖片（您上傳的圖片，或使用 GitHub 登入時的頭像網址）
- 帳號建立與更新時間、方案狀態（免費／Pro）

### 2.2 第三方登入（GitHub OAuth）

當您選擇以 GitHub 登入時，我們會透過 GitHub 取得授權權杖（access token 等）與您的基本個人資料（例如電子郵件），用以建立與維持您的帳號。

### 2.3 您建立的內容

- 筆記標題與 Markdown 內容
- 為支援 AI 語意搜尋而產生的**內容向量（embeddings）**（透過 OpenAI 產生）
- 資料夾（Collections）與標籤（Tags）名稱
- 最愛與釘選狀態

> **敏感資料提醒：** 筆記為自由輸入欄位，您可自行輸入任何內容。本服務並非設計用於儲存特種或敏感個人資料（如健康、財務、他人個資或憑證）。您須自行為所儲存的內容負責。

### 2.4 工作階段與安全性資料

- 登入工作階段權杖（Session）
- 密碼重設權杖（一小時後失效、單次使用）
- **IP 位址與電子郵件**：用於登入、註冊、密碼重設及 AI 功能的濫用防護與流量限制（rate limiting），儲存於 Upstash Redis，且僅短暫保存。

### 2.5 自動收集的資料

- **IP 位址**：每次連線本質上會被我們的主機（Vercel）及流量限制服務接收。
- **廣告相關資料**：在**公開頁面**上，Google AdSense 會使用 Cookie／識別碼以提供及個人化廣告（見第 4、6 節）。登入後的儀表板（Dashboard）**不顯示廣告**。

## 3. 我們如何使用您的資料與法律依據

| 目的 | 說明 | 法律依據（GDPR） |
|---|---|---|
| 提供服務 | 建立帳號、儲存與同步筆記／資料夾／標籤 | 履行契約 |
| AI 功能 | 將筆記內容傳送給 OpenAI 以產生向量、摘要與聊天機器人回覆 | 履行契約／同意 |
| 安全與濫用防護 | 以 IP／Email 進行流量限制 | 正當利益 |
| 電子郵件通知 | 透過 Resend 寄送密碼重設信 | 履行契約 |
| 廣告 | 於公開頁面顯示 Google AdSense 廣告 | 同意（歐盟／英國訪客） |

## 4. Cookie 與追蹤技術

- **必要 Cookie：** 用於維持登入狀態的工作階段 Cookie。
- **廣告 Cookie：** Google AdSense 於**公開頁面**設定，用於廣告提供與個人化。
- 本服務**未使用**任何第三方分析工具（如 Google Analytics、PostHog、Sentry 等）。
- 對於歐盟／歐洲經濟區／英國訪客，廣告 Cookie 屬非必要性 Cookie，我們會依法於使用前徵求您的同意。您亦可透過瀏覽器設定管理 Cookie。

## 5. 我們與誰分享資料（受託處理者）

我們不販售您的個人資料。為提供服務，我們會將必要資料交由下列第三方處理：

| 服務商 | 用途 | 接收的資料 |
|---|---|---|
| Vercel | 網站主機／CDN | 連線請求、IP、Cookie |
| Neon | PostgreSQL 資料庫 | 全部帳號與筆記資料 |
| **OpenAI** | AI 向量、摘要、聊天機器人 | **筆記內容與聊天訊息** |
| Cloudflare R2 | 大頭貼圖片儲存 | 您上傳的圖片 |
| Resend | 交易郵件（密碼重設） | 收件人電子郵件 |
| Upstash | Redis 流量限制 | IP 位址、電子郵件 |
| GitHub | OAuth 登入 | 登入驗證與基本個人資料 |
| Google AdSense | 廣告（僅公開頁面） | IP、Cookie、廣告識別碼 |

> **關於 AI 處理：** 使用 AI 搜尋、摘要或聊天機器人功能時，相關筆記內容或訊息會傳送至 OpenAI 進行處理。依 OpenAI 的 API 使用條款，透過 API 傳送的資料預設不會用於訓練其模型；OpenAI 可能為提供服務及濫用偵測目的，將輸入與輸出最多保存 30 天。

## 6. 國際傳輸

上述部分服務商位於美國或其他國家，因此您的資料可能被傳輸至台灣以外地區處理。我們透過與各服務商簽署之資料處理協議，以及適用時之標準契約條款（SCC）等適當保護措施，保障傳輸安全。

## 7. 資料保存期間

- 帳號與筆記資料：保存至您刪除該資料或關閉帳號為止。
- 密碼重設權杖：一小時後失效。
- 流量限制資料（IP／Email）：於 Redis 時間窗內短暫保存後即失效。

## 8. 您的權利

您就個人資料享有下列權利（依台灣個資法及 GDPR）：

- **查詢與閱覽**您的個人資料
- **更正**不正確的資料（可於個人資料頁自行修改姓名、大頭貼、密碼）
- **刪除**：於個人資料頁使用「刪除帳號」，將連動刪除您的所有筆記、資料夾、標籤、工作階段及大頭貼圖片
- **資料可攜**：您可將筆記匯出為 \`.md\` 檔案
- **反對或限制處理**、**撤回同意**
- 向主管機關**申訴**的權利

如需行使上述權利，請聯絡：michaelsu101@gmail.com。

## 9. 資料安全

我們採取合理的技術與組織措施保護您的資料，包括：密碼以 bcrypt 雜湊儲存、全程 HTTPS 傳輸、存取控制，以及對驗證端點的流量限制與濫用防護。

## 10. 兒童隱私

本服務非以兒童為對象。未滿 13 歲之兒童不得使用本服務。

## 11. 付款資料

目前 Pro 方案為免費提供，本服務**不收集任何付款資料**。未來若導入付款功能，將更新本政策以說明相關付款處理者（如 PayPal）之資料處理方式。

## 12. 政策變更

我們可能不定期更新本政策。重大變更將於本頁公告並更新「最後更新日期」。

## 13. 準據法與聯絡方式

本政策之解釋與適用以中華民國（台灣）法律為準據法。任何隱私相關疑問，請聯絡：michaelsu101@gmail.com。
`.trim();

export const PRIVACY_EN = `
Smark ("the Service", \`smark.tw\`) is an AI-powered Markdown note-taking and knowledge base. This Privacy Policy explains what personal data we collect, how we use it, who we share it with, and the rights you have over your personal data.

## 1. Who we are (Data Controller)

- **Service:** Smark (\`smark.tw\`)
- **Operator / Data Controller:** Mike Su
- **Contact (privacy requests):** michaelsu101@gmail.com

## 2. Personal data we collect

### 2.1 Account & identity

- Name (optional; may be blank at registration)
- Email address
- Password (**stored bcrypt-hashed; we never store or log plaintext passwords**)
- Avatar image (your uploaded image, or your GitHub avatar URL if you sign in with GitHub)
- Account creation/update timestamps and plan status (Free / Pro)

### 2.2 Third-party sign-in (GitHub OAuth)

If you sign in with GitHub, we receive authorization tokens (access token, etc.) and basic profile data (such as your email) from GitHub to create and maintain your account.

### 2.3 Content you create

- Note titles and Markdown content
- **Embeddings** of note content, generated via OpenAI to power semantic search
- Collection (folder) and Tag names
- Favorite/pinned states

> **Sensitive-data notice:** Notes are free-text fields — you can enter anything. The Service is not intended for storing special-category or sensitive personal data (e.g. health, financial, other people's personal data, or credentials). You are responsible for the content you store.

### 2.4 Session & security data

- Login session tokens
- Password reset tokens (expire after one hour, single-use)
- **IP address and email**, used for rate limiting and abuse prevention on login, registration, password reset, and AI endpoints; stored transiently in Upstash Redis.

### 2.5 Automatically collected data

- **IP address**, inherently received by our host (Vercel) and rate-limiting service.
- **Advertising data**: on **public pages**, Google AdSense uses cookies/identifiers to serve and personalize ads (see §4 and §6). The signed-in dashboard shows **no ads**.

## 3. How we use your data & legal basis

| Purpose | Detail | Legal basis (GDPR) |
|---|---|---|
| Provide the Service | Account, storing/syncing notes/collections/tags | Contract |
| AI features | Sending note content to OpenAI for embeddings, summaries, chatbot | Contract / Consent |
| Security & abuse prevention | Rate limiting via IP/email | Legitimate interest |
| Email delivery | Password-reset emails via Resend | Contract |
| Advertising | Google AdSense ads on public pages | Consent (EEA/UK visitors) |

## 4. Cookies & tracking

- **Necessary cookies:** session cookie to keep you signed in.
- **Advertising cookies:** set by Google AdSense on **public pages** for ad serving and personalization.
- We use **no** third-party analytics (no Google Analytics, PostHog, Sentry, etc.).
- For EEA/EU/UK visitors, advertising cookies are non-essential and we seek your consent before they are used, as required by law. You can also manage cookies through your browser settings.

## 5. Who we share data with (sub-processors)

We do not sell your personal data. To operate the Service, we share necessary data with the following third parties:

| Provider | Purpose | Data received |
|---|---|---|
| Vercel | Hosting / CDN | Requests, IP, cookies |
| Neon | PostgreSQL database | All account & note data |
| **OpenAI** | AI embeddings, summaries, chatbot | **Note content & chat messages** |
| Cloudflare R2 | Avatar image storage | Uploaded images |
| Resend | Transactional email (password reset) | Recipient email |
| Upstash | Redis rate limiting | IP address, email |
| GitHub | OAuth sign-in | Auth handshake & basic profile |
| Google AdSense | Advertising (public pages only) | IP, cookies, ad identifiers |

> **On AI processing:** When you use AI search, summaries, or the chatbot, the relevant note content or messages are sent to OpenAI for processing. Under OpenAI's API terms, data submitted via the API is not used to train its models by default; OpenAI may retain API inputs and outputs for up to 30 days to provide the service and detect abuse.

## 6. International transfers

Some providers above are located in the US or other countries, so your data may be transferred and processed outside Taiwan. We rely on appropriate safeguards such as data processing agreements with these providers and, where applicable, Standard Contractual Clauses (SCCs).

## 7. Data retention

- Account and note data: retained until you delete it or close your account.
- Password reset tokens: expire after one hour.
- Rate-limiting data (IP/email): retained only transiently within the Redis window.

## 8. Your rights

Under the Taiwan PDPA and the GDPR, you have the right to:

- **Access** your personal data
- **Rectify** inaccurate data (edit name, avatar, password in your profile)
- **Erase**: "Delete Account" in your profile cascade-deletes all your notes, collections, tags, sessions, and avatar image
- **Data portability**: export your notes as \`.md\` files
- **Object to / restrict** processing, and **withdraw consent**
- **Lodge a complaint** with a supervisory authority

To exercise these rights, contact: michaelsu101@gmail.com.

## 9. Data security

We apply reasonable technical and organizational measures, including bcrypt password hashing, HTTPS in transit, access controls, and rate limiting/abuse prevention on authentication endpoints.

## 10. Children's privacy

The Service is not directed at children. It may not be used by children under 13.

## 11. Payment data

The Pro plan is currently offered free of charge, and the Service **collects no payment data**. If payment features are added in future, this policy will be updated to describe the relevant payment processor (e.g. PayPal).

## 12. Changes to this policy

We may update this policy from time to time. Material changes will be posted on this page with an updated "Last updated" date.

## 13. Governing law & contact

This policy is governed by the laws of Taiwan (R.O.C.). For any privacy questions, contact: michaelsu101@gmail.com.
`.trim();
