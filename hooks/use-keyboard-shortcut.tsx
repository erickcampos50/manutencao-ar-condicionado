"use client"

import { useEffect } from "react"

type KeyboardKey = "F1" | "F2" | "F4" | "F9" | "F10" | string

export function useKeyboardShortcut(key: KeyboardKey, callback: (e: KeyboardEvent) => void) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Verificar se a tecla pressionada corresponde à tecla desejada
      if (e.key === key) {
        e.preventDefault() // Prevenir comportamento padrão do navegador
        callback(e)
      }
    }

    // Adicionar event listener
    window.addEventListener("keydown", handleKeyDown)

    // Remover event listener ao desmontar
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [key, callback])
}
