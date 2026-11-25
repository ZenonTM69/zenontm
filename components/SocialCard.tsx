"use client";
import { useState } from "react";
import type { Social } from "@/lib/site";
import Icon from "./Icons";

// Older copy method, for browsers that block the modern clipboard (e.g. some in-app browsers).
function legacyCopy(text: string) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  document.body.removeChild(ta);
  return ok;
}

// Copies text and briefly shows "Copied".
export function useCopy() {
  const [copied, setCopied] = useState(false);
  const copy = async (text: string) => {
    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      ok = legacyCopy(text);
    }
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
    return ok;
  };
  return { copied, copy };
}

export function LiveCount({ s }: { s: Social }) {
  if (!s.followers) return null;
  return (
    <span className={`social-count ${s.live ? "is-live" : ""}`}>
      {s.live && <i className="live-dot" aria-hidden="true" />}
      <b>{s.followers}</b> {s.followersLabel ?? "followers"}
      {s.live && <span className="sr-only"> (live count)</span>}
    </span>
  );
}

// One social card: the main area opens the profile; the small button copies the username.
// Discord has no public profile links, so its whole card copies the username.
export default function SocialCard({ s }: { s: Social }) {
  const { copied, copy } = useCopy();
  const handleText = copied ? "Copied" : s.handle;

  const body = (
    <>
      <span className="social-icon">
        <Icon name={s.icon} size={26} />
      </span>
      <span className="social-text">
        <strong>{s.name}</strong>
        <span className="social-handle">{handleText}</span>
        <LiveCount s={s} />
      </span>
      <span className="social-open" aria-hidden="true">
        {s.copy ? "Tap to copy" : "Open"} <Icon name={s.copy ? "copy" : "out"} size={13} />
      </span>
    </>
  );

  return (
    <div className={`social brand-${s.icon}${copied ? " is-copied" : ""}`}>
      <span className="social-mark" aria-hidden="true">
        <Icon name={s.icon} size={170} />
      </span>
      {s.copy ? (
        <button className="social-main" onClick={() => copy(s.handle)} aria-label={`Copy ${s.name} username ${s.handle}`}>
          {body}
        </button>
      ) : (
        <a className="social-main" href={s.url} target="_blank" rel="noopener noreferrer" aria-label={`${s.name}: ${s.handle} (opens in a new tab)`}>
          {body}
        </a>
      )}
      <button
        className="social-copy"
        onClick={() => copy(s.handle)}
        aria-label={`Copy ${s.name} username ${s.handle}`}
        title="Copy username"
      >
        <Icon name={copied ? "check" : "copy"} size={17} />
      </button>
    </div>
  );
}
