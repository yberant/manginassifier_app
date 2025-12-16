// ============================================
// MAIN ENTRY POINT
// ============================================
// This is where React mounts to the DOM

import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  // Disabled StrictMode to prevent WaveSurfer double-mount issues in development
  // Re-enable before production build
  <App />
)
