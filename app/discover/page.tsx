"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import RecipePopup, { type Recipe } from "../components/RecipePopup";
import ChatWidget from "../components/ChatWidget";

const TOP_CARDS = [1, 2, 3, 4].map((n) => `/discover/${n}.png`);

const RECIPES: Recipe[] = [
  {
    src: "/discover/b1.png",
    title: "Litchi Honey Citrus Sparkler",
    why: "Bright citrus enhances the honey's delicate floral-litchi notes while keeping the drink light, crisp, and refreshing.",
    ingredients: [
      "Litchi Honey",
      "Lime Juice",
      "Orange Juice",
      "Sparkling Water",
      "Mint",
      "Grapefruit slice",
    ],
    method: [
      "Stir honey with lime juice till it dissolves.",
      "Add orange juice and ice.",
      "Top with sparkling water.",
      "Garnish with mint and grapefruit.",
    ],
  },
  {
    src: "/discover/b2.png",
    title: "Litchi Honey Tropical Salad",
    why: "Litchi honey balances the tangy tropical fruit with a smooth floral sweetness.",
    ingredients: [
      "Litchi Honey",
      "Mango",
      "Pineapple",
      "Cucumber",
      "Mixed Greens",
      "Lime",
    ],
    method: [
      "Whisk honey with lime juice for the dressing.",
      "Chop mango, pineapple and cucumber.",
      "Toss with mixed greens.",
      "Drizzle the dressing and serve.",
    ],
  },
  {
    src: "/discover/b3.png",
    title: "Litchi Honey Overnight Oats",
    why: "Slow-soaked oats let the litchi honey infuse every spoonful with gentle sweetness.",
    ingredients: [
      "Litchi Honey",
      "Rolled Oats",
      "Milk",
      "Chia Seeds",
      "Banana",
      "Berries",
    ],
    method: [
      "Mix oats, milk and chia seeds.",
      "Stir in litchi honey.",
      "Refrigerate overnight.",
      "Top with banana and berries.",
    ],
  },
  {
    src: "/discover/b4.png",
    title: "Litchi Honey Malai Toast",
    why: "Creamy malai and litchi honey create a rich, indulgent toast with floral depth.",
    ingredients: [
      "Litchi Honey",
      "Bread",
      "Malai",
      "Pistachios",
      "Saffron",
      "Rose petals",
    ],
    method: [
      "Toast the bread till golden.",
      "Spread a layer of malai.",
      "Drizzle litchi honey generously.",
      "Garnish with pistachios and saffron.",
    ],
  },
];

// 8 cards for the carousel: the 4 recipes repeated, so desktop shows 4 and
// auto-slides to the next 4. Swap in 8 distinct recipes when available.
const CAROUSEL_RECIPES = [...RECIPES, ...RECIPES];

