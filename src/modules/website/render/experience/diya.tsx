/**
 * A small brass diya with a lit flame — drawn rather than emoji so it inherits
 * the theme's brass/rosewood palette and stays crisp at any size. `size` is the
 * rendered width in px; the glow is baked in so it reads on light grounds.
 */
export function Diya({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
    >
      {/* halo */}
      <ellipse cx="12" cy="8.5" rx="5.5" ry="6" fill="var(--sa-gold-lite, #EBC77A)" opacity="0.28" />
      {/* flame */}
      <path
        d="M12 3.4c2.1 2 3.1 3.5 3.1 5a3.1 3.1 0 1 1-6.2 0c0-1.5 1-3 3.1-5Z"
        fill="var(--sa-saffron, #C79A3D)"
      />
      <path
        d="M12 6.2c1 1.1 1.5 1.9 1.5 2.7a1.5 1.5 0 0 1-3 0c0-.8.5-1.6 1.5-2.7Z"
        fill="#FFF3D2"
      />
      {/* bowl */}
      <path
        d="M3.6 14.6h16.8c-.9 3.3-4.2 5.3-8.4 5.3s-7.5-2-8.4-5.3Z"
        fill="var(--sa-terracotta, #9C3B21)"
      />
      <path
        d="M3.6 14.6h16.8"
        stroke="var(--sa-saffron, #C79A3D)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M6.5 17.9c1.5.9 3.4 1.4 5.5 1.4s4-.5 5.5-1.4"
        stroke="var(--sa-gold-lite, #EBC77A)"
        strokeWidth="0.9"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}
