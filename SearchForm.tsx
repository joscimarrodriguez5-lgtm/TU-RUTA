import { useState } from 'react';
import { MapPin, ArrowRightLeft, Calendar, Users, Search } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useLanguage } from '../../contexts/LanguageContext';

const POPULAR_CITIES = [
  'San Pedro Sula',
  'Tegucigalpa',
  'La Ceiba',
  'El Progreso',
  'Choloma',
  'Tela',
  'Comayagua',
  'Siguatepeque',
  'Puerto Cortés',
  'Villanueva',
  'San Manuel',
  'Copán Ruinas',
  'Danlí',
  'Choluteca',
  'Tocoa',
];

interface SearchFormProps {
  onSearch: (params: { origin: string; destination: string; date: string; passengers: number }) => void;
  compact?: boolean;
}

export function SearchForm({ onSearch, compact = false }: SearchFormProps) {
  const { searchParams, setSearchParams } = useApp();
  const { t } = useLanguage();
  const [originSuggestions, setOriginSuggestions] = useState<string[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<string[]>([]);
  const [showOriginSugg, setShowOriginSugg] = useState(false);
  const [showDestSugg, setShowDestSugg] = useState(false);

  function getSuggestions(value: string) {
    if (value.length < 2) return [];
    return POPULAR_CITIES.filter(c => c.toLowerCase().includes(value.toLowerCase()));
  }

  function swapLocations() {
    setSearchParams({
      origin: searchParams.destination,
      destination: searchParams.origin,
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!searchParams.origin || !searchParams.destination) return;
    onSearch(searchParams);
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className={`bg-white rounded-2xl shadow-xl overflow-visible ${compact ? 'p-4' : 'p-6'}`}>
      {!compact && (
        <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
          <Search size={20} className="text-blue-600" />
          {t('searchTitle')}
        </h2>
      )}

      <div className={`grid gap-3 ${compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
        {/* Origin */}
        <div className="relative">
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">{t('origin')}</label>
          <div className="relative">
            <MapPin size={16} className="absolute left-3 top-3.5 text-green-500 z-10" />
            <input
              type="text"
              placeholder={t('whereFrom')}
              value={searchParams.origin}
              onChange={e => {
                setSearchParams({ origin: e.target.value });
                setOriginSuggestions(getSuggestions(e.target.value));
                setShowOriginSugg(true);
              }}
              onFocus={() => {
                setOriginSuggestions(getSuggestions(searchParams.origin));
                setShowOriginSugg(true);
              }}
              onBlur={() => setTimeout(() => setShowOriginSugg(false), 150)}
              className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all"
            />
          </div>
          {showOriginSugg && originSuggestions.length > 0 && (
            <ul className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden max-h-48 overflow-y-auto">
              {originSuggestions.map(city => (
                <li key={city}>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchParams({ origin: city });
                      setShowOriginSugg(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 flex items-center gap-2 text-gray-700"
                  >
                    <MapPin size={13} className="text-gray-400" />
                    {city}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Swap button (visible between origin/destination on mobile) */}
        <div className={`${compact ? 'hidden' : 'sm:hidden'} flex justify-center`}>
          <button
            type="button"
            onClick={swapLocations}
            className="w-10 h-10 rounded-full bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition-colors"
          >
            <ArrowRightLeft size={16} className="text-blue-600" />
          </button>
        </div>

        {/* Destination */}
        <div className="relative">
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">{t('destination')}</label>
          <div className="relative">
            <MapPin size={16} className="absolute left-3 top-3.5 text-red-500 z-10" />
            <input
              type="text"
              placeholder={t('whereTo')}
              value={searchParams.destination}
              onChange={e => {
                setSearchParams({ destination: e.target.value });
                setDestSuggestions(getSuggestions(e.target.value));
                setShowDestSugg(true);
              }}
              onFocus={() => {
                setDestSuggestions(getSuggestions(searchParams.destination));
                setShowDestSugg(true);
              }}
              onBlur={() => setTimeout(() => setShowDestSugg(false), 150)}
              className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all"
            />
          </div>
          {showDestSugg && destSuggestions.length > 0 && (
            <ul className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden max-h-48 overflow-y-auto">
              {destSuggestions.map(city => (
                <li key={city}>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchParams({ destination: city });
                      setShowDestSugg(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 flex items-center gap-2 text-gray-700"
                  >
                    <MapPin size={13} className="text-gray-400" />
                    {city}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className={`grid gap-3 mt-3 ${compact ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}`}>
        {/* Date */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">{t('date')}</label>
          <div className="relative">
            <Calendar size={16} className="absolute left-3 top-3.5 text-gray-400 pointer-events-none" />
            <input
              type="date"
              value={searchParams.date}
              min={today}
              onChange={e => setSearchParams({ date: e.target.value })}
              className="w-full pl-9 pr-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Passengers */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">{t('passengers')}</label>
          <div className="relative">
            <Users size={16} className="absolute left-3 top-3.5 text-gray-400 pointer-events-none" />
            <select
              value={searchParams.passengers}
              onChange={e => setSearchParams({ passengers: parseInt(e.target.value) })}
              className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all appearance-none"
            >
              {[1,2,3,4,5,6,7,8].map(n => (
                <option key={n} value={n}>{n} {n === 1 ? 'persona' : 'personas'}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap button on desktop */}
        {!compact && (
          <div className="hidden sm:flex items-end">
            <button
              type="button"
              onClick={swapLocations}
              className="w-full py-3 px-4 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
            >
              <ArrowRightLeft size={15} />
              Invertir
            </button>
          </div>
        )}
      </div>

      <button
        type="submit"
        className={`mt-4 w-full py-3.5 px-6 bg-gradient-to-r from-blue-700 to-blue-600 text-white font-bold rounded-xl hover:from-blue-800 hover:to-blue-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${
          !searchParams.origin || !searchParams.destination ? 'opacity-70' : ''
        }`}
      >
        <Search size={18} />
        {t('searchButton')}
      </button>
    </form>
  );
}
