// DEV SAMPLE. Rendered only when NODE_ENV === "development" and the real list
// in messages is empty, so the layout can be reviewed. Never real people.
export interface Word {
  quote: string;
  names: string;
  place: string;
  date: string;
}

export const DEV_WORDS: Word[] = [
  {
    quote:
      "Placeholder quote for layout review, two lines long so wrapping can be checked.",
    names: "DEV SAMPLE A & B",
    place: "Placeholder venue",
    date: "2025-09-13",
  },
  {
    quote: "A shorter placeholder quote.",
    names: "DEV SAMPLE C & D",
    place: "Placeholder city",
    date: "2025-06-21",
  },
];
