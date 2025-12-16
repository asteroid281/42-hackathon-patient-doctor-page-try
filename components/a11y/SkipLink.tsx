"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

/**
 * SkipLink Component
 * Keyboard users için ana içeriğe doğrudan atlama linki
 * WCAG 2.1 A11y best practice
 */
export const SkipLink = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement>
>((props, ref) => {
  return (
    <a
      ref={ref}
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-0 focus:left-0 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:p-4 focus:rounded-b-md"
      {...props}
    >
      Ana içeriğe atla
    </a>
  );
});

SkipLink.displayName = "SkipLink";
