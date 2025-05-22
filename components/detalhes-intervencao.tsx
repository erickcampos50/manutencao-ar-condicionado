"use client"

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { tiposIntervencao } from "@/app/intervencoes/page"
import type { Intervencao } from "@/lib/supabase/server"
import { useEffect, useState } from "react"
import { getLocaisClient } from "@/lib/supabase/client"

interface DetalhesIntervencaoProps {
  intervencao: Intervencao
}

export function DetalhesIntervencao({ intervencao }: DetalhesIntervencaoProps) {
  const [locais, setLocais] = useState<{ label: string; value: string }[]>([])

  // Carregar locais
  useEffect(() => {
    async function carregarLocais() {
      try {
        const locaisData = await getLocaisClient()
        setLocais(
          locaisData.map((local) => ({
            label: local.nome,
            value: local.nome,
          })),
        )
      } catch (error) {
        console.error("Erro ao carregar locais:", error)
      }
    }

    carregarLocais()
  }, [])

  // Formatar tipo de intervenção
  const formatarTipo = (tipo: string) => {
    const tipoEncontrado = tiposIntervencao.find((t) => t.value === tipo)
    return tipoEncontrado ? tipoEncontrado.label : tipo
  }

  // Formatar local
  const formatarLocal = (localValue: string | null) => {
    if (!localValue) return "-"
    return localValue
  }

  // Formatar data
  const formatarData = (dataString: string | null) => {
    if (!dataString) return "-"
    const data = new Date(dataString)
    return format(data, "PPP", { locale: ptBR })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Número de Patrimônio</h3>
          <p className="text-base">{intervencao.patrimonio}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Tipo</h3>
          <p className="text-base">{formatarTipo(intervencao.tipo)}</p>
        </div>

        <div className="md:col-span-2">
          <h3 className="text-sm font-medium text-muted-foreground">Descrição</h3>
          <p className="text-base">{intervencao.descricao || "-"}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Data Início</h3>
          <p className="text-base">{formatarData(intervencao.data_inicio)}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Data Término</h3>
          <p className="text-base">{formatarData(intervencao.data_termino)}</p>
        </div>

        {intervencao.local_origem && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Local Origem</h3>
            <p className="text-base">{formatarLocal(intervencao.local_origem)}</p>
          </div>
        )}

        {intervencao.local_destino && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Local Destino</h3>
            <p className="text-base">{formatarLocal(intervencao.local_destino)}</p>
          </div>
        )}

        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Custo</h3>
          <p className="text-base">{intervencao.custo > 0 ? `R$ ${intervencao.custo.toFixed(2)}` : "-"}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Responsável</h3>
          <p className="text-base">{intervencao.responsavel || "-"}</p>
        </div>

        {intervencao.observacoes && (
          <div className="md:col-span-2">
            <h3 className="text-sm font-medium text-muted-foreground">Observações</h3>
            <p className="text-base">{intervencao.observacoes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
