interface StarIconProps {
  className?: string;
  /** Solid fill vs. hairline outline. */
  filled?: boolean;
}

// A five-point star with slightly soft points, so it sits next to the site's
// editorial serif without looking like a UI-kit rating widget.
const STAR =
  "M12 2.6 L14.7 8.9 L21.4 9.6 C22.2 9.7 22.5 10.7 21.9 11.2 L16.9 15.6 L18.4 22.2 C18.6 23 17.7 23.6 17 23.2 L12 19.7 L7 23.2 C6.3 23.6 5.4 23 5.6 22.2 L7.1 15.6 L2.1 11.2 C1.5 10.7 1.8 9.7 2.6 9.6 L9.3 8.9 Z";

export const StarIcon = ({ className = "", filled = true }: StarIconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 26"
    fill={filled ? "currentColor" : "none"}
    stroke={filled ? "none" : "currentColor"}
    strokeWidth={filled ? 0 : 1.4}
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={STAR} />
  </svg>
);
