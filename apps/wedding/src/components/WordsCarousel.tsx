"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import type { Word } from "@/data/words.dev";
import { crossfadeTransition } from "@/lib/motion";
import { TextLink } from "./TextLink";

interface WordsCarouselProps {
  words: Word[];
  previous: string;
  next: string;
}

/** One quote at a time, cross-fading. No dots and no counter. */
export const WordsCarousel = ({
  words,
  previous,
  next,
}: WordsCarouselProps) => {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const word = words[index];
  const year = word.date.slice(0, 4);

  return (
    <div>
      <div aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.figure
            key={index}
            initial={{ opacity: 0, y: reduce ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={reduce ? { duration: 0 } : crossfadeTransition}
          >
            <blockquote
              className="display text-[clamp(30px,3.6vw,54px)] leading-[1.1]"
              style={{ textWrap: "balance" }}
            >
              {word.quote}
            </blockquote>
            <figcaption className="mt-6">
              <span className="text-fg">{word.names}</span>
              <span className="text-muted italic">
                {" "}
                {word.place}, {year}
              </span>
            </figcaption>
          </motion.figure>
        </AnimatePresence>
      </div>
      {words.length > 1 ? (
        <div className="mt-8 flex gap-8">
          <TextLink
            onClick={() =>
              setIndex((i) => (i - 1 + words.length) % words.length)
            }
          >
            {previous}
          </TextLink>
          <TextLink onClick={() => setIndex((i) => (i + 1) % words.length)}>
            {next}
          </TextLink>
        </div>
      ) : null}
    </div>
  );
};
