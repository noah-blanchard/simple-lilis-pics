"use client";

import { WEDDING_TYPES } from "@lili/core/api/schemas";
import { useState } from "react";
import type {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form";
import { TranslatableField } from "@/components/admin/TranslatableField";

/** The seven wedding fields as the form holds them (strings; "" becomes null on submit). */
export interface WeddingFormValues {
  wedding_story: boolean;
  wedding_couple: string;
  wedding_slug: string;
  wedding_venue: string;
  wedding_type: string;
  wedding_quote_en: string;
  wedding_quote_fr: string;
}

const TYPE_LABELS: Record<(typeof WEDDING_TYPES)[number], string> = {
  elopement: "Elopement",
  intimate: "Intimate",
  full_day: "Full day",
};

/** Lowercase, dash-separated address from a couple's names. */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface WeddingPanelProps {
  // The parent form owns more fields than the wedding ones; the panel only
  // touches its own keys, so it takes the form's helpers loosely typed.
  // biome-ignore lint/suspicious/noExplicitAny: shared form with extra fields
  register: UseFormRegister<any>;
  // biome-ignore lint/suspicious/noExplicitAny: shared form with extra fields
  setValue: UseFormSetValue<any>;
  // biome-ignore lint/suspicious/noExplicitAny: shared form with extra fields
  errors: FieldErrors<any>;
  values: WeddingFormValues;
  fieldClass: string;
  labelClass: string;
  /** Server error message, shown at the panel level. */
  serverError?: string | null;
}

/** Edit-only block that turns a project into a story on wedding.lilispics.com. */
export function WeddingPanel({
  register,
  setValue,
  errors,
  values,
  fieldClass,
  labelClass,
  serverError,
}: WeddingPanelProps) {
  // The address follows the couple's names until someone edits it by hand.
  const [slugTouched, setSlugTouched] = useState(
    values.wedding_slug.trim() !== "",
  );
  const fieldError = (name: keyof WeddingFormValues) => {
    const message = errors[name]?.message;
    return typeof message === "string" ? (
      <p className="mt-1.5 text-[13px] text-danger">{message}</p>
    ) : null;
  };

  const coupleReg = register("wedding_couple", {
    onChange: (e) => {
      if (!slugTouched) {
        setValue("wedding_slug", slugify(e.target.value), {
          shouldDirty: true,
        });
      }
    },
  });
  const slugReg = register("wedding_slug", {
    onChange: () => setSlugTouched(true),
  });

  const migrationPending = serverError?.includes("migration 0015");

  return (
    <fieldset className="rounded-2xl border border-line p-5">
      <legend className="px-2 text-[14px] text-fg/70">Wedding story</legend>

      <label className="flex cursor-pointer items-center gap-3 text-[15px]">
        <input
          type="checkbox"
          className="h-4 w-4 accent-accent"
          {...register("wedding_story")}
        />
        Show as a wedding story on wedding.lilispics.com
      </label>

      {migrationPending && (
        <p className="mt-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-[14px] text-warning">
          Wedding fields need migration 0015 (see docs/database-and-storage.md).
        </p>
      )}

      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="wedding_couple" className={labelClass}>
            Couple
          </label>
          <input
            id="wedding_couple"
            className={fieldClass}
            placeholder="Camille & Jonathan"
            {...coupleReg}
          />
          {fieldError("wedding_couple")}
        </div>
        <div>
          <label htmlFor="wedding_slug" className={labelClass}>
            Address
          </label>
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-[13px] text-fg/50">
              wedding.lilispics.com/stories/
            </span>
            <input
              id="wedding_slug"
              className={fieldClass}
              placeholder="camille-and-jonathan"
              {...slugReg}
            />
          </div>
          {fieldError("wedding_slug")}
          {serverError?.includes("already uses this address") && (
            <p className="mt-1.5 text-[13px] text-danger">{serverError}</p>
          )}
        </div>
        <div>
          <label htmlFor="wedding_venue" className={labelClass}>
            Venue or city
          </label>
          <input
            id="wedding_venue"
            className={fieldClass}
            {...register("wedding_venue")}
          />
        </div>
        <div>
          <label htmlFor="wedding_type" className={labelClass}>
            Type
          </label>
          <select
            id="wedding_type"
            className={fieldClass}
            {...register("wedding_type")}
          >
            <option value="">Choose</option>
            {WEDDING_TYPES.map((type) => (
              <option key={type} value={type}>
                {TYPE_LABELS[type]}
              </option>
            ))}
          </select>
          {fieldError("wedding_type")}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <TranslatableField
          id="wedding_quote_en"
          label="Couple's quote (EN)"
          placeholder="Optional"
          multiline
          registration={register("wedding_quote_en")}
          fieldClass={fieldClass}
          labelClass={labelClass}
          from="fr"
          to="en"
          kind="description"
          sourceValue={values.wedding_quote_fr}
          targetValue={values.wedding_quote_en}
          onTranslated={(t) =>
            setValue("wedding_quote_en", t, { shouldDirty: true })
          }
        />
        <TranslatableField
          id="wedding_quote_fr"
          label="Couple's quote (FR)"
          placeholder="Optionnel"
          multiline
          registration={register("wedding_quote_fr")}
          fieldClass={fieldClass}
          labelClass={labelClass}
          from="en"
          to="fr"
          kind="description"
          sourceValue={values.wedding_quote_en}
          targetValue={values.wedding_quote_fr}
          onTranslated={(t) =>
            setValue("wedding_quote_fr", t, { shouldDirty: true })
          }
        />
      </div>
    </fieldset>
  );
}
