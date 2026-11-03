"use client";

import type { ResolvedProjectPhoto } from "@lili/core/types/db";
import { useTranslations } from "next-intl";
import { storyRhythm } from "@/lib/story-layout";
import { FlashPhoto } from "./FlashPhoto";
import { Photo, type PhotoRatio } from "./Photo";

interface StoryRowsProps {
  photos: ResolvedProjectPhoto[];
  /** Index of this list's first photo in the whole story (for the lightbox). */
  offset: number;
  alt: string;
  onOpen: (index: number) => void;
  /** Photos in these rows develop like a flash firing. */
  flash?: boolean;
}

/** The story's photographs in an automatic rhythm that follows orientation. */
export const StoryRows = ({
  photos,
  offset,
  alt,
  onOpen,
  flash = false,
}: StoryRowsProps) => {
  const t = useTranslations("stories.lightbox");
  const rows = storyRhythm(photos);
  let counter = offset;

  const cell = (
    photo: ResolvedProjectPhoto,
    ratio: PhotoRatio,
    sizes: string,
    delay = 0,
  ) => {
    const index = counter++;
    const props = { src: photo.img, alt, ratio, sizes };
    return (
      <button
        key={photo.id}
        type="button"
        onClick={() => onOpen(index)}
        aria-label={t("open", { n: index + 1 })}
        className="block w-full cursor-pointer"
      >
        {flash ? <FlashPhoto {...props} delay={delay} /> : <Photo {...props} />}
      </button>
    );
  };

  return (
    <div>
      {rows.map((row) => {
        const key = row.photos[0].id;
        if (row.kind === "full") {
          return (
            <div key={key} className="mt-4 md:mt-6">
              {cell(row.photos[0], "3/2", "(min-width: 1440px) 90vw, 100vw")}
            </div>
          );
        }
        if (row.kind === "pair") {
          const ratio: PhotoRatio =
            row.photos[0].orientation === "landscape" ? "3/2" : "4/5";
          return (
            <div
              key={key}
              className="mt-4 grid grid-cols-2 gap-4 md:mt-6 md:gap-6"
            >
              {cell(row.photos[0], ratio, "50vw")}
              {cell(row.photos[1], ratio, "50vw", 0.2)}
            </div>
          );
        }
        if (row.kind === "triptych") {
          return (
            <div
              key={key}
              className="mt-4 grid grid-cols-3 gap-3 md:mt-6 md:gap-6"
            >
              {cell(row.photos[0], "2/3", "33vw")}
              {cell(row.photos[1], "2/3", "33vw", 0.2)}
              {cell(row.photos[2], "2/3", "33vw", 0.4)}
            </div>
          );
        }
        return (
          <div key={key} className="mx-auto mt-4 max-w-[560px] md:mt-6">
            {cell(row.photos[0], "4/5", "(min-width: 768px) 560px, 100vw")}
          </div>
        );
      })}
    </div>
  );
};
