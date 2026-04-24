import ProductListPage from "@/components/Shop/ProductListPage";

export const metadata = {
  title: "Sarees | Ruva",
  description: "Explore Ruva's saree collection.",
};

export default function SareesPage() {
  return <ProductListPage title="Sarees" defaultCategory="Sarees" />;
}
