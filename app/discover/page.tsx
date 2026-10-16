"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import RecipePopup, { type Recipe } from "../components/RecipePopup";
import ChatWidget from "../components/ChatWidget";
import recipeData from "../data/recipie.json";

// Bump this whenever you REPLACE an image but keep its filename. A same-named
// file has the same URL, so browsers, any CDN, and Next's image optimizer keep
// serving the cached copy; changing ?v= makes the URL new so they fetch fresh.
const ASSET_VERSION = "2";

const TOP_CARDS = [1, 2, 3, 4].map(
  (n) => `/discover/upper-card/${n}.webp?v=${ASSET_VERSION}`
);

// Recipes are data-driven from app/data/recipie.json. The Nth entry (card1..8)
// maps to its hero image at /discover/bottom-card/bN.webp; every ingredient
// carries its own icon path, all rendered dynamically in the RecipePopup.
const RECIPES: Recipe[] = recipeData.map((r, i) => ({
  src: `/discover/bottom-card/b${i + 1}.webp?v=${ASSET_VERSION}`,
  title: r.title,
  why: r.whyItWorks,
  ingredients: r.ingredients,
  method: r.method,
}));

// A few bees scattered around (gentle float via the .bee-float class).
const BEES = [
  { src: "/new-bee-2.webp", className: "left-[12%] md:left-[7%] top-[7%] w-8 md:w-12", delay: "0s", flip: true },
  { src: "/new-bee-2.webp", className: "right-[10%] top-[8%] w-8 md:w-12", delay: "0.6s", flip: true },
  { src: "/new-bee-2.webp", className: "right-[7%] top-[44%] w-8 md:w-12", delay: "1.1s", flip: false },
  { src: "/new-bee-2.webp", className: "left-[40%] bottom-[28%] w-7 md:w-10", delay: "1.6s", flip: true },
];

