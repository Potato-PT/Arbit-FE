import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import ExhibitionDetail from './pages/ExhibitionDetail.tsx'
import ArtSearch from './pages/ArtSearch.tsx'
import Login from './pages/Login.tsx'
import Signup from './pages/Signup.tsx'
import MyPage from './pages/MyPage.tsx'
import Preferences from './pages/Preferences.tsx'
import ReviewWrite from './pages/ReviewWrite.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/search" element={<ArtSearch />} />
        <Route path="/exhibitions/:id" element={<ExhibitionDetail />} />
        <Route path="/exhibitions/:id/review" element={<ReviewWrite />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/preferences" element={<Preferences />} />
        <Route path="/mypage" element={<MyPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
