import { useState, useEffect, useRef, useCallback } from 'react'
import './Tutorial.css'

const Tutorial = ({ onComplete, tutorialPuzzle }) => {
  const [step, setStep] = useState('intro') // intro, playing, complete, prize
  const [pieces, setPieces] = useState([])
  const [autoPlayStep, setAutoPlayStep] = useState(0)
  const [showTip, setShowTip] = useState(null)
  const [dragging, setDragging] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [glowingGroup, setGlowingGroup] = useState(null)
  const [timer, setTimer] = useState(0)
  const [score, setScore] = useState(0)
  const [completionData, setCompletionData] = useState(null)
  const [prizeApplied, setPrizeApplied] = useState(false)
  const timerRef = useRef(null)
  const boardRef = useRef(null)

  // 一番簡単な9ピースパズル
  const gridSize = 3
  const PIECE_SIZE = 50
  const SNAP_THRESHOLD = 15
  const TAB_SIZE = 0.1
  const JITTER = 0.04

  // シード付き乱数生成
  const createRandom = useCallback((seed) => {
    let s = seed
    return () => {
      const x = Math.sin(s) * 10000
      s += 1
      return x - Math.floor(x)
    }
  }, [])

  // パズル分割線を生成
  const generatePuzzleEdges = useCallback(() => {
    const t = TAB_SIZE
    const j = JITTER
    const s = PIECE_SIZE
    let seed = 12345 // 固定シード

    const random = () => {
      const x = Math.sin(seed) * 10000
      seed += 1
      return x - Math.floor(x)
    }
    const uniform = () => random() * j * 2 - j
    const rbool = () => random() > 0.5

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
          x: col * s + p.l * s,
          y: row * s + p.w * s * dir
        })))
      }
      horizontalLines.push(line)
    }

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
  }, [])

  const [puzzleEdges, setPuzzleEdges] = useState(null)

  // ピースパス生成
  const createPiecePath = useCallback((row, col, edges) => {
    if (!edges) return `M 0 0 L ${PIECE_SIZE} 0 L ${PIECE_SIZE} ${PIECE_SIZE} L 0 ${PIECE_SIZE} Z`

    const { horizontalLines, verticalLines } = edges
    const s = PIECE_SIZE
    const ox = col * s
    const oy = row * s

    let path = `M 0 0`

    if (row > 0 && horizontalLines[row - 1] && horizontalLines[row - 1][col]) {
      const pts = horizontalLines[row - 1][col]
      path += ` C ${pts[1].x - ox} ${pts[1].y - oy}, ${pts[2].x - ox} ${pts[2].y - oy}, ${pts[3].x - ox} ${pts[3].y - oy}`
      path += ` C ${pts[4].x - ox} ${pts[4].y - oy}, ${pts[5].x - ox} ${pts[5].y - oy}, ${pts[6].x - ox} ${pts[6].y - oy}`
      path += ` C ${pts[7].x - ox} ${pts[7].y - oy}, ${pts[8].x - ox} ${pts[8].y - oy}, ${pts[9].x - ox} ${pts[9].y - oy}`
    } else {
      path += ` L ${s} 0`
    }

    if (col < gridSize - 1 && verticalLines[col] && verticalLines[col][row]) {
      const pts = verticalLines[col][row]
      path += ` C ${pts[1].x - ox} ${pts[1].y - oy}, ${pts[2].x - ox} ${pts[2].y - oy}, ${pts[3].x - ox} ${pts[3].y - oy}`
      path += ` C ${pts[4].x - ox} ${pts[4].y - oy}, ${pts[5].x - ox} ${pts[5].y - oy}, ${pts[6].x - ox} ${pts[6].y - oy}`
      path += ` C ${pts[7].x - ox} ${pts[7].y - oy}, ${pts[8].x - ox} ${pts[8].y - oy}, ${pts[9].x - ox} ${pts[9].y - oy}`
    } else {
      path += ` L ${s} ${s}`
    }

    if (row < gridSize - 1 && horizontalLines[row] && horizontalLines[row][col]) {
      const pts = horizontalLines[row][col]
      path += ` C ${pts[8].x - ox} ${pts[8].y - oy}, ${pts[7].x - ox} ${pts[7].y - oy}, ${pts[6].x - ox} ${pts[6].y - oy}`
      path += ` C ${pts[5].x - ox} ${pts[5].y - oy}, ${pts[4].x - ox} ${pts[4].y - oy}, ${pts[3].x - ox} ${pts[3].y - oy}`
      path += ` C ${pts[2].x - ox} ${pts[2].y - oy}, ${pts[1].x - ox} ${pts[1].y - oy}, ${pts[0].x - ox} ${pts[0].y - oy}`
    } else {
      path += ` L 0 ${s}`
    }

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
  }, [gridSize])

  // パズル初期化
  const initializePuzzle = useCallback(() => {
    const edges = generatePuzzleEdges()
    setPuzzleEdges(edges)

    const boardWidth = gridSize * PIECE_SIZE
    const boardHeight = gridSize * PIECE_SIZE

    const newPieces = []
    for (let i = 0; i < 9; i++) {
      const row = Math.floor(i / gridSize)
      const col = i % gridSize

      // チュートリアル用の初期配置
      // 上段3つは正しい位置に近い場所、下段は散らばす
      let randomX, randomY
      if (row === 0) {
        // 上段：正しい位置に近く配置（ガイドとして）
        randomX = col * PIECE_SIZE + (Math.random() - 0.5) * 20
        randomY = row * PIECE_SIZE + (Math.random() - 0.5) * 20
      } else {
        // 中段・下段：ボード下部に散らばす
        randomX = Math.round(Math.random() * (boardWidth - PIECE_SIZE * 0.5))
        randomY = Math.round(boardHeight + 30 + Math.random() * 80)
      }

      newPieces.push({
        id: i,
        row,
        col,
        x: randomX,
        y: randomY,
        groupId: i,
        zIndex: i
      })
    }

    setPieces(newPieces)
  }, [generatePuzzleEdges])

  // ゲーム開始
  const startGame = () => {
    setStep('playing')
    initializePuzzle()

    timerRef.current = setInterval(() => {
      setTimer(prev => prev + 1)
    }, 1000)

    // 最初のヒントを少し遅れて表示
    setTimeout(() => {
      setShowTip('drag')
    }, 1000)
  }

  // 半自動プレイ：最初の4ピース（半分）を自動配置
  useEffect(() => {
    if (step !== 'playing' || autoPlayStep >= 4) return

    const autoPlaceTimeout = setTimeout(() => {
      // 自動配置するピースを決定（ID順で最初の4つ）
      const pieceToPlace = pieces.find(p => p.id === autoPlayStep)
      if (!pieceToPlace) return

      // ヒントを更新
      if (autoPlayStep === 0) {
        setShowTip('watch')
      }

      // ピースを正しい位置にアニメーション
      const targetX = pieceToPlace.col * PIECE_SIZE
      const targetY = pieceToPlace.row * PIECE_SIZE

      // まずハイライト
      setGlowingGroup(pieceToPlace.groupId)

      // アニメーション開始
      const animationDuration = 800
      const startX = pieceToPlace.x
      const startY = pieceToPlace.y
      const startTime = Date.now()

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / animationDuration, 1)
        // イージング関数
        const eased = 1 - Math.pow(1 - progress, 3)

        const newX = startX + (targetX - startX) * eased
        const newY = startY + (targetY - startY) * eased

        setPieces(prev => prev.map(p =>
          p.id === pieceToPlace.id ? { ...p, x: newX, y: newY } : p
        ))

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          // アニメーション完了
          setPieces(prev => {
            // 同じ行のピースをマージ
            const updatedPieces = prev.map(p => {
              if (p.row === pieceToPlace.row && p.col < pieceToPlace.col) {
                // 同じ行の左側ピースと同じグループにする
                const leftPiece = prev.find(lp => lp.row === pieceToPlace.row && lp.col === pieceToPlace.col - 1)
                if (leftPiece && leftPiece.groupId !== pieceToPlace.groupId) {
                  return { ...p, groupId: Math.min(p.groupId, pieceToPlace.groupId) }
                }
              }
              return p
            })
            return updatedPieces
          })

          setScore(prev => prev + 50)
          setAutoPlayStep(prev => prev + 1)

          setTimeout(() => {
            setGlowingGroup(null)
          }, 400)
        }
      }

      setTimeout(() => {
        animate()
      }, 500)
    }, autoPlayStep === 0 ? 2000 : 1500)

    return () => clearTimeout(autoPlaceTimeout)
  }, [step, autoPlayStep, pieces])

  // 4ピース配置後、ユーザーに操作させる
  useEffect(() => {
    if (autoPlayStep === 4 && showTip === 'watch') {
      setShowTip('your-turn')
    }
  }, [autoPlayStep, showTip])

  // ドラッグ処理
  const getEventPosition = (e) => {
    if (e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
    return { x: e.clientX, y: e.clientY }
  }

  const pixelToSvg = useCallback((pixelX, pixelY) => {
    const boardRect = boardRef.current?.getBoundingClientRect()
    if (!boardRect) return { x: 0, y: 0 }

    const viewBoxWidth = gridSize * PIECE_SIZE
    const viewBoxHeight = gridSize * PIECE_SIZE + 140

    const containerAspect = boardRect.width / boardRect.height
    const viewBoxAspect = viewBoxWidth / viewBoxHeight

    let scale, offsetX, offsetY

    if (containerAspect > viewBoxAspect) {
      scale = viewBoxHeight / boardRect.height
      const scaledWidth = viewBoxWidth / scale
      offsetX = (boardRect.width - scaledWidth) / 2
      offsetY = 0
    } else {
      scale = viewBoxWidth / boardRect.width
      const scaledHeight = viewBoxHeight / scale
      offsetX = 0
      offsetY = (boardRect.height - scaledHeight) / 2
    }

    return {
      x: (pixelX - offsetX) * scale,
      y: (pixelY - offsetY) * scale
    }
  }, [gridSize])

  const handleDragStart = (e, piece) => {
    if (autoPlayStep < 4) return // 自動プレイ中はドラッグ不可
    e.preventDefault()

    const pos = getEventPosition(e)
    const boardRect = boardRef.current?.getBoundingClientRect()
    if (!boardRect) return

    const maxZ = Math.max(...pieces.map(p => p.zIndex))
    setPieces(prev => prev.map(p =>
      p.groupId === piece.groupId ? { ...p, zIndex: maxZ + 1 } : p
    ))

    setDragging({ pieceId: piece.id, groupId: piece.groupId })
    const svgPos = pixelToSvg(pos.x - boardRect.left, pos.y - boardRect.top)
    setDragOffset({ x: svgPos.x - piece.x, y: svgPos.y - piece.y })

    // ドラッグ開始時にヒントを更新
    if (showTip === 'your-turn') {
      setShowTip('snap')
    }
  }

  const handleDragMove = useCallback((e) => {
    if (!dragging) return
    e.preventDefault()

    const pos = getEventPosition(e)
    const boardRect = boardRef.current?.getBoundingClientRect()
    if (!boardRect) return

    const svgPos = pixelToSvg(pos.x - boardRect.left, pos.y - boardRect.top)
    const newX = svgPos.x - dragOffset.x
    const newY = svgPos.y - dragOffset.y

    const draggedPiece = pieces.find(p => p.id === dragging.pieceId)
    if (!draggedPiece) return

    const deltaX = newX - draggedPiece.x
    const deltaY = newY - draggedPiece.y

    setPieces(prev => prev.map(p =>
      p.groupId === dragging.groupId ? { ...p, x: p.x + deltaX, y: p.y + deltaY } : p
    ))
  }, [dragging, dragOffset, pieces, pixelToSvg])

  const areNeighbors = (piece1, piece2) => {
    const rowDiff = piece1.row - piece2.row
    const colDiff = piece1.col - piece2.col
    return (Math.abs(rowDiff) === 1 && colDiff === 0) ||
           (rowDiff === 0 && Math.abs(colDiff) === 1)
  }

  const getCorrectRelativePosition = (basePiece, targetPiece) => {
    const rowDiff = targetPiece.row - basePiece.row
    const colDiff = targetPiece.col - basePiece.col
    return { x: colDiff * PIECE_SIZE, y: rowDiff * PIECE_SIZE }
  }

  const checkAndMerge = useCallback((movedPiece, allPieces) => {
    const currentGroup = allPieces.filter(p => p.groupId === movedPiece.groupId)
    let merged = false
    let newGroupId = movedPiece.groupId
    let mergedPieces = [...allPieces]

    for (const groupPiece of currentGroup) {
      for (const otherPiece of allPieces) {
        if (otherPiece.groupId === groupPiece.groupId) continue
        if (!areNeighbors(groupPiece, otherPiece)) continue

        const correctRelPos = getCorrectRelativePosition(groupPiece, otherPiece)
        const actualRelPos = { x: otherPiece.x - groupPiece.x, y: otherPiece.y - groupPiece.y }

        const distance = Math.sqrt(
          Math.pow(correctRelPos.x - actualRelPos.x, 2) +
          Math.pow(correctRelPos.y - actualRelPos.y, 2)
        )

        if (distance < SNAP_THRESHOLD) {
          merged = true
          const otherGroupId = otherPiece.groupId

          const baseX = Math.round(groupPiece.x)
          const baseY = Math.round(groupPiece.y)
          const baseDeltaX = baseX - groupPiece.x
          const baseDeltaY = baseY - groupPiece.y

          mergedPieces = mergedPieces.map(p => {
            if (p.groupId === newGroupId) {
              return { ...p, x: Math.round(p.x + baseDeltaX), y: Math.round(p.y + baseDeltaY) }
            }
            return p
          })

          const targetX = baseX + correctRelPos.x
          const targetY = baseY + correctRelPos.y
          const offsetX = targetX - otherPiece.x
          const offsetY = targetY - otherPiece.y

          mergedPieces = mergedPieces.map(p => {
            if (p.groupId === otherGroupId) {
              return { ...p, groupId: newGroupId, x: Math.round(p.x + offsetX), y: Math.round(p.y + offsetY) }
            }
            return p
          })
        }
      }
    }

    return { merged, pieces: mergedPieces, groupId: newGroupId }
  }, [])

  const handleDragEnd = useCallback(() => {
    if (!dragging) return

    const draggedPiece = pieces.find(p => p.id === dragging.pieceId)
    if (!draggedPiece) {
      setDragging(null)
      return
    }

    let updatedPieces = pieces.map(p =>
      p.groupId === dragging.groupId ? { ...p, x: Math.round(p.x), y: Math.round(p.y) } : p
    )

    const roundedPiece = updatedPieces.find(p => p.id === dragging.pieceId)
    const result = checkAndMerge(roundedPiece, updatedPieces)

    if (result.merged) {
      setPieces(result.pieces)
      setGlowingGroup(result.groupId)
      setScore(prev => prev + 50)

      setTimeout(() => setGlowingGroup(null), 600)

      // 完成チェック
      const groupIds = new Set(result.pieces.map(p => p.groupId))
      if (groupIds.size === 1) {
        handleComplete()
      }
    } else {
      setPieces(updatedPieces)
    }

    setDragging(null)
  }, [dragging, pieces, checkAndMerge])

  // グローバルイベントリスナー
  useEffect(() => {
    if (dragging) {
      const handleMouseMove = (e) => handleDragMove(e)
      const handleMouseUp = () => handleDragEnd()
      const handleTouchMove = (e) => handleDragMove(e)
      const handleTouchEnd = () => handleDragEnd()

      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('touchmove', handleTouchMove, { passive: false })
      window.addEventListener('touchend', handleTouchEnd)

      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
        window.removeEventListener('touchmove', handleTouchMove)
        window.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [dragging, handleDragMove, handleDragEnd])

  const handleComplete = () => {
    if (timerRef.current) clearInterval(timerRef.current)

    const timeBonus = Math.max(0, 500 - timer * 2)
    const finalScore = score + timeBonus
    const points = Math.floor(finalScore / 10)

    setTimeout(() => {
      setCompletionData({ time: formatTime(timer), finalScore, timeBonus, points })
      setStep('complete')
    }, 500)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const goToPrize = () => {
    setStep('prize')
  }

  const applyPrize = () => {
    setPrizeApplied(true)
  }

  const finishTutorial = () => {
    onComplete(completionData?.points || 100)
  }

  // ピースレンダリング
  const renderPieceGroups = () => {
    const groups = {}
    pieces.forEach(piece => {
      if (!groups[piece.groupId]) groups[piece.groupId] = []
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
            const path = createPiecePath(piece.row, piece.col, puzzleEdges)
            const hitPadding = 10
            const canDrag = autoPlayStep >= 4

            return (
              <g
                key={piece.id}
                transform={`translate(${piece.x}, ${piece.y})`}
                onMouseDown={canDrag ? (e) => handleDragStart(e, piece) : undefined}
                onTouchStart={canDrag ? (e) => handleDragStart(e, piece) : undefined}
                style={{ cursor: canDrag ? (isDraggingGroup ? 'grabbing' : 'grab') : 'default' }}
              >
                <defs>
                  <clipPath id={`tut-clip-${piece.id}`}>
                    <path d={path} />
                  </clipPath>
                  <filter id={`tut-shadow-${piece.id}`} x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="1.5" dy="2" stdDeviation="2" floodColor="rgba(0,0,0,0.5)" />
                  </filter>
                  {isGlowing && (
                    <filter id={`tut-glow-${piece.id}`}>
                      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  )}
                </defs>

                <rect
                  x={-hitPadding}
                  y={-hitPadding}
                  width={PIECE_SIZE + hitPadding * 2}
                  height={PIECE_SIZE + hitPadding * 2}
                  fill="transparent"
                />

                <path
                  d={path}
                  fill="rgba(0, 0, 0, 0.4)"
                  transform="translate(2, 3)"
                  style={{ filter: 'blur(2px)' }}
                />

                {isGlowing && (
                  <path
                    d={path}
                    fill="rgba(255, 255, 255, 0.6)"
                    filter={`url(#tut-glow-${piece.id})`}
                    className="glow-effect"
                  />
                )}

                <path d={path} fill="#1a1a1a" />

                <image
                  href={tutorialPuzzle?.image || '/images/anime-casual-01.jpg'}
                  x={-piece.col * PIECE_SIZE}
                  y={-piece.row * PIECE_SIZE}
                  width={gridSize * PIECE_SIZE}
                  height={gridSize * PIECE_SIZE}
                  clipPath={`url(#tut-clip-${piece.id})`}
                  style={{ pointerEvents: 'none' }}
                />

                <path
                  d={path}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.25)"
                  strokeWidth="1.5"
                  style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)', pointerEvents: 'none' }}
                />

                <path
                  d={path}
                  fill="none"
                  stroke="rgba(0, 0, 0, 0.4)"
                  strokeWidth="1.5"
                  style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)', pointerEvents: 'none' }}
                />

                <path
                  d={path}
                  fill="none"
                  stroke={isGlowing ? "rgba(255, 255, 255, 0.9)" : "rgba(60, 60, 60, 0.8)"}
                  strokeWidth={isGlowing ? "1.5" : "0.8"}
                />
              </g>
            )
          })}
        </g>
      )
    })
  }

  // 進捗計算
  const uniqueGroups = new Set(pieces.map(p => p.groupId))
  const connectedPieces = 9 - uniqueGroups.size
  const progress = (connectedPieces / 8) * 100

  return (
    <div className="tutorial-screen">
      {/* イントロ画面 */}
      {step === 'intro' && (
        <div className="tutorial-intro">
          <div className="tutorial-content">
            <div className="tutorial-logo">
              <div className="logo-icon">⊞</div>
              <div className="logo-text">
                <div className="logo-main">IKEMEN</div>
                <div className="logo-sub">PUZZLE</div>
              </div>
            </div>

            <div className="tutorial-card">
              <h2 className="tutorial-title">HOW TO PLAY</h2>
              <div className="tutorial-description">
                <p>
                  パズルを完成させて<br/>
                  <strong>ポイント</strong>を貯めましょう！
                </p>
                <p>
                  貯まったポイントで<br/>
                  <strong>懸賞応募</strong>や<strong>商品交換</strong>ができます！
                </p>
                <p>
                  さらに、好きな絵師さんを<br/>
                  <strong>応援</strong>することもできます。
                </p>
              </div>
            </div>

            <button className="tutorial-btn primary" onClick={startGame}>
              チュートリアルを始める
            </button>
          </div>
        </div>
      )}

      {/* プレイ画面 */}
      {step === 'playing' && (
        <div className="tutorial-game">
          <header className="game-header">
            <div className="header-title">TUTORIAL</div>
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

          {/* ヒント表示 */}
          {showTip && (
            <div className="tutorial-tip">
              {showTip === 'drag' && (
                <div className="tip-content">
                  <span className="tip-icon">👆</span>
                  <span className="tip-text">ピースをドラッグして移動します</span>
                </div>
              )}
              {showTip === 'watch' && (
                <div className="tip-content">
                  <span className="tip-icon">👀</span>
                  <span className="tip-text">自動配置を見てみましょう...</span>
                </div>
              )}
              {showTip === 'your-turn' && (
                <div className="tip-content highlight">
                  <span className="tip-icon">✋</span>
                  <span className="tip-text">あなたの番です！残りのピースを配置しましょう</span>
                </div>
              )}
              {showTip === 'snap' && (
                <div className="tip-content">
                  <span className="tip-icon">🧩</span>
                  <span className="tip-text">正しい位置に近づけると自動でスナップします</span>
                </div>
              )}
            </div>
          )}

          {/* 進捗バー */}
          <div className="progress-container">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="progress-text">{connectedPieces}/8</div>
          </div>

          {/* ゲームエリア */}
          <div className="game-content">
            <div className="reference-container">
              <div className="reference-label">REFERENCE</div>
              <img
                src={tutorialPuzzle?.image || '/images/anime-casual-01.jpg'}
                alt="Reference"
                className="reference-image"
              />
            </div>

            <div className="free-board-container" ref={boardRef}>
              <svg
                className="free-board-svg"
                viewBox={`0 0 ${gridSize * PIECE_SIZE} ${gridSize * PIECE_SIZE + 140}`}
                preserveAspectRatio="xMidYMid meet"
              >
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
                {renderPieceGroups()}
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* 完成画面 */}
      {step === 'complete' && completionData && (
        <div className="tutorial-complete">
          <div className="complete-modal">
            <div className="complete-icon">★</div>
            <h2 className="complete-title">PUZZLE COMPLETE!</h2>

            <div className="complete-image">
              <img
                src={tutorialPuzzle?.image || '/images/anime-casual-01.jpg'}
                alt="Completed"
              />
            </div>

            <div className="complete-stats">
              <div className="complete-stat">
                <span className="complete-stat-label">TIME</span>
                <span className="complete-stat-value">{completionData.time}</span>
              </div>
              <div className="complete-stat">
                <span className="complete-stat-label">SCORE</span>
                <span className="complete-stat-value">{completionData.finalScore}</span>
              </div>
              <div className="complete-stat">
                <span className="complete-stat-label">BONUS</span>
                <span className="complete-stat-value">+{completionData.timeBonus}</span>
              </div>
            </div>

            <div className="complete-points">
              <span className="points-label">EARNED POINTS</span>
              <span className="points-value">+{completionData.points} pt</span>
            </div>

            <button className="complete-btn" onClick={goToPrize}>
              次へ：懸賞について
            </button>
          </div>
        </div>
      )}

      {/* 懸賞応募チュートリアル */}
      {step === 'prize' && (
        <div className="tutorial-prize">
          <div className="prize-modal">
            {!prizeApplied ? (
              <>
                <h2 className="prize-title">獲得したポイントで<br/>懸賞に応募しよう！</h2>

                <div className="prize-card">
                  <div className="prize-image-placeholder">
                    <span>商品画像</span>
                  </div>
                  <div className="prize-info">
                    <div className="prize-name">Amazonギフトカード 1,000円分</div>
                    <div className="prize-cost">必要ポイント: 50pt</div>
                    <div className="prize-details">当選人数: 5名 / 応募期限: あと7日</div>
                  </div>

                  <div className="prize-balance">
                    <div className="balance-label">現在の保有ポイント</div>
                    <div className="balance-value">{completionData?.points || 100} pt</div>
                  </div>

                  <button className="prize-apply-btn" onClick={applyPrize}>
                    応募する
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="prize-success-icon">✓</div>
                <h2 className="prize-success-title">応募が完了しました！</h2>
                <p className="prize-success-message">
                  抽選結果は後日お知らせで通知されます。
                </p>
                <div className="tutorial-complete-message">
                  <p>チュートリアル完了です！</p>
                  <p>アプリを楽しみましょう！</p>
                </div>
                <button className="complete-btn" onClick={finishTutorial}>
                  ゲームを始める
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Tutorial
