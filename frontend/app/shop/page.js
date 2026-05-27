import ProductListPage from "./template/ProductListPage";

export const metadata = {
  title: "Shop | Ruva",
  description: "Browse Ruva's curated product catalog.",
};

export default async function ShopPage({ searchParams }) {
  const params = await searchParams;

  const category =
    typeof params?.category === "string"
      ? params.category
      : "";

  const keyword =
    typeof params?.q === "string"
      ? params.q
      : "";

  return (
    <ProductListPage
      title="Shop"
      defaultCategory={category}
      defaultKeyword={keyword}
    />
  );
}