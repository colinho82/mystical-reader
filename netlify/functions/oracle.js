/// netlify/functions/oracle.js
// Mystical 5-Deck Reading System — DeepSeek Backend
// Two modes: OCR (card name extraction) and Oracle (card interpretation)
// SETUP: Add DEEPSEEK_KEY in Netlify → Site config → Environment variables
// Get your key at: platform.deepseek.com → API Keys

const https = require("https");

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

// ── DeepSeek API call ──────────────────────────────────────────
function deepseek(key, messages, maxTokens) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: "deepseek-chat",
      max_tokens: maxTokens || 2000,
      temperature: 0.7,
      messages,
    });
    const opts = {
      hostname: "api.deepseek.com",
      path: "/v1/chat/completions",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
        "Authorization": `Bearer ${key}`,
      },
    };
    const req = https.request(opts, res => {
      let raw = "";
      res.on("data", c => raw += c);
      res.on("end", () => resolve({ status: res.statusCode, raw }));
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

exports.handler = async event => {
  // CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: CORS, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  // Validate API key
  const key = (process.env.DEEPSEEK_KEY || "").trim();
  if (!key) {
    return { statusCode: 500, headers: CORS,
      body: JSON.stringify({ error: "DEEPSEEK_KEY environment variable is not set. Add it in Netlify → Site configuration → Environment variables. Get your key at platform.deepseek.com" }) };
  }
  if (!key.startsWith("sk-")) {
    return { statusCode: 500, headers: CORS,
      body: JSON.stringify({ error: `DeepSeek API key format is invalid. Key starts with: "${key.substring(0,8)}". It should start with "sk-"` }) };
  }

  // Parse body
  let body;
  try { body = JSON.parse(event.body || "{}"); }
  catch (_) { return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Invalid JSON request body" }) }; }

  // ── MODE 1: OCR — Extract card name from image ────────────────
  if (body.ocr === true) {
    const { imageMediaType, imageData, cardRole, cardLabel } = body;

    if (!imageData) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Missing imageData for OCR" }) };
    }

    // Skip OCR if image is too large (>800KB base64)
    if (imageData.length > 800000) {
      return { statusCode: 200, headers: CORS,
        body: JSON.stringify({ cardName: "", confidence: 0, warning: "Image too large for auto-recognition. Please type the card name manually." }) };
    }

    const ocrPrompt = `You are a mystical card reading assistant. Examine this card image carefully.

Task: Identify the NAME of this card as printed on it.
Card position: ${cardLabel} (${cardRole})

Instructions:
1. Look for text on the card — usually at the top or bottom border
2. Extract the card title exactly as it appears
3. Ignore descriptive text, keywords or subtitles — only the main card name
4. Calculate your confidence score (0-100) in the identification

Return ONLY raw JSON — no markdown, no extra text:
{"cardName":"the exact card name","confidence":85}

If completely unreadable: {"cardName":"","confidence":0}`;

    try {
      const result = await deepseek(key, [
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: `data:${imageMediaType};base64,${imageData}` } },
            { type: "text", text: ocrPrompt }
          ]
        }
      ], 150);

      // DeepSeek vision may not be available — return gracefully
      if (result.status !== 200) {
        return { statusCode: 200, headers: CORS, body: JSON.stringify({ cardName: "", confidence: 0 }) };
      }

      let parsed;
      try { parsed = JSON.parse(result.raw); }
      catch (_) { return { statusCode: 200, headers: CORS, body: JSON.stringify({ cardName: "", confidence: 0 }) }; }

      const text = parsed?.choices?.[0]?.message?.content || "{}";
      const clean = text.replace(/^```(?:json)?\s*/,"").replace(/\s*```$/,"").trim();

      let ocrResult;
      try { ocrResult = JSON.parse(clean); }
      catch (_) { ocrResult = { cardName: "", confidence: 0 }; }

      // Validate confidence score
      if (typeof ocrResult.confidence !== "number") ocrResult.confidence = 0;
      if (typeof ocrResult.cardName !== "string")   ocrResult.cardName   = "";

      return { statusCode: 200, headers: CORS, body: JSON.stringify(ocrResult) };

    } catch (err) {
      // OCR errors must never block the user — fail gracefully
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ cardName: "", confidence: 0 }) };
    }
  }

  // ── MODE 2: ORACLE — Generate card interpretations ─────────────
  const { prompt } = body;
  if (!prompt) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Missing prompt field in request body" }) };
  }

  try {
    const result = await deepseek(key, [
      {
        role: "system",
        content: "You are a professional mystical card reader providing accurate, compassionate and personalised readings. Always respond with valid raw JSON only — no markdown fences, no preamble, no text after the JSON.",
      },
      {
        role: "user",
        content: prompt,
      },
    ], 2000);

    let parsed;
    try { parsed = JSON.parse(result.raw); }
    catch (_) {
      return { statusCode: 500, headers: CORS,
        body: JSON.stringify({ error: `DeepSeek returned invalid response. HTTP Status: ${result.status}` }) };
    }

    if (result.status !== 200) {
      const msg = parsed?.error?.message || parsed?.error?.code || `HTTP ${result.status}`;
      return { statusCode: result.status, headers: CORS,
        body: JSON.stringify({ error: `DeepSeek API error: ${msg}` }) };
    }

    const text = parsed?.choices?.[0]?.message?.content || "{}";
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ result: text }) };

  } catch (err) {
    return { statusCode: 500, headers: CORS,
      body: JSON.stringify({ error: `Network error calling DeepSeek: ${err.message}` }) };
  }
};
 ══════════════════════════════════════════════════════════════════
// NETLIFY SERVERLESS FUNCTION — oracle.js
// This runs on Netlify's servers, NOT in the browser.
// The API key is NEVER sent to the client — it stays here.
//
// SETUP:
// 1. In Netlify → Site configuration → Environment variables
//    Add variable:  ANTHROPIC_KEY = sk-ant-api03-yourkey
//    (No REACT_APP_ prefix — this is server-side only)
// 2. Deploy — the key is secure and never in your JS bundle
// ══════════════════════════════════════════════════════════════════

exports.handler = async (event) => {

  // Only allow POST requests
  if(event.httpMethod !== "POST"){
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  // Get API key from server environment — never exposed to browser
  const key = process.env.ANTHROPIC_KEY;
  if(!key){
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Missing API key — add ANTHROPIC_KEY to Netlify environment variables" })
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch(e) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid request body" })
    };
  }

  const { prompt, cardImages, demo } = body;

  if(!prompt){
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing prompt" })
    };
  }

  try {
    // Build the message content for Claude
    const userContent = [];

    // Add card images if provided (vision reading)
    if(!demo && cardImages && cardImages.length > 0){
      cardImages.forEach(ci => {
        userContent.push({
          type: "image",
          source: {
            type: "base64",
            media_type: ci.mediaType,
            data: ci.data
          }
        });
        userContent.push({
          type: "text",
          text: `Above image is ${ci.label} (${ci.role}): ${ci.desc}`
        });
      });
    }

    // Add the text prompt
    userContent.push({
      type: "text",
      text: prompt
    });

    // Call Anthropic API securely from the server
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [{ role: "user", content: userContent }]
      })
    });

    if(!response.ok){
      const errData = await response.json().catch(() => ({}));
      const errMsg = errData?.error?.message || `HTTP ${response.status}`;
      return {
        statusCode: response.status,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: errMsg })
      };
    }

    const data = await response.json();
    const result = data.content?.map(b => b.text || "").join("") || "{}";

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ result })
    };

  } catch(err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: String(err) })
    };
  }
};
