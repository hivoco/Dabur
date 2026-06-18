"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useBackground } from "./components/Background";
import { useRouter } from "next/navigation";
import StoryPopup from "./components/StoryPopup";
import VideoPopup from "./components/VideoPopup";
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
        className="bee-float bg-glass absolute left-9 -top-12 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/30 shadow-lg backdrop-blur-[2px]"
        style={{ animationDelay: isLeft ? "0s" : "0.7s" }}
      >
        <Image
          src={bee}
          alt="bee"
          width={80}
          height={80}
          className={`w-7 ${isLeft&& "-scale-x-100"} object-contain`}
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
        className="relative block h-16.25 w-35 shrink-0 cursor-pointer origin-center scale-[0.9786] md:scale-100"
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
              className={`pointer-events-none flex h-full items-center gap-0.5 font-[Inter] text-[10px] font-medium leading-2.5 text-white md:gap-1 ${
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
  const { showLeft, showRight, center } = useBackground();
  const router = useRouter();
  const [storyOpen, setStoryOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const popupOpen = storyOpen || videoOpen;

  // Fade the page content in on mount (e.g. when navigating back from /discover).
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const r = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(r);
  }, []);

  // Slide the background and open the popup at the same time.
  const openStory = () => {
    showLeft();
    setStoryOpen(true);
  };

  // Recenter the background now (slides back with the popup's exit), then
  // unmount the popup after its slide-out-left animation finishes.
  const closeStory = () => {
    center();
    setTimeout(() => setStoryOpen(false), 500);
  };

  // Right button: slide the background left and open the video popup together.
  const openVideo = () => {
    showRight();
    setVideoOpen(true);
  };

  const closeVideo = () => {
    center();
    setTimeout(() => setVideoOpen(false), 500);
  };

  return (
    <div className="relative flex h-svh  flex-col px-10 md:px-0 items-center overflow-hidden">
      {/* Brand logo — top centre of the PAGE. On desktop it stays visible
          above an open popup; on mobile it hides (the popup shows its own). */}
      <Image
        src="/logo-1.png"
        alt="Logo"
        width={120}
        height={109}
        priority
        className={`relative z-60 mt-2 w-20 mb-2 object-contain drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)] transition-opacity duration-500 ${
          !mounted ? "opacity-0" : "opacity-100"
        } ${popupOpen ? "hidden md:block" : ""}`}
      />

      {/* Foreground content — hidden while a popup is open so only the
          popup (over the sliding background image) is visible. */}
      <div
        className={`flex w-full flex-1 flex-col items-center transition-opacity duration-500 ${
          !mounted || popupOpen ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >

     

      <div className="bg-glass-tint relative flex h-32 md:h-40  w-64 items-center justify-center rounded-[12.78px] backdrop-blur-[2px] md:w-87">
       
        

        <Image
          src="/mask2.png"
          alt=""
          width={106}
          height={29}
          className="absolute top-1 left-1/2 w-20 md:w-28  -translate-x-1/2 object-contain"
        />

        <Image
          src="/mono1.png"
          alt=""
          width={350}
          height={110}
          priority
          className="object-contain w-56 md:w-96 "
        />

        <Image
          src="/mask2.png"
          alt=""
          width={106}
          height={29}
          className="absolute bottom-1 left-1/2 w-20 md:w-28   rotate-180 -translate-x-1/2 object-contain"
        />
      </div>

      {/* Left button — upper-left, flanking the centre */}
      <FlankButton
        side="left"
        bee="/bee1.gif"
        onClick={openStory}
        text="Meet our <br/> Women <br/> Harvesters"
        position="top-[42%] md:top-[35%] left-0 md:left-1/2 translate-x-0 md:-translate-x-[250px]"
      />


      {/* Right button — lower-right, flanking the centre */}
      <FlankButton
        side="right"
        bee="/bee1.gif"
        onClick={openVideo}
        text="Know our <br/> sourcing story"
        position="bottom-[29%] left-auto md:left-1/2 right-0 md:right-auto translate-x-0 md:translate-x-[120px]"
      />

      {/* Decorative bees — top / right, smaller and flipped. The flip
          (-scale-x-100) lives on the WRAPPER so it doesn't fight the bee-float
          transform that animates the image. */}
      <div className="pointer-events-none absolute top-[10%] right-[14%] hidden md:block z-20 w-5 -scale-x-100 select-none md:w-12">
        <Image
          src="/bee1.gif"
          alt=""
          width={10}
          height={10}
          unoptimized
          className="bee-float w-7 object-contain"
          style={{ animationDelay: "0.3s" }}
        />
      </div>
      <div className="pointer-events-none absolute top-[12%] left-[13%] z-20 w-5  select-none md:w-12">
        <Image
          src="/bee1.gif"
          alt=""
          width={10}
          height={10}
          unoptimized
          className="bee-float w-7 object-contain"
          style={{ animationDelay: "0.3s" }}
        />
      </div>
      <div className="pointer-events-none absolute bottom-[22%] left-[13%] z-20 w-5 -scale-x-100 select-none md:w-12">
        <Image
          src="/bee1.gif"
          alt=""
          width={10}
          height={10}
          unoptimized
          className="bee-float w-7 object-contain"
          style={{ animationDelay: "0.3s" }}
        />
      </div>
      <div className="pointer-events-none absolute top-[30%] md:top-[45%] right-[4%] z-20 w-5 -scale-x-100 md:scale-x-100  select-none md:w-10">
        <Image
          src="/bee1.gif"
          alt=""
          width={20}
          height={20}
          unoptimized
          className="bee-float  w-7 object-contain"
          style={{ animationDelay: "1.2s" }}
        />
      </div>




      </div>

      {/* Bottom action row — OUTSIDE the fading wrapper so the chat stays visible
          (e.g. floating over an open popup). z-[60] sits above the popup (z-50);
          the Discover button hides while a popup is open. On desktop md:contents
          dissolves the row (Discover in flow, chat floats corner). */}
      <div className="fixed inset-x-0 bottom-5 z-[60] flex items-center justify-center gap-2.5 px-5 md:contents">
        <button
          type="button"
          onClick={() => router.push("/discover")}
          className={`bg-glass flex h-[48.51px] flex-1 items-center justify-center gap-[10.54px] rounded-[31.62px] border border-white/30 px-[21.08px] py-[14.76px] text-[15px] font-medium text-white shadow-[0_4px_30px_rgba(0,0,0,0.15)] backdrop-blur-[2px] transition hover:backdrop-blur-[5px] md:mt-auto md:mb-8 md:w-80 md:flex-none ${
            popupOpen ? "invisible pointer-events-none" : ""
          }`}
        >
          Discover More
        </button>

        {/* Mobile: an in-flow flex item in the row. Desktop: floats corner. */}
        <ChatWidget triggerClassName="flex flex-col items-end gap-3 md:fixed md:bottom-5 md:right-5 md:z-70" />
      </div>

      {storyOpen && <StoryPopup onClose={closeStory} />}
      {videoOpen && <VideoPopup src="/brand-film.mp4" onClose={closeVideo} />}
    </div>
  );
}
