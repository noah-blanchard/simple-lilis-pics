import { AccentUnderline } from "./AccentUnderline";
import { Reveal } from "./Reveal";

interface SectionHeaderProps {
  titleBase: string;
  titleAccent: string;
  align?: "center" | "left";
  /** Heading level; pages whose main title is a section header pass "h1". */
  as?: "h1" | "h2";
  /** Id on the heading, for a section's aria-labelledby. */
  id?: string;
  className?: string;
}

export const SectionHeader = ({
  titleBase,
  titleAccent,
  align = "center",
  as: Heading = "h2",
  id,
  className = "",
}: SectionHeaderProps) => (
  <div className={`${align === "center" ? "text-center" : ""} ${className}`}>
    <Reveal delay={0.08}>
      <Heading
        id={id}
        className={`display ${align === "center" ? "mx-auto" : ""} max-w-5xl text-4xl tracking-tight sm:text-5xl md:text-6xl lg:text-[68px] min-[1440px]:text-h2-fluid`}
        style={{ textWrap: "balance" }}
      >
        <span className="block">{titleBase}</span>
        <AccentUnderline block className="text-accent italic">
          {titleAccent}
        </AccentUnderline>
      </Heading>
    </Reveal>
  </div>
);
