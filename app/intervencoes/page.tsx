"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Tipos de intervenção
export const tiposIntervencao = [
  { label: "Reclamação", value: "reclamacao" },
  { label: "Manutenção Preventiva", value: "manutencao-preventiva" },
  { label: "Manutenção Corretiva", value: "manutencao-corretiva" },
  { label: "Reserva", value: "reserva" },
  { label: "Movimentação", value: "movimentacao" },
  { label: "Desinstalação", value: "desinstalacao" },
]

// Dados de exemplo para demonstração
const intervencoesMock = [
  {
    id: 1,
    patrimonio: "AC12345",
    tipo: "manutencao-preventiva",
    descricao: "Limpeza de filtros e verificação geral",
    dataInicio: new Date("2023-05-10"),
    dataTermino: new Date("2023-05-10"),
    localOrigem: "sala-101",
    localDestino: "",
    custo: 150.0,
    responsavel: "João Silva",
    observacoes: "Equipamento em bom estado",
  },
  {
    id: 2,
    patrimonio: "AC12345",
    tipo: "movimentacao",
    descricao: "Transferência para nova sala",
    dataInicio: new Date("2023-06-15"),
    dataTermino: null,
    localOrigem: "sala-101",
    localDestino: "sala-102",
    custo: 0,
    responsavel: "Maria Oliveira",
    observacoes: "",
  },
  {
    id: 3,
    patrimonio: "AC67890",
    tipo: "reclamacao",
    descricao: "Equipamento com ruído excessivo",
    dataInicio: new Date("2023-07-20"),
    dataTermino: null,
    localOrigem: "",
    localDestino: "",
    custo: 0,
    responsavel: "Carlos Santos",
    observacoes: "Usuário relatou ruído durante a operação noturna",
  },
  {
    id: 4,
    patrimonio: "AC67890",
    tipo: "manutencao-corretiva",
    descricao: "Substituição de ventilador interno",
    dataInicio: new Date("2023-07-25"),
    dataTermino: new Date("2023-07-25"),
    localOrigem: "",
    localDestino: "",
    custo: 320.5,
    responsavel: "Pedro Técnico",
    observacoes: "Peça substituída com garantia de 6 meses",
  },
  {
    id: 5,
    patrimonio: "AC54321",
    tipo: "reserva",
    descricao: "Reserva para instalação em nova sala",
    dataInicio: new Date("2023-08-01"),
    dataTermino: new Date("2023-08-15"),
    localOrigem: "",
    localDestino: "",
    custo: 0,
    responsavel: "Ana Planejamento",
    observacoes: "",
  },
]

export default function Intervencoes() {
  const { toast } = useToast()
  const [intervencoes, setIntervencoes] = useState(intervencoesMock)
  const router = useRouter()

  // Atalho de teclado para nova intervenção
  useKeyboardShortcut("F6", () => router.push("/intervencoes/registrar"))

  // Função para abrir detalhes da intervenção
  const handleRowClick = (intervencao: any) => {
    router.push(`/intervencoes/${intervencao.id}`)
  }

  // Função para formatar o tipo de intervenção
  const formatarTipo = (tipo: string) => {
    const tipoEncontrado = tiposIntervencao.find((t) => t.value === tipo)
    return tipoEncontrado ? tipoEncontrado.label : tipo
  }

  // Função para formatar data
  const formatarData = (data: Date | null) => {
    if (!data) return "-"
    return new Intl.DateTimeFormat("pt-BR").format(data)
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Intervenções</CardTitle>
          <Link href="/intervencoes/registrar">
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Nova Intervenção (F6)
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patrimônio</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="hidden md:table-cell">Descrição</TableHead>
                  <TableHead>Data Início</TableHead>
                  <TableHead className="hidden md:table-cell">Data Término</TableHead>
                  <TableHead className="hidden lg:table-cell">Local Origem</TableHead>
                  <TableHead className="hidden lg:table-cell">Local Destino</TableHead>
                  <TableHead className="hidden md:table-cell">Custo</TableHead>
                  <TableHead>Responsável</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {intervencoes.map((intervencao) => (
                  <TableRow
                    key={intervencao.id}
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => handleRowClick(intervencao)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleRowClick(intervencao)
                      }
                    }}
                  >
                    <TableCell className="font-medium">{intervencao.patrimonio}</TableCell>
                    <TableCell>{formatarTipo(intervencao.tipo)}</TableCell>
                    <TableCell className="hidden md:table-cell max-w-[200px] truncate">
                      {intervencao.descricao}
                    </TableCell>
                    <TableCell>{formatarData(intervencao.dataInicio)}</TableCell>
                    <TableCell className="hidden md:table-cell">{formatarData(intervencao.dataTermino)}</TableCell>
                    <TableCell className="hidden lg:table-cell">{intervencao.localOrigem || "-"}</TableCell>
                    <TableCell className="hidden lg:table-cell">{intervencao.localDestino || "-"}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {intervencao.custo ? `R$ ${intervencao.custo.toFixed(2)}` : "-"}
                    </TableCell>
                    <TableCell>{intervencao.responsavel}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
