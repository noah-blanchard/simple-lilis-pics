import { Photo } from "./Photo";

export interface MomentView {
  key: string;
  timeText: string;
  title: string;
  line: string;
  photo: { src: import("next/image").StaticImageData; alt: string };
  orientation: "landscape" | "portrait";
}

/** One moment of the day: photograph, its time as text, title, one line. */
export const Moment = ({ moment }: { moment: MomentView }) => (
  <article className="w-full">
    <Photo
      src={moment.photo.src}
      alt={moment.photo.alt}
      ratio={moment.orientation === "landscape" ? "3/2" : "4/5"}
      sizes="(min-width: 1024px) 45vw, 100vw"
    />
    <p className="mt-5 text-[15px] text-muted italic">
      <time>{moment.timeText}</time>
    </p>
    <h3 className="display mt-1 text-[clamp(30px,2.8vw,42px)] leading-[1.06]">
      {moment.title}
    </h3>
    <p className="mt-2 max-w-[30em] text-muted">{moment.line}</p>
  </article>
);
