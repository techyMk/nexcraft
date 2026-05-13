import { Hero } from "@/components/home/hero";
import { FeatureStrip } from "@/components/home/feature-strip";
import { CategoriesSection } from "@/components/home/categories-section";
import { FeaturedProducts } from "@/components/home/featured-products";
import { AISection } from "@/components/home/ai-section";
import { DealOfDay } from "@/components/home/deal-of-day";
import { NewArrivals } from "@/components/home/new-arrivals";
import { Testimonials } from "@/components/home/testimonials";
import { Newsletter } from "@/components/home/newsletter";
import { BrandStrip } from "@/components/home/brand-strip";

export default function HomePage() {
  return (
    <>
      <Hero />
      <BrandStrip />
      <FeatureStrip />
      <CategoriesSection />
      <FeaturedProducts />
      <AISection />
      <DealOfDay />
      <NewArrivals />
      <Testimonials />
      <Newsletter />
    </>
  );
}
