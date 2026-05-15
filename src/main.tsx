import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import ExhibitionDetail from './features/exhibitions/pages/ExhibitionDetail.tsx'
import ExhibitionSearch from './features/exhibitions/pages/ExhibitionSearch.tsx'
import AllExhibitions from './features/exhibitions/pages/AllExhibitions.tsx'
import ReviewWrite from './features/exhibitions/pages/ReviewWrite.tsx'
import Login from './features/user/pages/Login.tsx'
import Signup from './features/user/pages/Signup.tsx'
import MyPage from './features/user/pages/MyPage.tsx'
import Preferences from './features/user/pages/Preferences.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/exhibitions/search" element={<ExhibitionSearch />} />
        <Route path="/exhibitions/all" element={<AllExhibitions />} />
        <Route path="/exhibitions/:id" element={<ExhibitionDetail />} />
        <Route path="/exhibitions/:id/review" element={<ReviewWrite />} />
        <Route path="/user/login" element={<Login />} />
        <Route path="/user/signup" element={<Signup />} />
        <Route path="/user/preferences" element={<Preferences />} />
        <Route path="/user/mypage" element={<MyPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
