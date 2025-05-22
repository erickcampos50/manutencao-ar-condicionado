import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface TimelineItem {
  id: number
  data: Date
  patrimonio: string
  tipo: string
  descricao: string
  responsavel: string
}

interface TimelineProps {
  items: TimelineItem[]
}

export function Timeline({ items }: TimelineProps) {
  // Ordenar itens por data (mais recente primeiro)
  const sortedItems = [...items].sort((a, b) => b.data.getTime() - a.data.getTime())

  return (
    <div className="space-y-8">
      {sortedItems.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum registro encontrado para os filtros selecionados.
        </div>
      ) : (
        sortedItems.map((item, index) => (
          <div key={item.id} className="relative pl-6 pb-8">
            {/* Linha vertical */}
            {index !== sortedItems.length - 1 && <div className="absolute left-2 top-2 bottom-0 w-0.5 bg-muted" />}

            {/* Círculo */}
            <div className="absolute left-0 top-2 h-4 w-4 rounded-full border border-primary bg-background" />

            <div className="flex flex-col space-y-2">
              {/* Data */}
              <div className="text-sm font-medium text-muted-foreground">
                {format(item.data, "PPP", { locale: ptBR })}
              </div>

              {/* Conteúdo */}
              <div className="rounded-lg border p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div className="font-medium">
                    {item.patrimonio} - {item.tipo}
                  </div>
                  <div className="text-sm text-muted-foreground">Responsável: {item.responsavel}</div>
                </div>
                <p className="mt-2 text-sm">{item.descricao}</p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
