export function Logo({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      {/* The frame — the site's signature device */}
      <rect
        x="2"
        y="2"
        width="14"
        height="14"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      {/* The package — accent, overlapping the frame */}
      <rect x="10" y="10" width="12" height="12" fill="var(--accent)" />
    </svg>
  );
}
