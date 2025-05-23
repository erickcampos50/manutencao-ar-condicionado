"use client"

import { useState } from "react"
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { NovaIntervencaoForm } from "@/components/nova-intervencao-form"
import { useToast } from "@/hooks/use-toast"

export function GlobalShortcuts() {
  const [isNovaIntervencaoOpen, setIsNovaIntervencaoOpen] = useState(false)
  const { toast } = useToast()

  // Atalho F6 para abrir Nova Intervenção
  useKeyboardShortcut("F6", () => {
    setIsNovaIntervencaoOpen(true)
  })

  const handleNovaIntervencaoSubmit = (data: any) => {
    setIsNovaIntervencaoOpen(false)
    toast({
      title: "Intervenção registrada",
      description: "A intervenção foi registrada com sucesso.",
    })
  }

  const handleNovaIntervencaoCancel = () => {
    setIsNovaIntervencaoOpen(false)
  }

  return (
    <Dialog open={isNovaIntervencaoOpen} onOpenChange={setIsNovaIntervencaoOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Nova Intervenção (F6)</DialogTitle>
        </DialogHeader>
        <NovaIntervencaoForm
          onSubmit={handleNovaIntervencaoSubmit}
          onCancel={handleNovaIntervencaoCancel}
        />
      </DialogContent>
    </Dialog>
  )
}
