import { useEffect } from 'react'

// 给页面里所有 react-notion-x 的代码块注入一个"复制"按钮
export function useCopyButtons(deps: any[] = []) {
  useEffect(() => {
    const timer = setTimeout(() => {
      const codeBlocks = document.querySelectorAll('.notion-code')
      codeBlocks.forEach((block) => {
        const el = block as HTMLElement
        if (el.querySelector('.code-copy-btn')) return // 已加过

        el.style.position = 'relative'
        const btn = document.createElement('button')
        btn.className = 'code-copy-btn'
        btn.textContent = 'Copy'
        btn.addEventListener('click', () => {
          const codeEl = el.querySelector('code')
          const text = codeEl?.textContent || ''
          navigator.clipboard.writeText(text).then(() => {
            btn.textContent = 'Copied!'
            btn.classList.add('copied')
            setTimeout(() => {
              btn.textContent = 'Copy'
              btn.classList.remove('copied')
            }, 1600)
          })
        })
        el.appendChild(btn)
      })
    }, 300)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
