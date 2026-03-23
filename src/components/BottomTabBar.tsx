import { NavLink } from 'react-router-dom';
import { Home, MapPin, Users, Bell, UserCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const tabs = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/courses', label: 'Courses', icon: MapPin },
  { to: '/buddy', label: "Buddy", icon: Users },
  { to: '/notifications', label: 'Alerts', icon: Bell },
  { to: '/login', label: 'Account', icon: UserCircle },
];

export default function BottomTabBar() {
  const { unreadCount } = useAuth();

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
                <span className="relative">
                  <Icon size={label === 'Home' ? 26 : 22} strokeWidth={label === 'Home' ? 2.8 : isActive ? 2.5 : 2} />
                  {label === 'Alerts' && unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </span>
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
