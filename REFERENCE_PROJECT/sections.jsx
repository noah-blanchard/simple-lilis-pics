/* Lilis Pics — page sections */
const { motion: m, AnimatePresence: AP } = window.Motion || window.framerMotion;
const { useState, useEffect, useRef } = React;

/* ─────────────────────── HERO ─────────────────────── */
const Hero = () => {
  return (
    <section
      data-screen-label="01 Hero"
      className="relative min-h-[100svh] w-full overflow-hidden"
    >
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1515462277126-2dd0c162007a?w=2000&q=80&auto=format&fit=crop"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/30 to-ink/90"></div>
      </div>
      <div className="relative grain"></div>

      {/* Top nav */}
      <header className="relative z-20 flex items-center justify-between px-6 md:px-12 pt-8 anim-fade-down">
        <a href="#" className="text-[22px] tracking-tight italic font-semibold">
          <span>Lilis</span>
          <span className="text-accent">.</span>
          <span>Pics</span>
        </a>
        <button className="flex items-center gap-2 rounded-full bg-white text-ink px-5 py-3 text-[14px] font-medium hover:bg-accent transition-colors">
          <IconMenu className="w-5 h-5" />
          <span>MENU</span>
        </button>
      </header>

      {/* Hero content */}
      <div className="relative z-10 px-6 md:px-12 flex flex-col items-center justify-center min-h-[calc(100svh-100px)] text-center">
        <div className="absolute left-6 md:left-12 top-[42%] hidden md:block anim-fade d3">
          <TagLabel>BY LILI MARCHETTI</TagLabel>
        </div>
        <div className="absolute right-6 md:right-12 top-[42%] hidden md:block anim-fade d3">
          <TagLabel>PARIS, FRANCE</TagLabel>
        </div>

        <h1
          className="display-xl text-[44px] sm:text-6xl md:text-8xl lg:text-[120px] uppercase max-w-[1100px] anim-fade-up d1"
          style={{ textWrap: "balance" }}
        >
          <span className="block">Where light</span>
          <span className="block">becomes story</span>
        </h1>

        <p className="mt-8 text-white/75 text-[15px] md:text-[17px] max-w-[640px] leading-relaxed anim-fade-up d3">
          Documentary, portrait and editorial photography for brands and humans
          who want their stories told honestly — with mood, patience, and a
          careful eye for light.
        </p>

        <div className="mt-10 anim-fade-up d4">
          <PillButton variant="light">Get in Touch</PillButton>
        </div>
      </div>

      {/* mobile-only meta row */}
      <div className="relative z-10 md:hidden flex justify-between px-6 pb-8 -mt-4">
        <TagLabel>BY LILI MARCHETTI</TagLabel>
        <TagLabel>PARIS, FRANCE</TagLabel>
      </div>
    </section>
  );
};

/* ─────────────────────── MARQUEE STRIP ─────────────────────── */
const Marquee = () => {
  const items = [
    "Editorial",
    "Portrait",
    "Documentary",
    "Street",
    "Brand",
    "Wedding",
    "Travel",
    "Studio",
  ];
  const all = [...items, ...items, ...items, ...items];
  return (
    <div className="border-y border-line/60 py-6 overflow-hidden">
      <div className="marquee-track">
        {all.map((t, i) => (
          <span
            key={i}
            className="display text-3xl md:text-5xl text-white/15 uppercase tracking-tight flex items-center gap-12"
          >
            <span>{t}</span>
            <span className="w-2 h-2 rounded-full bg-accent/60"></span>
          </span>
        ))}
      </div>
    </div>
  );
};

