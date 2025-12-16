// ============================================
// RESULTS VISUALIZATION COMPONENT
// ============================================
// Displays prediction results with bar chart and top genres

import { PredictionResult } from '../types'
import { getTop3Genres, formatPercentage } from '../constants/genres'
import './ResultsVisualization.css'

interface ResultsVisualizationProps {
  result: PredictionResult;
}

function ResultsVisualization({ result }: ResultsVisualizationProps) {
  const top3 = getTop3Genres(result.probabilities);

  return (
    <div className="results-visualization">
      {/* Top 3 Genres */}
      <div className="top-genres">
        <h3>Top 3 Predicted Genres</h3>
        <div className="podium">
          {top3.map((item, index) => (
            <div key={item.genre.code} className={`podium-item rank-${index + 1}`}>
              <div className="rank-badge">{index + 1}</div>
              <div className="genre-name">{item.genre.name}</div>
              <div className="probability">{formatPercentage(item.probability, 1)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Full Bar Chart */}
      <div className="bar-chart">
        <h3>All Genres</h3>
        <div className="bars-container">
          {result.genres.map((genre, index) => {
            const probability = result.probabilities[index];
            const percentage = probability * 100;

            return (
              <div key={genre.code} className="bar-row">
                <div className="bar-label">
                  <span className="genre-code">{genre.code}</span>
                  <span className="genre-name">{genre.name}</span>
                </div>
                <div className="bar-wrapper">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: genre.color,
                    }}
                  >
                    <span className="bar-value">{formatPercentage(probability, 1)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Metadata */}
      <div className="result-metadata">
        <div className="metadata-item">
          <span className="metadata-label">File:</span>
          <span className="metadata-value">{result.audioFileName}</span>
        </div>
        <div className="metadata-item">
          <span className="metadata-label">Segment:</span>
          <span className="metadata-value">
            {result.segmentStart.toFixed(1)}s - {result.segmentEnd.toFixed(1)}s
          </span>
        </div>
        <div className="metadata-item">
          <span className="metadata-label">Analyzed:</span>
          <span className="metadata-value">
            {result.timestamp.toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
}

export default ResultsVisualization;
