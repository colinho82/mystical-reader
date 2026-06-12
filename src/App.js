import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════════════
// MYSTICAL 5-DECK READING SYSTEM v5
// Section 3: Single-page accordion — all 5 decks on one scroll
// Backend: /.netlify/functions/oracle (DeepSeek)
// Setup: Add DEEPSEEK_KEY to Netlify → Environment variables
// ═══════════════════════════════════════════════════════════════

const ORACLE_ENDPOINT = "/.netlify/functions/oracle";
const SESSION_KEY     = "mystical_v5_session";
const IMAGES_KEY      = "mystical_v5_images";

// ── THEME ──────────────────────────────────────────────────────
const G = {
  bg:     "#05000E",
  gold:   "#C9A84C",
  goldLt: "#E8C464",
  cream:  "#F5E6C8",
  muted:  "rgba(245,230,200,0.48)",
  card:   "rgba(16,5,35,0.92)",
  border: "rgba(201,168,76,0.27)",
};

// ── DATA ───────────────────────────────────────────────────────
const LIFE_AREAS = [
  { id:"love",    emoji:"💕", label:"Love & Relationships",
    qs:["How does this person feel about me?","What is the future of this relationship?","What is blocking me from finding love?","Will my relationship improve or should I move on?","What lesson am I learning from this relationship?","Why do I repeat the same relationship patterns?"] },
  { id:"career",  emoji:"🌟", label:"Career & Work",
    qs:["Should I remain in my current role or leave?","Is a promotion approaching for me?","What is preventing my career growth?","Should I start my own business?","What hidden talent am I not fully using?","What career path is truly aligned with my purpose?"] },
  { id:"finance", emoji:"💰", label:"Finance & Wealth",
    qs:["What is blocking my financial abundance?","What is my core money wound?","Is this financial decision wise?","How do I break the cycle of financial struggle?","What opportunity am I missing financially?","What mindset shift would transform my finances?"] },
  { id:"family",  emoji:"🏠", label:"Family",
    qs:["How do I improve my family relationships?","How do I set healthy boundaries without guilt?","Why do the same family conflicts keep repeating?","How do I heal a broken family bond?","Am I enabling someone without realising?","How do I balance family with my own needs?"] },
  { id:"health",  emoji:"🌿", label:"Health & Wellbeing",
    qs:["What does my body need most right now?","What is the root cause of my stress?","How do I improve my mental and emotional health?","What habits are hurting my wellbeing?","How do I restore my energy and vitality?","What healing is most needed right now?"] },
  { id:"spirit",  emoji:"🔮", label:"Spiritual Growth",
    qs:["Am I following my intuition or my ego?","What sign am I overlooking?","How do I deepen my spiritual practice?","Am I on my true soul path?","What spiritual gifts am I not using?","How do I reconnect with my higher self?"] },
  { id:"growth",  emoji:"🌱", label:"Personal Development",
    qs:["What truth am I currently avoiding?","Why do I self-sabotage?","What fear is most holding me back?","How do I build more self-confidence?","What old pattern needs to change?","What is the next chapter of my growth?"] },
  { id:"biz",     emoji:"💼", label:"Business",
    qs:["What is blocking my business growth?","Should I pursue this business idea?","How do I attract better clients?","What strategy should I focus on?","What is my unique competitive strength?","How do I scale my business successfully?"] },
  { id:"purpose", emoji:"✨", label:"Life Purpose",
    qs:["What is my true life purpose?","Am I living in alignment with my soul?","What contribution am I here to make?","What is holding me back from my purpose?","How do I find more meaning?","What does my highest self want me to know?"] },
  { id:"other",   emoji:"🌀", label:"Other",
    qs:["What do I most need to know right now?","What is the universe trying to tell me?","What should I focus on this season?","What is ready to be released?","What new beginning is available to me?","What is my greatest lesson right now?"] },
];

const DECKS = [
  { id:"crystal",   step:1, emoji:"💎", name:"Crystal Reading Deck",      subtitle:"Current Energy",    purpose:"What is Happening",
    color:"#5A0A30", light:"#FF6B9D",
    desc:"Reveals the current emotional energy you are carrying beneath the surface.",
    instruction:"Shuffle the Crystal Deck and intuitively draw 3 cards, focusing on your emotional state right now.",
    cards:[
      { id:"c1", n:1, role:"Current Emotional State",                     desc:"What energy are you carrying right now?",           eg:"Rose Quartz, Citrine, Amethyst..." },
      { id:"c2", n:2, role:"Hidden Challenge",                             desc:"What emotional wound or block needs attention?",    eg:"Obsidian, Black Tourmaline, Malachite..." },
      { id:"c3", n:3, role:"Healing Opportunity",                          desc:"What inner strength is available to you?",          eg:"Clear Quartz, Selenite, Labradorite..." },
    ]},
  { id:"egyptian",  step:2, emoji:"👁",  name:"Egyptian Oracle Deck",       subtitle:"Root Cause",        purpose:"Why is it Happening",
    color:"#3A1500", light:"#FF8C42",
    desc:"Uncovers the spiritual root cause, karmic patterns and soul lessons behind the situation.",
    instruction:"Hold the Egyptian Oracle deck. Close your eyes, breathe deeply and ask: 'Show me the root cause.' Draw 3 cards.",
    cards:[
      { id:"e1", n:1, role:"Root Cause / Past Influence",                 desc:"What is the underlying spiritual cause?",           eg:"Osiris, Isis, Anubis, Ra..." },
      { id:"e2", n:2, role:"Current Lesson",                              desc:"What soul lesson is being presented?",              eg:"Thoth, Hathor, Sekhmet, Horus..." },
      { id:"e3", n:3, role:"Hidden Influence / Transformation",           desc:"What unseen force or transformation is available?",  eg:"Ma'at, Nephthys, Ptah, Nut..." },
    ]},
  { id:"astrology", step:3, emoji:"🌙", name:"Astrology Deck",              subtitle:"Influences",         purpose:"What Influences Exist",
    color:"#0A0A3A", light:"#7B8CDE",
    desc:"Reveals the external and internal cosmic forces and timing shaping the situation.",
    instruction:"Separate into 3 piles: Planets, Zodiac Signs, Houses. Shuffle each pile. Draw 1 card from each.",
    cards:[
      { id:"a1", n:1, role:"External / Current Influence",                desc:"What outside force is most affecting you?",         eg:"Saturn, Venus, Jupiter, Mars..." },
      { id:"a2", n:2, role:"Internal Influence / Opportunity",            desc:"What inner pattern or opportunity is at play?",     eg:"Scorpio, Libra, Capricorn, Aries..." },
      { id:"a3", n:3, role:"Cosmic Guidance / Timing",                    desc:"What cosmic timing or challenge to know?",          eg:"7th House, 10th House, 2nd House..." },
    ]},
  { id:"magic",     step:4, emoji:"✨", name:"Magic Oracle Deck",            subtitle:"Action Plan",       purpose:"What Should Be Done",
    color:"#1A0840", light:"#B388FF",
    desc:"Provides the practical spiritual action steps to shift the situation.",
    instruction:"Shuffle the Magic Oracle deck asking: 'What actions will serve me most right now?' Draw 3 cards.",
    cards:[
      { id:"m1", n:1, role:"Immediate Action",                            desc:"The most important step to take right now?",       eg:"Self-Love Ritual, Release Spell..." },
      { id:"m2", n:2, role:"Recommended Focus / Mindset Shift",           desc:"Where to direct energy? What belief must change?",  eg:"Abundance Ritual, Clarity Spell..." },
      { id:"m3", n:3, role:"Spiritual Guidance / Manifestation",          desc:"What spiritual practice supports transformation?",  eg:"Moon Magic, Fire Ritual, Grounding..." },
    ]},
  { id:"tarot",     step:5, emoji:"🌀", name:"Mystical Realm Tarot Deck",    subtitle:"Potential Outcome", purpose:"Most Likely Direction",
    color:"#1A003A", light:"#CE93D8",
    desc:"Maps the most probable direction — situation, obstacles, opportunities, advice and outcome.",
    instruction:"Shuffle the full Tarot deck holding the question in mind. Draw 5 cards face down, then turn each over.",
    cards:[
      { id:"t1", n:1, role:"Current Situation",                           desc:"Where do you actually stand right now?",            eg:"The Moon, The Fool, Three of Cups..." },
      { id:"t2", n:2, role:"Obstacles",                                   desc:"What is working against you?",                     eg:"The Tower, Five of Swords, The Devil..." },
      { id:"t3", n:3, role:"Opportunity",                                 desc:"What hidden resource wants to help?",              eg:"The Star, Ace of Cups, The Sun..." },
      { id:"t4", n:4, role:"Advice",                                      desc:"What is the single wisest course of action?",      eg:"The Hermit, Strength, The Magician..." },
      { id:"t5", n:5, role:"Final Guidance / Likely Outcome",             desc:"Where does this path most likely lead?",           eg:"The World, Ten of Pentacles, Ace of Wands..." },
    ]},
];

// ── SESSION FACTORY ────────────────────────────────────────────
function makeSession() {
  const ds = {};
  DECKS.forEach(d => {
    ds[d.id] = { status:"not_started", images:{}, names:{}, confidence:{}, interpretations:[], summary:"", completedAt:null };
  });
  return { id:Date.now().toString(), lifeAreas:[], question:"", ds, summary:"", createdAt:new Date().toISOString() };
}

// ── STORAGE ────────────────────────────────────────────────────
const Store = {
  save(s)      { try { const slim={...s,ds:{}}; Object.entries(s.ds).forEach(([id,d])=>{slim.ds[id]={...d,images:{}};}); localStorage.setItem(SESSION_KEY,JSON.stringify(slim)); }catch(_){} },
  load()       { try { const r=localStorage.getItem(SESSION_KEY); return r?JSON.parse(r):null; }catch(_){return null;} },
  saveImg(id,imgs) { try { const all=JSON.parse(localStorage.getItem(IMAGES_KEY)||"{}"); all[id]=imgs; localStorage.setItem(IMAGES_KEY,JSON.stringify(all)); }catch(_){} },
  loadImgs()   { try { return JSON.parse(localStorage.getItem(IMAGES_KEY)||"{}"); }catch(_){return {};} },
  clear()      { try { localStorage.removeItem(SESSION_KEY); localStorage.removeItem(IMAGES_KEY); }catch(_){} },
};

