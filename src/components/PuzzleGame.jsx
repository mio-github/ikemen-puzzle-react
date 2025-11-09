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

  // グリッドサイズを計算
  const gridSize = Math.sqrt(puzzle.pieces)

  // ジグソーピースの形状データを生成
  const generateJigsawShape = (row, col, gridSize) => {
    const pieceWidth = 100 / gridSize
    const pieceHeight = 100 / gridSize
    const tabSize = pieceWidth * 0.2 // タブ（凸部）のサイズ

    // ランダムにタブ（凸）とポケット（凹）を決定
    const hasTopTab = row > 0 ? Math.random() > 0.5 : false
    const hasRightTab = col < gridSize - 1 ? Math.random() > 0.5 : false
    const hasBottomTab = row < gridSize - 1 ? Math.random() > 0.5 : false
    const hasLeftTab = col > 0 ? Math.random() > 0.5 : false

    return {
      hasTopTab,
      hasRightTab,
      hasBottomTab,
      hasLeftTab,
      tabSize
    }
  }

  // SVGパスを生成（ジグソーピース形状）
  const createPiecePath = (shape, pieceWidth, pieceHeight) => {
    const { hasTopTab, hasRightTab, hasBottomTab, hasLeftTab, tabSize } = shape
    const w = pieceWidth
    const h = pieceHeight
    const t = tabSize

    let path = `M 0 0`

    // 上辺
    if (hasTopTab) {
      path += ` L ${w * 0.3} 0
               Q ${w * 0.4} ${-t} ${w * 0.5} ${-t}
               Q ${w * 0.6} ${-t} ${w * 0.7} 0`
    }
    path += ` L ${w} 0`

    // 右辺
    if (hasRightTab) {
      path += ` L ${w} ${h * 0.3}
               Q ${w + t} ${h * 0.4} ${w + t} ${h * 0.5}
               Q ${w + t} ${h * 0.6} ${w} ${h * 0.7}`
    }
    path += ` L ${w} ${h}`

    // 下辺
    if (hasBottomTab) {
      path += ` L ${w * 0.7} ${h}
               Q ${w * 0.6} ${h + t} ${w * 0.5} ${h + t}
               Q ${w * 0.4} ${h + t} ${w * 0.3} ${h}`
    }
    path += ` L 0 ${h}`

    // 左辺
    if (hasLeftTab) {
      path += ` L 0 ${h * 0.7}
               Q ${-t} ${h * 0.6} ${-t} ${h * 0.5}
               Q ${-t} ${h * 0.4} 0 ${h * 0.3}`
    }
    path += ` L 0 0 Z`

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
    const newPieces = []
    for (let i = 0; i < puzzle.pieces; i++) {
      const row = Math.floor(i / gridSize)
      const col = i % gridSize
      const shape = generateJigsawShape(row, col, gridSize)

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
        <div className="puzzle-board-container">
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

              return (
                <rect
                  key={`slot-${index}`}
                  x={x}
                  y={y}
                  width="100"
                  height="100"
                  fill="rgba(255,255,255,0.05)"
                  stroke={selectedPiece?.correctIndex === index ? "#ffffff" : "#333"}
                  strokeWidth={selectedPiece?.correctIndex === index ? "2" : "1"}
                  className="puzzle-slot"
                  onClick={() => handleSlotClick(index)}
                  style={{ cursor: 'pointer' }}
                />
              )
            })}
          </svg>
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

              return (
                <div
                  key={piece.id}
                  className={`piece-wrapper ${selectedPiece?.id === piece.id ? 'selected' : ''}`}
                  onClick={() => handlePieceClick(piece)}
                >
                  <svg
                    className="piece-svg"
                    viewBox="0 0 100 100"
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
