"use client";

import type { ResolvedProjectPhoto } from "@lili/core/types/db";
import { type ReactNode, useState } from "react";
import { storyRhythm } from "@/lib/story-layout";
import { DuskBand } from "./DuskBand";
import { StoryLightbox } from "./StoryLightbox";
import { StoryRows } from "./StoryRows";
import { Tone } from "./Tone";

interface StoryGalleryProps {
  photos: ResolvedProjectPhoto[];
  label: string;
  alt: string;
  /** Rendered inside the night band, after the photographs (the next story). */
  nightFooter?: ReactNode;
}

/** The story's photographs as a day: two thirds of the rows on paper, a
 *  static dusk band, then the last third on the table with flash-developed
 *  photos. Cuts at whole rows so none straddles the dusk. */
export const StoryGallery = ({
  photos,
  label,
  alt,
  nightFooter,
}: StoryGalleryProps) => {
  const [index, setIndex] = useState<number | null>(null);
  const rows = storyRhythm(photos);
  const cut = Math.ceil((rows.length * 2) / 3);
  const dayCount = rows.slice(0, cut).reduce((n, r) => n + r.photos.length, 0);
  const dayPhotos = photos.slice(0, dayCount);
  const nightPhotos = photos.slice(dayCount);

  return (
    <>
      <Tone tone="day" className="pb-16">
        <div className="container-site">
          <StoryRows
            photos={dayPhotos}
            offset={0}
            alt={alt}
            onOpen={setIndex}
          />
        </div>
      </Tone>
      <DuskBand />
      <Tone tone="night" className="pb-24">
        <div className="container-site">
          <StoryRows
            photos={nightPhotos}
            offset={dayCount}
            alt={alt}
            onOpen={setIndex}
            flash
          />
        </div>
        {nightFooter}
      </Tone>
      <StoryLightbox
        photos={photos}
        index={index}
        onIndexChange={setIndex}
        label={label}
        alt={alt}
      />
    </>
  );
};
