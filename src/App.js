import { useState, useEffect } from "react";


const GOLD="#C9A84C",CREAM="#F5E6C8",PURPLE="#1E0A3C";



const ANTHROPIC_API_KEY = "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";

// ══════════════════════════════════════════════════════════════════


const LIFE_AREAS=[

{id:"love",emoji:"💕",label:"Love & Relationships",color:"#8B2252",questions:["Will my relationship improve or is it time to let go?","Why do my relationships keep ending the same way?","What is blocking me from receiving love?","Is this relationship growing me or depleting me?","How do I heal from heartbreak and open up again?","Why do I repeat the same painful patterns in love?","Am I holding onto something I should release?","How do I know if this person is right for me?"]},

{id:"career",emoji:"🌟",label:"Career & Life Purpose",color:"#1A4A1A",questions:["Should I change my job or stay where I am?","Why do I feel so stuck in my career?","What hidden skill or talent am I ignoring?","What is my true life purpose?","Should I start my own business or stay employed?","Am I resisting a change I need to make?","Why don't I feel valued at work?","I fear I'm not good enough for the next level — is this true?"]},

{id:"finances",emoji:"💰",label:"Finances & Abundance",color:"#4A3000",questions:["What is blocking my financial flow?","What is my core money wound?","Is fear blocking my abundance?","What opportunity am I missing?","How do I break the cycle of financial struggle?","I save but never feel secure — why?","What mindset shift would transform my finances?","How do I create multiple income streams?"]},

{id:"family",emoji:"🏠",label:"Family & Home",color:"#0A2A3A",questions:["How do I set healthy boundaries without guilt?","Why do I seek approval that never comes?","How do I heal a broken family relationship?","Am I enabling someone I love?","How do I navigate a toxic family dynamic?","My adult child won't speak to me — what should I do?","How do I balance family and my own needs?","Why do the same conflicts keep repeating?"]},

{id:"growth",emoji:"🌱",label:"Personal Growth",color:"#2A0A4A",questions:["What truth am I avoiding?","Why do I self-sabotage when things go well?","I feel like I have no purpose — help.","What fear is most holding me back?","How do I break free from old patterns?","Why do I struggle to love and accept myself?","How do I build more confidence?","What is the next chapter of my growth?"]},

{id:"spirituality",emoji:"🔮",label:"Spirituality",color:"#2A0A3A",questions:["Am I following my intuition or my ego?","What sign am I overlooking?","I don't trust my intuition — how do I develop it?","Am I on my soul's true path?","How do I deepen my spiritual practice?","What spiritual gifts am I not using?","How do I reconnect with my higher self?","What does my higher self most want me to know?"]},

];


const DECKS=[

{id:"crystal",emoji:"💎",name:"Crystal Reading Cards",subtitle:"Current Energy",color:"#5A0A30",light:"#FF6B9D",

purpose:"Reveals your current emotional truth — what energy you are carrying right now beneath the surface.",

instruction:"Take your Crystal Reading Cards. Hold them gently and think about how you FEEL right now — not your question, but your emotional state. Shuffle slowly and mindfully, then draw 3 cards one at a time.",

cards:[{id:"c1",label:"Card 1",role:"Current Emotional State",desc:"What energy are you carrying right now?"},{id:"c2",label:"Card 2",role:"Hidden Challenge",desc:"What emotional wound needs attention?"},{id:"c3",label:"Card 3",role:"Healing Opportunity",desc:"What inner strength do you already have?"}]},

{id:"egyptian",emoji:"👁",name:"Egyptian Book of the Dead",subtitle:"Root Cause",color:"#3A1500",light:"#FF8C42",

purpose:"Uncovers the spiritual root cause behind your situation — the soul lesson hidden within your challenge.",

instruction:"Take your Egyptian Oracle deck. Hold it, close your eyes and take 3 deep breaths. Ask silently: 'Show me why this is happening and what my soul needs to learn.' Shuffle with intention and draw 3 cards.",

cards:[{id:"e1",label:"Card 1",role:"Past Influence",desc:"Why is this situation happening?"},{id:"e2",label:"Card 2",role:"Current Lesson",desc:"What soul lesson am I here to learn?"},{id:"e3",label:"Card 3",role:"Transformation Available",desc:"What am I overlooking that could change everything?"}]},

{id:"astrology",emoji:"🌙",name:"Astrology Reading Cards",subtitle:"Influences & Timing",color:"#0A0A3A",light:"#7B8CDE",

purpose:"Reveals what cosmic forces and timing are affecting your situation — what is coming at you from the outside.",

instruction:"Separate your Astrology Cards into 3 piles: Planets, Zodiac Signs, and Houses. Shuffle each pile separately. Draw 1 card from each pile.",

cards:[{id:"a1",label:"Planet Card",role:"Current Influence",desc:"What energy or force is most affecting you?"},{id:"a2",label:"Zodiac Card",role:"Opportunity",desc:"What opportunity is emerging for you?"},{id:"a3",label:"House Card",role:"Timing & Challenge",desc:"What life area and timing should you know?"}]},

{id:"magic",emoji:"✨",name:"Magic Oracle Cards",subtitle:"Action Plan",color:"#1A0840",light:"#B388FF",

purpose:"Gives you concrete, practical action steps — transforming insight into real change you can create this week.",

instruction:"Take your Magic Oracle Cards. Shuffle while asking: 'What actions and shifts will serve me most right now?' Draw with intention and select 3 cards.",

cards:[{id:"m1",label:"Card 1",role:"Immediate Action",desc:"What is the most important thing to do this week?"},{id:"m2",label:"Card 2",role:"Mindset Shift",desc:"What belief or pattern needs to change?"},{id:"m3",label:"Card 3",role:"Manifestation Focus",desc:"What energy helps you attract what you want?"}]},

{id:"tarot",emoji:"🌀",name:"Mystical Realm Tarot",subtitle:"Outcome & Final Map",color:"#1A003A",light:"#CE93D8",

purpose:"The final map — your current position, obstacles, opportunities, wisest advice and most probable outcome.",

instruction:"Shuffle the full 78 Tarot cards while holding your question in mind. You may cut the deck. Draw 5 cards and lay them face down before turning each one over.",

cards:[{id:"t1",label:"Card 1",role:"Current Situation",desc:"Where do you actually stand right now?"},{id:"t2",label:"Card 2",role:"Obstacle",desc:"What is working against you?"},{id:"t3",label:"Card 3",role:"Opportunity",desc:"What hidden resource wants to help you?"},{id:"t4",label:"Card 4",role:"Advice",desc:"What is the single wisest move?"},{id:"t5",label:"Card 5",role:"Likely Outcome",desc:"If you follow the advice, where does this lead?"}]},

];


const EMPTY={lifeArea:null,question:"",deckResults:{},deckImages:{},deckCardData:{},summary:null};

const STARS=Array.from({length:65},(_,i)=>({id:i,x:Math.random()*100,y:Math.random()*100,size:Math.random()*2+0.5,delay:Math.random()*5,dur:Math.random()*3+2}));


// ── STARS ─────────────────────────────────────────────────────────

function Stars(){

return(

<div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0}}>

{STARS.map(s=><div key={s.id} style={{position:"absolute",left:${s.x}%,top:``${s.y}%,width:s.size,height:s.size,borderRadius:"50%",background:"white",animation:tw ${s.dur}s ${s.delay}s infinite alternate}}/>)}

