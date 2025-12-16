"use client";

import * as React from "react";

type ViewportSize = "xs" | "sm" | "md" | "lg" | "xl";

const BREAKPOINTS: Record<ViewportSize, number> = {
  xs: 320,
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1280,
};

/**
 * Hook to detect responsive viewport size
 * Returns: "xs" | "sm" | "md" | "lg" | "xl"
 */
export const useResponsive = () => {
  const [size, setSize] = React.useState<ViewportSize>("lg");

  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      if (width < BREAKPOINTS.sm) setSize("xs");
      else if (width < BREAKPOINTS.md) setSize("sm");
      else if (width < BREAKPOINTS.lg) setSize("md");
      else if (width < BREAKPOINTS.xl) setSize("lg");
      else setSize("xl");
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return {
    size,
    isMobile: size === "xs" || size === "sm",
    isTablet: size === "md",
    isDesktop: size === "lg" || size === "xl",
    isSmallScreen: size === "xs",
  };
};

/**
 * Accessibility utility for generating unique IDs
 */
let idCounter = 0;
export const useId = (prefix = "id") => {
  const [id] = React.useState(() => {
    idCounter += 1;
    return `${prefix}-${idCounter}`;
  });
  return id;
};

/**
 * Utility for managing keyboard navigation in lists
 */
export const useKeyboardNavigation = (itemCount: number) => {
  const [focusedIndex, setFocusedIndex] = React.useState(0);
  const itemRefs = React.useRef<(HTMLElement | null)[]>([]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    let newIndex = focusedIndex;

    switch (e.key) {
      case "ArrowUp":
      case "ArrowLeft":
        newIndex = Math.max(0, focusedIndex - 1);
        e.preventDefault();
        break;
      case "ArrowDown":
      case "ArrowRight":
        newIndex = Math.min(itemCount - 1, focusedIndex + 1);
        e.preventDefault();
        break;
      case "Home":
        newIndex = 0;
        e.preventDefault();
        break;
      case "End":
        newIndex = itemCount - 1;
        e.preventDefault();
        break;
      default:
        return;
    }

    setFocusedIndex(newIndex);
    itemRefs.current[newIndex]?.focus();
  };

  return {
    focusedIndex,
    setFocusedIndex,
    itemRefs,
    handleKeyDown,
  };
};

/**
 * Hook for Idempotency Key generation (UUID v4)
 */
export const useIdempotencyKey = () => {
  return React.useMemo(() => {
    // Simple UUID v4 implementation
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === "x" ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }, []);
};
