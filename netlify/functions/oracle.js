// netlify/functions/oracle.js
// Handles two modes:
//   1. OCR mode   — reads card name from uploaded image using DeepSeek Vision
//   2. Oracle mode — generates card interpretations using DeepSeek Chat
// SETUP: Add DEEPSEEK_KEY in Netlify → Site configuration → Environment variables
// Get your key at: platform.deepseek.com

const https = require("https");

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

function deepseekPost(key, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = JSON.stringify(body);
    const options = {
      hostname: "api.deepseek.com",
      path: "/v1/chat/completions",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(bodyStr),
        "Authorization": `Bearer ${key}`,
      },
    };
    const req = https.request(options, (res) => {
      let raw = "";
      res.on("data", chunk => raw += chunk);
      res.on("end", () => resolve({ status: res.statusCode, raw }));
    });
    req.on("error", reject);
    req.write(bodyStr);
    req.end();
  });
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: CORS, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const key = (process.env.DEEPSEEK_KEY || "").trim();
  if (!key) {
    return { statusCode: 500, headers: CORS,
      body: JSON.stringify({ error: "DEEPSEEK_KEY not set in Netlify environment variables. Get your key at platform.deepseek.com" }) };
  }
  if (!key.startsWith("sk-")) {
    return { statusCode: 500, headers: CORS,
      body: JSON.stringify({ error: `DeepSeek key format invalid. Starts with: "${key.substring(0,8)}"` }) };
  }

  let body;
  try { body = JSON.parse(event.body || "{}"); }
  catch (_) { return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Invalid JSON body" }) }; }

  // ── MODE 1: OCR — read card name from image ──────────────────
  if (body.ocr === true) {
    const { imageMediaType, imageData, cardRole, cardLabel } = body;
    if (!imageData) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Missing imageData" }) };
    }

    // Check image size (skip OCR if over 1MB base64)
    if (imageData.length > 1000000) {
      return { statusCode: 200, headers: CORS,
        body: JSON.stringify({ cardName: "", confidence: 0,
          warning: "Image too large for auto-recognition. Please type the card name manually." }) };
    }

    const ocrPrompt = `You are a mystical card reading assistant. Look at this card image carefully.

Your task: Identify the NAME of the card as printed on it.

Card position: ${cardLabel} (${cardRole})

Instructions:
1. Look for text on the card — usually at the top or bottom
2. Extract the card name exactly as printed
3. Return ONLY raw JSON, no markdown:

{"cardName":"the exact card name you can read","confidence":85}

If you cannot read the card name clearly, set confidence below 80 and cardName to your best guess.
If completely unreadable, set cardName to "" and confidence to 0.`;

    try {
      const result = await deepseekPost(key, {
        model: "deepseek-chat",
        max_tokens: 100,
        temperature: 0.1,
        messages: [
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: `data:${imageMediaType};base64,${imageData}` } },
              { type: "text", text: ocrPrompt }
            ]
          }
        ]
      });

      let parsed;
      try { parsed = JSON.parse(result.raw); } catch (_) {
        return { statusCode: 200, headers: CORS, body: JSON.stringify({ cardName: "", confidence: 0 }) };
      }

      if (result.status !== 200) {
        // OCR failed — return empty gracefully, don't block user
        return { statusCode: 200, headers: CORS, body: JSON.stringify({ cardName: "", confidence: 0 }) };
      }

      const text = parsed?.choices?.[0]?.message?.content || "{}";
      const clean = text.replace(/^```(?:json)?\s*/,"").replace(/\s*```$/,"").trim();
      let ocrResult;
      try { ocrResult = JSON.parse(clean); } catch (_) { ocrResult = { cardName: "", confidence: 0 }; }

      return { statusCode: 200, headers: CORS, body: JSON.stringify(ocrResult) };
    } catch (err) {
      // OCR errors should not block the user — return empty gracefully
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ cardName: "", confidence: 0 }) };
    }
  }

  // ── MODE 2: ORACLE — generate card interpretations ────────────
  const { prompt } = body;
  if (!prompt) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Missing prompt field" }) };
  }

  try {
    const result = await deepseekPost(key, {
      model: "deepseek-chat",
      max_tokens: 2000,
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: "You are an expert mystical card reader providing professional, personalised readings. Always respond with valid raw JSON only — no markdown fences, no preamble, no text after the JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    let parsed;
    try { parsed = JSON.parse(result.raw); }
    catch (_) {
      return { statusCode: 500, headers: CORS,
        body: JSON.stringify({ error: `DeepSeek returned invalid JSON. Status: ${result.status}` }) };
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
