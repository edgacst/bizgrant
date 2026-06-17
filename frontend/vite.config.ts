import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const NGROK_HOST = process.env.VITE_NGROK_HOST ?? 'mundane-maturely-bulgur.ngrok-free.dev'
const useNgrokHmr = process.env.VITE_NGROK === 'true'

function injectSiteVerificationMeta(html: string, env: Record<string, string>): string {
  const tags: string[] = []

  const google = env.VITE_GOOGLE_SITE_VERIFICATION?.trim()
  if (google) {
    tags.push(`<meta name="google-site-verification" content="${google}" />`)
  }

  const naver = env.VITE_NAVER_SITE_VERIFICATION?.trim()
  if (naver) {
    tags.push(`<meta name="naver-site-verification" content="${naver}" />`)
  }

  const bing = env.VITE_BING_SITE_VERIFICATION?.trim()
  if (bing) {
    tags.push(`<meta name="msvalidate.01" content="${bing}" />`)
  }

  const gaId = env.VITE_GA_MEASUREMENT_ID?.trim()
  if (gaId && /^G-[A-Z0-9]+$/i.test(gaId)) {
    tags.push(`<script async src="https://www.googletagmanager.com/gtag/js?id=${gaId}"></script>`)
    tags.push(`<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${gaId}', { send_page_view: false });
</script>`)
  }

  if (tags.length === 0) {
    return html
  }

  return html.replace('</head>', `  ${tags.join('\n  ')}\n</head>`)
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      {
        name: 'site-verification-meta',
        transformIndexHtml(html) {
          return injectSiteVerificationMeta(html, env)
        },
      },
    ],
    server: {
      port: 3000,
      host: true,
      allowedHosts: [NGROK_HOST, 'localhost'],
      ...(useNgrokHmr
        ? {
            hmr: {
              protocol: 'wss',
              host: NGROK_HOST,
              clientPort: 443,
            },
          }
        : {}),
      proxy: {
        '/api': {
          target: 'http://localhost:8082',
          changeOrigin: true,
        },
      },
    },
  }
})
