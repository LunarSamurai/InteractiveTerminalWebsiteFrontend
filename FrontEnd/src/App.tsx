import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import CareersPage from './pages/careers/CareersPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/join-cyber-ranger" element={<CareersPage />} />
    </Routes>
  )
}
