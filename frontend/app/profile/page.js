"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import api from "@/utils/api";
import toast from "react-hot-toast";
import Link from "next/link";
import { LogOut, ShoppingBag, User, Settings, Package, X, AlertCircle, ChevronRight, Save } from "lucide-react";

const CG = { fontFamily:"'Cormorant Garamond',Georgia,serif" };
const LB = { fontFamily:"'Cormorant Garamond',Georgia,serif",textTransform:"uppercase",letterSpacing:"0.2em",fontSize:"0.65rem",fontWeight:700 };
const fd = { hidden:{opacity:0,y:24},show:(i=0)=>({opacity:1,y:0,transition:{duration:0.65,delay:i*0.08,ease:[0.22,1,0.36,1]}}) };
const SC = {pending:"#f59e0b",confirmed:"#8b5cf6",packed:"#3b82f6",shipped:"#06b6d4",delivered:"#10b981",cancelled:"#ef4444"};
const SB = {pending:"rgba(245,158,11,.1)",confirmed:"rgba(139,92,246,.1)",packed:"rgba(59,130,246,.1)",shipped:"rgba(6,182,212,.1)",delivered:"rgba(16,185,129,.1)",cancelled:"rgba(239,68,68,.1)"};

function Spin(){ return <span style={{width:16,height:16,border:"2px solid rgba(240,201,122,.3)",borderTopColor:"#f0c97a",borderRadius:"50%",display:"inline-block",animation:"spin .7s linear infinite"}}/>; }

function Inp({label,value,onChange,type="text"}){
  return (
    <div>
      <p style={{...LB,color:"rgba(255,232,176,.4)",marginBottom:6}}>{label}</p>
      <input type={type} value={value} onChange={onChange} style={{width:"100%",padding:"11px 14px",borderRadius:10,border:"1px solid rgba(201,133,60,.3)",background:"rgba(255,245,220,.06)",color:"#fff5dd",...CG,fontSize:"0.9rem",outline:"none",boxSizing:"border-box"}}/>
    </div>
  );
}

function OCard({o,onCancel,onRetry,retrying}){
  const can = ["pending","confirmed","packed"].includes(o.status);
  const canRetry = o.status === "pending" && o.paymentStatus === "pending";
  const c = SC[o.status]||"#888"; const b = SB[o.status]||"rgba(128,128,128,.1)";
  return (
    <div style={{borderRadius:16,border:"1px solid rgba(201,133,60,.2)",background:"rgba(255,245,220,.04)",padding:"16px 20px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8,marginBottom:12}}>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <span style={{...CG,fontSize:"0.9rem",fontWeight:700,color:"#fff5dd"}}>#{o._id.slice(-8)}</span>
          <span style={{fontSize:"0.7rem",color:"rgba(255,232,176,.4)"}}>{new Date(o.createdAt).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{...LB,padding:"4px 12px",borderRadius:100,background:b,color:c,border:"1px solid "+c+"44"}}>{o.status}</span>
          <span style={{...CG,color:"#f0c97a",fontWeight:700}}>Rs.{o.totalAmount?.toLocaleString()}</span>
        </div>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:can?12:0}}>
        {o.items?.map((it,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:8,background:"rgba(255,245,220,.05)",padding:"6px 10px",borderRadius:10,border:"1px solid rgba(201,133,60,.12)"}}>
            {it.product?.images?.[0] && <img src={it.product.images[0].url||it.product.images[0]} style={{width:32,height:32,borderRadius:6,objectFit:"cover"}} alt=""/>}
            <div>
              <p style={{...CG,fontSize:"0.78rem",color:"#fff5dd",margin:0,fontWeight:600}}>{it.product?.name||"Product"}</p>
              <p style={{fontSize:"0.65rem",color:"rgba(255,232,176,.4)",margin:0}}>Qty: {it.qty}{it.size?" · "+it.size:""}</p>
            </div>
          </div>
        ))}
      </div>
      {(can || canRetry) && (
        <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
          {canRetry && (
            <button
              onClick={()=>onRetry(o)}
              disabled={retrying}
              style={{...LB,padding:"8px 18px",borderRadius:100,background:"linear-gradient(130deg,rgba(22,163,74,.25),rgba(34,197,94,.18))",color:"#86efac",border:"1px solid rgba(74,222,128,.55)",cursor:retrying?"not-allowed":"pointer",boxShadow:"0 0 0 1px rgba(34,197,94,.2) inset"}}
            >
              {retrying ? "Retrying..." : "Retry Payment"}
            </button>
          )}
          {can && <button onClick={()=>onCancel(o._id)} style={{...LB,padding:"6px 16px",borderRadius:100,background:"rgba(239,68,68,.1)",color:"#f87171",border:"1px solid rgba(239,68,68,.3)",cursor:"pointer"}}>Cancel</button>}
        </div>
      )}
    </div>
  );
}

