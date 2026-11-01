interface ProjectCaptionProps {
  title: string;
  featured: boolean;
  year: string;
  tags: string;
  /** `bento` = overlay caption on the bento grid; `card` = caption below a card. */
  variant?: "bento" | "card";
}

// Shared featured-dot + title + "year — tags" block used by BentoCard and
// ProjectCard. Only the title size and meta styling differ between the two.
export const ProjectCaption = ({
  title,
  featured,
  year,
  tags,
  variant = "card",
}: ProjectCaptionProps) => (
  <>
    <div className="mb-1 flex items-center gap-2">
      <span
        className={`h-2.5 w-2.5 rounded-full ${featured ? "bg-accent" : "bg-fg/70"}`}
      />
      <h3
        className={`font-semibold tracking-tight ${
          variant === "bento"
            ? "text-[18px] md:text-[22px]"
            : "text-[20px] md:text-[22px]"
        } ${featured ? "text-accent" : "text-fg"}`}
      >
        {title}
      </h3>
    </div>
    <div
      className={
        variant === "bento"
          ? "tag-mono pl-4.5 text-fg/70 uppercase"
          : "pl-4.5 text-[13px] text-fg/55"
      }
    >
      {year}
      {tags && ` — ${tags}`}
    </div>
  </>
);
