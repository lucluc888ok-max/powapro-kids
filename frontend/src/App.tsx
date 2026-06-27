import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Training from './pages/Training';
import ParentApproval from './pages/ParentApproval';
import Skills from './pages/Skills';
import History from './pages/History';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ paddingBottom: 62, minHeight: '100vh' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/training" element={<Training />} />
          <Route path="/approval" element={<ParentApproval />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
      <BottomNav />
    </BrowserRouter>
  );
}
