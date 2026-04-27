"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/utils/api";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Upload, X, Play, Star, Camera, Sparkles, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { RiVerifiedBadgeFill } from "react-icons/ri";

/* ─── font tokens ─── */
const F = {
  display: "'Cormorant Garamond', Georgia, serif",
  body:    "'Lora', Georgia, serif",
  label:   "'Cormorant Garamond', Georgia, serif",
};

/* ─── normalise API shape ─── */
const normalise = (item) => ({
  _id:        item._id || `${item.publicId || "r"}-${item.createdAt || Date.now()}`,
  userName:   item.userName || item.customerName || "RUVA Customer",
  mediaType:  item.mediaType || "image",
  mediaUrl:   item.mediaUrl  || "",
  description:item.description || item.quote || "",
  rating:     Number(item.rating) > 0 ? Number(item.rating) : 5,
  createdAt:  item.createdAt || null,
});

/* ─── Stars ─── */
function Stars({ n = 5, size = 11 }) {
  return (
    <div style={{ display:"flex", gap:2 }}>
      {Array.from({ length:5 }).map((_,i) => (
        <Star key={i} size={size}
          fill={i < n ? "#f0c97a" : "none"}
          stroke={i < n ? "#f0c97a" : "rgba(201,133,60,0.28)"}
        />
      ))}
    </div>
  );
}

/* ─── 3-D tilt wrapper (desktop only) ─── */
function TiltCard({ children, style = {}, onClick }) {
  const ref  = useRef(null);
  const mx   = useMotionValue(0);
  const my   = useMotionValue(0);
  const rotX = useSpring(useTransform(my, [-0.5, 0.5], [ 7,-7]), { stiffness:240, damping:26 });
  const rotY = useSpring(useTransform(mx, [-0.5, 0.5], [-7, 7]), { stiffness:240, damping:26 });
  const sc   = useSpring(1, { stiffness:240, damping:24 });

  return (
    <motion.div ref={ref}
      onClick={onClick}
      onMouseMove={(e) => {
        const r = ref.current.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width  - 0.5);
        my.set((e.clientY - r.top)  / r.height - 0.5);
      }}
      onMouseEnter={() => sc.set(1.035)}
      onMouseLeave={() => { mx.set(0); my.set(0); sc.set(1); }}
      style={{ rotateX:rotX, rotateY:rotY, scale:sc, transformStyle:"preserve-3d", cursor:"pointer", ...style }}
    >
      {children}
    </motion.div>
  );
}

/* ─── Media Review Card ─── */
function MediaCard({ item, index, onClick }) {
  const isVideo = item.mediaType === "video";
  return (
    <motion.div
      initial={{ opacity:0, y:44 }}
      whileInView={{ opacity:1, y:0 }}
      viewport={{ once:true }}
      transition={{ duration:0.72, delay: Math.min(index,5)*0.09, ease:[0.22,1,0.36,1] }}
      className="rev-card-wrap"
    >
      <TiltCard onClick={() => onClick(index)}
        style={{
          borderRadius:18, overflow:"hidden",
          background:"rgba(22,5,5,0.72)",
          border:"1px solid rgba(201,133,60,0.22)",
          boxShadow:"0 16px 48px rgba(0,0,0,0.38)",
          backdropFilter:"blur(14px)",
        }}
      >
        {/* image / video */}
        <div style={{ position:"relative", aspectRatio:"3/4", overflow:"hidden" }}>
          {isVideo ? (
            <video src={item.mediaUrl} muted playsInline
              style={{ width:"100%", height:"100%", objectFit:"cover" }} />
          ) : (
            <img src={item.mediaUrl} alt={item.userName}
              className="rev-img"
              style={{ width:"100%", height:"100%", objectFit:"cover",
                transition:"transform 1.1s cubic-bezier(.22,1,.36,1)" }} />
          )}

          {/* vignette */}
          <div style={{ position:"absolute", inset:0,
            background:"linear-gradient(to top,rgba(12,2,2,0.94) 0%,rgba(12,2,2,0.18) 50%,transparent 76%)" }} />

          {isVideo && (
            <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <motion.div whileHover={{ scale:1.14 }} style={{
                width:46, height:46, borderRadius:"50%",
                background:"rgba(240,201,122,0.93)",
                display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow:"0 4px 20px rgba(0,0,0,0.45)",
              }}>
                <Play size={16} fill="#1e0808" color="#1e0808" />
              </motion.div>
            </div>
          )}

          {/* name + stars */}
          <div style={{ position:"absolute", bottom:12, left:13, right:13 }}>
            <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:5 }}>
              <p style={{ margin:0, fontFamily:F.display, color:"#fff5dd", fontSize:"1rem",
                fontWeight:700, textShadow:"0 2px 10px rgba(0,0,0,0.65)" }}>
                {item.userName}
              </p>
              <RiVerifiedBadgeFill size={14} color="#4a90d9" />
            </div>
            <Stars n={item.rating} />
          </div>
        </div>

        {/* description */}
        {item.description && (
          <div style={{ padding:"13px 15px 15px", position:"relative" }}>
            <Quote size={15} color="rgba(201,133,60,0.28)"
              style={{ position:"absolute", top:10, left:12 }} />
            <p style={{
              margin:0, paddingLeft:22,
              fontFamily:F.body, fontSize:"0.75rem",
              color:"rgba(255,230,176,0.62)", lineHeight:1.62,
              display:"-webkit-box", WebkitLineClamp:3,
              WebkitBoxOrient:"vertical", overflow:"hidden",
            }}>
              {item.description}
            </p>
          </div>
        )}
      </TiltCard>
    </motion.div>
  );
}

