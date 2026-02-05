"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function VisionboardCarousel() {
  const visionboardImages = useQuery(api.visionboard.getAllImages);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    updateScrollButtons();
    window.addEventListener("resize", updateScrollButtons);
    return () => window.removeEventListener("resize", updateScrollButtons);
  }, [visionboardImages]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 280; // Card width (256px) + gap (24px)
      const newScrollLeft =
        scrollRef.current.scrollLeft +
        (direction === "left" ? -scrollAmount : scrollAmount);
      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
      setTimeout(updateScrollButtons, 300);
    }
  };

  if (!visionboardImages || visionboardImages.length === 0) {
    return (
      <div
        className="relative rounded-2xl overflow-hidden p-8
          dark:bg-white/[0.03] bg-black/[0.02]
          dark:border dark:border-white/[0.08] border border-black/[0.05]
          flex items-center justify-center"
      >
        <p
          className="text-[13px] dark:text-[#666666] text-[#999999]"
          style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
        >
          Keine Visionboard Bilder
        </p>
      </div>
    );
  }

  return (
    <div className="relative group">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-[13px] font-bold uppercase tracking-wider dark:text-[#888888] text-[#666666]"
          style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
        >
          Visionboard
        </h3>
        <span
          className="text-[11px] dark:text-[#666666] text-[#999999]"
          style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
        >
          {visionboardImages.length} {visionboardImages.length === 1 ? "Bild" : "Bilder"}
        </span>
      </div>

      {/* Scrollable Cards Container */}
      <div className="relative">
        {/* Left Arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10
              w-10 h-10 rounded-full
              dark:bg-black/60 bg-white/90
              dark:border dark:border-white/20 border border-black/10
              flex items-center justify-center
              opacity-0 group-hover:opacity-100
              hover:scale-110
              transition-all duration-200
              backdrop-blur-sm shadow-lg"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5 dark:text-white text-black" />
          </button>
        )}

        {/* Right Arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10
              w-10 h-10 rounded-full
              dark:bg-black/60 bg-white/90
              dark:border dark:border-white/20 border border-black/10
              flex items-center justify-center
              opacity-0 group-hover:opacity-100
              hover:scale-110
              transition-all duration-200
              backdrop-blur-sm shadow-lg"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 dark:text-white text-black" />
          </button>
        )}

        {/* Cards */}
        <div
          ref={scrollRef}
          onScroll={updateScrollButtons}
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {visionboardImages.map((image) => (
            <div
              key={image._id}
              className="flex-shrink-0 w-[256px] rounded-lg overflow-hidden shadow-sm
                hover:shadow-lg transition-shadow duration-200"
            >
              {/* Image */}
              <div className="relative" style={{ borderRadius: image.subtitle ? "8px 8px 0 0" : "8px" }}>
                <img
                  src={image.url}
                  alt={image.subtitle || "Vision board image"}
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                    maxHeight: "400px",
                    objectFit: "cover",
                  }}
                />
              </div>

              {/* Subtitle */}
              {image.subtitle && (
                <div className="p-2 bg-white dark:bg-gray-800 rounded-b-lg">
                  <p
                    className="text-xs dark:text-gray-300 text-gray-700 line-clamp-2"
                    style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
                  >
                    {image.subtitle}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Hide scrollbar CSS */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
