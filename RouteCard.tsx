import { Clock, MapPin, Bus, Zap, TrendingDown, ChevronRight, Star } from 'lucide-react';
import { formatHnl, formatUsd, hnlToUsd } from '../../lib/currency';
import type { Route } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface RouteCardProps {
  route: Route;
  badge?: 'cheapest' | 'fastest' | 'best';
  onSelect: (route: Route) => void;
  onBook: (route: Route) => void;
}

const BADGE_CONFIG = {
  cheapest: { label: 'Más Barato', color: 'bg-green-100 text-green-700', icon: TrendingDown },
  fastest: { label: 'Más Rápido', color: 'bg-blue-100 text-blue-700', icon: Zap },
  best: { label: 'Mejor Opción', color: 'bg-orange-100 text-orange-700', icon: Star },
};

const TYPE_ICONS = {
  bus: '🚌',
  minibus: '🚐',
  taxi: '🚖',
  shuttle: '🚌',
  international: '🚌',
};

export function RouteCard({ route, badge, onSelect, onBook }: RouteCardProps) {
  const { t } = useLanguage();
  const company = route.company;
  const badgeConfig = badge ? BADGE_CONFIG[badge] : null;

  const durationHours = route.duration_minutes ? Math.floor(route.duration_minutes / 60) : null;
  const durationMins = route.duration_minutes ? route.duration_minutes % 60 : null;

  const priceHnl = route.price_hnl * 1; // per person shown
  const priceUsd = hnlToUsd(priceHnl);

  return (
    <div
      className={`bg-white rounded-2xl border-2 hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group ${
        badge ? 'border-blue-200 shadow-md' : 'border-gray-100 shadow-sm hover:border-blue-100'
      }`}
      onClick={() => onSelect(route)}
    >
      {/* Badge */}
      {badgeConfig && (
        <div className={`px-4 py-1.5 flex items-center gap-1.5 ${badgeConfig.color}`}>
          <badgeConfig.icon size={12} />
          <span className="text-xs font-bold tracking-wide uppercase">{badgeConfig.label}</span>
        </div>
      )}

      <div className="p-4">
        {/* Company */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center text-lg">
              {company ? TYPE_ICONS[company.type] || '🚌' : '🚌'}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">{company?.name || 'Empresa'}</p>
              <div className="flex items-center gap-1">
                <Star size={10} className="text-yellow-400 fill-yellow-400" />
                <span className="text-xs text-gray-500">{company?.rating?.toFixed(1) || '–'}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-extrabold text-gray-900">{formatHnl(priceHnl)}</p>
            <p className="text-xs text-gray-400">({formatUsd(priceUsd)})</p>
          </div>
        </div>

        {/* Route */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white shadow" />
            <div className="w-0.5 h-6 bg-gray-200 rounded" />
            <div className="w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{route.origin_city}</p>
            <p className="text-xs text-gray-400 my-1">{route.name}</p>
            <p className="text-sm font-semibold text-gray-800 truncate">{route.destination_city}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-gray-500 border-t border-gray-50 pt-3">
          {route.duration_minutes && (
            <div className="flex items-center gap-1">
              <Clock size={12} className="text-blue-400" />
              <span>
                {durationHours ? `${durationHours}h ` : ''}
                {durationMins ? `${durationMins}m` : ''}
              </span>
            </div>
          )}
          {route.distance_km && (
            <div className="flex items-center gap-1">
              <MapPin size={12} className="text-green-400" />
              <span>{route.distance_km} km</span>
            </div>
          )}
          {route.frequency && (
            <div className="flex items-center gap-1">
              <Bus size={12} className="text-orange-400" />
              <span className="truncate">{route.frequency}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={e => { e.stopPropagation(); onSelect(route); }}
            className="flex-1 py-2 text-sm font-medium text-blue-700 border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-1"
          >
            {t('viewDetails')}
            <ChevronRight size={14} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onBook(route); }}
            className="flex-1 py-2 text-sm font-bold text-white bg-blue-700 rounded-xl hover:bg-blue-800 transition-colors"
          >
            {t('bookNow')}
          </button>
        </div>
      </div>
    </div>
  );
}
