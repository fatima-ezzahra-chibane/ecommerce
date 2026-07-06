/**
 * Google Material Symbols Outlined — icônes en police, style élégant et léger.
 */
export default function MaterialIcon({ name, className = '', size = 24, filled = false }) {
  return (
    <span
      className={`material-symbols-outlined inline-flex items-center justify-center select-none leading-none ${className}`}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' ${size}`,
      }}
      aria-hidden
    >
      {name}
    </span>
  );
}
