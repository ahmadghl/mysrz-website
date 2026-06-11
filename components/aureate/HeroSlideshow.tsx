'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import type { HeroSlide } from '@/lib/hero-slides';

interface Props {
  slides: HeroSlide[];
  /** Time each slide is shown, in ms. Crossfade is 1.2s on top. */
  intervalMs?: number;
}

/**
 * Full-bleed crossfading background slideshow for the homepage hero.
 *
 * Performance contract:
 * - The FIRST slide is the page's LCP image: rendered on the server
 *   with `priority`, exactly like the old single-image hero. Zero
 *   LCP regression vs. a static hero.
 * - Later slides mount progressively — each slide's <Image> enters
 *   the DOM one rotation before it's shown, so the initial page
 *   load fetches ONE hero image, not eight, and every crossfade
 *   targets an already-loaded image.
 * - No carousel library; the crossfade is a CSS opacity transition.
 *
 * Accessibility contract:
 * - `prefers-reduced-motion: reduce` → the rotation never starts;
 *   the hero behaves as a static image.
 * - The slideshow is decorative backdrop behind the hero copy
 *   (which carries the actual content), so the container is
 *   aria-hidden and images use empty alt — screen-reader users get
 *   the hero heading/subtitle, not eight rotating announcements.
 */
export function HeroSlideshow({ slides, intervalMs = 6000 }: Props) {
  const [current, setCurrent] = useState(0);
  // How many slides have an <Image> mounted. Starts at 1 so the
  // server (and hydration) render EXACTLY the first slide — the
  // initial page load fetches one hero image, not two. Grows
  // monotonically (never shrinks on wrap-around) so already-loaded
  // slides don't unmount and re-fetch.
  const [mountedCount, setMountedCount] = useState(1);

  useEffect(() => {
    if (slides.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const id = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [slides.length, intervalMs]);

  // Keep one slide mounted AHEAD of the visible one so every
  // crossfade targets an already-loaded image: post-hydration this
  // mounts slide 2 (loads during the first 6s window), then each
  // rotation mounts the next. Monotonic max — never unmounts.
  useEffect(() => {
    setMountedCount((m) => Math.max(m, Math.min(slides.length, current + 2)));
  }, [current, slides.length]);

  return (
    <div aria-hidden="true" className="absolute inset-0 z-0">
      {slides.slice(0, mountedCount).map((slide, i) => (
        <div
          key={slide.src}
          className="absolute inset-0"
          style={{
            opacity: i === current ? 1 : 0,
            transition: 'opacity 1.2s ease-in-out',
          }}
        >
          <Image
            src={slide.src}
            alt=""
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover"
          />
          {/* City caption — bottom-right, fades with its slide. */}
          <span className="absolute bottom-6 right-6 hidden bg-aureate-on-surface/40 px-4 py-2 font-aureate-label text-aureate-label-md uppercase tracking-widest text-white/90 backdrop-blur-sm md:block">
            {slide.label}
          </span>
        </div>
      ))}
      {/* Same warm gradient the static hero used, kept above the
          slides so the cream hero copy stays readable on every
          photo regardless of its color temperature. */}
      <div className="absolute inset-0 bg-gradient-to-b from-aureate-on-surface/40 to-aureate-on-surface/10" />
    </div>
  );
}
