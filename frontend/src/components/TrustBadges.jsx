import MaterialIcon from './MaterialIcon';

const BADGES = [
  {
    icon: 'rocket_launch',
    title: 'Livraison rapide',
    desc: 'Expédition sous 48h',
    ring: 'bg-rose-50 text-[#ff4d8d]',
  },
  {
    icon: 'lock',
    title: 'Paiement sécurisé',
    desc: '100% protégé',
    ring: 'bg-amber-50 text-amber-600',
  },
  {
    icon: 'published_with_changes',
    title: 'Retours faciles',
    desc: "30 jours pour changer d'avis",
    ring: 'bg-sky-50 text-sky-600',
  },
];

export default function TrustBadges() {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-5 lg:gap-6">
      {BADGES.map((item) => (
        <article
          key={item.title}
          className="bg-white rounded-[1.75rem] border border-gray-100/80 shadow-[0_4px_24px_rgba(15,23,42,0.06)]
            px-6 py-8 text-center hover:shadow-[0_8px_32px_rgba(15,23,42,0.08)] transition-shadow duration-300"
        >
          <div
            className={`w-[4.5rem] h-[4.5rem] mx-auto rounded-full flex items-center justify-center ${item.ring}`}
          >
            <MaterialIcon name={item.icon} size={30} />
          </div>
          <h3 className="font-bold text-[#1e293b] mt-5 text-base">{item.title}</h3>
          <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{item.desc}</p>
        </article>
      ))}
    </section>
  );
}
