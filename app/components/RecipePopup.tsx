"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

export type Recipe = {
  src: string;
  title: string;
  why: string;
  ingredients: string[];
  method: string[];
};

function StarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#E5AF62" aria-hidden>
      <path d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.2 20.4l1.1-6.5L2.6 9.3l6.5-.9L12 2.5z" />
    </svg>
  );
}

// Generic placeholder icon for ingredients (swap with real per-ingredient icons).
function IngredientIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3c3.5 3.8 5.5 6.8 5.5 9.5a5.5 5.5 0 1 1-11 0C6.5 9.8 8.5 6.8 12 3Z" />
    </svg>
  );
}

function WhyCard({ why, className = "" }: { why: string; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-[#e2d6bf] bg-white/40 p-4 ${className}`}
    >
      <div className="flex items-center gap-2">
        <StarIcon />
        <span className="text-[13px] font-bold tracking-wide text-[#2e2212]">
          WHY IT WORKS
        </span>
      </div>
      <p className="mt-1.5 text-sm italic leading-snug text-[#6b5a3c]">{why}</p>
    </div>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex flex-col"
      style={{
        gap: "8.86px",
        borderLeft: "1.77px solid #4B5320",
        borderRadius: "8.86px",
        padding: "7.09px 8.86px 7.09px 17.72px",
      }}
    >
      <h3 className="text-[13px] font-bold tracking-[0.18em] text-[#3a2a12]">
        {label}
      </h3>
      {children}
    </div>
  );
}

export default function RecipePopup({
  recipe,
  onClose,
}: {
  recipe: Recipe;
  onClose: () => void;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const r = requestAnimationFrame(() => setShow(true));
    return () => cancelAnimationFrame(r);
  }, []);

  const handleClose = () => {
    // Play the exit animation (slide down on mobile / scale-fade on desktop),
    // then unmount once it finishes.
    setShow(false);
    setTimeout(onClose, 500);
  };

  return createPortal(
    <div
      onClick={handleClose}
      className={`fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-[20px] transition-opacity duration-300 md:items-center md:p-6 ${
        show ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative flex h-[90vh] w-full max-w-249 flex-col overflow-y-auto rounded-t-3xl p-5 transition-all duration-500 ease-out md:h-140 md:rounded-[24.89px] md:p-7 md:overflow-hidden ${
          show
            ? "translate-y-0 opacity-100 md:scale-100"
            : "translate-y-full opacity-0 md:translate-y-0 md:scale-95"
        }`}
        style={{ background: "#FFF9EE", boxShadow: "0px 5px 15px rgba(0,0,0,0.50)" }}
      >
        {/* Drag handle (mobile bottom-sheet) */}
        <div className="mx-auto mb-3 h-1.5 w-36 shrink-0 rounded-full bg-[#1D1D1D] md:hidden" />

        {/* Back */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Back"
          className="absolute left-5 top-5 z-10 flex h-8 w-8 items-center justify-center text-[#3a2a12] transition hover:opacity-70"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Title */}
        <h2 className="text-center text-xl font-bold text-[#2e2212] md:text-2xl">
          {recipe.title}
        </h2>

        {/* Content */}
        <div className="mt-5 flex flex-col gap-5 md:min-h-0 md:flex-1 md:flex-row md:gap-7">
          {/* Left: image + why it works */}
          <div className="flex flex-col gap-4 md:min-h-0 md:w-[52%]">
            <div className="relative h-56 w-full shrink-0 overflow-hidden rounded-2xl md:h-auto md:flex-1">
              <Image
                src={recipe.src}
                alt={recipe.title}
                fill
                sizes="(max-width: 768px) 100vw, 520px"
                className="object-cover"
              />
            </div>
            {/* Desktop: sits under the image */}
            <WhyCard why={recipe.why} className="hidden md:block" />
          </div>

          {/* Right: ingredients + method */}
          <div className="flex flex-col gap-6 md:min-h-0 md:w-[48%] md:overflow-y-auto md:pr-1">
            <Section label="INGREDIENTS">
              <div className="grid grid-cols-4 gap-x-2 gap-y-4">
                {recipe.ingredients.map((ing) => (
                  <div key={ing} className="flex flex-col items-center gap-1.5 text-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#4B5320] bg-[#4B532026]/30 text-black">
                      <IngredientIcon />
                    </span>
                    <span className="text-[10px] font-medium leading-tight text-[#3a2a12]">
                      {ing}
                    </span>
                  </div>
                ))}
              </div>
            </Section>

            <Section label="METHOD">
              <div className="flex flex-col gap-2">
                {recipe.method.map((step, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-[#4B5320] bg-white/50 px-2 py-2 text-sm text-black"
                  >
                    {step}
                  </div>
                ))}
              </div>
            </Section>
          </div>

          {/* Mobile: below everything */}
          <WhyCard why={recipe.why} className="md:hidden" />
        </div>
      </div>
    </div>,
    document.body
  );
}