<style>{@keyframes tw{from{opacity:0.06}to{opacity:0.88}} @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}} @keyframes glow{0%,100%{box-shadow:0 0 14px 3px rgba(201,168,76,0.28)}50%{box-shadow:0 0 28px 8px rgba(201,168,76,0.55)}} @keyframes up{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}} @keyframes fi{from{opacity:0}to{opacity:1}} @keyframes pu{0%,100%{transform:scale(1)}50%{transform:scale(1.07)}} @keyframes sp{from{transform:rotate(0deg)}to{transform:rotate(360deg)}} .hq:hover{background:rgba(201,168,76,0.14)!important;border-color:rgba(201,168,76,0.45)!important} .ha:hover{transform:scale(1.02)} .hg:hover{background:rgba(201,168,76,0.12)!important}}</style>

</div>

);

}


// ── SHARED UI ─────────────────────────────────────────────────────

function Btn({onClick,children,disabled,sm,outline,danger,purple,full}){

const bg=danger?"rgba(180,30,30,0.28)":purple?"rgba(107,76,154,0.28)":outline?"transparent":disabled?"#2a1a4a":linear-gradient(135deg,${GOLD},#E8C060,${GOLD});

const cl=disabled?"#5a4a7a":danger?"#ff9090":purple?"#b388ff":outline?GOLD:PURPLE;

const bd=danger?"#ff6b6b":purple?"#7c5cbf":GOLD;

return(

<button onClick={onClick} disabled={disabled} style={{

background:bg,color:cl,border:1.5px solid ${disabled?"#3a2a5a":bd}`,

borderRadius:30,padding:sm?"8px 18px":"12px 26px",

fontSize:sm?12:14,fontFamily:"Palatino Linotype,Palatino,serif",

fontWeight:700,cursor:disabled?"not-allowed":"pointer",letterSpacing:0.8,

transition:"all 0.25s",animation:disabled||outline||danger||purple?"none":"glow 2.5s infinite",

opacity:disabled?0.5:1,width:full?"100%":"auto",

}}>{children}</button>

);

}


function Box({children,style}){

return <div style={{background:"rgba(20,8,40,0.88)",border:"1px solid rgba(201,168,76,0.32)",borderRadius:14,padding:18,backdropFilter:"blur(12px)",boxShadow:"0 6px 28px rgba(0,0,0,0.4)",...style}}>{children}</div>;

}


function Label({children,style}){

return <div style={{color:GOLD,fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:8,...style}}>{children}</div>;

}


function Divider(){

return <div style={{width:48,height:1,background:linear-gradient(90deg,transparent,${GOLD},transparent)`,margin:"9px auto"}}/>;

}


function Dots({step,total}){

return(

<div style={{display:"flex",justifyContent:"center",gap:7,marginBottom:14}}>

{Array.from({length:total},(_,i)=>(

<div key={i} style={{width:i===step-1?22:7,height:7,borderRadius:4,

background:i<step?GOLD:i===step-1?GOLD:"rgba(201,168,76,0.16)",transition:"all 0.4s"}}/>

))}

</div>

);

}


function Spinner({label}){

const [d,setD]=useState("");

useEffect(()=>{const t=setInterval(()=>setD(x=>x.length>=3?"":x+"."),400);return()=>clearInterval(t);},[]);

return(

<div style={{textAlign:"center",padding:"28px 0"}}>

<div style={{fontSize:38,animation:"sp 3s linear infinite",marginBottom:12}}>✦</div>

<div style={{color:GOLD,fontFamily:"Palatino Linotype,serif",fontSize:16,marginBottom:6}}>{label||"The oracle is reading"}{d}</div>

<div style={{color:CREAM,fontSize:12,opacity:0.5}}>Channelling ancient wisdom for your reading</div>

<div style={{marginTop:18,display:"flex",justifyContent:"center",gap:7}}>

{[0,1,2].map(i=><div key={i} style={{width:9,height:9,borderRadius:"50%",background:GOLD,animation:pu 1.2s ${i*0.2}s infinite`}}/>)}

</div>

</div>

);

}


// ── JOURNEY NAV ───────────────────────────────────────────────────

function Nav({session,cur,onGo}){

return(

<div style={{background:"rgba(8,3,18,0.95)",borderBottom:"1px solid rgba(201,168,76,0.15)",

padding:"9px 14px",display:"flex",gap:5,overflowX:"auto",WebkitOverflowScrolling:"touch",flexShrink:0,scrollbarWidth:"none"}}>

{DECKS.map((d,i)=>{

const done=!!session.deckResults[d.id];

const active=i===cur;

return(

<button key={d.id} onClick={()=>done&&onGo(i)} style={{

background:active?"rgba(201,168,76,0.18)":"transparent",

border:1px solid${active?GOLD:done?"rgba(201,168,76,0.4)":"rgba(201,168,76,0.1)"}`,

borderRadius:20,padding:"5px 11px",cursor:done?"pointer":"default",

color:active?GOLD:done?CREAM:"rgba(245,230,200,0.28)",

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


// ── CARD UPLOAD SLOT ──────────────────────────────────────────────

function UploadSlot({card,value,onChange,deckLight,deckColor}){

const uid=card.id;

const [open,setOpen]=useState(false);


function handleFile(e){

const f=e.target.files?.[0];

if(!f)return;

e.target.value="";

const r=new FileReader();

r.onload=ev=>{onChange(ev.target.result);setOpen(false);};

r.readAsDataURL(f);

}


const obtn={background:${deckColor}88,border:1.5px solid ${deckLight}55,borderRadius:10,

padding:"11px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:11,

transition:"all 0.2s",fontFamily:"inherit",width:"100%",textAlign:"left"};


return(

<div style={{marginBottom:16,animation:"up 0.3s ease both"}}>

{/* Label row */}

<div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>

<div style={{width:27,height:27,borderRadius:"50%",

background:value?${deckColor}cc:"rgba(201,168,76,0.12)", border:1.5px solid ${value?deckLight:"rgba(201,168,76,0.28)"},

display:"flex",alignItems:"center",justifyContent:"center",

fontSize:11,color:value?deckLight:GOLD,fontWeight:700,flexShrink:0}}>

{value?"✓":card.label.replace("Card ","").replace("Planet Card","P").replace("Zodiac Card","Z").replace("House Card","H")}

</div>

<div>

<div style={{color:value?deckLight:GOLD,fontSize:12,fontWeight:700}}>{card.label} — {card.role}</div>

<div style={{color:CREAM,fontSize:11,opacity:0.55}}>{card.desc}</div>

</div>

</div>


{/* Uploaded state /}

{value?(

<div style={{display:"flex",gap:12,alignItems:"flex-start",animation:"fi 0.3s ease"}}>

<div style={{position:"relative",flexShrink:0}}>

<img src={value} alt={card.role} style={{width:88,height:128,objectFit:"cover",borderRadius:10,

border:2.5px solid ${deckLight}88,boxShadow:0 4px 20px ${deckColor}aa}}/>

<div style={{position:"absolute",bottom:-5,left:"50%",transform:"translateX(-50%)",

background:deckColor,border:1px solid ${deckLight}77,borderRadius:10,padding:"2px 8px", color:deckLight,fontSize:9,fontWeight:700,whiteSpace:"nowrap"}}&gt;✓ Uploaded&lt;/div&gt; &lt;/div&gt; &lt;div style={{display:"flex",flexDirection:"column",gap:7,paddingTop:2,flex:1}}&gt; &lt;div style={{color:CREAM,fontSize:10,opacity:0.5,marginBottom:1}}&gt;Replace card:&lt;/div&gt; &lt;label htmlFor={rc-${uid}} style={{background:"rgba(201,168,76,0.09)",border:"1px solid rgba(201,168,76,0.3)",borderRadius:20,padding:"7px 13px",cursor:"pointer",color:CREAM,fontSize:11,display:"flex",alignItems:"center",gap:6,userSelect:"none"}}>

📷 Retake Photo

</label>

<input id={rc-${uid}} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={handleFile}/&gt; &lt;label htmlFor={rg-${uid}} style={{background:"rgba(201,168,76,0.09)",border:"1px solid rgba(201,168,76,0.3)",borderRadius:20,padding:"7px 13px",cursor:"pointer",color:CREAM,fontSize:11,display:"flex",alignItems:"center",gap:6,userSelect:"none"}}>

🖼 Choose Gallery

</label>

<input id={rg-${uid}} type="file" accept="image/*" style={{display:"none"}} onChange={handleFile}/&gt; &lt;button onClick={()=&gt;onChange(null)} style={{background:"rgba(180,30,30,0.14)",border:"1px solid rgba(255,80,80,0.26)",borderRadius:20,padding:"7px 13px",cursor:"pointer",color:"#ff9090",fontSize:11,display:"flex",alignItems:"center",gap:6,fontFamily:"inherit"}}&gt; 🗑 Remove &lt;/button&gt; &lt;/div&gt; &lt;/div&gt; ):( /* Empty state */ !open?( &lt;div onClick={()=&gt;setOpen(true)} style={{height:94,borderRadius:12,border:"2px dashed rgba(201,168,76,0.28)", display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center", cursor:"pointer",background:"rgba(201,168,76,0.03)",transition:"all 0.2s",gap:5}}&gt; &lt;div style={{fontSize:24}}&gt;📷&lt;/div&gt; &lt;div style={{color:CREAM,fontSize:12,opacity:0.55}}&gt;Tap to upload {card.label}&lt;/div&gt; &lt;/div&gt; ):( &lt;div style={{background:"rgba(12,4,28,0.97)",border:"1px solid rgba(201,168,76,0.35)",borderRadius:12,padding:14,animation:"fi 0.2s ease"}}&gt; &lt;div style={{color:GOLD,fontSize:12,fontWeight:700,marginBottom:11}}&gt;How would you like to add {card.label}?&lt;/div&gt; &lt;div style={{display:"flex",flexDirection:"column",gap:8}}&gt; &lt;label htmlFor={c-${uid}} style={obtn}>

<span style={{fontSize:22,flexShrink:0}}>📷</span>

<div><div style={{color:deckLight,fontSize:13,fontWeight:700}}>Open Camera</div><div style={{color:CREAM,fontSize:11,opacity:0.6}}>Take a photo of your card now</div></div>

</label>

<input id={c-${uid}} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={handleFile}/&gt; &lt;label htmlFor={g-${uid}} style={obtn}>

<span style={{fontSize:22,flexShrink:0}}>🖼</span>

<div><div style={{color:deckLight,fontSize:13,fontWeight:700}}>Browse Gallery</div><div style={{color:CREAM,fontSize:11,opacity:0.6}}>Choose from your photo library</div></div>

</label>

<input id={g-${uid}`} type="file" accept="image/" style={{display:"none"}} onChange={handleFile}/>

<button onClick={()=>setOpen(false)} style={{background:"transparent",border:"none",color:"rgba(245,230,200,0.3)",fontSize:12,cursor:"pointer",padding:"4px",fontFamily:"inherit"}}>✕ Cancel</button>

</div>

</div>

)

)}

</div>

);

}


// ── CARD INTERPRETATION BLOCK ─────────────────────────────────────

function CardBlock({cd,cardMeta,deckLight,deckColor,idx}){

const isError=cd.error===true;

return(

<div style={{

background:isError?"rgba(180,30,30,0.1)":linear-gradient(135deg,${deckColor}88,rgba(20,8,40,0.92)), border:isError?"1.5px solid rgba(255,80,80,0.5)":1.5px solid latex

{deckLight}44`, borderRadius:14,padding:"18px 16px",marginBottom:16, animation:"up 0.4s ease both", }}&gt; {isError?( /* ── ERROR STATE ── */ &lt;div&gt; &lt;div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}&gt; &lt;span style={{fontSize:22}}&gt;⚠️&lt;/span&gt; &lt;div&gt; &lt;div style={{color:"#ff9090",fontSize:16,fontWeight:700,fontFamily:"Palatino Linotype,serif"}}&gt; {cardMeta?.label} — Could Not Be Read &lt;/div&gt; &lt;div style={{color:"#ffaa88",fontSize:11,marginTop:2}}&gt;{cardMeta?.role}&lt;/div&gt; &lt;/div&gt; &lt;/div&gt; &lt;div style={{background:"rgba(255,80,80,0.08)",border:"1px solid rgba(255,80,80,0.2)",borderRadius:9,padding:"10px 13px",marginBottom:10}}&gt; &lt;div style={{color:"#ff9090",fontSize:12,fontWeight:700,marginBottom:4}}&gt;Problem Detected:&lt;/div&gt; &lt;div style={{color:CREAM,fontSize:12,lineHeight:1.6,opacity:0.85}}&gt; {cd.errorReason||"The card image was unclear, too dark, or the card name could not be identified."} &lt;/div&gt; &lt;/div&gt; &lt;div style={{color:"#ffcc88",fontSize:12,lineHeight:1.6}}&gt; 👉 Please reset this step and re-upload a clearer photo of &lt;strong style={{color:"#ffaa44"}}&gt;{cardMeta?.label}&lt;/strong&gt;. Make sure the card name is clearly visible, well-lit and in focus. &lt;/div&gt; &lt;/div&gt; ):( /* ── SUCCESS STATE ── */ &lt;div&gt; {/* Card number badge + role */} &lt;div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}&gt; &lt;div style={{width:34,height:34,borderRadius:"50%",background:`


{deckColor}cc, border:2px solid ${deckLight},display:"flex",alignItems:"center",justifyContent:"center",

color:deckLight,fontSize:13,fontWeight:700,flexShrink:0}}>

{idx+1}

</div>

<div>

<div style={{color:CREAM,fontSize:11,opacity:0.6,letterSpacing:0.5}}>{cardMeta?.label} — {cardMeta?.role}</div>

</div>

</div>


{/* ── CARD NAME — Bold, large ── */}

<div style={{

fontSize:22,fontWeight:700,fontFamily:"Palatino Linotype,serif",

color:deckLight,lineHeight:1.2,marginBottom:10,

textShadow:0 0 20px${deckLight}66`,letterSpacing:0.5

}}>

{cd.cardName}

</div>


{/* ── KEYWORDS — smaller font ── */}

{cd.keywords&&cd.keywords.length>0&&(

<div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>

{cd.keywords.map((kw,ki)=>(

<span key={ki} style={{

background:${deckLight}18,border:1px solid ${deckLight}44,

borderRadius:20,padding:"3px 10px",

color:deckLight,fontSize:11,fontStyle:"italic",letterSpacing:0.3

}}>{kw}</span>

))}

</div>

)}


{/* ── MEANING — related to question ── */}

<div style={{

borderLeft:3px solid ${deckLight}55`,paddingLeft:12,

}}>

<div style={{color:GOLD,fontSize:10,fontWeight:700,letterSpacing:1.5,marginBottom:6,textTransform:"uppercase"}}>

Meaning for your question

</div>

<p style={{color:CREAM,fontSize:13,lineHeight:1.8,margin:0,opacity:0.92}}>

{cd.meaning}

</p>

</div>

</div>

)}

</div>

);

}


// ── SUGGESTED ANSWER ──────────────────────────────────────────────

function SuggestedAnswer({answer,deck}){

const paras=answer.split(/\n+/).filter(p=>p.trim());

return(

<div style={{

background:linear-gradient(135deg,${deck.color}cc,rgba(20,8,40,0.96)), border:2px solid {deck.color}66}}&gt; &lt;div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}&gt; &lt;span style={{fontSize:26}}&gt;{deck.emoji}&lt;/span&gt; &lt;div&gt; &lt;div style={{color:GOLD,fontSize:16,fontWeight:700,fontFamily:"Palatino Linotype,serif"}}&gt; Suggested Reading Answer &lt;/div&gt; &lt;div style={{color:CREAM,fontSize:11,opacity:0.6,marginTop:2}}&gt; Based on all {deck.cards.length} cards drawn for your {deck.subtitle.toLowerCase()} reading &lt;/div&gt; &lt;/div&gt; &lt;/div&gt; &lt;div style={{width:"100%",height:1,background:linear-gradient(90deg,transparent,${deck.light}55,transparent),marginBottom:14}}/>

{paras.map((p,i)=>(

<p key={i} style={{

color:CREAM,fontSize:13,lineHeight:1.85,

margin:i>0?"12px 0 0":"0",

fontStyle:i===paras.length-1?"italic":"normal",

opacity:i===paras.length-1?0.85:0.95

}}>{p}</p>

))}

</div>

);

}


// ── ORACLE API CALL ───────────────────────────────────────────────

async function callOracle(deck,session,images,demo=false){

const area=LIFE_AREAS.find(a=>a.id===session.lifeArea);

const lines=deck.cards.map((c,i)=>{

const hasImg=!demo&&images[c.id];

return Card${i+1} — {c.role}):\n Image status: latex

{hasImg?"Uploaded — identify the actual card name from the image":"No image — invent a fitting mystical card name for this role"}\n Role purpose: 


{c.desc}`;

}).join("\n\n");


const prompt=You are an expert mystical card reader interpreting a ${deck.name} reading.


Life area: ${area?.label} Client question: "${session.question}"

Deck purpose: `${deck.purpose}


Cards drawn:

$`{lines}


Return ONLY a valid JSON object — no markdown fences, no extra text:

{

"cards": [

{

"cardName": "The exact card name as it appears on the card — this should be BOLD and displayed prominently (e.g. 'Rose Quartz', 'The Moon', 'Saturn', 'Isis', 'Ten of Cups'). If the card image is unreadable, too dark, blurry or the name cannot be identified, set error to true.",

"keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],

"meaning": "2-3 sentences directly interpreting this card in relation to the client's specific question '${session.question}' and life area '${area?.label}'. Be compassionate, specific and empowering. Reference the card name and its energy explicitly.",

"error": false,

"errorReason": ""

}

],

"suggestedAnswer": "A 3-4 paragraph flowing narrative weaving ALL `${deck.cards.length} cards together into one clear unified answer to the client's specific question. Open with the most important insight. Name each card explicitly. Be warm, honest and empowering. Close with one clear reflection or action the client can take today. Only include this if ALL cards have error:false — otherwise set to empty string."

}


RULES:

• cardName: actual name on card. If image is too dark/blurry/unreadable → error:true, errorReason: specific description.

• keywords: 4-5 evocative single words or short phrases (e.g. "transformation", "inner courage", "new beginnings", "self-worth").

• meaning: must directly reference the client's question — never generic.

• suggestedAnswer: only when ALL cards OK. 3-4 paragraphs minimum. Weave all card names into the narrative.

• Return ONLY raw JSON. Nothing else.`;


const res=await fetch("https://api.anthropic.com/v1/messages",{

method:"POST",headers:{

"Content-Type":"application/json",

"x-api-key":ANTHROPIC_API_KEY,

"anthropic-version":"2023-06-01",

"anthropic-dangerous-direct-browser-access":"true"

},

body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:2000,

messages:[{role:"user",content:prompt}]})

});

const data=await res.json();

const raw=data.content?.map(b=>b.text||"").join("")||"{}";

const clean=raw.replace(/^(?:json)?\s*/,"").replace(/\s*$`/,"").trim();

return JSON.parse(clean);

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

const [answer,setAnswer]=useState(exData?.suggestedAnswer||null);

const [loading,setLoading]=useState(false);

const [loadMsg,setLoadMsg]=useState("");

const [resetConfirm,setResetConfirm]=useState(false);

const [resetOk,setResetOk]=useState("");

const [errMsg,setErrMsg]=useState("");


const area=LIFE_AREAS.find(a=>a.id===session.lifeArea);

const uploaded=deck.cards.filter(c=>images[c.id]).length;

const allUp=deck.cards.every(c=>images[c.id]);

const isLast=deckIdx===DECKS.length-1;

const allDone=DECKS.every(d=>session.deckResults[d.id]);


const hasErrors=cards&&cards.some(c=>c.error===true);

const errorCards=cards?cards.map((c,i)=>({...c,idx:i})).filter(c=>c.error===true):[];

const allOk=cards&&cards.every(c=>!c.error);

const canProceed=allOk&&answer&&answer.length>10;


async function read(demo=false){

setLoading(true);setPhase("loading");setErrMsg("");

setLoadMsg(Interpreting your${deck.subtitle} cards...); try{ const r=await callOracle(deck,session,images,demo); if(!r||!r.cards)throw new Error("empty"); setCards(r.cards); setAnswer(r.suggestedAnswer||""); setPhase("done"); const summary=r.cards.map((c,i)=>{c.error?"[unread]":c.cardName}`).join(" | ");

onUpdate(deck.id,summary,images,{cards:r.cards,suggestedAnswer:r.suggestedAnswer||""});

}catch(e){

setErrMsg("The oracle encountered an issue. Please try again or use Demo Mode.");

setPhase("upload");

}

setLoading(false);

}


function reset(){

setImages({});setCards(null);setAnswer(null);

setPhase("upload");setResetConfirm(false);setErrMsg("");

setResetOk("✓ Step reset. Re-upload your cards.");

onUpdate(deck.id,null,{},null);

setTimeout(()=>setResetOk(""),3500);

}


return(

<div style={{display:"flex",flexDirection:"column",minHeight:"100vh"}}>

<Nav session={session} cur={deckIdx} onGo={onGoTo}/>

<div style={{padding:"18px 16px 44px",flex:1}}>


{/* Header */}

<div style={{textAlign:"center",marginBottom:16}}>

<Dots step={3} total={4}/>

<div style={{fontSize:42,animation:"float 3s infinite",display:"inline-block",marginBottom:5}}>{deck.emoji}</div>

<div style={{color:deck.light,fontSize:10,fontWeight:700,letterSpacing:3,textTransform:"uppercase",marginBottom:3}}>Step {deckIdx+1} of 5 — Section 3</div>

<h2 style={{fontFamily:"Palatino Linotype,serif",color:GOLD,fontSize:20,margin:"0 0 2px"}}>{deck.name}</h2>

<div style={{color:CREAM,fontSize:12,opacity:0.6}}>{deck.subtitle}</div>

<Divider/>

</div>


{/* Progress */}

<div style={{marginBottom:14}}>

<div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>

<span style={{color:CREAM,fontSize:10,opacity:0.4}}>Reading progress</span>

<span style={{color:GOLD,fontSize:10,fontWeight:700}}>{deckIdx+1} / {DECKS.length} decks</span>

</div>

<div style={{height:4,background:"rgba(201,168,76,0.08)",borderRadius:4}}>

<div style={{height:"100%",borderRadius:4,background:linear-gradient(90deg,${GOLD},${deck.light}),width:${((deckIdx+1)/DECKS.length)*100}%`,transition:"width 0.5s"}}/>

</div>

</div>


{/* Question */}

<Box style={{marginBottom:12,background:``${area?.color||"#1a0a30"}88`}}>

<Label style={{marginBottom:4}}>{area?.emoji} YOUR QUESTION</Label>

<div style={{color:CREAM,fontSize:12,fontStyle:"italic",lineHeight:1.6}}>"{session.question}"</div>

</Box>


{/* Purpose */}

<Box style={{marginBottom:12}}>

<Label>✦ PURPOSE OF THIS DECK</Label>

<p style={{color:CREAM,fontSize:12,lineHeight:1.7,margin:0}}>{deck.purpose}</p>

</Box>


{/* Instructions */}

<Box style={{marginBottom:18,border:1px solid ${deck.light}33,background:``${deck.color}55}}>

<Label style={{color:deck.light}}>✦ INSTRUCTIONS</Label>

<p style={{color:CREAM,fontSize:12,lineHeight:1.75,margin:0}}>{deck.instruction}</p>

</Box>


{/* Status messages */}

{resetOk&&<div style={{color:"#7CFC00",fontSize:12,textAlign:"center",marginBottom:12,padding:"8px 14px",background:"rgba(100,200,100,0.06)",border:"1px solid rgba(100,200,100,0.18)",borderRadius:9,animation:"fi 0.3s ease"}}>{resetOk}</div>}

{errMsg&&<div style={{color:"#ff9090",fontSize:12,textAlign:"center",marginBottom:12,padding:"8px 14px",background:"rgba(255,80,80,0.06)",border:"1px solid rgba(255,80,80,0.18)",borderRadius:9}}>⚠ {errMsg}</div>}


{/* ═══ UPLOAD PHASE ═══ */}

{phase==="upload"&&(

<div>

<div style={{background:"rgba(201,168,76,0.05)",border:"1px solid rgba(201,168,76,0.18)",borderRadius:10,padding:"10px 13px",marginBottom:14,display:"flex",gap:10,alignItems:"flex-start"}}>

<span style={{fontSize:17,flexShrink:0}}>📱</span>

<div>

<div style={{color:GOLD,fontSize:11,fontWeight:700,marginBottom:2}}>Camera & Gallery</div>

<div style={{color:CREAM,fontSize:11,lineHeight:1.6,opacity:0.75}}>Camera and gallery work on your <b style={{color:GOLD}}>real phone browser</b> after deploying to Netlify. Use <b style={{color:GOLD}}>Demo Mode</b> below to test here in Claude.</div>

</div>

</div>

<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}>

<Label style={{marginBottom:0}}>✦ UPLOAD YOUR {deck.cards.length} CARDS</Label>

<div style={{color:CREAM,fontSize:10,opacity:0.45}}>{uploaded}/{deck.cards.length}</div>

</div>

<div style={{height:3,background:"rgba(201,168,76,0.08)",borderRadius:4,marginBottom:16}}>

<div style={{height:"100%",borderRadius:4,background:GOLD,width:${(uploaded/deck.cards.length)*100}%,transition:"width 0.4s"}}/&gt; &lt;/div&gt; {deck.cards.map(card=&gt;( &lt;UploadSlot key={card.id} card={card} value={images[card.id]} deckLight={deck.light} deckColor={deck.color} onChange={img=&gt;setImages(p=&gt;({...p,[card.id]:img}))}/&gt; ))} &lt;div style={{display:"flex",flexDirection:"column",gap:10,alignItems:"center",marginTop:20}}&gt; &lt;Btn onClick={()=&gt;read(false)} disabled={!allUp} full&gt; {allUp?✦ Interpret the ${deck.subtitle} Cards:Upload all ${deck.cards.length} cards to continue`}

</Btn>

{!allUp&&<div style={{color:CREAM,fontSize:10,opacity:0.35}}>{deck.cards.length-uploaded} more card{deck.cards.length-uploaded!==1?"s":""} needed</div>}

<div style={{width:"100%",borderTop:"1px solid rgba(201,168,76,0.12)",paddingTop:12,marginTop:2,textAlign:"center"}}>

<div style={{color:CREAM,fontSize:10,opacity:0.25,marginBottom:8,letterSpacing:1}}>— OR TEST WITHOUT UPLOADING —</div>

<Btn onClick={()=>read(true)} purple full>✦ Demo Mode — Read Without Uploading</Btn>

<div style={{color:CREAM,fontSize:10,opacity:0.22,marginTop:6,lineHeight:1.5}}>AI generates a full reading. Upload real card photos on your phone for actual interpretations.</div>

</div>

</div>

</div>

)}


{/* ═══ LOADING ═══ */}

{phase==="loading"&&<Spinner label={loadMsg}/>}


{/* ═══ DONE PHASE ═══ */}

{phase==="done"&&cards&&(

<div>


{/* Card image previews */}

{Object.values(images).some(Boolean)&&(

<div style={{marginBottom:20}}>

<Label>✦ CARDS DRAWN</Label>

<div style={{display:"flex",gap:8,flexWrap:"wrap"}}>

{deck.cards.map((card,i)=>images[card.id]?(

<div key={card.id} style={{textAlign:"center",position:"relative"}}>

<img src={images[card.id]} alt={card.role} style={{

width:64,height:94,objectFit:"cover",borderRadius:9,

border:2px solid${cards[i]?.error?"#ff6b6b":deck.light+"55"}, boxShadow:0 3px 12px ${deck.color}88,

filter:cards[i]?.error?"grayscale(50%) brightness(0.7)":"none"

}}/>

{cards[i]?.error&&(

<div style={{position:"absolute",top:2,right:2,width:18,height:18,borderRadius:"50%",

background:"#ff4444",display:"flex",alignItems:"center",justifyContent:"center",

fontSize:10,color:"white",fontWeight:700}}>!</div>

)}

<div style={{color:cards[i]?.error?"#ff9090":CREAM,fontSize:8,opacity:0.6,marginTop:3,maxWidth:64,lineHeight:1.2}}>{card.role}</div>

</div>

):null)}

</div>

</div>

)}


{/* ═══ CARD INTERPRETATIONS ═══ */}

<Label style={{marginBottom:14}}>✦ CARD INTERPRETATIONS</Label>

{cards.map((cd,i)=>(

<CardBlock key={i} cd={cd} cardMeta={deck.cards[i]}

deckLight={deck.light} deckColor={deck.color} idx={i}/>

))}


{/* ═══ ERROR SUMMARY BANNER ═══ */}

{hasErrors&&(

<div style={{background:"rgba(180,30,30,0.1)",border:"1.5px solid rgba(255,80,80,0.32)",borderRadius:12,padding:"14px 16px",marginBottom:18,animation:"fi 0.3s ease"}}>

<div style={{color:"#ff9090",fontSize:15,fontWeight:700,fontFamily:"Palatino Linotype,serif",marginBottom:7}}>

⚠ {errorCards.length} Card{errorCards.length>1?"s":""} Could Not Be Read

</div>

<div style={{color:CREAM,fontSize:12,lineHeight:1.65,opacity:0.82,marginBottom:12}}>

The following card{errorCards.length>1?"s were":" was"} unclear or unreadable. You must reset this step and re-upload clearer photos before you can proceed.

</div>

{errorCards.map((ec,i)=>(

<div key={i} style={{display:"flex",alignItems:"flex-start",gap:8,padding:"6px 0",borderBottom:i<errorCards.length-1?"1px solid rgba(255,80,80,0.12)":"none"}}>

<span style={{color:"#ff9090",fontSize:15,flexShrink:0}}>⚠</span>

<div>

<span style={{color:"#ffaa88",fontSize:12,fontWeight:700}}>{deck.cards[ec.idx]?.label} ({deck.cards[ec.idx]?.role})</span>

<div style={{color:CREAM,fontSize:11,opacity:0.65,marginTop:2}}>{ec.errorReason||"Unclear image — please retake with better lighting"}</div>

</div>

</div>

))}

<div style={{marginTop:14}}>

<Btn onClick={()=>setResetConfirm(true)} danger full>↺ Reset & Re-upload Clearer Photos</Btn>

</div>

</div>

)}


{/* ═══ SUGGESTED ANSWER — only when all cards OK ═══ */}

{allOk&&answer&&answer.length>10&&(

<div style={{marginBottom:22}}>

<Label style={{marginBottom:12}}>✦ SUGGESTED ANSWER TO YOUR QUESTION</Label>

<SuggestedAnswer answer={answer} deck={deck}/>

</div>

)}


{/* ═══ ACTION BUTTONS ═══ */}

<div style={{display:"flex",flexDirection:"column",gap:10,marginTop:8}}>


{/* Reset confirm */}

{!resetConfirm?(

<button onClick={()=>setResetConfirm(true)} className="hg" style={{background:"transparent",border:"1px solid rgba(255,100,100,0.22)",borderRadius:30,padding:"9px 20px",cursor:"pointer",color:"rgba(255,150,150,0.65)",fontSize:12,fontFamily:"inherit",transition:"all 0.2s"}}>

↺ Reset This Step & Re-upload Cards

</button>

):(

<div style={{background:"rgba(180,30,30,0.08)",border:"1px solid rgba(255,80,80,0.25)",borderRadius:12,padding:14,animation:"fi 0.2s ease"}}>

<div style={{color:"#ff9090",fontSize:13,fontFamily:"Palatino Linotype,serif",fontWeight:700,textAlign:"center",marginBottom:7}}>Reset this step?</div>

<p style={{color:CREAM,fontSize:11,opacity:0.6,textAlign:"center",margin:"0 0 12px",lineHeight:1.5}}>All uploaded card images and interpretations for this step will be cleared. You will re-upload and re-read.</p>

<div style={{display:"flex",gap:8,justifyContent:"center"}}>

<Btn onClick={()=>setResetConfirm(false)} outline sm>Cancel</Btn>

<Btn onClick={reset} danger sm>Yes, Reset</Btn>

</div>

</div>

)}


{/* Proceed / blocked */}

{!resetConfirm&&(

canProceed?(

isLast?(

allDone?(

<Btn onClick={onClose} full>✦ View Your Complete Reading Summary</Btn>

):(

<div>

<div style={{color:"#ffaa44",fontSize:11,textAlign:"center",marginBottom:10,padding:"9px 12px",background:"rgba(255,150,50,0.05)",border:"1px solid rgba(255,150,50,0.18)",borderRadius:9}}>

⚠ Complete all 5 deck steps before viewing the Summary

</div>

<div style={{display:"flex",flexDirection:"column",gap:6}}>

{DECKS.map(d=>{

const done=!!session.deckResults[d.id];

return(

<div key={d.id} style={{display:"flex",alignItems:"center",gap:9,padding:"7px 12px",borderRadius:8,

background:done?"rgba(100,200,100,0.05)":"rgba(255,100,100,0.05)",

border:1px solid${done?"rgba(100,200,100,0.14)":"rgba(255,100,100,0.14)"}`}}>

<span style={{fontSize:13}}>{d.emoji}</span>

<span style={{color:done?"#7CFC00":"#ff9090",fontSize:11,flex:1}}>{d.subtitle}</span>

<span style={{fontSize:11}}>{done?"✓":"○"}</span>

</div>

);

})}

</div>

</div>

)

):(

<Btn onClick={onNext} full>Continue to {DECKS[deckIdx+1]?.subtitle} {DECKS[deckIdx+1]?.emoji}</Btn>

)

):(

hasErrors?(

<div style={{textAlign:"center",padding:"6px 0"}}>

<div style={{color:"#ff9090",fontSize:12,marginBottom:8}}>⚠ Fix the unreadable card{errorCards.length>1?"s":""} above before you can proceed</div>

<Btn disabled full>Proceed (Fix Card Errors First)</Btn>

</div>

):(

<div style={{textAlign:"center",padding:"6px 0"}}>

<div style={{color:"#ffaa44",fontSize:12}}>Waiting for all cards to be successfully interpreted...</div>

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


// ── WELCOME ────────────────────────────────────────────────────────

function Welcome({onStart,onResume,has}){

return(

<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh",padding:"24px 20px",textAlign:"center"}}>

<div style={{animation:"float 3s infinite",fontSize:66,marginBottom:6}}>🔮</div>

<div style={{fontFamily:"Palatino Linotype,serif",fontSize:10,color:GOLD,letterSpacing:6,textTransform:"uppercase",marginBottom:5,opacity:0.7}}>The Sacred Reading</div>

<h1 style={{fontFamily:"Palatino Linotype,serif",fontSize:30,color:GOLD,margin:"0 0 5px",lineHeight:1.2,textShadow:"0 0 28px rgba(201,168,76,0.4)"}}>Mystical Card<br/>Reader</h1>

<Divider/>

<p style={{color:CREAM,fontSize:13,lineHeight:1.7,maxWidth:300,opacity:0.78,margin:"10px 0 22px"}}>A sacred 5-deck system revealing your current energy, root cause, cosmic influences, action plan and most likely outcome.</p>

<div style={{display:"flex",gap:7,marginBottom:26,flexWrap:"wrap",justifyContent:"center"}}>

{DECKS.map(d=><div key={d.id} style={{background:${d.color}88,border:1px solid ${d.light}33,borderRadius:20,padding:"5px 11px",fontSize:10,color:CREAM,display:"flex",alignItems:"center",gap:5}}><span>{d.emoji}</span><span>{d.subtitle}</span></div>)}

</div>

<div style={{display:"flex",flexDirection:"column",gap:11,width:"100%",maxWidth:260}}>

<Btn onClick={onStart} full>✦ Begin New Session ✦</Btn>

{has&&<Btn onClick={onResume} outline full>↩ Resume Session</Btn>}

</div>

<p style={{color:CREAM,fontSize:10,opacity:0.24,marginTop:20,lineHeight:1.6}}>"A structured mirror — clarity, root cause,<br/>and a concrete action plan."</p>

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

<Divider/>

<p style={{color:CREAM,fontSize:12,opacity:0.6,margin:0}}>Building trust before the sacred reading begins</p>

</div>

<Box style={{marginBottom:13}}><Label>✦ OPENING SCRIPT</Label><p style={{color:CREAM,fontSize:13,lineHeight:1.8,fontStyle:"italic",margin:0}}>"Thank you for trusting me with your questions today. I use a powerful system of 5 specialist decks — each chosen for a specific role. Think of them as a council of 5 advisors, each with a different area of expertise."</p></Box>

<div style={{marginBottom:13}}>

<Label>✦ THE 5-DECK COUNCIL</Label>

{DECKS.map((d,i)=><div key={d.id} style={{display:"flex",gap:10,padding:"11px 13px",marginBottom:7,background:${d.color}66,border:1px solid ${d.light}33,borderRadius:12,animation:up 0.3s ${i*0.07}s ease both`}}><span style={{fontSize:21,flexShrink:0}}>{d.emoji}</span><div><div style={{color:d.light,fontSize:12,fontWeight:700,fontFamily:"Palatino Linotype,serif"}}>{d.name}</div><div style={{color:GOLD,fontSize:9,marginBottom:2}}>{d.subtitle}</div><div style={{color:CREAM,fontSize:11,opacity:0.78,lineHeight:1.5}}>{d.purpose}</div></div></div>)}

</div>

<Box style={{marginBottom:13}}>

<Label>✦ THE READING JOURNEY</Label>

<div style={{display:"flex",alignItems:"center",gap:4,flexWrap:"wrap",justifyContent:"center"}}>

{["Current Energy","Root Cause","Influences","Action Plan","Outcome"].map((s,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:4}}><div style={{background:"rgba(201,168,76,0.09)",border:"1px solid rgba(201,168,76,0.22)",borderRadius:20,padding:"3px 9px",fontSize:10,color:CREAM}}>{s}</div>{i<4&&<span style={{color:GOLD,opacity:0.36,fontSize:11}}>→</span>}</div>)}

</div>

<p style={{color:CREAM,fontSize:11,opacity:0.55,margin:"10px 0 0",textAlign:"center",lineHeight:1.6}}>A structured mirror — not fortune-telling. Clarity, root cause and an action plan.</p>

</Box>

<Box style={{marginBottom:22}}>

<Label>✦ IMPORTANT TO KNOW</Label>

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

const [err,setErr]=useState("");

const aData=LIFE_AREAS.find(a=>a.id===area);

const valid=q.trim().length>=15;


function go(){

if(!area){setErr("Please select an area of life");return;}

if(!valid){setErr("Please describe your question in at least 15 characters");return;}

onUpdate({lifeArea:area,question:q.trim()});onNext();

}


return(

<div style={{padding:"20px 16px",animation:"up 0.4s ease"}}>

<Dots step={2} total={4}/>

<div style={{textAlign:"center",marginBottom:16}}>

<div style={{fontSize:36,marginBottom:5}}>🌿</div>

<div style={{fontFamily:"Palatino Linotype,serif",color:GOLD,fontSize:10,letterSpacing:4,textTransform:"uppercase",marginBottom:4}}>Section 2</div>

<h2 style={{fontFamily:"Palatino Linotype,serif",color:GOLD,fontSize:21,margin:0}}>Your Sacred Question</h2>

<Divider/>

<p style={{color:CREAM,fontSize:12,opacity:0.6,margin:0}}>Choose one area of life and describe your question</p>

</div>

<div style={{marginBottom:18}}>

<Label>✦ STEP 1: Choose Your Area of Life</Label>

<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>

{LIFE_AREAS.map(a=>(

<button key={a.id} className="ha" onClick={()=>{setArea(a.id);setErr("");}} style={{background:area===a.id?${a.color}cc`:`$`{a.color}44`,border:`1.5px solid `${area===a.id?GOLD:`$`{a.color}77`}`,borderRadius:11,padding:"11px 8px",cursor:"pointer",display:"flex",alignItems:"center",gap:7,transition:"all 0.2s",boxShadow:area===a.id?`0 3px 14px `${a.color}55`:"none"}}&gt; &lt;span style={{fontSize:18}}&gt;{a.emoji}&lt;/span&gt; &lt;span style={{color:area===a.id?GOLD:CREAM,fontSize:11,fontFamily:"Palatino Linotype,serif",fontWeight:area===a.id?700:400,textAlign:"left",lineHeight:1.3}}&gt;{a.label}&lt;/span&gt; &lt;/button&gt; ))} &lt;/div&gt; &lt;/div&gt; &lt;div style={{marginBottom:18}}&gt; &lt;Label&gt;✦ STEP 2: Describe Your Question&lt;/Label&gt; &lt;textarea value={q} onChange={e=&gt;{setQ(e.target.value);setErr("");}} placeholder="Describe your situation and question in your own words..." style={{width:"100%",minHeight:95,background:"rgba(20,8,40,0.82)",border:`1.5px solid $`{q.length&gt;0&&valid?GOLD:"rgba(201,168,76,0.25)"}`,borderRadius:11,padding:13,color:CREAM,fontSize:13,lineHeight:1.6,fontFamily:"Palatino Linotype,serif",resize:"none",outline:"none",boxSizing:"border-box",transition:"border 0.2s"}}/&gt; &lt;div style={{display:"flex",justifyContent:"space-between",marginTop:4}}&gt; &lt;span style={{color:valid?"#7CFC00":"rgba(245,230,200,0.35)",fontSize:11}}&gt;{valid?"✓ Ready to proceed":${Math.max(0,15-q.trim().length)} more characters needed`}</span>

<span style={{color:"rgba(245,230,200,0.3)",fontSize:11}}>{q.length}</span>

</div>

</div>

{aData&&(

<Box style={{marginBottom:18}}>

<Label>{aData.emoji} EXAMPLE QUESTIONS — {aData.label.toUpperCase()}</Label>

<div style={{display:"flex",flexDirection:"column",gap:5}}>

{aData.questions.map((qs,i)=>(

<button key={i} className="hq" onClick={()=>{setQ(qs);setErr("");}} style={{background:"rgba(201,168,76,0.05)",border:"1px solid rgba(201,168,76,0.16)",borderRadius:8,padding:"7px 11px",cursor:"pointer",textAlign:"left",color:CREAM,fontSize:12,lineHeight:1.5,transition:"all 0.15s",fontFamily:"inherit"}}>

<span style={{color:GOLD,marginRight:5}}>›</span>{qs}

</button>

))}

</div>

<div style={{color:CREAM,fontSize:10,opacity:0.38,marginTop:7}}>Tap any example to use it, or write your own above</div>

</Box>

)}

{err&&<div style={{color:"#FF6B6B",fontSize:12,textAlign:"center",marginBottom:11,padding:"8px 14px",background:"rgba(255,100,100,0.07)",border:"1px solid rgba(255,100,100,0.25)",borderRadius:8}}>⚠ {err}</div>}

<div style={{textAlign:"center"}}><Btn onClick={go} disabled={!area||!valid}>Begin the Reading ✦</Btn></div>

</div>

);

}


// ── SECTION 4: CLOSING ─────────────────────────────────────────────

function S4({session,onNew}){

const [loading,setLoading]=useState(false);

const [summary,setSummary]=useState(session.summary||null);

const area=LIFE_AREAS.find(a=>a.id===session.lifeArea);


useEffect(()=>{if(!summary)gen();},[]);


async function gen(){

setLoading(true);

try{

const parts=DECKS.map(d=>{

const cd=session.deckCardData?.[d.id];

if(!cd||!cd.cards)return${d.emoji} ${d.name}: Not completed;

const names=cd.cards.map((c,i)=>c.error?"[unread]":c.cardName).join(", ");

return${d.emoji} ${d.name} (${d.subtitle}) — Cards: ${names}\nSuggested answer excerpt: ${(cd.suggestedAnswer||"").substring(0,200)}`;

}).join("\n\n");


const prompt=`You are a professional mystical card reader closing a full 5-deck reading session.


Client area: ${area?.label} Client question: "${session.question}"


5-deck readings completed:

`${parts}


Write the professional closing summary narrative (under 300 words):

1. Open with: "Let me bring everything together into one clear narrative for you."

2. Reference each deck's key card names and messages naturally in one flowing story

3. Include naturally: (a) they are in control — cards show probability not destiny, (b) complete at least ONE action before seeking another reading

4. Close with a warm empowering sentence


Flowing paragraphs only. Warm, professional, mystical tone. No bullet points.`;


const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":ANTHROPIC_API_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:700,messages:[{role:"user",content:prompt}]})});

const data=await res.json();

const text=data.content?.map(b=>b.text||"").join("")||fallback();

setSummary(text);

}catch(e){setSummary(fallback());}

setLoading(false);

}


function fallback(){

returnLet me bring everything together into one clear narrative for you.\n\nYour Crystal Reading revealed the emotional truth you are carrying right now. The Egyptian Oracle uncovered the deeper soul lesson beneath your challenge. Your Astrology Cards illuminated the cosmic forces and timing at work. The Magic Oracle gave you concrete steps to take forward. And the Mystical Tarot mapped your most likely path ahead.\n\nRemember: you are in complete control. These cards show probability, not destiny. Do not seek another reading until you have completed at least ONE action from your plan — readings without action become avoidance, not growth.\n\nThank you for the trust you placed in this sacred space today. The work you do on yourself ripples outward into everyone around you. Go well. ✦;

}


return(

<div style={{padding:"20px 16px 36px",animation:"up 0.4s ease"}}>

<Dots step={4} total={4}/>

<div style={{textAlign:"center",marginBottom:20}}>

<div style={{fontSize:44,animation:"float 3s infinite",marginBottom:6}}>✦</div>

<div style={{fontFamily:"Palatino Linotype,serif",color:GOLD,fontSize:10,letterSpacing:4,textTransform:"uppercase",marginBottom:5}}>Section 4 — Closing</div>

<h2 style={{fontFamily:"Palatino Linotype,serif",color:GOLD,fontSize:21,margin:0}}>Your Complete Reading</h2>

<Divider/>

<p style={{color:CREAM,fontSize:12,opacity:0.6,margin:0}}>The 5-deck narrative woven into one clear message</p>

</div>


<Box style={{marginBottom:14,background:${area?.color||"#1a0a30"}88`}}>

<Label style={{marginBottom:4}}>{area?.emoji} READING FOR</Label>

<div style={{color:CREAM,fontSize:12,fontStyle:"italic",lineHeight:1.6}}>"{session.question}"</div>

</Box>


{/* Journey recap with card names /}

<div style={{marginBottom:18}}>

<Label>✦ YOUR 5-DECK JOURNEY</Label>

{DECKS.map((d,i)=>{

const cd=session.deckCardData?.[d.id];

const cardNames=cd?.cards?.filter(c=>!c.error).map(c=>c.cardName).join(" · ")||"";

return(

<div key={d.id} style={{background:``${d.color}66,border:1px solid {d.light}33`,borderRadius:11,padding:"10px 13px",marginBottom:7,animation:`up 0.3s {i0.08}s ease both`}}>

<div style={{display:"flex",alignItems:"center",gap:8,marginBottom:cardNames?6:0}}>

<span style={{fontSize:17,flexShrink:0}}>{d.emoji}</span>

<div>

<div style={{color:d.light,fontSize:10,fontWeight:700,letterSpacing:0.5}}>{d.subtitle.toUpperCase()} — {d.name}</div>

</div>

<div style={{marginLeft:"auto",color:session.deckResults[d.id]?"#7CFC00":"#ff9090",fontSize:11}}>{session.deckResults[d.id]?"✓":"○"}</div>

</div>

{cardNames&&<div style={{color:GOLD,fontSize:11,fontStyle:"italic",paddingLeft:25,lineHeight:1.5}}>{cardNames}</div>}

</div>

);

})}

</div>


{/* Narrative */}

<Box style={{marginBottom:20,border:1px solid ${GOLD}44`}}>

<Label>✦ THE ORACLE'S FINAL NARRATIVE</Label>

{loading?(

<Spinner label="Weaving your complete reading narrative"/>

):(

<div style={{color:CREAM,fontSize:13,lineHeight:1.85,fontStyle:"italic",whiteSpace:"pre-wrap"}}>{summary}</div>

)}

</Box>


{/* Reminders */}

<Box style={{marginBottom:22,background:"rgba(201,168,76,0.05)",border:1px solid${GOLD}28}}&gt; &lt;Label&gt;✦ BEFORE YOU GO&lt;/Label&gt; {[ {n:"1",t:"You are in control",b:"The cards show probability, not destiny. The action plan is a powerful suggestion — but you are always the author of your own life."}, {n:"2",t:"Action before another reading",b:"Do not seek another reading until you have completed at least ONE action from your plan. Readings without action become avoidance, not growth."}, ].map(r=&gt;( &lt;div key={r.n} style={{display:"flex",gap:11,marginBottom:13,alignItems:"flex-start"}}&gt; &lt;div style={{width:26,height:26,borderRadius:"50%",background:"rgba(201,168,76,0.14)",border:1px solid ${GOLD}`,display:"flex",alignItems:"center",justifyContent:"center",color:GOLD,fontSize:12,fontWeight:700,flexShrink:0}}>{r.n}</div>

<div>

<div style={{color:GOLD,fontSize:12,fontWeight:700,marginBottom:2}}>{r.t}</div>

<div style={{color:CREAM,fontSize:11,lineHeight:1.6,opacity:0.8}}>{r.b}</div>

</div>

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

const [dismissBanner,setDismissBanner]=useState(false);


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


function updateDeck(deckId,result,images,cardData){

setSession(p=>({

...p,

deckResults:{...p.deckResults,[deckId]:result},

deckImages:{...p.deckImages,[deckId]:images||{}},

deckCardData:{...p.deckCardData,[deckId]:cardData},

}));

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


{/* Back button */}

{screen!=="welcome"&&(

<div style={{position:"fixed",top:12,left:12,zIndex:200}}>

<button onClick={goBack} style={{background:"rgba(20,8,40,0.92)",border:"1px solid rgba(201,168,76,0.25)",borderRadius:"50%",width:34,height:34,cursor:"pointer",color:GOLD,fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(8px)"}}>←</button>

</div>

)}


{/* API Key warning — only shows if key is missing/placeholder AND not dismissed */}

{!dismissBanner&&(ANTHROPIC_API_KEY===""||ANTHROPIC_API_KEY==="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")&&(

<div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:999,

background:"rgba(140,60,0,0.98)",borderTop:"2px solid #FF8C42",

padding:"12px 16px",maxWidth:480,margin:"0 auto",

display:"flex",gap:12,alignItems:"flex-start"}}>

<div style={{flex:1}}>

<div style={{color:"#FFD180",fontSize:12,fontWeight:700,marginBottom:4}}>

🔑 API Key Not Set

</div>

<div style={{color:"#FFE0B2",fontSize:11,lineHeight:1.6}}>

Open <b>src/App.js</b> on GitHub, find line 10 and paste your key from <b>console.anthropic.com</b>. Use <b>Demo Mode</b> to test until then.

</div>

</div>

<button onClick={()=>setDismissBanner(true)} style={{

background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,200,100,0.4)",

borderRadius:"50%",width:28,height:28,cursor:"pointer",

color:"#FFD180",fontSize:16,display:"flex",alignItems:"center",

justifyContent:"center",flexShrink:0,fontFamily:"inherit",marginTop:2}}>

✕

</button>

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
