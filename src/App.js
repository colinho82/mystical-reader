import { useState, useRef, useEffect } from "react";

// ── CONSTANTS ──────────────────────────────────────────────────────
const LIFE_AREAS = [
  { id:"love", emoji:"💕", label:"Love & Relationships", color:"#8B2252",
    questions:["Will my relationship improve or is it time to let go?","Why do my relationships keep ending the same way?","What is blocking me from receiving love?","Is this relationship growing me or depleting me?","How do I heal from heartbreak and open up again?","Why do I repeat the same painful patterns in love?","Am I holding onto something I should release?","How do I know if this person is right for me?"] },
  { id:"career", emoji:"🌟", label:"Career & Life Purpose", color:"#1A4A1A",
    questions:["Should I change my job or stay where I am?","Why do I feel so stuck in my career?","What hidden skill or talent am I ignoring?","What is my true life purpose?","Should I start my own business or stay employed?","Am I resisting a change I need to make?","Why don't I feel valued or recognised at work?","I fear I'm not good enough for the next level — is this true?"] },
  { id:"finances", emoji:"💰", label:"Finances & Abundance", color:"#4A3000",
    questions:["What is blocking my financial flow?","What is my core money wound or belief?","Is fear or self-sabotage blocking my abundance?","What opportunity am I missing?","How do I break the cycle of financial struggle?","I save but never feel financially secure — why?","What mindset shift would most transform my finances?","How do I create multiple streams of income?"] },
  { id:"family", emoji:"🏠", label:"Family & Home", color:"#0A2A3A",
    questions:["How do I set healthy boundaries without guilt?","Why do I seek approval that never comes?","How do I heal a broken family relationship?","Am I enabling someone I love without realising it?","How do I navigate a toxic family dynamic?","My adult child won't speak to me — what should I do?","How do I balance family obligations with my own needs?","Why do the same family conflicts keep repeating?"] },
  { id:"growth", emoji:"🌱", label:"Personal Growth", color:"#2A0A4A",
    questions:["What truth am I avoiding that I need to face?","Why do I self-sabotage when things start going well?","I feel like I have no purpose — where do I find it?","What fear is most holding me back?","How do I break free from old patterns?","Why do I struggle to love and accept myself?","How do I build more confidence and self-worth?","What is the next chapter of my growth journey?"] },
  { id:"spirituality", emoji:"🔮", label:"Spirituality", color:"#2A0A3A",
    questions:["Am I following my intuition or my ego?","What sign or message am I overlooking?","I don't trust my intuition — how do I develop it?","Am I on my soul's true path?","How do I deepen my spiritual practice?","What spiritual gifts am I not using?","How do I reconnect with my higher self?","What does my higher self most want me to know?"] },
];

const DECKS = [
  { id:"crystal", emoji:"💎", name:"Crystal Reading Cards", subtitle:"Current Energy", color:"#5A0A30", light:"#FF6B9D",
    purpose:"Reveals your current emotional truth — what energy you are carrying right now beneath the surface.",
    instruction:"Take your Crystal Reading Cards. Hold them gently and think about how you FEEL right now — not your question, but your emotional state. Shuffle slowly and mindfully, then draw 3 cards one at a time.",
    cards:[
      { id:"c1", label:"Card 1", role:"Current Emotional State", desc:"What energy are you carrying right now?" },
      { id:"c2", label:"Card 2", role:"Hidden Challenge", desc:"What emotional wound needs attention?" },
      { id:"c3", label:"Card 3", role:"Healing Opportunity", desc:"What inner strength do you already have?" },
    ]},
  { id:"egyptian", emoji:"👁", name:"Egyptian Book of the Dead", subtitle:"Root Cause", color:"#3A1500", light:"#FF8C42",
    purpose:"Uncovers the spiritual root cause behind your situation — the soul lesson hidden within your challenge.",
    instruction:"Take your Egyptian Oracle deck. Hold it, close your eyes and take 3 deep breaths. Ask silently: 'Show me why this is happening and what my soul needs to learn.' Shuffle with intention and draw 3 cards.",
    cards:[
      { id:"e1", label:"Card 1", role:"Past Influence", desc:"Why is this situation happening?" },
      { id:"e2", label:"Card 2", role:"Current Lesson", desc:"What soul lesson am I here to learn?" },
      { id:"e3", label:"Card 3", role:"Transformation Available", desc:"What am I overlooking that could change everything?" },
    ]},
  { id:"astrology", emoji:"🌙", name:"Astrology Reading Cards", subtitle:"Influences & Timing", color:"#0A0A3A", light:"#7B8CDE",
    purpose:"Reveals what cosmic forces and timing are affecting your situation — what is coming at you from the outside.",
    instruction:"Separate your Astrology Cards into 3 piles: Planets, Zodiac Signs, and Houses. Shuffle each pile separately while focusing on your question. Draw 1 card from each pile.",
    cards:[
      { id:"a1", label:"Planet Card", role:"Current Influence", desc:"What energy or force is most affecting you?" },
      { id:"a2", label:"Zodiac Card", role:"Opportunity", desc:"What opportunity is emerging for you?" },
      { id:"a3", label:"House Card", role:"Timing & Challenge", desc:"What life area and timing should you know?" },
    ]},
  { id:"magic", emoji:"✨", name:"Magic Oracle Cards", subtitle:"Action Plan", color:"#1A0840", light:"#B388FF",
    purpose:"Gives you concrete, practical action steps — transforming insight into real change you can create this week.",
    instruction:"Take your Magic Oracle Cards. Shuffle them while asking: 'What actions and shifts will serve me most right now?' Draw with intention and select 3 cards.",
    cards:[
      { id:"m1", label:"Card 1", role:"Immediate Action", desc:"What is the most important thing to do this week?" },
      { id:"m2", label:"Card 2", role:"Mindset Shift", desc:"What belief or pattern needs to change?" },
      { id:"m3", label:"Card 3", role:"Manifestation Focus", desc:"What energy helps you attract what you want?" },
    ]},
  { id:"tarot", emoji:"🌀", name:"Mystical Realm Tarot", subtitle:"Outcome & Final Map", color:"#1A003A", light:"#CE93D8",
    purpose:"The final map — your current position, obstacles, opportunities, wisest advice and most probable outcome if you follow through.",
    instruction:"Take your Mystical Realm Tarot deck. Shuffle the full 78 cards thoroughly while holding your question clearly in mind. You may cut the deck. Draw 5 cards and lay them face down before turning each one over.",
    cards:[
      { id:"t1", label:"Card 1", role:"Current Situation", desc:"Where do you actually stand right now?" },
      { id:"t2", label:"Card 2", role:"Obstacle", desc:"What is working against you?" },
      { id:"t3", label:"Card 3", role:"Opportunity", desc:"What hidden resource wants to help you?" },
      { id:"t4", label:"Card 4", role:"Advice", desc:"What is the single wisest move you can make?" },
      { id:"t5", label:"Card 5", role:"Likely Outcome", desc:"If you follow the advice, where does this lead?" },
    ]},
];

const GOLD="#C9A84C", CREAM="#F5E6C8", PURPLE="#1E0A3C";
const EMPTY_SESSION = { lifeArea:null, question:"", deckResults:{}, deckImages:{}, summary:null };

