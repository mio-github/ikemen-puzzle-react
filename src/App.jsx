import { useState } from 'react'
import Home from './components/Home'
import PuzzleList from './components/PuzzleList'
import PuzzleGame from './components/PuzzleGame'
import Collection from './components/Collection'
import Prizes from './components/Prizes'
import Navigation from './components/Navigation'
import './App.css'

// パズルデータ
export const puzzles = [
  {
    id: 1,
    title: 'クールビジネスマン',
    image: '/images/Pixabayビジネス風男性_1.jpg',
    difficulty: 'NORMAL',
    pieces: 16,
    cost: 0,
    isNew: true,
    category: 'business',
    mature: false
  },
  {
    id: 2,
    title: 'AIイケメン・夕焼け',
    image: '/images/Pixabay AI男性_1.png',
    difficulty: 'HARD',
    pieces: 25,
    cost: 50,
    isNew: false,
    isHot: true,
    category: 'modern',
    mature: false
  },
  {
    id: 3,
    title: 'AIイケメン・都会',
    image: '/images/Pixabay AI男性_2.png',
    difficulty: 'NORMAL',
    pieces: 16,
    cost: 0,
    isNew: false,
    category: 'modern',
    mature: false
  },
  {
    id: 4,
    title: 'アニメ系イケメン',
    image: '/images/Pixabayアニメ男性_1.png',
    difficulty: 'EXPERT',
    pieces: 36,
    cost: 80,
    isNew: false,
    category: 'casual',
    mature: false
  },
  {
    id: 5,
    title: 'カジュアルボーイ',
    image: '/images/アニメ風イケメン_1.jpg',
    difficulty: 'EASY',
    pieces: 9,
    cost: 0,
    isNew: true,
    category: 'casual',
    mature: false
  },
  // ダークモード専用パズル（成人向け）
  {
    id: 6,
    title: 'セクシービジネスマン',
    image: '/images/Pixabayビジネス風男性_1.jpg',
    difficulty: 'HARD',
    pieces: 25,
    cost: 100,
    isNew: true,
    isHot: true,
    category: 'mature',
    mature: true
  },
  {
    id: 7,
    title: 'ダークファンタジー',
    image: '/images/Pixabay AI男性_2.png',
    difficulty: 'EXPERT',
    pieces: 36,
    cost: 150,
    isNew: true,
    category: 'mature',
    mature: true
  }
]

function App() {
  const [currentScreen, setCurrentScreen] = useState('home')
  const [selectedPuzzle, setSelectedPuzzle] = useState(null)
  const [userPoints, setUserPoints] = useState(1250)
  const [coins, setCoins] = useState(450)
  const [premiumCoins, setPremiumCoins] = useState(80)
  const [completedPuzzles, setCompletedPuzzles] = useState([1, 3, 5])
  const [darkMode, setDarkMode] = useState(false)

  const navigateTo = (screen) => {
    setCurrentScreen(screen)
    setSelectedPuzzle(null)
  }

  const startPuzzle = (puzzle) => {
    setSelectedPuzzle(puzzle)
    setCurrentScreen('game')
  }

  const completePuzzle = (points) => {
    setUserPoints(prev => prev + points)
    if (selectedPuzzle && !completedPuzzles.includes(selectedPuzzle.id)) {
      setCompletedPuzzles(prev => [...prev, selectedPuzzle.id])
    }
    navigateTo('puzzles')
  }

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev)
  }

  // ダークモードに応じてパズルをフィルタリング
  const filteredPuzzles = darkMode
    ? puzzles // ダークモード：全パズル表示
    : puzzles.filter(p => !p.mature) // 通常モード：成人向けを除外

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <Home
          navigateTo={navigateTo}
          userPoints={userPoints}
          coins={coins}
          premiumCoins={premiumCoins}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />
      case 'puzzles':
        return <PuzzleList
          puzzles={filteredPuzzles}
          startPuzzle={startPuzzle}
          completedPuzzles={completedPuzzles}
          darkMode={darkMode}
        />
      case 'game':
        return <PuzzleGame
          puzzle={selectedPuzzle}
          onComplete={completePuzzle}
          onBack={() => navigateTo('puzzles')}
        />
      case 'collection':
        return <Collection
          puzzles={filteredPuzzles}
          completedPuzzles={completedPuzzles}
          darkMode={darkMode}
        />
      case 'prizes':
        return <Prizes userPoints={userPoints} darkMode={darkMode} />
      default:
        return <Home navigateTo={navigateTo} />
    }
  }

  return (
    <div className="app">
      <div className="phone-frame">
        {renderScreen()}
        {currentScreen !== 'game' && (
          <Navigation
            currentScreen={currentScreen}
            navigateTo={navigateTo}
          />
        )}
      </div>
    </div>
  )
}

export default App
