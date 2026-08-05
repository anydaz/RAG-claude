"use client";

import { useState } from "react";
import Image from "next/image";
import type { PortfolioImage } from "../data";

type ImageGalleryProps = {
  images: PortfolioImage[];
};

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex];

  if (!activeImage) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-100 dark:bg-[#28292a]">
        <Image
          src={activeImage.src}
          alt={activeImage.alt}
          fill
          sizes="(max-width: 768px) 100vw, 768px"
          className="object-contain"
          preload
        />
      </div>

      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={image.src}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show image ${index + 1}`}
              aria-pressed={index === activeIndex}
              className={`relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                index === activeIndex
                  ? "border-slate-800 dark:border-slate-200"
                  : "border-transparent"
              }`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="96px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