/* ─────────────────────── ABOUT ─────────────────────── */
const About = () => {
  return (
    <section
      data-screen-label="02 About"
      className="px-6 md:px-12 py-24 md:py-32"
    >
      <SectionHeader
        tag="ABOUT US"
        lines={["Frames that speak", "louder than words."]}
      />
      <div className="mt-16 grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        <Reveal className="md:col-span-4">
          <RoundedImage
            ratio="aspect-[4/5]"
            src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=900&q=80&auto=format&fit=crop"
            alt="Portrait of a person in soft afternoon light"
          />
        </Reveal>
        <Reveal delay={0.1} className="md:col-span-4">
          <RoundedImage
            ratio="aspect-[4/5]"
            src="https://images.unsplash.com/photo-1521119989659-a83eee488004?w=900&q=80&auto=format&fit=crop"
            alt="Friends laying together on the ground"
          />
        </Reveal>
        <Reveal delay={0.2} className="md:col-span-4 flex flex-col justify-end">
          <p className="text-white/75 leading-relaxed text-[15px] md:text-[16px] max-w-[420px]">
            I&apos;ve been chasing light for twelve years — through quiet
            apartments, packed studios, foreign streets at dawn. The work I love
            most sits between stillness and feeling. Whether it&apos;s your
            face, your brand or your ordinary tuesday, I want it to look like
            itself, only honest.
          </p>
          <a
            href="#"
            className="mt-8 inline-flex items-center gap-2 text-white hover:text-accent transition-colors"
          >
            <span className="font-medium">Read more</span>
            <span aria-hidden>→</span>
          </a>
        </Reveal>
      </div>
    </section>
  );
};

/* ─────────────────────── SPECIALTY GRID ─────────────────────── */
const SPECIALTIES = [
  {
    id: "landscape",
    title: "Landscape",
    desc: "Showcasing nature, scenery and outdoor environments.",
  },
  {
    id: "street",
    title: "Street",
    desc: "Candid shots of everyday life and urban scenes.",
  },
  {
    id: "product",
    title: "Product",
    desc: "Commercial product work for advertisements and e-commerce.",
  },
  {
    id: "portrait",
    title: "Portrait",
    desc: "People's emotions, expressions and personal stories.",
  },
  {
    id: "fashion",
    title: "Fashion",
    desc: "Editorial concepts shot for magazines and brand books.",
  },
  {
    id: "macro",
    title: "Macro",
    desc: "Close-up work revealing detail too small to notice.",
  },
  {
    id: "event",
    title: "Event",
    desc: "Live coverage that captures real moments as they happen.",
  },
  {
    id: "wildlife",
    title: "Wildlife",
    desc: "Patient documentary work in natural habitats.",
  },
];

const Specialty = () => {
  const [active, setActive] = useState("street");
  return (
    <section
      data-screen-label="03 Specialty"
      className="px-6 md:px-12 py-24 md:py-32"
    >
      <SectionHeader
        tag="OUR SPECIALTY"
        lines={["Crafted for creators,", "built for impact."]}
      />
      <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-5">
        {SPECIALTIES.map((s, i) => {
          const isActive = s.id === active;
          return (
            <m.button
              key={s.id}
              onClick={() => setActive(s.id)}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.6,
                delay: (i % 4) * 0.06,
                ease: [0.22, 1, 0.36, 1],
              }}
              animate={
                isActive
                  ? { scale: 1.04, rotate: -1.5 }
                  : { scale: 1, rotate: 0 }
              }
              whileHover={{ y: -4 }}
              className={`text-left p-7 rounded-card aspect-square flex flex-col justify-between transition-colors duration-300 ${
                isActive
                  ? "bg-accent text-ink"
                  : "bg-panel hover:bg-panel2 text-white"
              }`}
            >
              <div className="flex justify-end">
                <CatIcon kind={s.id} className="w-9 h-9" />
              </div>
              <div>
                <div className="text-2xl md:text-[28px] font-semibold tracking-tight mb-2">
                  {s.title}
                </div>
                <p
                  className={`text-[13px] leading-snug ${isActive ? "text-ink/70" : "text-white/55"}`}
                >
                  {s.desc}
                </p>
              </div>
            </m.button>
          );
        })}
      </div>
    </section>
  );
};

