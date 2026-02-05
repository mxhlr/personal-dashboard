"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function VisionboardCarousel() {
  const visionboardImages = useQuery(api.visionboard.getAllImages);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!visionboardImages || visionboardImages.length === 0) {
    return (
      <div
        className="relative h-[400px] rounded-2xl overflow-hidden
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

  const handlePrevious = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? visionboardImages.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev === visionboardImages.length - 1 ? 0 : prev + 1
    );
  };

  const currentImage = visionboardImages[currentIndex];

  return (
    <div className="relative group">
      {/* Main Image */}
      <div
        className="relative h-[400px] rounded-2xl overflow-hidden
          dark:border dark:border-white/[0.08] border border-black/[0.05]
          transition-all duration-300"
      >
        <Image
          src={currentImage.url}
          alt={currentImage.title || "Visionboard image"}
          fill
          className="object-cover"
          sizes="(max-width: 1200px) 100vw, 1200px"
        />

        {/* Gradient Overlay for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Image Title/Caption */}
        {currentImage.title && (
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <p
              className="text-white text-lg font-bold"
              style={{
                fontFamily: '"Courier New", "Monaco", monospace',
                textShadow: '0 2px 10px rgba(0,0,0,0.8)',
              }}
            >
              {currentImage.title}
            </p>
          </div>
        )}
      </div>

      {/* Navigation Arrows - visible on hover */}
      {visionboardImages.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2
              w-12 h-12 rounded-full
              dark:bg-black/50 bg-white/80
              dark:border dark:border-white/20 border border-black/10
              flex items-center justify-center
              opacity-0 group-hover:opacity-100
              hover:scale-110
              transition-all duration-200
              backdrop-blur-sm"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6 dark:text-white text-black" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2
              w-12 h-12 rounded-full
              dark:bg-black/50 bg-white/80
              dark:border dark:border-white/20 border border-black/10
              flex items-center justify-center
              opacity-0 group-hover:opacity-100
              hover:scale-110
              transition-all duration-200
              backdrop-blur-sm"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6 dark:text-white text-black" />
          </button>
        </>
      )}

      {/* Dots Navigation */}
      {visionboardImages.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {visionboardImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex
                  ? 'bg-white w-6'
                  : 'dark:bg-white/40 bg-black/40 hover:bg-white/60'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Counter */}
      <div
        className="absolute top-4 right-4 px-3 py-1 rounded-full
          dark:bg-black/50 bg-white/80 backdrop-blur-sm
          dark:border dark:border-white/20 border border-black/10"
      >
        <span
          className="text-[11px] font-bold dark:text-white text-black"
          style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
        >
          {currentIndex + 1} / {visionboardImages.length}
        </span>
      </div>
    </div>
  );
}
