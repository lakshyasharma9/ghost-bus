import { useEffect, useMemo } from "react";

type Props = {
  seed?: string;
  bars?: number;
  progress?: number; // 0..1
  className?: string;
  color?: string;
  bg?: string;
};

function rand(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 13), 3266489917);
    h ^= h >>> 16;
    return ((h >>> 0) % 1000) / 1000;
  };
}

export function Waveform({ seed = "x", bars = 300, progress = 0, className = "", color = "var(--color-primary)", bg = "rgba(0,0,0,0.12)" }: Props) {
  const heights = useMemo(() => {
    const r = rand(seed);
    return Array.from({ length: bars }, (_, i) => {
      const env = Math.sin((i / bars) * Math.PI) * 0.6 + 0.4;
      return Math.max(0.12, Math.min(1, env * (0.4 + r() * 0.8)));
    });
  }, [seed, bars]);

  return (
    <svg className={`h-full w-full ${className}`} preserveAspectRatio="none" viewBox={`0 0 ${bars} 100`}>
      {heights.map((h, i) => {
        const active = i / bars <= progress;
        return (
          <rect
            key={i}
            x={i}
            y={50 - (h * 50)}
            width="0.35"
            height={h * 100}
            rx="0.2"
            fill={active ? color : bg}
            style={{ transition: "fill 0.15s" }}
          />
        );
      })}
    </svg>
  );
}
