"use client"

import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function DebugInfo() {
  const pathname = usePathname()
  const router = useRouter()
  const [clicks, setClicks] = useState<{ time: string; path: string }[]>([])
  const [isVisible, setIsVisible] = useState(false)

  // Registrar cliques e navegações
  const logNavigation = (path: string) => {
    const now = new Date().toLocaleTimeString()
    setClicks((prev) => [...prev, { time: now, path }])
  }

  // Limpar logs
  const clearLogs = () => {
    setClicks([])
  }

  // Alternar visibilidade
  const toggleVisibility = () => {
    setIsVisible(!isVisible)
  }

  // Testar navegação
  const testNavigation = (path: string) => {
    logNavigation(`Teste: ${path}`)
    router.push(path)
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button variant="outline" size="sm" onClick={toggleVisibility}>
        {isVisible ? "Ocultar Debug" : "Debug"}
      </Button>

      {isVisible && (
        <Card className="mt-2 w-80">
          <CardHeader className="py-2">
            <CardTitle className="text-sm flex justify-between items-center">
              <span>Informações de Debug</span>
              <Button variant="ghost" size="sm" onClick={clearLogs}>
                Limpar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2 space-y-2">
            <div className="text-xs">
              <strong>Rota atual:</strong> {pathname}
            </div>

            <div className="text-xs space-y-1">
              <strong>Testar navegação:</strong>
              <div className="flex flex-wrap gap-1">
                <Button size="sm" variant="outline" onClick={() => testNavigation("/")}>
                  Início
                </Button>
                <Button size="sm" variant="outline" onClick={() => testNavigation("/equipamentos/novo")}>
                  Equipamentos
                </Button>
                <Button size="sm" variant="outline" onClick={() => testNavigation("/intervencoes")}>
                  Intervenções
                </Button>
                <Button size="sm" variant="outline" onClick={() => testNavigation("/consultas")}>
                  Consultas
                </Button>
              </div>
            </div>

            <div className="text-xs">
              <strong>Histórico ({clicks.length}):</strong>
              <div className="max-h-32 overflow-y-auto mt-1">
                {clicks.map((click, index) => (
                  <div key={index} className="text-xs py-1 border-b border-muted">
                    <span className="text-muted-foreground">{click.time}</span>: {click.path}
                  </div>
                ))}
                {clicks.length === 0 && <div className="text-muted-foreground">Nenhum registro</div>}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
