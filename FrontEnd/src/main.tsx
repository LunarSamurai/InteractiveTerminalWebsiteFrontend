import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AuthProvider } from './lib/auth'
import './index.css'
import HomePage from './pages/HomePage'
import CareersPage from './pages/careers/CareersPage'

const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/join-cyber-ranger', element: <CareersPage /> },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
)
