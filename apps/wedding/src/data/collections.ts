export type CollectionKey = "elopement" | "intimate" | "full_day";

export interface CollectionMeta {
  key: CollectionKey;
  /** "From" price in whole CAD; null until Lili confirms it (shows "On request"). */
  price: number | null;
}

export const COLLECTIONS: CollectionMeta[] = [
  { key: "elopement", price: null },
  { key: "intimate", price: null },
  { key: "full_day", price: null },
];
