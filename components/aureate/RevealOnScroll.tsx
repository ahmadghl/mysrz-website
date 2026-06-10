'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /**
   * Optional render-tag for the wrapper. Defaults to `div`. Use `section`
   * when wrapping a full page section so the document outline stays clean.
   */
  as?: 'div' | 'section' | 'article' | 'aside' | 'header' | 'footer';
  /**
   * Delay in milliseconds before the reveal animation kicks in for this
   * element. Use staggered values (0, 100, 200…) on sibling cards in a
   * grid for a cascading effect.
   */
  delay?: number;
  /**
   * Stop observing after the first reveal. Defaults to true — once a
   * section has revealed there's no perf reason to keep watching it.
   * Set false if you want the element to re-hide when it scrolls out.
   */
  once?: boolean;
  /**
   * Threshold passed to IntersectionObserver. 0.15 means the element
   * is considered "visible" once 15% of it is in viewport.
   */
  threshold?: number;
  className?: string;
}

type RevealState =
  /** Server render + pre-hydration: fully visible, no transition. */
  | 'ssr'
  /** Below the fold after hydration: hidden, waiting for the observer. */
  | 'hidden'
  /** Revealed (or never needed hiding): visible, with transition. */
  | 'visible';

/**
 * IntersectionObserver-based reveal wrapper for the Aureate redesign.
 *
 * Server HTML is rendered FULLY VISIBLE — no inline opacity:0. This
 * matters for three audiences: search crawlers snapshotting the page,
 * users with JS disabled, and users on slow connections who'd
 * otherwise stare at blank sections until hydration.
 *
 * After hydration, only elements that sit BELOW the current viewport
 * are switched to the hidden state (the user can't see them, so the
 * switch causes no visible flash) and then revealed by the observer
 * as they scroll in. Elements already on screen at hydration time
 * stay visible and never animate.
 *
 * Respects `prefers-reduced-motion: reduce` (everything stays
 * visible, no transitions).
 */
export function RevealOnScroll({
  children,
  as: Tag = 'div',
  delay = 0,
  once = true,
  threshold = 0.15,
  className,
}: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const [state, setState] = useState<RevealState>('ssr');

  useEffect(() => {
    const el = ref.current;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!el || reduced) {
      setState('visible');
      return;
    }

    // Already in (or above) the viewport at hydration time — leave it
    // visible. Hiding it now would cause a visible flash.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 50) {
      setState('visible');
      return;
    }

    // Below the fold: safe to hide (user can't see it), then reveal
    // via the observer as it scrolls toward the viewport.
    setState('hidden');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setState('visible');
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setState('hidden');
          }
        });
      },
      { threshold, rootMargin: '0px 0px -50px 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once, threshold]);

  const style: CSSProperties =
    state === 'ssr'
      ? {}
      : {
          opacity: state === 'visible' ? 1 : 0,
          transform: state === 'visible' ? 'translateY(0)' : 'translateY(20px)',
          transition:
            'opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1), transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
          transitionDelay: state === 'visible' && delay ? `${delay}ms` : '0ms',
        };

  return (
    // @ts-expect-error — dynamic tag with strict ref typing is a known
    // React limitation; the runtime is safe because we only allow a
    // closed set of HTMLElement tags in the `as` prop.
    <Tag ref={ref} className={className} style={style}>
      {children}
    </Tag>
  );
}
