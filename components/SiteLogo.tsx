export function SiteLogo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 46 46" aria-hidden="true">
      <g transform="translate(23,23)">
        <ellipse cx="0" cy="-15" rx="5" ry="8" fill="#d4af37" opacity="0.9" transform="rotate(0)" />
        <ellipse cx="0" cy="-15" rx="5" ry="8" fill="#d4af37" opacity="0.7" transform="rotate(90)" />
        <ellipse cx="0" cy="-15" rx="5" ry="8" fill="#d4af37" opacity="0.9" transform="rotate(180)" />
        <ellipse cx="0" cy="-15" rx="5" ry="8" fill="#d4af37" opacity="0.7" transform="rotate(270)" />
        <ellipse cx="0" cy="-14" rx="4" ry="7" fill="#e8c84a" opacity="0.6" transform="rotate(45)" />
        <ellipse cx="0" cy="-14" rx="4" ry="7" fill="#e8c84a" opacity="0.6" transform="rotate(135)" />
        <ellipse cx="0" cy="-14" rx="4" ry="7" fill="#e8c84a" opacity="0.6" transform="rotate(225)" />
        <ellipse cx="0" cy="-14" rx="4" ry="7" fill="#e8c84a" opacity="0.6" transform="rotate(315)" />
        <circle cx="0" cy="0" r="9" fill="#1a1a1a" />
        <text x="0" y="3.5" textAnchor="middle" fontSize="7" fontWeight="700" fill="#d4af37" fontFamily="Georgia,serif">SRZ</text>
      </g>
    </svg>
  );
}
