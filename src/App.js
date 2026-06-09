import { useState, useEffect } from "react";

// ══════════════════════════════════════════════════════════════════
// 🔑 API KEY IS NOW STORED SECURELY IN A NETLIFY FUNCTION
// The app calls /.netlify/functions/oracle instead of Anthropic directly.
// Your API key lives ONLY in Netlify environment variables (server-side).
// It is NEVER exposed in the browser or JavaScript bundle.
// See: netlify/functions/oracle.js in your repository
// ══════════════════════════════════════════════════════════════════
const ORACLE_ENDPOINT = "/.netlify/functions/oracle";
// ══════════════════════════════════════════════════════════════════

const GOLD="#C9A84C", CREAM="#F5E6C8", PURPLE="#1E0A3C";

const AREAS=[
  {id:"love",emoji:"💕",label:"Love & Relationships",color:"#8B2252",
   q:["Will my relationship improve or is it time to let go?","Why do my relationships keep ending the same way?","What is blocking me from receiving love?","Is this relationship growing me or depleting me?","How do I heal from heartbreak and open up again?","Why do I repeat the same painful patterns in love?","Am I holding onto something I should release?","How do I know if this person is right for me?"]},
  {id:"career",emoji:"🌟",label:"Career & Life Purpose",color:"#1A4A1A",
   q:["Should I change my job or stay where I am?","Why do I feel so stuck in my career?","What hidden skill or talent am I ignoring?","What is my true life purpose?","Should I start my own business or stay employed?","Am I resisting a change I need to make?","Why don't I feel valued at work?","I fear I'm not good enough for the next level — is this true?"]},
  {id:"finances",emoji:"💰",label:"Finances & Abundance",color:"#4A3000",
   q:["What is blocking my financial flow?","What is my core money wound?","Is fear blocking my abundance?","What opportunity am I missing?","How do I break the cycle of financial struggle?","I save but never feel secure — why?","What mindset shift would transform my finances?","How do I create multiple income streams?"]},
  {id:"family",emoji:"🏠",label:"Family & Home",color:"#0A2A3A",
   q:["How do I set healthy boundaries without guilt?","Why do I seek approval that never comes?","How do I heal a broken family relationship?","Am I enabling someone I love?","How do I navigate a toxic family dynamic?","My adult child won't speak to me — what should I do?","How do I balance family and my own needs?","Why do the same conflicts keep repeating?"]},
  {id:"growth",emoji:"🌱",label:"Personal Growth",color:"#2A0A4A",
   q:["What truth am I avoiding?","Why do I self-sabotage when things go well?","I feel like I have no purpose — help.","What fear is most holding me back?","How do I break free from old patterns?","Why do I struggle to love and accept myself?","How do I build more confidence?","What is the next chapter of my growth?"]},
  {id:"spirituality",emoji:"🔮",label:"Spirituality",color:"#2A0A3A",
   q:["Am I following my intuition or my ego?","What sign am I overlooking?","I don't trust my intuition — how do I develop it?","Am I on my soul's true path?","How do I deepen my spiritual practice?","What spiritual gifts am I not using?","How do I reconnect with my higher self?","What does my higher self most want me to know?"]},
];

const DECKS=[
  {id:"crystal",emoji:"💎",name:"Crystal Reading Cards",subtitle:"Current Energy",color:"#5A0A30",light:"#FF6B9D",
   purpose:"Reveals your current emotional truth — what energy you are carrying right now beneath the surface.",
   instruction:"Take your Crystal Reading Cards. Hold them gently and think about how you FEEL right now — not your question, but your emotional state. Shuffle slowly and mindfully, then draw 3 cards one at a time.",
   cards:[
     {id:"c1",label:"Card 1",role:"Current Emotional State",desc:"What energy are you carrying right now?"},
     {id:"c2",label:"Card 2",role:"Hidden Challenge",desc:"What emotional wound needs attention?"},
     {id:"c3",label:"Card 3",role:"Healing Opportunity",desc:"What inner strength do you already have?"}]},
  {id:"egyptian",emoji:"👁",name:"Egyptian Book of the Dead",subtitle:"Root Cause",color:"#3A1500",light:"#FF8C42",
   purpose:"Uncovers the spiritual root cause behind your situation — the soul lesson hidden within your challenge.",
   instruction:"Take your Egyptian Oracle deck. Hold it, close your eyes and take 3 deep breaths. Ask silently: 'Show me why this is happening and what my soul needs to learn.' Shuffle with intention and draw 3 cards.",
   cards:[
     {id:"e1",label:"Card 1",role:"Past Influence",desc:"Why is this situation happening?"},
     {id:"e2",label:"Card 2",role:"Current Lesson",desc:"What soul lesson am I here to learn?"},
     {id:"e3",label:"Card 3",role:"Transformation Available",desc:"What am I overlooking that could change everything?"}]},
  {id:"astrology",emoji:"🌙",name:"Astrology Reading Cards",subtitle:"Influences & Timing",color:"#0A0A3A",light:"#7B8CDE",
   purpose:"Reveals what cosmic forces and timing are affecting your situation — what is coming at you from the outside.",
   instruction:"Separate your Astrology Cards into 3 piles: Planets, Zodiac Signs, and Houses. Shuffle each pile separately while focusing on your question. Draw 1 card from each pile.",
   cards:[
     {id:"a1",label:"Planet Card",role:"Current Influence",desc:"What energy or force is most affecting you?"},
     {id:"a2",label:"Zodiac Card",role:"Opportunity",desc:"What opportunity is emerging for you?"},
     {id:"a3",label:"House Card",role:"Timing & Challenge",desc:"What life area and timing should you know?"}]},
  {id:"magic",emoji:"✨",name:"Magic Oracle Cards",subtitle:"Action Plan",color:"#1A0840",light:"#B388FF",
   purpose:"Gives you concrete, practical action steps — transforming insight into real change you can create this week.",
   instruction:"Take your Magic Oracle Cards. Shuffle while asking: 'What actions and shifts will serve me most right now?' Draw with intention and select 3 cards.",
   cards:[
     {id:"m1",label:"Card 1",role:"Immediate Action",desc:"What is the most important thing to do this week?"},
     {id:"m2",label:"Card 2",role:"Mindset Shift",desc:"What belief or pattern needs to change?"},
     {id:"m3",label:"Card 3",role:"Manifestation Focus",desc:"What energy helps you attract what you want?"}]},
  {id:"tarot",emoji:"🌀",name:"Mystical Realm Tarot",subtitle:"Outcome & Final Map",color:"#1A003A",light:"#CE93D8",
   purpose:"The final map — your current position, obstacles, opportunities, wisest advice and most probable outcome.",
   instruction:"Shuffle the full 78 Tarot cards while holding your question in mind. You may cut the deck. Draw 5 cards and lay them face down before turning each one over.",
   cards:[
     {id:"t1",label:"Card 1",role:"Current Situation",desc:"Where do you actually stand right now?"},
     {id:"t2",label:"Card 2",role:"Obstacle",desc:"What is working against you?"},
     {id:"t3",label:"Card 3",role:"Opportunity",desc:"What hidden resource wants to help you?"},
     {id:"t4",label:"Card 4",role:"Advice",desc:"What is the single wisest move?"},
     {id:"t5",label:"Card 5",role:"Likely Outcome",desc:"If you follow the advice, where does this lead?"}]},
];

const EMPTY={lifeArea:null,question:"",deckResults:{},deckImages:{},deckCardData:{},summary:null};
const STARS=Array.from({length:60},(_,i)=>({id:i,x:Math.random()*100,y:Math.random()*100,s:Math.random()*2+0.5,d:Math.random()*5,u:Math.random()*3+2}));

