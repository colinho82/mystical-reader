// netlify/functions/oracle.js
// Secure server-side function — API key never reaches the browser
// SETUP: Add ANTHROPIC_KEY in Netlify → Site configuration → Environment variables

const https = require("https");

function callAnthropic(key, messages, maxTokens) {
  return new Promise((resolve, reject) => {
    const bodyStr = JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: maxTokens || 2000,
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
      res.on("end", () => resolve({ status: res.statusCode, raw }));
    });
    req.on("error", err => reject(err));
    req.write(bodyStr);
    req.end();
  });
}

// Resize base64 image to max ~200KB to avoid Anthropic internal errors
function trimBase64(data, maxBytes) {
  const max = maxBytes || 200000;
  if (data.length <= max) return data;
  // Truncate to max size — Claude can still read partial JPEG/PNG
  // Better: just take first maxBytes chars of base64 string
  // Actually we should just reject oversized and use text-only mode
  return null; // signal to use text-only
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json"
};

exports.handler = async (event) => {

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: CORS, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  // Validate API key
  const key = (process.env.ANTHROPIC_KEY || "").trim();
  if (!key) {
    return { statusCode: 500, headers: CORS,
      body: JSON.stringify({ error: "ANTHROPIC_KEY not set in Netlify environment variables" }) };
  }
  if (!key.startsWith("sk-")) {
    return { statusCode: 500, headers: CORS,
      body: JSON.stringify({ error: `API key invalid — starts with: "${key.substring(0,8)}"` }) };
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

  // Build message — try with images first, fall back to text-only if images too large
  let useImages = false;
  const validImages = [];

  if (!demo && Array.isArray(cardImages) && cardImages.length > 0) {
    cardImages.forEach(ci => {
      if (ci.data && ci.mediaType) {
        // Check image size — skip if over 1MB base64 (~750KB actual)
        if (ci.data.length < 1000000) {
          validImages.push(ci);
          useImages = true;
        }
      }
    });
  }

  // Build content array
  const buildContent = (withImages) => {
    const content = [];
    if (withImages && validImages.length > 0) {
      validImages.forEach(ci => {
        content.push({
          type: "image",
          source: { type: "base64", media_type: ci.mediaType, data: ci.data }
        });
        content.push({
          type: "text",
          text: `Above image is ${ci.label} (${ci.role}): ${ci.desc}`
        });
      });
    }
    content.push({ type: "text", text: prompt });
    return content;
  };

  // ATTEMPT 1: With images (if available)
  // ATTEMPT 2: Text-only fallback (if images cause error)
  const attempts = useImages
    ? [buildContent(true), buildContent(false)]
    : [buildContent(false)];

  let lastError = null;

  for (let i = 0; i < attempts.length; i++) {
    const isTextOnly = i > 0;
    try {
      const result = await callAnthropic(
        key,
        [{ role: "user", content: attempts[i] }],
        2000
      );

      // Parse response
      let parsed;
      try {
        parsed = JSON.parse(result.raw);
      } catch (e) {
        lastError = `Non-JSON response (status ${result.status}): ${result.raw.substring(0, 300)}`;
        continue;
      }

      // Success
      if (result.status === 200) {
        const text = parsed?.content?.map(b => b.text || "").join("") || "{}";
        return {
          statusCode: 200, headers: CORS,
          body: JSON.stringify({
            result: text,
            textOnly: isTextOnly // tell client if we used text-only mode
          })
        };
      }

      // Anthropic error — check if retryable
      const errMsg = parsed?.error?.message || parsed?.error?.type || `HTTP ${result.status}`;
      const errType = parsed?.error?.type || "";

      // Internal errors and overloaded — retry text-only
      if (result.status === 500 || result.status === 529 || errType === "overloaded_error") {
        lastError = `Anthropic internal error: ${errMsg}`;
        continue; // try text-only
      }

      // Non-retryable errors — return immediately
      return {
        statusCode: result.status, headers: CORS,
        body: JSON.stringify({ error: `Anthropic: ${errMsg}` })
      };

    } catch (err) {
      lastError = `Network error: ${err.message}`;
      continue;
    }
  }

  // All attempts failed
  return {
    statusCode: 500, headers: CORS,
    body: JSON.stringify({
      error: `All attempts failed. Last error: ${lastError}. Please try Demo Mode.`
    })
  };
};
