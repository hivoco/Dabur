"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useBackground } from "./components/Background";
import ChatWidget from "./components/ChatWidget";

// FlankButton notched-pill outline, authored in the 105×51 viewBox then scaled
// to the button's real 140×65 px box (×4/3, ×65/51) so a CSS clip-path matches
// the rendered SVG outline exactly. Using clip-path: path() (not an SVG
// clipPath) avoids Safari ignoring transforms inside objectBoundingBox clips,
// which let the blur bleed past the rounded corners.
const FLANK_CLIP =
  "path('M112 64.649C127.464 64.649 140 52.667 140 37.882C140 23.103 127.464 11.12 112 11.12H70.568L58.874 0.685C57.849 -0.229 56.259 -0.228 55.234 0.685L43.539 11.12H28C12.536 11.12 0 23.103 0 37.882C0 52.667 12.536 64.649 28 64.649H112Z')";

// Glass pill that flanks the centre, with a bee badge on its top-left corner.
function FlankButton({
  text,
  side,
  position,
  bee,
  onClick,
}: {
  text: string;
  side: "left" | "right";
  position: string;
  bee: string;
  onClick?: () => void;
}) {
  const isLeft = side === "left";
  const startX = useRef<number | null>(null);
  const swiped = useRef(false);

  // Mobile: sliding the left button left (or the right button right) by ≥10px
  // activates it, the same as a tap.
  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    swiped.current = false;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (startX.current === null || swiped.current) return;
    const dx = e.touches[0].clientX - startX.current;
    if (isLeft ? dx <= -10 : dx >= 10) {
      swiped.current = true;
      onClick?.();
    }
  };
  const handleActivate = () => {
    // Ignore the click the browser synthesizes right after a swipe.
    if (swiped.current) {
      swiped.current = false;
      return;
    }
    onClick?.();
  };

  return (
    <div className={`absolute ${position}`}>
      {/* bee glass badge */}
      <span
        className="bee-float bg-glass absolute left-9 -top-11 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/30 shadow-lg backdrop-blur-[2px]"
        style={{ animationDelay: isLeft ? "0s" : "0.7s" }}
      >
        <Image
          src={bee}
          alt="bee"
          width={80}
          height={80}
          className={`w-7 ${!isLeft&& "-scale-x-100"} object-contain`}
        />
      </span>

      {/* Custom button shape with triangular notch + real frosted glass.
          Clip the WRAPPER too: some browsers don't clip a child's
          backdrop-filter by its own clip-path, so the blur leaks to the full
          rectangle on the sides — an ancestor clip contains it to the shape. */}
      <div
        onClick={handleActivate}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        className="relative block h-16.25  w-35 shrink-0 cursor-pointer origin-center scale-x-70 scale-y-75 sm:scale-100"
        style={{ clipPath: FLANK_CLIP }}
      >
        {/* Frosted-glass layer: actually blurs the page content behind the
            button (backdrop-filter), clipped to the notched-pill shape. */}
        <div
          className="bg-glass absolute inset-0 backdrop-blur-[2px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)]"
          style={{ clipPath: FLANK_CLIP }}
        />

        {/* Shape outline + content drawn on top of the glass. Clipped to the
            SAME FLANK_CLIP so the centred stroke can't overhang the glass edge
            (it becomes an inner border that lines up exactly with the fill). */}
        <svg
          className="absolute inset-0 block"
          width="140"
          height="65"
          viewBox="0 0 105 51"
          fill="none"
          style={{ clipPath: FLANK_CLIP }}
        >
          {/* Glass edge highlight (strokeWidth 2 → ~1px after the outer half is
              clipped away) */}
          <path
            d="M84 50.7253C95.598 50.7253 105 41.3233 105 29.7253C105 18.1273 95.598 8.72528 84 8.72528H52.9258L44.1553 0.537781C43.387 -0.179394 42.1942 -0.179146 41.4258 0.537781L32.6543 8.72528H21C9.40202 8.72528 0 18.1273 0 29.7253C0 41.3233 9.40202 50.7253 21 50.7253H84Z"
            fill="none"
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth="2"
          />

          {/* Icon and Text Container */}
          <foreignObject x="0" y="10" width="105" height="39">
            <div
              className={`pointer-events-none flex h-full items-center gap-0.5 font-[Inter] text-[10px] font-medium leading-2.5 text-white sm:gap-1 ${
                isLeft
                  ? "flex-row justify-start pl-2 text-left"
                  : "flex-row-reverse justify-end pr-2 text-right"
              }`}
            >
              {/* Chevron Icon */}
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                className="shrink-0"
              >
                <polyline
                  points="9 18 15 12 9 6"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    transform: isLeft ? "scaleX(-1)" : "none",
                    transformOrigin: "center",
                  }}
                />
              </svg>

              {/* Text */}
              <div
                className="flex-1"
                dangerouslySetInnerHTML={{ __html: text }}
              />
            </div>
          </foreignObject>
        </svg>
      </div>
    </div>
  );
}

