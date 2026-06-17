import { useState } from 'react';
import { X, Calendar, Clock, CreditCard, Banknote, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../lib/supabase';
import { formatHnl, formatUsd, hnlToUsd } from '../../lib/currency';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import type { Route, PaymentMethod } from '../../types';

interface BookingModalProps {
  route: Route;
  onClose: () => void;
}

type Step = 'details' | 'payment' | 'success';

export function BookingModal({ route, onClose }: BookingModalProps) {
  const { user } = useAuth();
  const { setShowAuthModal, setAuthModalMode } = useApp();
  const { t } = useLanguage();

  const [step, setStep] = useState<Step>('details');
  const [travelDate, setTravelDate] = useState(new Date().toISOString().split('T')[0]);
  const [travelTime, setTravelTime] = useState(route.schedule?.[0]?.first || '06:00');
  const [passengers, setPassengers] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Card fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardFlipped, setCardFlipped] = useState(false);

  const totalHnl = route.price_hnl * passengers;
  const totalUsd = hnlToUsd(totalHnl);

  const today = new Date().toISOString().split('T')[0];

  function formatCardNumber(val: string) {
    return val.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})/g, '$1 ').trim();
  }

  function formatExpiry(val: string) {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
  }

  async function handleConfirm() {
    if (!user) {
      setShowAuthModal(true);
      setAuthModalMode('login');
      onClose();
      return;
    }

    if (paymentMethod === 'card') {
      if (cardNumber.replace(/\s/g, '').length < 16) {
        setError('Ingresa un número de tarjeta válido');
        return;
      }
      if (!cardName.trim()) {
        setError('Ingresa el nombre en la tarjeta');
        return;
      }
      if (cardExpiry.length < 5) {
        setError('Ingresa la fecha de vencimiento');
        return;
      }
      if (cardCvv.length < 3) {
        setError('Ingresa el CVV');
        return;
      }
    }

    setLoading(true);
    setError('');

    const { error: dbError } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        route_id: route.id,
        company_id: route.company_id,
        origin: route.origin_city,
        destination: route.destination_city,
        travel_date: travelDate,
        travel_time: travelTime,
        passengers,
        total_price_hnl: totalHnl,
        total_price_usd: totalUsd,
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'card' ? 'paid' : 'pending',
        booking_status: 'confirmed',
      });

    if (dbError) {
      setError('Error al crear la reserva. Intenta de nuevo.');
    } else {
      setStep('success');
    }

    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            {step === 'payment' && (
              <button onClick={() => setStep('details')} className="mr-1 text-gray-400 hover:text-gray-600">
                <ArrowLeft size={20} />
              </button>
            )}
            <h2 className="text-lg font-bold text-gray-900">
              {step === 'success' ? t('bookingConfirmed') : t('bookTrip')}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {/* Route summary */}
          {step !== 'success' && (
            <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex items-center gap-2 text-sm">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <div className="w-0.5 h-4 bg-gray-300" />
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{route.origin_city}</p>
                  <p className="text-xs text-gray-400 my-0.5">{route.company?.name}</p>
                  <p className="font-semibold text-gray-800">{route.destination_city}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-lg font-extrabold text-blue-700">{formatHnl(totalHnl)}</p>
                  <p className="text-xs text-gray-400">({formatUsd(totalUsd)})</p>
                </div>
              </div>
            </div>
          )}

          {/* Step: Details */}
          {step === 'details' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">{t('travelDate')}</label>
                  <div className="relative">
                    <Calendar size={15} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="date"
                      value={travelDate}
                      min={today}
                      onChange={e => setTravelDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">{t('travelTime')}</label>
                  <div className="relative">
                    <Clock size={15} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="time"
                      value={travelTime}
                      onChange={e => setTravelTime(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">{t('numPassengers')}</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPassengers(Math.max(1, passengers - 1))}
                    className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-lg text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    −
                  </button>
                  <span className="text-lg font-bold text-gray-800 w-8 text-center">{passengers}</span>
                  <button
                    type="button"
                    onClick={() => setPassengers(Math.min(8, passengers + 1))}
                    className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-lg text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    +
                  </button>
                  <span className="text-sm text-gray-500">{passengers === 1 ? 'persona' : 'personas'}</span>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">{t('paymentMethod')}</label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { value: 'cash', label: t('cashPayment'), icon: Banknote },
                    { value: 'card', label: t('cardPayment'), icon: CreditCard },
                    { value: 'transfer', label: t('transferPayment'), icon: ArrowLeft },
                  ] as const).map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setPaymentMethod(opt.value)}
                      className={`p-3 rounded-xl border-2 text-xs font-medium transition-all flex flex-col items-center gap-1.5 ${
                        paymentMethod === opt.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <opt.icon size={18} />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price summary */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Precio por persona</span>
                  <span>{formatHnl(route.price_hnl)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Pasajeros</span>
                  <span>× {passengers}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-900">
                  <span>{t('totalPrice')}</span>
                  <div className="text-right">
                    <div className="text-blue-700">{formatHnl(totalHnl)}</div>
                    <div className="text-xs text-gray-400 font-normal">{formatUsd(totalUsd)}</div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => paymentMethod === 'card' ? setStep('payment') : handleConfirm()}
                disabled={loading}
                className="w-full py-3.5 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <LoadingSpinner size="sm" color="text-white" /> : null}
                {paymentMethod === 'card' ? 'Continuar al pago' : t('confirmBooking')}
              </button>
            </div>
          )}

          {/* Step: Payment (Card) */}
          {step === 'payment' && (
            <div className="space-y-5">
              {/* Animated Credit Card */}
              <div className="flex justify-center">
                <div
                  className="relative w-72 h-44 cursor-pointer"
                  style={{ perspective: '1000px' }}
                  onClick={() => setCardFlipped(!cardFlipped)}
                >
                  <div
                    className="relative w-full h-full transition-transform duration-500"
                    style={{
                      transformStyle: 'preserve-3d',
                      transform: cardFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    }}
                  >
                    {/* Front */}
                    <div
                      className="absolute inset-0 rounded-2xl p-5 flex flex-col justify-between shadow-xl"
                      style={{
                        backfaceVisibility: 'hidden',
                        background: 'linear-gradient(135deg, #1a3a5c 0%, #1565c0 60%, #0d47a1 100%)',
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="w-10 h-7 rounded bg-yellow-300 opacity-80" />
                        <div className="text-white text-xs font-bold opacity-70">HONDURAS</div>
                      </div>
                      <div>
                        <p className="text-white text-lg font-mono tracking-widest">
                          {cardNumber || '•••• •••• •••• ••••'}
                        </p>
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-blue-200 text-xs uppercase tracking-wider">Titular</p>
                          <p className="text-white text-sm font-medium truncate max-w-36">
                            {cardName || 'NOMBRE TITULAR'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-blue-200 text-xs uppercase tracking-wider">Vence</p>
                          <p className="text-white text-sm font-mono">{cardExpiry || 'MM/AA'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Back */}
                    <div
                      className="absolute inset-0 rounded-2xl overflow-hidden shadow-xl"
                      style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        background: 'linear-gradient(135deg, #263238 0%, #37474f 100%)',
                      }}
                    >
                      <div className="h-10 bg-gray-800 mt-6" />
                      <div className="px-5 mt-4">
                        <div className="bg-white rounded h-9 flex items-center justify-end px-3">
                          <p className="font-mono text-gray-800 text-sm tracking-widest">{cardCvv || '•••'}</p>
                        </div>
                        <p className="text-gray-400 text-xs mt-2 text-right">CVV</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-center text-xs text-gray-400">Haz clic en la tarjeta para ver el reverso</p>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
                  {error}
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">{t('cardNumber')}</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">{t('cardName')}</label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={e => setCardName(e.target.value.toUpperCase())}
                    placeholder="NOMBRE APELLIDO"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">{t('expiryDate')}</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                      placeholder="MM/AA"
                      maxLength={5}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">{t('cvv')}</label>
                    <input
                      type="text"
                      value={cardCvv}
                      onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="•••"
                      onFocus={() => setCardFlipped(true)}
                      onBlur={() => setCardFlipped(false)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-3 flex justify-between items-center">
                <span className="text-sm text-gray-600">{t('totalPrice')}</span>
                <div className="text-right">
                  <p className="font-bold text-blue-700">{formatHnl(totalHnl)}</p>
                  <p className="text-xs text-gray-400">{formatUsd(totalUsd)}</p>
                </div>
              </div>

              <button
                onClick={handleConfirm}
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-blue-700 to-blue-600 text-white font-bold rounded-xl hover:from-blue-800 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <LoadingSpinner size="sm" color="text-white" /> : <CreditCard size={18} />}
                {t('processPayment')}
              </button>
            </div>
          )}

          {/* Step: Success */}
          {step === 'success' && (
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={40} className="text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('bookingConfirmed')}</h3>
              <p className="text-gray-500 mb-6">{t('bookingSuccess')}</p>

              <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Ruta</span>
                  <span className="font-medium text-gray-800">{route.origin_city} → {route.destination_city}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Empresa</span>
                  <span className="font-medium text-gray-800">{route.company?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Fecha</span>
                  <span className="font-medium text-gray-800">{new Date(travelDate).toLocaleDateString('es-HN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Pasajeros</span>
                  <span className="font-medium text-gray-800">{passengers}</span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-2 border-t border-gray-200">
                  <span>{t('totalPrice')}</span>
                  <span className="text-blue-700">{formatHnl(totalHnl)}</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 transition-colors"
              >
                {t('close')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
