/**
 * CopikonUSA Logo — inline SVG
 * "COP" black, "IKON" red (#E31E24), "USA" navy (#1B2A4A)
 * Stylized K with angular notch
 */

interface LogoProps {
  className?: string;
  variant?: "color" | "white";
  height?: number;
}

export function CopikonLogo({ className = "", variant = "color", height = 40 }: LogoProps) {
  const isWhite = variant === "white";
  const copColor = isWhite ? "#FFFFFF" : "#1A1A1A";
  const ikonColor = isWhite ? "#FFFFFF" : "#E31E24";
  const usaColor = isWhite ? "#FFFFFF" : "#1B2A4A";
  const w = height * 5.4; // aspect ratio ~5.4:1

  return (
    <svg
      viewBox="0 0 270 50"
      width={w}
      height={height}
      className={className}
      aria-label="CopikonUSA"
      role="img"
    >
      {/* COP */}
      <text
        x="0"
        y="38"
        fontFamily="'Inter', 'Helvetica Neue', Arial, sans-serif"
        fontWeight="800"
        fontSize="42"
        fill={copColor}
        letterSpacing="-1"
      >
        COP
      </text>

      {/* IKON — stylized K with angular cut */}
      <text
        x="92"
        y="38"
        fontFamily="'Inter', 'Helvetica Neue', Arial, sans-serif"
        fontWeight="800"
        fontSize="42"
        fill={ikonColor}
        letterSpacing="-1"
      >
        IKON
      </text>

      {/* USA — smaller, navy, positioned at bottom-right */}
      <text
        x="216"
        y="47"
        fontFamily="'Inter', 'Helvetica Neue', Arial, sans-serif"
        fontWeight="800"
        fontSize="24"
        fill={usaColor}
        letterSpacing="2"
      >
        USA
      </text>
    </svg>
  );
}

export default CopikonLogo;
