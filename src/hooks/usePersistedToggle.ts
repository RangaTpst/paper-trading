import { useState, useEffect } from 'react'

export function usePersistedToggle(key: string, defaultValue: boolean) {
  const [value, setValue] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(key)
      return saved !== null ? JSON.parse(saved) : defaultValue
    } catch {
      return defaultValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      console.warn(`Impossible de sauvegarder ${key}`)
    }
  }, [key, value])

  return [value, setValue] as const
}
