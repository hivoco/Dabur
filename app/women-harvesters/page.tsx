"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useBackground } from "../components/Background";
import StoryPopup from "../components/StoryPopup";
import ChatWidget from "../components/ChatWidget";

// The "Women Harvesters" story, shown as a full page that looks exactly like the
// old popup. The background lives in the root layout, so sliding it here
// animates across navigation and re-centres when we go back home.
export default function WomenHarvestersPage() {
  const router = useRouter();
  const { showLeft, center } = useBackground();

  // Slide the background left on entry; re-center it on exit. Doing the recenter
  // in the unmount cleanup means it runs however the page is left — close button,
  // ESC, the browser Back button, or an Android edge "back" swipe gesture.
  useEffect(() => {
    showLeft();
    return () => center();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* Brand logo — top centre, above the popup. Desktop only; on mobile the
          StoryPopup shows its own logo. */}
      <Image
        src="/logo-1.png"
        alt="Dabur Litchi Honey logo"
        width={120}
        height={109}
        priority
        className="pointer-events-none fixed left-1/2 top-2 z-60 hidden w-20 -translate-x-1/2 object-contain drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)] md:block"
      />
      <StoryPopup onClose={() => router.push("/")} />
      <ChatWidget />
    </>
  );
}
