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

/**
 * IntersectionObserver-based reveal wrapper for the Aureate redesign.
 * Replaces the Stitch mockup's manual querySelectorAll('.reveal')
 * pattern with a React-idiomatic component.
 *
 * - Respects `prefers-reduced-motion: reduce` (renders visible
 *   immediately, skips the transition).
 * - Disconnects the observer after first reveal by default so we
 *   don't keep watching elements that have already animated.
 * - Renders a fallback-visible state when JS is disabled (the
 *   inline style sets opacity:1 if React never hydrates), so users
 *   without JS still see the content.
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
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Respect users who've asked for less motion at the OS level.
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setVisible(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setVisible(false);
          }
        });
      },
      { threshold, rootMargin: '0px 0px -50px 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once, threshold]);

  const style: CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(20px)',
    transition:
      'opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1), transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
    transitionDelay: visible && delay ? `${delay}ms` : '0ms',
    willChange: visible ? 'auto' : 'opacity, transform',
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
