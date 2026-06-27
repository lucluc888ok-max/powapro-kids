# パワプロ風バスケ成長管理アプリ — CLAUDE.md

## プロジェクト概要

子供の日々のバスケ練習をパワプロUIでステータス化する完全個人用Webアプリ。
親が毎日練習内容を承認し、ステータスを積み上げる。

---

## インフラ構成

```
GitHub
├── /frontend   → Vercel（React + TypeScript + Vite）
└── /backend    → Railway（Express + Prisma + PostgreSQL）
```

- フロント環境変数: `VITE_API_URL`
- バック環境変数: `DATABASE_URL` / `PARENT_PASSWORD` / `JWT_SECRET`

---

## 技術スタック

### フロントエンド
- React + TypeScript + Vite
- Tailwind CSS
- Zustand（状態管理）
- React Query（APIフェッチ）

### バックエンド
- Express + TypeScript
- Prisma ORM + PostgreSQL（Railway）
- bcrypt（パスワードハッシュ）
- jsonwebtoken（親セッション）

---

## ディレクトリ構成

```
powapro-kids/
├── CLAUDE.md
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx          # 選手カード（メイン画面）
│   │   │   ├── Training.tsx      # 練習入力
│   │   │   ├── ParentApproval.tsx# 親承認
│   │   │   ├── Skills.tsx        # スキル管理
│   │   │   ├── History.tsx       # 履歴
│   │   │   └── Settings.tsx      # 設定
│   │   ├── components/
│   │   │   ├── PlayerCard.tsx    # パワプロ風選手カード本体
│   │   │   ├── StatRow.tsx       # ステータス行
│   │   │   ├── SkillBadge.tsx    # スキルバッジ（通常/金枠）
│   │   │   └── RankLabel.tsx     # ランク文字（B/A/S等）
│   │   └── lib/
│   │       ├── api.ts            # APIクライアント
│   │       └── rankCalc.ts       # ランク計算
└── backend/
    └── src/
        ├── routes/
        │   ├── player.ts
        │   ├── training.ts
        │   ├── approval.ts
        │   ├── skills.ts
        │   └── history.ts
        ├── middleware/parentAuth.ts
        └── prisma/schema.prisma
```

---

## データベーススキーマ（Prisma）

```prisma
model Player {
  id            Int      @id @default(autoincrement())
  // プロフィール
  name          String
  number        Int
  position      String   // ポジション（ガード/フォワード/センター）
  playStyle     String   // プレースタイル（ドリブラー/シューター等）
  height        Float    // 身長（cm）
  weight        Float    // 体重（kg）
  // 成績（手動更新）
  gamesPlayed   Int      @default(0)
  totalPoints   Int      @default(0)
  totalAssists  Int      @default(0)
  // ステータス（0〜999）
  handling      Int      @default(0)  // ハンドリング
  physical      Int      @default(0)  // フィジカル
  speed         Int      @default(0)  // スピード
  shooting      Int      @default(0)  // シュート
  defense       Int      @default(0)  // ディフェンス
  passing       Int      @default(0)  // パス
  mental        Int      @default(0)  // メンタル

  trainingLogs  TrainingLog[]
  skills        Skill[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model TrainingLog {
  id          Int      @id @default(autoincrement())
  playerId    Int
  player      Player   @relation(fields: [playerId], references: [id])
  date        DateTime
  menus       Json     // 実施した練習メニューのリスト
  approved    Boolean  @default(false)
  approvedAt  DateTime?
  statsDelta  Json     // 加算差分 例: {"handling": 2, "speed": 1}
  createdAt   DateTime @default(now())
}

model Skill {
  id          Int      @id @default(autoincrement())
  playerId    Int
  player      Player   @relation(fields: [playerId], references: [id])
  name        String
  isGold      Boolean  @default(false)  // 金枠かどうか
  certifiedAt DateTime @default(now())
}

model TrainingMenu {
  id          Int      @id @default(autoincrement())
  name        String
  description String?
  targetStat  String   // handling/physical/speed/shooting/defense/passing/mental
  deltaValue  Int      @default(1)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
}
```

