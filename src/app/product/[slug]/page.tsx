import { notFound } from "next/navigation";
import { getProduct, getRelated, products } from "@/lib/data";
import { ProductDetail } from "./product-detail";

export async function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export default function Page({ params }: { params: { slug: string } }) {
  const product = getProduct(params.slug);
  if (!product) notFound();
  const related = getRelated(product, 4);
  return <ProductDetail product={product} related={related} />;
}
