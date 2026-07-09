/**
 * An editorial marquee ribbon — a band of words scrolling seamlessly. Pure CSS
 * (content is rendered twice and translated -50%); pauses under reduced motion.
 */
export function Marquee({
  items,
  reverse,
  className,
}: {
  items: string[];
  reverse?: boolean;
  className?: string;
}) {
  const run = (
    <div className="flex shrink-0 items-center" aria-hidden="true">
      {items.map((item, i) => (
        <span key={i} className="flex items-center">
          <span className="l-display px-8 text-[clamp(1.6rem,4vw,2.8rem)] italic">
            {item}
          </span>
          <span className="text-[color:var(--l-gold-lite)]">✦</span>
        </span>
      ))}
    </div>
  );

  return (
    <div
      className={`overflow-hidden py-5 ${className ?? ""}`}
      role="marquee"
      aria-label={items.join(", ")}
    >
      <div className={`l-marquee ${reverse ? "l-marquee-rev" : ""}`}>
        {run}
        {run}
      </div>
    </div>
  );
}
