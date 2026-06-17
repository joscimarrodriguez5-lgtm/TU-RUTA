import { X, Clock, MapPin, Bus, DollarSign, Phone, Calendar, AlertTriangle, ChevronRight } from 'lucide-react';
import { formatHnl, formatUsd, hnlToUsd } from '../../lib/currency';
import { StarRating } from '../ui/StarRating';
import type { Route } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface RouteDetailProps {
  route: Route;
  onClose: () => void;
  onBook: (route: Route) => void;
}

export function RouteDetail({ route, onClose, onBook }: RouteDetailProps) {
  const { t } = useLanguage();
  const company = route.company;

  const durationHours = route.duration_minutes ? Math.floor(route.duration_minutes / 60) : null;
  const durationMins = route.duration_minutes ? route.duration_minutes % 60 : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Handle */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-gray-900">{t('viewDetails')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Route Visual */}
          <div className="bg-gradient-to-br from-blue-700 to-blue-600 rounded-2xl p-5 text-white">
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center gap-1 mt-1">
                <div className="w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow" />
                <div className="w-0.5 flex-1 min-h-8 bg-white opacity-30 rounded" />
                <div className="w-3 h-3 bg-red-400 rounded-full border-2 border-white shadow" />
              </div>
              <div className="flex-1">
                <div className="mb-3">
                  <p className="text-xs text-blue-200 uppercase tracking-wider">{t('departure')}</p>
                  <p className="text-xl font-bold">{route.origin_city}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-200 uppercase tracking-wider">{t('arrival')}</p>
                  <p className="text-xl font-bold">{route.destination_city}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-extrabold">{formatHnl(route.price_hnl)}</p>
                <p className="text-blue-200 text-sm">({formatUsd(hnlToUsd(route.price_hnl))})</p>
                <p className="text-blue-200 text-xs mt-1">por persona</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                icon: Clock,
                label: t('duration'),
                value: route.duration_minutes
                  ? `${durationHours ? durationHours + 'h' : ''} ${durationMins ? durationMins + 'm' : ''}`.trim()
                  : 'N/D',
                color: 'text-blue-600 bg-blue-50',
              },
              {
                icon: MapPin,
                label: t('distance'),
                value: route.distance_km ? `${route.distance_km} km` : 'N/D',
                color: 'text-green-600 bg-green-50',
              },
              {
                icon: Bus,
                label: t('frequency'),
                value: route.frequency || 'Consultar',
                color: 'text-orange-600 bg-orange-50',
              },
              {
                icon: DollarSign,
                label: 'Tipo',
                value: company?.type === 'bus' ? 'Autobús' : company?.type === 'shuttle' ? 'Shuttle' : 'Internacional',
                color: 'text-purple-600 bg-purple-50',
              },
            ].map(stat => (
              <div key={stat.label} className={`rounded-xl p-3 ${stat.color.split(' ')[1]}`}>
                <stat.icon size={18} className={stat.color.split(' ')[0]} />
                <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                <p className="text-sm font-bold text-gray-800 mt-0.5">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Company */}
          {company && (
            <div className="border border-gray-100 rounded-xl p-4">
              <h3 className="text-sm font-bold text-gray-700 mb-3">{t('company')}</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Bus size={22} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{company.name}</p>
                  {company.description && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{company.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <StarRating rating={company.rating} size={12} />
                    <span className="text-xs text-gray-500">{company.rating.toFixed(1)}</span>
                  </div>
                </div>
                {company.phone && (
                  <a
                    href={`tel:${company.phone}`}
                    className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-xl text-sm font-medium hover:bg-green-100 transition-colors"
                  >
                    <Phone size={14} />
                    Llamar
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Schedule */}
          {route.schedule && route.schedule.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <Calendar size={16} className="text-blue-500" />
                {t('schedule')}
              </h3>
              <div className="space-y-2">
                {route.schedule.map((s, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl text-sm">
                    <span className="text-gray-600">{s.day}</span>
                    <span className="font-medium text-gray-800">
                      {s.first} – {s.last}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Safety notice */}
          <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
            <AlertTriangle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-700">
              Recuerda compartir tu ubicación con un familiar o amigo antes de abordar. Tu seguridad es lo primero.
            </p>
          </div>

          {/* CTA */}
          <button
            onClick={() => { onClose(); onBook(route); }}
            className="w-full py-4 bg-gradient-to-r from-blue-700 to-blue-600 text-white font-bold rounded-xl hover:from-blue-800 hover:to-blue-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-base"
          >
            {t('bookNow')}
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
