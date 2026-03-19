import { NavLink } from 'react-router-dom';
import { MapPin, Video, Users, UserCircle } from 'lucide-react';

const tabs = [
  { to: '/', label: 'Find Courses', icon: MapPin },
  { to: '/buddy', label: "Let'sPlayBuddy", icon: Users },
  { to: '/swing', label: 'Swing Coach', icon: Video },
  { to: '/login', label: 'Account', icon: UserCircle },
];

export default function BottomTabBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-md mx-auto flex">
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2 pt-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] transition-colors ${
                isActive ? 'text-golf-700' : 'text-gray-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-[10px] mt-1 leading-tight text-center ${isActive ? 'font-semibold' : 'font-medium'}`}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
