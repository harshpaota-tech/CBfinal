import { T } from "../App.jsx";
import Btn from "./ui/Btn.jsx";

export default function HowItWorks({ setPage }) {
  const items=[{icon:"🌿",t:"What is a Carbon Credit?",b:"One credit = one tonne of CO₂ reduced, avoided, or removed. Buying and retiring a credit compensates for your own emissions, lowering your net climate impact."},{icon:"✅",t:"How Are Credits Verified?",b:"Every credit is registered on Verra (VCS), Gold Standard, or ACR. Independent auditors verify that reductions are real, measurable, permanent, and additional."},{icon:"👤",t:"Can Individuals Buy Credits?",b:"Yes — no legal restrictions. You can offset a flight, your annual footprint, or a special event. Starting from $7.50 per tonne."},{icon:"🔁",t:"What Does Retirement Mean?",b:"Retiring permanently removes a credit from circulation. No one else can claim it. You receive a certificate and the retirement is recorded on the public registry."},{icon:"🏢",t:"For Businesses",b:"Use credits for ESG reporting, net-zero pledges, and stakeholder communication. CarbonBridge provides bulk pricing, invoicing, and ESG-ready reports."}];
  return (
    <div className="fade" style={{maxWidth:860,margin:"0 auto",padding:"60px 24px"}}>
      <div style={{textAlign:"center",marginBottom:52}}><h1 style={{fontFamily:"'Outfit',sans-serif",fontSize:38,fontWeight:900,marginBottom:10}}>How It Works</h1><p style={{color:T.text2,fontSize:15}}>Everything about buying, selling, and retiring carbon credits.</p></div>
      {items.map((item,i)=>(
        <div key={i} style={{display:"flex",gap:22,marginBottom:22,background:T.bg2,border:`1px solid ${T.border}`,borderRadius:18,padding:26}}>
          <div style={{fontSize:36,flexShrink:0}}>{item.icon}</div>
          <div><h3 style={{fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:18,marginBottom:8}}>{item.t}</h3><p style={{color:T.text2,fontSize:14,lineHeight:1.75}}>{item.b}</p></div>
        </div>
      ))}
      <div style={{textAlign:"center",marginTop:44,display:"flex",gap:12,justifyContent:"center"}}>
        <Btn onClick={()=>setPage("register")}>Create Account →</Btn><Btn variant="outline" onClick={()=>setPage("marketplace")}>Browse Credits</Btn>
      </div>
    </div>
  );
}
