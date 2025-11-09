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

  return (
    <div className="screen puzzle-list-screen">
      {/* Header */}
      <header className="screen-header">
        <h1 className="screen-title">
          <span className="title-icon">⊞</span>
          PUZZLE COLLECTION
          {darkMode && <span style={{ marginLeft: '8px', fontSize: '12px' }}>🌙</span>}
        </h1>
        <div className="header-stats">
          <span className="stat-badge">
            {completedPuzzles.length}/{puzzles.length} COMPLETED
          </span>
          {darkMode && (
            <span className="stat-badge" style={{ background: '#ffffff', color: '#000', marginLeft: '8px' }}>
              MATURE OK
            </span>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="screen-content">
        <div className="puzzle-grid">
          {puzzles.map(puzzle => (
            <div
              key={puzzle.id}
              className={`puzzle-card ${completedPuzzles.includes(puzzle.id) ? 'completed' : ''}`}
              onClick={() => startPuzzle(puzzle)}
            >
              {/* Badges */}
              <div className="card-badges">
                {puzzle.isNew && <span className="badge new">NEW</span>}
                {puzzle.isHot && <span className="badge hot">HOT</span>}
                {completedPuzzles.includes(puzzle.id) && <span className="badge completed">✓</span>}
              </div>

              {/* Image */}
              <div className="card-image">
                <img src={puzzle.image} alt={puzzle.title} onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.parentElement.classList.add('no-image')
                }} />
                <div className="image-overlay"></div>
              </div>

              {/* Info */}
              <div className="card-info">
                <h3 className="card-title">{puzzle.title}</h3>
                <div className="card-meta">
                  <span className="difficulty">
                    {getDifficultyStars(puzzle.difficulty)}
                  </span>
                  <span className="pieces">{puzzle.pieces} PIECES</span>
                </div>
                <div className="card-footer">
                  {puzzle.cost === 0 ? (
                    <span className="cost free">FREE</span>
                  ) : (
                    <span className="cost paid">{puzzle.cost} PT</span>
                  )}
                  <span className="play-icon">▶</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PuzzleList
