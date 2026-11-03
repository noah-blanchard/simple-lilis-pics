import type { Locale } from "@lili/core/i18n/routing";
import { formatPrice } from "@/lib/format";
import { Sheet } from "./Sheet";

interface PlaceCardProps {
  name: string;
  duration: string;
  includes: string[];
  /** Whole CAD; null shows `onRequest`. */
  price: number | null;
  from: string;
  onRequest: string;
  locale: Locale;
}

/** A folded place card: duration on the fold, name, price, inclusions. */
export const PlaceCard = ({
  name,
  duration,
  includes,
  price,
  from,
  onRequest,
  locale,
}: PlaceCardProps) => (
  <Sheet className="flex h-full flex-col text-center">
    {/* The place card's fold: one of the two allowed gradients. */}
    <p className="border-line border-b bg-gradient-to-b from-[#f3f3f3] to-sheet px-4 py-3 text-[15px] text-muted italic">
      {duration}
    </p>
    <div className="flex flex-1 flex-col items-center gap-3 px-6 pt-8 pb-10">
      <h3 className="display text-[36px] italic leading-none">{name}</h3>
      {price !== null ? (
        <>
          <p className="text-[16px] text-muted italic">{from}</p>
          <p className="display text-[46px] leading-none">
            {formatPrice(price, locale)}
          </p>
        </>
      ) : (
        <p className="display text-[30px] text-muted italic leading-none">
          {onRequest}
        </p>
      )}
      <ul className="mt-4 flex list-none flex-col gap-1.5 text-[15px] text-muted">
        {includes.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  </Sheet>
);
