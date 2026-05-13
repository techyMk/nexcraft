export type Category = {
  id: number;
  name: string;
  slug: string;
  icon: string;
  count: number;
  image: string;
};

export type Product = {
  id: number;
  slug: string;
  name: string;
  brand: string;
  category: string;
  categorySlug: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  badge?: "NEW" | "HOT" | "SALE" | "AI PICK";
  featured?: boolean;
  stock: number;
  description: string;
  features: string[];
  images: string[];
  colors?: { name: string; hex: string }[];
};

export const categories: Category[] = [
  {
    id: 1,
    name: "Smartphones",
    slug: "smartphones",
    icon: "📱",
    count: 48,
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&q=80",
  },
  {
    id: 2,
    name: "Laptops",
    slug: "laptops",
    icon: "💻",
    count: 36,
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200&q=80",
  },
  {
    id: 3,
    name: "Gaming",
    slug: "gaming",
    icon: "🎮",
    count: 24,
    image:
      "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=1200&q=80",
  },
  {
    id: 4,
    name: "Audio",
    slug: "audio",
    icon: "🎧",
    count: 52,
    image:
      "https://images.unsplash.com/photo-1518443855757-dfadac7101ae?w=1200&q=80",
  },
  {
    id: 5,
    name: "Wearables",
    slug: "wearables",
    icon: "⌚",
    count: 30,
    image:
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=1200&q=80",
  },
  {
    id: 6,
    name: "Smart Home",
    slug: "smart-home",
    icon: "🏠",
    count: 22,
    image:
      "https://images.unsplash.com/photo-1558002038-1055907df827?w=1200&q=80",
  },
  {
    id: 7,
    name: "Accessories",
    slug: "accessories",
    icon: "🔌",
    count: 80,
    image:
      "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=1200&q=80",
  },
  {
    id: 8,
    name: "AI Gadgets",
    slug: "ai-gadgets",
    icon: "🤖",
    count: 18,
    image:
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&q=80",
  },
];

