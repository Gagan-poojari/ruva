"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import api from "@/utils/api";
import toast from "react-hot-toast";
import { Search, SlidersHorizontal, Star, Tag, Loader2 } from "lucide-react";

function formatINR(value) {
  const num = Number(value || 0);
  return `₹${num.toLocaleString("en-IN")}`;
}

function getDiscountPercent(price, discountPrice) {
  const p = Number(price || 0);
  const d = Number(discountPrice || 0);
  if (!p || !d || d >= p) return null;
  return Math.round(((p - d) / p) * 100);
}

function getPrimaryImage(product) {
  return product?.images?.[0]?.url || "https://via.placeholder.com/240x320?text=Ruva";
}

function ProductRow({ product }) {
  const discountPercent = getDiscountPercent(product.price, product.discountPrice);
  const effectivePrice =
    product.discountPrice && product.discountPrice > 0 && product.discountPrice < product.price
      ? product.discountPrice
      : product.price;

  const inStock = (product.stock ?? 0) > 0;

  return (
    <Link
      href={`/products/${product._id}`}
      className="group block rounded-2xl border border-[#c87d1a]/15 bg-white/60 backdrop-blur-md hover:bg-white/80 transition-colors"
      style={{ boxShadow: "0 10px 30px rgba(42,5,5,0.06)" }}
    >
      <div className="p-3 sm:p-4 flex gap-3 sm:gap-4">
        <div className="relative w-28 h-36 sm:w-32 sm:h-40 rounded-xl overflow-hidden bg-[#f6efe5] border border-[#c87d1a]/10 flex-shrink-0">
          <img
            src={getPrimaryImage(product)}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
            loading="lazy"
          />
          {!inStock && (
            <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
              <span className="text-[10px] tracking-widest uppercase font-bold text-white px-2 py-1 rounded-full bg-black/45 border border-white/20">
                Out of stock
              </span>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[#3d0a0a] font-bold leading-snug line-clamp-2">
                {product.name}
              </div>
              <div className="mt-1 text-[11px] text-[#6b1a1a]/60 uppercase tracking-widest line-clamp-1">
                {product.category}
                {product.fabric ? ` • ${product.fabric}` : ""}
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <div className="inline-flex items-center gap-1 rounded-full px-2 py-1 bg-emerald-50 border border-emerald-100">
                <Star className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[11px] font-bold text-emerald-700">4.6</span>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-[#6b1a1a]">
                  {formatINR(effectivePrice)}
                </span>

                {discountPercent ? (
                  <>
                    <span className="text-xs font-bold text-[#6b1a1a]/45 line-through">
                      {formatINR(product.price)}
                    </span>
                    <span className="text-xs font-extrabold text-emerald-700">
                      {discountPercent}% off
                    </span>
                  </>
                ) : null}
              </div>

              <div className="mt-2 flex items-center gap-2">
                <span
                  className="text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-full border"
                  style={{
                    background: inStock ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
                    borderColor: inStock ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)",
                    color: inStock ? "#047857" : "#b91c1c",
                  }}
                >
                  {inStock ? "In stock" : "Sold out"}
                </span>
                {typeof product.stock === "number" && (
                  <span className="text-[11px] text-[#3d0a0a]/55">
                    {product.stock} left
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <div className="flex items-center gap-1 text-[11px] font-bold text-[#3d0a0a]/60">
                <Tag className="w-3.5 h-3.5" />
                <span>Best price</span>
              </div>
              <span className="text-[10px] font-bold text-[#c87d1a] uppercase tracking-widest">
                View
              </span>
            </div>
          </div>

          {Array.isArray(product.tags) && product.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {product.tags.slice(0, 3).map((t) => (
                <span
                  key={t}
                  className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full bg-[#fdf3e3] border border-[#c87d1a]/15 text-[#6b1a1a]/70"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function ProductGridCard({ product }) {
  const discountPercent = getDiscountPercent(product.price, product.discountPrice);
  const effectivePrice =
    product.discountPrice && product.discountPrice > 0 && product.discountPrice < product.price
      ? product.discountPrice
      : product.price;
  const inStock = (product.stock ?? 0) > 0;

  return (
    <Link
      href={`/products/${product._id}`}
      className="group rounded-2xl overflow-hidden bg-white/70 border border-[#c87d1a]/15 hover:bg-white/85 transition-colors"
      style={{ boxShadow: "0 12px 34px rgba(42,5,5,0.07)" }}
    >
      <div className="relative aspect-[3/4] bg-[#f6efe5] overflow-hidden">
        <img
          src={getPrimaryImage(product)}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-700"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {discountPercent ? (
            <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-1 rounded-full bg-emerald-600 text-white shadow">
              {discountPercent}% off
            </span>
          ) : null}
          {!inStock ? (
            <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-1 rounded-full bg-black/70 text-white border border-white/20">
              Sold out
            </span>
          ) : null}
        </div>
      </div>
      <div className="p-4">
        <div className="text-[#3d0a0a] font-extrabold line-clamp-2 leading-snug">
          {product.name}
        </div>
        <div className="mt-1 text-[11px] text-[#6b1a1a]/60 uppercase tracking-widest line-clamp-1">
          {product.category}
          {product.fabric ? ` • ${product.fabric}` : ""}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-lg font-black text-[#6b1a1a]">{formatINR(effectivePrice)}</span>
          {discountPercent ? (
            <span className="text-xs font-bold text-[#6b1a1a]/45 line-through">
              {formatINR(product.price)}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

export default function ProductListPage({ title = "Shop", defaultCategory = "" }) {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState(defaultCategory);
  const [fabric, setFabric] = useState("");
  const [sort, setSort] = useState("new");

  const [filtersOpen, setFiltersOpen] = useState(false);

  const queryParams = useMemo(() => {
    const params = {
      pageNumber: 1,
    };
    if (keyword.trim()) params.keyword = keyword.trim();
    if (category) params.category = category;
    if (fabric) params.fabric = fabric;
    return params;
  }, [keyword, category, fabric]);

  const visibleProducts = useMemo(() => {
    const items = [...products];
    if (sort === "price_asc") items.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
    if (sort === "price_desc") items.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
    return items;
  }, [products, sort]);

  const fetchPage = async ({ pageNumber, append }) => {
    try {
      append ? setLoadingMore(true) : setLoading(true);
      const { data } = await api.get("/products", { params: { ...queryParams, pageNumber } });
      const incoming = data?.products || [];
      setPage(data?.page || pageNumber);
      setPages(data?.pages || 1);
      setProducts((prev) => (append ? [...prev, ...incoming] : incoming));
    } catch (e) {
      toast.error("Failed to load products");
    } finally {
      append ? setLoadingMore(false) : setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage({ pageNumber: 1, append: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams]);

  const canLoadMore = page < pages;

  return (
    <div className="min-h-screen bg-[#fdf8ef]">
      <div className="absolute inset-x-0 top-0 h-[520px] pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(175deg,#fdf8ef_0%,#f8eddc_54%,#fdf5e8_100%)]" />
        <div
          className="absolute inset-0"
          style={{
            opacity: 0.25,
            backgroundImage:
              "repeating-linear-gradient(-45deg, rgba(176,118,32,0.17) 0, rgba(176,118,32,0.17) 1px, transparent 1px, transparent 20px), repeating-linear-gradient(45deg, rgba(176,118,32,0.12) 0, rgba(176,118,32,0.12) 1px, transparent 1px, transparent 20px)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-28 pb-12">
        <div className="flex flex-col gap-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#6b1a1a]/55">
                Ruva Boutique
              </div>
              <h1
                className="text-3xl md:text-5xl font-black text-[#2a0505]"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                {title}
              </h1>
              <p className="mt-2 text-sm text-[#5a2a1a]/70 max-w-xl">
                Discover handpicked sarees & blouses. Mobile view is optimized for quick scanning like Flipkart/Amazon.
              </p>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#6b1a1a]/60">
                Sort
              </label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white/70 border border-[#c87d1a]/20 text-[#3d0a0a] font-bold text-sm outline-none"
              >
                <option value="new">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Search + filter bar */}
          <div className="sticky top-[68px] z-20">
            <div
              className="rounded-2xl border border-[#c87d1a]/20 bg-white/70 backdrop-blur-xl"
              style={{ boxShadow: "0 16px 38px rgba(61,10,10,0.08)" }}
            >
              <div className="p-3 sm:p-4 flex items-center gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b1a1a]/55" />
                  <input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Search products (name/category)…"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/70 border border-[#c87d1a]/15 outline-none text-sm font-semibold text-[#2a0505] placeholder:text-[#6b1a1a]/40"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setFiltersOpen((s) => !s)}
                  className="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#fdf3e3] border border-[#c87d1a]/20 text-[#3d0a0a] font-extrabold text-xs uppercase tracking-widest"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                </button>

                <div className="hidden sm:flex items-center gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#6b1a1a]/60">
                    Sort
                  </label>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white/70 border border-[#c87d1a]/20 text-[#3d0a0a] font-bold text-sm outline-none"
                  >
                    <option value="new">Newest</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                  </select>
                </div>
              </div>

              {filtersOpen && (
                <div className="px-3 sm:px-4 pb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-[#6b1a1a]/60 mb-2">
                        Category
                      </div>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-white/70 border border-[#c87d1a]/15 text-[#2a0505] font-semibold text-sm outline-none"
                      >
                        <option value="">All</option>
                        <option value="Saree">Saree</option>
                        <option value="Blouse">Blouse</option>
                        <option value="Dupatta">Dupatta</option>
                      </select>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-[#6b1a1a]/60 mb-2">
                        Fabric
                      </div>
                      <input
                        value={fabric}
                        onChange={(e) => setFabric(e.target.value)}
                        placeholder="e.g. Banarasi, Silk Cotton…"
                        className="w-full px-3 py-2.5 rounded-xl bg-white/70 border border-[#c87d1a]/15 text-[#2a0505] font-semibold text-sm outline-none placeholder:text-[#6b1a1a]/40"
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setKeyword("");
                          setCategory(defaultCategory);
                          setFabric("");
                          setSort("new");
                        }}
                        className="w-full px-3 py-2.5 rounded-xl bg-white/70 border border-[#c87d1a]/20 text-[#3d0a0a] font-extrabold text-xs uppercase tracking-widest hover:bg-white"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <div className="py-10 flex items-center justify-center text-[#6b1a1a]/70 gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="font-bold tracking-widest uppercase text-xs">Loading products…</span>
            </div>
          ) : visibleProducts.length === 0 ? (
            <div className="py-14 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 border border-[#c87d1a]/20 text-[#3d0a0a] font-extrabold text-xs uppercase tracking-widest">
                No products found
              </div>
              <div className="mt-3 text-sm text-[#5a2a1a]/70">
                Try changing filters or search keyword.
              </div>
            </div>
          ) : (
            <>
              {/* Mobile list like Amazon/Flipkart */}
              <div className="grid grid-cols-1 gap-3 md:hidden">
                {visibleProducts.map((p) => (
                  <ProductRow key={p._id} product={p} />
                ))}
              </div>

              {/* Desktop grid */}
              <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {visibleProducts.map((p) => (
                  <ProductGridCard key={p._id} product={p} />
                ))}
              </div>

              <div className="mt-10 flex items-center justify-center">
                {canLoadMore ? (
                  <button
                    type="button"
                    onClick={() => fetchPage({ pageNumber: page + 1, append: true })}
                    disabled={loadingMore}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#c87d1a] to-[#d4a017] text-white font-extrabold uppercase tracking-widest text-xs disabled:opacity-70"
                    style={{ boxShadow: "0 14px 34px rgba(200,125,26,0.25)" }}
                  >
                    {loadingMore ? "Loading…" : "Load more"}
                  </button>
                ) : (
                  <div className="text-[11px] font-bold uppercase tracking-widest text-[#6b1a1a]/55">
                    End of results
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

