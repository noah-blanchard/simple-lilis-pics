"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { EASE } from "@/lib/motion";
import type { ResolvedLink, ResolvedSocialLink } from "@/types/db";
import { LinkCard } from "./LinkCard";
import { SocialLinks } from "./SocialLinks";

interface LinksPageContentProps {
  links: ResolvedLink[];
  socials: ResolvedSocialLink[];
  locale: Locale;
  description: string;
  emptyLabel: string;
  linksLabel: string;
  socialsLabel: string;
  opensNewTabLabel: string;
  backHomeLabel?: string;
  bannerImageUrl?: string | null;
  bannerFocalX?: number;
  bannerFocalY?: number;
  mode?: "public" | "editor";
  animateIntro?: boolean;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  listContent?: ReactNode;
  selectedSocialId?: string | null;
  draftSocialIds?: string[];
  onSelectSocial?: (id: string) => void;
}

export function LinksPageContent({
  links,
  socials,
  locale,
  description,
  emptyLabel,
  linksLabel,
  socialsLabel,
  opensNewTabLabel,
  backHomeLabel = "Back to the portfolio",
  bannerImageUrl = null,
  bannerFocalX = 50,
  bannerFocalY = 50,
  mode = "public",
  animateIntro = mode === "public",
  selectedId,
  onSelect,
  listContent,
  selectedSocialId,
  draftSocialIds,
  onSelectSocial,
}: LinksPageContentProps) {
  const reduce = useReducedMotion();
  const Root = mode === "public" ? "main" : "div";
  const enter = reduce ? { duration: 0.15 } : { duration: 0.65, ease: EASE };

  return (
    <Root className="min-h-svh bg-[radial-gradient(circle_at_top,var(--accent-soft),var(--bg)_58%)] text-fg md:flex md:items-start md:justify-center md:px-8 md:py-10">
      <motion.div
        initial={
          animateIntro ? { opacity: 0, scale: reduce ? 1 : 1.015 } : false
        }
        animate={{ opacity: 1, scale: 1 }}
        transition={enter}
        className="relative mx-auto min-h-svh w-full max-w-[500px] overflow-hidden bg-ink shadow-[0_28px_80px_rgb(23_23_23/0.12)] md:min-h-0 md:rounded-[36px]"
      >
        <motion.div
          initial={
            animateIntro ? { opacity: 0, scale: reduce ? 1 : 1.04 } : false
          }
          animate={{ opacity: 1, scale: 1 }}
          transition={enter}
          className="relative h-[clamp(220px,30svh,260px)] overflow-hidden bg-[linear-gradient(145deg,var(--accent-strong),var(--accent)_45%,var(--accent-soft))]"
        >
          {bannerImageUrl && (
            <div
              role="img"
              aria-label="Lilis Pics banner"
              className="absolute inset-0 bg-cover bg-no-repeat"
              style={{
                backgroundImage: `url(${JSON.stringify(bannerImageUrl)})`,
                backgroundPosition: `${bannerFocalX}% ${bannerFocalY}%`,
              }}
            />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_45%,rgb(23_23_23/0.42))]" />
        </motion.div>

        <section className="relative bg-[linear-gradient(180deg,var(--accent-soft)_0%,var(--bg)_180px)] px-5 pt-[72px] pb-12 sm:px-7">
          <motion.div
            initial={
              animateIntro
                ? {
                    opacity: 0,
                    y: reduce ? 0 : -18,
                    scale: reduce ? 1 : 0.84,
                  }
                : false
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={
              reduce
                ? { duration: 0.15 }
                : {
                    delay: 0.3,
                    type: "spring",
                    stiffness: 220,
                    damping: 18,
                  }
            }
            className="-top-[54px] -translate-x-1/2 absolute left-1/2 flex h-[108px] w-[108px] items-center justify-center rounded-full border-[7px] border-accent-soft bg-[#f8f6f2] shadow-[0_16px_38px_rgb(23_23_23/0.18)]"
          >
            <Image
              src="/logo.webp"
              alt="Lilis Pics"
              width={1536}
              height={1024}
              priority
              className="h-auto w-[82px] object-contain"
            />
          </motion.div>

          <motion.header
            initial={animateIntro ? { opacity: 0, y: reduce ? 0 : 10 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reduce ? 0.15 : 0.42,
              delay: reduce ? 0 : 0.48,
              ease: EASE,
            }}
            className={
              socials.length > 0 ? "mb-4 text-center" : "mb-7 text-center"
            }
          >
            <h1 className="display text-[34px] tracking-tight">Lili Liang</h1>
            <p className="mx-auto mt-2 max-w-[340px] text-[14px] text-fg/60 leading-relaxed">
              {description}
            </p>
          </motion.header>

          <SocialLinks
            socials={socials}
            label={socialsLabel}
            opensNewTabLabel={opensNewTabLabel}
            mode={mode}
            animateIntro={animateIntro}
            selectedId={selectedSocialId}
            draftIds={draftSocialIds}
            onSelect={onSelectSocial}
          />

          {listContent ??
            (links.length === 0 ? (
              <motion.p
                initial={
                  animateIntro ? { opacity: 0, y: reduce ? 0 : 12 } : false
                }
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  delay: reduce ? 0 : 0.62,
                  ease: EASE,
                }}
                className="rounded-[22px] border border-white/70 bg-white/65 px-5 py-7 text-center text-[14px] text-fg/55 shadow-[0_10px_30px_rgb(23_23_23/0.06)]"
              >
                {emptyLabel}
              </motion.p>
            ) : (
              <nav aria-label={linksLabel}>
                <motion.ul
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: {
                      transition: {
                        delayChildren: reduce ? 0 : 0.62,
                        staggerChildren: reduce ? 0 : 0.07,
                      },
                    },
                  }}
                  className="flex flex-col gap-3"
                >
                  {links.map((link) => (
                    <motion.li
                      key={link.id}
                      variants={{
                        hidden: {
                          opacity: 0,
                          y: reduce ? 0 : 14,
                          scale: reduce ? 1 : 0.985,
                        },
                        visible: { opacity: 1, y: 0, scale: 1 },
                      }}
                      transition={{
                        duration: reduce ? 0.15 : 0.4,
                        ease: EASE,
                      }}
                    >
                      <LinkCard
                        link={link}
                        locale={locale}
                        mode={mode}
                        opensNewTabLabel={opensNewTabLabel}
                        selected={selectedId === link.id}
                        onSelect={() => onSelect?.(link.id)}
                      />
                    </motion.li>
                  ))}
                </motion.ul>
              </nav>
            ))}

          <motion.div
            initial={animateIntro ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.35,
              delay: reduce ? 0 : 0.9,
              ease: EASE,
            }}
            className="mt-9 text-center"
          >
            {mode === "public" ? (
              <Link
                href="/"
                className="inline-flex min-h-11 items-center rounded-full px-4 text-[13px] text-fg/55 hover:text-accent-strong"
              >
                <span aria-hidden className="mr-2">
                  ←
                </span>
                {backHomeLabel}
              </Link>
            ) : (
              <span className="inline-flex min-h-11 items-center text-[13px] text-fg/55">
                <span aria-hidden className="mr-2">
                  ←
                </span>
                {backHomeLabel}
              </span>
            )}
          </motion.div>
        </section>
      </motion.div>
    </Root>
  );
}
