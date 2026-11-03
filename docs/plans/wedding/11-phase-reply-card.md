# Phase 11: Reply card

> Read [`README.md`](README.md) first. This phase assumes its golden rules.
> **Write the migration; never run it.**

## Goal

Couples can send a **reply card**, which is the wedding inquiry form. The submission:

- is saved to a new `wedding_inquiries` table;
- sends Lili a best-effort email;
- appears in a new admin inbox.

On success the card is **sealed**: it slides into an envelope, the flap closes, the wax seal
presses, and a cyanotype postmark stamps it. The card lives at the end of the home page and on
`/rsvp`.

**Out of scope:** rate limiting (none exists in the repository, D19), payments, calendars, and auto-replies to couples.

## Preconditions

- [ ] Phase 08 is committed (phase 10 may or may not be).

## Read first

- [`02-design-decisions.md`](02-design-decisions.md) D6, D12, D19, §5 (Envelope), §7 (Seal the reply)
- The `reply` namespace of [`04-copy-deck.md`](04-copy-deck.md), and §5 there (email and admin copy)
- `supabase/migrations/0006_contact_messages.sql`, `0009_contact_message_read.sql`
- `packages/core/src/handlers/{contact,contact-by-id}.ts`, `packages/core/src/api/{schemas,response,validate,client}.ts`
- `packages/core/src/mail/{resend,templates}.ts`
- `apps/web/src/components/{ContactForm,ContactSuccess}.tsx`, `apps/web/src/components/rate/ThankYouLetter.tsx` (the flap)
- `apps/admin/src/app/admin/messages/page.tsx`, `apps/admin/src/lib/admin/sections.tsx`, `apps/admin/src/app/api/contact/**`
- `docs/api-reference.md`, `docs/database-and-storage.md`, `docs/admin-guide.md`

---

## Part A: Migration `supabase/migrations/0016_wedding_inquiries.sql`

```sql
-- 0016 · Reply cards from wedding.lilispics.com.
-- Private visitor submissions, like contact_messages: no public read, no
-- insert/update/delete policy. The only writer is POST /api/inquiry on the
-- wedding app through the service_role client (bypasses RLS).
-- See docs/plans/wedding/02-design-decisions.md (D12).

create table if not exists public.wedding_inquiries (
  id           uuid primary key default gen_random_uuid(),
  names        text not null check (char_length(names) between 1 and 200),
  email        text not null check (char_length(email) <= 320),
  wedding_date date,
  date_unset   boolean not null default false,
  venue        text not null check (char_length(venue) between 1 and 200),
  guests       text check (guests in ('under_20', '20_60', '60_120', 'over_120')),
  collection   text check (collection in ('elopement', 'intimate', 'full_day', 'unsure')),
  budget       text check (budget in ('under_3000', '3000_4500', '4500_6000', 'over_6000', 'unsure')),
  heard_from   text not null default '' check (char_length(heard_from) <= 200),
  message      text not null default '' check (char_length(message) <= 5000),
  locale       text not null default 'en' check (locale in ('en', 'fr')),
  consent_at   timestamptz not null,
  created_at   timestamptz not null default now(),
  read_at      timestamptz,
  constraint wedding_inquiries_date_or_unset check (wedding_date is not null or date_unset)
);

create index if not exists wedding_inquiries_created_at_idx
  on public.wedding_inquiries (created_at desc);
create index if not exists wedding_inquiries_unread_idx
  on public.wedding_inquiries (created_at desc) where read_at is null;

alter table public.wedding_inquiries enable row level security;

drop policy if exists "auth read wedding_inquiries" on public.wedding_inquiries;
create policy "auth read wedding_inquiries" on public.wedding_inquiries
  for select using (auth.role() = 'authenticated');
```

## Part B: Core

### B1. `packages/core/src/api/schemas.ts`