---

## ステータス設計

### 7項目
| 項目 | キー | 説明 |
|------|------|------|
| ハンドリング | handling | ボール操作全般 |
| フィジカル | physical | 体の強さ・当たり負け |
| スピード | speed | 速さ・俊敏性 |
| シュート | shooting | 得点力 |
| ディフェンス | defense | 守りの総合力 |
| パス | passing | キャッチ・配球 |
| メンタル | mental | 試合での粘り・集中力 |

### ランク閾値
```
0〜29   → F
30〜59  → E
60〜99  → D
100〜149 → C
150〜199 → B
200〜299 → A
300〜499 → S
500〜998 → SS
999     → MAX
```

### ランク色（CSS準拠）
| ランク | 色 |
|--------|-----|
| S/SS/MAX | #FFD700（金） |
| A | #EE1111（赤） |
| B | #2233EE（青） |
| C | #119933（緑） |
| D | #CC8800（黄茶） |
| E/F | #888888（グレー） |

### 数値ルール
- 練習メニュー1つ完了 → 該当ステータス+1
- 複数メニュー → 複数加算
- 上限999（バックエンドでclamp）
- **親承認後にのみ加算**（不正防止）
- 休んだ日は加算なし・後日分は通常加算可

---

## 練習メニュー初期データ（シード）

```typescript
const menus = [
  // ハンドリング
  { name: "その場ドリブル（左右各1分）", targetStat: "handling" },
  { name: "8の字ドリブル",              targetStat: "handling" },
  { name: "チェンジオブペース",          targetStat: "handling" },
  { name: "股下ドリブル",               targetStat: "handling" },
  // シュート
  { name: "フリースロー20本",            targetStat: "shooting" },
  { name: "レイアップ左右20本",          targetStat: "shooting" },
  { name: "ミドルシュート10本",          targetStat: "shooting" },
  { name: "キャッチ&シュート",           targetStat: "shooting" },
  // スピード
  { name: "ラダートレーニング",          targetStat: "speed" },
  { name: "シャトルラン",               targetStat: "speed" },
  { name: "サイドステップ",             targetStat: "speed" },
  { name: "ダッシュ×10本",             targetStat: "speed" },
  // ディフェンス
  { name: "ディフェンスフットワーク",    targetStat: "defense" },
  { name: "1on1守備",                  targetStat: "defense" },
  { name: "ヘルプディフェンス練習",      targetStat: "defense" },
  // パス
  { name: "胸パス壁当て50回",           targetStat: "passing" },
  { name: "バウンズパス練習",           targetStat: "passing" },
  { name: "2人組パス練習",              targetStat: "passing" },
  // フィジカル
  { name: "腕立て伏せ20回",             targetStat: "physical" },
  { name: "スクワット30回",             targetStat: "physical" },
  { name: "体幹トレーニング",            targetStat: "physical" },
  { name: "ジャンプ練習",               targetStat: "physical" },
  // メンタル
  { name: "試合参加",                   targetStat: "mental" },
  { name: "自主練（自分で考えて実施）",  targetStat: "mental" },
  { name: "目標設定・振り返りノート記入",targetStat: "mental" },
]
```

---

## API設計

```
GET  /api/player              # 選手情報取得
PUT  /api/player              # 選手情報更新（名前・番号・ポジション・身長・体重等）
PUT  /api/player/stats        # 成績更新（試合数・得点・アシスト）

GET  /api/training/menus      # 練習メニュー一覧
POST /api/training/log        # 練習記録提出（子供側）
GET  /api/training/pending    # 未承認記録取得（親側）

POST /api/approval/login      # 親パスワード認証 → JWT発行
POST /api/approval/approve/:id# 承認 → ステータス加算（要JWT）
POST /api/approval/reject/:id # 却下（要JWT）

GET  /api/skills              # スキル一覧
POST /api/skills              # スキル追加（要JWT）
PUT  /api/skills/:id/gold     # 金枠昇格（要JWT）
DELETE /api/skills/:id        # 削除（要JWT）

GET  /api/history             # 練習履歴（日付降順）
GET  /api/history/:date       # 特定日の詳細
```

