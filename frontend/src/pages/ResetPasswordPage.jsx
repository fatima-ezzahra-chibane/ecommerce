import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: params.get('email') || '',
    token: params.get('token') || '',
    password: '',
    password_confirmation: '',
  });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.resetPassword(form);
      navigate('/login');
    } catch {
      /* toast géré par l'intercepteur API */
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="card-vivid p-8 sm:p-10">
        <div className="flex items-center justify-center mb-6">
          <span className="text-2xl font-extrabold text-[#ff4d8d]">Vivid</span>
        </div>
        <h1 className="text-2xl font-extrabold text-center mb-6">Nouveau mot de passe</h1>

        <form onSubmit={submit} className="space-y-4">
          <input type="hidden" value={form.token} readOnly />
          <input
            type="email"
            placeholder="Email"
            required
            className="input-vivid !rounded-2xl"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Nouveau mot de passe (min. 8)"
            required
            minLength={8}
            className="input-vivid !rounded-2xl"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <input
            type="password"
            placeholder="Confirmer le mot de passe"
            required
            className="input-vivid !rounded-2xl"
            value={form.password_confirmation}
            onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
          />
          <button type="submit" disabled={loading} className="btn-vivid w-full !py-3.5">
            {loading ? 'Enregistrement...' : 'Réinitialiser'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link to="/login" className="text-[#ff4d8d] font-semibold hover:underline">Connexion</Link>
        </p>
      </div>
    </div>
  );
}
