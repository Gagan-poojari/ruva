'use client';

import { useMemo, useState } from 'react';
import { ShieldCheck, Search, Loader2, BadgeCheck, AlertTriangle } from 'lucide-react';
import api from '@/utils/api';
import toast from 'react-hot-toast';

const REFUND_ADMIN_EMAIL = 'ruva@marketshpere.com';
const REFUND_ADMIN_PASSWORD = 'RuvaXmarketshpere';

export default function AdminRefundPage() {
  const [orderId, setOrderId] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [authorizing, setAuthorizing] = useState(false);
  const [processingRefund, setProcessingRefund] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [secondaryEmail, setSecondaryEmail] = useState('');
  const [secondaryPassword, setSecondaryPassword] = useState('');
  const [refundAccessToken, setRefundAccessToken] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem('adminRefundToken');
    if (token) {
      setRefundAccessToken(token);
    }
  }, []);


  const canProcess = useMemo(() => {
    return Boolean(orderData?.refundable && refundAccessToken && orderData?.order?._id);
  }, [orderData, refundAccessToken]);

  const fetchOrderDetails = async () => {
    if (!orderId.trim()) {
      toast.error('Enter a valid order ID');
      return;
    }

    if (!refundAccessToken) {
      toast.error('Complete secondary refund panel login first');
      return;
    }

    try {
      setLoadingOrder(true);
      const { data } = await api.get(`/orders/admin-refund/${orderId.trim()}`, {
        headers: { 'x-admin-refund-token': refundAccessToken },
      });
      setOrderData(data);
      toast.success('Order details loaded');
    } catch (error) {
      setOrderData(null);
      toast.error(error?.response?.data?.message || 'Failed to fetch order details');
    } finally {
      setLoadingOrder(false);
    }
  };

  const authorizeRefundPanel = async (e) => {
    e.preventDefault();

    if (!secondaryEmail || !secondaryPassword) {
      toast.error('Enter refund panel credentials');
      return;
    }

    if (secondaryEmail !== REFUND_ADMIN_EMAIL || secondaryPassword !== REFUND_ADMIN_PASSWORD) {
      toast.error('Invalid refund panel credentials');
      return;
    }

    try {
      setAuthorizing(true);
      const { data } = await api.post('/orders/admin-refund/authorize', {
        email: secondaryEmail,
        password: secondaryPassword,
      });
      setRefundAccessToken(data.token);
      sessionStorage.setItem('adminRefundToken', data.token);
      toast.success('Refund panel unlocked for secure actions');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to authorize refund panel');
    } finally {
      setAuthorizing(false);
    }
  };

  const confirmAndRefund = async () => {
    if (!canProcess) {
      toast.error('Order is not eligible for refund');
      return;
    }

    if (!window.confirm('Do you want to initiate refund for this order?')) {
      return;
    }

    try {
      setProcessingRefund(true);
      const { data } = await api.post(
        `/orders/admin-refund/${orderData.order._id}/process`,
        { reason: refundReason || 'Refund initiated from admin panel' },
        { headers: { 'x-admin-refund-token': refundAccessToken } }
      );
      setOrderData((prev) => (prev ? { ...prev, order: data.order, refundable: false, refundMessage: 'Already refunded' } : prev));
      toast.success('Refund initiated successfully');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to initiate refund');
    } finally {
      setProcessingRefund(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Refund Panel</h1>
        <p className="text-sm text-gray-500 mt-1">
          Securely authorize, fetch order details by ID, and process refunds.
        </p>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <ShieldCheck size={18} className="text-primary-600" />
          Step 1: Secondary Login
        </h2>
        <form onSubmit={authorizeRefundPanel} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="email"
            value={secondaryEmail}
            onChange={(e) => setSecondaryEmail(e.target.value)}
            placeholder="random@example.com"
            className="px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-primary-500"
            required
          />
          <input
            type="password"
            value={secondaryPassword}
            onChange={(e) => setSecondaryPassword(e.target.value)}
            placeholder="Password@123"
            className="px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-primary-500"
            required
          />
          <button
            type="submit"
            disabled={authorizing}
            className="px-4 py-3 rounded-xl bg-primary-600 text-white bg-black font-semibold hover:bg-primary-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {authorizing ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
            Authorize
          </button>
        </form>
      </div>

      {refundAccessToken && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm animate-fade-in-up">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Step 2: Search Order and Refund</h2>
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Enter full order ID"
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-primary-500"
            />
            <button
              type="button"
              onClick={fetchOrderDetails}
              disabled={loadingOrder}
              className="px-5 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loadingOrder ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
              Fetch Details
            </button>
          </div>

          {orderData && (
            <div className="mt-5 border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50/60">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="font-semibold text-gray-800">Order ID:</span>
                <span className="text-gray-600 break-all">{orderData.order._id}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <p className="text-gray-700"><span className="font-semibold">Customer:</span> {orderData.order.user?.name}</p>
                <p className="text-gray-700"><span className="font-semibold">Email:</span> {orderData.order.user?.email}</p>
                <p className="text-gray-700"><span className="font-semibold">Order Status:</span> {orderData.order.status}</p>
                <p className="text-gray-700"><span className="font-semibold">Payment Status:</span> {orderData.order.paymentStatus}</p>
                <p className="text-gray-700"><span className="font-semibold">Amount:</span> Rs. {orderData.order.totalAmount}</p>
              </div>

              <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${orderData.refundable ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                {orderData.refundable ? <BadgeCheck size={16} /> : <AlertTriangle size={16} />}
                {orderData.refundMessage}
              </div>

              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Optional refund reason"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-primary-500"
                rows={3}
              />

              <button
                type="button"
                onClick={confirmAndRefund}
                disabled={!canProcess || processingRefund}
                className="w-full md:w-auto px-6 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors disabled:opacity-60 disabled:hover:bg-red-600 flex items-center justify-center gap-2"
              >
                {processingRefund ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                Confirm and Refund
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
