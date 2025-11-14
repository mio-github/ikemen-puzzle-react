# Vercelデプロイガイド

このドキュメントでは、IKEMEN PUZZLEアプリケーションをVercelにデプロイする手順を詳しく説明します。

---

## 📋 前提条件

- GitHubアカウント
- Vercelアカウント（無料プランでOK）
- このリポジトリへのアクセス権限

---

## 🚀 デプロイ手順（GitHubからの自動デプロイ）

### Step 1: Vercelアカウントの作成・ログイン

1. https://vercel.com にアクセス
2. "Sign Up" をクリック（アカウントがない場合）
3. "Continue with GitHub" を選択してGitHubと連携
4. Vercelからのアクセス許可を承認

### Step 2: 新規プロジェクトのインポート

1. Vercelダッシュボードで "Add New..." → "Project" をクリック
2. "Import Git Repository" セクションで "Continue with GitHub" を選択
3. リポジトリ一覧から `mio-github/ikemen-puzzle-react` を探す
   - 見つからない場合は "Adjust GitHub App Permissions" をクリック
   - リポジトリへのアクセス権限を付与
4. "Import" ボタンをクリック

### Step 3: プロジェクト設定の確認

Vercelは自動的にViteプロジェクトを検出しますが、以下の設定を確認してください：

| 設定項目 | 値 |
|---------|-----|
| **Framework Preset** | Vite |
| **Root Directory** | ./ |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

**環境変数**（現時点では不要）:
- 今のところ設定する環境変数はありません
- 将来的にAPIキーなどが必要になった場合はここで設定

### Step 4: デプロイ実行

1. すべての設定を確認したら "Deploy" ボタンをクリック
2. ビルドプロセスが開始されます（約1〜3分）
3. デプロイが完了すると成功画面が表示されます

### Step 5: デプロイ確認

デプロイが成功すると、以下のURLが発行されます：
```
https://ikemen-puzzle-react-[unique-id].vercel.app
```

"Visit" ボタンをクリックしてアプリケーションを確認してください。

---

## 🔄 自動デプロイの仕組み

Vercelは以下のブランチでの変更を自動的にデプロイします：

### 本番環境（Production）
- **対象ブランチ**: `main` または `master`
- **URL**: `https://ikemen-puzzle-react.vercel.app`
- mainブランチにpush/マージすると自動デプロイ

### プレビュー環境（Preview）
- **対象ブランチ**: `main`以外の全てのブランチ
- **URL**: `https://ikemen-puzzle-react-[branch-name]-[hash].vercel.app`
- プルリクエストごとに一意のURLが生成されます

---

## 🌐 カスタムドメインの設定

独自ドメインを使用する場合：

### Step 1: ドメインの追加

1. Vercelダッシュボードでプロジェクトを選択
2. "Settings" → "Domains" を開く
3. "Add Domain" ボタンをクリック
4. ドメイン名を入力（例: `ikemen-puzzle.com`）

### Step 2: DNS設定

ドメインレジストラ（お名前.com、ムームードメインなど）で以下のDNSレコードを設定：

#### Aレコード（推奨）
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600
```

#### CNAMEレコード
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

### Step 3: SSL証明書

- Vercelは自動的にSSL証明書（Let's Encrypt）を発行します
- 通常、ドメイン追加から数分〜数時間で有効化されます

---

## 🔧 Vercel CLIを使用したデプロイ

コマンドラインからデプロイする場合：

### インストール

```bash
npm install -g vercel
```

### 初回デプロイ

```bash
# プロジェクトディレクトリで実行
cd ikemen-puzzle-react

# ログイン
vercel login

# デプロイ（プレビュー）
vercel

# 本番環境へデプロイ
vercel --prod
```

### 再デプロイ

```bash
# プレビュー環境
vercel

# 本番環境
vercel --prod
```

---

## 📊 デプロイメントの監視

### ビルドログの確認

1. Vercelダッシュボードで "Deployments" タブを開く
2. 各デプロイメントをクリックして詳細を確認
3. "Building" タブでビルドログを表示

### エラーが発生した場合

**よくあるエラーと対処法**:

#### 1. Build failed
```
Error: Cannot find module 'react'
```
**対処法**: package.jsonに全ての依存関係が記載されているか確認

#### 2. Image not found
```
404: Image not found
```
**対処法**: 画像パスが正しいか確認。`/images/`から始まる絶対パスを使用

#### 3. Blank page
**対処法**:
- ブラウザのコンソールでエラーを確認
- `vite.config.js`の`base`設定を確認

---

## 🔐 環境変数の管理

将来的にAPIキーなどが必要になった場合：

### Vercelダッシュボードで設定

1. プロジェクトの "Settings" → "Environment Variables" を開く
2. "Add New" をクリック
3. 変数名と値を入力
   - `VITE_API_KEY`: APIキー
   - `VITE_API_URL`: APIのURL
4. 適用する環境を選択（Production / Preview / Development）

### コードでの使用

```javascript
// Vite環境変数は VITE_ プレフィックスが必要
const apiKey = import.meta.env.VITE_API_KEY
const apiUrl = import.meta.env.VITE_API_URL
```

**注意**: 環境変数を追加した場合は再デプロイが必要です。

---

## 📈 パフォーマンス最適化

### 推奨設定

Vercelダッシュボードで以下の設定を有効化：

1. **Edge Functions**: エッジでの高速レスポンス（無料プランでは制限あり）
2. **Analytics**: アクセス解析の有効化
3. **Speed Insights**: パフォーマンスの監視

### ビルド最適化

`vite.config.js`での最適化例：

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom']
        }
      }
    }
  }
})
```

---

## 🚨 トラブルシューティング

### デプロイが失敗する

1. **ローカルでビルドテスト**
   ```bash
   npm run build
   ```

2. **依存関係の確認**
   ```bash
   npm install
   ```

3. **Node.jsバージョンの確認**
   - Vercelは Node.js 18.x を推奨
   - `package.json`で指定可能:
     ```json
     {
       "engines": {
         "node": ">=18.0.0"
       }
     }
     ```

### ページが真っ白

1. ブラウザのデベロッパーツールを開く
2. Console タブでエラーメッセージを確認
3. Network タブで404エラーがないか確認

### 画像が表示されない

1. 画像パスが正しいか確認
2. `public/images/` に画像が存在するか確認
3. 大文字小文字の違いに注意（Linuxは区別します）

---

## 📞 サポート

問題が解決しない場合：

1. **Vercel公式ドキュメント**: https://vercel.com/docs
2. **Vite公式ドキュメント**: https://vitejs.dev/guide/
3. **GitHubのIssue**: プロジェクトリポジトリでIssueを作成

---

## ✅ デプロイチェックリスト

デプロイ前に以下を確認：

- [ ] `npm run build` がローカルで成功する
- [ ] `package.json` に全ての依存関係が記載されている
- [ ] `.gitignore` に `node_modules` と `dist` が含まれている
- [ ] 画像ファイルが `public/images/` に配置されている
- [ ] 本番環境で不要なコンソールログを削除
- [ ] README.mdが最新の情報に更新されている

---

**最終更新**: 2025-11-14
**バージョン**: 1.0.0
