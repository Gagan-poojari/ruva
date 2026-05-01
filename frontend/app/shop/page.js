import ProductListPage from "@/components/Shop/ProductListPage";

export const metadata = {
  title: "Shop | Ruva",
  description: "Browse Ruva's curated product catalog.",
};

export default function ShopPage({ searchParams }) {
  const category = typeof searchParams?.category === "string" ? searchParams.category : "";
  const keyword = typeof searchParams?.q === "string" ? searchParams.q : "";
  return <ProductListPage title="Shop" defaultCategory={category} defaultKeyword={keyword} />;
}