```ts
export const GUEST_RANGES = ["under_20", "20_60", "60_120", "over_120"] as const;
export const BUDGET_RANGES = ["under_3000", "3000_4500", "4500_6000", "over_6000", "unsure"] as const;
export const INQUIRY_COLLECTIONS = [...WEDDING_TYPES, "unsure"] as const;

/** Submissions faster than this are treated as bots (D19). */
export const MIN_INQUIRY_FILL_MS = 3000;

/** POST /api/inquiry (wedding app, public). */
export const weddingInquirySchema = z
  .object({
    names: z.string().trim().min(1).max(200),
    email: z.string().trim().email().max(320),
    wedding_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
    date_unset: z.boolean(),
    venue: z.string().trim().min(1).max(200),
    guests: z.enum(GUEST_RANGES).nullable(),
    collection: z.enum(INQUIRY_COLLECTIONS).nullable(),
    budget: z.enum(BUDGET_RANGES).nullable(),
    heard_from: z.string().trim().max(200).optional().default(""),
    message: z.string().trim().max(5000).optional().default(""),
    consent: z.literal(true),
    locale: z.enum(["en", "fr"]),
    company: z.string().max(200).optional().default(""), // honeypot
    started_at: z.number().int().nonnegative(), // ms epoch when the card was shown
  })
  .refine((d) => d.wedding_date !== null || d.date_unset, { path: ["wedding_date"], message: "A date or date_unset is required" });

export type WeddingInquiryInput = z.infer<typeof weddingInquirySchema>;

export const weddingInquiryUpdateSchema = z.object({ read: z.boolean() });
```

`WEDDING_TYPES` comes from phase 09. If phase 09 is not merged yet, stop. The README order guarantees
it, so this should not happen.

### B2. `packages/core/src/types/db.ts`

Add `WeddingInquiryRow`, mirroring the table:

- `wedding_date: string | null`;
- the enums typed from the constants above;
- `consent_at: string`, `created_at: string`, `read_at: string | null`.

### B3. Mail

**`packages/core/src/mail/templates.ts`**: add `weddingInquiryNotificationHtml(row: WeddingInquiryRow)`.

- Same table layout, inline styles, cognac button and Toronto timestamp as `contactNotificationHtml`.
- Rows: names, email, date (or "Not set yet"), venue, guests, collection, budget, heard from, locale, and the message.
- Map the enum values to the **English** labels from the copy deck, because the email goes to Lili.
- Escape every value with `escapeHtml`.
- Footer: "Sent from the reply card at wedding.lilispics.com".

**`packages/core/src/mail/resend.ts`**: add `sendWeddingInquiryNotification(row: WeddingInquiryRow)`.

- Same configuration and errors as `sendContactNotification`.
- Subject: `New wedding inquiry from ${row.names}, Lilis Pics`.
- `replyTo: row.email`.

### B4. Handlers

**`packages/core/src/handlers/wedding-inquiries.ts`** (`import "server-only"`):

```ts
/** POST /api/inquiry, public on the wedding app. The DB insert is the source of truth; email is best effort. */
export async function submitWeddingInquiry(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return apiError("INVALID_JSON", "Request body must be JSON", 400); }
  const parsed = validate(weddingInquirySchema, body);
  if (!parsed.ok) return parsed.response;
  const { company, started_at, consent: _consent, ...fields } = parsed.data;

  // Honeypot or a card filled faster than a person can: pretend success so bots don't learn.
  if (company || Date.now() - started_at < MIN_INQUIRY_FILL_MS) return apiSuccess({ id: "ok" }, { status: 201 });

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("wedding_inquiries")
    .insert({ ...fields, wedding_date: fields.date_unset ? null : fields.wedding_date, consent_at: new Date().toISOString() })
    .select("*")
    .single();
  if (error) return apiError("DB_INSERT_FAILED", error.message, 500);

  try { await sendWeddingInquiryNotification(data as WeddingInquiryRow); }
  catch (err) { console.error("[wedding-inquiry] notification email failed:", err); }

  // The public endpoint returns only the id; the row stays private.
  return apiSuccess({ id: (data as WeddingInquiryRow).id }, { status: 201 });
}

/** GET /api/wedding-inquiries, admin only. */
export const listWeddingInquiries = withAuth(async () => { /* same as listContactMessages, table wedding_inquiries */ });
```

