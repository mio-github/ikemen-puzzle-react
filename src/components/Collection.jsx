import { useState, useMemo } from 'react'
import './Collection.css'

const Collection = ({ puzzles, completedPuzzles, darkMode, userPoints, requestCounts, onSendRequest }) => {
  const totalSlots = 30
  const completionRate = Math.floor((completedPuzzles.length / totalSlots) * 100)
  const [selectedImage, setSelectedImage] = useState(null)

  // 通常コレクションと成人向けコレクションを分離
  const normalPuzzles = puzzles.filter(p => !p.mature)
  const maturePuzzles = puzzles.filter(p => p.mature)

  // Pinterestスタイル: ランダムなアスペクト比を生成（シード値ベース）
  const getRandomHeight = (id) => {
    const seed = id * 7 + 13
    const random = Math.sin(seed) * 10000
    const normalized = random - Math.floor(random)
    // 高さは 1.0 〜 1.8 の範囲でランダム
    return 1.0 + normalized * 0.8
  }

  // 空スロット用のデータを生成
  const emptyNormalSlots = useMemo(() =>
    Array.from({ length: 20 - normalPuzzles.length }).map((_, index) => ({
      id: `normal-empty-${index}`,
      isEmpty: true,
      heightRatio: getRandomHeight(1000 + index)
    })), [normalPuzzles.length])

  const emptyMatureSlots = useMemo(() =>
    Array.from({ length: 10 - maturePuzzles.length }).map((_, index) => ({
      id: `mature-empty-${index}`,
      isEmpty: true,
      heightRatio: getRandomHeight(2000 + index)
    })), [maturePuzzles.length])

  // マソンリーレイアウト用にアイテムをカラムに分配
  const distributeToColumns = (items, columnCount) => {
    const columns = Array.from({ length: columnCount }, () => ({ items: [], height: 0 }))

    items.forEach(item => {
      // 最も短いカラムを見つける
      const shortestColumn = columns.reduce((shortest, col, index) =>
        col.height < columns[shortest].height ? index : shortest, 0)

      const heightRatio = item.heightRatio || getRandomHeight(item.id)
      columns[shortestColumn].items.push({ ...item, heightRatio })
      columns[shortestColumn].height += heightRatio
    })

    return columns
  }

  // 画像をクリックした時の拡大表示
  const handleImageClick = (puzzle) => {
    if (completedPuzzles.includes(puzzle.id)) {
      setSelectedImage(puzzle)
    }
  }

  const renderMasonryGrid = (items, emptySlots, isMature = false) => {
    const allItems = [
      ...items.map(p => ({ ...p, isEmpty: false, heightRatio: getRandomHeight(p.id) })),
      ...emptySlots
    ]

    const columns = distributeToColumns(allItems, 2)

    return (
      <div className="masonry-grid">
        {columns.map((column, colIndex) => (
          <div key={colIndex} className="masonry-column">
            {column.items.map((item) => {
              if (item.isEmpty) {
                return (
                  <div
                    key={item.id}
                    className={`masonry-item locked ${isMature ? 'mature' : ''}`}
                    style={{
                      paddingBottom: `${item.heightRatio * 100}%`,
                      border: isMature ? '2px solid #666' : undefined
                    }}
                  >
                    <div className="masonry-item-content">
                      <div className="locked-overlay" style={isMature ? { background: '#1a1a1a' } : undefined}>
                        <span className="lock-icon">{isMature ? '🔞' : '🔒'}</span>
                      </div>
                      <div className="item-title" style={isMature ? { color: '#666' } : undefined}>???</div>
                    </div>
                  </div>
                )
              }

              const isCompleted = completedPuzzles.includes(item.id)
              const requestCount = requestCounts[item.id] || 0

              return (
                <div
                  key={item.id}
                  className={`masonry-item ${isCompleted ? 'unlocked' : 'locked'} ${isMature ? 'mature' : ''}`}
                  style={{
                    paddingBottom: `${item.heightRatio * 100}%`,
                    border: isMature ? '2px solid #8a2be2' : undefined
                  }}
                  onClick={() => handleImageClick(item)}
                >
                  <div className="masonry-item-content">
                    {isCompleted ? (
                      <>
                        <img src={item.image} alt={item.title} />
                        <div className={`item-badge ${isMature ? 'premium-badge' : 'normal-badge'}`}>
                          {isMature ? '🌙 PREMIUM' : 'NORMAL'}
                        </div>
                        {requestCount > 0 && (
                          <div className={`request-count ${isMature ? 'premium-count' : ''}`}>
                            🔥 {requestCount}
                          </div>
                        )}
                        <button
                          className={`request-btn ${isMature ? 'premium-request-btn' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            onSendRequest(item.id)
                          }}
                          title="続きを熱望！(50pt)"
                        >
                          🔥
                        </button>
                        <div className="item-title">{item.title}</div>
                      </>
                    ) : (
                      <>
                        <div className="locked-overlay" style={isMature ? { background: '#1a1a1a' } : undefined}>
                          <span className="lock-icon">{isMature ? '🔞' : '🔒'}</span>
                        </div>
                        <div className="item-title">???</div>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={`screen collection-screen ${darkMode ? 'dark-mode' : ''}`}>
      {/* Header */}
      <header className="screen-header">
        <h1 className="screen-title">
          <span className="title-icon">♥</span>
          COLLECTION
        </h1>
        <div style={{ fontSize: '11px', color: '#666', marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{darkMode ? '🌙 Dark Mode - All Content' : '☀️ Normal Mode'}</span>
          <span style={{ color: '#ffffff' }}>所持: {userPoints}pt</span>
        </div>
      </header>

      {/* Stats */}
      <div className="collection-stats">
        <div className="stats-circle">
          <svg width="120" height="120">
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="#1a1a1a"
              strokeWidth="8"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="#ffffff"
              strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 54}`}
              strokeDashoffset={`${2 * Math.PI * 54 * (1 - completionRate / 100)}`}
              transform="rotate(-90 60 60)"
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
          </svg>
          <div className="stats-content">
            <div className="stats-number">{completedPuzzles.length}</div>
            <div className="stats-total">/ {totalSlots}</div>
          </div>
        </div>
        <div className="stats-info">
          <div className="stats-rate">{completionRate}%</div>
          <div className="stats-label">COMPLETION RATE</div>
        </div>
      </div>

      {/* Grid */}
      <div className="screen-content">
        {/* 通常コレクション */}
        <div className="collection-section">
          <h2 className="section-title">
            <span className="title-line"></span>
            NORMAL COLLECTION
            <span className="title-line"></span>
          </h2>
          {renderMasonryGrid(normalPuzzles, emptyNormalSlots, false)}
        </div>

        {/* 成人向けコレクション（ダークモードのみ） */}
        {darkMode && (
          <div className="collection-section" style={{ marginTop: '32px' }}>
            <h2 className="section-title" style={{ color: '#ffffff' }}>
              <span className="title-line"></span>
              🌙 MATURE COLLECTION
              <span className="title-line"></span>
            </h2>
            {renderMasonryGrid(maturePuzzles, emptyMatureSlots, true)}
          </div>
        )}
      </div>

      {/* 画像拡大モーダル */}
      {selectedImage && (
        <div className="image-modal" onClick={() => setSelectedImage(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedImage(null)}>×</button>
            <img src={selectedImage.image} alt={selectedImage.title} />
            <div className="modal-title">{selectedImage.title}</div>
            {selectedImage.artist && (
              <div className="modal-artist">Illustrated by {selectedImage.artist}</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Collection
