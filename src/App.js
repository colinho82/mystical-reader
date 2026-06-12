import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════
// MYSTICAL 5-DECK READING SYSTEM v4
// Backend: /.netlify/functions/oracle (DeepSeek API)
// Setup: Add DEEPSEEK_KEY to Netlify → Environment variables
// ═══════════════════════════════════════════════════════════════

const ORACLE_ENDPOINT = "/.netlify/functions/oracle";
const SESSION_KEY     = "mystical_v4_session";
const IMAGES_KEY      = "mystical_v4_images";

// ── THEME ──────────────────────────────────────────────────────
const T = {
  bg:      "#05000E",
  gold:    "#C9A84C",
  goldLt:  "#E8C464",
  cream:   "#F5E6C8",
  muted:   "rgba(245,230,200,0.48)",
  dim:     "rgba(245,230,200,0.22)",
  card:    "rgba(16,5,35,0.92)",
  border:  "rgba(201,168,76,0.27)",
  purple:  "#1E0A3C",
};

// ── LIFE AREAS ─────────────────────────────────────────────────
const LIFE_AREAS = [
  { id:"love",    emoji:"💕", label:"Love & Relationships",
    qs:["How does this person feel about me?","What is the future of this relationship?","What lesson am I learning from this relationship?","What is blocking me from finding love?","Will my relationship improve or should I move on?","Why do I keep repeating the same relationship patterns?"] },
  { id:"career",  emoji:"🌟", label:"Career & Work",
    qs:["Should I remain in my current role or leave?","Is a promotion approaching for me?","What is preventing my career growth?","Should I start my own business?","What hidden talent am I not fully using?","What career path is truly aligned with my purpose?"] },
  { id:"finance", emoji:"💰", label:"Finance & Wealth",
    qs:["What is blocking my financial abundance?","What is my core money wound or belief?","Is this investment or financial decision wise?","How do I break the cycle of financial struggle?","What opportunity am I missing financially?","What mindset shift would most transform my finances?"] },
  { id:"family",  emoji:"🏠", label:"Family",
    qs:["How do I improve my relationship with my family?","How do I set healthy boundaries without guilt?","Why do the same family conflicts keep repeating?","How do I heal a broken family bond?","Am I enabling someone in my family without realising it?","How do I balance family obligations with my own needs?"] },
  { id:"health",  emoji:"🌿", label:"Health & Wellbeing",
    qs:["What does my body need most right now?","What is the root cause of my stress or anxiety?","How do I improve my mental and emotional health?","What habits are hurting my wellbeing most?","How do I restore my energy and vitality?","What healing is most needed at this time in my life?"] },
  { id:"spirit",  emoji:"🔮", label:"Spiritual Growth",
    qs:["Am I following my intuition or my ego?","What sign or message am I currently overlooking?","How do I deepen my spiritual practice?","Am I on my true soul path?","What spiritual gifts am I not fully using?","How do I reconnect more deeply with my higher self?"] },
  { id:"growth",  emoji:"🌱", label:"Personal Development",
    qs:["What truth am I currently avoiding?","Why do I self-sabotage when things go well?","What fear is most holding me back from growth?","How do I build more genuine self-confidence?","What old pattern or belief needs to change?","What is the next chapter of my personal growth?"] },
  { id:"biz",     emoji:"💼", label:"Business",
    qs:["What is blocking my business growth right now?","Should I pursue this business idea or opportunity?","How do I attract better clients or customers?","What business strategy should I focus on now?","What is my unique competitive strength?","How do I successfully scale my business?"] },
  { id:"purpose", emoji:"✨", label:"Life Purpose",
    qs:["What is my true life purpose?","Am I living in full alignment with my soul?","What contribution am I here to make?","What is holding me back from living my purpose?","How do I find more meaning and fulfilment?","What does my highest self most want me to know?"] },
  { id:"other",   emoji:"🌀", label:"Other",
    qs:["What do I most need to know right now?","What is the universe currently trying to tell me?","What should I focus on in this season of my life?","What is ready to be released from my life?","What new beginning is available to me now?","What is my greatest lesson at this time?"] },
];

// ── DECK CONFIG ────────────────────────────────────────────────
const DECKS = [
  {
    id:"crystal", step:1, emoji:"💎",
    name:"Crystal Reading Deck",
    subtitle:"Current Energy",
    purpose:"What is Happening",
    color:"#5A0A30", light:"#FF6B9D",
    description:"Reveals the current emotional energy and truth the client is carrying beneath the surface.",
    instruction:"Shuffle the Crystal Deck and intuitively select 3 cards, focusing on your emotional state right now.",
    cards:[
      { id:"c1", n:1, role:"Current Emotional State",                      desc:"What energy or emotion are you carrying right now?",            eg:"Rose Quartz, Citrine, Amethyst, Obsidian" },
      { id:"c2", n:2, role:"Hidden Challenge",                              desc:"What emotional wound or hidden block needs attention?",         eg:"Black Tourmaline, Malachite, Labradorite" },
      { id:"c3", n:3, role:"Healing Opportunity",                           desc:"What inner strength or healing resource is available to you?",  eg:"Clear Quartz, Selenite, Moonstone, Jade" },
    ]
  },
  {
    id:"egyptian", step:2, emoji:"👁",
    name:"Egyptian Oracle Deck",
    subtitle:"Root Cause",
    purpose:"Why is it Happening",
    color:"#3A1500", light:"#FF8C42",
    description:"Uncovers the spiritual root cause, karmic patterns and soul lessons behind the situation.",
    instruction:"Hold the Egyptian Oracle deck, close your eyes and take 3 deep breaths. Ask silently: 'Show me the root cause and what my soul needs to learn.' Draw 3 cards.",
    cards:[
      { id:"e1", n:1, role:"Root Cause / Past Influence",                  desc:"What is the underlying spiritual cause of this situation?",     eg:"Osiris, Isis, Anubis, Ra, Thoth" },
      { id:"e2", n:2, role:"Current Lesson",                               desc:"What soul lesson is being presented in this situation?",         eg:"Hathor, Sekhmet, Horus, Ma'at, Bastet" },
      { id:"e3", n:3, role:"Hidden Influence / Transformation Available",  desc:"What unseen force or transformation is available?",             eg:"Ptah, Khnum, Nephthys, Nut, Khepri" },
    ]
  },
  {
    id:"astrology", step:3, emoji:"🌙",
    name:"Astrology Deck",
    subtitle:"Influences",
    purpose:"What Influences Exist",
    color:"#0A0A3A", light:"#7B8CDE",
    description:"Reveals the external and internal cosmic forces, timing and influences shaping the situation.",
    instruction:"Separate into 3 piles: Planets, Zodiac Signs, Houses. Shuffle each pile. Draw 1 card from each pile.",
    cards:[
      { id:"a1", n:1, role:"External / Current Influence",                 desc:"What outside force or current energy is most affecting you?",   eg:"Saturn, Venus, Jupiter, Mars, Mercury" },
      { id:"a2", n:2, role:"Internal Influence / Opportunity",             desc:"What inner pattern or emerging opportunity is at play?",        eg:"Scorpio, Libra, Capricorn, Aries, Pisces" },
      { id:"a3", n:3, role:"Cosmic Guidance / Timing / Challenges",        desc:"What cosmic timing or challenge should you know about?",        eg:"7th House, 10th House, 2nd House, 4th House" },
    ]
  },
  {
    id:"magic", step:4, emoji:"✨",
    name:"Magic Oracle Deck",
    subtitle:"Action Plan",
    purpose:"What Should Be Done",
    color:"#1A0840", light:"#B388FF",
    description:"Provides the practical spiritual action steps the client should take to shift their situation.",
    instruction:"Shuffle the Magic Oracle deck while asking: 'What specific actions will serve this person most right now?' Select 3 cards with clear intention.",
    cards:[
      { id:"m1", n:1, role:"Immediate Action",                             desc:"What is the single most important step to take right now?",     eg:"Self-Love Ritual, Release Spell, Grounding" },
      { id:"m2", n:2, role:"Recommended Focus / Mindset Shift",            desc:"Where should energy be directed? What belief must change?",     eg:"Abundance Ritual, Clarity Spell, Protection" },
      { id:"m3", n:3, role:"Spiritual Guidance / Manifestation Focus",     desc:"What spiritual practice or intention supports transformation?", eg:"Moon Magic, Fire Ritual, New Moon Intention" },
    ]
  },
  {
    id:"tarot", step:5, emoji:"🌀",
    name:"Mystical Realm Tarot Deck",
    subtitle:"Potential Outcome",
    purpose:"Most Likely Direction",
    color:"#1A003A", light:"#CE93D8",
    description:"Maps the most probable direction — current standing, obstacles, opportunities, wisest advice and likely outcome.",
    instruction:"Shuffle the full Tarot deck while holding the client's question in mind. The client may cut the deck. Draw 5 cards and lay them face down before turning each one over.",
    cards:[
      { id:"t1", n:1, role:"Current Situation",                            desc:"Where does the client actually stand right now?",               eg:"The Moon, The Fool, Three of Cups, The Star" },
      { id:"t2", n:2, role:"Obstacles",                                    desc:"What is working against the client?",                           eg:"The Tower, Five of Swords, The Devil, Eight of Cups" },
      { id:"t3", n:3, role:"Opportunity",                                  desc:"What hidden resource or opportunity wants to help?",            eg:"The Star, Ace of Cups, The Sun, Six of Wands" },
      { id:"t4", n:4, role:"Advice",                                       desc:"What is the single wisest course of action?",                   eg:"The Hermit, Strength, The Magician, Justice" },
      { id:"t5", n:5, role:"Final Guidance / Likely Outcome",              desc:"Where does this path most likely lead?",                        eg:"The World, Ten of Pentacles, Ace of Wands" },
    ]
  },
];

// ── EMPTY STATE FACTORY ────────────────────────────────────────
function makeSession() {
  const ds = {};
  DECKS.forEach(d => {
    ds[d.id] = { status:"not_started", images:{}, names:{}, confidence:{}, keywords:{}, interpretations:[], summary:"", completedAt:null };
  });
  return { id: Date.now().toString(), lifeAreas:[], question:"", ds, summary:"", createdAt:new Date().toISOString() };
}

