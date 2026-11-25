import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { convertMessyTextToTable } from './src/server/convertService';
import { generateSitemapEntries, generateSitemapXml, injectRouteSeoMeta } from './src/server/seoHtml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const isProd = process.env.NODE_ENV === 'production';

function resolveBaseUrl(req: express.Request): string {
  if (process.env.APP_URL && process.env.APP_URL !== 'MY_APP_URL') {
    return process.env.APP_URL;
  }
  const proto = req.get('x-forwarded-proto') || req.protocol || 'http';
  const host = req.get('host') || `localhost:${PORT}`;
  return `${proto}://${host}`;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '64kb' }));

  app.post('/api/convert', async (req, res) => {
    const result = await convertMessyTextToTable(req.body ?? {});
    res.status(result.status).json(result.body);
  });

  app.get('/sitemap.xml', (req, res) => {
    const baseUrl = resolveBaseUrl(req);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.send(generateSitemapXml(baseUrl));
  });

  app.get('/sitemap.json', (req, res) => {
    const baseUrl = resolveBaseUrl(req);
    res.json(generateSitemapEntries(baseUrl));
  });

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      try {
        const url = req.originalUrl.split('?')[0];
        const templatePath = path.resolve(__dirname, 'index.html');
        let template = fs.readFileSync(templatePath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        const seoHtml = injectRouteSeoMeta(template, url, resolveBaseUrl(req));
        res.status(200).set({ 'Content-Type': 'text/html; charset=utf-8' }).end(seoHtml);
      } catch (e) {
        next(e);
      }
    });
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir, { index: false }));

    app.use('*', (req, res) => {
      const url = req.originalUrl.split('?')[0];
      const indexPath = path.resolve(distDir, 'index.html');
      const template = fs.readFileSync(indexPath, 'utf-8');
      const seoHtml = injectRouteSeoMeta(template, url, resolveBaseUrl(req));
      res.status(200).set({ 'Content-Type': 'text/html; charset=utf-8' }).end(seoHtml);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CleanSheet AI server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
