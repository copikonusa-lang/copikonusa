/**
 * CopikonUSA Logo — uses the official brand logo image
 * "COP" black (rounded tech font), "IKON" red (#E31E24) with stylized K,
 * "USA" navy (#1B2A4A) with ® symbol
 */

import logoColor from "@assets/copikon-logo.png";

interface LogoProps {
  className?: string;
  variant?: "color" | "white";
  height?: number;
  "data-testid"?: string;
}

export function CopikonLogo({ className = "", variant = "color", height = 40, ...rest }: LogoProps) {
  const isWhite = variant === "white";

  return (
    <img
      src={logoColor}
      alt="CopikonUSA"
      height={height}
      style={{
        height: `${height}px`,
        width: "auto",
        objectFit: "contain",
        ...(isWhite ? { filter: "brightness(0) invert(1)" } : {}),
      }}
      className={className}
      loading="eager"
      data-testid={rest["data-testid"] || "img-logo"}
    />
  );
}

export default CopikonLogo;