/* ─── Text-only review card ─── */
function TextCard({ item, index }) {
  return (
    <motion.div
      initial={{ opacity:0, y:22 }}
      whileInView={{ opacity:1, y:0 }}
      viewport={{ once:true }}
      transition={{ duration:0.55, delay: Math.min(index,6)*0.07, ease:[0.22,1,0.36,1] }}
      style={{
        borderRadius:16,
        border:"1px solid rgba(201,133,60,0.22)",
        background:"rgba(255,255,255,0.72)",
        backdropFilter:"blur(10px)",
        padding:"18px 20px",
        boxShadow:"0 8px 28px rgba(107,26,26,0.07)",
      }}
    >
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          {/* avatar initial */}
          <div style={{
            width:32, height:32, borderRadius:"50%",
            background:"linear-gradient(135deg,#c9853c,#6b1a1a)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontFamily:F.display, fontWeight:700, fontSize:"0.9rem", color:"#ffe8b0",
            flexShrink:0,
          }}>
            {(item.userName || "R").charAt(0).toUpperCase()}
          </div>
          <div>
            <p style={{ margin:0, fontFamily:F.display, fontSize:"0.95rem", fontWeight:700, color:"#3d0a0a" }}>
              {item.userName}
            </p>
            <Stars n={item.rating} size={9} />
          </div>
        </div>
        <RiVerifiedBadgeFill size={13} color="#4a90d9" style={{ flexShrink:0 }} />
      </div>
      <p style={{ margin:0, fontFamily:F.body, color:"rgba(61,10,10,0.72)",
        lineHeight:1.65, fontSize:"0.84rem" }}>
        &ldquo;{item.description}&rdquo;
      </p>
    </motion.div>
  );
}

