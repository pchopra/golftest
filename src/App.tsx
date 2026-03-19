import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import BottomTabBar from './components/BottomTabBar';
import FindCourses from './pages/FindCourses';
import SwingCoach from './pages/SwingCoach';
import LetsPlayBuddy from './pages/LetsPlayBuddy';
import Login from './pages/Login';

export default function App() {
  return (
    <AuthProvider>
      <div className="max-w-md mx-auto min-h-screen bg-[#f8faf9] relative">
        <Routes>
          <Route path="/" element={<FindCourses />} />
          <Route path="/swing" element={<SwingCoach />} />
          <Route path="/buddy" element={<LetsPlayBuddy />} />
          <Route path="/login" element={<Login />} />
        </Routes>
        <BottomTabBar />
      </div>
    </AuthProvider>
  );
}
