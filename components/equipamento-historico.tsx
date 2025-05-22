import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Intervencao {
  id: number
  tipo: string
  descricao: string
  dataInicio: Date
  dataTermino: Date | null
  responsavel: string
}

interface EquipamentoHistoricoProps {
  patrimonio: string | null
  intervencoes: Intervencao[]
}

export function EquipamentoHistorico({ patrimonio, intervencoes }: EquipamentoHistoricoProps) {
  if (!patrimonio) {
    return null
  }

  // Formatar tipo de intervenção
  const formatarTipo = (tipo: string) => {
    const tiposMap: Record<string, string> = {
      "manutencao-preventiva": "Manutenção Preventiva",
      "manutencao-corretiva": "Manutenção Corretiva",
      reclamacao: "Reclamação",
      movimentacao: "Movimentação",
      reserva: "Reserva",
      desinstalacao: "Desinstalação",
    }
    return tiposMap[tipo] || tipo
  }

  // Formatar data
  const formatarData = (data: Date | null) => {
    if (!data) return "-"
    return format(data, "dd/MM/yyyy", { locale: ptBR })
  }

  return (
    <Card className="mt-8">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Histórico do Equipamento</CardTitle>
      </CardHeader>
      <CardContent>
        {intervencoes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum registro encontrado para este equipamento.</p>
        ) : (
          <div className="space-y-4">
            {intervencoes.map((intervencao) => (
              <div key={intervencao.id} className="border-b pb-3">
                <div className="flex justify-between items-start mb-1">
                  <div className="font-medium">{formatarTipo(intervencao.tipo)}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatarData(intervencao.dataInicio)}
                    {intervencao.dataTermino && ` - ${formatarData(intervencao.dataTermino)}`}
                  </div>
                </div>
                <p className="text-sm">{intervencao.descricao}</p>
                <p className="text-xs text-muted-foreground mt-1">Responsável: {intervencao.responsavel || "-"}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
