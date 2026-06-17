import { useState, useEffect } from 'react';
import { Bus, MapPin, Shield, Clock, TrendingUp, ChevronRight, ArrowRight, MessageCircle, CheckCircle, Star, Route } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { SearchForm } from '../components/search/SearchForm';
import { MapView } from '../components/map/MapView';
import { CompanyCard } from '../components/transport/CompanyCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import type { TransportCompany } from '../types';

const POPULAR_ROUTES = [
  { from: 'San Pedro Sula', to: 'Tegucigalpa', time: '3h 30m', price: 'L 120' },
  { from: 'Tegucigalpa', to: 'La Ceiba', time: '5h 30m', price: 'L 180' },
  { from: 'San Pedro Sula', to: 'Tela', time: '1h 40m', price: 'L 65' },
  { from: 'San Pedro Sula', to: 'La Ceiba', time: '3h', price: 'L 150' },
  { from: 'La Ceiba', to: 'Tegucigalpa', time: '5h', price: 'L 180' },
  { from: 'Villanueva', to: 'San Pedro Sula', time: '40m', price: 'L 18' },
];

const FEATURES = [
  {
    icon: MapPin,
    title: 'Rutas Reales',
    desc: 'Información actualizada de rutas en toda Honduras con GPS real.',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Clock,
    title: 'Horarios en Tiempo Real',
    desc: 'Consulta salidas, frecuencias y horarios de todas las empresas.',
    color: 'bg-green-100 text-green-600',
  },
  {
    icon: TrendingUp,
    title: 'Comparar Opciones',
    desc: 'Compara precios, tiempos y comodidades antes de viajar.',
    color: 'bg-orange-100 text-orange-600',
  },
  {
    icon: Shield,
    title: 'Viaje Seguro',
    desc: 'Comparte tu ubicación y accede a contactos de emergencia.',
    color: 'bg-red-100 text-red-600',
  },
];

const HOW_IT_WORKS = [
  {
    step: '1',
    title: 'Ingresa tu destino',
    desc: 'Escribe de dónde sales y adónde vas. Puedes usar tu ubicación actual.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    step: '2',
    title: 'Compara opciones',
    desc: 'Ve todas las empresas, precios, tiempos y horarios disponibles.',
    color: 'from-green-500 to-green-600',
  },
  {
    step: '3',
    title: 'Reserva tu viaje',
    desc: 'Confirma tu reserva y paga con tarjeta, efectivo o transferencia.',
    color: 'from-orange-500 to-orange-600',
  },
  {
    step: '4',
    title: 'Viaja tranquilo',
    desc: 'Comparte tu viaje, activa el modo seguro y califica tu experiencia.',
    color: 'from-purple-500 to-purple-600',
  },
];

const STATS = [
  { value: '8+', label: 'Empresas registradas', icon: Bus },
  { value: '16+', label: 'Ciudades cubiertas', icon: MapPin },
  { value: '10+', label: 'Rutas activas', icon: Route },
  { value: '4.8', label: 'Calificación promedio', icon: Star },
];

// WhatsApp support number - update with real number
const WHATSAPP_NUMBER = '50499990000';

