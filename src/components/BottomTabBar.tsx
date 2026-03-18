import { NavLink } from 'react-router-dom';
import { MapPin, Video } from 'lucide-react';

export default function BottomTabBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-md mx-auto flex">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-2 pt-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] transition-colors ${
              isActive ? 'text-golf-700' : 'text-gray-400'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <MapPin size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-xs mt-1 ${isActive ? 'font-semibold' : 'font-medium'}`}>
                Find Courses
              </span>
            </>
          )}
        </NavLink>
        <NavLink
          to="/swing"
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-2 pt-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] transition-colors ${
              isActive ? 'text-golf-700' : 'text-gray-400'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Video size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-xs mt-1 ${isActive ? 'font-semibold' : 'font-medium'}`}>
                Swing Coach
              </span>
            </>
          )}
        </NavLink>
      </div>
    </nav>
  );
}
