import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { AirVent, ClipboardList, Search } from "lucide-react"

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 mt-8">Sistema de Gestão de Ar-Condicionado</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/equipamentos/novo">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AirVent className="h-5 w-5" />
                Entrada de Equipamento
              </CardTitle>
              <CardDescription>Cadastrar um aparelho recém-chegado ao estoque</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Registre novos equipamentos com informações detalhadas como marca, modelo, número de série e
                localização.
              </p>
              <div className="mt-4">
                <Button variant="outline" className="w-full">
                  Acessar (F3)
                </Button>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/intervencoes">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Intervenções
              </CardTitle>
              <CardDescription>Gerenciar reclamações, manutenções e movimentações</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Registre e acompanhe todas as intervenções realizadas nos equipamentos, incluindo manutenções,
                reclamações e movimentações.
              </p>
              <div className="mt-4">
                <Button variant="outline" className="w-full">
                  Acessar (F4)
                </Button>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/consultas">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Consultas
              </CardTitle>
              <CardDescription>Visualizar histórico e relatórios</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Consulte o histórico completo dos equipamentos, gere relatórios e visualize indicadores de desempenho.
              </p>
              <div className="mt-4">
                <Button variant="outline" className="w-full">
                  Acessar (F5)
                </Button>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h2 className="text-lg font-medium mb-2">Atalhos de Teclado</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-background rounded border">F1</kbd>
            <span>Ajuda</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-background rounded border">F2</kbd>
            <span>Página Inicial</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-background rounded border">F3</kbd>
            <span>Equipamentos</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-background rounded border">F4</kbd>
            <span>Intervenções</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-background rounded border">F5</kbd>
            <span>Consultas</span>
          </div>
        </div>
      </div>
    </main>
  )
}
