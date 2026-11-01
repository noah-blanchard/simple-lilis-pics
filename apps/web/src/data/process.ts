import type { ProcessStepMeta } from "@/types";

// Text lives in messages under `process.steps.{n}`.
export const processSteps: ProcessStepMeta[] = [
  {
    n: "01",
    img: "/process-plan.png",
  },
  {
    n: "02",
    img: "/process-prepare.png",
  },
  {
    n: "03",
    img: "/process-shoot.png",
  },
  {
    n: "04",
    img: "/process-final.png",
  },
];
