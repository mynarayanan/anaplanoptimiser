import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const OPTIMIZER_URL = "https://new-chat-jnl8.bolt.host";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const path = url.searchParams.get("path") || "/";
    
    const targetUrl = `${OPTIMIZER_URL}${path}`;
    
    const proxyHeaders = new Headers();
    req.headers.forEach((value, key) => {
      if (!key.toLowerCase().startsWith("host") && 
          !key.toLowerCase().startsWith("authorization")) {
        proxyHeaders.set(key, value);
      }
    });

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: proxyHeaders,
      body: req.method !== "GET" && req.method !== "HEAD" ? await req.blob() : undefined,
    });

    const responseHeaders = new Headers(corsHeaders);
    response.headers.forEach((value, key) => {
      if (!key.toLowerCase().includes("content-security-policy") &&
          !key.toLowerCase().includes("x-frame-options")) {
        responseHeaders.set(key, value);
      }
    });

    const contentType = response.headers.get("content-type") || "";
    let body = await response.arrayBuffer();

    if (contentType.includes("text/html")) {
      let html = new TextDecoder().decode(body);
      
      html = html.replace(
        /<head>/i,
        `<head><base href="${OPTIMIZER_URL}/">`
      );
      
      body = new TextEncoder().encode(html);
    }

    return new Response(body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || "Proxy error" }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});