# Draradech ジグソーパズル生成アルゴリズム解析

## 概要

このドキュメントは、Draradech氏が開発したジグソーパズル生成アルゴリズムの解析結果です。

- **オリジナルソース**: https://github.com/Draradech/jigsaw
- **ライブデモ**: https://draradech.github.io/jigsaw/jigsaw.html

## アルゴリズムの特徴

1. **シード値ベースの乱数生成** - 再現可能なパズル生成
2. **3つのベジエ曲線** - 1辺あたり10個の制御点を使用
3. **パラメータ調整可能** - タブサイズ、ジッター（歪み）を設定可能

---

## パラメータ

| パラメータ | 説明 | 典型値 | 計算式 |
|-----------|------|--------|--------|
| `seed` | 乱数シード | 0-9999 | - |
| `t` (tabsize) | タブの大きさ | 20% | `tabsize / 200.0` → 0.1 |
| `j` (jitter) | 歪みの大きさ | 4% | `jitter / 100.0` → 0.04 |

---

## 乱数生成

```javascript
var seed = 1;

// sin関数ベースの乱数生成（再現可能）
function random() {
  var x = Math.sin(seed) * 10000;
  seed += 1;
  return x - Math.floor(x);
}

// 範囲指定の一様乱数
function uniform(min, max) {
  var r = random();
  return min + r * (max - min);
}

// ブール値（タブの向きを決定）
function rbool() {
  return random() > 0.5;
}
```

---

## エッジごとの乱数変数

各エッジ（辺）に対して以下の変数が生成されます：

| 変数 | 説明 | 範囲 |
|------|------|------|
| `flip` | タブの向き（true=凸, false=凹） | boolean |
| `a` | 肩部分の開始オフセット | [-j, j] |
| `b` | 中心位置のオフセット | [-j, j] |
| `c` | 幅方向のオフセット | [-j, j] |
| `d` | 首部分のオフセット | [-j, j] |
| `e` | 肩部分の終了オフセット | [-j, j] |

```javascript
function first() {
  e = uniform(-j, j);
  next();
}

function next() {
  var flipold = flip;
  flip = rbool();
  // 隣接エッジとの連続性を保つ
  a = (flip == flipold ? -e : e);
  b = uniform(-j, j);
  c = uniform(-j, j);
  d = uniform(-j, j);
  e = uniform(-j, j);
}
```

---

## 座標変換関数

```javascript
// sl: セグメントの長さ方向のサイズ
function sl() {
  return vertical ? height / yn : width / xn;
}

// sw: セグメントの幅方向のサイズ
function sw() {
  return vertical ? width / xn : height / yn;
}

// ol: 長さ方向のオフセット
function ol() {
  return offset + sl() * (vertical ? yi : xi);
}

// ow: 幅方向のオフセット
function ow() {
  return offset + sw() * (vertical ? xi : yi);
}

// l: 正規化座標(0-1)を実座標に変換（長さ方向）
function l(v) {
  return ol() + sl() * v;
}

// w: 正規化座標を実座標に変換（幅方向、flipで符号反転）
function w(v) {
  return ow() + sw() * v * (flip ? -1.0 : 1.0);
}
```

---

## 10個の制御点

各エッジは10個の制御点で構成され、3つの3次ベジエ曲線を形成します。

### 制御点の定義

```
エッジの流れ: p0 → [p1,p2,p3] → [p4,p5,p6] → [p7,p8,p9]
              ↑      ↑           ↑           ↑
           開始点  曲線1       曲線2       曲線3
                  (肩→首)    (頭部分)    (首→肩)
```

### 各点の座標計算

```javascript
// p0: エッジ開始点
function p0l() { return l(0.0); }
function p0w() { return w(0.0); }

// p1: 肩の開始（制御点）
function p1l() { return l(0.2); }
function p1w() { return w(a); }

// p2: 首への入り口（制御点）
function p2l() { return l(0.5 + b + d); }
function p2w() { return w(-t + c); }

// p3: 首の位置（頭の付け根）
function p3l() { return l(0.5 - t + b); }
function p3w() { return w(t + c); }

// p4: 頭の左側（制御点）
function p4l() { return l(0.5 - 2.0 * t + b - d); }
function p4w() { return w(3.0 * t + c); }

// p5: 頭の右側（制御点）
function p5l() { return l(0.5 + 2.0 * t + b - d); }
function p5w() { return w(3.0 * t + c); }

// p6: 首の位置（頭の終わり）
function p6l() { return l(0.5 + t + b); }
function p6w() { return w(t + c); }

// p7: 首からの出口（制御点）
function p7l() { return l(0.5 + b + d); }
function p7w() { return w(-t + c); }

// p8: 肩の終了（制御点）
function p8l() { return l(0.8); }
function p8w() { return w(e); }

// p9: エッジ終了点
function p9l() { return l(1.0); }
function p9w() { return w(0.0); }
```

---

## 形状の視覚化

