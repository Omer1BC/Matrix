import clsx from "clsx";
import Image from "next/image";

type HoverBehavior = "none" | "self" | "group";

type NeoIconProps = {
  width?: number;
  height?: number;
  className?: string;
  hoverBehavior?: HoverBehavior;
  alt?: string;
};

export default function NeoIcon({
  width = 20,
  height = 20,
  className,
  hoverBehavior = "group",
  alt = "Neo AI",
}: NeoIconProps) {
  const base =
    "filter hue-rotate-[85deg] saturate-[1.8] brightness-[1.4] transition-all duration-300";

  const hover =
    hoverBehavior === "group"
      ? "group-hover:brightness-[1.6] group-hover:drop-shadow-[0_0_4px_rgba(125,255,125,0.3)]"
      : hoverBehavior === "self"
      ? "hover:brightness-[1.6] hover:drop-shadow-[0_0_4px_rgba(125,255,125,0.3)]"
      : "";

  return (
    <Image
      src="/ai.png"
      alt={alt}
      width={width}
      height={height}
      className={clsx(base, hover, className)}
      priority={false}
    />
  );
}
