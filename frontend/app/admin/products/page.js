'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit3, Trash2, Layers, Package, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

const PAGE_SIZE_OPTIONS = [10, 25, 50];

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(searchTerm); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        pageNumber: page,
        pageSize: limit,
        ...(debouncedSearch && { keyword: debouncedSearch }),
      });
      const { data } = await api.get(`/products?${params}`);
      setProducts(data.products || []);
      setTotalPages(data.pages || 1);
      setTotalCount(data.totalCount || 0);
    } catch {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    const toastId = toast.loading('Deleting product...');
    try {
      setIsDeleting(true);
      await api.delete(`/products/${id}`);
      toast.success('Product deleted', { id: toastId });
      if (products.length === 1 && page > 1) setPage(p => p - 1);
      else fetchProducts();
    } catch {
      toast.error('Failed to delete product', { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const startItem = totalCount === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalCount);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Catalog</h1>
          <p className="text-sm text-gray-500 mt-1">{totalCount > 0 ? `${totalCount} products total` : 'Manage your inventory and product listings'}</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Search products..." className="pl-10 pr-4 py-2 bg-white border border-gray-200 text-gray-900 rounded-xl outline-none focus:border-primary-500 transition-all text-sm w-64" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <Link href="/admin/products/new" className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-zinc-800 transition-all shadow-lg shadow-black/10">
            <Plus size={18} /> Add Product
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Inventory</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider"><span className="flex items-center gap-1"><Clock size={11} />Added</span></th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading
                ? Array.from({ length: limit }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {[...Array(6)].map((_, j) => <td key={j} className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-3/4" /></td>)}
                    </tr>
                  ))
                : products.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-16 rounded-lg bg-gray-100 overflow-hidden border border-gray-100 shrink-0">
                            <img src={product.images?.[0]?.url || 'https://via.placeholder.com/150'} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold text-gray-900 leading-tight line-clamp-1">{product.name}</span>
                            <span className="text-[10px] text-gray-400 mt-0.5 tracking-tight uppercase">SKU: {product._id.slice(-6)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 text-slate-600 text-[10px] font-bold uppercase tracking-wider border border-slate-100">
                          <Layers size={10} />{product.category || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">₹{product.price.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${product.stock > 10 ? 'bg-emerald-500' : product.stock > 0 ? 'bg-orange-500' : 'bg-red-500'}`} />
                            <span className="text-sm font-medium text-gray-700">{product.stock ?? product.countInStock ?? 0} in stock</span>
                          </div>
                          {(product.stock ?? product.countInStock) === 0 && <span className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">Out of Stock</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4"><span className="text-xs text-gray-500">{formatDate(product.createdAt)}</span></td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/products/${product._id}`} className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"><Edit3 size={18} /></Link>
                          <button onClick={() => handleDelete(product._id)} disabled={isDeleting} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {!loading && products.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4"><Package className="text-gray-300" size={28} /></div>
            <h3 className="text-gray-900 font-bold">No products found</h3>
            <p className="text-gray-500 text-sm mt-1">{debouncedSearch ? `No results for "${debouncedSearch}"` : 'Add some products to get started'}</p>
          </div>
        )}

        {totalCount > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span>Showing {startItem}–{endItem} of {totalCount}</span>
              <span className="text-gray-300">|</span>
              <span>Rows:</span>
              <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} className="border border-gray-200 rounded-lg px-2 py-1 text-sm text-gray-700 outline-none focus:border-primary-500">
                {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(1)} disabled={page === 1} className="px-2 py-1.5 text-xs rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">«</button>
              <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"><ChevronLeft size={16} /></button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                .reduce((acc, n, idx, arr) => { if (idx > 0 && n - arr[idx - 1] > 1) acc.push('...'); acc.push(n); return acc; }, [])
                .map((n, i) => n === '...'
                  ? <span key={`e${i}`} className="px-2 text-gray-400 text-sm">…</span>
                  : <button key={n} onClick={() => setPage(n)} className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${page === n ? 'bg-black text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{n}</button>
                )}
              <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages} className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"><ChevronRight size={16} /></button>
              <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="px-2 py-1.5 text-xs rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">»</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}