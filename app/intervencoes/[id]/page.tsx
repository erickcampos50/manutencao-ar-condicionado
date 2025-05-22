"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut"
import { DetalhesIntervencao } from "@/components/detalhes-intervencao"
import { ArrowLeft } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase/client"
import type { Intervencao } from "@/lib/supabase/server"

export default function DetalhesIntervencaoPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [intervencao, setIntervencao] = useState<Intervencao | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Buscar dados da intervenção
    async function buscarIntervencao() {
      try {
        const id = Number(params.id)
        const supabase = getSupabaseClient()

        const { data, error } = await supabase.from("intervencoes").select("*").eq("id", id).single()

        if (error) {
          throw error
        }

        if (data) {
          setIntervencao(data as Intervencao)
        } else {
          toast({
            title: "Erro",
            description: "Intervenção não encontrada",
            variant: "destructive",
          })
          router.push("/intervencoes")
        }
      } catch (error) {
        console.error("Erro ao buscar intervenção:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar os detalhes da intervenção",
          variant: "destructive",
        })
        router.push("/intervencoes")
      } finally {
        setLoading(false)
      }
    }

    buscarIntervencao()
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
