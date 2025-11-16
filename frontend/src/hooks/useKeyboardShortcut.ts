import { useEffect } from 'react'

interface ShortcutConfig {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
  callback: (event: KeyboardEvent) => void
  enabled?: boolean
}

/**
 * Hook pour gérer les raccourcis clavier
 * @example
 * useKeyboardShortcut({
 *   key: 'k',
 *   ctrl: true,
 *   callback: () => openSearch()
 * })
 */
export function useKeyboardShortcut(config: ShortcutConfig) {
  const { key, ctrl, shift, alt, meta, callback, enabled = true } = config

  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      const matchKey = event.key.toLowerCase() === key.toLowerCase()
      const matchCtrl = ctrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey && !event.metaKey
      const matchShift = shift ? event.shiftKey : !event.shiftKey
      const matchAlt = alt ? event.altKey : !event.altKey

      if (matchKey && matchCtrl && matchShift && matchAlt) {
        event.preventDefault()
        callback(event)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [key, ctrl, shift, alt, meta, callback, enabled])
}

/**
 * Hook pour gérer plusieurs raccourcis clavier
 * @example
 * useKeyboardShortcuts([
 *   { key: 'k', ctrl: true, callback: () => openSearch() },
 *   { key: 'n', ctrl: true, callback: () => createNew() }
 * ])
 */
export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        if (shortcut.enabled === false) continue

        const matchKey = event.key.toLowerCase() === shortcut.key.toLowerCase()
        const matchCtrl = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey && !event.metaKey
        const matchShift = shortcut.shift ? event.shiftKey : !event.shiftKey
        const matchAlt = shortcut.alt ? event.altKey : !event.altKey

        if (matchKey && matchCtrl && matchShift && matchAlt) {
          event.preventDefault()
          shortcut.callback(event)
          break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}

// Raccourcis communs prédéfinis
export const SHORTCUTS = {
  SEARCH: { key: 'k', ctrl: true },
  NEW: { key: 'n', ctrl: true },
  SAVE: { key: 's', ctrl: true },
  CLOSE: { key: 'Escape' },
  HELP: { key: '?', shift: true },
  SETTINGS: { key: ',', ctrl: true },
} as const
