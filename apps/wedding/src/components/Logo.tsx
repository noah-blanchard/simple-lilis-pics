import Image from "next/image";
import { Link } from "@/i18n/navigation";

interface LogoProps {
  alt: string;
  /** Tailwind height utility; width follows the image's 3:2 ratio. */
  className?: string;
}

// Adapted from apps/web: the brand mark, linking home. The invitation card
// follows it, so the default size is smaller than the portfolio hero's.
export const Logo = ({
  alt,
  className = "h-[clamp(3.5rem,8vw,7rem)]",
}: LogoProps) => (
  <Link href="/" className="inline-flex items-center">
    <Image
      src="/logo.webp"
      alt={alt}
      width={1536}
      height={1024}
      priority
      className={`w-auto ${className}`}
    />
  </Link>
);
