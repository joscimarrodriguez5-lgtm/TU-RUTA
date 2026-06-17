import { useState, useEffect } from 'react';
import { MapPin, Calendar, Clock, CheckCircle, XCircle, AlertCircle, Flag, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { formatHnl } from '../lib/currency';
import { StarRating } from '../components/ui/StarRating';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import type { Booking } from '../types';

const STATUS_CONFIG = {
  confirmed: { label: 'Confirmado', color: 'text-green-700 bg-green-100', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: 'text-red-700 bg-red-100', icon: XCircle },
  completed: { label: 'Completado', color: 'text-blue-700 bg-blue-100', icon: CheckCircle },
  no_show: { label: 'No se presentó', color: 'text-gray-700 bg-gray-100', icon: AlertCircle },
};

interface CompleteRateModalProps {
  booking: Booking;
  onClose: () => void;
  onComplete: (rating: number, comment: string) => Promise<void>;
}

function CompleteRateModal({ booking, onClose, onComplete }: CompleteRateModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    await onComplete(rating, comment);
    setLoading(false);
    setDone(true);
  }

  if (done) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm" />
        <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center">
          {/* Animated thank you */}
          <div className="relative w-24 h-24 mx-auto mb-5">
            <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-30" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center shadow-lg">
              <Heart size={36} className="text-white fill-white" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-gray-900 mb-2">¡Gracias!</h3>
          <p className="text-gray-500 leading-relaxed mb-2">
            Tu viaje de <span className="font-semibold text-gray-700">{booking.origin}</span> a{' '}
            <span className="font-semibold text-gray-700">{booking.destination}</span> ha sido completado.
          </p>
          <div className="flex justify-center my-3">
            <StarRating rating={rating} size={22} />
          </div>
          <p className="text-gray-400 text-sm mb-6">
            Tu calificación ayuda a mejorar el servicio para todos los viajeros de Honduras.
          </p>
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-blue-700 to-blue-600 text-white font-bold rounded-xl hover:from-blue-800 hover:to-blue-700 transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div
          className="px-6 py-5 text-center text-white"
          style={{ background: 'linear-gradient(135deg, #1a3a5c 0%, #0d5c8a 100%)' }}
        >
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-2">
            <Flag size={22} />
          </div>
          <h3 className="text-lg font-bold">Finalizar Viaje</h3>
          <p className="text-blue-200 text-xs mt-0.5">{booking.origin} → {booking.destination}</p>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-600 text-center mb-4">
            ¿Cómo fue tu experiencia con{' '}
            <span className="font-semibold text-gray-800">
              {booking.company?.name || 'la empresa'}
            </span>?
          </p>

          <div className="flex justify-center mb-5">
            <StarRating rating={rating} size={40} interactive onChange={setRating} />
          </div>

          <div className="mb-1 text-center">
            <span className="text-sm font-semibold text-gray-700">
              {rating === 5 ? '¡Excelente!' : rating === 4 ? 'Muy bueno' : rating === 3 ? 'Regular' : rating === 2 ? 'Malo' : 'Muy malo'}
            </span>
          </div>

          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Cuéntanos tu experiencia (opcional)..."
            rows={3}
            className="w-full mt-3 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-4"
          />

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-3 bg-gradient-to-r from-blue-700 to-blue-600 text-white rounded-xl text-sm font-bold hover:from-blue-800 hover:to-blue-700 flex items-center justify-center gap-2"
            >
              {loading ? <LoadingSpinner size="sm" color="text-white" /> : <CheckCircle size={15} />}
              Finalizar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TripsPage() {
  const { user } = useAuth();
  const { setShowAuthModal, setAuthModalMode } = useApp();
  const { t } = useLanguage();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [completeBooking, setCompleteBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchBookings();
  }, [user]);

  async function fetchBookings() {
    if (!user) return;
    const { data } = await supabase
      .from('bookings')
      .select('*, route:routes(*, company:transport_companies(*)), company:transport_companies(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setBookings((data || []) as Booking[]);
    setLoading(false);
  }

  async function handleCancelBooking(bookingId: string) {
    await supabase
      .from('bookings')
      .update({ booking_status: 'cancelled' })
      .eq('id', bookingId);
    fetchBookings();
  }

  async function handleCompleteAndRate(booking: Booking, rating: number, comment: string) {
    if (!user) return;

    // Mark booking as completed
    await supabase
      .from('bookings')
      .update({ booking_status: 'completed', payment_status: 'paid' })
      .eq('id', booking.id);

    // Save review
    const companyId = booking.company_id || booking.route?.company_id;
    if (companyId) {
      await supabase.from('reviews').insert({
        user_id: user.id,
        company_id: companyId,
        booking_id: booking.id,
        rating,
        comment: comment.trim() || null,
      });

      // Update company average rating
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('company_id', companyId);

      if (reviews && reviews.length > 0) {
        const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        await supabase
          .from('transport_companies')
          .update({ rating: avg, total_reviews: reviews.length })
          .eq('id', companyId);
      }
    }

    await fetchBookings();
  }

  async function handleModalClose() {
    setCompleteBooking(null);
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 pb-20 flex items-center justify-center px-4">
        <div className="text-center max-w-xs">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin size={32} className="text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Mis Viajes</h2>
          <p className="text-gray-500 text-sm mb-6">Inicia sesión para ver tu historial de reservas.</p>
          <button
            onClick={() => { setShowAuthModal(true); setAuthModalMode('login'); }}
            className="px-6 py-3 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  const upcoming = bookings.filter(b => b.booking_status === 'confirmed' && new Date(b.travel_date) >= new Date());
  const past = bookings.filter(b => b.booking_status !== 'confirmed' || new Date(b.travel_date) < new Date());

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-20 md:pb-8">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('myBookings')}</h1>

        {loading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {!loading && bookings.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin size={26} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-1">Sin reservas aún</h3>
            <p className="text-gray-400 text-sm">Cuando reserves un viaje aparecerá aquí.</p>
          </div>
        )}

        {!loading && upcoming.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Próximos Viajes</h2>
            <div className="space-y-4">
              {upcoming.map(booking => (
                <TripCard
                  key={booking.id}
                  booking={booking}
                  onCancel={handleCancelBooking}
                  onComplete={setCompleteBooking}
                />
              ))}
            </div>
          </div>
        )}

        {!loading && past.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Historial</h2>
            <div className="space-y-4">
              {past.map(booking => (
                <TripCard
                  key={booking.id}
                  booking={booking}
                  onCancel={handleCancelBooking}
                  onComplete={setCompleteBooking}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {completeBooking && (
        <CompleteRateModal
          booking={completeBooking}
          onClose={handleModalClose}
          onComplete={(rating, comment) => handleCompleteAndRate(completeBooking, rating, comment)}
        />
      )}
    </div>
  );
}

interface TripCardProps {
  booking: Booking;
  onCancel: (id: string) => void;
  onComplete: (booking: Booking) => void;
}

function TripCard({ booking, onCancel, onComplete }: TripCardProps) {
  const statusConf = STATUS_CONFIG[booking.booking_status];
  const StatusIcon = statusConf.icon;
  const canCancel = booking.booking_status === 'confirmed' && new Date(booking.travel_date) > new Date();
  const canComplete = booking.booking_status === 'confirmed';
  const isCompleted = booking.booking_status === 'completed';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Status bar */}
      <div className={`px-4 py-2 flex items-center justify-between ${statusConf.color} bg-opacity-50`}>
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold`}>
          <StatusIcon size={11} />
          {statusConf.label}
        </span>
        <span className="text-xs opacity-60">
          {new Date(booking.created_at).toLocaleDateString('es-HN')}
        </span>
      </div>

      <div className="p-4">
        {/* Route */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white shadow" />
            <div className="w-0.5 h-6 bg-gray-200" />
            <div className="w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900">{booking.origin}</p>
            <p className="text-xs text-gray-400 my-0.5">
              {booking.company?.name || booking.route?.company?.name}
            </p>
            <p className="text-sm font-bold text-gray-900">{booking.destination}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-lg font-extrabold text-blue-700">
              {booking.total_price_hnl ? formatHnl(booking.total_price_hnl) : '–'}
            </p>
            <p className="text-xs text-gray-400">{booking.passengers} pax</p>
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3 flex-wrap">
          <div className="flex items-center gap-1">
            <Calendar size={11} />
            {new Date(booking.travel_date + 'T00:00:00').toLocaleDateString('es-HN', { weekday: 'short', day: 'numeric', month: 'short' })}
          </div>
          {booking.travel_time && (
            <div className="flex items-center gap-1">
              <Clock size={11} />
              {booking.travel_time}
            </div>
          )}
          <div className="flex items-center gap-1">
            {booking.payment_method === 'card' ? '💳' : booking.payment_method === 'cash' ? '💵' : '🏦'}
            <span className={booking.payment_status === 'paid' ? 'text-green-600 font-medium' : ''}>
              {booking.payment_status === 'paid' ? 'Pagado' : 'Pendiente pago'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {canCancel && (
            <button
              onClick={() => onCancel(booking.id)}
              className="flex-1 py-2.5 text-sm text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors font-medium"
            >
              Cancelar
            </button>
          )}
          {canComplete && (
            <button
              onClick={() => onComplete(booking)}
              className="flex-1 py-2.5 text-sm text-white bg-gradient-to-r from-green-500 to-green-600 rounded-xl hover:from-green-600 hover:to-green-700 transition-all font-bold flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Flag size={14} />
              Finalizar Viaje
            </button>
          )}
          {isCompleted && (
            <div className="flex-1 py-2.5 text-sm text-blue-600 bg-blue-50 rounded-xl flex items-center justify-center gap-1.5 font-medium">
              <CheckCircle size={14} />
              Viaje completado
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
