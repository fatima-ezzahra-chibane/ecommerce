import { Link } from 'react-router-dom';
import MaterialIcon from './MaterialIcon';
import ProductImage from './ProductImage';
import { getPromo } from '../utils/productDisplay';
import { formatPrice } from '../utils/formatPrice';

const PINK = '#FF4D94';

export default function ProductCard({ product, onAddCart, onAddWishlist }) {
  const rating = product.average_rating ? Number(product.average_rating) : null;
  const promo = getPromo(product);
  const price = Number(product.price);

  return (
    <article
      className="group relative flex flex-col w-full h-[420px] sm:h-[440px] bg-white rounded-3xl overflow-hidden
        shadow-[0_8px_30px_rgba(15,23,42,0.08)]
        hover:shadow-[0_20px_50px_rgba(15,23,42,0.14)] hover:-translate-y-2
        transition-all duration-300 ease-out"
    >
      {/* Image ~70 % */}
      <div className="relative h-[280px] sm:h-[300px] w-full shrink-0 overflow-hidden rounded-t-3xl bg-white">
        <Link to={`/products/${product.id}`} className="block h-full w-full">
          <ProductImage
            src={product.image}
            alt={product.name}
            imgClassName="h-full w-full object-cover object-center"
          />
        </Link>

        {promo && (
          <span
            className="absolute top-3 left-3 z-20 text-white text-xs font-bold px-3 py-1.5 rounded-full"
            style={{ backgroundColor: PINK }}
          >
            -{promo.percent}%
          </span>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAddWishlist?.(product.id);
          }}
          className="absolute top-3 right-3 z-20 flex items-center justify-center
            w-10 h-10 bg-white rounded-full text-gray-600 hover:text-[#FF4D94]
            shadow-[0_4px_14px_rgba(0,0,0,0.1)] transition-colors duration-300"
          aria-label="Ajouter aux favoris"
        >
          <MaterialIcon name="favorite" size={22} />
        </button>
      </div>

      {/* Contenu */}
      <div className="relative flex flex-col flex-1 px-4 pb-4 pt-3 sm:px-5 sm:pb-5 sm:pt-4 min-h-0">
        <Link to={`/products/${product.id}`} className="block pr-14">
          <h3 className="font-bold text-[15px] sm:text-base leading-snug line-clamp-2 text-[#1E293B]">
            {product.name}
          </h3>
        </Link>

        {rating > 0 && (
          <div className="flex items-center gap-1 mt-1.5">
            <MaterialIcon name="star" size={16} className="!text-[#FF4D94]" filled />
            <span className="text-sm font-medium text-gray-500">{rating.toFixed(1)}</span>
          </div>
        )}

        <div className="mt-auto pt-2">
          <p className="text-lg sm:text-xl font-extrabold text-[#111827] leading-tight">
            {formatPrice(price)}
          </p>
          {promo && (
            <p className="text-sm text-gray-400 line-through mt-0.5">{formatPrice(promo.original)}</p>
          )}
        </div>

        <button
          type="button"
          onClick={() => onAddCart?.(product.id)}
          className="absolute bottom-4 right-4 z-20 flex items-center justify-center
            w-12 h-12 rounded-full text-white
            shadow-lg shadow-[#FF4D94]/40
            hover:scale-105 active:scale-95 transition-all duration-300"
          style={{ backgroundColor: PINK }}
          aria-label="Ajouter au panier"
        >
          <MaterialIcon name="shopping_bag" size={22} className="!text-white" />
        </button>
      </div>
    </article>
  );
}
