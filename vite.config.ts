import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';
import {processEmotionAnalysis} from './server/apiHandler.ts';

function apiPlugin(): Plugin {
  return {
    name: 'emotech-api-plugin',
    configureServer(server) {
      server.middlewares.use('/api/analyze-emotion', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const payload = JSON.parse(body || '{}');
            const result = await processEmotionAnalysis(payload);
            res.setHeader('Content-Type', 'application/json');
            if (result) {
              res.end(JSON.stringify(result));
            } else {
              res.statusCode = 200;
              res.end(JSON.stringify({ fallbackToLocal: true }));
            }
          } catch (err: unknown) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }));
          }
        });
      });

      server.middlewares.use('/api/history', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 200;
        res.end(JSON.stringify({ status: req.method === 'POST' ? 'saved' : 'ready' }));
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
