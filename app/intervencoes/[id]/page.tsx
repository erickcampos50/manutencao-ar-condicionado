"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut"
import { DetalhesIntervencao } from "@/components/detalhes-intervencao"
import { ArrowLeft } from "lucide-react"

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

export default function DetalhesIntervencaoPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [intervencao, setIntervencao] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular busca de dados
    const id = Number(params.id)
    const intervencaoEncontrada = intervencoesMock.find((i) => i.id === id)

    if (intervencaoEncontrada) {
      setIntervencao(intervencaoEncontrada)
    } else {
      toast({
        title: "Erro",
        description: "Intervenção não encontrada",
        variant: "destructive",
      })
      router.push("/intervencoes")
    }

    setLoading(false)
  }, [params.id, router, toast])

  // Função para voltar à lista
  const handleVoltar = () => {
    router.push("/intervencoes")
  }

  // Atalho de teclado para voltar
  useKeyboardShortcut("Escape", handleVoltar)

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-8">
            <div className="flex justify-center">
              <p>Carregando...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!intervencao) {
    return null
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="flex flex-row items-center gap-4">
          <Button variant="outline" size="icon" onClick={handleVoltar}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle>Detalhes da Intervenção</CardTitle>
        </CardHeader>
        <CardContent>
          <DetalhesIntervencao intervencao={intervencao} />

          <div className="flex justify-end mt-6">
            <Button variant="outline" onClick={handleVoltar}>
              Voltar (Esc)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
