import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

function qrApiDevPlugin() {
  return {
    name: 'qr-api-dev-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/qr')) {
          try {
            const { generateQrSvg } = await server.ssrLoadModule('/src/utils/qrSvgGenerator.js');
            const url = new URL(req.url, 'http://localhost:5173');
            const params = url.searchParams;
            const data = params.get('data') || params.get('text') || params.get('value') || 'https://wajihah-qr-generator.pages.dev/';
            const size = params.get('size') || 350;
            const quietZone = params.get('quietZone') || 10;
            const ecLevel = params.get('ecLevel') || 'H';
            const fgColor = params.get('fgColor') || params.get('fg') || '#000000';
            const bgColor = params.get('bgColor') || params.get('bg') || '#ffffff';
            const qrStyle = params.get('qrStyle') || params.get('style') || 'squares';
            const eyeRadius = params.get('eyeRadius') || params.get('eye') || 10;
            const eyeColor = params.get('eyeColor') || fgColor;
            const logo = params.get('logo') || params.get('logoImage') || null;
            const logoWidth = params.get('logoWidth') || null;
            const logoHeight = params.get('logoHeight') || null;
            const logoOpacity = params.get('logoOpacity') || 1;
            const logoPadding = params.get('logoPadding') || 0.1;
            const logoPaddingStyle = params.get('logoPaddingStyle') || 'circle';
            const removeBehindLogo = params.get('removeBehindLogo') !== 'false';
            const bottomText = params.get('bottomText') || params.get('label') || '';
            const bottomTextColor = params.get('bottomTextColor') || params.get('textColor') || null;

            const svg = generateQrSvg({
              data,
              size,
              quietZone,
              ecLevel,
              fgColor,
              bgColor,
              qrStyle,
              eyeRadius,
              eyeColor,
              logo,
              logoWidth,
              logoHeight,
              logoOpacity,
              logoPadding,
              logoPaddingStyle,
              removeQrCodeBehindLogo: removeBehindLogo,
              bottomText,
              bottomTextColor,
            });

            const format = (params.get('format') || 'png').toLowerCase();

            if (format === 'svg') {
              res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.setHeader('Cache-Control', 'no-cache');
              res.end(svg);
              return;
            }

            const { Resvg } = await import('@cf-wasm/resvg');
            const { getFontBuffer } = await import('./functions/api/fontData.js');
            const fontBuffer = getFontBuffer();
            const resvg = await Resvg.async(svg, {
              font: {
                fontBuffers: [fontBuffer],
                defaultFontFamily: 'Roboto',
              },
            });
            const pngData = resvg.render();
            const pngBuffer = pngData.asPng();

            res.setHeader('Content-Type', 'image/png');
            res.setHeader('Content-Disposition', 'inline; filename="qr-code.png"');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Cache-Control', 'no-cache');
            res.end(Buffer.from(pngBuffer));
            return;
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'text/plain');
            res.end('Error generating QR: ' + err.message);
            return;
          }
        }
        next();
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    qrApiDevPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'QR Generator Wajihah',
        short_name: 'QRGen',
        description: 'Aplikasi QR Generator Wajihah Telkom University',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '.',
        icons: [
          {
            src: '/logo.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/logo.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        navigateFallbackDenylist: [/^\/api/],
        globPatterns: ['**/*.{js,css,html,png,svg,ico,txt,webmanifest}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /\/LOGO WAJIHAH\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'logo-assets',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    })
  ],
})
