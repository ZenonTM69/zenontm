// The ZenonTM mark: a heavy Z with a small TM (concept 4, "Z™ stamp").
// Same drawing as app/icon.svg (favicon) and public/zenontm-logo.svg (profile picture).
export default function Logo({ size = 34, tile = true, className = "" }: { size?: number; tile?: boolean; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className={className}>
      {tile && <rect x="0.5" y="0.5" width="63" height="63" rx="3" fill="#0a0a0a" stroke="rgba(255,255,255,.14)" />}
      <polygon points="11,14 43,14 43,22 22,42 43,42 43,50 11,50 11,42 32,22 11,22" fill="#f2f2f0" />
      <text x="46" y="23" fontFamily='"Helvetica Neue", Helvetica, Arial, sans-serif' fontWeight="700" fontSize="9" style={{ fill: "var(--acid)" }}>
        TM
      </text>
    </svg>
  );
}