/* ─────────────────────── PORTFOLIO GRID ─────────────────────── */
const PROJECTS = [
  {
    id: 1,
    title: "Faces of Grace",
    year: "2025",
    tags: "Portrait, Studio",
    img: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=1200&q=80&auto=format&fit=crop",
    featured: false,
  },
  {
    id: 2,
    title: "Family Ties",
    year: "2025",
    tags: "People, Moments",
    img: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1200&q=80&auto=format&fit=crop",
    featured: true,
  },
  {
    id: 3,
    title: "Roots & Wings",
    year: "2025",
    tags: "Sports, Events",
    img: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1200&q=80&auto=format&fit=crop",
    featured: false,
  },
  {
    id: 4,
    title: "Northbound",
    year: "2024",
    tags: "Travel, Landscape",
    img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80&auto=format&fit=crop",
    featured: false,
  },
  {
    id: 5,
    title: "Quiet Hours",
    year: "2024",
    tags: "Editorial, Mood",
    img: "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=1200&q=80&auto=format&fit=crop",
    featured: true,
  },
  {
    id: 6,
    title: "Concrete Days",
    year: "2024",
    tags: "Street, Urban",
    img: "https://images.unsplash.com/photo-1502635385003-ee1e6a1a742d?w=1200&q=80&auto=format&fit=crop",
    featured: false,
  },
];

const ProjectCard = ({ p, index }) => (
  <m.article
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{
      duration: 0.8,
      delay: (index % 3) * 0.1,
      ease: [0.22, 1, 0.36, 1],
    }}
    className="group"
  >
    <RoundedImage
      src={p.img}
      alt={p.title}
      ratio={p.featured ? "aspect-[4/5]" : "aspect-[4/5]"}
      className="mb-5"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 -translate-y-2 group-hover:translate-y-0 transition-all duration-500">
        <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white text-ink">
          <IconArrow className="w-5 h-5" />
        </span>
      </div>
    </RoundedImage>
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`w-2.5 h-2.5 rounded-full ${p.featured ? "bg-accent" : "bg-white/70"}`}
          ></span>
          <h3
            className={`text-[20px] md:text-[22px] font-semibold tracking-tight ${p.featured ? "text-accent" : "text-white"}`}
          >
            {p.title}
          </h3>
        </div>
        <div className="text-[13px] text-white/55 pl-[18px]">
          {p.year} — {p.tags}
        </div>
      </div>
      <a
        href="#"
        className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full border border-line text-white/80 hover:bg-white hover:text-ink transition-colors"
      >
        <IconArrow className="w-4 h-4" />
      </a>
    </div>
  </m.article>
);

const Portfolio = () => (
  <section
    data-screen-label="04 Portfolio"
    className="px-6 md:px-12 py-24 md:py-32"
  >
    <Reveal>
      <div className="flex items-end justify-between flex-wrap gap-6 mb-12">
        <div>
          <TagLabel>SELECTED WORK</TagLabel>
          <h2
            className="display text-4xl md:text-6xl mt-3"
            style={{ textWrap: "balance" }}
          >
            Recent projects.
          </h2>
        </div>
        <a
          href="#"
          className="inline-flex items-center gap-2 text-white/80 hover:text-white"
        >
          <span>View all</span>
          <span aria-hidden>→</span>
        </a>
      </div>
    </Reveal>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
      {PROJECTS.map((p, i) => (
        <ProjectCard key={p.id} p={p} index={i} />
      ))}
    </div>
  </section>
);

/* ─────────────────────── HOW WE WORK ─────────────────────── */
const PROCESS_STEPS = [
  {
    n: "01",
    title: "Research Phase",
    body: "We start by understanding you — the brand, the people, the mood you're chasing.",
    bullets: [
      "Discovery call and creative brief",
      "Reference gathering and tone alignment",
      "Production scope and timeline planning",
    ],
    img: "https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?w=1200&q=80&auto=format&fit=crop",
  },
  {
    n: "02",
    title: "Creative Direction",
    body: "We craft a visual concept that reflects your vision and elevates your story.",
    bullets: [
      "Shot concepts and visual themes",
      "Location scouting, props and talent",
      "Moodboards and shot lists for alignment",
    ],
    img: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1200&q=80&auto=format&fit=crop",
  },
  {
    n: "03",
    title: "Production Day",
    body: "On set, we move with care — calm, prepared, and ready for the unexpected.",
    bullets: [
      "Full lighting and gear setup",
      "Direction for talent on set",
      "Live tethered review of every frame",
    ],
    img: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1200&q=80&auto=format&fit=crop",
  },
  {
    n: "04",
    title: "Delivery & Edit",
    body: "Color, retouch, deliver. Cleanly named, web and print ready, with revisions baked in.",
    bullets: [
      "Color grading and retouch passes",
      "Two revision rounds included",
      "Web + print exports + raw archive",
    ],
    img: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=1200&q=80&auto=format&fit=crop",
  },
];

