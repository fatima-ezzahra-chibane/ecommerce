import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { notifyToast, setToastHandler } from '../utils/toastBus';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const displayToast = useCallback((message, type = 'success') => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  useEffect(() => {
    setToastHandler(displayToast);
    return () => setToastHandler(null);
  }, [displayToast]);

  return (
    <ToastContext.Provider value={{ showToast: notifyToast }}>
      {children}
      <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto px-5 py-3 rounded-2xl shadow-lg text-sm font-medium animate-[slideIn_0.3s_ease] ${
              t.type === 'error'
                ? 'bg-red-50 text-red-700 border border-red-100'
                : 'bg-white text-gray-800 border border-gray-100'
            }`}
          >
            {t.type === 'success' && <span className="text-[#ff4d8d] mr-2">✓</span>}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
