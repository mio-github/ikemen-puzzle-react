import { useMemo } from 'react'
import './PuzzleList.css'

const PuzzleList = ({ puzzles, startPuzzle, completedPuzzles, darkMode }) => {
  const getDifficultyStars = (difficulty) => {
    const stars = {
      'EASY': 1,
      'NORMAL': 2,
      'HARD': 3,
      'EXPERT': 4
    }
    return '★'.repeat(stars[difficulty] || 1) + '☆'.repeat(4 - (stars[difficulty] || 1))
  }

  const getCategoryLabel = (category) => {
    const labels = {
      'anime': 'ANIME',
      'business': 'BUSINESS',
      'casual': 'CASUAL',
      'fantasy': 'FANTASY',
      'modern': 'MODERN',
      'mature': 'PREMIUM'
    }
    return labels[category] || category.toUpperCase()
  }

  const getCategoryColor = (category) => {
    const colors = {
      'anime': '#ff69b4',
      'business': '#4169e1',
      'casual': '#ffa500',
      'fantasy': '#9370db',
      'modern': '#00bfff',
      'mature': '#8a2be2'
    }
    return colors[category] || '#999'
  }

  // シード値ベースの高さ比率生成（ピンタレスト風）
  const getHeightRatio = (id) => {
    const seed = id * 7 + 13
    const random = Math.sin(seed) * 10000
    const normalized = random - Math.floor(random)
    // 高さは 1.2 〜 1.8 の範囲でランダム
    return 1.2 + normalized * 0.6
  }

  // マソンリーレイアウト用にカラムに分配
  const columns = useMemo(() => {
    const cols = [
      { items: [], height: 0 },
      { items: [], height: 0 }
    ]

    puzzles.forEach(puzzle => {
      const heightRatio = getHeightRatio(puzzle.id)
      // 最も短いカラムに追加
      const shortestCol = cols[0].height <= cols[1].height ? 0 : 1
      cols[shortestCol].items.push({ ...puzzle, heightRatio })
      cols[shortestCol].height += heightRatio
    })

    return cols
  }, [puzzles])

  const renderPuzzleCard = (puzzle) => {
    const isCompleted = completedPuzzles.includes(puzzle.id)

    return (
      <div
        key={puzzle.id}
        className={`puzzle-card ${isCompleted ? 'completed' : ''}`}
        style={{ paddingBottom: `${puzzle.heightRatio * 100}%` }}
        onClick={() => startPuzzle(puzzle)}
      >
        <div className="card-content">
          {/* Badges */}
          <div className="card-badges">
            {puzzle.isNew && <span className="badge new">NEW</span>}
            {puzzle.isHot && <span className="badge hot">HOT</span>}
            {isCompleted && <span className="badge completed">✓</span>}
          </div>

          {/* Image */}
          <img
            src={puzzle.image}
            alt={puzzle.title}
            className="card-image"
            onError={(e) => {
              e.target.style.display = 'none'
            }}
          />

          {/* Overlay */}
          <div className="card-overlay">
            <div className="play-icon">▶</div>
          </div>

          {/* Info */}
          <div className="card-info">
            <h3 className="card-title">{puzzle.title}</h3>
            <div className="card-meta">
              <span className="difficulty">{getDifficultyStars(puzzle.difficulty)}</span>
              <span className="pieces">{puzzle.pieces}P</span>
            </div>
            <div className="card-bottom">
              <span
                className="category-badge"
                style={{
                  borderColor: getCategoryColor(puzzle.category),
                  color: getCategoryColor(puzzle.category)
                }}
              >
                {getCategoryLabel(puzzle.category)}
              </span>
              {puzzle.cost === 0 ? (
                <span className="cost free">FREE</span>
              ) : (
                <span className="cost paid">{puzzle.cost}PT</span>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`screen puzzle-list-screen ${darkMode ? 'dark-mode' : ''}`}>
      {/* Header */}
      <header className="screen-header">
        <h1 className="screen-title">
          <span className="title-icon">◆</span>
          PUZZLE COLLECTION
        </h1>
        <div className="header-stats">
          <span className="stat-badge">
            {completedPuzzles.length}/{puzzles.length} COMPLETED
          </span>
          {darkMode && (
            <span className="stat-badge premium-badge">
              ALL ACCESS
            </span>
          )}
        </div>
      </header>

      {/* Content - Masonry Layout */}
      <div className="screen-content">
        <div className="masonry-grid">
          {columns.map((column, colIndex) => (
            <div key={colIndex} className="masonry-column">
              {column.items.map(puzzle => renderPuzzleCard(puzzle))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PuzzleList