**`packages/core/src/handlers/wedding-inquiry-by-id.ts`**: `updateWeddingInquiry` (PATCH, `{ read }` →
`read_at`) and `deleteWeddingInquiry` (DELETE). Copy `contact-by-id.ts` and change the table and the schema.

### B5. Route shims

| File | Content |
| --- | --- |
| `apps/wedding/src/app/api/inquiry/route.ts` | `export const POST = submitWeddingInquiry;` |
| `apps/admin/src/app/api/wedding-inquiries/route.ts` | `export const GET = listWeddingInquiries;` |
| `apps/admin/src/app/api/wedding-inquiries/[id]/route.ts` | `export const PATCH = updateWeddingInquiry; export const DELETE = deleteWeddingInquiry;` |

Copy any route segment config the contact routes declare (read them first).

### B6. Wedding environment

Add these to `apps/wedding/.env.example`, all **runtime only** and never build arguments:

```text
# Server secrets (runtime only, never Docker build args)
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
CONTACT_TO_EMAIL=hello@lilispics.com
CONTACT_FROM_EMAIL=
```

Match the comment style of `apps/web/.env.example`. Read the file; do not copy values.

## Part C: The form (`apps/wedding/src/components/ReplyCard.tsx`, client)

Model it on `apps/web/src/components/ContactForm.tsx`: React Hook Form with `zodResolver`, a
client schema with translated messages, the honeypot, and `apiFetch`.

- **Client schema.** Use the same shape as `weddingInquirySchema`, minus `locale`, `company` and `started_at`, with `t("errors.*")` messages. Form values are strings; selects use `""` for "not chosen", which becomes `null` on submit.
- **`startedAt`** is `useRef(Date.now())` and goes into the body as `started_at`. `locale` comes from `useLocale()`.
- **Layout**, inside `<Sheet keyline as="div" className="px-7 py-12 sm:px-12 md:px-16 md:py-16">`:

  ```text
  header.text-center
    p font-display uppercase tracking-[0.08em] text-[15px]   {cardHeading}   ← the section's one capitals line
    p.mt-1 italic text-[15px] text-muted                       {cardNote}
  form.mt-10 grid gap-x-10 gap-y-7 md:grid-cols-2  noValidate
    Field names (md:col-span-2) · Field email · Field date (+ checkbox dateUnset under it)
    Field venue · Select guests · Select collection · Select budget
    Field heard (md:col-span-2) · Textarea message (md:col-span-2)
    Consent checkbox (md:col-span-2) with t.rich("fields.consent", { link: (c) => <Link href="/privacy">{c}</Link> })
    honeypot: <div aria-hidden className="sr-only"><input tabIndex={-1} autoComplete="off" {...register("company")} /></div>
    {serverError && <p role="alert" className="md:col-span-2 text-center text-[15px] italic text-wax">{t("errors.server")}</p>}
    SealButton (md:col-span-2, centred)
  ```

- **Field recipe.** Write it once as a local `Field` component:
  - label: `block text-[15px] italic text-muted`;
  - control: `mt-1 w-full rounded-none border-0 border-b border-line-strong bg-transparent px-0 pb-1.5 pt-1 font-display text-[22px] text-fg outline-none focus-visible:border-cyanotype focus-visible:shadow-[0_1px_0_var(--cyanotype)]`;
  - error: `mt-1.5 text-[14px] italic text-wax` with `id`, wired to `aria-describedby` and `aria-invalid`. Wax `#a8462b` on white is 5.9:1.
- **Select.** `appearance-none pr-6` with an inline 10px SVG chevron (`absolute right-0 bottom-3 text-muted`, `aria-hidden`). A select needs a disclosure indicator, so the arrow ban does not apply here. The first `option value=""` is `{choose}`.
- **Date.** `input type="date"`. Ticking `dateUnset` disables and clears it.
- **Checkboxes.** Native `input type="checkbox"`, `accent-[var(--cyanotype)] h-4 w-4`, with the label beside it in italic `text-muted`.
- **`SealButton`**:

  ```tsx
  <motion.button type="submit" disabled={isSubmitting} whileHover={reduce ? undefined : "hover"} initial="rest" animate="rest"
    className="mx-auto mt-4 flex min-h-11 items-center gap-4 font-display text-[21px] italic text-fg disabled:opacity-60">
    <motion.span variants={{ rest: { rotate: 0, scale: 1 }, hover: { rotate: -8, scale: 1.05 } }} transition={hoverRevealTransition} className="block h-16 w-16">
      <WaxSeal className="h-full w-full" idSuffix="-reply" />
    </motion.span>
    <span>{isSubmitting ? t("sending") : t("submit")}</span>
  </motion.button>
  ```

