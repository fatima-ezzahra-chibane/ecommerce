import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { aiService } from '../services';
import MaterialIcon from './MaterialIcon';
import { formatPrice } from '../utils/formatPrice';

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Bonjour ! Je suis l\'assistant Vivid. Posez-moi une question sur nos produits, la livraison ou les retours.',
    },
  ]);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const send = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', content: text };
    const history = messages.filter((m) => m.role === 'user' || m.role === 'assistant').slice(-8);
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await aiService.chat({ message: text, history });
      const products = data.data?.products || [];
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.data.reply,
          products,
          source: data.data.source,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Désolé, une erreur est survenue. Réessayez.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-20 lg:bottom-6 right-4 z-50 w-14 h-14 rounded-full bg-[#ff4d8d] text-white shadow-lg
          flex items-center justify-center hover:scale-105 transition-transform"
        aria-label="Assistant IA"
      >
        <MaterialIcon name="smart_toy" size={28} className="!text-white" />
      </button>

      {open && (
        <div className="fixed bottom-36 lg:bottom-24 right-4 z-50 w-[min(100vw-2rem,380px)] h-[min(70vh,520px)]
          bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden">
          <div className="bg-gradient-to-r from-[#ff4d8d] to-[#ff6ba8] text-white px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MaterialIcon name="smart_toy" size={22} className="!text-white" />
              <span className="font-bold">Assistant Vivid</span>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="text-white/90 hover:text-white">
              <MaterialIcon name="close" size={22} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f8f9fb]">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-[#ff4d8d] text-white rounded-br-md'
                      : 'bg-white text-gray-700 shadow-sm rounded-bl-md'
                  }`}
                >
                  <p>{m.content}</p>
                  {m.products?.length > 0 && (
                    <div className="mt-2 space-y-1 border-t border-gray-100 pt-2">
                      {m.products.map((p) => (
                        <Link
                          key={p.id}
                          to={`/products/${p.id}`}
                          className="block text-xs font-semibold text-[#ff4d8d] hover:underline"
                          onClick={() => setOpen(false)}
                        >
                          {p.name} — {formatPrice(p.price)}
                        </Link>
                      ))}
                    </div>
                  )}
                  {m.source && (
                    <p className="text-[10px] opacity-50 mt-1">{m.source === 'openai' ? 'IA OpenAI' : 'Assistant local'}</p>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <p className="text-xs text-gray-400 animate-pulse">Réflexion...</p>
            )}
            <div ref={endRef} />
          </div>

          <form onSubmit={send} className="p-3 border-t border-gray-100 flex gap-2 bg-white">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Votre message..."
              className="flex-1 input-vivid !rounded-full !py-2.5 text-sm"
            />
            <button type="submit" disabled={loading} className="btn-vivid !px-4 !py-2.5 !rounded-full">
              <MaterialIcon name="send" size={20} className="!text-white" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
