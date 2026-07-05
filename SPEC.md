# パワプロ風バスケ成長管理アプリ — 詳細仕様書

> 作成日：2026-07-05　対象コミット：main ブランチ現行

---

## 1. アプリ概要

子供（楓）の日々のバスケ練習をパワプロ風UIでステータス化する完全個人用Webアプリ。  
子供が練習を記録し、親が承認することでステータスが加算される。不正加算を構造的に防ぐ。

**利用想定**
- 子供：練習後にスマホ横持ちで練習記録を入力し「親に送る」
- 親：通知に気づいたらパスワードを入力して承認/却下

---

## 2. 技術スタック

### フロントエンド（`frontend/`）

| 項目 | 採用技術 |
|------|---------|
| フレームワーク | React 18 + TypeScript |
| ビルドツール | Vite 5 |
| スタイリング | Tailwind CSS 3（+ インラインstyle） |
| 状態管理 | React Query（サーバー状態） |
| HTTPクライアント | axios |
| ルーティング | React Router v6 |
| フォント | M PLUS 1p（Google Fonts） |

### バックエンド（`backend/`）

| 項目 | 採用技術 |
|------|---------|
| フレームワーク | Express + TypeScript |
| ORM | Prisma 5 |
| DB（ローカル） | SQLite（`prisma/dev.db`） |
| DB（本番予定） | PostgreSQL on Railway |
| 認証 | JWT（jsonwebtoken）+ bcryptjs |
| 開発サーバー | tsx watch |

### インフラ構成（予定）

```
GitHub
├── frontend/  → Vercel（環境変数: VITE_API_URL）
└── backend/   → Railway（環境変数: DATABASE_URL / PARENT_PASSWORD / JWT_SECRET）
```

---

## 3. ディレクトリ構成

```
powapro-kids/
├── CLAUDE.md              # AIへの設計指示書
├── SPEC.md                # 本ファイル
├── mock_final.html        # 全6画面インタラクティブモック
├── frontend/
│   ├── index.html
│   ├── vite.config.ts     # /api → localhost:3001 プロキシ設定
│   ├── tailwind.config.js
│   └── src/
│       ├── main.tsx       # QueryClientProvider エントリ
│       ├── App.tsx        # BrowserRouter + Routes定義
│       ├── index.css      # Tailwind + 縦持ち警告overlay
│       ├── components/
│       │   └── BottomNav.tsx
│       ├── lib/
│       │   ├── api.ts         # axios インスタンス + API関数群
│       │   └── rankCalc.ts    # ランク計算ロジック
│       └── pages/
│           ├── Home.tsx
│           ├── Training.tsx
│           ├── ParentApproval.tsx
│           ├── Skills.tsx
│           ├── History.tsx
│           └── Settings.tsx
└── backend/
    ├── .env               # ローカル用（git管理外）
    ├── .env.example       # 環境変数テンプレート
    ├── prisma/
    │   ├── schema.prisma
    │   └── dev.db         # SQLiteファイル（ローカルのみ）
    └── src/
        ├── index.ts       # Expressサーバー起動・ルート登録
        ├── seed.ts        # 練習メニュー初期データ投入
        ├── middleware/
        │   └── parentAuth.ts  # JWT検証ミドルウェア
        └── routes/
            ├── player.ts
            ├── training.ts
            ├── approval.ts
            ├── skills.ts
            └── history.ts
```

---

## 4. データベーススキーマ

### Player（選手 / 1レコード固定）

| カラム | 型 | デフォルト | 説明 |
|-------|-----|----------|------|
| id | Int PK | autoincrement | |
| name | String | — | 選手名 |
| number | Int | — | 背番号 |
| position | String | — | ポジション（ガード / フォワード / センター） |
| playStyle | String | — | プレースタイル（ドリブラー / シューター等） |
| height | Float | — | 身長（cm） |
| weight | Float | — | 体重（kg） |
| gamesPlayed | Int | 0 | 出場試合数 |
| totalPoints | Int | 0 | 総得点 |
| totalAssists | Int | 0 | 総アシスト |
| handling | Int | 0 | ハンドリング（0〜999） |
| physical | Int | 0 | フィジカル（0〜999） |
| speed | Int | 0 | スピード（0〜999） |
| shooting | Int | 0 | シュート（0〜999） |
| defense | Int | 0 | ディフェンス（0〜999） |
| passing | Int | 0 | パス（0〜999） |
| mental | Int | 0 | メンタル（0〜999） |
| createdAt | DateTime | now() | |
| updatedAt | DateTime | updatedAt | |

