import { useState, useEffect, useRef, useCallback } from 'react'
import './PuzzleGame.css'

const PuzzleGame = ({ puzzle, onComplete, onBack }) => {
  const [pieces, setPieces] = useState([])
  const [timer, setTimer] = useState(0)
  const [score, setScore] = useState(0)
  const [glowingGroup, setGlowingGroup] = useState(null)
  const [dragging, setDragging] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const timerRef = useRef(null)
  const boardRef = useRef(null)
  const containerRef = useRef(null)

  // グリッドサイズを計算
  const gridSize = Math.sqrt(puzzle.pieces)

  // ピースサイズ（SVG単位）- ボード上での1ピースのサイズ
  const PIECE_SIZE = 50
  const SNAP_THRESHOLD = 15 // スナップ判定の距離

  // シード値ベースの乱数生成（Draradechアルゴリズム準拠）
  const createRandom = (seed) => {
    let s = seed
    return () => {
      const x = Math.sin(s) * 10000
      s += 1
      return x - Math.floor(x)
    }
  }

  // Draradechアルゴリズムのパラメータ
  // 参考: https://github.com/Draradech/jigsaw
  const TAB_SIZE = 0.1    // タブサイズ 20% → 20/200 = 0.1
  const JITTER = 0.04     // ジッター 4% → 4/100 = 0.04

  // ジグソーピースの形状データを生成（Draradechアルゴリズム準拠）
  const generateJigsawShape = useCallback((row, col, gridSize, edgeData) => {
    const t = TAB_SIZE
    const j = JITTER

    // 各エッジのフリップ状態とジッター値を保存
    if (!edgeData.horizontal) edgeData.horizontal = {}
    if (!edgeData.vertical) edgeData.vertical = {}

    // 一様乱数 [-j, j]
    const uniform = (random) => random() * j * 2 - j

    const getHorizontalEdge = (r, c) => {
      const key = `h_${r}_${c}`
      if (!edgeData.horizontal[key]) {
        const random = createRandom(puzzle.id * 1000 + r * 100 + c)
        edgeData.horizontal[key] = {
          flip: random() > 0.5,
          a: uniform(random),
          b: uniform(random),
          c: uniform(random),
          d: uniform(random),
          e: uniform(random)
        }
      }
      return edgeData.horizontal[key]
    }

    const getVerticalEdge = (r, c) => {
      const key = `v_${r}_${c}`
      if (!edgeData.vertical[key]) {
        const random = createRandom(puzzle.id * 2000 + r * 100 + c)
        edgeData.vertical[key] = {
          flip: random() > 0.5,
          a: uniform(random),
          b: uniform(random),
          c: uniform(random),
          d: uniform(random),
          e: uniform(random)
        }
      }
      return edgeData.vertical[key]
    }

    // エッジを反転（隣接ピースから見た場合）
    const reverseEdge = (edge) => {
      if (!edge) return null
      return {
        flip: !edge.flip, // タブ/ソケットを反転
        a: edge.a,
        b: edge.b,
        c: edge.c,
        d: edge.d,
        e: edge.e
      }
    }

    return {
      // 上辺：row行の水平エッジを反転して使用
      top: row > 0 ? reverseEdge(getHorizontalEdge(row, col)) : null,
      // 右辺：col+1列の垂直エッジをそのまま使用
      right: col < gridSize - 1 ? getVerticalEdge(row, col + 1) : null,
      // 下辺：row+1行の水平エッジをそのまま使用
      bottom: row < gridSize - 1 ? getHorizontalEdge(row + 1, col) : null,
      // 左辺：col列の垂直エッジを反転して使用
      left: col > 0 ? reverseEdge(getVerticalEdge(row, col)) : null,
      t,
      j
    }
  }, [puzzle.id])

  // SVGパスを生成（Draradechアルゴリズム - 10制御点方式）
  // 参考: https://github.com/Draradech/jigsaw
  const createPiecePath = (shape, pieceWidth, pieceHeight) => {
    const { top, right, bottom, left, t } = shape
    const w = pieceWidth
    const h = pieceHeight

    // Draradechアルゴリズムの10制御点を計算
    // p0→p3: 肩から首へ, p3→p6: 頭部分, p6→p9: 首から肩へ
    const getDraradechPoints = (edge, segmentLen) => {
      if (!edge) return null

      const { flip, a, b, c, d, e } = edge
      const s = segmentLen
      const dir = flip ? -1 : 1

      // 長さ方向の座標 (0→1の正規化座標をピクセルに変換)
      const l = (v) => s * v

      // 幅方向の座標 (flipで符号反転)
      const wCoord = (v) => s * v * dir

      return {
        p0: { l: l(0.0), w: wCoord(0) },
        p1: { l: l(0.2), w: wCoord(a) },
        p2: { l: l(0.5 + b + d), w: wCoord(-t + c) },
        p3: { l: l(0.5 - t + b), w: wCoord(t + c) },
        p4: { l: l(0.5 - 2*t + b - d), w: wCoord(3*t + c) },
        p5: { l: l(0.5 + 2*t + b - d), w: wCoord(3*t + c) },
        p6: { l: l(0.5 + t + b), w: wCoord(t + c) },
        p7: { l: l(0.5 + b + d), w: wCoord(-t + c) },
        p8: { l: l(0.8), w: wCoord(e) },
        p9: { l: l(1.0), w: wCoord(0) }
      }
    }

    let path = `M 0 0`

    // 上辺 (左から右へ、y=0がベースライン)
    if (top) {
      const pts = getDraradechPoints(top, w)
      // l→x, w→y (上向きが負なのでそのまま)
      path += ` C ${pts.p1.l} ${pts.p1.w}, ${pts.p2.l} ${pts.p2.w}, ${pts.p3.l} ${pts.p3.w}`
      path += ` C ${pts.p4.l} ${pts.p4.w}, ${pts.p5.l} ${pts.p5.w}, ${pts.p6.l} ${pts.p6.w}`
      path += ` C ${pts.p7.l} ${pts.p7.w}, ${pts.p8.l} ${pts.p8.w}, ${pts.p9.l} ${pts.p9.w}`
    } else {
      path += ` L ${w} 0`
    }

    // 右辺 (上から下へ、x=wがベースライン)
    if (right) {
      const pts = getDraradechPoints(right, h)
      // l→y, w→x (右向きが正なのでwを加算)
      path += ` C ${w + pts.p1.w} ${pts.p1.l}, ${w + pts.p2.w} ${pts.p2.l}, ${w + pts.p3.w} ${pts.p3.l}`
      path += ` C ${w + pts.p4.w} ${pts.p4.l}, ${w + pts.p5.w} ${pts.p5.l}, ${w + pts.p6.w} ${pts.p6.l}`
      path += ` C ${w + pts.p7.w} ${pts.p7.l}, ${w + pts.p8.w} ${pts.p8.l}, ${w + pts.p9.w} ${pts.p9.l}`
    } else {
      path += ` L ${w} ${h}`
    }

    // 下辺 (右から左へ、y=hがベースライン)
    if (bottom) {
      const pts = getDraradechPoints(bottom, w)
      // 右から左なので、lを反転 (w - l)、wは下向きが正なので加算
      path += ` C ${w - pts.p1.l} ${h + pts.p1.w}, ${w - pts.p2.l} ${h + pts.p2.w}, ${w - pts.p3.l} ${h + pts.p3.w}`
      path += ` C ${w - pts.p4.l} ${h + pts.p4.w}, ${w - pts.p5.l} ${h + pts.p5.w}, ${w - pts.p6.l} ${h + pts.p6.w}`
      path += ` C ${w - pts.p7.l} ${h + pts.p7.w}, ${w - pts.p8.l} ${h + pts.p8.w}, ${w - pts.p9.l} ${h + pts.p9.w}`
    } else {
      path += ` L 0 ${h}`
    }

    // 左辺 (下から上へ、x=0がベースライン)
    if (left) {
      const pts = getDraradechPoints(left, h)
      // 下から上なのでlを反転 (h - l)、wは左向きが負なので減算
      path += ` C ${-pts.p1.w} ${h - pts.p1.l}, ${-pts.p2.w} ${h - pts.p2.l}, ${-pts.p3.w} ${h - pts.p3.l}`
      path += ` C ${-pts.p4.w} ${h - pts.p4.l}, ${-pts.p5.w} ${h - pts.p5.l}, ${-pts.p6.w} ${h - pts.p6.l}`
      path += ` C ${-pts.p7.w} ${h - pts.p7.l}, ${-pts.p8.w} ${h - pts.p8.l}, ${-pts.p9.w} ${h - pts.p9.l}`
    } else {
      path += ` L 0 0`
    }

    path += ` Z`
    return path
  }

  // 初期化
  useEffect(() => {
    initializePuzzle()

    timerRef.current = setInterval(() => {
      setTimer(prev => prev + 1)
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const initializePuzzle = () => {
    const edgeData = { horizontal: {}, vertical: {} }
    const newPieces = []

    // ボードのサイズを取得（初期配置用）
    const boardWidth = gridSize * PIECE_SIZE
    const boardHeight = gridSize * PIECE_SIZE

    for (let i = 0; i < puzzle.pieces; i++) {
      const row = Math.floor(i / gridSize)
      const col = i % gridSize
      const shape = generateJigsawShape(row, col, gridSize, edgeData)

      // 初期位置をランダムに散らばらせる（ボード下部の領域に）
      const randomX = Math.round(Math.random() * (boardWidth - PIECE_SIZE * 0.5))
      const randomY = Math.round(boardHeight + 30 + Math.random() * 100)

      newPieces.push({
        id: i,
        row,
        col,
        shape,
        x: randomX,
        y: randomY,
        groupId: i, // 初期状態では各ピースが独立したグループ
        zIndex: i
      })
    }

    // シャッフルしてz-indexを設定
    const shuffled = newPieces.sort(() => Math.random() - 0.5)
    shuffled.forEach((piece, index) => {
      piece.zIndex = index
    })

    setPieces(shuffled)
  }

  // グループ内のピースを取得
  const getGroupPieces = useCallback((groupId) => {
    return pieces.filter(p => p.groupId === groupId)
  }, [pieces])

  // 2つのピースが隣接関係にあるかチェック
  const areNeighbors = (piece1, piece2) => {
    const rowDiff = piece1.row - piece2.row
    const colDiff = piece1.col - piece2.col
    return (Math.abs(rowDiff) === 1 && colDiff === 0) ||
           (rowDiff === 0 && Math.abs(colDiff) === 1)
  }

  // ピースの正しい相対位置を計算
  const getCorrectRelativePosition = (basePiece, targetPiece) => {
    const rowDiff = targetPiece.row - basePiece.row
    const colDiff = targetPiece.col - basePiece.col
    return {
      x: colDiff * PIECE_SIZE,
      y: rowDiff * PIECE_SIZE
    }
  }

  // 隣接ピースとの結合判定
  const checkAndMerge = useCallback((movedPiece, allPieces) => {
    const currentGroup = allPieces.filter(p => p.groupId === movedPiece.groupId)
    let merged = false
    let newGroupId = movedPiece.groupId
    let mergedPieces = [...allPieces]

    // 現在のグループの各ピースについて、隣接可能なピースをチェック
    for (const groupPiece of currentGroup) {
      for (const otherPiece of allPieces) {
        // 同じグループはスキップ
        if (otherPiece.groupId === groupPiece.groupId) continue

        // 隣接関係にあるかチェック
        if (!areNeighbors(groupPiece, otherPiece)) continue

        // 正しい相対位置を計算
        const correctRelPos = getCorrectRelativePosition(groupPiece, otherPiece)
        const actualRelPos = {
          x: otherPiece.x - groupPiece.x,
          y: otherPiece.y - groupPiece.y
        }

        // 距離が閾値以内かチェック
        const distance = Math.sqrt(
          Math.pow(correctRelPos.x - actualRelPos.x, 2) +
          Math.pow(correctRelPos.y - actualRelPos.y, 2)
        )

        if (distance < SNAP_THRESHOLD) {
          merged = true
          const otherGroupId = otherPiece.groupId

          // 移動するグループのピースを、現在のグループに正確にスナップ
          // groupPieceの位置を基準に、otherPieceが正しい相対位置になるように計算
          const targetX = groupPiece.x + correctRelPos.x
          const targetY = groupPiece.y + correctRelPos.y
          const offsetX = targetX - otherPiece.x
          const offsetY = targetY - otherPiece.y

          mergedPieces = mergedPieces.map(p => {
            if (p.groupId === otherGroupId) {
              return {
                ...p,
                groupId: newGroupId,
                // 整数に丸めて隙間を防ぐ
                x: Math.round(p.x + offsetX),
                y: Math.round(p.y + offsetY)
              }
            }
            return p
          })
        }
      }
    }

    return { merged, pieces: mergedPieces, groupId: newGroupId }
  }, [PIECE_SIZE, SNAP_THRESHOLD])

  // マウス/タッチ位置を取得
  const getEventPosition = (e) => {
    if (e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
    return { x: e.clientX, y: e.clientY }
  }

  // ピクセル座標をSVG座標に変換（preserveAspectRatio="xMidYMid meet"に対応）
  const pixelToSvg = useCallback((pixelX, pixelY) => {
    const boardRect = boardRef.current?.getBoundingClientRect()
    if (!boardRect) return { x: 0, y: 0 }

    // SVGのviewBox
    const viewBoxWidth = gridSize * PIECE_SIZE
    const viewBoxHeight = gridSize * PIECE_SIZE + 140

    // preserveAspectRatio="xMidYMid meet"の場合、アスペクト比を維持
    const containerAspect = boardRect.width / boardRect.height
    const viewBoxAspect = viewBoxWidth / viewBoxHeight

    let scale, offsetX, offsetY

    if (containerAspect > viewBoxAspect) {
      // コンテナが横長: 高さに合わせてスケール、左右に余白
      scale = viewBoxHeight / boardRect.height
      const scaledWidth = viewBoxWidth / scale
      offsetX = (boardRect.width - scaledWidth) / 2
      offsetY = 0
    } else {
      // コンテナが縦長: 幅に合わせてスケール、上下に余白
      scale = viewBoxWidth / boardRect.width
      const scaledHeight = viewBoxHeight / scale
      offsetX = 0
      offsetY = (boardRect.height - scaledHeight) / 2
    }

    return {
      x: (pixelX - offsetX) * scale,
      y: (pixelY - offsetY) * scale
    }
  }, [gridSize, PIECE_SIZE])

  // ドラッグ開始
  const handleDragStart = (e, piece) => {
    e.preventDefault()
    const pos = getEventPosition(e)
    const boardRect = boardRef.current?.getBoundingClientRect()

    if (!boardRect) return

    // グループ内の最大z-indexを取得して更新
    const maxZ = Math.max(...pieces.map(p => p.zIndex))

    setPieces(prev => prev.map(p => {
      if (p.groupId === piece.groupId) {
        return { ...p, zIndex: maxZ + 1 }
      }
      return p
    }))

    setDragging({
      pieceId: piece.id,
      groupId: piece.groupId
    })

    // ピクセル座標をSVG座標に変換してオフセットを計算
    const svgPos = pixelToSvg(pos.x - boardRect.left, pos.y - boardRect.top)
    setDragOffset({
      x: svgPos.x - piece.x,
      y: svgPos.y - piece.y
    })
  }

  // ドラッグ中
  const handleDragMove = useCallback((e) => {
    if (!dragging) return
    e.preventDefault()

    const pos = getEventPosition(e)
    const boardRect = boardRef.current?.getBoundingClientRect()

    if (!boardRect) return

    // ピクセル座標をSVG座標に変換
    const svgPos = pixelToSvg(pos.x - boardRect.left, pos.y - boardRect.top)
    const newX = svgPos.x - dragOffset.x
    const newY = svgPos.y - dragOffset.y

    const draggedPiece = pieces.find(p => p.id === dragging.pieceId)
    if (!draggedPiece) return

    const deltaX = newX - draggedPiece.x
    const deltaY = newY - draggedPiece.y

    // グループ全体を移動
    setPieces(prev => prev.map(p => {
      if (p.groupId === dragging.groupId) {
        return {
          ...p,
          x: p.x + deltaX,
          y: p.y + deltaY
        }
      }
      return p
    }))
  }, [dragging, dragOffset, pieces, pixelToSvg])

  // ドラッグ終了
  const handleDragEnd = useCallback(() => {
    if (!dragging) return

    const draggedPiece = pieces.find(p => p.id === dragging.pieceId)
    if (!draggedPiece) {
      setDragging(null)
      return
    }

    // マージ判定
    const result = checkAndMerge(draggedPiece, pieces)

    if (result.merged) {
      setPieces(result.pieces)
      setGlowingGroup(result.groupId)
      setScore(prev => prev + 50)

      // 光るエフェクトを解除
      setTimeout(() => {
        setGlowingGroup(null)
      }, 600)

      // 全て完成したかチェック
      const groupIds = new Set(result.pieces.map(p => p.groupId))
      if (groupIds.size === 1) {
        handleComplete()
      }
    }

    setDragging(null)
  }, [dragging, pieces, checkAndMerge])

  // グローバルイベントリスナー
  useEffect(() => {
    const handleMouseMove = (e) => handleDragMove(e)
    const handleMouseUp = () => handleDragEnd()
    const handleTouchMove = (e) => handleDragMove(e)
    const handleTouchEnd = () => handleDragEnd()

    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('touchmove', handleTouchMove, { passive: false })
      window.addEventListener('touchend', handleTouchEnd)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [dragging, handleDragMove, handleDragEnd])

  const handleComplete = () => {
    if (timerRef.current) clearInterval(timerRef.current)

    const timeBonus = Math.max(0, 500 - timer * 2)
    const finalScore = score + timeBonus
    const points = Math.floor(finalScore / 10)

    setTimeout(() => {
      alert(`🎉 PUZZLE COMPLETE!\n\n⏱ Time: ${formatTime(timer)}\n🎯 Score: ${finalScore}\n\n+${points} POINTS`)
      onComplete(points)
    }, 500)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // 完成したグループ数を計算
  const uniqueGroups = new Set(pieces.map(p => p.groupId))
  const connectedPieces = puzzle.pieces - uniqueGroups.size
  const progress = (connectedPieces / (puzzle.pieces - 1)) * 100

  // ピースをグループごとにレンダリング
  const renderPieceGroups = () => {
    // グループごとにピースをまとめる
    const groups = {}
    pieces.forEach(piece => {
      if (!groups[piece.groupId]) {
        groups[piece.groupId] = []
      }
      groups[piece.groupId].push(piece)
    })

    return Object.entries(groups).map(([groupId, groupPieces]) => {
      const isGlowing = glowingGroup === parseInt(groupId)
      const isDraggingGroup = dragging?.groupId === parseInt(groupId)
      const zIndex = Math.max(...groupPieces.map(p => p.zIndex))

      return (
        <g
          key={groupId}
          className={`piece-group ${isGlowing ? 'glowing' : ''} ${isDraggingGroup ? 'dragging' : ''}`}
          style={{ zIndex }}
        >
          {groupPieces.map(piece => {
            const path = createPiecePath(piece.shape, PIECE_SIZE, PIECE_SIZE)

            // ヒットエリアを広げるためのパディング
            const hitPadding = 10

            return (
              <g
                key={piece.id}
                transform={`translate(${piece.x}, ${piece.y})`}
                onMouseDown={(e) => handleDragStart(e, piece)}
                onTouchStart={(e) => handleDragStart(e, piece)}
                style={{ cursor: isDraggingGroup ? 'grabbing' : 'grab' }}
              >
                <defs>
                  <clipPath id={`clip-${piece.id}`}>
                    <path d={path} />
                  </clipPath>
                  {isGlowing && (
                    <filter id={`glow-${piece.id}`}>
                      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  )}
                </defs>

                {/* 透明なヒットエリア（クリックしやすくする） */}
                <rect
                  x={-hitPadding}
                  y={-hitPadding}
                  width={PIECE_SIZE + hitPadding * 2}
                  height={PIECE_SIZE + hitPadding * 2}
                  fill="transparent"
                  style={{ cursor: isDraggingGroup ? 'grabbing' : 'grab' }}
                />

                {/* 光るエフェクト用の背景 */}
                {isGlowing && (
                  <path
                    d={path}
                    fill="rgba(255, 255, 255, 0.6)"
                    filter={`url(#glow-${piece.id})`}
                    className="glow-effect"
                  />
                )}

                {/* ピース本体 */}
                <image
                  href={puzzle.image}
                  x={-piece.col * PIECE_SIZE}
                  y={-piece.row * PIECE_SIZE}
                  width={gridSize * PIECE_SIZE}
                  height={gridSize * PIECE_SIZE}
                  clipPath={`url(#clip-${piece.id})`}
                  style={{ pointerEvents: 'none' }}
                />

                {/* ピースの境界線 */}
                <path
                  d={path}
                  fill="none"
                  stroke={isGlowing ? "rgba(255, 255, 255, 0.8)" : "#333"}
                  strokeWidth={isGlowing ? "2" : "1"}
                />
              </g>
            )
          })}
        </g>
      )
    })
  }

  return (
    <div className="puzzle-game-screen">
      {/* Header */}
      <header className="game-header">
        <button className="back-btn" onClick={onBack}>
          ← BACK
        </button>
        <div className="game-info">
          <div className="game-stat">
            <span className="stat-label">TIME</span>
            <span className="stat-value">{formatTime(timer)}</span>
          </div>
          <div className="game-stat">
            <span className="stat-label">SCORE</span>
            <span className="stat-value">{score}</span>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="progress-text">{connectedPieces}/{puzzle.pieces - 1}</div>
      </div>

      {/* Game Area */}
      <div className="game-content free-placement" ref={containerRef}>
        {/* Reference Image */}
        <div className="reference-container">
          <div className="reference-label">REFERENCE</div>
          <img src={puzzle.image} alt="Reference" className="reference-image" />
        </div>

        {/* Free Placement Board */}
        <div className="free-board-container" ref={boardRef}>
          <svg
            className="free-board-svg"
            viewBox={`0 0 ${gridSize * PIECE_SIZE} ${gridSize * PIECE_SIZE + 140}`}
            preserveAspectRatio="xMidYMid meet"
          >
            {/* 完成位置のガイド（薄いグリッド） */}
            <rect
              x="0"
              y="0"
              width={gridSize * PIECE_SIZE}
              height={gridSize * PIECE_SIZE}
              fill="rgba(255,255,255,0.02)"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />

            {/* ピースをレンダリング */}
            {renderPieceGroups()}
          </svg>
        </div>
      </div>
    </div>
  )
}

export default PuzzleGame
