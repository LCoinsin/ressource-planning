"use client";

import DOMPurify from "dompurify";
import { useMemo } from "react";

interface SafeSvgIconProps {
  svg: string;
  className?: string;
}

/**
 * Renders a raw SVG string securely using DOMPurify sanitization.
 * Forces the SVG to fit the container size via w/h attributes.
 */
export function SafeSvgIcon({ svg, className = "w-4 h-4" }: SafeSvgIconProps) {
  const sanitized = useMemo(() => {
    if (typeof window === "undefined") return "";
    const clean = DOMPurify.sanitize(svg, {
      USE_PROFILES: { svg: true, svgFilters: true },
      ADD_TAGS: ["svg"],
      ADD_ATTR: [
        "viewBox",
        "fill",
        "stroke",
        "stroke-width",
        "stroke-linecap",
        "stroke-linejoin",
        "d",
        "cx",
        "cy",
        "r",
        "rx",
        "ry",
        "x",
        "y",
        "x1",
        "y1",
        "x2",
        "y2",
        "width",
        "height",
        "transform",
        "opacity",
        "points",
      ],
    });
    return clean;
  }, [svg]);

  if (!svg) return null;

  return (
    <span
      className={`inline-flex items-center justify-center flex-shrink-0 [&>svg]:w-full [&>svg]:h-full ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
