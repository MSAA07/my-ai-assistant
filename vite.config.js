import { defineConfig, loadEnv } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

const STAGING_SESSION_COOKIE = '__Secure-better-auth.session_token';
const LOCAL_SESSION_COOKIE = 'better-auth.session_token';

function rewriteDevSetCookieHeader(cookie) {
  return cookie
    .replace(new RegExp(`^${STAGING_SESSION_COOKIE}=`, 'i'), `${LOCAL_SESSION_COOKIE}=`)
    .replace(/;\s*Secure/gi, '')
    .replace(/;\s*Partitioned/gi, '')
    .replace(/;\s*SameSite=None/gi, '; SameSite=Lax')
    .replace(/;\s*Domain=[^;]+/gi, '');
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Keep browser requests same-origin while explicitly selecting the backend used by the dev proxy.
  const devApiTarget = env.LOCAL_API_BASE_URL || env.VITE_API_BASE_URL || 'http://localhost:3001';

  return {
    plugins: [svelte()],
    server: {
      port: 5173,
      strictPort: false,
      proxy: {
        '/api': {
          target: devApiTarget,
          changeOrigin: true,
          secure: true,
          configure(proxy) {
            proxy.on('proxyReq', (proxyReq, req) => {
              const cookieHeader = req.headers.cookie;
              if (!cookieHeader || !cookieHeader.includes(LOCAL_SESSION_COOKIE)) {
                return;
              }

              proxyReq.setHeader(
                'cookie',
                cookieHeader.replace(
                  new RegExp(`(^|;\\s*)${LOCAL_SESSION_COOKIE}=`, 'g'),
                  `$1${STAGING_SESSION_COOKIE}=`,
                ),
              );
            });

            proxy.on('proxyRes', (proxyRes) => {
              const setCookie = proxyRes.headers['set-cookie'];
              if (!Array.isArray(setCookie) || setCookie.length === 0) {
                return;
              }

              proxyRes.headers['set-cookie'] = setCookie.map(rewriteDevSetCookieHeader);
            });
          },
        },
        '/auth': {
          target: devApiTarget,
          changeOrigin: true,
          secure: true,
        },
      },
    },
  };
});
