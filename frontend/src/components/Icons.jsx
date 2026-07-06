const base = 'shrink-0 inline-block';

export function IconSparkle({ className = '' }) {
  return (
    <svg className={`w-4 h-4 ${base} ${className}`} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2zm0 14l.8 2.8L15.6 20l-2.8.8L12 23.6l-.8-2.8-2.8-.8 2.8-.8L12 16z" />
    </svg>
  );
}
