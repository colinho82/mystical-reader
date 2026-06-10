import { useState, useEffect } from "react";


// ══════════════════════════════════════════════════════════════════

// 🔑 API KEY IS NOW STORED SECURELY IN A NETLIFY FUNCTION

// The app calls /.netlify/functions/oracle instead of Deepseek directly.

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

const CSS=@keyframes tw{from{opacity:0.05}to{opacity:0.85}} @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}} @keyframes glow{0%,100%{box-shadow:0 0 14px 3px rgba(201,168,76,0.25)}50%{box-shadow:0 0 28px 8px rgba(201,168,76,0.55)}} @keyframes up{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}} @keyframes fi{from{opacity:0}to{opacity:1}} @keyframes pu{0%,100%{transform:scale(1)}50%{transform:scale(1.07)}} @keyframes sp{from{transform:rotate(0deg)}to{transform:rotate(360deg)}} .hq:hover{background:rgba(201,168,76,0.14)!important;border-color:rgba(201,168,76,0.45)!important} .ha:hover{transform:scale(1.02)} .hg:hover{background:rgba(201,168,76,0.1)!important};


// ── SHARED UI ─────────────────────────────────────────────────────

function Stars(){

return(

<div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0}}>

<style>{CSS}</style>

{STARS.map(s=><div key={s.id} style={{position:"absolute",left:${s.x}%,top:``${s.y}%,width:s.s,height:s.s,borderRadius:"50%",background:"white",animation:tw ${s.u}s ${s.d}s infinite alternate}}/>)}

</div>

);

}


function Btn({onClick,children,disabled,sm,outline,danger,purple,full}){

const bg=danger?"rgba(180,30,30,0.28)":purple?"rgba(107,76,154,0.28)":outline?"transparent":disabled?"#2a1a4a":linear-gradient(135deg,${GOLD},#E8C060,${GOLD});

const cl=disabled?"#5a4a7a":danger?"#ff9090":purple?"#b388ff":outline?GOLD:PURPLE;

const bd=danger?"rgba(255,107,107,0.8)":purple?"rgba(124,92,191,0.8)":disabled?"#3a2a5a":GOLD;

return(

<button onClick={onClick} disabled={disabled} style={{background:bg,color:cl,border:1.5px solid ${bd},borderRadius:30,padding:sm?"8px 18px":"12px 26px",fontSize:sm?12:14,fontFamily:"Palatino Linotype,Palatino,serif",fontWeight:700,cursor:disabled?"not-allowed":"pointer",letterSpacing:0.8,transition:"all 0.25s",animation:(!disabled&&!outline&&!danger&&!purple)?"glow 2.5s infinite":"none",opacity:disabled?0.5:1,width:full?"100%":"auto"}}&gt; {children} &lt;/button&gt; ); } function Box({children,style}){return &lt;div style={{background:"rgba(20,8,40,0.88)",border:"1px solid rgba(201,168,76,0.32)",borderRadius:14,padding:18,backdropFilter:"blur(10px)",boxShadow:"0 6px 28px rgba(0,0,0,0.4)",...style}}&gt;{children}&lt;/div&gt;;} function Lbl({children,style}){return &lt;div style={{color:GOLD,fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:8,...style}}&gt;{children}&lt;/div&gt;;} function Div(){return &lt;div style={{width:48,height:1,background:linear-gradient(90deg,transparent,${GOLD},transparent),margin:"9px auto"}}/>;}

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

{[0,1,2].map(i=><div key={i} style={{width:9,height:9,borderRadius:"50%",background:GOLD,animation:pu 1.2s ${i*0.2}s infinite`}}/>)}

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

<button key={d.id} onClick={()=>done&&onGo(i)} style={{background:active?"rgba(201,168,76,0.18)":"transparent",border:1px solid${active?GOLD:done?"rgba(201,168,76,0.4)":"rgba(201,168,76,0.1)"}`,borderRadius:20,padding:"5px 11px",cursor:done?"pointer":"default",color:active?GOLD:done?CREAM:"rgba(245,230,200,0.28)",fontSize:10,fontFamily:"Palatino Linotype,serif",whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:4,transition:"all 0.2s",flexShrink:0}}>

<span>{d.emoji}</span><span>{done&&!active?"✓ ":""}{d.subtitle}</span>

</button>

);

})}

