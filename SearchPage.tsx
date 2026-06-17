import { useState, useEffect } from 'react';
import { SlidersHorizontal, List, Map as MapIcon } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useRoutes } from '../hooks/useRoutes';
import { SearchForm } from '../components/search/SearchForm';
import { RouteCard } from '../components/transport/RouteCard';
import { RouteDetail } from '../components/transport/RouteDetail';
import { BookingModal } from '../components/booking/BookingModal';
import { MapView } from '../components/map/MapView';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import type { Route } from '../types';

type SortOption = 'price' | 'duration' | 'rating';
type ViewMode = 'list' | 'map';

export function SearchPage() {
  const { searchParams, setSearchParams, selectedRoute, setSelectedRoute } = useApp();
  const { t } = useLanguage();
  const { routes, loading, searchRoutes, getAllRoutes } = useRoutes();

  const [sortBy, setSortBy] = useState<SortOption>('price');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showDetail, setShowDetail] = useState(false);
  const [bookingRoute, setBookingRoute] = useState<Route | null>(null);

  useEffect(() => {
    if (searchParams.origin || searchParams.destination) {
      searchRoutes(searchParams);
    } else {
      getAllRoutes();
    }
  }, []);

  function handleSearch(params: typeof searchParams) {
    setSearchParams(params);
    searchRoutes(params);
    setSelectedRoute(null);
    setShowDetail(false);
  }

  function handleSelectRoute(route: Route) {
    setSelectedRoute(route);
    setShowDetail(true);
  }

  function handleBook(route: Route) {
    setBookingRoute(route);
  }

  const sortedRoutes = [...routes].sort((a, b) => {
    if (sortBy === 'price') return a.price_hnl - b.price_hnl;
    if (sortBy === 'duration') return (a.duration_minutes || 999) - (b.duration_minutes || 999);
    if (sortBy === 'rating') return (b.company?.rating || 0) - (a.company?.rating || 0);
    return 0;
  });

  const cheapestRoute = routes.reduce((best, r) => (!best || r.price_hnl < best.price_hnl) ? r : best, null as Route | null);
  const fastestRoute = routes.reduce((best, r) => (!best || (r.duration_minutes || 999) < (best.duration_minutes || 999)) ? r : best, null as Route | null);
  const bestRatedRoute = routes.reduce((best, r) => (!best || (r.company?.rating || 0) > (best.company?.rating || 0)) ? r : best, null as Route | null);

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-20 md:pb-8">
      {/* Search Bar */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <SearchForm onSearch={handleSearch} compact />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-5">
        {/* Results header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <LoadingSpinner size="sm" />
                Buscando rutas...
              </div>
            ) : (
              <div>
                <span className="text-lg font-bold text-gray-900">{sortedRoutes.length}</span>
                <span className="text-gray-500 ml-1 text-sm">{t('routesFound')}</span>
                {(searchParams.origin || searchParams.destination) && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {searchParams.origin && `Desde: ${searchParams.origin}`}
                    {searchParams.origin && searchParams.destination && ' → '}
                    {searchParams.destination && `Hasta: ${searchParams.destination}`}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'map' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
              >
                <MapIcon size={16} />
              </button>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortOption)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="price">Menor precio</option>
              <option value="duration">Más rápido</option>
              <option value="rating">Mejor calificación</option>
            </select>
          </div>
        </div>

        {viewMode === 'map' ? (
          <div className="h-[60vh] rounded-2xl overflow-hidden shadow-md">
            <MapView
              className="w-full h-full"
              selectedRoute={selectedRoute}
              zoom={7}
            />
          </div>
        ) : (
          <>
            {loading && (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            )}

            {!loading && sortedRoutes.length === 0 && (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SlidersHorizontal size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-700">{t('noRoutesFound')}</h3>
                <p className="text-gray-400 mt-1">{t('noRoutesMessage')}</p>
              </div>
            )}

            {!loading && sortedRoutes.length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedRoutes.map(route => (
                  <RouteCard
                    key={route.id}
                    route={route}
                    badge={
                      route.id === cheapestRoute?.id ? 'cheapest' :
                      route.id === fastestRoute?.id ? 'fastest' :
                      route.id === bestRatedRoute?.id ? 'best' :
                      undefined
                    }
                    onSelect={handleSelectRoute}
                    onBook={handleBook}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Route Detail Drawer */}
      {showDetail && selectedRoute && (
        <RouteDetail
          route={selectedRoute}
          onClose={() => { setShowDetail(false); setSelectedRoute(null); }}
          onBook={route => { setShowDetail(false); handleBook(route); }}
        />
      )}

      {/* Booking Modal */}
      {bookingRoute && (
        <BookingModal
          route={bookingRoute}
          onClose={() => setBookingRoute(null)}
        />
      )}
    </div>
  );
}
