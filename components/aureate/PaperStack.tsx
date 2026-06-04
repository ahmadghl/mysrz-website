import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /**
   * Optional override for the decorative offset color. Defaults to
   * the aureate primary-container tint, which reads as antique gold
   * against the cream surface.
   */
  accentColor?: string;
  className?: string;
}

/**
 * Decorative double-border wrapper used throughout the Aureate
 * redesign — mostly to frame editorial imagery so it feels like a
 * pressed-paper plate from a heritage publication.
 *
 * Renders the child inside a relative container, then offsets a
 * 1px golden border down-and-right via an absolutely-positioned
 * pseudo-element-equivalent (using a real div so the effect works
 * regardless of CSS pseudo support and so we can apply transforms
 * on hover later if we want).
 *
 * Server component — no client JS overhead. The hover lift is done
 * via Tailwind classes the caller applies to the outer wrapper.
 */
export function PaperStack({
  children,
  accentColor = '#c4a14e',
  className = '',
}: Props) {
  return (
    <div className={`relative ${className}`}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-1 -right-1 left-1 top-1"
        style={{ border: `1px solid ${accentColor}`, zIndex: -1 }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