</div>

);

}


// ── UPLOAD SLOT ───────────────────────────────────────────────────

function UploadSlot({card,value,onChange,cardName,onChangeName,deckLight,deckColor}){

const uid=card.id;

const [open,setOpen]=useState(false);

function handleFile(e){

const f=e.target.files?.[0];if(!f)return;e.target.value="";

const r=new FileReader();r.onload=ev=>{onChange(ev.target.result);setOpen(false);};r.readAsDataURL(f);

}

const obtn={background:${deckColor}88,border:1.5px solid ${deckLight}55,borderRadius:10,padding:"11px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:11,transition:"all 0.2s",fontFamily:"inherit",width:"100%",textAlign:"left"};

return(

<div style={{marginBottom:16,animation:"up 0.3s ease both"}}>

<div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>

<div style={{width:27,height:27,borderRadius:"50%",background:value?${deckColor}cc:"rgba(201,168,76,0.12)",border:1.5px solid ${value?deckLight:"rgba(201,168,76,0.28)"},display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:value?deckLight:GOLD,fontWeight:700,flexShrink:0}}>

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

<img src={value} alt={card.role} style={{width:88,height:128,objectFit:"cover",borderRadius:10,border:2.5px solid ${deckLight}88,boxShadow:0 4px 20px ${deckColor}aa}}/>

<div style={{position:"absolute",bottom:-5,left:"50%",transform:"translateX(-50%)",background:deckColor,border:1px solid ${deckLight}77,borderRadius:10,padding:"2px 8px",color:deckLight,fontSize:9,fontWeight:700,whiteSpace:"nowrap"}}&gt;✓ Uploaded&lt;/div&gt; &lt;/div&gt; &lt;div style={{display:"flex",flexDirection:"column",gap:7,paddingTop:2,flex:1}}&gt; &lt;div style={{color:CREAM,fontSize:10,opacity:0.5,marginBottom:1}}&gt;Replace card:&lt;/div&gt; &lt;label htmlFor={rc-${uid}} style={{background:"rgba(201,168,76,0.09)",border:"1px solid rgba(201,168,76,0.3)",borderRadius:20,padding:"7px 13px",cursor:"pointer",color:CREAM,fontSize:11,display:"flex",alignItems:"center",gap:6,userSelect:"none"}}>📷 Retake Photo</label>

<input id={rc-${uid}} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={handleFile}/&gt; &lt;label htmlFor={rg-${uid}} style={{background:"rgba(201,168,76,0.09)",border:"1px solid rgba(201,168,76,0.3)",borderRadius:20,padding:"7px 13px",cursor:"pointer",color:CREAM,fontSize:11,display:"flex",alignItems:"center",gap:6,userSelect:"none"}}>🖼 Choose Gallery</label>

<input id={rg-${uid}} type="file" accept="image/*" style={{display:"none"}} onChange={handleFile}/&gt; &lt;button onClick={()=&gt;onChange(null)} style={{background:"rgba(180,30,30,0.14)",border:"1px solid rgba(255,80,80,0.26)",borderRadius:20,padding:"7px 13px",cursor:"pointer",color:"#ff9090",fontSize:11,display:"flex",alignItems:"center",gap:6,fontFamily:"inherit"}}&gt;🗑 Remove&lt;/button&gt; &lt;/div&gt; &lt;/div&gt; ):( !open?( &lt;div onClick={()=&gt;setOpen(true)} style={{height:90,borderRadius:12,border:"2px dashed rgba(201,168,76,0.28)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",background:"rgba(201,168,76,0.03)",gap:5}}&gt; &lt;div style={{fontSize:24}}&gt;📷&lt;/div&gt; &lt;div style={{color:CREAM,fontSize:12,opacity:0.55}}&gt;Tap to upload {card.label}&lt;/div&gt; &lt;/div&gt; ):( &lt;div style={{background:"rgba(10,3,24,0.98)",border:"1px solid rgba(201,168,76,0.35)",borderRadius:12,padding:14,animation:"fi 0.2s ease"}}&gt; &lt;div style={{color:GOLD,fontSize:12,fontWeight:700,marginBottom:11}}&gt;How to add {card.label}:&lt;/div&gt; &lt;div style={{display:"flex",flexDirection:"column",gap:8}}&gt; &lt;label htmlFor={c-${uid}} style={obtn}><span style={{fontSize:22}}>📷</span><div><div style={{color:deckLight,fontSize:13,fontWeight:700}}>Open Camera</div><div style={{color:CREAM,fontSize:11,opacity:0.6}}>Take a photo of your card now</div></div></label>

<input id={c-${uid}} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={handleFile}/&gt; &lt;label htmlFor={g-${uid}} style={obtn}><span style={{fontSize:22}}>🖼</span><div><div style={{color:deckLight,fontSize:13,fontWeight:700}}>Browse Gallery</div><div style={{color:CREAM,fontSize:11,opacity:0.6}}>Choose from your photo library</div></div></label>

<input id={g-${uid}`} type="file" accept="image/*" style={{display:"none"}} onChange={handleFile}/>

<button onClick={()=>setOpen(false)} style={{background:"transparent",border:"none",color:"rgba(245,230,200,0.3)",fontSize:12,cursor:"pointer",padding:"4px",fontFamily:"inherit"}}>✕ Cancel</button>

</div>

</div>

)

)}


{/* Card name input — user types the actual card name they drew */}

<div style={{marginTop:10}}>

<div style={{color:GOLD,fontSize:10,fontWeight:700,letterSpacing:1,marginBottom:5}}>

✦ CARD NAME <span style={{color:"rgba(201,168,76,0.5)",fontWeight:400}}>(type the name shown on your card)</span>

</div>

<input

type="text"

value={cardName||""}

onChange={e=>onChangeName(e.target.value)}

placeholder={e.g.${card.role === "Current Emotional State" ? "Rose Quartz" : card.role === "Hidden Challenge" ? "Obsidian" : card.role === "Healing Opportunity" ? "Amethyst" : card.role === "Past Influence" ? "Isis" : card.role === "Current Lesson" ? "Osiris" : card.role === "Transformation Available" ? "Thoth" : card.role === "Current Influence" ? "Saturn" : card.role === "Opportunity" ? "Jupiter" : card.role === "Timing & Challenge" ? "10th House" : card.role === "Immediate Action" ? "Abundance Ritual" : card.role === "Mindset Shift" ? "Release Spell" : card.role === "Manifestation Focus" ? "Moon Magic" : card.role === "Current Situation" ? "The Moon" : card.role === "Obstacle" ? "The Tower" : card.role === "Opportunity" ? "The Star" : card.role === "Advice" ? "The Hermit" : "The World"}...} style={{ width:"100%", padding:"9px 12px", background:"rgba(20,8,40,0.85)", border:1.5px solid ${(cardName||"").trim().length&gt;0 ? deckLight : "rgba(201,168,76,0.25)"},

borderRadius:9, color:CREAM, fontSize:13,

fontFamily:"Palatino Linotype,serif",

outline:"none", boxSizing:"border-box",

transition:"border 0.2s"

}}

/>

{(cardName||"").trim().length>0&&(

<div style={{color:"#7CFC00",fontSize:10,marginTop:3}}>✓ Card name entered</div>

)}

</div>

</div>

);

}


// ── CARD RESULT BLOCK ─────────────────────────────────────────────

function CardBlock({cd,meta,deckLight,deckColor,idx}){

const isErr=cd.error===true;

return(

<div style={{background:isErr?"rgba(180,30,30,0.1)":linear-gradient(135deg,${deckColor}88,rgba(20,8,40,0.92)),border:isErr?"1.5px solid rgba(255,80,80,0.5)":1.5px solid latex

{deckLight}44`,borderRadius:14,padding:"18px 16px",marginBottom:16,animation:"up 0.4s ease both"}}&gt; {isErr?( &lt;div&gt; &lt;div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}&gt; &lt;span style={{fontSize:22}}&gt;⚠️&lt;/span&gt; &lt;div&gt; &lt;div style={{color:"#ff9090",fontSize:16,fontWeight:700,fontFamily:"Palatino Linotype,serif"}}&gt;{meta?.label} — Could Not Be Read&lt;/div&gt; &lt;div style={{color:"#ffaa88",fontSize:11,marginTop:2}}&gt;{meta?.role}&lt;/div&gt; &lt;/div&gt; &lt;/div&gt; &lt;div style={{background:"rgba(255,80,80,0.08)",border:"1px solid rgba(255,80,80,0.2)",borderRadius:9,padding:"10px 13px",marginBottom:10}}&gt; &lt;div style={{color:"#ff9090",fontSize:12,fontWeight:700,marginBottom:4}}&gt;Problem:&lt;/div&gt; &lt;div style={{color:CREAM,fontSize:12,lineHeight:1.6,opacity:0.85}}&gt;{cd.errorReason||"Card image was unclear, too dark, or the card name could not be identified."}&lt;/div&gt; &lt;/div&gt; &lt;div style={{color:"#ffcc88",fontSize:12,lineHeight:1.6}}&gt;👉 Reset this step and re-upload a clearer photo of &lt;strong style={{color:"#ffaa44"}}&gt;{meta?.label}&lt;/strong&gt;. Make sure the card name is clearly visible, well-lit and in focus.&lt;/div&gt; &lt;/div&gt; ):( &lt;div&gt; {/* Card number badge */} &lt;div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}&gt; &lt;div style={{width:32,height:32,borderRadius:"50%",background:`


{deckColor}cc,border:2px solid latex

{deckLight}`,display:"flex",alignItems:"center",justifyContent:"center",color:deckLight,fontSize:13,fontWeight:700,flexShrink:0}}&gt;{idx+1}&lt;/div&gt; &lt;div style={{color:CREAM,fontSize:11,opacity:0.55,letterSpacing:0.5}}&gt;{meta?.label} — {meta?.role}&lt;/div&gt; &lt;/div&gt; {/* Card name — bold large */} &lt;div style={{fontSize:22,fontWeight:700,fontFamily:"Palatino Linotype,serif",color:deckLight,lineHeight:1.2,marginBottom:12,textShadow:`0 0 20px 


{deckLight}55,letterSpacing:0.5}}&gt; {cd.cardName} &lt;/div&gt; {/* Keywords — small italic pills */} {cd.keywords&&cd.keywords.length&gt;0&&( &lt;div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}&gt; {cd.keywords.map((kw,ki)=&gt;( &lt;span key={ki} style={{background:{deckLight}44,borderRadius:20,padding:"3px 10px",color:deckLight,fontSize:11,fontStyle:"italic",letterSpacing:0.3}}&gt;{kw}&lt;/span&gt; ))} &lt;/div&gt; )} {/* Meaning related to question */} &lt;div style={{borderLeft:3px solid ${deckLight}55,paddingLeft:12}}>

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

<div style={{background:linear-gradient(135deg,${deck.color}cc,rgba(20,8,40,0.96)),border:2px solid {deck.color}66}}&gt; &lt;div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}&gt; &lt;span style={{fontSize:24}}&gt;{deck.emoji}&lt;/span&gt; &lt;div&gt; &lt;div style={{color:GOLD,fontSize:16,fontWeight:700,fontFamily:"Palatino Linotype,serif"}}&gt;Suggested Reading Answer&lt;/div&gt; &lt;div style={{color:CREAM,fontSize:11,opacity:0.55,marginTop:2}}&gt;Based on all {deck.cards.length} cards for your {deck.subtitle.toLowerCase()} reading&lt;/div&gt; &lt;/div&gt; &lt;/div&gt; &lt;div style={{width:"100%",height:1,background:linear-gradient(90deg,transparent,${deck.light}55,transparent),marginBottom:14}}/>

{paras.map((p,i)=><p key={i} style={{color:CREAM,fontSize:13,lineHeight:1.85,margin:i>0?"12px 0 0":"0",fontStyle:i===paras.length-1?"italic":"normal",opacity:i===paras.length-1?0.85:0.95}}>{p}</p>)}

</div>

);

}


// ── ORACLE API ────────────────────────────────────────────────────

// cardNames = { cardId: "actual card name typed by user" }

// images = { cardId: base64 } — kept for display only, NOT sent to API

async function callOracle(deck, session, images, demo=false, cardNames={}){

const area = AREAS.find(a => a.id === session.lifeArea);


// Build card lines using ACTUAL card names typed by the user

// If no name typed, use a placeholder asking Claude to suggest one

const cardLines = deck.cards.map((c, i) => {

const name = (cardNames[c.id]||"").trim();

if(demo){

return ``${c.label} (latex

{c.role}):\n Card Name: [Demo — please suggest an appropriate card name for this role]\n Role Purpose: 


{c.desc}; } if(name){ return{c.role}):\n Card Name: "latex

{name}"\n Role Purpose: 


{c.desc}; } // No name entered and no demo — ask Claude to suggest based on deck type return{c.role}):\n Card Name: [Reader drew a card but did not type the name — suggest an appropriate latex

{deck.name} card for this role]\n Role Purpose: 


{c.desc}`;

}).join("\n\n");


const prompt = You are an expert mystical card reader interpreting a ${deck.name} reading.


Life area: ${area?.label} Client question: "${session.question}"

Deck purpose: `${deck.purpose}


Cards drawn by the reader:

$`{cardLines}


IMPORTANT RULES:

• Use the EXACT card name provided by the reader where given — do not change it

• If a card name is in square brackets [like this], suggest an appropriate card name for that deck and role

• Interpret each card specifically in relation to the client question: "`${session.question}"

• Be compassionate, specific and empowering — never generic


Return ONLY valid raw JSON, NO markdown fences, NO extra text before or after:

{"cards":[{"cardName":"exact name from reader or suggested name","keywords":["word1","word2","word3","word4"],"meaning":"2-3 sentences interpreting this specific card for the question. Reference the card name explicitly. Be personal and specific to their situation.","error":false,"errorReason":""}],"suggestedAnswer":"3-4 flowing paragraphs weaving ALL card names together into one unified answer to the question. Name each card explicitly. Open with the most important insight. Close with one empowering action the client can take today. Warm, honest, mystical tone."}`;


// Send text-only to Netlify function — no images in payload

const res = await fetch(ORACLE_ENDPOINT, {

method: "POST",

headers: { "Content-Type": "application/json" },

body: JSON.stringify({ prompt })

});


const resText = await res.text().catch(() => "");


// Detect HTML response — means function not found (404) or not deployed

if(resText.trim().startsWith("<") || resText.includes("<!DOCTYPE")){

throw new Error("FUNC_NOT_FOUND");

}


let resData = {};

try { resData = JSON.parse(resText); } catch(e) { resData = { error: Non-JSON response: ${resText.substring(0,200)}` }; }


if (!res.ok) {

const msg = resData?.error || HTTP${res.status}; throw new Error(FUNC_ERROR: latex

{msg}`); } if (resData.error) throw new Error(`FUNC_ERROR: 


{resData.error}`);


const raw = resData.result || "{}";

const clean = raw.replace(/^(?:json)?\s*/,"").replace(/\s*$`/,"").trim();


try {

return JSON.parse(clean);

} catch(e) {

throw new Error(PARSE_ERROR:${clean.substring(0,150)}`);

}

}



// ── SECTION 3: DECK SCREEN ────────────────────────────────────────

function DeckScreen({session,deckIdx,onUpdate,onNext,onGoTo,onClose}){

const deck=DECKS[deckIdx];

const existing=session.deckResults[deck.id];

const exImg=session.deckImages?.[deck.id]||{};

const exData=session.deckCardData?.[deck.id]||null;


const [images,setImages]=useState(exImg);

const [cardNames,setCardNames]=useState(exData?.cardNames||{});

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

setLoadMsg(Interpreting your ${deck.subtitle} cards...); try{ const r=await callOracle(deck,session,images,demo,cardNames); if(!r||!r.cards) throw new Error("Empty response from oracle"); setCards(r.cards); setAns(r.suggestedAnswer||""); setPhase("done"); const summary=r.cards.map((c,i)=>``${deck.cards[i]?.role}: ${c.error?"[unread]":c.cardName}).join(" | "); onUpdate(deck.id,summary,images,{cards:r.cards,suggestedAnswer:r.suggestedAnswer||""}); }catch(e){ const m=e.message||""; let display=""; if(m.includes("DEEPSEEK_KEY not set")) display="🔑 DEEPSEEK_KEY not set in Netlify. Go to Netlify → Site configuration → Environment variables → add DEEPSEEK_KEY = your key, then redeploy."; else if(m.includes("key format invalid")) display=🔑 API key format wrong. ${m};

else if(m.includes("401")||m.includes("invalid_api_key")) display="🔑 Invalid API key. Check DEEPSEEK_KEY in Netlify environment variables — must start with sk-ant-";

else if(m.includes("429")) display="⏳ Too many requests. Wait 30 seconds then try again, or use Demo Mode.";

else if(m.includes("FUNC_ERROR")) display=⚠ Function error: ${m.replace("FUNC_ERROR:","").trim()}; else if(m.includes("PARSE_ERROR")) display=📋 Response parse error: ${m.replace("PARSE_ERROR:","").trim()} — try Demo Mode.;

else if(m.includes("FUNC_NOT_FOUND")) display="⚠ Netlify function not found. Check that netlify/functions/oracle.js exists in your GitHub repo AND netlify.toml has functions = "netlify/functions". Then redeploy.";

else if(m.includes("fetch")||m.includes("network")||m.includes("Failed")) display="🌐 Network error. Check internet and try again.";

else display=⚠ ${m}`;

setErr(display); setPhase("upload");

}

}


function reset(){

setImages({});setCards(null);setAns(null);setCardNames({});

setPhase("upload");setResetConfirm(false);setErr("");

setResetOk("✓ Step reset. Please re-upload your cards and card names.");

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

<div style={{height:"100%",borderRadius:4,background:linear-gradient(90deg,${GOLD},{((deckIdx+1)/DECKS.length)*100}%`,transition:"width 0.5s"}}/>

</div>

</div>


{/* Question reminder */}

<Box style={{marginBottom:12,background:${area?.color||"#1a0a30"}88`}}>

<Lbl style={{marginBottom:4}}>{area?.emoji} YOUR QUESTION</Lbl>

<div style={{color:CREAM,fontSize:12,fontStyle:"italic",lineHeight:1.6}}>"{session.question}"</div>

</Box>


{/* Purpose */}

<Box style={{marginBottom:12}}>

<Lbl>✦ PURPOSE OF THIS DECK</Lbl>

<p style={{color:CREAM,fontSize:12,lineHeight:1.7,margin:0}}>{deck.purpose}</p>

</Box>


{/* Instructions */}

<Box style={{marginBottom:18,border:1px solid${deck.light}33,background:${deck.color}55}}>

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

<div style={{height:"100%",borderRadius:4,background:GOLD,width:``${(uploaded/deck.cards.length)*100}%,transition:"width 0.4s"}}/&gt; &lt;/div&gt; {deck.cards.map(card=&gt;( &lt;UploadSlot key={card.id} card={card} value={images[card.id]} deckLight={deck.light} deckColor={deck.color} cardName={cardNames[card.id]||""} onChangeName={name=&gt;setCardNames(p=&gt;({...p,[card.id]:name}))} onChange={img=&gt;setImages(p=&gt;({...p,[card.id]:img}))}/&gt; ))} &lt;div style={{display:"flex",flexDirection:"column",gap:10,alignItems:"center",marginTop:20}}&gt; {/* Allow reading if all cards named OR all images uploaded */} {(()=&gt;{ const namesEntered=deck.cards.every(c=&gt;(cardNames[c.id]||"").trim().length&gt;0); const ready=allUp||namesEntered; return( &lt;&gt; &lt;Btn onClick={()=&gt;read(false)} disabled={!ready} full&gt; {ready?✦ Interpret the ${deck.subtitle} Cards:Upload cards OR type all card names to continue}

</Btn>

{!ready&&(

<div style={{color:CREAM,fontSize:10,opacity:0.35,textAlign:"center"}}>

Upload photos above OR type all {deck.cards.length} card names below each slot

</div>

)}

</>

);

})()}

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


{/* RESULTS PHASE /}

{phase==="done"&&cards&&(

<div>

{/ Card previews */}

{Object.values(images).some(Boolean)&&(

<div style={{marginBottom:20}}>

<Lbl>✦ CARDS DRAWN</Lbl>

<div style={{display:"flex",gap:8,flexWrap:"wrap"}}>

{deck.cards.map((card,i)=>images[card.id]?(

<div key={card.id} style={{textAlign:"center",position:"relative"}}>

<img src={images[card.id]} alt={card.role} style={{width:64,height:94,objectFit:"cover",borderRadius:9,border:2px solid${cards[i]?.error?"#ff6b6b":deck.light+"55"},boxShadow:0 3px 12px ${deck.color}88,filter:cards[i]?.error?"grayscale(50%) brightness(0.7)":"none"}}/>

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

<div style={{color:"#ffaa44",fontSize:11,textAlign:"center",marginBottom:10,padding:"9px 12px",
