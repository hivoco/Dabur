"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useBackground } from "./components/Background";
import { useRouter } from "next/navigation";
import StoryPopup from "./components/StoryPopup";
import VideoPopup from "./components/VideoPopup";

// Shared glassmorphism background (green tint + white sheen).
const glassBg =
  "linear-gradient(0deg, rgba(75, 83, 32, 0.15), rgba(75, 83, 32, 0.15)), linear-gradient(0deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1))";

// Reusable arrow (points right by default; rotate via className for left/down).
function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

// Chevron (points right by default; rotate-180 for left).
function Chevron({ className = "" }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

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
        className="absolute left-10 -top-14 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/30 shadow-[0_4px_30px_rgba(0,0,0,0.15)] backdrop-blur-[2px] "
        style={{ background: glassBg }}
      >
        <Image
          src={bee}
          alt="bee"
          width={80}
          height={80}
          className="bee-float w-32 object-contain"
          style={{ animationDelay: isLeft ? "0s" : "0.7s" }}
        />
      </span>

      <button
        type="button"
        onClick={handleActivate}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        className="flex  max-w-47.5 items-center gap-1 md:gap-2 rounded-full border border-white/30 px-3 py-1 text-left text-sm font-medium leading-tight text-white shadow-[0_4px_30px_rgba(0,0,0,0.15)] backdrop-blur-[2px] transition hover:backdrop-blur-[5px] w-36 md:w-40"
        style={{ background: glassBg }}
      >
        {isLeft && <Chevron className="shrink-0 rotate-180 text-lg" />}
        <span
          className={`font-semibold text-[10px] md:text-xs  w-full ${isLeft ? 'text-left' : 'text-right'}`}
          dangerouslySetInnerHTML={{ __html: text }}
        />
        {!isLeft && <Chevron className="shrink-0 text-lg" />}
      </button>
    </div>
  );
}

export default function Home() {
  const { showLeft, showRight, center } = useBackground();
  const router = useRouter();
  const [storyOpen, setStoryOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);

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
    <div className="relative flex h-svh flex-col items-center overflow-hidden">
      <Image
        src="/logo-1.png"
        alt="Logo"
        width={120}
        height={109}
        priority
        className={`relative z-60 mt-2 w-20 md:w-24 mb-2 object-contain ${
          storyOpen || videoOpen ? "hidden md:block" : ""
        }`}
      />

      <div
        className="relative flex items-center justify-center"
        style={{
          width: 348,
          height: 164,
          opacity: 1,
          borderRadius: "12.78px",
          background:
            "linear-gradient(0deg, rgba(75, 83, 32, 0.15), rgba(75, 83, 32, 0.15)), linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), linear-gradient(0deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1))",
        }}
      >
        {/* Glass arrow icon sitting on the top-center border */}
        {/* <div
          className="absolute left-1/2 top-0 z-10 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 text-white shadow-[0_4px_30px_rgba(0,0,0,0.15)] backdrop-blur-[2px]"
          style={{ background: glassBg }}
        >
          <Arrow className="rotate-90" />
        </div> */}

        <Image
          src="/mask.png"
          alt=""
          width={111}
          height={29}
          className="absolute top-0 left-1/2 -translate-x-1/2 object-contain"
        />

        <Image
          src="/mono1.png"
          alt=""
          width={350}
          height={110}
          priority
          className="object-contain"
        />

        <Image
          src="/mask.png"
          alt=""
          width={106}
          height={29}
          className="absolute bottom-0 left-1/2 rotate-180 -translate-x-1/2 object-contain"
        />
      </div>

      {/* Left button — upper-left, flanking the centre */}
      <FlankButton
        side="left"
        bee="/bee2.png"
        onClick={openStory}
        text="Meet our <br/> Women <br/> Harvesters"
        position="top-[45%] md:top-[38%] left-[3px] md:left-1/2  translate-x-0 md:-translate-x-[290px]"
      />


      {/* Right button — lower-right, flanking the centre */}
      <FlankButton
        side="right"
        bee="/bee2.png"
        onClick={openVideo}
        text="Know our <br/> sourcing story"
        position="bottom-[26%] left-auto md:left-1/2 right-[3px] md:right-auto translate-x-0 md:translate-x-[90px]"
      />

      {/* Decorative bee bouncing in place (top-right) */}
      <Image
        src="/bee2.png"
        alt=""
        width={80}
        height={80}
        className="bee-bounce pointer-events-none absolute top-36 right-72 z-20 w-18 select-none object-contain"
      />




      {/* Discover More */}
      <button
        type="button"
        onClick={() => router.push("/discover")}
        className="mt-auto mb-5 md:mb-8 flex items-center justify-center border border-white/30 text-[15px] font-medium text-white shadow-[0_4px_30px_rgba(0,0,0,0.15)] backdrop-blur-[2px] transition hover:backdrop-blur-[5px] w-60 md:w-80"
        style={{
       
          height: 48.513511657714844,
          opacity: 1,
          borderRadius: "31.62px",
          gap: "10.54px",
          paddingTop: "14.76px",
          paddingRight: "21.08px",
          paddingBottom: "14.76px",
          paddingLeft: "21.08px",
          background: glassBg,
        }}
      >
        Discover More
      </button>

      {storyOpen && <StoryPopup onClose={closeStory} />}
      {videoOpen && <VideoPopup src="/brand-film.mp4" onClose={closeVideo} />}
    </div>
  );
}