// ── STARS ─────────────────────────────────────────────────────────
const STARS = Array.from({length:70},(_,i)=>({
  id:i, x:Math.random()*100, y:Math.random()*100,
  size:Math.random()*2+0.5, delay:Math.random()*5, dur:Math.random()*3+2
}));
function Stars() {
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0}}>
      {STARS.map(s=>(
        <div key={s.id} style={{position:"absolute",left:`${s.x}%`,top:`${s.y}%`,
          width:s.size,height:s.size,borderRadius:"50%",background:"white",
          animation:`twinkle ${s.dur}s ${s.delay}s infinite alternate`}}/>
      ))}
      <style>{`
        @keyframes twinkle{from{opacity:0.1}to{opacity:0.9}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes glow{0%,100%{box-shadow:0 0 15px 3px rgba(201,168,76,0.3)}50%{box-shadow:0 0 30px 8px rgba(201,168,76,0.6)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes shimmer{0%{opacity:0.5}50%{opacity:1}100%{opacity:0.5}}
        .card-upload-zone:hover{border-color:${GOLD}!important;background:rgba(201,168,76,0.1)!important}
        .ghost-btn:hover{background:rgba(201,168,76,0.12)!important}
        .area-btn:hover{transform:scale(1.02)}
        .q-btn:hover{background:rgba(201,168,76,0.15)!important;border-color:rgba(201,168,76,0.5)!important}
      `}</style>
    </div>
  );
}

// ── SHARED COMPONENTS ─────────────────────────────────────────────
function GoldBtn({onClick,children,disabled,small,outline,danger,full}){
  return(
    <button onClick={onClick} disabled={disabled} style={{
      background:danger?"rgba(180,30,30,0.3)":outline?"transparent":disabled?"#2a1a4a":`linear-gradient(135deg,${GOLD},#E8C060,${GOLD})`,
      color:disabled?"#5a4a7a":danger?"#ff6b6b":outline?GOLD:PURPLE,
      border:`1.5px solid ${danger?"#ff6b6b":disabled?"#3a2a5a":GOLD}`,
      borderRadius:30,padding:small?"8px 18px":"12px 26px",
      fontSize:small?12:14,fontFamily:"Palatino Linotype,Palatino,serif",
      fontWeight:700,cursor:disabled?"not-allowed":"pointer",letterSpacing:0.8,
      transition:"all 0.25s",animation:disabled||outline||danger?"none":"glow 2.5s infinite",
      opacity:disabled?0.5:1,width:full?"100%":"auto",
    }}>{children}</button>
  );
}

function Card({children,style}){
  return(
    <div style={{background:"rgba(20,8,40,0.88)",border:"1px solid rgba(201,168,76,0.35)",
      borderRadius:14,padding:18,backdropFilter:"blur(12px)",
      boxShadow:"0 6px 28px rgba(0,0,0,0.45)",...style}}>{children}</div>
  );
}

function SectionDots({step,total}){
  return(
    <div style={{display:"flex",justifyContent:"center",gap:7,marginBottom:14}}>
      {Array.from({length:total},(_,i)=>(
        <div key={i} style={{width:i===step-1?22:7,height:7,borderRadius:4,
          background:i<step?GOLD:i===step-1?GOLD:"rgba(201,168,76,0.18)",transition:"all 0.4s"}}/>
      ))}
    </div>
  );
}

function Divider(){
  return <div style={{width:50,height:1,background:`linear-gradient(90deg,transparent,${GOLD},transparent)`,margin:"10px auto"}}/>;
}

function OracleLoading({label}){
  const [dots,setDots]=useState("");
  useEffect(()=>{const t=setInterval(()=>setDots(d=>d.length>=3?"":d+"."),400);return()=>clearInterval(t);},[]);
  return(
    <div style={{textAlign:"center",padding:"28px 0"}}>
      <div style={{fontSize:40,animation:"spin 3s linear infinite",marginBottom:12}}>✦</div>
      <div style={{color:GOLD,fontFamily:"Palatino Linotype,serif",fontSize:16,marginBottom:6}}>
        {label||"The oracle is reading"}{dots}
      </div>
      <div style={{color:CREAM,fontSize:12,opacity:0.55}}>Channelling wisdom for your reading</div>
      <div style={{marginTop:18,display:"flex",justifyContent:"center",gap:7}}>
        {[0,1,2].map(i=>(
          <div key={i} style={{width:9,height:9,borderRadius:"50%",background:GOLD,
            animation:`pulse 1.2s ${i*0.2}s infinite`}}/>
        ))}
      </div>
    </div>
  );
}

