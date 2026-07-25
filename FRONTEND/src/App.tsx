import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

import Home from './pages/Home';
import Temple from './pages/Temple';
import Siemsee from './pages/Siemsee';
import Calendar from './pages/Calendar';
import UserProfile from './pages/userProfile';
import BottomNav from './components/BottomNav';

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/temples" element={<Temple />} />
            <Route path="/siemsee" element={<Siemsee />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/profile" element={<UserProfile />} />
          </Routes>
        </main>
      </div>
      <BottomNav /> 
    </BrowserRouter>
  );
}