export default function ProfilePage(){
  const {user,logout,loading} = useAuth();
  const {cartItems} = useCart();
  const router = useRouter();
  const [tab,setTab] = useState("overview");
  const [orders,setOrders] = useState([]);
  const [ol,setOl] = useState(false);
  const [cid,setCid] = useState(null);
  const [cr,setCr] = useState("");
  const [cc,setCc] = useState(false);
  const [nm,setNm] = useState("");
  const [ph,setPh] = useState("");
  const [cp,setCp] = useState("");
  const [np,setNp] = useState("");
  const [sv,setSv] = useState(false);
  const [retryingOrderId,setRetryingOrderId] = useState(null);
  const [razorpayLoaded,setRazorpayLoaded] = useState(false);
  const [rzKey,setRzKey] = useState(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "");
  const [orderFilter,setOrderFilter] = useState("all");

  useEffect(()=>{if(!loading&&!user)router.replace("/login");},[user,loading,router]);
  useEffect(()=>{
    if(!user) return;
    const timer = setTimeout(() => {
      setNm(user.name||"");
      setPh(user.phone||"");
    }, 0);
    return () => clearTimeout(timer);
  },[user]);
  useEffect(()=>{
    if(tab==="orders"&&user?.token&&orders.length===0){
      const timer = setTimeout(() => setOl(true), 0);
      api.get("/orders/my")
        .then(({data})=>setOrders(Array.isArray(data)?data:[]))
        .catch(()=>setOrders([]))
        .finally(()=>setOl(false));
      return () => clearTimeout(timer);
    }
  },[tab,user,orders.length]);

  useEffect(() => {
    if (!user?.token || rzKey) return;
    api.get("/orders/razorpay-key")
      .then(({ data }) => {
        if (data?.key) setRzKey(data.key);
      })
      .catch(() => {});
  }, [user, rzKey]);

  const cancel = async()=>{
    if(!cr.trim())return toast.error("Please give a reason.");
    setCc(true);
    try{
      await api.post("/orders/"+cid+"/cancel",{reason:cr});
      toast.success("Order cancelled");
      setOrders(prev=>prev.map(o=>o._id===cid?{...o,status:"cancelled"}:o));
      setCid(null);setCr("");
    }catch(e){toast.error(e.response?.data?.message||"Failed");}
    finally{setCc(false);}
  };

  const save = async()=>{
    setSv(true);
    try{
      const b={name:nm,phone:ph};
      if(np){b.currentPassword=cp;b.newPassword=np;}
      const {data}=await api.put("/auth/me",b);
      const s=JSON.parse(localStorage.getItem("userInfo")||"{}");
      localStorage.setItem("userInfo",JSON.stringify({...s,...data,token:s.token}));
      toast.success("Profile updated!");setCp("");setNp("");
    }catch(e){toast.error(e.response?.data?.message||"Update failed");}
    finally{setSv(false);}
  };

  const openRetryCheckout = async ({ dbOrder, razorpayOrder }) => {
    if (!window.Razorpay || !rzKey) {
      throw new Error("Payment gateway is unavailable. Please refresh and try again.");
    }

    const options = {
      key: rzKey,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency || "INR",
      name: "RUVA",
      description: `Retry Payment for Order #${dbOrder._id.slice(-8)}`,
      order_id: razorpayOrder.id,
      prefill: {
        name: user?.name || "",
        email: user?.email || "",
        contact: dbOrder?.shippingAddress?.whatsappNumber || user?.phone || "",
      },
      theme: { color: "#6b1a1a" },
      handler: async (response) => {
        const verifyPayload = {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          orderId: dbOrder._id,
        };
        await api.post("/orders/verify", verifyPayload);
        toast.success("Payment successful! Order confirmed.");
        setOrders((prev) => prev.map((o) => (
          o._id === dbOrder._id ? { ...o, paymentStatus: "paid", status: "confirmed" } : o
        )));
      },
      modal: {
        ondismiss: () => {
          toast("Payment retry was cancelled.", { icon: "⚠️" });
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", (response) => {
      toast.error(response?.error?.description || "Payment failed. Please try again.");
    });
    rzp.open();
  };

  const retryPayment = async (order) => {
    if (!razorpayLoaded) {
      toast.error("Payment gateway is still loading. Please wait.");
      return;
    }

    setRetryingOrderId(order._id);
    try {
      const { data } = await api.post(`/orders/${order._id}/retry-payment`);
      await openRetryCheckout({
        dbOrder: data.order,
        razorpayOrder: data.razorpayOrder,
      });
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || "Failed to retry payment");
    } finally {
      setRetryingOrderId(null);
    }
  };

  if(loading||!user) return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#1e0808"}}><Spin/></div>;

  const ini = user.name?.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2)||"RU";
  const tabs = [{id:"overview",icon:User,label:"Overview"},{id:"orders",icon:Package,label:"Orders"},{id:"settings",icon:Settings,label:"Settings"}];
  const pendingOrders = orders.filter((o)=>o.status==="pending"&&o.paymentStatus==="pending");
  const displayedOrders = orderFilter==="pending" ? pendingOrders : orders;

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => setRazorpayLoaded(true)}
        onError={() => toast.error("Failed to load payment gateway.")}
      />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&display=swap');`}</style>
      <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#1e0808 0%,#2a0505 55%,#1a0606 100%)",paddingBottom:80,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-80,left:-80,width:400,height:400,borderRadius:"50%",background:"rgba(201,133,60,.07)",filter:"blur(80px)",pointerEvents:"none"}}/>
        <div style={{position:"absolute",bottom:-60,right:-60,width:350,height:350,borderRadius:"50%",background:"rgba(107,26,26,.1)",filter:"blur(80px)",pointerEvents:"none"}}/>

        <div style={{background:"linear-gradient(to bottom,rgba(201,133,60,.08),transparent)",borderBottom:"1px solid rgba(201,133,60,.15)",padding:"60px 24px 36px",textAlign:"center",position:"relative"}}>
          <motion.div variants={fd} initial="hidden" animate="show">
            <p style={{...LB,color:"rgba(240,201,122,.55)",marginBottom:14}}>✦ Account Atelier ✦</p>
            <div style={{width:84,height:84,borderRadius:"50%",margin:"0 auto 18px",overflow:"hidden",border:"2px solid rgba(201,133,60,.5)",boxShadow:"0 0 32px rgba(201,133,60,.2)"}}>
              {user.avatar && user.avatar.trim() !== ""
                ? <img src={user.avatar} alt={user.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                : <div style={{width:"100%",height:"100%",background:"linear-gradient(135deg,#6b1a1a,#a03030)",display:"flex",alignItems:"center",justifyContent:"center",...CG,fontSize:"1.8rem",fontWeight:700,color:"#ffe8b0"}}>{ini}</div>
              }
            </div>
            <h1 style={{...CG,fontSize:"clamp(1.8rem,4vw,2.8rem)",fontWeight:700,color:"#fff5dd",margin:"0 0 6px"}}>{user.name}</h1>
            <p style={{color:"rgba(255,232,176,.4)",fontSize:"0.85rem",margin:"0 0 24px"}}>{user.email}</p>
            <div style={{display:"flex",justifyContent:"center",gap:28,flexWrap:"wrap"}}>
              {[{l:"Orders",v:orders.length},{l:"Cart",v:cartItems.length}].map(s=>(
                <div key={s.l} style={{textAlign:"center"}}>
                  <p style={{...CG,fontSize:"1.6rem",fontWeight:700,color:"#f0c97a",margin:0}}>{s.v}</p>
                  <p style={{...LB,color:"rgba(255,232,176,.4)",margin:0}}>{s.l}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div style={{display:"flex",justifyContent:"center",gap:4,padding:"28px 16px 0",flexWrap:"wrap"}}>
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 20px",borderRadius:100,border:"none",cursor:"pointer",...CG,fontSize:"0.82rem",fontWeight:700,letterSpacing:"0.08em",transition:"all .25s",background:tab===t.id?"rgba(201,133,60,.18)":"transparent",color:tab===t.id?"#f0c97a":"rgba(255,232,176,.4)",boxShadow:tab===t.id?"inset 0 0 0 1px rgba(201,133,60,.4)":"none"}}>
              <t.icon size={14}/>{t.label}
            </button>
          ))}
        </div>

        <div style={{maxWidth:860,margin:"32px auto 0",padding:"0 16px"}}>
          <AnimatePresence mode="wait">

            {tab==="overview" && (
              <motion.div key="ov" variants={fd} initial="hidden" animate="show" exit={{opacity:0}} style={{display:"flex",flexDirection:"column",gap:14}}>
                {[
                  {label:"Browse Collection",sub:"Heritage silks & designer blouses",href:"/shop"},
                  {label:"Your Cart",sub:cartItems.length+" items saved",href:"/cart"},
                  {label:"Help Center",sub:"Contact support on WhatsApp",href:"https://wa.me/+917026256266", isExternal: true}
                ].map((l,i)=>(
                  <motion.div key={l.label} custom={i} variants={fd} initial="hidden" animate="show">
                    <Link 
                      href={l.href} 
                      target={l.isExternal ? "_blank" : undefined}
                      style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 24px",borderRadius:16,background:"rgba(255,245,220,.04)",border:"1px solid rgba(201,133,60,.18)",textDecoration:"none"}}
                      onMouseEnter={e=>{e.currentTarget.style.background="rgba(201,133,60,.08)";e.currentTarget.style.borderColor="rgba(201,133,60,.4)"}}
                      onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,245,220,.04)";e.currentTarget.style.borderColor="rgba(201,133,60,.18)"}}>
                      <div>
                        <p style={{...CG,fontSize:"1rem",fontWeight:700,color:"#fff5dd",margin:0}}>{l.label}</p>
                        <p style={{fontSize:"0.75rem",color:"rgba(255,232,176,.4)",margin:0}}>{l.sub}</p>
                      </div>
                      <ChevronRight size={18} color="rgba(240,201,122,.5)"/>
                    </Link>
                  </motion.div>
                ))}
                <button onClick={logout} style={{display:"flex",alignItems:"center",gap:10,padding:"16px 24px",borderRadius:16,background:"rgba(239,68,68,.06)",border:"1px solid rgba(239,68,68,.2)",cursor:"pointer",width:"100%",...CG,fontSize:"0.9rem",color:"#f87171",fontWeight:600}}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(239,68,68,.12)"}
                  onMouseLeave={e=>e.currentTarget.style.background="rgba(239,68,68,.06)"}>
                  <LogOut size={16}/> Sign Out
                </button>
              </motion.div>
            )}

            {tab==="orders" && (
              <motion.div key="ord" variants={fd} initial="hidden" animate="show" exit={{opacity:0}} style={{display:"flex",flexDirection:"column",gap:12}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                  <p style={{...CG,fontSize:"1.6rem",fontWeight:700,color:"#fff5dd",margin:0}}>My Orders</p>
                  <div style={{display:"flex",gap:8}}>
                    {[
                      {id:"all",label:`All (${orders.length})`},
                      {id:"pending",label:`Pending Payment (${pendingOrders.length})`},
                    ].map((f)=>(
                      <button
                        key={f.id}
                        onClick={()=>setOrderFilter(f.id)}
                        style={{...LB,padding:"6px 14px",borderRadius:100,border:"1px solid rgba(201,133,60,.35)",background:orderFilter===f.id?"rgba(201,133,60,.16)":"transparent",color:orderFilter===f.id?"#f0c97a":"rgba(255,232,176,.6)",cursor:"pointer"}}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
                {pendingOrders.length>0 && orderFilter==="all" && (
                  <div style={{borderRadius:14,padding:"12px 14px",border:"1px solid rgba(74,222,128,.4)",background:"rgba(34,197,94,.08)",display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                    <p style={{margin:0,...CG,fontSize:"0.9rem",color:"#c8ffd8"}}>{pendingOrders.length} order(s) are awaiting payment. Complete them before stock hold expires.</p>
                    <button onClick={()=>setOrderFilter("pending")} style={{...LB,padding:"7px 14px",borderRadius:100,border:"1px solid rgba(74,222,128,.5)",background:"rgba(34,197,94,.2)",color:"#86efac",cursor:"pointer"}}>Retry Now</button>
                  </div>
                )}
                {ol ? <div style={{display:"flex",justifyContent:"center",padding:40}}><Spin/></div>
                  : displayedOrders.length===0 ? (
                    <div style={{textAlign:"center",padding:"60px 20px",border:"1px solid rgba(201,133,60,.18)",borderRadius:20,background:"rgba(255,245,220,.03)"}}>
                      <Package size={40} color="rgba(240,201,122,.3)" style={{marginBottom:12}}/>
                      <p style={{...CG,color:"rgba(255,232,176,.5)",fontSize:"1.1rem"}}>{orderFilter==="pending"?"No pending payments":"No orders yet"}</p>
                      <Link href="/shop" style={{display:"inline-block",marginTop:16,...LB,padding:"10px 24px",borderRadius:100,background:"linear-gradient(130deg,#6b1a1a,#a03030)",color:"#ffe8b0",textDecoration:"none"}}>{orderFilter==="pending"?"Shop More":"Start Shopping"}</Link>
                    </div>
                  ) : displayedOrders.map(o=>(
                    <OCard
                      key={o._id}
                      o={o}
                      onCancel={id=>{setCid(id);setCr("");}}
                      onRetry={retryPayment}
                      retrying={retryingOrderId===o._id}
                    />
                  ))
                }
              </motion.div>
            )}

            {tab==="settings" && (
              <motion.div key="set" variants={fd} initial="hidden" animate="show" exit={{opacity:0}} style={{display:"flex",flexDirection:"column",gap:20}}>
                <p style={{...CG,fontSize:"1.6rem",fontWeight:700,color:"#fff5dd",margin:0}}>Account Settings</p>
                <div style={{borderRadius:20,border:"1px solid rgba(201,133,60,.2)",background:"rgba(255,245,220,.04)",padding:"28px 24px",display:"flex",flexDirection:"column",gap:16}}>
                  <Inp label="Full Name" value={nm} onChange={e=>setNm(e.target.value)}/>
                  <Inp label="Phone / WhatsApp" value={ph} onChange={e=>setPh(e.target.value)} type="tel"/>
                  {!user.googleId && <>
                    <p style={{...LB,color:"rgba(240,201,122,.6)",margin:"4px 0 0"}}>Change Password</p>
                    <Inp label="Current Password" value={cp} onChange={e=>setCp(e.target.value)} type="password"/>
                    <Inp label="New Password" value={np} onChange={e=>setNp(e.target.value)} type="password"/>
                  </>}
                  <button onClick={save} disabled={sv} style={{...LB,display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"12px",borderRadius:100,background:sv?"rgba(107,26,26,.3)":"linear-gradient(130deg,#6b1a1a,#a03030)",color:"#ffe8b0",border:"none",cursor:sv?"not-allowed":"pointer",boxShadow:sv?"none":"0 4px 16px rgba(107,26,26,.4)",transition:"all .3s"}}>
                    {sv?<><Spin/> Saving…</>:<><Save size={14}/> Save Changes</>}
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {cid && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setCid(null)}
            style={{position:"fixed",inset:0,background:"rgba(10,2,2,.85)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(8px)"}}>
            <motion.div initial={{scale:.9,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:.9,opacity:0}} onClick={e=>e.stopPropagation()}
              style={{width:"100%",maxWidth:420,borderRadius:20,background:"linear-gradient(160deg,#fdf8f0,#f9edda)",padding:28,boxShadow:"0 40px 80px rgba(0,0,0,.5)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <AlertCircle size={20} color="#ef4444"/>
                  <p style={{...CG,fontSize:"1.3rem",fontWeight:700,color:"#2a0505",margin:0}}>Cancel Order</p>
                </div>
                <button onClick={()=>setCid(null)} style={{background:"transparent",border:"none",cursor:"pointer",color:"#6b1a1a"}}><X size={20}/></button>
              </div>
              <p style={{fontFamily:"'Lora',Georgia,serif",color:"rgba(90,42,26,.7)",fontSize:"0.85rem",marginBottom:12}}>Please tell us why you want to cancel.</p>
              <textarea value={cr} onChange={e=>setCr(e.target.value)} rows={3} placeholder="Reason for cancellation…"
                style={{width:"100%",padding:"12px 14px",borderRadius:10,border:"1px solid rgba(201,133,60,.4)",fontFamily:"'Lora',Georgia,serif",fontSize:"0.85rem",resize:"vertical",outline:"none",boxSizing:"border-box",marginBottom:14}}/>
              <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
                <button onClick={()=>setCid(null)} style={{...LB,padding:"10px 20px",borderRadius:100,background:"transparent",border:"1px solid rgba(107,26,26,.25)",color:"#6b1a1a",cursor:"pointer"}}>Keep Order</button>
                <button onClick={cancel} disabled={cc} style={{...LB,padding:"10px 24px",borderRadius:100,background:"linear-gradient(130deg,#dc2626,#b91c1c)",color:"#fff",border:"none",cursor:cc?"not-allowed":"pointer",display:"flex",alignItems:"center",gap:8}}>
                  {cc?<><Spin/> Cancelling…</>:"Confirm Cancel"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
