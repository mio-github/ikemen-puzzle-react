import { useState, useEffect, useRef } from 'react'
import './PuzzleGame.css'

const PuzzleGame = ({ puzzle, onComplete, onBack }) => {
  const [pieces, setPieces] = useState([])
  const [selectedPiece, setSelectedPiece] = useState(null)
  const [placedPieces, setPlacedPieces] = useState([])
  const [timer, setTimer] = useState(0)
  const [score, setScore] = useState(0)
  const timerRef = useRef(null)
  const canvasRef = useRef(null)
  const imageRef = useRef(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [draggedPiece, setDraggedPiece] = useState(null)
  const [dropTarget, setDropTarget] = useState(null)

  // グリッドサイズを計算
  const gridSize = Math.sqrt(puzzle.pieces)

  // シード値ベースの乱数生成
  const createRandom = (seed) => {
    let s = seed
    return () => {
      const x = Math.sin(s) * 10000
      s += 1
      return x - Math.floor(x)
    }
  }

  // ジグソーピースの形状データを生成（Draradechアルゴリズム準拠）
  const generateJigsawShape = (row, col, gridSize, edgeData) => {
    const tabSize = 0.2 // タブサイズ（20%）
    const jitter = 0.04 // ジッター（4%）

    // 各エッジのフリップ状態とジッター値を保存
    if (!edgeData.horizontal) edgeData.horizontal = []
    if (!edgeData.vertical) edgeData.vertical = []

    const getHorizontalEdge = (r, c) => {
      const key = `h_${r}_${c}`
      if (!edgeData.horizontal[key]) {
        const random = createRandom(puzzle.id * 1000 + r * 100 + c)
        edgeData.horizontal[key] = {
          flip: random() > 0.5,
          b: random() * jitter * 2 - jitter,
          c: random() * jitter * 2 - jitter,
          d: random() * jitter * 2 - jitter,
          e: random() * jitter * 2 - jitter
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
          b: random() * jitter * 2 - jitter,
          c: random() * jitter * 2 - jitter,
          d: random() * jitter * 2 - jitter,
          e: random() * jitter * 2 - jitter
        }
      }
      return edgeData.vertical[key]
    }

    // エッジを反転（隣接ピースから見た場合）
    const reverseEdge = (edge) => {
      if (!edge) return null
      return {
        flip: !edge.flip, // タブ/ソケットを反転
        b: edge.b,  // bは位置なので同じ
        c: edge.c,  // cも同じ
        d: edge.d,  // dも同じ
        e: edge.e   // eも同じ
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
      tabSize,
      jitter
    }
  }

  // SVGパスを生成（Draradechアルゴリズム準拠の3段階ベジェ曲線）
  const createPiecePath = (shape, pieceWidth, pieceHeight) => {
    const { top, right, bottom, left, tabSize } = shape
    const w = pieceWidth
    const h = pieceHeight
    const t = tabSize

    let path = `M 0 0`

    // 上辺 (左から右へ)
    if (top) {
      const { flip, b, c, d, e } = top
      const sign = flip ? 1 : -1
      path += `
        C ${w * 0.2} ${h * e * sign},
          ${w * (0.5 + b + d)} ${h * (-t + c) * sign},
          ${w * (0.5 - t + b)} ${h * (t + c) * sign}
        C ${w * (0.5 - 2 * t + b - d)} ${h * (3 * t + c) * sign},
          ${w * (0.5 + 2 * t + b - d)} ${h * (3 * t + c) * sign},
          ${w * (0.5 + t + b)} ${h * (t + c) * sign}
        C ${w * (0.5 + b + d)} ${h * (-t + c) * sign},
          ${w * 0.8} ${h * e * sign},
          ${w} 0
      `
    } else {
      path += ` L ${w} 0`
    }

    // 右辺 (上から下へ)
    if (right) {
      const { flip, b, c, d, e } = right
      const sign = flip ? 1 : -1
      path += `
        C ${w + h * e * sign} ${h * 0.2},
          ${w + h * (-t + c) * sign} ${h * (0.5 + b + d)},
          ${w + h * (t + c) * sign} ${h * (0.5 - t + b)}
        C ${w + h * (3 * t + c) * sign} ${h * (0.5 - 2 * t + b - d)},
          ${w + h * (3 * t + c) * sign} ${h * (0.5 + 2 * t + b - d)},
          ${w + h * (t + c) * sign} ${h * (0.5 + t + b)}
        C ${w + h * (-t + c) * sign} ${h * (0.5 + b + d)},
          ${w + h * e * sign} ${h * 0.8},
          ${w} ${h}
      `
    } else {
      path += ` L ${w} ${h}`
    }

    // 下辺 (右から左へ)
    if (bottom) {
      const { flip, b, c, d, e } = bottom
      const sign = flip ? -1 : 1
      path += `
        C ${w * 0.8} ${h + h * e * sign},
          ${w * (0.5 - b - d)} ${h + h * (-t + c) * sign},
          ${w * (0.5 + t - b)} ${h + h * (t + c) * sign}
        C ${w * (0.5 + 2 * t - b + d)} ${h + h * (3 * t + c) * sign},
          ${w * (0.5 - 2 * t - b + d)} ${h + h * (3 * t + c) * sign},
          ${w * (0.5 - t - b)} ${h + h * (t + c) * sign}
        C ${w * (0.5 - b - d)} ${h + h * (-t + c) * sign},
          ${w * 0.2} ${h + h * e * sign},
          0 ${h}
      `
    } else {
      path += ` L 0 ${h}`
    }

    // 左辺 (下から上へ)
    if (left) {
      const { flip, b, c, d, e } = left
      const sign = flip ? -1 : 1
      path += `
        C ${w * e * sign} ${h * 0.8},
          ${w * (-t + c) * sign} ${h * (0.5 - b - d)},
          ${w * (t + c) * sign} ${h * (0.5 + t - b)}
        C ${w * (3 * t + c) * sign} ${h * (0.5 + 2 * t - b + d)},
          ${w * (3 * t + c) * sign} ${h * (0.5 - 2 * t - b + d)},
          ${w * (t + c) * sign} ${h * (0.5 - t - b)}
        C ${w * (-t + c) * sign} ${h * (0.5 - b - d)},
          ${w * e * sign} ${h * 0.2},
          0 0
      `
    } else {
      path += ` L 0 0`
    }

    path += ` Z`
    return path
  }

  // 初期化
  useEffect(() => {
    initializePuzzle()

    // タイマー開始
    timerRef.current = setInterval(() => {
      setTimer(prev => prev + 1)
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  // 画像読み込み
  useEffect(() => {
    const img = new Image()
    img.src = puzzle.image
    img.onload = () => {
      setImageLoaded(true)
      imageRef.current = img
    }
  }, [puzzle.image])

  const initializePuzzle = () => {
    const edgeData = { horizontal: [], vertical: [] }
    const newPieces = []

    for (let i = 0; i < puzzle.pieces; i++) {
      const row = Math.floor(i / gridSize)
      const col = i % gridSize
      const shape = generateJigsawShape(row, col, gridSize, edgeData)

      newPieces.push({
        id: i,
        correctIndex: i,
        row,
        col,
        shape,
        isPlaced: false
      })
    }
    // シャッフル
    const shuffled = [...newPieces].sort(() => Math.random() - 0.5)
    setPieces(shuffled)
    setPlacedPieces([])
  }

  const handlePieceClick = (piece) => {
    if (piece.isPlaced) return

    if (selectedPiece && selectedPiece.id === piece.id) {
      setSelectedPiece(null)
    } else {
      setSelectedPiece(piece)
    }
  }

  // ドラッグ開始
  const handleDragStart = (e, piece) => {
    if (piece.isPlaced) return
    setDraggedPiece(piece)
    setSelectedPiece(piece)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', e.target.innerHTML)
  }

  // ドラッグ終了
  const handleDragEnd = () => {
    setDraggedPiece(null)
    setDropTarget(null)
  }

  // ドロップゾーンに入った
  const handleDragOver = (e, slotIndex) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'

    // 既に配置済みのスロットではない場合のみハイライト
    if (!placedPieces.some(p => p.correctIndex === slotIndex)) {
      setDropTarget(slotIndex)
    }
  }

  // ドロップゾーンから出た
  const handleDragLeave = () => {
    setDropTarget(null)
  }

  // ドロップ
  const handleDrop = (e, slotIndex) => {
    e.preventDefault()

    if (!draggedPiece) return

    // 既に配置済みのスロット
    if (placedPieces.some(p => p.correctIndex === slotIndex)) return

    const isCorrect = draggedPiece.correctIndex === slotIndex

    if (isCorrect) {
      // 正解
      const newPlacedPieces = [...placedPieces, { ...draggedPiece, isPlaced: true }]
      setPlacedPieces(newPlacedPieces)

      setPieces(prev => prev.map(p =>
        p.id === draggedPiece.id ? { ...p, isPlaced: true } : p
      ))

      setScore(prev => prev + 100)
      setSelectedPiece(null)
      setDraggedPiece(null)
      setDropTarget(null)

      // 全て完成したか
      if (newPlacedPieces.length === puzzle.pieces) {
        handleComplete()
      }
    } else {
      // 不正解
      setScore(prev => Math.max(0, prev - 10))
      setDropTarget(null)

      // 振動フィードバック
      if (navigator.vibrate) {
        navigator.vibrate(100)
      }
    }
  }

  const handleSlotClick = (slotIndex) => {
    if (!selectedPiece) return

    // 既に配置済みのスロット
    if (placedPieces.some(p => p.correctIndex === slotIndex)) return

    const isCorrect = selectedPiece.correctIndex === slotIndex

    if (isCorrect) {
      // 正解
      const newPlacedPieces = [...placedPieces, { ...selectedPiece, isPlaced: true }]
      setPlacedPieces(newPlacedPieces)

      setPieces(prev => prev.map(p =>
        p.id === selectedPiece.id ? { ...p, isPlaced: true } : p
      ))

      setScore(prev => prev + 100)
      setSelectedPiece(null)

      // 全て完成したか
      if (newPlacedPieces.length === puzzle.pieces) {
        handleComplete()
      }
    } else {
      // 不正解
      setScore(prev => Math.max(0, prev - 10))

      // 振動フィードバック
      if (navigator.vibrate) {
        navigator.vibrate(100)
      }
    }
  }

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

  const availablePieces = pieces.filter(p => !p.isPlaced)
  const progress = (placedPieces.length / puzzle.pieces) * 100

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
        <div className="progress-text">{placedPieces.length}/{puzzle.pieces}</div>
      </div>

      {/* Game Area */}
      <div className="game-content">
        {/* Puzzle Board */}
        <div className="puzzle-board-container" style={{ position: 'relative' }}>
          <svg
            className="puzzle-board-svg"
            viewBox={`0 0 ${gridSize * 100} ${gridSize * 100}`}
            preserveAspectRatio="xMidYMid meet"
          >
            {/* 背景グリッド */}
            <defs>
              <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                <rect width="100" height="100" fill="none" stroke="#1a1a1a" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width={gridSize * 100} height={gridSize * 100} fill="url(#grid)" />

            {/* 配置済みピース */}
            {placedPieces.map((piece) => {
              const x = piece.col * 100
              const y = piece.row * 100
              const path = createPiecePath(piece.shape, 100, 100)

              return (
                <g key={piece.id} transform={`translate(${x}, ${y})`}>
                  <defs>
                    <clipPath id={`clip-${piece.id}`}>
                      <path d={path} />
                    </clipPath>
                  </defs>
                  <image
                    href={puzzle.image}
                    x={-piece.col * 100}
                    y={-piece.row * 100}
                    width={gridSize * 100}
                    height={gridSize * 100}
                    clipPath={`url(#clip-${piece.id})`}
                  />
                  <path
                    d={path}
                    fill="none"
                    stroke="#000"
                    strokeWidth="1"
                    opacity="0.3"
                  />
                </g>
              )
            })}

            {/* 空スロット */}
            {Array.from({ length: puzzle.pieces }).map((_, index) => {
              const isPlaced = placedPieces.some(p => p.correctIndex === index)
              if (isPlaced) return null

              const row = Math.floor(index / gridSize)
              const col = index % gridSize
              const x = col * 100
              const y = row * 100
              const isDropTarget = dropTarget === index
              const isHinted = selectedPiece?.correctIndex === index || draggedPiece?.correctIndex === index

              return (
                <rect
                  key={`slot-${index}`}
                  x={x}
                  y={y}
                  width="100"
                  height="100"
                  fill={isDropTarget ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)"}
                  stroke={isHinted ? "#ffffff" : "#333"}
                  strokeWidth={isHinted ? "2" : "1"}
                  className="puzzle-slot"
                  onClick={() => handleSlotClick(index)}
                  style={{ cursor: 'pointer' }}
                />
              )
            })}
          </svg>

          {/* ドロップゾーン（透明オーバーレイ） */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'grid',
              gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
              gridTemplateRows: `repeat(${gridSize}, 1fr)`,
              pointerEvents: draggedPiece ? 'auto' : 'none'
            }}
          >
            {Array.from({ length: puzzle.pieces }).map((_, index) => {
              const isPlaced = placedPieces.some(p => p.correctIndex === index)

              return (
                <div
                  key={`drop-zone-${index}`}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  style={{
                    pointerEvents: isPlaced ? 'none' : 'auto',
                    cursor: draggedPiece ? 'pointer' : 'default'
                  }}
                />
              )
            })}
          </div>
        </div>

        {/* Pieces Palette */}
        <div className="pieces-palette">
          <div className="palette-title">
            <span className="title-line"></span>
            PIECES ({availablePieces.length})
            <span className="title-line"></span>
          </div>
          <div className="pieces-container">
            {availablePieces.map((piece) => {
              const path = createPiecePath(piece.shape, 100, 100)
              const isDragging = draggedPiece?.id === piece.id

              return (
                <div
                  key={piece.id}
                  className={`piece-wrapper ${selectedPiece?.id === piece.id ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
                  onClick={() => handlePieceClick(piece)}
                  draggable={!piece.isPlaced}
                  onDragStart={(e) => handleDragStart(e, piece)}
                  onDragEnd={handleDragEnd}
                  style={{
                    opacity: isDragging ? 0.5 : 1,
                    cursor: isDragging ? 'grabbing' : 'grab'
                  }}
                >
                  <svg
                    className="piece-svg"
                    viewBox="-25 -25 150 150"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    <defs>
                      <clipPath id={`piece-clip-${piece.id}`}>
                        <path d={path} />
                      </clipPath>
                    </defs>
                    <image
                      href={puzzle.image}
                      x={-piece.col * 100}
                      y={-piece.row * 100}
                      width={gridSize * 100}
                      height={gridSize * 100}
                      clipPath={`url(#piece-clip-${piece.id})`}
                    />
                    <path
                      d={path}
                      fill="none"
                      stroke="#666"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PuzzleGame
