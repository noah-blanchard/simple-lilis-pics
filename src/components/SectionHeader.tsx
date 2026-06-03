import { Reveal } from "./Reveal";
import { TagLabel } from "./TagLabel";

interface SectionHeaderProps {
  tag: string;
  lines: string[];
  align?: "center" | "left";
  className?: string;
}

export const SectionHeader = ({
  tag,
  lines,
  align = "center",
  className = "",
}: SectionHeaderProps) => (
  <div className={`${align === "center" ? "text-center" : ""} ${className}`}>
    <Reveal>
      <div className="mb-5">
        <TagLabel>{tag}</TagLabel>
      </div>
    </Reveal>
    <Reveal delay={0.08}>
      <h2
        className="display mx-auto max-w-5xl text-4xl tracking-tight sm:text-5xl md:text-6xl lg:text-[68px]"
        style={{ textWrap: "balance" }}
      >
        {lines.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </h2>
    </Reveal>
  </div>
);