export function HomePage() {
  const { setView, setSearchParams } = useApp();
  const { t } = useLanguage();
  const [companies, setCompanies] = useState<TransportCompany[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  useEffect(() => {
    supabase
      .from('transport_companies')
      .select('*')
      .eq('is_active', true)
      .order('name')
      .then(({ data }) => {
        setCompanies((data || []) as TransportCompany[]);
        setLoadingCompanies(false);
      });
  }, []);

  function handleSearch(params: { origin: string; destination: string; date: string; passengers: number }) {
    setSearchParams(params);
    setView('search');
  }

  function handlePopularRoute(from: string, to: string) {
    setSearchParams({ origin: from, destination: to });
    setView('search');
  }

  function handleViewCompanyRoutes(_company: TransportCompany) {
    setSearchParams({ origin: '', destination: '' });
    setView('search');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section
        className="relative pt-16 pb-0 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0a1628 0%, #1a3a5c 50%, #0d5c8a 100%)',
          minHeight: '540px',
        }}
      >
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-5 bg-white translate-x-32 -translate-y-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-5 bg-green-400 -translate-x-16 translate-y-16" />

        {/* Background dots pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />

        <div className="max-w-7xl mx-auto px-4 pt-12 pb-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            {/* Left: Hero text + search */}
            <div>
              <div className="inline-flex items-center gap-2 bg-white bg-opacity-10 text-white text-xs font-medium px-3 py-1.5 rounded-full mb-4 border border-white border-opacity-20">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Movilidad Inteligente para Honduras
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-3">
                Viaja más
                <br />
                <span className="text-green-400">inteligente</span> por
                <br />
                Honduras
              </h1>
              <p className="text-blue-200 text-lg mb-8 leading-relaxed">
                Encuentra el mejor transporte para tu destino. Compara rutas, precios y horarios de todas las empresas de Honduras.
              </p>
              <SearchForm onSearch={handleSearch} />
            </div>

            {/* Right: Map */}
            <div className="hidden lg:block h-[420px]">
              <MapView
                className="w-full h-full rounded-2xl shadow-2xl"
                zoom={7}
              />
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="relative h-16 -mt-1">
          <svg viewBox="0 0 1440 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute bottom-0 w-full" preserveAspectRatio="none">
            <path d="M0 64L1440 64L1440 20C1200 60 960 0 720 20C480 40 240 0 0 20L0 64Z" fill="#f9fafb" />
          </svg>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map(stat => (
              <div key={stat.label} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <stat.icon size={18} className="text-blue-600" />
                  <span className="text-2xl font-extrabold text-gray-900">{stat.value}</span>
                </div>
                <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Routes */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t('popularRoutes')}</h2>
            <p className="text-sm text-gray-500 mt-0.5">Las rutas más buscadas en Honduras</p>
          </div>
          <button
            onClick={() => setView('search')}
            className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1"
          >
            Ver todas <ChevronRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {POPULAR_ROUTES.map(route => (
            <button
              key={`${route.from}-${route.to}`}
              onClick={() => handlePopularRoute(route.from, route.to)}
              className="group flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                  <Bus size={18} className="text-blue-600" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                    <span className="truncate max-w-20">{route.from}</span>
                    <ArrowRight size={13} className="text-gray-400 flex-shrink-0" />
                    <span className="truncate max-w-20">{route.to}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-400">{route.time}</span>
                    <span className="text-xs text-gray-300">•</span>
                    <span className="text-xs font-bold text-green-600">{route.price}</span>
                  </div>
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-500 transition-colors flex-shrink-0 ml-2" />
            </button>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-white py-14">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
              Simple y Rápido
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mt-3 mb-2">¿Cómo funciona?</h2>
            <p className="text-gray-500 max-w-md mx-auto">En cuatro pasos sencillos planifica y reserva tu viaje por Honduras.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} className="relative">
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gray-100 z-0" style={{ width: 'calc(100% - 2rem)' }} />
                )}
                <div className="relative z-10 text-center p-5">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-4 shadow-md`}>
                    <span className="text-2xl font-extrabold text-white">{step.step}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Todo lo que necesitas para viajar</h2>
          <p className="text-gray-500 max-w-xl mx-auto">Tu Ruta Honduras reúne toda la información de transporte del país en un solo lugar.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map(feat => (
            <div
              key={feat.title}
              className="bg-white text-center p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`w-14 h-14 ${feat.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                <feat.icon size={26} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{feat.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Companies Section */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{t('companiesTitle')}</h2>
              <p className="text-sm text-gray-500 mt-0.5">Empresas verificadas en toda Honduras</p>
            </div>
            <span className="text-sm text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{companies.length} empresas</span>
          </div>
          {loadingCompanies ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {companies.map(company => (
                <CompanyCard key={company.id} company={company} onViewRoutes={handleViewCompanyRoutes} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trust bar */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4 border border-blue-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
              <CheckCircle size={24} className="text-green-500" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">Viaje verificado y seguro</p>
              <p className="text-xs text-gray-500">Todas las empresas son verificadas antes de aparecer en la plataforma.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:ml-auto">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <span className="text-sm font-bold text-gray-800">4.8 / 5.0</span>
            <span className="text-xs text-gray-500">calificación promedio</span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 pb-24">
        <div
          className="rounded-3xl overflow-hidden relative"
          style={{ background: 'linear-gradient(135deg, #1a3a5c 0%, #0d5c8a 100%)' }}
        >
          {/* decorative circles */}
          <div className="absolute right-0 top-0 w-64 h-64 rounded-full bg-white opacity-5 translate-x-16 -translate-y-16" />
          <div className="absolute left-0 bottom-0 w-48 h-48 rounded-full bg-green-400 opacity-10 -translate-x-8 translate-y-8" />

          <div className="relative z-10 p-8 sm:p-12 text-center text-white">
            <div className="w-14 h-14 bg-white bg-opacity-10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Bus size={28} />
            </div>
            <h2 className="text-3xl font-extrabold mb-3">¿Listo para viajar?</h2>
            <p className="text-blue-200 mb-8 text-lg max-w-md mx-auto">
              Encuentra tu ruta ahora y viaja con confianza por toda Honduras.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setView('search')}
                className="px-8 py-3.5 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-md"
              >
                Buscar Rutas
              </button>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hola%2C%20necesito%20ayuda%20con%20Tu%20Ruta%20Honduras`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3.5 border-2 border-white border-opacity-40 text-white font-bold rounded-xl hover:bg-white hover:bg-opacity-10 transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle size={18} />
                Soporte WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
