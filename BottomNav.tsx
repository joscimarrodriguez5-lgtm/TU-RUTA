import { Home, Search, MapPin, User } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import type { AppView } from '../../types';

export function BottomNav() {
  const { view, setView, setShowAuthModal, setAuthModalMode } = useApp();
  const { user } = useAuth();
  const { t } = useLanguage();

  const tabs: { key: AppView; icon: typeof Home; label: string; requiresAuth?: boolean }[] = [
    { key: 'home', icon: Home, label: t('home') },
    { key: 'search', icon: Search, label: t('search') },
    { key: 'trips', icon: MapPin, label: t('trips'), requiresAuth: true },
    { key: 'profile', icon: User, label: t('profile') },
  ];

  function handleTabClick(tab: typeof tabs[0]) {
    if (tab.requiresAuth && !user) {
      setShowAuthModal(true);
      setAuthModalMode('login');
      return;
    }
    setView(tab.key);
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 md:hidden">
      <div className="grid grid-cols-4 h-16">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = view === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => handleTabClick(tab)}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                isActive ? 'text-blue-700' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <div className={`relative flex items-center justify-center w-8 h-8 rounded-xl transition-all ${
                isActive ? 'bg-blue-100' : ''
              }`}>
                <Icon size={20} />
                {isActive && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-700 rounded-full" />
                )}
              </div>
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
