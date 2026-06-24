"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useEscClose } from "../lib/useEscClose";
import VideoPlayer from "./VideoPlayer";

export default function VideoPopup({
  src,
  onClose,
}: {
  src: string;
  onClose: () => void;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const r = requestAnimationFrame(() => setShow(true));
    return () => cancelAnimationFrame(r);
  }, []);

  // Fade out, then let the parent recenter the bg + unmount.
  const handleClose = () => {
    setShow(false);
    onClose();
  };

  useEscClose(handleClose);

  return (
    <div
      onClick={handleClose}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-[2px] transition-opacity duration-300 md:px-6 md:pb-6 md:pt-26 ${
        show ? "opacity-100" : "opacity-0"
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
        className="fixed right-5 top-5 z-30 flex h-[24.61px] w-[24.61px] items-center justify-center rounded-sm bg-black/10 p-1.5 backdrop-blur-[2px] transition hover:bg-black/20"
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
        className={`relative aspect-video w-[min(92vw,calc((100svh-8rem)*16/9))] max-w-[1000px] overflow-hidden rounded-2xl border border-white shadow-[0_8px_60px_rgba(0,0,0,0.5)] transition-all duration-500 ease-out max-md:absolute max-md:left-1/2 max-md:top-1/2 max-md:aspect-auto max-md:h-[100vw] max-md:w-[100svh] max-md:max-w-none max-md:-translate-x-1/2 max-md:-translate-y-1/2 max-md:rotate-90 max-md:rounded-none max-md:border-0 ${
          show ? "opacity-100 md:translate-x-0" : "opacity-0 md:translate-x-40"
        }`}
      >
        <VideoPlayer src={src} className="h-full w-full" />
      </div>
    </div>
  );
}
