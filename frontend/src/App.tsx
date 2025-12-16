// ============================================
// ROOT APP COMPONENT
// ============================================

import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import HomePage from './pages/HomePage'
import UploadPage from './pages/UploadPage'
import ResultPage from './pages/ResultPage'
import HistoryPage from './pages/HistoryPage'
import './App.css'

function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <header className="app-header">
      <div className="header-content">
        {!isHomePage && (
          <button
            className="back-button"
            onClick={() => navigate('/')}
          >
            ← Back to Home
          </button>
        )}

        <h1 onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          🎵 Manginassifier
        </h1>
        <p>Music Genre Classification</p>
      </div>
    </header>
  );
}

function AppContent() {
  return (
    <>
      <AppHeader />

      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/result" element={<ResultPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </main>

      <footer className="app-footer">
        <p>Powered by React + TypeScript + Vite | TensorFlow Model</p>
      </footer>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <AppContent />
      </div>
    </BrowserRouter>
  );
}

export default App
