import { Routes, Route } from 'react-router-dom';
import BottomTabBar from './components/BottomTabBar';
import FindCourses from './pages/FindCourses';
import SwingCoach from './pages/SwingCoach';

export default function App() {
  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#f8faf9] relative">
      <Routes>
        <Route path="/" element={<FindCourses />} />
        <Route path="/swing" element={<SwingCoach />} />
      </Routes>
      <BottomTabBar />
    </div>
  );
}
