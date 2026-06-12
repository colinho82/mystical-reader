import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════════════════
// MYSTICAL CARD READER — Complete 5-Deck Reading System
// API calls routed through Netlify Function (/.netlify/functions/oracle)
// Add DEEPSEEK_KEY in Netlify → Site config → Environment variables
// ═══════════════════════════════════════════════════════════════════
const ORACLE_ENDPOINT = "/.netlify/functions/oracle";

// ── PALETTE ───────────────────────────────────────────────────────
const C = {
  gold:    "#C9A84C",
  goldLt:  "#E8C060",
  cream:   "#F5E6C8",
  purple:  "#1E0A3C",
  purpleMd:"#2D1060",
  purpleLt:"#4A2080",
  muted:   "rgba(245,230,200,0.45)",
  dim:     "rgba(245,230,200,0.22)",
  card:    "rgba(20,8,40,0.88)",
  overlay: "rgba(10,4,24,0.96)",
};

// ── DATA ──────────────────────────────────────────────────────────
const AREAS = [
  { id:"love",         emoji:"💕", label:"Love & Relationships",  color:"#7A1848", light:"#FF6B9D",
    qs:["Will my relationship improve or is it time to let go?","Why do my relationships keep ending the same way?","What is blocking me from receiving love?","Is this relationship growing me or depleting me?","How do I heal from heartbreak and open up again?","Why do I repeat the same painful patterns in love?","Am I holding onto something I should release?","How do I know if this person is right for me?"] },
  { id:"career",       emoji:"🌟", label:"Career & Life Purpose",  color:"#1A4020", light:"#7CFC00",
    qs:["Should I change my job or stay where I am?","Why do I feel so stuck in my career?","What hidden skill or talent am I ignoring?","What is my true life purpose?","Should I start my own business?","Am I resisting a change I need to make?","Why don't I feel valued at work?","I fear I'm not good enough for promotion — is this true?"] },
  { id:"finances",     emoji:"💰", label:"Finances & Abundance",   color:"#3A2800", light:"#FFD700",
    qs:["What is blocking my financial flow?","What is my core money wound?","Is fear blocking my abundance?","What opportunity am I missing?","How do I break the cycle of financial struggle?","I save but never feel secure — why?","What mindset shift would transform my finances?","How do I create multiple income streams?"] },
  { id:"family",       emoji:"🏠", label:"Family & Home",          color:"#0A2030", light:"#4FC3F7",
    qs:["How do I set healthy boundaries without guilt?","Why do I seek approval that never comes?","How do I heal a broken family relationship?","Am I enabling someone I love?","How do I navigate a toxic family dynamic?","My adult child won't speak to me — what should I do?","How do I balance family and my own needs?","Why do the same conflicts keep repeating?"] },
  { id:"growth",       emoji:"🌱", label:"Personal Growth",        color:"#220A3A", light:"#CE93D8",
    qs:["What truth am I avoiding?","Why do I self-sabotage when things go well?","I feel I have no purpose — help.","What fear is most holding me back?","How do I break free from old patterns?","Why do I struggle to love and accept myself?","How do I build more confidence?","What is the next chapter of my growth?"] },
  { id:"spirituality", emoji:"🔮", label:"Spirituality",           color:"#1A0830", light:"#B388FF",
    qs:["Am I following my intuition or my ego?","What sign am I overlooking?","I don't trust my intuition — how do I develop it?","Am I on my soul's true path?","How do I deepen my spiritual practice?","What spiritual gifts am I not using?","How do I reconnect with my higher self?","What does my higher self most want me to know?"] },
];

const DECKS = [
  { id:"crystal",   emoji:"💎", name:"Crystal Reading Cards",      subtitle:"Current Energy",
    color:"#5A0A30", light:"#FF6B9D",
    purpose:"Reveals your current emotional truth — the energy you are carrying right now beneath the surface.",
    instruction:"Hold your Crystal Reading Cards gently. Focus on how you FEEL right now — not your question, but your emotional state. Shuffle slowly and mindfully, then draw 3 cards one at a time.",
    cards:[
      { id:"c1", label:"Card 1", role:"Current Emotional State",  desc:"What energy are you carrying right now?",    eg:"e.g. Rose Quartz, Citrine, Amethyst" },
      { id:"c2", label:"Card 2", role:"Hidden Challenge",         desc:"What emotional wound needs attention?",      eg:"e.g. Obsidian, Black Tourmaline, Malachite" },
      { id:"c3", label:"Card 3", role:"Healing Opportunity",      desc:"What inner strength do you already have?",  eg:"e.g. Clear Quartz, Selenite, Labradorite" },
    ]},
  { id:"egyptian",  emoji:"👁",  name:"Egyptian Book of the Dead", subtitle:"Root Cause",
    color:"#3A1500", light:"#FF8C42",
    purpose:"Uncovers the spiritual root cause behind your situation — the soul lesson hidden within your challenge.",
    instruction:"Hold your Egyptian Oracle deck. Close your eyes and take 3 deep breaths. Ask silently: 'Show me why this is happening and what my soul needs to learn.' Shuffle with intention and draw 3 cards.",
    cards:[
      { id:"e1", label:"Card 1", role:"Past Influence",           desc:"Why is this situation happening?",          eg:"e.g. Osiris, Isis, Anubis" },
      { id:"e2", label:"Card 2", role:"Current Lesson",           desc:"What soul lesson am I here to learn?",      eg:"e.g. Thoth, Ra, Hathor" },
      { id:"e3", label:"Card 3", role:"Transformation Available", desc:"What am I overlooking?",                   eg:"e.g. Sekhmet, Horus, Ma'at" },
    ]},
  { id:"astrology", emoji:"🌙", name:"Astrology Reading Cards",    subtitle:"Influences & Timing",
    color:"#0A0A3A", light:"#7B8CDE",
    purpose:"Reveals what cosmic forces and timing are affecting your situation from the outside.",
    instruction:"Separate into 3 piles: Planets, Zodiac Signs, Houses. Shuffle each pile separately while focusing on your question. Draw 1 card from each pile.",
    cards:[
      { id:"a1", label:"Planet Card",  role:"Current Influence",  desc:"What cosmic energy is most affecting you?", eg:"e.g. Saturn, Venus, Jupiter, Mars" },
      { id:"a2", label:"Zodiac Card",  role:"Opportunity",        desc:"What opportunity is emerging?",            eg:"e.g. Scorpio, Libra, Capricorn, Aries" },
      { id:"a3", label:"House Card",   role:"Timing & Challenge", desc:"What life area and timing?",               eg:"e.g. 7th House, 10th House, 2nd House" },
    ]},
  { id:"magic",     emoji:"✨", name:"Magic Oracle Cards",          subtitle:"Action Plan",
    color:"#1A0840", light:"#B388FF",
    purpose:"Gives you concrete, practical action steps — transforming insight into real change this week.",
    instruction:"Shuffle your Magic Oracle Cards while asking: 'What actions and shifts will serve me most right now?' Draw with intention and select 3 cards.",
    cards:[
      { id:"m1", label:"Card 1", role:"Immediate Action",         desc:"What is the most important step this week?",eg:"e.g. Self-Love Ritual, Release Spell" },
      { id:"m2", label:"Card 2", role:"Mindset Shift",            desc:"What belief or pattern needs to change?",   eg:"e.g. Abundance Ritual, Clarity Spell" },
      { id:"m3", label:"Card 3", role:"Manifestation Focus",      desc:"What energy attracts what you want?",      eg:"e.g. New Moon Intention, Fire Ritual" },
    ]},
  { id:"tarot",     emoji:"🌀", name:"Mystical Realm Tarot",        subtitle:"Outcome & Final Map",
    color:"#1A003A", light:"#CE93D8",
    purpose:"The final map — position, obstacles, opportunities, wisest advice and most probable outcome.",
    instruction:"Shuffle the full 78 Tarot cards while holding your question in mind. You may cut the deck. Draw 5 cards and lay them face down, then turn each one over.",
    cards:[
      { id:"t1", label:"Card 1", role:"Current Situation",        desc:"Where do you actually stand right now?",   eg:"e.g. The Moon, Three of Cups, The Fool" },
      { id:"t2", label:"Card 2", role:"Obstacle",                 desc:"What is working against you?",            eg:"e.g. The Tower, Five of Swords, The Devil" },
      { id:"t3", label:"Card 3", role:"Opportunity",              desc:"What hidden resource wants to help?",      eg:"e.g. The Star, Ace of Cups, The Sun" },
      { id:"t4", label:"Card 4", role:"Advice",                   desc:"What is the single wisest move?",          eg:"e.g. The Hermit, Strength, The Magician" },
      { id:"t5", label:"Card 5", role:"Likely Outcome",           desc:"If you follow the advice, where does this lead?", eg:"e.g. The World, Ten of Pentacles" },
    ]},
];

const EMPTY_SESSION = {
  lifeArea: null, question: "",
  deckResults: {}, deckImages: {}, deckCardNames: {}, deckCardData: {},
  summary: null,
};

