import type { AppProps } from 'next/app'
import 'react-notion-x/src/styles.css'
import 'katex/dist/katex.min.css'        // 关键:KaTeX 公式样式(修复根号显示)
import 'prismjs/themes/prism-tomorrow.css' // 代码高亮主题
import '@/styles/globals.css'
import '@/styles/notion-overrides.css'

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
