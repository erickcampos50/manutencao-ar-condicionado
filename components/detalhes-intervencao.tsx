import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { tiposIntervencao } from "@/app/intervencoes/page"

// Locais para exibição
const locais = [
  { label: "Sala 101", value: "sala-101" },
  { label: "Sala 102", value: "sala-102" },
  { label: "Recepção", value: "recepcao" },
  { label: "Almoxarifado", value: "almoxarifado" },
  { label: "Escritório Administrativo", value: "escritorio-admin" },
]

interface DetalhesIntervencaoProps {
  intervencao: {
    id: number
    patrimonio: string
    tipo: string
    descricao: string
    dataInicio: Date
    dataTermino: Date | null
    localOrigem: string
    localDestino: string
    custo: number
    responsavel: string
    observacoes: string
  }
}

export function DetalhesIntervencao({ intervencao }: DetalhesIntervencaoProps) {
  // Formatar tipo de intervenção
  const formatarTipo = (tipo: string) => {
    const tipoEncontrado = tiposIntervencao.find((t) => t.value === tipo)
    return tipoEncontrado ? tipoEncontrado.label : tipo
  }

  // Formatar local
  const formatarLocal = (localValue: string) => {
    if (!localValue) return "-"
    const localEncontrado = locais.find((l) => l.value === localValue)
    return localEncontrado ? localEncontrado.label : localValue
  }

  // Formatar data
  const formatarData = (data: Date | null) => {
    if (!data) return "-"
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
          <p className="text-base">{intervencao.descricao}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Data Início</h3>
          <p className="text-base">{formatarData(intervencao.dataInicio)}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Data Término</h3>
          <p className="text-base">{formatarData(intervencao.dataTermino)}</p>
        </div>

        {intervencao.localOrigem && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Local Origem</h3>
            <p className="text-base">{formatarLocal(intervencao.localOrigem)}</p>
          </div>
        )}

        {intervencao.localDestino && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Local Destino</h3>
            <p className="text-base">{formatarLocal(intervencao.localDestino)}</p>
          </div>
        )}

        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Custo</h3>
          <p className="text-base">{intervencao.custo > 0 ? `R$ ${intervencao.custo.toFixed(2)}` : "-"}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Responsável</h3>
          <p className="text-base">{intervencao.responsavel}</p>
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
