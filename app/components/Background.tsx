"use client";

import { createContext, useContext, useState } from "react";
import { preload } from "react-dom";
import type { CSSProperties, ReactNode } from "react";

// 50% = centered. Lower reveals the LEFT of the image (image slides right);
// higher reveals the RIGHT of the image (image slides left).
// Step is responsive: 40 on mobile/tablet, 150 on desktop so a single click
// jumps fully to either edge.
const MOBILE_STEP = 40;
const DESKTOP_STEP = 150;

type BackgroundControls = {
  showLeft: () => void;
  showRight: () => void;
  center: () => void;
};

const BackgroundContext = createContext<BackgroundControls | null>(null);

export function useBackground(): BackgroundControls {
  const ctx = useContext(BackgroundContext);
  if (!ctx) {
    throw new Error("useBackground must be used within <BackgroundProvider>");
  }
  return ctx;
}

export default function BackgroundProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [posX, setPosX] = useState(50);

  // The background is a CSS image, so the browser only finds it after the
  // stylesheet loads. Preload the right size up front (it is the biggest asset
  // on every page); media queries match .app-bg in globals.css.
  preload("/bg-mobile.webp", { as: "image", fetchPriority: "high", media: "(max-width: 767px)" });
  preload("/bg.webp", { as: "image", fetchPriority: "high", media: "(min-width: 768px)" });

  // Read the step at call time (not from state) so it's correct even on a direct
  // page visit, before any resize listener could run.
  const step = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(min-width: 1024px)").matches
      ? DESKTOP_STEP
      : MOBILE_STEP;

  const showLeft = () => setPosX((p) => Math.max(0, p - step()));
  const showRight = () => setPosX((p) => Math.min(100, p + step()));
  const center = () => setPosX(50);

  return (
    <BackgroundContext.Provider value={{ showLeft, showRight, center }}>
      <div
        aria-hidden
        className="app-bg fixed inset-y-0 -inset-x-[4vw] -z-10"
        style={
          {
            "--bg-pos-x": `${posX}%`,
            // The layer is 4vw wider than the screen on each side; translating
            // it up to ±4vw gives a visible slide even when the image is no
            // wider than the screen (desktop/tablet).
            "--bg-shift": `${((50 - posX) / 50) * 4}vw`,
          } as CSSProperties
        }
      />
      {children}
    </BackgroundContext.Provider>
  );
}
