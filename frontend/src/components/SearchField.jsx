import MaterialIcon from './MaterialIcon';

export default function SearchField({ value, onChange, onSubmit, className = '' }) {
  return (
    <form onSubmit={onSubmit} className={className}>
      <div className="flex items-center gap-3 bg-[#f5f5f7] rounded-full px-4 py-2.5 min-h-[44px]">
        <MaterialIcon name="search" size={20} className="!text-gray-400 shrink-0" />
        <input
          type="search"
          placeholder="Rechercher un produit..."
          className="flex-1 min-w-0 bg-transparent border-0 outline-none text-sm text-gray-800 placeholder:text-gray-400"
          value={value}
          onChange={onChange}
        />
      </div>
    </form>
  );
}
