"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/utils/api";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Upload, X, Play, Star, Camera, Sparkles, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { RiVerifiedBadgeFill } from "react-icons/ri";

/* ─── type tokens ─── */
const F = {
  display: "'Cormorant Garamond', Georgia, serif",
  body: "'Lora', Georgia, serif",
  label: "'Cormorant Garamond', Georgia, serif",
};

/* ─── star ─── */
function Stars({ n = 5, size = 11 }) {
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={size}
          fill={i < n ? "#f0c97a" : "none"}
          stroke={i < n ? "#f0c97a" : "rgba(201,133,60,0.3)"}
        />
      ))}
    </div>
  );
}

/* ─── Tilt + parallax card ─── */
function TiltCard({ children, className = "", style = {} }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 260, damping: 28 });
  const rotY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 260, damping: 28 });
  const scale = useSpring(1, { stiffness: 260, damping: 26 });

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onEnter = () => scale.set(1.03);
  const onLeave = () => { x.set(0); y.set(0); scale.set(1); };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{ rotateX: rotX, rotateY: rotY, scale, transformStyle: "preserve-3d", ...style }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Review card ─── */
function ReviewCard({ item, index, onClick, isActive }) {
  const isVideo = item.mediaType === "video";
  const hasMedia = Boolean(item.mediaUrl);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.75, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      style={{ scrollSnapAlign: "start", flexShrink: 0 }}
    >
      <TiltCard
        style={{
          width: 230, cursor: "pointer",
          borderRadius: 18, overflow: "hidden",
          background: "rgba(30,8,8,0.7)",
          border: "1px solid rgba(201,133,60,0.22)",
          // boxShadow: isActive
          //   ? "0 0 0 1.5px rgba(240,201,122,0.7), 0 20px 60px rgba(0,0,0,0.5)"
          //   : "0 12px 40px rgba(0,0,0,0.35)",
          backdropFilter: "blur(14px)",
          transition: "box-shadow 0.3s",
        }}
        onClick={() => hasMedia && onClick(item)}
      >
        {/* image / video */}
        <div style={{ position: "relative", aspectRatio: "3/4", overflow: "hidden" }}>
          {hasMedia ? (
            isVideo ? (
              <video src={item.mediaUrl} muted playsInline
                style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <img src={item.mediaUrl} alt={item.userName}
                style={{
                  width: "100%", height: "100%", objectFit: "cover",
                  transition: "transform 1.1s cubic-bezier(.22,1,.36,1)"
                }}
                className="rev-img"
              />
            )
          ) : (
            <div style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "radial-gradient(circle at 30% 20%, rgba(240,201,122,0.28), rgba(30,8,8,0.95) 56%)",
              color: "#ffe8b0",
              fontFamily: F.display,
              fontSize: "2rem",
              fontWeight: 700,
            }}>
              {(item.userName || "R").trim().charAt(0).toUpperCase()}
            </div>
          )}

          {/* gradient vignette */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top, rgba(14,3,3,0.92) 0%, rgba(14,3,3,0.2) 48%, transparent 72%)",
          }} />

          {/* play icon */}
          {isVideo && hasMedia && (
            <div style={{
              position: "absolute", inset: 0, display: "flex",
              alignItems: "center", justifyContent: "center",
            }}>
              <motion.div whileHover={{ scale: 1.12 }}
                style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: "rgba(240,201,122,0.92)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
                }}>
                <Play size={16} fill="#1e0808" color="#1e0808" />
              </motion.div>
            </div>
          )}

          {/* verified badge */}
          {/* <div style={{
            position: "absolute", top: 10, right: 10,
            background: "rgba(14,3,3,0.6)", backdropFilter: "blur(8px)",
            border: "1px solid rgba(240,201,122,0.35)",
            borderRadius: 100, padding: "3px",
            display: "flex", alignItems: "center",
          }}>
            <RiVerifiedBadgeFill size={12} color="#58761b" />
            <span style={{ fontFamily: F.label, fontSize: "0.52rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#f0c97a", fontWeight: 700 }}>
              Verified
            </span>
          </div> */}

          {/* name + stars at bottom */}
          <div style={{ position: "absolute", bottom: 10, left: 12, right: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <p style={{ fontFamily: F.display, color: "#fff5dd", fontSize: "1rem", fontWeight: 700, textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
                {item.userName}
              </p>
              <RiVerifiedBadgeFill size={15} color="#00308f" />
            </div>
            <Stars n={item.rating || 5} />
          </div>
        </div>

        {/* quote */}
        {item.description && (
          <div style={{ padding: "14px 16px 16px", position: "relative" }}>
            <Quote size={16} color="rgba(201,133,60,0.3)" style={{ position: "absolute", top: 10, left: 12 }} />
            <p style={{
              fontFamily: F.body, fontSize: "0.76rem", color: "rgba(255,232,176,0.65)",
              margin: 0, lineHeight: 1.6, paddingLeft: 20,
              display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
            }}>
              {item.description}
            </p>
          </div>
        )}
      </TiltCard>
    </motion.div>
  );
}

function TextReviewCard({ item, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      style={{
        width: "100%",
        maxWidth: 360,
        borderRadius: 16,
        border: "1px solid rgba(201,133,60,0.24)",
        background: "linear-gradient(160deg,#fffdf8,#fdf2df)",
        boxShadow: "0 10px 24px rgba(107,26,26,0.08)",
        padding: "16px 18px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <p style={{ margin: 0, fontFamily: F.display, fontSize: "1rem", fontWeight: 700, color: "#3d0a0a" }}>
          {item.userName}
        </p>
        <Stars n={item.rating || 5} size={10} />
      </div>
      <p style={{ margin: 0, fontFamily: F.body, color: "rgba(61,10,10,0.78)", lineHeight: 1.62, fontSize: "0.86rem" }}>
        &ldquo;{item.description}&rdquo;
      </p>
    </motion.div>
  );
}

/* ─── Lightbox ─── */
function Lightbox({ item, items, onClose, onPrev, onNext }) {
  const isVideo = item.mediaType === "video";

  useEffect(() => {
    const fn = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose, onPrev, onNext]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(6,1,1,0.92)", backdropFilter: "blur(14px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px 60px",
      }}
    >
      {/* prev */}
      <motion.button
        whileHover={{ scale: 1.1, x: -2 }} whileTap={{ scale: 0.92 }}
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        style={{
          position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
          background: "rgba(30,8,8,0.7)", border: "1px solid rgba(240,201,122,0.3)",
          color: "#f0c97a", width: 44, height: 44, borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", backdropFilter: "blur(8px)", zIndex: 10,
        }}
      >
        <ChevronLeft size={20} />
      </motion.button>

      {/* next */}
      <motion.button
        whileHover={{ scale: 1.1, x: 2 }} whileTap={{ scale: 0.92 }}
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        style={{
          position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
          background: "rgba(30,8,8,0.7)", border: "1px solid rgba(240,201,122,0.3)",
          color: "#f0c97a", width: 44, height: 44, borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", backdropFilter: "blur(8px)", zIndex: 10,
        }}
      >
        <ChevronRight size={20} />
      </motion.button>

      <motion.div
        key={item._id}
        initial={{ scale: 0.88, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: -10 }}
        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 500, width: "100%",
          borderRadius: 22, overflow: "hidden",
          boxShadow: "0 40px 100px rgba(0,0,0,0.75), 0 0 0 1px rgba(201,133,60,0.28)",
          background: "#100202",
        }}
      >
        {/* gold top line */}
        <div style={{ height: 2, background: "linear-gradient(to right, transparent, #d4891e, #f0c97a, #d4891e, transparent)" }} />

        {isVideo ? (
          <video src={item.mediaUrl} controls autoPlay
            style={{ width: "100%", display: "block", maxHeight: "65vh", objectFit: "contain", background: "#000" }} />
        ) : (
          <img src={item.mediaUrl} alt={item.userName}
            style={{ width: "100%", display: "block", maxHeight: "65vh", objectFit: "contain" }} />
        )}

        <div style={{ padding: "18px 22px 22px", background: "linear-gradient(to bottom, #100202, #1e0808)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div>
              <p style={{ fontFamily: F.display, color: "#f0c97a", fontWeight: 700, fontSize: "1.15rem", margin: "0 0 4px" }}>
                {item.userName}
              </p>
              <Stars n={item.rating || 5} size={13} />
            </div>
            <div style={{
              background: "rgba(201,133,60,0.12)", border: "1px solid rgba(240,201,122,0.25)",
              borderRadius: 100, padding: "5px 12px", display: "flex", alignItems: "center", gap: 5,
            }}>
              <Sparkles size={11} color="#f0c97a" />
              <span style={{ fontFamily: F.label, fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#f0c97a", fontWeight: 700 }}>
                Verified Buyer
              </span>
            </div>
          </div>
          {item.description && (
            <p style={{ fontFamily: F.body, color: "rgba(255,232,176,0.65)", fontSize: "0.88rem", lineHeight: 1.7, margin: 0 }}>
              &ldquo;{item.description}&rdquo;
            </p>
          )}
        </div>
      </motion.div>

      {/* close */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
        onClick={onClose}
        style={{
          position: "absolute", top: 18, right: 18,
          background: "rgba(255,232,176,0.1)", border: "1px solid rgba(240,201,122,0.3)",
          color: "#ffe8b0", borderRadius: "50%", width: 42, height: 42,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", backdropFilter: "blur(6px)",
          transition: "background .25s",
        }}
      >
        <X size={18} />
      </motion.button>

      {/* dot indicators */}
      <div style={{
        position: "absolute", bottom: 18, left: "50%", transform: "translateX(-50%)",
        display: "flex", gap: 6,
      }}>
        {items.map((it, i) => (
          <div key={it._id} style={{
            width: it._id === item._id ? 20 : 6, height: 6,
            borderRadius: 999, transition: "width .3s cubic-bezier(.22,1,.36,1)",
            background: it._id === item._id ? "#f0c97a" : "rgba(240,201,122,0.25)",
          }} />
        ))}
      </div>
    </motion.div>
  );
}

/* ─── Upload modal ─── */
function UploadModal({ onClose, onSuccess }) {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef(null);

  const handleFile = (f) => {
    if (!f) return;
    setFile(f); setPreview(URL.createObjectURL(f)); setError("");
  };

  const submit = async () => {
    if (!file && !desc.trim()) { setError("Add text or media to submit your review."); return; }
    setLoading(true); setError("");
    try {
      const fd = new FormData();
      if (file) fd.append("media", file);
      fd.append("description", desc.trim());
      await api.post("/submissions", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setDone(true); if (onSuccess) onSuccess();
    } catch (e) {
      setError(e.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fn = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9998,
        background: "rgba(6,1,1,0.88)", backdropFilter: "blur(12px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }}
    >
      <motion.div
        initial={{ y: 50, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 30, opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 460, borderRadius: 24,
          overflow: "hidden",
          background: "linear-gradient(160deg,#fdf8f0 0%,#f9edda 100%)",
          boxShadow: "0 50px 120px rgba(0,0,0,0.55), 0 0 0 1px rgba(201,133,60,0.28)",
        }}
      >
        {/* gold top rule */}
        <div style={{ height: 2.5, background: "linear-gradient(to right,transparent,#c9853c 25%,#f0c97a 50%,#c9853c 75%,transparent)" }} />

        <div style={{ padding: "26px 28px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ fontFamily: F.label, fontSize: "0.65rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#c9853c", margin: "0 0 5px", fontWeight: 700 }}>
              Share Your Look
            </p>
            <h3 style={{ fontFamily: F.display, fontSize: "1.7rem", fontWeight: 700, color: "#2a0505", margin: 0, lineHeight: 1.05 }}>
              Upload Your Review
            </h3>
          </div>
          <motion.button
            whileHover={{ rotate: 90, scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={onClose}
            style={{ background: "rgba(107,26,26,0.08)", border: "1px solid rgba(201,133,60,0.2)", borderRadius: "50%", width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#6b1a1a", marginTop: 2, flexShrink: 0 }}
          >
            <X size={16} />
          </motion.button>
        </div>

        <div style={{ padding: "22px 28px 28px" }}>
          <AnimatePresence mode="wait">
            {done ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: "center", padding: "12px 0" }}
              >
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
                  style={{ fontSize: "3.2rem", marginBottom: 14 }}
                >✨</motion.div>
                <p style={{ fontFamily: F.display, fontSize: "1.5rem", fontWeight: 700, color: "#2a0505", marginBottom: 8 }}>
                  Thank you!
                </p>
                <p style={{ fontFamily: F.body, color: "rgba(90,42,26,0.68)", fontSize: "0.88rem", lineHeight: 1.65, marginBottom: 22, maxWidth: 300, margin: "0 auto 22px" }}>
                  Your look is now live on our reviews wall. Thank you for sharing your RUVA story.
                </p>
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={onClose}
                  style={{ fontFamily: F.label, fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700, background: "linear-gradient(130deg,#6b1a1a,#a03030)", color: "#ffe8b0", border: "none", padding: "11px 30px", borderRadius: 100, cursor: "pointer", boxShadow: "0 4px 18px rgba(107,26,26,0.38)" }}
                >
                  Close
                </motion.button>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {/* drop zone */}
                <motion.div
                  animate={{ borderColor: drag ? "rgba(201,133,60,0.8)" : file ? "rgba(201,133,60,0.55)" : "rgba(201,133,60,0.28)" }}
                  onDrop={(e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
                  onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                  onDragLeave={() => setDrag(false)}
                  onClick={() => inputRef.current?.click()}
                  style={{
                    border: "2px dashed rgba(201,133,60,0.35)", borderRadius: 16,
                    background: drag ? "rgba(201,133,60,0.07)" : file ? "rgba(201,133,60,0.04)" : "rgba(201,133,60,0.02)",
                    minHeight: 170, display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    cursor: "pointer", overflow: "hidden", position: "relative",
                    transition: "background .25s",
                  }}
                >
                  <input ref={inputRef} type="file" accept="image/*,video/*" style={{ display: "none" }}
                    onChange={(e) => handleFile(e.target.files[0])} />

                  <AnimatePresence mode="wait">
                    {preview ? (
                      <motion.div key="preview"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        style={{ position: "absolute", inset: 0 }}
                      >
                        {file?.type?.startsWith("video") ? (
                          <video src={preview} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <img src={preview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        )}
                        <div style={{ position: "absolute", inset: 0, background: "rgba(14,3,3,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontFamily: F.label, fontSize: "0.62rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#ffe8b0", fontWeight: 700, padding: "6px 14px", borderRadius: 100, background: "rgba(14,3,3,0.55)", border: "1px solid rgba(240,201,122,0.4)", backdropFilter: "blur(6px)" }}>
                            Tap to change
                          </span>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        style={{ textAlign: "center", padding: "0 20px" }}
                      >
                        <motion.div
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <Camera size={30} color="rgba(201,133,60,0.5)" />
                        </motion.div>
                        <p style={{ fontFamily: F.label, fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(90,42,26,0.5)", marginTop: 10, marginBottom: 4, fontWeight: 700 }}>
                          Add photo/video (optional)
                        </p>
                        <p style={{ fontFamily: F.body, fontSize: "0.72rem", color: "rgba(90,42,26,0.38)", margin: 0 }}>
                          or click to browse · up to 200 MB
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* description */}
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Share your experience with RUVA…"
                  maxLength={400}
                  rows={3}
                  style={{
                    width: "100%", marginTop: 14, padding: "12px 15px", borderRadius: 12,
                    border: "1px solid rgba(201,133,60,0.28)", background: "rgba(255,250,243,0.7)",
                    fontFamily: F.body, fontSize: "0.85rem", color: "#2a0505",
                    outline: "none", boxSizing: "border-box", lineHeight: 1.6, resize: "vertical",
                    transition: "border-color .25s, box-shadow .25s",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "rgba(201,133,60,0.6)"; e.target.style.boxShadow = "0 0 0 3px rgba(201,133,60,0.1)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "rgba(201,133,60,0.28)"; e.target.style.boxShadow = "none"; }}
                />
                <div style={{ textAlign: "right", marginTop: 4 }}>
                  <span style={{ fontFamily: F.label, fontSize: "0.58rem", color: "rgba(90,42,26,0.4)", letterSpacing: "0.1em" }}>
                    {desc.length}/400
                  </span>
                </div>

                {error && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                    style={{ color: "#a03030", fontSize: "0.78rem", marginTop: 6, fontFamily: F.body }}>
                    {error}
                  </motion.p>
                )}

                <motion.button
                  whileHover={!loading && file ? { scale: 1.02 } : {}}
                  whileTap={!loading && (file || desc.trim()) ? { scale: 0.97 } : {}}
                  onClick={submit}
                  disabled={loading || (!file && !desc.trim())}
                  style={{
                    marginTop: 16, width: "100%", padding: "13px 0", borderRadius: 100,
                    fontFamily: F.label, fontSize: "0.68rem", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700,
                    background: loading || (!file && !desc.trim()) ? "rgba(107,26,26,0.28)" : "linear-gradient(130deg,#6b1a1a,#a03030)",
                    color: loading || (!file && !desc.trim()) ? "rgba(255,232,176,0.45)" : "#ffe8b0",
                    border: "none", cursor: loading || (!file && !desc.trim()) ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    boxShadow: loading || (!file && !desc.trim()) ? "none" : "0 6px 20px rgba(107,26,26,0.4)",
                    transition: "all .3s",
                  }}
                >
                  {loading ? (
                    <><span className="upload-spin" />Uploading…</>
                  ) : (
                    <><Upload size={13} />Submit Review</>
                  )}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

const normalizeReviewItem = (item) => ({
  _id: item._id || `${item.publicId || "review"}-${item.createdAt || Date.now()}`,
  userName: item.userName || item.customerName || "RUVA Customer",
  mediaType: item.mediaType || "image",
  mediaUrl: item.mediaUrl || "",
  description: item.description || item.quote || "",
  rating: Number(item.rating) > 0 ? Number(item.rating) : 5,
  createdAt: item.createdAt || null,
});

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
export default function Reviews() {
  const { user } = useAuth();
  const router = useRouter();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [canScrollL, setCanScrollL] = useState(false);
  const [canScrollR, setCanScrollR] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const loadReviews = async () => {
      try {
        const [reviewRes, approvedSubmissionsRes] = await Promise.allSettled([
          api.get("/reviews"),
          api.get("/submissions/approved?includePending=true"),
        ]);

        const adminReviews =
          reviewRes.status === "fulfilled" && Array.isArray(reviewRes.value.data)
            ? reviewRes.value.data.map(normalizeReviewItem)
            : [];

        const approvedSubmissions =
          approvedSubmissionsRes.status === "fulfilled" && Array.isArray(approvedSubmissionsRes.value.data)
            ? approvedSubmissionsRes.value.data.map(normalizeReviewItem)
            : [];

        const merged = [...approvedSubmissions, ...adminReviews]
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

        if (mounted) setReviews(merged);
      } catch {
        if (mounted) setReviews([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadReviews();
    return () => {
      mounted = false;
    };
  }, []);

  const displayReviews = loading ? [] : reviews;
  const mediaReviews = displayReviews.filter((item) => Boolean(item.mediaUrl));
  const textReviews = displayReviews.filter((item) => !item.mediaUrl && Boolean(item.description));

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollL(el.scrollLeft > 10);
    setCanScrollR(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    updateArrows();
    return () => el.removeEventListener("scroll", updateArrows);
  }, [updateArrows, mediaReviews]);

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 260, behavior: "smooth" });
  };

  const handleUploadClick = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    setShowUpload(true);
  };

  const lightboxItem = lightboxIndex !== null ? mediaReviews[lightboxIndex] : null;

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes upload-spin {
          to { transform: rotate(360deg); }
        }
        .upload-spin {
          display: inline-block;
          width: 13px; height: 13px;
          border: 2px solid rgba(255,232,176,0.3);
          border-top-color: #ffe8b0;
          border-radius: 50%;
          animation: upload-spin 0.7s linear infinite;
        }
        .rev-scroll::-webkit-scrollbar { display: none; }
        .rev-scroll { scrollbar-width: none; -ms-overflow-style: none; }
        .rev-img:hover { transform: scale(1.07); }

        /* particle float */
        @keyframes float-particle {
          0%,100% { transform: translateY(0) scale(1);   opacity: .6; }
          50%      { transform: translateY(-18px) scale(1.15); opacity: .35; }
        }
      `}</style>

      <section style={{
        background: "linear-gradient(168deg,#fdf8f0 0%,#fbefdc 50%,#fff9ef 100%)",
        padding: "96px 0 100px", overflow: "hidden", position: "relative",
      }}>

        {/* ── decorative floating orbs ── */}
        {[
          { size: 320, top: "-80px", left: "-80px", color: "rgba(201,133,60,0.07)", delay: 0 },
          { size: 260, bottom: "-60px", right: "-40px", color: "rgba(107,26,26,0.10)", delay: 1.2 },
          { size: 180, top: "40%", left: "12%", color: "rgba(201,133,60,0.05)", delay: 0.6 },
        ].map((o, i) => (
          <div key={i} style={{
            position: "absolute", width: o.size, height: o.size, borderRadius: "50%",
            background: o.color, filter: "blur(70px)", pointerEvents: "none",
            top: o.top, left: o.left, bottom: o.bottom, right: o.right,
            animation: `float-particle ${6 + i}s ease-in-out infinite`,
            animationDelay: `${o.delay}s`,
          }} />
        ))}

        {/* ── silk-weave texture overlay ── */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "repeating-linear-gradient(-52deg,rgba(201,133,60,0.04) 0,rgba(201,133,60,0.04) 1px,transparent 1px,transparent 18px),repeating-linear-gradient(38deg,rgba(201,133,60,0.03) 0,rgba(201,133,60,0.03) 1px,transparent 1px,transparent 18px)",
          opacity: 0.7,
        }} />

        {/* ═══════════ HEADER ═══════════ */}
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 52, flexWrap: "wrap", gap: 20 }}
          >
            <div>
              {/* eyebrow */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{ height: 1, width: 32, background: "rgba(107,26,26,0.35)" }} />
                <span style={{ fontFamily: F.label, fontSize: "0.65rem", letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(107,26,26,0.75)", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                  Reviews from our customers
                </span>
                <span style={{ height: 1, width: 32, background: "rgba(107,26,26,0.35)" }} />
              </div>

              {/* headline */}
              <h2 style={{ fontFamily: F.display, fontSize: "clamp(2.2rem,5vw,3.4rem)", fontWeight: 700, color: "#2a0505", margin: "0 0 12px", lineHeight: 1.04 }}>
                Happy Customers,{" "}
                <em style={{
                  fontStyle: "italic",
                  background: "linear-gradient(110deg,#c9853c 0%,#f0c97a 42%,#c9853c 80%)",
                  backgroundSize: "220%",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  animation: "shimmer 3.4s linear infinite",
                }}>
                  Genuine Stories
                </em>
              </h2>
              <p style={{ margin: 0, fontFamily: F.body, color: "rgba(61,10,10,0.62)", maxWidth: 560 }}>
                Explore visual reviews separately from text-only feedback, similar to familiar e-commerce review experiences.
              </p>
            </div>

            {/* CTA */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleUploadClick}
                style={{
                  fontFamily: F.label, fontSize: "0.65rem", letterSpacing: "0.2em",
                  textTransform: "uppercase", fontWeight: 700,
                  display: "flex", alignItems: "center", gap: 9,
                  padding: "12px 24px", borderRadius: 100, cursor: "pointer",
                  background: "linear-gradient(130deg,#6b1a1a,#a03030)",
                  border: "1px solid rgba(107,26,26,0.3)",
                  color: "#ffe8b0",
                  boxShadow: "0 8px 22px rgba(107,26,26,0.24)",
                  transition: "all .28s",
                }}
              >
                <Camera size={14} />
                Share Your Look
              </motion.button>


            </div>
          </motion.div>
        </div>

        {/* ═══════════ MEDIA REVIEWS ═══════════ */}
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", marginBottom: 8 }}>
          <p style={{ margin: 0, fontFamily: F.label, fontSize: "0.62rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(107,26,26,0.68)", fontWeight: 700 }}>
            Photo & Video Reviews
          </p>
        </div>
        <div style={{ position: "relative" }}>
          {/* left arrow */}
          <AnimatePresence>
            {canScrollL && mediaReviews.length > 0 && (
              <motion.button
                key="arr-l"
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                whileHover={{ scale: 1.1, x: -2 }} whileTap={{ scale: 0.92 }}
                onClick={() => scroll(-1)}
                style={{
                  position: "absolute", left: 12, top: "40%", transform: "translateY(-50%)", zIndex: 10,
                  background: "rgba(255,255,255,0.86)", border: "1px solid rgba(201,133,60,0.35)",
                  color: "#8d4b1a", width: 40, height: 40, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", boxShadow: "0 4px 16px rgba(107,26,26,0.2)",
                }}
              >
                <ChevronLeft size={19} />
              </motion.button>
            )}
          </AnimatePresence>

          {/* right arrow */}
          <AnimatePresence>
            {canScrollR && mediaReviews.length > 0 && (
              <motion.button
                key="arr-r"
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                whileHover={{ scale: 1.1, x: 2 }} whileTap={{ scale: 0.92 }}
                onClick={() => scroll(1)}
                style={{
                  position: "absolute", right: 12, top: "40%", transform: "translateY(-50%)", zIndex: 10,
                  background: "rgba(255,255,255,0.86)", border: "1px solid rgba(201,133,60,0.35)",
                  color: "#8d4b1a", width: 40, height: 40, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", boxShadow: "0 4px 16px rgba(107,26,26,0.2)",
                }}
              >
                <ChevronRight size={19} />
              </motion.button>
            )}
          </AnimatePresence>

          {/* edge fade masks */}
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 64, pointerEvents: "none", zIndex: 5, background: "linear-gradient(to right,#fdf8f0,transparent)" }} />
          <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 64, pointerEvents: "none", zIndex: 5, background: "linear-gradient(to left,#fdf8f0,transparent)" }} />

          {/* scroll track */}
          <div
            ref={scrollRef}
            className="rev-scroll"
            style={{
              display: "flex", gap: 18, overflowX: "auto",
              padding: "16px 72px 24px",
              scrollSnapType: "x mandatory",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{
                  minWidth: 230, width: 230, borderRadius: 18, flexShrink: 0,
                  aspectRatio: "3/4",
                  background: "rgba(255,245,220,0.05)",
                  border: "1px solid rgba(201,133,60,0.1)",
                  animation: "pulse 1.8s ease-in-out infinite",
                }} />
              ))
              : mediaReviews.map((item, i) => (
                <ReviewCard
                  key={item._id}
                  item={item}
                  index={i}
                  isActive={lightboxIndex === i}
                  onClick={() => item.mediaUrl && setLightboxIndex(i)}
                />
              ))
            }
          </div>
        </div>

        {!loading && mediaReviews.length === 0 && textReviews.length === 0 && (
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
            <div style={{
              borderRadius: 18,
              border: "1px dashed rgba(201,133,60,0.35)",
              background: "rgba(255,255,255,0.64)",
              padding: "30px 20px",
              textAlign: "center",
            }}>
              <p style={{ margin: 0, fontFamily: F.display, color: "#3d0a0a", fontSize: "1.3rem", fontWeight: 700 }}>
                No reviews published yet
              </p>
              <p style={{ margin: "8px 0 0", fontFamily: F.body, color: "rgba(61,10,10,0.56)", fontSize: "0.86rem" }}>
                Be the first to share your RUVA look.
              </p>
            </div>
          </div>
        )}

        {/* ── scroll progress bar ── */}
        {!loading && mediaReviews.length > 0 && (
          <div style={{ maxWidth: 1200, margin: "8px auto 0", padding: "0 72px" }}>
            <div style={{ height: 2, background: "rgba(107,26,26,0.12)", borderRadius: 999, overflow: "hidden" }}>
              <motion.div
                style={{
                  height: "100%", borderRadius: 999,
                  background: "linear-gradient(to right,#8d3c1d,#c9853c)",
                  boxShadow: "0 0 8px rgba(141,60,29,0.32)",
                }}
                animate={{ width: `${((mediaReviews.indexOf(lightboxIndex !== null ? mediaReviews[lightboxIndex] : mediaReviews[0]) + 1) / mediaReviews.length) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
        )}

        {!loading && textReviews.length > 0 && (
          <div style={{ maxWidth: 1200, margin: "26px auto 0", padding: "0 20px" }}>
            <p style={{ margin: "0 0 14px", fontFamily: F.label, fontSize: "0.62rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(107,26,26,0.68)", fontWeight: 700 }}>
              Text Reviews
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
              {textReviews.map((item, i) => (
                <TextReviewCard key={item._id} item={item} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* ── disclaimer ── */}
        <motion.div
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          style={{ textAlign: "center", marginTop: 36 }}
        >
          <p style={{ fontFamily: F.body, color: "rgba(61,10,10,0.45)", fontSize: "0.74rem", margin: 0 }}>
            Reviews are community shared and moderated by the RUVA team.
          </p>
        </motion.div>
      </section>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightboxItem && (
          <Lightbox
            item={lightboxItem}
            items={mediaReviews}
            onClose={() => setLightboxIndex(null)}
            onPrev={() => setLightboxIndex((i) => (i - 1 + mediaReviews.length) % mediaReviews.length)}
            onNext={() => setLightboxIndex((i) => (i + 1) % mediaReviews.length)}
          />
        )}
      </AnimatePresence>

      {/* ── Upload modal ── */}
      <AnimatePresence>
        {showUpload && (
          <UploadModal
            onClose={() => setShowUpload(false)}
            onSuccess={() => setShowUpload(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}