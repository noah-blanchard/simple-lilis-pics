import { AccentUnderline } from "./AccentUnderline";
import { Reveal } from "./Reveal";

interface SectionHeaderProps {
  titleBase: string;
  titleAccent: string;
  align?: "center" | "left";
  className?: string;
}

export const SectionHeader = ({
  titleBase,
  titleAccent,
  align = "center",
  className = "",
}: SectionHeaderProps) => (
  <div className={`${align === "center" ? "text-center" : ""} ${className}`}>
    <Reveal delay={0.08}>
      <h2
        className="display mx-auto max-w-5xl text-4xl tracking-tight sm:text-5xl md:text-6xl lg:text-[68px] min-[1440px]:text-h2-fluid"
        style={{ textWrap: "balance" }}
      >
        <span className="block">{titleBase}</span>
        <AccentUnderline block className="text-accent italic">
          {titleAccent}
        </AccentUnderline>
      </h2>
    </Reveal>
  </div>
);
