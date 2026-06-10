import Link from 'next/link';
import type { ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'outline-on-light' | 'outline-on-dark';

interface CommonProps {
  children: ReactNode;
  /**
   * Visual style:
   *   - primary       → solid antique gold, white text. The main CTA.
   *   - secondary     → solid deep green, white text. For sub-CTAs.
   *   - outline-on-light → bordered antique gold on cream bg.
   *   - outline-on-dark  → bordered white on dark hero/footer bg.
   */
  variant?: Variant;
  className?: string;
}

interface AnchorProps extends CommonProps {
  href: string;
  /** External links open in a new tab and get rel="noopener". */
  external?: boolean;
  type?: never;
  onClick?: never;
  disabled?: never;
}

interface ButtonProps extends CommonProps {
  href?: never;
  external?: never;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  disabled?: boolean;
}

type Props = AnchorProps | ButtonProps;

/**
 * The single canonical CTA primitive for the Aureate redesign.
 * Replaces the per-page bespoke button styling from the Stitch
 * mockup with one component used everywhere so the brand stays
 * consistent.
 *
 * Squared corners (matches the redesign's minimal-radius philosophy),
 * uppercase tracked label, subtle hover lift + shadow, active-state
 * press. Works as either a `<Link>` (when `href` is provided) or a
 * `<button>` (when an onClick handler is provided).
 */
export function AureateButton(props: Props) {
  const { children, variant = 'primary', className = '' } = props;

  const baseClasses =
    'inline-flex items-center justify-center px-10 py-4 font-aureate-label text-aureate-label-md uppercase tracking-widest transition-all duration-300 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses: Record<Variant, string> = {
    primary:
      'bg-aureate-primary text-aureate-on-primary border border-aureate-primary hover:bg-aureate-primary-container hover:-translate-y-0.5 hover:shadow-lg',
    secondary:
      'bg-aureate-secondary text-aureate-on-secondary border border-aureate-secondary hover:bg-aureate-on-secondary-container hover:-translate-y-0.5 hover:shadow-lg',
    'outline-on-light':
      'border border-aureate-primary text-aureate-primary bg-transparent hover:bg-aureate-primary-container hover:text-aureate-on-primary-container hover:-translate-y-0.5 hover:shadow-md',
    'outline-on-dark':
      'border border-white text-white bg-transparent backdrop-blur-sm hover:bg-white hover:text-aureate-primary hover:-translate-y-0.5 hover:shadow-lg',
  };

  const cls = `${baseClasses} ${variantClasses[variant]} ${className}`;

  if ('href' in props && props.href) {
    if (props.external) {
      return (
        <a
          href={props.href}
          target="_blank"
          rel="noopener noreferrer"
          className={cls}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={props.href} className={cls}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={(props as ButtonProps).type ?? 'button'}
      onClick={(props as ButtonProps).onClick}
      disabled={(props as ButtonProps).disabled}
      className={cls}
    >
      {children}
    </button>
  );
}
