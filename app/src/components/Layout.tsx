import { NavLink, Outlet } from 'react-router-dom';
import { useSettings } from '../hooks/useVocabulary';

const navItems = [
  { to: '/', label: '홈', icon: '🏠', end: true },
  { to: '/contents', label: '원문', icon: '📄', end: false },
  { to: '/daily-news', label: '직독직해', icon: '📝', end: false },
  { to: '/study', label: '학습', icon: '📚', end: false },
  { to: '/review', label: '복습', icon: '🔄', end: false },
];

export default function Layout() {
  const { settings, updateSettings } = useSettings();

  function toggleDark() {
    updateSettings({ darkMode: !settings.darkMode });
  }

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">📚 단어 외우기</h1>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggleDark}
            aria-label="다크 모드 토글"
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {settings.darkMode ? '☀️' : '🌙'}
          </button>
          <NavLink
            to="/settings"
            aria-label="설정"
            className={({ isActive }) =>
              `p-2 rounded-lg transition-colors ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`
            }
          >
            ⚙️
          </NavLink>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-10 flex bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700"
           style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {navItems.map(({ to, label, icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-2 min-h-[56px] text-xs transition-colors ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`
            }
          >
            <span className="text-xl mb-0.5">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
