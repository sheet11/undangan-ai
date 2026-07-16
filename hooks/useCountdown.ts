"use client";
import { useEffect, useState } from "react";
function calculate(target: string) {
  const d = Math.max(0, new Date(target).getTime() - Date.now());
  return { days: Math.floor(d / 86400000), hours: Math.floor(d / 3600000) % 24, minutes: Math.floor(d / 60000) % 60, seconds: Math.floor(d / 1000) % 60 };
}
export function useCountdown(target: string) {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    setTime(calculate(target));
    const id = window.setInterval(() => setTime(calculate(target)), 1000);
    return () => clearInterval(id);
  }, [target]);
  return time;
}
