import { useState, useRef } from 'react';
import { User, Phone, MapPin, Globe, Save, LogOut, Shield, AlertTriangle, Plus, Trash2, Phone as PhoneIcon, Share2, Camera, Upload } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import type { Language } from '../types';

const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'es', label: 'Español' },
  { code: 'en', label: 'English' },
  { code: 'pt', label: 'Português' },
  { code: 'fr', label: 'Français' },
];

export function ProfilePage() {
  const { user, profile, signOut, updateProfile, refreshProfile } = useAuth();
  const { setShowAuthModal, setAuthModalMode } = useApp();
  const { t, setLanguage } = useLanguage();

  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [language, setLanguageState] = useState<Language>(profile?.language || 'es');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Emergency contacts
  const [contacts, setContacts] = useState<{ id?: string; name: string; phone: string; relationship: string }[]>([]);
  const [contactsLoaded, setContactsLoaded] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRel, setNewContactRel] = useState('');

  if (!contactsLoaded && user) {
    setContactsLoaded(true);
    supabase
      .from('emergency_contacts')
      .select('*')
      .eq('user_id', user.id)
      .then(({ data }) => {
        setContacts(data || []);
      });
  }

  async function handleAvatarUpload(file: File) {
    if (!user) return;
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('La imagen no puede superar 5 MB');
      return;
    }

    setAvatarUploading(true);
    setAvatarError('');
    setShowPhotoOptions(false);

    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setAvatarError('Error al subir la imagen. Intenta de nuevo.');
      setAvatarUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
    const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    await updateProfile({ avatar_url: avatarUrl });
    await refreshProfile();
    setAvatarUploading(false);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleAvatarUpload(file);
    e.target.value = '';
  }

  async function handleSave() {
    setSaving(true);
    const { error } = await updateProfile({
      full_name: fullName,
      phone,
      location,
      language,
    });
    if (!error) {
      setLanguage(language);
      setSaveSuccess(true);
      setEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
    setSaving(false);
  }

  async function handleAddContact() {
    if (!user || !newContactName || !newContactPhone) return;
    const { data } = await supabase
      .from('emergency_contacts')
      .insert({
        user_id: user.id,
        name: newContactName,
        phone: newContactPhone,
        relationship: newContactRel || null,
      })
      .select()
      .single();
    if (data) {
      setContacts(prev => [...prev, data]);
      setNewContactName('');
      setNewContactPhone('');
      setNewContactRel('');
      setShowAddContact(false);
    }
  }

  async function handleDeleteContact(id: string) {
    await supabase.from('emergency_contacts').delete().eq('id', id);
    setContacts(prev => prev.filter(c => c.id !== id));
  }

  function handleShareLocation() {
    navigator.geolocation?.getCurrentPosition(pos => {
      const url = `https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`;
      if (navigator.share) {
        navigator.share({ title: 'Mi ubicación - Tu Ruta Honduras', url });
      } else {
        navigator.clipboard.writeText(url);
        alert('Enlace de ubicación copiado al portapapeles');
      }
    });
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 pb-20 flex items-center justify-center px-4">
        <div className="text-center max-w-xs">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User size={32} className="text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t('profile')}</h2>
          <p className="text-gray-500 text-sm mb-6">Inicia sesión para acceder a tu perfil.</p>
          <button
            onClick={() => { setShowAuthModal(true); setAuthModalMode('login'); }}
            className="px-6 py-3 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800"
          >
            {t('login')}
          </button>
        </div>
      </div>
    );
  }

  const avatarUrl = profile?.avatar_url;
  const initials = profile?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-20 md:pb-8">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Cover */}
          <div
            className="h-24 w-full"
            style={{ background: 'linear-gradient(135deg, #1a3a5c 0%, #0d5c8a 100%)' }}
          />

          <div className="px-5 pb-5">
            {/* Avatar with upload */}
            <div className="flex items-end justify-between -mt-10 mb-4">
              <div className="relative">
                {avatarUploading ? (
                  <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center">
                    <LoadingSpinner size="md" />
                  </div>
                ) : avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white text-2xl font-bold">
                    {initials}
                  </div>
                )}

                {/* Photo options button */}
                <button
                  onClick={() => setShowPhotoOptions(!showPhotoOptions)}
                  className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-700 rounded-lg flex items-center justify-center text-white shadow-md hover:bg-blue-800 transition-colors"
                >
                  <Camera size={13} />
                </button>

                {/* Photo options dropdown */}
                {showPhotoOptions && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowPhotoOptions(false)} />
                    <div className="absolute top-full left-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-20">
                      <button
                        onClick={() => { setShowPhotoOptions(false); fileInputRef.current?.click(); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Upload size={14} className="text-blue-500" />
                        Subir foto
                      </button>
                      <button
                        onClick={() => { setShowPhotoOptions(false); cameraInputRef.current?.click(); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Camera size={14} className="text-green-500" />
                        Tomar foto
                      </button>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-2">
                {!editing ? (
                  <button
                    onClick={() => {
                      setEditing(true);
                      setFullName(profile?.full_name || '');
                      setPhone(profile?.phone || '');
                      setLocation(profile?.location || '');
                      setLanguageState(profile?.language || 'es');
                    }}
                    className="px-4 py-2 text-sm font-medium text-blue-700 border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors"
                  >
                    {t('editProfile')}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setEditing(false)}
                      className="px-3 py-2 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50"
                    >
                      {t('cancel')}
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-4 py-2 text-sm font-bold text-white bg-blue-700 rounded-xl hover:bg-blue-800 flex items-center gap-1.5"
                    >
                      {saving ? <LoadingSpinner size="sm" color="text-white" /> : <Save size={14} />}
                      {t('save')}
                    </button>
                  </>
                )}
              </div>
            </div>

            {avatarError && (
              <div className="mb-3 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                {avatarError}
              </div>
            )}

            {saveSuccess && (
              <div className="mb-3 p-2.5 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl">
                Perfil actualizado correctamente
              </div>
            )}

            {editing ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">{t('fullName')}</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">{t('phone')}</label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      type="tel"
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">{t('location')}</label>
                  <div className="relative">
                    <MapPin size={15} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      placeholder="Ej: San Pedro Sula, Honduras"
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">{t('language')}</label>
                  <div className="relative">
                    <Globe size={15} className="absolute left-3 top-3 text-gray-400" />
                    <select
                      value={language}
                      onChange={e => setLanguageState(e.target.value as Language)}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    >
                      {LANGUAGES.map(l => (
                        <option key={l.code} value={l.code}>{l.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-bold text-gray-900">{profile?.full_name || 'Usuario'}</h2>
                <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
                <div className="mt-3 space-y-1.5">
                  {profile?.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone size={14} className="text-gray-400" />
                      {profile.phone}
                    </div>
                  )}
                  {profile?.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin size={14} className="text-gray-400" />
                      {profile.location}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Globe size={14} className="text-gray-400" />
                    {LANGUAGES.find(l => l.code === profile?.language)?.label || 'Español'}
                  </div>
                </div>
                {profile?.role === 'admin' && (
                  <span className="mt-2 inline-block text-xs font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
                    Administrador
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Safety Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
            <Shield size={18} className="text-blue-600" />
            <h3 className="font-bold text-gray-900">{t('safetyTitle')}</h3>
          </div>
          <div className="p-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleShareLocation}
                className="flex items-center gap-2.5 p-3.5 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors text-blue-700"
              >
                <Share2 size={18} />
                <span className="text-sm font-semibold">{t('shareLocation')}</span>
              </button>
              <a
                href="tel:911"
                className="flex items-center gap-2.5 p-3.5 bg-red-50 rounded-xl hover:bg-red-100 transition-colors text-red-700"
              >
                <AlertTriangle size={18} />
                <span className="text-sm font-semibold">{t('emergency')}</span>
              </a>
            </div>

            <div className="space-y-2">
              {[
                { label: t('callPolice'), number: '911', color: 'text-blue-700 bg-blue-50' },
                { label: t('callAmbulance'), number: '195', color: 'text-green-700 bg-green-50' },
                { label: t('callFireDept'), number: '198', color: 'text-orange-700 bg-orange-50' },
              ].map(item => (
                <a
                  key={item.number}
                  href={`tel:${item.number}`}
                  className={`flex items-center justify-between px-4 py-3 ${item.color} rounded-xl hover:opacity-80 transition-opacity`}
                >
                  <div className="flex items-center gap-2.5">
                    <PhoneIcon size={15} />
                    <span className="text-sm font-semibold">{item.label}</span>
                  </div>
                  <span className="text-lg font-extrabold">{item.number}</span>
                </a>
              ))}
            </div>

            {/* Emergency Contacts */}
            <div className="border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-gray-700">{t('emergencyContacts')}</h4>
                <button
                  onClick={() => setShowAddContact(!showAddContact)}
                  className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  <Plus size={14} />
                  {t('addContact')}
                </button>
              </div>

              {showAddContact && (
                <div className="mb-3 p-3 bg-gray-50 rounded-xl space-y-2">
                  <input
                    value={newContactName}
                    onChange={e => setNewContactName(e.target.value)}
                    placeholder="Nombre"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    value={newContactPhone}
                    onChange={e => setNewContactPhone(e.target.value)}
                    placeholder="Teléfono"
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    value={newContactRel}
                    onChange={e => setNewContactRel(e.target.value)}
                    placeholder="Relación (ej: Mamá, Esposo)"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => setShowAddContact(false)} className="flex-1 py-2 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-100">Cancelar</button>
                    <button onClick={handleAddContact} className="flex-1 py-2 text-xs font-bold text-white bg-blue-700 rounded-lg hover:bg-blue-800">Guardar</button>
                  </div>
                </div>
              )}

              {contacts.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-2">No hay contactos de emergencia</p>
              ) : (
                <div className="space-y-2">
                  {contacts.map(contact => (
                    <div key={contact.id} className="flex items-center justify-between px-3 py-2.5 bg-gray-50 rounded-xl">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{contact.name}</p>
                        <p className="text-xs text-gray-500">{contact.phone}{contact.relationship ? ` • ${contact.relationship}` : ''}</p>
                      </div>
                      <div className="flex gap-1">
                        <a href={`tel:${contact.phone}`} className="w-8 h-8 flex items-center justify-center bg-green-100 text-green-600 rounded-lg hover:bg-green-200">
                          <PhoneIcon size={14} />
                        </a>
                        {contact.id && (
                          <button onClick={() => handleDeleteContact(contact.id!)} className="w-8 h-8 flex items-center justify-center bg-red-100 text-red-600 rounded-lg hover:bg-red-200">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sign Out */}
        <button
          onClick={signOut}
          className="w-full py-3.5 border-2 border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
        >
          <LogOut size={18} />
          {t('logout')}
        </button>
      </div>
    </div>
  );
}
