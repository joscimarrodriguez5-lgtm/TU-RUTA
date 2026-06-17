import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AppProvider, useApp } from './contexts/AppContext';
import { SplashScreen } from './components/ui/SplashScreen';
import { PageTransition } from './components/ui/PageTransition';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { AuthModal } from './components/auth/AuthModal';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { TripsPage } from './pages/TripsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';

function AppContent() {
  const { view } = useApp();

  function renderPage() {
    if (view === 'home' || view === 'about') return <HomePage />;
    if (view === 'search' || view === 'results' || view === 'route-detail' || view === 'booking') return <SearchPage />;
    if (view === 'trips') return <TripsPage />;
    if (view === 'profile') return <ProfilePage />;
    if (view === 'admin') return <AdminPage />;
    return <HomePage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <PageTransition viewKey={view}>
        <main>{renderPage()}</main>
      </PageTransition>
      <BottomNav />
      <AuthModal />
    </div>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <LanguageProvider>
      <AuthProvider>
        <AppProvider>
          {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
          <AppContent />
        </AppProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
