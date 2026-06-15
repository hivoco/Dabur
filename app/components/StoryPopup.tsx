"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import VideoPlayer from "./VideoPlayer";

// "Did You Know?" body — supports HTML markup (e.g. <br/>, <strong>) so it can
// be made dynamic later. Keep this trusted (not user-supplied) input.
const DID_YOU_KNOW_HTML =
  "Every spoon of litchi honey holds the  work of  bees visiting millions of flowers over incredible distances equal to three times around the Earth.";

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
          className="absolute right-5 top-5 z-20 flex h-[24.61px] w-[24.61px] items-center justify-center rounded-sm bg-black/10 p-1.5 backdrop-blur-[2px] transition hover:bg-black/20"
        >
          <Image src="/cross.svg" alt="" width={21} height={21} unoptimized className="h-full w-full object-contain" />
        </button>

        {/* JEEViKA logo (hidden on mobile) */}
        <Image
          src="/jivika.png"
          alt="JEEViKA"
          width={98}
          height={98}
          className="absolute right-20 top-24 z-10 hidden h-[97.37px] w-[97.37px] rotate-[0.5deg] object-contain md:block"
        />

        {/* Title — pushed below the page logo on mobile (full-screen popup) */}
        <div className="flex flex-col  items-center px-6 pt-2  md:pt-6">
          <Image src="/mask.png" alt="" width={130} height={22} className="h-auto object-contain w-24 md:w-32 opacity-80" />
          <h2 className="mt-2 text-center text-xl md:text-[26px] font-semibold leading-8.5 tracking-normal text-white [text-shadow:0px_4px_4px_#000000]">
            Behind Every Drop, A Story of Empowerment
          </h2>
          <Image src="/mask.png" alt="" width={130} height={22} className="mt-2 rotate-180 h-auto object-contain w-24 md:w-32 opacity-80" />
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col  items-center justify-evenly gap-5 overflow-y-auto px-6 pb-5 pt-4 @2xl:flex-row @2xl:items-center @2xl:gap-8 @2xl:overflow-hidden @2xl:px-10">
          {/* Left column: framed video + caption below it (second row) */}
          <div className="flex w-full min-h-0 flex-col @2xl:w-[58%]">
            <VideoPlayer
              src="/woman2.mp4"
              className="aspect-video w-full shrink-0 overflow-hidden rounded-[17.39px] border border-white shadow-lg"
            />
            <p className="mt-4 text-center text-[16px] md:text-[20px] font-semibold leading-6 tracking-normal text-white [text-shadow:0px_3px_6px_rgba(0,0,0,0.4)]">
              Crafted in partnership with JEEViKA, a Bihar Government initiative
              supporting rural women livelihoods.
            </p>
          </div>

          {/* Right column: Did You Know card */}
          <div className="relative flex  w-full md:-mt-32 min-h-0 justify-center @2xl:w-[42%]">
            <div className="bg-glass-dark relative z-10 rounded-3xl  border border-white/40 p-5 ">
              <Image src="/quate.png" alt="" width={19} height={19} className="absolute -top-3 left-4 w-4 md:w-6 object-contain" />
              <h3 className="text-xl md:text-[23.93px] font-semibold leading-none tracking-normal text-white">
                Did You Know?
              </h3>
              <p
                className="mt-2 text-xs md:text-[15px] font-semibold leading-4.5 tracking-normal text-white"
                dangerouslySetInnerHTML={{ __html: DID_YOU_KNOW_HTML }}
              />
              <Image src="/quate.png" alt="" width={19} height={19} className="absolute -bottom-4 right-4 w-4 md:w-6  rotate-180 object-contain" />
            </div>
             
          </div>
        </div>

        {/* Cutout woman — pinned to the bottom-right of the popup */}
        <Image
          src="/woman.png"
          alt=""
          width={300}
          height={300}
          className="pointer-events-none absolute bottom-0 right-0 z-10 w-28 select-none object-contain md:w-56"
        />
      </div>
    </div>
  );
}