// ── STARS ──────────────────────────────────────────────────────
const STAR_DATA = Array.from({length:50},(_,i)=>({id:i,x:Math.random()*100,y:Math.random()*100,s:Math.random()*2+0.4,d:Math.random()*5,r:Math.random()*3+2}));
function Stars() {
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0}}>
      {STAR_DATA.map(s=><div key={s.id} style={{position:"absolute",left:`${s.x}%`,top:`${s.y}%`,width:s.s,height:s.s,borderRadius:"50%",background:"#fff",animation:`tw ${s.r}s ${s.d}s infinite alternate`}}/>)}
      <style>{`
        @keyframes tw   {from{opacity:.03}to{opacity:.8}}
        @keyframes flt  {0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes glw  {0%,100%{box-shadow:0 0 12px 2px rgba(201,168,76,.22)}50%{box-shadow:0 0 26px 7px rgba(201,168,76,.5)}}
        @keyframes up   {from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fi   {from{opacity:0}to{opacity:1}}
        @keyframes pls  {0%,100%{transform:scale(1)}50%{transform:scale(1.07)}}
        @keyframes spn  {from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes shim {0%,100%{opacity:.4}50%{opacity:1}}
        *{box-sizing:border-box}
        input,textarea,button{font-family:inherit}
        ::-webkit-scrollbar{width:0}
        .qbtn:hover{background:rgba(201,168,76,.12)!important;border-color:rgba(201,168,76,.36)!important}
        .abtn:active{transform:scale(.97)}
      `}</style>
    </div>
  );
}

// ── PRIMITIVES ─────────────────────────────────────────────────
function Btn({children,onClick,disabled,sm,outline,danger,purple,teal,full,style:sx}) {
  const bg=danger?"rgba(160,20,20,.32)":purple?"rgba(90,50,155,.32)":teal?"rgba(20,120,120,.32)":outline?"transparent":disabled?"#180830":`linear-gradient(135deg,${G.gold},${G.goldLt},${G.gold})`;
  const col=disabled?"#3a2a6a":danger?"#ff9090":purple?"#c0a0ff":teal?"#40d0d0":outline?G.gold:G.purple;
  const bd=danger?"#ff5555":purple?"#8060c0":teal?"#20a0a0":disabled?"#2a1a5a":G.gold;
  return <button onClick={onClick} disabled={disabled} style={{background:bg,color:col,border:`1.5px solid ${bd}`,borderRadius:30,padding:sm?"7px 16px":"11px 24px",fontSize:sm?11.5:13.5,fontWeight:700,letterSpacing:.6,cursor:disabled?"not-allowed":"pointer",transition:"all .22s",animation:!disabled&&!outline&&!danger&&!purple&&!teal?"glw 2.5s infinite":"none",opacity:disabled?.44:1,width:full?"100%":"auto",...sx}}>{children}</button>;
}
function Box({children,style:sx}) {
  return <div style={{background:G.card,border:`1px solid ${G.border}`,borderRadius:14,padding:18,backdropFilter:"blur(12px)",boxShadow:"0 5px 24px rgba(0,0,0,.44)",...sx}}>{children}</div>;
}
function Lbl({children,color,mb,style:sx}) {
  return <div style={{color:color||G.gold,fontSize:10,fontWeight:700,letterSpacing:2.5,textTransform:"uppercase",marginBottom:mb??8,...sx}}>{children}</div>;
}
function Rule({style:sx}) { return <div style={{width:44,height:1,background:`linear-gradient(90deg,transparent,${G.gold},transparent)`,margin:"9px auto",...sx}}/>; }
function Dots({step,total}) {
  return <div style={{display:"flex",justifyContent:"center",gap:7,marginBottom:16}}>{Array.from({length:total},(_,i)=><div key={i} style={{width:i===step-1?22:7,height:7,borderRadius:4,background:i<step?G.gold:"rgba(201,168,76,.13)",transition:"all .4s"}}/>)}</div>;
}
function Tag({children,color}) { return <span style={{background:`${(color||G.gold)}18`,border:`1px solid ${(color||G.gold)}44`,borderRadius:20,padding:"3px 10px",color:color||G.gold,fontSize:11,fontStyle:"italic"}}>{children}</span>; }
function Spin({label}) {
  const [d,setD]=useState("");
  useEffect(()=>{const t=setInterval(()=>setD(x=>x.length>=3?"":x+"."),380);return()=>clearInterval(t);},[]);
  return <div style={{textAlign:"center",padding:"28px 0"}}><div style={{fontSize:36,animation:"spn 2.5s linear infinite",display:"inline-block",marginBottom:12}}>✦</div><div style={{color:G.gold,fontFamily:"Georgia,serif",fontSize:15,marginBottom:5}}>{label||"The oracle is reading"}{d}</div><div style={{color:G.cream,fontSize:12,opacity:.5,marginBottom:16}}>Channelling ancient wisdom</div><div style={{display:"flex",justifyContent:"center",gap:7}}>{[0,1,2].map(i=><div key={i} style={{width:9,height:9,borderRadius:"50%",background:G.gold,animation:`pls 1.2s ${i*.22}s infinite`}}/>)}</div></div>;
}