export default function Home() {
  const { center } = useBackground();
  const router = useRouter();

  // Re-center the background: the Story/Video pages slide it, so returning
  // here should reset it.
  useEffect(() => {
    center();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative flex h-svh flex-col items-center overflow-hidden px-4">
      <h1 className="sr-only">Monofloral Litchi Honey</h1>

      <Image
        src="/logo-1.webp"
        alt="Dabur Litchi Honey logo"
        width={120}
        height={109}
        priority
        className="relative mt-2 mb-2 w-20 object-contain drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)]"
      />

      {/* Glass card 425×128, radius 12: text block is 387×96, inset 16px
          top / 19px sides (pt-4 / px-4.75). */}
      <div className="bg-glass-card flex min-h-32 w-106.25 max-w-full items-center justify-center rounded-xl px-4.75 py-4 backdrop-blur-[2px] short:min-h-0 short:w-90 short:px-3 short:py-2.5">
        <div className="flex min-h-24 w-96.75 max-w-full flex-col justify-center text-center text-[13px] leading-[1.35] text-white short:min-h-0 short:w-84 short:text-[11px]">
          <p className="">Every Great Honey Has an Origin.</p>
          <p className="">Discover the story behind this one.</p>
          <p className="mt-1 short:mt-0.5">
            For just a few weeks every year, Bihar&apos;s famous litchi orchards
            come alive with blossoms. Bees collect nectar during this fleeting
            season to create a honey that&apos;s naturally delicate, floral and
            seasonal.
          </p>
        </div>
      </div>

      {/* Flank buttons over the pack in the background: top-left and
          bottom-right. */}
      <FlankButton
        side="left"
        bee="/new-bee-2.webp"
        onClick={() => router.push("/women-harvesters")}
        text="Meet Our <br/> Women <br/> Harvesters"
        // 42% down on phones, 36% on sm+, sliding further down as the screen
        // drops below 760px tall (+0.3px per px lost) so it keeps clear of the card.
        position="top-[calc(42%_+_max(0px,_760px_-_100svh)_*_0.3)] sm:top-[calc(36%_+_max(0px,_760px_-_100svh)_*_0.3)] left-0 sm:left-1/2 translate-x-0 sm:-translate-x-[250px]"
      />

      {/* Phone and tablet/desktop (sm: ≥640px) variants of the right button (different line breaks). */}
      <FlankButton
        side="right"
        bee="/new-bee-2.webp"
        onClick={() => router.push("/source-story")}
        text="Know Our  Sourcing <br/> Story"
        position="bottom-[29%] sm:hidden left-auto sm:left-1/2 -right-3 sm:right-auto translate-x-0 sm:translate-x-[120px]"
      />
      <FlankButton
        side="right"
        bee="/new-bee-2.webp"
        onClick={() => router.push("/source-story")}
        text="Know Our <br/> Sourcing Story"
        position="bottom-[29%] hidden sm:flex left-auto sm:left-1/2 right-0 sm:right-auto translate-x-0 sm:translate-x-[120px]"
      />

      {/* Bottom action row. Mobile: fixed row with Discover + chat side by
          side. Desktop (md:contents dissolves the row): Discover in flow at
          the bottom centre, chat floats in the bottom-right corner. */}
      <div className="fixed inset-x-0 bottom-5 z-60 flex items-center justify-center gap-2.5 px-5 md:contents">
        <button
          type="button"
          onClick={() => router.push("/discover")}
          className="bg-glass flex h-[48.51px] flex-1 items-center justify-center rounded-[31.62px] border border-white/30 px-[21.08px] text-[15px] font-medium text-white shadow-[0_4px_30px_rgba(0,0,0,0.15)] backdrop-blur-[2px] transition hover:backdrop-blur-[5px] short:h-10 short:px-4 short:text-[13px] md:mt-auto md:mb-8 md:w-80 md:flex-none short:md:mb-4"
        >
          Discover More
        </button>

        <ChatWidget triggerClassName="flex flex-col items-end gap-3 md:fixed md:bottom-5 md:right-5 md:z-70" />
      </div>
    </div>
  );
}
