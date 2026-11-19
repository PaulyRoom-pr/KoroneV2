
const DEFAULT_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
};

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...DEFAULT_HEADERS, ...headers },
  });
}

export async function handleRequest(request, env) {
  const origin = request.headers.get("Origin");
  const allowedOrigin = env.ALLOWED_ORIGIN || "*";

  const corsHeaders = {
    "Access-Control-Allow-Origin": allowedOrigin === "*" 
      ? "*" 
      : (origin === allowedOrigin ? origin : "null"),
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(request.url);
    const path = url.pathname;

    // Main endpoint
    if (path === "/") {
      return json({
        success: true,
        message: "Cloudflare Pages server is running!",
        platform: "Cloudflare Pages",
      }, 200, corsHeaders);
    }

    // Health check
    if (path === "/api/health") {
      return json({
        success: true,
        status: "online",
        timestamp: new Date().toISOString(),
      }, 200, corsHeaders);
    }

    // API information
    if (path === "/api") {
      return json({
        success: true,
        name: "Cloudflare Pages API",
        version: "1.0.0",
        endpoints: [
          "/",
          "/api",
          "/api/health",
        ],
      }, 200, corsHeaders);
    }

    // Unknown endpoint
    return json({
      success: false,
      error: "Endpoint not found",
      path,
    }, 404, corsHeaders);

  } catch (error) {
    console.error("Server error:", error);

    return json({
      success: false,
      error: "Internal server error",
    }, 500, corsHeaders);
  }
}