```
       p4 ●━━━━━━━━● p5      ← 頭の頂点 (w = 3t)
          ╲        ╱
           ╲      ╱
      p3 ●──●────●──● p6     ← 首 (w = t)
          p2      p7
         ╱          ╲
        ╱            ╲
  p1 ●                 ● p8  ← 肩 (w = a, e)
      │                 │
 p0 ●─┘                 └─● p9  ← エッジライン (w = 0)

  ←──────── 0.0 ～ 1.0 ──────────→
         長さ方向 (l)
```

### t (tabsize) パラメータの影響

- `t = 0.1` (20%の場合): 適度なタブサイズ
- 頭の幅: `3t = 0.3` (セグメント幅の30%)
- 首の位置: `0.5 ± t` (中心から±10%)
- 頭の範囲: `0.5 ± 2t` (中心から±20%)

---

## SVGパス生成

### 水平エッジの生成

```javascript
function gen_dh() {
  var str = "";
  vertical = 0;

  for (yi = 1; yi < yn; ++yi) {
    xi = 0;
    first();
    str += "M " + p0l() + "," + p0w() + " ";

    for (; xi < xn; ++xi) {
      // 曲線1: 肩→首
      str += "C " + p1l() + " " + p1w() + " "
                  + p2l() + " " + p2w() + " "
                  + p3l() + " " + p3w() + " ";
      // 曲線2: 頭
      str += "C " + p4l() + " " + p4w() + " "
                  + p5l() + " " + p5w() + " "
                  + p6l() + " " + p6w() + " ";
      // 曲線3: 首→肩
      str += "C " + p7l() + " " + p7w() + " "
                  + p8l() + " " + p8w() + " "
                  + p9l() + " " + p9w() + " ";
      next();
    }
  }
  return str;
}
```

---

## 隣接ピースの噛み合わせ

### 重要なポイント

1. **同じシード値** - 同じシードから生成されたエッジは完全に一致
2. **flip反転** - 隣接ピースでは`flip`を反転することでタブ↔ソケットが対応
3. **連続性** - `a = (flip == flipold ? -e : e)` により肩の接続が滑らか

### 実装での考慮

個別ピース生成時は、各エッジのデータ（flip, a, b, c, d, e）を保存し、
隣接ピースで同じデータを使用（flipのみ反転）する必要があります。

---

## サンプルコード（React用）

```javascript
// シード値ベースの乱数生成器
const createRandom = (seed) => {
  let s = seed;
  return () => {
    const x = Math.sin(s) * 10000;
    s += 1;
    return x - Math.floor(x);
  };
};

// エッジデータの生成
const generateEdgeData = (seed, jitter) => {
  const random = createRandom(seed);
  const uniform = (min, max) => min + random() * (max - min);

  return {
    flip: random() > 0.5,
    a: uniform(-jitter, jitter),
    b: uniform(-jitter, jitter),
    c: uniform(-jitter, jitter),
    d: uniform(-jitter, jitter),
    e: uniform(-jitter, jitter)
  };
};

// 1辺のSVGパスを生成
const createEdgePath = (edgeData, pieceSize, tabSize, direction) => {
  const { flip, a, b, c, d, e } = edgeData;
  const t = tabSize;
  const s = pieceSize;
  const dir = flip ? -1 : 1;

  // 正規化座標を実座標に変換
  const l = (v) => s * v;
  const w = (v) => s * v * dir;

  // 10個の制御点
  const points = [
    { l: l(0.0), w: w(0) },
    { l: l(0.2), w: w(a) },
    { l: l(0.5 + b + d), w: w(-t + c) },
    { l: l(0.5 - t + b), w: w(t + c) },
    { l: l(0.5 - 2*t + b - d), w: w(3*t + c) },
    { l: l(0.5 + 2*t + b - d), w: w(3*t + c) },
    { l: l(0.5 + t + b), w: w(t + c) },
    { l: l(0.5 + b + d), w: w(-t + c) },
    { l: l(0.8), w: w(e) },
    { l: l(1.0), w: w(0) }
  ];

  // SVGパス文字列を生成
  let path = `L ${points[0].l} ${points[0].w}`;
  path += ` C ${points[1].l} ${points[1].w}, ${points[2].l} ${points[2].w}, ${points[3].l} ${points[3].w}`;
  path += ` C ${points[4].l} ${points[4].w}, ${points[5].l} ${points[5].w}, ${points[6].l} ${points[6].w}`;
  path += ` C ${points[7].l} ${points[7].w}, ${points[8].l} ${points[8].w}, ${points[9].l} ${points[9].w}`;

  return path;
};
```

---

## 参考リンク

- [Draradech/jigsaw - GitHub](https://github.com/Draradech/jigsaw)
- [Jigsaw Puzzle Generator - Live Demo](https://draradech.github.io/jigsaw/jigsaw.html)
- [mono.jpn.com - ジグソーパズルジェネレーター紹介](https://mono.jpn.com/2020/05/29/7805/)
