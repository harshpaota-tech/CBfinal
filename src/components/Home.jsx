import { useState, useEffect } from "react";
import axios from "axios";
import { T } from "../App.jsx";
import Btn from "./ui/Btn.jsx";
import Badge from "./ui/Badge.jsx";

function MiniCard({ c, onClick }) {
  const [hov,setHov]=useState(false);
  return <div onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{background:hov?"#111d30":"#0d1525",border:`1.5px solid ${hov?c.color+"66":"rgba(56,189,248,0.12)"}`,borderRadius:20,padding:24,cursor:"pointer",transition:"all .25s"}}>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}><Badge color={c.color}>{c.type}</Badge><span style={{fontSize:12,color:T.text3}}>{c.country}</span></div>
    <div style={{fontSize:28,marginBottom:8}}>{c.icon}</div>
    <h3 style={{fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:15,marginBottom:8}}>{c.name}</h3>
    <div style={{fontFamily:"'Outfit',sans-serif",fontSize:22,fontWeight:900,color:T.green}}>${c.price.toFixed(2)}<span style={{fontSize:12,fontWeight:400,color:T.text3}}>/t</span></div>
  </div>;
}

export default function Home({ setPage }) {
  const [featured,setFeatured]=useState([]);
  useEffect(()=>{ axios.get("/api/credits?sort=price-asc").then(r=>setFeatured(r.data.slice(0,3))).catch(()=>{}); },[]);
  const stats=[{v:"2,300+",l:"Registered Projects"},{v:"4.8M",l:"Tonnes CO₂ Offset"},{v:"18,400+",l:"Active Users"},{v:"47",l:"Countries"}];
  const steps=[{icon:"🔐",t:"Register & Verify",d:"Sign up and complete KYC in under 5 minutes."},{icon:"🔍",t:"Browse Projects",d:"Explore verified credits from Verra, Gold Standard & ACR."},{icon:"💳",t:"Buy Credits",d:"Purchase any quantity. Credits added to wallet instantly."},{icon:"📜",t:"Retire & Certify",d:"Retire credits and download your official certificate."}];
  return (
    <div className="fade">
      <div style={{minHeight:"88vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"80px 24px 60px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 80% 50% at 50% -10%, rgba(14,165,233,0.12), transparent 65%)",pointerEvents:"none"}} />
        <div style={{background:"rgba(56,189,248,0.08)",border:"1px solid rgba(56,189,248,0.25)",borderRadius:24,padding:"7px 20px",marginBottom:28,fontSize:13,color:T.teal,fontWeight:600}}>🏢 Developed by Nomad Life Corporation</div>
        <h1 style={{fontFamily:"'Outfit',sans-serif",fontSize:"clamp(38px,7vw,76px)",fontWeight:900,lineHeight:1.05,marginBottom:24,maxWidth:900}}>Trade Verified <span style={{background:T.grad,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Carbon Credits</span> with Confidence</h1>
        <p style={{fontSize:18,color:T.text2,maxWidth:560,lineHeight:1.75,marginBottom:44}}>The world's most trusted marketplace for buying, selling, and retiring verified carbon credits — for individuals, businesses, and project developers.</p>
        <div style={{display:"flex",gap:14,flexWrap:"wrap",justifyContent:"center"}}>
          <Btn size="lg" onClick={()=>setPage("register")} style={{boxShadow:"0 0 48px rgba(14,165,233,0.35)"}}>Start Offsetting Free →</Btn>
          <Btn size="lg" variant="outline" onClick={()=>setPage("marketplace")}>Browse Credits</Btn>
        </div>
        <div style={{display:"flex",gap:20,marginTop:72,flexWrap:"wrap",justifyContent:"center"}}>
          {stats.map(s=><div key={s.l} style={{background:"rgba(255,255,255,0.025)",border:`1px solid ${T.border}`,borderRadius:16,padding:"20px 32px",textAlign:"center"}}><div style={{fontFamily:"'Outfit',sans-serif",fontSize:28,fontWeight:900,background:T.grad,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{s.v}</div><div style={{fontSize:12,color:T.text3,marginTop:4,fontWeight:500}}>{s.l}</div></div>)}
        </div>
      </div>
      <div style={{borderTop:`1px solid ${T.border}`,borderBottom:`1px solid ${T.border}`,padding:"16px 40px",background:T.bg1,display:"flex",alignItems:"center",justifyContent:"center",gap:40,flexWrap:"wrap"}}>
        <span style={{fontSize:11,color:T.text3,fontWeight:700,textTransform:"uppercase"}}>Verified By</span>
        {["Verra VCS","Gold Standard","ACR","Climate Reserve","Puro.earth"].map(p=><span key={p} style={{fontSize:13,fontWeight:700,color:T.text2,opacity:.7}}>{p}</span>)}
      </div>
      <div style={{padding:"80px 40px",maxWidth:1100,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:52}}><h2 style={{fontFamily:"'Outfit',sans-serif",fontSize:36,fontWeight:800,marginBottom:10}}>Offset in 4 Simple Steps</h2></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:24}}>
          {steps.map((s,i)=><div key={i} style={{background:T.bg2,border:`1px solid ${T.border}`,borderRadius:20,padding:28,position:"relative",overflow:"hidden"}}><div style={{position:"absolute",top:-8,right:-8,fontFamily:"'Outfit',sans-serif",fontSize:72,fontWeight:900,color:"rgba(56,189,248,0.04)",lineHeight:1}}>{i+1}</div><div style={{fontSize:38,marginBottom:14}}>{s.icon}</div><h3 style={{fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:16,marginBottom:8}}>{s.t}</h3><p style={{color:T.text2,fontSize:14,lineHeight:1.6}}>{s.d}</p></div>)}
        </div>
      </div>
      {featured.length>0&&(
        <div style={{padding:"60px 40px",background:T.bg1,borderTop:`1px solid ${T.border}`}}>
          <div style={{maxWidth:1100,margin:"0 auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:32,flexWrap:"wrap",gap:16}}><div><h2 style={{fontFamily:"'Outfit',sans-serif",fontSize:30,fontWeight:800}}>Featured Projects</h2></div><Btn variant="outline" onClick={()=>setPage("marketplace")}>View All →</Btn></div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:20}}>
              {featured.map(c=><MiniCard key={c.id} c={c} onClick={()=>setPage("marketplace")} />)}
            </div>
          </div>
        </div>
      )}
      <div style={{padding:"80px 40px",textAlign:"center",background:`radial-gradient(ellipse 60% 80% at 50% 50%, rgba(14,165,233,0.07), transparent)`}}>
        <h2 style={{fontFamily:"'Outfit',sans-serif",fontSize:40,fontWeight:900,marginBottom:14}}>Ready to Make an Impact?</h2>
        <p style={{color:T.text2,fontSize:16,maxWidth:460,margin:"0 auto 32px"}}>Join 18,000+ individuals and 2,000+ companies already offsetting on CarbonBridge.</p>
        <Btn size="lg" onClick={()=>setPage("register")} style={{boxShadow:"0 0 48px rgba(14,165,233,0.3)"}}>Create Free Account →</Btn>
      </div>
      <footer style={{borderTop:`1px solid ${T.border}`,background:T.bg1,padding:"48px 40px 24px"}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
            <div style={{width:32,height:32,borderRadius:8,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🌉</div>
            <div><div style={{fontFamily:"'Outfit',sans-serif",fontWeight:900,fontSize:16,background:T.grad,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>CarbonBridge</div><div style={{fontSize:9,color:T.text3}}>by Nomad Life Corporation</div></div>
          </div>
          <div style={{height:1,background:T.border,margin:"16px 0"}} />
          <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8}}><span style={{fontSize:12,color:T.text3}}>© 2026 Nomad Life Corporation. All rights reserved.</span><span style={{fontSize:12,color:T.text3}}>🌍 Building a net-zero world, one credit at a time.</span></div>
        </div>
      </footer>
    </div>
  );
}
