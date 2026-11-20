import React from 'react';

/**
 * DentalLogo component matching the Rekha Dental logo from Image 1:
 * - Stylized anatomical tooth outline (crown + roots)
 * - Angled diagonal dental mirror/probe tool
 * - Dynamic bright green swoosh sweeping across the lower curve
 */
export default function DentalLogo({ size = 26, light = true, className = "" }) {
  // light=true when placed inside the dark navy badge (.logo-icon-box)
  // light=false when placed on white/light backgrounds
  const toothStroke = light ? "#FFFFFF" : "#0A2540";
  const mirrorStroke = light ? "#00D4B2" : "#008080";
  const swooshStroke = "#10B981";
  const mirrorFill = light ? "rgba(0, 212, 178, 0.35)" : "rgba(0, 128, 128, 0.2)";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
      aria-label="Dental Clinic Logo"
    >
      {/* 1. Tooth Crown & Dual Roots Outline */}
      <path
        d="M9.5 5.5C6.5 5.5 4.5 8 4.5 11.5C4.5 15.5 6.2 20 7.8 25C8.6 27.5 10.8 27.5 11.6 24.5C12.5 21.2 13.5 19.5 16 19.5C18.5 19.5 19.5 21.2 20.4 24.5C21.2 27.5 23.4 27.5 24.2 25C25.8 20 27.5 15.5 27.5 11.5C27.5 8 25.5 5.5 22.5 5.5C20 5.5 18 7 16 7C14 7 12 5.5 9.5 5.5Z"
        stroke={toothStroke}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={light ? "rgba(255, 255, 255, 0.08)" : "#FFFFFF"}
      />

      {/* 2. Diagonal Dental Mirror Tool */}
      <path
        d="M24 3.5L8 27"
        stroke={mirrorStroke}
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Mirror Head Circle at Top Right */}
      <circle
        cx="24.5"
        cy="3.5"
        r="2.5"
        stroke={mirrorStroke}
        strokeWidth="1.8"
        fill={mirrorFill}
      />

      {/* 3. Dynamic Green Swoosh curving across the front */}
      <path
        d="M3.5 20C6.5 25.5 13.5 28.5 28 17"
        stroke={swooshStroke}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
