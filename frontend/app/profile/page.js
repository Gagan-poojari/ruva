"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, ShoppingBag, UserRound, X, Star, AlertCircle, CheckCircle2, Clock, Package, Truck, Ban, Camera, Video, UploadCloud, CheckCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import api from "@/utils/api";
import toast from "react-hot-toast";

const panelIn = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  viewport: { once: true, amount: 0.25 },
};

export default function ProfilePage() {
  const { user, logout, loading } = useAuth();
  const { cartItems } = useCart();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Cancel Modal State
  const [cancelModal, setCancelModal] = useState({ isOpen: false, orderId: null, reason: "" });
  const [isCancelling, setIsCancelling] = useState(false);

  // Rate Modal State
  const [rateModal, setRateModal] = useState({ isOpen: false, productId: null, productName: "", rating: 5, comment: "" });
  const [isRating, setIsRating] = useState(false);

  // Media Upload State
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [uploadDescription, setUploadDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fetchOrders = async () => {
    if (!user?.token) return;
    setOrdersLoading(true);
    try {
      const { data } = await api.get("/orders/my");
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user?.token]);

  const handleCancelOrder = async () => {
    if (!cancelModal.reason.trim()) {
      return toast.error("Please provide a reason for cancellation");
    }
    setIsCancelling(true);
    try {
      await api.post(`/orders/${cancelModal.orderId}/cancel`, { reason: cancelModal.reason });
      toast.success("Order cancelled successfully");
      setCancelModal({ isOpen: false, orderId: null, reason: "" });
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel order");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleRateProduct = async () => {
    setIsRating(true);
    try {
      await api.post(`/products/${rateModal.productId}/reviews`, {
        rating: rateModal.rating,
        comment: rateModal.comment,
      });
      toast.success("Thank you for your rating!");
      setRateModal({ isOpen: false, productId: null, productName: "", rating: 5, comment: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit rating");
    } finally {
      setIsRating(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 200 * 1024 * 1024) {
      return toast.error("File is too large. Maximum size is 200MB.");
    }

    setUploadFile(file);
    const url = URL.createObjectURL(file);
    setUploadPreview({ url, type: file.type.startsWith("video/") ? "video" : "image" });
  };

  const handleUploadMedia = async () => {
    if (!uploadFile) return toast.error("Please select a file to upload.");

    const formData = new FormData();
    formData.append("media", uploadFile);
    formData.append("description", uploadDescription);

    setIsUploading(true);
    setUploadProgress(10); // Start progress

    try {
      await api.post("/submissions", formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          // Let it reach 90% and wait for server processing
          setUploadProgress(percentCompleted > 90 ? 90 : percentCompleted);
        },
      });
      
      setUploadProgress(100);
      toast.success("Media uploaded successfully! Awaiting admin approval.");
      setUploadFile(null);
      setUploadPreview(null);
      setUploadDescription("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to upload media");
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock size={16} className="text-orange-500" />;
      case 'confirmed': return <CheckCircle2 size={16} className="text-purple-500" />;
      case 'packed': return <Package size={16} className="text-blue-500" />;
      case 'shipped': return <Truck size={16} className="text-blue-500" />;
      case 'delivered': return <CheckCircle2 size={16} className="text-emerald-500" />;
      case 'cancelled': return <Ban size={16} className="text-red-500" />;
      default: return null;
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending': return 'bg-orange-50 text-orange-600 border-orange-200';
      case 'confirmed': return 'bg-purple-50 text-purple-600 border-purple-200';
      case 'packed': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'shipped': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'cancelled': return 'bg-red-50 text-red-600 border-red-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden py-14 px-4 sm:px-6">
      <div className="absolute inset-0 bg-[linear-gradient(160deg,#f8f0ff_0%,#f5ecff_35%,#fff7eb_100%)]" />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "repeating-linear-gradient(-45deg, rgba(162,108,38,0.12) 0, rgba(162,108,38,0.12) 1px, transparent 1px, transparent 20px), repeating-linear-gradient(45deg, rgba(162,108,38,0.1) 0, rgba(162,108,38,0.1) 1px, transparent 1px, transparent 20px)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-5xl">
        <motion.div {...panelIn} className="mb-10 text-center">
          <p
            className="uppercase tracking-[0.28em] text-[0.66rem] text-[#7a4f1f]/80 mb-3"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Account Atelier
          </p>
          <h1
            className="text-4xl sm:text-5xl text-[#2f0f45] font-bold"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Your Ruva Profile
          </h1>
        </motion.div>

        <motion.div
          {...panelIn}
          transition={{ ...panelIn.transition, delay: 0.08 }}
          className="rounded-3xl border border-[#d9b06d]/35 bg-white/70 backdrop-blur-md p-7 sm:p-10 shadow-[0_20px_60px_rgba(54,19,73,0.12)]"
        >
          {loading ? (
            <p className="text-[#5d3a22]/70">Loading your profile...</p>
          ) : user ? (
            <>
              <div className="flex items-center gap-4 mb-8">
                <div className="h-14 w-14 rounded-full bg-[linear-gradient(145deg,#5d247e,#8d4fb7)] text-[#fff1da] flex items-center justify-center">
                  <UserRound size={24} />
                </div>
                <div>
                  <p className="text-[#2a0c3f] text-xl font-semibold">{user.name || "Ruva Member"}</p>
                  <p className="text-[#6b4a2f]/75 text-sm">{user.email}</p>
                </div>
              </div>

              <div className="flex gap-4 mb-8">
                <div className="rounded-2xl border border-[#d9b06d]/35 bg-white/70 p-5 flex-1 max-w-[200px]">
                  <p className="text-xs uppercase tracking-[0.16em] text-[#6b4a2f]/70 mb-1">Saved Cart</p>
                  <p className="text-[#2f0f45] font-semibold">{cartItems.length} items</p>
                </div>
              </div>

              {/* Win a Free Saree Promotion */}
              {orders.length >= 0 && (
                <div className="mb-12 relative overflow-hidden rounded-3xl border border-[#d9b06d]/40 bg-gradient-to-br from-[#fffdfa] to-[#fcf5eb] p-6 sm:p-8 shadow-sm">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#f2d08a]/20 to-transparent rounded-full blur-3xl" />
                  <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-1 space-y-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wider">
                        <Star size={14} className="fill-current" /> Special Promotion
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-bold text-[#2f0f45]" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                        Win a Free Saree! 🎁
                      </h3>
                      <p className="text-[#6b4a2f]/80 text-sm leading-relaxed">
                        Upload a video of you unboxing or wearing your Ruva saree. The best submissions will be featured on our page and win a free premium saree! (Max length: 15s, Max size: 200MB)
                      </p>
                    </div>

                    <div className="w-full md:w-auto flex-shrink-0">
                      {!uploadFile ? (
                        <label className="flex flex-col items-center justify-center w-full md:w-64 h-40 border-2 border-dashed border-[#d9b06d]/50 rounded-2xl cursor-pointer hover:bg-white/50 transition-colors bg-white/30">
                          <UploadCloud size={32} className="text-[#d9b06d] mb-2" />
                          <span className="text-sm font-semibold text-[#6b4a2f]">Click to upload</span>
                          <span className="text-xs text-[#6b4a2f]/60 mt-1">Video (15s max) or Image</span>
                          <input type="file" accept="video/*,image/*" className="hidden" onChange={handleFileChange} />
                        </label>
                      ) : (
                        <div className="w-full md:w-64 space-y-3 bg-white/60 p-3 rounded-2xl border border-[#d9b06d]/30 relative">
                          <button 
                            onClick={() => { setUploadFile(null); setUploadPreview(null); }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 z-10 shadow-sm"
                          >
                            <X size={14} />
                          </button>
                          
                          <div className="w-full h-32 bg-black/5 rounded-xl overflow-hidden flex items-center justify-center">
                            {uploadPreview?.type === "video" ? (
                              <video src={uploadPreview.url} className="w-full h-full object-cover" muted />
                            ) : (
                              <img src={uploadPreview.url} alt="Preview" className="w-full h-full object-cover" />
                            )}
                          </div>
                          
                          <input
                            type="text"
                            placeholder="Add a short description..."
                            value={uploadDescription}
                            onChange={(e) => setUploadDescription(e.target.value)}
                            className="w-full text-xs px-3 py-2 rounded-lg border border-[#d9b06d]/30 focus:outline-none focus:ring-1 focus:ring-[#c58a2a] bg-white/50"
                          />
                          
                          <button
                            onClick={handleUploadMedia}
                            disabled={isUploading}
                            className="w-full py-2 bg-[linear-gradient(135deg,#4d1f73,#7c3ea0)] text-[#fff0d7] text-sm font-bold rounded-xl hover:brightness-110 disabled:opacity-50 transition-all flex justify-center items-center gap-2"
                          >
                            {isUploading ? (
                              <div className="w-full px-2">
                                <div className="flex justify-between text-[10px] mb-1">
                                  <span>Uploading...</span>
                                  <span>{uploadProgress}%</span>
                                </div>
                                <div className="w-full bg-white/20 rounded-full h-1.5">
                                  <div className="bg-white h-1.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                                </div>
                              </div>
                            ) : (
                              <>Submit Entry <CheckCircle size={16} /></>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-bold text-[#2f0f45] mb-4" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>My Orders</h3>
                
                {ordersLoading ? (
                  <p className="text-[#5d3a22]/70 text-sm">Loading orders...</p>
                ) : orders.length === 0 ? (
                  <div className="rounded-2xl border border-[#d9b06d]/35 bg-white/70 p-8 text-center">
                    <p className="text-[#6b4a2f]/70">You haven't placed any orders yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const isCancellable = ['pending', 'confirmed', 'packed'].includes(order.status);
                      const isDelivered = order.status === 'delivered';

                      return (
                        <div key={order._id} className="rounded-2xl border border-[#d9b06d]/35 bg-white/70 p-5 flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="text-sm font-bold text-[#2f0f45]">#{order._id.slice(-8)}</span>
                              <span className="text-[10px] font-medium text-gray-500 uppercase tracking-tight">
                                {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </span>
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(order.status)}`}>
                                {getStatusIcon(order.status)}
                                {order.status}
                              </span>
                            </div>
                            
                            <div className="flex flex-wrap gap-4">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3 bg-white p-2 rounded-xl border border-gray-100 min-w-[200px]">
                                  <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {item.product?.images?.[0] ? (
                                      <img src={item.product.images[0].url || item.product.images[0]} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      <ShoppingBag size={16} className="text-gray-300" />
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-xs font-bold text-gray-900 line-clamp-1">{item.product?.name || 'Deleted Product'}</p>
                                    <p className="text-[10px] text-gray-500 font-medium">Qty: {item.qty} {item.size ? `| Size: ${item.size}` : ''}</p>
                                  </div>
                                  {isDelivered && item.product?._id && (
                                    <button
                                      onClick={() => setRateModal({ isOpen: true, productId: item.product._id, productName: item.product.name, rating: 5, comment: "" })}
                                      className="p-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors"
                                      title="Rate Product"
                                    >
                                      <Star size={14} className="fill-current" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-3 min-w-[120px]">
                            <p className="text-sm font-bold text-[#2f0f45]">₹{order.totalAmount.toLocaleString()}</p>
                            
                            {isCancellable && (
                              <button
                                onClick={() => setCancelModal({ isOpen: true, orderId: order._id, reason: "" })}
                                className="text-xs font-bold text-red-500 hover:text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                              >
                                Cancel Order
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/cart"
                  className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[#fff0d7] border border-[#f2d08a]/60 bg-[linear-gradient(135deg,#4d1f73,#7c3ea0)] hover:brightness-110 transition"
                >
                  <ShoppingBag size={16} /> Go to Cart
                </Link>
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[#5b2b12] border border-[#c6913b]/40 bg-white/80 hover:bg-white transition"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </>
          ) : (
            <div>
              <p className="text-[#5d3a22]/80 mb-6">
                Sign in to view your profile, saved orders, and curated recommendations.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center rounded-full px-7 py-3 text-[#fff0d7] border border-[#f2d08a]/60 bg-[linear-gradient(135deg,#4d1f73,#7c3ea0)] hover:brightness-110 transition"
              >
                Continue to Login
              </Link>
            </div>
          )}
        </motion.div>
      </div>

      {/* Cancel Modal */}
      <AnimatePresence>
        {cancelModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <AlertCircle className="text-red-500" /> Cancel Order
                </h3>
                <button onClick={() => setCancelModal({ isOpen: false, orderId: null, reason: "" })} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-4">Are you sure you want to cancel this order? Please provide a reason.</p>
              <textarea
                value={cancelModal.reason}
                onChange={(e) => setCancelModal(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Reason for cancellation..."
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 mb-6 min-h-[100px] resize-none"
              ></textarea>
              <div className="flex justify-end gap-3">
                <button onClick={() => setCancelModal({ isOpen: false, orderId: null, reason: "" })} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700">
                  Keep Order
                </button>
                <button onClick={handleCancelOrder} disabled={isCancelling} className="px-6 py-2 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 disabled:opacity-50 transition-colors">
                  {isCancelling ? "Cancelling..." : "Confirm Cancel"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Rate Modal */}
      <AnimatePresence>
        {rateModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Star className="text-amber-500 fill-amber-500" /> Rate Product
                </h3>
                <button onClick={() => setRateModal({ isOpen: false, productId: null, productName: "", rating: 5, comment: "" })} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>
              <p className="text-sm font-bold text-gray-900 mb-4">{rateModal.productName}</p>
              
              <div className="flex gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRateModal(prev => ({ ...prev, rating: star }))}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star size={28} className={star <= rateModal.rating ? "text-amber-500 fill-amber-500" : "text-gray-300"} />
                  </button>
                ))}
              </div>

              <textarea
                value={rateModal.comment}
                onChange={(e) => setRateModal(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Write a review (optional)..."
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 mb-6 min-h-[80px] resize-none"
              ></textarea>
              <div className="flex justify-end gap-3">
                <button onClick={() => setRateModal({ isOpen: false, productId: null, productName: "", rating: 5, comment: "" })} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700">
                  Cancel
                </button>
                <button onClick={handleRateProduct} disabled={isRating} className="px-6 py-2 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 disabled:opacity-50 transition-colors">
                  {isRating ? "Submitting..." : "Submit Rating"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
