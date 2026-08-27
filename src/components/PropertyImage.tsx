import Image from "next/image";
import { isBase64Image } from "@/lib/imageUtils";

type PropertyImageProps = {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

/** Renders house images from Firestore (base64 data URLs or legacy storage URLs). */
export function PropertyImage({
  src,
  alt,
  fill,
  className = "",
  sizes,
  priority,
}: PropertyImageProps) {
  if (!src) return null;

  if (isBase64Image(src)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={
          fill
            ? `absolute inset-0 h-full w-full object-cover ${className}`.trim()
            : className
        }
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={className}
      sizes={sizes}
      priority={priority}
      unoptimized
    />
  );
}
