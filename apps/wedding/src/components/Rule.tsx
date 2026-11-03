interface RuleProps {
  short?: boolean;
  /** Margins only. */
  className?: string;
}

export const Rule = ({ short = false, className = "" }: RuleProps) => (
  <span
    aria-hidden
    className={`mx-auto block h-px bg-line-strong ${short ? "w-[26px]" : "w-14"} ${className}`}
  />
);