初回 `GET /api/player` 時にレコードが存在しなければ、以下のデフォルト値で自動作成：  
`name=こんどう / number=7 / position=ガード / playStyle=ドリブラー / height=148 / weight=38`

---

### TrainingLog（練習記録）

| カラム | 型 | デフォルト | 説明 |
|-------|-----|----------|------|
| id | Int PK | autoincrement | |
| playerId | Int FK | — | Player.id |
| date | DateTime | — | 練習日時（サーバー時刻） |
| menus | String | — | JSON文字列（SQLite対応）`[{id, name, targetStat}]` |
| approved | Boolean | false | 承認済みフラグ |
| approvedAt | DateTime? | null | 承認日時 |
| rejected | Boolean | false | 却下フラグ |
| statsDelta | String | `"{}"` | JSON文字列 `{"handling": 2, "speed": 1}` |
| createdAt | DateTime | now() | |

**制約：** 同一プレイヤーの当日（サーバー時刻 0:00〜23:59）レコードが存在する場合、409を返す。

---

### Skill（スキルバッジ）

| カラム | 型 | デフォルト | 説明 |
|-------|-----|----------|------|
| id | Int PK | autoincrement | |
| playerId | Int FK | — | Player.id |
| name | String | — | スキル名 |
| isGold | Boolean | false | 金枠フラグ |
| certifiedAt | DateTime | now() | 認定日 |

---

### TrainingMenu（練習メニューマスタ）

| カラム | 型 | デフォルト | 説明 |
|-------|-----|----------|------|
| id | Int PK | autoincrement | |
| name | String | — | メニュー名 |
| description | String? | null | 説明（未使用） |
| targetStat | String | — | 対象ステータスキー |
| deltaValue | Int | 1 | 加算値（現行は全て1固定） |
| isActive | Boolean | true | 有効フラグ |
| createdAt | DateTime | now() | |

**シードデータ（25件）：**

| カテゴリ | メニュー |
|---------|---------|
| handling | その場ドリブル（左右各1分）/ 8の字ドリブル / チェンジオブペース / 股下ドリブル |
| shooting | フリースロー20本 / レイアップ左右20本 / ミドルシュート10本 / キャッチ&シュート |
| speed | ラダートレーニング / シャトルラン / サイドステップ / ダッシュ×10本 |
| defense | ディフェンスフットワーク / 1on1守備 / ヘルプディフェンス練習 |
| passing | 胸パス壁当て50回 / バウンズパス練習 / 2人組パス練習 |
| physical | 腕立て伏せ20回 / スクワット30回 / 体幹トレーニング / ジャンプ練習 |
| mental | 試合参加 / 自主練（自分で考えて実施）/ 目標設定・振り返りノート記入 |

---

## 5. API 仕様

ベースURL：`/api`（ローカル：`http://localhost:3001/api`）

### 認証

- 親認証が必要なエンドポイントは `Authorization: Bearer <JWT>` ヘッダーが必要
- JWTは `POST /api/approval/login` で取得、有効期限1時間
- フロントは取得後 sessionStorage に保存し、axios デフォルトヘッダーにセット
- タブを閉じるとトークンは消える（sessionStorage のスコープ）

---

### Player

#### `GET /api/player`
選手情報取得。レコードがなければデフォルト値で自動作成。

**認証：不要**

