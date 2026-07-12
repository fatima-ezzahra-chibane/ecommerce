import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { aiService } from '../services';
import MaterialIcon from './MaterialIcon';
import { useToast } from '../contexts/ToastContext';

export default function ImageSearch() {
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const onPick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const { data } = await aiService.searchImage(file);
      const products = data.data?.products || [];
      if (products.length === 1) {
        const confidence = data.data?.confidence;
        showToast(
          confidence
            ? `Produit identique trouvé (confiance ${Math.round(confidence * 100)} %)`
            : 'Produit identique trouvé',
          'success'
        );
        navigate(`/products/${products[0].id}`);
      } else {
        showToast('Aucun produit identique à cette photo dans notre catalogue.', 'error');
      }
    } catch (err) {
      showToast(
        err.response?.data?.message || 'Service computer vision indisponible.',
        'error'
      );
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={onPick}
      />
      <button
        type="button"
        disabled={loading}
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-[#ff4d8d]/30 text-[#ff4d8d]
          text-sm font-semibold hover:bg-[#fff0f5] transition-colors disabled:opacity-50"
        title="Recherche par image (Computer Vision)"
      >
        <MaterialIcon name="photo_camera" size={20} />
        {loading ? 'Analyse CV...' : 'Même produit (photo)'}
      </button>
    </>
  );
}