export const products: Product[] = [
  {
    id: 1,
    slug: "iphone-15-pro-max",
    name: "iPhone 15 Pro Max",
    brand: "Apple",
    category: "Smartphones",
    categorySlug: "smartphones",
    price: 1199,
    oldPrice: 1399,
    rating: 4.9,
    reviews: 2847,
    badge: "HOT",
    featured: true,
    stock: 45,
    description:
      "The most advanced iPhone ever. A17 Pro chip, titanium build, 48MP camera system and a powerhouse battery for creators on the move.",
    features: [
      "A17 Pro chip with 6-core GPU",
      "Titanium aerospace-grade frame",
      "48MP Pro camera system",
      "Action button + USB-C",
      "Up to 29h video playback",
    ],
    images: [
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=1200&q=80",
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1200&q=80",
      "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=1200&q=80",
    ],
    colors: [
      { name: "Natural", hex: "#9ca3af" },
      { name: "Blue", hex: "#5b8cff" },
      { name: "Black", hex: "#0f172a" },
    ],
  },
  {
    id: 2,
    slug: "macbook-pro-m3",
    name: "MacBook Pro 14” M3 Max",
    brand: "Apple",
    category: "Laptops",
    categorySlug: "laptops",
    price: 2499,
    oldPrice: 2799,
    rating: 4.9,
    reviews: 1238,
    badge: "AI PICK",
    featured: true,
    stock: 18,
    description:
      "Built for outrageous performance. The M3 Max chip and Liquid Retina XDR display make every workflow feel effortless.",
    features: [
      "M3 Max 16-core CPU / 40-core GPU",
      "14.2” Liquid Retina XDR",
      "Up to 128GB unified memory",
      "22-hour battery life",
      "Studio-quality 6-speaker system",
    ],
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&q=80",
      "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=1200&q=80",
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200&q=80",
    ],
  },
  {
    id: 3,
    slug: "sony-wh-1000xm5",
    name: "Sony WH-1000XM5",
    brand: "Sony",
    category: "Audio",
    categorySlug: "audio",
    price: 349,
    oldPrice: 399,
    rating: 4.8,
    reviews: 5421,
    badge: "SALE",
    featured: true,
    stock: 120,
    description:
      "Industry-leading noise cancellation, premium sound and 30 hours of battery. The reference for wireless headphones.",
    features: [
      "Dual processor V1 + HD QN1",
      "30h playback, fast charging",
      "Auto Talk + Adaptive Sound",
      "Multipoint Bluetooth",
      "Ultra-lightweight build",
    ],
    images: [
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=1200&q=80",
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1200&q=80",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=80",
    ],
  },
  {
    id: 4,
    slug: "galaxy-s24-ultra",
    name: "Galaxy S24 Ultra",
    brand: "Samsung",
    category: "Smartphones",
    categorySlug: "smartphones",
    price: 1299,
    oldPrice: 1499,
    rating: 4.8,
    reviews: 1932,
    badge: "NEW",
    featured: true,
    stock: 60,
    description:
      "Built with Galaxy AI. 200MP camera, titanium edge, and the brightest display in any smartphone.",
    features: [
      "Galaxy AI suite",
      "200MP Pro camera",
      "Snapdragon 8 Gen 3",
      "Titanium frame",
      "S Pen included",
    ],
    images: [
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=1200&q=80",
      "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=1200&q=80",
      "https://images.unsplash.com/photo-1567581935884-3349723552ca?w=1200&q=80",
    ],
  },
  {
    id: 5,
    slug: "apple-watch-ultra-2",
    name: "Apple Watch Ultra 2",
    brand: "Apple",
    category: "Wearables",
    categorySlug: "wearables",
    price: 799,
    rating: 4.9,
    reviews: 1450,
    badge: "HOT",
    featured: true,
    stock: 35,
    description:
      "The most rugged and capable Apple Watch ever, engineered for endurance, exploration, and adventure.",
    features: [
      "Brightest Apple display (3000 nits)",
      "S9 SiP with double tap",
      "36h battery, 72h low power",
      "Titanium case",
      "Precision dual-frequency GPS",
    ],
    images: [
      "https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=1200&q=80",
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=1200&q=80",
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=1200&q=80",
    ],
  },
  {
    id: 6,
    slug: "playstation-5-pro",
    name: "PlayStation 5 Pro",
    brand: "Sony",
    category: "Gaming",
    categorySlug: "gaming",
    price: 699,
    rating: 4.9,
    reviews: 3122,
    badge: "AI PICK",
    featured: true,
    stock: 12,
    description:
      "AI-enhanced upscaling, advanced ray tracing, and unbelievably fast performance for next-gen gaming.",
    features: [
      "PSSR AI Upscaling",
      "Advanced ray tracing",
      "2TB SSD",
      "Wi-Fi 7 ready",
      "Whisper-quiet cooling",
    ],
    images: [
      "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=1200&q=80",
      "https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=1200&q=80",
      "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=1200&q=80",
    ],
  },
  {
    id: 7,
    slug: "airpods-pro-2",
    name: "AirPods Pro 2 (USB-C)",
    brand: "Apple",
    category: "Audio",
    categorySlug: "audio",
    price: 249,
    oldPrice: 279,
    rating: 4.8,
    reviews: 8721,
    badge: "SALE",
    stock: 220,
    description:
      "Adaptive Audio, Personalized Spatial Audio and double the active noise cancellation.",
    features: [
      "Adaptive Audio",
      "USB-C MagSafe case",
      "H2 chip",
      "Up to 6h listening",
      "IP54 dust and water resistant",
    ],
    images: [
      "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=1200&q=80",
      "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=1200&q=80",
      "https://images.unsplash.com/photo-1612444530582-fc66183b16f7?w=1200&q=80",
    ],
  },
  {
    id: 8,
    slug: "xbox-elite-controller",
    name: "Xbox Elite Series 2",
    brand: "Microsoft",
    category: "Gaming",
    categorySlug: "gaming",
    price: 179,
    rating: 4.7,
    reviews: 921,
    stock: 60,
    description:
      "Pro-grade performance, hair trigger locks and a wrap that's grippy and durable.",
    features: [
      "Adjustable-tension thumbsticks",
      "Shorter hair trigger locks",
      "Wrap-around rubberized grip",
      "Up to 40-hour battery life",
      "Custom button mapping",
    ],
    images: [
      "https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=1200&q=80",
      "https://images.unsplash.com/photo-1612801799158-bbcb6b3f5c3a?w=1200&q=80",
      "https://images.unsplash.com/photo-1580327344181-c1163234e5a0?w=1200&q=80",
    ],
  },
  {
    id: 9,
    slug: "dji-mavic-3-pro",
    name: "DJI Mavic 3 Pro",
    brand: "DJI",
    category: "AI Gadgets",
    categorySlug: "ai-gadgets",
    price: 2199,
    rating: 4.9,
    reviews: 312,
    badge: "AI PICK",
    featured: true,
    stock: 8,
    description:
      "Triple-camera Hasselblad system with on-device AI scene recognition for cinematic results.",
    features: [
      "Hasselblad 4/3 CMOS",
      "43-min max flight time",
      "15km transmission",
      "AI subject tracking",
      "Omnidirectional obstacle sensing",
    ],
    images: [
      "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=1200&q=80",
      "https://images.unsplash.com/photo-1508444845599-5c89863b1c44?w=1200&q=80",
      "https://images.unsplash.com/photo-1521405924368-64d1f0bd9bef?w=1200&q=80",
    ],
  },
  {
    id: 10,
    slug: "google-nest-hub",
    name: "Nest Hub Max",
    brand: "Google",
    category: "Smart Home",
    categorySlug: "smart-home",
    price: 229,
    oldPrice: 269,
    rating: 4.6,
    reviews: 765,
    stock: 90,
    description:
      "Your smart home command center with a 10” HD display and an AI-tuned speaker system.",
    features: [
      "10” HD touchscreen",
      "Built-in camera + Duo calling",
      "Smart home control hub",
      "Voice match",
      "Stream YouTube and Netflix",
    ],
    images: [
      "https://images.unsplash.com/photo-1558002038-1055907df827?w=1200&q=80",
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&q=80",
      "https://images.unsplash.com/photo-1581090700227-1e8e6a32f9f3?w=1200&q=80",
    ],
  },
  {
    id: 11,
    slug: "asus-rog-strix",
    name: "ASUS ROG Strix G18",
    brand: "ASUS",
    category: "Laptops",
    categorySlug: "laptops",
    price: 2299,
    oldPrice: 2499,
    rating: 4.7,
    reviews: 528,
    badge: "HOT",
    stock: 22,
    description:
      "An 18” gaming beast with Intel Core i9-14900HX and NVIDIA RTX 4080 for unstoppable framerates.",
    features: [
      "Intel Core i9-14900HX",
      "NVIDIA RTX 4080 12GB",
      "18” QHD+ 240Hz mini-LED",
      "32GB DDR5",
      "1TB Gen4 NVMe",
    ],
    images: [
      "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1200&q=80",
      "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1200&q=80",
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80",
    ],
  },
  {
    id: 12,
    slug: "meta-quest-3",
    name: "Meta Quest 3 (512GB)",
    brand: "Meta",
    category: "AI Gadgets",
    categorySlug: "ai-gadgets",
    price: 649,
    rating: 4.6,
    reviews: 1209,
    badge: "NEW",
    featured: true,
    stock: 50,
    description:
      "Mixed reality headset that blends the physical and digital — and an absolute leap in fidelity.",
    features: [
      "Snapdragon XR2 Gen 2",
      "Full-color passthrough",
      "Pancake optics",
      "Touch Plus controllers",
      "300+ MR experiences",
    ],
    images: [
      "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=1200&q=80",
      "https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?w=1200&q=80",
      "https://images.unsplash.com/photo-1626387346567-68d0c4d3f9be?w=1200&q=80",
    ],
  },
];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getRelated(p: Product, n = 4) {
  return products
    .filter((x) => x.id !== p.id && x.categorySlug === p.categorySlug)
    .slice(0, n);
}

export const testimonials = [
  {
    name: "Aarav Mehta",
    role: "Product Designer",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80",
    quote:
      "NexCart's AI recommendations are spooky-good. It surfaced the exact camera I'd been thinking about for weeks.",
  },
  {
    name: "Sara Chen",
    role: "Engineer @ Vercel",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80",
    quote:
      "Checkout took 9 seconds. Nine. The future of shopping is genuinely this clean and this fast.",
  },
  {
    name: "Marcus Okafor",
    role: "Creator",
    avatar:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&q=80",
    quote:
      "I built my entire creator setup on NexCart. The wishlist intelligence is unmatched — it knows what I need next.",
  },
];

export const heroLogos = ["Apple", "Sony", "Samsung", "DJI", "Meta", "Google", "Microsoft", "ASUS"];
