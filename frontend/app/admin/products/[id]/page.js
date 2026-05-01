'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  X, 
  Loader2, 
  Plus,
  Trash2,
  Info,
  Sparkles
} from 'lucide-react';
import api from '@/utils/api';
import toast from 'react-hot-toast';

const SAREE_FABRICS = [
  "Banarasi", "Kanjivaram", "Mysore Silk", "Patola", "Chanderi", 
  "Maheshwari", "Tant", "Khadi", "Organza", "Georgette", "Net", 
  "Ruffle", "Bandhani", "Paithani", "Leheriya", "Kasavu", 
  "Sambalpuri", "Baluchari","silk-cotton", "cotton",
];

const CATEGORIES = ["Sarees", "Blouse", "Dupatta"];

const createEmptyVariant = () => ({
  colorName: '',
  colorHex: '#cccccc',
  stock: '0',
  price: '',
  discountPrice: '',
  images: [],
});

export default function EditProduct({ params }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [productData, setProductData] = useState({
    name: '',
    slug: '',
    description: '',
    category: '',
    fabric: '',
    occasion: '',
    price: '',
    discountPrice: '',
    stock: '',
    isFeatured: false,
    isBestseller: false,
    isTrending: false,
    tags: [],
    sizes: [{ label: "One Size", stock: 10 }],
    colors: "",
    colorVariants: [createEmptyVariant()],
  });
  const [images, setImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [variantImages, setVariantImages] = useState([[]]);
  const [variantPreviewUrls, setVariantPreviewUrls] = useState([[]]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const generateAIDescription = async () => {
    if (!productData.name) {
      toast.error('Please enter a product name first');
      return;
    }

    setIsGeneratingAI(true);
    const toastId = toast.loading('Gemini is weaving a description...');
    
    try {
      const { data } = await api.post('/ai/describe', {
        name: productData.name,
        category: productData.category,
        fabric: productData.fabric,
        occasion: productData.occasion,
        colors: productData.colors ? productData.colors.split(',').map(c => c.trim()) : []
      });
      
      setProductData(prev => ({ ...prev, description: data.description }));
      toast.success('Description regenerated!', { id: toastId });
    } catch (error) {
      const message = error.response?.status === 429 
        ? 'AI limit reached. Please write your own description.' 
        : 'Failed to generate description. Please try again.';
      toast.error(message, { id: toastId });
      console.log(error)
    } finally {
      setIsGeneratingAI(false);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        setProductData({
          name: data.name,
          slug: data.slug,
          description: data.description,
          category: data.category,
          fabric: data.fabric,
          occasion: data.occasion,
          price: data.price,
          discountPrice: data.discountPrice,
          stock: data.stock,
          isFeatured: data.isFeatured,
          isBestseller: data.isBestseller,
          isTrending: data.isTrending,
          tags: data.tags || [],
          sizes: data.sizes || [],
          colors: data.colors ? data.colors.join(', ') : '',
          colorVariants: (data.colorVariants?.length ? data.colorVariants : [createEmptyVariant()]).map((variant) => ({
            colorName: variant.colorName || '',
            colorHex: variant.colorHex || '#cccccc',
            stock: String(variant.stock || 0),
            price: String(variant.price || ''),
            discountPrice: String(variant.discountPrice || ''),
            images: variant.images || [],
          })),
        });
        setImages(data.images || []);
        const variantExistingImages = (data.colorVariants?.length ? data.colorVariants : [createEmptyVariant()]).map((variant) => variant.images || []);
        setVariantImages(variantExistingImages.map(() => []));
        setVariantPreviewUrls(variantExistingImages.map((variantImgs) => variantImgs.map((img) => img.url)));
      } catch (error) {
        toast.error('Failed to load product');
        router.push('/admin/products');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, router]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImages(prev => [...prev, ...files]);
    
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...urls]);
  };

  const removeNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const addVariant = () => {
    setProductData(prev => ({
      ...prev,
      colorVariants: [...prev.colorVariants, createEmptyVariant()],
    }));
    setVariantImages(prev => [...prev, []]);
    setVariantPreviewUrls(prev => [...prev, []]);
  };

  const removeVariant = (index) => {
    setProductData(prev => ({
      ...prev,
      colorVariants: prev.colorVariants.filter((_, i) => i !== index),
    }));
    setVariantImages(prev => prev.filter((_, i) => i !== index));
    setVariantPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleVariantFieldChange = (index, field, value) => {
    setProductData(prev => ({
      ...prev,
      colorVariants: prev.colorVariants.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant
      ),
    }));
  };

  const handleVariantImageChange = (index, files) => {
    const parsedFiles = Array.from(files || []);
    setVariantImages(prev => prev.map((images, i) => (i === index ? [...images, ...parsedFiles] : images)));
    const urls = parsedFiles.map((file) => URL.createObjectURL(file));
    setVariantPreviewUrls(prev => prev.map((images, i) => (i === index ? [...images, ...urls] : images)));
  };

  const removeVariantImage = (variantIndex, imageIndex) => {
    setProductData(prev => ({
      ...prev,
      colorVariants: prev.colorVariants.map((variant, i) => {
        if (i !== variantIndex) return variant;
        return {
          ...variant,
          images: (variant.images || []).filter((_, existingIndex) => existingIndex !== imageIndex),
        };
      }),
    }));
    setVariantPreviewUrls(prev =>
      prev.map((images, i) => (i === variantIndex ? images.filter((_, j) => j !== imageIndex) : images))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const formData = new FormData();
      Object.keys(productData).forEach(key => {
        if (key === 'colors') {
          formData.append(key, JSON.stringify(productData[key].split(',').map(c => c.trim())));
        } else if (key === 'colorVariants') {
          const normalizedVariants = productData.colorVariants
            .filter((variant) => variant.colorName.trim())
            .map((variant) => ({
              colorName: variant.colorName.trim(),
              colorHex: variant.colorHex || '#cccccc',
              stock: Number(variant.stock || 0),
              price: Number(variant.price || 0),
              discountPrice: Number(variant.discountPrice || 0),
              images: variant.images || [],
            }));
          formData.append('colorVariants', JSON.stringify(normalizedVariants));
        } else if (Array.isArray(productData[key])) {
          formData.append(key, JSON.stringify(productData[key]));
        } else {
          formData.append(key, productData[key]);
        }
      });

      newImages.forEach(image => {
        formData.append('images', image);
      });
      variantImages.forEach((images, variantIndex) => {
        images.forEach((image) => {
          formData.append(`variantImages_${variantIndex}`, image);
        });
      });

      await api.put(`/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('Product updated successfully');
      router.push('/admin/products');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary-600" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
            <p className="text-sm text-gray-500 mt-1">Update details and inventory for <span className="font-semibold">{productData.name}</span></p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4">General Information</h3>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Product Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={productData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Royal Banarasi Silk Saree"
                  className="w-full bg-gray-50 border border-gray-100 text-gray-900 rounded-2xl py-3.5 px-5 outline-none focus:border-primary-500 transition-all font-medium"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Description</label>
                  <button
                    type="button"
                    onClick={generateAIDescription}
                    disabled={isGeneratingAI}
                    className="flex items-center gap-1.5 text-[10px] font-bold text-primary-600 hover:text-primary-700 transition-colors uppercase tracking-widest disabled:opacity-50"
                  >
                    {isGeneratingAI ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Sparkles size={12} />
                    )}
                    Regenerate with AI
                  </button>
                </div>
                <textarea 
                  name="description"
                  value={productData.description}
                  onChange={handleInputChange}
                  rows={6}
                  placeholder="Tell shoppers more about this elegant drape..."
                  className="w-full bg-gray-50 border border-gray-100 text-gray-900 rounded-2xl py-3.5 px-5 outline-none focus:border-primary-500 transition-all font-medium resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Category</label>
                  <select 
                    name="category"
                    value={productData.category}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 border border-gray-100 text-gray-900 rounded-2xl py-3.5 px-5 outline-none focus:border-primary-500 transition-all font-medium appearance-none"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Fabric</label>
                  <select 
                    name="fabric"
                    value={productData.fabric}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 border border-gray-100 text-gray-900 rounded-2xl py-3.5 px-5 outline-none focus:border-primary-500 transition-all font-medium appearance-none"
                  >
                    <option value="">Select Fabric</option>
                    {SAREE_FABRICS.map(fab => (
                      <option key={fab} value={fab}>{fab}</option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Colors (Comma separated)</label>
                  <input 
                    type="text" 
                    name="colors"
                    value={productData.colors}
                    onChange={handleInputChange}
                    placeholder="e.g. Ruby Red, Antique Gold"
                    className="w-full bg-gray-50 border border-gray-100 text-gray-900 rounded-2xl py-3.5 px-5 outline-none focus:border-primary-500 transition-all font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4">Media & Images</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Existing Images */}
              {images.map((img, i) => (
                <div key={i} className="aspect-[3/4] rounded-2xl overflow-hidden relative border border-gray-100 group">
                  <img src={img.url || null} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold uppercase">Current</span>
                  </div>
                </div>
              ))}
              
              {/* Preview of New Images */}
              {previewUrls.map((url, i) => (
                <div key={i} className="aspect-[3/4] rounded-2xl overflow-hidden relative border border-primary-100 group">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => removeNewImage(i)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              
              {/* Upload Placeholder */}
              <label className="aspect-[3/4] rounded-2xl border-2 border-dashed border-gray-100 hover:border-primary-500 hover:bg-primary-50 transition-all cursor-pointer flex flex-col items-center justify-center gap-2">
                <Upload className="text-gray-300 group-hover:text-primary-500" size={24} />
                <span className="text-[10px] font-bold text-gray-400 uppercase">Add More</span>
                <input type="file" multiple className="hidden" onChange={handleImageChange} accept="image/*" />
              </label>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-gray-50 pb-4">
              <h3 className="text-lg font-bold text-gray-900">Colour Variants</h3>
              <button type="button" onClick={addVariant} className="text-sm font-bold text-primary-600">
                + Add Colour
              </button>
            </div>
            <div className="space-y-5">
              {productData.colorVariants.map((variant, variantIndex) => (
                <div key={`variant-${variantIndex}`} className="rounded-2xl border border-gray-100 p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <input
                      type="text"
                      value={variant.colorName}
                      onChange={(e) => handleVariantFieldChange(variantIndex, 'colorName', e.target.value)}
                      placeholder="Color name (e.g. Crimson)"
                      className="md:col-span-2 bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4"
                    />
                    <input
                      type="color"
                      value={variant.colorHex}
                      onChange={(e) => handleVariantFieldChange(variantIndex, 'colorHex', e.target.value)}
                      className="h-11 w-full rounded-xl border border-gray-100"
                    />
                    <input
                      type="number"
                      value={variant.stock}
                      onChange={(e) => handleVariantFieldChange(variantIndex, 'stock', e.target.value)}
                      placeholder="Stock"
                      className="bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4"
                    />
                    <button
                      type="button"
                      onClick={() => removeVariant(variantIndex)}
                      className="rounded-xl border border-red-200 text-red-600 font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="number"
                      value={variant.price}
                      onChange={(e) => handleVariantFieldChange(variantIndex, 'price', e.target.value)}
                      placeholder="Variant price (optional)"
                      className="bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4"
                    />
                    <input
                      type="number"
                      value={variant.discountPrice}
                      onChange={(e) => handleVariantFieldChange(variantIndex, 'discountPrice', e.target.value)}
                      placeholder="Variant discount price (optional)"
                      className="bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4"
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-500 uppercase">Variant Images</p>
                    <div className="grid grid-cols-4 gap-3">
                      {(variantPreviewUrls[variantIndex] || []).map((url, imageIndex) => (
                        <div key={url + imageIndex} className="relative aspect-[3/4] rounded-xl overflow-hidden border">
                          <img src={url || null} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeVariantImage(variantIndex, imageIndex)}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                      <label className="aspect-[3/4] rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer">
                        <Upload size={18} className="text-gray-400" />
                        <input
                          type="file"
                          multiple
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => handleVariantImageChange(variantIndex, e.target.files)}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Sidebar settings */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4">Pricing & Stock</h3>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Base Price (₹)</label>
                <input 
                  type="number" 
                  name="price"
                  value={productData.price}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-100 text-gray-900 rounded-2xl py-3.5 px-5 outline-none focus:border-primary-500 transition-all font-bold text-lg"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Discount Price (₹)</label>
                <input 
                  type="number" 
                  name="discountPrice"
                  value={productData.discountPrice}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-100 text-emerald-600 rounded-2xl py-3.5 px-5 outline-none focus:border-primary-500 transition-all font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Available Stock</label>
                <input 
                  type="number" 
                  name="stock"
                  value={productData.stock}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-100 text-gray-900 rounded-2xl py-3.5 px-5 outline-none focus:border-primary-500 transition-all font-medium"
                  required
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4">Visibility</h3>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-3">
                <Info className="text-primary-500" size={18} />
                <span className="text-sm font-bold text-gray-700">Featured Product</span>
              </div>
              <input 
                type="checkbox" 
                name="isFeatured"
                checked={productData.isFeatured}
                onChange={handleInputChange}
                className="w-5 h-5 accent-primary-600"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-3">
                <Info className="text-primary-500" size={18} />
                <span className="text-sm font-bold text-gray-700">Bestseller</span>
              </div>
              <input 
                type="checkbox" 
                name="isBestseller"
                checked={productData.isBestseller}
                onChange={handleInputChange}
                className="w-5 h-5 accent-primary-600"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-3">
                <Info className="text-primary-500" size={18} />
                <span className="text-sm font-bold text-gray-700">Trending</span>
              </div>
              <input 
                type="checkbox" 
                name="isTrending"
                checked={productData.isTrending}
                onChange={handleInputChange}
                className="w-5 h-5 accent-primary-600"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              type="button" 
              onClick={() => router.push('/admin/products')}
              className="flex-1 px-6 py-4 rounded-2xl font-bold bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={saving}
              className="flex-[2] bg-black text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary-600/20 hover:bg-primary-700 transition-all flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              Save Changes
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
