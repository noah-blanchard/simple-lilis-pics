import Image from "next/image";
import { Link } from "@/i18n/navigation";

interface LogoProps {
  /** Tailwind height utility controlling the rendered size — width scales
   *  automatically via the image's intrinsic 3:2 aspect ratio. */
  className?: string;
}

// Brand mark. Shared by the Hero, ProjectGallery's top bar, the nav overlay,
// and the site-wide FloatingMenuButton context so it can't drift between them.
export const Logo = ({ className = "h-8" }: LogoProps) => (
  <Link href="/" className="inline-flex items-center">
    <Image
      src="/logo.webp"
      alt="Lili Photography"
      width={1536}
      height={1024}
      priority
      className={`w-auto ${className}`}
    />
  </Link>
);
