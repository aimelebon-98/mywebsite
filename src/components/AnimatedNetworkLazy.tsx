"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const AnimatedNetwork = dynamic(() => import("@/components/AnimatedNetwork"), {
  ssr: false,
  loading: () => null,
});

type Props = {
  className?: string;
  color?: string;
  dotColor?: string;
  density?: number;
  maxDistance?: number;
  influenceRadius?: number;
  attractStrength?: number;
  dotAlpha?: number;
  dotSizeMin?: number;
  dotSizeMax?: number;
  baseLineAlpha?: number;
  driftSpeed?: number;
  twinkle?: boolean;
};

export default function AnimatedNetworkLazy(props: Props) {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const startWhenIdle = () => setShouldLoad(true);

    if ("requestIdleCallback" in window) {
      const id = (window as unknown as { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback(startWhenIdle, { timeout: 2000 });
      return () => {
        if ("cancelIdleCallback" in window) {
          (window as unknown as { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(id);
        }
      };
    } else {
      const t = setTimeout(startWhenIdle, 1500);
      return () => clearTimeout(t);
    }
  }, []);

  if (!shouldLoad) return null;

  return <AnimatedNetwork {...props} />;
}
