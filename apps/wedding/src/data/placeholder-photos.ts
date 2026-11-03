import type { StaticImageData } from "next/image";
import landscape01 from "@/assets/placeholders/landscape-01.webp";
import portrait01 from "@/assets/placeholders/portrait-photo-01.webp";
import portrait02 from "@/assets/placeholders/portrait-photo-02.webp";
import portrait03 from "@/assets/placeholders/portrait-photo-03.webp";
import portrait04 from "@/assets/placeholders/portrait-photo-04.webp";
import portrait05 from "@/assets/placeholders/portrait-photo-05.webp";

/** Lili's own portfolio photographs, standing in for wedding photographs
 *  until real ones exist (docs/plans/wedding/README.md §5). Alt text
 *  describes what is actually in each image. */
export interface PlaceholderPhoto {
  src: StaticImageData;
  orientation: "landscape" | "portrait";
  alt: { en: string; fr: string };
}

export const PLACEHOLDERS = {
  landscape01: {
    src: landscape01,
    orientation: "landscape",
    alt: {
      en: "A woman in profile looking down, hair lifted by the wind, in a sunlit alley",
      fr: "Une femme de profil, le regard baissé, les cheveux soulevés par le vent, dans une ruelle ensoleillée",
    },
  },
  portrait01: {
    src: portrait01,
    orientation: "portrait",
    alt: {
      en: "A woman in a camel coat and plaid scarf looking up, in a snowy lane",
      fr: "Une femme en manteau camel et foulard à carreaux, le regard levé, dans une ruelle enneigée",
    },
  },
  portrait02: {
    src: portrait02,
    orientation: "portrait",
    alt: {
      en: "A woman in a deep red dress seated on a bench as a pigeon flies past",
      fr: "Une femme en robe rouge profond assise sur un banc pendant qu’un pigeon passe en vol",
    },
  },
  portrait03: {
    src: portrait03,
    orientation: "portrait",
    alt: {
      en: "A woman in a leather jacket sitting on a dimly lit escalator",
      fr: "Une femme en veste de cuir assise sur un escalier mécanique faiblement éclairé",
    },
  },
  portrait04: {
    src: portrait04,
    orientation: "portrait",
    alt: {
      en: "A man carrying a guitar case walks through a steel ring in a city at night",
      fr: "Un homme portant un étui à guitare marche dans un anneau d’acier, en ville la nuit",
    },
  },
  portrait05: {
    src: portrait05,
    orientation: "portrait",
    alt: {
      en: "A man in a dark suit glancing back on a snowy street, a curl of smoke beside him",
      fr: "Un homme en costume sombre qui jette un regard en arrière dans une rue enneigée, une volute de fumée à côté de lui",
    },
  },
} satisfies Record<string, PlaceholderPhoto>;

export type PlaceholderKey = keyof typeof PLACEHOLDERS;

/** Where each placeholder is used. Swap keys here when real photos arrive. */
export const HERO_PHOTO: PlaceholderKey = "landscape01";
export const ABOUT_PORTRAIT: PlaceholderKey = "portrait05";
export const WORDS_PHOTOS: [PlaceholderKey, PlaceholderKey] = [
  "portrait03",
  "portrait04",
];
