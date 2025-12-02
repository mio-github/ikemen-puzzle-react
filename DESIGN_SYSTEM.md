# IKEMEN PUZZLE - デザインシステム

## デザインコンセプト

**「クール＆モノトーン」** - ターゲット層（20〜30代女性）に向けた、洗練されたブラック＆ホワイトのミニマルデザイン。イケメンイラストを引き立てるために、UIは極力モノクロームに統一。

---

## カラーパレット

### ベースカラー

| 名前 | HEX | 用途 |
|------|-----|------|
| Pure Black | `#000000` | メイン背景 |
| Soft Black | `#0a0a0a` | カード背景、セカンダリ背景 |
| Dark Gray | `#1a1a1a` | ボーダー、グラデーション |
| Medium Gray | `#222222` | ボーダー（デフォルト） |
| Border Gray | `#333333` | ボーダー（アクティブ） |
| Muted Gray | `#444444` | ボーダー（ホバー） |

### テキストカラー

| 名前 | HEX | 用途 |
|------|-----|------|
| Pure White | `#ffffff` | 主要テキスト、タイトル |
| Light Gray | `#cccccc` | サブテキスト |
| Muted Text | `#aaaaaa` | 説明文 |
| Subtle Text | `#999999` | プレースホルダー、補足 |
| Dim Text | `#888888` | 非アクティブラベル |
| Disabled Text | `#666666` | 無効状態、ラベル |

### アクセントカラー

| 名前 | HEX | 用途 |
|------|-----|------|
| Error Red | `#ff4444` | エラー表示 |
| Error Dark | `#cc3333` | エラーボタンホバー |

### ダークモード専用（プレミアム）

| 名前 | HEX | 用途 |
|------|-----|------|
| Neon Purple | `#8a2be2` | プレミアムアクセント |
| Neon Cyan | `#00ffff` | プレミアムハイライト |

---

## タイポグラフィ

### フォントファミリー

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
             'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans',
             'Helvetica Neue', sans-serif;
```

### フォントサイズ

| 用途 | サイズ | ウェイト | letter-spacing |
|------|--------|----------|----------------|
| ロゴメイン | 20-28px | 800-900 | 2-4px |
| 画面タイトル | 18-24px | 800 | 1-2px |
| セクションタイトル | 12px | 700 | 2px |
| カードタイトル | 13-16px | 600-700 | - |
| ボタンテキスト | 13-14px | 700-800 | 1-2px |
| ラベル | 9-11px | 600-700 | 1-1.5px |
| 本文 | 12-14px | 400-500 | - |

### テキストスタイルガイド

- **大文字表記（UPPERCASE）**: タイトル、ラベル、ボタンに使用
- **日本語**: 説明文、ダイアログメッセージに使用
- **混在**: 「IKEMEN PUZZLE」のようなブランド名

---

## スペーシング

### 基本単位

- 最小: `4px`
- 基本: `8px`
- 標準: `12px`
- 中: `16px`
- 大: `20px`
- 特大: `24px`
- セクション: `32px`

### ヘッダー

```css
padding: 60px 24px 24px; /* iOS Safe Area考慮 */
```

### コンテンツ

```css
padding: 0 24px 24px;
```

---

## ボーダー＆角丸

### 角丸サイズ

| 用途 | サイズ |
|------|--------|
| スマホフレーム | 40px |
| 大型カード/モーダル | 20-24px |
| カード | 16px |
| ボタン | 10-16px |
| バッジ/タグ | 12px |
| 小型要素 | 4-8px |
| 円形 | 50% |

### ボーダースタイル

```css
/* デフォルト */
border: 1px solid #222;

/* アクティブ */
border: 1px solid #333;

/* ホバー */
border: 1px solid #444;

/* 強調 */
border: 2px solid #ffffff;
```

---

## シャドウ＆エフェクト

### ボックスシャドウ

```css
/* スマホフレーム */
box-shadow:
  0 0 0 8px #0a0a0a,
  0 0 0 12px #1a1a1a,
  0 40px 80px rgba(0, 0, 0, 0.8);

/* ホバー時 */
box-shadow: 0 8px 24px rgba(255, 255, 255, 0.2);

/* モーダル */
box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
```

### グラデーション

```css
/* 背景 */
background: radial-gradient(circle at 50% 50%, #1a1a1a 0%, #000000 100%);

/* カード */
background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);

