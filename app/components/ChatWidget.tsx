"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import ChatPanel from "./ChatPanel";
import { useEscClose } from "../lib/useEscClose";

const GREETING = "Hi, I’m your Chief Honey Officer (CHO)";
const SECOND = "Ask the CHO";

const DELETE_MS = 35; // per-char delete speed
const TYPE_MS = 55; // per-char type speed
const SWITCH_PAUSE = 250; // gap between deleting and typing

// `triggerClassName` styles the closed button's container. Default = floating
// bottom-right corner (used standalone, e.g. on /discover). The home page passes
// a class that makes it an in-flow flex item so it can sit in a centred row.
export default function ChatWidget({
  triggerClassName,
  desktopBackdrop = false,
}: {
  triggerClassName?: string;
  desktopBackdrop?: boolean;
}) {
  const [open, setOpen] = useState(false); // chat panel open/closed
  const [shown, setShown] = useState(false); // slide-in from the right
  const [text, setText] = useState(GREETING); // animated text
  const [showBee, setShowBee] = useState(true); // bee collapses on switch

  useEscClose(() => {
    if (open) setOpen(false);
  });

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const raf = requestAnimationFrame(() => setShown(true));

    const typeChar = (s: string) => {
      if (s.length >= SECOND.length) return;
      const next = SECOND.slice(0, s.length + 1);
      setText(next);
      timers.push(setTimeout(() => typeChar(next), TYPE_MS));
    };

    const deleteChar = (s: string) => {
      if (s.length === 0) {
        timers.push(setTimeout(() => typeChar(""), SWITCH_PAUSE));
        return;
      }
      const next = s.slice(0, -1);
      setText(next);
      timers.push(setTimeout(() => deleteChar(next), DELETE_MS));
    };

    // After 2s: fade the bee out and start deleting the greeting.
    timers.push(
      setTimeout(() => {
        setShowBee(false);
        deleteChar(GREETING);
      }, 2000)
    );

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <>
      {/* Mobile: blur + dim the page behind the open chat panel. */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          aria-hidden
          className={`fixed inset-0 z-60 bg-black/60 backdrop-blur-xl ${
            desktopBackdrop ? "" : "md:hidden"
          }`}
        />
      )}
      <div
      className={
        open
          ? // Open: full-height column on mobile so the logo takes its own space
            // at the top and the panel fills the remaining height below it. The
            // wrapper is pointer-events-none so taps on the empty area fall
            // through to the backdrop (which closes the chat). On desktop it
            // collapses to the bottom-right corner.
            "pointer-events-none fixed inset-0 z-70 flex flex-col items-center gap-2 px-4 pt-4 pb-5 md:inset-auto md:bottom-5 md:right-5 md:items-end md:gap-0 md:p-0"
          : (triggerClassName ??
            "fixed bottom-5 right-5 z-70 flex flex-col items-end gap-3")
      }
    >
      {open ? (
        <>
          {/* Brand logo — mobile: takes its own space at the top so the panel
              fills the remaining height below it. Hidden on desktop. */}
          <Image
            src="/logo-1.png"
            alt="Logo"
            width={120}
            height={109}
            className="pointer-events-none w-20 shrink-0 select-none object-contain drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)] md:hidden"
          />
          <ChatPanel onClose={() => setOpen(false)} />
        </>
      ) : (
        <>
      {/* Glass card: slides in from the right, then swaps text with a typewriter effect */}
      <div
        className={`bg-glass md:flex hidden  items-center rounded-full border border-white/30 px-3 md:py-1 shadow-[0_4px_30px_rgba(0,0,0,0.15)] backdrop-blur-[2px] transition-[transform,opacity] duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          shown ? "translate-x-0 opacity-100" : "translate-x-[120%] opacity-0"
        }`}
      >
        {/* Bee collapses + fades when switching to the short text */}
        <div
          className={`overflow-hidden transition-all duration-500 ease-out ${
            showBee ? "mr-3 max-w-11 opacity-100" : "mr-0 max-w-0 opacity-0"
          }`}
        >
          <Image
            src="/chat-bee.png"
            alt=""
            width={132}
            height={132}
            className="h-11 w-11 shrink-0 object-contain"
          />
        </div>

        <span className="max-w-56 text-xl md:text-sm font-semibold leading-tight text-white">
          {text}
        </span>
      </div>

      {/* Circular glass chat button */}
      <button
        type="button"
        aria-label="Open chat"
        onClick={() => setOpen(true)}
        className="bg-glass flex h-[48.51px] w-[48.51px] items-center justify-center rounded-full border border-white/30 shadow-[0_4px_30px_rgba(0,0,0,0.15)] backdrop-blur-[2px] transition hover:backdrop-blur-[5px]"
      >
        <Image
          src="/chat.png"
          alt="Chat"
          width={104}
          height={104}
          className="h-7 w-7 object-contain"
        />
      </button>
        </>
      )}
    </div>
    </>
  );
}
