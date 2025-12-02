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

  // パズル全体の分割線を事前生成（Draradechアルゴリズム準拠）
  // これにより隣接ピースで同一の曲線を共有
  const generatePuzzleEdges = useCallback((gridSize) => {
    const t = TAB_SIZE
    const j = JITTER
    const s = PIECE_SIZE // セグメント長

    // シード付き乱数生成
    let seed = puzzle.id
    const random = () => {
      const x = Math.sin(seed) * 10000
      seed += 1
      return x - Math.floor(x)
    }
    const uniform = () => random() * j * 2 - j
    const rbool = () => random() > 0.5

    // 水平分割線（行間）: horizontalLines[row] = 各colの曲線ポイント配列
    const horizontalLines = []
    for (let row = 1; row < gridSize; row++) {
      const line = []
      let flip = rbool()
      let e = uniform()

      for (let col = 0; col < gridSize; col++) {
        const flipOld = flip
        flip = rbool()
        const a = (flip === flipOld) ? -e : e
        const b = uniform()
        const c = uniform()
        const d = uniform()
        e = uniform()

        // 10個の制御点を計算（正規化座標 0-1）
        const points = [
          { l: 0.0, w: 0 },
          { l: 0.2, w: a },
          { l: 0.5 + b + d, w: -t + c },
          { l: 0.5 - t + b, w: t + c },
          { l: 0.5 - 2*t + b - d, w: 3*t + c },
          { l: 0.5 + 2*t + b - d, w: 3*t + c },
          { l: 0.5 + t + b, w: t + c },
          { l: 0.5 + b + d, w: -t + c },
          { l: 0.8, w: e },
          { l: 1.0, w: 0 }
        ]

        // 実座標に変換（flip で符号反転）
        const dir = flip ? -1 : 1
        line.push(points.map(p => ({
          x: col * s + p.l * s,
          y: row * s + p.w * s * dir
        })))
      }
      horizontalLines.push(line)
    }

    // 垂直分割線（列間）: verticalLines[col] = 各rowの曲線ポイント配列
    const verticalLines = []
    for (let col = 1; col < gridSize; col++) {
      const line = []
      let flip = rbool()
      let e = uniform()

      for (let row = 0; row < gridSize; row++) {
        const flipOld = flip
        flip = rbool()
        const a = (flip === flipOld) ? -e : e
        const b = uniform()
        const c = uniform()
        const d = uniform()
        e = uniform()

        const points = [
          { l: 0.0, w: 0 },
          { l: 0.2, w: a },
          { l: 0.5 + b + d, w: -t + c },
          { l: 0.5 - t + b, w: t + c },
          { l: 0.5 - 2*t + b - d, w: 3*t + c },
          { l: 0.5 + 2*t + b - d, w: 3*t + c },
          { l: 0.5 + t + b, w: t + c },
          { l: 0.5 + b + d, w: -t + c },
          { l: 0.8, w: e },
          { l: 1.0, w: 0 }
        ]

        const dir = flip ? -1 : 1
        line.push(points.map(p => ({
          x: col * s + p.w * s * dir,
          y: row * s + p.l * s
        })))
      }
      verticalLines.push(line)
    }

    return { horizontalLines, verticalLines }
  }, [puzzle.id, PIECE_SIZE])

  // 事前生成した分割線データ
  const [puzzleEdges, setPuzzleEdges] = useState(null)

  // ピース用のSVGパスを生成（分割線から切り出し）
  const createPiecePath = useCallback((row, col, edges) => {
    if (!edges) return `M 0 0 L ${PIECE_SIZE} 0 L ${PIECE_SIZE} ${PIECE_SIZE} L 0 ${PIECE_SIZE} Z`

    const { horizontalLines, verticalLines } = edges
    const s = PIECE_SIZE

    // ピースのローカル座標系での原点
    const ox = col * s
    const oy = row * s

    let path = `M 0 0`

    // 上辺 (左→右)
    if (row > 0 && horizontalLines[row - 1] && horizontalLines[row - 1][col]) {
      const pts = horizontalLines[row - 1][col]
      // グローバル座標からローカル座標に変換
      path += ` C ${pts[1].x - ox} ${pts[1].y - oy}, ${pts[2].x - ox} ${pts[2].y - oy}, ${pts[3].x - ox} ${pts[3].y - oy}`
      path += ` C ${pts[4].x - ox} ${pts[4].y - oy}, ${pts[5].x - ox} ${pts[5].y - oy}, ${pts[6].x - ox} ${pts[6].y - oy}`
      path += ` C ${pts[7].x - ox} ${pts[7].y - oy}, ${pts[8].x - ox} ${pts[8].y - oy}, ${pts[9].x - ox} ${pts[9].y - oy}`
    } else {
      path += ` L ${s} 0`
    }

    // 右辺 (上→下)
    if (col < gridSize - 1 && verticalLines[col] && verticalLines[col][row]) {
      const pts = verticalLines[col][row]
      path += ` C ${pts[1].x - ox} ${pts[1].y - oy}, ${pts[2].x - ox} ${pts[2].y - oy}, ${pts[3].x - ox} ${pts[3].y - oy}`
      path += ` C ${pts[4].x - ox} ${pts[4].y - oy}, ${pts[5].x - ox} ${pts[5].y - oy}, ${pts[6].x - ox} ${pts[6].y - oy}`
      path += ` C ${pts[7].x - ox} ${pts[7].y - oy}, ${pts[8].x - ox} ${pts[8].y - oy}, ${pts[9].x - ox} ${pts[9].y - oy}`
    } else {
      path += ` L ${s} ${s}`
    }

    // 下辺 (右→左) - 逆順で描画
    if (row < gridSize - 1 && horizontalLines[row] && horizontalLines[row][col]) {
      const pts = horizontalLines[row][col]
      // p9から逆順: p9→(p8,p7,p6)→(p5,p4,p3)→(p2,p1,p0)
      path += ` C ${pts[8].x - ox} ${pts[8].y - oy}, ${pts[7].x - ox} ${pts[7].y - oy}, ${pts[6].x - ox} ${pts[6].y - oy}`
      path += ` C ${pts[5].x - ox} ${pts[5].y - oy}, ${pts[4].x - ox} ${pts[4].y - oy}, ${pts[3].x - ox} ${pts[3].y - oy}`
      path += ` C ${pts[2].x - ox} ${pts[2].y - oy}, ${pts[1].x - ox} ${pts[1].y - oy}, ${pts[0].x - ox} ${pts[0].y - oy}`
    } else {
      path += ` L 0 ${s}`
    }

    // 左辺 (下→上) - 逆順で描画
    if (col > 0 && verticalLines[col - 1] && verticalLines[col - 1][row]) {
      const pts = verticalLines[col - 1][row]
      path += ` C ${pts[8].x - ox} ${pts[8].y - oy}, ${pts[7].x - ox} ${pts[7].y - oy}, ${pts[6].x - ox} ${pts[6].y - oy}`
      path += ` C ${pts[5].x - ox} ${pts[5].y - oy}, ${pts[4].x - ox} ${pts[4].y - oy}, ${pts[3].x - ox} ${pts[3].y - oy}`
      path += ` C ${pts[2].x - ox} ${pts[2].y - oy}, ${pts[1].x - ox} ${pts[1].y - oy}, ${pts[0].x - ox} ${pts[0].y - oy}`
    } else {
      path += ` L 0 0`
    }

    path += ` Z`
    return path
  }, [gridSize, PIECE_SIZE])

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
    // パズル全体の分割線を事前生成（隣接ピースで曲線を共有するため）
    const edges = generatePuzzleEdges(gridSize)
    setPuzzleEdges(edges)

    const newPieces = []

    // ボードのサイズを取得（初期配置用）
    const boardWidth = gridSize * PIECE_SIZE
    const boardHeight = gridSize * PIECE_SIZE

    for (let i = 0; i < puzzle.pieces; i++) {
      const row = Math.floor(i / gridSize)
      const col = i % gridSize

      // 初期位置をランダムに散らばらせる（ボード下部の領域に）
      const randomX = Math.round(Math.random() * (boardWidth - PIECE_SIZE * 0.5))
      const randomY = Math.round(boardHeight + 30 + Math.random() * 100)

      newPieces.push({
        id: i,
        row,
        col,
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

          // まず、基準となるグループの座標を整数に丸める
          const baseX = Math.round(groupPiece.x)
          const baseY = Math.round(groupPiece.y)
          const baseDeltaX = baseX - groupPiece.x
          const baseDeltaY = baseY - groupPiece.y

          // 基準グループの全ピースの座標を整数に調整
          mergedPieces = mergedPieces.map(p => {
            if (p.groupId === newGroupId) {
              return {
                ...p,
                x: Math.round(p.x + baseDeltaX),
                y: Math.round(p.y + baseDeltaY)
              }
            }
            return p
          })

          // 移動するグループのピースを、正確な相対位置でスナップ
          // 基準位置（整数）からの正確なオフセットを計算
          const targetX = baseX + correctRelPos.x
          const targetY = baseY + correctRelPos.y
          const offsetX = targetX - otherPiece.x
          const offsetY = targetY - otherPiece.y

          mergedPieces = mergedPieces.map(p => {
            if (p.groupId === otherGroupId) {
              return {
                ...p,
                groupId: newGroupId,
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

    // まず、ドラッグしたグループの座標を整数に丸める
    let updatedPieces = pieces.map(p => {
      if (p.groupId === dragging.groupId) {
        return {
          ...p,
          x: Math.round(p.x),
          y: Math.round(p.y)
        }
      }
      return p
    })

    // 丸めた座標で再度ピースを取得
    const roundedPiece = updatedPieces.find(p => p.id === dragging.pieceId)

    // マージ判定
    const result = checkAndMerge(roundedPiece, updatedPieces)

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
    } else {
      // マージされなかった場合も丸めた座標を適用
      setPieces(updatedPieces)
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
            // 事前生成した分割線からピースの形状パスを生成
            const path = createPiecePath(piece.row, piece.col, puzzleEdges)

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

                {/* ピースの境界線（内側に描画） */}
                <path
                  d={path}
                  fill="none"
                  stroke={isGlowing ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.3)"}
                  strokeWidth={isGlowing ? "1.5" : "0.5"}
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
