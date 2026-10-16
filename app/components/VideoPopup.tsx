"use client";

import { useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { useEscClose } from "../lib/useEscClose";
import VideoPlayer from "./VideoPlayer";

// Phones get the mobile cut of the video; matches the max-md layout below.
const MOBILE_QUERY = "(max-width: 767.98px)";
const subscribeMobile = (cb: () => void) => {
  const mq = window.matchMedia(MOBILE_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

export default function VideoPopup({
  src,
  mobileSrc,
  onClose,
}: {
  src: string;
  /** Played instead of `src` on phones (max-md). */
  mobileSrc?: string;
  onClose: () => void;
}) {
  // Visible from the first render; entrance is CSS-only (`starting:`).
  const [show, setShow] = useState(true);

  // null during SSR / first paint, so neither file starts downloading until
  // we know which one this screen needs.
  const isMobile = useSyncExternalStore(
    subscribeMobile,
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => null
  );
  const videoSrc = isMobile === null ? null : isMobile && mobileSrc ? mobileSrc : src;


  // Fade out, then let the parent recenter the bg + unmount.
  const handleClose = () => {
    setShow(false);
    onClose();
  };

  useEscClose(handleClose);

  return (
    <div
      onClick={handleClose}
      className={`full-bleed fixed inset-y-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-[2px] transition-opacity duration-300 md:px-6 md:pb-6 md:pt-26  ${
        show ? "opacity-100 starting:opacity-0" : "opacity-0"
      }`}
    >
      {/* Close */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleClose();
        }}
        aria-label="Close"
        className="fixed right-[max(1.25rem,calc(50vw-720px+1.25rem))] top-5 z-30 flex h-[24.61px] w-[24.61px] items-center justify-center rounded-sm bg-black/10 p-1.5 backdrop-blur-[2px] transition hover:bg-black/20 "
      >
        <Image src="/cross.svg" alt="" width={21} height={21} unoptimized className="h-full w-full object-contain" />
      </button>

      {/*
        Desktop: centered 16:9 video.
        Mobile (max-md): rotate 90deg into landscape and fill the screen, so the
        video plays landscape/full-screen even while the phone is held portrait.
      */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative aspect-video w-[min(92vw,calc((100svh-8rem)*16/9))] max-w-[1000px] overflow-hidden rounded-2xl border border-white shadow-[0_8px_60px_rgba(0,0,0,0.5)] transition-all duration-500 ease-out max-md:absolute max-md:left-1/2 max-md:top-1/2 max-md:aspect-auto max-md:h-[calc(100vw-2rem)] max-md:w-[calc(100svh-2rem)] max-md:max-w-none max-md:-translate-x-1/2 max-md:-translate-y-1/2 max-md:rotate-90   ${
          show ? "opacity-100 md:translate-x-0 starting:opacity-0 md:starting:translate-x-40" : "opacity-0 md:translate-x-40"
        }`}
      >
        {videoSrc ? (
          // key: remount (fresh player state) if the screen crosses the breakpoint.
          <VideoPlayer key={videoSrc} src={videoSrc} className="h-full w-full" />
        ) : (
          <div className="h-full w-full bg-black" />
        )}
      </div>
    </div>
  );
}
