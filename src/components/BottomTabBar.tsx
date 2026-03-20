import { NavLink } from 'react-router-dom';
import { Home, MapPin, Video, Users, UserCircle } from 'lucide-react';

const tabs = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/courses', label: 'Courses', icon: MapPin },
  { to: '/buddy', label: "Buddy", icon: Users },
  { to: '/swing', label: 'Swing', icon: Video },
  { to: '/login', label: 'Account', icon: UserCircle },
];

export default function BottomTabBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-green-900 z-50">
      <div className="max-w-md mx-auto flex">
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2 pt-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] transition-colors ${
                label === 'Home'
                  ? isActive
                    ? 'text-amber-400'
                    : 'text-amber-300/70'
                  : isActive
                    ? 'text-white'
                    : 'text-green-300/60'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={label === 'Home' ? 26 : 22} strokeWidth={label === 'Home' ? 2.8 : isActive ? 2.5 : 2} />
                <span className={`text-[10px] mt-1 leading-tight text-center ${label === 'Home' ? 'font-extrabold tracking-wide' : isActive ? 'font-semibold' : 'font-medium'}`}>
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
