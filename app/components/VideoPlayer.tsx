"use client";

import { useEffect, useRef, useState } from "react";

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <polygon points="6 4 20 12 6 20" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  );
}

function FullscreenIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M8 3H5a2 2 0 0 0-2 2v3" />
      <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
      <path d="M3 16v3a2 2 0 0 0 2 2h3" />
      <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}

function SeekIcon({ dir }: { dir: "back" | "forward" }) {
  return (
    <span className="relative flex h-5 w-5 items-center justify-center">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
        {dir === "back" ? (
          <>
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </>
        ) : (
          <>
            <path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
          </>
        )}
      </svg>
      <span className="absolute text-[6px] font-bold leading-none">20</span>
    </span>
  );
}

function ReplayIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

export default function VideoPlayer({
  src,
  className = "",
}: {
  src: string;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [visible, setVisible] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);

  // Reveal the controls, then auto-hide after a short delay (works for hover & tap).
  const poke = () => {
    setVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setVisible(false), 2500);
  };

  useEffect(
    () => () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    },
    []
  );

  // Try to start with sound; if the browser blocks unmuted autoplay, fall back
  // to muted so the video still plays.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => {
      v.muted = true;
      v.play().catch(() => {});
    });
  }, []);

  const seek = (delta: number) => {
    const v = videoRef.current;
    if (!v) return;
    const dur = Number.isFinite(v.duration) ? v.duration : Infinity;
    v.currentTime = Math.min(dur, Math.max(0, v.currentTime + delta));
    if (ended) setEnded(false);
    poke();
  };

  const replay = () => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    void v.play();
    setEnded(false);
    poke();
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.ended) {
      replay();
      return;
    }
    if (v.paused) void v.play();
    else v.pause();
    poke();
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void containerRef.current?.requestFullscreen?.();
    }
    poke();
  };

  const btn =
    "pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-[2px] transition hover:bg-black/60";

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      onMouseMove={poke}
      onMouseLeave={() => setVisible(false)}
      onTouchStart={poke}
    >
      <video
        ref={videoRef}
        src={src}
        playsInline
        onPlay={() => {
          setPlaying(true);
          setEnded(false);
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setEnded(true);
          setPlaying(false);
        }}
        onClick={togglePlay}
        className="h-full w-full object-cover"
      />

      {/* Replay — only when the video has finished */}
      {ended && (
        <button
          type="button"
          onClick={replay}
          aria-label="Replay"
          className="absolute inset-0 m-auto flex h-16 w-16 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-[2px] transition hover:bg-black/70"
        >
          <ReplayIcon className="h-8 w-8" />
        </button>
      )}

      {/* Control bar — hidden by default; not shown while the replay overlay is up */}
      <div
        className={`pointer-events-none absolute inset-x-0 bottom-0 flex items-center gap-3 bg-linear-to-t from-black/50 to-transparent px-4 pb-3 pt-10 transition-opacity duration-200 ${
          visible && !ended ? "opacity-100" : "opacity-0"
        }`}
      >
        <button type="button" onClick={togglePlay} aria-label={playing ? "Pause" : "Play"} className={btn}>
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button type="button" onClick={() => seek(-10)} aria-label="Back 10 seconds" className={btn}>
          <SeekIcon dir="back" />
        </button>
        <button type="button" onClick={() => seek(10)} aria-label="Forward 10 seconds" className={btn}>
          <SeekIcon dir="forward" />
        </button>

        <div className="flex-1" />

        <button type="button" onClick={toggleFullscreen} aria-label="Fullscreen" className={btn}>
          <FullscreenIcon />
        </button>
      </div>
    </div>
  );
}