// ── STYLES ────────────────────────────────────────────────────────
const CSS=`
  @keyframes tw{from{opacity:0.05}to{opacity:0.85}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
  @keyframes glow{0%,100%{box-shadow:0 0 14px 3px rgba(201,168,76,0.25)}50%{box-shadow:0 0 28px 8px rgba(201,168,76,0.55)}}
  @keyframes up{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fi{from{opacity:0}to{opacity:1}}
  @keyframes pu{0%,100%{transform:scale(1)}50%{transform:scale(1.07)}}
  @keyframes sp{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  .hq:hover{background:rgba(201,168,76,0.14)!important;border-color:rgba(201,168,76,0.45)!important}
  .ha:hover{transform:scale(1.02)}
  .hg:hover{background:rgba(201,168,76,0.1)!important}
`;

// ── SHARED UI ─────────────────────────────────────────────────────
function Stars(){
  return(
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0}}>
      <style>{CSS}</style>
      {STARS.map(s=><div key={s.id} style={{position:"absolute",left:`${s.x}%`,top:`${s.y}%`,width:s.s,height:s.s,borderRadius:"50%",background:"white",animation:`tw ${s.u}s ${s.d}s infinite alternate`}}/>)}
    </div>
  );
}

function Btn({onClick,children,disabled,sm,outline,danger,purple,full}){
  const bg=danger?"rgba(180,30,30,0.28)":purple?"rgba(107,76,154,0.28)":outline?"transparent":disabled?"#2a1a4a":`linear-gradient(135deg,${GOLD},#E8C060,${GOLD})`;
  const cl=disabled?"#5a4a7a":danger?"#ff9090":purple?"#b388ff":outline?GOLD:PURPLE;
  const bd=danger?"rgba(255,107,107,0.8)":purple?"rgba(124,92,191,0.8)":disabled?"#3a2a5a":GOLD;
  return(
    <button onClick={onClick} disabled={disabled} style={{background:bg,color:cl,border:`1.5px solid ${bd}`,borderRadius:30,padding:sm?"8px 18px":"12px 26px",fontSize:sm?12:14,fontFamily:"Palatino Linotype,Palatino,serif",fontWeight:700,cursor:disabled?"not-allowed":"pointer",letterSpacing:0.8,transition:"all 0.25s",animation:(!disabled&&!outline&&!danger&&!purple)?"glow 2.5s infinite":"none",opacity:disabled?0.5:1,width:full?"100%":"auto"}}>
      {children}
    </button>
  );
}
function Box({children,style}){return <div style={{background:"rgba(20,8,40,0.88)",border:"1px solid rgba(201,168,76,0.32)",borderRadius:14,padding:18,backdropFilter:"blur(10px)",boxShadow:"0 6px 28px rgba(0,0,0,0.4)",...style}}>{children}</div>;}
function Lbl({children,style}){return <div style={{color:GOLD,fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:8,...style}}>{children}</div>;}
function Div(){return <div style={{width:48,height:1,background:`linear-gradient(90deg,transparent,${GOLD},transparent)`,margin:"9px auto"}}/>;}
function Dots({step,total}){return <div style={{display:"flex",justifyContent:"center",gap:7,marginBottom:14}}>{Array.from({length:total},(_,i)=><div key={i} style={{width:i===step-1?22:7,height:7,borderRadius:4,background:i<step?GOLD:i===step-1?GOLD:"rgba(201,168,76,0.15)",transition:"all 0.4s"}}/>)}</div>;}
function Spin({label}){
  const [d,setD]=useState("");
  useEffect(()=>{const t=setInterval(()=>setD(x=>x.length>=3?"":x+"."),400);return()=>clearInterval(t);},[]);
  return(
    <div style={{textAlign:"center",padding:"30px 0"}}>
      <div style={{fontSize:38,animation:"sp 3s linear infinite",marginBottom:12}}>✦</div>
      <div style={{color:GOLD,fontFamily:"Palatino Linotype,serif",fontSize:16,marginBottom:6}}>{label||"Reading the cards"}{d}</div>
      <div style={{color:CREAM,fontSize:12,opacity:0.5}}>Channelling ancient wisdom...</div>
      <div style={{marginTop:18,display:"flex",justifyContent:"center",gap:7}}>
        {[0,1,2].map(i=><div key={i} style={{width:9,height:9,borderRadius:"50%",background:GOLD,animation:`pu 1.2s ${i*0.2}s infinite`}}/>)}
      </div>
    </div>
  );
}

