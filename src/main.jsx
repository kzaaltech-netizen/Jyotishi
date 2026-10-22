import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { initialLocale } from './lib/routes.js'
import { storedLocale } from './content/locales.js'
import { loadLocale } from './content/index.js'
import './index.css'

// Load the page's language (and the saved choice, used on app screens) before the first
// render, so the prerendered text is replaced in the same language.
const lang = initialLocale(window.location.pathname)

Promise.all([loadLocale(lang), storedLocale() && loadLocale(storedLocale())])
  .catch(() => {})
  .then(() => {
    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    )
  })
