"use client";
import type { Social } from "@/lib/site";
import Icon from "./Icons";
import { useCopy } from "./SocialCard";

// One social button: brand-coloured badge + username. On hover the brand colour
// sweeps across and an arrow slides in. Discord copies the username instead.
function Chip({ s, i }: { s: Social; i: number }) {
  const { copied, copy } = useCopy();
  const inner = (
    <>
      <span className="chip-badge">
        <Icon name={copied ? "check" : s.icon} size={19} />
      </span>
      <span className="chip-handle">{copied ? "Copied" : s.handle}</span>
      {s.live && s.followers && (
        <span className="chip-count" title="Live follower count">
          <i className="live-dot" aria-hidden="true" />
          {s.followers}
        </span>
      )}
      <span className="chip-go" aria-hidden="true">
        <Icon name={s.copy ? "copy" : "out"} size={15} />
      </span>
    </>
  );
  const cls = `soc-chip brand-${s.icon}${copied ? " is-copied" : ""}`;
  const style = { ["--i" as string]: i };
  return s.copy ? (
    <button className={cls} style={style} onClick={() => copy(s.handle)} aria-label={`Copy ${s.name} username ${s.handle}`}>
      {inner}
    </button>
  ) : (
    <a className={cls} style={style} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={`${s.name}: ${s.handle}`}>
      {inner}
    </a>
  );
}

// Every social account in one row, right under the title – the first thing people see.
export default function SocialBar({ socials }: { socials: Social[] }) {
  return (
    <nav className="soc-bar" aria-label="My social media">
      {socials.map((s, i) => (
        <Chip key={s.name} s={s} i={i} />
      ))}
    </nav>
  );
}
