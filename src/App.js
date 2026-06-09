import { useState, useRef, useCallback, useEffect } from "react";

// ── CONSTANTS ──────────────────────────────────────────────────────
const LIFE_AREAS = [
  { id: "love", emoji: "💕", label: "Love & Relationships", color: "#8B2252",
    questions: ["Will my relationship improve or is it time to let go?","Why do my relationships keep ending the same way?","What is blocking me from receiving love?","Is this relationship growing me or depleting me?","How do I heal from heartbreak and open up again?","Why do I repeat the same painful patterns in love?","Am I holding onto something I should release?","How do I know if this person is right for me?"] },
  { id: "career", emoji: "🌟", label: "Career & Life Purpose", color: "#1A4A1A",
    questions: ["Should I change my job or stay where I am?","Why do I feel so stuck in my career?","What hidden skill or talent am I ignoring?","What is my true life purpose?","Should I start my own business or stay employed?","Am I resisting a change I need to make?","Why don't I feel valued or recognised at work?","I fear I'm not good enough for the next level — is this true?"] },
  { id: "finances", emoji: "💰", label: "Finances & Abundance", color: "#4A3000",
    questions: ["What is blocking my financial flow?","What is my core money wound or belief?","Is fear or self-sabotage blocking my abundance?","What opportunity am I missing?","How do I break the cycle of financial struggle?","I save but never feel financially secure — why?","What mindset shift would most transform my finances?","How do I create multiple streams of income?"] },
  { id: "family", emoji: "🏠", label: "Family & Home", color: "#0A2A3A",
    questions: ["How do I set healthy boundaries without guilt?","Why do I seek approval that never comes?","How do I heal a broken family relationship?","Am I enabling someone I love without realising it?","How do I navigate a toxic family dynamic?","My adult child won't speak to me — what should I do?","How do I balance family obligations with my own needs?","Why do the same family conflicts keep repeating?"] },
  { id: "growth", emoji: "🌱", label: "Personal Growth", color: "#2A0A4A",
    questions: ["What truth am I avoiding that I need to face?","Why do I self-sabotage when things start going well?","I feel like I have no purpose — where do I find it?","What fear is most holding me back?","How do I break free from old patterns?","Why do I struggle to love and accept myself?","How do I build more confidence and self-worth?","What is the next chapter of my growth journey?"] },
  { id: "spirituality", emoji: "🔮", label: "Spirituality", color: "#2A0A3A",
    questions: ["Am I following my intuition or my ego?","What sign or message am I overlooking?","I don't trust my intuition — how do I develop it?","Am I on my soul's true path?","How do I deepen my spiritual practice?","What spiritual gifts am I not using?","How do I reconnect with my higher self?","What does my higher self most want me to know?"] },
];

const DECKS = [
  { id: "crystal", emoji: "💎", name: "Crystal Reading Cards", subtitle: "Current Energy", color: "#5A0A30", light: "#FF6B9D",
    purpose: "Reveals your current emotional truth — what energy you are carrying right now beneath the surface.",
    instruction: "Take your Crystal Reading Cards. Hold them gently and think about how you FEEL right now — not your question, but your emotional state. Shuffle slowly and mindfully, then draw 3 cards.",
    cards: [
      { id: "c1", label: "Card 1", role: "Current Emotional State", desc: "What energy are you carrying right now?" },
      { id: "c2", label: "Card 2", role: "Hidden Challenge", desc: "What emotional wound needs attention?" },
      { id: "c3", label: "Card 3", role: "Healing Opportunity", desc: "What inner strength do you already have?" },
    ]},
  { id: "egyptian", emoji: "👁", name: "Egyptian Book of the Dead", subtitle: "Root Cause", color: "#3A1500", light: "#FF8C42",
    purpose: "Uncovers the spiritual root cause behind your situation — the soul lesson hidden within your challenge.",
    instruction: "Take your Egyptian Oracle deck. Hold it, close your eyes and take 3 deep breaths. Ask silently: 'Show me why this is happening and what my soul needs to learn.' Shuffle with intention and draw 3 cards.",
    cards: [
      { id: "e1", label: "Card 1", role: "Past Influence", desc: "Why is this situation happening?" },
      { id: "e2", label: "Card 2", role: "Current Lesson", desc: "What soul lesson am I here to learn?" },
      { id: "e3", label: "Card 3", role: "Transformation Available", desc: "What am I overlooking that could change everything?" },
    ]},
  { id: "astrology", emoji: "🌙", name: "Astrology Reading Cards", subtitle: "Influences & Timing", color: "#0A0A3A", light: "#7B8CDE",
    purpose: "Reveals what cosmic forces and timing are affecting your situation — what is coming at you from the outside.",
    instruction: "Separate your Astrology Cards into 3 piles: Planets, Zodiac Signs, and Houses. Shuffle each pile separately while focusing on your question. Draw 1 card from each pile.",
    cards: [
      { id: "a1", label: "Planet Card", role: "Current Influence", desc: "What energy or force is most affecting you?" },
      { id: "a2", label: "Zodiac Card", role: "Opportunity", desc: "What opportunity is emerging for you?" },
      { id: "a3", label: "House Card", role: "Timing & Challenge", desc: "What life area and timing should you know?" },
    ]},
  { id: "magic", emoji: "✨", name: "Magic Oracle Cards", subtitle: "Action Plan", color: "#1A0840", light: "#B388FF",
    purpose: "Gives you concrete, practical action steps — transforming insight into real change you can create this week.",
    instruction: "Take your Magic Oracle Cards. Shuffle them while asking: 'What actions and shifts will serve me most right now?' Draw with intention and select 3 cards.",
    cards: [
      { id: "m1", label: "Card 1", role: "Immediate Action", desc: "What is the most important thing to do this week?" },
      { id: "m2", label: "Card 2", role: "Mindset Shift", desc: "What belief or pattern needs to change?" },
      { id: "m3", label: "Card 3", role: "Manifestation Focus", desc: "What energy helps you attract what you want?" },
    ]},
  { id: "tarot", emoji: "🌀", name: "Mystical Realm Tarot", subtitle: "Outcome & Final Map", color: "#1A003A", light: "#CE93D8",
    purpose: "The final map — your current position, obstacles, opportunities, wisest advice and most probable outcome if you follow through.",
    instruction: "Take your Mystical Realm Tarot deck. Shuffle the full 78 cards thoroughly while holding your question clearly in mind. You may cut the deck. Draw 5 cards and lay them face down before turning each one over.",
    cards: [
      { id: "t1", label: "Card 1", role: "Current Situation", desc: "Where do you actually stand right now?" },
      { id: "t2", label: "Card 2", role: "Obstacle", desc: "What is working against you?" },
      { id: "t3", label: "Card 3", role: "Opportunity", desc: "What hidden resource wants to help you?" },
      { id: "t4", label: "Card 4", role: "Advice", desc: "What is the single wisest move you can make?" },
      { id: "t5", label: "Card 5", role: "Likely Outcome", desc: "If you follow the advice, where does this lead?" },
    ]},
];

