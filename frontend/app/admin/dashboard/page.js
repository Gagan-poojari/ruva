'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  MoreVertical,
  Package,
  AlertTriangle,
  Activity
} from 'lucide-react';
import api from '@/utils/api';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const url = statusFilter ? `/dashboard/stats?status=${statusFilter}` : '/dashboard/stats';
      const { data } = await api.get(url);
      setStats(data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStats();
    }, 0);
    return () => clearTimeout(timer);
  }, [statusFilter]);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  const salesCards = [
    { title: 'Today', amount: stats?.sales?.day?.totalSales || 0, count: stats?.sales?.day?.count || 0, icon: DollarSign, color: 'bg-blue-500' },
    { title: 'This Week', amount: stats?.sales?.week?.totalSales || 0, count: stats?.sales?.week?.count || 0, icon: TrendingUp, color: 'bg-purple-500' },
    { title: 'This Month', amount: stats?.sales?.month?.totalSales || 0, count: stats?.sales?.month?.count || 0, icon: ShoppingBag, color: 'bg-orange-500' },
    { title: 'This Year', amount: stats?.sales?.year?.totalSales || 0, count: stats?.sales?.year?.count || 0, icon: DollarSign, color: 'bg-emerald-500' },
  ];

  const filterOptions = [
    { label: 'All Orders', value: '', icon: Filter },
    { label: 'Delivered', value: 'delivered', icon: CheckCircle2 },
    { label: 'Pending', value: 'pending', icon: Clock },
    { label: 'Cancelled', value: 'cancelled', icon: XCircle },
  ];

  // Calculate max sales for chart scaling
  const maxSales = Math.max(...(stats?.dailySales?.map(d => d.totalSales) || []), 100);

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Overview</h1>
          <p className="text-sm text-gray-500 mt-1 italic font-serif text-primary-600">Pure craftsmanship, real-time performance.</p>
        </div>

        <div className="flex bg-white border border-gray-200 p-1 rounded-xl shadow-sm overflow-x-auto no-scrollbar">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${statusFilter === opt.value
                  ? 'bg-gray-100 text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <opt.icon size={16} />
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {salesCards.map((card) => (
          <div key={card.title} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.color} bg-opacity-10 p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                <card.icon className={card.color.replace('bg-', 'text-')} size={20} />
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg flex items-center gap-1 uppercase tracking-tighter">
                Live
              </span>
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{card.title} Revenue</p>
            <div className="mt-1 flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-gray-900">₹{card.amount.toLocaleString()}</h3>
              <span className="text-xs text-gray-400 font-medium">{card.count} Orders</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Dynamic Revenue Analytics Graph */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-primary-500" />
              <h3 className="font-bold text-gray-900">Revenue Analytics</h3>
            </div>
            <div className="bg-primary-50 text-primary-700 text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider">
              Last 7 Days
            </div>
          </div>

          <div className="h-64 flex items-end gap-3 px-2">
            {stats?.dailySales?.map((day, i) => {
              const heightPercentage = Math.round((day.totalSales / maxSales) * 100);
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-3 group relative">
                  {/* Tooltip on Hover */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-all bg-gray-900 text-white text-[10px] py-1 px-2 rounded-md whitespace-nowrap z-10 font-bold">
                    ₹{day.totalSales.toLocaleString()}
                  </div>

                  <div
                    className="w-full bg-primary-50 rounded-t-xl group-hover:bg-primary-100 transition-all duration-500 relative overflow-hidden"
                    style={{ height: `${Math.max(heightPercentage, 5)}%` }}
                  >
                    <div
                      className="absolute bottom-0 w-full bg-primary-500 rounded-t-xl shadow-[0_0_15px_rgba(var(--color-primary-500),0.3)]"
                      style={{ height: '40%' }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                </div>
              );
            })}
          </div>

          {(!stats?.dailySales || stats.dailySales.length === 0) && (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm italic">
              Waiting for sales data...
            </div>
          )}
        </div>

        <div className="space-y-8">
          {/* Inventory Insights (Cool Stuff) */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full -mr-16 -mt-16" />
            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Package size={18} className="text-primary-500" />
              Inventory Health
            </h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs font-bold text-gray-500 uppercase mb-2">
                  <span>Stock Availability</span>
                  <span className={stats.lowStockCount > 0 ? 'text-red-500' : 'text-emerald-500'}>
                    {stats.lowStockCount} Low Items
                  </span>
                </div>
                <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ${stats.lowStockCount > 5 ? 'bg-red-500' : 'bg-primary-500'}`}
                    style={{ width: `${Math.max(100 - (stats.lowStockCount * 5), 10)}%` }}
                  />
                </div>
              </div>

              {stats.lowStockCount > 0 && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="text-red-500 mt-0.5" size={16} />
                  <div>
                    <p className="text-xs font-bold text-red-700">Restock Warning</p>
                    <p className="text-[10px] text-red-600 mt-1">{stats.lowStockCount} sarees are running low on stock. Check inventory soon.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recent Orders - Scaled Down */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900">Recent Activity</h3>
              <button className="text-[10px] font-bold text-primary-600 hover:underline uppercase tracking-widest">Feed</button>
            </div>

            <div className="space-y-5">
              {stats?.recentOrders?.map((order) => (
                <div key={order._id} className="flex items-center gap-3 border-l-2 border-primary-500/20 pl-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">₹{order.totalAmount.toLocaleString()}</p>
                    <p className="text-[10px] text-gray-500 truncate">{order.user?.name || 'Guest'}</p>
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter ${order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600' :
                      order.status === 'pending' ? 'bg-orange-50 text-orange-600' :
                        'bg-gray-100 text-gray-600'
                    }`}>
                    {order.status}
                  </span>
                </div>
              ))}
              {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
                <p className="text-center text-[10px] text-gray-400 italic">No activity yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
