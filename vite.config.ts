import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

function aiGatewayDevPlugin() {
  return {
    name: 'ai-gateway-dev-proxy',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (!req.url?.startsWith('/api/ai-gateway')) {
          return next();
        }

        if (req.method === 'OPTIONS') {
          res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': '*',
          });
          return res.end();
        }

        try {
          const rawUrl = req.url.replace(/^\/api\/ai-gateway\/?/, '');
          const targetUrl = `https://ai-api-dev.dentsu.com/${rawUrl}`;

          const chunks: any[] = [];
          for await (const chunk of req) {
            chunks.push(chunk);
          }
          const body = chunks.length > 0 ? Buffer.concat(chunks) : undefined;

          const headers: Record<string, string> = {
            'Content-Type': (req.headers['content-type'] as string) || 'application/json',
            'Cache-Control': 'no-cache',
            'Ocp-Apim-Subscription-Key': (req.headers['ocp-apim-subscription-key'] as string) || '0e8efaddb74d411a929cb41a3d08b36d',
            'api-key': (req.headers['api-key'] as string) || '0e8efaddb74d411a929cb41a3d08b36d',
            'x-service-line': (req.headers['x-service-line'] as string) || 'cxm',
            'x-brand': (req.headers['x-brand'] as string) || 'merkle',
            'x-project': (req.headers['x-project'] as string) || 'ChatBotEnglishTeacher',
            'api-version': (req.headers['api-version'] as string) || 'v15',
          };

          const upstreamRes = await fetch(targetUrl, {
            method: req.method || 'POST',
            headers,
            body,
          });

          const resData = await upstreamRes.arrayBuffer();
          res.writeHead(upstreamRes.status, {
            'Content-Type': upstreamRes.headers.get('content-type') || 'application/json',
            'Access-Control-Allow-Origin': '*',
          });
          res.end(Buffer.from(resData));
        } catch (err: any) {
          console.error('[ai-gateway-dev-proxy] Error:', err);
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message || 'Gateway error' }));
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), aiGatewayDevPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});
