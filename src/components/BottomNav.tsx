'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Home', icon: '🏠' },
  { href: '/dashboard/predictor', label: 'Predict', icon: '⚡' },
  { href: '/dashboard/scholarships', label: 'Scholarships', icon: '🎓' },
  { href: '/dashboard/map', label: 'Map', icon: '🗺️' },
  { href: '/dashboard/profile', label: 'Profile', icon: '👤' },
];

export default function BottomNav() {
  const pathname = usePathname();
  if (!pathname?.startsWith('/dashboard')) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40
        bg-white/90 backdrop-blur-2xl
        border-t border-purple-100
        shadow-lg shadow-purple-100/50
        sm:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around
        px-1 py-1.5 max-w-screen-sm mx-auto">
        {NAV_ITEMS.map(item => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' &&
              pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center
                gap-0.5 py-1.5 px-2 rounded-xl
                transition-all duration-200 flex-1
                max-w-[72px]
                ${isActive
                  ? 'bg-purple-50 border border-purple-200'
                  : 'hover:bg-purple-50/50'
                }`}
            >
              <span className={`text-xl leading-none
                transition-transform duration-200
                ${isActive ? 'scale-110' : 'scale-100'}`}>
                {item.icon}
              </span>
              <span className={`text-[9px] font-medium
                leading-none mt-0.5 text-center w-full
                transition-colors duration-200
                ${isActive ? 'text-purple-700' : 'text-gray-400'}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full
                  bg-purple-600 mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
