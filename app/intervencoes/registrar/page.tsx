"use client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut"
import { NovaIntervencaoForm } from "@/components/nova-intervencao-form"

export default function RegistrarIntervencao() {
  const router = useRouter()
  const { toast } = useToast()

  // Função para lidar com o envio do formulário
  const handleSubmit = (data: any) => {
    // Aqui seria implementada a lógica para salvar no banco de dados
    console.log("Salvando intervenção:", data)

    // Exibir toast de sucesso
    toast({
      title: "Registro salvo",
      description: `Intervenção registrada com sucesso.`,
    })

    // Redirecionar para a lista de intervenções
    router.push("/intervencoes")
  }

  // Função para cancelar e voltar para a lista
  const handleCancel = () => {
    router.push("/intervencoes")
  }

  // Atalhos de teclado
  useKeyboardShortcut("F1", () => {
    toast({
      title: "Ajuda",
      description: "F9: Salvar | F4: Cancelar/Limpar | F1: Ajuda",
    })
  })

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Registrar Nova Intervenção</CardTitle>
        </CardHeader>
        <CardContent>
          <NovaIntervencaoForm onSubmit={handleSubmit} onCancel={handleCancel} />
        </CardContent>
      </Card>
    </div>
  )
}
