import './Collection.css'

const Collection = ({ puzzles, completedPuzzles, darkMode }) => {
  const totalSlots = 30
  const completionRate = Math.floor((completedPuzzles.length / totalSlots) * 100)

  // 通常コレクションと成人向けコレクションを分離
  const normalPuzzles = puzzles.filter(p => !p.mature)
  const maturePuzzles = puzzles.filter(p => p.mature)

  return (
    <div className={`screen collection-screen ${darkMode ? 'dark-mode' : ''}`}>
      {/* Header */}
      <header className="screen-header">
        <h1 className="screen-title">
          <span className="title-icon">♥</span>
          COLLECTION
        </h1>
        <div style={{ fontSize: '11px', color: '#666', marginTop: '8px' }}>
          {darkMode ? '🌙 Dark Mode - All Content' : '☀️ Normal Mode'}
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
          <div className="collection-grid">
            {normalPuzzles.map((puzzle) => {
              const isCompleted = completedPuzzles.includes(puzzle.id)
              return (
                <div
                  key={puzzle.id}
                  className={`collection-item ${isCompleted ? 'unlocked' : 'locked'}`}
                >
                  {isCompleted ? (
                    <img src={puzzle.image} alt={puzzle.title} />
                  ) : (
                    <div className="locked-overlay">
                      <span className="lock-icon">🔒</span>
                    </div>
                  )}
                  <div className="item-title">{isCompleted ? puzzle.title : '???'}</div>
                </div>
              )
            })}

            {/* Empty slots for normal */}
            {Array.from({ length: 20 - normalPuzzles.length }).map((_, index) => (
              <div key={`normal-empty-${index}`} className="collection-item locked">
                <div className="locked-overlay">
                  <span className="lock-icon">🔒</span>
                </div>
                <div className="item-title">???</div>
              </div>
            ))}
          </div>
        </div>

        {/* 成人向けコレクション（ダークモードのみ） */}
        {darkMode && (
          <div className="collection-section" style={{ marginTop: '32px' }}>
            <h2 className="section-title" style={{ color: '#ffffff' }}>
              <span className="title-line"></span>
              🌙 MATURE COLLECTION
              <span className="title-line"></span>
            </h2>
            <div className="collection-grid">
              {maturePuzzles.map((puzzle) => {
                const isCompleted = completedPuzzles.includes(puzzle.id)
                return (
                  <div
                    key={puzzle.id}
                    className={`collection-item ${isCompleted ? 'unlocked' : 'locked'} mature`}
                    style={{ border: '2px solid #ffffff' }}
                  >
                    {isCompleted ? (
                      <img src={puzzle.image} alt={puzzle.title} />
                    ) : (
                      <div className="locked-overlay" style={{ background: '#1a1a1a' }}>
                        <span className="lock-icon">🔞</span>
                      </div>
                    )}
                    <div className="item-title" style={{ color: '#ffffff' }}>
                      {isCompleted ? puzzle.title : '???'}
                    </div>
                  </div>
                )
              })}

              {/* Empty slots for mature */}
              {Array.from({ length: 10 - maturePuzzles.length }).map((_, index) => (
                <div key={`mature-empty-${index}`} className="collection-item locked mature" style={{ border: '2px solid #666' }}>
                  <div className="locked-overlay" style={{ background: '#1a1a1a' }}>
                    <span className="lock-icon">🔞</span>
                  </div>
                  <div className="item-title" style={{ color: '#666' }}>???</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Collection