export default function Discover() {
  const [active, setActive] = useState<Recipe | null>(null);
  // The staggered reveal is CSS-only (`starting:` = @starting-style), so the
  // cards are visible in the server HTML instead of waiting for JS to mount.

  // Infinite carousel (mobile + desktop): the recipes are rendered three times
  // and we keep the scroll inside the MIDDLE copy. Whenever scrolling settles
  // in the first or last copy we jump by exactly one copy's width — the same
  // cards are on screen, so the jump is invisible and there is never an end in
  // either direction (swipe, arrows or auto-advance).
  const carouselRef = useRef<HTMLDivElement>(null);
  const lastTouch = useRef(0); // when the user last touched/swiped (ms)
  const touching = useRef(false);

  const metrics = () => {
    const el = carouselRef.current;
    if (!el || el.children.length <= RECIPES.length) return null;
    const kids = el.children;
    const left = (i: number) => (kids[i] as HTMLElement).offsetLeft;
    return { el, step: left(1) - left(0), copyWidth: left(RECIPES.length) - left(0) };
  };

  // Snap back into the middle copy once scrolling stops.
  const recenter = () => {
    const m = metrics();
    if (!m || touching.current) return;
    const { el, copyWidth } = m;
    if (el.scrollLeft < copyWidth - 1) el.scrollLeft += copyWidth;
    else if (el.scrollLeft >= 2 * copyWidth - 1) el.scrollLeft -= copyWidth;
  };

  useEffect(() => {
    const m = metrics();
    if (!m) return;
    const { el } = m;
    // Start in the middle copy (no animation).
    el.scrollLeft = m.copyWidth;

    let settle: ReturnType<typeof setTimeout> | undefined;
    const onScroll = () => {
      clearTimeout(settle);
      settle = setTimeout(recenter, 150);
    };
    const onTouchStart = () => {
      touching.current = true;
      lastTouch.current = Date.now();
    };
    const onTouchEnd = () => {
      touching.current = false;
      lastTouch.current = Date.now();
      onScroll(); // recenter after the momentum scroll settles
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });

    // Auto-advance one card every 3s. Paused while hovered (desktop), touched,
    // or for 4s after the user last swiped (mobile).
    const id = setInterval(() => {
      if (el.matches(":hover") || touching.current) return;
      if (Date.now() - lastTouch.current < 4000) return;
      const cur = metrics();
      if (!cur) return;
      recenter();
      el.scrollBy({ left: cur.step, behavior: "smooth" });
    }, 3000);

    return () => {
      clearInterval(id);
      clearTimeout(settle);
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Prev/next arrows scroll by one card (card width + gap); `recenter` first so
  // there is always a card to move to in either direction.
  const scrollByCard = (dir: 1 | -1) => {
    const m = metrics();
    if (!m) return;
    recenter();
    m.el.scrollBy({ left: dir * m.step, behavior: "smooth" });
  };

  return (
    <>
    <div className="full-bleed fixed inset-y-0 z-0 overflow-hidden  bg-black/35 backdrop-blur-[5px]">
      {/* SEO heading — visually hidden but present for crawlers/screen readers. */}
      <h1 className="sr-only">
        Dabur Litchi Honey — Recipes &amp; What Makes It Special
      </h1>

      {/* Decorative leaf — top-left corner (flipped 180deg) */}
      <Image
        src="/leaf.webp"
        alt=""
        width={123}
        height={158}
        className={`pointer-events-none absolute -top-8.75 left-0 z-0 w-24 md:h-39.5 select-none object-contain transition-all duration-700 ease-out ${
          "translate-x-0 translate-y-0 opacity-100 starting:-translate-x-full starting:-translate-y-full starting:opacity-0"
        }`}
      />

      {/* Decorative litchi — top:170px, right edge */}
      <Image
        src="/discover/litchi.webp"
        alt=""
        width={84}
        height={86}
        className={`pointer-events-none absolute right-0 top-25 md:top-[170.74px] z-0 hidden h-14 w-14 select-none md:block md:h-21.5 md:w-[83.5px] object-cover transition-all duration-700 ease-out ${
          "translate-x-0 translate-y-0 opacity-100 starting:translate-x-full starting:-translate-y-full starting:opacity-0"
        }`}
      />

      {/* Random bees — some flipped (-scale-x-100) on the WRAPPER so the flip
          doesn't fight the bee-float transform that animates the image. */}
      {BEES.map((b, i) => (
        <div
          key={i}
          className={`pointer-events-none absolute z-0 select-none ${b.className} ${
            !b.flip ? "-scale-x-100" : ""
          }`}
        >
          <Image
            src={b.src}
            alt=""
            width={80}
            height={80}
            className="bee-float w-7 object-contain"
            style={{ animationDelay: b.delay }}
          />
        </div>
      ))}

      {/* Close (top-right) -> back to home */}
      <Link
        href="/"
        aria-label="Close"
        className="fixed right-[max(1.25rem,calc(50vw-720px+1.25rem))] top-5 z-30 flex h-[24.61px] w-[24.61px] items-center justify-center rounded-sm bg-black/10 p-1.5 backdrop-blur-[2px] transition hover:bg-black/20"
      >
        <Image src="/cross.svg" alt="" width={21} height={21} unoptimized className="h-full w-full object-contain" />
      </Link>

      {/* Content layer — a flex column that fills the viewport so everything
          fits inside 100svh on ANY screen. The logo sits at the top; the two
          sections are centred in the remaining height. Sizes, gaps and paddings
          all scale with svh, so nothing overflows or has to scroll on short
          screens, and the spacing stays even on tall ones. */}
      <div className="absolute inset-0 z-10 flex flex-col overflow-hidden">
        {/* Logo */}
        <div className="flex shrink-0 justify-center pt-[clamp(0.5rem,2.5svh,1.5rem)] pb-[clamp(0.25rem,1svh,0.75rem)]">
          <Image
            src="/logo-1.webp"
            alt="Logo"
            width={120}
            height={109}
            priority
            className="w-[clamp(56px,9svh,80px)] object-contain drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)]"
          />
        </div>

        {/* Sections — centred in the leftover height with a scaling gap. */}
        <div className="flex min-h-0 flex-1 flex-col justify-center gap-[clamp(1rem,4svh,2.25rem)] px-5 pb-[clamp(0.75rem,2svh,1.5rem)] md:px-10">
          {/* What Makes It Truly Special */}
          <div className="mx-auto w-full md:max-w-[min(910px,128svh)]">
            <h2 className="mb-[clamp(0.4rem,1.6svh,1.25rem)] text-center text-[clamp(1rem,2.4svh,1.25rem)] font-bold leading-tight tracking-normal text-white [text-shadow:0px_3px_6px_rgba(0,0,0,0.4)] md:text-left md:text-[clamp(1.25rem,3.4svh,28px)]">
              What Makes it Truly Special
            </h2>
            <div className="-mr-5 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1 scrollbar-none [&::-webkit-scrollbar]:hidden md:mr-0 md:grid md:grid-cols-4 md:gap-6 md:overflow-visible md:pb-0">
              {TOP_CARDS.map((src, i) => (
                <div
                  key={src}
                  style={{ transitionDelay: `${i * 90}ms` }}
                  className={`relative aspect-482/586 h-[clamp(120px,27svh,225px)] w-auto shrink-0 snap-start overflow-hidden rounded-[11.34px] border-[0.5px] border-white shadow-[0px_3px_6px_rgba(0,0,0,0.23)] transition-all duration-500 ease-out md:h-auto md:w-full ${
                    "translate-y-0 opacity-100 starting:translate-y-6 starting:opacity-0"
                  }`}
                >
                  <Image src={src} alt="" fill sizes="(max-width: 768px) 200px, 240px" className="object-contain" />
                </div>
              ))}
            </div>
          </div>

          {/* Elevate your recipes */}
          <div className="mx-auto w-full md:max-w-[min(910px,128svh)]">
            <h2 className="mb-[clamp(0.4rem,1.6svh,1.25rem)] text-center text-[clamp(1rem,2.4svh,1.25rem)] font-bold leading-tight tracking-normal text-white [text-shadow:0px_3px_6px_rgba(0,0,0,0.4)] md:text-left md:text-[clamp(1.25rem,3.4svh,28px)]">
              Elevate Your Recipes with a Drizzle of Litchi Honey
            </h2>
            {/* Carousel: auto-advances + manual scroll + prev/next arrows.
                Desktop shows 4 cards; mobile is full-bleed on the right (-mr-5)
                so the next card peeks at the screen edge. */}
            <div className="relative">
              <div
                ref={carouselRef}
                className="-mr-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden md:mr-0 md:gap-6 md:pb-0 pb-[clamp(0.25rem,1.5svh,2.5rem)]"
              >
                {[...RECIPES, ...RECIPES, ...RECIPES].map((r, i) => {
                  // Only the middle copy is "real" for screen readers/keyboard.
                  const clone = i < RECIPES.length || i >= 2 * RECIPES.length;
                  return (
                  <button
                    type="button"
                    key={i}
                    aria-hidden={clone || undefined}
                    tabIndex={clone ? -1 : undefined}
                    onClick={() => setActive(r)}
                    style={{ transitionDelay: `${(TOP_CARDS.length + (i % RECIPES.length)) * 90}ms` }}
                    className={`relative h-[clamp(130px,26svh,240px)] w-[70vw] shrink-0 snap-start overflow-hidden rounded-[11.34px] border-[0.5px] border-white text-left shadow-[0px_3px_6px_rgba(0,0,0,0.23)] transition-all duration-500 ease-out hover:brightness-105 md:h-[clamp(140px,30svh,240px)] md:w-52 ${
                      "translate-y-0 opacity-100 starting:translate-y-6 starting:opacity-0"
                    }`}
                  >
                    <Image src={r.src} alt={r.title} fill sizes="(max-width: 768px) 240px, 300px" className="object-cover" />
                    <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/30 to-transparent p-3">
                      <p className="text-sm font-semibold leading-tight text-white">
                        {r.title}
                      </p>
                    </div>
                  </button>
                  );
                })}
              </div>

              {/* Prev / next arrows, vertically centred over the cards. */}
              <button
                type="button"
                aria-label="Previous"
                onClick={() => scrollByCard(-1)}
                className="absolute left-1 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/30 text-white backdrop-blur-[2px] transition hover:bg-black/50 md:flex"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                type="button"
                aria-label="Next"
                onClick={() => scrollByCard(1)}
                className="absolute right-1 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/30 text-white backdrop-blur-[2px] transition hover:bg-black/50 md:flex"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {active && <RecipePopup recipe={active} onClose={() => setActive(null)} />}
    </div>

      {/* Rendered OUTSIDE the blurred root so the chat's own backdrop-blur can
          actually blur the discover page behind it. Hidden while a recipe popup
          is open so the floating chat icon doesn't sit on top of it. */}
      {!active && <ChatWidget />}
    </>
  );
}
