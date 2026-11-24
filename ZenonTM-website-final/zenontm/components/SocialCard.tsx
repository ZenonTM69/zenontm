"use client";
import { useState } from "react";
import type { Social } from "@/lib/site";
import Icon from "./Icons";

// One social media card. If `copy` is true (Discord), clicking copies the username.
export default function SocialCard({ s }: { s: Social }) {
  const [copied, setCopied] = useState(false);

  const inner = (
    <>
      <span className="social-icon">
        <Icon name={s.icon} size={26} />
      </span>
      <span className="social-text">
        <strong>{s.name}</strong>
        <span>{copied ? "Username copied!" : s.handle}</span>
        {s.followers && (
          <span className="social-count">
            <b>{s.followers}</b> {s.followersLabel ?? "followers"}
          </span>
        )}
      </span>
      <span className="social-go">
        <Icon name={s.copy ? (copied ? "check" : "copy") : "arrow"} size={18} />
      </span>
    </>
  );

  const cls = `glass spot tilt social brand-${s.icon}`;

  if (s.copy) {
    return (
      <button
        className={cls}
        aria-label={`Copy ${s.name} username ${s.handle}`}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(s.handle);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          } catch {
            window.open(s.url, "_blank", "noopener,noreferrer");
          }
        }}
      >
        {inner}
      </button>
    );
  }

  return (
    <a href={s.url} target="_blank" rel="noopener noreferrer" className={cls}>
      {inner}
    </a>
  );
}