// ── STARS BACKGROUND ──────────────────────────────────────────────
function Stars() {
  const stars = Array.from({ length: 80 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 2.5 + 0.5, delay: Math.random() * 4, dur: Math.random() * 3 + 2,
  }));
  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}>
      {stars.map(s => (
        <div key={s.id} style={{
          position:"absolute", left:`${s.x}%`, top:`${s.y}%`,
          width:s.size, height:s.size, borderRadius:"50%", background:"white",
          opacity: 0.4 + Math.random()*0.4,
          animation:`twinkle ${s.dur}s ${s.delay}s infinite alternate`,
        }}/>
      ))}
      <style>{`
        @keyframes twinkle { from{opacity:0.1} to{opacity:0.9} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes glow { 0%,100%{box-shadow:0 0 15px 3px rgba(201,168,76,0.3)} 50%{box-shadow:0 0 30px 8px rgba(201,168,76,0.6)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
      `}</style>
    </div>
  );
}

// ── SHARED UI ──────────────────────────────────────────────────────
const GOLD = "#C9A84C";
const CREAM = "#F5E6C8";
const PURPLE = "#1E0A3C";

function GoldBtn({ onClick, children, disabled, small, outline }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: outline ? "transparent" : disabled ? "#3A2A5A" : `linear-gradient(135deg, ${GOLD}, #E8C060, ${GOLD})`,
      color: disabled ? "#6A5A8A" : outline ? GOLD : PURPLE,
      border: `1.5px solid ${disabled ? "#3A2A5A" : GOLD}`,
      borderRadius: 30, padding: small ? "8px 20px" : "12px 28px",
      fontSize: small ? 13 : 15, fontFamily:"Palatino Linotype,Palatino,serif",
      fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer",
      letterSpacing: 1, transition:"all 0.3s",
      animation: disabled || outline ? "none" : "glow 2s infinite",
      opacity: disabled ? 0.5 : 1,
    }}>{children}</button>
  );
}

function Card({ children, style }) {
  return (
    <div style={{
      background:"rgba(30,10,60,0.85)", border:`1px solid rgba(201,168,76,0.4)`,
      borderRadius:16, padding:20, backdropFilter:"blur(10px)",
      boxShadow:"0 8px 32px rgba(0,0,0,0.4)", ...style
    }}>{children}</div>
  );
}

function SectionBadge({ step, total }) {
  return (
    <div style={{ display:"flex", justifyContent:"center", gap:8, marginBottom:16 }}>
      {Array.from({length:total},(_,i)=>(
        <div key={i} style={{
          width: i===step-1 ? 24 : 8, height:8, borderRadius:4,
          background: i < step ? GOLD : i === step-1 ? GOLD : "rgba(201,168,76,0.2)",
          transition:"all 0.4s"
        }}/>
      ))}
    </div>
  );
}

// ── LOADING ORACLE ─────────────────────────────────────────────────
function OracleLoading({ deck }) {
  const [dots, setDots] = useState("");
  useEffect(() => {
    const t = setInterval(() => setDots(d => d.length >= 3 ? "" : d + "."), 400);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ textAlign:"center", padding:"32px 0" }}>
      <div style={{ fontSize:48, animation:"float 2s infinite", marginBottom:16 }}>{deck?.emoji}</div>
      <div style={{ color:GOLD, fontFamily:"Palatino Linotype,serif", fontSize:18, marginBottom:8 }}>
        The oracle is reading the cards{dots}
      </div>
      <div style={{ color:CREAM, opacity:0.6, fontSize:13 }}>
        Channelling ancient wisdom for your reading
      </div>
      <div style={{ marginTop:24, display:"flex", justifyContent:"center", gap:6 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            width:10, height:10, borderRadius:"50%", background:GOLD,
            animation:`pulse 1.2s ${i*0.2}s infinite`
          }}/>
        ))}
      </div>
    </div>
  );
}

// ── IMAGE UPLOAD ───────────────────────────────────────────────────
function CardUpload({ card, value, onChange }) {
  const ref = useRef();
  return (
    <div style={{ marginBottom:12 }}>
      <div style={{ color:GOLD, fontSize:12, fontWeight:700, marginBottom:4, letterSpacing:1 }}>
        {card.label} — {card.role}
      </div>
      <div style={{ color:CREAM, fontSize:11, opacity:0.7, marginBottom:8 }}>{card.desc}</div>
      {value ? (
        <div style={{ position:"relative", display:"inline-block" }}>
          <img src={value} alt={card.role} style={{
            width:90, height:130, objectFit:"cover", borderRadius:10,
            border:`2px solid ${GOLD}`, boxShadow:`0 4px 16px rgba(201,168,76,0.3)`
          }}/>
          <button onClick={() => onChange(null)} style={{
            position:"absolute", top:-8, right:-8, width:22, height:22,
            borderRadius:"50%", background:"#8B0000", border:`1px solid ${GOLD}`,
            color:"white", fontSize:12, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center"
          }}>×</button>
        </div>
      ) : (
        <div onClick={() => ref.current.click()} style={{
          width:90, height:130, borderRadius:10, border:`2px dashed rgba(201,168,76,0.5)`,
          display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
          cursor:"pointer", background:"rgba(201,168,76,0.05)", transition:"all 0.2s",
        }}>
          <div style={{ fontSize:24, marginBottom:4 }}>📷</div>
          <div style={{ color:CREAM, fontSize:10, opacity:0.6, textAlign:"center", padding:"0 8px" }}>Tap to upload card</div>
        </div>
      )}
      <input ref={ref} type="file" accept="image/*" style={{ display:"none" }} onChange={e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => onChange(ev.target.result);
        reader.readAsDataURL(file);
      }}/>
    </div>
  );
}

