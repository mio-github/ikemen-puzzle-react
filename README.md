# IKEMEN PUZZLE - イケメンパズルゲーム

白と黒をベースにしたクールなデザインの、実際に遊べるジグソーパズルゲームです。

## 🎮 機能

### 実装済み機能
- ✅ **実際に遊べるジグソーパズル** (9/16/25/36ピース対応)
- ✅ **5つの画面**
  - ホーム画面（デイリーミッション、イベントバナー）
  - パズル一覧（5枚のイケメン画像）
  - パズルゲーム（ドラッグ不要、クリックで完成）
  - コレクション（30枠、達成率表示）
  - 懸賞画面（ポイント消費システム）
- ✅ **ゲームシステム**
  - タイマー・スコア計算
  - 進捗バー
  - ピース選択→スロット配置方式
  - 完成時のポイント獲得
- ✅ **モノクロデザイン**
  - 白と黒ベース
  - クールなアニメーション
  - スマホフレーム対応

## 📁 プロジェクト構造

```
ikemen-puzzle-react/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx
│   ├── index.css
│   ├── App.jsx
│   ├── App.css
│   └── components/
│       ├── Home.jsx & Home.css
│       ├── PuzzleList.jsx & PuzzleList.css
│       ├── PuzzleGame.jsx & PuzzleGame.css (実際に遊べるパズル)
│       ├── Collection.jsx & Collection.css
│       ├── Prizes.jsx & Prizes.css
│       └── Navigation.jsx & Navigation.css
└── README.md
```

## 🚀 起動方法

### 1. 依存関係のインストール
```bash
cd ikemen-puzzle-react
npm install
```

### 2. 開発サーバーの起動
```bash
npm run dev
```

ブラウザで `http://localhost:3000` が自動的に開きます。

### 3. ビルド（本番用）
```bash
npm run build
npm run preview
```

## 🎯 使い方

### パズルゲームのプレイ方法
1. **ホーム画面**から「START PUZZLE」をクリック
2. **パズル一覧**からお好きなパズルをクリック
3. **ゲーム画面**
   - 下部の「PIECES」からピースをクリックして選択
   - 上部のボードの正しい位置をクリックして配置
   - 間違った位置に配置するとスコアが減少
   - 全ピース完成でクリア！

### 難易度
- **EASY**: 9ピース (3×3)
- **NORMAL**: 16ピース (4×4)
- **HARD**: 25ピース (5×5)
- **EXPERT**: 36ピース (6×6)

## 🎨 デザインコンセプト

### カラーパレット
- **背景**: #000000 (黒)
- **カード**: #0a0a0a, #1a1a1a (ダークグレー)
- **ボーダー**: #222, #333 (グレー)
- **テキスト**: #ffffff (白)
- **アクセント**: #666, #999 (ミッドグレー)

### タイポグラフィ
- **フォント**: Inter (Google Fonts)
- **見出し**: 800 (Extra Bold), レタースペーシング 2px
- **本文**: 600 (Semi Bold)
- **ラベル**: 700 (Bold), 大文字, レタースペーシング 1-2px

### アニメーション
- fadeIn: 画面遷移
- slideUp: モーダル
- pulse: 強調
- shimmer: ローディング

## 🖼️ 画像アセット

使用画像（`../sample-base-images/`）:
- Pixabayビジネス風男性_1.jpg
- Pixabay AI男性_1.png
- Pixabay AI男性_2.png
- Pixabayアニメ男性_1.png
- アニメ風イケメン_1.jpg

## 📱 レスポンシブ対応

- デスクトップ: スマホフレーム表示 (390×844px)
- モバイル: 全画面表示
- タッチ操作対応

## 🔧 技術スタック

- **React**: 18.2.0
- **Vite**: 5.0.0 (高速ビルドツール)
- **Pure CSS**: アニメーション、レイアウト
- **ES Modules**: モダンなJavaScript

## ☁️ Vercelへのデプロイ

### 方法1: GitHubからの自動デプロイ（推奨）

1. **Vercelアカウントにログイン**
   - https://vercel.com にアクセス
   - GitHubアカウントで認証

2. **新規プロジェクトのインポート**
   - "Add New" → "Project" をクリック
   - GitHubリポジトリを選択: `mio-github/ikemen-puzzle-react`

3. **ビルド設定の確認**
   - Framework Preset: `Vite` （自動検出）
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **デプロイ**
   - "Deploy" ボタンをクリック
   - 数分で自動デプロイが完了

### 方法2: Vercel CLIを使用

```bash
# Vercel CLIをインストール
npm install -g vercel

# ログイン
vercel login

# デプロイ
vercel

# 本番環境へデプロイ
vercel --prod
```

### デプロイ後のURL

デプロイが完了すると、以下のような形式のURLが発行されます：
- **本番**: `https://ikemen-puzzle-react.vercel.app`
- **プレビュー**: `https://ikemen-puzzle-react-[hash].vercel.app`

### 自動デプロイの設定

GitHubと連携している場合、以下のブランチへのpushで自動デプロイされます：
- `main` ブランチ → 本番環境
- その他のブランチ → プレビュー環境

### カスタムドメインの設定

Vercelダッシュボードから独自ドメインを設定できます：
1. プロジェクトの "Settings" → "Domains" を開く
2. カスタムドメインを追加
3. DNSレコードを設定（ガイドに従う）

## 💡 今後の拡張案

- [ ] ドラッグ&ドロップ機能
- [ ] 回転モード
- [ ] ランキング機能
- [ ] ソーシャルシェア
- [ ] サウンドエフェクト
- [ ] より多くのパズル画像
- [ ] アニメーション効果の強化
- [ ] プレイ履歴保存（localStorage）

## 📝 ライセンス

このプロジェクトは LIVERUSH株式会社 のモックアップとして作成されました。

---

**作成日**: 2025年11月9日
**バージョン**: 1.0.0
