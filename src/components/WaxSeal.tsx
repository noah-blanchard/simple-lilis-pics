import Image from "next/image";

// Organic wax blob (viewBox 0 0 96 96) — a near-circle with gentle lobes so the
// seal reads as poured wax rather than a perfect disc.
const WAX =
  "M48 7 C63 7 79 17 84 33 C88 47 86 64 74 76 C62 88 41 91 28 81 C14 71 7 52 12 35 C17 19 33 7 48 7 Z";

// Sealing-wax color — a warm oxblood, nudged from the brass accent toward red so
// it reads as real wax. `DEEP` is the darker shade used for depth + the emboss.
export const WAX_COLOR = "#a8462b";
export const WAX_DEEP = "#722c19";

interface WaxSealProps {
  /** Extra classes for the wrapper (sizing lives with the caller). */
  className?: string;
  /** Suffix for the SVG gradient ids — required when two seals share a page,
   *  since duplicate ids would make one of them reference the other's fills. */
  idSuffix?: string;
}

/**
 * The brand's signature stamped into a cognac wax seal. Purely presentational:
 * every animation (the press-down thunk, the cracking) belongs to the caller,
 * which wraps or splits this however it needs.
 *
 * Shared by the contact-form success panel and the thank-you letter so the two
 * seals can't drift apart.
 */
export const WaxSeal = ({ className = "", idSuffix = "" }: WaxSealProps) => {
  const glossId = `waxGloss${idSuffix}`;
  const depthId = `waxDepth${idSuffix}`;

  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 96 96"
        fill="none"
        className="h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id={glossId} cx="36%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.5" />
            <stop offset="45%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={depthId} cx="50%" cy="54%" r="62%">
            <stop offset="58%" stopColor={WAX_DEEP} stopOpacity="0" />
            <stop offset="100%" stopColor={WAX_DEEP} stopOpacity="0.55" />
          </radialGradient>
        </defs>
        {/* Base wax, volumetric depth, then a glossy top-left highlight. */}
        <path d={WAX} fill={WAX_COLOR} />
        <path d={WAX} fill={`url(#${depthId})`} />
        <path d={WAX} fill={`url(#${glossId})`} />
        {/* Embossed die ring pressed into the wax. */}
        <circle
          cx={48}
          cy={48}
          r={30}
          fill="none"
          stroke={WAX_DEEP}
          strokeOpacity={0.3}
          strokeWidth={1.4}
        />
      </svg>

      {/* Brand signature, knocked out to white so it reads as embossed. The
          pressed shadow lives on the wrapper so the image's filter order stays
          brightness→invert (reordering would flip it dark). */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]">
        <Image
          src="/logo.webp"
          alt=""
          aria-hidden
          width={1536}
          height={1024}
          className="h-[43%] w-auto brightness-0 invert"
        />
      </div>
    </div>
  );
};
