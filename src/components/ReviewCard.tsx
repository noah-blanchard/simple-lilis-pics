import Image from "next/image";
import type { Review } from "@/types";
import { IconQuote } from "./Icons";

interface ReviewCardProps {
  review: Review;
}

export const ReviewCard = ({ review }: ReviewCardProps) => (
  <div className="flex w-[300px] shrink-0 flex-col justify-between rounded-card bg-panel p-7 md:w-[380px] md:p-8">
    <IconQuote className="mb-6 h-9 w-9 text-white" />
    <p className="text-[15px] leading-relaxed text-white/85 md:text-[16px]">
      &ldquo;{review.quote}&rdquo;
    </p>
    <div className="mt-8 flex items-center gap-4 border-t border-line pt-6">
      <Image
        src={review.avatar}
        alt={review.name}
        width={48}
        height={48}
        className="h-12 w-12 rounded-full object-cover"
      />
      <div>
        <div className="font-semibold">{review.name}</div>
        <div className="text-[13px] text-white/55">{review.role}</div>
      </div>
    </div>
  </div>
);
