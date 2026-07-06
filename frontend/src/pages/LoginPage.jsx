import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(form);
      navigate('/shop');
    } catch (err) {
      const data = err.response?.data;
      const firstError = data?.errors && Object.values(data.errors)[0];
      const message = data?.message
        || (Array.isArray(firstError) ? firstError[0] : firstError)
        || 'Identifiants incorrects.';
      setError(message);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="card-vivid p-8 sm:p-10">
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="text-2xl font-extrabold text-[#ff4d8d]">Vivid</span>
        </div>
        <h1 className="text-2xl font-extrabold text-center text-gray-900 mb-2">Bon retour !</h1>
        <p className="text-center text-gray-500 text-sm mb-8">Connectez-vous à votre compte</p>

        <form onSubmit={submit} className="space-y-4">
          {error && <p className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-full">{error}</p>}
          <input type="email" placeholder="Email" required className="input-vivid !rounded-2xl"
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input type="password" placeholder="Mot de passe" required className="input-vivid !rounded-2xl"
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <p className="text-right text-sm">
            <Link to="/forgot-password" className="text-[#ff4d8d] font-medium hover:underline">Mot de passe oublié ?</Link>
          </p>
          <button type="submit" className="btn-vivid w-full !py-3.5">Se connecter</button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Pas de compte ? <Link to="/register" className="text-[#ff4d8d] font-semibold hover:underline">S'inscrire</Link>
        </p>
      </div>
    </div>
  );
}
