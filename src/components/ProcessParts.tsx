import type { ProcessStep } from "@/types";

/** Number badge + step title — shared by the desktop stacking card
 *  (ProcessCard) and the mobile accordion row (ProcessRow). */
export const ProcessBadgeTitle = ({ step }: { step: ProcessStep }) => (
  <>
    <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent font-semibold text-[15px] text-on-accent">
      {step.n}
    </span>
    <span className="truncate font-semibold text-2xl tracking-tight md:text-3xl">
      {step.title}
    </span>
  </>
);

/** Body paragraph + bullet list — shared. `maxW` tunes the paragraph width to
 *  each layout (card body vs accordion row). */
export const ProcessBody = ({
  step,
  maxW = "max-w-[460px]",
}: {
  step: ProcessStep;
  maxW?: string;
}) => (
  <>
    <p
      className={`${maxW} text-[15px] text-fg/80 leading-relaxed md:text-[16px]`}
    >
      {step.body}
    </p>
    <ul className="mt-6 space-y-2 text-[14px] text-fg/65">
      {step.bullets.map((bullet) => (
        <li key={bullet} className="flex gap-3">
          <span className="text-accent">•</span>
          <span>{bullet}</span>
        </li>
      ))}
    </ul>
  </>
);
