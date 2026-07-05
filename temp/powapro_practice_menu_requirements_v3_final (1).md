# ぱわぷろキッズ 追加要件定義 v3（確定版）：週間コーチメニュー連携機能

> 前バージョン(独自スキーマ案)は破棄。SPEC.md記載の既存実装(`TrainingMenu` / `TrainingLog` / statsDelta集計)にそのまま乗せる形に作り直し。v2で提示した未確認事項はすべて確定。このままClaude Codeへ渡せる粒度。

## 0. 前提の確認（既存実装との整合）

SPEC.mdより、既存は以下の仕組みで完結している：

- `TrainingMenu`（マスタ）：1件＝1種目、`targetStat` と `deltaValue`(現在すべて1) を持つ
- 子供が複数の `TrainingMenu` をチェック→「親に送る」→ `TrainingLog` 作成（`statsDelta` は選択メニューの `targetStat` ごとの合計）
- 親が承認→`statsDelta` を Player に加算（999でclamp）

→ **「種目ごとに加算」は既存ロジックそのまま**で実現できる。新しい加算方式やテーブルは不要。今回追加するのは「コーチの週間メニューを `TrainingMenu` に反映する仕組み」と「曜日で①/②を出し分ける仕組み」「動画リンクの表示」の3点のみ。

## 1. スキーマ変更（最小差分）

### 1.1 `TrainingMenu` にカラム追加

| カラム | 型 | デフォルト | 説明 |
|---|---|---|---|
| detail | String? | null | 回数・秒数表記（例："20秒×2セット"）。既存の生成メニューはnullのまま |
| videos | String? | null | JSON文字列 `[{"label":"解説","url":"..."}]`（既存の`menus`/`statsDelta`と同じ「SQLiteはString、Postgresに移す時にJson型に戻す」方針に合わせる） |
| menuGroup | String? | null | `"A"` / `"B"` / `null`。コーチ指定の週替わりメニューのみ値を持つ。既存の自主練メニュー25件は`null`のまま（曜日に関係なく常時表示） |
| isCoachMenu | Boolean | false | コーチ提供メニューかどうかの区別用（表示セクション分けに使用） |

### 1.2 新規テーブル `MenuSchedule`（1行固定・曜日→グループの固定割当）

```prisma
model MenuSchedule {
  id        Int    @id @default(1)
  monGroup  String @default("A")
  tueGroup  String @default("B")
  wedGroup  String @default("A")
  thuGroup  String @default("B")
  friGroup  String @default("A")
  satGroup  String @default("NONE")
  sunGroup  String @default("NONE")
}
```

値は `"A"` / `"B"` / `"NONE"` の3種。**土日はチーム練習があるため`NONE`固定**とし、コーチメニューは表示せず既存の自主練メニュー（25件）のみを表示する。平日の割当（月〜金でA/Bどちら）はデフォルト値のまま実装し、実際の運用に合わせて親がSettings画面から調整する。家庭で固定運用のため、コーチ側の週替わり通知に応じて自動で変わるものではない。

## 2. カテゴリ対応（確定）

既存 `targetStat`: `handling / physical / speed / shooting / defense / passing / mental`

v2で提示した案のまま確定。

**メニュー① グループA**

| 種目 | targetStat |
|---|---|
| ノルディックスクワット | physical |
| トリプルスレッド | handling |
| フロントハンドリング | handling |
| 縦引き | handling |
| ポケットハンドリング | handling |
| 3ドリポケット | handling |
| セミサークルポケット(右/左) | handling |
| ドリブルダッシュ | speed |

**メニュー② グループB**

| 種目 | targetStat |
|---|---|
| サイドキック | speed |
| 4コーンクロス | handling |
| トリプルスレッド(クロス) | handling |
| 2ドリからフロントチェンジ | handling |
| 片側スキップ | speed |
| スキップダッシュドリブル | speed |
| 片側スキップポケットドリブル(右/左) | handling |
| 6コーンスキップドライブ | speed |

**共通パート（A/B両方に含む）**

| 種目 | targetStat |
|---|---|
| 両足レジストジャンプ | physical |
| 片足レジストもも上げ | physical |
| ウォール12ダッシュ | speed |
| もも上げダッシュ | speed |
| ハンズアップもも上げ | speed |

