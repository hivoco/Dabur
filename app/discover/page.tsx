"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import RecipePopup, { type Recipe } from "../components/RecipePopup";

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

// A few bees scattered around (gentle float via the .bee-float class).
const BEES = [
  { src: "/bee1.png", className: "left-[13%] top-[12%] w-8 md:w-12", delay: "0s" },
  { src: "/bee1.png", className: "right-[18%] top-[16%] w-8 md:w-12", delay: "0.6s" },
  { src: "/bee1.png", className: "right-[7%] top-[44%] w-8 md:w-12", delay: "1.1s" },
  { src: "/bee1.png", className: "left-[40%] bottom-[28%] w-7 md:w-10", delay: "1.6s" },
];

export default function Discover() {
  const [active, setActive] = useState<Recipe | null>(null);
  const [mounted, setMounted] = useState(false);

  // Trigger the staggered card reveal once the page mounts.
  useEffect(() => {
    const r = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(r);
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-black/35 backdrop-blur-[2px]">
      {/* Decorative leaf — top-left corner (flipped 180deg) */}
      <Image
        src="/leaf.png"
        alt=""
        width={123}
        height={158}
        className={`pointer-events-none absolute -top-8.75 left-0 z-0 h-39.5  select-none object-contain transition-all duration-700 ease-out ${
          mounted ? "translate-x-0 translate-y-0 opacity-100" : "-translate-x-full -translate-y-full opacity-0"
        }`}
      />

      {/* Decorative litchi — top:170px, right edge */}
      <Image
        src="/discover/litchi.png"
        alt=""
        width={84}
        height={86}
        className={`pointer-events-none absolute right-0 top-[170.74px] z-0 h-21.5 w-[83.5px] select-none object-cover transition-all duration-700 ease-out ${
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

      {/* Back to home */}
      <Link
        href="/"
        aria-label="Back"
        className="fixed left-5 top-5 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/25 text-white backdrop-blur-[2px] transition hover:bg-black/40"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <polyline points="15 18 9 12 15 6" />
        </svg>
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
          className="w-20 object-contain md:w-24"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-5 pb-6 pt-6 md:px-10">
        {/* What Makes It Truly Special */}
        <div className="mx-auto w-full md:w-fit">
          <h2 className="mb-5 text-xl md:text-[28px] font-bold text-center md:text-left leading-none tracking-normal text-white">
            What Makes It Truly Special
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none [&::-webkit-scrollbar]:hidden md:flex-wrap md:gap-6 md:overflow-visible md:pb-0">
            {TOP_CARDS.map((src, i) => (
              <div
                key={src}
                style={{ transitionDelay: `${i * 90}ms` }}
                className={`relative h-50 w-50 shrink-0 md:h-60 md:w-60 overflow-hidden rounded-[11.34px] border-[0.5px] border-white shadow-[0px_3px_6px_rgba(0,0,0,0.23)] transition-all duration-500 ease-out ${
                  mounted ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                }`}
              >
                <Image src={src} alt="" fill sizes="(max-width: 768px) 200px, 240px" className="object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Elevate your recipes */}
        <div className="mx-auto mt-6 w-full md:w-fit">
          <h2 className="mb-5 text-xl md:text-[28px] font-bold text-center md:text-left leading-[29.57px] tracking-normal text-white">
            Elevate your recipes with a drizzle of Litchi honey
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none [&::-webkit-scrollbar]:hidden md:flex-wrap md:gap-6 md:overflow-visible md:pb-0">
            {RECIPES.map((r, i) => (
            <button
              type="button"
              key={r.src}
              onClick={() => setActive(r)}
              style={{ transitionDelay: `${(TOP_CARDS.length + i) * 90}ms` }}
              className={`relative h-50 w-50 shrink-0 md:h-60 md:w-60 overflow-hidden rounded-[11.34px] border-[0.5px] border-white text-left shadow-[0px_3px_6px_rgba(0,0,0,0.23)] transition-all duration-500 ease-out hover:brightness-105 ${
                mounted ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
              }`}
            >
              <Image src={r.src} alt={r.title} fill sizes="(max-width: 768px) 200px, 240px" className="object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/30 to-transparent p-3">
                <p className="text-sm font-semibold leading-tight text-white">
                  {r.title}
                </p>
              </div>
            </button>
          ))}
          </div>
        </div>
      </div>
      </div>

      {active && <RecipePopup recipe={active} onClose={() => setActive(null)} />}
    </div>
  );
}
