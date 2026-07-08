import type { Localized } from "../schema";

/**
 * Renders both languages inline; the active one is shown via CSS driven by the
 * `.wsite[data-lang]` attribute. Hindi falls back to English when absent.
 */
export function T({ value }: { value: Localized }) {
  return (
    <>
      <span className="l-en">{value.en}</span>
      <span className="l-hi">{value.hi || value.en}</span>
    </>
  );
}

/** Bilingual pair from two plain strings (convenience). */
export function TT({ en, hi }: { en: string; hi?: string }) {
  return <T value={{ en, hi }} />;
}
