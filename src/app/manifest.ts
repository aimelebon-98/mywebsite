import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NewDealZone - Premium Footwear",
    short_name: "NewDealZone",
    description: "Shop premium sneakers, running shoes, boots, formal shoes, sandals and casual footwear.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#CA3F2E",
    orientation: "portrait-primary",
    categories: ["shopping", "lifestyle"],
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
