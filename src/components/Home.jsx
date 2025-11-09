import './Home.css'

const Home = ({ navigateTo, userPoints, coins, premiumCoins, darkMode, toggleDarkMode }) => {
  const missions = [
    { id: 1, title: 'Login Bonus', progress: '1/1', reward: 50, completed: true },
    { id: 2, title: 'Complete 3 Puzzles', progress: '1/3', reward: 100, completed: false },
    { id: 3, title: 'Watch 5 Ads', progress: '2/5', reward: 80, completed: false }
  ]

  return (
    <div className={`screen home-screen ${darkMode ? 'dark-mode' : ''}`}>
      {/* Header */}
      <header className="home-header">
        <div className="logo">
          <div className="logo-icon">⊞</div>
          <div className="logo-text">
            <div className="logo-main">IKEMEN</div>
            <div className="logo-sub">PUZZLE</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={toggleDarkMode}
            className="dark-mode-toggle"
            style={{
              background: darkMode ? '#ffffff' : '#1a1a1a',
              color: darkMode ? '#000000' : '#ffffff',
              border: `1px solid ${darkMode ? '#ffffff' : '#333'}`,
              padding: '8px 12px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            {darkMode ? '🌙 DARK' : '☀️ LIGHT'}
          </button>
          <div className="user-avatar">
            <div className="avatar-circle">S</div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="home-content">
        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">POINTS</div>
            <div className="stat-value">{userPoints.toLocaleString()}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">COINS</div>
            <div className="stat-value">{coins}</div>
          </div>
          <div className="stat-card premium">
            <div className="stat-label">☺ COINS</div>
            <div className="stat-value">{premiumCoins}</div>
          </div>
        </div>

        {/* Event Banner */}
        <div className="event-banner">
          <div className="event-badge">EVENT</div>
          <div className="event-title">IKEMEN COLLECTION CAMPAIGN</div>
          <div className="event-desc">Double points during the event period</div>
          <div className="event-glow"></div>
        </div>

        {/* Missions */}
        <section className="section">
          <h2 className="section-title">
            <span className="title-line"></span>
            DAILY MISSIONS
            <span className="title-line"></span>
          </h2>
          <div className="missions-list">
            {missions.map(mission => (
              <div key={mission.id} className={`mission-card ${mission.completed ? 'completed' : ''}`}>
                <div className="mission-info">
                  <div className="mission-title">{mission.title}</div>
                  <div className="mission-progress">{mission.progress}</div>
                </div>
                <div className="mission-reward">
                  {mission.completed ? '✓' : `+${mission.reward}`}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <div className="quick-actions">
          <button className="action-btn primary" onClick={() => navigateTo('puzzles')}>
            <span className="btn-icon">⊞</span>
            START PUZZLE
          </button>
          <button className="action-btn secondary" onClick={() => navigateTo('prizes')}>
            <span className="btn-icon">⋆</span>
            VIEW PRIZES
          </button>
        </div>
      </div>
    </div>
  )
}

export default Home