- **Submit.** `apiFetch<{ id: string }>("/api/inquiry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({...}) })`.
  - Success → `setSent(true)`.
  - Error → `serverError`, keeping the values.
  - Reset (from the success view) → `reset()`, a new `startedAt`, `setSent(false)`.

## Part D: The seal sequence

### D1. `apps/wedding/src/components/SealedEnvelope.tsx` (client)

Build it from the `ContactSuccess` envelope, adding the card and the flap. Timings come from `SEAL` in
`src/lib/motion.ts`.

```text
<output aria-live="polite" className="flex flex-col items-center px-4 py-10 text-center">
  <p className="sr-only">{title}. {message}</p>                ← announced at once, even with motion reduced
  div.relative aspect-[300/190] w-[408px] max-w-[88vw] [perspective:900px]
    envelope back:  absolute inset-0 rounded-[5px] border border-line-strong bg-panel2 shadow-[0_12px_26px_-18px_rgba(0,0,0,0.35)]
    card:           motion.div absolute inset-x-[7%] top-[8%] h-[80%] bg-sheet rounded-[2px] grid place-items-center
                    font-display italic text-[22px] text-cyanotype  → {cardHeading}
                    initial { y: "-70%" } animate { y: "0%" } transition SEAL.cardIn
    front pocket:   absolute inset-0 (the two lower triangles + side seams, SVG as in ContactSuccess, fill-panel2)
    flap:           motion.div absolute inset-x-0 top-0 h-[56%] origin-top bg-panel [clip-path:polygon(0_0,100%_0,50%_100%)]
                    initial { rotateX: 180 } animate { rotateX: 0 } transition SEAL.flap   (style backfaceVisibility hidden on a front face; see ThankYouLetter)
    seal:           the ContactSuccess seal block (glow, ripple, spring) with delay SEAL.sealAt, centred at top 56%
    postmark:       <Postmark/> absolute -right-4 -top-7 w-[104px] rotate-[14deg]
                    initial { scale: 1.15, opacity: 0 } animate { scale: 1, opacity: 0.85 } transition SEAL.postmark
  motion.h3 mt-10 font-display text-[28px]   {title}     (fade in at SEAL.copyAt)
  motion.p  mt-3 max-w-[26em] text-muted      {message}
  TextLink onClick={onReset} className="mt-8" {reset}
</output>
```

With reduced motion, render the final state with no `initial` values: card inside, flap closed, seal
and postmark in place.

### D2. `apps/wedding/src/components/Postmark.tsx`

An SVG of about 104×104, stroke `var(--cyanotype)`, width 1.3, no fill. It contains:

- two concentric circles;
- the text "MONTRÉAL" on a `textPath` along the top arc, in Playfair, `letter-spacing 1.2`, 10px;
- today's date in the centre (`formatLongDate(today, locale)`, two lines if needed);
- three short wavy cancellation lines to the left.

`aria-hidden`. This is the **only** postmark on the site (D9).

## Part E: Section and page

1. `sections/ReplySection.tsx` (server). Props: `{ headingAs?: "h1" | "h2" }`.

   ```text
   <Tone tone="night" id="reply" aria-labelledby="reply-title" className="section-y">
     container-site grid gap-12 lg:grid-cols-12
       div lg:col-span-4
         SectionHeader align="left" as={headingAs} id="reply-title"
         p.mt-8 text-body-fluid text-fg/75 max-w-[30em]   {intro}
         p.mt-4 text-muted   t.rich("introAside", { email }) with a HoverLink mailto
       div lg:col-span-8 → ReplyCard (client) / SealedEnvelope swap
   </Tone>
   ```

