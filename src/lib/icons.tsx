import {
  Bot,
  Gamepad2,
  Headphones,
  Home,
  Laptop,
  type LucideIcon,
  type LucideProps,
  Package,
  Plug,
  Smartphone,
  Watch,
} from "lucide-react";

/**
 * Maps a category slug to its Lucide icon. Use <CategoryIcon slug="..." />
 * everywhere we used to render the raw emoji from `data.ts`.
 */
const CATEGORY_ICON: Record<string, LucideIcon> = {
  smartphones: Smartphone,
  laptops: Laptop,
  gaming: Gamepad2,
  audio: Headphones,
  wearables: Watch,
  "smart-home": Home,
  accessories: Plug,
  "ai-gadgets": Bot,
};

export function CategoryIcon({
  slug,
  ...rest
}: { slug: string } & LucideProps) {
  const Icon = CATEGORY_ICON[slug] ?? Package;
  return <Icon {...rest} />;
}
