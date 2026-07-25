"use client";

import dynamic from "next/dynamic";

const ExitIntentPopupInner = dynamic(() => import("./ExitIntentPopupInner"), {
  ssr: false,
  loading: () => null,
});

export default function ExitIntentPopup() {
  return <ExitIntentPopupInner />;
}
