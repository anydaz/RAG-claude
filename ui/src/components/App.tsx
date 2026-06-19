"use client";

import { useLayoutEffect } from "react";

export default function App({ children }: { children: React.ReactNode }) {
  useLayoutEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  }, []);

  return children;
}