---

## 画面設計

### 画面一覧
| 画面 | 概要 |
|------|------|
| ホーム | 選手カード（パワプロUI）+ 下段に今日の状況・成長・継続記録 |
| 練習入力 | カテゴリ別チェックリスト → 親に送信 |
| 親承認 | テンキーパスワード → 承認/却下 → ステータス加算 |
| スキル管理 | スキル一覧・追加・金枠昇格（親のみ） |
| 履歴 | 日別練習記録・承認状況・加算差分 |
| 設定 | プロフィール・身長体重・成績・パスワード・メニュー編集 |

### ホーム画面レイアウト（横持ち）
```
┌─────────────────────────────────────────────────┐
│ タブ: [選手能力] [プロフィール]  ← 将来拡張可    │
├─────────────────────────────────────────────────┤
│ [こんどう] 🏀 [7]  成績 12試合 48点 23ast       │
├─────────────────────────────────────────────────┤
│ ポジション ガード ★64 ◆3  🏀                   │
│                    身長148cm 体重38kg スタイル... │
├──────────────┬──────────────────────────────────┤
│ プレー  ガード│ [スキルバッジ 4列グリッド]        │
│ ハンドリング  │ [速攻の鬼★] [パワーヒッター] ...  │
│  B  82       │ [初球〇]   [声出し隊長] ...       │
│ フィジカル    │ [空]  [空]  [空]  [空] ...       │
│  D  54       │                                   │
│ スピード      │                                   │
│  A  82       │                                   │
│ ...          │                                   │
└──────────────┴──────────────────────────────────┘
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ 今日の練習   │ │ 最近の成長  │ │ 継続記録    │
│ 状況        │ │             │ │ 42日 / 5連続│
└─────────────┘ └─────────────┘ └─────────────┘
```

### UIデザイン仕様（パワプロ準拠）
- **カード背景**: `#EAF4FD`
- **タブ背景**: `#1A3080`（濃紺）
- **選手名ボックス**: `#33BB00`（緑）白文字
- **ステータスラベル**: 白背景・角丸5px・薄枠
- **ランク文字**: 24px・ラベル外に独立
- **右エリア（スキル）**: 白背景 `#fff`
- **スキル通常セル**: `#B8D4EA`（薄青）
- **スキル金枠セル**: `#FFE050`（黄色）
- **スキル空セル**: 白背景・薄枠
- **フォント**: M PLUS 1p（Google Fonts）
- **向き**: スマホ横持ち固定（縦持ち時は回転促すメッセージ表示）

---

## セキュリティ
- パスワードはbcryptでハッシュ化（平文保存禁止）
- JWTの有効期限は1時間（親セッション）
- ステータス加算は**必ずバックエンド側で実行**（フロントで直接加算しない）
- 練習記録の日付は当日のみ提出可能
- ステータスは999を超えない（バックエンドでclamp処理）
- スキルの追加・削除・金枠昇格は親承認JWTが必要

---

## 実装順序

1. Prismaスキーマ作成・マイグレーション
2. バックエンドAPI実装（player / training / approval / skills / history）
3. 初期データシード（練習メニュー）
4. フロント：ホーム画面（選手カード）
5. フロント：練習入力画面
6. フロント：親承認画面
7. フロント：スキル管理画面
8. フロント：履歴画面
9. フロント：設定画面
10. Vercel + Railway デプロイ確認

---

## 参考モックファイル
- `mock_final.html`：画面モック（全6画面インタラクティブ）
