import './Collection.css'

const Collection = ({ puzzles, completedPuzzles }) => {
  const totalSlots = 30
  const completionRate = Math.floor((completedPuzzles.length / totalSlots) * 100)

  return (
    <div className="screen collection-screen">
      {/* Header */}
      <header className="screen-header">
        <h1 className="screen-title">
          <span className="title-icon">♥</span>
          COLLECTION
        </h1>
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
        <div className="collection-grid">
          {puzzles.map((puzzle) => {
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

          {/* Empty slots */}
          {Array.from({ length: totalSlots - puzzles.length }).map((_, index) => (
            <div key={`empty-${index}`} className="collection-item locked">
              <div className="locked-overlay">
                <span className="lock-icon">🔒</span>
              </div>
              <div className="item-title">???</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Collection
