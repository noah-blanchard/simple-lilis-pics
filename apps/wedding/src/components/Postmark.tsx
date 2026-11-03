import type { Locale } from "@lili/core/i18n/routing";
import { formatLongDate } from "@/lib/format";

/** The one postmark on the site: it is stamped on the sealed envelope (D9).
 *  Cyanotype ink, two rings, the city on the top arc and today's date. */
export const Postmark = ({
  locale,
  className = "",
}: {
  locale: Locale;
  className?: string;
}) => {
  const today = new Date().toISOString().slice(0, 10);
  const [day, ...rest] = formatLongDate(today, locale).split(" ");
  return (
    <svg
      viewBox="0 0 104 104"
      fill="none"
      stroke="var(--cyanotype)"
      strokeWidth={1.3}
      aria-hidden="true"
      className={className}
    >
      <defs>
        <path id="postmark-arc" d="M 17 52 A 35 35 0 0 1 87 52" />
      </defs>
      <circle cx={52} cy={52} r={47} />
      <circle cx={52} cy={52} r={41} />
      <text
        fill="var(--cyanotype)"
        stroke="none"
        fontFamily="var(--font-display), serif"
        fontSize={10}
        letterSpacing={1.2}
        textAnchor="middle"
      >
        <textPath href="#postmark-arc" startOffset="50%">
          MONTRÉAL
        </textPath>
      </text>
      <text
        x={52}
        y={56}
        fill="var(--cyanotype)"
        stroke="none"
        fontFamily="var(--font-display), serif"
        fontSize={11}
        textAnchor="middle"
      >
        {day}
      </text>
      <text
        x={52}
        y={69}
        fill="var(--cyanotype)"
        stroke="none"
        fontFamily="var(--font-display), serif"
        fontSize={9}
        textAnchor="middle"
      >
        {rest.join(" ")}
      </text>
      <g strokeLinecap="round">
        <path d="M-12 40 q6 -4 12 0 t12 0 t12 0" />
        <path d="M-12 50 q6 -4 12 0 t12 0 t12 0" />
        <path d="M-12 60 q6 -4 12 0 t12 0 t12 0" />
      </g>
    </svg>
  );
};
