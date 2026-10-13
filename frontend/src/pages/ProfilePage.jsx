import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { profileService } from '../services';

export default function ProfilePage() {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [password, setPassword] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [msg, setMsg] = useState(null);

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      const { data } = await profileService.update(profile);
      await refreshUser();
      setMsg({ text: data.message, ok: true });
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Erreur lors de la mise à jour du profil.', ok: false });
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    try {
      const { data } = await profileService.updatePassword(password);
      setMsg({ text: data.message, ok: true });
      setPassword({ current_password: '', password: '', password_confirmation: '' });
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Erreur lors du changement de mot de passe.', ok: false });
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="max-w-lg mx-auto w-full space-y-8">
      <h1 className="text-3xl font-extrabold text-center">Mon profil</h1>
      {msg && (
        <p className={`text-sm py-3 px-4 rounded-2xl ${msg.ok ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'}`}>
          {msg.text}
        </p>
      )}

      <form onSubmit={saveProfile} className="card-vivid p-6 space-y-4">
        <h2 className="font-bold text-lg">Informations</h2>
        <p className="text-sm text-gray-500">Email : <span className="font-medium text-gray-800">{user?.email}</span></p>
        <input placeholder="Nom" className="input-vivid !rounded-2xl" value={profile.name}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
        <input placeholder="Téléphone" className="input-vivid !rounded-2xl" value={profile.phone}
          onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
        <button type="submit" className="btn-vivid text-sm">Enregistrer</button>
      </form>

      <form onSubmit={savePassword} className="card-vivid p-6 space-y-4">
        <h2 className="font-bold text-lg">Mot de passe</h2>
        <input type="password" placeholder="Actuel" required className="input-vivid !rounded-2xl"
          value={password.current_password} onChange={(e) => setPassword({ ...password, current_password: e.target.value })} />
        <input type="password" placeholder="Nouveau (min. 8 caractères)" required minLength={8} className="input-vivid !rounded-2xl"
          value={password.password} onChange={(e) => setPassword({ ...password, password: e.target.value })} />
        <input type="password" placeholder="Confirmer" required className="input-vivid !rounded-2xl"
          value={password.password_confirmation} onChange={(e) => setPassword({ ...password, password_confirmation: e.target.value })} />
        <button type="submit" className="btn-vivid text-sm">Modifier le mot de passe</button>
      </form>

      <button type="button" onClick={handleLogout} className="btn-vivid-outline w-full text-sm !py-3 !text-red-500">
        Déconnexion
      </button>
    </div>
  );
}
