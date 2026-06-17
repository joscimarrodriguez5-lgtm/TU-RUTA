import { useState } from 'react';
import { X, Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export function AuthModal() {
  const { signIn, signUp, resetPassword } = useAuth();
  const { showAuthModal, setShowAuthModal, authModalMode, setAuthModalMode } = useApp();
  const { t } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!showAuthModal) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (authModalMode === 'login') {
      const { error: err } = await signIn(email, password);
      if (err) {
        setError('Correo o contraseña incorrectos');
      } else {
        setShowAuthModal(false);
        resetForm();
      }
    } else if (authModalMode === 'register') {
      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        setLoading(false);
        return;
      }
      const { error: err } = await signUp(email, password, fullName);
      if (err) {
        setError('Error al crear la cuenta. Intenta con otro correo.');
      } else {
        setSuccess('Cuenta creada exitosamente. Verifica tu correo.');
        setTimeout(() => {
          setShowAuthModal(false);
          resetForm();
        }, 2000);
      }
    } else if (authModalMode === 'reset') {
      const { error: err } = await resetPassword(email);
      if (err) {
        setError('Error al enviar el correo. Verifica la dirección.');
      } else {
        setSuccess('Correo de recuperación enviado. Revisa tu bandeja.');
      }
    }

    setLoading(false);
  }

  function resetForm() {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setError('');
    setSuccess('');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm"
        onClick={() => { setShowAuthModal(false); resetForm(); }}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div
          className="px-6 pt-8 pb-6 text-center"
          style={{ background: 'linear-gradient(135deg, #1a3a5c 0%, #0d5c8a 100%)' }}
        >
          <img
            src="/d5eb9f92-ed30-4fbc-a714-b6806e769d69-removebg-preview.png"
            alt="Tu Ruta Honduras"
            className="w-16 h-16 object-contain mx-auto mb-3"
          />
          <h2 className="text-2xl font-bold text-white">
            {authModalMode === 'login' && t('login')}
            {authModalMode === 'register' && t('register')}
            {authModalMode === 'reset' && t('resetPassword')}
          </h2>
          <p className="text-blue-200 text-sm mt-1">Tu Ruta Honduras</p>
        </div>

        <button
          onClick={() => { setShowAuthModal(false); resetForm(); }}
          className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Form */}
        <div className="px-6 py-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {authModalMode === 'register' && (
              <div className="relative">
                <User size={16} className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('fullName')}
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            <div className="relative">
              <Mail size={16} className="absolute left-3 top-3.5 text-gray-400" />
              <input
                type="email"
                placeholder={t('email')}
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {authModalMode !== 'reset' && (
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('password')}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            )}

            {authModalMode === 'register' && (
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('confirmPassword')}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {authModalMode === 'login' && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => { setAuthModalMode('reset'); setError(''); setSuccess(''); }}
                  className="text-xs text-blue-600 hover:underline"
                >
                  {t('forgotPassword')}
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-700 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-800 hover:to-blue-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? <LoadingSpinner size="sm" color="text-white" /> : null}
              {authModalMode === 'login' && t('login')}
              {authModalMode === 'register' && t('register')}
              {authModalMode === 'reset' && t('resetPassword')}
            </button>
          </form>

          {/* Google OAuth is disabled - removed to avoid provider errors */}

          {/* Toggle mode */}
          <div className="mt-5 text-center text-sm text-gray-500">
            {authModalMode === 'login' && (
              <>
                {t('noAccount')}{' '}
                <button
                  onClick={() => { setAuthModalMode('register'); setError(''); setSuccess(''); }}
                  className="text-blue-600 font-medium hover:underline"
                >
                  {t('signUpNow')}
                </button>
              </>
            )}
            {(authModalMode === 'register' || authModalMode === 'reset') && (
              <>
                {t('hasAccount')}{' '}
                <button
                  onClick={() => { setAuthModalMode('login'); setError(''); setSuccess(''); }}
                  className="text-blue-600 font-medium hover:underline"
                >
                  {t('loginNow')}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
