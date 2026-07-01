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
  (n) => `/discover/upper-card/${n}.png?v=${ASSET_VERSION}`
);

// Recipes are data-driven from app/data/recipie.json. The Nth entry (card1..8)
// maps to its hero image at /discover/bottom-card/bN.png; every ingredient
// carries its own icon path, all rendered dynamically in the RecipePopup.
const RECIPES: Recipe[] = recipeData.map((r, i) => ({
  src: `/discover/bottom-card/b${i + 1}.png?v=${ASSET_VERSION}`,
  title: r.title,
  why: r.whyItWorks,
  ingredients: r.ingredients,
  method: r.method,
}));

// A few bees scattered around (gentle float via the .bee-float class).
const BEES = [
  { src: "/bee1.gif", className: "left-[12%] md:left-[5%] top-[7%] w-8 md:w-12", delay: "0s", flip: true },
  { src: "/bee1.gif", className: "right-[10%] top-[8%] w-8 md:w-12", delay: "0.6s", flip: true },
  { src: "/bee1.gif", className: "right-[7%] top-[44%] w-8 md:w-12", delay: "1.1s", flip: false },
  { src: "/bee1.gif", className: "left-[40%] bottom-[28%] w-7 md:w-10", delay: "1.6s", flip: true },
];

export default function Discover() {
  const [active, setActive] = useState<Recipe | null>(null);
  const [mounted, setMounted] = useState(false);

  // Trigger the staggered card reveal once the page mounts.
  useEffect(() => {
    const r = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(r);
  }, []);

  // Auto-advance the recipe carousel one view at a time (loops back at the end);
  // pauses on hover. Manual scroll/drag still works (native overflow-x).
  const carouselRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    const id = setInterval(() => {
      if (pausedRef.current) return;
      // Auto-slide on desktop only; off on mobile.
      if (!window.matchMedia("(min-width: 768px)").matches) return;
      // Advance ONE card at a time (leftmost slides out, a new one slides in);
      // loop back to the start at the end.
      const step =
        el.children.length > 1
          ? (el.children[1] as HTMLElement).offsetLeft -
            (el.children[0] as HTMLElement).offsetLeft
          : el.clientWidth;
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 8) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: step, behavior: "smooth" });
      }
    }, 3000);
    return () => clearInterval(id);
  }, []);

  // Prev/next arrows scroll by one card (card width + gap). Native scroll
  // clamps at the ends and snap-aligns the result.
  const scrollByCard = (dir: 1 | -1) => {
    const el = carouselRef.current;
    if (!el) return;
    const kids = el.children;
    const step =
      kids.length > 1
        ? (kids[1] as HTMLElement).offsetLeft - (kids[0] as HTMLElement).offsetLeft
        : el.clientWidth;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <>
    <div className="fixed inset-0 z-0 overflow-hidden  bg-black/35 backdrop-blur-[5px]">
      {/* SEO heading — visually hidden but present for crawlers/screen readers. */}
      <h1 className="sr-only">
        Dabur Litchi Honey — Recipes &amp; What Makes It Special
      </h1>

      {/* Decorative leaf — top-left corner (flipped 180deg) */}
      <Image
        src="/leaf.png"
        alt=""
        width={123}
        height={158}
        className={`pointer-events-none absolute -top-8.75 left-0 z-0 w-24 md:h-39.5 select-none object-contain transition-all duration-700 ease-out ${
          mounted ? "translate-x-0 translate-y-0 opacity-100" : "-translate-x-full -translate-y-full opacity-0"
        }`}
      />

      {/* Decorative litchi — top:170px, right edge */}
      <Image
        src="/discover/litchi.png"
        alt=""
        width={84}
        height={86}
        className={`pointer-events-none absolute right-0 top-25 md:top-[170.74px] z-0 hidden h-14 w-14 select-none md:block md:h-21.5 md:w-[83.5px] object-cover transition-all duration-700 ease-out ${
          mounted ? "translate-x-0 translate-y-0 opacity-100" : "translate-x-full -translate-y-full opacity-0"
        }`}
      />

      {/* Random bees — some flipped (-scale-x-100) on the WRAPPER so the flip
          doesn't fight the bee-float transform that animates the image. */}
      {BEES.map((b, i) => (
        <div
          key={i}
          className={`pointer-events-none absolute z-0 select-none ${b.className} ${
            b.flip ? "-scale-x-100" : ""
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
        className="fixed right-5 top-5 z-30 flex h-[24.61px] w-[24.61px] items-center justify-center rounded-sm bg-black/10 p-1.5 backdrop-blur-[2px] transition hover:bg-black/20"
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
            src="/logo-1.png"
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
          <div className="mx-auto w-full md:max-w-[min(830px,116svh)]">
            <h2 className="mb-[clamp(0.4rem,1.6svh,1.25rem)] text-center text-[clamp(1rem,2.4svh,1.25rem)] font-bold leading-tight tracking-normal text-white [text-shadow:0px_3px_6px_rgba(0,0,0,0.4)] md:text-left md:text-[clamp(1.25rem,3.4svh,28px)]">
              What Makes it Truly Special
            </h2>
            <div className="-mr-5 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1 scrollbar-none [&::-webkit-scrollbar]:hidden md:mr-0 md:grid md:grid-cols-4 md:gap-6 md:overflow-visible md:pb-0">
              {TOP_CARDS.map((src, i) => (
                <div
                  key={src}
                  style={{ transitionDelay: `${i * 90}ms` }}
                  className={`relative aspect-482/586 h-[clamp(120px,27svh,225px)] w-auto shrink-0 snap-start overflow-hidden rounded-[11.34px] border-[0.5px] border-white shadow-[0px_3px_6px_rgba(0,0,0,0.23)] transition-all duration-500 ease-out md:h-auto md:w-full ${
                    mounted ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
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
                onMouseEnter={() => {
                  pausedRef.current = true;
                }}
                onMouseLeave={() => {
                  pausedRef.current = false;
                }}
                className="-mr-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth  scrollbar-none [&::-webkit-scrollbar]:hidden md:mr-0 md:gap-6 md:pb-0 pb-[clamp(0.25rem,1.5svh,2.5rem)]"
              >
                {RECIPES.map((r, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setActive(r)}
                    style={{ transitionDelay: `${(TOP_CARDS.length + i) * 90}ms` }}
                    className={`relative h-[clamp(130px,26svh,240px)] w-[70vw] shrink-0 snap-start overflow-hidden rounded-[11.34px] border-[0.5px] border-white text-left shadow-[0px_3px_6px_rgba(0,0,0,0.23)] transition-all duration-500 ease-out hover:brightness-105 md:h-[clamp(140px,30svh,240px)] md:w-52 ${
                      mounted ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                    }`}
                  >
                    <Image src={r.src} alt={r.title} fill sizes="(max-width: 768px) 240px, 300px" className="object-cover" />
                    <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/30 to-transparent p-3">
                      <p className="text-sm font-semibold leading-tight text-white">
                        {r.title}
                      </p>
                    </div>
                  </button>
                ))}
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
