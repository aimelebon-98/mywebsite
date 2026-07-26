"use client";

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
};

export default function AnimatedNetworkLazy(props: Props) {
  return <AnimatedNetwork {...props} />;
}