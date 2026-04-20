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
  Undo2
} from 'lucide-react';
import api from '@/utils/api';
import toast from 'react-hot-toast';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

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
    fetchOrders();
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
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">{order.user?.name || 'Guest User'}</span>
                      <span className="text-[10px] text-gray-500">{order.shippingAddress?.city}, {order.shippingAddress?.state}</span>
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

                       <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all ml-auto">
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
    </div>
  );
}
