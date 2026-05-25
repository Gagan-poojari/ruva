import ProductListPage from "../template/ProductListPage";
export const metadata = { title: "Limited Offers | Ruva" };
export default function LimitedOffersPage() {
  return <ProductListPage title="Limited Offers" defaultCategory="" defaultIsFeatured={true} />;
}