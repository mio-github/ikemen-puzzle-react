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
    category: 'business'
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
    category: 'modern'
  },
  {
    id: 3,
    title: 'AIイケメン・都会',
    image: '/images/Pixabay AI男性_2.png',
    difficulty: 'NORMAL',
    pieces: 16,
    cost: 0,
    isNew: false,
    category: 'modern'
  },
  {
    id: 4,
    title: 'アニメ系イケメン',
    image: '/images/Pixabayアニメ男性_1.png',
    difficulty: 'EXPERT',
    pieces: 36,
    cost: 80,
    isNew: false,
    category: 'casual'
  },
  {
    id: 5,
    title: 'カジュアルボーイ',
    image: '/images/アニメ風イケメン_1.jpg',
    difficulty: 'EASY',
    pieces: 9,
    cost: 0,
    isNew: true,
    category: 'casual'
  }
]

function App() {
  const [currentScreen, setCurrentScreen] = useState('home')
  const [selectedPuzzle, setSelectedPuzzle] = useState(null)
  const [userPoints, setUserPoints] = useState(1250)
  const [coins, setCoins] = useState(450)
  const [premiumCoins, setPremiumCoins] = useState(80)
  const [completedPuzzles, setCompletedPuzzles] = useState([1, 3, 5])

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

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <Home
          navigateTo={navigateTo}
          userPoints={userPoints}
          coins={coins}
          premiumCoins={premiumCoins}
        />
      case 'puzzles':
        return <PuzzleList
          puzzles={puzzles}
          startPuzzle={startPuzzle}
          completedPuzzles={completedPuzzles}
        />
      case 'game':
        return <PuzzleGame
          puzzle={selectedPuzzle}
          onComplete={completePuzzle}
          onBack={() => navigateTo('puzzles')}
        />
      case 'collection':
        return <Collection
          puzzles={puzzles}
          completedPuzzles={completedPuzzles}
        />
      case 'prizes':
        return <Prizes userPoints={userPoints} />
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