/* ─── Lightbox ─── */
function Lightbox({ items, index, onClose, onPrev, onNext }) {
  const item    = items[index];
  const isVideo = item?.mediaType === "video";

  useEffect(() => {
    const fn = (e) => {
      if (e.key === "Escape")      onClose();
      if (e.key === "ArrowLeft")   onPrev();
      if (e.key === "ArrowRight")  onNext();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose, onPrev, onNext]);

  if (!item) return null;

  return (
    <motion.div
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      onClick={onClose}
      style={{
        position:"fixed", inset:0, zIndex:9999,
        background:"rgba(4,0,0,0.93)", backdropFilter:"blur(18px)",
        display:"flex", alignItems:"center", justifyContent:"center",
        padding:"20px 0",
      }}
    >
      {/* prev */}
      <motion.button
        whileHover={{ scale:1.1, x:-2 }} whileTap={{ scale:0.9 }}
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        className="lb-arrow lb-arrow-l"
      >
        <ChevronLeft size={20} />
      </motion.button>

      {/* next */}
      <motion.button
        whileHover={{ scale:1.1, x:2 }} whileTap={{ scale:0.9 }}
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        className="lb-arrow lb-arrow-r"
      >
        <ChevronRight size={20} />
      </motion.button>

      {/* card */}
      <motion.div
        key={item._id}
        initial={{ scale:0.86, opacity:0, y:24 }}
        animate={{ scale:1,    opacity:1, y:0  }}
        exit={{   scale:0.92,  opacity:0, y:-12 }}
        transition={{ duration:0.38, ease:[0.22,1,0.36,1] }}
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth:480, width:"calc(100% - 32px)",
          borderRadius:22, overflow:"hidden",
          background:"#0c0101",
          boxShadow:"0 50px 120px rgba(0,0,0,0.82), 0 0 0 1px rgba(201,133,60,0.28)",
        }}
      >
        {/* gold rule */}
        <div style={{ height:2, background:"linear-gradient(to right,transparent,#c9853c 25%,#f0c97a 50%,#c9853c 75%,transparent)" }} />

        {isVideo ? (
          <video src={item.mediaUrl} controls autoPlay
            style={{ width:"100%", display:"block", maxHeight:"60vh", objectFit:"contain", background:"#000" }} />
        ) : (
          <img src={item.mediaUrl} alt={item.userName}
            style={{ width:"100%", display:"block", maxHeight:"60vh", objectFit:"contain" }} />
        )}

        <div style={{ padding:"16px 20px 20px", background:"linear-gradient(to bottom,#0c0101,#1a0505)" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:5 }}>
                <p style={{ margin:0, fontFamily:F.display, color:"#f0c97a", fontWeight:700, fontSize:"1.1rem" }}>
                  {item.userName}
                </p>
                <RiVerifiedBadgeFill size={14} color="#4a90d9" />
              </div>
              <Stars n={item.rating} size={13} />
            </div>
            <div style={{
              background:"rgba(201,133,60,0.13)", border:"1px solid rgba(240,201,122,0.25)",
              borderRadius:100, padding:"5px 12px",
              display:"flex", alignItems:"center", gap:5,
            }}>
              <Sparkles size={10} color="#f0c97a" />
              <span style={{ fontFamily:F.label, fontSize:"0.58rem", letterSpacing:"0.18em",
                textTransform:"uppercase", color:"#f0c97a", fontWeight:700 }}>
                Verified
              </span>
            </div>
          </div>
          {item.description && (
            <p style={{ margin:0, fontFamily:F.body, color:"rgba(255,232,176,0.62)",
              fontSize:"0.86rem", lineHeight:1.72 }}>
              &ldquo;{item.description}&rdquo;
            </p>
          )}
        </div>
      </motion.div>

      {/* close */}
      <motion.button
        whileHover={{ scale:1.12, rotate:90 }} whileTap={{ scale:0.88 }}
        onClick={onClose}
        style={{
          position:"absolute", top:16, right:16,
          background:"rgba(255,232,176,0.1)", border:"1px solid rgba(240,201,122,0.28)",
          color:"#ffe8b0", borderRadius:"50%", width:42, height:42,
          display:"flex", alignItems:"center", justifyContent:"center",
          cursor:"pointer", backdropFilter:"blur(8px)",
        }}
      >
        <X size={18} />
      </motion.button>

      {/* dot strip */}
      <div style={{
        position:"absolute", bottom:14, left:"50%", transform:"translateX(-50%)",
        display:"flex", gap:5, flexWrap:"wrap", justifyContent:"center",
        maxWidth:"80vw",
      }}>
        {items.map((it,i) => (
          <motion.div key={it._id}
            animate={{ width: i === index ? 20 : 6, background: i === index ? "#f0c97a" : "rgba(240,201,122,0.22)" }}
            transition={{ duration:0.3 }}
            style={{ height:6, borderRadius:999 }}
          />
        ))}
      </div>
    </motion.div>
  );
}

