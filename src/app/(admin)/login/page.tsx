"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PillButton } from "@/components/PillButton";
import { TagLabel } from "@/components/TagLabel";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});
type LoginValues = z.infer<typeof schema>;

const EASE = [0.22, 1, 0.36, 1] as const;
const INFINITE = Number.POSITIVE_INFINITY;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.12 } },
};
const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

export default function LoginPage() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [authError, setAuthError] = useState<string | null>(null);
  const [focused, setFocused] = useState<"email" | "password" | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const emailReg = register("email");
  const passwordReg = register("password");

  const onSubmit = handleSubmit(async (values) => {
    setAuthError(null);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword(values);
    if (error) {
      setAuthError(error.message);
      return;
    }
    router.replace("/admin");
    router.refresh();
  });

  const fieldClass =
    "w-full rounded-2xl border border-line bg-panel2 px-5 py-4 text-[15px] text-fg placeholder:text-fg/40 outline-none";
  const focusBorder = { borderColor: "var(--accent)" };
  const labelClass = "tag-mono mb-2 block uppercase text-fg/70";
  const errorClass = "mt-2 text-[13px] text-red-400";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      {/* ── Card wrapper (entrance) ── */}
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9, ease: EASE }}
        className="relative w-full max-w-md"
      >
        {/* Thin animated neon border: a crisp rotating conic clipped to a
            1.5px frame, with a faint constant ring + one bright sweeping arc. */}
        <div className="relative overflow-hidden rounded-card p-[1.5px] shadow-[0_0_25px_-8px_rgba(74,124,255,0.4)]">
          <motion.div
            aria-hidden
            className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 aspect-square w-[160%]"
            style={{
              background:
                "conic-gradient(from 0deg, rgba(74,124,255,0.12), rgba(74,124,255,1) 25deg, rgba(200,220,255,0.9) 40deg, rgba(74,124,255,0.12) 70deg, rgba(74,124,255,0.12) 360deg)",
            }}
            animate={reduce ? undefined : { rotate: 360 }}
            transition={{ duration: 5, repeat: INFINITE, ease: "linear" }}
          />

          {/* Card surface — opaque, covers the center, leaving the 1.5px edge */}
          <div className="relative overflow-hidden rounded-card bg-panel p-8 shadow-2xl md:p-10">
            {/* Sheen sweeping across the card on mount */}
            {!reduce && (
              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 w-1/2 bg-linear-to-r from-transparent via-fg/5 to-transparent"
                initial={{ x: "-150%" }}
                animate={{ x: "250%" }}
                transition={{ duration: 1.4, ease: EASE, delay: 0.5 }}
              />
            )}

            <motion.div variants={container} initial="hidden" animate="show">
              <motion.div variants={item}>
                <TagLabel className="text-accent">private area</TagLabel>
              </motion.div>

              <motion.h1
                variants={item}
                className="mt-3 font-semibold text-[28px] tracking-tight"
              >
                <span>Lilis</span>
                <motion.span
                  className="text-accent"
                  animate={reduce ? undefined : { opacity: [1, 0.4, 1] }}
                  transition={{
                    duration: 2.4,
                    repeat: INFINITE,
                    ease: "easeInOut",
                  }}
                >
                  .
                </motion.span>
                <span>Pics</span>
                <span className="ml-2 font-normal text-fg/45">admin</span>
              </motion.h1>

              <motion.p
                variants={item}
                className="mt-2 mb-8 text-[14px] text-fg/55"
              >
                Sign in to manage the portfolio.
              </motion.p>

              <form onSubmit={onSubmit} noValidate>
                <motion.div variants={item} className="mb-5">
                  <label htmlFor="login-email" className={labelClass}>
                    Email
                  </label>
                  <div className="relative">
                    <motion.input
                      id="login-email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      aria-invalid={errors.email ? "true" : "false"}
                      className={fieldClass}
                      whileFocus={
                        reduce ? focusBorder : { scale: 1.01, ...focusBorder }
                      }
                      transition={{ duration: 0.25, ease: EASE }}
                      {...emailReg}
                      onFocus={() => setFocused("email")}
                      onBlur={(e) => {
                        emailReg.onBlur(e);
                        setFocused(null);
                      }}
                    />
                    <motion.span
                      aria-hidden
                      className="absolute right-5 bottom-0 left-5 h-px origin-left bg-accent"
                      initial={false}
                      animate={{ scaleX: focused === "email" ? 1 : 0 }}
                      transition={{ duration: 0.35, ease: EASE }}
                    />
                  </div>
                  {errors.email && (
                    <p className={errorClass}>{errors.email.message}</p>
                  )}
                </motion.div>

                <motion.div variants={item} className="mb-6">
                  <label htmlFor="login-password" className={labelClass}>
                    Password
                  </label>
                  <div className="relative">
                    <motion.input
                      id="login-password"
                      type="password"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      aria-invalid={errors.password ? "true" : "false"}
                      className={fieldClass}
                      whileFocus={
                        reduce ? focusBorder : { scale: 1.01, ...focusBorder }
                      }
                      transition={{ duration: 0.25, ease: EASE }}
                      {...passwordReg}
                      onFocus={() => setFocused("password")}
                      onBlur={(e) => {
                        passwordReg.onBlur(e);
                        setFocused(null);
                      }}
                    />
                    <motion.span
                      aria-hidden
                      className="absolute right-5 bottom-0 left-5 h-px origin-left bg-accent"
                      initial={false}
                      animate={{ scaleX: focused === "password" ? 1 : 0 }}
                      transition={{ duration: 0.35, ease: EASE }}
                    />
                  </div>
                  {errors.password && (
                    <p className={errorClass}>{errors.password.message}</p>
                  )}
                </motion.div>

                <AnimatePresence>
                  {authError && (
                    <motion.p
                      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                      animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.3, ease: EASE }}
                      className="overflow-hidden rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-[14px] text-red-300"
                    >
                      {authError}
                    </motion.p>
                  )}
                </AnimatePresence>

                <motion.div variants={item}>
                  <PillButton
                    type="submit"
                    variant="light"
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? "Signing in…" : "Sign in"}
                  </PillButton>
                </motion.div>
              </form>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Back to site */}
      <motion.a
        href="/"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        whileHover={{ color: "var(--fg)" }}
        className="absolute bottom-6 text-[13px] text-fg/45"
      >
        ← Back to site
      </motion.a>
    </main>
  );
}
