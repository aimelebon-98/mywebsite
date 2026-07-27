"use client";

import { useEffect } from "react";

export default function RootNotFound() {
  useEffect(() => {
    // Redirect to English 404 page
    window.location.href = "/en/404-redirect";
  }, []);
  return null;
}