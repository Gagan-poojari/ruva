"use client";

import { useState, useEffect } from "react";
import api from "@/utils/api";
import { Check, X, Trash2, Video, Image as ImageIcon, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function ApprovalsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSubmissions = async () => {
    try {
      const { data } = await api.get("/submissions");
      setSubmissions(data);
    } catch (error) {
      toast.error("Failed to fetch submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleApprove = async (id) => {
    try {
      await api.put(`/submissions/${id}/approve`);
      toast.success("Submission approved successfully");
      fetchSubmissions();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve submission");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this submission?")) return;
    try {
      await api.delete(`/submissions/${id}`);
      toast.success("Submission deleted");
      fetchSubmissions();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete submission");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="animate-spin text-primary-500 w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Media Approvals</h1>
      </div>

      {submissions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <p className="text-gray-500">No submissions found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {submissions.map((sub) => (
            <div key={sub._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm flex flex-col">
              <div className="relative h-48 bg-gray-50 flex items-center justify-center">
                {sub.mediaType === "video" ? (
                  <video src={sub.mediaUrl} controls className="w-full h-full object-cover" />
                ) : (
                  <img src={sub.mediaUrl} alt="" className="w-full h-full object-cover" />
                )}
                <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                  {sub.mediaType === "video" ? <Video size={12} /> : <ImageIcon size={12} />}
                  {sub.mediaType}
                </div>
                <div className={`absolute top-2 right-2 px-2 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                  sub.status === 'approved' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                }`}>
                  {sub.status}
                </div>
              </div>
              
              <div className="p-4 flex-1 flex flex-col">
                <p className="font-bold text-gray-900">Name: {sub.userName}</p>
                {sub.user && <p className="text-xs text-gray-500 mb-2">Email: {sub.user.email} | Phone: {sub.user.phone}</p>}
                
                {sub.description && (
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-xl mb-4 italic">
                    "{sub.description}"
                  </p>
                )}

                <div className="mt-auto flex justify-end gap-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleDelete(sub._id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                  {sub.status === 'pending' && (
                    <button
                      onClick={() => handleApprove(sub._id)}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 font-bold text-sm rounded-lg hover:bg-emerald-100 transition-colors"
                    >
                      <Check size={16} /> Approve
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
