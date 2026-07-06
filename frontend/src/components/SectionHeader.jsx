import { Link } from 'react-router-dom';
import MaterialIcon from './MaterialIcon';

export default function SectionHeader({ title, subtitle, linkTo = '/shop', linkLabel = 'Voir tout' }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-8">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#4a5568] tracking-tight">{title}</h2>
        {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
      </div>
      {linkTo && (
        <Link
          to={linkTo}
          className="inline-flex items-center gap-1 text-[#ff4d8d] font-semibold text-sm whitespace-nowrap
            hover:gap-2 transition-all shrink-0"
        >
          {linkLabel}
          <MaterialIcon name="arrow_forward" size={18} className="!text-[#ff4d8d]" />
        </Link>
      )}
    </div>
  );
}
