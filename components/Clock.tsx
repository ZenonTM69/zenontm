"use client";
import { useEffect, useState } from "react";

// Live clock + date in the visitor's own timezone. Updates every second.
export default function Clock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hh = now ? String(now.getHours()).padStart(2, "0") : "--";
  const mm = now ? String(now.getMinutes()).padStart(2, "0") : "--";
  const ss = now ? String(now.getSeconds()).padStart(2, "0") : "--";
  const date = now
    ? now.toLocaleDateString([], { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : " ";
  const greeting = !now
    ? "Hello"
    : now.getHours() < 5
      ? "Up late?"
      : now.getHours() < 12
        ? "Good morning"
        : now.getHours() < 18
          ? "Good afternoon"
          : "Good evening";

  return (
    <div className="clock">
      <span className="clock-label">{greeting}</span>
      <time className="clock-time" dateTime={now?.toISOString()}>
        {hh}
        <span className="blink">:</span>
        {mm}
        <span className="clock-sec">{ss}</span>
      </time>
      <span className="clock-date">{date}</span>
    </div>
  );
}
