export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': '*',
      },
    });
  }

  const url = new URL(req.url);
  // Extract target path from query param or pathname
  let subPath = url.searchParams.get('path');
  if (!subPath) {
    subPath = url.pathname.replace(/^\/api\/ai-gateway\/?/, '');
  }
  if (!subPath) {
    subPath = 'openai/deployments/gpt-5.5/chat/completions?api-version=2024-10-21';
  }

  // Preserve query params like api-version if not in subPath
  const apiVersion = url.searchParams.get('api-version');
  const cleanSubPath = subPath.replace(/^\//, '');
  const hasQuery = cleanSubPath.includes('?');
  const targetUrl = `https://ai-api-dev.dentsu.com/${cleanSubPath}${
    apiVersion && !hasQuery ? `?api-version=${apiVersion}` : ''
  }`;

  const body = req.method !== 'GET' ? await req.text() : undefined;

  try {
    const upstreamRes = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Ocp-Apim-Subscription-Key': process.env.VITE_AI_GATEWAY_KEY || '0e8efaddb74d411a929cb41a3d08b36d',
        'api-key': process.env.VITE_AI_GATEWAY_KEY || '0e8efaddb74d411a929cb41a3d08b36d',
        'x-service-line': process.env.VITE_AI_GATEWAY_SERVICE_LINE || 'cxm',
        'x-brand': process.env.VITE_AI_GATEWAY_BRAND || 'merkle',
        'x-project': process.env.VITE_AI_GATEWAY_PROJECT || 'ChatBotEnglishTeacher',
        'api-version': process.env.VITE_AI_GATEWAY_HEADER_API_VERSION || 'v15',
      },
      body,
    });

    const responseData = await upstreamRes.text();
    return new Response(responseData, {
      status: upstreamRes.status,
      headers: {
        'Content-Type': upstreamRes.headers.get('content-type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Gateway proxy failed' }), {
      status: 502,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
