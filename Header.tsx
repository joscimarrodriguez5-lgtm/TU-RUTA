import { User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { useLanguage } from '../../contexts/LanguageContext';
import type { Language } from '../../types';

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: 'es', label: 'Español', flag: '🇭🇳' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
];

export function Header() {
  const { user, profile, signOut } = useAuth();
  const { setView, setShowAuthModal, setAuthModalMode } = useApp();
  const { language, setLanguage, t } = useLanguage();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => setView('home')}
          className="flex items-center gap-2 group"
        >
          <img
            src="/d5eb9f92-ed30-4fbc-a714-b6806e769d69-removebg-preview.png"
            alt="Tu Ruta Honduras"
            className="h-10 w-10 object-contain"
          />
          <div className="hidden sm:block">
            <span className="text-lg font-bold text-navy-900 leading-none" style={{ color: '#1a3a5c' }}>
              Tu{' '}
            </span>
            <span className="text-lg font-bold text-green-500 leading-none">Ruta</span>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {[
            { key: 'home' as const, label: t('home') },
            { key: 'search' as const, label: t('search') },
            { key: 'trips' as const, label: t('trips') },
          ].map(item => (
            <button
              key={item.key}
              onClick={() => setView(item.key)}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
            >
              {item.label}
            </button>
          ))}
          {profile?.role === 'admin' && (
            <button
              onClick={() => setView('admin')}
              className="px-4 py-2 text-sm font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
            >
              {t('admin')}
            </button>
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Language selector */}
          <div className="relative">
            <button
              onClick={() => { setShowLangMenu(!showLangMenu); setShowUserMenu(false); }}
              className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span className="text-base">{currentLang.flag}</span>
              <span className="hidden sm:block">{currentLang.code.toUpperCase()}</span>
              <ChevronDown size={14} />
            </button>
            {showLangMenu && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => { setLanguage(lang.code); setShowLangMenu(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                      language === lang.code ? 'text-blue-600 font-medium bg-blue-50' : 'text-gray-700'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User menu */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => { setShowUserMenu(!showUserMenu); setShowLangMenu(false); }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white text-sm font-bold">
                    {profile?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-24 truncate">
                  {profile?.full_name || user.email?.split('@')[0]}
                </span>
              </button>
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {profile?.full_name || 'Usuario'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => { setView('profile'); setShowUserMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Settings size={16} />
                    {t('myProfile')}
                  </button>
                  <button
                    onClick={() => { setView('trips'); setShowUserMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <User size={16} />
                    {t('myBookings')}
                  </button>
                  <div className="border-t border-gray-100 mt-1">
                    <button
                      onClick={() => { signOut(); setShowUserMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={16} />
                      {t('logout')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => { setShowAuthModal(true); setAuthModalMode('login'); }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors"
            >
              <User size={16} />
              <span>{t('login')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Click outside handler */}
      {(showLangMenu || showUserMenu) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => { setShowLangMenu(false); setShowUserMenu(false); }}
        />
      )}
    </header>
  );
}