`shooting/defense/passing/mental` は今回のコーチメニューでは加算対象にならない。土日はチーム練習日として既存の自主練メニュー（25件、7カテゴリ全体をカバー）のみ表示するため、そちら側でバランスが取れる想定。

## 3. シード/更新運用（確定）

- コーチからのメニュー更新は**隔週**。届いたら`seed.ts`を手動編集して再投入する運用でひとまず進める（自動パース画面は作らない）
- 更新時は**同じ `menuGroup` の既存レコードを削除→再作成**（種目構成が変わりうるため上書き前提）
- 初回はSPEC.md の `seed.ts` に本メニュー分（menuGroup=A/Bの各9件＋共通5件）を追記する形で投入
- 将来的にテキスト貼り付け→自動パースする入力画面が欲しくなったら別要件として起票

## 4. 画面変更

### 4.1 `Training.tsx`
- 今日の曜日→`MenuSchedule`から`menuGroup`（"A"/"B"）を判定
- 表示を2セクションに分割：
  - 「今週のコーチメニュー」：`isCoachMenu=true` かつ (`menuGroup`が今日の割当と一致 または `menuGroup=null`扱いの共通枠)。各行に`detail`と動画リンク（解説/実演/動画をボタン表示、`videos`をパースして表示）
  - 「自主練メニュー」：既存の25件（`isCoachMenu=false`）、現状のカテゴリ別2列表示のまま
- チェック→「親に送る」の送信フローは既存のまま変更なし（コーチメニューも自主練メニューも同じ`menuIds`配列に混在してよい）
- **動画ボタンの挙動参考：** `practice_dashboard.html`（先に作成したモック）の「タップですぐ動画が開くボタン」の挙動をそのまま踏襲する。ただし配色・カード見た目はモック独自のもの（紺+オレンジ）ではなく、既存のぱわぷろ風パレット（SPEC.md 8章、カード背景`#EAF4FD`等）に合わせること。参考にするのは「挙動」のみで「見た目」は既存アプリに統一する

### 4.2 `Settings.tsx`
- 「週間メニュー設定」セクション追加：曜日ごとの①/②割当（A/B）をトグルまたはセレクトで設定。親JWT必須（誤操作防止のため）

### 4.3 `Home.tsx` / `History.tsx`
- 変更不要。既存の`statsDelta`表示・継続記録ロジックがそのまま今回のメニューにも効く

## 5. API変更

| Method | Path | 変更内容 |
|---|---|---|
| GET | /api/training/menus | `menuGroup`/`detail`/`videos`/`isCoachMenu`を含めて返すよう拡張。クエリで「今日の割当グループ」を計算しフィルタ済みで返すか、フロント側でフィルタするかは実装時に決定 |
| GET/PUT | /api/menu-schedule | 新規。曜日→グループ設定の取得・更新（PUTは親JWT必須） |

`POST /api/training/log` `POST /api/approval/approve/:id` は変更不要（既存ロジックがそのまま対応）。

## 6. 確定事項まとめ

1. `targetStat` は2章の案どおり確定
2. メニュー更新は隔週・`seed.ts`手動編集で運用（自動パース画面は作らない）
3. 土日はチーム練習日として`MenuSchedule`を`NONE`固定にし、コーチメニューを表示せず既存の自主練メニュー25件のみ表示する。これにより`shooting/defense/passing/mental`のカバーは自主練メニュー側に委ねる

この3点の確定により、v2で残っていた未確定事項はすべて解消。実装ステップは以下の順で進める。

1. Prismaスキーマ変更（`TrainingMenu`へのカラム追加、`MenuSchedule`テーブル追加）＋マイグレーション
2. `seed.ts`にコーチメニュー14件（グループA9件・グループB9件、共通5件は両グループから参照）を追記
3. `GET /api/training/menus`の拡張、`GET/PUT /api/menu-schedule`の新規実装
4. `Training.tsx`のセクション分け表示（今週のコーチメニュー／自主練メニュー）＋動画リンク表示
5. `Settings.tsx`に曜日設定UI追加（親JWT必須）
6. 動作確認：平日はA/B、土日は自主練メニューのみ表示されることを確認
