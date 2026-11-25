"use client";
import { useEffect, useState } from "react";

// Live time + date in the visitor's own timezone, as a compact readout.
export default function Clock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const two = (n: number) => String(n).padStart(2, "0");
  const date = now ? now.toLocaleDateString([], { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : "";

  return (
    <span className="clock">
      <time className="clock-time" dateTime={now?.toISOString()}>
        {now ? `${two(now.getHours())}` : "--"}
        <span className="blink">:</span>
        {now ? two(now.getMinutes()) : "--"}
        <span className="clock-sec">{now ? two(now.getSeconds()) : "--"}</span>
      </time>
      <span className="clock-date">{date}</span>
    </span>
  );
}
