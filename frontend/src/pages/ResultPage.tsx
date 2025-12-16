// ============================================
// RESULT PAGE
// ============================================
// Page for displaying genre prediction results

import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { PredictionResult } from '../types'
import { predictGenre } from '../clients/predictionClient'
import ResultsVisualization from '../components/ResultsVisualization'
import './ResultPage.css'

interface LocationState {
  segmentBlob?: Blob;
  fileName?: string;
  startTime?: number;
  endTime?: number;
}

function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;

  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Perform prediction on mount
  useEffect(() => {
    const performPrediction = async () => {
      // Check if we have the necessary data
      if (!state?.segmentBlob || !state?.fileName) {
        setError('Missing analysis data');
        setLoading(false);
        return;
      }

      try {
        console.log('🤖 Calling predictGenre...');
        const predictionResult = await predictGenre(
          state.segmentBlob,
          state.fileName,
          state.startTime || 0,
          state.endTime || 10
        );

        console.log('✅ Got result:', predictionResult);
        setResult(predictionResult);
        setLoading(false);
      } catch (err) {
        console.error('❌ Error analyzing segment:', err);
        setError('Error analyzing audio. Please try again.');
        setLoading(false);
      }
    };

    performPrediction();
  }, [state]);

  // Loading state
  if (loading) {
    return (
      <div className="result-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <h2>Analyzing your music...</h2>
          <p>This may take a few seconds</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !result) {
    return (
      <div className="result-page">
        <div className="error-state">
          <h2>❌ Analysis Failed</h2>
          <p>{error || 'Please upload and analyze an audio file first.'}</p>
          <button
            className="primary-button"
            onClick={() => navigate('/upload')}
          >
            Go to Upload
          </button>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="result-page">
      <div className="result-header">
        <h1>Genre Prediction Results</h1>
        <button
          className="secondary-button"
          onClick={() => navigate('/upload')}
        >
          Analyze Another File
        </button>
      </div>

      <ResultsVisualization result={result} />
    </div>
  );
}

export default ResultPage;