// ── STARS ─────────────────────────────────────────────────────────
const STAR_DATA = Array.from({ length: 55 }, (_, i) => ({
  id: i, x: Math.random() * 100, y: Math.random() * 100,
  s: Math.random() * 2 + 0.4, delay: Math.random() * 5, dur: Math.random() * 3 + 2,
}));

function Stars() {
  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}>
      {STAR_DATA.map(s => (
        <div key={s.id} style={{
          position:"absolute", left:`${s.x}%`, top:`${s.y}%`,
          width:s.s, height:s.s, borderRadius:"50%", background:"#fff",
          animation:`tw ${s.dur}s ${s.delay}s infinite alternate`,
        }} />
      ))}
      <style>{`
        @keyframes tw    { from{opacity:.04} to{opacity:.82} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
        @keyframes glow  { 0%,100%{box-shadow:0 0 12px 2px rgba(201,168,76,.25)} 50%{box-shadow:0 0 26px 7px rgba(201,168,76,.52)} }
        @keyframes up    { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fi    { from{opacity:0} to{opacity:1} }
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.07)} }
        @keyframes spin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        * { box-sizing:border-box; }
        input,textarea,button { font-family:inherit; }
        ::-webkit-scrollbar { width:0; }
      `}</style>
    </div>
  );
}

// ── SHARED PRIMITIVES ─────────────────────────────────────────────
function GoldBtn({ children, onClick, disabled, sm, outline, ghost, danger, purple, full, style: sx }) {
  const bg = danger  ? "rgba(160,20,20,.32)"
           : purple  ? "rgba(90,60,140,.32)"
           : outline || ghost ? "transparent"
           : disabled? "#251540"
           : `linear-gradient(135deg,${C.gold},${C.goldLt},${C.gold})`;
  const col = disabled? "#4a3a6a"
            : danger  ? "#ff9090"
            : purple  ? "#c0a0ff"
            : outline || ghost ? C.gold
            : C.purple;
  const bdr = danger?"#ff6060":purple?"#8060c0":disabled?"#3a2a5a":C.gold;
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background:bg, color:col,
      border:`1.5px solid ${bdr}`,
      borderRadius:30, padding:sm?"7px 16px":"11px 24px",
      fontSize:sm?11.5:13.5,
      fontWeight:700, letterSpacing:.7, cursor:disabled?"not-allowed":"pointer",
      transition:"all .22s",
      animation:!disabled&&!outline&&!ghost&&!danger&&!purple?"glow 2.4s infinite":"none",
      opacity:disabled?.48:1, width:full?"100%":"auto",
      ...sx,
    }}>{children}</button>
  );
}

function Card({ children, style: sx }) {
  return (
    <div style={{
      background: C.card, border:"1px solid rgba(201,168,76,.30)",
      borderRadius:14, padding:18, backdropFilter:"blur(10px)",
      boxShadow:"0 5px 24px rgba(0,0,0,.4)", ...sx,
    }}>{children}</div>
  );
}

function SectionLabel({ children, color, style: sx }) {
  return (
    <div style={{
      color: color || C.gold, fontSize:10, fontWeight:700,
      letterSpacing:2.5, textTransform:"uppercase", marginBottom:8, ...sx,
    }}>{children}</div>
  );
}

function Rule({ style: sx }) {
  return <div style={{ width:44, height:1, background:`linear-gradient(90deg,transparent,${C.gold},transparent)`, margin:"9px auto", ...sx }} />;
}

function ProgressDots({ step, total }) {
  return (
    <div style={{ display:"flex", justifyContent:"center", gap:7, marginBottom:16 }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{
          width: i === step - 1 ? 22 : 7, height:7, borderRadius:4,
          background: i < step ? C.gold : "rgba(201,168,76,.15)",
          transition:"all .4s",
        }} />
      ))}
    </div>
  );
}

function Spinner({ label }) {
  const [d, setD] = useState("");
  useEffect(() => {
    const t = setInterval(() => setD(x => x.length >= 3 ? "" : x + "."), 380);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ textAlign:"center", padding:"32px 0" }}>
      <div style={{ fontSize:36, animation:"spin 2.5s linear infinite", display:"inline-block", marginBottom:14 }}>✦</div>
      <div style={{ color:C.gold, fontFamily:"Georgia,serif", fontSize:16, marginBottom:6 }}>{label || "The oracle is reading"}{d}</div>
      <div style={{ color:C.cream, fontSize:12, opacity:.5, marginBottom:18 }}>Channelling wisdom for your reading</div>
      <div style={{ display:"flex", justifyContent:"center", gap:7 }}>
        {[0,1,2].map(i => <div key={i} style={{ width:9, height:9, borderRadius:"50%", background:C.gold, animation:`pulse 1.2s ${i*.22}s infinite` }} />)}
      </div>
    </div>
  );
}

