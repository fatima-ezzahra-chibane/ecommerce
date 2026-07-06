export default function Pagination({ meta, onPage }) {
  if (!meta || meta.last_page <= 1) return null;

  const { current_page, last_page, total } = meta;

  const pages = [];
  const start = Math.max(1, current_page - 2);
  const end = Math.min(last_page, current_page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
      <p className="text-sm text-gray-500 order-2 sm:order-1">
        Page {current_page} / {last_page} — {total} résultat(s)
      </p>
      <div className="flex items-center gap-1 order-1 sm:order-2">
        <button
          type="button"
          disabled={current_page <= 1}
          onClick={() => onPage(current_page - 1)}
          className="px-3 py-2 rounded-full text-sm font-medium disabled:opacity-40 hover:bg-[#fff0f5] text-gray-600"
        >
          ←
        </button>
        {start > 1 && (
          <>
            <button type="button" onClick={() => onPage(1)} className="w-9 h-9 rounded-full text-sm hover:bg-[#fff0f5]">1</button>
            {start > 2 && <span className="px-1 text-gray-400">…</span>}
          </>
        )}
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPage(p)}
            className={`w-9 h-9 rounded-full text-sm font-semibold transition-colors ${
              p === current_page ? 'bg-[#ff4d8d] text-white shadow-md' : 'hover:bg-[#fff0f5] text-gray-600'
            }`}
          >
            {p}
          </button>
        ))}
        {end < last_page && (
          <>
            {end < last_page - 1 && <span className="px-1 text-gray-400">…</span>}
            <button type="button" onClick={() => onPage(last_page)} className="w-9 h-9 rounded-full text-sm hover:bg-[#fff0f5]">{last_page}</button>
          </>
        )}
        <button
          type="button"
          disabled={current_page >= last_page}
          onClick={() => onPage(current_page + 1)}
          className="px-3 py-2 rounded-full text-sm font-medium disabled:opacity-40 hover:bg-[#fff0f5] text-gray-600"
        >
          →
        </button>
      </div>
    </div>
  );
}