// ── JOURNEY NAV ───────────────────────────────────────────────────
function Nav({session,cur,onGo}){
  return(
    <div style={{background:"rgba(6,2,15,0.97)",borderBottom:"1px solid rgba(201,168,76,0.15)",padding:"9px 14px",display:"flex",gap:5,overflowX:"auto",WebkitOverflowScrolling:"touch",flexShrink:0,scrollbarWidth:"none"}}>
      {DECKS.map((d,i)=>{
        const done=!!session.deckResults[d.id];
        const active=i===cur;
        return(
          <button key={d.id} onClick={()=>done&&onGo(i)} style={{background:active?"rgba(201,168,76,0.18)":"transparent",border:`1px solid ${active?GOLD:done?"rgba(201,168,76,0.4)":"rgba(201,168,76,0.1)"}`,borderRadius:20,padding:"5px 11px",cursor:done?"pointer":"default",color:active?GOLD:done?CREAM:"rgba(245,230,200,0.28)",fontSize:10,fontFamily:"Palatino Linotype,serif",whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:4,transition:"all 0.2s",flexShrink:0}}>
            <span>{d.emoji}</span><span>{done&&!active?"✓ ":""}{d.subtitle}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── UPLOAD SLOT ───────────────────────────────────────────────────
function UploadSlot({card,value,onChange,deckLight,deckColor}){
  const uid=card.id;
  const [open,setOpen]=useState(false);
  function handleFile(e){
    const f=e.target.files?.[0];if(!f)return;e.target.value="";
    const r=new FileReader();r.onload=ev=>{onChange(ev.target.result);setOpen(false);};r.readAsDataURL(f);
  }
  const obtn={background:`${deckColor}88`,border:`1.5px solid ${deckLight}55`,borderRadius:10,padding:"11px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:11,transition:"all 0.2s",fontFamily:"inherit",width:"100%",textAlign:"left"};
  return(
    <div style={{marginBottom:16,animation:"up 0.3s ease both"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
        <div style={{width:27,height:27,borderRadius:"50%",background:value?`${deckColor}cc`:"rgba(201,168,76,0.12)",border:`1.5px solid ${value?deckLight:"rgba(201,168,76,0.28)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:value?deckLight:GOLD,fontWeight:700,flexShrink:0}}>
          {value?"✓":card.label.replace("Card ","").replace("Planet Card","P").replace("Zodiac Card","Z").replace("House Card","H")}
        </div>
        <div>
          <div style={{color:value?deckLight:GOLD,fontSize:12,fontWeight:700}}>{card.label} — {card.role}</div>
          <div style={{color:CREAM,fontSize:11,opacity:0.55}}>{card.desc}</div>
        </div>
      </div>
      {value?(
        <div style={{display:"flex",gap:12,alignItems:"flex-start",animation:"fi 0.3s ease"}}>
          <div style={{position:"relative",flexShrink:0}}>
            <img src={value} alt={card.role} style={{width:88,height:128,objectFit:"cover",borderRadius:10,border:`2.5px solid ${deckLight}88`,boxShadow:`0 4px 20px ${deckColor}aa`}}/>
            <div style={{position:"absolute",bottom:-5,left:"50%",transform:"translateX(-50%)",background:deckColor,border:`1px solid ${deckLight}77`,borderRadius:10,padding:"2px 8px",color:deckLight,fontSize:9,fontWeight:700,whiteSpace:"nowrap"}}>✓ Uploaded</div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:7,paddingTop:2,flex:1}}>
            <div style={{color:CREAM,fontSize:10,opacity:0.5,marginBottom:1}}>Replace card:</div>
            <label htmlFor={`rc-${uid}`} style={{background:"rgba(201,168,76,0.09)",border:"1px solid rgba(201,168,76,0.3)",borderRadius:20,padding:"7px 13px",cursor:"pointer",color:CREAM,fontSize:11,display:"flex",alignItems:"center",gap:6,userSelect:"none"}}>📷 Retake Photo</label>
            <input id={`rc-${uid}`} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={handleFile}/>
            <label htmlFor={`rg-${uid}`} style={{background:"rgba(201,168,76,0.09)",border:"1px solid rgba(201,168,76,0.3)",borderRadius:20,padding:"7px 13px",cursor:"pointer",color:CREAM,fontSize:11,display:"flex",alignItems:"center",gap:6,userSelect:"none"}}>🖼 Choose Gallery</label>
            <input id={`rg-${uid}`} type="file" accept="image/*" style={{display:"none"}} onChange={handleFile}/>
            <button onClick={()=>onChange(null)} style={{background:"rgba(180,30,30,0.14)",border:"1px solid rgba(255,80,80,0.26)",borderRadius:20,padding:"7px 13px",cursor:"pointer",color:"#ff9090",fontSize:11,display:"flex",alignItems:"center",gap:6,fontFamily:"inherit"}}>🗑 Remove</button>
          </div>
        </div>
      ):(
        !open?(
          <div onClick={()=>setOpen(true)} style={{height:90,borderRadius:12,border:"2px dashed rgba(201,168,76,0.28)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",background:"rgba(201,168,76,0.03)",gap:5}}>
            <div style={{fontSize:24}}>📷</div>
            <div style={{color:CREAM,fontSize:12,opacity:0.55}}>Tap to upload {card.label}</div>
          </div>
        ):(
          <div style={{background:"rgba(10,3,24,0.98)",border:"1px solid rgba(201,168,76,0.35)",borderRadius:12,padding:14,animation:"fi 0.2s ease"}}>
            <div style={{color:GOLD,fontSize:12,fontWeight:700,marginBottom:11}}>How to add {card.label}:</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              <label htmlFor={`c-${uid}`} style={obtn}><span style={{fontSize:22}}>📷</span><div><div style={{color:deckLight,fontSize:13,fontWeight:700}}>Open Camera</div><div style={{color:CREAM,fontSize:11,opacity:0.6}}>Take a photo of your card now</div></div></label>
              <input id={`c-${uid}`} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={handleFile}/>
              <label htmlFor={`g-${uid}`} style={obtn}><span style={{fontSize:22}}>🖼</span><div><div style={{color:deckLight,fontSize:13,fontWeight:700}}>Browse Gallery</div><div style={{color:CREAM,fontSize:11,opacity:0.6}}>Choose from your photo library</div></div></label>
              <input id={`g-${uid}`} type="file" accept="image/*" style={{display:"none"}} onChange={handleFile}/>
              <button onClick={()=>setOpen(false)} style={{background:"transparent",border:"none",color:"rgba(245,230,200,0.3)",fontSize:12,cursor:"pointer",padding:"4px",fontFamily:"inherit"}}>✕ Cancel</button>
            </div>
          </div>
        )
      )}
    </div>
  );
}

// ── CARD RESULT BLOCK ─────────────────────────────────────────────
function CardBlock({cd,meta,deckLight,deckColor,idx}){
  const isErr=cd.error===true;
  return(
    <div style={{background:isErr?"rgba(180,30,30,0.1)":`linear-gradient(135deg,${deckColor}88,rgba(20,8,40,0.92))`,border:isErr?"1.5px solid rgba(255,80,80,0.5)":`1.5px solid ${deckLight}44`,borderRadius:14,padding:"18px 16px",marginBottom:16,animation:"up 0.4s ease both"}}>
      {isErr?(
        <div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
            <span style={{fontSize:22}}>⚠️</span>
            <div>
              <div style={{color:"#ff9090",fontSize:16,fontWeight:700,fontFamily:"Palatino Linotype,serif"}}>{meta?.label} — Could Not Be Read</div>
              <div style={{color:"#ffaa88",fontSize:11,marginTop:2}}>{meta?.role}</div>
            </div>
          </div>
          <div style={{background:"rgba(255,80,80,0.08)",border:"1px solid rgba(255,80,80,0.2)",borderRadius:9,padding:"10px 13px",marginBottom:10}}>
            <div style={{color:"#ff9090",fontSize:12,fontWeight:700,marginBottom:4}}>Problem:</div>
            <div style={{color:CREAM,fontSize:12,lineHeight:1.6,opacity:0.85}}>{cd.errorReason||"Card image was unclear, too dark, or the card name could not be identified."}</div>
          </div>
          <div style={{color:"#ffcc88",fontSize:12,lineHeight:1.6}}>👉 Reset this step and re-upload a clearer photo of <strong style={{color:"#ffaa44"}}>{meta?.label}</strong>. Make sure the card name is clearly visible, well-lit and in focus.</div>
        </div>
      ):(
        <div>
          {/* Card number badge */}
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
            <div style={{width:32,height:32,borderRadius:"50%",background:`${deckColor}cc`,border:`2px solid ${deckLight}`,display:"flex",alignItems:"center",justifyContent:"center",color:deckLight,fontSize:13,fontWeight:700,flexShrink:0}}>{idx+1}</div>
            <div style={{color:CREAM,fontSize:11,opacity:0.55,letterSpacing:0.5}}>{meta?.label} — {meta?.role}</div>
          </div>
          {/* Card name — bold large */}
          <div style={{fontSize:22,fontWeight:700,fontFamily:"Palatino Linotype,serif",color:deckLight,lineHeight:1.2,marginBottom:12,textShadow:`0 0 20px ${deckLight}55`,letterSpacing:0.5}}>
            {cd.cardName}
          </div>
          {/* Keywords — small italic pills */}
          {cd.keywords&&cd.keywords.length>0&&(
            <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>
              {cd.keywords.map((kw,ki)=>(
                <span key={ki} style={{background:`${deckLight}18`,border:`1px solid ${deckLight}44`,borderRadius:20,padding:"3px 10px",color:deckLight,fontSize:11,fontStyle:"italic",letterSpacing:0.3}}>{kw}</span>
              ))}
            </div>
          )}
          {/* Meaning related to question */}
          <div style={{borderLeft:`3px solid ${deckLight}55`,paddingLeft:12}}>
            <div style={{color:GOLD,fontSize:10,fontWeight:700,letterSpacing:1.5,marginBottom:6,textTransform:"uppercase"}}>Meaning for your question</div>
            <p style={{color:CREAM,fontSize:13,lineHeight:1.8,margin:0,opacity:0.92}}>{cd.meaning}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── SUGGESTED ANSWER ──────────────────────────────────────────────
function Answer({text,deck}){
  const paras=text.split(/\n+/).filter(p=>p.trim());
  return(
    <div style={{background:`linear-gradient(135deg,${deck.color}cc,rgba(20,8,40,0.96))`,border:`2px solid ${deck.light}55`,borderRadius:16,padding:"20px 18px",boxShadow:`0 8px 32px ${deck.color}66`}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
        <span style={{fontSize:24}}>{deck.emoji}</span>
        <div>
          <div style={{color:GOLD,fontSize:16,fontWeight:700,fontFamily:"Palatino Linotype,serif"}}>Suggested Reading Answer</div>
          <div style={{color:CREAM,fontSize:11,opacity:0.55,marginTop:2}}>Based on all {deck.cards.length} cards for your {deck.subtitle.toLowerCase()} reading</div>
        </div>
      </div>
      <div style={{width:"100%",height:1,background:`linear-gradient(90deg,transparent,${deck.light}55,transparent)`,marginBottom:14}}/>
      {paras.map((p,i)=><p key={i} style={{color:CREAM,fontSize:13,lineHeight:1.85,margin:i>0?"12px 0 0":"0",fontStyle:i===paras.length-1?"italic":"normal",opacity:i===paras.length-1?0.85:0.95}}>{p}</p>)}
    </div>
  );
}

// ── ORACLE API ────────────────────────────────────────────────────
async function callOracle(deck,session,images,demo=false){
  const area=AREAS.find(a=>a.id===session.lifeArea);

  // Build image content for vision
  const cardImages=[];
  if(!demo){
    deck.cards.forEach((c,i)=>{
      const img=images[c.id];
      if(img&&img.startsWith("data:")){
        const match=img.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
        if(match){
          cardImages.push({
            cardIndex:i,
            label:c.label,
            role:c.role,
            desc:c.desc,
            mediaType:match[1],
            data:match[2]
          });
        }
      }
    });
  }

  // Build card descriptions
  const cardLines=deck.cards.map((c,i)=>{
    const hasImg=!demo&&cardImages.find(ci=>ci.cardIndex===i);
    return `${c.label} (${c.role}): ${hasImg?"Image provided — identify exact card name from image":"No image — invent a fitting mystical card name"}\nRole: ${c.desc}`;
  }).join("\n\n");

  const prompt=`You are an expert mystical card reader interpreting a ${deck.name} reading.
Life area: ${area?.label}
Client question: "${session.question}"
Deck purpose: ${deck.purpose}

Cards:
${cardLines}

Return ONLY valid JSON, no markdown fences, no extra text:
{"cards":[{"cardName":"exact card name from image or invented mystical name","keywords":["word1","word2","word3","word4"],"meaning":"2-3 sentences interpreting this card specifically for the client question. Be compassionate and empowering.","error":false,"errorReason":""}],"suggestedAnswer":"3-4 paragraph narrative weaving all cards together answering the client question directly. Warm and empowering. Only include when all cards are ok."}

Rules: If image too dark/blurry/unreadable set error:true with errorReason. Return ONLY raw JSON.`;

  // Call our secure Netlify function — key never touches the browser
  const res=await fetch(ORACLE_ENDPOINT,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      prompt,
      cardImages,
      demo
    })
  });

  if(!res.ok){
    const errData=await res.json().catch(()=>({}));
    const msg=errData?.error||`HTTP ${res.status}`;
    if(res.status===401||msg.includes("key")) throw new Error("NOKEY");
    if(res.status===429) throw new Error("RATELIMIT");
    if(res.status===500&&msg.includes("Missing")) throw new Error("NOKEY");
    throw new Error(`API_ERROR: ${msg}`);
  }

  const data=await res.json();
  if(data.error) throw new Error(`ORACLE_ERROR: ${data.error}`);

  const raw=data.result||"{}";
  const clean=raw.replace(/^```(?:json)?\s*/,"").replace(/\s*```$/,"").trim();

  try{
    return JSON.parse(clean);
  }catch(e){
    throw new Error("PARSE_ERROR");
  }
}


// ── SECTION 3: DECK SCREEN ────────────────────────────────────────
function DeckScreen({session,deckIdx,onUpdate,onNext,onGoTo,onClose}){
  const deck=DECKS[deckIdx];
  const existing=session.deckResults[deck.id];
  const exImg=session.deckImages?.[deck.id]||{};
  const exData=session.deckCardData?.[deck.id]||null;

  const [images,setImages]=useState(exImg);
  const [phase,setPhase]=useState(existing?"done":"upload");
  const [cards,setCards]=useState(exData?.cards||null);
  const [ans,setAns]=useState(exData?.suggestedAnswer||null);
  const [loadMsg,setLoadMsg]=useState("");
  const [resetConfirm,setResetConfirm]=useState(false);
  const [resetOk,setResetOk]=useState("");
  const [err,setErr]=useState("");

  const area=AREAS.find(a=>a.id===session.lifeArea);
  const uploaded=deck.cards.filter(c=>images[c.id]).length;
  const allUp=deck.cards.every(c=>images[c.id]);
  const isLast=deckIdx===DECKS.length-1;
  const allDone=DECKS.every(d=>session.deckResults[d.id]);
  const hasErr=cards&&cards.some(c=>c.error);
  const errCards=cards?cards.map((c,i)=>({...c,idx:i})).filter(c=>c.error):[];
  const allOk=cards&&cards.every(c=>!c.error);
  const canGo=allOk&&ans&&ans.length>10;

  async function read(demo=false){
    setPhase("loading"); setErr("");
    setLoadMsg(`Interpreting your ${deck.subtitle} cards...`);
    try{
      const r=await callOracle(deck,session,images,demo);
      if(!r||!r.cards) throw new Error("Empty response from oracle");
      setCards(r.cards); setAns(r.suggestedAnswer||"");
      setPhase("done");
      const summary=r.cards.map((c,i)=>`${deck.cards[i]?.role}: ${c.error?"[unread]":c.cardName}`).join(" | ");
      onUpdate(deck.id,summary,images,{cards:r.cards,suggestedAnswer:r.suggestedAnswer||""});
    }catch(e){
      const m=e.message||"";
      let display="";
      if(m==="NOKEY") display="🔑 API key missing or invalid. Open App.js and paste your key from console.anthropic.com on line 7. Or use Demo Mode below.";
      else if(m.startsWith("HTTP401")) display="🔑 Invalid API key (401). Check your key at console.anthropic.com — must start with sk-ant- with no extra spaces or characters.";
      else if(m.startsWith("HTTP429")) display="⏳ Too many requests (429). Wait 30 seconds then try again, or use Demo Mode.";
      else if(m.startsWith("HTTP400")) display="📋 Bad request (400). Try using Demo Mode, or retake card photos with better lighting and ensure the full card is visible.";
      else if(m.startsWith("HTTP5")) display="🌐 Anthropic server issue. Wait a moment and try again.";
      else if(m.startsWith("PARSE")) display="📋 Oracle response unclear. Please try again.";
      else if(m.includes("fetch")||m.includes("network")||m.includes("Failed")) display="🌐 Network error. Check your internet connection and try again.";
      else display=`Oracle issue: ${m}. Try again or use Demo Mode.`;
      setErr(display); setPhase("upload");
    }
  }

  function reset(){
    setImages({});setCards(null);setAns(null);
    setPhase("upload");setResetConfirm(false);setErr("");
    setResetOk("✓ Step reset. Please re-upload your cards.");
    onUpdate(deck.id,null,{},null);
    setTimeout(()=>setResetOk(""),3500);
  }

  return(
    <div style={{display:"flex",flexDirection:"column",minHeight:"100vh"}}>
      <Nav session={session} cur={deckIdx} onGo={onGoTo}/>
      <div style={{padding:"18px 16px 48px",flex:1}}>

        {/* Header */}
        <div style={{textAlign:"center",marginBottom:16}}>
          <Dots step={3} total={4}/>
          <div style={{fontSize:42,animation:"float 3s infinite",display:"inline-block",marginBottom:5}}>{deck.emoji}</div>
          <div style={{color:deck.light,fontSize:10,fontWeight:700,letterSpacing:3,textTransform:"uppercase",marginBottom:3}}>Step {deckIdx+1} of 5 — Section 3</div>
          <h2 style={{fontFamily:"Palatino Linotype,serif",color:GOLD,fontSize:20,margin:"0 0 2px"}}>{deck.name}</h2>
          <div style={{color:CREAM,fontSize:12,opacity:0.6}}>{deck.subtitle}</div>
          <Div/>
        </div>

        {/* Progress bar */}
        <div style={{marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
            <span style={{color:CREAM,fontSize:10,opacity:0.4}}>Reading progress</span>
            <span style={{color:GOLD,fontSize:10,fontWeight:700}}>{deckIdx+1} / {DECKS.length}</span>
          </div>
          <div style={{height:4,background:"rgba(201,168,76,0.08)",borderRadius:4}}>
            <div style={{height:"100%",borderRadius:4,background:`linear-gradient(90deg,${GOLD},${deck.light})`,width:`${((deckIdx+1)/DECKS.length)*100}%`,transition:"width 0.5s"}}/>
          </div>
        </div>

        {/* Question reminder */}
        <Box style={{marginBottom:12,background:`${area?.color||"#1a0a30"}88`}}>
          <Lbl style={{marginBottom:4}}>{area?.emoji} YOUR QUESTION</Lbl>
          <div style={{color:CREAM,fontSize:12,fontStyle:"italic",lineHeight:1.6}}>"{session.question}"</div>
        </Box>

        {/* Purpose */}
        <Box style={{marginBottom:12}}>
          <Lbl>✦ PURPOSE OF THIS DECK</Lbl>
          <p style={{color:CREAM,fontSize:12,lineHeight:1.7,margin:0}}>{deck.purpose}</p>
        </Box>

        {/* Instructions */}
        <Box style={{marginBottom:18,border:`1px solid ${deck.light}33`,background:`${deck.color}55`}}>
          <Lbl style={{color:deck.light}}>✦ INSTRUCTIONS</Lbl>
          <p style={{color:CREAM,fontSize:12,lineHeight:1.75,margin:0}}>{deck.instruction}</p>
        </Box>

        {/* Status */}
        {resetOk&&<div style={{color:"#7CFC00",fontSize:12,textAlign:"center",marginBottom:12,padding:"8px 14px",background:"rgba(100,200,100,0.06)",border:"1px solid rgba(100,200,100,0.18)",borderRadius:9,animation:"fi 0.3s ease"}}>{resetOk}</div>}
        {err&&<div style={{color:"#ffaa44",fontSize:12,marginBottom:12,padding:"12px 14px",background:"rgba(255,140,0,0.08)",border:"1px solid rgba(255,140,0,0.3)",borderRadius:9,lineHeight:1.6}}>⚠ {err}</div>}

        {/* UPLOAD PHASE */}
        {phase==="upload"&&(
          <div>
            <div style={{background:"rgba(201,168,76,0.05)",border:"1px solid rgba(201,168,76,0.18)",borderRadius:10,padding:"10px 13px",marginBottom:14,display:"flex",gap:10,alignItems:"flex-start"}}>
              <span style={{fontSize:17,flexShrink:0}}>📱</span>
              <div>
                <div style={{color:GOLD,fontSize:11,fontWeight:700,marginBottom:2}}>Camera & Gallery</div>
                <div style={{color:CREAM,fontSize:11,lineHeight:1.6,opacity:0.75}}>Camera and gallery work on your <b style={{color:GOLD}}>real phone browser</b> after deploying to Netlify. Use <b style={{color:GOLD}}>Demo Mode</b> to test the full flow here in Claude.</div>
              </div>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}>
              <Lbl style={{marginBottom:0}}>✦ UPLOAD YOUR {deck.cards.length} CARDS</Lbl>
              <div style={{color:CREAM,fontSize:10,opacity:0.45}}>{uploaded}/{deck.cards.length}</div>
            </div>
            <div style={{height:3,background:"rgba(201,168,76,0.08)",borderRadius:4,marginBottom:16}}>
              <div style={{height:"100%",borderRadius:4,background:GOLD,width:`${(uploaded/deck.cards.length)*100}%`,transition:"width 0.4s"}}/>
            </div>
            {deck.cards.map(card=>(
              <UploadSlot key={card.id} card={card} value={images[card.id]} deckLight={deck.light} deckColor={deck.color} onChange={img=>setImages(p=>({...p,[card.id]:img}))}/>
            ))}
            <div style={{display:"flex",flexDirection:"column",gap:10,alignItems:"center",marginTop:20}}>
              <Btn onClick={()=>read(false)} disabled={!allUp} full>
                {allUp?`✦ Interpret the ${deck.subtitle} Cards`:`Upload all ${deck.cards.length} cards to continue`}
              </Btn>
              {!allUp&&<div style={{color:CREAM,fontSize:10,opacity:0.35}}>{deck.cards.length-uploaded} more card{deck.cards.length-uploaded!==1?"s":""} needed</div>}
              <div style={{width:"100%",borderTop:"1px solid rgba(201,168,76,0.12)",paddingTop:12,marginTop:2,textAlign:"center"}}>
                <div style={{color:CREAM,fontSize:10,opacity:0.25,marginBottom:8}}>— OR TEST WITHOUT UPLOADING —</div>
                <Btn onClick={()=>read(true)} purple full>✦ Demo Mode — Read Without Uploading</Btn>
                <div style={{color:CREAM,fontSize:10,opacity:0.22,marginTop:6,lineHeight:1.5}}>AI generates a full reading. Upload real photos on your phone for actual card interpretations.</div>
              </div>
            </div>
          </div>
        )}

        {/* LOADING */}
        {phase==="loading"&&<Spin label={loadMsg}/>}

        {/* RESULTS PHASE */}
        {phase==="done"&&cards&&(
          <div>
            {/* Card previews */}
            {Object.values(images).some(Boolean)&&(
              <div style={{marginBottom:20}}>
                <Lbl>✦ CARDS DRAWN</Lbl>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {deck.cards.map((card,i)=>images[card.id]?(
                    <div key={card.id} style={{textAlign:"center",position:"relative"}}>
                      <img src={images[card.id]} alt={card.role} style={{width:64,height:94,objectFit:"cover",borderRadius:9,border:`2px solid ${cards[i]?.error?"#ff6b6b":deck.light+"55"}`,boxShadow:`0 3px 12px ${deck.color}88`,filter:cards[i]?.error?"grayscale(50%) brightness(0.7)":"none"}}/>
                      {cards[i]?.error&&<div style={{position:"absolute",top:2,right:2,width:18,height:18,borderRadius:"50%",background:"#ff4444",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"white",fontWeight:700}}>!</div>}
                      <div style={{color:cards[i]?.error?"#ff9090":CREAM,fontSize:8,opacity:0.6,marginTop:3,maxWidth:64,lineHeight:1.2}}>{card.role}</div>
                    </div>
                  ):null)}
                </div>
              </div>
            )}

            {/* Card interpretations */}
            <Lbl style={{marginBottom:14}}>✦ CARD INTERPRETATIONS</Lbl>
            {cards.map((cd,i)=><CardBlock key={i} cd={cd} meta={deck.cards[i]} deckLight={deck.light} deckColor={deck.color} idx={i}/>)}

            {/* Error summary */}
            {hasErr&&(
              <div style={{background:"rgba(180,30,30,0.1)",border:"1.5px solid rgba(255,80,80,0.32)",borderRadius:12,padding:"14px 16px",marginBottom:18,animation:"fi 0.3s ease"}}>
                <div style={{color:"#ff9090",fontSize:15,fontWeight:700,fontFamily:"Palatino Linotype,serif",marginBottom:7}}>⚠ {errCards.length} Card{errCards.length>1?"s":""} Could Not Be Read</div>
                <div style={{color:CREAM,fontSize:12,lineHeight:1.65,opacity:0.82,marginBottom:12}}>The following card{errCards.length>1?"s were":" was"} unclear or unreadable. You must reset this step and re-upload clearer photos before you can proceed.</div>
                {errCards.map((ec,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"flex-start",gap:8,padding:"6px 0",borderBottom:i<errCards.length-1?"1px solid rgba(255,80,80,0.12)":"none"}}>
                    <span style={{color:"#ff9090",fontSize:14,flexShrink:0}}>⚠</span>
                    <div><span style={{color:"#ffaa88",fontSize:12,fontWeight:700}}>{deck.cards[ec.idx]?.label} ({deck.cards[ec.idx]?.role})</span><div style={{color:CREAM,fontSize:11,opacity:0.65,marginTop:2}}>{ec.errorReason||"Unclear image — please retake with better lighting"}</div></div>
                  </div>
                ))}
                <div style={{marginTop:14}}><Btn onClick={()=>setResetConfirm(true)} danger full>↺ Reset & Re-upload Clearer Photos</Btn></div>
              </div>
            )}

            {/* Suggested answer */}
            {allOk&&ans&&ans.length>10&&(
              <div style={{marginBottom:22}}>
                <Lbl style={{marginBottom:12}}>✦ SUGGESTED ANSWER TO YOUR QUESTION</Lbl>
                <Answer text={ans} deck={deck}/>
              </div>
            )}

            {/* Action buttons */}
            <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:8}}>
              {!resetConfirm?(
                <button onClick={()=>setResetConfirm(true)} className="hg" style={{background:"transparent",border:"1px solid rgba(255,100,100,0.22)",borderRadius:30,padding:"9px 20px",cursor:"pointer",color:"rgba(255,150,150,0.65)",fontSize:12,fontFamily:"inherit",transition:"all 0.2s"}}>↺ Reset This Step & Re-upload Cards</button>
              ):(
                <div style={{background:"rgba(180,30,30,0.08)",border:"1px solid rgba(255,80,80,0.25)",borderRadius:12,padding:14,animation:"fi 0.2s ease"}}>
                  <div style={{color:"#ff9090",fontSize:13,fontFamily:"Palatino Linotype,serif",fontWeight:700,textAlign:"center",marginBottom:7}}>Reset this step?</div>
                  <p style={{color:CREAM,fontSize:11,opacity:0.6,textAlign:"center",margin:"0 0 12px",lineHeight:1.5}}>All uploaded card images and interpretations for this step will be cleared.</p>
                  <div style={{display:"flex",gap:8,justifyContent:"center"}}>
                    <Btn onClick={()=>setResetConfirm(false)} outline sm>Cancel</Btn>
                    <Btn onClick={reset} danger sm>Yes, Reset</Btn>
                  </div>
                </div>
              )}
              {!resetConfirm&&(
                canGo?(
                  isLast?(
                    allDone?<Btn onClick={onClose} full>✦ View Your Complete Reading Summary</Btn>:(
                      <div>
                        <div style={{color:"#ffaa44",fontSize:11,textAlign:"center",marginBottom:10,padding:"9px 12px",background:"rgba(255,150,50,0.05)",border:"1px solid rgba(255,150,50,0.18)",borderRadius:9}}>⚠ Complete all 5 deck steps before viewing the Summary</div>
                        <div style={{display:"flex",flexDirection:"column",gap:6}}>
                          {DECKS.map(d=>{const done=!!session.deckResults[d.id];return<div key={d.id} style={{display:"flex",alignItems:"center",gap:9,padding:"7px 12px",borderRadius:8,background:done?"rgba(100,200,100,0.05)":"rgba(255,100,100,0.05)",border:`1px solid ${done?"rgba(100,200,100,0.14)":"rgba(255,100,100,0.14)"}`}}><span style={{fontSize:13}}>{d.emoji}</span><span style={{color:done?"#7CFC00":"#ff9090",fontSize:11,flex:1}}>{d.subtitle}</span><span style={{fontSize:11}}>{done?"✓":"○"}</span></div>;})}
                        </div>
                      </div>
                    )
                  ):<Btn onClick={onNext} full>Continue to {DECKS[deckIdx+1]?.subtitle} {DECKS[deckIdx+1]?.emoji}</Btn>
                ):(
                  hasErr?(
                    <div style={{textAlign:"center",padding:"6px 0"}}>
                      <div style={{color:"#ff9090",fontSize:12,marginBottom:8}}>⚠ Fix the unreadable card{errCards.length>1?"s":""} above before you can proceed</div>
                      <Btn disabled full>Proceed (Fix Card Errors First)</Btn>
                    </div>
                  ):(
                    <div style={{textAlign:"center",padding:"6px 0",color:"#ffaa44",fontSize:12}}>Waiting for all cards to be successfully interpreted...</div>
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

// ── WELCOME ────────────────────────────────────────────────────────
function Welcome({onStart,onResume,has}){
  const keyMissing=false; // Key is server-side in Netlify function
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh",padding:"24px 20px",textAlign:"center"}}>
      <div style={{animation:"float 3s infinite",fontSize:66,marginBottom:6}}>🔮</div>
      <div style={{fontFamily:"Palatino Linotype,serif",fontSize:10,color:GOLD,letterSpacing:6,textTransform:"uppercase",marginBottom:5,opacity:0.7}}>The Sacred Reading</div>
      <h1 style={{fontFamily:"Palatino Linotype,serif",fontSize:30,color:GOLD,margin:"0 0 5px",lineHeight:1.2,textShadow:"0 0 28px rgba(201,168,76,0.4)"}}>Mystical Card<br/>Reader</h1>
      <Div/>
      <p style={{color:CREAM,fontSize:13,lineHeight:1.7,maxWidth:300,opacity:0.78,margin:"10px 0 22px"}}>A sacred 5-deck system revealing your current energy, root cause, cosmic influences, action plan and most likely outcome.</p>
      {keyMissing&&(
        <div style={{background:"rgba(180,80,0,0.2)",border:"1px solid rgba(255,140,0,0.4)",borderRadius:12,padding:"12px 16px",marginBottom:18,maxWidth:320,textAlign:"left"}}>
          <div style={{color:"#FFD180",fontSize:12,fontWeight:700,marginBottom:5}}>🔑 API Key Needed for Live Readings</div>
          <div style={{color:"#FFE0B2",fontSize:11,lineHeight:1.6}}>Open <b>src/App.js</b> on GitHub and paste your Anthropic API key on <b>line 7</b>. Get a free key at <b>console.anthropic.com</b>.<br/><br/>Without a key, use <b>Demo Mode</b> on each step to test the full reading flow.</div>
        </div>
      )}
      <div style={{display:"flex",gap:7,marginBottom:26,flexWrap:"wrap",justifyContent:"center"}}>
        {DECKS.map(d=><div key={d.id} style={{background:`${d.color}88`,border:`1px solid ${d.light}33`,borderRadius:20,padding:"5px 11px",fontSize:10,color:CREAM,display:"flex",alignItems:"center",gap:5}}><span>{d.emoji}</span><span>{d.subtitle}</span></div>)}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:11,width:"100%",maxWidth:260}}>
        <Btn onClick={onStart} full>✦ Begin New Session ✦</Btn>
        {has&&<Btn onClick={onResume} outline full>↩ Resume Session</Btn>}
      </div>
    </div>
  );
}

// ── SECTION 1 ──────────────────────────────────────────────────────
function S1({onNext,onSkip}){
  return(
    <div style={{padding:"20px 16px",animation:"up 0.4s ease"}}>
      <Dots step={1} total={4}/>
      <div style={{textAlign:"center",marginBottom:16}}>
        <div style={{fontSize:36,marginBottom:5}}>🌙</div>
        <div style={{fontFamily:"Palatino Linotype,serif",color:GOLD,fontSize:10,letterSpacing:4,textTransform:"uppercase",marginBottom:4}}>Section 1</div>
        <h2 style={{fontFamily:"Palatino Linotype,serif",color:GOLD,fontSize:21,margin:0}}>Welcome & Setting Expectations</h2>
        <Div/>
        <p style={{color:CREAM,fontSize:12,opacity:0.6,margin:0}}>Building trust before the sacred reading begins</p>
      </div>
      <Box style={{marginBottom:13}}><Lbl>✦ OPENING SCRIPT</Lbl><p style={{color:CREAM,fontSize:13,lineHeight:1.8,fontStyle:"italic",margin:0}}>"Thank you for trusting me with your questions today. I use a powerful system of 5 specialist decks — each chosen for a specific role. Think of them as a council of 5 advisors, each with a different area of expertise."</p></Box>
      <div style={{marginBottom:13}}>
        <Lbl>✦ THE 5-DECK COUNCIL</Lbl>
        {DECKS.map((d,i)=><div key={d.id} style={{display:"flex",gap:10,padding:"11px 13px",marginBottom:7,background:`${d.color}66`,border:`1px solid ${d.light}33`,borderRadius:12,animation:`up 0.3s ${i*0.07}s ease both`}}><span style={{fontSize:21,flexShrink:0}}>{d.emoji}</span><div><div style={{color:d.light,fontSize:12,fontWeight:700,fontFamily:"Palatino Linotype,serif"}}>{d.name}</div><div style={{color:GOLD,fontSize:9,marginBottom:2}}>{d.subtitle}</div><div style={{color:CREAM,fontSize:11,opacity:0.78,lineHeight:1.5}}>{d.purpose}</div></div></div>)}
      </div>
      <Box style={{marginBottom:13}}>
        <Lbl>✦ THE READING JOURNEY</Lbl>
        <div style={{display:"flex",alignItems:"center",gap:4,flexWrap:"wrap",justifyContent:"center"}}>
          {["Current Energy","Root Cause","Influences","Action Plan","Outcome"].map((s,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:4}}><div style={{background:"rgba(201,168,76,0.09)",border:"1px solid rgba(201,168,76,0.22)",borderRadius:20,padding:"3px 9px",fontSize:10,color:CREAM}}>{s}</div>{i<4&&<span style={{color:GOLD,opacity:0.36,fontSize:11}}>→</span>}</div>)}
        </div>
        <p style={{color:CREAM,fontSize:11,opacity:0.55,margin:"10px 0 0",textAlign:"center",lineHeight:1.6}}>A structured mirror — not fortune-telling. Clarity, root cause and an action plan.</p>
      </Box>
      <Box style={{marginBottom:22}}>
        <Lbl>✦ IMPORTANT TO KNOW</Lbl>
        {["There are no bad cards — every card carries wisdom","The future shown is a possibility, not a certainty","You may shuffle any deck yourself if you wish","You will leave with clarity, root cause, and a concrete plan"].map((item,i)=><div key={i} style={{display:"flex",gap:9,marginBottom:7,alignItems:"flex-start"}}><span style={{color:GOLD,flexShrink:0,marginTop:1}}>✦</span><span style={{color:CREAM,fontSize:12,lineHeight:1.6}}>{item}</span></div>)}
      </Box>
      <div style={{display:"flex",gap:10,justifyContent:"center"}}>
        <Btn onClick={onSkip} outline sm>Skip →</Btn>
        <Btn onClick={onNext}>Continue to Intake ✦</Btn>
      </div>
    </div>
  );
}

// ── SECTION 2 ──────────────────────────────────────────────────────
function S2({session,onUpdate,onNext}){
  const [area,setArea]=useState(session.lifeArea||null);
  const [q,setQ]=useState(session.question||"");
  const [e,setE]=useState("");
  const aData=AREAS.find(a=>a.id===area);
  const valid=q.trim().length>=15;
  function go(){
    if(!area){setE("Please select an area of life");return;}
    if(!valid){setE("Please describe your question in at least 15 characters");return;}
    onUpdate({lifeArea:area,question:q.trim()});onNext();
  }
  return(
    <div style={{padding:"20px 16px",animation:"up 0.4s ease"}}>
      <Dots step={2} total={4}/>
      <div style={{textAlign:"center",marginBottom:16}}>
        <div style={{fontSize:36,marginBottom:5}}>🌿</div>
        <div style={{fontFamily:"Palatino Linotype,serif",color:GOLD,fontSize:10,letterSpacing:4,textTransform:"uppercase",marginBottom:4}}>Section 2</div>
        <h2 style={{fontFamily:"Palatino Linotype,serif",color:GOLD,fontSize:21,margin:0}}>Your Sacred Question</h2>
        <Div/>
        <p style={{color:CREAM,fontSize:12,opacity:0.6,margin:0}}>Choose one area of life and describe your question</p>
      </div>
      <div style={{marginBottom:18}}>
        <Lbl>✦ STEP 1: Choose Your Area of Life</Lbl>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
          {AREAS.map(a=><button key={a.id} className="ha" onClick={()=>{setArea(a.id);setE("");}} style={{background:area===a.id?`${a.color}cc`:`${a.color}44`,border:`1.5px solid ${area===a.id?GOLD:`${a.color}77`}`,borderRadius:11,padding:"11px 8px",cursor:"pointer",display:"flex",alignItems:"center",gap:7,transition:"all 0.2s",boxShadow:area===a.id?`0 3px 14px ${a.color}55`:"none"}}><span style={{fontSize:18}}>{a.emoji}</span><span style={{color:area===a.id?GOLD:CREAM,fontSize:11,fontFamily:"Palatino Linotype,serif",fontWeight:area===a.id?700:400,textAlign:"left",lineHeight:1.3}}>{a.label}</span></button>)}
        </div>
      </div>
      <div style={{marginBottom:18}}>
        <Lbl>✦ STEP 2: Describe Your Question</Lbl>
        <textarea value={q} onChange={ev=>{setQ(ev.target.value);setE("");}} placeholder="Describe your situation and question in your own words..." style={{width:"100%",minHeight:95,background:"rgba(20,8,40,0.82)",border:`1.5px solid ${q.length>0&&valid?GOLD:"rgba(201,168,76,0.25)"}`,borderRadius:11,padding:13,color:CREAM,fontSize:13,lineHeight:1.6,fontFamily:"Palatino Linotype,serif",resize:"none",outline:"none",boxSizing:"border-box",transition:"border 0.2s"}}/>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
          <span style={{color:valid?"#7CFC00":"rgba(245,230,200,0.35)",fontSize:11}}>{valid?"✓ Ready to proceed":`${Math.max(0,15-q.trim().length)} more characters needed`}</span>
          <span style={{color:"rgba(245,230,200,0.3)",fontSize:11}}>{q.length}</span>
        </div>
      </div>
      {aData&&(
        <Box style={{marginBottom:18}}>
          <Lbl>{aData.emoji} EXAMPLE QUESTIONS — {aData.label.toUpperCase()}</Lbl>
          <div style={{display:"flex",flexDirection:"column",gap:5}}>
            {aData.q.map((qs,i)=><button key={i} className="hq" onClick={()=>{setQ(qs);setE("");}} style={{background:"rgba(201,168,76,0.05)",border:"1px solid rgba(201,168,76,0.16)",borderRadius:8,padding:"7px 11px",cursor:"pointer",textAlign:"left",color:CREAM,fontSize:12,lineHeight:1.5,transition:"all 0.15s",fontFamily:"inherit"}}><span style={{color:GOLD,marginRight:5}}>›</span>{qs}</button>)}
          </div>
          <div style={{color:CREAM,fontSize:10,opacity:0.38,marginTop:7}}>Tap any example to use it, or write your own above</div>
        </Box>
      )}
      {e&&<div style={{color:"#FF6B6B",fontSize:12,textAlign:"center",marginBottom:11,padding:"8px 14px",background:"rgba(255,100,100,0.07)",border:"1px solid rgba(255,100,100,0.25)",borderRadius:8}}>⚠ {e}</div>}
      <div style={{textAlign:"center"}}><Btn onClick={go} disabled={!area||!valid}>Begin the Reading ✦</Btn></div>
    </div>
  );
}

// ── SECTION 4: CLOSING ─────────────────────────────────────────────
function S4({session,onNew}){
  const [loading,setLoading]=useState(false);
  const [summary,setSummary]=useState(session.summary||null);
  const area=AREAS.find(a=>a.id===session.lifeArea);

  useEffect(()=>{if(!summary)gen();},[]);

  async function gen(){
    setLoading(true);
    try{
      const text=await callSummary(session);
      setSummary(text||fallback());
    }catch(e){setSummary(fallback());}
    setLoading(false);
  }

  function fallback(){
    return `Let me bring everything together into one clear narrative for you.\n\nYour Crystal Reading revealed the emotional truth you are carrying right now. The Egyptian Oracle uncovered the deeper soul lesson beneath your challenge. Your Astrology Cards illuminated the cosmic forces and timing surrounding your situation. The Magic Oracle provided concrete steps and intentions to take forward. And the Mystical Tarot mapped your most likely path ahead.\n\nRemember: you are in complete control. These cards show probability, not destiny — you are always the author of your own story. Do not seek another reading until you have completed at least ONE action from your plan. Readings without action become avoidance, not growth.\n\nThank you sincerely for the trust you placed in this sacred space today. The work you do on yourself ripples outward into everyone around you. Go well. ✦`;
  }

  return(
    <div style={{padding:"20px 16px 36px",animation:"up 0.4s ease"}}>
      <Dots step={4} total={4}/>
      <div style={{textAlign:"center",marginBottom:20}}>
        <div style={{fontSize:44,animation:"float 3s infinite",marginBottom:6}}>✦</div>
        <div style={{fontFamily:"Palatino Linotype,serif",color:GOLD,fontSize:10,letterSpacing:4,textTransform:"uppercase",marginBottom:5}}>Section 4 — Closing</div>
        <h2 style={{fontFamily:"Palatino Linotype,serif",color:GOLD,fontSize:21,margin:0}}>Your Complete Reading</h2>
        <Div/>
        <p style={{color:CREAM,fontSize:12,opacity:0.6,margin:0}}>The 5-deck narrative woven into one clear message</p>
      </div>
      <Box style={{marginBottom:14,background:`${area?.color||"#1a0a30"}88`}}>
        <Lbl style={{marginBottom:4}}>{area?.emoji} READING FOR</Lbl>
        <div style={{color:CREAM,fontSize:12,fontStyle:"italic",lineHeight:1.6}}>"{session.question}"</div>
      </Box>
      <div style={{marginBottom:18}}>
        <Lbl>✦ YOUR 5-DECK JOURNEY</Lbl>
        {DECKS.map((d,i)=>{
          const cd=session.deckCardData?.[d.id];
          const names=cd?.cards?.filter(c=>!c.error).map(c=>c.cardName).join(" · ")||"";
          return(
            <div key={d.id} style={{background:`${d.color}66`,border:`1px solid ${d.light}33`,borderRadius:11,padding:"10px 13px",marginBottom:7,animation:`up 0.3s ${i*0.08}s ease both`}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:names?5:0}}>
                <span style={{fontSize:17,flexShrink:0}}>{d.emoji}</span>
                <div style={{color:d.light,fontSize:10,fontWeight:700,letterSpacing:0.5,flex:1}}>{d.subtitle.toUpperCase()} — {d.name}</div>
                <div style={{color:session.deckResults[d.id]?"#7CFC00":"#ff9090",fontSize:11}}>{session.deckResults[d.id]?"✓":"○"}</div>
              </div>
              {names&&<div style={{color:GOLD,fontSize:11,fontStyle:"italic",paddingLeft:25,lineHeight:1.5}}>{names}</div>}
            </div>
          );
        })}
      </div>
      <Box style={{marginBottom:20,border:`1px solid ${GOLD}44`}}>
        <Lbl>✦ THE ORACLE'S FINAL NARRATIVE</Lbl>
        {loading?<Spin label="Weaving your complete reading narrative"/>:<div style={{color:CREAM,fontSize:13,lineHeight:1.85,fontStyle:"italic",whiteSpace:"pre-wrap"}}>{summary}</div>}
      </Box>
      <Box style={{marginBottom:22,background:"rgba(201,168,76,0.05)",border:`1px solid ${GOLD}28`}}>
        <Lbl>✦ BEFORE YOU GO</Lbl>
        {[{n:"1",t:"You are in control",b:"The cards show probability, not destiny. The action plan is a powerful suggestion — but you are always the author of your own life."},{n:"2",t:"Action before another reading",b:"Do not seek another reading until you have completed at least ONE action from your plan. Readings without action become avoidance, not growth."}].map(r=>(
          <div key={r.n} style={{display:"flex",gap:11,marginBottom:13,alignItems:"flex-start"}}>
            <div style={{width:26,height:26,borderRadius:"50%",background:"rgba(201,168,76,0.14)",border:`1px solid ${GOLD}`,display:"flex",alignItems:"center",justifyContent:"center",color:GOLD,fontSize:12,fontWeight:700,flexShrink:0}}>{r.n}</div>
            <div><div style={{color:GOLD,fontSize:12,fontWeight:700,marginBottom:2}}>{r.t}</div><div style={{color:CREAM,fontSize:11,lineHeight:1.6,opacity:0.8}}>{r.b}</div></div>
          </div>
        ))}
      </Box>
      <div style={{textAlign:"center",paddingBottom:12}}>
        <p style={{color:CREAM,fontSize:12,opacity:0.42,marginBottom:14,fontStyle:"italic",lineHeight:1.6}}>"Thank you for your trust. The work you do on yourself<br/>ripples out into everyone around you."</p>
        <Btn onClick={onNew} full>✦ Begin New Session ✦</Btn>
      </div>
    </div>
  );
}

// ── MAIN APP ───────────────────────────────────────────────────────
export default function App(){
  const [screen,setScreen]=useState("welcome");
  const [session,setSession]=useState(EMPTY);
  const [deckIdx,setDeckIdx]=useState(0);

  const has=session.question.length>0||Object.keys(session.deckResults).length>0;
  const allDone=DECKS.every(d=>session.deckResults[d.id]);

  function startNew(){setSession(EMPTY);setDeckIdx(0);setScreen("s1");}
  function resume(){
    const n=DECKS.filter(d=>session.deckResults[d.id]).length;
    if(n>=DECKS.length){setScreen("s4");return;}
    if(n>0||session.question){setDeckIdx(n);setScreen("s3");return;}
    if(session.lifeArea){setScreen("s2");return;}
    setScreen("s1");
  }
  function updateSession(u){setSession(p=>({...p,...u}));}
  function updateDeck(id,result,images,cardData){
    setSession(p=>({...p,deckResults:{...p.deckResults,[id]:result},deckImages:{...p.deckImages,[id]:images||{}},deckCardData:{...p.deckCardData,[id]:cardData}}));
  }
  function nextDeck(){
    if(deckIdx<DECKS.length-1){setDeckIdx(deckIdx+1);}
    else if(allDone){setScreen("s4");}
  }
  function goBack(){
    if(screen==="s1"){setScreen("welcome");return;}
    if(screen==="s2"){setScreen("s1");return;}
    if(screen==="s3"&&deckIdx===0){setScreen("s2");return;}
    if(screen==="s3"&&deckIdx>0){setDeckIdx(deckIdx-1);return;}
    if(screen==="s4"){setScreen("s3");setDeckIdx(DECKS.length-1);return;}
  }

  return(
    <div style={{minHeight:"100vh",background:"radial-gradient(ellipse at 20% 20%,#1A0A3C 0%,#0A0015 50%,#050010 100%)",color:CREAM,fontFamily:"Palatino Linotype,Palatino,Georgia,serif",position:"relative",overflowX:"hidden"}}>
      <Stars/>
      <div style={{position:"relative",zIndex:1,maxWidth:480,margin:"0 auto"}}>
        {screen!=="welcome"&&(
          <div style={{position:"fixed",top:12,left:12,zIndex:200}}>
            <button onClick={goBack} style={{background:"rgba(20,8,40,0.92)",border:"1px solid rgba(201,168,76,0.25)",borderRadius:"50%",width:34,height:34,cursor:"pointer",color:GOLD,fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(8px)"}}>←</button>
          </div>
        )}
        {screen==="welcome"&&<Welcome onStart={startNew} onResume={resume} has={has}/>}
        {screen==="s1"&&<S1 onNext={()=>setScreen("s2")} onSkip={()=>setScreen("s2")}/>}
        {screen==="s2"&&<S2 session={session} onUpdate={updateSession} onNext={()=>{setDeckIdx(0);setScreen("s3");}}/>}
        {screen==="s3"&&<DeckScreen session={session} deckIdx={deckIdx} onUpdate={updateDeck} onNext={nextDeck} onGoTo={i=>setDeckIdx(i)} onClose={()=>setScreen("s4")}/>}
        {screen==="s4"&&<S4 session={session} onNew={startNew}/>}
      </div>
    </div>
  );
}
