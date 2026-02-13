// frontend/src/lib/tools.ts

export type ToolIcon =
  | "amazon"
  | "flipkart"
  | "meesho"
  | "shopsy"
  | "jiomart"
  | "myntra"
  | "ajio"
  | "snapdeal"
  | "glowroad"
  | "manualcrop"
  | "merge"
  | "rearrange"
  | "fnsku";

export type ToolMode = "preset" | "merge" | "rearrange" | "manual" | "custom";

export type Tool = {
  slug: string;
  title: string;
  heading: string;
  tagline: string;
  buttonText: string;
  preset?: string;
  mode: ToolMode;
  icon: ToolIcon;   // used to pick logo from /public/logos/{icon}.svg (or mapping)
  accent: string;   // tailwind gradient class
};

export const TOOLS: Tool[] = [
  {
    slug: "amazon-label-crop",
    title: "Amazon Label Crop | PDF Cropper",
    heading: "Amazon Label Crop",
    tagline:
      "Effortless Amazon Label Cropping Solutions. Simplify Your Shipping Process in just one click.",
    buttonText: "Amazon pdf crop",
    preset: "amazon_label",
    mode: "preset",
    icon: "amazon",
    accent: "from-amber-400 to-orange-500",
  },
  {
    slug: "flipkart-label-crop",
    title: "Flipkart Label Crop | PDF Cropper",
    heading: "Flipkart Label Crop",
    tagline: "Flipkart Label Cropping: Simplifying Shipping, One Click at a Time.",
    buttonText: "Flipkart pdf crop",
    preset: "flipkart_label",
    mode: "preset",
    icon: "flipkart",
    accent: "from-blue-500 to-cyan-400",
  },
  {
    slug: "meesho-label-crop",
    title: "Meesho Label Crop | PDF Cropper",
    heading: "Meesho Label Crop",
    tagline: "Meesho Label Cropping: Empowering Your Shipping Success.",
    buttonText: "Meesho pdf crop",
    preset: "meesho_label",
    mode: "preset",
    icon: "meesho",
    accent: "from-fuchsia-500 to-pink-500",
  },
  {
    slug: "shopsy-label-crop",
    title: "Shopsy Label Crop | PDF Cropper",
    heading: "Shopsy Label Crop",
    tagline: "Shopsy Label Cropping: Empowering Your Shipping Success.",
    buttonText: "Shopsy pdf crop",
    preset: "shopsy_label",
    mode: "preset",
    icon: "shopsy",
    accent: "from-violet-500 to-indigo-500",
  },
  {
    slug: "jiomart-label-crop",
    title: "Jiomart Label Crop | PDF Cropper",
    heading: "Jiomart Label Crop",
    tagline: "Jiomart Label Cropping : Empowering Your Shipping Success.",
    buttonText: "Jiomart pdf crop",
    preset: "jiomart_label",
    mode: "preset",
    icon: "jiomart",
    accent: "from-emerald-500 to-lime-400",
  },
  {
    slug: "myntra-label-crop",
    title: "Myntra Label Crop | PDF Cropper",
    heading: "Myntra Label Crop",
    tagline: "Myntra Label Cropping : Empowering Your Shipping Success.",
    buttonText: "Myntra pdf crop",
    preset: "myntra_label",
    mode: "preset",
    icon: "myntra",
    accent: "from-rose-500 to-orange-500",
  },
  {
    slug: "ajio-label-crop",
    title: "Ajio Label Crop | PDF Cropper",
    heading: "Ajio Label Crop",
    tagline: "Ajio Label Cropping: Empowering Your Shipping Success.",
    buttonText: "Ajio pdf crop",
    preset: "ajio_label",
    mode: "preset",
    icon: "ajio",
    accent: "from-slate-700 to-zinc-900",
  },
  {
    slug: "snapdeal-label-crop",
    title: "Snapdeal Label Crop | PDF Cropper",
    heading: "Snapdeal Label Crop",
    tagline: "Snapdeal Label Cropping: Empowering Your Shipping Success.",
    buttonText: "Snapdeal pdf crop",
    preset: "snapdeal_label",
    mode: "preset",
    icon: "snapdeal",
    accent: "from-red-500 to-rose-500",
  },
  {
    slug: "glowroad-label-crop",
    title: "GlowRoad Label Crop | PDF Cropper",
    heading: "GlowRoad Label Crop",
    tagline: "GlowRoad Label Cropping: Smart process for label crop.",
    buttonText: "GlowRoad pdf crop",
    preset: "glowroad_label",
    mode: "preset",
    icon: "glowroad",
    accent: "from-teal-500 to-cyan-400",
  },

  {
    slug: "amazon-fnsku-barcode-label-generator",
    title: "Amazon FNSKU barcode label generator | PDF Cropper",
    heading: "Amazon FNSKU barcode label generator",
    tagline: "FNSKU barcode label generator with custom price",
    buttonText: "FNSKU Label Create",
    mode: "custom",
    icon: "fnsku",
    accent: "from-yellow-400 to-amber-500",
  },

  {
    slug: "pdf-merge",
    title: "PDF Merge | PDF Cropper",
    heading: "PDF Merge",
    tagline: "Combine Multiple PDF file quickly",
    buttonText: "PDF Merge",
    mode: "merge",
    icon: "merge",
    accent: "from-sky-500 to-indigo-500",
  },
  {
    slug: "rearrange-pdf",
    title: "ReArrange PDF | PDF Cropper",
    heading: "ReArrange PDF",
    tagline: "ReArrange PDF page quickly",
    buttonText: "ReArrange PDF",
    mode: "rearrange",
    icon: "rearrange",
    accent: "from-purple-500 to-fuchsia-500",
  },
  {
    slug: "crop-pdf",
    title: "Crop PDF | PDF Cropper",
    heading: "Crop PDF",
    tagline: "Crop PDF pages easily",
    buttonText: "Crop PDF",
    mode: "manual",
    icon: "manualcrop",
    accent: "from-zinc-800 to-zinc-950",
  },
];

// Optional helpers
export function getToolBySlug(slug: string) {
  return TOOLS.find((t) => t.slug === slug);
}

export function getToolLogoPath(icon: ToolIcon) {
  // if you kept your SVGs as /public/logos/{name}.svg
  // manualcrop uses crop.svg, fnsku uses barcode.svg, etc.
  const map: Record<ToolIcon, string> = {
    amazon: "/logos/amazon.svg",
    flipkart: "/logos/flipkart.svg",
    meesho: "/logos/meesho.svg",
    shopsy: "/logos/shopsy.svg",
    jiomart: "/logos/jiomart.svg",
    myntra: "/logos/myntra.svg",
    ajio: "/logos/ajio.svg",
    snapdeal: "/logos/snapdeal.svg",
    glowroad: "/logos/glowroad.svg",
    manualcrop: "/logos/crop.svg",
    merge: "/logos/merge.svg",
    rearrange: "/logos/rearrange.svg",
    fnsku: "/logos/barcode.svg",
  };

  return map[icon];
}