// ── JOURNEY NAV ────────────────────────────────────────────────────
function JourneyNav({ session, currentDeckIdx, onGoTo }) {
  return (
    <div style={{
      background:"rgba(10,5,20,0.9)", borderBottom:`1px solid rgba(201,168,76,0.2)`,
      padding:"10px 16px", display:"flex", gap:6, overflowX:"auto",
      WebkitOverflowScrolling:"touch", flexShrink:0,
    }}>
      {DECKS.map((d, i) => {
        const done = session.deckResults[d.id];
        const active = i === currentDeckIdx;
        return (
          <button key={d.id} onClick={() => done && onGoTo(i)} style={{
            background: active ? `rgba(201,168,76,0.2)` : "transparent",
            border: `1px solid ${active ? GOLD : done ? "rgba(201,168,76,0.4)" : "rgba(201,168,76,0.15)"}`,
            borderRadius:20, padding:"5px 12px", cursor: done ? "pointer" : "default",
            color: active ? GOLD : done ? CREAM : "rgba(245,230,200,0.35)",
            fontSize:11, fontFamily:"Palatino Linotype,serif", whiteSpace:"nowrap",
            display:"flex", alignItems:"center", gap:5, transition:"all 0.2s",
          }}>
            <span>{d.emoji}</span>
            <span>{done ? "✓" : ""} {d.subtitle}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── RESULT DISPLAY ─────────────────────────────────────────────────
function ResultDisplay({ result, deck }) {
  return (
    <div style={{ animation:"slideUp 0.5s ease" }}>
      <div style={{
        background:`linear-gradient(135deg, ${deck.color}cc, rgba(30,10,60,0.9))`,
        border:`1px solid ${deck.light}44`, borderRadius:16, padding:20, marginTop:16,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
          <span style={{ fontSize:28 }}>{deck.emoji}</span>
          <div>
            <div style={{ color:GOLD, fontFamily:"Palatino Linotype,serif", fontSize:16, fontWeight:700 }}>
              {deck.name} Reading
            </div>
            <div style={{ color:CREAM, fontSize:12, opacity:0.7 }}>{deck.subtitle}</div>
          </div>
        </div>
        <div style={{ color:CREAM, fontSize:13, lineHeight:1.7, whiteSpace:"pre-wrap" }}>
          {result}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// SCREENS
// ══════════════════════════════════════════════════════════════════

// ── WELCOME ───────────────────────────────────────────────────────
function WelcomeScreen({ onStart, onResume, hasSession }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      minHeight:"100vh", padding:24, textAlign:"center" }}>
      <div style={{ animation:"float 3s infinite", fontSize:72, marginBottom:8 }}>🔮</div>
      <div style={{ fontFamily:"Palatino Linotype,Palatino,serif", fontSize:11, color:GOLD,
        letterSpacing:6, textTransform:"uppercase", marginBottom:8, opacity:0.8 }}>
        The Sacred Reading
      </div>
      <h1 style={{ fontFamily:"Palatino Linotype,Palatino,serif", fontSize:32, color:GOLD,
        margin:"0 0 8px", lineHeight:1.2, textShadow:`0 0 30px rgba(201,168,76,0.5)` }}>
        Mystical Card<br/>Reader
      </h1>
      <div style={{ width:60, height:2, background:`linear-gradient(90deg,transparent,${GOLD},transparent)`, margin:"12px auto 16px" }}/>
      <p style={{ color:CREAM, fontSize:14, lineHeight:1.7, maxWidth:320, opacity:0.85, marginBottom:32 }}>
        A sacred 5-deck system that reveals your current energy, root cause, cosmic influences, action plan and most likely outcome.
      </p>

      {/* 5 deck previews */}
      <div style={{ display:"flex", gap:10, marginBottom:32, flexWrap:"wrap", justifyContent:"center" }}>
        {DECKS.map(d => (
          <div key={d.id} style={{
            background:`${d.color}88`, border:`1px solid ${d.light}44`,
            borderRadius:12, padding:"8px 12px", fontSize:11,
            color:CREAM, display:"flex", alignItems:"center", gap:6
          }}>
            <span>{d.emoji}</span><span>{d.subtitle}</span>
          </div>
        ))}
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:12, width:"100%", maxWidth:280 }}>
        <GoldBtn onClick={onStart}>✦ Begin New Session ✦</GoldBtn>
        {hasSession && (
          <GoldBtn onClick={onResume} outline>↩ Resume Session</GoldBtn>
        )}
      </div>

      <p style={{ color:CREAM, fontSize:11, opacity:0.4, marginTop:24, lineHeight:1.6 }}>
        "A structured mirror — clarity, root cause,<br/>and a concrete action plan."
      </p>
    </div>
  );
}

// ── SECTION 1: CLIENT EDUCATION ───────────────────────────────────
function Section1({ onNext, onSkip }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <div style={{ padding:"24px 16px", animation:"slideUp 0.4s ease" }}>
      <SectionBadge step={1} total={4} />
      <div style={{ textAlign:"center", marginBottom:20 }}>
        <div style={{ fontSize:40, marginBottom:8 }}>🌙</div>
        <div style={{ fontFamily:"Palatino Linotype,serif", color:GOLD, fontSize:11,
          letterSpacing:4, textTransform:"uppercase", marginBottom:6 }}>Section 1</div>
        <h2 style={{ fontFamily:"Palatino Linotype,serif", color:GOLD, fontSize:22, margin:0 }}>
          Welcome & Setting Expectations
        </h2>
        <div style={{ width:40, height:1, background:GOLD, margin:"10px auto", opacity:0.4 }}/>
        <p style={{ color:CREAM, fontSize:13, opacity:0.7, margin:0 }}>
          Building trust before the sacred reading begins
        </p>
      </div>

      {/* Opening script */}
      <Card style={{ marginBottom:16 }}>
        <div style={{ color:GOLD, fontSize:12, fontWeight:700, letterSpacing:2, marginBottom:12 }}>
          ✦ OPENING SCRIPT
        </div>
        <p style={{ color:CREAM, fontSize:13, lineHeight:1.8, fontStyle:"italic", margin:0 }}>
          "Thank you for trusting me with your questions today. Before we begin, I want to explain how this works so you feel completely comfortable.
        </p>
        <p style={{ color:CREAM, fontSize:13, lineHeight:1.8, fontStyle:"italic", margin:"12px 0 0" }}>
          I use a powerful system of 5 specialist decks — each one chosen for a specific role. Think of them as a council of 5 advisors, each with a different area of expertise."
        </p>
      </Card>

      {/* The 5 decks */}
      <div style={{ marginBottom:16 }}>
        <div style={{ color:GOLD, fontSize:12, fontWeight:700, letterSpacing:2, marginBottom:10, paddingLeft:4 }}>
          ✦ THE 5-DECK COUNCIL
        </div>
        {DECKS.map((d, i) => (
          <div key={d.id} style={{
            display:"flex", gap:12, padding:"12px 14px", marginBottom:8,
            background:`${d.color}66`, border:`1px solid ${d.light}33`,
            borderRadius:12, animation:`slideUp 0.3s ${i*0.08}s ease both`,
          }}>
            <span style={{ fontSize:24, flexShrink:0 }}>{d.emoji}</span>
            <div>
              <div style={{ color:d.light, fontSize:13, fontWeight:700, fontFamily:"Palatino Linotype,serif" }}>
                {d.name}
              </div>
              <div style={{ color:GOLD, fontSize:10, marginBottom:3 }}>{d.subtitle}</div>
              <div style={{ color:CREAM, fontSize:12, opacity:0.8, lineHeight:1.5 }}>{d.purpose}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Narrative flow */}
      <Card style={{ marginBottom:16 }}>
        <div style={{ color:GOLD, fontSize:12, fontWeight:700, letterSpacing:2, marginBottom:12 }}>
          ✦ THE READING JOURNEY
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:4, flexWrap:"wrap", justifyContent:"center" }}>
          {["Current Energy","Root Cause","Influences","Action Plan","Outcome"].map((s,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:4 }}>
              <div style={{ background:`rgba(201,168,76,0.15)`, border:`1px solid rgba(201,168,76,0.3)`,
                borderRadius:20, padding:"4px 10px", fontSize:11, color:CREAM }}>{s}</div>
              {i < 4 && <span style={{ color:GOLD, opacity:0.5, fontSize:12 }}>→</span>}
            </div>
          ))}
        </div>
        <p style={{ color:CREAM, fontSize:12, opacity:0.7, margin:"12px 0 0", textAlign:"center", lineHeight:1.6 }}>
          This is not fortune-telling. This is a structured mirror that gives you clarity, a reason why, and a concrete action plan.
        </p>
      </Card>

      {/* Setting expectations */}
      <Card style={{ marginBottom:24 }}>
        <div style={{ color:GOLD, fontSize:12, fontWeight:700, letterSpacing:2, marginBottom:12 }}>
          ✦ IMPORTANT TO KNOW
        </div>
        {[
          "There are no bad cards — every card carries wisdom and opportunity",
          "The future shown is a possibility, never a certainty — you always shape your path",
          "You may shuffle any deck yourself if you wish to be actively involved",
          "This reading will give you clarity, root cause, and a concrete action plan",
        ].map((item, i) => (
          <div key={i} style={{ display:"flex", gap:10, marginBottom:8, alignItems:"flex-start" }}>
            <span style={{ color:GOLD, flexShrink:0, marginTop:2 }}>✦</span>
            <span style={{ color:CREAM, fontSize:13, lineHeight:1.6 }}>{item}</span>
          </div>
        ))}
      </Card>

      <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
        <GoldBtn onClick={onSkip} outline small>Skip →</GoldBtn>
        <GoldBtn onClick={onNext}>Continue to Intake ✦</GoldBtn>
      </div>
    </div>
  );
}

// ── SECTION 2: CLIENT INTAKE ──────────────────────────────────────
function Section2({ session, onUpdate, onNext }) {
  const [area, setArea] = useState(session.lifeArea || null);
  const [question, setQuestion] = useState(session.question || "");
  const [error, setError] = useState("");
  const areaData = LIFE_AREAS.find(a => a.id === area);
  const valid = question.trim().length >= 15;

  function handleNext() {
    if (!area) { setError("Please select an area of life"); return; }
    if (!valid) { setError("Please describe your question in at least 15 characters"); return; }
    onUpdate({ lifeArea: area, question: question.trim() });
    onNext();
  }

  return (
    <div style={{ padding:"24px 16px", animation:"slideUp 0.4s ease" }}>
      <SectionBadge step={2} total={4} />
      <div style={{ textAlign:"center", marginBottom:20 }}>
        <div style={{ fontSize:40, marginBottom:8 }}>🌿</div>
        <div style={{ fontFamily:"Palatino Linotype,serif", color:GOLD, fontSize:11, letterSpacing:4, textTransform:"uppercase", marginBottom:6 }}>Section 2</div>
        <h2 style={{ fontFamily:"Palatino Linotype,serif", color:GOLD, fontSize:22, margin:0 }}>
          Your Sacred Question
        </h2>
        <div style={{ width:40, height:1, background:GOLD, margin:"10px auto", opacity:0.4 }}/>
        <p style={{ color:CREAM, fontSize:13, opacity:0.7 }}>
          Choose one area of life and focus on your primary question
        </p>
      </div>

      {/* Area selection */}
      <div style={{ marginBottom:20 }}>
        <div style={{ color:GOLD, fontSize:12, fontWeight:700, letterSpacing:2, marginBottom:12 }}>
          ✦ STEP 1: Choose Your Area of Life
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          {LIFE_AREAS.map(a => (
            <button key={a.id} onClick={() => { setArea(a.id); setError(""); }} style={{
              background: area === a.id ? `${a.color}cc` : `${a.color}44`,
              border: `1.5px solid ${area === a.id ? GOLD : `${a.color}88`}`,
              borderRadius:12, padding:"12px 8px", cursor:"pointer",
              display:"flex", alignItems:"center", gap:8, transition:"all 0.2s",
              boxShadow: area === a.id ? `0 4px 16px ${a.color}66` : "none",
            }}>
              <span style={{ fontSize:20 }}>{a.emoji}</span>
              <span style={{ color:area === a.id ? GOLD : CREAM, fontSize:12,
                fontFamily:"Palatino Linotype,serif", fontWeight: area === a.id ? 700 : 400,
                textAlign:"left", lineHeight:1.3 }}>{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Question input */}
      <div style={{ marginBottom:20 }}>
        <div style={{ color:GOLD, fontSize:12, fontWeight:700, letterSpacing:2, marginBottom:12 }}>
          ✦ STEP 2: Describe Your Question
        </div>
        <textarea value={question} onChange={e => { setQuestion(e.target.value); setError(""); }}
          placeholder="Describe your situation and question in your own words..."
          style={{
            width:"100%", minHeight:100, background:"rgba(30,10,60,0.8)",
            border:`1.5px solid ${question.length > 0 && valid ? GOLD : "rgba(201,168,76,0.3)"}`,
            borderRadius:12, padding:14, color:CREAM, fontSize:13, lineHeight:1.6,
            fontFamily:"Palatino Linotype,serif", resize:"none", outline:"none",
            boxSizing:"border-box", transition:"border 0.2s",
          }}/>
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
          <span style={{ color: valid ? "#7CFC00" : "rgba(245,230,200,0.4)", fontSize:11 }}>
            {valid ? "✓ Ready to proceed" : `${Math.max(0, 15 - question.trim().length)} more characters needed`}
          </span>
          <span style={{ color:"rgba(245,230,200,0.4)", fontSize:11 }}>{question.length} chars</span>
        </div>
      </div>

      {/* Example questions */}
      {areaData && (
        <Card style={{ marginBottom:20 }}>
          <div style={{ color:GOLD, fontSize:11, fontWeight:700, letterSpacing:2, marginBottom:10 }}>
            {areaData.emoji} EXAMPLE QUESTIONS FOR {areaData.label.toUpperCase()}
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {areaData.questions.map((q, i) => (
              <button key={i} onClick={() => { setQuestion(q); setError(""); }} style={{
                background:"rgba(201,168,76,0.08)", border:"1px solid rgba(201,168,76,0.2)",
                borderRadius:8, padding:"8px 12px", cursor:"pointer", textAlign:"left",
                color:CREAM, fontSize:12, lineHeight:1.5, transition:"all 0.15s",
              }}>
                <span style={{ color:GOLD, marginRight:6 }}>›</span>{q}
              </button>
            ))}
          </div>
          <div style={{ color:CREAM, fontSize:11, opacity:0.5, marginTop:8 }}>
            Tap any example to use it, or write your own above
          </div>
        </Card>
      )}

      {error && (
        <div style={{ color:"#FF6B6B", fontSize:12, textAlign:"center", marginBottom:12, padding:"8px 16px",
          background:"rgba(255,100,100,0.1)", border:"1px solid rgba(255,100,100,0.3)", borderRadius:8 }}>
          ⚠ {error}
        </div>
      )}

      <div style={{ textAlign:"center" }}>
        <GoldBtn onClick={handleNext} disabled={!area || !valid}>
          Begin the Reading ✦
        </GoldBtn>
      </div>
    </div>
  );
}

// ── SECTION 3: DECK READING ───────────────────────────────────────
function DeckReadingScreen({ session, deckIdx, onUpdate, onNext, onGoTo }) {
  const deck = DECKS[deckIdx];
  const existing = session.deckResults[deck.id];
  const existingImages = session.deckImages?.[deck.id] || {};
  const [images, setImages] = useState(existingImages);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(existing || null);
  const [phase, setPhase] = useState(existing ? "done" : "upload");

  const allUploaded = deck.cards.every(c => images[c.id]);
  const areaData = LIFE_AREAS.find(a => a.id === session.lifeArea);

  async function doReading() {
    setLoading(true);
    setPhase("loading");
    try {
      const cardSummary = deck.cards.map((c, i) => {
        const hasImg = images[c.id];
        return `${c.label} (${c.role}): ${hasImg ? "Card image uploaded" : "No image"} — ${c.desc}`;
      }).join("\n");

      const prompt = `You are a professional mystical card reader conducting a ${deck.name} reading.

The client's life area: ${areaData?.label}
The client's question: "${session.question}"
This deck's purpose: ${deck.purpose}

Cards drawn for this reading:
${cardSummary}

Provide a warm, insightful, professional reading for all ${deck.cards.length} cards in sequence. For each card:
1. Address it by its role (${deck.cards.map(c=>c.role).join(", ")})
2. Give a meaningful 2-3 sentence interpretation connecting it to the client's specific question
3. Weave all cards together at the end in a brief synthesis (2-3 sentences)

Be specific, compassionate, honest and empowering. Use mystical but accessible language. Do not use bullet points — write flowing paragraphs for each card. Format clearly with card roles as headers.`;

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          messages:[{ role:"user", content:prompt }]
        })
      });
      const data = await res.json();
      const text = data.content?.map(b => b.text||"").join("") || "The oracle speaks in silence — trust your intuition with these cards.";
      setResult(text);
      setPhase("done");
      onUpdate(deck.id, text, images);
    } catch(e) {
      setResult("The veil between worlds shimmers... The oracle's message: Trust what you felt when you drew these cards. Each one carries exactly the wisdom you need right now. Reflect on the imagery and let your intuition guide the interpretation.");
      setPhase("done");
      onUpdate(deck.id, "Reading complete — trust your intuition.", images);
    }
    setLoading(false);
  }

  const allDone = DECKS.every(d => session.deckResults[d.id]);
  const isLast = deckIdx === DECKS.length - 1;

  return (
    <div style={{ display:"flex", flexDirection:"column", minHeight:"100vh" }}>
      <JourneyNav session={session} currentDeckIdx={deckIdx} onGoTo={onGoTo} />
      <div style={{ padding:"20px 16px", flex:1 }}>
        {/* Deck header */}
        <div style={{ textAlign:"center", marginBottom:20 }}>
          <SectionBadge step={3} total={4} />
          <div style={{ fontSize:44, animation:"float 3s infinite", marginBottom:6 }}>{deck.emoji}</div>
          <div style={{ color:deck.light, fontSize:11, fontWeight:700, letterSpacing:3,
            textTransform:"uppercase", marginBottom:4 }}>Step {deckIdx+1} of 5</div>
          <h2 style={{ fontFamily:"Palatino Linotype,serif", color:GOLD, fontSize:20, margin:"0 0 4px" }}>
            {deck.name}
          </h2>
          <div style={{ color:CREAM, fontSize:13, opacity:0.7 }}>{deck.subtitle}</div>
          <div style={{ width:40, height:1, background:GOLD, margin:"10px auto", opacity:0.4 }}/>
        </div>

        {/* Question reminder */}
        <Card style={{ marginBottom:16, background:`${areaData?.color||"#1a0a30"}99` }}>
          <div style={{ color:GOLD, fontSize:11, letterSpacing:2, marginBottom:6 }}>
            {areaData?.emoji} YOUR QUESTION
          </div>
          <div style={{ color:CREAM, fontSize:13, fontStyle:"italic", lineHeight:1.6 }}>
            "{session.question}"
          </div>
        </Card>

        {/* Purpose */}
        <Card style={{ marginBottom:16 }}>
          <div style={{ color:GOLD, fontSize:11, fontWeight:700, letterSpacing:2, marginBottom:8 }}>
            ✦ PURPOSE OF THIS DECK
          </div>
          <p style={{ color:CREAM, fontSize:13, lineHeight:1.7, margin:0 }}>{deck.purpose}</p>
        </Card>

        {/* Instructions */}
        <Card style={{ marginBottom:20, border:`1px solid ${deck.light}33`, background:`${deck.color}55` }}>
          <div style={{ color:deck.light, fontSize:11, fontWeight:700, letterSpacing:2, marginBottom:8 }}>
            ✦ INSTRUCTIONS
          </div>
          <p style={{ color:CREAM, fontSize:13, lineHeight:1.7, margin:0 }}>{deck.instruction}</p>
        </Card>

        {/* Card uploads */}
        {phase !== "done" && (
          <div>
            <div style={{ color:GOLD, fontSize:12, fontWeight:700, letterSpacing:2, marginBottom:14 }}>
              ✦ UPLOAD YOUR {deck.cards.length} CARDS
            </div>
            <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:20 }}>
              {deck.cards.map(card => (
                <CardUpload key={card.id} card={card}
                  value={images[card.id]}
                  onChange={img => setImages(prev => ({ ...prev, [card.id]: img }))}/>
              ))}
            </div>
          </div>
        )}

        {/* Uploaded previews in done state */}
        {phase === "done" && Object.values(images).some(Boolean) && (
          <div style={{ marginBottom:16 }}>
            <div style={{ color:GOLD, fontSize:11, letterSpacing:2, marginBottom:10 }}>✦ CARDS DRAWN</div>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
              {deck.cards.map((card, i) => images[card.id] ? (
                <div key={card.id} style={{ textAlign:"center" }}>
                  <img src={images[card.id]} alt={card.role} style={{
                    width:70, height:100, objectFit:"cover", borderRadius:8,
                    border:`2px solid ${deck.light}66`,
                  }}/>
                  <div style={{ color:CREAM, fontSize:9, opacity:0.7, marginTop:4, maxWidth:70 }}>{card.role}</div>
                </div>
              ) : null)}
            </div>
          </div>
        )}

        {/* Loading */}
        {phase === "loading" && <OracleLoading deck={deck} />}

        {/* Result */}
        {phase === "done" && result && <ResultDisplay result={result} deck={deck} />}

        {/* Actions */}
        <div style={{ marginTop:24, display:"flex", flexDirection:"column", gap:12, alignItems:"center" }}>
          {phase === "upload" && (
            <GoldBtn onClick={doReading} disabled={!allUploaded || loading}>
              {allUploaded ? `✦ Read the ${deck.subtitle} Cards` : `Upload all ${deck.cards.length} cards to continue`}
            </GoldBtn>
          )}
          {phase === "done" && (
            <>
              {!isLast ? (
                <GoldBtn onClick={onNext}>
                  Continue to {DECKS[deckIdx+1]?.subtitle} {DECKS[deckIdx+1]?.emoji}
                </GoldBtn>
              ) : (
                <GoldBtn onClick={onNext}>
                  ✦ Receive Your Full Reading Summary
                </GoldBtn>
              )}
            </>
          )}
        </div>

        {/* Skip reading note */}
        {phase === "upload" && !allUploaded && (
          <div style={{ textAlign:"center", marginTop:12 }}>
            <button onClick={() => { setPhase("done"); setResult("Intuitive reading: The cards you have drawn carry deep significance for your question. Trust your instincts as you reflect on them — the wisdom is already within you."); onUpdate(deck.id, "Completed intuitively.", images); }}
              style={{ background:"none", border:"none", color:"rgba(245,230,200,0.3)", fontSize:11,
                cursor:"pointer", textDecoration:"underline" }}>
              Skip upload and read intuitively
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── SECTION 4: CLOSING SUMMARY ────────────────────────────────────
function ClosingScreen({ session, onNewSession }) {
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summary, setSummary] = useState(session.summary || null);
  const areaData = LIFE_AREAS.find(a => a.id === session.lifeArea);

  useEffect(() => {
    if (!summary && !summaryLoading) generateSummary();
  }, []);

  async function generateSummary() {
    setSummaryLoading(true);
    try {
      const deckResults = DECKS.map(d => `${d.emoji} ${d.name} (${d.subtitle}):\n${session.deckResults[d.id] || "Not completed"}`).join("\n\n");
      const prompt = `You are a professional mystical card reader closing a full 5-deck reading session.

Client's area: ${areaData?.label}
Client's question: "${session.question}"

The 5-deck readings completed:
${deckResults}

Now write the professional closing summary narrative that:
1. Starts with "Let me bring everything together into one clear narrative for you."
2. Summarises each deck's key message in ONE sentence each, woven together naturally
3. Ends with the two important reminders:
   - They are in control — cards show probability not destiny
   - Do not seek another reading until at least ONE action is completed
4. Closes with a warm, empowering final sentence

Keep it under 300 words. Write in flowing paragraphs, warm and professional.`;

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:1000,
          messages:[{ role:"user", content:prompt }]
        })
      });
      const data = await res.json();
      const text = data.content?.map(b=>b.text||"").join("") || generateFallbackSummary(session, areaData);
      setSummary(text);
    } catch(e) {
      setSummary(generateFallbackSummary(session, areaData));
    }
    setSummaryLoading(false);
  }

  function generateFallbackSummary(s, a) {
    return `Let me bring everything together into one clear narrative for you.\n\nYour Crystal Reading revealed the emotional truth you are currently carrying. The Egyptian Oracle uncovered the deeper soul lesson beneath your situation. Your Astrology Cards showed the cosmic forces and timing at work around you. The Magic Oracle gave you concrete steps and intentions to take forward. And the Mystical Tarot mapped your most likely path ahead.\n\nBefore you go, two important reminders: First, you are in complete control — these cards show probability, not destiny. The action plan is a powerful suggestion, but you are always the author of your own story. Second, do not seek another reading until you have completed at least ONE action from your plan. Readings without action become a habit of avoidance, not a tool for growth.\n\nThank you sincerely for the trust you placed in this sacred space today. The work you do on yourself ripples outward into everyone around you. Go well. ✦`;
  }

  return (
    <div style={{ padding:"24px 16px", animation:"slideUp 0.4s ease" }}>
      <SectionBadge step={4} total={4} />
      <div style={{ textAlign:"center", marginBottom:24 }}>
        <div style={{ fontSize:48, animation:"float 3s infinite", marginBottom:8 }}>✦</div>
        <div style={{ fontFamily:"Palatino Linotype,serif", color:GOLD, fontSize:11, letterSpacing:4, textTransform:"uppercase", marginBottom:6 }}>Section 4 — Closing</div>
        <h2 style={{ fontFamily:"Palatino Linotype,serif", color:GOLD, fontSize:22, margin:0 }}>
          Your Complete Reading
        </h2>
        <div style={{ width:40, height:1, background:GOLD, margin:"10px auto", opacity:0.4 }}/>
        <p style={{ color:CREAM, fontSize:13, opacity:0.7 }}>The 5-deck narrative woven into one clear message</p>
      </div>

      {/* Question reminder */}
      <Card style={{ marginBottom:16, background:`${areaData?.color||"#1a0a30"}99` }}>
        <div style={{ color:GOLD, fontSize:11, letterSpacing:2, marginBottom:6 }}>
          {areaData?.emoji} READING FOR
        </div>
        <div style={{ color:CREAM, fontSize:13, fontStyle:"italic", lineHeight:1.6 }}>
          "{session.question}"
        </div>
      </Card>

      {/* Deck journey summary */}
      <div style={{ marginBottom:20 }}>
        <div style={{ color:GOLD, fontSize:12, fontWeight:700, letterSpacing:2, marginBottom:12 }}>
          ✦ YOUR 5-DECK JOURNEY
        </div>
        {DECKS.map((d, i) => (
          <div key={d.id} style={{
            background:`${d.color}66`, border:`1px solid ${d.light}33`,
            borderRadius:12, padding:"10px 14px", marginBottom:8,
            display:"flex", alignItems:"flex-start", gap:10,
            animation:`slideUp 0.3s ${i*0.1}s ease both`,
          }}>
            <span style={{ fontSize:20, flexShrink:0, marginTop:2 }}>{d.emoji}</span>
            <div>
              <div style={{ color:d.light, fontSize:11, fontWeight:700, letterSpacing:1 }}>
                {d.subtitle.toUpperCase()} — {d.name}
              </div>
              <div style={{ color:CREAM, fontSize:12, opacity:0.8, marginTop:3, lineHeight:1.5 }}>
                {session.deckResults[d.id]
                  ? session.deckResults[d.id].substring(0, 120) + (session.deckResults[d.id].length > 120 ? "..." : "")
                  : "Not completed"}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Full summary */}
      <Card style={{ marginBottom:24, border:`1px solid ${GOLD}66` }}>
        <div style={{ color:GOLD, fontSize:12, fontWeight:700, letterSpacing:2, marginBottom:12 }}>
          ✦ THE ORACLE'S FINAL NARRATIVE
        </div>
        {summaryLoading ? (
          <OracleLoading deck={{ emoji:"✦" }} />
        ) : (
          <div style={{ color:CREAM, fontSize:13, lineHeight:1.8, fontStyle:"italic", whiteSpace:"pre-wrap" }}>
            {summary}
          </div>
        )}
      </Card>

      {/* Golden reminders */}
      <Card style={{ marginBottom:24, background:"rgba(201,168,76,0.08)", border:`1px solid ${GOLD}44` }}>
        <div style={{ color:GOLD, fontSize:12, fontWeight:700, letterSpacing:2, marginBottom:12 }}>
          ✦ BEFORE YOU GO
        </div>
        {[
          { n:"1", t:"You are in control", b:"The cards show probability, not destiny. The action plan is a powerful suggestion — but you are always the author of your own life." },
          { n:"2", t:"Action before another reading", b:"Do not seek another reading until you have completed at least ONE action from your plan. Readings without action become avoidance, not growth." },
        ].map(r => (
          <div key={r.n} style={{ display:"flex", gap:12, marginBottom:14, alignItems:"flex-start" }}>
            <div style={{ width:28, height:28, borderRadius:"50%", background:`rgba(201,168,76,0.2)`,
              border:`1px solid ${GOLD}`, display:"flex", alignItems:"center", justifyContent:"center",
              color:GOLD, fontSize:13, fontWeight:700, flexShrink:0 }}>{r.n}</div>
            <div>
              <div style={{ color:GOLD, fontSize:13, fontWeight:700, marginBottom:3 }}>{r.t}</div>
              <div style={{ color:CREAM, fontSize:12, lineHeight:1.6, opacity:0.85 }}>{r.b}</div>
            </div>
          </div>
        ))}
      </Card>

      {/* New session */}
      <div style={{ textAlign:"center", paddingBottom:32 }}>
        <p style={{ color:CREAM, fontSize:13, opacity:0.6, marginBottom:16, fontStyle:"italic" }}>
          "Thank you for your trust. The work you do on yourself ripples out into everyone around you."
        </p>
        <GoldBtn onClick={onNewSession}>✦ Begin New Session ✦</GoldBtn>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════════
const EMPTY_SESSION = {
  lifeArea: null, question: "", deckResults: {}, deckImages: {}, summary: null,
};

export default function App() {
  const [screen, setScreen] = useState("welcome"); // welcome | s1 | s2 | s3 | s4
  const [session, setSession] = useState(EMPTY_SESSION);
  const [deckIdx, setDeckIdx] = useState(0);

  const hasSession = session.question.length > 0 || Object.keys(session.deckResults).length > 0;

  function startNew() {
    setSession(EMPTY_SESSION);
    setDeckIdx(0);
    setScreen("s1");
  }

  function resume() {
    // Determine where to resume
    const completedDecks = DECKS.filter(d => session.deckResults[d.id]).length;
    if (completedDecks >= DECKS.length) { setScreen("s4"); return; }
    if (completedDecks > 0 || session.question) { setDeckIdx(completedDecks); setScreen("s3"); return; }
    if (session.lifeArea) { setScreen("s2"); return; }
    setScreen("s1");
  }

  function updateSession(updates) {
    setSession(prev => ({ ...prev, ...updates }));
  }

  function updateDeckResult(deckId, result, images) {
    setSession(prev => ({
      ...prev,
      deckResults: { ...prev.deckResults, [deckId]: result },
      deckImages: { ...prev.deckImages, [deckId]: images },
    }));
  }

  function nextDeck() {
    if (deckIdx < DECKS.length - 1) {
      setDeckIdx(deckIdx + 1);
    } else {
      setScreen("s4");
    }
  }

  return (
    <div style={{
      minHeight:"100vh", background:`radial-gradient(ellipse at 20% 20%, #1A0A3C 0%, #0A0015 50%, #050010 100%)`,
      color:CREAM, fontFamily:"Palatino Linotype,Palatino,Georgia,serif",
      position:"relative", overflowX:"hidden",
    }}>
      <Stars />
      <div style={{ position:"relative", zIndex:1, maxWidth:480, margin:"0 auto" }}>

        {screen === "welcome" && (
          <WelcomeScreen onStart={startNew} onResume={resume} hasSession={hasSession} />
        )}

        {screen === "s1" && (
          <Section1 onNext={() => setScreen("s2")} onSkip={() => setScreen("s2")} />
        )}

        {screen === "s2" && (
          <Section2 session={session} onUpdate={updateSession} onNext={() => { setDeckIdx(0); setScreen("s3"); }} />
        )}

        {screen === "s3" && (
          <DeckReadingScreen
            session={session} deckIdx={deckIdx}
            onUpdate={updateDeckResult}
            onNext={nextDeck}
            onGoTo={i => setDeckIdx(i)}
          />
        )}

        {screen === "s4" && (
          <ClosingScreen session={session} onNewSession={startNew} />
        )}

        {/* Back nav */}
        {screen !== "welcome" && (
          <div style={{ position:"fixed", top:12, left:16, zIndex:100 }}>
            <button onClick={() => {
              if (screen === "s1") setScreen("welcome");
              else if (screen === "s2") setScreen("s1");
              else if (screen === "s3" && deckIdx === 0) setScreen("s2");
              else if (screen === "s3" && deckIdx > 0) setDeckIdx(deckIdx - 1);
              else if (screen === "s4") setScreen("s3");
            }} style={{
              background:"rgba(30,10,60,0.9)", border:`1px solid rgba(201,168,76,0.3)`,
              borderRadius:"50%", width:36, height:36, cursor:"pointer",
              color:GOLD, fontSize:16, display:"flex", alignItems:"center", justifyContent:"center",
              backdropFilter:"blur(8px)",
            }}>←</button>
          </div>
        )}
      </div>
    </div>
  );
}
