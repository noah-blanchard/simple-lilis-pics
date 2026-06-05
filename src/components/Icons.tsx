import type { IconKind } from "@/types";

interface IconProps {
  className?: string;
}

export const IconArrow = ({ className = "" }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    aria-hidden="true"
  >
    <path d="M7 17 L17 7" strokeLinecap="round" />
    <path d="M9 7 H17 V15" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconPlus = ({ className = "" }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    aria-hidden="true"
  >
    <path d="M12 5v14M5 12h14" strokeLinecap="round" />
  </svg>
);

export const IconSparkle = ({ className = "" }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    aria-hidden="true"
  >
    <path
      d="M12 3l1.8 4.9L18.7 9.7 13.8 11.5 12 16.4 10.2 11.5 5.3 9.7 10.2 7.9 12 3z"
      strokeLinejoin="round"
    />
    <path
      d="M18 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2z"
      strokeLinejoin="round"
    />
  </svg>
);

export const IconMinus = ({ className = "" }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    aria-hidden="true"
  >
    <path d="M5 12h14" strokeLinecap="round" />
  </svg>
);

export const IconCheck = ({ className = "" }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <path d="m5 12 4 4 10-10" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconMenu = ({ className = "" }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    aria-hidden="true"
  >
    <path d="M4 8h16M4 16h16" strokeLinecap="round" />
  </svg>
);

export const IconQuote = ({ className = "" }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 48 48"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M14 10c-5 2-9 7-9 14v14h14V24h-7c0-5 3-8 7-10l-5-4Zm22 0c-5 2-9 7-9 14v14h14V24h-7c0-5 3-8 7-10l-5-4Z" />
  </svg>
);

export const IconChevronLeft = ({ className = "" }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

export const IconChevronRight = ({ className = "" }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M9 18l6-6-6-6" />
  </svg>
);

export const IconSun = ({ className = "" }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

export const IconMoon = ({ className = "" }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
  </svg>
);

/* category icons (line, monoweight) */
export const CatIcon = ({
  kind,
  className = "",
}: {
  kind: IconKind;
  className?: string;
}) => {
  const common = {
    className,
    viewBox: "0 0 32 32",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (kind) {
    case "landscape":
      return (
        <svg {...common} aria-hidden="true">
          <rect x="4" y="6" width="24" height="20" rx="3" />
          <path d="M4 22l7-7 5 5 4-4 8 8" />
          <circle cx="22" cy="12" r="2" />
        </svg>
      );
    case "street":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M16 5v22" />
          <path d="M10 9c4 1 8 1 12 0" />
          <path d="M10 13c4 1 8 1 12 0" />
          <path d="M10 19c4 1 8 1 12 0" />
          <path d="M10 23c4 1 8 1 12 0" />
        </svg>
      );
    case "product":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M16 4l11 6v12l-11 6L5 22V10z" />
          <path d="M5 10l11 6 11-6" />
          <path d="M16 16v12" />
        </svg>
      );
    case "portrait":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M9 27v-3a7 7 0 0 1 14 0v3" />
          <circle cx="16" cy="12" r="5" />
        </svg>
      );
    case "fashion":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M11 5l5 4 5-4 6 4-4 5-2-1v15H8V13l-2 1-4-5z" />
        </svg>
      );
    case "macro":
      return (
        <svg {...common} aria-hidden="true">
          <circle cx="11" cy="13" r="6" />
          <circle cx="21" cy="13" r="6" />
          <circle cx="16" cy="22" r="6" />
        </svg>
      );
    case "event":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M16 4l3 9 10 1-7.5 6.5L24 30l-8-5-8 5 2.5-9.5L3 14l10-1z" />
        </svg>
      );
    case "wildlife":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M5 6c10 0 22 8 22 22" />
          <path d="M5 6v22h22" />
        </svg>
      );
    default:
      return null;
  }
};
