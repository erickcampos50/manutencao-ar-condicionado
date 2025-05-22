import { Card, CardContent } from "@/components/ui/card"

interface EquipamentoDetalhesProps {
  equipamento: {
    patrimonio: string
    marca: string
    modelo: string
    capacidade: string
    localAtual: string
  } | null
}

export function EquipamentoDetalhes({ equipamento }: EquipamentoDetalhesProps) {
  if (!equipamento) {
    return null
  }

  return (
    <Card className="mb-4 bg-muted/30">
      <CardContent className="p-4">
        <h3 className="text-sm font-medium mb-2">Detalhes do Equipamento</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Patrimônio</p>
            <p className="font-medium">{equipamento.patrimonio}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Marca</p>
            <p className="font-medium">{equipamento.marca || "-"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Modelo</p>
            <p className="font-medium">{equipamento.modelo || "-"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Capacidade</p>
            <p className="font-medium">{equipamento.capacidade || "-"}</p>
          </div>
          <div className="col-span-2 md:col-span-4">
            <p className="text-xs text-muted-foreground">Local Atual</p>
            <p className="font-medium">{equipamento.localAtual || "-"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
