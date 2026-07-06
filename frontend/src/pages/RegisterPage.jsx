import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { IconSparkle } from '../components/Icons';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
  const { register } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    await register(form);
    navigate('/shop');
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="card-vivid p-8 sm:p-10">
        <div className="flex items-center justify-center gap-2 mb-8">
          <IconSparkle className="w-7 h-7 text-[#ff4d8d]" />
          <span className="text-2xl font-extrabold text-[#ff4d8d]">Vivid</span>
        </div>
        <h1 className="text-2xl font-extrabold text-center mb-8">Créer un compte</h1>

        <form onSubmit={submit} className="space-y-4">
          <input placeholder="Nom" required className="input-vivid !rounded-2xl"
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input type="email" placeholder="Email" required className="input-vivid !rounded-2xl"
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input type="password" placeholder="Mot de passe" required className="input-vivid !rounded-2xl"
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <input type="password" placeholder="Confirmer" required className="input-vivid !rounded-2xl"
            value={form.password_confirmation} onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })} />
          <button type="submit" className="btn-vivid w-full !py-3.5">Créer mon compte</button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Déjà inscrit ? <Link to="/login" className="text-[#ff4d8d] font-semibold">Connexion</Link>
        </p>
      </div>
    </div>
  );
}
