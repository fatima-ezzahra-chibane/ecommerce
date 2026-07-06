import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productService, reviewService } from '../services';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import MaterialIcon from '../components/MaterialIcon';
import ProductImage from '../components/ProductImage';
import { getPromo } from '../utils/productDisplay';
import { formatPrice } from '../utils/formatPrice';

function Stars({ rating }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <MaterialIcon
          key={n}
          name="star"
          size={18}
          filled={n <= rating}
          className={n <= rating ? '!text-[#ff4d8d]' : '!text-gray-200'}
        />
      ))}
    </span>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', imageFile: null });
  const [reviewPreview, setReviewPreview] = useState('');
  const fileRef = useRef(null);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();

  const loadReviews = () => reviewService.list(id).then(({ data }) => setReviews(data.data || []));

  useEffect(() => {
    productService.get(id).then(({ data }) => setProduct(data.data));
    loadReviews();
  }, [id]);

  const onReviewImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReviewForm((f) => ({ ...f, imageFile: file }));
    setReviewPreview(URL.createObjectURL(file));
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Connectez-vous pour laisser un avis', 'error');
      return;
    }
    await reviewService.create(id, reviewForm);
    setReviewForm({ rating: 5, comment: '', imageFile: null });
    setReviewPreview('');
    if (fileRef.current) fileRef.current.value = '';
    loadReviews();
    productService.get(id).then(({ data }) => setProduct(data.data));
  };

  if (!product) return <div className="text-center py-20 text-gray-400">Chargement...</div>;

  const promo = getPromo(product, product.id);

  return (
    <div className="space-y-10">
      <div className="bg-white rounded-3xl overflow-hidden shadow-[0_4px_20px_rgba(15,23,42,0.06)]">
        <div className="grid md:grid-cols-2 gap-0">
          <div className="relative p-8 lg:p-12 flex items-center justify-center min-h-[340px] bg-white">
            {promo && (
              <span className="absolute top-6 left-6 z-10 bg-[#ff4d8d] text-white text-xs font-bold px-3 py-1 rounded-full">
                -{promo.percent}%
              </span>
            )}
            <ProductImage
              src={product.image}
              alt={product.name}
              imgClassName="max-h-[min(320px,70vh)] max-w-full object-contain"
            />
          </div>
          <div className="p-8 lg:p-10 flex flex-col justify-center border-t md:border-t-0 md:border-l border-gray-50">
            <Link to="/shop" className="text-sm text-[#ff4d8d] font-semibold mb-2">{product.category?.name}</Link>
            <h1 className="text-3xl font-extrabold text-[#1e293b]">{product.name}</h1>
            {product.average_rating > 0 && (
              <div className="flex items-center gap-2 mt-3">
                <Stars rating={Math.round(product.average_rating)} />
                <span className="text-gray-500 text-sm font-semibold">{product.average_rating}</span>
              </div>
            )}
            <div className="mt-4">
              <p className="text-3xl font-extrabold text-[#0f172a]">{formatPrice(product.price)}</p>
              {promo && (
                <p className="text-lg text-gray-400 line-through mt-1">{formatPrice(promo.original)}</p>
              )}
            </div>
            <p className="text-gray-600 mt-4 leading-relaxed">{product.description}</p>
            <p className="text-sm text-gray-400 mt-2">En stock : {product.stock} unités</p>
            <button
              onClick={() => addToCart(product.id)}
              className="btn-vivid mt-8 w-full sm:w-auto inline-flex items-center justify-center gap-2 !px-10 !py-4 text-base"
            >
              <MaterialIcon name="shopping_bag" size={22} className="!text-white" />
              Ajouter au panier
            </button>
          </div>
        </div>
      </div>

      <section className="card-vivid p-6 lg:p-8">
        <h2 className="text-xl font-extrabold mb-6 text-[#475569]">Avis clients ({reviews.length})</h2>
        {user && (
          <form onSubmit={submitReview} className="bg-[#f8f9fb] rounded-2xl p-5 mb-6 space-y-3 max-w-lg">
            <select
              value={reviewForm.rating}
              onChange={(e) => setReviewForm({ ...reviewForm, rating: +e.target.value })}
              className="input-vivid !rounded-xl !py-2"
            >
              {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} étoiles</option>)}
            </select>
            <textarea
              placeholder="Votre avis..."
              rows={3}
              className="input-vivid !rounded-2xl"
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
            />
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-2">Photo (optionnel)</label>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={onReviewImage}
                className="text-sm w-full file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-[#fff0f5] file:text-[#ff4d8d] file:font-semibold file:text-sm"
              />
              {reviewPreview && (
                <img src={reviewPreview} alt="Aperçu" className="mt-3 w-28 h-28 rounded-2xl object-cover border border-gray-100" />
              )}
            </div>
            <button type="submit" className="btn-vivid text-sm inline-flex items-center gap-2">
              <MaterialIcon name="photo_camera" size={18} className="!text-white" />
              Publier l&apos;avis
            </button>
          </form>
        )}
        <div className="space-y-5">
          {reviews.map((r) => (
            <div key={r.id} className="border-b border-gray-100 pb-5 last:border-0">
              <div className="flex justify-between items-center gap-4">
                <span className="font-semibold">{r.user?.name}</span>
                <Stars rating={r.rating} />
              </div>
              {r.comment && <p className="text-gray-600 text-sm mt-2">{r.comment}</p>}
              {r.image && (
                <a href={r.image} target="_blank" rel="noreferrer" className="inline-block mt-3">
                  <img
                    src={r.image}
                    alt="Photo avis client"
                    className="w-32 h-32 rounded-2xl object-cover border border-gray-100 hover:opacity-90 transition-opacity shadow-sm"
                  />
                </a>
              )}
            </div>
          ))}
          {!reviews.length && <p className="text-gray-400">Soyez le premier à donner votre avis.</p>}
        </div>
      </section>
    </div>
  );
}
