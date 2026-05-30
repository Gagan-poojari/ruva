"use client";

const STATUS_COLORS = {
  pending: { text: "#b45309", bg: "#fef3c7", border: "#f59e0b" },
  confirmed: { text: "#6d28d9", bg: "#ede9fe", border: "#8b5cf6" },
  packed: { text: "#1d4ed8", bg: "#dbeafe", border: "#3b82f6" },
  shipped: { text: "#0e7490", bg: "#cffafe", border: "#06b6d4" },
  delivered: { text: "#047857", bg: "#d1fae5", border: "#10b981" },
  cancelled: { text: "#b91c1c", bg: "#fee2e2", border: "#ef4444" },
};

const TIMELINE_STEPS = [
  { key: "pending", label: "Order placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "packed", label: "Packed" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

const stepIndex = (status) => {
  if (status === "cancelled") return -1;
  const idx = TIMELINE_STEPS.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : 0;
};

/**
 * Shared order detail UI (status, items, timeline) — used on /track.
 * Mirrors the authenticated order card layout from profile.
 */
export default function OrderDetailView({ order }) {
  if (!order) return null;

  const status = order.status || "pending";
  const palette = STATUS_COLORS[status] || STATUS_COLORS.pending;
  const currentStep = stepIndex(status);
  const isCancelled = status === "cancelled";

  return (
    <div className="rounded-3xl border border-[#d9b06d]/35 bg-white/90 backdrop-blur-md p-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#6b4a2f]/60">Order</p>
          <p
            className="text-2xl font-bold text-[#2f0f45]"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            #{String(order._id).slice(-8).toUpperCase()}
          </p>
          <p className="text-sm text-[#6b4a2f]/70 mt-1">
            Placed{" "}
            {order.createdAt
              ? new Date(order.createdAt).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "—"}
          </p>
        </div>
        <div className="text-right">
          <span
            className="inline-block text-[0.65rem] font-bold uppercase tracking-widest px-3 py-1 rounded-full border"
            style={{
              color: palette.text,
              backgroundColor: palette.bg,
              borderColor: `${palette.border}55`,
            }}
          >
            {status}
          </span>
          <p className="text-lg font-semibold text-[#2f0f45] mt-2 sp2-num">
            ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-[#6b4a2f]/60 capitalize">
            Payment: {order.paymentStatus || "pending"}
          </p>
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-[#6b4a2f]/60 mb-3">Order timeline</p>
        {isCancelled ? (
          <p className="text-sm text-[#b91c1c]">This order was cancelled.</p>
        ) : (
          <ol className="relative border-l border-[#d9b06d]/40 ml-2 space-y-4">
            {TIMELINE_STEPS.map((step, index) => {
              const done = index <= currentStep;
              const active = index === currentStep;
              return (
                <li key={step.key} className="ml-4">
                  <span
                    className={`absolute -left-[9px] mt-1.5 h-4 w-4 rounded-full border-2 ${
                      done ? "bg-[#4d1f73] border-[#4d1f73]" : "bg-white border-[#d9b06d]/50"
                    } ${active ? "ring-2 ring-[#4d1f73]/25" : ""}`}
                  />
                  <p
                    className={`text-sm font-semibold ${
                      done ? "text-[#2f0f45]" : "text-[#6b4a2f]/45"
                    }`}
                  >
                    {step.label}
                  </p>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-[#6b4a2f]/60 mb-3">Items</p>
        <div className="flex flex-wrap gap-2">
          {order.items?.map((it, i) => {
            const img =
              it.product?.images?.[0]?.url || it.product?.images?.[0] || null;
            return (
              <div
                key={i}
                className="flex items-center gap-2 rounded-xl border border-[#d9b06d]/25 bg-[#fffaf2] px-3 py-2"
              >
                {img && (
                  <img
                    src={img}
                    alt=""
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                )}
                <div>
                  <p className="text-sm font-semibold text-[#2f0f45]">
                    {it.product?.name || "Product"}
                  </p>
                  <p className="text-xs text-[#6b4a2f]/70">
                    Qty {it.qty}
                    {it.size ? ` · ${it.size}` : ""}
                    {it.color ? ` · ${it.color}` : ""}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {order.updatedAt && (
        <p className="text-xs text-[#6b4a2f]/50">
          Last updated:{" "}
          {new Date(order.updatedAt).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      )}
    </div>
  );
}