// ── STORAGE ────────────────────────────────────────────────────
const Store = {
  saveSession(s) {
    try {
      const slim = { ...s, ds: {} };
      Object.entries(s.ds).forEach(([id, d]) => { slim.ds[id] = { ...d, images:{} }; });
      localStorage.setItem(SESSION_KEY, JSON.stringify(slim));
    } catch(_) {}
  },
  loadSession() {
    try { const r = localStorage.getItem(SESSION_KEY); return r ? JSON.parse(r) : null; } catch(_) { return null; }
  },
  saveImages(deckId, images) {
    try {
      const all = JSON.parse(localStorage.getItem(IMAGES_KEY)||"{}");
      all[deckId] = images;
      localStorage.setItem(IMAGES_KEY, JSON.stringify(all));
    } catch(_) {}
  },
  loadImages() {
    try { return JSON.parse(localStorage.getItem(IMAGES_KEY)||"{}"); } catch(_) { return {}; }
  },
  clear() {
    try { localStorage.removeItem(SESSION_KEY); localStorage.removeItem(IMAGES_KEY); } catch(_) {}
  },
};

// ── STAR FIELD ─────────────────────────────────────────────────
const STARS = Array.from({length:55},(_,i)=>({ id:i, x:Math.random()*100, y:Math.random()*100, s:Math.random()*2+0.4, d:Math.random()*5, r:Math.random()*3+2 }));
function Stars() {
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0}}>
      {STARS.map(s => <div key={s.id} style={{position:"absolute",left:`${s.x}%`,top:`${s.y}%`,width:s.s,height:s.s,borderRadius:"50%",background:"#fff",animation:`tw ${s.r}s ${s.d}s infinite alternate`}}/>)}
      <style>{`
        @keyframes tw    { from{opacity:.03} to{opacity:.82} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
        @keyframes glow  { 0%,100%{box-shadow:0 0 12px 2px rgba(201,168,76,.22)} 50%{box-shadow:0 0 26px 7px rgba(201,168,76,.5)} }
        @keyframes up    { from{opacity:0;transform:translateY(13px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fi    { from{opacity:0} to{opacity:1} }
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.07)} }
        @keyframes spin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes shim  { 0%,100%{opacity:.4} 50%{opacity:1} }
        * { box-sizing:border-box }
        input,textarea,button { font-family:inherit }
        ::-webkit-scrollbar { width:0 }
        .hov:hover { opacity:.85 }
        .qbtn:hover { background:rgba(201,168,76,.12)!important; border-color:rgba(201,168,76,.36)!important }
      `}</style>
    </div>
  );
}

// ── UI PRIMITIVES ──────────────────────────────────────────────
function Btn({children,onClick,disabled,sm,outline,ghost,danger,purple,teal,full,style:sx}) {
  const bg = danger?"rgba(160,20,20,.32)":purple?"rgba(90,50,155,.32)":teal?"rgba(20,120,120,.32)":
             outline||ghost?"transparent":disabled?"#180830":`linear-gradient(135deg,${T.gold},${T.goldLt},${T.gold})`;
  const col= disabled?"#3a2a6a":danger?"#ff9090":purple?"#c0a0ff":teal?"#40d0d0":outline||ghost?T.gold:T.purple;
  const bd = danger?"#ff5555":purple?"#8060c0":teal?"#20a0a0":disabled?"#2a1a5a":T.gold;
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background:bg,color:col,border:`1.5px solid ${bd}`,borderRadius:30,
      padding:sm?"7px 16px":"11px 24px",fontSize:sm?11.5:13.5,fontWeight:700,letterSpacing:.6,
      cursor:disabled?"not-allowed":"pointer",transition:"all .22s",
      animation:!disabled&&!outline&&!ghost&&!danger&&!purple&&!teal?"glow 2.5s infinite":"none",
      opacity:disabled?.44:1,width:full?"100%":"auto",...sx,
    }}>{children}</button>
  );
}
function Box({children,style:sx}) {
  return <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:18,backdropFilter:"blur(12px)",boxShadow:"0 5px 24px rgba(0,0,0,.44)",...sx}}>{children}</div>;
}
function Lbl({children,color,mb,sx}) {
  return <div style={{color:color||T.gold,fontSize:10,fontWeight:700,letterSpacing:2.5,textTransform:"uppercase",marginBottom:mb??8,...sx}}>{children}</div>;
}
function Rule({sx}) {
  return <div style={{width:44,height:1,background:`linear-gradient(90deg,transparent,${T.gold},transparent)`,margin:"9px auto",...sx}}/>;
}
function Dots({step,total}) {
  return (
    <div style={{display:"flex",justifyContent:"center",gap:7,marginBottom:16}}>
      {Array.from({length:total},(_,i) => (
        <div key={i} style={{width:i===step-1?22:7,height:7,borderRadius:4,background:i<step?T.gold:"rgba(201,168,76,.13)",transition:"all .4s"}}/>
      ))}
    </div>
  );
}
function Tag({children,color,bg}) {
  return <span style={{background:bg||"rgba(201,168,76,.11)",border:`1px solid ${(color||T.gold)}44`,borderRadius:20,padding:"3px 10px",color:color||T.gold,fontSize:11,fontStyle:"italic"}}>{children}</span>;
}
function Spin({label}) {
  const [d,setD]=useState("");
  useEffect(()=>{const t=setInterval(()=>setD(x=>x.length>=3?"":x+"."),380);return()=>clearInterval(t);},[]);
  return (
    <div style={{textAlign:"center",padding:"32px 0"}}>
      <div style={{fontSize:38,animation:"spin 2.5s linear infinite",display:"inline-block",marginBottom:14}}>✦</div>
      <div style={{color:T.gold,fontFamily:"Georgia,serif",fontSize:16,marginBottom:5}}>{label||"The oracle is reading"}{d}</div>
      <div style={{color:T.cream,fontSize:12,opacity:.5,marginBottom:18}}>Channelling ancient wisdom</div>
      <div style={{display:"flex",justifyContent:"center",gap:7}}>
        {[0,1,2].map(i=><div key={i} style={{width:9,height:9,borderRadius:"50%",background:T.gold,animation:`pulse 1.2s ${i*.22}s infinite`}}/>)}
      </div>
    </div>
  );
}
function Alert({type,children}) {
  const styles = {
    info:  { bg:"rgba(201,168,76,.07)", border:"rgba(201,168,76,.28)", color:T.gold },
    warn:  { bg:"rgba(255,160,0,.08)", border:"rgba(255,160,0,.32)", color:"#ffcc88" },
    error: { bg:"rgba(200,20,20,.1)",  border:"rgba(255,60,60,.32)", color:"#ff9090" },
    ok:    { bg:"rgba(50,200,100,.07)", border:"rgba(50,200,100,.28)", color:"#7CFC00" },
  };
  const s = styles[type]||styles.info;
  return <div style={{background:s.bg,border:`1px solid ${s.border}`,borderRadius:9,padding:"9px 13px",color:s.color,fontSize:12,lineHeight:1.65,marginBottom:12,animation:"fi .3s"}}>{children}</div>;
}