/* ヘッダーフェード */
background: linear-gradient(180deg, #0a0a0a 0%, transparent 100%);

/* ボタン（プライマリ） */
background: linear-gradient(135deg, #ffffff 0%, #cccccc 100%);

/* ボタン（プライマリ・ホバー） */
background: linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%);
```

### ダークモード専用グラデーション

```css
/* 背景 */
background: #000000;
background-image:
  radial-gradient(circle at 20% 30%, rgba(138, 43, 226, 0.15) 0%, transparent 50%),
  radial-gradient(circle at 80% 70%, rgba(0, 255, 255, 0.15) 0%, transparent 50%);

/* フレームグロー */
box-shadow:
  0 0 0 8px #000000,
  0 0 0 12px #1a1a1a,
  0 0 20px rgba(138, 43, 226, 0.5),
  0 0 40px rgba(0, 255, 255, 0.3),
  0 40px 80px rgba(0, 0, 0, 0.8);
```

---

## ボタンスタイル

### プライマリボタン

```css
.btn-primary {
  background: linear-gradient(135deg, #ffffff 0%, #cccccc 100%);
  color: #000000;
  border: none;
  padding: 16-18px;
  border-radius: 12-16px;
  font-size: 13-14px;
  font-weight: 700-800;
  letter-spacing: 1-2px;
  text-transform: uppercase;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255, 255, 255, 0.2);
}
```

### セカンダリボタン

```css
.btn-secondary {
  background: transparent;
  color: #ffffff;
  border: 1px solid #ffffff;
  padding: 12-18px;
  border-radius: 12-16px;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
}
```

### キャンセルボタン

```css
.btn-cancel {
  background: transparent;
  color: #999;
  border: 1px solid #444;
}

.btn-cancel:hover {
  color: #ffffff;
  border-color: #666;
}
```

---

## カードスタイル

### 基本カード

```css
.card {
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
  border: 1px solid #222;
  border-radius: 16px;
  padding: 16px;
}

.card:hover {
  border-color: #444;
  transform: translateX(4px); /* または translateY(-4px) */
}
```

### ステータスカード

```css
.stat-card {
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
  border: 1px solid #222;
  border-radius: 16px;
  padding: 16px 12px;
  text-align: center;
}
```

---

## アニメーション

### トランジション

```css
/* 基本 */
transition: all 0.3s ease;

/* 高速 */
transition: all 0.2s ease;

/* スムーズ */
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

/* バウンス */
transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
```

### キーフレーム

```css
/* フェードイン */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* スライドアップ */
@keyframes slideUp {
  from { opacity: 0; transform: translateY(100%); }
  to { opacity: 1; transform: translateY(0); }
}

/* パルス */
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* グロー（パズル結合時） */
@keyframes groupGlow {
  0% { filter: drop-shadow(0 0 0 rgba(255, 255, 255, 0)); }
  30% {
    filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.9))
            drop-shadow(0 0 40px rgba(255, 255, 255, 0.6))
            drop-shadow(0 0 60px rgba(255, 255, 255, 0.3));
  }
  100% { filter: drop-shadow(0 0 0 rgba(255, 255, 255, 0)); }
}
```

---

## モーダル＆オーバーレイ

### オーバーレイ

```css
.overlay {
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
}
```

### モーダル

```css
.modal {
  background: linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%);
  border: 2px solid #333;
  border-radius: 20-24px;
  padding: 32px 24px;
  max-width: 340-360px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
}
```

---

## レスポンシブ

### ブレークポイント

- **モバイル（デフォルト）**: ~768px
- **タブレット以上**: 768px~

### モバイル最適化

```css
@media (max-width: 768px) {
  .phone-frame {
    max-width: 100%;
    height: 100vh;
    border-radius: 0;
    box-shadow: none;
  }
}
```

---

## アイコン＆記号

### 使用記号

| 記号 | 用途 |
|------|------|
| ⊞ | パズルアイコン、ロゴ |
| ★ | 完成、達成 |
| ⋆ | 景品、報酬 |
| ✓ | 完了チェック |
| × | 閉じる |
| ← | 戻る |
| › | 進む、詳細へ |
| 🌙 | ダークモード |
| ☀️ | ライトモード |
| 🔒 | ロック状態 |
| ☺ | プレミアムコイン |

---

## コンポーネント命名規則

### CSS クラス命名

- **BEM風**: `.component-name`, `.component-name__element`, `.component-name--modifier`
- **状態**: `.active`, `.completed`, `.disabled`, `.dark-mode`
- **アクション**: `.primary`, `.secondary`, `.cancel`

### 例

```css
.puzzle-card { }
.puzzle-card__image { }
.puzzle-card__title { }
.puzzle-card--completed { }
.puzzle-card--locked { }
```

---

## 実装チェックリスト

- [ ] ベース背景色は `#000000`
- [ ] カード背景は `#0a0a0a` または `#1a1a1a`
- [ ] ボーダーは `#222` をデフォルトに
- [ ] プライマリボタンは白グラデーション
- [ ] テキストは大文字（英語部分）
- [ ] letter-spacing を適用
- [ ] ホバー時に `translateY(-2px)` と `box-shadow` 追加
- [ ] トランジションは `0.3s ease`
- [ ] 角丸は用途に応じて 12-20px

---

## CSS変数（推奨）

将来的にテーマ切り替えを容易にするため、CSS変数の導入を推奨：

```css
:root {
  /* Colors */
  --color-bg-primary: #000000;
  --color-bg-secondary: #0a0a0a;
  --color-bg-tertiary: #1a1a1a;
  --color-border-default: #222222;
  --color-border-active: #333333;
  --color-border-hover: #444444;
  --color-text-primary: #ffffff;
  --color-text-secondary: #cccccc;
  --color-text-muted: #999999;
  --color-text-disabled: #666666;
  --color-error: #ff4444;

  /* Dark Mode Premium */
  --color-neon-purple: #8a2be2;
  --color-neon-cyan: #00ffff;

  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 20px;
  --spacing-2xl: 24px;
  --spacing-3xl: 32px;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 20px;
  --radius-3xl: 24px;
  --radius-full: 50%;

  /* Transitions */
  --transition-fast: 0.2s ease;
  --transition-default: 0.3s ease;
  --transition-smooth: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-bounce: 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
```
