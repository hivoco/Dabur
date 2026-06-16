"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import VideoPlayer from "./VideoPlayer";

// "Did You Know?" body — supports HTML markup (e.g. <br/>, <strong>) so it can
// be made dynamic later. Keep this trusted (not user-supplied) input.
const DID_YOU_KNOW_HTML =
  "Every spoon of litchi honey holds the work of bees visiting millions of flowers over incredible distances equal to three times around the Earth.";

export default function StoryPopup({ onClose }: { onClose: () => void }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const r = requestAnimationFrame(() => setShow(true));
    return () => cancelAnimationFrame(r);
  }, []);

  // Play the slide-out-left exit, then let the parent recenter the bg + unmount.
  const handleClose = () => {
    setShow(false);
    onClose();
  };

  return (
    <div
      onClick={handleClose}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/5 p-0 backdrop-blur-[2px] transition-opacity duration-300 md:p-6 ${
        show ? "opacity-100" : "opacity-0"
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
      */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-glass-dark @container relative flex h-svh w-full flex-col overflow-hidden border-white/40 shadow-[0_8px_60px_rgba(0,0,0,0.35)] backdrop-blur-[2px] transition-all duration-500 ease-out md:h-[90vh] md:max-h-155 md:max-w-290 md:rounded-[28px] md:border ${
          show ? "translate-x-0 opacity-100" : "-translate-x-32 opacity-0"
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

        {/* JEEViKA logo — desktop, top-right */}
        <Image
          src="/jivika.png"
          alt="JEEViKA"
          width={98}
          height={98}
          className="absolute jivika-bounce  right-20 top-24 z-10 hidden h-[97.37px] w-[97.37px] rotate-[0.5deg] rounded-full object-contain @2xl:block"
        />

        {/* Brand logo — mobile, top centre */}
        <Image
          src="/logo-1.png"
          alt="Logo"
          width={120}
          height={109}
          className="mt-2 mb-3 w-20 shrink-0 self-center object-contain @2xl:hidden"
        />

        {/* Title */}
        <div className="flex shrink-0 flex-col items-center px-6 pt-1 @2xl:pt-6">
          <Image src="/mask2.png" alt="" width={130} height={22} className="h-auto w-20 object-contain @2xl:w-32" />
          <h2 className="text-center text-[clamp(1rem,2.6svh,1.4rem)] font-semibold text-white [text-shadow:0px_4px_4px_#000000] @2xl:text-[26px]">
            Behind Every Drop, A Story of Empowerment
          </h2>
          <Image src="/mask2.png" alt="" width={130} height={22} className="h-auto w-20 rotate-180 object-contain @2xl:w-32" />
        </div>

        {/* Main — stacked on mobile, two columns on desktop */}
        <div className="flex w-full shrink-0 flex-col items-center gap-3 px-6 pt-3 @2xl:min-h-0 @2xl:flex-1 @2xl:flex-row @2xl:items-center @2xl:justify-evenly @2xl:gap-8 @2xl:px-10">
          {/* Video + caption */}
          <div className="flex w-full flex-col items-center @2xl:w-[58%]">
            <div className="relative w-full">
              <VideoPlayer
                src="/woman2.mp4"
                className="h-[26svh] w-full overflow-hidden rounded-[17.39px] border border-white shadow-lg @2xl:aspect-video @2xl:h-auto"
              />
              {/* JEEViKA badge — mobile, bottom-right corner of the video */}
              <Image
                src="/jivika.png"
                alt="JEEViKA"
                width={98}
                height={98}
                className="absolute jivika-bounce -top-10 right-1 z-10 h-20 w-20 rounded-full object-contain @2xl:hidden"
              />
            </div>
            <p className="mt-2 text-center text-[clamp(0.78rem,1.9svh,1rem)] font-semibold text-white [text-shadow:0px_3px_6px_rgba(0,0,0,0.4)] @2xl:mt-4 @2xl:text-lg">
              Crafted in partnership with JEEViKA, a Bihar Government initiative
              supporting rural women livelihoods.
            </p>
          </div>

          {/* Did You Know card */}
          <div className="w-full @2xl:w-[42%] md:-mt-28">
            <div className="bg-glass-dark relative rounded-3xl border border-white/40 p-4 @2xl:p-5">
              <Image src="/quate.png" alt="" width={19} height={19} className="absolute -top-2 left-4 w-3 object-contain @2xl:w-6" />
              <h3 className="text-[clamp(0.95rem,2.2svh,1.25rem)] font-semibold leading-none tracking-normal text-white @2xl:text-[23.93px]">
                Did You Know?
              </h3>
              <p
                className="mt-2 text-[clamp(0.72rem,1.65svh,0.95rem)] font-semibold leading-snug tracking-normal text-white @2xl:text-[15px]"
                dangerouslySetInnerHTML={{ __html: DID_YOU_KNOW_HTML }}
              />
              <Image src="/quate.png" alt="" width={19} height={19} className="absolute -bottom-2 right-4 w-3 rotate-180 object-contain @2xl:w-6" />
            </div>
          </div>
        </div>

        {/* Woman — mobile: flexes to fill the leftover space and touches the
            bottom; desktop: cutout pinned to the bottom-right corner. */}
        <Image
          src="/woman.png"
          alt=""
          width={300}
          height={300}
          className="pointer-events-none mt-1 min-h-0 w-full flex-1 select-none object-contain object-bottom @2xl:absolute @2xl:bottom-0 @2xl:right-0 @2xl:mt-0 @2xl:h-auto @2xl:w-56 @2xl:flex-none"
        />
      </div>
    </div>
  );
}
