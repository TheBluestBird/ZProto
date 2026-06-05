import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

const srcRoot = fileURLToPath(new URL('./src', import.meta.url));

/** Spine bundles live in `assets/<id>/` (with `<id>.json`). Published to `dist/spine/<id>/`. */
function spineBundles(src: string): Map<string, string> {
  const out = new Map<string, string>();
  const walk = (dir: string) => {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!ent.isDirectory()) continue;
      const full = path.join(dir, ent.name);
      if (ent.name === 'assets') {
        for (const bundle of fs.readdirSync(full, { withFileTypes: true })) {
          if (!bundle.isDirectory()) continue;
          const bundleDir = path.join(full, bundle.name);
          if (!fs.existsSync(path.join(bundleDir, `${bundle.name}.json`))) continue;
          if (!out.has(bundle.name)) out.set(bundle.name, bundleDir);
        }
      } else walk(full);
    }
  };
  walk(src);
  return out;
}

function spineBundlesPlugin(): Plugin {
  let bundles = new Map<string, string>();
  let outDir = 'dist';
  return {
    name: 'spine-bundles',
    configResolved(c) {
      outDir = path.resolve(c.root, c.build.outDir);
      bundles = spineBundles(srcRoot);
    },
    configureServer(server) {
      const base = server.config.base;
      server.middlewares.use((req, res, next) => {
        const raw = req.url?.split('?')[0] ?? '';
        if (!raw.startsWith(base)) return next();
        const m = raw.slice(base.length).match(/^spine\/([^/]+)\/(.+)$/);
        if (!m) return next();
        const dir = bundles.get(m[1]!);
        if (!dir) return next();
        const file = path.normalize(path.join(dir, m[2]!));
        if (!file.startsWith(dir + path.sep) || !fs.existsSync(file)) return next();
        const ext = path.extname(file);
        const types: Record<string, string> = {
          '.json': 'application/json',
          '.atlas': 'text/plain',
          '.png': 'image/png',
        };
        res.setHeader('Content-Type', types[ext] ?? 'application/octet-stream');
        fs.createReadStream(file).pipe(res);
      });
    },
    closeBundle() {
      for (const [id, src] of bundles) {
        const dest = path.join(outDir, 'spine', id);
        fs.mkdirSync(dest, { recursive: true });
        for (const name of fs.readdirSync(src)) {
          fs.cpSync(path.join(src, name), path.join(dest, name));
        }
      }
    },
  };
}

export default defineConfig({
  base: '/ZProto/',
  plugins: [react(), tailwindcss(), spineBundlesPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
      '@navigation': fileURLToPath(new URL('./src/navigation', import.meta.url)),
      '@game': fileURLToPath(new URL('./src/game', import.meta.url)),
      '@engine': fileURLToPath(new URL('./src/engine', import.meta.url)),
    },
  },
});
