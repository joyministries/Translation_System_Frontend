import React from 'react'
import ReactDOM from 'react-dom/client'

// Simple test component
function TestApp() {
  return (
    <div className="w-full h-screen bg-red-500 flex items-center justify-center text-white text-4xl font-bold">
      <div>
        <h1>If you see this, React is working!</h1>
        <p className="text-lg mt-4">The app is loading properly.</p>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <TestApp />
  </React.StrictMode>,
)
