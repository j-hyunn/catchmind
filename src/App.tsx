import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'

import { HomePage, PoiDetailPage } from '@/pages'
import { trackPageView } from '@/utils/analytics'

import './App.css'

export function App() {
  const location = useLocation()

  useEffect(() => {
    const pagePath = `${location.pathname}${location.search}${location.hash}`
    trackPageView(pagePath)
  }, [location])

  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/poi/:poiId" element={<PoiDetailPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