// ── JOURNEY TRACKER ────────────────────────────────────────────
function Tracker({session,curDeckIdx,onGo}) {
  const icons = ["✓","✓","▶","○","○"];
  return (
    <div style={{background:"rgba(4,0,12,.97)",borderBottom:"1px solid rgba(201,168,76,.12)",padding:"8px 12px",display:"flex",gap:4,overflowX:"auto",WebkitOverflowScrolling:"touch",flexShrink:0,scrollbarWidth:"none",position:"sticky",top:0,zIndex:50}}>
      {DECKS.map((d,i) => {
        const st = session.ds?.[d.id]?.status;
        const done    = st==="completed";
        const active  = i===curDeckIdx;
        const canClick= done;
        return (
          <button key={d.id} onClick={()=>canClick&&onGo(i)} style={{
            background:active?"rgba(201,168,76,.2)":"transparent",
            border:`1px solid ${active?T.gold:done?"rgba(201,168,76,.4)":"rgba(201,168,76,.1)"}`,
            borderRadius:20,padding:"5px 10px",
            cursor:canClick?"pointer":"default",
            color:active?T.gold:done?T.cream:"rgba(245,230,200,.22)",
            fontSize:9.5,whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:4,
            flexShrink:0,transition:"all .2s",
          }}>
            <span style={{fontSize:10}}>{done&&!active?"✓ ":active?"▶ ":""}</span>
            <span>{d.emoji}</span>
            <span>{d.subtitle}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── CARD SLOT (Upload + OCR + Name) ───────────────────────────
function CardSlot({card, imgVal, nameVal, conf, onImg, onName, deckLight, deckColor}) {
  const uid = card.id;
  const [picker,  setPicker]  = useState(false);
  const [ocring,  setOcring]  = useState(false);
  const [ocrErr,  setOcrErr]  = useState("");
  const [retrying,setRetrying]= useState(false);

  const hasImg  = !!imgVal;
  const hasName = (nameVal||"").trim().length>0;
  const done    = hasImg && hasName;
  const lowConf = typeof conf==="number" && conf<80;

  async function runOcr(dataUrl) {
    setOcring(true); setOcrErr("");
    try {
      const match = dataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      if (!match) { setOcring(false); return; }
      const res = await fetch(ORACLE_ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ocr:true,imageMediaType:match[1],imageData:match[2],cardRole:card.role,cardLabel:`Card ${card.n}`})});
      const txt = await res.text();
      if (txt.trim().startsWith("<")) { setOcring(false); return; }
      const data = JSON.parse(txt);
      if (data.cardName?.trim()) onName(data.cardName.trim(), data.confidence||0);
      if (data.confidence!==undefined && data.confidence<80) setOcrErr(`Low confidence (${data.confidence}%). Please verify or correct the name below.`);
    } catch(_) { setOcrErr("Auto-recognition unavailable. Please type the card name manually."); }
    setOcring(false); setRetrying(false);
  }

  function handleFile(e) {
    const f = e.target.files?.[0]; if(!f) return;
    e.target.value="";
    const r = new FileReader();
    r.onload = ev => { onImg(ev.target.result); setPicker(false); runOcr(ev.target.result); };
    r.readAsDataURL(f);
  }

  const obtn = {background:`${deckColor}88`,border:`1.5px solid ${deckLight}55`,borderRadius:10,padding:"11px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:11,width:"100%",textAlign:"left"};

  return (
    <div style={{marginBottom:14,borderRadius:14,padding:14,animation:"up .3s ease both",
      background:done?`${deckColor}44`:"rgba(16,5,35,.7)",
      border:`1px solid ${done?deckLight+"55":lowConf?"rgba(255,160,0,.4)":"rgba(201,168,76,.14)"}`}}>

      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
        <div style={{width:30,height:30,borderRadius:"50%",flexShrink:0,
          background:done?`${deckColor}cc`:lowConf?"rgba(255,140,0,.22)":"rgba(201,168,76,.1)",
          border:`2px solid ${done?deckLight:lowConf?"#ffaa00":"rgba(201,168,76,.24)"}`,
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:11,color:done?deckLight:lowConf?"#ffcc44":T.gold,fontWeight:700}}>
          {done?"✓":card.n}
        </div>
        <div>
          <div style={{color:done?deckLight:lowConf?"#ffcc44":T.gold,fontSize:13,fontWeight:700}}>Card {card.n} — {card.role}</div>
          <div style={{color:T.cream,fontSize:11,opacity:.5,marginTop:1}}>{card.desc}</div>
        </div>
      </div>

      {/* OCR validation warnings */}
      {lowConf&&<Alert type="warn">⚠ Card {card.n} could not be clearly identified. Please upload a clearer image or correct the name below.</Alert>}
      {ocrErr&&!lowConf&&<Alert type="warn">{ocrErr}</Alert>}

      {/* Photo upload */}
      <Lbl mb={7}>📷 Step 1 — Upload Card Photo</Lbl>
      {hasImg ? (
        <div style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:14}}>
          <div style={{position:"relative",flexShrink:0}}>
            <img src={imgVal} alt={card.role} style={{width:88,height:128,objectFit:"cover",borderRadius:10,border:`2.5px solid ${lowConf?"#ffaa00":deckLight}88`,boxShadow:`0 4px 20px ${deckColor}bb`}}/>
            <div style={{position:"absolute",bottom:-5,left:"50%",transform:"translateX(-50%)",background:deckColor,border:`1px solid ${deckLight}77`,borderRadius:10,padding:"2px 7px",color:deckLight,fontSize:9,fontWeight:700,whiteSpace:"nowrap"}}>✓ Uploaded</div>
            {(ocring||retrying)&&<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.64)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",color:T.gold,fontSize:22,animation:"spin 1.5s linear infinite"}}>🔍</div>}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:7,paddingTop:2,flex:1}}>
            <div style={{color:T.cream,fontSize:10,opacity:.42,marginBottom:1}}>Replace photo:</div>
            {[{id:`rc-${uid}`,cap:true,icon:"📷",lbl:"Retake Photo"},{id:`rg-${uid}`,cap:false,icon:"🖼",lbl:"Choose Gallery"}].map(b=>(
              <label key={b.id} htmlFor={b.id} style={{background:"rgba(201,168,76,.08)",border:"1px solid rgba(201,168,76,.25)",borderRadius:20,padding:"7px 12px",cursor:"pointer",color:T.cream,fontSize:11,display:"flex",alignItems:"center",gap:6,userSelect:"none"}}>
                {b.icon} {b.lbl}
                <input id={b.id} type="file" accept="image/*" {...(b.cap?{capture:"environment"}:{})} style={{display:"none"}} onChange={handleFile}/>
              </label>
            ))}
            {lowConf&&(
              <button onClick={()=>{setRetrying(true);runOcr(imgVal);}} style={{background:"rgba(255,160,0,.12)",border:"1px solid rgba(255,160,0,.3)",borderRadius:20,padding:"7px 12px",cursor:"pointer",color:"#ffcc88",fontSize:11,display:"flex",alignItems:"center",gap:6}}>
                🔄 Retry Recognition
              </button>
            )}
            <button onClick={()=>{onImg(null);onName("",0);setOcrErr("");}} style={{background:"rgba(160,20,20,.18)",border:"1px solid rgba(255,70,70,.24)",borderRadius:20,padding:"7px 12px",cursor:"pointer",color:"#ff9090",fontSize:11,display:"flex",alignItems:"center",gap:6}}>🗑 Remove Photo</button>
          </div>
        </div>
      ) : (
        !picker ? (
          <div onClick={()=>setPicker(true)} style={{height:88,borderRadius:11,border:"2px dashed rgba(201,168,76,.22)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",background:"rgba(201,168,76,.03)",marginBottom:14,gap:5,transition:"all .2s"}}>
            <div style={{fontSize:24}}>📷</div>
            <div style={{color:T.cream,fontSize:12,opacity:.5}}>Tap to upload Card {card.n}</div>
          </div>
        ) : (
          <div style={{background:"rgba(6,1,18,.97)",border:"1px solid rgba(201,168,76,.28)",borderRadius:12,padding:14,marginBottom:14,animation:"fi .2s"}}>
            <div style={{color:T.gold,fontSize:12,fontWeight:700,marginBottom:11}}>How to add Card {card.n}?</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              <label htmlFor={`c-${uid}`} style={obtn}>
                <span style={{fontSize:22,flexShrink:0}}>📷</span>
                <div><div style={{color:deckLight,fontSize:13,fontWeight:700}}>Take Photo</div><div style={{color:T.cream,fontSize:11,opacity:.6}}>Open device camera now</div></div>
                <input id={`c-${uid}`} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={handleFile}/>
              </label>
              <label htmlFor={`g-${uid}`} style={obtn}>
                <span style={{fontSize:22,flexShrink:0}}>🖼</span>
                <div><div style={{color:deckLight,fontSize:13,fontWeight:700}}>Choose From Gallery</div><div style={{color:T.cream,fontSize:11,opacity:.6}}>Select from photo library</div></div>
                <input id={`g-${uid}`} type="file" accept="image/*" style={{display:"none"}} onChange={handleFile}/>
              </label>
              <button onClick={()=>setPicker(false)} style={{background:"transparent",border:"none",color:"rgba(245,230,200,.26)",fontSize:12,cursor:"pointer",padding:"4px"}}>✕ Cancel</button>
            </div>
          </div>
        )
      )}

      {/* Card name */}
      <Lbl mb={7}>✍ Step 2 — Card Name</Lbl>
      <div style={{color:T.cream,fontSize:11,opacity:.46,marginBottom:8}}>
        {(ocring||retrying)?"🔍 Reading card name from image..."
          :hasImg?"Auto-detected from image. Correct if needed."
          :"Type the exact name printed on your physical card."}
      </div>
      <input type="text" value={nameVal||""} onChange={e=>onName(e.target.value,100)}
        placeholder={card.eg} disabled={ocring||retrying}
        style={{width:"100%",padding:"10px 13px",background:(ocring||retrying)?"rgba(16,5,35,.5)":"rgba(16,5,35,.9)",
          border:`1.5px solid ${hasName?deckLight:lowConf?"rgba(255,160,0,.4)":"rgba(201,168,76,.2)"}`,
          borderRadius:9,color:T.cream,fontSize:13,outline:"none",transition:"border .2s"}}/>
      {(ocring||retrying)&&<div style={{color:T.gold,fontSize:10,marginTop:4,animation:"shim 1.2s infinite"}}>✦ Auto-reading card name from image...</div>}
      {hasName&&!(ocring||retrying)&&<div style={{color:"#7CFC00",fontSize:10,marginTop:4}}>✓ <span style={{fontStyle:"italic"}}>"{nameVal.trim()}"</span></div>}
      {!hasName&&!(ocring||retrying)&&<div style={{color:"rgba(245,230,200,.26)",fontSize:10,marginTop:4}}>Card name required before interpretation</div>}
    </div>
  );
}

// ── CARD RESULT BLOCK ──────────────────────────────────────────
function CardResult({cd, meta, deckLight, deckColor, idx}) {
  if (cd.error) {
    return (
      <div style={{background:"rgba(150,15,15,.15)",border:"1.5px solid rgba(255,60,60,.4)",borderRadius:14,padding:18,marginBottom:14,animation:"up .4s ease both"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
          <span style={{fontSize:24}}>⚠️</span>
          <div>
            <div style={{color:"#ff9090",fontSize:16,fontWeight:700,fontFamily:"Georgia,serif"}}>Card {meta?.n} — Cannot Be Read</div>
            <div style={{color:"#ffaa88",fontSize:11,marginTop:2}}>{meta?.role}</div>
          </div>
        </div>
        <Alert type="error">{cd.errorReason||"Card name could not be identified or interpreted. Please reset and upload a clearer image."}</Alert>
        <div style={{color:"#ffcc88",fontSize:12,lineHeight:1.6}}>👉 Reset this deck and re-upload a clearer photo of <strong style={{color:"#ffaa44"}}>Card {meta?.n}</strong>.</div>
      </div>
    );
  }
  return (
    <div style={{background:`linear-gradient(135deg,${deckColor}8c,rgba(16,5,35,.95))`,border:`1.5px solid ${deckLight}44`,borderRadius:14,padding:"18px 16px",marginBottom:14,animation:"up .4s ease both"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
        <div style={{width:34,height:34,borderRadius:"50%",background:`${deckColor}cc`,border:`2px solid ${deckLight}`,display:"flex",alignItems:"center",justifyContent:"center",color:deckLight,fontSize:13,fontWeight:700,flexShrink:0}}>{idx+1}</div>
        <div style={{color:T.cream,fontSize:11,opacity:.56}}>{meta?.role}</div>
      </div>
      {/* Card name — large bold */}
      <div style={{fontSize:23,fontWeight:700,fontFamily:"Georgia,serif",color:deckLight,lineHeight:1.2,marginBottom:12,textShadow:`0 0 22px ${deckLight}66`,letterSpacing:.4}}>{cd.cardName}</div>
      {/* Keywords — smaller */}
      {cd.keywords?.length>0&&(
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>
          {cd.keywords.map((kw,ki)=><Tag key={ki} color={deckLight}>{kw}</Tag>)}
        </div>
      )}
      {/* Interpretation */}
      <div style={{borderLeft:`3px solid ${deckLight}50`,paddingLeft:13}}>
        <Lbl mb={6} sx={{letterSpacing:1.5}}>Interpretation</Lbl>
        <p style={{color:T.cream,fontSize:13,lineHeight:1.88,margin:0,opacity:.94}}>{cd.meaning}</p>
      </div>
    </div>
  );
}

// ── DECK SUMMARY ───────────────────────────────────────────────
function DeckSummaryBlock({answer,deck}) {
  const paras = answer.split(/\n+/).filter(p=>p.trim());
  return (
    <div style={{background:`linear-gradient(135deg,${deck.color}cc,rgba(16,5,35,.97))`,border:`2px solid ${deck.light}50`,borderRadius:16,padding:"20px 18px",boxShadow:`0 8px 30px ${deck.color}66`}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
        <span style={{fontSize:26}}>{deck.emoji}</span>
        <div>
          <div style={{color:T.gold,fontSize:16,fontWeight:700,fontFamily:"Georgia,serif"}}>Suggested Answer</div>
          <div style={{color:T.cream,fontSize:11,opacity:.56,marginTop:2}}>Combined interpretation of all {deck.cards.length} cards</div>
        </div>
      </div>
      <div style={{width:"100%",height:1,background:`linear-gradient(90deg,transparent,${deck.light}50,transparent)`,marginBottom:14}}/>
      {paras.map((p,i)=>(
        <p key={i} style={{color:T.cream,fontSize:13,lineHeight:1.9,margin:i>0?"12px 0 0":"0",fontStyle:i===paras.length-1?"italic":"normal",opacity:i===paras.length-1?.84:.94}}>{p}</p>
      ))}
    </div>
  );
}

// ── ORACLE CALL ────────────────────────────────────────────────
async function callOracle(deck, lifeAreas, question, cardNames) {
  const areaLabels = lifeAreas.map(id=>LIFE_AREAS.find(a=>a.id===id)?.label||id).join(", ");
  const cardLines = deck.cards.map(c => {
    const name = (cardNames[c.id]||"").trim();
    return `Card ${c.n} (${c.role}):\n  Name: ${name?`"${name}"`:"[not provided — suggest appropriate card]"}\n  Purpose: ${c.desc}`;
  }).join("\n\n");

  const prompt=`You are a professional mystical card reader providing an accurate, personalised reading.

Deck: ${deck.name}
Purpose: ${deck.purpose} — ${deck.description}
Life Area(s): ${areaLabels}
Client Question: "${question}"

Cards Drawn:
${cardLines}

RULES:
- Use the EXACT card name given. Never rename it.
- If a name is missing, suggest an appropriate ${deck.name} card.
- Interpret SPECIFICALLY for: "${question}" — never be generic.
- Be compassionate, empowering and directly personal.
- If a card name appears invalid, set error:true with a clear errorReason.

Return ONLY raw JSON — absolutely NO markdown, NO extra text before or after:
{
  "cards":[{
    "cardName":"exact name or your suggestion",
    "keywords":["k1","k2","k3","k4"],
    "meaning":"2-3 sentences specific to the client question. Reference the card name. Be personal and empowering.",
    "error":false,
    "errorReason":""
  }],
  "suggestedAnswer":"3-4 flowing paragraphs weaving ALL ${deck.cards.length} card names into one direct answer to the client question. Name every card. Open with the key insight. Close with one empowering action. Warm, professional, mystical."
}`;

  const res = await fetch(ORACLE_ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt})});
  const raw = await res.text().catch(()=>"");
  if (raw.trim().startsWith("<")) throw new Error("FUNC_NOT_FOUND");
  let data={};
  try{data=JSON.parse(raw);}catch(_){data={error:`Non-JSON response: ${raw.substring(0,200)}`};}
  if (!res.ok) throw new Error(`FUNC_ERROR: ${data.error||"HTTP "+res.status}`);
  if (data.error) throw new Error(`FUNC_ERROR: ${data.error}`);
  const text = data.result||"{}";
  const clean = text.replace(/^```(?:json)?\s*/,"").replace(/\s*```$/,"").trim();
  try{return JSON.parse(clean);}
  catch(_){throw new Error(`PARSE_ERROR: ${clean.substring(0,120)}`);}
}

function fmtErr(msg) {
  if(msg.includes("DEEPSEEK_KEY"))   return "🔑 DEEPSEEK_KEY not set in Netlify environment variables. Add it at platform.deepseek.com → API Keys, then redeploy.";
  if(msg.includes("401"))            return "🔑 Invalid DeepSeek key. Verify DEEPSEEK_KEY in Netlify → Site configuration → Environment variables.";
  if(msg.includes("402"))            return "💳 DeepSeek account has insufficient credits. Top up at platform.deepseek.com → Billing.";
  if(msg.includes("429"))            return "⏳ Too many requests. Interpretation service is temporarily unavailable. Wait 30 seconds and retry.";
  if(msg.includes("FUNC_NOT_FOUND")) return "⚠ Netlify function not deployed. Check netlify/functions/oracle.js exists in GitHub and netlify.toml has functions=\"netlify/functions\".";
  if(msg.includes("FUNC_ERROR"))     return `⚠ Interpretation service error: ${msg.replace("FUNC_ERROR:","").trim()}`;
  if(msg.includes("PARSE_ERROR"))    return `📋 Interpretation service response was unclear. ${msg.replace("PARSE_ERROR:","").trim()} — please retry.`;
  if(msg.includes("Failed to fetch")||msg.includes("NetworkError")) return "🌐 Network connection error. Check your internet connection and retry.";
  return `⚠ Interpretation service error: ${msg}`;
}

// ══════════════════════════════════════════════════════════════
// WELCOME SCREEN
// ══════════════════════════════════════════════════════════════
function Welcome({onStart,onResume,hasSession,restored}) {
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh",padding:"24px 20px",textAlign:"center"}}>
      <div style={{fontSize:66,animation:"float 3s infinite",marginBottom:6}}>🔮</div>
      <div style={{fontFamily:"Georgia,serif",fontSize:10,color:T.gold,letterSpacing:6,textTransform:"uppercase",marginBottom:5,opacity:.7}}>Sacred Consultation System</div>
      <h1 style={{fontFamily:"Georgia,serif",fontSize:28,color:T.gold,margin:"0 0 4px",lineHeight:1.2,textShadow:"0 0 30px rgba(201,168,76,.44)"}}>Mystical 5-Deck<br/>Reading System</h1>
      <Rule/>
      <p style={{color:T.cream,fontSize:13,lineHeight:1.75,maxWidth:300,opacity:.78,margin:"10px 0 20px"}}>
        A complete professional 5-deck spiritual consultation covering Current Energy, Root Cause, Cosmic Influences, Action Plan and Potential Outcome.
      </p>
      {restored&&<Alert type="ok" sx={{maxWidth:300,marginBottom:16}}>Previous session restored successfully.</Alert>}
      <div style={{display:"flex",gap:7,marginBottom:26,flexWrap:"wrap",justifyContent:"center"}}>
        {DECKS.map(d=>(
          <div key={d.id} style={{background:`${d.color}88`,border:`1px solid ${d.light}30`,borderRadius:20,padding:"4px 10px",fontSize:9.5,color:T.cream,display:"flex",alignItems:"center",gap:4}}>
            <span>{d.emoji}</span><span>{d.subtitle}</span>
          </div>
        ))}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:11,width:"100%",maxWidth:260}}>
        <Btn onClick={onStart} full>✦ Start New Session</Btn>
        {hasSession&&<Btn onClick={onResume} outline full>↩ Resume Session</Btn>}
      </div>
      <p style={{color:T.cream,fontSize:10,opacity:.18,marginTop:20,lineHeight:1.6}}>"A structured mirror for clarity, root cause and a concrete action plan."</p>
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
        <div style={{fontSize:36,marginBottom:5}}>🌙</div>
        <Lbl sx={{letterSpacing:4,textAlign:"center",marginBottom:4}}>Section 1</Lbl>
        <h2 style={{fontFamily:"Georgia,serif",color:T.gold,fontSize:21,margin:0}}>Client Education</h2>
        <Rule/>
        <p style={{color:T.cream,fontSize:12,opacity:.6,margin:0}}>Preparing the client before the reading begins</p>
      </div>

      <Box style={{marginBottom:13}}>
        <Lbl>✦ Welcome Message</Lbl>
        <p style={{color:T.cream,fontSize:13,lineHeight:1.85,fontStyle:"italic",margin:0}}>
          "Welcome, and thank you sincerely for trusting me with your questions today. This is a sacred, confidential and non-judgmental space. Everything you share here remains between us.
        </p>
        <p style={{color:T.cream,fontSize:13,lineHeight:1.85,fontStyle:"italic",margin:"12px 0 0"}}>
          The purpose of this consultation is to provide you with clarity, perspective and practical guidance — not to predict a fixed future, but to illuminate the current energies at work in your life and empower you to make aligned choices."
        </p>
      </Box>

      <Box style={{marginBottom:13}}>
        <Lbl>✦ Ethical Disclaimer & Expectations</Lbl>
        {["This reading is for guidance, personal reflection and spiritual insight only",
          "It does not replace professional medical, legal, financial or psychological advice",
          "All information shared is held in complete confidence",
          "You retain complete free will — the cards show possibility, not fixed destiny",
          "Some messages may be challenging — they are offered with compassion and care",
          "You are encouraged to take only what resonates and leave what does not",
        ].map((item,i)=>(
          <div key={i} style={{display:"flex",gap:9,marginBottom:7,alignItems:"flex-start"}}>
            <span style={{color:T.gold,flexShrink:0,marginTop:1}}>✦</span>
            <span style={{color:T.cream,fontSize:12,lineHeight:1.6}}>{item}</span>
          </div>
        ))}
      </Box>

      <div style={{marginBottom:13}}>
        <Lbl>✦ The 5-Deck Reading System</Lbl>
        {DECKS.map((d,i)=>(
          <div key={d.id} style={{display:"flex",gap:10,padding:"11px 13px",marginBottom:7,background:`${d.color}66`,border:`1px solid ${d.light}33`,borderRadius:12,animation:`up .3s ${i*.07}s ease both`}}>
            <span style={{fontSize:21,flexShrink:0}}>{d.emoji}</span>
            <div>
              <div style={{color:d.light,fontSize:12,fontWeight:700,fontFamily:"Georgia,serif"}}>Step {d.step} — {d.name}</div>
              <div style={{color:T.gold,fontSize:9,marginBottom:2}}>{d.subtitle} · {d.purpose}</div>
              <div style={{color:T.cream,fontSize:11,opacity:.78,lineHeight:1.5}}>{d.description}</div>
            </div>
          </div>
        ))}
      </div>

      <Box style={{marginBottom:22}}>
        <Lbl>✦ Reading Journey Flow</Lbl>
        <div style={{display:"flex",alignItems:"center",gap:4,flexWrap:"wrap",justifyContent:"center",marginBottom:10}}>
          {DECKS.map((d,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:4}}>
              <div style={{background:`${d.color}66`,border:`1px solid ${d.light}30`,borderRadius:20,padding:"3px 9px",fontSize:10,color:d.light}}>{d.subtitle}</div>
              {i<DECKS.length-1&&<span style={{color:T.gold,opacity:.3,fontSize:11}}>→</span>}
            </div>
          ))}
        </div>
        <p style={{color:T.cream,fontSize:11,opacity:.52,margin:0,textAlign:"center",lineHeight:1.6}}>Each deck builds on the last to create one complete, professional consultation.</p>
      </Box>

      <div style={{display:"flex",gap:10,justifyContent:"center"}}>
        <Btn onClick={onSkip} outline sm>Skip Introduction →</Btn>
        <Btn onClick={onNext}>Continue ✦</Btn>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// SECTION 2 — CLIENT INTAKE
// ══════════════════════════════════════════════════════════════
function Section2({session,onUpdate,onNext}) {
  const [areas, setAreas] = useState(session.lifeAreas||[]);
  const [q,     setQ]     = useState(session.question||"");
  const [err,   setErr]   = useState("");
  const selected = LIFE_AREAS.filter(a=>areas.includes(a.id));
  const valid = areas.length>0 && q.trim().length>=50 && q.trim().length<=1000;

  function toggle(id) { setAreas(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]); setErr(""); }

  function go() {
    if(areas.length===0){ setErr("Please select at least one life area to proceed."); return; }
    if(q.trim().length<50){ setErr(`Please describe your question in more detail (${50-q.trim().length} more characters needed).`); return; }
    if(q.trim().length>1000){ setErr("Please keep your question under 1000 characters."); return; }
    onUpdate({lifeAreas:areas,question:q.trim()});
    onNext();
  }

  return (
    <div style={{padding:"20px 16px",animation:"up .4s ease"}}>
      <Dots step={2} total={4}/>
      <div style={{textAlign:"center",marginBottom:16}}>
        <div style={{fontSize:36,marginBottom:5}}>🌿</div>
        <Lbl sx={{letterSpacing:4,textAlign:"center",marginBottom:4}}>Section 2</Lbl>
        <h2 style={{fontFamily:"Georgia,serif",color:T.gold,fontSize:21,margin:0}}>Client Intake &amp; Grounding</h2>
        <Rule/>
        <p style={{color:T.cream,fontSize:12,opacity:.6,margin:0}}>Select your area of focus and describe your question</p>
      </div>

      {/* Life Area Selection */}
      <div style={{marginBottom:18}}>
        <Lbl>✦ Life Area (select all that apply)</Lbl>
        <p style={{color:T.cream,fontSize:12,opacity:.54,marginBottom:12,lineHeight:1.5}}>Select one or more areas. This guides the oracle to focus your reading.</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
          {LIFE_AREAS.map(a=>{
            const sel=areas.includes(a.id);
            return (
              <button key={a.id} onClick={()=>toggle(a.id)} style={{
                background:sel?`${a.color}cc`:`${a.color}33`,
                border:`1.5px solid ${sel?T.gold:`${a.color}66`}`,
                borderRadius:11,padding:"10px 8px",cursor:"pointer",
                display:"flex",alignItems:"center",gap:7,transition:"all .22s",
                boxShadow:sel?`0 3px 14px ${a.color}50`:"none"}}>
                <span style={{fontSize:17}}>{a.emoji}</span>
                <span style={{color:sel?T.gold:T.cream,fontSize:10.5,fontWeight:sel?700:400,textAlign:"left",lineHeight:1.3,flex:1}}>{a.label}</span>
                {sel&&<span style={{color:T.gold,fontSize:12,flexShrink:0}}>✓</span>}
              </button>
            );
          })}
        </div>
        {areas.length>0&&(
          <div style={{marginTop:10,display:"flex",flexWrap:"wrap",gap:5}}>
            <span style={{color:T.muted,fontSize:11}}>Selected:</span>
            {areas.map(id=>{const a=LIFE_AREAS.find(x=>x.id===id);return <Tag key={id}>{a?.emoji} {a?.label}</Tag>;})}
          </div>
        )}
      </div>

      {/* Question Input */}
      <div style={{marginBottom:18}}>
        <Lbl>✦ What would you like guidance on today?</Lbl>
        <textarea value={q} onChange={e=>{setQ(e.target.value);setErr("");}}
          placeholder="Describe your situation and what you are seeking guidance on. Be as specific as possible — the more detail you share, the more personalised and accurate your reading will be..."
          style={{width:"100%",minHeight:110,background:"rgba(16,5,35,.9)",
            border:`1.5px solid ${q.trim().length>=50?T.gold:"rgba(201,168,76,.2)"}`,
            borderRadius:11,padding:13,color:T.cream,fontSize:13,lineHeight:1.65,
            resize:"none",outline:"none",transition:"border .2s"}}/>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:5}}>
          <span style={{color:q.trim().length>=50?"#7CFC00":"rgba(245,230,200,.28)",fontSize:11}}>
            {q.trim().length>=50?"✓ Ready to proceed":`${50-q.trim().length} more characters needed (min 50)`}
          </span>
          <span style={{color:q.length>900?"#ffaa44":"rgba(245,230,200,.26)",fontSize:11}}>{q.length}/1000</span>
        </div>
      </div>

      {/* Dynamic Suggestions */}
      {selected.length>0&&(
        <Box style={{marginBottom:18}}>
          <Lbl>{selected.map(a=>a.emoji).join(" ")} Suggested Questions</Lbl>
          <div style={{display:"flex",flexDirection:"column",gap:5}}>
            {[...new Set(selected.flatMap(a=>a.qs))].slice(0,8).map((qs,i)=>(
              <button key={i} className="qbtn" onClick={()=>{setQ(qs);setErr("");}} style={{
                background:"rgba(201,168,76,.05)",border:"1px solid rgba(201,168,76,.13)",
                borderRadius:8,padding:"7px 11px",cursor:"pointer",textAlign:"left",
                color:T.cream,fontSize:12,lineHeight:1.5,transition:"all .15s"}}>
                <span style={{color:T.gold,marginRight:5}}>›</span>{qs}
              </button>
            ))}
          </div>
          <div style={{color:T.cream,fontSize:10,opacity:.32,marginTop:7}}>Tap any suggestion or write your own above</div>
        </Box>
      )}

      {err&&<Alert type="error">⚠ {err}</Alert>}
      <div style={{textAlign:"center"}}><Btn onClick={go} disabled={!valid}>Proceed to Reading Journey ✦</Btn></div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// SECTION 3 — DECK READING SCREEN
