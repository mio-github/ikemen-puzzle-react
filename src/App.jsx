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
    image: '/images/business-cool-01.jpg',
    difficulty: 'NORMAL',
    pieces: 16,
    cost: 0,
    isNew: true,
    category: 'business',
    mature: false
  },
  {
    id: 2,
    title: '夕焼けの男',
    image: '/images/modern-sunset-01.png',
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
    title: '都会の紳士',
    image: '/images/modern-urban-01.png',
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
    image: '/images/anime-standard-01.png',
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
    image: '/images/anime-casual-01.jpg',
    difficulty: 'EASY',
    pieces: 9,
    cost: 0,
    isNew: true,
    category: 'casual',
    mature: false
  },
  {
    id: 6,
    title: 'モダンヒーロー',
    image: '/images/modern-hero-01.png',
    difficulty: 'NORMAL',
    pieces: 16,
    cost: 0,
    isNew: true,
    category: 'modern',
    mature: false
  },
  {
    id: 7,
    title: 'クールアーティスト',
    image: '/images/casual-artist-01.png',
    difficulty: 'HARD',
    pieces: 25,
    cost: 60,
    isNew: true,
    isHot: true,
    category: 'casual',
    mature: false
  },
  {
    id: 8,
    title: 'ストリートファイター',
    image: '/images/modern-street-01.png',
    difficulty: 'EXPERT',
    pieces: 36,
    cost: 100,
    isNew: false,
    category: 'modern',
    mature: false
  },
  {
    id: 9,
    title: 'ダークプリンス',
    image: '/images/fantasy-dark-prince-01.png',
    difficulty: 'HARD',
    pieces: 25,
    cost: 80,
    isNew: true,
    category: 'fantasy',
    mature: false
  },
  // ダークモード専用パズル（プレミアム）
  {
    id: 11,
    title: 'プレミアムビジネス',
    image: '/images/business-cool-01.jpg',
    difficulty: 'HARD',
    pieces: 25,
    cost: 100,
    isNew: true,
    isHot: true,
    category: 'mature',
    mature: true
  },
  {
    id: 12,
    title: 'ダークファンタジー',
    image: '/images/modern-urban-01.png',
    difficulty: 'EXPERT',
    pieces: 36,
    cost: 150,
    isNew: true,
    category: 'mature',
    mature: true
  },
  {
    id: 13,
    title: 'ミッドナイトアーティスト',
    image: '/images/anime-standard-01.png',
    difficulty: 'HARD',
    pieces: 25,
    cost: 120,
    isNew: false,
    category: 'mature',
    mature: true
  },
  {
    id: 14,
    title: 'ダークヒーロー',
    image: '/images/anime-casual-01.jpg',
    difficulty: 'EXPERT',
    pieces: 36,
    cost: 180,
    isNew: true,
    isHot: true,
    category: 'mature',
    mature: true
  },
  {
    id: 15,
    title: 'プレミアムモダン',
    image: '/images/modern-hero-01.png',
    difficulty: 'HARD',
    pieces: 25,
    cost: 150,
    isNew: true,
    category: 'mature',
    mature: true
  },
  {
    id: 16,
    title: 'プレミアムアーティスト',
    image: '/images/casual-artist-01.png',
    difficulty: 'EXPERT',
    pieces: 36,
    cost: 200,
    isNew: true,
    isHot: true,
    category: 'mature',
    mature: true
  },
  {
    id: 17,
    title: 'プレミアムストリート',
    image: '/images/modern-street-01.png',
    difficulty: 'EXPERT',
    pieces: 36,
    cost: 180,
    isNew: false,
    category: 'mature',
    mature: true
  },
  {
    id: 18,
    title: 'シークレットプリンス',
    image: '/images/fantasy-dark-prince-01.png',
    difficulty: 'EXPERT',
    pieces: 36,
    cost: 200,
    isNew: true,
    category: 'mature',
    mature: true
  },
  {
    id: 19,
    title: 'ミステリアスナイト',
    image: '/images/fantasy-mysterious-night-01.png',
    difficulty: 'HARD',
    pieces: 25,
    cost: 70,
    isNew: true,
    isHot: true,
    category: 'fantasy',
    mature: false
  },
  {
    id: 20,
    title: 'エレガントジェントルマン',
    image: '/images/business-elegant-01.png',
    difficulty: 'NORMAL',
    pieces: 16,
    cost: 0,
    isNew: true,
    category: 'business',
    mature: false
  },
  {
    id: 21,
    title: 'プレミアムナイト',
    image: '/images/fantasy-mysterious-night-01.png',
    difficulty: 'EXPERT',
    pieces: 36,
    cost: 180,
    isNew: true,
    isHot: true,
    category: 'mature',
    mature: true
  },
  {
    id: 22,
    title: 'プレミアムジェントルマン',
    image: '/images/business-elegant-01.png',
    difficulty: 'HARD',
    pieces: 25,
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
  const [premiumCoins, setPremiumCoins] = useState(250) // モック用に十分な額を設定
  const [completedPuzzles, setCompletedPuzzles] = useState([1, 3, 5])
  const [darkMode, setDarkMode] = useState(false)
  const [darkModeUnlocked, setDarkModeUnlocked] = useState(false) // ダークモード購入状態
  const [showDarkModeModal, setShowDarkModeModal] = useState(false) // 購入モーダル表示
  const [requestCounts, setRequestCounts] = useState({}) // パズルごとの熱望カウント

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
    if (!darkModeUnlocked) {
      // 未購入の場合、購入モーダルを表示
      setShowDarkModeModal(true)
    } else {
      // 購入済みの場合、自由に切り替え
      setDarkMode(prev => !prev)
    }
  }

  const purchaseDarkMode = () => {
    const DARK_MODE_COST = 200 // ☺︎コイン

    if (premiumCoins >= DARK_MODE_COST) {
      setPremiumCoins(prev => prev - DARK_MODE_COST)
      setDarkModeUnlocked(true)
      setDarkMode(true)
      setShowDarkModeModal(false)
      alert('🌙 ダークモードを解放しました！\nプレミアムパズルをお楽しみください。')
    } else {
      alert(`☺︎コインが不足しています。\n必要: ${DARK_MODE_COST}☺\n所持: ${premiumCoins}☺\n\n課金画面へ移動しますか？`)
      // 実装時は課金画面へ遷移
    }
  }

  const sendRequest = (puzzleId) => {
    const REQUEST_COST = 50 // 応募ポイント

    if (userPoints >= REQUEST_COST) {
      setUserPoints(prev => prev - REQUEST_COST)
      setRequestCounts(prev => ({
        ...prev,
        [puzzleId]: (prev[puzzleId] || 0) + 1
      }))
      alert('🔥 続きを熱望！を送信しました！\n絵師さんに届けます。')
    } else {
      alert(`ポイントが不足しています。\n必要: ${REQUEST_COST}pt\n所持: ${userPoints}pt`)
    }
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
          darkModeUnlocked={darkModeUnlocked}
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
          userPoints={userPoints}
          requestCounts={requestCounts}
          onSendRequest={sendRequest}
        />
      case 'prizes':
        return <Prizes userPoints={userPoints} darkMode={darkMode} />
      default:
        return <Home navigateTo={navigateTo} />
    }
  }

  return (
    <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
      <div className={`phone-frame ${darkMode ? 'dark-mode' : ''}`}>
        {renderScreen()}
        {currentScreen !== 'game' && (
          <Navigation
            currentScreen={currentScreen}
            navigateTo={navigateTo}
          />
        )}

        {/* ダークモード購入モーダル */}
        {showDarkModeModal && (
          <div className="modal-overlay" onClick={() => setShowDarkModeModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>🌙 DARK MODE UNLOCK</h2>
                <button className="modal-close" onClick={() => setShowDarkModeModal(false)}>✕</button>
              </div>
              <div className="modal-body">
                <p className="modal-subtitle">プレミアムなイケメンパズルを解放！</p>
                <ul className="modal-features">
                  <li>✓ 10〜15種類の限定パズル</li>
                  <li>✓ 買い切り・永久使用可能</li>
                  <li>✓ いつでも通常モード切替</li>
                </ul>
                <div className="modal-cost">
                  <div className="cost-label">必要コスト</div>
                  <div className="cost-value">200 ☺︎コイン</div>
                  <div className="cost-balance">所持: {premiumCoins} ☺︎</div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-purchase" onClick={purchaseDarkMode}>
                  今すぐ解放する
                </button>
                <button className="btn-cancel" onClick={() => setShowDarkModeModal(false)}>
                  あとで
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
