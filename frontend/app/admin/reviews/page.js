'use client';
import { useState, useEffect, useRef } from 'react';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X, Star, Upload, Image } from 'lucide-react';

const EMPTY = { customerName:'', quote:'', rating:5, location:'', order:0 };

function StarPicker({ value, onChange }) {
  return (
    <div style={{ display:'flex', gap:4 }}>
      {[1,2,3,4,5].map(n => (
        <button key={n} type="button" onClick={() => onChange(n)}
          style={{ background:'transparent', border:'none', cursor:'pointer', padding:2 }}>
          <Star size={22} fill={n <= value ? '#f59e0b' : 'none'} stroke={n <= value ? '#f59e0b' : '#d1d5db'} />
        </button>
      ))}
    </div>
  );
}

function Modal({ review, onClose, onSaved }) {
  const [form, setForm] = useState(review ? {
    customerName: review.customerName,
    quote: review.quote,
    rating: review.rating,
    location: review.location || '',
    order: review.order ?? 0,
  } : { ...EMPTY });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(review?.mediaUrl || null);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);
  const isEdit = !!review?._id;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleFile = e => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async e => {
    e.preventDefault();
    if (!form.customerName.trim() || !form.quote.trim()) return toast.error('Name and quote are required.');
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('media', file);
      if (isEdit) {
        await api.put('/reviews/' + review._id, fd);
        toast.success('Review updated');
      } else {
        await api.post('/reviews', fd);
        toast.success('Review created');
      }
      onSaved();
    } catch(err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.55)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:16, backdropFilter:'blur(4px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ width:'100%', maxWidth:520, background:'#fff', borderRadius:20, boxShadow:'0 24px 64px rgba(0,0,0,.18)', overflow:'hidden' }}>
        <div style={{ padding:'20px 24px 0', display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <h2 style={{ margin:0, fontSize:'1.15rem', fontWeight:700, color:'#111' }}>{isEdit ? 'Edit Review' : 'Add Review'}</h2>
          <button onClick={onClose} style={{ background:'transparent', border:'none', cursor:'pointer', color:'#6b7280' }}><X size={20} /></button>
        </div>

        <form onSubmit={submit} style={{ padding:'0 24px 24px', display:'flex', flexDirection:'column', gap:14 }}>
          {/* Media */}
          <div>
            <label style={{ display:'block', fontSize:'0.75rem', fontWeight:600, color:'#374151', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>Photo / Video</label>
            <div onClick={() => inputRef.current?.click()}
              style={{ border:'2px dashed #d1d5db', borderRadius:12, minHeight:120, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', overflow:'hidden', background:'#f9fafb', position:'relative' }}>
              {preview
                ? (file?.type?.startsWith('video') || review?.mediaType === 'video')
                  ? <video src={preview} style={{ width:'100%', maxHeight:180, objectFit:'cover' }} />
                  : <img src={preview} alt="preview" style={{ width:'100%', maxHeight:180, objectFit:'cover' }} />
                : <div style={{ textAlign:'center', color:'#9ca3af' }}><Image size={28} style={{ marginBottom:6 }} /><p style={{ margin:0, fontSize:'0.8rem' }}>Click to upload</p></div>
              }
            </div>
            <input ref={inputRef} type="file" accept="image/*,video/*" style={{ display:'none' }} onChange={handleFile} />
          </div>

          {[
            { label:'Customer Name', key:'customerName', placeholder:'e.g. Priya S.' },
            { label:'Location', key:'location', placeholder:'e.g. Mumbai (optional)' },
          ].map(f => (
            <div key={f.key}>
              <label style={{ display:'block', fontSize:'0.75rem', fontWeight:600, color:'#374151', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>{f.label}</label>
              <input value={form[f.key]} onChange={e => set(f.key, e.target.value)} placeholder={f.placeholder}
                style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'1px solid #d1d5db', fontSize:'0.9rem', outline:'none', boxSizing:'border-box' }} />
            </div>
          ))}

          <div>
            <label style={{ display:'block', fontSize:'0.75rem', fontWeight:600, color:'#374151', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>Review Quote</label>
            <textarea value={form.quote} onChange={e => set('quote', e.target.value)} rows={3} placeholder="What did the customer say?"
              style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'1px solid #d1d5db', fontSize:'0.9rem', outline:'none', resize:'vertical', boxSizing:'border-box' }} />
          </div>

          <div style={{ display:'flex', gap:16, alignItems:'center', flexWrap:'wrap' }}>
            <div>
              <label style={{ display:'block', fontSize:'0.75rem', fontWeight:600, color:'#374151', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>Rating</label>
              <StarPicker value={form.rating} onChange={v => set('rating', v)} />
            </div>
            <div style={{ flex:1, minWidth:100 }}>
              <label style={{ display:'block', fontSize:'0.75rem', fontWeight:600, color:'#374151', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>Display Order</label>
              <input type="number" value={form.order} onChange={e => set('order', Number(e.target.value))} min={0}
                style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'1px solid #d1d5db', fontSize:'0.9rem', outline:'none', boxSizing:'border-box' }} />
            </div>
          </div>

          <button type="submit" disabled={saving}
            style={{ marginTop:6, padding:'11px', borderRadius:10, background: saving ? '#9ca3af' : '#1d4ed8', color:'#fff', fontWeight:700, fontSize:'0.9rem', border:'none', cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Review'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'new' | review object

  const load = () => {
    setLoading(true);
    api.get('/reviews').then(({ data }) => setReviews(data)).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this review?')) return;
    try {
      await api.delete('/reviews/' + id);
      toast.success('Deleted');
      load();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ margin:0, fontSize:'1.5rem', fontWeight:800, color:'#111' }}>Reviews</h1>
          <p style={{ margin:'4px 0 0', color:'#6b7280', fontSize:'0.875rem' }}>Manage the homepage review wall — add, edit, or remove reviews.</p>
        </div>
        <button onClick={() => setModal('new')}
          style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 20px', borderRadius:10, background:'#1d4ed8', color:'#fff', fontWeight:700, border:'none', cursor:'pointer', fontSize:'0.875rem' }}>
          <Plus size={16} /> Add Review
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:60, color:'#6b7280' }}>Loading…</div>
      ) : reviews.length === 0 ? (
        <div style={{ textAlign:'center', padding:60, background:'#f9fafb', borderRadius:16, border:'1px dashed #d1d5db' }}>
          <Star size={36} color="#d1d5db" style={{ marginBottom:12 }} />
          <p style={{ margin:0, color:'#9ca3af', fontWeight:600 }}>No reviews yet</p>
          <p style={{ margin:'6px 0 0', color:'#d1d5db', fontSize:'0.8rem' }}>Click "Add Review" to create the first one.</p>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:16 }}>
          {reviews.map(r => (
            <div key={r._id} style={{ background:'#fff', borderRadius:16, border:'1px solid #e5e7eb', boxShadow:'0 2px 8px rgba(0,0,0,.05)', overflow:'hidden' }}>
              {r.mediaUrl && (
                r.mediaType === 'video'
                  ? <video src={r.mediaUrl} style={{ width:'100%', height:180, objectFit:'cover' }} />
                  : <img src={r.mediaUrl} alt={r.customerName} style={{ width:'100%', height:180, objectFit:'cover' }} />
              )}
              <div style={{ padding:16 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                  <div>
                    <p style={{ margin:0, fontWeight:700, fontSize:'0.95rem', color:'#111' }}>{r.customerName}</p>
                    {r.location && <p style={{ margin:0, fontSize:'0.75rem', color:'#9ca3af' }}>{r.location}</p>}
                  </div>
                  <div style={{ display:'flex', gap:2 }}>
                    {[1,2,3,4,5].map(n => <Star key={n} size={13} fill={n <= r.rating ? '#f59e0b' : 'none'} stroke={n <= r.rating ? '#f59e0b' : '#d1d5db'} />)}
                  </div>
                </div>
                <p style={{ margin:'0 0 14px', fontSize:'0.85rem', color:'#374151', lineHeight:1.55, display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                  &ldquo;{r.quote}&rdquo;
                </p>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={() => setModal(r)}
                    style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'8px', borderRadius:8, background:'#eff6ff', color:'#1d4ed8', border:'1px solid #bfdbfe', fontWeight:600, fontSize:'0.8rem', cursor:'pointer' }}>
                    <Pencil size={13} /> Edit
                  </button>
                  <button onClick={() => handleDelete(r._id)}
                    style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'8px', borderRadius:8, background:'#fef2f2', color:'#dc2626', border:'1px solid #fecaca', fontWeight:600, fontSize:'0.8rem', cursor:'pointer' }}>
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal
          review={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); }}
        />
      )}
    </div>
  );
}