// ══════════════════════════════════════════════════════════════
function DeckScreen({session, deckIdx, onSave, onNext, onGoTo, onClose}) {
  const deck   = DECKS[deckIdx];
  const saved  = session.ds?.[deck.id]||{};
  const allImg = Store.loadImages();

  const [images,    setImages]    = useState({...allImg[deck.id]||{}, ...(saved.images||{})});
  const [names,     setNames]     = useState(saved.names||{});
  const [conf,      setConf]      = useState(saved.confidence||{});
  const [cards,     setCards]     = useState(saved.interpretations||null);
  const [answer,    setAnswer]    = useState(saved.summary||"");
  const [phase,     setPhase]     = useState(saved.status==="completed"?"done":"upload");
  const [loading,   setLoading]   = useState(false);
  const [errMsg,    setErrMsg]    = useState("");
  const [svcErr,    setSvcErr]    = useState("");
  const [confrm,    setConfrm]    = useState(false);
  const [resetOk,   setResetOk]   = useState("");

  const area   = LIFE_AREAS.find(a=>session.lifeAreas?.includes(a.id));
  const allNamed  = deck.cards.every(c=>(names[c.id]||"").trim().length>0);
  const allImgd   = deck.cards.every(c=>!!images[c.id]);
  const namedN    = deck.cards.filter(c=>(names[c.id]||"").trim().length>0).length;
  const imgN      = deck.cards.filter(c=>!!images[c.id]).length;
  const hasLowConf= Object.values(conf).some(v=>typeof v==="number"&&v<80);
  const isLast    = deckIdx===DECKS.length-1;
  const allDone   = DECKS.every(d=>session.ds?.[d.id]?.status==="completed");
  const errCards  = (Array.isArray(cards)?cards:[]).map((c,i)=>({...c,idx:i})).filter(c=>c.error);
  const allOk     = Array.isArray(cards)&&cards.length>0&&cards.every(c=>!c.error);
  const canProceed= allOk&&answer.length>10;

  // Autosave whenever state changes
  useEffect(()=>{
    if(phase!=="upload"||namedN>0||imgN>0) {
      Store.saveImages(deck.id, images);
      onSave(deck.id,{images:{},names,confidence:conf,interpretations:cards,summary:answer,status:phase==="done"?"completed":namedN>0||imgN>0?"in_progress":"not_started"});
    }
  },[images,names,conf,cards,answer,phase]);

  function setImg(cardId, val) { setImages(p=>({...p,[cardId]:val})); }
  function setName(cardId, val, c=100) { setNames(p=>({...p,[cardId]:val})); setConf(p=>({...p,[cardId]:c})); }

  async function read(demo=false) {
    setSvcErr(""); setLoading(true); setPhase("loading"); setErrMsg("");
    try {
      const r = await callOracle(deck, session.lifeAreas||[], session.question||"", demo?{}:names);
      if(!r?.cards) throw new Error("Empty oracle response");
      setCards(r.cards); setAnswer(r.suggestedAnswer||""); setPhase("done");
      onSave(deck.id,{images:{},names,confidence:conf,interpretations:r.cards,summary:r.suggestedAnswer||"",status:"completed",completedAt:new Date().toISOString()});
    } catch(e) {
      const msg = fmtErr(e.message||"");
      setSvcErr(msg); setErrMsg(msg); setPhase("upload");
    }
    setLoading(false);
  }

  function doReset() {
    setImages({}); setNames({}); setConf({}); setCards(null); setAnswer("");
    setPhase("upload"); setConfrm(false); setErrMsg(""); setSvcErr(""); setResetOk("✓ Deck reset — re-upload your card photos.");
    Store.saveImages(deck.id,{});
    onSave(deck.id,{images:{},names:{},confidence:{},interpretations:null,summary:"",status:"reset",completedAt:null});
    setTimeout(()=>setResetOk(""),3500);
    window.scrollTo({top:0,behavior:"smooth"});
  }

  return (
    <div style={{display:"flex",flexDirection:"column",minHeight:"100vh"}}>
      <Tracker session={session} curDeckIdx={deckIdx} onGo={onGoTo}/>
      <div style={{padding:"18px 16px 52px",flex:1}}>

        {/* Header */}
        <div style={{textAlign:"center",marginBottom:16}}>
          <Dots step={3} total={4}/>
          <div style={{fontSize:42,animation:"float 3s infinite",display:"inline-block",marginBottom:5}}>{deck.emoji}</div>
          <div style={{color:deck.light,fontSize:10,fontWeight:700,letterSpacing:3,textTransform:"uppercase",marginBottom:3}}>Step {deck.step} of 5 · Section 3</div>
          <h2 style={{fontFamily:"Georgia,serif",color:T.gold,fontSize:20,margin:"0 0 2px"}}>{deck.name}</h2>
          <div style={{color:T.cream,fontSize:12,opacity:.58}}>{deck.purpose} · {deck.subtitle}</div>
          <Rule/>
        </div>

        {/* Progress */}
        <div style={{marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
            <span style={{color:T.cream,fontSize:10,opacity:.36}}>Overall progress</span>
            <span style={{color:T.gold,fontSize:10,fontWeight:700}}>{deck.step} / {DECKS.length} decks</span>
          </div>
          <div style={{height:4,background:"rgba(201,168,76,.09)",borderRadius:4,overflow:"hidden"}}>
            <div style={{height:"100%",borderRadius:4,background:`linear-gradient(90deg,${T.gold},${deck.light})`,width:`${(deck.step/DECKS.length)*100}%`,transition:"width .5s"}}/>
          </div>
        </div>

        {/* Question context */}
        <Box style={{marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:6,flexWrap:"wrap"}}>
            {session.lifeAreas?.map(id=>{const a=LIFE_AREAS.find(x=>x.id===id);return <Tag key={id} color={deck.light}>{a?.emoji} {a?.label}</Tag>;})}
          </div>
          <Lbl mb={4}>Client Question</Lbl>
          <div style={{color:T.cream,fontSize:12,fontStyle:"italic",lineHeight:1.65}}>"{session.question}"</div>
        </Box>

        {/* Deck info */}
        <Box style={{marginBottom:12}}>
          <Lbl>✦ Deck Purpose</Lbl>
          <p style={{color:T.cream,fontSize:12,lineHeight:1.72,margin:0}}>{deck.description}</p>
        </Box>
        <Box style={{marginBottom:18,border:`1px solid ${deck.light}28`,background:`${deck.color}50`}}>
          <Lbl color={deck.light}>✦ Instructions</Lbl>
          <p style={{color:T.cream,fontSize:12,lineHeight:1.78,margin:0}}>{deck.instruction}</p>
          <div style={{color:T.cream,fontSize:11,opacity:.5,marginTop:8}}>Cards required: <strong style={{color:deck.light}}>{deck.cards.length}</strong></div>
        </Box>

        {/* Status messages */}
        {resetOk&&<Alert type="ok">{resetOk}</Alert>}
        {svcErr&&phase==="upload"&&(
          <div style={{background:"rgba(150,15,15,.1)",border:"1px solid rgba(255,60,60,.28)",borderRadius:10,padding:"12px 14px",marginBottom:14}}>
            <div style={{color:"#ff9090",fontSize:13,fontWeight:700,marginBottom:8}}>⚠ Interpretation service is temporarily unavailable</div>
            <div style={{color:T.cream,fontSize:12,lineHeight:1.6,marginBottom:12,opacity:.85}}>{svcErr}</div>
            <Btn onClick={()=>read(false)} disabled={!allNamed} sm>🔄 Retry Interpretation</Btn>
          </div>
        )}

        {/* ═══ UPLOAD PHASE ═══ */}
        {phase==="upload"&&(
          <div>
            {/* Info banner */}
            <Box style={{marginBottom:16,border:"1px solid rgba(201,168,76,.16)"}}>
              <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                <span style={{fontSize:18,flexShrink:0}}>📱</span>
                <div>
                  <div style={{color:T.gold,fontSize:11,fontWeight:700,marginBottom:3}}>Card Upload + Auto Recognition</div>
                  <div style={{color:T.cream,fontSize:11,lineHeight:1.64,opacity:.72}}>
                    Upload a photo of each card. The system will <strong style={{color:T.gold}}>automatically read the card name</strong> from the image. Verify or correct the name below each photo. Camera and gallery work on your <strong style={{color:T.gold}}>real phone browser</strong> after deploying to Netlify.
                  </div>
                </div>
              </div>
            </Box>

            {/* Upload progress */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
              <Lbl mb={0}>✦ Your {deck.cards.length} Cards</Lbl>
              <div style={{textAlign:"right"}}>
                <div style={{color:imgN===deck.cards.length?"#7CFC00":T.cream,fontSize:10,opacity:.62}}>📷 {imgN}/{deck.cards.length} photos</div>
                <div style={{color:namedN===deck.cards.length?"#7CFC00":T.cream,fontSize:10,opacity:.62}}>✍ {namedN}/{deck.cards.length} names</div>
              </div>
            </div>
            <div style={{height:3,background:"rgba(201,168,76,.09)",borderRadius:4,marginBottom:16,overflow:"hidden"}}>
              <div style={{height:"100%",borderRadius:4,background:T.gold,width:`${(namedN/deck.cards.length)*100}%`,transition:"width .4s"}}/>
            </div>

            {/* Card slots */}
            {deck.cards.map(card=>(
              <CardSlot key={card.id} card={card}
                imgVal={images[card.id]} nameVal={names[card.id]} conf={conf[card.id]}
                deckLight={deck.light} deckColor={deck.color}
                onImg={img=>setImg(card.id,img)} onName={(n,c)=>setName(card.id,n,c)}
              />
            ))}

            {/* Low confidence validation */}
            {hasLowConf&&(
              <Alert type="warn">⚠ One or more cards could not be clearly identified from the image. Please verify all card names are correct before interpreting, or replace the photos with clearer images.</Alert>
            )}

            {/* Interpret button + demo */}
            <div style={{display:"flex",flexDirection:"column",gap:10,alignItems:"center",marginTop:10}}>
              <Btn onClick={()=>read(false)} disabled={!allNamed||loading} full>
                {allNamed?`✦ Interpret Cards`:`Enter all ${deck.cards.length} card names to continue`}
              </Btn>
              {!allNamed&&<div style={{color:T.cream,fontSize:10,opacity:.28}}>{deck.cards.length-namedN} more name{deck.cards.length-namedN!==1?"s":""} needed</div>}
              <div style={{width:"100%",borderTop:"1px solid rgba(201,168,76,.1)",paddingTop:12,marginTop:4,textAlign:"center"}}>
                <div style={{color:T.cream,fontSize:10,opacity:.2,marginBottom:8}}>— OR TEST WITHOUT REAL CARDS —</div>
                <Btn onClick={()=>read(true)} purple full>✦ Demo Mode — Sample Reading</Btn>
                <div style={{color:T.cream,fontSize:10,opacity:.18,marginTop:5,lineHeight:1.5}}>AI generates a demonstration reading with sample cards for testing.</div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ LOADING ═══ */}
        {phase==="loading"&&<Spin label={`Interpreting ${deck.name} cards`}/>}

        {/* ═══ DONE PHASE ═══ */}
        {phase==="done"&&Array.isArray(cards)&&(
          <div>
            {/* Photo previews */}
            {Object.values(images).some(Boolean)&&(
              <div style={{marginBottom:18}}>
                <Lbl>✦ Cards Drawn</Lbl>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {deck.cards.map((card,i)=>images[card.id]?(
                    <div key={card.id} style={{textAlign:"center",position:"relative"}}>
                      <img src={images[card.id]} alt={card.role} style={{width:64,height:94,objectFit:"cover",borderRadius:9,border:`2px solid ${cards[i]?.error?"#ff4444":deck.light+"55"}`,boxShadow:`0 3px 12px ${deck.color}88`,filter:cards[i]?.error?"grayscale(50%) brightness(.68)":"none"}}/>
                      {cards[i]?.error&&<div style={{position:"absolute",top:2,right:2,width:18,height:18,borderRadius:"50%",background:"#ff2222",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#fff",fontWeight:700}}>!</div>}
                      <div style={{color:cards[i]?.error?"#ff9090":T.cream,fontSize:8,opacity:.56,marginTop:3,maxWidth:64,lineHeight:1.2}}>{card.role}</div>
                    </div>
                  ):null)}
                </div>
              </div>
            )}

            {/* Card interpretations */}
            <Lbl style={{marginBottom:12}}>✦ Card Interpretations</Lbl>
            {cards.map((cd,i)=><CardResult key={i} cd={cd} meta={deck.cards[i]} deckLight={deck.light} deckColor={deck.color} idx={i}/>)}

            {/* Error banner */}
            {errCards.length>0&&(
              <div style={{background:"rgba(150,15,15,.13)",border:"1.5px solid rgba(255,55,55,.32)",borderRadius:12,padding:"14px 16px",marginBottom:16}}>
                <div style={{color:"#ff9090",fontSize:15,fontWeight:700,marginBottom:7}}>⚠ {errCards.length} Card{errCards.length>1?"s":""} Could Not Be Interpreted</div>
                <p style={{color:T.cream,fontSize:12,opacity:.8,margin:"0 0 12px",lineHeight:1.6}}>Please reset this deck and re-upload clearer images for:</p>
                {errCards.map((ec,i)=>(
                  <div key={i} style={{display:"flex",gap:8,padding:"5px 0",borderBottom:i<errCards.length-1?"1px solid rgba(255,55,55,.1)":"none"}}>
                    <span style={{color:"#ff9090",flexShrink:0}}>⚠</span>
                    <div>
                      <span style={{color:"#ffaa88",fontSize:12,fontWeight:700}}>Card {deck.cards[ec.idx]?.n} ({deck.cards[ec.idx]?.role})</span>
                      <div style={{color:T.cream,fontSize:11,opacity:.58,marginTop:2}}>{ec.errorReason||"Could not be interpreted"}</div>
                    </div>
                  </div>
                ))}
                <div style={{marginTop:14}}><Btn onClick={()=>setConfrm(true)} danger full>↺ Reset Deck</Btn></div>
              </div>
            )}

            {/* Deck summary */}
            {allOk&&answer.length>10&&(
              <div style={{marginBottom:22}}>
                <Lbl style={{marginBottom:12}}>✦ Suggested Answer</Lbl>
                <DeckSummaryBlock answer={answer} deck={deck}/>
              </div>
            )}

            {/* Actions */}
            <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:10}}>
              {!confrm?(
                <button onClick={()=>setConfrm(true)} style={{background:"transparent",border:"1px solid rgba(255,100,100,.2)",borderRadius:30,padding:"9px 20px",cursor:"pointer",color:"rgba(255,150,150,.56)",fontSize:12}}>
                  ↺ Reset Current Deck
                </button>
              ):(
                <div style={{background:"rgba(150,15,15,.1)",border:"1px solid rgba(255,60,60,.22)",borderRadius:12,padding:14,animation:"fi .2s"}}>
                  <div style={{color:"#ff9090",fontSize:13,fontWeight:700,textAlign:"center",marginBottom:7}}>Reset this deck?</div>
                  <p style={{color:T.cream,fontSize:11,opacity:.58,textAlign:"center",margin:"0 0 12px",lineHeight:1.5}}>
                    All uploaded images, card names and interpretations for this deck will be deleted. All other completed decks are not affected.
                  </p>
                  <div style={{display:"flex",gap:8,justifyContent:"center"}}>
                    <Btn onClick={()=>setConfrm(false)} outline sm>Cancel</Btn>
                    <Btn onClick={doReset} danger sm>Yes, Reset Deck</Btn>
                  </div>
                </div>
              )}

              {!confrm&&(
                canProceed?(
                  isLast?(
                    allDone?<Btn onClick={()=>{onClose();window.scrollTo({top:0,behavior:"smooth"});}} full>✦ Proceed to Final Reading Summary</Btn>:(
                      <div>
                        <Alert type="warn">⚠ Complete all 5 decks before viewing the Final Reading Summary.</Alert>
                        {DECKS.map(d=>{
                          const st=session.ds?.[d.id]?.status;
                          const done=st==="completed";
                          return (
                            <div key={d.id} style={{display:"flex",alignItems:"center",gap:9,padding:"7px 12px",marginBottom:5,borderRadius:8,background:done?"rgba(100,200,100,.05)":"rgba(255,100,100,.05)",border:`1px solid ${done?"rgba(100,200,100,.12)":"rgba(255,100,100,.12)"}`}}>
                              <span style={{fontSize:13}}>{d.emoji}</span>
                              <span style={{color:done?"#7CFC00":"#ff9090",fontSize:11,flex:1}}>{d.subtitle}</span>
                              <span style={{fontSize:11}}>{done?"✓":"○"}</span>
                            </div>
                          );
                        })}
                      </div>
                    )
                  ):(
                    <Btn onClick={()=>{onNext();window.scrollTo({top:0,behavior:"smooth"});}} full>
                      Continue to {DECKS[deckIdx+1]?.subtitle} {DECKS[deckIdx+1]?.emoji}
                    </Btn>
                  )
                ):(
                  errCards.length>0?
                    <div style={{textAlign:"center"}}><div style={{color:"#ff9090",fontSize:12,marginBottom:8}}>⚠ Fix unreadable cards above before proceeding</div><Btn disabled full>Proceed (Fix Card Errors First)</Btn></div>:
                    <div style={{textAlign:"center",color:"#ffaa44",fontSize:12}}>Waiting for all cards to be successfully interpreted...</div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// SECTION 4 — FINAL READING SUMMARY
// ══════════════════════════════════════════════════════════════
function Section4({session,onNewSession}) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(session.summary||"");
  const [exported,setExported]= useState(false);
  const allImg = Store.loadImages();

  useEffect(()=>{ if(!summary) genSummary(); },[]);

  async function genSummary() {
    setLoading(true);
    try {
      const areaLabels=(session.lifeAreas||[]).map(id=>LIFE_AREAS.find(a=>a.id===id)?.label||id).join(", ");
      const parts=DECKS.map(d=>{
        const ds=session.ds?.[d.id];
        if(!ds||ds.status!=="completed"||!ds.interpretations) return `${d.emoji} ${d.name}: Not completed`;
        const names=ds.interpretations.map((c,i)=>c.error?"[unread]":c.cardName).join(", ");
        return `${d.emoji} ${d.name} (${d.purpose}):\nCards: ${names}\nSummary: ${(ds.summary||"").substring(0,300)}`;
      }).join("\n\n");

      const prompt=`You are a professional mystical card reader generating a comprehensive final consultation report.

Client Life Area(s): ${areaLabels}
Client Question: "${session.question}"

Five-Deck Reading Summary:
${parts}

Generate a comprehensive professional final reading narrative that covers:
1. Current Situation — based on Crystal Reading
2. Root Cause — based on Egyptian Oracle
3. Key Influences — based on Astrology Reading
4. Recommended Actions — based on Magic Oracle
5. Potential Outcome — based on Mystical Realm Tarot
6. Key Message for the Client

This must read as one coherent professional consultation report — NOT five separate summaries. Reference specific card names throughout. Under 400 words. Warm, professional, mystical, empowering. No bullet points.`;

      const res=await fetch(ORACLE_ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt})});
      const txt=await res.text().catch(()=>"");
      let data={};
      try{data=JSON.parse(txt);}catch(_){data={error:txt.substring(0,200)};}
      if(!res.ok||data.error) throw new Error(data.error||`HTTP ${res.status}`);
      const text=data.result||fallback();
      setSummary(text);
      // save summary to session
    }catch(_){setSummary(fallback());}
    setLoading(false);
  }

  function fallback(){
    return `Let me bring everything together into one complete reading for you.\n\nYour Crystal Reading revealed the current emotional truth you are carrying — the energy present beneath the surface of your situation. The Egyptian Oracle then uncovered the deeper spiritual root cause and the soul lesson being offered to you at this time, showing you why this situation has come into your life.\n\nYour Astrology Reading illuminated the external and internal forces surrounding you — the cosmic timing and influences that are actively shaping your experience. The Magic Oracle then translated all of this wisdom into specific, practical action — the steps and spiritual practices that will genuinely shift your situation when applied with intention.\n\nFinally, the Mystical Tarot mapped the most probable path ahead, offering you a clear view of where your journey is leading if you choose to act on the guidance received today.\n\nRemember always: you retain complete free will. These cards reflect the current energetic landscape and most probable trajectory — not a fixed or unchangeable destiny. Every action you take between now and then has the power to shape your outcome. You have within you everything you need to create the life and future you desire.\n\nThank you for the trust and openness you brought to this reading today. ✦`;
  }

  function exportReport() {
    const date = new Date().toLocaleDateString("en-SG",{year:"numeric",month:"long",day:"numeric"});
    const areaLabels=(session.lifeAreas||[]).map(id=>LIFE_AREAS.find(a=>a.id===id)?.label||id).join(", ");
    const lines=[
      "═══════════════════════════════════════════════════════════",
      "     MYSTICAL 5-DECK READING — CONSULTATION REPORT",
      "═══════════════════════════════════════════════════════════",
      "",
      `Session Date  : ${date}`,
      `Session ID    : ${session.id}`,
      `Life Area(s)  : ${areaLabels}`,
      "",
      "CLIENT QUESTION",
      "─────────────────────────────────────",
      session.question,
      "",
    ];
    DECKS.forEach(d=>{
      const ds=session.ds?.[d.id];
      lines.push("═══════════════════════════════════════════════════════════");
      lines.push(`${d.emoji}  ${d.name.toUpperCase()}`);
      lines.push(`Purpose: ${d.purpose}`);
      lines.push("─────────────────────────────────────");
      if(ds?.interpretations){
        ds.interpretations.forEach((c,i)=>{
          lines.push(`\nCard ${d.cards[i]?.n} — ${d.cards[i]?.role}`);
          if(c.error){ lines.push("[Could not be read]"); return; }
          lines.push(`Name: ${c.cardName}`);
          if(c.keywords?.length) lines.push(`Keywords: ${c.keywords.join(", ")}`);
          lines.push(`Interpretation: ${c.meaning}`);
        });
        if(ds.summary){ lines.push("\nSUGGESTED ANSWER"); lines.push(ds.summary); }
      } else { lines.push("[Not completed]"); }
      lines.push("");
    });
    lines.push("═══════════════════════════════════════════════════════════");
    lines.push("FINAL READING SUMMARY");
    lines.push("═══════════════════════════════════════════════════════════");
    lines.push("");
    lines.push(summary||"");
    lines.push("");
    lines.push("═══════════════════════════════════════════════════════════");
    lines.push("CLOSING");
    lines.push("═══════════════════════════════════════════════════════════");
    lines.push("");
    lines.push("You hold within you the wisdom, strength and agency to create the life you desire.");
    lines.push("The cards have illuminated your path — the next step is yours to take.");
    lines.push("Trust yourself. Trust the process. Trust the journey. ✦");
    lines.push("");
    lines.push("═══════════════════════════════════════════════════════════");
    lines.push("Generated by Mystical 5-Deck Reading System");
    lines.push(`${date}`);
    lines.push("═══════════════════════════════════════════════════════════");

    const blob=new Blob([lines.join("\n")],{type:"text/plain;charset=utf-8"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url; a.download=`mystical_reading_${session.id}.txt`;
    a.click(); URL.revokeObjectURL(url);
    setExported(true);
  }

  const areaLabels=(session.lifeAreas||[]).map(id=>LIFE_AREAS.find(a=>a.id===id)?.label||id);

  return (
    <div style={{padding:"20px 16px 36px",animation:"up .4s ease"}}>
      <Dots step={4} total={4}/>
      <div style={{textAlign:"center",marginBottom:20}}>
        <div style={{fontSize:44,animation:"float 3s infinite",display:"inline-block",marginBottom:6}}>✦</div>
        <Lbl sx={{letterSpacing:4,textAlign:"center",marginBottom:5}}>Section 4 — Final Summary</Lbl>
        <h2 style={{fontFamily:"Georgia,serif",color:T.gold,fontSize:21,margin:0}}>Complete Reading Report</h2>
        <Rule/>
        <p style={{color:T.cream,fontSize:12,opacity:.58,margin:0}}>All 5 decks analysed together as one complete consultation</p>
      </div>

      {/* Reading details */}
      <Box style={{marginBottom:14}}>
        <Lbl mb={6}>Consultation Details</Lbl>
        <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:8}}>
          {areaLabels.map((l,i)=><Tag key={i}>{l}</Tag>)}
        </div>
        <div style={{color:T.cream,fontSize:12,fontStyle:"italic",lineHeight:1.65}}>"{session.question}"</div>
        <div style={{color:T.muted,fontSize:10,marginTop:6}}>Session: {session.id} · {new Date(session.createdAt).toLocaleDateString()}</div>
      </Box>

      {/* 5-deck journey recap */}
      <div style={{marginBottom:18}}>
        <Lbl>✦ 5-Deck Reading Journey</Lbl>
        {DECKS.map((d,i)=>{
          const ds=session.ds?.[d.id];
          const cardNames=ds?.interpretations?.filter(c=>!c.error).map(c=>c.cardName).join(" · ")||"";
          return (
            <div key={d.id} style={{background:`${d.color}66`,border:`1px solid ${d.light}33`,borderRadius:11,padding:"10px 13px",marginBottom:7,animation:`up .3s ${i*.08}s ease both`}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:cardNames?5:0}}>
                <span style={{fontSize:17,flexShrink:0}}>{d.emoji}</span>
                <div style={{flex:1}}>
                  <div style={{color:d.light,fontSize:10,fontWeight:700,letterSpacing:.5}}>{d.purpose.toUpperCase()} — {d.name}</div>
                </div>
                <div style={{color:ds?.status==="completed"?"#7CFC00":"#ff9090",fontSize:11}}>{ds?.status==="completed"?"✓":"○"}</div>
              </div>
              {cardNames&&<div style={{color:T.gold,fontSize:11,fontStyle:"italic",paddingLeft:25,lineHeight:1.5}}>{cardNames}</div>}
            </div>
          );
        })}
      </div>

      {/* Final narrative */}
      <Box style={{marginBottom:20,border:`1px solid ${T.gold}44`}}>
        <Lbl>✦ Comprehensive Reading Report</Lbl>
        {loading?<Spin label="Generating your complete reading narrative"/>:
          <div style={{color:T.cream,fontSize:13,lineHeight:1.92,whiteSpace:"pre-wrap",fontStyle:"italic"}}>{summary}</div>}
      </Box>

      {/* Professional closing */}
      <Box style={{marginBottom:22,background:"rgba(201,168,76,.05)",border:`1px solid ${T.gold}22`}}>
        <Lbl>✦ Professional Closing</Lbl>
        {[
          {n:"Appreciation",  t:"Thank you for your trust",     b:"Thank you for the openness, courage and trust you brought to this reading today. It is a privilege to hold space for your journey."},
          {n:"Empowerment",   t:"You are the author",            b:"The cards are a map, not a mandate. Every insight, every action step, every outcome — they all flow from the choices you make. You have more power than you know."},
          {n:"Free Will",     t:"Your destiny is your own",      b:"These cards reflect the current energetic landscape and most probable path. Nothing here is fixed or unchangeable. Your free will remains absolute at every moment."},
          {n:"Closing",       t:"Trust the journey",             b:"You hold within you the wisdom, strength and agency to create the life you desire. Trust yourself. Trust the process. The next step is yours to take. Go well. ✦"},
        ].map((r,i)=>(
          <div key={i} style={{display:"flex",gap:11,marginBottom:i<3?13:0,alignItems:"flex-start"}}>
            <div style={{width:26,height:26,borderRadius:"50%",background:"rgba(201,168,76,.14)",border:`1px solid ${T.gold}`,display:"flex",alignItems:"center",justifyContent:"center",color:T.gold,fontSize:9,fontWeight:700,flexShrink:0,letterSpacing:.5}}>{i+1}</div>
            <div>
              <div style={{color:T.gold,fontSize:12,fontWeight:700,marginBottom:2}}>{r.t}</div>
              <div style={{color:T.cream,fontSize:11,lineHeight:1.65,opacity:.82}}>{r.b}</div>
            </div>
          </div>
        ))}
      </Box>

      {/* Action buttons */}
      <div style={{display:"flex",flexDirection:"column",gap:11,paddingBottom:12,textAlign:"center"}}>
        <Btn onClick={exportReport} teal full>
          {exported?"✓ Report Exported — Download Complete":"⬇ Export Consultation Report"}
        </Btn>
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
  const [deckIdx,  setDeckIdx]  = useState(0);
  const [restored, setRestored] = useState(false);
  const timerRef = useRef(null);

  // Load saved session on mount
  useEffect(()=>{
    const saved = Store.loadSession();
    if (saved?.question||Object.values(saved?.ds||{}).some(d=>d.status==="completed")) {
      const merged = { ...makeSession(), ...saved, ds: { ...makeSession().ds, ...saved.ds } };
      setSession(merged);
      setRestored(true);
    }
  },[]);

  // Autosave every 30 seconds
  useEffect(()=>{
    timerRef.current = setInterval(()=>Store.saveSession(session), 30000);
    return ()=>clearInterval(timerRef.current);
  },[session]);

  const hasSession = !!(session.question||Object.values(session.ds||{}).some(d=>d.status!=="not_started"));

  function startNew() {
    Store.clear();
    const s = makeSession();
    setSession(s);
    setDeckIdx(0);
    setRestored(false);
    Store.saveSession(s);
    setScreen("s1");
  }

  function resume() {
    const completedN = DECKS.filter(d=>session.ds?.[d.id]?.status==="completed").length;
    if (completedN>=DECKS.length) { setScreen("s4"); return; }
    if (completedN>0||session.question) { setDeckIdx(completedN); setScreen("s3"); return; }
    if (session.lifeAreas?.length>0)    { setScreen("s2"); return; }
    setScreen("s1");
  }

  function updateSession(u) {
    setSession(p=>{ const n={...p,...u}; Store.saveSession(n); return n; });
  }

  function saveDeck(deckId, data) {
    setSession(p=>{
      const n={...p,ds:{...p.ds,[deckId]:{...p.ds?.[deckId],...data}}};
      // Immediate save on every deck update
      Store.saveSession(n);
      if(data.images) Store.saveImages(deckId,data.images);
      return n;
    });
  }

  function nextDeck() {
    if (deckIdx<DECKS.length-1) { setDeckIdx(deckIdx+1); }
    else {
      const allDone=DECKS.every(d=>session.ds?.[d.id]?.status==="completed");
      if(allDone) setScreen("s4");
    }
  }

  function goBack() {
    if(screen==="s1")                     { setScreen("welcome"); return; }
    if(screen==="s2")                     { setScreen("s1");      return; }
    if(screen==="s3"&&deckIdx===0)        { setScreen("s2");      return; }
    if(screen==="s3"&&deckIdx>0)          { setDeckIdx(deckIdx-1);return; }
    if(screen==="s4")                     { setScreen("s3"); setDeckIdx(DECKS.length-1); return; }
  }

  return (
    <div style={{minHeight:"100vh",background:`radial-gradient(ellipse at 22% 18%,#1A0A3C 0%,#08001C 55%,${T.bg} 100%)`,color:T.cream,fontFamily:"Palatino Linotype,Palatino,Georgia,serif",position:"relative",overflowX:"hidden"}}>
      <Stars/>
      <div style={{position:"relative",zIndex:1,maxWidth:480,margin:"0 auto"}}>

        {/* Back button */}
        {screen!=="welcome"&&(
          <div style={{position:"fixed",top:12,left:Math.max(12,(window.innerWidth-480)/2+12),zIndex:300}}>
            <button onClick={goBack} style={{background:"rgba(16,5,35,.95)",border:"1px solid rgba(201,168,76,.22)",borderRadius:"50%",width:34,height:34,cursor:"pointer",color:T.gold,fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(8px)"}}>←</button>
          </div>
        )}

        {screen==="welcome"&&<Welcome onStart={startNew} onResume={resume} hasSession={hasSession} restored={restored}/>}
        {screen==="s1"&&<Section1 onNext={()=>setScreen("s2")} onSkip={()=>setScreen("s2")}/>}
        {screen==="s2"&&<Section2 session={session} onUpdate={updateSession} onNext={()=>{setDeckIdx(0);setScreen("s3");}}/>}
        {screen==="s3"&&(
          <DeckScreen
            session={session} deckIdx={deckIdx}
            onSave={saveDeck} onNext={nextDeck}
            onGoTo={i=>setDeckIdx(i)} onClose={()=>setScreen("s4")}
          />
        )}
        {screen==="s4"&&<Section4 session={session} onNewSession={startNew}/>}
      </div>
    </div>
  );
}