// A few bees scattered around (gentle float via the .bee-float class).
const BEES = [
  { src: "/bee1.gif", className: "left-[13%] top-[12%] w-8 md:w-12", delay: "0s" },
  { src: "/bee1.gif", className: "right-[18%] top-[16%] w-8 md:w-12", delay: "0.6s" },
  { src: "/bee1.gif", className: "right-[7%] top-[44%] w-8 md:w-12", delay: "1.1s" },
  { src: "/bee1.gif", className: "left-[40%] bottom-[28%] w-7 md:w-10", delay: "1.6s" },
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
      const { scrollLeft, clientWidth, scrollWidth } = el;
      if (scrollLeft + clientWidth >= scrollWidth - 8) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: clientWidth, behavior: "smooth" });
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
    <div className="fixed inset-0 z-0 overflow-hidden bg-black/35 backdrop-blur-[5px]">
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
        className={`pointer-events-none absolute right-0 top-25 md:top-[170.74px] z-0 h-14 w-14 md:h-21.5 md:w-[83.5px] select-none object-cover transition-all duration-700 ease-out ${
          mounted ? "translate-x-0 translate-y-0 opacity-100" : "translate-x-full -translate-y-full opacity-0"
        }`}
      />

      {/* Random bees */}
      {BEES.map((b, i) => (
        <Image
          key={i}
          src={b.src}
          alt=""
          width={80}
          height={80}
          className={`bee-float pointer-events-none absolute z-0 select-none object-contain ${b.className}`}
          style={{ animationDelay: b.delay }}
        />
      ))}

      {/* Close (top-right) -> back to home */}
      <Link
        href="/"
        aria-label="Close"
        className="fixed right-5 top-5 z-30 flex h-[24.61px] w-[24.61px] items-center justify-center rounded-sm bg-black/10 p-1.5 backdrop-blur-[2px] transition hover:bg-black/20"
      >
        <Image src="/cross.svg" alt="" width={21} height={21} unoptimized className="h-full w-full object-contain" />
      </Link>

      {/* Scrollable content layer — decorations above stay fixed */}
      <div className="absolute inset-0 z-10 overflow-hidden [@media(max-width:767px)_and_(max-height:680px)]:overflow-y-auto">
      {/* Logo */}
      <div className="flex justify-center pt-6">
        <Image
          src="/logo-1.png"
          alt="Logo"
          width={120}
          height={109}
          priority 
          className="w-20 object-contain drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)]"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-5 pb-6 pt-6 md:px-10">
        {/* What Makes It Truly Special */}
        <div className="mx-auto w-full md:w-full">
          <h2 className="mb-5 text-xl md:text-[28px] font-bold text-center md:text-left leading-none tracking-normal text-white [text-shadow:0px_3px_6px_rgba(0,0,0,0.4)]">
            What Makes It Truly Special
          </h2>
          <div className="-mr-5 flex gap-4 overflow-x-auto pb-2 scrollbar-none [&::-webkit-scrollbar]:hidden md:mr-0 md:flex-wrap md:gap-6 md:overflow-visible md:pb-0">
            {TOP_CARDS.map((src, i) => (
              <div
                key={src}
                style={{ transitionDelay: `${i * 90}ms` }}
                className={`recipe-card aspect-[482/586] relative overflow-hidden rounded-[11.34px] border-[0.5px] border-white shadow-[0px_3px_6px_rgba(0,0,0,0.23)] transition-all duration-500 ease-out ${
                  mounted ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                }`}
              >
                <Image src={src} alt="" fill sizes="(max-width: 768px) 200px, 240px" className="object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Elevate your recipes */}
        <div className="mx-auto mt-6 w-full">
          <h2 className="mb-5 text-xl md:text-[28px] font-bold text-center md:text-left leading-[29.57px] tracking-normal text-white [text-shadow:0px_3px_6px_rgba(0,0,0,0.4)]">
            Elevate your recipes with a drizzle of Litchi honey
          </h2>
          {/* Carousel: auto-advances + manual scroll + prev/next arrows.
              Desktop shows exactly 4 (.recipe-card); mobile is full-bleed on the
              right (-mr-5) so the next card peeks at the screen edge. */}
          <div className="relative">
          <div
            ref={carouselRef}
            onMouseEnter={() => {
              pausedRef.current = true;
            }}
            onMouseLeave={() => {
              pausedRef.current = false;
            }}
            className="-mr-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 scrollbar-none [&::-webkit-scrollbar]:hidden md:mr-0 md:gap-6 md:pb-0"
          >
            {CAROUSEL_RECIPES.map((r, i) => (
            <button
              type="button"
              key={i}
              onClick={() => setActive(r)}
              style={{ transitionDelay: `${(TOP_CARDS.length + i) * 90}ms` }}
              className={`recipe-card relative h-50 snap-start overflow-hidden rounded-[11.34px] border-[0.5px] border-white text-left shadow-[0px_3px_6px_rgba(0,0,0,0.23)] transition-all duration-500 ease-out hover:brightness-105 md:h-60 ${
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
            className="absolute left-1 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 md:flex items-center justify-center rounded-full border border-white/30 bg-black/30 text-white backdrop-blur-[2px] transition hover:bg-black/50"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={() => scrollByCard(1)}
            className="absolute right-1 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 md:flex items-center justify-center rounded-full border border-white/30 bg-black/30 text-white backdrop-blur-[2px] transition hover:bg-black/50"
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

      {/* Floating chat (fixed bottom-right corner) */}
      <ChatWidget />
    </div>
  );
}