**レスポンス例：**
```json
{
  "id": 1, "name": "こんどう", "number": 7,
  "position": "ガード", "playStyle": "ドリブラー",
  "height": 148, "weight": 38,
  "gamesPlayed": 12, "totalPoints": 48, "totalAssists": 23,
  "handling": 82, "physical": 54, "speed": 82,
  "shooting": 60, "defense": 48, "passing": 62, "mental": 44,
  "createdAt": "...", "updatedAt": "..."
}
```

---

#### `PUT /api/player`
プロフィール更新（名前・背番号・ポジション・プレースタイル・身長・体重）。

**認証：不要**（子供も変更可）

**リクエストボディ：**
```json
{ "name": "こんどう", "number": 7, "position": "ガード",
  "playStyle": "ドリブラー", "height": 148, "weight": 38 }
```

---

#### `PUT /api/player/stats`
成績更新（試合数・得点・アシスト）。

**認証：親JWT必須**

**リクエストボディ：**
```json
{ "gamesPlayed": 12, "totalPoints": 48, "totalAssists": 23 }
```

---

### Training

#### `GET /api/training/menus`
有効な練習メニュー一覧を返す（`isActive: true` のみ）。

**認証：不要**

---

#### `POST /api/training/log`
練習記録の提出。

**認証：不要**

**リクエストボディ：**
```json
{ "menuIds": [1, 3, 5] }
```

**エラーケース：**
- `400` menuIds が空
- `404` プレイヤーが存在しない
- `409` 当日の記録が既に存在する

**処理内容：**
1. menuIds で TrainingMenu を検索
2. targetStat ごとに deltaValue を集計 → statsDelta を生成
3. TrainingLog を作成（approved/rejected はfalse）
4. レスポンスは `menus`・`statsDelta` をパース済みオブジェクトで返す

---

#### `GET /api/training/pending`
未承認・未却下の練習記録一覧（日付降順）。

**認証：不要**（フロントは親認証後に表示するが、API自体は制限なし）

---

### Approval

#### `POST /api/approval/login`
親パスワード認証。JWT を発行する。

**認証：不要**

**リクエストボディ：**
```json
{ "password": "1234" }
```

**処理内容：**
- 環境変数 `PARENT_PASSWORD` と比較
- `$2` で始まる場合は bcrypt 比較、それ以外は平文比較
- 一致したら JWT（有効期限1h）を発行

**レスポンス：**
```json
{ "token": "eyJ..." }
```

---

#### `POST /api/approval/approve/:id`
練習記録を承認し、ステータスを加算する。

**認証：親JWT必須**

**処理内容（トランザクション）：**
1. TrainingLog を取得し、未処理であることを確認
2. statsDelta を JSON.parse
3. 各ステータスに加算（`Math.min(999, current + delta)` でclamp）
4. TrainingLog.approved = true、approvedAt = now() に更新
5. Player のステータスを更新

**エラーケース：**
- `404` 記録が存在しない
- `409` 既に承認または却下済み

---

#### `POST /api/approval/reject/:id`
練習記録を却下する（ステータス加算なし）。

**認証：親JWT必須**

**処理内容：** TrainingLog.rejected = true に更新のみ

---

### Skills

#### `GET /api/skills`
スキル一覧（金枠→通常、認定日昇順）。

**認証：不要**

---

#### `POST /api/skills`
スキルを新規追加。

**認証：親JWT必須**

**リクエストボディ：**
```json
{ "name": "速攻の鬼" }
```

---

#### `PUT /api/skills/:id/gold`
スキルを金枠に昇格（`isGold: true` にする。戻せない）。

**認証：親JWT必須**

---

#### `DELETE /api/skills/:id`
スキルを削除。

**認証：親JWT必須**

---

### History

#### `GET /api/history`
全練習ログを日付降順で返す。`menus`・`statsDelta` はパース済みオブジェクト。

**認証：不要**

---

#### `GET /api/history/:date`
指定日（`YYYY-MM-DD`）の練習ログを1件返す。なければ `null`。

**認証：不要**

---

## 6. ランク計算ロジック（`rankCalc.ts`）