2. Home: replace the `Phase 11` comment with `<ReplySection />`. In `Invitation.tsx`, change the CTA
   `href` from `#footer` to `#reply`.
3. `/rsvp`: `app/[locale]/rsvp/page.tsx` renders `PageTop` + `<main id="main"><ReplySection headingAs="h1" /></main>`, with
   `generateMetadata` from `meta.rsvpTitle` and `meta.rsvpDescription`.
4. Paste the `reply` namespace into both message files.

## Part F: Admin inbox

1. `apps/admin/src/app/admin/inquiries/page.tsx`: clone `admin/messages/page.tsx`.
   - Query key `["wedding-inquiries"]`, endpoint `/api/wedding-inquiries`.
   - Collapsed row: names, wedding date (or "No date yet"), venue.
   - Expanded: a definition list of every field with English labels (a static map from enum to label, matching the copy deck), the message, and Reply (mailto), Mark unread and Delete.
   - Header and empty state from copy deck §5.
2. `apps/admin/src/lib/admin/sections.tsx`: add an entry after `messages`:
   - `key: "inquiries"`, `href: "/admin/inquiries"`, `label: "Inquiries"`, `title: "Wedding inquiries"`;
   - `description: "Reply cards from the wedding site."`, `Icon: IconCalendar`.

   Skip the `Stat` unless `MessagesStat` can be copied in under 30 lines.

## Part G: Documentation (same change)

- `docs/database-and-storage.md`: the `wedding_inquiries` table, its constraints and its RLS (current state); `0016` in the migration notes.
- `docs/api-reference.md`:
  - `POST /api/inquiry` (wedding, public): body, honeypot, time trap, `201 { id }`, `422`;
  - `GET`, `PATCH` and `DELETE /api/wedding-inquiries[/id]` (admin);
  - the endpoint summary and "Which app serves what".
- `docs/admin-guide.md`: a new "Wedding inquiries" section.

## Part H: Verification

1. Run lint, typecheck, build, the greps and the parity check.
2. **Client validation** (no database needed). Run `bun run dev:wedding`, open `/rsvp`, and submit an empty card:
   - each required field shows its error;
   - focus moves to the first invalid field;
   - errors are announced.

   Tick "not set yet": the date error clears.
3. **API without the migration.** POST a valid body with `started_at` 10 s in the past, using curl from Bash. Expect `500 DB_INSERT_FAILED`; the UI shows the server error and keeps the values.
   - Then POST with `company` set: expect `201 { id: "ok" }`.
   - Then POST with `started_at` set to now: expect `201 { id: "ok" }`.
4. **Seal sequence.** In dev only, temporarily force the success state (for example, render `SealedEnvelope` on `/kit`) to QA it at 1440 and 390, with and without reduced motion. Record `wedding-seal.gif`, then remove the temporary hook.
5. 🧑 **With the migration** (only if the operator applied 0016):
   - a real submission lands in `/admin/inquiries`;
   - mark read and unread works;
   - delete works;
   - the email arrives if Resend is configured.

   Otherwise, list it as pending.

## Definition of done

- [ ] `0016_wedding_inquiries.sql` is written and not executed.
- [ ] The public endpoint has the honeypot and time trap, plus best-effort email. The admin has list, read and delete.
- [ ] The reply card is accessible and validated in both languages, with the seal sequence and its reduced-motion end state.
- [ ] The section is on the home page, the `/rsvp` page exists, and the hero CTA points to `#reply`.
- [ ] Docs and the env example are updated. Lint, typecheck and build pass.

## Commit message

```text
Add the wedding reply card

- Add migration 0016 for private wedding inquiries (not applied)
- Add the public inquiry endpoint with honeypot, time trap and best-effort email
- Add the reply card form and the sealing sequence with a cyanotype postmark
- Add the reply section to the home page and the /rsvp page
- Add the wedding inquiries inbox to the admin
- Document the table, endpoints and admin inbox
```

🧑 **Operator, after this phase:**
1. Apply `0016_wedding_inquiries.sql`.
2. Set the wedding runtime secrets in `apps/wedding/.env.local` for local tests and in Dokploy for production.
