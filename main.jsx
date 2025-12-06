import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.js'

// 這裡負責將你的 App 顯示在 HTML 的 root 元素中
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