```
999     → MAX（金 #FFD700）
500〜998 → SS （金 #FFD700）
300〜499 → S  （金 #FFD700）
200〜299 → A  （赤 #EE1111）
150〜199 → B  （青 #2233EE）
100〜149 → C  （緑 #119933）
 60〜99  → D  （黄茶 #CC8800）
 30〜59  → E  （灰 #888888）
  0〜29  → F  （灰 #888888）
```

ステータス合計値（7項目の和）は「★合計値」としてポジション行に表示。

---

## 7. 画面仕様

### 共通

- **向き：** スマホ横持ち固定。縦持ち時は `::before` でフルスクリーンの警告オーバーレイを表示
- **最大幅：** 980px（中央寄せ）
- **ナビゲーション：** 画面下部固定のBottomNav（6タブ）。アクティブは金色
- **フォント：** M PLUS 1p（500 / 700 / 800 / 900）

---

### ホーム（`Home.tsx`）

**パワプロカード本体：**

| エリア | 表示内容 |
|-------|---------|
| タブ行 | 「選手能力」（アクティブ）/ 「プロフィール」（非アクティブ）/ ◀L1 R1▶ ダミーボタン |
| 選手名行 | 名前（緑ボックス）/ 🏀アイコン / 背番号 / 成績（試合数・点・ast） |
| ポジション行 | ポジション / ★ステータス合計 / 🏀キャラアイコン / 身長・体重・スタイル |
| 左エリア（188px固定） | プレー行 + ステータス7行（ラベル白box / ランク文字 / 数値） |
| 右エリア（可変） | スキルバッジグリッド（4列、24セル固定。不足分は空白セル） |

**スキル表示色：**
- 金枠：背景 `#FFE050` / 枠 `#BBAA00` / 文字 `#3A2000`
- 通常：背景 `#B8D4EA` / 枠 `#88AACC` / 文字 `#112233`
- 空：背景 `#fff` / 枠 `#AACCDD`

**下段3列パネル：**

| パネル | 表示内容 |
|-------|---------|
| 今日の練習状況 | 今日の日付 / 当日ログのメニュー名・statsDelta・承認ステータスバッジ。ログなしなら「まだ記録していません」 |
| 最近の成長 | 承認済みログ最新3件（日付 + statsDelta） |
| 継続記録 | 累計練習日数 / 連続練習日数 / 累計加算ポイント（3数値） |

**継続日数の計算ロジック：**  
承認済みログの日付（重複除去・降順ソート）を今日から遡り、連続している日数をカウント。途切れた時点で停止。

---

### 練習入力（`Training.tsx`）

- 練習メニューをカテゴリ別（7カテゴリ）に2列レイアウトで表示
- 左列：最初の4カテゴリ、右列：残り3カテゴリ
- タップでチェックON/OFF切り替え（複数選択可）
- 「N つ選択中」カウント表示
- **「親に送る」ボタン：** 1つ以上選択時のみ有効（赤、disabled時はグレー）
- 送信成功時：完了カード表示（「戻る」ボタンで再入力可）
- 送信エラー時：エラー文言をボタン上に表示（409：当日提出済み等）
- **1日1回制限：** サーバー側で当日レコードが存在する場合は409

---

### 親承認（`ParentApproval.tsx`）

**左：テンキーパネル（240px固定幅）**
- 4桁ドット表示（入力済みは紺、未入力は白）
- 数字9キー + ⌫（削除）+ 0 + OK の3×4グリッド
- 4桁入力後OKで `POST /api/approval/login` を呼び出し
- 認証済み状態では「✅ 認証済み」と「ログアウト」ボタンを表示
- ログアウト：sessionStorage削除 + axios ヘッダークリア

**右：承認リストパネル**
- 未認証状態では「パスワードを入力してください」
- 承認待ちログを一覧表示（日付 / メニュー名 / statsDelta）
- 各ログに「✅ 承認する」「✗ 却下」ボタン
- 承認後：`invalidateQueries(['player'])` でホームのステータスを再取得

---

### スキル管理（`Skills.tsx`）

