import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productService, aiService } from '../services';
import ProductCard from '../components/ProductCard';
import SectionHeader from '../components/SectionHeader';
import TrustBadges from '../components/TrustBadges';
import MaterialIcon from '../components/MaterialIcon';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { wishlistService } from '../services';
import { useToast } from '../contexts/ToastContext';

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [forYou, setForYou] = useState([]);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    productService.list({ per_page: 4, sort: 'latest' }).then(({ data }) => setFeatured(data.data || []));
    aiService.recommendations({ limit: 4 }).then(({ data }) => setForYou(data.data || []));
  }, [user]);

  const addWishlist = async (id) => {
    if (!user) {
      showToast('Connectez-vous pour ajouter aux favoris', 'error');
      return;
    }
    await wishlistService.add(id);
  };

  return (
    <div className="space-y-14 lg:space-y-20">
      <section
        className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#ff4d8d] via-[#ff6ba8] to-[#ff9ec4]
          text-white px-6 sm:px-10 py-14 sm:py-20 text-center"
      >
        <div className="absolute -top-6 -right-6 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-0 left-1/4 w-56 h-56 rounded-full bg-white/5 blur-3xl" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <p className="inline-block text-white/95 text-sm font-semibold uppercase tracking-widest mb-4">
            Nouvelle collection
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-5">
            Shoppez avec style sur Vivid
          </h1>
          <p className="text-white/90 text-base sm:text-lg mb-8 max-w-lg mx-auto leading-relaxed">
            Mode, tech, maison — des produits sélectionnés pour vous, livrés rapidement.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-white text-[#ff4d8d] font-bold px-8 py-4 rounded-full
              hover:shadow-2xl hover:scale-[1.02] transition-all text-base sm:text-lg"
          >
            Découvrir la boutique
            <MaterialIcon name="arrow_forward" size={22} className="!text-[#ff4d8d]" />
          </Link>
        </div>
      </section>

      <section>
        <SectionHeader
          title="Sélection de la rédaction"
          subtitle="Nos coups de cœur cette semaine"
          linkTo="/shop"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 items-stretch">
          {featured.map((p, i) => (
            <ProductCard
              key={p.id}
              product={p}
              index={i}
              onAddCart={addToCart}
              onAddWishlist={addWishlist}
            />
          ))}
        </div>
      </section>

      {forYou.length > 0 && (
        <section>
          <SectionHeader
            title={user ? 'Recommandé pour vous' : 'Populaires'}
            subtitle="Suggestions intelligentes basées sur nos best-sellers"
            linkTo="/shop"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 items-stretch">
            {forYou.map((p, i) => (
              <ProductCard
                key={p.id}
                product={p}
                index={i}
                onAddCart={addToCart}
                onAddWishlist={addWishlist}
              />
            ))}
          </div>
        </section>
      )}

      <TrustBadges />
    </div>
  );
}
