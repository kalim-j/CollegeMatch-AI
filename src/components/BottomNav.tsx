'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Home', activeIcon: '🏠', icon: '🏠' },
  { href: '/dashboard/predictor', label: 'Predict', activeIcon: '⚡', icon: '⚡' },
  { href: '/dashboard/scholarships', label: 'Scholarships', activeIcon: '🎓', icon: '🎓' },
  { href: '/dashboard/map', label: 'Map', activeIcon: '🗺️', icon: '🗺️' },
  { href: '/dashboard/profile', label: 'Profile', activeIcon: '👤', icon: '👤' },
];

export default function BottomNav() {
  const pathname = usePathname();

  if (!pathname?.startsWith('/dashboard')) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40
      bg-[#07091a]/95 backdrop-blur-2xl
      border-t border-white/[0.06]
      sm:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center justify-around px-2 py-1">
        {NAV_ITEMS.map(item => {
          const isActive = pathname === item.href ||
            (item.href !== '/dashboard' &&
              pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5
                px-3 py-2 rounded-2xl transition-all duration-200
                min-w-[56px]
                ${isActive
                  ? 'bg-purple-500/15'
                  : 'hover:bg-white/[0.05]'
                }`}
            >
              <span className={`text-xl transition-all duration-200
                ${isActive ? 'scale-110' : 'scale-100'}`}>
                {isActive ? item.activeIcon : item.icon}
              </span>
              <span className={`text-[10px] font-medium
                transition-colors duration-200
                ${isActive
                  ? 'text-purple-400'
                  : 'text-gray-600'}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-purple-400
                  mt-0.5 animate-pulse" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