// ── JOURNEY NAV ───────────────────────────────────────────────────
function JourneyNav({ session, curIdx, onGo }) {
  return (
    <div style={{
      background:"rgba(6,2,16,.97)", borderBottom:"1px solid rgba(201,168,76,.13)",
      padding:"8px 12px", display:"flex", gap:5, overflowX:"auto",
      WebkitOverflowScrolling:"touch", flexShrink:0, scrollbarWidth:"none",
    }}>
      {DECKS.map((d, i) => {
        const done = !!session.deckResults[d.id];
        const active = i === curIdx;
        return (
          <button key={d.id} onClick={() => done && onGo(i)} style={{
            background: active ? "rgba(201,168,76,.18)" : "transparent",
            border:`1px solid ${active ? C.gold : done ? "rgba(201,168,76,.38)" : "rgba(201,168,76,.10)"}`,
            borderRadius:20, padding:"5px 11px", cursor:done?"pointer":"default",
            color: active ? C.gold : done ? C.cream : "rgba(245,230,200,.25)",
            fontSize:10, whiteSpace:"nowrap", display:"flex", alignItems:"center", gap:4,
            transition:"all .2s", flexShrink:0,
          }}>
            <span>{d.emoji}</span>
            <span>{done && !active ? "✓ " : ""}{d.subtitle}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── CARD SLOT (upload + OCR pre-fill + manual name) ───────────────
function CardSlot({ card, imgVal, nameVal, onImg, onName, deckLight, deckColor, reading }) {
  const uid = card.id;
  const [showPick, setShowPick] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);

  const hasImg  = !!imgVal;
  const hasName = (nameVal || "").trim().length > 0;
  const isDone  = hasImg && hasName;

  function handleFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    e.target.value = "";
    const r = new FileReader();
    r.onload = async ev => {
      const dataUrl = ev.target.result;
      onImg(dataUrl);
      setShowPick(false);
      // OCR: send image to oracle endpoint to extract card name
      if (!reading) {
        setOcrLoading(true);
        try {
          const match = dataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
          if (match) {
            const res = await fetch(ORACLE_ENDPOINT, {
              method:"POST",
              headers:{"Content-Type":"application/json"},
              body:JSON.stringify({
                ocr: true,
                imageMediaType: match[1],
                imageData: match[2],
                cardRole: card.role,
              }),
            });
            const txt = await res.text();
            if (!txt.trim().startsWith("<")) {
              const data = JSON.parse(txt);
              if (data.cardName && data.cardName.trim()) {
                onName(data.cardName.trim());
              }
            }
          }
        } catch (_) {}
        setOcrLoading(false);
      }
    };
    r.readAsDataURL(f);
  }

  const oBtnStyle = {
    background:`${deckColor}99`, border:`1.5px solid ${deckLight}55`,
    borderRadius:10, padding:"11px 14px", cursor:"pointer",
    display:"flex", alignItems:"center", gap:11, width:"100%", textAlign:"left",
  };

  return (
    <div style={{
      marginBottom:16, borderRadius:14, padding:14,
      background: isDone ? `${deckColor}44` : "rgba(20,8,40,.6)",
      border:`1px solid ${isDone ? deckLight+"55" : "rgba(201,168,76,.15)"}`,
      animation:"up .3s ease both",
    }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
        <div style={{
          width:30, height:30, borderRadius:"50%", flexShrink:0,
          background: isDone ? `${deckColor}cc` : "rgba(201,168,76,.10)",
          border:`2px solid ${isDone ? deckLight : "rgba(201,168,76,.25)"}`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:11, color: isDone ? deckLight : C.gold, fontWeight:700,
        }}>
          {isDone ? "✓" : card.label.replace("Card ","").replace(" Card","")}
        </div>
        <div>
          <div style={{ color: isDone ? deckLight : C.gold, fontSize:13, fontWeight:700 }}>
            {card.label} — {card.role}
          </div>
          <div style={{ color:C.cream, fontSize:11, opacity:.52, marginTop:1 }}>{card.desc}</div>
        </div>
      </div>

      {/* ── PHOTO UPLOAD ── */}
      <SectionLabel style={{ marginBottom:7 }}>📷 Step 1 — Upload Card Photo</SectionLabel>

      {hasImg ? (
        <div style={{ display:"flex", gap:12, alignItems:"flex-start", marginBottom:14 }}>
          <div style={{ position:"relative", flexShrink:0 }}>
            <img src={imgVal} alt={card.role} style={{
              width:88, height:128, objectFit:"cover", borderRadius:10,
              border:`2.5px solid ${deckLight}88`,
              boxShadow:`0 4px 18px ${deckColor}bb`,
            }}/>
            <div style={{
              position:"absolute", bottom:-5, left:"50%", transform:"translateX(-50%)",
              background:deckColor, border:`1px solid ${deckLight}77`,
              borderRadius:10, padding:"2px 8px", color:deckLight, fontSize:9, fontWeight:700, whiteSpace:"nowrap",
            }}>✓ Uploaded</div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:7, paddingTop:2, flex:1 }}>
            <div style={{ color:C.cream, fontSize:10, opacity:.45, marginBottom:2 }}>Replace photo:</div>
            {[
              { id:`rc-${uid}`, cap:true,  icon:"📷", label:"Retake Photo" },
              { id:`rg-${uid}`, cap:false, icon:"🖼",  label:"Choose Gallery" },
            ].map(btn => (
              <label key={btn.id} htmlFor={btn.id} style={{
                background:"rgba(201,168,76,.08)", border:"1px solid rgba(201,168,76,.28)",
                borderRadius:20, padding:"7px 13px", cursor:"pointer",
                color:C.cream, fontSize:11, display:"flex", alignItems:"center", gap:7, userSelect:"none",
              }}>
                {btn.icon} {btn.label}
                <input id={btn.id} type="file" accept="image/*"
                  {...(btn.cap ? { capture:"environment" } : {})}
                  style={{ display:"none" }} onChange={handleFile} />
              </label>
            ))}
            <button onClick={() => { onImg(null); onName(""); }} style={{
              background:"rgba(160,20,20,.18)", border:"1px solid rgba(255,80,80,.25)",
              borderRadius:20, padding:"7px 13px", cursor:"pointer",
              color:"#ff9090", fontSize:11, display:"flex", alignItems:"center", gap:7,
            }}>🗑 Remove</button>
          </div>
        </div>
      ) : (
        !showPick ? (
          <div onClick={() => setShowPick(true)} style={{
            height:90, borderRadius:11, border:"2px dashed rgba(201,168,76,.25)",
            display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
            cursor:"pointer", background:"rgba(201,168,76,.03)", marginBottom:14, gap:5,
          }}>
            <div style={{ fontSize:24 }}>📷</div>
            <div style={{ color:C.cream, fontSize:12, opacity:.5 }}>Tap to upload {card.label}</div>
          </div>
        ) : (
          <div style={{
            background:C.overlay, border:"1px solid rgba(201,168,76,.32)",
            borderRadius:12, padding:14, marginBottom:14, animation:"fi .2s ease",
          }}>
            <div style={{ color:C.gold, fontSize:12, fontWeight:700, marginBottom:11 }}>
              How to add {card.label}?
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              <label htmlFor={`c-${uid}`} style={oBtnStyle}>
                <span style={{ fontSize:22, flexShrink:0 }}>📷</span>
                <div>
                  <div style={{ color:deckLight, fontSize:13, fontWeight:700 }}>Open Camera</div>
                  <div style={{ color:C.cream, fontSize:11, opacity:.6 }}>Take a photo of your card now</div>
                </div>
                <input id={`c-${uid}`} type="file" accept="image/*" capture="environment" style={{ display:"none" }} onChange={handleFile}/>
              </label>
              <label htmlFor={`g-${uid}`} style={oBtnStyle}>
                <span style={{ fontSize:22, flexShrink:0 }}>🖼</span>
                <div>
                  <div style={{ color:deckLight, fontSize:13, fontWeight:700 }}>Browse Gallery</div>
                  <div style={{ color:C.cream, fontSize:11, opacity:.6 }}>Choose from your photo library</div>
                </div>
                <input id={`g-${uid}`} type="file" accept="image/*" style={{ display:"none" }} onChange={handleFile}/>
              </label>
              <button onClick={() => setShowPick(false)} style={{
                background:"transparent", border:"none", color:"rgba(245,230,200,.28)",
                fontSize:12, cursor:"pointer", padding:"4px",
              }}>✕ Cancel</button>
            </div>
          </div>
        )
      )}

      {/* ── CARD NAME INPUT ── */}
      <SectionLabel style={{ marginBottom:7 }}>✍ Step 2 — Card Name</SectionLabel>
      <div style={{ color:C.cream, fontSize:11, opacity:.5, marginBottom:8 }}>
        {ocrLoading
          ? "🔍 Reading card from image..."
          : hasImg
            ? "The name has been pre-filled from the image. Correct it if needed."
            : "Type the name exactly as it appears on your physical card."}
      </div>
      <input
        type="text"
        value={nameVal || ""}
        onChange={e => onName(e.target.value)}
        placeholder={card.eg}
        disabled={ocrLoading}
        style={{
          width:"100%", padding:"10px 13px",
          background: ocrLoading ? "rgba(20,8,40,.5)" : "rgba(20,8,40,.88)",
          border:`1.5px solid ${hasName ? deckLight : "rgba(201,168,76,.22)"}`,
          borderRadius:9, color:C.cream, fontSize:13,
          outline:"none", transition:"border .2s",
        }}
      />
      {ocrLoading && (
        <div style={{ color:C.gold, fontSize:10, marginTop:4, animation:"pulse 1s infinite" }}>
          ✦ Auto-reading card name from image...
        </div>
      )}
      {hasName && !ocrLoading && (
        <div style={{ color:"#7CFC00", fontSize:10, marginTop:4 }}>
          ✓ <span style={{ fontStyle:"italic" }}>"{nameVal.trim()}"</span>
        </div>
      )}
      {!hasName && !ocrLoading && (
        <div style={{ color:"rgba(245,230,200,.3)", fontSize:10, marginTop:4 }}>
          Card name required before reading
        </div>
      )}
    </div>
  );
}

// ── CARD INTERPRETATION BLOCK ─────────────────────────────────────
function CardBlock({ cd, meta, deckLight, deckColor, idx }) {
  if (cd.error) {
    return (
      <div style={{
        background:"rgba(160,20,20,.12)", border:"1.5px solid rgba(255,70,70,.45)",
        borderRadius:14, padding:18, marginBottom:14, animation:"up .4s ease both",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
          <span style={{ fontSize:24 }}>⚠️</span>
          <div>
            <div style={{ color:"#ff9090", fontSize:16, fontWeight:700 }}>
              {meta?.label} — Could Not Be Read
            </div>
            <div style={{ color:"#ffaa88", fontSize:11, marginTop:2 }}>{meta?.role}</div>
          </div>
        </div>
        <div style={{
          background:"rgba(255,70,70,.07)", border:"1px solid rgba(255,70,70,.18)",
          borderRadius:9, padding:"10px 13px", marginBottom:10,
        }}>
          <div style={{ color:"#ff9090", fontSize:12, fontWeight:700, marginBottom:4 }}>Problem:</div>
          <div style={{ color:C.cream, fontSize:12, lineHeight:1.6, opacity:.85 }}>
            {cd.errorReason || "The card name could not be identified or interpreted."}
          </div>
        </div>
        <div style={{ color:"#ffcc88", fontSize:12, lineHeight:1.6 }}>
          👉 Reset this step and enter a clearer name for <strong style={{ color:"#ffaa44" }}>{meta?.label}</strong>.
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background:`linear-gradient(135deg,${deckColor}88,rgba(20,8,40,.94))`,
      border:`1.5px solid ${deckLight}44`,
      borderRadius:14, padding:"18px 16px", marginBottom:14,
      animation:"up .4s ease both",
    }}>
      {/* Badge + role */}
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
        <div style={{
          width:34, height:34, borderRadius:"50%",
          background:`${deckColor}cc`, border:`2px solid ${deckLight}`,
          display:"flex", alignItems:"center", justifyContent:"center",
          color:deckLight, fontSize:13, fontWeight:700, flexShrink:0,
        }}>{idx + 1}</div>
        <div style={{ color:C.cream, fontSize:11, opacity:.58 }}>
          {meta?.label} — {meta?.role}
        </div>
      </div>

      {/* Card name — BOLD LARGE */}
      <div style={{
        fontSize:23, fontWeight:700, fontFamily:"Georgia,serif",
        color:deckLight, lineHeight:1.2, marginBottom:12,
        textShadow:`0 0 22px ${deckLight}66`, letterSpacing:.4,
      }}>{cd.cardName}</div>

      {/* Keywords — small pills */}
      {cd.keywords?.length > 0 && (
        <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:14 }}>
          {cd.keywords.map((kw, ki) => (
            <span key={ki} style={{
              background:`${deckLight}16`, border:`1px solid ${deckLight}40`,
              borderRadius:20, padding:"3px 10px",
              color:deckLight, fontSize:11, fontStyle:"italic", letterSpacing:.3,
            }}>{kw}</span>
          ))}
        </div>
      )}

      {/* Meaning */}
      <div style={{ borderLeft:`3px solid ${deckLight}50`, paddingLeft:13 }}>
        <div style={{ color:C.gold, fontSize:10, fontWeight:700, letterSpacing:1.5, marginBottom:6, textTransform:"uppercase" }}>
          Meaning for your question
        </div>
        <p style={{ color:C.cream, fontSize:13, lineHeight:1.82, margin:0, opacity:.93 }}>
          {cd.meaning}
        </p>
      </div>
    </div>
  );
}

// ── SUGGESTED ANSWER ──────────────────────────────────────────────
function SuggestedAnswer({ answer, deck }) {
  const paras = answer.split(/\n+/).filter(p => p.trim());
  return (
    <div style={{
      background:`linear-gradient(135deg,${deck.color}cc,rgba(20,8,40,.97))`,
      border:`2px solid ${deck.light}50`, borderRadius:16, padding:"20px 18px",
      boxShadow:`0 8px 30px ${deck.color}66`,
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
        <span style={{ fontSize:26 }}>{deck.emoji}</span>
        <div>
          <div style={{ color:C.gold, fontSize:16, fontWeight:700, fontFamily:"Georgia,serif" }}>
            Suggested Reading Answer
          </div>
          <div style={{ color:C.cream, fontSize:11, opacity:.58, marginTop:2 }}>
            All {deck.cards.length} cards interpreted together for your question
          </div>
        </div>
      </div>
      <div style={{ width:"100%", height:1, background:`linear-gradient(90deg,transparent,${deck.light}50,transparent)`, marginBottom:14 }}/>
      {paras.map((p, i) => (
        <p key={i} style={{
          color:C.cream, fontSize:13, lineHeight:1.88,
          margin: i > 0 ? "12px 0 0" : "0",
          fontStyle: i === paras.length - 1 ? "italic" : "normal",
          opacity: i === paras.length - 1 ? .84 : .94,
        }}>{p}</p>
      ))}
    </div>
  );
}

// ── ORACLE CALL ───────────────────────────────────────────────────
async function callOracle(deck, session, cardNames) {
  const area = AREAS.find(a => a.id === session.lifeArea);
  const cardLines = deck.cards.map(c => {
    const name = (cardNames[c.id] || "").trim();
    return `${c.label} (${c.role}):\n  Name: ${name ? `"${name}"` : "[not provided — suggest appropriate card]"}\n  Purpose: ${c.desc}`;
  }).join("\n\n");

  const prompt = `You are an expert mystical card reader.

Deck: ${deck.name}
Life area: ${area?.label}
Client question: "${session.question}"
Deck purpose: ${deck.purpose}

Cards drawn:
${cardLines}

Rules:
- Use the EXACT card name given. Do not change it.
- If name is missing, suggest an appropriate ${deck.name} card.
- Interpret SPECIFICALLY for: "${session.question}" — never generic.
- Be compassionate, empowering, personal.

Return ONLY raw JSON (no markdown, no extra text):
{"cards":[{"cardName":"exact or suggested name","keywords":["k1","k2","k3","k4"],"meaning":"2-3 sentences specific to the question. Reference the card name explicitly.","error":false,"errorReason":""}],"suggestedAnswer":"3-4 flowing paragraphs weaving ALL card names into one unified answer to the question. Name each card. Open with the key insight. Close with one empowering action. Warm, mystical, honest."}`;

  const res = await fetch(ORACLE_ENDPOINT, {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ prompt }),
  });

  const raw = await res.text().catch(() => "");
  if (raw.trim().startsWith("<")) throw new Error("FUNC_NOT_FOUND");

  let data = {};
  try { data = JSON.parse(raw); } catch (_) { data = { error: raw.substring(0, 250) }; }

  if (!res.ok) throw new Error(`FUNC_ERROR: ${data.error || "HTTP " + res.status}`);
  if (data.error) throw new Error(`FUNC_ERROR: ${data.error}`);

  const text = data.result || "{}";
  const clean = text.replace(/^```(?:json)?\s*/,"").replace(/\s*```$/,"").trim();
  try { return JSON.parse(clean); }
  catch (_) { throw new Error(`PARSE_ERROR: ${clean.substring(0,120)}`); }
}

function errorDisplay(msg) {
  if (msg.includes("DEEPSEEK_KEY"))  return "🔑 DEEPSEEK_KEY not set in Netlify env vars. Add it at platform.deepseek.com then redeploy.";
  if (msg.includes("401"))           return "🔑 Invalid DeepSeek key. Check DEEPSEEK_KEY in Netlify environment variables.";
  if (msg.includes("402"))           return "💳 DeepSeek has no credits. Top up at platform.deepseek.com → Billing.";
  if (msg.includes("429"))           return "⏳ Too many requests. Wait 30 seconds and try again.";
  if (msg.includes("FUNC_NOT_FOUND"))return "⚠ Netlify function not found. Check netlify/functions/oracle.js exists in GitHub and netlify.toml has functions=\"netlify/functions\". Redeploy.";
  if (msg.includes("FUNC_ERROR"))    return `⚠ ${msg.replace("FUNC_ERROR:","").trim()}`;
  if (msg.includes("PARSE_ERROR"))   return `📋 Oracle response unclear. ${msg.replace("PARSE_ERROR:","").trim()} — please try again.`;
  if (msg.includes("Failed to fetch")||msg.includes("NetworkError")) return "🌐 Network error. Check your internet and try again.";
  return `⚠ ${msg}`;
}

// ══════════════════════════════════════════════════════════════════
// SECTION 3 — DECK READING SCREEN
// ══════════════════════════════════════════════════════════════════
function DeckScreen({ session, deckIdx, onUpdate, onNext, onGoTo, onClose }) {
  const deck    = DECKS[deckIdx];
  const existing = session.deckResults[deck.id];
  const exImg    = session.deckImages?.[deck.id]    || {};
  const exNames  = session.deckCardNames?.[deck.id] || {};
  const exData   = session.deckCardData?.[deck.id]  || null;

  const [images,    setImages]    = useState(exImg);
  const [cardNames, setCardNames] = useState(exNames);
  const [phase,     setPhase]     = useState(existing ? "done" : "upload");
  const [cards,     setCards]     = useState(exData?.cards || null);
  const [answer,    setAnswer]    = useState(exData?.suggestedAnswer || null);
  const [loading,   setLoading]   = useState(false);
  const [errMsg,    setErrMsg]    = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetOk,   setResetOk]   = useState("");

  const area    = AREAS.find(a => a.id === session.lifeArea);
  const named   = deck.cards.filter(c => (cardNames[c.id]||"").trim().length > 0).length;
  const allNamed= deck.cards.every(c => (cardNames[c.id]||"").trim().length > 0);
  const photos  = deck.cards.filter(c => images[c.id]).length;
  const isLast  = deckIdx === DECKS.length - 1;
  const allDone = DECKS.every(d => session.deckResults[d.id]);
  const errorCards = (cards || []).map((c,i) => ({...c,idx:i})).filter(c => c.error);
  const allOk   = cards && cards.every(c => !c.error);
  const canProceed = allOk && answer && answer.length > 10;

  async function read(demo = false) {
    setLoading(true); setPhase("loading"); setErrMsg("");
    try {
      let names = cardNames;
      if (demo) {
        names = {};
        deck.cards.forEach(c => { names[c.id] = ""; });
      }
      const r = await callOracle(deck, session, names);
      if (!r?.cards) throw new Error("Empty oracle response");
      setCards(r.cards);
      setAnswer(r.suggestedAnswer || "");
      setPhase("done");
      const summary = r.cards.map((c,i) => `${deck.cards[i]?.role}: ${c.error ? "[unread]" : c.cardName}`).join(" | ");
      onUpdate(deck.id, summary, images, names, { cards: r.cards, suggestedAnswer: r.suggestedAnswer || "" });
    } catch (e) {
      setErrMsg(errorDisplay(e.message || ""));
      setPhase("upload");
    }
    setLoading(false);
  }

  function doReset() {
    setImages({}); setCardNames({}); setCards(null); setAnswer(null);
    setPhase("upload"); setConfirmReset(false); setErrMsg("");
    setResetOk("✓ Step reset — re-upload photos and enter card names.");
    onUpdate(deck.id, null, {}, {}, null);
    setTimeout(() => setResetOk(""), 3500);
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", minHeight:"100vh" }}>
      <JourneyNav session={session} curIdx={deckIdx} onGo={onGoTo} />

      <div style={{ padding:"18px 16px 48px", flex:1 }}>

        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:16 }}>
          <ProgressDots step={3} total={4} />
          <div style={{ fontSize:42, animation:"float 3s infinite", display:"inline-block", marginBottom:5 }}>{deck.emoji}</div>
          <div style={{ color:deck.light, fontSize:10, fontWeight:700, letterSpacing:3, textTransform:"uppercase", marginBottom:3 }}>
            Step {deckIdx+1} of 5 · Section 3
          </div>
          <h2 style={{ fontFamily:"Georgia,serif", color:C.gold, fontSize:20, margin:"0 0 2px" }}>{deck.name}</h2>
          <div style={{ color:C.cream, fontSize:12, opacity:.6 }}>{deck.subtitle}</div>
          <Rule />
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom:14 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
            <span style={{ color:C.cream, fontSize:10, opacity:.38 }}>Reading progress</span>
            <span style={{ color:C.gold, fontSize:10, fontWeight:700 }}>{deckIdx+1} / {DECKS.length}</span>
          </div>
          <div style={{ height:4, background:"rgba(201,168,76,.08)", borderRadius:4 }}>
            <div style={{ height:"100%", borderRadius:4, background:`linear-gradient(90deg,${C.gold},${deck.light})`, width:`${((deckIdx+1)/DECKS.length)*100}%`, transition:"width .5s" }} />
          </div>
        </div>

        {/* Question */}
        <Card style={{ marginBottom:12, background:`${area?.color||"#1a0a30"}88` }}>
          <SectionLabel style={{ marginBottom:4 }}>{area?.emoji} Your question</SectionLabel>
          <div style={{ color:C.cream, fontSize:12, fontStyle:"italic", lineHeight:1.6 }}>"{session.question}"</div>
        </Card>

        {/* Purpose */}
        <Card style={{ marginBottom:12 }}>
          <SectionLabel>✦ Purpose of this deck</SectionLabel>
          <p style={{ color:C.cream, fontSize:12, lineHeight:1.7, margin:0 }}>{deck.purpose}</p>
        </Card>

        {/* Instructions */}
        <Card style={{ marginBottom:18, border:`1px solid ${deck.light}30`, background:`${deck.color}55` }}>
          <SectionLabel color={deck.light}>✦ Instructions</SectionLabel>
          <p style={{ color:C.cream, fontSize:12, lineHeight:1.75, margin:0 }}>{deck.instruction}</p>
        </Card>

        {/* Status messages */}
        {resetOk && (
          <div style={{ color:"#7CFC00", fontSize:12, textAlign:"center", marginBottom:12,
            padding:"8px 14px", background:"rgba(100,200,100,.06)", border:"1px solid rgba(100,200,100,.18)", borderRadius:9, animation:"fi .3s" }}>
            {resetOk}
          </div>
        )}
        {errMsg && (
          <div style={{ color:"#ff9090", fontSize:12, textAlign:"center", marginBottom:12,
            padding:"10px 14px", background:"rgba(255,70,70,.06)", border:"1px solid rgba(255,70,70,.18)", borderRadius:9, lineHeight:1.65 }}>
            {errMsg}
          </div>
        )}

        {/* ═══ UPLOAD PHASE ═══ */}
        {phase === "upload" && (
          <div>
            {/* Info banner */}
            <div style={{ background:"rgba(201,168,76,.05)", border:"1px solid rgba(201,168,76,.17)",
              borderRadius:10, padding:"10px 13px", marginBottom:16, display:"flex", gap:10, alignItems:"flex-start" }}>
              <span style={{ fontSize:17, flexShrink:0 }}>📱</span>
              <div>
                <div style={{ color:C.gold, fontSize:11, fontWeight:700, marginBottom:2 }}>Camera & Gallery</div>
                <div style={{ color:C.cream, fontSize:11, lineHeight:1.6, opacity:.72 }}>
                  Camera and gallery work on your <b style={{ color:C.gold }}>real phone browser</b> after deploying to Netlify.
                  The app will <b style={{ color:C.gold }}>auto-read the card name</b> from your photo.
                  Use <b style={{ color:C.gold }}>Demo Mode</b> to test here without real cards.
                </div>
              </div>
            </div>

            {/* Progress counters */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:7 }}>
              <SectionLabel style={{ marginBottom:0 }}>✦ Your {deck.cards.length} Cards</SectionLabel>
              <div style={{ textAlign:"right" }}>
                <div style={{ color: photos === deck.cards.length ? "#7CFC00" : C.cream, fontSize:10, opacity:.65 }}>
                  📷 {photos}/{deck.cards.length} photos
                </div>
                <div style={{ color: named === deck.cards.length ? "#7CFC00" : C.cream, fontSize:10, opacity:.65 }}>
                  ✍ {named}/{deck.cards.length} names
                </div>
              </div>
            </div>

            {/* Name progress bar */}
            <div style={{ height:3, background:"rgba(201,168,76,.08)", borderRadius:4, marginBottom:16 }}>
              <div style={{ height:"100%", borderRadius:4, background:C.gold, width:`${(named/deck.cards.length)*100}%`, transition:"width .4s" }} />
            </div>

            {/* Card slots */}
            {deck.cards.map(card => (
              <CardSlot
                key={card.id} card={card}
                imgVal={images[card.id]} nameVal={cardNames[card.id]}
                deckLight={deck.light} deckColor={deck.color}
                reading={false}
                onImg={img  => setImages(p    => ({ ...p, [card.id]: img }))}
                onName={name => setCardNames(p => ({ ...p, [card.id]: name }))}
              />
            ))}

            {/* Action buttons */}
            <div style={{ display:"flex", flexDirection:"column", gap:10, alignItems:"center", marginTop:8 }}>
              <GoldBtn onClick={() => read(false)} disabled={!allNamed} full>
                {allNamed
                  ? `✦ Interpret the ${deck.subtitle} Cards`
                  : `Enter all ${deck.cards.length} card names to continue`}
              </GoldBtn>
              {!allNamed && (
                <div style={{ color:C.cream, fontSize:10, opacity:.32 }}>
                  {deck.cards.length - named} more name{deck.cards.length - named !== 1 ? "s" : ""} needed
                </div>
              )}
              <div style={{ width:"100%", borderTop:"1px solid rgba(201,168,76,.11)", paddingTop:12, marginTop:4, textAlign:"center" }}>
                <div style={{ color:C.cream, fontSize:10, opacity:.22, marginBottom:8 }}>— OR TEST WITHOUT REAL CARDS —</div>
                <GoldBtn onClick={() => read(true)} purple full>✦ Demo Mode — Generate Sample Reading</GoldBtn>
                <div style={{ color:C.cream, fontSize:10, opacity:.2, marginTop:6, lineHeight:1.5 }}>
                  AI generates a demonstration reading with sample card names.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ LOADING ═══ */}
        {phase === "loading" && (
          <Spinner label={`Interpreting your ${deck.subtitle} cards`} />
        )}

        {/* ═══ DONE PHASE ═══ */}
        {phase === "done" && cards && (
          <div>
            {/* Photo previews */}
            {Object.values(images).some(Boolean) && (
              <div style={{ marginBottom:18 }}>
                <SectionLabel>✦ Cards Drawn</SectionLabel>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {deck.cards.map((card,i) => images[card.id] ? (
                    <div key={card.id} style={{ textAlign:"center", position:"relative" }}>
                      <img src={images[card.id]} alt={card.role} style={{
                        width:64, height:94, objectFit:"cover", borderRadius:9,
                        border:`2px solid ${cards[i]?.error ? "#ff5050" : deck.light+"55"}`,
                        boxShadow:`0 3px 12px ${deck.color}88`,
                        filter: cards[i]?.error ? "grayscale(50%) brightness(.7)" : "none",
                      }}/>
                      {cards[i]?.error && (
                        <div style={{ position:"absolute", top:2, right:2, width:18, height:18,
                          borderRadius:"50%", background:"#ff3333", display:"flex", alignItems:"center",
                          justifyContent:"center", fontSize:10, color:"#fff", fontWeight:700 }}>!</div>
                      )}
                      <div style={{ color:cards[i]?.error?"#ff9090":C.cream, fontSize:8, opacity:.58, marginTop:3, maxWidth:64, lineHeight:1.2 }}>
                        {card.role}
                      </div>
                    </div>
                  ) : null)}
                </div>
              </div>
            )}

            {/* Card interpretations */}
            <SectionLabel style={{ marginBottom:12 }}>✦ Card Interpretations</SectionLabel>
            {cards.map((cd,i) => (
              <CardBlock key={i} cd={cd} meta={deck.cards[i]}
                deckLight={deck.light} deckColor={deck.color} idx={i} />
            ))}

            {/* Error banner */}
            {errorCards.length > 0 && (
              <div style={{ background:"rgba(160,20,20,.1)", border:"1.5px solid rgba(255,60,60,.3)",
                borderRadius:12, padding:"14px 16px", marginBottom:16, animation:"fi .3s" }}>
                <div style={{ color:"#ff9090", fontSize:15, fontWeight:700, marginBottom:7 }}>
                  ⚠ {errorCards.length} Card{errorCards.length > 1 ? "s" : ""} Could Not Be Read
                </div>
                <p style={{ color:C.cream, fontSize:12, opacity:.8, margin:"0 0 12px", lineHeight:1.6 }}>
                  Reset this step and re-enter clearer names for:
                </p>
                {errorCards.map((ec,i) => (
                  <div key={i} style={{ display:"flex", gap:8, padding:"5px 0",
                    borderBottom: i < errorCards.length-1 ? "1px solid rgba(255,60,60,.1)" : "none" }}>
                    <span style={{ color:"#ff9090", flexShrink:0 }}>⚠</span>
                    <div>
                      <span style={{ color:"#ffaa88", fontSize:12, fontWeight:700 }}>
                        {deck.cards[ec.idx]?.label} ({deck.cards[ec.idx]?.role})
                      </span>
                      <div style={{ color:C.cream, fontSize:11, opacity:.6, marginTop:2 }}>
                        {ec.errorReason || "Could not be interpreted"}
                      </div>
                    </div>
                  </div>
                ))}
                <div style={{ marginTop:14 }}>
                  <GoldBtn onClick={() => setConfirmReset(true)} danger full>↺ Reset & Re-upload</GoldBtn>
                </div>
              </div>
            )}

            {/* Suggested Answer */}
            {allOk && answer && answer.length > 10 && (
              <div style={{ marginBottom:22 }}>
                <SectionLabel style={{ marginBottom:12 }}>✦ Suggested Answer to Your Question</SectionLabel>
                <SuggestedAnswer answer={answer} deck={deck} />
              </div>
            )}

            {/* Bottom actions */}
            <div style={{ display:"flex", flexDirection:"column", gap:10, marginTop:10 }}>

              {/* Reset button / confirm */}
              {!confirmReset ? (
                <button onClick={() => setConfirmReset(true)} style={{
                  background:"transparent", border:"1px solid rgba(255,100,100,.2)",
                  borderRadius:30, padding:"9px 20px", cursor:"pointer",
                  color:"rgba(255,150,150,.6)", fontSize:12,
                }}>↺ Reset This Step</button>
              ) : (
                <div style={{ background:"rgba(160,20,20,.08)", border:"1px solid rgba(255,70,70,.22)",
                  borderRadius:12, padding:14, animation:"fi .2s" }}>
                  <div style={{ color:"#ff9090", fontSize:13, fontWeight:700, textAlign:"center", marginBottom:7 }}>
                    Reset this step?
                  </div>
                  <p style={{ color:C.cream, fontSize:11, opacity:.58, textAlign:"center", margin:"0 0 12px", lineHeight:1.5 }}>
                    All photos, card names and interpretations will be cleared.
                  </p>
                  <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
                    <GoldBtn onClick={() => setConfirmReset(false)} outline sm>Cancel</GoldBtn>
                    <GoldBtn onClick={doReset} danger sm>Yes, Reset</GoldBtn>
                  </div>
                </div>
              )}

              {/* Proceed */}
              {!confirmReset && (
                canProceed ? (
                  isLast ? (
                    allDone ? (
                      <GoldBtn onClick={onClose} full>✦ View Your Complete Reading Summary</GoldBtn>
                    ) : (
                      <div>
                        <div style={{ color:"#ffaa44", fontSize:11, textAlign:"center", marginBottom:10,
                          padding:"9px 12px", background:"rgba(255,150,50,.05)", border:"1px solid rgba(255,150,50,.17)", borderRadius:9 }}>
                          ⚠ Complete all 5 deck steps before viewing the Summary
                        </div>
                        {DECKS.map(d => {
                          const done = !!session.deckResults[d.id];
                          return (
                            <div key={d.id} style={{ display:"flex", alignItems:"center", gap:9, padding:"7px 12px",
                              marginBottom:5, borderRadius:8,
                              background: done?"rgba(100,200,100,.05)":"rgba(255,100,100,.05)",
                              border:`1px solid ${done?"rgba(100,200,100,.13)":"rgba(255,100,100,.13)"}` }}>
                              <span style={{ fontSize:13 }}>{d.emoji}</span>
                              <span style={{ color:done?"#7CFC00":"#ff9090", fontSize:11, flex:1 }}>{d.subtitle}</span>
                              <span style={{ fontSize:11 }}>{done?"✓":"○"}</span>
                            </div>
                          );
                        })}
                      </div>
                    )
                  ) : (
                    <GoldBtn onClick={onNext} full>
                      Continue to {DECKS[deckIdx+1]?.subtitle} {DECKS[deckIdx+1]?.emoji}
                    </GoldBtn>
                  )
                ) : (
                  errorCards.length > 0 ? (
                    <div style={{ textAlign:"center" }}>
                      <div style={{ color:"#ff9090", fontSize:12, marginBottom:8 }}>
                        ⚠ Fix unreadable card{errorCards.length > 1 ? "s" : ""} above before proceeding
                      </div>
                      <GoldBtn disabled full>Proceed (Fix Card Errors First)</GoldBtn>
                    </div>
                  ) : (
                    <div style={{ textAlign:"center", color:"#ffaa44", fontSize:12 }}>
                      Waiting for all cards to be interpreted...
                    </div>
                  )
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// WELCOME SCREEN
// ══════════════════════════════════════════════════════════════════
function Welcome({ onStart, onResume, hasSession }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center",
      justifyContent:"center", minHeight:"100vh", padding:"24px 20px", textAlign:"center" }}>
      <div style={{ fontSize:64, animation:"float 3s infinite", marginBottom:6 }}>🔮</div>
      <div style={{ fontFamily:"Georgia,serif", fontSize:10, color:C.gold,
        letterSpacing:6, textTransform:"uppercase", marginBottom:5, opacity:.7 }}>The Sacred Reading</div>
      <h1 style={{ fontFamily:"Georgia,serif", fontSize:30, color:C.gold,
        margin:"0 0 5px", lineHeight:1.2, textShadow:"0 0 28px rgba(201,168,76,.4)" }}>
        Mystical Card<br/>Reader
      </h1>
      <Rule />
      <p style={{ color:C.cream, fontSize:13, lineHeight:1.7, maxWidth:300, opacity:.78, margin:"10px 0 22px" }}>
        A sacred 5-deck system revealing your current energy, root cause, cosmic influences, action plan and most likely outcome.
      </p>
      <div style={{ display:"flex", gap:7, marginBottom:26, flexWrap:"wrap", justifyContent:"center" }}>
        {DECKS.map(d => (
          <div key={d.id} style={{ background:`${d.color}88`, border:`1px solid ${d.light}33`,
            borderRadius:20, padding:"5px 11px", fontSize:10, color:C.cream,
            display:"flex", alignItems:"center", gap:5 }}>
            <span>{d.emoji}</span><span>{d.subtitle}</span>
          </div>
        ))}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:11, width:"100%", maxWidth:260 }}>
        <GoldBtn onClick={onStart} full>✦ Begin New Session ✦</GoldBtn>
        {hasSession && <GoldBtn onClick={onResume} outline full>↩ Resume Session</GoldBtn>}
      </div>
      <p style={{ color:C.cream, fontSize:10, opacity:.2, marginTop:20, lineHeight:1.6 }}>
        "A structured mirror — clarity, root cause,<br/>and a concrete action plan."
      </p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// SECTION 1 — CLIENT EDUCATION
// ══════════════════════════════════════════════════════════════════
function Section1({ onNext, onSkip }) {
  return (
    <div style={{ padding:"20px 16px", animation:"up .4s ease" }}>
      <ProgressDots step={1} total={4} />
      <div style={{ textAlign:"center", marginBottom:16 }}>
        <div style={{ fontSize:36, marginBottom:5 }}>🌙</div>
        <div style={{ fontFamily:"Georgia,serif", color:C.gold, fontSize:10,
          letterSpacing:4, textTransform:"uppercase", marginBottom:4 }}>Section 1</div>
        <h2 style={{ fontFamily:"Georgia,serif", color:C.gold, fontSize:21, margin:0 }}>
          Welcome &amp; Setting Expectations
        </h2>
        <Rule />
        <p style={{ color:C.cream, fontSize:12, opacity:.6, margin:0 }}>
          Building trust before the sacred reading begins
        </p>
      </div>

      <Card style={{ marginBottom:13 }}>
        <SectionLabel>✦ Opening Script</SectionLabel>
        <p style={{ color:C.cream, fontSize:13, lineHeight:1.82, fontStyle:"italic", margin:0 }}>
          "Thank you for trusting me with your questions today. I use a powerful system of 5 specialist decks — each chosen for a specific role. Think of them as a council of 5 advisors, each with a different area of expertise."
        </p>
      </Card>

      <div style={{ marginBottom:13 }}>
        <SectionLabel>✦ The 5-Deck Council</SectionLabel>
        {DECKS.map((d, i) => (
          <div key={d.id} style={{ display:"flex", gap:10, padding:"11px 13px", marginBottom:7,
            background:`${d.color}66`, border:`1px solid ${d.light}33`, borderRadius:12,
            animation:`up .3s ${i*.07}s ease both` }}>
            <span style={{ fontSize:21, flexShrink:0 }}>{d.emoji}</span>
            <div>
              <div style={{ color:d.light, fontSize:12, fontWeight:700, fontFamily:"Georgia,serif" }}>{d.name}</div>
              <div style={{ color:C.gold, fontSize:9, marginBottom:2 }}>{d.subtitle}</div>
              <div style={{ color:C.cream, fontSize:11, opacity:.78, lineHeight:1.5 }}>{d.purpose}</div>
            </div>
          </div>
        ))}
      </div>

      <Card style={{ marginBottom:13 }}>
        <SectionLabel>✦ The Reading Journey</SectionLabel>
        <div style={{ display:"flex", alignItems:"center", gap:4, flexWrap:"wrap", justifyContent:"center" }}>
          {["Current Energy","Root Cause","Influences","Action Plan","Outcome"].map((s,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:4 }}>
              <div style={{ background:"rgba(201,168,76,.09)", border:"1px solid rgba(201,168,76,.22)",
                borderRadius:20, padding:"3px 9px", fontSize:10, color:C.cream }}>{s}</div>
              {i < 4 && <span style={{ color:C.gold, opacity:.34, fontSize:11 }}>→</span>}
            </div>
          ))}
        </div>
        <p style={{ color:C.cream, fontSize:11, opacity:.54, margin:"10px 0 0", textAlign:"center", lineHeight:1.6 }}>
          A structured mirror — not fortune-telling. Clarity, root cause and an action plan.
        </p>
      </Card>

      <Card style={{ marginBottom:22 }}>
        <SectionLabel>✦ Important to Know</SectionLabel>
        {[
          "There are no bad cards — every card carries wisdom",
          "The future shown is a possibility, not a certainty",
          "You may shuffle any deck yourself if you wish",
          "You will leave with clarity, root cause, and a concrete plan",
        ].map((item, i) => (
          <div key={i} style={{ display:"flex", gap:9, marginBottom:7, alignItems:"flex-start" }}>
            <span style={{ color:C.gold, flexShrink:0, marginTop:1 }}>✦</span>
            <span style={{ color:C.cream, fontSize:12, lineHeight:1.6 }}>{item}</span>
          </div>
        ))}
      </Card>

      <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
        <GoldBtn onClick={onSkip} outline sm>Skip →</GoldBtn>
        <GoldBtn onClick={onNext}>Continue to Intake ✦</GoldBtn>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// SECTION 2 — CLIENT INTAKE
// ══════════════════════════════════════════════════════════════════
function Section2({ session, onUpdate, onNext }) {
  const [area, setArea] = useState(session.lifeArea || null);
  const [q,    setQ]    = useState(session.question  || "");
  const [err,  setErr]  = useState("");
  const aData = AREAS.find(a => a.id === area);
  const valid = q.trim().length >= 15;

  function go() {
    if (!area)  { setErr("Please select an area of life"); return; }
    if (!valid) { setErr("Please describe your question in at least 15 characters"); return; }
    onUpdate({ lifeArea: area, question: q.trim() });
    onNext();
  }

  return (
    <div style={{ padding:"20px 16px", animation:"up .4s ease" }}>
      <ProgressDots step={2} total={4} />
      <div style={{ textAlign:"center", marginBottom:16 }}>
        <div style={{ fontSize:36, marginBottom:5 }}>🌿</div>
        <div style={{ fontFamily:"Georgia,serif", color:C.gold, fontSize:10,
          letterSpacing:4, textTransform:"uppercase", marginBottom:4 }}>Section 2</div>
        <h2 style={{ fontFamily:"Georgia,serif", color:C.gold, fontSize:21, margin:0 }}>
          Your Sacred Question
        </h2>
        <Rule />
        <p style={{ color:C.cream, fontSize:12, opacity:.6, margin:0 }}>
          Choose one area of life and describe your question
        </p>
      </div>

      <div style={{ marginBottom:18 }}>
        <SectionLabel>✦ Step 1 — Choose Your Area of Life</SectionLabel>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
          {AREAS.map(a => (
            <button key={a.id} onClick={() => { setArea(a.id); setErr(""); }} style={{
              background: area === a.id ? `${a.color}cc` : `${a.color}44`,
              border:`1.5px solid ${area === a.id ? C.gold : `${a.color}77`}`,
              borderRadius:11, padding:"11px 8px", cursor:"pointer",
              display:"flex", alignItems:"center", gap:7, transition:"all .2s",
              boxShadow: area === a.id ? `0 3px 14px ${a.color}55` : "none",
            }}>
              <span style={{ fontSize:18 }}>{a.emoji}</span>
              <span style={{ color: area === a.id ? C.gold : C.cream, fontSize:11,
                fontWeight: area === a.id ? 700 : 400, textAlign:"left", lineHeight:1.3 }}>
                {a.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom:18 }}>
        <SectionLabel>✦ Step 2 — Describe Your Question</SectionLabel>
        <textarea
          value={q} onChange={e => { setQ(e.target.value); setErr(""); }}
          placeholder="Describe your situation and question in your own words..."
          style={{ width:"100%", minHeight:95, background:"rgba(20,8,40,.82)",
            border:`1.5px solid ${q.length > 0 && valid ? C.gold : "rgba(201,168,76,.22)"}`,
            borderRadius:11, padding:13, color:C.cream, fontSize:13, lineHeight:1.6,
            fontFamily:"inherit", resize:"none", outline:"none", transition:"border .2s" }}
        />
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
          <span style={{ color: valid ? "#7CFC00" : "rgba(245,230,200,.32)", fontSize:11 }}>
            {valid ? "✓ Ready to proceed" : `${Math.max(0,15-q.trim().length)} more characters needed`}
          </span>
          <span style={{ color:"rgba(245,230,200,.28)", fontSize:11 }}>{q.length}</span>
        </div>
      </div>

      {aData && (
        <Card style={{ marginBottom:18 }}>
          <SectionLabel>{aData.emoji} Example Questions — {aData.label}</SectionLabel>
          <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
            {aData.qs.map((qs, i) => (
              <button key={i} onClick={() => { setQ(qs); setErr(""); }} style={{
                background:"rgba(201,168,76,.05)", border:"1px solid rgba(201,168,76,.15)",
                borderRadius:8, padding:"7px 11px", cursor:"pointer", textAlign:"left",
                color:C.cream, fontSize:12, lineHeight:1.5,
              }}>
                <span style={{ color:C.gold, marginRight:5 }}>›</span>{qs}
              </button>
            ))}
          </div>
          <div style={{ color:C.cream, fontSize:10, opacity:.36, marginTop:7 }}>
            Tap any example to use it, or write your own above
          </div>
        </Card>
      )}

      {err && (
        <div style={{ color:"#FF6B6B", fontSize:12, textAlign:"center", marginBottom:11,
          padding:"8px 14px", background:"rgba(255,100,100,.07)", border:"1px solid rgba(255,100,100,.24)", borderRadius:8 }}>
          ⚠ {err}
        </div>
      )}

      <div style={{ textAlign:"center" }}>
        <GoldBtn onClick={go} disabled={!area || !valid}>Begin the Reading ✦</GoldBtn>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// SECTION 4 — CLOSING SUMMARY
// ══════════════════════════════════════════════════════════════════
function Section4({ session, onNewSession }) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(session.summary || null);
  const area = AREAS.find(a => a.id === session.lifeArea);

  useEffect(() => { if (!summary) genSummary(); }, []);

  async function genSummary() {
    setLoading(true);
    try {
      const parts = DECKS.map(d => {
        const cd = session.deckCardData?.[d.id];
        if (!cd?.cards) return `${d.emoji} ${d.name}: Not completed`;
        const names = cd.cards.map((c,i) => c.error ? "[unread]" : c.cardName).join(", ");
        return `${d.emoji} ${d.name} (${d.subtitle}):\nCards drawn: ${names}\nReading excerpt: ${(cd.suggestedAnswer||"").substring(0,220)}`;
      }).join("\n\n");

      const prompt = `You are a professional mystical card reader closing a full 5-deck reading session.

Client area: ${area?.label}
Client question: "${session.question}"

Readings completed:
${parts}

Write a professional closing summary narrative (under 280 words):
1. Open with: "Let me bring everything together into one clear narrative for you."
2. Reference each deck's key card names and messages, woven naturally into one flowing story.
3. Include: (a) they are in control — cards show probability not destiny, (b) complete at least ONE action before seeking another reading.
4. Close with a warm empowering sentence.

Flowing paragraphs only. No bullet points. Warm, professional, mystical tone.`;

      const res = await fetch(ORACLE_ENDPOINT, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ prompt }),
      });
      const txt = await res.text().catch(() => "");
      let data = {};
      try { data = JSON.parse(txt); } catch (_) { data = { error: txt.substring(0,200) }; }
      if (!res.ok || data.error) throw new Error(data.error || `HTTP ${res.status}`);
      setSummary(data.result || fallbackSummary());
    } catch (_) {
      setSummary(fallbackSummary());
    }
    setLoading(false);
  }

  function fallbackSummary() {
    return `Let me bring everything together into one clear narrative for you.\n\nYour Crystal Reading revealed the emotional truth you are carrying right now. The Egyptian Oracle uncovered the deeper soul lesson beneath your challenge. Your Astrology Cards illuminated the cosmic forces and timing at work. The Magic Oracle gave you concrete steps to take forward. And the Mystical Tarot mapped your most likely path ahead.\n\nRemember: you are in complete control. These cards show probability, not destiny. Do not seek another reading until you have completed at least ONE action from your plan — readings without action become avoidance, not growth.\n\nThank you sincerely for the trust you placed in this sacred space today. The work you do on yourself ripples outward into everyone around you. Go well. ✦`;
  }

  return (
    <div style={{ padding:"20px 16px 36px", animation:"up .4s ease" }}>
      <ProgressDots step={4} total={4} />
      <div style={{ textAlign:"center", marginBottom:20 }}>
        <div style={{ fontSize:42, animation:"float 3s infinite", display:"inline-block", marginBottom:6 }}>✦</div>
        <div style={{ fontFamily:"Georgia,serif", color:C.gold, fontSize:10,
          letterSpacing:4, textTransform:"uppercase", marginBottom:5 }}>Section 4 — Closing</div>
        <h2 style={{ fontFamily:"Georgia,serif", color:C.gold, fontSize:21, margin:0 }}>Your Complete Reading</h2>
        <Rule />
        <p style={{ color:C.cream, fontSize:12, opacity:.6, margin:0 }}>
          The 5-deck narrative woven into one clear message
        </p>
      </div>

      <Card style={{ marginBottom:14, background:`${area?.color||"#1a0a30"}88` }}>
        <SectionLabel style={{ marginBottom:4 }}>{area?.emoji} Reading For</SectionLabel>
        <div style={{ color:C.cream, fontSize:12, fontStyle:"italic", lineHeight:1.6 }}>"{session.question}"</div>
      </Card>

      {/* Journey recap */}
      <div style={{ marginBottom:18 }}>
        <SectionLabel>✦ Your 5-Deck Journey</SectionLabel>
        {DECKS.map((d, i) => {
          const cd = session.deckCardData?.[d.id];
          const names = cd?.cards?.filter(c => !c.error).map(c => c.cardName).join(" · ") || "";
          return (
            <div key={d.id} style={{ background:`${d.color}66`, border:`1px solid ${d.light}33`,
              borderRadius:11, padding:"10px 13px", marginBottom:7,
              animation:`up .3s ${i*.08}s ease both` }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:names?5:0 }}>
                <span style={{ fontSize:17, flexShrink:0 }}>{d.emoji}</span>
                <div style={{ flex:1 }}>
                  <div style={{ color:d.light, fontSize:10, fontWeight:700, letterSpacing:.5 }}>
                    {d.subtitle.toUpperCase()} — {d.name}
                  </div>
                </div>
                <div style={{ color: session.deckResults[d.id] ? "#7CFC00" : "#ff9090", fontSize:11 }}>
                  {session.deckResults[d.id] ? "✓" : "○"}
                </div>
              </div>
              {names && (
                <div style={{ color:C.gold, fontSize:11, fontStyle:"italic", paddingLeft:25, lineHeight:1.5 }}>
                  {names}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Oracle narrative */}
      <Card style={{ marginBottom:20, border:`1px solid ${C.gold}44` }}>
        <SectionLabel>✦ The Oracle's Final Narrative</SectionLabel>
        {loading ? (
          <Spinner label="Weaving your complete reading narrative" />
        ) : (
          <div style={{ color:C.cream, fontSize:13, lineHeight:1.88, fontStyle:"italic", whiteSpace:"pre-wrap" }}>
            {summary}
          </div>
        )}
      </Card>

      {/* Reminders */}
      <Card style={{ marginBottom:22, background:"rgba(201,168,76,.05)", border:`1px solid ${C.gold}26` }}>
        <SectionLabel>✦ Before You Go</SectionLabel>
        {[
          { n:"1", t:"You are in control",       b:"The cards show probability, not destiny. The action plan is a powerful suggestion — but you are always the author of your own life." },
          { n:"2", t:"Action before next reading", b:"Do not seek another reading until you have completed at least ONE action from your plan. Readings without action become avoidance, not growth." },
        ].map(r => (
          <div key={r.n} style={{ display:"flex", gap:11, marginBottom:13, alignItems:"flex-start" }}>
            <div style={{ width:26, height:26, borderRadius:"50%", background:"rgba(201,168,76,.14)",
              border:`1px solid ${C.gold}`, display:"flex", alignItems:"center", justifyContent:"center",
              color:C.gold, fontSize:12, fontWeight:700, flexShrink:0 }}>{r.n}</div>
            <div>
              <div style={{ color:C.gold, fontSize:12, fontWeight:700, marginBottom:2 }}>{r.t}</div>
              <div style={{ color:C.cream, fontSize:11, lineHeight:1.6, opacity:.8 }}>{r.b}</div>
            </div>
          </div>
        ))}
      </Card>

      <div style={{ textAlign:"center", paddingBottom:12 }}>
        <p style={{ color:C.cream, fontSize:12, opacity:.4, marginBottom:14, fontStyle:"italic", lineHeight:1.6 }}>
          "Thank you for your trust. The work you do on yourself<br/>ripples out into everyone around you."
        </p>
        <GoldBtn onClick={onNewSession} full>✦ Begin New Session ✦</GoldBtn>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// ROOT APP
// ══════════════════════════════════════════════════════════════════
export default function App() {
  const [screen,  setScreen]  = useState("welcome");
  const [session, setSession] = useState(EMPTY_SESSION);
  const [deckIdx, setDeckIdx] = useState(0);

  const hasSession = session.question.length > 0 || Object.keys(session.deckResults).length > 0;
  const allDone    = DECKS.every(d => session.deckResults[d.id]);

  function startNew()  { setSession(EMPTY_SESSION); setDeckIdx(0); setScreen("s1"); }

  function resume() {
    const n = DECKS.filter(d => session.deckResults[d.id]).length;
    if (n >= DECKS.length)          { setScreen("s4"); return; }
    if (n > 0 || session.question)  { setDeckIdx(n); setScreen("s3"); return; }
    if (session.lifeArea)           { setScreen("s2"); return; }
    setScreen("s1");
  }

  function updateSession(u) { setSession(p => ({ ...p, ...u })); }

  function updateDeck(deckId, result, images, names, cardData) {
    setSession(p => ({
      ...p,
      deckResults:   { ...p.deckResults,   [deckId]: result },
      deckImages:    { ...p.deckImages,    [deckId]: images   || {} },
      deckCardNames: { ...p.deckCardNames, [deckId]: names    || {} },
      deckCardData:  { ...p.deckCardData,  [deckId]: cardData },
    }));
  }

  function nextDeck() {
    if (deckIdx < DECKS.length - 1) { setDeckIdx(deckIdx + 1); }
    else if (allDone)               { setScreen("s4"); }
  }

  function goBack() {
    if (screen === "s1")                      { setScreen("welcome"); return; }
    if (screen === "s2")                      { setScreen("s1");      return; }
    if (screen === "s3" && deckIdx === 0)     { setScreen("s2");      return; }
    if (screen === "s3" && deckIdx > 0)       { setDeckIdx(deckIdx - 1); return; }
    if (screen === "s4")                      { setScreen("s3"); setDeckIdx(DECKS.length - 1); return; }
  }

  return (
    <div style={{
      minHeight:"100vh",
      background:"radial-gradient(ellipse at 22% 18%,#1A0A3C 0%,#0A0015 52%,#04000F 100%)",
      color:C.cream, fontFamily:"Palatino Linotype,Palatino,Georgia,serif",
      position:"relative", overflowX:"hidden",
    }}>
      <Stars />
      <div style={{ position:"relative", zIndex:1, maxWidth:480, margin:"0 auto" }}>

        {/* Back button */}
        {screen !== "welcome" && (
          <div style={{ position:"fixed", top:12, left:12, zIndex:300 }}>
            <button onClick={goBack} style={{
              background:"rgba(20,8,40,.93)", border:"1px solid rgba(201,168,76,.24)",
              borderRadius:"50%", width:34, height:34, cursor:"pointer",
              color:C.gold, fontSize:16, display:"flex", alignItems:"center",
              justifyContent:"center", backdropFilter:"blur(8px)",
            }}>←</button>
          </div>
        )}

        {screen === "welcome" && <Welcome onStart={startNew} onResume={resume} hasSession={hasSession} />}
        {screen === "s1"      && <Section1 onNext={() => setScreen("s2")} onSkip={() => setScreen("s2")} />}
        {screen === "s2"      && <Section2 session={session} onUpdate={updateSession} onNext={() => { setDeckIdx(0); setScreen("s3"); }} />}
        {screen === "s3"      && (
          <DeckScreen
            session={session} deckIdx={deckIdx}
            onUpdate={updateDeck} onNext={nextDeck}
            onGoTo={i => setDeckIdx(i)}
            onClose={() => setScreen("s4")}
          />
        )}
        {screen === "s4" && <Section4 session={session} onNewSession={startNew} />}
      </div>
    </div>
  );
}
