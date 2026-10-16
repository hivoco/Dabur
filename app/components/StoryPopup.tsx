"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import VideoPlayer from "./VideoPlayer";
import { useEscClose } from "../lib/useEscClose";
import womenData from "../data/women.json";

// One women story is chosen at random per browser TAB and reused for every
// StoryPopup open in that tab (persisted in sessionStorage, cleared when the tab
// closes). A fresh tab/visit gets a new random story.
const STORY_KEY = "women-story-index";

export default function StoryPopup({ onClose }: { onClose: () => void }) {
  // Visible from the first (server) render so it counts for LCP without waiting
  // for JS; the entrance animation is pure CSS (`starting:` = @starting-style).
  // `show` only flips to false to play the exit.
  const [show, setShow] = useState(true);

  // Deterministic default for SSR / first paint (avoids a hydration mismatch);
  // the per-tab story is resolved on the client in the effect below.
  const [story, setStory] = useState(womenData[0]);

  // Resolve the per-tab story once on the client.
  useEffect(() => {
    let idx: number;
    try {
      const saved = sessionStorage.getItem(STORY_KEY);
      if (saved !== null && womenData[Number(saved)]) {
        idx = Number(saved);
      } else {
        idx = Math.floor(Math.random() * womenData.length);
        sessionStorage.setItem(STORY_KEY, String(idx));
      }
    } catch {
      idx = Math.floor(Math.random() * womenData.length);
    }
    setStory(womenData[idx]);
  }, []);


  // Play the slide-out-left exit, then let the parent recenter the bg + unmount.
  const handleClose = () => {
    setShow(false);
    onClose();
  };

  useEscClose(handleClose);

  return (
    <div
      onClick={handleClose}
      className={`full-bleed fixed inset-y-0 z-50 flex items-center justify-center bg-black/15 p-0 backdrop-blur-[4px] transition-opacity duration-300 md:items-center md:px-6 md:pb-6 md:pt-26 md:portrait:pb-32 ${
        show ? "opacity-100 starting:opacity-0" : "opacity-0"
      }`}
    >
      {/*
        MOBILE: a single column that fills the screen and NEVER scrolls. Fixed
        bits (logo, title, caption, fact card) sit at their natural size; the
        video scales with screen height (svh) and the woman flexes to fill the
        leftover space, so it always fits without overlap. Text sizes use clamp()
        so they shrink on short screens and grow on tall ones.
        DESKTOP (@2xl, container query on this card): two-column layout with the
        woman as a bottom-right cutout.
        PORTRAIT TABLET (md:portrait): the card grows taller (up to 900px) so the
        woman sits below the "Did You Know" card instead of over its text, and
        the extra bottom padding keeps it clear of the chat button.
      */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-glass-dark @container relative flex h-svh w-full flex-col overflow-hidden border-white/40 shadow-[0_8px_60px_rgba(0,0,0,0.35)] backdrop-blur-[2px] transition-all duration-500 ease-out md:h-[calc(100svh-128px)] md:max-h-155 md:portrait:h-[calc(100svh-232px)] md:portrait:max-h-225 md:max-w-5xl [@media(max-height:700px)]:md:max-w-200 md:rounded-[28px] md:border ${
          show ? "translate-x-0 opacity-100 starting:-translate-x-32 starting:opacity-0" : "-translate-x-32 opacity-0"
        }`}
      >
        {/* Close */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="absolute right-5 top-5 z-30 flex h-[24.61px] w-[24.61px] items-center justify-center rounded-sm bg-black/10 p-1.5 backdrop-blur-[2px] transition hover:bg-black/20"
        >
          <Image src="/cross.svg" alt="" width={21} height={21} unoptimized className="h-full w-full object-contain" />
        </button>

        {/* Brand logo — mobile, top centre */}
        <Image
          src="/logo-1.webp"
          alt="Logo"
          width={120}
          height={109}
          className="mt-[clamp(0.25rem,0.8svh,0.5rem)] mb-[clamp(0.4rem,1.4svh,0.75rem)] w-[clamp(48px,11svh,80px)] shrink-0 self-center object-contain @2xl:hidden"
        />

        {/* Title */}
        <div className="flex shrink-0 flex-col  items-center px-6 pt-1 @2xl:pt-6">
          <Image src="/mask2.webp" alt="" width={130} height={22} className="h-auto w-[clamp(48px,11svh,80px)] object-contain @2xl:w-32" />
          <h2 className="text-center text-[clamp(0.9rem,2.6svh,1.4rem)] font-semibold text-white [text-shadow:0px_4px_4px_#000000] @2xl:text-[clamp(15px,3.4svh,26px)]">
            {story.title}
          </h2>
          <Image src="/mask2.webp" alt="" width={130} height={22} className="h-auto w-[clamp(48px,11svh,80px)] rotate-180 object-contain @2xl:w-32" />
        </div>

        {/* Main — stacked on mobile, two columns on desktop */}
        <div className="flex w-full shrink-0 flex-col items-center gap-[clamp(0.4rem,1.4svh,0.75rem)] px-6 pt-[calc(clamp(30px,6.75svh,54px)+14px)] @2xl:pt-[clamp(0.4rem,1.4svh,0.75rem)] @2xl:min-h-0 @2xl:flex-1 @2xl:flex-row @2xl:items-center @2xl:justify-evenly @2xl:gap-8 @2xl:px-10">
          {/* Video + caption */}
          <div className="flex w-full flex-col  items-center @2xl:w-[58%]">
            <div className="relative w-full">
              <VideoPlayer
                src={story.video}
                className="h-[clamp(90px,24svh,230px)] w-full overflow-hidden rounded-[17.39px] border border-white shadow-lg @2xl:aspect-auto [@media(min-height:701px)]:@2xl:h-auto [@media(max-height:700px)]:@2xl:h-[clamp(150px,40svh,330px)] [@media(max-height:700px)]:@2xl:w-auto"
              />
              {/* JEEViKA badge — mobile: ~3/4 of it sits ABOVE the video so it
                  only nips the top-right corner. The main block's top padding
                  reserves that height + the 10px bounce, so it never reaches the
                  heading; the woman (flex-1) gives up that space on short
                  screens. */}
              <Image
                src="/jivika.webp"
                alt="JEEViKA"
                width={98}
                height={98}
                className="absolute jivika-bounce -top-[clamp(30px,6.75svh,54px)] right-1 z-10 h-[clamp(40px,9svh,72px)] w-[clamp(40px,9svh,72px)] rounded-full object-contain @2xl:hidden"
              />
            </div>
            <p className="mt-2 text-center text-[clamp(0.78rem,1.9svh,1rem)] font-semibold text-white [text-shadow:0px_3px_6px_rgba(0,0,0,0.4)] @2xl:mt-4 @2xl:text-lg [@media(max-height:700px)]:@2xl:text-sm">
              {story.caption}
            </p>
          </div>

          {/* Did You Know card */}
          <div className="relative isolate w-full @2xl:w-[42%] md:-mt-28">
            <div className="bg-glass-soft relative z-0 rounded-[28.718px] border border-white/40 p-[clamp(0.6rem,2svh,1rem)] @2xl:p-5">
              <Image src="/quate.webp" alt="" width={19} height={19} className="absolute -top-2 left-4 w-3 object-contain @2xl:w-6" />
              <h3 className="text-[clamp(0.9rem,2.2svh,1.25rem)] font-semibold leading-none tracking-normal text-white @2xl:text-[clamp(15px,3svh,23.93px)]">
                Did You Know?
              </h3>
              <p className="mt-2 max-w-5/6 text-[clamp(0.72rem,1.65svh,0.95rem)] font-semibold leading-snug tracking-normal text-white @2xl:text-[clamp(11px,1.9svh,15px)]">
                {story.didYouKnow}
              </p>
              <Image src="/quate.webp" alt="" width={19} height={19} className="absolute -bottom-2 right-4 w-3 rotate-180 object-contain @2xl:w-6" />
            </div>
            {/* JEEViKA logo — desktop. A SIBLING of the card (not a child) so it
                always paints after/above the box and can never slip behind it. */}
            <Image
              src="/jivika.webp"
              alt="JEEViKA"
              width={98}
              height={98}
              className="jivika-bounce pointer-events-none absolute -top-[clamp(4.25rem,16svh,6.75rem)] right-2 z-50 hidden h-[clamp(56px,13svh,97px)] w-[clamp(56px,13svh,97px)] rounded-full object-contain @2xl:block"
            />
          </div>
        </div>

        {/* Woman — mobile: flexes to fill the leftover space and touches the
            bottom; desktop: cutout pinned to the bottom-right corner. */}
        <Image
          src={story.image}
          alt=""
          width={300}
          height={300}
          className="pointer-events-none relative z-20 -mt-5.75 min-h-0 w-full  flex-1 select-none object-contain object-bottom-right @2xl:absolute @2xl:bottom-0 @2xl:right-0 @2xl:mt-0 @2xl:h-auto @2xl:w-[clamp(110px,30svh,215px)] @2xl:flex-none @2xl:object-bottom"
        />
      </div>
    </div>
  );
}
