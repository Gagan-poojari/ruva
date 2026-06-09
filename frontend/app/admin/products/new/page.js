'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Save, Upload, X, Loader2, Info, Plus, Sparkles, GripVertical
} from 'lucide-react';
import api from '@/utils/api';
import toast from 'react-hot-toast';

const SAREE_FABRICS = [
  "Banarasi", "Kanjivaram", "Mysore Silk", "Patola", "Chanderi",
  "Maheshwari", "Tant", "Khadi", "Organza", "Georgette", "Net",
  "Ruffle", "Bandhani", "Paithani", "Leheriya", "Kasavu",
  "Sambalpuri", "Baluchari", "Silk-cotton", "Cotton", "Velvet",
  "Satine", "silk", "Chiffon"
];

const CATEGORIES = [
  "Sarees", "Blouses", "Silver Jewelry",
  "Crystal Bracelets", "Shawls", "Dupatta"
];

const BLOUSE_SIZES = [
  { label: "32", sub: "S/M" },
  { label: "34", sub: "L/XL" },
  { label: "36", sub: "XXL" },
];

const createEmptyVariant = () => ({
  colorName: '',
  colorHex: '#cccccc',
  stock: '0',
  price: '',
  discountPrice: '',
});

export default function NewProduct() {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [productData, setProductData] = useState({
    name: '',
    slug: '',
    description: '',
    category: 'Sarees',
    fabric: '',
    occasion: '',
    price: '',
    discountPrice: '',
    stock: '10',
    isFeatured: false,
    isBestseller: false,
    isTrending: false,
    isNewArrival: false,
    isLimitedEdition: false,
    tags: [],
    sizes: [{ label: "One Size", stock: 10 }],
    blouseSizes: [],          // [{ label: "32", stock: 0 }, ...]
    colors: "",
    colorVariants: [createEmptyVariant()],
  });

  // Each entry: { file: File, url: string }
  const [images, setImages] = useState([]);
  const [variantImages, setVariantImages] = useState([[]]);
  const [variantPreviewUrls, setVariantPreviewUrls] = useState([[]]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Drag state for main image reorder
  const dragIndex = useRef(null);
  const dragOverIndex = useRef(null);

  /* ─── AI Description ─── */
  const generateAIDescription = async () => {
    if (!productData.name) { toast.error('Please enter a product name first'); return; }
    setIsGeneratingAI(true);
    const toastId = toast.loading('Tailoring a description...');
    try {
      const { data } = await api.post('/ai/describe', {
        name: productData.name,
        category: productData.category,
        fabric: productData.fabric,
        occasion: productData.occasion,
        colors: productData.colors ? productData.colors.split(',').map(c => c.trim()) : []
      });
      setProductData(prev => ({ ...prev, description: data.description }));
      toast.success('Description generated!', { id: toastId });
    } catch (error) {
      const message = error.response?.status === 429
        ? 'AI limit reached. Please write your own description.'
        : 'Failed to generate description. Please try again.';
      toast.error(message, { id: toastId });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  /* ─── Field change ─── */
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (name === 'name' && !productData.slug) {
      setProductData(prev => ({
        ...prev,
        slug: value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
      }));
    }
  };

  /* ─── Blouse size toggle ─── */
  const toggleBlouseSize = (label) => {
    setProductData(prev => {
      const exists = prev.blouseSizes.find(s => s.label === label);
      return {
        ...prev,
        blouseSizes: exists
          ? prev.blouseSizes.filter(s => s.label !== label)
          : [...prev.blouseSizes, { label, stock: 0 }],
      };
    });
  };

  const handleBlouseSizeStockChange = (label, stockValue) => {
    setProductData(prev => ({
      ...prev,
      blouseSizes: prev.blouseSizes.map(s =>
        s.label === label ? { ...s, stock: Number(stockValue) || 0 } : s
      ),
    }));
  };

  /* ─── Main images ─── */
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const entries = files.map(file => ({ file, url: URL.createObjectURL(file) }));
    setImages(prev => [...prev, ...entries]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  /* ─── Drag-to-reorder main images ─── */
  const onDragStart = (index) => { dragIndex.current = index; };
  const onDragEnter = (index) => { dragOverIndex.current = index; };
  const onDragEnd = () => {
    const from = dragIndex.current;
    const to = dragOverIndex.current;
    if (from === null || to === null || from === to) return;
    setImages(prev => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    dragIndex.current = null;
    dragOverIndex.current = null;
  };

  /* ─── Variants ─── */
  const addVariant = () => {
    setProductData(prev => ({ ...prev, colorVariants: [...prev.colorVariants, createEmptyVariant()] }));
    setVariantImages(prev => [...prev, []]);
    setVariantPreviewUrls(prev => [...prev, []]);
  };

  const removeVariant = (index) => {
    setProductData(prev => ({ ...prev, colorVariants: prev.colorVariants.filter((_, i) => i !== index) }));
    setVariantImages(prev => prev.filter((_, i) => i !== index));
    setVariantPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleVariantFieldChange = (index, field, value) => {
    setProductData(prev => ({
      ...prev,
      colorVariants: prev.colorVariants.map((v, i) => i === index ? { ...v, [field]: value } : v),
    }));
  };

  const handleVariantImageChange = (index, files) => {
    const parsedFiles = Array.from(files || []);
    setVariantImages(prev => prev.map((imgs, i) => i === index ? [...imgs, ...parsedFiles] : imgs));
    const urls = parsedFiles.map(f => URL.createObjectURL(f));
    setVariantPreviewUrls(prev => prev.map((imgs, i) => i === index ? [...imgs, ...urls] : imgs));
  };

  const removeVariantImage = (vi, ii) => {
    setVariantImages(prev => prev.map((imgs, i) => i === vi ? imgs.filter((_, j) => j !== ii) : imgs));
    setVariantPreviewUrls(prev => prev.map((imgs, i) => i === vi ? imgs.filter((_, j) => j !== ii) : imgs));
  };

  /* ─── Submit ─── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length === 0) { toast.error('Please upload at least one image'); return; }

    const isBlouse = productData.category === 'Blouses';
    if (isBlouse && productData.blouseSizes.length === 0) {
      toast.error('Please select at least one blouse size');
      return;
    }

    setSaving(true);
    try {
      const dynamicTags = [];
      if (productData.isNewArrival) dynamicTags.push('new');
      if (productData.isLimitedEdition) dynamicTags.push('limited');
      const mergedTags = Array.from(new Set([...(productData.tags || []), ...dynamicTags]));

      let finalSizes = [{ label: "One Size", stock: Number(productData.stock || 0) }];
      if (isBlouse && productData.blouseSizes.length > 0) {
        finalSizes = productData.blouseSizes.map(size => ({
          label: size.label,
          stock: Number(size.stock || 0)
        }));
      }

      const formData = new FormData();
      Object.keys(productData).forEach(key => {
        if (key === 'isNewArrival' || key === 'isLimitedEdition' || key === 'blouseSizes') return;
        if (key === 'colors') {
          formData.append(key, JSON.stringify(productData[key].split(',').map(c => c.trim()).filter(Boolean)));
        } else if (key === 'tags') {
          formData.append('tags', JSON.stringify(mergedTags));
        } else if (key === 'sizes') {
          formData.append('sizes', JSON.stringify(finalSizes));
        } else if (key === 'colorVariants') {
          const normalizedVariants = productData.colorVariants
            .filter(v => v.colorName.trim())
            .map(v => ({
              colorName: v.colorName.trim(),
              colorHex: v.colorHex || '#cccccc',
              stock: Number(v.stock || 0),
              price: Number(v.price || 0),
              discountPrice: Number(v.discountPrice || 0),
            }));
          formData.append('colorVariants', JSON.stringify(normalizedVariants));
        } else if (Array.isArray(productData[key])) {
          formData.append(key, JSON.stringify(productData[key]));
        } else {
          formData.append(key, productData[key]);
        }
      });

      // Append images in current (reordered) order
      images.forEach(({ file }) => formData.append('images', file));
      variantImages.forEach((imgs, vi) => {
        imgs.forEach(img => formData.append(`variantImages_${vi}`, img));
      });

      await api.post('/products', formData);
      toast.success('Product created successfully');
      router.push('/admin/products');
    } catch (error) {
      console.error('Create product error:', error?.response?.data || error);
      toast.error(error?.response?.data?.message || error?.message || 'Failed to create product');
    } finally {
      setSaving(false);
    }
  };

  const isBlouse = productData.category === 'Blouses';

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-sm text-gray-500 mt-1">List a new masterpiece in your collection</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left Column ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* General Info */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4">General Information</h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Product Name</label>
                <input
                  type="text" name="name" value={productData.name} onChange={handleInputChange}
                  placeholder="e.g. Royal Banarasi Silk Saree"
                  className="w-full bg-gray-50 border border-gray-100 text-gray-900 rounded-2xl py-3.5 px-5 outline-none focus:border-primary-500 transition-all font-medium"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Description</label>
                  <button
                    type="button" onClick={generateAIDescription} disabled={isGeneratingAI}
                    className="flex items-center gap-1.5 text-[10px] font-bold text-primary-600 hover:text-primary-700 transition-colors uppercase tracking-widest disabled:opacity-50"
                  >
                    {isGeneratingAI ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    Generate with AI
                  </button>
                </div>
                <textarea
                  name="description" value={productData.description} onChange={handleInputChange}
                  rows={6} placeholder="Describe the fabric, weave, and detailing..."
                  className="w-full bg-gray-50 border border-gray-100 text-gray-900 rounded-2xl py-3.5 px-5 outline-none focus:border-primary-500 transition-all font-medium resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Category</label>
                  <select name="category" value={productData.category} onChange={handleInputChange}
                    className="w-full bg-gray-50 border border-gray-100 text-gray-900 rounded-2xl py-3.5 px-5 outline-none focus:border-primary-500 transition-all font-medium appearance-none">
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Fabric</label>
                  <input
                    type="text"
                    name="fabric"
                    value={productData.fabric}
                    onChange={handleInputChange}
                    placeholder="e.g. Kanjivaram, Organza..."
                    list="fabric-suggestions"
                    className="w-full bg-gray-50 border border-gray-100 text-gray-900 rounded-2xl py-3.5 px-5 outline-none focus:border-primary-500 transition-all font-medium"
                    autoComplete="off"
                  />
                  <datalist id="fabric-suggestions">
                    {SAREE_FABRICS.map(fab => <option key={fab} value={fab} />)}
                  </datalist>
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Colors (Comma separated)</label>
                  <input
                    type="text" name="colors" value={productData.colors} onChange={handleInputChange}
                    placeholder="e.g. Ruby Red, Antique Gold"
                    className="w-full bg-gray-50 border border-gray-100 text-gray-900 rounded-2xl py-3.5 px-5 outline-none focus:border-primary-500 transition-all font-medium"
                  />
                </div>
              </div>

              {/* ── Blouse Sizes (only when Blouses category) ── */}
              {isBlouse && (
                <div className="space-y-2.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
                    Available Sizes
                  </label>
                  <div className="flex gap-3">
                    {BLOUSE_SIZES.map(({ label, sub }) => {
                      const activeItem = productData.blouseSizes.find(s => s.label === label);
                      const active = !!activeItem;
                      return (
                        <div key={label} className="flex-1 flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() => toggleBlouseSize(label)}
                            className={`w-full py-3 rounded-2xl border-2 transition-all font-bold text-sm flex flex-col items-center gap-0.5
                              ${active
                                ? 'border-primary-500 bg-primary-50 text-primary-700'
                                : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200'
                              }`}
                          >
                            <span className="text-base font-black">{label}</span>
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${active ? 'text-primary-500' : 'text-gray-300'}`}>
                              {sub}
                            </span>
                          </button>
                          {active && (
                            <input
                              type="number"
                              min="0"
                              placeholder="Stock"
                              value={activeItem.stock === 0 ? '' : activeItem.stock}
                              onChange={(e) => handleBlouseSizeStockChange(label, e.target.value)}
                              className="w-full bg-white border border-primary-200 text-gray-900 rounded-xl py-2 px-3 outline-none focus:border-primary-500 text-center text-xs font-medium shadow-sm transition-all placeholder:text-gray-300"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {productData.blouseSizes.length === 0 && (
                    <p className="text-[10px] text-amber-500 font-medium ml-1">
                      ⚠ Select at least one size for blouses
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Media */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-gray-50 pb-4">
              <h3 className="text-lg font-bold text-gray-900">Media & Images</h3>
              {images.length > 1 && (
                <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                  <GripVertical size={12} /> Drag to reorder
                </span>
              )}
            </div>

            {/* Image grid - drag to reorder, always-visible remove button */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {images.map(({ url }, i) => (
                <div
                  key={url}
                  draggable
                  onDragStart={() => onDragStart(i)}
                  onDragEnter={() => onDragEnter(i)}
                  onDragEnd={onDragEnd}
                  onDragOver={e => e.preventDefault()}
                  className="relative group"
                  style={{ cursor: 'grab' }}
                >
                  <div
                    className="aspect-3/4 rounded-2xl overflow-hidden border border-primary-100 select-none"
                    style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover pointer-events-none" draggable={false} />
                    {/* First badge */}
                    {i === 0 && (
                      <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full backdrop-blur-sm">
                        Cover
                      </div>
                    )}
                    {/* Drag handle (visible on hover desktop, always on mobile) */}
                    <div className="absolute top-2 left-2 p-1 bg-black/40 rounded-lg text-white opacity-0 group-hover:opacity-100 sm:opacity-0 transition-opacity">
                      <GripVertical size={12} />
                    </div>
                  </div>

                  {/* Remove button - ALWAYS visible, not hover-only */}
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md z-10 hover:bg-red-600 active:scale-95 transition-all"
                    aria-label="Remove image"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              {/* Upload tile */}
              <label className="aspect-3/4 rounded-2xl border-2 border-dashed border-gray-100 hover:border-primary-400 hover:bg-primary-50 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group">
                <Upload className="text-gray-300 group-hover:text-primary-500 transition-colors" size={22} />
                <span className="text-[10px] font-bold text-gray-400 group-hover:text-primary-500 uppercase tracking-wider transition-colors">Add Photos</span>
                <input type="file" multiple className="hidden" onChange={handleImageChange} accept="image/*" />
              </label>
            </div>

            <p className="text-[10px] text-gray-400 font-medium italic">
              * First image is the cover. Drag to reorder. Portrait ratio (3:4) recommended.
            </p>
          </div>

          {/* Colour Variants */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-gray-50 pb-4">
              <h3 className="text-lg font-bold text-gray-900">Colour Variants</h3>
              <button type="button" onClick={addVariant} className="text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors">
                + Add Colour
              </button>
            </div>
            <div className="space-y-5">
              {productData.colorVariants.map((variant, vi) => (
                <div key={`variant-${vi}`} className="rounded-2xl border border-gray-100 p-4 space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <input
                      type="text"
                      value={variant.colorName}
                      onChange={(e) => handleVariantFieldChange(vi, 'colorName', e.target.value)}
                      placeholder="Color name (e.g. Crimson)"
                      className="col-span-2 sm:col-span-2 bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 font-medium text-gray-900 outline-none focus:border-primary-400"
                    />
                    <div className="flex items-center gap-2 sm:col-span-1">
                      <input
                        type="color"
                        value={variant.colorHex}
                        onChange={(e) => handleVariantFieldChange(vi, 'colorHex', e.target.value)}
                        className="h-11 w-full rounded-xl border border-gray-100 cursor-pointer"
                      />
                    </div>
                    <input
                      type="number"
                      value={variant.stock}
                      onChange={(e) => handleVariantFieldChange(vi, 'stock', e.target.value)}
                      placeholder="Stock"
                      className="bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 font-medium text-gray-900 outline-none focus:border-primary-400"
                    />
                    <button
                      type="button"
                      onClick={() => removeVariant(vi)}
                      className="rounded-xl border border-red-200 text-red-500 font-bold text-sm hover:bg-red-50 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="number"
                      value={variant.price}
                      onChange={(e) => handleVariantFieldChange(vi, 'price', e.target.value)}
                      placeholder="Variant price (optional)"
                      className="bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 font-medium text-gray-900 outline-none focus:border-primary-400"
                    />
                    <input
                      type="number"
                      value={variant.discountPrice}
                      onChange={(e) => handleVariantFieldChange(vi, 'discountPrice', e.target.value)}
                      placeholder="Variant discount price (optional)"
                      className="bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 font-medium text-gray-900 outline-none focus:border-primary-400"
                    />
                  </div>

                  {/* Variant images */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Variant Images</p>
                    <div className="grid grid-cols-4 gap-2.5">
                      {(variantPreviewUrls[vi] || []).map((url, ii) => (
                        <div key={url + ii} className="relative aspect-3/4 rounded-xl overflow-hidden border border-gray-100">
                          <img src={url} alt="" className="w-full h-full object-cover" />
                          {/* Always-visible remove */}
                          <button
                            type="button"
                            onClick={() => removeVariantImage(vi, ii)}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md z-10 hover:bg-red-600 transition-colors"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                      <label className="aspect-3/4 rounded-xl border-2 border-dashed border-gray-200 hover:border-primary-400 hover:bg-primary-50 flex items-center justify-center cursor-pointer transition-all">
                        <Upload size={16} className="text-gray-300" />
                        <input type="file" multiple className="hidden" accept="image/*" onChange={(e) => handleVariantImageChange(vi, e.target.files)} />
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right Column ── */}
        <div className="space-y-6">

          {/* Pricing & Stock */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4">Pricing & Stock</h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Base Price (₹)</label>
                <input type="number" name="price" value={productData.price} onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-100 text-gray-900 rounded-2xl py-3.5 px-5 outline-none focus:border-primary-500 transition-all font-bold text-lg"
                  required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Discount Price (₹)</label>
                <input type="number" name="discountPrice" value={productData.discountPrice} onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-100 text-emerald-600 rounded-2xl py-3.5 px-5 outline-none focus:border-primary-500 transition-all font-bold" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Available Stock</label>
                <input type="number" name="stock" value={productData.stock} onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-100 text-gray-900 rounded-2xl py-3.5 px-5 outline-none focus:border-primary-500 transition-all font-medium"
                  required />
              </div>
            </div>
          </div>

          {/* Visibility */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4">Visibility</h3>
            {[
              ['isFeatured', 'Featured Product'],
              ['isBestseller', 'Bestseller'],
              ['isTrending', 'Trending'],
              ['isNewArrival', 'New Arrival'],
              ['isLimitedEdition', 'Limited Edition'],
            ].map(([name, label]) => (
              <div key={name} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <Info className="text-primary-500" size={16} />
                  <span className="text-sm font-bold text-gray-700">{label}</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox" name={name}
                    checked={productData[name]}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-primary-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                </label>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button" onClick={() => router.push('/admin/products')}
              className="flex-1 px-6 py-4 rounded-2xl font-bold bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={saving}
              className="flex-2 bg-black text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-gray-900 transition-all flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
              Publish Product
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}