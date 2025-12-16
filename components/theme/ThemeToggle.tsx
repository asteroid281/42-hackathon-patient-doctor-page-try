"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

type Theme = "light" | "dark";

export default function ThemeToggle() {
  const [theme, setTheme] = React.useState<Theme>("light");

  React.useEffect(() => {
    try {
      const stored = (localStorage.getItem("theme") as Theme | null) ?? null;
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(stored ?? (isDark ? "dark" : "light"));
    } catch (_) {}
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem("theme", next);
    } catch (_) {}
    if (next === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }

  const isDark = theme === "dark";

  return (
    <Button
      variant="secondary"
      onClick={toggle}
      aria-pressed={isDark}
      aria-label={isDark ? "Açık temaya geç" : "Koyu temaya geç"}
      title={isDark ? "Açık tema" : "Koyu tema"}
    >
      <span aria-hidden="true" className="mr-2">
        {isDark ? "☀️" : "🌙"}
      </span>
      <span className="text-sm">{isDark ? "Light" : "Dark"}</span>
    </Button>
  );
}
