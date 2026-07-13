/**
 * Subtle "www.jointhejashn.com" branding line, dropped into every theme's
 * footer. Theme-agnostic: it inherits colour from its wrapper (pass a themed,
 * muted `className`) and stays deliberately quiet so it never competes with the
 * couple's content. Links to the marketing site in a new tab.
 */
export function JashnCredit({ className = "" }: { className?: string }) {
  return (
    <a
      href="https://www.jointhejashn.com"
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-block text-[10px] uppercase tracking-[0.28em] no-underline opacity-70 transition-opacity hover:opacity-100 ${className}`}
    >
      www.jointhejashn.com
    </a>
  );
}
