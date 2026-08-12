"use client";

import NextTopLoader from "nextjs-toploader";

export default function TopLoader() {
  return (
    <NextTopLoader
      color="#8B2A1E"
      initialPosition={0.12}
      crawlSpeed={180}
      height={3}
      crawl={true}
      showSpinner={false}
      easing="ease"
      speed={220}
      shadow="0 0 10px #8B2A1E,0 0 5px #8B2A1E"
      zIndex={99999}
    />
  );
}