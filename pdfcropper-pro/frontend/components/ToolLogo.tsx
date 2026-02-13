type Props = {
  icon: string;
};

export default function ToolLogo({ icon }: Props) {
  const map: Record<string, string> = {
    amazon: "/logos/amazon.svg",
    flipkart: "/logos/flipkart.svg",
    meesho: "/logos/meesho.svg",
    myntra: "/logos/myntra.svg",
    jiomart: "/logos/jiomart.svg",
    shopsy: "/logos/shopsy.svg",
    ajio: "/logos/ajio.svg",
    snapdeal: "/logos/snapdeal.svg",
    glowroad: "/logos/glowroad.svg",
    manualcrop: "/logos/crop.svg",
    merge: "/logos/merge.svg",
    rearrange: "/logos/rearrange.svg",
    fnsku: "/logos/barcode.svg",
  };

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-soft border">
      <img
        src={map[icon] || "/logos/default.svg"}
        alt={icon}
        className="h-6 w-auto object-contain"
      />
    </div>
  );
}
