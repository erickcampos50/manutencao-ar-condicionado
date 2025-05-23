"use client"

import React, { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { getScheduledIntervencoes } from "@/app/actions"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"

interface EventoAgendado {
  id: string
  tipo: string
  descricao: string | null
  dataProgramada: string
  baseIntervencaoId: string
}

export default function AgendaPage() {
  const [eventos, setEventos] = useState<EventoAgendado[]>([])
  const [selecionados, setSelecionados] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)

  React.useEffect(() => {
    void (async () => {
      const res = await fetch("/api/intervencoes/agendadas")
      if (res.ok) {
        const data: EventoAgendado[] = await res.json()
        if (data.length === 0) {
          // Remover dados hardcoded para forçar uso do BD
          setEventos([])
        } else {
          setEventos(data)
        }
      }
    })()
  }, [])

  // Extrair datas com eventos
  const datasComEventos = Array.from(
    new Set(eventos.map((ev) => ev.dataProgramada.slice(0, 10)))
  ).map((d) => new Date(d))

  const toggleEvento = (id: string) => {
    setSelecionados((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const marcarExecutados = async () => {
    setLoading(true)
    // criar intervenções reais para selecionados
    await Promise.all(
      eventos
        .filter((ev) => selecionados[ev.id] && ev.baseIntervencaoId !== "N/A")
        .map((ev) =>
          fetch("/api/intervencoes/registrar", {
            method: "POST",
            body: JSON.stringify({
              patrimonio: ev.baseIntervencaoId,
              tipo: ev.tipo,
              descricao: ev.descricao,
              dataInicio: ev.dataProgramada,
            }),
          })
        )
    )
    setLoading(false)
    // opcional: remover executados da lista
    setEventos((prev) => prev.filter((ev) => !selecionados[ev.id]))
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Agenda de Intervenções</h1>
      <Calendar mode="multiple" selected={datasComEventos} />
      <div className="mt-6 overflow-x-auto">
        <table className="w-full border border-border rounded-md">
          <thead className="bg-muted">
            <tr>
              <th className="border border-border px-4 py-2 text-left">Data Programada</th>
              <th className="border border-border px-4 py-2 text-left">Tipo</th>
              <th className="border border-border px-4 py-2 text-left">Descrição</th>
              <th className="border border-border px-4 py-2 text-center">Selecionar</th>
            </tr>
          </thead>
          <tbody>
            {eventos.map((ev) => (
              <tr key={ev.id} className="hover:bg-muted">
                <td className="border border-border px-4 py-2">{new Date(ev.dataProgramada).toLocaleDateString()}</td>
                <td className="border border-border px-4 py-2">{ev.tipo}</td>
                <td className="border border-border px-4 py-2">{ev.descricao}</td>
                <td className="border border-border px-4 py-2 text-center">
                  <Checkbox
                    checked={!!selecionados[ev.id]}
                    onCheckedChange={() => toggleEvento(ev.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end mt-4">
        <Button onClick={marcarExecutados} disabled={loading}>
          {loading ? "Processando..." : "Marcar executados"}
        </Button>
      </div>
    </div>
  )
}
