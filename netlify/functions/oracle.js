// netlify/functions/oracle.js
// Mystical 5-Deck Reading System — DeepSeek Backend
// SETUP: Add DEEPSEEK_KEY in Netlify → Site config → Environment variables
// Get your key at: platform.deepseek.com → API Keys

const https = require("https");

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

// ── DeepSeek API call with 8s timeout ─────────────────────────
function deepseek(key, messages, maxTokens) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: "deepseek-chat",
      max_tokens: maxTokens || 1500,
      temperature: 0.7,
      messages,
    });

    const opts = {
      hostname: "api.deepseek.com",
      path: "/v1/chat/completions",
      method: "POST",
      timeout: 8000, // 8 second timeout — stays under Netlify's 10s limit
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

    // Handle timeout
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("TIMEOUT: DeepSeek request timed out after 8 seconds"));
    });

    req.on("error", err => reject(err));
    req.write(body);
    req.end();
  });
}

exports.handler = async event => {

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
      body: JSON.stringify({ error: "DEEPSEEK_KEY not set. Add it in Netlify → Site configuration → Environment variables" }) };
  }
  if (!key.startsWith("sk-")) {
    return { statusCode: 500, headers: CORS,
      body: JSON.stringify({ error: `DeepSeek key invalid — starts with "${key.substring(0,8)}" but should start with "sk-"` }) };
  }

  // Parse body
  let body;
  try { body = JSON.parse(event.body || "{}"); }
  catch (_) { return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Invalid JSON body" }) }; }

  // ── MODE 1: OCR ───────────────────────────────────────────────
  if (body.ocr === true) {
    const { imageMediaType, imageData, cardRole, cardLabel } = body;
    if (!imageData) return { statusCode: 200, headers: CORS, body: JSON.stringify({ cardName: "", confidence: 0 }) };
    if (imageData.length > 800000) return { statusCode: 200, headers: CORS, body: JSON.stringify({ cardName: "", confidence: 0, warning: "Image too large. Please type the card name manually." }) };

    try {
      const result = await deepseek(key, [{
        role: "user",
        content: [
          { type: "image_url", image_url: { url: `data:${imageMediaType};base64,${imageData}` } },
          { type: "text", text: `Look at this mystical card image. Identify the card name printed on it (usually top or bottom). Card position: ${cardLabel} (${cardRole}). Return ONLY raw JSON: {"cardName":"exact name","confidence":85}. If unreadable: {"cardName":"","confidence":0}` }
        ]
      }], 100);

      if (result.status !== 200) return { statusCode: 200, headers: CORS, body: JSON.stringify({ cardName: "", confidence: 0 }) };

      const parsed = JSON.parse(result.raw);
      const text = parsed?.choices?.[0]?.message?.content || "{}";
      const clean = text.replace(/^```(?:json)?\s*/,"").replace(/\s*```$/,"").trim();
      let ocrResult = { cardName: "", confidence: 0 };
      try { ocrResult = JSON.parse(clean); } catch(_) {}
      if (typeof ocrResult.confidence !== "number") ocrResult.confidence = 0;
      if (typeof ocrResult.cardName   !== "string")  ocrResult.cardName   = "";
      return { statusCode: 200, headers: CORS, body: JSON.stringify(ocrResult) };
    } catch(_) {
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ cardName: "", confidence: 0 }) };
    }
  }

  // ── MODE 2: ORACLE ────────────────────────────────────────────
  const { prompt } = body;
  if (!prompt) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Missing prompt" }) };

  try {
    const result = await deepseek(key, [
      { role: "system", content: "You are a professional mystical card reader. Always respond with valid raw JSON only — no markdown, no extra text." },
      { role: "user",   content: prompt },
    ], 1500);

    // Parse DeepSeek response
    let parsed;
    try { parsed = JSON.parse(result.raw); }
    catch (_) {
      return { statusCode: 500, headers: CORS,
        body: JSON.stringify({ error: `DeepSeek returned invalid response (HTTP ${result.status}). Please retry.` }) };
    }

    // Handle DeepSeek API errors
    if (result.status !== 200) {
      const msg = parsed?.error?.message || parsed?.error?.type || `HTTP ${result.status}`;
      // Provide specific helpful messages for known errors
      if (result.status === 401) return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: "Invalid DeepSeek API key. Check DEEPSEEK_KEY in Netlify environment variables." }) };
      if (result.status === 402) return { statusCode: 402, headers: CORS, body: JSON.stringify({ error: "DeepSeek account has no credits. Top up at platform.deepseek.com → Billing." }) };
      if (result.status === 429) return { statusCode: 429, headers: CORS, body: JSON.stringify({ error: "DeepSeek rate limit reached. Please wait 30 seconds and retry." }) };
      return { statusCode: result.status, headers: CORS, body: JSON.stringify({ error: `DeepSeek error: ${msg}` }) };
    }

    const text = parsed?.choices?.[0]?.message?.content || "{}";
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ result: text }) };

  } catch (err) {
    // Timeout or network error
    if (err.message.includes("TIMEOUT")) {
      return { statusCode: 504, headers: CORS,
        body: JSON.stringify({ error: "Request timed out. DeepSeek took too long to respond. Please retry — it usually works on the second attempt." }) };
    }
    return { statusCode: 500, headers: CORS,
      body: JSON.stringify({ error: `Network error: ${err.message}. Please check your connection and retry.` }) };
  }
};
