import { useState, useEffect } from 'react';
import { Bus, Route, BookOpen, TrendingUp, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { formatHnl } from '../lib/currency';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import type { TransportCompany, Route as RouteType, Booking } from '../types';

type AdminTab = 'stats' | 'companies' | 'routes' | 'bookings';

interface Stats {
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  activeRoutes: number;
  totalCompanies: number;
}

export function AdminPage() {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<AdminTab>('stats');
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalBookings: 0, totalRevenue: 0, activeRoutes: 0, totalCompanies: 0 });
  const [companies, setCompanies] = useState<TransportCompany[]>([]);
  const [routes, setRoutes] = useState<RouteType[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);

    const [companiesRes, routesRes, bookingsRes] = await Promise.all([
      supabase.from('transport_companies').select('*').order('name'),
      supabase.from('routes').select('*, company:transport_companies(*)').order('created_at', { ascending: false }),
      supabase.from('bookings').select('*, company:transport_companies(*)').order('created_at', { ascending: false }).limit(50),
    ]);

    const companiesData = (companiesRes.data || []) as TransportCompany[];
    const routesData = (routesRes.data || []) as RouteType[];
    const bookingsData = (bookingsRes.data || []) as Booking[];

    setCompanies(companiesData);
    setRoutes(routesData);
    setBookings(bookingsData);

    const revenue = bookingsData
      .filter(b => b.payment_status === 'paid')
      .reduce((sum, b) => sum + (b.total_price_hnl || 0), 0);

    setStats({
      totalCompanies: companiesData.length,
      activeRoutes: routesData.filter(r => r.is_active).length,
      totalBookings: bookingsData.length,
      totalRevenue: revenue,
      totalUsers: 0,
    });

    setLoading(false);
  }

  async function toggleCompanyStatus(company: TransportCompany) {
    await supabase
      .from('transport_companies')
      .update({ is_active: !company.is_active })
      .eq('id', company.id);
    fetchData();
  }

  async function toggleRouteStatus(route: RouteType) {
    await supabase
      .from('routes')
      .update({ is_active: !route.is_active })
      .eq('id', route.id);
    fetchData();
  }

  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle size={28} className="text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Acceso Denegado</h2>
          <p className="text-gray-500 text-sm">No tienes permisos para acceder al panel de administración.</p>
        </div>
      </div>
    );
  }

  const TABS = [
    { key: 'stats' as AdminTab, label: t('statistics'), icon: TrendingUp },
    { key: 'companies' as AdminTab, label: t('companies'), icon: Bus },
    { key: 'routes' as AdminTab, label: t('routes'), icon: Route },
    { key: 'bookings' as AdminTab, label: t('bookings'), icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-20 md:pb-8">
      {/* Admin Header */}
      <div
        className="px-4 py-5 text-white"
        style={{ background: 'linear-gradient(135deg, #1a3a5c 0%, #0d5c8a 100%)' }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{t('adminPanel')}</h1>
              <p className="text-blue-200 text-sm mt-0.5">Tu Ruta Honduras</p>
            </div>
            <button
              onClick={fetchData}
              className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center hover:bg-opacity-30 transition-colors"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto scrollbar-hide">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon size={15} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {/* Stats Tab */}
            {activeTab === 'stats' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: t('totalBookings'), value: stats.totalBookings, icon: BookOpen, color: 'bg-blue-50 text-blue-600' },
                    { label: t('totalRevenue'), value: formatHnl(stats.totalRevenue), icon: TrendingUp, color: 'bg-green-50 text-green-600' },
                    { label: t('activeRoutes'), value: stats.activeRoutes, icon: Route, color: 'bg-orange-50 text-orange-600' },
                    { label: t('companies'), value: stats.totalCompanies, icon: Bus, color: 'bg-purple-50 text-purple-600' },
                  ].map(stat => (
                    <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                      <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                        <stat.icon size={20} />
                      </div>
                      <p className="text-2xl font-extrabold text-gray-900">{stat.value}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Recent bookings summary */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-bold text-gray-900 mb-4">Reservas Recientes</h3>
                  <div className="space-y-3">
                    {bookings.slice(0, 5).map(booking => (
                      <div key={booking.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{booking.origin} → {booking.destination}</p>
                          <p className="text-xs text-gray-400">{new Date(booking.created_at).toLocaleDateString('es-HN')}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-blue-700">{formatHnl(booking.total_price_hnl || 0)}</p>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            booking.booking_status === 'confirmed' ? 'bg-green-100 text-green-700' :
                            booking.booking_status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {booking.booking_status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Companies Tab */}
            {activeTab === 'companies' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">{companies.length} empresas registradas</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {companies.map((company, i) => (
                    <div
                      key={company.id}
                      className={`flex items-center gap-4 px-5 py-4 ${i !== companies.length - 1 ? 'border-b border-gray-50' : ''}`}
                    >
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Bus size={20} className="text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm">{company.name}</p>
                        <p className="text-xs text-gray-400 truncate">{company.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${company.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {company.is_active ? t('active') : t('inactive')}
                        </span>
                        <button
                          onClick={() => toggleCompanyStatus(company)}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                            company.is_active ? 'text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'
                          }`}
                        >
                          {company.is_active ? <XCircle size={16} /> : <CheckCircle size={16} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Routes Tab */}
            {activeTab === 'routes' && (
              <div className="space-y-3">
                <p className="text-sm text-gray-500">{routes.length} rutas en el sistema</p>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {routes.map((route, i) => (
                    <div
                      key={route.id}
                      className={`flex items-start gap-4 px-5 py-4 ${i !== routes.length - 1 ? 'border-b border-gray-50' : ''}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-900 text-sm">{route.name}</p>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${route.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {route.is_active ? t('active') : t('inactive')}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{route.company?.name} • {formatHnl(route.price_hnl)}</p>
                        <p className="text-xs text-gray-400">{route.distance_km} km • {route.frequency}</p>
                      </div>
                      <button
                        onClick={() => toggleRouteStatus(route)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors flex-shrink-0 ${
                          route.is_active ? 'text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'
                        }`}
                      >
                        {route.is_active ? <XCircle size={16} /> : <CheckCircle size={16} />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
              <div className="space-y-3">
                <p className="text-sm text-gray-500">{bookings.length} reservas (últimas 50)</p>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {bookings.map((booking, i) => (
                    <div
                      key={booking.id}
                      className={`flex items-center gap-4 px-5 py-4 ${i !== bookings.length - 1 ? 'border-b border-gray-50' : ''}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm">{booking.origin} → {booking.destination}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(booking.travel_date).toLocaleDateString('es-HN')} •
                          {booking.passengers} pax •
                          {booking.payment_method}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-blue-700">{formatHnl(booking.total_price_hnl || 0)}</p>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          booking.booking_status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          booking.booking_status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          booking.booking_status === 'completed' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {booking.booking_status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
