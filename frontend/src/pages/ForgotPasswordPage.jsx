import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetUrl, setResetUrl] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResetUrl('');
    try {
      const { data } = await authService.forgotPassword({ email });
      if (data.reset_url) setResetUrl(data.reset_url);
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
        <h1 className="text-2xl font-extrabold text-center mb-2">Mot de passe oublié</h1>
        <p className="text-center text-gray-500 text-sm mb-6">
          Entrez votre email pour recevoir un lien de réinitialisation.
        </p>

        <form onSubmit={submit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            required
            className="input-vivid !rounded-2xl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" disabled={loading} className="btn-vivid w-full !py-3.5">
            {loading ? 'Envoi...' : 'Envoyer le lien'}
          </button>
        </form>

        {resetUrl && (
          <div className="mt-4 p-3 bg-amber-50 rounded-2xl text-xs text-amber-900 break-all">
            <p className="font-semibold mb-1">Mode dev — lien direct :</p>
            <a href={resetUrl} className="text-[#ff4d8d] underline">{resetUrl}</a>
          </div>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link to="/login" className="text-[#ff4d8d] font-semibold hover:underline">← Retour connexion</Link>
        </p>
      </div>
    </div>
  );
}