/* ─── Upload Modal ─── */
function UploadModal({ onClose, onSuccess }) {
  const [file,    setFile]    = useState(null);
  const [preview, setPreview] = useState(null);
  const [desc,    setDesc]    = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [done,    setDone]    = useState(false);
  const [drag,    setDrag]    = useState(false);
  const inputRef = useRef(null);

  const handleFile = (f) => { if (!f) return; setFile(f); setPreview(URL.createObjectURL(f)); setError(""); };

  const submit = async () => {
    if (!file && !desc.trim()) { setError("Add a photo/video or write something."); return; }
    setLoading(true); setError("");
    try {
      const fd = new FormData();
      if (file) fd.append("media", file);
      fd.append("description", desc.trim());
      await api.post("/submissions", fd, { headers:{ "Content-Type":"multipart/form-data" } });
      setDone(true); onSuccess?.();
    } catch (e) {
      setError(e.response?.data?.message || "Upload failed — please try again.");
    } finally { setLoading(false); }
  };

  useEffect(() => {
    const fn = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  const canSubmit = !loading && (file || desc.trim());

  return (
    <motion.div
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      onClick={onClose}
      style={{
        position:"fixed", inset:0, zIndex:9998,
        background:"rgba(4,0,0,0.88)", backdropFilter:"blur(14px)",
        display:"flex", alignItems:"center", justifyContent:"center",
        padding:16,
      }}
    >
      <motion.div
        initial={{ y:50, opacity:0, scale:0.95 }}
        animate={{ y:0,  opacity:1, scale:1    }}
        exit={{   y:30,  opacity:0, scale:0.97  }}
        transition={{ duration:0.42, ease:[0.22,1,0.36,1] }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width:"100%", maxWidth:440, borderRadius:24,
          overflow:"hidden",
          background:"linear-gradient(158deg,#fdf9f2,#f8ead8)",
          boxShadow:"0 50px 120px rgba(0,0,0,0.58), 0 0 0 1px rgba(201,133,60,0.28)",
        }}
      >
        {/* gold stripe */}
        <div style={{ height:2.5, background:"linear-gradient(to right,transparent,#c9853c 25%,#f0c97a 50%,#c9853c 75%,transparent)" }} />

        {/* header */}
        <div style={{ padding:"24px 26px 0", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <p style={{ margin:"0 0 5px", fontFamily:F.label, fontSize:"0.62rem",
              letterSpacing:"0.22em", textTransform:"uppercase", color:"#c9853c", fontWeight:700 }}>
              Share Your Look
            </p>
            <h3 style={{ margin:0, fontFamily:F.display, fontSize:"1.65rem", fontWeight:700, color:"#2a0505", lineHeight:1.05 }}>
              Upload Your Review
            </h3>
          </div>
          <motion.button
            whileHover={{ rotate:90, scale:1.1 }} whileTap={{ scale:0.9 }}
            onClick={onClose}
            style={{ background:"rgba(107,26,26,0.09)", border:"1px solid rgba(201,133,60,0.2)",
              borderRadius:"50%", width:34, height:34, display:"flex", alignItems:"center",
              justifyContent:"center", cursor:"pointer", color:"#6b1a1a", marginTop:2, flexShrink:0 }}
          >
            <X size={16} />
          </motion.button>
        </div>

        <div style={{ padding:"20px 26px 26px" }}>
          <AnimatePresence mode="wait">
            {done ? (
              <motion.div key="done"
                initial={{ opacity:0, scale:0.94 }} animate={{ opacity:1, scale:1 }}
                style={{ textAlign:"center", padding:"10px 0" }}
              >
                <motion.div
                  initial={{ scale:0 }} animate={{ scale:1 }}
                  transition={{ type:"spring", stiffness:260, damping:18, delay:0.1 }}
                  style={{ fontSize:"3rem", marginBottom:14 }}
                >✨</motion.div>
                <p style={{ margin:"0 0 8px", fontFamily:F.display, fontSize:"1.5rem", fontWeight:700, color:"#2a0505" }}>
                  Thank you!
                </p>
                <p style={{ margin:"0 auto 22px", maxWidth:290, fontFamily:F.body,
                  color:"rgba(90,42,26,0.68)", fontSize:"0.86rem", lineHeight:1.65 }}>
                  Your submission is under review and will appear once approved by our team.
                </p>
                <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                  onClick={onClose}
                  style={{ fontFamily:F.label, fontSize:"0.64rem", letterSpacing:"0.2em",
                    textTransform:"uppercase", fontWeight:700,
                    background:"linear-gradient(130deg,#6b1a1a,#a03030)", color:"#ffe8b0",
                    border:"none", padding:"11px 30px", borderRadius:100, cursor:"pointer",
                    boxShadow:"0 4px 18px rgba(107,26,26,0.38)" }}
                >
                  Close
                </motion.button>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity:0 }} animate={{ opacity:1 }}>
                {/* drop zone */}
                <motion.div
                  animate={{ borderColor: drag ? "rgba(201,133,60,0.85)" : file ? "rgba(201,133,60,0.6)" : "rgba(201,133,60,0.3)" }}
                  onDrop={(e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
                  onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                  onDragLeave={() => setDrag(false)}
                  onClick={() => inputRef.current?.click()}
                  style={{
                    border:"2px dashed rgba(201,133,60,0.3)", borderRadius:16,
                    background: drag ? "rgba(201,133,60,0.07)" : file ? "rgba(201,133,60,0.04)" : "rgba(201,133,60,0.02)",
                    minHeight:160, display:"flex", flexDirection:"column",
                    alignItems:"center", justifyContent:"center",
                    cursor:"pointer", overflow:"hidden", position:"relative",
                    transition:"background .25s",
                  }}
                >
                  <input ref={inputRef} type="file" accept="image/*,video/*"
                    style={{ display:"none" }}
                    onChange={(e) => handleFile(e.target.files[0])} />

                  <AnimatePresence mode="wait">
                    {preview ? (
                      <motion.div key="preview"
                        initial={{ opacity:0 }} animate={{ opacity:1 }}
                        style={{ position:"absolute", inset:0 }}
                      >
                        {file?.type?.startsWith("video") ? (
                          <video src={preview} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                        ) : (
                          <img src={preview} alt="preview" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                        )}
                        <div style={{ position:"absolute", inset:0, background:"rgba(12,2,2,0.38)",
                          display:"flex", alignItems:"center", justifyContent:"center" }}>
                          <span style={{ fontFamily:F.label, fontSize:"0.6rem", letterSpacing:"0.2em",
                            textTransform:"uppercase", color:"#ffe8b0", fontWeight:700,
                            padding:"6px 14px", borderRadius:100,
                            background:"rgba(12,2,2,0.58)", border:"1px solid rgba(240,201,122,0.4)",
                            backdropFilter:"blur(6px)" }}>
                            Tap to change
                          </span>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div key="empty" initial={{ opacity:0 }} animate={{ opacity:1 }}
                        style={{ textAlign:"center", padding:"0 20px" }}
                      >
                        <motion.div
                          animate={{ y:[0,-7,0] }}
                          transition={{ duration:2.6, repeat:Infinity, ease:"easeInOut" }}
                        >
                          <Camera size={28} color="rgba(201,133,60,0.5)" />
                        </motion.div>
                        <p style={{ margin:"10px 0 3px", fontFamily:F.label, fontSize:"0.63rem",
                          letterSpacing:"0.2em", textTransform:"uppercase",
                          color:"rgba(90,42,26,0.52)", fontWeight:700 }}>
                          Add photo / video (optional)
                        </p>
                        <p style={{ margin:0, fontFamily:F.body, fontSize:"0.7rem", color:"rgba(90,42,26,0.36)" }}>
                          or click to browse · up to 200 MB
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* textarea */}
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Share your experience with RUVA…"
                  maxLength={400}
                  rows={3}
                  className="review-textarea"
                  style={{
                    width:"100%", marginTop:14, padding:"12px 15px", borderRadius:12,
                    border:"1px solid rgba(201,133,60,0.28)",
                    background:"rgba(255,252,246,0.75)",
                    fontFamily:F.body, fontSize:"0.85rem", color:"#2a0505",
                    outline:"none", boxSizing:"border-box", lineHeight:1.6, resize:"vertical",
                    transition:"border-color .25s, box-shadow .25s",
                  }}
                />
                <div style={{ textAlign:"right", marginTop:4 }}>
                  <span style={{ fontFamily:F.label, fontSize:"0.56rem",
                    color:"rgba(90,42,26,0.38)", letterSpacing:"0.1em" }}>
                    {desc.length}/400
                  </span>
                </div>

                {error && (
                  <motion.p initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }}
                    style={{ color:"#a03030", fontSize:"0.78rem", marginTop:6, fontFamily:F.body }}>
                    {error}
                  </motion.p>
                )}

                <motion.button
                  whileHover={canSubmit ? { scale:1.02 } : {}}
                  whileTap={canSubmit ? { scale:0.97 } : {}}
                  onClick={submit}
                  disabled={!canSubmit}
                  style={{
                    marginTop:16, width:"100%", padding:"13px 0", borderRadius:100,
                    fontFamily:F.label, fontSize:"0.66rem", letterSpacing:"0.2em",
                    textTransform:"uppercase", fontWeight:700,
                    background: canSubmit ? "linear-gradient(130deg,#6b1a1a,#a03030)" : "rgba(107,26,26,0.24)",
                    color: canSubmit ? "#ffe8b0" : "rgba(255,232,176,0.4)",
                    border:"none", cursor: canSubmit ? "pointer" : "not-allowed",
                    display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                    boxShadow: canSubmit ? "0 6px 22px rgba(107,26,26,0.42)" : "none",
                    transition:"all .3s",
                  }}
                >
                  {loading
                    ? <><span className="upload-spin" />Uploading…</>
                    : <><Upload size={13} />Submit Review</>
                  }
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════
   MAIN REVIEWS COMPONENT
═══════════════════════════════════════ */
export default function Reviews() {
  const { user }  = useAuth();
  const router    = useRouter();
  const [reviews,       setReviews]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [showUpload,    setShowUpload]    = useState(false);
  const [canL, setCanL] = useState(false);
  const [canR, setCanR] = useState(true);
  const scrollRef = useRef(null);

  /* fetch */
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [r1, r2] = await Promise.allSettled([
          api.get("/reviews"),
          api.get("/submissions/approved"),
        ]);
        const admin = r1.status === "fulfilled" && Array.isArray(r1.value.data)
          ? r1.value.data.map(normalise) : [];
        const subs  = r2.status === "fulfilled" && Array.isArray(r2.value.data)
          ? r2.value.data.map(normalise) : [];
        const merged = [...subs, ...admin]
          .sort((a,b) => new Date(b.createdAt||0) - new Date(a.createdAt||0));
        if (alive) setReviews(merged);
      } catch { if (alive) setReviews([]); }
      finally  { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, []);

  const mediaReviews = reviews.filter(r => r.mediaUrl);
  const textReviews  = reviews.filter(r => !r.mediaUrl && r.description);

  /* scroll arrows */
  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanL(el.scrollLeft > 10);
    setCanR(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive:true });
    updateArrows();
    return () => el.removeEventListener("scroll", updateArrows);
  }, [updateArrows, mediaReviews.length]);

  const scrollBy = (dir) => scrollRef.current?.scrollBy({ left: dir * 256, behavior:"smooth" });

  const openLightbox  = (i) => setLightboxIndex(i);
  const closeLightbox = () => setLightboxIndex(null);
  const prevLightbox  = () => setLightboxIndex(i => (i - 1 + mediaReviews.length) % mediaReviews.length);
  const nextLightbox  = () => setLightboxIndex(i => (i + 1) % mediaReviews.length);

  const handleShare = () => { if (!user) { router.push("/login"); return; } setShowUpload(true); };

  /* skeleton */
  const Skeleton = () => (
    <div className="rev-card-wrap" style={{ borderRadius:18, overflow:"hidden",
      background:"rgba(201,133,60,0.06)", border:"1px solid rgba(201,133,60,0.1)",
      aspectRatio:"3/4", animation:"rev-shimmer 1.8s ease-in-out infinite" }} />
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Lora:ital,wght@0,400;1,400&display=swap');

        /* ── shimmer animation ── */
        @keyframes shimmer-text {
          0%   { background-position:200% center; }
          100% { background-position:-200% center; }
        }
        /* ── skeleton pulse ── */
        @keyframes rev-shimmer {
          0%,100% { opacity:.55; }
          50%      { opacity:.25; }
        }
        /* ── spin ── */
        @keyframes upload-spin { to { transform:rotate(360deg); } }
        .upload-spin {
          display:inline-block; width:13px; height:13px;
          border:2px solid rgba(255,232,176,0.3);
          border-top-color:#ffe8b0; border-radius:50%;
          animation:upload-spin .7s linear infinite;
        }
        /* ── hide scrollbar ── */
        .rev-scroll::-webkit-scrollbar { display:none; }
        .rev-scroll { scrollbar-width:none; -ms-overflow-style:none; }

        /* ── hover zoom on img ── */
        .rev-img { transition:transform 1.1s cubic-bezier(.22,1,.36,1); }
        .rev-card-wrap:hover .rev-img { transform:scale(1.07); }

        /* ── float ── */
        @keyframes float-orb {
          0%,100% { transform:translateY(0) scale(1); }
          50%      { transform:translateY(-20px) scale(1.08); }
        }

        /* ── textarea focus ── */
        .review-textarea:focus {
          border-color:rgba(201,133,60,0.65) !important;
          box-shadow:0 0 0 3px rgba(201,133,60,0.12) !important;
        }

        /* ── lightbox arrows ── */
        .lb-arrow {
          position:absolute; top:50%; transform:translateY(-50%); z-index:10;
          background:rgba(20,4,4,0.72); border:1px solid rgba(240,201,122,0.28);
          color:#f0c97a; width:44px; height:44px; border-radius:50%;
          display:flex; align-items:center; justify-content:center;
          cursor:pointer; backdrop-filter:blur(10px);
          box-shadow:0 4px 18px rgba(0,0,0,0.5);
        }
        .lb-arrow-l { left:12px; }
        .lb-arrow-r { right:12px; }
        @media (max-width:540px) {
          .lb-arrow { width:36px; height:36px; }
          .lb-arrow-l { left:6px; }
          .lb-arrow-r { right:6px; }
        }

        /* ── card width: responsive via CSS ── */
        .rev-card-wrap { width:220px; flex-shrink:0; }
        @media (max-width:480px) { .rev-card-wrap { width:175px; } }

        /* ── text-grid responsive ── */
        .text-grid {
          display:grid;
          grid-template-columns:repeat(auto-fill, minmax(260px,1fr));
          gap:14px;
        }
        @media (max-width:480px) {
          .text-grid { grid-template-columns:1fr; }
        }

        /* ── section padding responsive ── */
        .rev-section {
          padding:72px 0 80px;
          position:relative; overflow:hidden;
        }
        @media (max-width:640px) { .rev-section { padding:52px 0 60px; } }

        /* ── header padding ── */
        .rev-header-wrap {
          max-width:1200px; margin:0 auto;
          padding:0 20px;
        }
        @media (max-width:480px) { .rev-header-wrap { padding:0 16px; } }

        /* ── header flex ── */
        .rev-header-inner {
          display:flex; align-items:flex-end;
          justify-content:space-between; flex-wrap:wrap;
          gap:20px; margin-bottom:44px;
        }
        @media (max-width:540px) {
          .rev-header-inner { flex-direction:column; align-items:flex-start; margin-bottom:28px; }
        }

        /* ── scroll track padding ── */
        .rev-track {
          display:flex; gap:16px; overflow-x:auto;
          padding:12px 24px 20px;
          scroll-snap-type:x mandatory;
          -webkit-overflow-scrolling:touch;
        }
        @media (min-width:641px) { .rev-track { padding:14px 60px 24px; } }
      `}</style>

      <section className="rev-section"
        style={{ background:"linear-gradient(168deg,#fdf8f0 0%,#faebd5 55%,#fff8ee 100%)" }}
      >
        {/* ── ambient glows ── */}
        {/* {[
          { w:300, h:300, top:"-70px",   left:"-70px",  c:"rgba(201,133,60,0.1)",  dur:7 },
          { w:250, h:250, bottom:"-50px", right:"-40px", c:"rgba(107,26,26,0.09)", dur:9 },
          { w:160, h:160, top:"45%",      left:"14%",    c:"rgba(201,133,60,0.06)", dur:11 },
        ].map((o,i) => (
          <div key={i} style={{
            position:"absolute", width:o.w, height:o.h, borderRadius:"50%",
            background:o.c, filter:"blur(68px)", pointerEvents:"none",
            top:o.top, left:o.left, bottom:o.bottom, right:o.right,
            animation:`float-orb ${o.dur}s ease-in-out infinite`,
            animationDelay:`${i*1.1}s`,
          }} />
        ))} */}

        {/* silk crosshatch */}
        <div style={{
          position:"absolute", inset:0, pointerEvents:"none", opacity:0.65,
          backgroundImage:[
            "repeating-linear-gradient(-52deg,rgba(176,118,32,0.07) 0,rgba(176,118,32,0.07) 1px,transparent 1px,transparent 18px)",
            "repeating-linear-gradient(38deg,rgba(176,118,32,0.05) 0,rgba(176,118,32,0.05) 1px,transparent 1px,transparent 18px)",
          ].join(","),
        }} />

        {/* ═══ HEADER ═══ */}
        <div className="rev-header-wrap">
          <motion.div
            className="rev-header-inner"
            initial={{ opacity:0, y:36 }} whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }} transition={{ duration:0.78, ease:[0.22,1,0.36,1] }}
          >
            <div>
              {/* eyebrow */}
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                <span style={{ height:1, width:28, background:"rgba(107,26,26,0.3)" }} />
                <span style={{
                  fontFamily:F.label, fontSize:"0.63rem", letterSpacing:"0.24em",
                  textTransform:"uppercase", color:"rgba(107,26,26,0.65)", fontWeight:700,
                  display:"flex", alignItems:"center", gap:6,
                }}>
                  <Sparkles size={10} />From Our Community
                </span>
                <span style={{ height:1, width:28, background:"rgba(107,26,26,0.3)" }} />
              </div>

              {/* headline */}
              <h2 style={{
                margin:"0 0 12px", lineHeight:1.05,
                fontFamily:F.display, fontWeight:700, color:"#2a0505",
                fontSize:"clamp(2rem,5vw,3.2rem)",
              }}>
                Happy Customers,{" "}
                <em style={{
                  fontStyle:"italic",
                  background:"linear-gradient(110deg,#c9853c 0%,#f0c97a 42%,#c9853c 80%)",
                  backgroundSize:"220%",
                  WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
                  backgroundClip:"text",
                  animation:"shimmer-text 3.4s linear infinite",
                }}>
                  Genuine Stories
                </em>
              </h2>

              <p style={{ margin:0, fontFamily:F.body, fontSize:"0.88rem",
                color:"rgba(61,10,10,0.58)", lineHeight:1.7, maxWidth:480 }}>
                Real photos and reviews from women who wear RUVA — unfiltered, uncurated.
              </p>
            </div>

            {/* CTA */}
            <motion.button
              whileHover={{ scale:1.04, y:-2 }} whileTap={{ scale:0.97 }}
              onClick={handleShare}
              style={{
                fontFamily:F.label, fontSize:"0.63rem", letterSpacing:"0.2em",
                textTransform:"uppercase", fontWeight:700,
                display:"flex", alignItems:"center", gap:8,
                padding:"11px 22px", borderRadius:100, cursor:"pointer",
                background:"linear-gradient(130deg,#6b1a1a,#a03030)",
                border:"none", color:"#ffe8b0",
                boxShadow:"0 8px 24px rgba(107,26,26,0.32)",
                whiteSpace:"nowrap",
              }}
            >
              <Camera size={14} />
              Share Your Look
            </motion.button>
          </motion.div>
        </div>

        {/* ═══ PHOTO / VIDEO STRIP ═══ */}
        {(loading || mediaReviews.length > 0) && (
          <>
            <div className="rev-header-wrap" style={{ marginBottom:10 }}>
              <p style={{ margin:0, fontFamily:F.label, fontSize:"0.6rem", letterSpacing:"0.22em",
                textTransform:"uppercase", color:"rgba(107,26,26,0.6)", fontWeight:700 }}>
                Photo &amp; Video Reviews
              </p>
            </div>

            <div style={{ position:"relative" }}>
              {/* left arrow */}
              <AnimatePresence>
                {canL && (
                  <motion.button
                    key="al" initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-8 }}
                    whileHover={{ scale:1.1, x:-2 }} whileTap={{ scale:0.92 }}
                    onClick={() => scrollBy(-1)}
                    style={{
                      position:"absolute", left:10, top:"42%", transform:"translateY(-50%)", zIndex:10,
                      background:"rgba(255,255,255,0.88)", border:"1px solid rgba(201,133,60,0.32)",
                      color:"#8d4b1a", width:40, height:40, borderRadius:"50%",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      cursor:"pointer", boxShadow:"0 4px 14px rgba(107,26,26,0.18)",
                    }}
                  >
                    <ChevronLeft size={18} />
                  </motion.button>
                )}
              </AnimatePresence>

              {/* right arrow */}
              <AnimatePresence>
                {canR && (
                  <motion.button
                    key="ar" initial={{ opacity:0, x:8 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:8 }}
                    whileHover={{ scale:1.1, x:2 }} whileTap={{ scale:0.92 }}
                    onClick={() => scrollBy(1)}
                    style={{
                      position:"absolute", right:10, top:"42%", transform:"translateY(-50%)", zIndex:10,
                      background:"rgba(255,255,255,0.88)", border:"1px solid rgba(201,133,60,0.32)",
                      color:"#8d4b1a", width:40, height:40, borderRadius:"50%",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      cursor:"pointer", boxShadow:"0 4px 14px rgba(107,26,26,0.18)",
                    }}
                  >
                    <ChevronRight size={18} />
                  </motion.button>
                )}
              </AnimatePresence>

              {/* left fade */}
              <div style={{ position:"absolute", left:0, top:0, bottom:0, width:48,
                pointerEvents:"none", zIndex:5,
                background:"linear-gradient(to right,rgba(253,248,240,0.92),transparent)" }} />
              {/* right fade */}
              <div style={{ position:"absolute", right:0, top:0, bottom:0, width:48,
                pointerEvents:"none", zIndex:5,
                background:"linear-gradient(to left,rgba(253,248,240,0.92),transparent)" }} />

              {/* scroll track */}
              <div ref={scrollRef} className="rev-scroll rev-track">
                {loading
                  ? Array.from({ length:5 }).map((_,i) => <Skeleton key={i} />)
                  : mediaReviews.map((item,i) => (
                      <MediaCard key={item._id} item={item} index={i} onClick={openLightbox} />
                    ))
                }
              </div>
            </div>

            {/* progress bar */}
            {!loading && mediaReviews.length > 1 && (
              <div className="rev-header-wrap" style={{ marginTop:8 }}>
                <div style={{ height:2, background:"rgba(107,26,26,0.1)", borderRadius:999, overflow:"hidden" }}>
                  <motion.div
                    style={{ height:"100%", borderRadius:999,
                      background:"linear-gradient(to right,#8d3c1d,#c9853c)",
                      boxShadow:"0 0 8px rgba(141,60,29,0.3)" }}
                    animate={{
                      width: lightboxIndex !== null
                        ? `${((lightboxIndex + 1) / mediaReviews.length) * 100}%`
                        : `${(1 / mediaReviews.length) * 100}%`
                    }}
                    transition={{ duration:0.38 }}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* ═══ TEXT REVIEWS ═══ */}
        {!loading && textReviews.length > 0 && (
          <div className="rev-header-wrap" style={{ marginTop:36 }}>
            <p style={{ margin:"0 0 14px", fontFamily:F.label, fontSize:"0.6rem", letterSpacing:"0.22em",
              textTransform:"uppercase", color:"rgba(107,26,26,0.6)", fontWeight:700 }}>
              Written Reviews
            </p>
            <div className="text-grid">
              {textReviews.map((item,i) => (
                <TextCard key={item._id} item={item} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* ═══ EMPTY STATE ═══ */}
        {!loading && mediaReviews.length === 0 && textReviews.length === 0 && (
          <div className="rev-header-wrap">
            <motion.div
              initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
              style={{
                borderRadius:18, border:"1px dashed rgba(201,133,60,0.3)",
                background:"rgba(255,255,255,0.6)", padding:"36px 20px", textAlign:"center",
              }}
            >
              <p style={{ margin:"0 0 8px", fontFamily:F.display, color:"#3d0a0a",
                fontSize:"1.3rem", fontWeight:700 }}>
                No reviews published yet
              </p>
              <p style={{ margin:0, fontFamily:F.body, color:"rgba(61,10,10,0.52)", fontSize:"0.84rem" }}>
                Be the first to share your RUVA look.
              </p>
            </motion.div>
          </div>
        )}

        {/* ── disclaimer ── */}
        <motion.p
          initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }}
          transition={{ delay:0.3 }}
          style={{ margin:"32px 0 0", textAlign:"center",
            fontFamily:F.body, color:"rgba(61,10,10,0.38)", fontSize:"0.72rem" }}
        >
          Reviews are community-shared and moderated by the RUVA team.
        </motion.p>
      </section>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            items={mediaReviews}
            index={lightboxIndex}
            onClose={closeLightbox}
            onPrev={prevLightbox}
            onNext={nextLightbox}
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