// ── ENHANCED CARD UPLOAD ──────────────────────────────────────────
// Uses label+htmlFor — most reliable on iOS Safari & Android Chrome.
// NOTE: File/camera inputs are blocked inside iframe sandboxes (Claude preview).
// They work fully when deployed to Netlify and opened in a real mobile browser.
function CardUploadSlot({card,value,onChange,deckLight,deckColor}){
  const uid = card.id;
  const [showOptions,setShowOptions] = useState(false);

  function handleFile(e){
    const file = e.target.files?.[0];
    if(!file) return;
    e.target.value = "";
    const reader = new FileReader();
    reader.onload = ev => { onChange(ev.target.result); setShowOptions(false); };
    reader.readAsDataURL(file);
  }

  function clearImage(){ onChange(null); setShowOptions(false); }

  const optionBtn = () => ({
    background:`${deckColor}88`, border:`1.5px solid ${deckLight}55`,
    borderRadius:10, padding:"11px 14px", cursor:"pointer",
    display:"flex", alignItems:"center", gap:11,
    transition:"all 0.2s", fontFamily:"inherit", width:"100%", textAlign:"left",
  });

  return(
    <div style={{marginBottom:18, animation:"slideUp 0.3s ease both"}}>

      {/* ── Card label row ── */}
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:9}}>
        <div style={{width:28,height:28,borderRadius:"50%",
          background:value?`${deckColor}cc`:"rgba(201,168,76,0.15)",
          border:`1.5px solid ${value?deckLight:"rgba(201,168,76,0.3)"}`,
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:12,color:value?deckLight:GOLD,fontWeight:700,flexShrink:0}}>
          {value ? "✓" : card.label.replace("Card ","").replace("Planet ","P").replace("Zodiac ","Z").replace("House ","H")}
        </div>
        <div>
          <div style={{color:value?deckLight:GOLD,fontSize:12,fontWeight:700,letterSpacing:0.5}}>
            {card.label} — {card.role}
          </div>
          <div style={{color:CREAM,fontSize:11,opacity:0.6}}>{card.desc}</div>
        </div>
      </div>

      {/* ── Uploaded state ── */}
      {value ? (
        <div style={{animation:"fadeIn 0.3s ease"}}>
          <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
            {/* Preview image */}
            <div style={{position:"relative",flexShrink:0}}>
              <img src={value} alt={card.role} style={{
                width:88,height:128,objectFit:"cover",borderRadius:10,
                border:`2.5px solid ${deckLight}88`,
                boxShadow:`0 4px 20px ${deckColor}aa`}}/>
              <div style={{position:"absolute",bottom:-5,left:"50%",transform:"translateX(-50%)",
                background:deckColor,border:`1px solid ${deckLight}88`,
                borderRadius:10,padding:"2px 8px",
                color:deckLight,fontSize:9,fontWeight:700,whiteSpace:"nowrap"}}>
                ✓ Uploaded
              </div>
            </div>

            {/* Replace / remove buttons */}
            <div style={{display:"flex",flexDirection:"column",gap:7,paddingTop:2,flex:1}}>
              <div style={{color:CREAM,fontSize:10,opacity:0.55,marginBottom:2}}>Replace card:</div>

              {/* Camera replace — label triggers hidden input */}
              <label htmlFor={`rcam-${uid}`} style={{
                background:"rgba(201,168,76,0.1)",border:`1px solid rgba(201,168,76,0.35)`,
                borderRadius:20,padding:"7px 13px",cursor:"pointer",
                color:CREAM,fontSize:11,display:"flex",alignItems:"center",gap:6,userSelect:"none"}}>
                📷 Retake Photo
              </label>
              <input id={`rcam-${uid}`} type="file" accept="image/*"
                capture="environment" style={{display:"none"}} onChange={handleFile}/>

              {/* Gallery replace */}
              <label htmlFor={`rgal-${uid}`} style={{
                background:"rgba(201,168,76,0.1)",border:`1px solid rgba(201,168,76,0.35)`,
                borderRadius:20,padding:"7px 13px",cursor:"pointer",
                color:CREAM,fontSize:11,display:"flex",alignItems:"center",gap:6,userSelect:"none"}}>
                🖼 Choose Gallery
              </label>
              <input id={`rgal-${uid}`} type="file" accept="image/*"
                style={{display:"none"}} onChange={handleFile}/>

              {/* Remove */}
              <button onClick={clearImage} style={{
                background:"rgba(180,30,30,0.15)",border:"1px solid rgba(255,80,80,0.28)",
                borderRadius:20,padding:"7px 13px",cursor:"pointer",
                color:"#ff9090",fontSize:11,display:"flex",alignItems:"center",
                gap:6,fontFamily:"inherit"}}>
                🗑 Remove
              </button>
            </div>
          </div>
        </div>

      ) : (
        /* ── Empty / upload state ── */
        <div>
          {!showOptions ? (
            /* Initial tap zone */
            <div onClick={()=>setShowOptions(true)} style={{
              height:96,borderRadius:12,
              border:`2px dashed rgba(201,168,76,0.32)`,
              display:"flex",flexDirection:"column",
              alignItems:"center",justifyContent:"center",
              cursor:"pointer",background:"rgba(201,168,76,0.03)",
              transition:"all 0.2s",gap:6}}>
              <div style={{fontSize:26}}>📷</div>
              <div style={{color:CREAM,fontSize:12,opacity:0.6}}>Tap to upload {card.label}</div>
            </div>
          ) : (
            /* Upload options panel */
            <div style={{background:"rgba(12,4,28,0.97)",
              border:`1px solid rgba(201,168,76,0.38)`,
              borderRadius:12,padding:14,animation:"fadeIn 0.2s ease"}}>
              <div style={{color:GOLD,fontSize:12,fontWeight:700,marginBottom:11,letterSpacing:0.8}}>
                How would you like to add {card.label}?
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>

                {/* ── CAMERA — label/input pattern ── */}
                <label htmlFor={`cam-${uid}`} style={optionBtn()}>
                  <span style={{fontSize:22,flexShrink:0}}>📷</span>
                  <div>
                    <div style={{color:deckLight,fontSize:13,fontWeight:700}}>Open Camera</div>
                    <div style={{color:CREAM,fontSize:11,opacity:0.65}}>Take a photo of your card</div>
                  </div>
                </label>
                <input
                  id={`cam-${uid}`}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  style={{display:"none"}}
                  onChange={handleFile}
                />

                {/* ── GALLERY — label/input pattern ── */}
                <label htmlFor={`gal-${uid}`} style={optionBtn()}>
                  <span style={{fontSize:22,flexShrink:0}}>🖼</span>
                  <div>
                    <div style={{color:deckLight,fontSize:13,fontWeight:700}}>Browse Gallery</div>
                    <div style={{color:CREAM,fontSize:11,opacity:0.65}}>Choose from your photo library</div>
                  </div>
                </label>
                <input
                  id={`gal-${uid}`}
                  type="file"
                  accept="image/*"
                  style={{display:"none"}}
                  onChange={handleFile}
                />

                <button onClick={()=>setShowOptions(false)} style={{
                  background:"transparent",border:"none",
                  color:"rgba(245,230,200,0.35)",fontSize:12,
                  cursor:"pointer",padding:"5px",fontFamily:"inherit",marginTop:2}}>
                  ✕ Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── JOURNEY NAV ───────────────────────────────────────────────────
function JourneyNav({session,currentDeckIdx,onGoTo}){
  return(
    <div style={{background:"rgba(8,3,18,0.95)",borderBottom:"1px solid rgba(201,168,76,0.18)",
      padding:"9px 14px",display:"flex",gap:5,overflowX:"auto",
      WebkitOverflowScrolling:"touch",flexShrink:0,scrollbarWidth:"none"}}>
      {DECKS.map((d,i)=>{
        const done=!!session.deckResults[d.id];
        const active=i===currentDeckIdx;
        return(
          <button key={d.id} onClick={()=>done&&onGoTo(i)} style={{
            background:active?`rgba(201,168,76,0.18)`:"transparent",
            border:`1px solid ${active?GOLD:done?"rgba(201,168,76,0.45)":"rgba(201,168,76,0.12)"}`,
            borderRadius:20,padding:"5px 11px",cursor:done?"pointer":"default",
            color:active?GOLD:done?CREAM:"rgba(245,230,200,0.3)",
            fontSize:10,fontFamily:"Palatino Linotype,serif",whiteSpace:"nowrap",
            display:"flex",alignItems:"center",gap:4,transition:"all 0.2s",flexShrink:0}}>
            <span>{d.emoji}</span>
            <span>{done&&!active?"✓ ":""}{d.subtitle}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── RESULT DISPLAY ────────────────────────────────────────────────
function ResultDisplay({result,deck}){
  const paragraphs=result.split(/\n+/).filter(p=>p.trim());
  return(
    <div style={{animation:"slideUp 0.5s ease"}}>
      <div style={{background:`linear-gradient(135deg,${deck.color}cc,rgba(20,8,40,0.95))`,
        border:`1px solid ${deck.light}44`,borderRadius:14,padding:18,marginTop:16}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
          <span style={{fontSize:26}}>{deck.emoji}</span>
          <div>
            <div style={{color:GOLD,fontFamily:"Palatino Linotype,serif",fontSize:15,fontWeight:700}}>{deck.name} Reading</div>
            <div style={{color:CREAM,fontSize:11,opacity:0.65}}>{deck.subtitle}</div>
          </div>
        </div>
        {paragraphs.map((p,i)=>(
          <p key={i} style={{color:CREAM,fontSize:13,lineHeight:1.75,margin:i>0?"10px 0 0":"0",
            borderLeft:i===0?`3px solid ${deck.light}66`:"none",
            paddingLeft:i===0?12:0}}>{p}</p>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// SCREENS
// ══════════════════════════════════════════════════════════════════

// ── WELCOME ───────────────────────────────────────────────────────
function WelcomeScreen({onStart,onResume,hasSession}){
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      minHeight:"100vh",padding:"24px 20px",textAlign:"center"}}>
      <div style={{animation:"float 3s infinite",fontSize:68,marginBottom:6}}>🔮</div>
      <div style={{fontFamily:"Palatino Linotype,serif",fontSize:10,color:GOLD,
        letterSpacing:6,textTransform:"uppercase",marginBottom:6,opacity:0.75}}>The Sacred Reading</div>
      <h1 style={{fontFamily:"Palatino Linotype,serif",fontSize:30,color:GOLD,
        margin:"0 0 6px",lineHeight:1.2,textShadow:`0 0 28px rgba(201,168,76,0.45)`}}>
        Mystical Card<br/>Reader
      </h1>
      <Divider/>
      <p style={{color:CREAM,fontSize:13,lineHeight:1.7,maxWidth:300,opacity:0.8,margin:"10px 0 24px"}}>
        A sacred 5-deck system revealing your current energy, root cause, cosmic influences, action plan and most likely outcome.
      </p>
      <div style={{display:"flex",gap:8,marginBottom:28,flexWrap:"wrap",justifyContent:"center"}}>
        {DECKS.map(d=>(
          <div key={d.id} style={{background:`${d.color}88`,border:`1px solid ${d.light}33`,
            borderRadius:20,padding:"5px 12px",fontSize:10,color:CREAM,
            display:"flex",alignItems:"center",gap:5}}>
            <span>{d.emoji}</span><span>{d.subtitle}</span>
          </div>
        ))}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:12,width:"100%",maxWidth:260}}>
        <GoldBtn onClick={onStart} full>✦ Begin New Session ✦</GoldBtn>
        {hasSession&&<GoldBtn onClick={onResume} outline full>↩ Resume Session</GoldBtn>}
      </div>
      <p style={{color:CREAM,fontSize:10,opacity:0.35,marginTop:22,lineHeight:1.6}}>
        "A structured mirror — clarity, root cause,<br/>and a concrete action plan."
      </p>
    </div>
  );
}

// ── SECTION 1 ─────────────────────────────────────────────────────
function Section1({onNext,onSkip}){
  return(
    <div style={{padding:"20px 16px",animation:"slideUp 0.4s ease"}}>
      <SectionDots step={1} total={4}/>
      <div style={{textAlign:"center",marginBottom:18}}>
        <div style={{fontSize:38,marginBottom:6}}>🌙</div>
        <div style={{fontFamily:"Palatino Linotype,serif",color:GOLD,fontSize:10,
          letterSpacing:4,textTransform:"uppercase",marginBottom:5}}>Section 1</div>
        <h2 style={{fontFamily:"Palatino Linotype,serif",color:GOLD,fontSize:21,margin:0}}>
          Welcome & Setting Expectations
        </h2>
        <Divider/>
        <p style={{color:CREAM,fontSize:12,opacity:0.65,margin:0}}>Building trust before the sacred reading begins</p>
      </div>
      <Card style={{marginBottom:14}}>
        <div style={{color:GOLD,fontSize:11,fontWeight:700,letterSpacing:2,marginBottom:10}}>✦ OPENING SCRIPT</div>
        <p style={{color:CREAM,fontSize:13,lineHeight:1.8,fontStyle:"italic",margin:0}}>
          "Thank you for trusting me with your questions today. I use a powerful system of 5 specialist decks — each chosen for a specific role. Think of them as a council of 5 advisors, each with a different area of expertise."
        </p>
      </Card>
      <div style={{marginBottom:14}}>
        <div style={{color:GOLD,fontSize:11,fontWeight:700,letterSpacing:2,marginBottom:10,paddingLeft:2}}>✦ THE 5-DECK COUNCIL</div>
        {DECKS.map((d,i)=>(
          <div key={d.id} style={{display:"flex",gap:11,padding:"11px 13px",marginBottom:7,
            background:`${d.color}66`,border:`1px solid ${d.light}33`,borderRadius:12,
            animation:`slideUp 0.3s ${i*0.07}s ease both`}}>
            <span style={{fontSize:22,flexShrink:0}}>{d.emoji}</span>
            <div>
              <div style={{color:d.light,fontSize:12,fontWeight:700,fontFamily:"Palatino Linotype,serif"}}>{d.name}</div>
              <div style={{color:GOLD,fontSize:9,marginBottom:2}}>{d.subtitle}</div>
              <div style={{color:CREAM,fontSize:11,opacity:0.8,lineHeight:1.5}}>{d.purpose}</div>
            </div>
          </div>
        ))}
      </div>
      <Card style={{marginBottom:14}}>
        <div style={{color:GOLD,fontSize:11,fontWeight:700,letterSpacing:2,marginBottom:10}}>✦ THE READING JOURNEY</div>
        <div style={{display:"flex",alignItems:"center",gap:4,flexWrap:"wrap",justifyContent:"center"}}>
          {["Current Energy","Root Cause","Influences","Action Plan","Outcome"].map((s,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:4}}>
              <div style={{background:"rgba(201,168,76,0.12)",border:"1px solid rgba(201,168,76,0.28)",
                borderRadius:20,padding:"3px 9px",fontSize:10,color:CREAM}}>{s}</div>
              {i<4&&<span style={{color:GOLD,opacity:0.45,fontSize:11}}>→</span>}
            </div>
          ))}
        </div>
        <p style={{color:CREAM,fontSize:11,opacity:0.65,margin:"10px 0 0",textAlign:"center",lineHeight:1.6}}>
          Not fortune-telling — a structured mirror giving you clarity, root cause, and an action plan.
        </p>
      </Card>
      <Card style={{marginBottom:22}}>
        <div style={{color:GOLD,fontSize:11,fontWeight:700,letterSpacing:2,marginBottom:10}}>✦ IMPORTANT TO KNOW</div>
        {["There are no bad cards — every card carries wisdom","The future shown is a possibility, not a certainty","You may shuffle any deck yourself if you wish","You will leave with clarity, root cause, and a concrete plan"].map((item,i)=>(
          <div key={i} style={{display:"flex",gap:9,marginBottom:7,alignItems:"flex-start"}}>
            <span style={{color:GOLD,flexShrink:0,marginTop:2}}>✦</span>
            <span style={{color:CREAM,fontSize:12,lineHeight:1.6}}>{item}</span>
          </div>
        ))}
      </Card>
      <div style={{display:"flex",gap:11,justifyContent:"center"}}>
        <GoldBtn onClick={onSkip} outline small>Skip →</GoldBtn>
        <GoldBtn onClick={onNext}>Continue to Intake ✦</GoldBtn>
      </div>
    </div>
  );
}

// ── SECTION 2 ─────────────────────────────────────────────────────
function Section2({session,onUpdate,onNext}){
  const [area,setArea]=useState(session.lifeArea||null);
  const [question,setQuestion]=useState(session.question||"");
  const [error,setError]=useState("");
  const areaData=LIFE_AREAS.find(a=>a.id===area);
  const valid=question.trim().length>=15;

  function handleNext(){
    if(!area){setError("Please select an area of life");return;}
    if(!valid){setError("Please describe your question in at least 15 characters");return;}
    onUpdate({lifeArea:area,question:question.trim()});
    onNext();
  }

  return(
    <div style={{padding:"20px 16px",animation:"slideUp 0.4s ease"}}>
      <SectionDots step={2} total={4}/>
      <div style={{textAlign:"center",marginBottom:18}}>
        <div style={{fontSize:38,marginBottom:6}}>🌿</div>
        <div style={{fontFamily:"Palatino Linotype,serif",color:GOLD,fontSize:10,letterSpacing:4,textTransform:"uppercase",marginBottom:5}}>Section 2</div>
        <h2 style={{fontFamily:"Palatino Linotype,serif",color:GOLD,fontSize:21,margin:0}}>Your Sacred Question</h2>
        <Divider/>
        <p style={{color:CREAM,fontSize:12,opacity:0.65,margin:0}}>Choose one area of life and describe your question</p>
      </div>
      <div style={{marginBottom:18}}>
        <div style={{color:GOLD,fontSize:11,fontWeight:700,letterSpacing:2,marginBottom:10}}>✦ STEP 1: Choose Your Area of Life</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
          {LIFE_AREAS.map(a=>(
            <button key={a.id} className="area-btn" onClick={()=>{setArea(a.id);setError("");}} style={{
              background:area===a.id?`${a.color}cc`:`${a.color}44`,
              border:`1.5px solid ${area===a.id?GOLD:`${a.color}77`}`,
              borderRadius:11,padding:"11px 8px",cursor:"pointer",
              display:"flex",alignItems:"center",gap:7,transition:"all 0.2s",
              boxShadow:area===a.id?`0 3px 14px ${a.color}55`:"none"}}>
              <span style={{fontSize:19}}>{a.emoji}</span>
              <span style={{color:area===a.id?GOLD:CREAM,fontSize:11,
                fontFamily:"Palatino Linotype,serif",fontWeight:area===a.id?700:400,
                textAlign:"left",lineHeight:1.3}}>{a.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div style={{marginBottom:18}}>
        <div style={{color:GOLD,fontSize:11,fontWeight:700,letterSpacing:2,marginBottom:10}}>✦ STEP 2: Describe Your Question</div>
        <textarea value={question} onChange={e=>{setQuestion(e.target.value);setError("");}}
          placeholder="Describe your situation and question in your own words..."
          style={{width:"100%",minHeight:95,background:"rgba(20,8,40,0.82)",
            border:`1.5px solid ${question.length>0&&valid?GOLD:"rgba(201,168,76,0.28)"}`,
            borderRadius:11,padding:13,color:CREAM,fontSize:13,lineHeight:1.6,
            fontFamily:"Palatino Linotype,serif",resize:"none",outline:"none",
            boxSizing:"border-box",transition:"border 0.2s"}}/>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
          <span style={{color:valid?"#7CFC00":"rgba(245,230,200,0.38)",fontSize:11}}>
            {valid?"✓ Ready to proceed":`${Math.max(0,15-question.trim().length)} more characters needed`}
          </span>
          <span style={{color:"rgba(245,230,200,0.35)",fontSize:11}}>{question.length}</span>
        </div>
      </div>
      {areaData&&(
        <Card style={{marginBottom:18}}>
          <div style={{color:GOLD,fontSize:10,fontWeight:700,letterSpacing:2,marginBottom:9}}>
            {areaData.emoji} EXAMPLE QUESTIONS — {areaData.label.toUpperCase()}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:5}}>
            {areaData.questions.map((q,i)=>(
              <button key={i} className="q-btn" onClick={()=>{setQuestion(q);setError("");}} style={{
                background:"rgba(201,168,76,0.06)",border:"1px solid rgba(201,168,76,0.18)",
                borderRadius:8,padding:"7px 11px",cursor:"pointer",textAlign:"left",
                color:CREAM,fontSize:12,lineHeight:1.5,transition:"all 0.15s",fontFamily:"inherit"}}>
                <span style={{color:GOLD,marginRight:5}}>›</span>{q}
              </button>
            ))}
          </div>
          <div style={{color:CREAM,fontSize:10,opacity:0.45,marginTop:7}}>Tap any example to use it, or write your own above</div>
        </Card>
      )}
      {error&&(
        <div style={{color:"#FF6B6B",fontSize:12,textAlign:"center",marginBottom:11,padding:"8px 14px",
          background:"rgba(255,100,100,0.08)",border:"1px solid rgba(255,100,100,0.28)",borderRadius:8}}>
          ⚠ {error}
        </div>
      )}
      <div style={{textAlign:"center"}}>
        <GoldBtn onClick={handleNext} disabled={!area||!valid}>Begin the Reading ✦</GoldBtn>
      </div>
    </div>
  );
}

// ── SECTION 3: ENHANCED DECK READING ─────────────────────────────
function DeckReadingScreen({session,deckIdx,onUpdate,onNext,onGoTo,onProceedToClose}){
  const deck=DECKS[deckIdx];
  const existing=session.deckResults[deck.id];
  const existingImages=session.deckImages?.[deck.id]||{};

  const [images,setImages]=useState(existingImages);
  const [phase,setPhase]=useState(existing?"done":"upload"); // upload | loading | done
  const [result,setResult]=useState(existing||null);
  const [showResetConfirm,setShowResetConfirm]=useState(false);
  const [resetMsg,setResetMsg]=useState("");

  const areaData=LIFE_AREAS.find(a=>a.id===session.lifeArea);
  const allUploaded=deck.cards.every(c=>images[c.id]);
  const uploadedCount=deck.cards.filter(c=>images[c.id]).length;
  const isLast=deckIdx===DECKS.length-1;
  const allDecksComplete=DECKS.every(d=>session.deckResults[d.id]);

  async function doReading(demoMode=false){
    setPhase("loading");
    try{
      const cardSummary=deck.cards.map(c=>{
        return `${c.label} (${c.role}): ${(!demoMode && images[c.id])?"Card image uploaded — please interpret based on the role and context":"No physical image — provide an intuitive reading based on the role"}\nRole meaning: ${c.desc}`;
      }).join("\n\n");

      const prompt=`You are a warm, professional mystical card reader conducting a ${deck.name} reading.

Client's life area: ${areaData?.label}
Client's question: "${session.question}"
This deck's purpose: ${deck.purpose}

Cards drawn (${deck.cards.length} cards):
${cardSummary}

Write a professional, flowing reading addressing each card in sequence. For each card:
- Use the card's role as a clear heading (bold with **Role Name**)
- Write 2-3 sentences interpreting the card's energy specifically in relation to the client's question
- Be compassionate, honest, empowering and specific

End with a "✦ Synthesis" section (2-3 sentences) weaving all cards into one unified message.

Use mystical yet accessible language. No bullet points — flowing paragraphs only.`;

      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,
          messages:[{role:"user",content:prompt}]})
      });
      const data=await res.json();
      const text=data.content?.map(b=>b.text||"").join("")||
        "The oracle speaks through these cards with profound clarity. Trust the wisdom they carry for your unique journey.";
      setResult(text);
      setPhase("done");
      onUpdate(deck.id,text,images);
    }catch(e){
      const fallback="The veil between worlds shimmers with your question. These cards hold deep resonance for your situation — trust what you felt when you drew them, as your intuition already knows the truth they carry.";
      setResult(fallback);
      setPhase("done");
      onUpdate(deck.id,fallback,images);
    }
  }

  function handleReset(){
    setImages({});
    setResult(null);
    setPhase("upload");
    setShowResetConfirm(false);
    setResetMsg("✓ Step reset. Please re-upload your cards.");
    onUpdate(deck.id,null,{});
    setTimeout(()=>setResetMsg(""),3000);
  }

  function handleNext(){
    if(!isLast){onNext();}
    else{onProceedToClose();}
  }

  return(
    <div style={{display:"flex",flexDirection:"column",minHeight:"100vh"}}>
      <JourneyNav session={session} currentDeckIdx={deckIdx} onGoTo={onGoTo}/>
      <div style={{padding:"18px 16px 32px",flex:1}}>

        {/* Header */}
        <div style={{textAlign:"center",marginBottom:18}}>
          <SectionDots step={3} total={4}/>
          <div style={{fontSize:42,animation:"float 3s infinite",marginBottom:5}}>{deck.emoji}</div>
          <div style={{color:deck.light,fontSize:10,fontWeight:700,letterSpacing:3,
            textTransform:"uppercase",marginBottom:3}}>Step {deckIdx+1} of 5 — Section 3</div>
          <h2 style={{fontFamily:"Palatino Linotype,serif",color:GOLD,fontSize:19,margin:"0 0 3px"}}>{deck.name}</h2>
          <div style={{color:CREAM,fontSize:12,opacity:0.65}}>{deck.subtitle}</div>
          <Divider/>
        </div>

        {/* Progress bar */}
        <div style={{marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
            <span style={{color:CREAM,fontSize:10,opacity:0.6}}>Step progress</span>
            <span style={{color:GOLD,fontSize:10,fontWeight:700}}>{deckIdx+1} / {DECKS.length}</span>
          </div>
          <div style={{height:4,background:"rgba(201,168,76,0.12)",borderRadius:4}}>
            <div style={{height:"100%",borderRadius:4,
              background:`linear-gradient(90deg,${GOLD},${deck.light})`,
              width:`${((deckIdx+1)/DECKS.length)*100}%`,transition:"width 0.5s"}}/>
          </div>
        </div>

        {/* Question reminder */}
        <Card style={{marginBottom:13,background:`${areaData?.color||"#1a0a30"}88`}}>
          <div style={{color:GOLD,fontSize:10,letterSpacing:2,marginBottom:5}}>
            {areaData?.emoji} READING FOR
          </div>
          <div style={{color:CREAM,fontSize:12,fontStyle:"italic",lineHeight:1.6}}>
            "{session.question}"
          </div>
        </Card>

        {/* Purpose */}
        <Card style={{marginBottom:13}}>
          <div style={{color:GOLD,fontSize:10,fontWeight:700,letterSpacing:2,marginBottom:7}}>✦ PURPOSE OF THIS DECK</div>
          <p style={{color:CREAM,fontSize:12,lineHeight:1.7,margin:0}}>{deck.purpose}</p>
        </Card>

        {/* Instructions */}
        <Card style={{marginBottom:18,border:`1px solid ${deck.light}33`,background:`${deck.color}55`}}>
          <div style={{color:deck.light,fontSize:10,fontWeight:700,letterSpacing:2,marginBottom:7}}>✦ INSTRUCTIONS</div>
          <p style={{color:CREAM,fontSize:12,lineHeight:1.75,margin:0}}>{deck.instruction}</p>
        </Card>

        {/* Reset message */}
        {resetMsg&&(
          <div style={{color:"#7CFC00",fontSize:12,textAlign:"center",marginBottom:12,
            padding:"8px 14px",background:"rgba(100,200,100,0.08)",
            border:"1px solid rgba(100,200,100,0.25)",borderRadius:8,animation:"fadeIn 0.3s ease"}}>
            {resetMsg}
          </div>
        )}

        {/* ── UPLOAD PHASE ── */}
        {phase==="upload"&&(
          <div>

            {/* Sandbox / environment notice */}
            <div style={{background:"rgba(201,168,76,0.07)",border:"1px solid rgba(201,168,76,0.25)",
              borderRadius:10,padding:"10px 13px",marginBottom:14,display:"flex",gap:10,alignItems:"flex-start"}}>
              <span style={{fontSize:18,flexShrink:0}}>📱</span>
              <div>
                <div style={{color:GOLD,fontSize:11,fontWeight:700,marginBottom:3}}>Camera & Gallery Info</div>
                <div style={{color:CREAM,fontSize:11,lineHeight:1.6,opacity:0.8}}>
                  Camera and gallery access work on your <b style={{color:GOLD}}>real phone browser</b> after deployment to Netlify.
                  Inside this preview, use <b style={{color:GOLD}}>Demo Mode</b> below to test the full reading flow.
                </div>
              </div>
            </div>

            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div style={{color:GOLD,fontSize:11,fontWeight:700,letterSpacing:2}}>
                ✦ UPLOAD YOUR {deck.cards.length} CARDS
              </div>
              <div style={{color:CREAM,fontSize:10,opacity:0.6}}>
                {uploadedCount}/{deck.cards.length} uploaded
              </div>
            </div>

            {/* Upload progress */}
            <div style={{height:3,background:"rgba(201,168,76,0.12)",borderRadius:4,marginBottom:16}}>
              <div style={{height:"100%",borderRadius:4,background:GOLD,
                width:`${(uploadedCount/deck.cards.length)*100}%`,transition:"width 0.4s"}}/>
            </div>

            {/* Card upload slots */}
            {deck.cards.map(card=>(
              <CardUploadSlot key={card.id} card={card}
                value={images[card.id]}
                deckLight={deck.light} deckColor={deck.color}
                onChange={img=>setImages(prev=>({...prev,[card.id]:img}))}/>
            ))}

            {/* Read button */}
            <div style={{textAlign:"center",marginTop:20,display:"flex",flexDirection:"column",gap:10,alignItems:"center"}}>
              <GoldBtn onClick={doReading} disabled={!allUploaded} full>
                {allUploaded?`✦ Read the ${deck.subtitle} Cards`:`Upload all ${deck.cards.length} cards to read`}
              </GoldBtn>
              {!allUploaded&&(
                <div style={{color:CREAM,fontSize:10,opacity:0.45}}>
                  {deck.cards.length-uploadedCount} card{deck.cards.length-uploadedCount!==1?"s":""} still needed to unlock reading
                </div>
              )}

              {/* Demo mode — lets user test full flow without real uploads */}
              <div style={{width:"100%",borderTop:"1px solid rgba(201,168,76,0.15)",paddingTop:12,marginTop:4}}>
                <div style={{color:CREAM,fontSize:10,opacity:0.45,marginBottom:8,letterSpacing:1}}>— OR —</div>
                <button onClick={()=>doReading(true)} style={{
                  background:"rgba(107,76,154,0.2)",border:"1px solid rgba(107,76,154,0.45)",
                  borderRadius:30,padding:"9px 22px",cursor:"pointer",
                  color:"rgba(179,136,255,0.85)",fontSize:12,fontFamily:"inherit",
                  letterSpacing:0.5,width:"100%"}}>
                  ✦ Demo Mode — Read Without Uploading
                </button>
                <div style={{color:CREAM,fontSize:10,opacity:0.35,marginTop:6,lineHeight:1.5}}>
                  Use this to test the full reading flow.<br/>On your real phone, upload actual card photos.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── LOADING PHASE ── */}
        {phase==="loading"&&<OracleLoading label={`Reading your ${deck.subtitle} cards`}/>}

        {/* ── DONE PHASE ── */}
        {phase==="done"&&(
          <div>
            {/* Card previews */}
            {Object.values(images).some(Boolean)&&(
              <div style={{marginBottom:16}}>
                <div style={{color:GOLD,fontSize:10,letterSpacing:2,marginBottom:10,fontWeight:700}}>
                  ✦ YOUR {deck.cards.length} CARDS DRAWN
                </div>
                <div style={{display:"flex",gap:9,flexWrap:"wrap"}}>
                  {deck.cards.map(card=>images[card.id]?(
                    <div key={card.id} style={{textAlign:"center"}}>
                      <img src={images[card.id]} alt={card.role} style={{
                        width:68,height:100,objectFit:"cover",borderRadius:9,
                        border:`2px solid ${deck.light}55`,
                        boxShadow:`0 3px 12px ${deck.color}88`}}/>
                      <div style={{color:CREAM,fontSize:8,opacity:0.6,marginTop:3,maxWidth:68,lineHeight:1.2}}>
                        {card.role}
                      </div>
                    </div>
                  ):null)}
                </div>
              </div>
            )}

            {/* Result */}
            {result&&<ResultDisplay result={result} deck={deck}/>}

            {/* Action buttons */}
            <div style={{marginTop:22,display:"flex",flexDirection:"column",gap:10}}>

              {/* Reset / Redo this step */}
              {!showResetConfirm?(
                <button onClick={()=>setShowResetConfirm(true)} className="ghost-btn" style={{
                  background:"transparent",border:"1px solid rgba(255,100,100,0.3)",
                  borderRadius:30,padding:"9px 20px",cursor:"pointer",
                  color:"rgba(255,150,150,0.8)",fontSize:12,fontFamily:"inherit",transition:"all 0.2s"}}>
                  ↺ Reset This Step & Re-upload Cards
                </button>
              ):(
                <div style={{background:"rgba(180,30,30,0.12)",border:"1px solid rgba(255,80,80,0.35)",
                  borderRadius:12,padding:"14px",animation:"fadeIn 0.2s ease"}}>
                  <div style={{color:"#ff9090",fontSize:13,marginBottom:10,textAlign:"center",fontFamily:"Palatino Linotype,serif"}}>
                    Reset this step?
                  </div>
                  <p style={{color:CREAM,fontSize:11,opacity:0.7,textAlign:"center",margin:"0 0 12px",lineHeight:1.5}}>
                    This will clear all uploaded card images and the reading result for this step. You will need to re-upload and re-read.
                  </p>
                  <div style={{display:"flex",gap:8,justifyContent:"center"}}>
                    <GoldBtn onClick={()=>setShowResetConfirm(false)} outline small>Cancel</GoldBtn>
                    <GoldBtn onClick={handleReset} danger small>Yes, Reset</GoldBtn>
                  </div>
                </div>
              )}

              {/* Proceed */}
              {!showResetConfirm&&(
                isLast?(
                  allDecksComplete?(
                    <GoldBtn onClick={handleNext} full>✦ Receive Your Full Reading Summary</GoldBtn>
                  ):(
                    <div>
                      <div style={{color:"#ffaa44",fontSize:11,textAlign:"center",marginBottom:8,
                        padding:"8px 12px",background:"rgba(255,150,50,0.08)",
                        border:"1px solid rgba(255,150,50,0.25)",borderRadius:8}}>
                        ⚠ Complete all 5 deck steps before proceeding to the Summary
                      </div>
                      <div style={{display:"flex",flexDirection:"column",gap:6}}>
                        {DECKS.map((d,i)=>{
                          const done=!!session.deckResults[d.id];
                          return(
                            <div key={d.id} style={{display:"flex",alignItems:"center",gap:8,
                              padding:"7px 12px",borderRadius:8,
                              background:done?"rgba(100,200,100,0.07)":"rgba(255,100,100,0.07)",
                              border:`1px solid ${done?"rgba(100,200,100,0.2)":"rgba(255,100,100,0.2)"}`}}>
                              <span style={{fontSize:14}}>{d.emoji}</span>
                              <span style={{color:done?"#7CFC00":"#ff9090",fontSize:11,flex:1}}>{d.subtitle}</span>
                              <span style={{fontSize:12}}>{done?"✓":"○"}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )
                ):(
                  <GoldBtn onClick={onNext} full>
                    Continue to {DECKS[deckIdx+1]?.subtitle} {DECKS[deckIdx+1]?.emoji}
                  </GoldBtn>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── SECTION 4: CLOSING ────────────────────────────────────────────
function ClosingScreen({session,onNewSession}){
  const [loading,setLoading]=useState(false);
  const [summary,setSummary]=useState(session.summary||null);
  const areaData=LIFE_AREAS.find(a=>a.id===session.lifeArea);

  useEffect(()=>{if(!summary)generateSummary();},[]);

  async function generateSummary(){
    setLoading(true);
    try{
      const deckParts=DECKS.map(d=>`${d.emoji} ${d.name} (${d.subtitle}):\n${(session.deckResults[d.id]||"").substring(0,300)}...`).join("\n\n");
      const prompt=`You are a professional mystical card reader closing a complete 5-deck reading session.

Client's area: ${areaData?.label}
Client's question: "${session.question}"

5-deck readings:
${deckParts}

Write the professional closing summary narrative (under 280 words):
1. Open with: "Let me bring everything together into one clear narrative for you."
2. Weave one sentence from each deck naturally into a flowing story
3. Include these two reminders naturally:
   - They are in control — cards show probability not destiny
   - Complete at least ONE action before another reading
4. Close with a warm, empowering final sentence

Flowing paragraphs only. Warm, professional, mystical tone.`;

      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:600,
          messages:[{role:"user",content:prompt}]})
      });
      const data=await res.json();
      const text=data.content?.map(b=>b.text||"").join("")||buildFallback(session,areaData);
      setSummary(text);
    }catch(e){setSummary(buildFallback(session,areaData));}
    setLoading(false);
  }

  function buildFallback(s,a){
    return `Let me bring everything together into one clear narrative for you.\n\nYour Crystal Reading revealed the emotional truth you are carrying right now. The Egyptian Oracle uncovered the deeper soul lesson beneath your challenge. Your Astrology Cards illuminated the cosmic forces and timing surrounding your situation. The Magic Oracle provided concrete steps and intentions to take forward. And the Mystical Tarot mapped your most likely path ahead.\n\nRemember: you are in complete control. These cards show probability, not destiny — you are always the author of your own story. Do not seek another reading until you have completed at least ONE action from your plan. Readings without action become avoidance, not growth.\n\nThank you sincerely for the trust you placed in this sacred space today. The work you do on yourself ripples outward into everyone around you. Go well. ✦`;
  }

  return(
    <div style={{padding:"20px 16px 36px",animation:"slideUp 0.4s ease"}}>
      <SectionDots step={4} total={4}/>
      <div style={{textAlign:"center",marginBottom:20}}>
        <div style={{fontSize:44,animation:"float 3s infinite",marginBottom:6}}>✦</div>
        <div style={{fontFamily:"Palatino Linotype,serif",color:GOLD,fontSize:10,letterSpacing:4,textTransform:"uppercase",marginBottom:5}}>Section 4 — Closing</div>
        <h2 style={{fontFamily:"Palatino Linotype,serif",color:GOLD,fontSize:21,margin:0}}>Your Complete Reading</h2>
        <Divider/>
        <p style={{color:CREAM,fontSize:12,opacity:0.65,margin:0}}>The 5-deck narrative woven into one clear message</p>
      </div>

      <Card style={{marginBottom:14,background:`${areaData?.color||"#1a0a30"}88`}}>
        <div style={{color:GOLD,fontSize:10,letterSpacing:2,marginBottom:5}}>{areaData?.emoji} READING FOR</div>
        <div style={{color:CREAM,fontSize:12,fontStyle:"italic",lineHeight:1.6}}>"{session.question}"</div>
      </Card>

      {/* Journey summary */}
      <div style={{marginBottom:18}}>
        <div style={{color:GOLD,fontSize:11,fontWeight:700,letterSpacing:2,marginBottom:10}}>✦ YOUR 5-DECK JOURNEY</div>
        {DECKS.map((d,i)=>(
          <div key={d.id} style={{background:`${d.color}66`,border:`1px solid ${d.light}33`,
            borderRadius:11,padding:"9px 13px",marginBottom:7,
            display:"flex",alignItems:"flex-start",gap:10,
            animation:`slideUp 0.3s ${i*0.08}s ease both`}}>
            <span style={{fontSize:18,flexShrink:0,marginTop:1}}>{d.emoji}</span>
            <div>
              <div style={{color:d.light,fontSize:10,fontWeight:700,letterSpacing:0.5}}>
                {d.subtitle.toUpperCase()} — {d.name}
              </div>
              <div style={{color:CREAM,fontSize:11,opacity:0.75,marginTop:3,lineHeight:1.5}}>
                {session.deckResults[d.id]
                  ?(session.deckResults[d.id].replace(/\*\*/g,"").substring(0,110)+"...")
                  :"Not completed"}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Full narrative */}
      <Card style={{marginBottom:20,border:`1px solid ${GOLD}55`}}>
        <div style={{color:GOLD,fontSize:11,fontWeight:700,letterSpacing:2,marginBottom:12}}>✦ THE ORACLE'S FINAL NARRATIVE</div>
        {loading?(
          <OracleLoading label="Weaving your complete reading narrative"/>
        ):(
          <div style={{color:CREAM,fontSize:13,lineHeight:1.8,fontStyle:"italic",whiteSpace:"pre-wrap"}}>
            {summary}
          </div>
        )}
      </Card>

      {/* Reminders */}
      <Card style={{marginBottom:22,background:"rgba(201,168,76,0.06)",border:`1px solid ${GOLD}33`}}>
        <div style={{color:GOLD,fontSize:11,fontWeight:700,letterSpacing:2,marginBottom:12}}>✦ BEFORE YOU GO</div>
        {[
          {n:"1",t:"You are in control",b:"The cards show probability, not destiny. The action plan is a powerful suggestion — but you are always the author of your own life."},
          {n:"2",t:"Action before another reading",b:"Do not seek another reading until you have completed at least ONE action from your plan. Readings without action become avoidance, not growth."},
        ].map(r=>(
          <div key={r.n} style={{display:"flex",gap:11,marginBottom:13,alignItems:"flex-start"}}>
            <div style={{width:26,height:26,borderRadius:"50%",background:"rgba(201,168,76,0.15)",
              border:`1px solid ${GOLD}`,display:"flex",alignItems:"center",justifyContent:"center",
              color:GOLD,fontSize:12,fontWeight:700,flexShrink:0}}>{r.n}</div>
            <div>
              <div style={{color:GOLD,fontSize:12,fontWeight:700,marginBottom:2}}>{r.t}</div>
              <div style={{color:CREAM,fontSize:11,lineHeight:1.6,opacity:0.82}}>{r.b}</div>
            </div>
          </div>
        ))}
      </Card>

      <div style={{textAlign:"center",paddingBottom:12}}>
        <p style={{color:CREAM,fontSize:12,opacity:0.5,marginBottom:14,fontStyle:"italic",lineHeight:1.6}}>
          "Thank you for your trust. The work you do on yourself<br/>ripples out into everyone around you."
        </p>
        <GoldBtn onClick={onNewSession} full>✦ Begin New Session ✦</GoldBtn>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════════
export default function App(){
  const [screen,setScreen]=useState("welcome");
  const [session,setSession]=useState(EMPTY_SESSION);
  const [deckIdx,setDeckIdx]=useState(0);

  const hasSession=session.question.length>0||Object.keys(session.deckResults).length>0;
  const allDecksComplete=DECKS.every(d=>session.deckResults[d.id]);

  function startNew(){setSession(EMPTY_SESSION);setDeckIdx(0);setScreen("s1");}

  function resume(){
    const completedCount=DECKS.filter(d=>session.deckResults[d.id]).length;
    if(completedCount>=DECKS.length){setScreen("s4");return;}
    if(completedCount>0||session.question){setDeckIdx(completedCount);setScreen("s3");return;}
    if(session.lifeArea){setScreen("s2");return;}
    setScreen("s1");
  }

  function updateSession(updates){setSession(prev=>({...prev,...updates}));}

  function updateDeckResult(deckId,result,images){
    setSession(prev=>({
      ...prev,
      deckResults:{...prev.deckResults,[deckId]:result},
      deckImages:{...prev.deckImages,[deckId]:images||{}},
    }));
  }

  function nextDeck(){
    if(deckIdx<DECKS.length-1){setDeckIdx(deckIdx+1);}
    else if(allDecksComplete){setScreen("s4");}
  }

  function proceedToClose(){
    if(allDecksComplete){setScreen("s4");}
  }

  function goToDeck(i){setDeckIdx(i);}

  function goBack(){
    if(screen==="welcome")return;
    if(screen==="s1"){setScreen("welcome");return;}
    if(screen==="s2"){setScreen("s1");return;}
    if(screen==="s3"&&deckIdx===0){setScreen("s2");return;}
    if(screen==="s3"&&deckIdx>0){setDeckIdx(deckIdx-1);return;}
    if(screen==="s4"){setScreen("s3");setDeckIdx(DECKS.length-1);return;}
  }

  return(
    <div style={{minHeight:"100vh",
      background:"radial-gradient(ellipse at 20% 20%,#1A0A3C 0%,#0A0015 50%,#050010 100%)",
      color:CREAM,fontFamily:"Palatino Linotype,Palatino,Georgia,serif",
      position:"relative",overflowX:"hidden"}}>
      <Stars/>
      <div style={{position:"relative",zIndex:1,maxWidth:480,margin:"0 auto"}}>

        {/* Back button */}
        {screen!=="welcome"&&(
          <div style={{position:"fixed",top:12,left:Math.max(0,(window.innerWidth-480)/2)+12,zIndex:200}}>
            <button onClick={goBack} style={{
              background:"rgba(20,8,40,0.92)",border:"1px solid rgba(201,168,76,0.28)",
              borderRadius:"50%",width:34,height:34,cursor:"pointer",
              color:GOLD,fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",
              backdropFilter:"blur(8px)",boxShadow:"0 2px 10px rgba(0,0,0,0.4)"}}>←</button>
          </div>
        )}

        {screen==="welcome"&&<WelcomeScreen onStart={startNew} onResume={resume} hasSession={hasSession}/>}
        {screen==="s1"&&<Section1 onNext={()=>setScreen("s2")} onSkip={()=>setScreen("s2")}/>}
        {screen==="s2"&&<Section2 session={session} onUpdate={updateSession} onNext={()=>{setDeckIdx(0);setScreen("s3");}}/>}
        {screen==="s3"&&(
          <DeckReadingScreen
            session={session} deckIdx={deckIdx}
            onUpdate={updateDeckResult}
            onNext={nextDeck}
            onGoTo={goToDeck}
            onProceedToClose={proceedToClose}/>
        )}
        {screen==="s4"&&<ClosingScreen session={session} onNewSession={startNew}/>}
      </div>
    </div>
  );
}
