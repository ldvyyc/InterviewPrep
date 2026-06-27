import type { AppProps } from 'next/app'
import 'react-notion-x/src/styles.css'
import 'katex/dist/katex.min.css'
import 'prismjs/themes/prism-tomorrow.css'
import '@/styles/globals.css'
import '@/styles/notion-overrides.css'
import dynamic from 'next/dynamic'
import Head from 'next/head'

const AuroraBackground = dynamic(
  () => import('@/components/AuroraBackground'),
  { ssr: false }
)

const ThemeToggle = dynamic(
  () => import('@/components/ThemeToggle'),
  { ssr: false }
)

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        {/* Inline script: sets data-theme BEFORE paint to avoid flash */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var t = localStorage.getItem('ldvyyc-theme') || 'dark';
              document.documentElement.setAttribute('data-theme', t);
            } catch(e) {}
          })();
        `}} />
      </Head>

      {/* Fixed aurora background — z-index 0 */}
      <AuroraBackground />

      {/* Content wrapper — explicitly above aurora */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <Component {...pageProps} />
      </div>

      {/* Theme toggle — fixed bottom-left */}
      <ThemeToggle />
    </>
  )
}
