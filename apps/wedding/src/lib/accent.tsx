// Splits a translated line on `**word**` markers and renders the marked
// portion in accent colour (italic). Same grammar as the portfolio hero.
export const renderAccentLine = (text: string) =>
  text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? (
      // biome-ignore lint/suspicious/noArrayIndexKey: static translation text, order never changes
      <span key={i} className="text-accent italic">
        {part}
      </span>
    ) : (
      part
    ),
  );
