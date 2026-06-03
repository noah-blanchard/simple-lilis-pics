/* Lilis Pics — reusable components */
const { motion, AnimatePresence, useScroll, useTransform } = window.Motion || window.framerMotion;

/* ───────── small primitives ───────── */

const TagLabel = ({ children, className = "" }) => (
  <span className={`tag-mono uppercase ${className}`}>[{children}]</span>
);

const PillButton = ({ children, variant = "light", className = "", onClick, href }) => {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 text-[15px] font-medium transition-all duration-300";
  const styles = {
    light: "bg-white text-ink hover:bg-accent",
    dark: "bg-panel text-white hover:bg-panel2",
    accent: "bg-accent text-ink hover:bg-white",
    ghost:
      "border border-white/15 text-white hover:bg-white hover:text-ink",
  };
  const Comp = href ? "a" : "button";
  return (
    <Comp href={href} onClick={onClick} className={`${base} ${styles[variant]} ${className}`}>
      {children}
    </Comp>
  );
};

const IconArrow = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M7 17 L17 7" strokeLinecap="round"/>
    <path d="M9 7 H17 V15" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconPlus = ({ className="" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M12 5v14M5 12h14" strokeLinecap="round"/>
  </svg>
);

const IconMinus = ({ className="" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M5 12h14" strokeLinecap="round"/>
  </svg>
);

const IconCheck = ({ className="" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m5 12 4 4 10-10" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconMenu = ({ className="" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M4 8h16M4 16h16" strokeLinecap="round"/>
  </svg>
);

const IconQuote = ({ className="" }) => (
  <svg className={className} viewBox="0 0 48 48" fill="currentColor" aria-hidden="true">
    <path d="M14 10c-5 2-9 7-9 14v14h14V24h-7c0-5 3-8 7-10l-5-4Zm22 0c-5 2-9 7-9 14v14h14V24h-7c0-5 3-8 7-10l-5-4Z"/>
  </svg>
);

/* category icons (line, monoweight) */
const CatIcon = ({ kind, className="" }) => {
  const common = { className, viewBox:"0 0 32 32", fill:"none", stroke:"currentColor", strokeWidth:"1.5", strokeLinecap:"round", strokeLinejoin:"round" };
  switch(kind){
    case "landscape": return (<svg {...common}><rect x="4" y="6" width="24" height="20" rx="3"/><path d="M4 22l7-7 5 5 4-4 8 8"/><circle cx="22" cy="12" r="2"/></svg>);
    case "street":    return (<svg {...common}><path d="M16 5v22"/><path d="M10 9c4 1 8 1 12 0"/><path d="M10 13c4 1 8 1 12 0"/><path d="M10 19c4 1 8 1 12 0"/><path d="M10 23c4 1 8 1 12 0"/></svg>);
    case "product":   return (<svg {...common}><path d="M16 4l11 6v12l-11 6L5 22V10z"/><path d="M5 10l11 6 11-6"/><path d="M16 16v12"/></svg>);
    case "portrait":  return (<svg {...common}><path d="M9 27v-3a7 7 0 0 1 14 0v3"/><circle cx="16" cy="12" r="5"/></svg>);
    case "fashion":   return (<svg {...common}><path d="M11 5l5 4 5-4 6 4-4 5-2-1v15H8V13l-2 1-4-5z"/></svg>);
    case "macro":     return (<svg {...common}><circle cx="11" cy="13" r="6"/><circle cx="21" cy="13" r="6"/><circle cx="16" cy="22" r="6"/></svg>);
    case "event":     return (<svg {...common}><path d="M16 4l3 9 10 1-7.5 6.5L24 30l-8-5-8 5 2.5-9.5L3 14l10-1z"/></svg>);
    case "wildlife":  return (<svg {...common}><path d="M5 6c10 0 22 8 22 22"/><path d="M5 6v22h22"/></svg>);
    default: return null;
  }
};

/* ───────── animated wrappers ───────── */

const Reveal = ({ children, delay = 0, y = 24, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay }}
    className={className}
  >
    {children}
  </motion.div>
);

const SectionHeader = ({ tag, lines = [], align = "center", className = "" }) => (
  <div className={`${align === "center" ? "text-center" : ""} ${className}`}>
    <Reveal>
      <div className="mb-5"><TagLabel>{tag}</TagLabel></div>
    </Reveal>
    <Reveal delay={0.08}>
      <h2 className="display text-4xl sm:text-5xl md:text-6xl lg:text-[68px] tracking-tight max-w-5xl mx-auto" style={{textWrap:"balance"}}>
        {lines.map((l, i) => (
          <span key={i} className="block">{l}</span>
        ))}
      </h2>
    </Reveal>
  </div>
);

/* image with skeleton + hover-zoom */
const RoundedImage = ({ src, alt, className = "", ratio = "aspect-[4/5]", zoom = true, children }) => (
  <div className={`group relative overflow-hidden rounded-card bg-panel ${ratio} ${className}`}>
    <img
      src={src}
      alt={alt || ""}
      loading="lazy"
      className={`absolute inset-0 w-full h-full object-cover ${zoom ? "img-zoom" : ""}`}
    />
    {children}
  </div>
);

/* expose to global scope so other files can use these names */
Object.assign(window, {
  TagLabel, PillButton, IconArrow, IconPlus, IconMinus, IconCheck, IconMenu, IconQuote, CatIcon,
  Reveal, SectionHeader, RoundedImage,
});
