import './Navigation.css'

const Navigation = ({ currentScreen, navigateTo }) => {
  const navItems = [
    { id: 'home', icon: '⌂', label: 'HOME' },
    { id: 'puzzles', icon: '⊞', label: 'PUZZLE' },
    { id: 'collection', icon: '♥', label: 'COLLECTION' },
    { id: 'prizes', icon: '⋆', label: 'PRIZE' }
  ]

  return (
    <nav className="navigation">
      {navItems.map(item => (
        <button
          key={item.id}
          className={`nav-item ${currentScreen === item.id ? 'active' : ''}`}
          onClick={() => navigateTo(item.id)}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  )
}

export default Navigation
