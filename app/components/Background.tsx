"use client";

import { createContext, useContext, useState, useEffect } from "react";
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
  const [step, setStep] = useState(MOBILE_STEP);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setStep(mq.matches ? DESKTOP_STEP : MOBILE_STEP);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const showLeft = () => setPosX((p) => Math.max(0, p - step));
  const showRight = () => setPosX((p) => Math.min(100, p + step));
  const center = () => setPosX(50);

  return (
    <BackgroundContext.Provider value={{ showLeft, showRight, center }}>
      <div
        aria-hidden
        className="app-bg fixed inset-0 -z-10"
        style={{ "--bg-pos-x": `${posX}%` } as CSSProperties}
      />
      {children}
    </BackgroundContext.Provider>
  );
}
