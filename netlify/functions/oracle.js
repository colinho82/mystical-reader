// ══════════════════════════════════════════════════════════════════
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