// ── CARD UPLOAD SLOT ───────────────────────────────────────────
function CardSlot({card,imgVal,nameVal,conf,onImg,onName,deckLight,deckColor}) {
  const uid=card.id;
  const [picker,setPicker]=useState(false);
  const [ocring,setOcring]=useState(false);
  const [ocrWarn,setOcrWarn]=useState("");
  const hasImg=!!imgVal, hasName=(nameVal||"").trim().length>0;
  const done=hasImg&&hasName, lowConf=typeof conf==="number"&&conf<80&&hasImg;

  async function processFile(f) {
    if(!f) return;
    const r=new FileReader();
    r.onload=async ev=>{
      const url=ev.target.result;
      onImg(url); setPicker(false); setOcring(true); setOcrWarn("");
      try {
        const m=url.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
        if(m&&m[2].length<800000){
          const res=await fetch(ORACLE_ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({ocr:true,imageMediaType:m[1],imageData:m[2],cardRole:card.role,cardLabel:`Card ${card.n}`})});
          const txt=await res.text();
          if(!txt.trim().startsWith("<")){
            const data=JSON.parse(txt);
            if(data.cardName?.trim()) onName(data.cardName.trim(),data.confidence||0);
            if(data.confidence<80) setOcrWarn(`Low confidence — please verify the card name below.`);
          }
        }
      }catch(_){}
      setOcring(false);
    };
    r.readAsDataURL(f);
  }

  const obtn={background:`${deckColor}88`,border:`1.5px solid ${deckLight}55`,borderRadius:10,padding:"11px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:11,width:"100%",textAlign:"left"};

  return (
    <div style={{marginBottom:12,borderRadius:12,padding:13,animation:"up .3s ease both",background:done?`${deckColor}44`:"rgba(16,5,35,.65)",border:`1px solid ${done?deckLight+"55":lowConf?"rgba(255,160,0,.4)":"rgba(201,168,76,.13)"}`}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:11}}>
        <div style={{width:28,height:28,borderRadius:"50%",flexShrink:0,background:done?`${deckColor}cc`:lowConf?"rgba(255,140,0,.22)":"rgba(201,168,76,.1)",border:`2px solid ${done?deckLight:lowConf?"#ffaa00":"rgba(201,168,76,.24)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:done?deckLight:lowConf?"#ffcc44":G.gold,fontWeight:700}}>
          {done?"✓":card.n}
        </div>
        <div>
          <div style={{color:done?deckLight:G.gold,fontSize:12,fontWeight:700}}>Card {card.n} — {card.role}</div>
          <div style={{color:G.cream,fontSize:11,opacity:.5}}>{card.desc}</div>
        </div>
      </div>
      {lowConf&&<div style={{background:"rgba(255,160,0,.08)",border:"1px solid rgba(255,160,0,.3)",borderRadius:8,padding:"7px 11px",marginBottom:10,color:"#ffcc88",fontSize:11}}>⚠ Card {card.n} could not be clearly identified. Please verify name below.</div>}
      {ocrWarn&&!lowConf&&<div style={{background:"rgba(255,160,0,.06)",border:"1px solid rgba(255,160,0,.22)",borderRadius:8,padding:"6px 11px",marginBottom:9,color:"#ffcc88",fontSize:11}}>{ocrWarn}</div>}

      {/* Photo */}
      <div style={{fontSize:10,fontWeight:700,letterSpacing:2,color:G.gold,textTransform:"uppercase",marginBottom:7}}>📷 Step 1 — Photo</div>
      {hasImg?(
        <div style={{display:"flex",gap:11,alignItems:"flex-start",marginBottom:12}}>
          <div style={{position:"relative",flexShrink:0}}>
            <img src={imgVal} alt={card.role} style={{width:82,height:118,objectFit:"cover",borderRadius:9,border:`2.5px solid ${lowConf?"#ffaa00":deckLight}88`,boxShadow:`0 4px 18px ${deckColor}bb`}}/>
            <div style={{position:"absolute",bottom:-5,left:"50%",transform:"translateX(-50%)",background:deckColor,border:`1px solid ${deckLight}77`,borderRadius:10,padding:"2px 7px",color:deckLight,fontSize:9,fontWeight:700,whiteSpace:"nowrap"}}>✓ Uploaded</div>
            {ocring&&<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.64)",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",color:G.gold,fontSize:20,animation:"spn 1.5s linear infinite"}}>🔍</div>}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6,paddingTop:2,flex:1}}>
            {[{id:`rc-${uid}`,cap:true,icon:"📷",lbl:"Retake"},{id:`rg-${uid}`,cap:false,icon:"🖼",lbl:"Gallery"}].map(b=>(
              <label key={b.id} htmlFor={b.id} style={{background:"rgba(201,168,76,.08)",border:"1px solid rgba(201,168,76,.25)",borderRadius:20,padding:"7px 12px",cursor:"pointer",color:G.cream,fontSize:11,display:"flex",alignItems:"center",gap:6,userSelect:"none"}}>
                {b.icon} {b.lbl}
                <input id={b.id} type="file" accept="image/*" {...(b.cap?{capture:"environment"}:{})} style={{display:"none"}} onChange={e=>{const f=e.target.files?.[0];e.target.value="";if(f)processFile(f);}}/>
              </label>
            ))}
            <button onClick={()=>{onImg(null);onName("",0);setOcrWarn("");}} style={{background:"rgba(160,20,20,.18)",border:"1px solid rgba(255,70,70,.24)",borderRadius:20,padding:"7px 12px",cursor:"pointer",color:"#ff9090",fontSize:11,display:"flex",alignItems:"center",gap:6}}>🗑 Remove</button>
          </div>
        </div>
      ):(
        !picker?(
          <div onClick={()=>setPicker(true)} style={{height:82,borderRadius:10,border:"2px dashed rgba(201,168,76,.22)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",background:"rgba(201,168,76,.03)",marginBottom:12,gap:4}}>
            <div style={{fontSize:22}}>📷</div>
            <div style={{color:G.cream,fontSize:11,opacity:.5}}>Tap to upload Card {card.n}</div>
          </div>
        ):(
          <div style={{background:"rgba(6,1,18,.97)",border:"1px solid rgba(201,168,76,.28)",borderRadius:11,padding:13,marginBottom:12,animation:"fi .2s"}}>
            <div style={{color:G.gold,fontSize:12,fontWeight:700,marginBottom:10}}>How to add Card {card.n}?</div>
            <div style={{display:"flex",flexDirection:"column",gap:7}}>
              <label htmlFor={`c-${uid}`} style={obtn}><span style={{fontSize:20,flexShrink:0}}>📷</span><div><div style={{color:deckLight,fontSize:12,fontWeight:700}}>Take Photo</div><div style={{color:G.cream,fontSize:11,opacity:.6}}>Open camera now</div></div><input id={`c-${uid}`} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={e=>{const f=e.target.files?.[0];e.target.value="";if(f)processFile(f);}}/></label>
              <label htmlFor={`g-${uid}`} style={obtn}><span style={{fontSize:20,flexShrink:0}}>🖼</span><div><div style={{color:deckLight,fontSize:12,fontWeight:700}}>Choose Gallery</div><div style={{color:G.cream,fontSize:11,opacity:.6}}>Select from library</div></div><input id={`g-${uid}`} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{const f=e.target.files?.[0];e.target.value="";if(f)processFile(f);}}/></label>
              <button onClick={()=>setPicker(false)} style={{background:"transparent",border:"none",color:"rgba(245,230,200,.26)",fontSize:12,cursor:"pointer",padding:"3px"}}>✕ Cancel</button>
            </div>
          </div>
        )
      )}

      {/* Name */}
      <div style={{fontSize:10,fontWeight:700,letterSpacing:2,color:G.gold,textTransform:"uppercase",marginBottom:7}}>✍ Step 2 — Card Name</div>
      <div style={{color:G.cream,fontSize:11,opacity:.46,marginBottom:7}}>{ocring?"🔍 Reading card name from image...":hasImg?"Auto-detected. Correct if needed.":"Type the name shown on your card."}</div>
      <input type="text" value={nameVal||""} onChange={e=>onName(e.target.value,100)} placeholder={card.eg} disabled={ocring}
        style={{width:"100%",padding:"9px 12px",background:ocring?"rgba(16,5,35,.5)":"rgba(16,5,35,.9)",border:`1.5px solid ${hasName?deckLight:lowConf?"rgba(255,160,0,.4)":"rgba(201,168,76,.2)"}`,borderRadius:9,color:G.cream,fontSize:13,outline:"none",transition:"border .2s"}}/>
      {ocring&&<div style={{color:G.gold,fontSize:10,marginTop:3,animation:"shim 1.2s infinite"}}>✦ Auto-reading card name...</div>}
      {hasName&&!ocring&&<div style={{color:"#7CFC00",fontSize:10,marginTop:3}}>✓ <span style={{fontStyle:"italic"}}>"{nameVal.trim()}"</span></div>}
      {!hasName&&!ocring&&<div style={{color:"rgba(245,230,200,.26)",fontSize:10,marginTop:3}}>Card name required</div>}
    </div>
  );
}

// ── CARD RESULT ────────────────────────────────────────────────
function CardResult({cd,meta,deckLight,deckColor,idx}) {
  if(cd.error) return (
    <div style={{background:"rgba(150,15,15,.15)",border:"1.5px solid rgba(255,60,60,.4)",borderRadius:13,padding:16,marginBottom:12,animation:"up .4s ease both"}}>
      <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:9}}><span style={{fontSize:22}}>⚠️</span><div><div style={{color:"#ff9090",fontSize:15,fontWeight:700,fontFamily:"Georgia,serif"}}>Card {meta?.n} — Cannot Be Read</div><div style={{color:"#ffaa88",fontSize:11,marginTop:1}}>{meta?.role}</div></div></div>
      <div style={{background:"rgba(255,60,60,.07)",border:"1px solid rgba(255,60,60,.18)",borderRadius:8,padding:"9px 12px",marginBottom:9,color:G.cream,fontSize:12,lineHeight:1.6,opacity:.85}}>{cd.errorReason||"Card name could not be identified."}</div>
      <div style={{color:"#ffcc88",fontSize:12,lineHeight:1.6}}>👉 Reset this deck and upload a clearer image for <strong style={{color:"#ffaa44"}}>Card {meta?.n}</strong>.</div>
    </div>
  );
  return (
    <div style={{background:`linear-gradient(135deg,${deckColor}8c,rgba(16,5,35,.95))`,border:`1.5px solid ${deckLight}44`,borderRadius:13,padding:"16px 15px",marginBottom:12,animation:"up .4s ease both"}}>
      <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:12}}>
        <div style={{width:32,height:32,borderRadius:"50%",background:`${deckColor}cc`,border:`2px solid ${deckLight}`,display:"flex",alignItems:"center",justifyContent:"center",color:deckLight,fontSize:12,fontWeight:700,flexShrink:0}}>{idx+1}</div>
        <div style={{color:G.cream,fontSize:11,opacity:.55}}>{meta?.role}</div>
      </div>
      {/* Card name — bold large */}
      <div style={{fontSize:22,fontWeight:700,fontFamily:"Georgia,serif",color:deckLight,lineHeight:1.2,marginBottom:11,textShadow:`0 0 20px ${deckLight}55`,letterSpacing:.4}}>{cd.cardName}</div>
      {/* Keywords — small */}
      {cd.keywords?.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:12}}>{cd.keywords.map((kw,ki)=><Tag key={ki} color={deckLight}>{kw}</Tag>)}</div>}
      {/* Meaning */}
      <div style={{borderLeft:`3px solid ${deckLight}50`,paddingLeft:12}}>
        <div style={{color:G.gold,fontSize:10,fontWeight:700,letterSpacing:1.5,marginBottom:5,textTransform:"uppercase"}}>Meaning for your question</div>
        <p style={{color:G.cream,fontSize:13,lineHeight:1.85,margin:0,opacity:.93}}>{cd.meaning}</p>
      </div>
    </div>
  );
}

// ── ORACLE CALL ────────────────────────────────────────────────
async function callOracle(deck,lifeAreas,question,names) {
  const areaLabels=lifeAreas.map(id=>LIFE_AREAS.find(a=>a.id===id)?.label||id).join(", ");
  const cardLines=deck.cards.map(c=>{const n=(names[c.id]||"").trim();return `Card ${c.n} (${c.role}):\n  Name: ${n?`"${n}"`:"[not provided — suggest appropriate card]"}\n  Purpose: ${c.desc}`;}).join("\n\n");
  const prompt=`You are a professional mystical card reader.\n\nDeck: ${deck.name} — ${deck.purpose}\nLife Area(s): ${areaLabels}\nClient Question: "${question}"\nDeck Purpose: ${deck.desc}\n\nCards:\n${cardLines}\n\nRules:\n- Use EXACT card name given. Never rename.\n- If missing, suggest appropriate card.\n- Interpret SPECIFICALLY for: "${question}" — never generic.\n- Be compassionate, empowering, personal.\n- If card name is invalid set error:true.\n\nReturn ONLY raw JSON, no markdown:\n{"cards":[{"cardName":"name","keywords":["k1","k2","k3","k4"],"meaning":"2-3 sentences specific to the question. Reference card name. Be personal.","error":false,"errorReason":""}],"suggestedAnswer":"3-4 paragraphs weaving ALL card names into one unified answer. Name every card. Open with key insight. Close with one empowering action."}`;
  const res=await fetch(ORACLE_ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt})});
  const raw=await res.text().catch(()=>"");
  if(raw.trim().startsWith("<")) throw new Error("FUNC_NOT_FOUND");
  let data={};
  try{data=JSON.parse(raw);}catch(_){data={error:`Non-JSON: ${raw.substring(0,200)}`};}
  if(!res.ok) throw new Error(`FUNC_ERROR: ${data.error||"HTTP "+res.status}`);
  if(data.error) throw new Error(`FUNC_ERROR: ${data.error}`);
  const text=data.result||"{}";
  const clean=text.replace(/^```(?:json)?\s*/,"").replace(/\s*```$/,"").trim();
  try{return JSON.parse(clean);}catch(_){throw new Error(`PARSE_ERROR: ${clean.substring(0,120)}`);}
}

function fmtErr(msg) {
  if(msg.includes("DEEPSEEK_KEY"))    return "🔑 DEEPSEEK_KEY not set in Netlify environment variables.";
  if(msg.includes("401"))             return "🔑 Invalid DeepSeek key. Check DEEPSEEK_KEY in Netlify.";
  if(msg.includes("402"))             return "💳 DeepSeek has no credits. Top up at platform.deepseek.com.";
  if(msg.includes("429"))             return "⏳ Too many requests. Wait 30 seconds then retry.";
  if(msg.includes("502")||msg.includes("503")||msg.includes("504")) return "🌐 DeepSeek temporarily busy. Please retry in a moment.";
  if(msg.includes("FUNC_NOT_FOUND"))  return "⚠ Netlify function not found. Check netlify/functions/oracle.js exists in GitHub.";
  if(msg.includes("FUNC_ERROR"))      return `⚠ ${msg.replace("FUNC_ERROR:","").trim()}`;
  if(msg.includes("PARSE_ERROR"))     return `📋 Response unclear — please retry. ${msg.replace("PARSE_ERROR:","").trim()}`;
  if(msg.includes("Failed to fetch")||msg.includes("NetworkError")) return "🌐 Network error. Check internet and retry.";
  return `⚠ ${msg} — please retry.`;
}

// ══════════════════════════════════════════════════════════════
// DECK ACCORDION PANEL — one panel per deck, all on one page
// ══════════════════════════════════════════════════════════════
function DeckPanel({deck, deckState, lifeAreas, question, isOpen, isLocked, onToggle, onSave, allImgs}) {
  const saved     = deckState || {};
  const savedImgs = allImgs[deck.id] || {};

  const [images,  setImages]  = useState({...savedImgs,...(saved.images||{})});
  const [names,   setNames]   = useState(saved.names||{});
  const [conf,    setConf]    = useState(saved.confidence||{});
  const [cards,   setCards]   = useState(saved.interpretations?.length>0?saved.interpretations:null);
  const [answer,  setAnswer]  = useState(saved.summary||"");
  const [loading, setLoading] = useState(false);
  const [errMsg,  setErrMsg]  = useState("");
  const [confrm,  setConfrm]  = useState(false);
  const [resetOk, setResetOk] = useState("");
  const panelRef = useRef(null);

  const isDone   = saved.status==="completed";
  const namedN   = deck.cards.filter(c=>(names[c.id]||"").trim().length>0).length;
  const imgN     = deck.cards.filter(c=>!!images[c.id]).length;
  const allNamed = namedN===deck.cards.length;
  const errCards = (Array.isArray(cards)?cards:[]).map((c,i)=>({...c,idx:i})).filter(c=>c.error);
  const allOk    = Array.isArray(cards)&&cards.length>0&&cards.every(c=>!c.error);
  const canDone  = allOk&&answer.length>10;

  // Sync images to storage whenever changed
  useEffect(()=>{ Store.saveImg(deck.id,images); },[images]);
  // Autosave state
  useEffect(()=>{
    if(namedN>0||imgN>0||cards) {
      onSave(deck.id,{images:{},names,confidence:conf,interpretations:cards||[],summary:answer,status:canDone?"completed":namedN>0||imgN>0?"in_progress":"not_started"});
    }
  },[names,conf,cards,answer]);

  async function read(demo=false) {
    setLoading(true); setErrMsg("");
    try {
      const r=await callOracle(deck,lifeAreas,question,demo?{}:names);
      if(!r?.cards) throw new Error("Empty oracle response");
      setCards(r.cards); setAnswer(r.suggestedAnswer||"");
      onSave(deck.id,{images:{},names,confidence:conf,interpretations:r.cards,summary:r.suggestedAnswer||"",status:"completed",completedAt:new Date().toISOString()});
    } catch(e) {
      setErrMsg(fmtErr(e.message||""));
    }
    setLoading(false);
  }

  function doReset() {
    setImages({}); setNames({}); setConf({}); setCards(null); setAnswer("");
    setConfrm(false); setErrMsg("");
    setResetOk("✓ Deck reset — re-upload your card photos.");
    Store.saveImg(deck.id,{});
    onSave(deck.id,{images:{},names:{},confidence:{},interpretations:[],summary:"",status:"reset",completedAt:null});
    setTimeout(()=>setResetOk(""),3000);
  }

  // Status badge
  const badge = isDone
    ? { label:"✓ Complete", bg:"rgba(50,200,100,.15)", color:"#7CFC00", border:"rgba(50,200,100,.3)" }
    : namedN>0||imgN>0
      ? { label:"In Progress", bg:"rgba(201,168,76,.1)", color:G.gold, border:"rgba(201,168,76,.3)" }
      : { label:"Not Started", bg:"rgba(201,168,76,.05)", color:"rgba(201,168,76,.5)", border:"rgba(201,168,76,.15)" };

  return (
    <div ref={panelRef} style={{marginBottom:10,borderRadius:16,overflow:"hidden",border:`1.5px solid ${isOpen?deck.light+"55":isDone?"rgba(50,200,100,.3)":isLocked?"rgba(201,168,76,.1)":"rgba(201,168,76,.2)"}`,transition:"border .3s",animation:"up .3s ease both"}}>

      {/* ── ACCORDION HEADER ── */}
      <button onClick={()=>!isLocked&&onToggle()} style={{width:"100%",background:isOpen?`${deck.color}88`:isDone?`${deck.color}44`:`${deck.color}22`,border:"none",padding:"14px 16px",cursor:isLocked?"default":"pointer",display:"flex",alignItems:"center",gap:12,transition:"background .3s"}}>
        {/* Step badge */}
        <div style={{width:36,height:36,borderRadius:"50%",flexShrink:0,background:isDone?`${deck.color}cc`:isOpen?`${deck.color}99`:"rgba(201,168,76,.1)",border:`2px solid ${isDone?"#7CFC00":isOpen?deck.light:"rgba(201,168,76,.25)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:isDone?16:14,color:isDone?"#7CFC00":isOpen?deck.light:G.gold,fontWeight:700}}>
          {isDone?"✓":isLocked?"○":deck.step}
        </div>
        {/* Title */}
        <div style={{flex:1,textAlign:"left"}}>
          <div style={{color:isDone?"#7CFC00":isOpen?deck.light:isLocked?"rgba(201,168,76,.35)":G.gold,fontSize:13,fontWeight:700,fontFamily:"Georgia,serif",marginBottom:2}}>{deck.emoji} {deck.name}</div>
          <div style={{color:G.cream,fontSize:10,opacity:isLocked?.3:.6}}>{deck.purpose} · {deck.subtitle}</div>
        </div>
        {/* Status badge */}
        <div style={{display:"flex",alignItems:"center",gap:7,flexShrink:0}}>
          <div style={{background:badge.bg,border:`1px solid ${badge.border}`,borderRadius:20,padding:"3px 8px",color:badge.color,fontSize:9.5,fontWeight:700,whiteSpace:"nowrap"}}>{badge.label}</div>
          {!isLocked&&<div style={{color:isOpen?deck.light:"rgba(201,168,76,.4)",fontSize:14,transform:isOpen?"rotate(180deg)":"rotate(0deg)",transition:"transform .3s"}}>▼</div>}
          {isLocked&&<div style={{color:"rgba(201,168,76,.2)",fontSize:12}}>🔒</div>}
        </div>
      </button>

      {/* ── ACCORDION BODY ── */}
      {isOpen&&!isLocked&&(
        <div style={{padding:"16px 16px 20px",background:`rgba(16,5,35,.88)`}}>

          {/* Description + instruction */}
          <Box style={{marginBottom:12,padding:14}}>
            <Lbl mb={5}>✦ Purpose</Lbl>
            <p style={{color:G.cream,fontSize:12,lineHeight:1.7,margin:"0 0 10px"}}>{deck.desc}</p>
            <Lbl color={deck.light} mb={5}>✦ Instructions</Lbl>
            <p style={{color:G.cream,fontSize:12,lineHeight:1.72,margin:0}}>{deck.instruction}</p>
            <div style={{color:G.cream,fontSize:11,opacity:.45,marginTop:7}}>Cards required: <strong style={{color:deck.light}}>{deck.cards.length}</strong></div>
          </Box>

          {/* Status messages */}
          {resetOk&&<div style={{color:"#7CFC00",fontSize:12,textAlign:"center",marginBottom:10,padding:"8px 13px",background:"rgba(50,200,100,.06)",border:"1px solid rgba(50,200,100,.18)",borderRadius:9,animation:"fi .3s"}}>{resetOk}</div>}
          {errMsg&&(
            <div style={{background:"rgba(150,15,15,.1)",border:"1px solid rgba(255,60,60,.28)",borderRadius:10,padding:"12px 14px",marginBottom:12}}>
              <div style={{color:"#ff9090",fontSize:13,fontWeight:700,marginBottom:7}}>⚠ Interpretation service issue</div>
              <div style={{color:G.cream,fontSize:12,lineHeight:1.6,marginBottom:10,opacity:.85}}>{errMsg}</div>
              <Btn onClick={()=>read(false)} disabled={!allNamed||loading} sm>🔄 Retry Interpretation</Btn>
            </div>
          )}

          {/* ── UPLOAD SECTION (if not done) ── */}
          {!isDone&&!loading&&(
            <div>
              <Box style={{marginBottom:12,padding:12,border:"1px solid rgba(201,168,76,.15)"}}>
                <div style={{display:"flex",gap:9,alignItems:"flex-start"}}>
                  <span style={{fontSize:16,flexShrink:0}}>📱</span>
                  <div style={{color:G.cream,fontSize:11,lineHeight:1.62,opacity:.7}}>
                    Upload a photo of each card. The app will <strong style={{color:G.gold}}>auto-read the card name</strong> from the image. Verify or correct below. Camera and gallery work on your <strong style={{color:G.gold}}>real phone browser</strong> after deploying to Netlify.
                  </div>
                </div>
              </Box>

              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <Lbl mb={0} style={{fontSize:9.5}}>✦ Your {deck.cards.length} Cards</Lbl>
                <div style={{textAlign:"right"}}>
                  <div style={{color:imgN===deck.cards.length?"#7CFC00":G.cream,fontSize:9.5,opacity:.6}}>📷 {imgN}/{deck.cards.length}</div>
                  <div style={{color:namedN===deck.cards.length?"#7CFC00":G.cream,fontSize:9.5,opacity:.6}}>✍ {namedN}/{deck.cards.length}</div>
                </div>
              </div>
              <div style={{height:3,background:"rgba(201,168,76,.08)",borderRadius:4,marginBottom:13,overflow:"hidden"}}>
                <div style={{height:"100%",borderRadius:4,background:G.gold,width:`${(namedN/deck.cards.length)*100}%`,transition:"width .4s"}}/>
              </div>

              {deck.cards.map(card=>(
                <CardSlot key={card.id} card={card}
                  imgVal={images[card.id]} nameVal={names[card.id]} conf={conf[card.id]}
                  deckLight={deck.light} deckColor={deck.color}
                  onImg={v=>setImages(p=>({...p,[card.id]:v}))}
                  onName={(n,c)=>{setNames(p=>({...p,[card.id]:n}));setConf(p=>({...p,[card.id]:c}));}}
                />
              ))}

              <div style={{display:"flex",flexDirection:"column",gap:9,alignItems:"center",marginTop:10}}>
                <Btn onClick={()=>read(false)} disabled={!allNamed||loading} full>
                  {loading?<span style={{animation:"shim .8s infinite"}}>✦ Interpreting...</span>:allNamed?`✦ Interpret Cards`:`Enter all ${deck.cards.length} card names to continue`}
                </Btn>
                {!allNamed&&<div style={{color:G.cream,fontSize:10,opacity:.28}}>{deck.cards.length-namedN} more name{deck.cards.length-namedN!==1?"s":""} needed</div>}
                <div style={{width:"100%",borderTop:"1px solid rgba(201,168,76,.09)",paddingTop:10,marginTop:3,textAlign:"center"}}>
                  <div style={{color:G.cream,fontSize:9.5,opacity:.2,marginBottom:7}}>— TEST WITHOUT REAL CARDS —</div>
                  <Btn onClick={()=>read(true)} purple full>✦ Demo Mode</Btn>
                </div>
              </div>
            </div>
          )}

          {/* ── LOADING ── */}
          {loading&&<Spin label={`Interpreting ${deck.name} cards`}/>}

          {/* ── RESULTS (if done) ── */}
          {isDone&&Array.isArray(cards)&&cards.length>0&&(
            <div>
              {/* Photo strip */}
              {Object.values(images).some(Boolean)&&(
                <div style={{marginBottom:16}}>
                  <Lbl mb={8}>✦ Cards Drawn</Lbl>
                  <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                    {deck.cards.map((card,i)=>images[card.id]?(
                      <div key={card.id} style={{textAlign:"center",position:"relative"}}>
                        <img src={images[card.id]} alt={card.role} style={{width:60,height:88,objectFit:"cover",borderRadius:8,border:`2px solid ${cards[i]?.error?"#ff4444":deck.light+"55"}`,boxShadow:`0 3px 12px ${deck.color}88`,filter:cards[i]?.error?"grayscale(50%) brightness(.68)":"none"}}/>
                        {cards[i]?.error&&<div style={{position:"absolute",top:2,right:2,width:16,height:16,borderRadius:"50%",background:"#ff2222",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#fff",fontWeight:700}}>!</div>}
                        <div style={{color:G.cream,fontSize:8,opacity:.5,marginTop:2,maxWidth:60,lineHeight:1.2}}>{card.role}</div>
                      </div>
                    ):null)}
                  </div>
                </div>
              )}

              {/* Interpretations */}
              <Lbl mb={10}>✦ Card Interpretations</Lbl>
              {cards.map((cd,i)=><CardResult key={i} cd={cd} meta={deck.cards[i]} deckLight={deck.light} deckColor={deck.color} idx={i}/>)}

              {/* Error banner */}
              {errCards.length>0&&(
                <div style={{background:"rgba(150,15,15,.13)",border:"1.5px solid rgba(255,55,55,.32)",borderRadius:11,padding:"13px 15px",marginBottom:14}}>
                  <div style={{color:"#ff9090",fontSize:14,fontWeight:700,marginBottom:6}}>⚠ {errCards.length} Card{errCards.length>1?"s":""} Could Not Be Interpreted</div>
                  <p style={{color:G.cream,fontSize:12,opacity:.78,margin:"0 0 11px",lineHeight:1.6}}>Reset this deck and re-upload clearer images for:</p>
                  {errCards.map((ec,i)=><div key={i} style={{display:"flex",gap:7,padding:"4px 0",borderBottom:i<errCards.length-1?"1px solid rgba(255,55,55,.1)":"none"}}><span style={{color:"#ff9090",flexShrink:0}}>⚠</span><div><span style={{color:"#ffaa88",fontSize:12,fontWeight:700}}>Card {deck.cards[ec.idx]?.n} ({deck.cards[ec.idx]?.role})</span><div style={{color:G.cream,fontSize:11,opacity:.56,marginTop:1}}>{ec.errorReason||"Could not be interpreted"}</div></div></div>)}
                  <div style={{marginTop:12}}><Btn onClick={()=>setConfrm(true)} danger full>↺ Reset Deck</Btn></div>
                </div>
              )}

              {/* Suggested Answer */}
              {allOk&&answer.length>10&&(
                <div style={{marginBottom:14}}>
                  <Lbl mb={10}>✦ Suggested Answer</Lbl>
                  <div style={{background:`linear-gradient(135deg,${deck.color}cc,rgba(16,5,35,.97))`,border:`2px solid ${deck.light}50`,borderRadius:14,padding:"18px 16px",boxShadow:`0 6px 24px ${deck.color}55`}}>
                    <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:13}}>
                      <span style={{fontSize:22}}>{deck.emoji}</span>
                      <div style={{color:G.gold,fontSize:14,fontWeight:700,fontFamily:"Georgia,serif"}}>Suggested Answer — {deck.subtitle}</div>
                    </div>
                    <div style={{width:"100%",height:1,background:`linear-gradient(90deg,transparent,${deck.light}50,transparent)`,marginBottom:12}}/>
                    {answer.split(/\n+/).filter(p=>p.trim()).map((p,i,a)=><p key={i} style={{color:G.cream,fontSize:13,lineHeight:1.88,margin:i>0?"11px 0 0":"0",fontStyle:i===a.length-1?"italic":"normal",opacity:i===a.length-1?.84:.94}}>{p}</p>)}
                  </div>
                </div>
              )}

              {/* Reset confirm */}
              {!confrm?(
                <button onClick={()=>setConfrm(true)} style={{background:"transparent",border:"1px solid rgba(255,100,100,.18)",borderRadius:30,padding:"8px 18px",cursor:"pointer",color:"rgba(255,150,150,.5)",fontSize:11,width:"100%",marginTop:4}}>↺ Reset This Deck</button>
              ):(
                <div style={{background:"rgba(150,15,15,.1)",border:"1px solid rgba(255,60,60,.22)",borderRadius:11,padding:13,animation:"fi .2s",marginTop:8}}>
                  <div style={{color:"#ff9090",fontSize:13,fontWeight:700,textAlign:"center",marginBottom:6}}>Reset this deck?</div>
                  <p style={{color:G.cream,fontSize:11,opacity:.55,textAlign:"center",margin:"0 0 11px",lineHeight:1.5}}>All photos, card names and interpretations will be deleted. Other decks are not affected.</p>
                  <div style={{display:"flex",gap:8,justifyContent:"center"}}><Btn onClick={()=>setConfrm(false)} outline sm>Cancel</Btn><Btn onClick={doReset} danger sm>Yes, Reset</Btn></div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// SECTION 3 — SINGLE PAGE ACCORDION
// ══════════════════════════════════════════════════════════════
function Section3({session, onSaveDeck, onComplete}) {
  const allImgs = Store.loadImgs();

  // Which deck is currently open — start with first incomplete
  const firstIncomplete = DECKS.findIndex(d=>session.ds?.[d.id]?.status!=="completed");
  const [openIdx, setOpenIdx] = useState(firstIncomplete>=0?firstIncomplete:0);

  const completedCount = DECKS.filter(d=>session.ds?.[d.id]?.status==="completed").length;
  const allDone = completedCount===DECKS.length;

  function toggle(i) {
    setOpenIdx(prev=>prev===i?-1:i);
  }

  // A deck is locked if the previous deck is not completed
  function isLocked(i) {
    if(i===0) return false;
    return session.ds?.[DECKS[i-1].id]?.status!=="completed";
  }

  // When a deck is saved as completed, auto-open the next one
  function handleSave(deckId, data) {
    onSaveDeck(deckId, data);
    if(data.status==="completed") {
      const idx = DECKS.findIndex(d=>d.id===deckId);
      if(idx<DECKS.length-1) {
        setTimeout(()=>setOpenIdx(idx+1), 400);
      }
    }
  }

  const area = LIFE_AREAS.find(a=>session.lifeAreas?.includes(a.id));

  return (
    <div style={{padding:"18px 16px 40px"}}>
      <Dots step={3} total={4}/>
      <div style={{textAlign:"center",marginBottom:16}}>
        <div style={{fontSize:34,animation:"flt 3s infinite",display:"inline-block",marginBottom:5}}>🔮</div>
        <Lbl style={{letterSpacing:4,textAlign:"center",marginBottom:4}}>Section 3</Lbl>
        <h2 style={{fontFamily:"Georgia,serif",color:G.gold,fontSize:20,margin:0}}>5-Deck Reading Journey</h2>
        <Rule/>
        <p style={{color:G.cream,fontSize:12,opacity:.58,margin:0}}>Complete all 5 decks in order — tap each deck to expand</p>
      </div>

      {/* Progress overview */}
      <Box style={{marginBottom:16,padding:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <Lbl mb={0} style={{fontSize:9.5}}>Overall Progress</Lbl>
          <span style={{color:G.gold,fontSize:11,fontWeight:700}}>{completedCount} / {DECKS.length} decks complete</span>
        </div>
        <div style={{height:6,background:"rgba(201,168,76,.09)",borderRadius:4,overflow:"hidden",marginBottom:10}}>
          <div style={{height:"100%",borderRadius:4,background:`linear-gradient(90deg,${G.gold},${G.goldLt})`,width:`${(completedCount/DECKS.length)*100}%`,transition:"width .5s"}}/>
        </div>
        <div style={{display:"flex",gap:4,justifyContent:"center"}}>
          {DECKS.map((d,i)=>{
            const st=session.ds?.[d.id]?.status;
            const done=st==="completed";
            const active=i===openIdx;
            return (
              <button key={d.id} onClick={()=>!isLocked(i)&&setOpenIdx(prev=>prev===i?-1:i)} style={{background:done?"rgba(50,200,100,.15)":active?`${d.color}88`:"rgba(201,168,76,.06)",border:`1px solid ${done?"rgba(50,200,100,.35)":active?d.light:"rgba(201,168,76,.18)"}`,borderRadius:20,padding:"4px 9px",cursor:isLocked(i)?"default":"pointer",color:done?"#7CFC00":active?d.light:"rgba(201,168,76,.4)",fontSize:9.5,display:"flex",alignItems:"center",gap:3,flexShrink:0,transition:"all .2s"}}>
                <span>{d.emoji}</span>
                <span>{done?"✓":isLocked(i)?"🔒":""}</span>
              </button>
            );
          })}
        </div>
      </Box>

      {/* Question context */}
      <Box style={{marginBottom:14,padding:12,background:`rgba(20,8,40,.85)`}}>
        <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:6}}>
          {session.lifeAreas?.map(id=>{const a=LIFE_AREAS.find(x=>x.id===id);return <Tag key={id}>{a?.emoji} {a?.label}</Tag>;})}
        </div>
        <Lbl mb={3} style={{fontSize:9}}>Your question</Lbl>
        <div style={{color:G.cream,fontSize:12,fontStyle:"italic",lineHeight:1.6}}>"{session.question}"</div>
      </Box>

      {/* Deck accordions */}
      {DECKS.map((deck,i)=>(
        <DeckPanel
          key={deck.id}
          deck={deck}
          deckState={session.ds?.[deck.id]}
          lifeAreas={session.lifeAreas||[]}
          question={session.question||""}
          isOpen={openIdx===i}
          isLocked={isLocked(i)}
          onToggle={()=>toggle(i)}
          onSave={handleSave}
          allImgs={allImgs}
        />
      ))}

      {/* Proceed to Final Summary */}
      <div style={{marginTop:20}}>
        {allDone?(
          <div style={{animation:"up .4s ease"}}>
            <div style={{background:"rgba(50,200,100,.07)",border:"1px solid rgba(50,200,100,.25)",borderRadius:12,padding:"14px 16px",marginBottom:14,textAlign:"center"}}>
              <div style={{fontSize:28,marginBottom:6}}>✦</div>
              <div style={{color:"#7CFC00",fontSize:14,fontWeight:700,fontFamily:"Georgia,serif",marginBottom:4}}>All 5 Decks Complete!</div>
              <div style={{color:G.cream,fontSize:12,opacity:.7,lineHeight:1.6}}>Your complete 5-deck reading is ready. Proceed to the Final Reading Summary.</div>
            </div>
            <Btn onClick={onComplete} full>✦ Proceed to Final Reading Summary ✦</Btn>
          </div>
        ):(
          <div style={{background:"rgba(201,168,76,.05)",border:"1px solid rgba(201,168,76,.15)",borderRadius:12,padding:"13px 15px",textAlign:"center"}}>
            <div style={{color:G.muted,fontSize:12,marginBottom:10,lineHeight:1.6}}>
              Complete all 5 decks to unlock the Final Reading Summary.
            </div>
            <div style={{display:"flex",justifyContent:"center",gap:6,flexWrap:"wrap"}}>
              {DECKS.map(d=>{
                const done=session.ds?.[d.id]?.status==="completed";
                return <div key={d.id} style={{display:"flex",alignItems:"center",gap:5,padding:"4px 9px",borderRadius:20,background:done?"rgba(50,200,100,.1)":"rgba(255,100,100,.07)",border:`1px solid ${done?"rgba(50,200,100,.25)":"rgba(255,100,100,.18)"}`}}><span style={{fontSize:12}}>{d.emoji}</span><span style={{color:done?"#7CFC00":"#ff9090",fontSize:10}}>{done?"✓":""} {d.subtitle}</span></div>;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// WELCOME
// ══════════════════════════════════════════════════════════════
function Welcome({onStart,onResume,hasSession,restored}) {
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh",padding:"24px 20px",textAlign:"center"}}>
      <div style={{fontSize:64,animation:"flt 3s infinite",marginBottom:6}}>🔮</div>
      <div style={{fontFamily:"Georgia,serif",fontSize:9.5,color:G.gold,letterSpacing:6,textTransform:"uppercase",marginBottom:5,opacity:.7}}>Sacred Consultation System</div>
      <h1 style={{fontFamily:"Georgia,serif",fontSize:28,color:G.gold,margin:"0 0 4px",lineHeight:1.2,textShadow:"0 0 30px rgba(201,168,76,.44)"}}>Mystical 5-Deck<br/>Reading System</h1>
      <Rule/>
      <p style={{color:G.cream,fontSize:13,lineHeight:1.75,maxWidth:300,opacity:.78,margin:"10px 0 20px"}}>A complete 5-deck spiritual consultation covering Current Energy, Root Cause, Cosmic Influences, Action Plan and Potential Outcome.</p>
      {restored&&<div style={{background:"rgba(50,200,100,.07)",border:"1px solid rgba(50,200,100,.25)",borderRadius:9,padding:"8px 14px",color:"#7CFC00",fontSize:12,marginBottom:16,maxWidth:280}}>↩ Previous session restored successfully.</div>}
      <div style={{display:"flex",gap:7,marginBottom:24,flexWrap:"wrap",justifyContent:"center"}}>
        {DECKS.map(d=><div key={d.id} style={{background:`${d.color}88`,border:`1px solid ${d.light}30`,borderRadius:20,padding:"4px 10px",fontSize:9.5,color:G.cream,display:"flex",alignItems:"center",gap:4}}><span>{d.emoji}</span><span>{d.subtitle}</span></div>)}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:11,width:"100%",maxWidth:260}}>
        <Btn onClick={onStart} full>✦ Start New Session</Btn>
        {hasSession&&<Btn onClick={onResume} outline full>↩ Resume Session</Btn>}
      </div>
      <p style={{color:G.cream,fontSize:10,opacity:.18,marginTop:18,lineHeight:1.6}}>"A structured mirror for clarity, root cause and a concrete action plan."</p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// SECTION 1 — CLIENT EDUCATION
// ══════════════════════════════════════════════════════════════
function Section1({onNext,onSkip}) {
  return (
    <div style={{padding:"20px 16px",animation:"up .4s ease"}}>
      <Dots step={1} total={4}/>
      <div style={{textAlign:"center",marginBottom:16}}>
        <div style={{fontSize:34,marginBottom:5}}>🌙</div>
        <Lbl style={{letterSpacing:4,textAlign:"center",marginBottom:4}}>Section 1</Lbl>
        <h2 style={{fontFamily:"Georgia,serif",color:G.gold,fontSize:21,margin:0}}>Client Education</h2>
        <Rule/>
        <p style={{color:G.cream,fontSize:12,opacity:.6,margin:0}}>Preparing the client before the reading begins</p>
      </div>
      <Box style={{marginBottom:13}}>
        <Lbl>✦ Opening Script</Lbl>
        <p style={{color:G.cream,fontSize:13,lineHeight:1.85,fontStyle:"italic",margin:0}}>"Welcome, and thank you sincerely for trusting me with your questions today. This is a sacred, confidential and non-judgmental space. Everything shared here remains between us.<br/><br/>The purpose of this consultation is to provide clarity, perspective and practical guidance — not to predict a fixed future, but to illuminate the current energies at work and empower you to make aligned choices."</p>
      </Box>
      <Box style={{marginBottom:13}}>
        <Lbl>✦ Ethical Disclaimer</Lbl>
        {["This reading is for guidance and spiritual insight only","It does not replace professional medical, legal or financial advice","All information shared is held in complete confidence","You retain complete free will — cards show possibility, not fixed destiny","You are encouraged to take what resonates and leave what does not"].map((item,i)=><div key={i} style={{display:"flex",gap:9,marginBottom:7,alignItems:"flex-start"}}><span style={{color:G.gold,flexShrink:0}}>✦</span><span style={{color:G.cream,fontSize:12,lineHeight:1.6}}>{item}</span></div>)}
      </Box>
      <div style={{marginBottom:13}}>
        <Lbl>✦ The 5-Deck Reading System</Lbl>
        {DECKS.map((d,i)=>(
          <div key={d.id} style={{display:"flex",gap:10,padding:"11px 13px",marginBottom:7,background:`${d.color}66`,border:`1px solid ${d.light}33`,borderRadius:12,animation:`up .3s ${i*.07}s ease both`}}>
            <span style={{fontSize:20,flexShrink:0}}>{d.emoji}</span>
            <div><div style={{color:d.light,fontSize:12,fontWeight:700,fontFamily:"Georgia,serif"}}>Step {d.step} — {d.name}</div><div style={{color:G.gold,fontSize:9,marginBottom:2}}>{d.subtitle} · {d.purpose}</div><div style={{color:G.cream,fontSize:11,opacity:.78,lineHeight:1.5}}>{d.desc}</div></div>
          </div>
        ))}
      </div>
      <Box style={{marginBottom:22}}>
        <Lbl>✦ How the Reading Works</Lbl>
        <div style={{display:"flex",alignItems:"center",gap:4,flexWrap:"wrap",justifyContent:"center",marginBottom:9}}>
          {DECKS.map((d,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:4}}><div style={{background:`${d.color}66`,border:`1px solid ${d.light}30`,borderRadius:20,padding:"3px 9px",fontSize:10,color:d.light}}>{d.subtitle}</div>{i<DECKS.length-1&&<span style={{color:G.gold,opacity:.3,fontSize:11}}>→</span>}</div>)}
        </div>
        <p style={{color:G.cream,fontSize:11,opacity:.52,margin:0,textAlign:"center",lineHeight:1.6}}>Each deck builds on the last — one complete reading, five dimensions of insight.</p>
      </Box>
      <div style={{display:"flex",gap:10,justifyContent:"center"}}>
        <Btn onClick={onSkip} outline sm>Skip →</Btn>
        <Btn onClick={onNext}>Continue ✦</Btn>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// SECTION 2 — CLIENT INTAKE
// ══════════════════════════════════════════════════════════════
function Section2({session,onUpdate,onNext}) {
  const [areas,setAreas]=useState(session.lifeAreas||[]);
  const [q,setQ]=useState(session.question||"");
  const [err,setErr]=useState("");
  const selected=LIFE_AREAS.filter(a=>areas.includes(a.id));
  const valid=areas.length>0&&q.trim().length>=20&&q.trim().length<=1000;

  function toggle(id){setAreas(p=>p.includes(id)?[]:[id]);setErr("");}
  function go(){
    if(areas.length===0){setErr("Please select a life area.");return;}
    if(q.trim().length<20){setErr(`Please describe your question (${20-q.trim().length} more characters needed).`);return;}
    onUpdate({lifeAreas:areas,question:q.trim()});onNext();
  }

  return (
    <div style={{padding:"20px 16px",animation:"up .4s ease"}}>
      <Dots step={2} total={4}/>
      <div style={{textAlign:"center",marginBottom:16}}>
        <div style={{fontSize:34,marginBottom:5}}>🌿</div>
        <Lbl style={{letterSpacing:4,textAlign:"center",marginBottom:4}}>Section 2</Lbl>
        <h2 style={{fontFamily:"Georgia,serif",color:G.gold,fontSize:21,margin:0}}>Client Intake &amp; Grounding</h2>
        <Rule/>
        <p style={{color:G.cream,fontSize:12,opacity:.6,margin:0}}>Select your area of focus and describe your question</p>
      </div>

      <div style={{marginBottom:18}}>
        <Lbl>✦ Life Area</Lbl>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
          {LIFE_AREAS.map(a=>{const sel=areas.includes(a.id);return(
            <button key={a.id} className="abtn" onClick={()=>toggle(a.id)} style={{
              background:sel?`${a.color}cc`:`${a.color}88`,
              border:`1.5px solid ${sel?G.gold:`${a.color}cc`}`,
              borderRadius:11,padding:"10px 8px",cursor:"pointer",
              display:"flex",alignItems:"center",gap:7,transition:"all .22s",
              boxShadow:sel?`0 3px 14px ${a.color}66`:`0 2px 8px ${a.color}44`}}>
              <span style={{fontSize:17}}>{a.emoji}</span>
              <span style={{color:sel?G.gold:G.cream,fontSize:10.5,fontWeight:sel?700:600,textAlign:"left",lineHeight:1.3,flex:1,textShadow:"0 1px 3px rgba(0,0,0,.8)"}}>{a.label}</span>
              {sel&&<span style={{color:G.gold,fontSize:11,flexShrink:0}}>✓</span>}
            </button>
          );})}
        </div>
        {areas.length>0&&<div style={{marginTop:9,display:"flex",flexWrap:"wrap",gap:5}}><span style={{color:G.muted,fontSize:11}}>Selected:</span>{areas.map(id=>{const a=LIFE_AREAS.find(x=>x.id===id);return <Tag key={id}>{a?.emoji} {a?.label}</Tag>;})}</div>}
      </div>

      <div style={{marginBottom:18}}>
        <Lbl>✦ What would you like guidance on today?</Lbl>
        <textarea value={q} onChange={e=>{setQ(e.target.value);setErr("");}}
          placeholder="Describe your situation and question in your own words..."
          style={{width:"100%",minHeight:100,background:"rgba(16,5,35,.9)",border:`1.5px solid ${q.trim().length>=20?G.gold:"rgba(201,168,76,.2)"}`,borderRadius:11,padding:13,color:G.cream,fontSize:13,lineHeight:1.65,resize:"none",outline:"none",transition:"border .2s"}}/>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
          <span style={{color:q.trim().length>=20?"#7CFC00":"rgba(245,230,200,.28)",fontSize:11}}>{q.trim().length>=20?"✓ Ready to proceed":`${20-q.trim().length} more characters needed`}</span>
          <span style={{color:q.length>900?"#ffaa44":"rgba(245,230,200,.26)",fontSize:11}}>{q.length}/1000</span>
        </div>
      </div>

      {selected.length>0&&(
        <Box style={{marginBottom:18}}>
          <Lbl>{selected[0]?.emoji} Suggested Questions — {selected[0]?.label}</Lbl>
          <div style={{display:"flex",flexDirection:"column",gap:5}}>
            {[...new Set(selected.flatMap(a=>a.qs))].slice(0,7).map((qs,i)=>(
              <button key={i} className="qbtn" onClick={()=>{setQ(qs);setErr("");}} style={{background:"rgba(201,168,76,.05)",border:"1px solid rgba(201,168,76,.13)",borderRadius:8,padding:"7px 11px",cursor:"pointer",textAlign:"left",color:G.cream,fontSize:12,lineHeight:1.5,transition:"all .15s"}}>
                <span style={{color:G.gold,marginRight:5}}>›</span>{qs}
              </button>
            ))}
          </div>
          <div style={{color:G.cream,fontSize:10,opacity:.3,marginTop:6}}>Tap any suggestion or write your own above</div>
        </Box>
      )}

      {err&&<div style={{color:"#FF6B6B",fontSize:12,textAlign:"center",marginBottom:10,padding:"8px 13px",background:"rgba(255,100,100,.07)",border:"1px solid rgba(255,100,100,.22)",borderRadius:8}}>⚠ {err}</div>}
      <div style={{textAlign:"center"}}><Btn onClick={go} disabled={!valid}>Proceed to Reading Journey ✦</Btn></div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// SECTION 4 — FINAL READING SUMMARY
// ══════════════════════════════════════════════════════════════
function Section4({session,onNewSession}) {
  const [loading,setLoading]=useState(false);
  const [summary,setSummary]=useState(session.summary||"");
  const [exported,setExported]=useState(false);

  useEffect(()=>{if(!summary)genSummary();},[]);

  async function genSummary(){
    setLoading(true);
    try{
      const areaLabels=(session.lifeAreas||[]).map(id=>LIFE_AREAS.find(a=>a.id===id)?.label||id).join(", ");
      const parts=DECKS.map(d=>{
        const ds=session.ds?.[d.id];
        if(!ds||ds.status!=="completed"||!ds.interpretations?.length) return `${d.emoji} ${d.name}: Not completed`;
        const names=ds.interpretations.map((c,i)=>c.error?"[unread]":c.cardName).join(", ");
        return `${d.emoji} ${d.name} (${d.purpose}):\nCards drawn: ${names}\nDeck summary: ${(ds.summary||"").substring(0,280)}`;
      }).join("\n\n");

      const prompt=`You are a professional mystical card reader generating a comprehensive final consultation report.

Client Life Area(s): ${areaLabels}
Client Question: "${session.question}"

Five-Deck Reading Results:
${parts}

Generate a comprehensive professional final reading narrative covering:
1. Current Situation — from Crystal Reading
2. Root Cause — from Egyptian Oracle  
3. Key Influences — from Astrology Reading
4. Recommended Actions — from Magic Oracle
5. Potential Outcome — from Mystical Realm Tarot
6. Key Message for the Client

This must read as ONE coherent professional consultation — not five separate summaries. Reference specific card names throughout. Under 400 words. Warm, professional, mystical, empowering. No bullet points. Flowing paragraphs only.`;

      const res=await fetch(ORACLE_ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt})});
      const txt=await res.text().catch(()=>"");
      let data={};try{data=JSON.parse(txt);}catch(_){data={error:txt.substring(0,200)};}
      if(!res.ok||data.error) throw new Error(data.error||`HTTP ${res.status}`);
      setSummary(data.result||fallback());
    }catch(_){setSummary(fallback());}
    setLoading(false);
  }

  function fallback(){
    return `Let me bring everything together into one complete reading for you.\n\nYour Crystal Reading revealed the current emotional truth you are carrying beneath the surface of your situation. The Egyptian Oracle then uncovered the deeper spiritual root cause — the soul lesson being offered to you at this time. Your Astrology Reading illuminated the cosmic forces and timing actively shaping your experience, while the Magic Oracle translated all of this wisdom into specific, practical action steps.\n\nFinally, the Mystical Tarot mapped the most probable path ahead, showing you where your journey leads if you choose to act on the guidance received today.\n\nRemember: you retain complete free will. These cards reflect the current energetic landscape and most probable trajectory — not a fixed or unchangeable destiny. Every action you take has the power to shape your outcome.\n\nThank you for the trust and openness you brought to this reading. ✦`;
  }

  function exportReport(){
    const date=new Date().toLocaleDateString("en-SG",{year:"numeric",month:"long",day:"numeric"});
    const areaLabels=(session.lifeAreas||[]).map(id=>LIFE_AREAS.find(a=>a.id===id)?.label||id).join(", ");
    const lines=["═".repeat(58),"     MYSTICAL 5-DECK READING — CONSULTATION REPORT","═".repeat(58),"",`Date       : ${date}`,`Session ID : ${session.id}`,`Life Area  : ${areaLabels}`,"",`CLIENT QUESTION`,`${"─".repeat(40)}`,session.question,""];
    DECKS.forEach(d=>{
      const ds=session.ds?.[d.id];
      lines.push("═".repeat(58));lines.push(`${d.emoji}  ${d.name.toUpperCase()} — ${d.purpose}`);lines.push("─".repeat(40));
      if(ds?.interpretations?.length){
        ds.interpretations.forEach((c,i)=>{lines.push(`\nCard ${d.cards[i]?.n} — ${d.cards[i]?.role}`);if(c.error){lines.push("[Could not be read]");return;}lines.push(`Name: ${c.cardName}`);if(c.keywords?.length)lines.push(`Keywords: ${c.keywords.join(", ")}`);lines.push(`Interpretation: ${c.meaning}`);});
        if(ds.summary){lines.push("\nSUGGESTED ANSWER");lines.push(ds.summary);}
      }else{lines.push("[Not completed]");}
      lines.push("");
    });
    lines.push("═".repeat(58));lines.push("FINAL READING SUMMARY");lines.push("═".repeat(58));lines.push("");lines.push(summary||"");lines.push("");
    lines.push("═".repeat(58));lines.push("CLOSING MESSAGE");lines.push("═".repeat(58));lines.push("");
    lines.push("You hold within you the wisdom, strength and agency to create the life you desire.");lines.push("The cards have illuminated your path — the next step is yours to take.");lines.push("Trust yourself. Trust the process. Trust the journey. ✦");lines.push("");lines.push(`Generated by Mystical 5-Deck Reading System · ${date}`);
    const blob=new Blob([lines.join("\n")],{type:"text/plain;charset=utf-8"});
    const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`mystical_reading_${session.id}.txt`;a.click();URL.revokeObjectURL(url);
    setExported(true);
  }

  const areaLabels=(session.lifeAreas||[]).map(id=>LIFE_AREAS.find(a=>a.id===id)?.label||id);

  return (
    <div style={{padding:"20px 16px 36px",animation:"up .4s ease"}}>
      <Dots step={4} total={4}/>
      <div style={{textAlign:"center",marginBottom:20}}>
        <div style={{fontSize:44,animation:"flt 3s infinite",display:"inline-block",marginBottom:6}}>✦</div>
        <Lbl style={{letterSpacing:4,textAlign:"center",marginBottom:5}}>Section 4</Lbl>
        <h2 style={{fontFamily:"Georgia,serif",color:G.gold,fontSize:21,margin:0}}>Complete Reading Report</h2>
        <Rule/>
        <p style={{color:G.cream,fontSize:12,opacity:.58,margin:0}}>All 5 decks analysed together as one complete consultation</p>
      </div>

      <Box style={{marginBottom:14}}>
        <Lbl mb={6}>Consultation Details</Lbl>
        <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:8}}>{areaLabels.map((l,i)=><Tag key={i}>{l}</Tag>)}</div>
        <div style={{color:G.cream,fontSize:12,fontStyle:"italic",lineHeight:1.65}}>"{session.question}"</div>
        <div style={{color:G.muted,fontSize:10,marginTop:6}}>Session: {session.id} · {new Date(session.createdAt||Date.now()).toLocaleDateString()}</div>
      </Box>

      {/* 5-deck recap */}
      <div style={{marginBottom:18}}>
        <Lbl>✦ 5-Deck Journey Recap</Lbl>
        {DECKS.map((d,i)=>{
          const ds=session.ds?.[d.id];
          const cardNames=ds?.interpretations?.filter(c=>!c.error).map(c=>c.cardName).join(" · ")||"";
          return(
            <div key={d.id} style={{background:`${d.color}66`,border:`1px solid ${d.light}33`,borderRadius:11,padding:"10px 13px",marginBottom:7,animation:`up .3s ${i*.08}s ease both`}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:cardNames?4:0}}>
                <span style={{fontSize:16,flexShrink:0}}>{d.emoji}</span>
                <div style={{flex:1}}><div style={{color:d.light,fontSize:10,fontWeight:700,letterSpacing:.5}}>{d.purpose.toUpperCase()} — {d.name}</div></div>
                <div style={{color:ds?.status==="completed"?"#7CFC00":"#ff9090",fontSize:11}}>{ds?.status==="completed"?"✓":"○"}</div>
              </div>
              {cardNames&&<div style={{color:G.gold,fontSize:11,fontStyle:"italic",paddingLeft:24,lineHeight:1.5}}>{cardNames}</div>}
            </div>
          );
        })}
      </div>

      {/* Final narrative */}
      <Box style={{marginBottom:20,border:`1px solid ${G.gold}44`}}>
        <Lbl>✦ Comprehensive Reading Report</Lbl>
        {loading?<Spin label="Generating your complete reading narrative"/>:
          <div style={{color:G.cream,fontSize:13,lineHeight:1.92,whiteSpace:"pre-wrap",fontStyle:"italic"}}>{summary}</div>}
      </Box>

      {/* Professional closing */}
      <Box style={{marginBottom:22,background:"rgba(201,168,76,.05)",border:`1px solid ${G.gold}20`}}>
        <Lbl>✦ Professional Closing</Lbl>
        {[
          {t:"Thank you for your trust",     b:"Thank you for the openness, courage and trust you brought to this reading. It is a privilege to hold space for your journey."},
          {t:"You are empowered",            b:"You now have clarity, root cause, influencing factors, a clear action plan and an understanding of where you are heading. Use this wisdom well."},
          {t:"Your destiny is your own",     b:"These cards reflect the current energetic landscape. Nothing here is fixed. Your free will remains absolute at every moment."},
          {t:"Trust the journey",            b:"You hold within you everything you need. Trust yourself. Trust the process. The next step is yours to take. Go well. ✦"},
        ].map((r,i)=>(
          <div key={i} style={{display:"flex",gap:11,marginBottom:i<3?12:0,alignItems:"flex-start"}}>
            <div style={{width:24,height:24,borderRadius:"50%",background:"rgba(201,168,76,.14)",border:`1px solid ${G.gold}`,display:"flex",alignItems:"center",justifyContent:"center",color:G.gold,fontSize:11,fontWeight:700,flexShrink:0}}>{i+1}</div>
            <div><div style={{color:G.gold,fontSize:12,fontWeight:700,marginBottom:2}}>{r.t}</div><div style={{color:G.cream,fontSize:11,lineHeight:1.65,opacity:.8}}>{r.b}</div></div>
          </div>
        ))}
      </Box>

      <div style={{display:"flex",flexDirection:"column",gap:11,paddingBottom:12,textAlign:"center"}}>
        <Btn onClick={exportReport} teal full>{exported?"✓ Report Exported":"⬇ Export Consultation Report"}</Btn>
        <Btn onClick={onNewSession} full>✦ Start New Session ✦</Btn>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ROOT APP
// ══════════════════════════════════════════════════════════════
export default function App() {
  const [screen,   setScreen]   = useState("welcome");
  const [session,  setSession]  = useState(()=>makeSession());
  const [restored, setRestored] = useState(false);

  // Load saved session on mount
  useEffect(()=>{
    const saved=Store.load();
    if(saved&&(saved.question||Object.values(saved.ds||{}).some(d=>d.status!=="not_started"))){
      setSession({...makeSession(),...saved,ds:{...makeSession().ds,...saved.ds}});
      setRestored(true);
    }
  },[]);

  // Autosave every 30s
  useEffect(()=>{
    const t=setInterval(()=>Store.save(session),30000);
    return()=>clearInterval(t);
  },[session]);

  const hasSession=!!(session.question||Object.values(session.ds||{}).some(d=>d.status!=="not_started"));

  function startNew(){
    Store.clear();
    const s=makeSession();
    setSession(s); setRestored(false);
    Store.save(s); setScreen("s1");
  }

  function resume(){
    const completedN=DECKS.filter(d=>session.ds?.[d.id]?.status==="completed").length;
    if(completedN>=DECKS.length){setScreen("s4");return;}
    if(completedN>0||session.question){setScreen("s3");return;}
    if(session.lifeAreas?.length>0){setScreen("s2");return;}
    setScreen("s1");
  }

  function updateSession(u){
    setSession(p=>{const n={...p,...u};Store.save(n);return n;});
  }

  function saveDeck(deckId,data){
    setSession(p=>{
      const n={...p,ds:{...p.ds,[deckId]:{...p.ds?.[deckId],...data}}};
      Store.save(n);
      return n;
    });
  }

  function goBack(){
    if(screen==="s1"){setScreen("welcome");return;}
    if(screen==="s2"){setScreen("s1");return;}
    if(screen==="s3"){setScreen("s2");return;}
    if(screen==="s4"){setScreen("s3");return;}
  }

  return (
    <div style={{minHeight:"100vh",background:`radial-gradient(ellipse at 22% 18%,#1A0A3C 0%,#08001C 55%,${G.bg} 100%)`,color:G.cream,fontFamily:"Palatino Linotype,Palatino,Georgia,serif",position:"relative",overflowX:"hidden"}}>
      <Stars/>
      <div style={{position:"relative",zIndex:1,maxWidth:480,margin:"0 auto"}}>

        {/* Back button */}
        {screen!=="welcome"&&(
          <div style={{position:"fixed",top:12,left:12,zIndex:300}}>
            <button onClick={goBack} style={{background:"rgba(16,5,35,.95)",border:"1px solid rgba(201,168,76,.22)",borderRadius:"50%",width:34,height:34,cursor:"pointer",color:G.gold,fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(8px)"}}>←</button>
          </div>
        )}

        {screen==="welcome"&&<Welcome onStart={startNew} onResume={resume} hasSession={hasSession} restored={restored}/>}
        {screen==="s1"&&<Section1 onNext={()=>setScreen("s2")} onSkip={()=>setScreen("s2")}/>}
        {screen==="s2"&&<Section2 session={session} onUpdate={updateSession} onNext={()=>setScreen("s3")}/>}
        {screen==="s3"&&<Section3 session={session} onSaveDeck={saveDeck} onComplete={()=>setScreen("s4")}/>}
        {screen==="s4"&&<Section4 session={session} onNewSession={startNew}/>}
      </div>
    </div>
  );
}
