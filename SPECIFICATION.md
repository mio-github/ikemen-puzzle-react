# IKEMEN PUZZLE - 技術仕様書

**バージョン**: 1.0.0
**作成日**: 2025-11-14
**プロジェクト**: イケメンパズルゲーム

---

## 📋 目次

1. [プロジェクト概要](#プロジェクト概要)
2. [技術スタック](#技術スタック)
3. [アーキテクチャ](#アーキテクチャ)
4. [データ構造](#データ構造)
5. [コンポーネント仕様](#コンポーネント仕様)
6. [状態管理](#状態管理)
7. [ゲームロジック](#ゲームロジック)
8. [UI/UX仕様](#uiux仕様)
9. [既知の問題と制限事項](#既知の問題と制限事項)
10. [今後の拡張予定](#今後の拡張予定)

---

## プロジェクト概要

### 概要
白と黒をベースにしたクールなデザインの、実際に遊べるジグソーパズルゲームです。リアルなジグソーピース形状を生成し、ドラッグ&ドロップまたはクリック操作でパズルを完成させます。

### 主な機能
- 実際に遊べるジグソーパズル（9/16/25/36ピース対応）
- 5つの画面構成（ホーム、パズル一覧、ゲーム、コレクション、懸賞）
- ダークモードと成人向けコンテンツフィルター
- ポイントシステムとゲーミフィケーション
- レスポンシブデザイン（スマホフレーム対応）

---

## 技術スタック

### フロントエンド
- **React**: 18.2.0
- **Vite**: 5.0.0（ビルドツール）
- **Pure CSS**: カスタムスタイリング
- **ES Modules**: モジュールシステム

### 開発ツール
- **npm**: パッケージマネージャー
- **Vite Dev Server**: 開発サーバー（HMR対応）

### ブラウザ要件
- モダンブラウザ（Chrome, Firefox, Safari, Edge最新版）
- SVG対応
- ES6+サポート

---

## アーキテクチャ

### ディレクトリ構造

```
ikemen-puzzle-react/
├── index.html                    # エントリーポイント
├── package.json                  # 依存関係定義
├── vite.config.js               # Vite設定
├── public/
│   └── images/                  # パズル画像アセット
│       ├── Pixabayビジネス風男性_1.jpg
│       ├── Pixabay AI男性_1.png
│       ├── Pixabay AI男性_2.png
│       ├── Pixabayアニメ男性_1.png
│       └── アニメ風イケメン_1.jpg
└── src/
    ├── main.jsx                 # Reactアプリエントリー
    ├── index.css                # グローバルスタイル
    ├── App.jsx                  # ルートコンポーネント
    ├── App.css                  # アプリスタイル
    └── components/
        ├── Home.jsx & Home.css
        ├── PuzzleList.jsx & PuzzleList.css
        ├── PuzzleGame.jsx & PuzzleGame.css
        ├── Collection.jsx & Collection.css
        ├── Prizes.jsx & Prizes.css
        └── Navigation.jsx & Navigation.css
```

### コンポーネント階層

```
App (ルート)
├── Home (ホーム画面)
├── PuzzleList (パズル一覧)
├── PuzzleGame (ゲーム画面)
├── Collection (コレクション)
├── Prizes (懸賞画面)
└── Navigation (下部ナビゲーション)
```

---

## データ構造

### Puzzleオブジェクト

```javascript
{
  id: Number,              // 一意のID
  title: String,           // パズル名
  image: String,           // 画像パス
  difficulty: String,      // 難易度 ('EASY'|'NORMAL'|'HARD'|'EXPERT')
  pieces: Number,          // ピース数 (9|16|25|36)
  cost: Number,            // ポイントコスト
  isNew: Boolean,          // 新着フラグ
  isHot: Boolean,          // 人気フラグ（オプション）
  category: String,        // カテゴリー
  mature: Boolean          // 成人向けフラグ
}
```

### 難易度とピース数の対応

| 難易度 | ピース数 | グリッド |
|--------|----------|----------|
| EASY   | 9        | 3×3      |
| NORMAL | 16       | 4×4      |
| HARD   | 25       | 5×5      |
| EXPERT | 36       | 6×6      |

### ジグソーピース形状データ

```javascript
{
  id: Number,              // ピースID
  correctIndex: Number,    // 正しい配置位置
  row: Number,             // 行位置
  col: Number,             // 列位置
  shape: {
    top: EdgeData | null,
    right: EdgeData | null,
    bottom: EdgeData | null,
    left: EdgeData | null,
    tabSize: 0.2,          // タブサイズ（20%）
    jitter: 0.04           // ジッター（4%）
  },
  isPlaced: Boolean        // 配置済みフラグ
}
```

### EdgeData構造（Draradechアルゴリズム準拠）

```javascript
{
  flip: Boolean,           // タブ/ソケットの向き
  b: Number,              // ジッター値（位置）
  c: Number,              // ジッター値
  d: Number,              // ジッター値
  e: Number               // ジッター値
}
```

---

## コンポーネント仕様

### App.jsx (ルートコンポーネント)

**責務**: アプリケーション全体の状態管理とルーティング

**State**:
```javascript
{
  currentScreen: String,           // 現在の画面 ('home'|'puzzles'|'game'|'collection'|'prizes')
  selectedPuzzle: Puzzle | null,   // 選択中のパズル
  userPoints: Number,              // ユーザーポイント（初期値: 1250）
  coins: Number,                   // コイン（初期値: 450）
  premiumCoins: Number,            // プレミアムコイン（初期値: 80）
  completedPuzzles: Array<Number>, // 完了済みパズルID（初期値: [1, 3, 5]）
  darkMode: Boolean                // ダークモード（初期値: false）
}
```

**メソッド**:
- `navigateTo(screen)`: 画面遷移
- `startPuzzle(puzzle)`: パズル開始
- `completePuzzle(points)`: パズル完了処理
- `toggleDarkMode()`: ダークモード切り替え

**既知の問題**:
- 状態がlocalStorageに保存されず、リロードで消失する

---

### Home.jsx (ホーム画面)

**責務**: ダッシュボード、デイリーミッション表示、クイックアクション

**Props**:
```javascript
{
  navigateTo: Function,
  userPoints: Number,
  coins: Number,
  premiumCoins: Number,
  darkMode: Boolean,
  toggleDarkMode: Function
}
```

**表示要素**:
- ユーザー統計（ポイント、コイン、プレミアムコイン）
- イベントバナー
- デイリーミッション（3件）
- クイックアクションボタン

**ミッション構造**:
```javascript
{
  id: Number,
  title: String,
  progress: String,      // "1/3" 形式
  reward: Number,
  completed: Boolean
}
```

---

### PuzzleList.jsx (パズル一覧)

**責務**: パズル選択画面

**Props**:
```javascript
{
  puzzles: Array<Puzzle>,
  startPuzzle: Function,
  completedPuzzles: Array<Number>,
  darkMode: Boolean
}
```

**機能**:
- パズルカード表示（画像、タイトル、難易度、ピース数）
- 完了済みバッジ表示
- NEW/HOTバッジ表示
- フィルタリング（darkModeに応じて成人向けコンテンツ表示/非表示）
- 画像読み込みエラーハンドリング

**難易度表示**:
```javascript
EASY:   ★☆☆☆
NORMAL: ★★☆☆
HARD:   ★★★☆
EXPERT: ★★★★
```

---

### PuzzleGame.jsx (ゲーム画面)

**責務**: ジグソーパズルゲームのメインロジック

**Props**:
```javascript
{
  puzzle: Puzzle,
  onComplete: Function,
  onBack: Function
}
```

**State**:
```javascript
{
  pieces: Array<PieceData>,        // 全ピース
  selectedPiece: PieceData | null, // 選択中ピース
  placedPieces: Array<PieceData>,  // 配置済みピース
  timer: Number,                   // 経過時間（秒）
  score: Number,                   // スコア
  draggedPiece: PieceData | null,  // ドラッグ中ピース
  dropTarget: Number | null,       // ドロップターゲット位置
  imageLoaded: Boolean,            // 画像読み込み状態（未使用）
  imageRef: Ref                    // 画像参照（未使用）
}
```

**アルゴリズム**: Draradechジグソーピース生成アルゴリズム

**ジグソー形状生成**:
1. シード値ベースの乱数生成器を使用
2. 各エッジ（上下左右）のタブ/ソケット形状を決定
3. 隣接ピースと整合性を保つためエッジデータを共有・反転
4. 3段階ベジェ曲線でSVGパスを生成

**操作方法**:
1. **クリック方式**: ピースクリック → スロットクリック
2. **ドラッグ&ドロップ**: ピースをドラッグ → スロットにドロップ

**スコアリング**:
- 正解配置: +100点
- 不正解配置: -10点（最小0点）
- 完成時タイムボーナス: max(0, 500 - timer × 2)
- 最終ポイント: floor(finalScore / 10)

**完成判定**:
- `placedPieces.length === puzzle.pieces`

**既知の問題**:
- useEffectの依存配列が空（パズル変更時に再初期化されない可能性）
- imageLoaded状態が使用されていない
- handleSlotClickとhandleDropでコードが重複

---

### Collection.jsx (コレクション画面)

**責務**: 完了済みパズルのコレクション表示

**Props**:
```javascript
{
  puzzles: Array<Puzzle>,
  completedPuzzles: Array<Number>,
  darkMode: Boolean
}
```

**表示要素**:
- 達成率円グラフ（SVG）
- 通常コレクション（20スロット）
- 成人向けコレクション（10スロット、ダークモード時のみ）
- ロック/アンロック状態表示

**達成率計算**:
```javascript
completionRate = floor((completedPuzzles.length / 30) × 100)
```

---

### Prizes.jsx (懸賞画面)

**責務**: ポイント消費システム

**Props**:
```javascript
{
  userPoints: Number,
  darkMode: Boolean  // 受け取っているが未使用
}
```

**懸賞アイテム構造**:
```javascript
{
  id: Number,
  name: String,
  cost: Number,      // 必要ポイント
  winners: Number,   // 当選者数
  deadline: Number,  // 締切（日数）
  emoji: String      // 表示絵文字
}
```

**機能**:
- ポイント残高表示
- 応募可能/不可能状態の表示
- 応募処理（現在はアラート表示のみ）

**既知の問題**:
- darkMode propを受け取っているが使用していない
- alert()を使用しており、UXが悪い

---

### Navigation.jsx (ナビゲーション)

**責務**: 下部ナビゲーションバー

**Props**:
```javascript
{
  currentScreen: String,
  navigateTo: Function
}
```

**ナビゲーション項目**:
```javascript
[
  { id: 'home', icon: '⌂', label: 'HOME' },
  { id: 'puzzles', icon: '⊞', label: 'PUZZLE' },
  { id: 'collection', icon: '♥', label: 'COLLECTION' },
  { id: 'prizes', icon: '⋆', label: 'PRIZE' }
]
```

**動作**: ゲーム画面では非表示

---

## 状態管理

### グローバル状態 (App.jsx)

すべての状態はApp.jsxで管理され、propsとして各コンポーネントに渡される。

**現在の実装**:
- useState hookで管理
- localStorageへの永続化なし

**推奨される改善**:
```javascript
// 永続化の追加
useEffect(() => {
  const savedState = localStorage.getItem('gameState')
  if (savedState) {
    const state = JSON.parse(savedState)
    setUserPoints(state.userPoints || 1250)
    setCoins(state.coins || 450)
    setPremiumCoins(state.premiumCoins || 80)
    setCompletedPuzzles(state.completedPuzzles || [1, 3, 5])
    setDarkMode(state.darkMode || false)
  }
}, [])

useEffect(() => {
  localStorage.setItem('gameState', JSON.stringify({
    userPoints,
    coins,
    premiumCoins,
    completedPuzzles,
    darkMode
  }))
}, [userPoints, coins, premiumCoins, completedPuzzles, darkMode])
```

---

## ゲームロジック

### ジグソーピース生成アルゴリズム

**Draradechアルゴリズム**に基づく実装:

1. **シード値ベースの乱数生成**
```javascript
const createRandom = (seed) => {
  let s = seed
  return () => {
    const x = Math.sin(s) * 10000
    s += 1
    return x - Math.floor(x)
  }
}
```

2. **エッジデータ生成**
- 水平エッジ: `h_{row}_{col}`
- 垂直エッジ: `v_{row}_{col}`
- 各エッジはflip（タブ/ソケット向き）とジッター値（b, c, d, e）を持つ

3. **エッジの共有と反転**
- 上辺: 上の行の水平エッジを反転
- 右辺: 右の列の垂直エッジをそのまま
- 下辺: 下の行の水平エッジをそのまま
- 左辺: 左の列の垂直エッジを反転

4. **SVGパス生成**
- 3段階ベジェ曲線を使用
- タブサイズ: 20%（0.2）
- ジッター: 4%（0.04）

### ピース配置ロジック

```javascript
// 正解判定
const isCorrect = piece.correctIndex === slotIndex

// 正解時
if (isCorrect) {
  - placedPiecesに追加
  - スコア+100
  - 完成判定
}

// 不正解時
else {
  - スコア-10
  - 振動フィードバック（navigator.vibrate）
}
```

### 完成処理

```javascript
handleComplete() {
  1. タイマー停止
  2. タイムボーナス計算: max(0, 500 - timer × 2)
  3. 最終スコア計算: score + timeBonus
  4. ポイント付与: floor(finalScore / 10)
  5. 完了コールバック実行
}
```

---

## UI/UX仕様

### カラーパレット

**ライトモード（デフォルト）**:
```css
背景:       #000000 (黒)
カード背景:  #0a0a0a, #1a1a1a (ダークグレー)
ボーダー:   #222, #333 (グレー)
テキスト:   #ffffff (白)
アクセント:  #666, #999 (ミッドグレー)
```

**ダークモード**:
```css
/* 基本的に同じパレットだが、成人向けコンテンツ表示 */
追加要素:   #ffffff (境界線強調)
```

### タイポグラフィ

**フォント**: Inter (Google Fonts)

```css
見出し:
  font-weight: 800 (Extra Bold)
  letter-spacing: 2px
  text-transform: uppercase

本文:
  font-weight: 600 (Semi Bold)

ラベル:
  font-weight: 700 (Bold)
  letter-spacing: 1-2px
  text-transform: uppercase
```

### アニメーション

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
```

### レスポンシブデザイン

**デスクトップ**:
- スマホフレーム表示（390×844px）
- 中央配置

**モバイル**:
- 全画面表示
- タッチ操作最適化

### インタラクション

**フィードバック**:
- ホバーエフェクト（PC）
- アクティブ状態のハイライト
- 振動フィードバック（モバイル）
- トランジションアニメーション（0.3s ease）

---

## 既知の問題と制限事項

### 🔴 重大な問題

1. **状態の永続化が未実装**
   - 場所: App.jsx:131-135
   - 影響: ページリロード時に全進捗が消失
   - 優先度: 高

2. **useEffectの依存配列が不完全**
   - 場所: PuzzleGame.jsx:185-196
   - 影響: パズル変更時に再初期化されない可能性
   - 優先度: 高

3. **未使用の状態変数**
   - 場所: PuzzleGame.jsx:12-13
   - 影響: 画像読み込み前にレンダリング問題
   - 優先度: 中

### 🟡 中程度の問題

4. **PropTypesが未定義**
   - 影響: 型安全性の欠如
   - 推奨: TypeScriptへの移行またはPropTypes導入

5. **コードの重複**
   - 場所: PuzzleGame.jsx:314-347, 274-312
   - 影響: 保守性の低下

6. **マジックナンバーの多用**
   - 場所: PuzzleGame.jsx全体
   - 影響: 可読性・保守性の低下

7. **不適切なUI要素**
   - 場所: PuzzleGame.jsx:357, Prizes.jsx:65
   - 問題: alert()使用
   - 影響: UX低下

8. **不要なファイル**
   - 場所: public/images/
   - 問題: `._*`ファイル（macOSメタデータ）5個
   - 影響: ビルドサイズ増加

### 🟢 軽微な問題

9. **アクセシビリティの欠如**
   - aria-label未使用
   - キーボードナビゲーション未対応
   - スクリーンリーダー対応不十分

10. **エラーハンドリングの不一致**
    - PuzzleList.jsxでは画像エラー処理あり
    - PuzzleGame.jsxではなし

11. **シャッフルの再現性がない**
    - 場所: PuzzleGame.jsx:227
    - 影響: デバッグ困難

12. **Props使用の不一致**
    - Prizes.jsxでdarkMode propを受け取るが未使用

---

## 今後の拡張予定

### 機能拡張

- [ ] **状態の永続化** (localStorage/IndexedDB)
- [ ] **ユーザー認証システム** (Firebase/Auth0)
- [ ] **ランキング機能** (バックエンドAPI必要)
- [ ] **ソーシャルシェア** (Web Share API)
- [ ] **サウンドエフェクト** (Web Audio API)
- [ ] **プレイ履歴** (統計情報)
- [ ] **マルチプレイヤーモード**
- [ ] **カスタムパズル作成** (画像アップロード)

### UI/UX改善

- [ ] **カスタムモーダル** (alert置き換え)
- [ ] **ローディングアニメーション**
- [ ] **完成時のアニメーション強化**
- [ ] **チュートリアルモード**
- [ ] **ヒント機能**
- [ ] **アンドゥ/リドゥ機能**

### 技術的改善

- [ ] **TypeScript移行**
- [ ] **テストコード追加** (Jest/React Testing Library)
- [ ] **パフォーマンス最適化** (React.memo, useMemo)
- [ ] **PWA対応** (Service Worker)
- [ ] **国際化対応** (i18n)
- [ ] **アクセシビリティ改善** (WCAG 2.1 AA準拠)

### インフラ

- [ ] **CI/CDパイプライン** (GitHub Actions)
- [ ] **デプロイ自動化** (Vercel/Netlify)
- [ ] **エラートラッキング** (Sentry)
- [ ] **アナリティクス** (Google Analytics/Plausible)

---

## 開発環境セットアップ

### 必要要件
- Node.js 16.x以上
- npm 7.x以上

### インストール手順

```bash
# 1. 依存関係のインストール
cd ikemen-puzzle-react
npm install

# 2. 開発サーバー起動
npm run dev

# 3. ブラウザでアクセス
# http://localhost:3000

# 4. ビルド（本番用）
npm run build

# 5. プレビュー
npm run preview
```

### 開発時の注意点

1. **Hot Module Replacement (HMR)**: コード変更は自動反映
2. **画像パス**: `/images/`から始まる絶対パス使用
3. **CSS Modules未使用**: クラス名の衝突に注意
4. **ESLint未設定**: コードスタイル統一に注意

---

## API仕様（将来の拡張用）

### エンドポイント案

```javascript
// ユーザー管理
GET    /api/users/:id
POST   /api/users/register
POST   /api/users/login

// パズル管理
GET    /api/puzzles
GET    /api/puzzles/:id
POST   /api/puzzles/:id/complete

// ランキング
GET    /api/rankings/global
GET    /api/rankings/friends

// 懸賞
GET    /api/prizes
POST   /api/prizes/:id/apply
GET    /api/prizes/history
```

---

## ライセンスと著作権

**作成者**: LIVERUSH株式会社
**ライセンス**: プロプライエタリ
**画像素材**: Pixabay（使用許諾済み）

---

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|----------|
| 1.0.0 | 2025-11-09 | 初回リリース |
| 1.0.1 | 2025-11-13 | ダークモード追加、成人向けコンテンツ機能追加 |

---

## 連絡先

技術的な質問やバグ報告は、プロジェクトのIssueトラッカーまでお願いします。

---

**最終更新**: 2025-11-14
