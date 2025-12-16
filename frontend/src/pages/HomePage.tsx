// ============================================
// HOME PAGE
// ============================================
// Landing page with project introduction

import { useNavigate } from 'react-router-dom'
import './HomePage.css'

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="hero-icon">🎵</div>
        <h1 className="hero-title">Manginassifier</h1>
        <p className="hero-subtitle">AI-Powered Music Genre Classification</p>

        <p className="hero-description">
          Upload any music track and let our deep learning model analyze
          a 10-second segment to predict its genre with high accuracy.
        </p>

        <button className="start-button" onClick={() => navigate('/upload')}>
          Start Classifying
          <span className="button-icon">→</span>
        </button>
      </div>

      <div className="features-section">
        <div className="feature-card">
          <div className="feature-icon">🎸</div>
          <h3>9 Genres Supported</h3>
          <p>Blues, Classical, Jazz, Metal, Pop, R&B, Rap, Rock, and Techno/Electronic</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🧠</div>
          <h3>Deep Learning Model</h3>
          <p>Trained on thousands of songs using TensorFlow for accurate predictions</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">⚡</div>
          <h3>Fast Analysis</h3>
          <p>Get results in seconds with real-time audio processing</p>
        </div>
      </div>
    </div>
  )
}

export default HomePage
