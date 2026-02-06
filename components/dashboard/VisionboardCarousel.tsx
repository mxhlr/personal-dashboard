"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

const CARDS_PER_PAGE = 5;

export function VisionboardCarousel() {
  const visionboardImages = useQuery(api.visionboard.getAllImages);
  const [currentPage, setCurrentPage] = useState(0);

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

  // If less than 5 images, duplicate them to fill 5 slots
  let displayImages = [...visionboardImages];
  if (displayImages.length < CARDS_PER_PAGE) {
    while (displayImages.length < CARDS_PER_PAGE) {
      displayImages = [...displayImages, ...visionboardImages];
    }
  }

  const totalPages = Math.ceil(displayImages.length / CARDS_PER_PAGE);
  const startIndex = currentPage * CARDS_PER_PAGE;
  const endIndex = startIndex + CARDS_PER_PAGE;
  const currentImages = displayImages.slice(startIndex, endIndex).slice(0, CARDS_PER_PAGE);

  const handlePrevious = () => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : totalPages - 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : 0));
  };

  const canGoPrevious = totalPages > 1;
  const canGoNext = totalPages > 1;

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
          {totalPages > 1 && ` • Seite ${currentPage + 1}/${totalPages}`}
        </span>
      </div>

      {/* Slideshow Container */}
      <div className="relative">
        {/* Left Arrow */}
        {canGoPrevious && (
          <button
            onClick={handlePrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10
              w-12 h-12 rounded-full
              dark:bg-black/70 bg-white/90
              dark:border dark:border-white/20 border border-black/10
              flex items-center justify-center
              opacity-0 group-hover:opacity-100
              hover:scale-110
              transition-all duration-200
              backdrop-blur-sm shadow-xl"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-6 h-6 dark:text-white text-black" />
          </button>
        )}

        {/* Right Arrow */}
        {canGoNext && (
          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10
              w-12 h-12 rounded-full
              dark:bg-black/70 bg-white/90
              dark:border dark:border-white/20 border border-black/10
              flex items-center justify-center
              opacity-0 group-hover:opacity-100
              hover:scale-110
              transition-all duration-200
              backdrop-blur-sm shadow-xl"
            aria-label="Next page"
          >
            <ChevronRight className="w-6 h-6 dark:text-white text-black" />
          </button>
        )}

        {/* Cards Grid - Responsive: 2 cols mobile → 3 tablet → 5 desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {currentImages.map((image, index) => (
            <div
              key={`${image._id}-${index}`}
              className="rounded-lg overflow-hidden shadow-sm
                hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
            >
              {/* Image */}
              <div
                className="relative w-full"
                style={{
                  borderRadius: image.subtitle ? "8px 8px 0 0" : "8px",
                  aspectRatio: `${image.width} / ${image.height}`,
                  maxHeight: "400px"
                }}
              >
                <Image
                  src={image.url}
                  alt={image.subtitle || "Vision board image"}
                  width={image.width}
                  height={image.height}
                  className="object-cover rounded-t-lg"
                  style={{
                    width: "100%",
                    height: "auto",
                    maxHeight: "400px",
                  }}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 20vw"
                  loading="lazy"
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

      {/* Page Dots */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index)}
              className={`h-2 rounded-full transition-all duration-200 ${
                index === currentPage
                  ? "w-8 dark:bg-white bg-black"
                  : "w-2 dark:bg-white/30 bg-black/30 hover:dark:bg-white/50 hover:bg-black/50"
              }`}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
