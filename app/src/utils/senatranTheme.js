import { useEffect } from 'react'

export const SENATRAN_GREEN = '#8cb82e'
const DEFAULT_THEME = '#1351B4'

export function applySenatranTheme() {
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', SENATRAN_GREEN)
  document.documentElement.style.backgroundColor = SENATRAN_GREEN
}

export function restoreDefaultTheme() {
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', DEFAULT_THEME)
  document.documentElement.style.backgroundColor = ''
}

export function useSenatranTheme() {
  useEffect(() => {
    applySenatranTheme()
    return restoreDefaultTheme
  }, [])
}

export function isSenatranHost() {
  return typeof window !== 'undefined'
    && window.location.hostname.includes('cnh-digital-senatran')
}
