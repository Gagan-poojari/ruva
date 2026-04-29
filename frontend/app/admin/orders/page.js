'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  ExternalLink, 
  CheckCircle2, 
  Truck, 
  PackageCheck, 
  Ban, 
  Clock,
  ChevronDown,
  Eye,
  ShoppingBag,
  Undo2,
  X,
  Copy,
  MapPin,
  Phone
} from 'lucide-react';
import api from '@/utils/api';
import toast from 'react-hot-toast';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/orders');
      setOrders(data);
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders(); // Refresh list
    } catch (error) {
      toast.error('Failed to update status');
    }
  };
  
  const getRollbackStatus = (currentStatus) => {
    switch (currentStatus) {
      case 'delivered': return 'shipped';
      case 'shipped': return 'confirmed';
      case 'confirmed': return 'pending';
      case 'cancelled': return 'pending';
      default: return null;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'all' || order.status === filter;
    const matchesSearch = 
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case 'delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'shipped': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'confirmed': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'cancelled': return 'bg-red-50 text-red-600 border-red-100';
      case 'pending': return 'bg-orange-50 text-orange-600 border-orange-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track customer orders</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search Order ID or Customer..."
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 text-gray-900 rounded-xl outline-none focus:border-primary-500 transition-all text-sm w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select 
            className="bg-white border border-gray-200 text-sm font-medium rounded-xl px-4 py-2 text-primary-500 outline-none focus:border-primary-500 transition-all"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Order Info</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-900 group-hover:text-primary-600 transition-colors">#{order._id.slice(-8)}</span>
                      <span className="text-[10px] font-medium text-gray-400 mt-1 uppercase tracking-tight">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-bold text-gray-900">{order.user?.name || 'Guest User'}</span>
                      <p className="text-[10px] text-gray-500 leading-tight max-w-[200px]">
                        {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                      </p>
                      {order.shippingAddress?.whatsappNumber && (
                        <span className="text-[10px] text-primary-600 font-medium">WA: {order.shippingAddress.whatsappNumber}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-gray-900">₹{order.totalAmount.toLocaleString()}</span>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold">{order.paymentMethod}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       {/* Quick Status Update Buttons */}
                       {order.status === 'pending' && (
                         <button 
                           onClick={() => handleStatusUpdate(order._id, 'confirmed')}
                           className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors border border-transparent hover:border-purple-200"
                           title="Confirm Order"
                         >
                           <CheckCircle2 size={18} />
                         </button>
                       )}
                       {order.status === 'confirmed' && (
                         <button 
                           onClick={() => handleStatusUpdate(order._id, 'shipped')}
                           className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200"
                           title="Ship Order"
                         >
                           <Truck size={18} />
                         </button>
                       )}
                       {order.status === 'shipped' && (
                         <button 
                           onClick={() => handleStatusUpdate(order._id, 'delivered')}
                           className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-200"
                           title="Mark Delivered"
                         >
                           <PackageCheck size={18} />
                         </button>
                       )}
                       {order.status !== 'delivered' && order.status !== 'cancelled' && (
                         <button 
                           onClick={() => handleStatusUpdate(order._id, 'cancelled')}
                           className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                           title="Cancel Order"
                         >
                           <Ban size={18} />
                         </button>
                       )}

                       {getRollbackStatus(order.status) && (
                         <button 
                           onClick={() => handleStatusUpdate(order._id, getRollbackStatus(order.status))}
                           className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                           title={`Rollback to ${getRollbackStatus(order.status)}`}
                         >
                           <Undo2 size={18} />
                         </button>
                       )}

                       <button 
                         onClick={() => {
                           setSelectedOrder(order);
                           setIsModalOpen(true);
                         }}
                         className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all ml-auto border border-transparent hover:border-primary-100"
                       >
                         <Eye size={18} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredOrders.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="text-gray-300" size={32} />
            </div>
            <h3 className="text-gray-900 font-bold">No orders found</h3>
            <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or search terms</p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  Order Details
                  <span className={`text-xs px-2 py-1 rounded-full border ${getStatusStyle(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </h2>
                <p className="text-xs text-gray-500 mt-1">#{selectedOrder._id}</p>
                {selectedOrder.status === 'cancelled' && selectedOrder.refundReason && (
                  <p className="text-sm text-red-600 mt-2 bg-red-50 p-2 rounded-lg border border-red-100 inline-block">
                    <span className="font-bold">Cancel Reason:</span> {selectedOrder.refundReason}
                  </p>
                )}
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-white rounded-xl transition-colors text-gray-400 hover:text-gray-600 border border-transparent hover:border-gray-200 self-start"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Customer & Shipping Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <Phone size={16} className="text-primary-500" />
                    Customer Info
                  </h3>
                  <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                    <p className="text-sm font-bold text-gray-900">{selectedOrder.user?.name || 'Guest User'}</p>
                    <p className="text-xs text-gray-500">{selectedOrder.user?.email}</p>
                    <p className="text-xs text-gray-900 font-medium">Primary: {selectedOrder.user?.phone}</p>
                    {selectedOrder.shippingAddress?.whatsappNumber && (
                      <p className="text-xs text-emerald-600 font-bold">WhatsApp: {selectedOrder.shippingAddress.whatsappNumber}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <MapPin size={16} className="text-primary-500" />
                    Delivery Address
                  </h3>
                  <div className="bg-gray-50 rounded-2xl p-4 relative group">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {selectedOrder.shippingAddress?.street}<br />
                      {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}<br />
                      <span className="font-bold">{selectedOrder.shippingAddress?.pincode}</span>
                    </p>
                    <button 
                      onClick={() => {
                        const addr = `${selectedOrder.shippingAddress?.street}, ${selectedOrder.shippingAddress?.city}, ${selectedOrder.shippingAddress?.state} - ${selectedOrder.shippingAddress?.pincode}`;
                        navigator.clipboard.writeText(addr);
                        toast.success('Address copied to clipboard');
                      }}
                      className="absolute top-4 right-4 p-2 bg-white rounded-lg shadow-sm border border-gray-100 opacity-0 group-hover:opacity-100 transition-all hover:bg-gray-50 text-gray-400 hover:text-primary-600"
                      title="Copy Address"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Items Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <ShoppingBag size={16} className="text-primary-500" />
                  Order Items
                </h3>
                <div className="border border-gray-100 rounded-2xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50/50">
                      <tr>
                        <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase">Product</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase text-center">Qty</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedOrder.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                {item.product?.images?.[0] ? (
                                  <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <ShoppingBag size={16} className="text-gray-300" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-gray-900 line-clamp-1">{item.product?.name || 'Deleted Product'}</p>
                                {item.size && <p className="text-[10px] text-gray-500 font-medium">Size: {item.size}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-xs font-medium text-gray-600">x{item.qty}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-xs font-bold text-gray-900">₹{(item.price * item.qty).toLocaleString()}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-primary-50/50 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold text-primary-600 uppercase tracking-wider mb-1">Payment Method</p>
                  <p className="text-sm font-bold text-gray-900 uppercase">{selectedOrder.paymentMethod}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Status: <span className="font-bold text-emerald-600 uppercase">{selectedOrder.paymentStatus}</span></p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Total Amount</p>
                  <p className="text-2xl font-black text-primary-600">₹{selectedOrder.totalAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
              >
                Close
              </button>
              {selectedOrder.status === 'pending' && (
                <button 
                  onClick={() => {
                    handleStatusUpdate(selectedOrder._id, 'confirmed');
                    setIsModalOpen(false);
                  }}
                  className="px-6 py-2 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 transition-all shadow-sm"
                >
                  Confirm Order
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