const ProcessRow = ({ step, open, onToggle }) => (
  <m.div
    layout
    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    className={`rounded-card overflow-hidden ${open ? "bg-panel" : "bg-panel/60"}`}
  >
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between gap-6 px-6 md:px-8 py-6 text-left"
    >
      <div className="flex items-center gap-5 md:gap-7 min-w-0">
        <span className="shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent text-ink font-semibold text-[15px]">
          {step.n}
        </span>
        <span className="text-2xl md:text-3xl font-semibold tracking-tight truncate">
          {step.title}
        </span>
      </div>
      <span className="shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-full bg-panel2 text-white">
        {open ? (
          <IconMinus className="w-5 h-5" />
        ) : (
          <IconPlus className="w-5 h-5" />
        )}
      </span>
    </button>
    <AP initial={false}>
      {open && (
        <m.div
          key="content"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 px-6 md:px-8 pb-8">
            <div className="md:col-span-5 md:pl-[68px] flex flex-col justify-between">
              <p className="text-white/80 text-[15px] md:text-[16px] leading-relaxed max-w-[420px]">
                {step.body}
              </p>
              <ul className="mt-6 space-y-2 text-[14px] text-white/65">
                {step.bullets.map((b, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="text-accent">•</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:col-span-7">
              <RoundedImage
                src={step.img}
                alt={step.title}
                ratio="aspect-[16/9]"
              />
            </div>
          </div>
        </m.div>
      )}
    </AP>
  </m.div>
);

const Process = () => {
  const [openId, setOpenId] = useState("02");
  return (
    <section
      data-screen-label="05 Process"
      className="px-6 md:px-12 py-24 md:py-32"
    >
      <SectionHeader tag="HOW WE WORK" lines={["Your vision,", "our craft."]} />
      <div className="mt-14 max-w-[1100px] mx-auto space-y-4">
        {PROCESS_STEPS.map((s) => (
          <ProcessRow
            key={s.n}
            step={s}
            open={openId === s.n}
            onToggle={() => setOpenId(openId === s.n ? null : s.n)}
          />
        ))}
      </div>
    </section>
  );
};

/* ─────────────────────── PRICING ─────────────────────── */
const PLANS = [
  {
    id: "basic",
    name: "Basic Session",
    blurb: "Perfect for quick portrait sessions or headshots.",
    price: "150",
    unit: "/Session",
    highlighted: false,
    includes: [
      "1-Hour Photo Session",
      "15 Edited Photos",
      "Online Gallery Access",
      "1 Outfit Change",
      "Basic Retouching",
    ],
  },
  {
    id: "premium",
    name: "Premium Package",
    blurb: "Ideal for couples, family sessions or branding shoots.",
    price: "350",
    unit: "/Session",
    highlighted: true,
    includes: [
      "2-Hour Photo Session",
      "40 Edited Photos",
      "Online Gallery Access",
      "3 Outfit Changes",
      "Advanced Retouching",
    ],
  },
  {
    id: "editorial",
    name: "Editorial Day",
    blurb: "Full creative production for brands and editorial.",
    price: "1200",
    unit: "/Day",
    highlighted: false,
    includes: [
      "Full Day Shoot",
      "80+ Edited Photos",
      "Creative Direction",
      "Location Scouting",
      "Commercial License",
    ],
  },
];

const PriceCard = ({ plan, index }) => (
  <m.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.8, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
    className={`rounded-card overflow-hidden grid grid-cols-1 md:grid-cols-2 ${plan.highlighted ? "bg-accent text-ink" : "bg-panel text-white"}`}
  >
    <div className="p-8 md:p-10">
      <h3 className="text-2xl md:text-3xl font-semibold tracking-tight">
        {plan.name}
      </h3>
      <p
        className={`mt-3 text-[14px] leading-snug ${plan.highlighted ? "text-ink/70" : "text-white/55"} max-w-[260px]`}
      >
        {plan.blurb}
      </p>
      <div className="mt-10 flex items-baseline gap-2">
        <span className="display text-5xl md:text-6xl">${plan.price}</span>
        <span
          className={`text-[14px] ${plan.highlighted ? "text-ink/60" : "text-white/50"}`}
        >
          {plan.unit}
        </span>
      </div>
      <PillButton
        variant={plan.highlighted ? "dark" : "accent"}
        className="mt-8 w-full"
      >
        Get in Touch
      </PillButton>
    </div>
    <div
      className={`p-8 md:p-10 ${plan.highlighted ? "bg-ink text-white" : "bg-panel2"}`}
    >
      <div className="text-[15px] font-medium mb-5">Whats included:</div>
      <ul className="space-y-3">
        {plan.includes.map((i, idx) => (
          <li key={idx} className="flex items-center gap-3 text-[15px]">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-accent text-ink">
              <IconCheck className="w-3.5 h-3.5" />
            </span>
            <span>{i}</span>
          </li>
        ))}
      </ul>
    </div>
  </m.div>
);

const Pricing = () => (
  <section
    data-screen-label="06 Pricing"
    className="px-6 md:px-12 py-24 md:py-32"
  >
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 mb-14 items-end">
      <Reveal className="lg:col-span-5">
        <TagLabel>PRICING PLAN</TagLabel>
        <h2
          className="display text-4xl md:text-5xl lg:text-6xl mt-4"
          style={{ textWrap: "balance" }}
        >
          Choose a plan that fits your vision.
        </h2>
      </Reveal>
      <Reveal
        delay={0.1}
        className="lg:col-span-7 lg:pl-10 text-white/65 text-[15px] leading-relaxed max-w-[520px]"
      >
        Transparent pricing for every kind of shoot. Need something custom? Tell
        me what you have in mind and I&apos;ll put a proposal together within 48
        hours.
      </Reveal>
    </div>
    <div className="space-y-6">
      {PLANS.map((p, i) => (
        <PriceCard key={p.id} plan={p} index={i} />
      ))}
    </div>
  </section>
);

/* ─────────────────────── TESTIMONIALS ─────────────────────── */
const REVIEWS = [
  {
    name: "Cody Fisher",
    role: "Founder of BlueAI",
    quote:
      "I'm still in awe of how stunning my photos turned out. Lili truly knows how to make you feel comfortable in front of the camera.",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80&auto=format&fit=crop",
  },
  {
    name: "Savannah Nguyen",
    role: "Founder of Ayobisa",
    quote:
      "From the moment we walked into Lili's studio, we knew we were in good hands. The whole shoot felt effortless.",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80&auto=format&fit=crop",
  },
  {
    name: "Wade Warren",
    role: "Founder of Lagoon",
    quote:
      "Booked Lili for our graduation portraits — completely blown away. She directed every pose and made sure we looked our best.",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80&auto=format&fit=crop",
  },
  {
    name: "Floyd Miles",
    role: "Founder of Ocean",
    quote:
      "Lili made our maternity shoot feel so special. The photos are quiet and tender — exactly what we hoped for.",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80&auto=format&fit=crop",
  },
  {
    name: "Jenny Wilson",
    role: "Creative Director",
    quote:
      "Our brand needed a photographer who could move fast without losing taste. Lili was that and more.",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80&auto=format&fit=crop",
  },
];

const ReviewCard = ({ r }) => (
  <div className="shrink-0 w-[300px] md:w-[380px] bg-panel rounded-card p-7 md:p-8 flex flex-col justify-between">
    <IconQuote className="w-9 h-9 text-white mb-6" />
    <p className="text-white/85 leading-relaxed text-[15px] md:text-[16px]">
      &ldquo;{r.quote}&rdquo;
    </p>
    <div className="mt-8 flex items-center gap-4 pt-6 border-t border-line">
      <img
        src={r.avatar}
        alt={r.name}
        className="w-12 h-12 rounded-full object-cover"
      />
      <div>
        <div className="font-semibold">{r.name}</div>
        <div className="text-[13px] text-white/55">{r.role}</div>
      </div>
    </div>
  </div>
);

const Testimonials = () => {
  const trackRef = useRef(null);
  return (
    <section
      data-screen-label="07 Testimonials"
      className="py-24 md:py-32 overflow-hidden"
    >
      <SectionHeader
        tag="TESTIMONIAL"
        lines={["What our clients", "are saying."]}
      />
      <Reveal delay={0.1}>
        <div
          ref={trackRef}
          className="mt-14 flex gap-5 overflow-x-auto no-scrollbar px-6 md:px-12 pb-4 snap-x snap-mandatory"
        >
          {REVIEWS.map((r, i) => (
            <div key={i} className="snap-start">
              <ReviewCard r={r} />
            </div>
          ))}
          <div className="shrink-0 w-6"></div>
        </div>
      </Reveal>
      <div className="px-6 md:px-12 mt-8 flex items-center gap-3">
        <button
          onClick={() =>
            trackRef.current?.scrollBy({ left: -400, behavior: "smooth" })
          }
          className="w-12 h-12 rounded-full border border-line hover:bg-white hover:text-ink transition-colors flex items-center justify-center"
          aria-label="Previous"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <button
          onClick={() =>
            trackRef.current?.scrollBy({ left: 400, behavior: "smooth" })
          }
          className="w-12 h-12 rounded-full border border-line hover:bg-white hover:text-ink transition-colors flex items-center justify-center"
          aria-label="Next"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </section>
  );
};

/* ─────────────────────── CTA + FOOTER ─────────────────────── */
const Footer = () => (
  <footer
    data-screen-label="08 Footer"
    className="relative px-6 md:px-12 pt-24 md:pt-32 pb-10 overflow-hidden"
  >
    {/* big CTA */}
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
      <Reveal className="lg:col-span-7">
        <h2
          className="display text-3xl md:text-5xl lg:text-[56px] tracking-tight"
          style={{ textWrap: "balance" }}
        >
          <span className="text-white">
            Capturing brilliance in every flash
          </span>
          <span className="text-white/40">
            {" "}
            — where moments turn timeless and stories shine bright.
          </span>
        </h2>
      </Reveal>
      <Reveal delay={0.1} className="lg:col-span-5 lg:flex lg:justify-end">
        <PillButton variant="light">Get in Touch</PillButton>
      </Reveal>
    </div>

    {/* photo + nav row */}
    <div className="mt-20 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-6 items-start">
      <div className="md:col-span-3 space-y-2">
        <div className="tag-mono uppercase text-white/35 mb-4">SITEMAP</div>
        {["About", "Portfolio", "Journal", "Contact", "Pricing"].map((n, i) => (
          <a
            key={i}
            href="#"
            className="block text-[15px] text-white/80 hover:text-accent uppercase tracking-wide"
          >
            {n}
          </a>
        ))}
      </div>
      <div className="md:col-span-6 grid grid-cols-2 gap-5">
        <RoundedImage
          src="https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=900&q=80&auto=format&fit=crop"
          alt=""
          ratio="aspect-[4/5]"
        />
        <RoundedImage
          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&q=80&auto=format&fit=crop"
          alt=""
          ratio="aspect-[4/5]"
        />
      </div>
      <div className="md:col-span-3 space-y-2 md:text-right">
        <div className="tag-mono uppercase text-white/35 mb-4">DETAILS</div>
        {["Portfolio Details", "Journal", "License", "Changelog", "404"].map(
          (n, i) => (
            <a
              key={i}
              href="#"
              className="block text-[15px] text-white/80 hover:text-accent uppercase tracking-wide"
            >
              {n}
            </a>
          ),
        )}
      </div>
    </div>

    {/* bottom bar */}
    <div className="mt-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pt-8 border-t border-line">
      <div className="text-[14px] text-white/55">
        © 2026 Lilis Pics. Site by Lili Marchetti.
      </div>
      <div className="flex gap-3">
        {["Instagram", "Are.na", "Twitter", "YouTube"].map((s) => (
          <a
            key={s}
            href="#"
            className="px-5 py-2.5 rounded-full bg-panel text-white/80 text-[13px] hover:bg-white hover:text-ink transition-colors"
          >
            {s}
          </a>
        ))}
      </div>
    </div>

    {/* watermark text */}
    <div className="pointer-events-none select-none mt-16 md:mt-24 overflow-hidden">
      <div className="wm-text text-[20vw] md:text-[18vw] whitespace-nowrap text-center">
        LILIS·PICS
      </div>
    </div>
  </footer>
);

/* expose */
Object.assign(window, {
  Hero,
  Marquee,
  About,
  Specialty,
  Portfolio,
  Process,
  Pricing,
  Testimonials,
  Footer,
});