- 金枠スキル・通常スキルを2列で分けて表示
- **追加：** テキストボックス + 「＋ 認定する」ボタン（親JWT必須）
- **金枠昇格：** 「金枠に昇格 ↑」ボタン（不可逆）
- **削除：** 各スキルに削除ボタン
- 認証エラー時：「承認ページで親ログインが必要です」と案内

---

### 履歴（`History.tsx`）

- 全練習ログを日付降順・2列表示
- 各ログにバッジ（承認済み✓ / 承認待ち / 却下）
- 承認済みのみ statsDelta を表示

---

### 設定（`Settings.tsx`）

**プロフィール欄（認証不要）：** 名前 / 背番号 / ポジション（select）/ プレースタイル（select）/ 身長 / 体重を編集可能。「プロフィールを保存」ボタン押下で `PUT /api/player`。保存成功時は「保存しました ✓」に2秒間変化。

**成績欄（親JWT必須）：** 試合数 / 総得点 / 総アシストを編集。「成績を保存」で `PUT /api/player/stats`。認証エラー時は「承認ページで親ログインが必要です」を表示。

**セキュリティ欄：** 親パスワードは Railway 環境変数での設定案内のみ（変更UIは未実装）。

---

## 8. UIカラーパレット（パワプロ準拠）

| 要素 | カラー |
|------|-------|
| カード背景 | `#EAF4FD` |
| タブ背景（濃紺） | `#1A3080` |
| 選手名ボックス | `#33BB00`（緑）白文字 |
| ステータスラベルbox | `#fff` 枠 `#AACCDD` |
| ページ背景 | `#6B9AB8` |
| サブカード背景 | `#D8EEFA` |
| ヘッダーグラデ | `#1A3A88 → #2A5AAA` |
| スキル通常 | `#B8D4EA` |
| スキル金枠 | `#FFE050` |

---

## 9. セキュリティ設計

| 項目 | 実装 |
|------|------|
| 親パスワード | 環境変数で管理（平文 or bcryptハッシュ対応） |
| JWT有効期限 | 1時間（`expiresIn: '1h'`） |
| トークン保持 | sessionStorage（タブ閉じで消滅） |
| ステータス加算 | バックエンドのみで実行（フロントから直接変更不可） |
| ステータス上限 | `Math.min(999, current + delta)` でclamp |
| 1日1回制限 | サーバー時刻基準で当日ログを確認してから記録 |
| スキル操作 | 追加・昇格・削除すべて親JWT必須 |
| 成績更新 | 親JWT必須 |
| プロフィール更新 | 認証不要（子供も変更可） |

---

## 10. ローカル起動手順

```bash
# バックエンド
cd backend
npm install
npm run db:push    # SQLiteスキーマ作成
npm run db:seed    # 練習メニュー25件投入
npm run dev        # port 3001

# フロントエンド（別ターミナル）
cd frontend
npm install
npm run dev        # port 5173
```

`.env`（`backend/.env`）：
```
DATABASE_URL="file:./dev.db"
PARENT_PASSWORD="1234"
JWT_SECRET="local-dev-secret"
PORT=3001
```

---

## 11. Railwayデプロイ時の差分

| 項目 | ローカル | Railway |
|------|---------|---------|
| DB provider | `sqlite` | `postgresql` |
| DATABASE_URL | `file:./dev.db` | Railway PostgreSQL URL |
| schema変更 | 不要 | `provider = "postgresql"` に変更 |
| menus/statsDelta型 | String（JSON文字列） | Json型に戻す |
| マイグレーション | `db push` | `prisma migrate deploy` |

---

## 12. 未実装・既知課題

| 項目 | 状況 |
|------|------|
| 練習メニュー編集UI | 設定画面にリンクのみ（編集機能なし） |
| プロフィールタブ | タブUIはモック準拠だが非インタラクティブ |
| 親パスワード変更UI | 環境変数設定案内のみ |
| プッシュ通知 | 未実装 |
| Vercel/Railwayデプロイ | 未実施 |
| 本番DB（PostgreSQL）対応 | schema変更が必要（11節参照） |
