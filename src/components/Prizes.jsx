import './Prizes.css'

const Prizes = ({ userPoints }) => {
  const prizes = [
    {
      id: 1,
      name: 'Nintendo Switch',
      cost: 500,
      winners: 5,
      deadline: 7,
      emoji: '🎮'
    },
    {
      id: 2,
      name: 'Amazon Gift Card ¥5,000',
      cost: 300,
      winners: 10,
      deadline: 12,
      emoji: '🎁'
    },
    {
      id: 3,
      name: 'Wireless Earphones',
      cost: 200,
      winners: 20,
      deadline: 15,
      emoji: '🎧'
    }
  ]

  return (
    <div className="screen prizes-screen">
      {/* Header */}
      <header className="screen-header">
        <h1 className="screen-title">
          <span className="title-icon">⋆</span>
          PRIZES
        </h1>
        <div className="points-display">
          <span className="points-label">YOUR POINTS</span>
          <span className="points-value">{userPoints.toLocaleString()}</span>
        </div>
      </header>

      {/* Content */}
      <div className="screen-content">
        <div className="prizes-list">
          {prizes.map(prize => {
            const canAfford = userPoints >= prize.cost

            return (
              <div key={prize.id} className={`prize-card ${canAfford ? 'affordable' : 'locked'}`}>
                <div className="prize-icon">{prize.emoji}</div>
                <div className="prize-info">
                  <h3 className="prize-name">{prize.name}</h3>
                  <div className="prize-meta">
                    <span className="meta-item">Winners: {prize.winners}</span>
                    <span className="meta-item">Deadline: {prize.deadline}d</span>
                  </div>
                  <div className="prize-cost">{prize.cost} POINTS</div>
                </div>
                <button
                  className="apply-btn"
                  disabled={!canAfford}
                  onClick={() => alert(`Applied for ${prize.name}!`)}
                >
                  {canAfford ? 'APPLY' : 'LOCKED'}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Prizes
