import { Component, type ReactNode } from 'react';
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
import RoboBuddy from './pages/RoboBuddy';
import Notifications from './pages/Notifications';
import SeniorAssistant from './pages/SeniorAssistant';
import ToastContainer from './components/Toast';

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error) { console.error('[GolfBuddy] Render crash:', error); }
  render() {
    if (this.state.error) {
      return (
        <div className="max-w-md mx-auto min-h-screen bg-[#f8faf9] flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-6 text-center w-full">
            <h2 className="text-lg font-bold text-red-700 mb-2">Something went wrong</h2>
            <p className="text-sm text-gray-600 mb-4">{this.state.error.message}</p>
            <button
              onClick={() => { this.setState({ error: null }); window.location.reload(); }}
              className="px-6 py-3 rounded-xl bg-golf-700 text-white font-semibold text-sm hover:bg-golf-800 transition-colors"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
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
            <Route path="/robobuddy" element={<RoboBuddy />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/hey-caddie" element={<SeniorAssistant />} />
          </Routes>
          <ToastContainer />
          <BottomTabBar />
        </div>
      </AuthProvider>
    </ErrorBoundary>
  );
}
