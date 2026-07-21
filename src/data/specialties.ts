import type { SpecialtyMeta } from "@/types";

// Order matches the reference grid. Text lives in messages/{locale}.json
// under `specialty.items.{id}`.
// `image` is a placeholder Unsplash photo per category — swap for real shoot
// photos later by editing the URLs below.
export const specialties: SpecialtyMeta[] = [
  {
    id: "landscape",
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "street",
    image:
      "https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "product",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "portrait",
    image:
      "https://images.unsplash.com/photo-1521119989659-a83eee488004?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "fashion",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "macro",
    image:
      "https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "event",
    image:
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "wildlife",
    image:
      "https://images.unsplash.com/photo-1474511320723-9a56873867b5?q=80&w=800&auto=format&fit=crop",
  },
];
