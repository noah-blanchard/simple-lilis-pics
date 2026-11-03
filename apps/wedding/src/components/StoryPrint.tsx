import type { ResolvedWeddingStory } from "@lili/core/data/weddings";
import type { Locale } from "@lili/core/i18n/routing";
import { Link } from "@/i18n/navigation";
import { Print } from "./Print";
import { StoryCaption } from "./StoryCaption";

/** A story on the table: the cover as a print, the caption beneath it. */
export const StoryPrint = ({
  story,
  locale,
  rotate = 0,
}: {
  story: ResolvedWeddingStory;
  locale: Locale;
  rotate?: number;
}) => {
  const alt = story.venue ? `${story.couple}, ${story.venue}` : story.couple;
  return (
    <Link href={`/stories/${story.slug}`} className="group block">
      {story.cover ? (
        <Print
          photo={{
            src: story.cover.img,
            alt,
            ratio: "4/5",
            sizes: "(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw",
          }}
          rotate={rotate}
        />
      ) : null}
      <StoryCaption story={story} locale={locale} />
    </Link>
  );
};
