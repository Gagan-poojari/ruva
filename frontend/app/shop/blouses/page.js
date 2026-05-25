import ProductListPage from "../template/ProductListPage";

export const metadata = {
  title: "Blouses | Ruva",
  description: "Explore Ruva's blouse collection.",
};

export default function BlousesPage() {
  return <ProductListPage title="Blouses" defaultCategory="Blouses" />;
}
