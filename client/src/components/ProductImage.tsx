import { useState } from "react";
import { Package } from "lucide-react";
import { proxyImageUrl } from "@/lib/imageProxy";

interface ProductImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  containerClassName?: string;
}

export default function ProductImage({ src, alt, className = "", containerClassName = "" }: ProductImageProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");
  const proxiedUrl = proxyImageUrl(src);

  return (
    <div className={`relative ${containerClassName}`}>
      {/* Loading skeleton */}
      {status === "loading" && proxiedUrl && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 animate-pulse rounded">
          <Package className="w-8 h-8 text-gray-300" />
        </div>
      )}

      {/* Error fallback */}
      {(status === "error" || !proxiedUrl) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 rounded">
          <Package className="w-10 h-10 text-gray-300 mb-1" />
          <span className="text-[10px] text-gray-400">Sin imagen</span>
        </div>
      )}

      {/* Actual image */}
      {proxiedUrl && (
        <img
          src={proxiedUrl}
          alt={alt}
          className={`${className} ${status === "loaded" ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}
          loading="lazy"
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
        />
      )}
    </div>
  );
}
