// netlify/functions/oracle.js
// Uses Node built-in https — no npm packages needed

const https = require("https");

function callAnthropic(key, messages) {
  return new Promise((resolve, reject) => {
    const bodyStr = JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2000,
      messages: messages
    });

    const options = {
      hostname: "api.anthropic.com",
      path: "/v1/messages",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(bodyStr),
        "x-api-key": key,
        "anthropic-version": "2023-06-01"
      }
    };

    const req = https.request(options, (res) => {
      let raw = "";
      res.on("data", chunk => raw += chunk);
      res.on("end", () => {
        resolve({ status: res.statusCode, raw });
      });
    });

    req.on("error", err => reject(err));
    req.write(bodyStr);
    req.end();
  });
}

exports.handler = async (event) => {

  const CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
  };

  // CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: CORS, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  // Check API key
  const key = (process.env.ANTHROPIC_KEY || "").trim();
  if (!key) {
    return {
      statusCode: 500, headers: CORS,
      body: JSON.stringify({ error: "ANTHROPIC_KEY not set in Netlify environment variables" })
    };
  }
  if (!key.startsWith("sk-")) {
    return {
      statusCode: 500, headers: CORS,
      body: JSON.stringify({ error: `API key format invalid — starts with: ${key.substring(0,6)}` })
    };
  }

  // Parse body
  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch (e) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }

  const { prompt, cardImages, demo } = body;
  if (!prompt) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Missing prompt" }) };
  }

  // Build message content
  const content = [];

  if (!demo && Array.isArray(cardImages) && cardImages.length > 0) {
    cardImages.forEach(ci => {
      if (ci.data && ci.mediaType) {
        content.push({
          type: "image",
          source: { type: "base64", media_type: ci.mediaType, data: ci.data }
        });
        content.push({
          type: "text",
          text: `Above image is ${ci.label} (${ci.role}): ${ci.desc}`
        });
      }
    });
  }

  content.push({ type: "text", text: prompt });

  // Call Anthropic
  try {
    const result = await callAnthropic(key, [{ role: "user", content }]);

    let parsed;
    try {
      parsed = JSON.parse(result.raw);
    } catch (e) {
      return {
        statusCode: 500, headers: CORS,
        body: JSON.stringify({ error: `Anthropic returned non-JSON. Status: ${result.status}. Body: ${result.raw.substring(0, 200)}` })
      };
    }

    if (result.status !== 200) {
      const msg = parsed?.error?.message || parsed?.error?.type || `HTTP ${result.status}`;
      return {
        statusCode: result.status, headers: CORS,
        body: JSON.stringify({ error: `Anthropic error: ${msg}` })
      };
    }

    const text = parsed?.content?.map(b => b.text || "").join("") || "{}";
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ result: text }) };

  } catch (err) {
    return {
      statusCode: 500, headers: CORS,
      body: JSON.stringify({ error: `Network error calling Anthropic: ${err.message}` })
    };
  }
};
