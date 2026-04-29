import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { trackPageLoad } from './tracker'
trackPageLoad()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
