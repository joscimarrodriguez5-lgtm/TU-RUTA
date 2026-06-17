import { createContext, useContext, useState, type ReactNode } from 'react';
import type { AppView, SearchParams, Route, TransportCompany, MapLocation } from '../types';

interface AppContextValue {
  view: AppView;
  setView: (view: AppView) => void;
  searchParams: SearchParams;
  setSearchParams: (params: Partial<SearchParams>) => void;
  selectedRoute: Route | null;
  setSelectedRoute: (route: Route | null) => void;
  selectedCompany: TransportCompany | null;
  setSelectedCompany: (company: TransportCompany | null) => void;
  mapCenter: MapLocation;
  setMapCenter: (loc: MapLocation) => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  authModalMode: 'login' | 'register' | 'reset';
  setAuthModalMode: (mode: 'login' | 'register' | 'reset') => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const today = new Date().toISOString().split('T')[0];

export function AppProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<AppView>('home');
  const [searchParams, setSearchParamsState] = useState<SearchParams>({
    origin: '',
    destination: '',
    date: today,
    passengers: 1,
  });
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<TransportCompany | null>(null);
  const [mapCenter, setMapCenter] = useState<MapLocation>({ lat: 15.2, lng: -86.8, name: 'Honduras' });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'reset'>('login');

  function setSearchParams(params: Partial<SearchParams>) {
    setSearchParamsState(prev => ({ ...prev, ...params }));
  }

  return (
    <AppContext.Provider
      value={{
        view, setView,
        searchParams, setSearchParams,
        selectedRoute, setSelectedRoute,
        selectedCompany, setSelectedCompany,
        mapCenter, setMapCenter,
        showAuthModal, setShowAuthModal,
        authModalMode, setAuthModalMode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
