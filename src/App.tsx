import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import BottomTabBar from './components/BottomTabBar';
import Home from './pages/Home';
import FindCourses from './pages/FindCourses';
import SwingCoach from './pages/SwingCoach';
import LetsPlayBuddy from './pages/LetsPlayBuddy';
import Login from './pages/Login';
import Tournaments from './pages/Tournaments';
import GolfGPS from './pages/GolfGPS';
import KidsLoveGolf from './pages/KidsLoveGolf';
import PGATour from './pages/PGATour';
import GolfNews from './pages/GolfNews';
import EquipmentDeals from './pages/EquipmentDeals';
import GolfVideos from './pages/GolfVideos';
import GolfPodcasts from './pages/GolfPodcasts';

export default function App() {
  return (
    <AuthProvider>
      <div className="max-w-md mx-auto min-h-screen bg-[#f8faf9] relative">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<FindCourses />} />
          <Route path="/swing" element={<SwingCoach />} />
          <Route path="/buddy" element={<LetsPlayBuddy />} />
          <Route path="/login" element={<Login />} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/gps" element={<GolfGPS />} />
          <Route path="/kids" element={<KidsLoveGolf />} />
          <Route path="/pga" element={<PGATour />} />
          <Route path="/news" element={<GolfNews />} />
          <Route path="/deals" element={<EquipmentDeals />} />
          <Route path="/videos" element={<GolfVideos />} />
          <Route path="/podcasts" element={<GolfPodcasts />} />
        </Routes>
        <BottomTabBar />
      </div>
    </AuthProvider>
  );
}
