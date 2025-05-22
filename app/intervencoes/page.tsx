"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getIntervencoesClient } from "@/lib/supabase/client"
import type { Intervencao } from "@/lib/supabase/server"

// Tipos de intervenção
export const tiposIntervencao = [
  { label: "Reclamação", value: "reclamacao" },
  { label: "Manutenção Preventiva", value: "manutencao-preventiva" },
  { label: "Manutenção Corretiva", value: "manutencao-corretiva" },
  { label: "Reserva", value: "reserva" },
  { label: "Movimentação", value: "movimentacao" },
  { label: "Desinstalação", value: "desinstalacao" },
]

export default function Intervencoes() {
  const { toast } = useToast()
  const [intervencoes, setIntervencoes] = useState<Intervencao[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Carregar intervenções do Supabase
  useEffect(() => {
    async function carregarIntervencoes() {
      try {
        setIsLoading(true)
        const data = await getIntervencoesClient()
        setIntervencoes(data)
      } catch (error) {
        console.error("Erro ao carregar intervenções:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar a lista de intervenções.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    carregarIntervencoes()
  }, [toast])

  // Atalho de teclado para nova intervenção
  useKeyboardShortcut("F6", () => router.push("/intervencoes/registrar"))

  // Função para abrir detalhes da intervenção
  const handleRowClick = (intervencao: Intervencao) => {
    router.push(`/intervencoes/${intervencao.id}`)
  }

  // Função para formatar o tipo de intervenção
  const formatarTipo = (tipo: string) => {
    const tipoEncontrado = tiposIntervencao.find((t) => t.value === tipo)
    return tipoEncontrado ? tipoEncontrado.label : tipo
  }

  // Função para formatar data
  const formatarData = (dataString: string | null) => {
    if (!dataString) return "-"
    const data = new Date(dataString)
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
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <p>Carregando intervenções...</p>
            </div>
          ) : intervencoes.length === 0 ? (
            <div className="text-center py-8">
              <p>Nenhuma intervenção registrada.</p>
              <Link href="/intervencoes/registrar" className="mt-4 inline-block">
                <Button variant="outline">Registrar Nova Intervenção</Button>
              </Link>
            </div>
          ) : (
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
                        {intervencao.descricao || "-"}
                      </TableCell>
                      <TableCell>{formatarData(intervencao.data_inicio)}</TableCell>
                      <TableCell className="hidden md:table-cell">{formatarData(intervencao.data_termino)}</TableCell>
                      <TableCell className="hidden lg:table-cell">{intervencao.local_origem || "-"}</TableCell>
                      <TableCell className="hidden lg:table-cell">{intervencao.local_destino || "-"}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {intervencao.custo ? `R$ ${intervencao.custo.toFixed(2)}` : "-"}
                      </TableCell>
                      <TableCell>{intervencao.responsavel || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
