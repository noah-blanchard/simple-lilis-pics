import { Link } from "@/i18n/navigation";

interface LogoProps {
  className?: string;
}

// Brand mark (logotype — not translated). Shared by the Hero, ProjectGallery's
// top bar, and the site-wide FloatingMenuButton context.
export const Logo = ({ className = "" }: LogoProps) => (
  <Link href="/" className={`font-semibold italic tracking-tight ${className}`}>
    <span>Lilis</span>
    <span className="text-accent">.</span>
    <span>Pics</span>
  </Link>
);
