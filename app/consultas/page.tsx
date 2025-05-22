"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DatePicker } from "@/components/date-picker"
import { Combobox } from "@/components/combobox"
import { CheckboxGroup } from "@/components/checkbox-group"
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut"
import { BarChart, LineChart, PieChart } from "@/components/charts"
import { Timeline } from "@/components/timeline"
import { DownloadIcon, BarChart3, PieChartIcon } from "lucide-react"
import { getSupabaseClient, getLocaisClient } from "@/lib/supabase/client"
import type { Intervencao, Equipamento } from "@/lib/supabase/server"
import { useToast } from "@/hooks/use-toast"

// Tipos de intervenção para filtro
const tiposIntervencao = [
  { id: "reclamacao", label: "Reclamação" },
  { id: "manutencao-preventiva", label: "Manutenção Preventiva" },
  { id: "manutencao-corretiva", label: "Manutenção Corretiva" },
  { id: "reserva", label: "Reserva" },
  { id: "movimentacao", label: "Movimentação" },
  { id: "desinstalacao", label: "Desinstalação" },
]

export default function Consultas() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [locais, setLocais] = useState<{ label: string; value: string }[]>([])
  const [intervencoes, setIntervencoes] = useState<Intervencao[]>([])
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([])

  const [filtros, setFiltros] = useState({
    patrimonio: "",
    tiposIntervencao: [] as string[],
    local: "",
    dataInicial: null as Date | null,
    dataFinal: null as Date | null,
  })

  const [tabAtiva, setTabAtiva] = useState("visao-geral")
  const [resultadosFiltrados, setResultadosFiltrados] = useState<Intervencao[]>([])

  // Carregar dados iniciais
  useEffect(() => {
    async function carregarDados() {
      try {
        setIsLoading(true)

        // Carregar locais
        const locaisData = await getLocaisClient()
        setLocais(
          locaisData.map((local) => ({
            label: local.nome,
            value: local.nome,
          })),
        )

        // Carregar intervenções e equipamentos
        const supabase = getSupabaseClient()

        const { data: intervencoesData, error: intervencoesError } = await supabase
          .from("intervencoes")
          .select("*")
          .order("data_inicio", { ascending: false })

        if (intervencoesError) throw intervencoesError

        const { data: equipamentosData, error: equipamentosError } = await supabase.from("equipamentos").select("*")

        if (equipamentosError) throw equipamentosError

        setIntervencoes(intervencoesData as Intervencao[])
        setResultadosFiltrados(intervencoesData as Intervencao[])
        setEquipamentos(equipamentosData as Equipamento[])
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados para consulta.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    carregarDados()
  }, [toast])

  // Atualizar filtros
  const handleFiltroChange = (campo: string, valor: any) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }))
  }

  // Aplicar filtros
  const aplicarFiltros = () => {
    let resultados = [...intervencoes]

    // Filtrar por patrimônio
    if (filtros.patrimonio) {
      resultados = resultados.filter((item) => item.patrimonio.toLowerCase().includes(filtros.patrimonio.toLowerCase()))
    }

    // Filtrar por tipos de intervenção
    if (filtros.tiposIntervencao.length > 0) {
      resultados = resultados.filter((item) => filtros.tiposIntervencao.includes(item.tipo))
    }

    // Filtrar por local (origem ou destino)
    if (filtros.local) {
      resultados = resultados.filter(
        (item) =>
          (item.local_origem && item.local_origem.includes(filtros.local)) ||
          (item.local_destino && item.local_destino.includes(filtros.local)),
      )
    }

    // Filtrar por data inicial
    if (filtros.dataInicial) {
      const dataInicial = new Date(filtros.dataInicial)
      dataInicial.setHours(0, 0, 0, 0)
      resultados = resultados.filter((item) => {
        const dataItem = new Date(item.data_inicio)
        return dataItem >= dataInicial
      })
    }

    // Filtrar por data final
    if (filtros.dataFinal) {
      const dataFinal = new Date(filtros.dataFinal)
      dataFinal.setHours(23, 59, 59, 999)
      resultados = resultados.filter((item) => {
        const dataItem = new Date(item.data_inicio)
        return dataItem <= dataFinal
      })
    }

    setResultadosFiltrados(resultados)
  }

  // Exportar para CSV
  const exportarCSV = () => {
    // Implementação simplificada de exportação CSV
    const headers = ["Data", "Patrimônio", "Tipo", "Descrição", "Responsável"]

    const csvContent = [
      headers.join(","),
      ...resultadosFiltrados.map((item) =>
        [
          new Date(item.data_inicio).toLocaleDateString("pt-BR"),
          item.patrimonio,
          item.tipo,
          `"${(item.descricao || "").replace(/"/g, '""')}"`, // Escapar aspas
          item.responsavel || "",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `consulta_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Calcular indicadores
  const calcularIndicadores = () => {
    const totalEquipamentos = equipamentos.length

    // Calcular custos totais
    const custoTotal = intervencoes.reduce((total, item) => total + (item.custo || 0), 0)

    // Contar manutenções pendentes (sem data de término)
    const manutencoesPendentes = intervencoes.filter(
      (item) => (item.tipo === "manutencao-preventiva" || item.tipo === "manutencao-corretiva") && !item.data_termino,
    ).length

    // Contar equipamentos ativos e inativos (simplificado)
    const equipamentosAtivos = totalEquipamentos
    const equipamentosInativos = 0

    return {
      totalEquipamentos,
      gastosPeriodo: custoTotal,
      manutencoesPendentes,
      equipamentosAtivos,
      equipamentosInativos,
    }
  }

  // Calcular dados para gráficos
  const calcularDadosGraficos = () => {
    // Meses para o gráfico de custos mensais
    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

    // Inicializar custos mensais com zeros
    const custosMensais = meses.map((mes) => ({ mes, valor: 0 }))

    // Calcular custos por mês
    intervencoes.forEach((item) => {
      const data = new Date(item.data_inicio)
      const mes = data.getMonth()
      custosMensais[mes].valor += item.custo || 0
    })

    // Contar tipos de intervenção
    const tiposCount: Record<string, number> = {}
    intervencoes.forEach((item) => {
      tiposCount[item.tipo] = (tiposCount[item.tipo] || 0) + 1
    })

    const tiposIntervencaoData = Object.entries(tiposCount).map(([tipo, quantidade]) => ({
      tipo: formatarTipoIntervencao(tipo),
      quantidade,
    }))

    // Calcular custo por tipo
    const custosPorTipo: Record<string, number> = {}
    intervencoes.forEach((item) => {
      custosPorTipo[item.tipo] = (custosPorTipo[item.tipo] || 0) + (item.custo || 0)
    })

    const custoPorTipo = Object.entries(custosPorTipo).map(([tipo, valor]) => ({
      tipo: formatarTipoIntervencao(tipo),
      valor,
    }))

    return {
      custosMensais,
      tiposIntervencao: tiposIntervencaoData,
      custoPorTipo,
    }
  }

  // Formatar tipo de intervenção
  const formatarTipoIntervencao = (tipo: string) => {
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

  // Atalho de teclado para aplicar filtros
  useKeyboardShortcut("F9", aplicarFiltros)

  // Calcular dados para exibição
  const dadosIndicadores = calcularIndicadores()
  const dadosGraficos = calcularDadosGraficos()

  // Converter intervenções para o formato esperado pelo componente Timeline
  const timelineItems = resultadosFiltrados.map((item) => ({
    id: item.id,
    data: new Date(item.data_inicio),
    patrimonio: item.patrimonio,
    tipo: formatarTipoIntervencao(item.tipo),
    descricao: item.descricao || "",
    responsavel: item.responsavel || "",
  }))

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Painel de filtros (lateral) */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Patrimônio */}
              <div>
                <Label htmlFor="patrimonio">Número de Patrimônio</Label>
                <Input
                  id="patrimonio"
                  value={filtros.patrimonio}
                  onChange={(e) => handleFiltroChange("patrimonio", e.target.value)}
                  placeholder="Ex: AC12345"
                />
              </div>

              {/* Tipos de Intervenção */}
              <div>
                <Label>Tipo de Registro</Label>
                <CheckboxGroup
                  items={tiposIntervencao}
                  selectedItems={filtros.tiposIntervencao}
                  onChange={(selected) => handleFiltroChange("tiposIntervencao", selected)}
                />
              </div>

              {/* Localização */}
              <div>
                <Label htmlFor="local">Localização</Label>
                <Combobox
                  items={locais}
                  value={filtros.local}
                  onChange={(value) => handleFiltroChange("local", value)}
                  placeholder="Selecione o local"
                />
              </div>

              {/* Período - Data Inicial */}
              <div>
                <Label>Data Inicial</Label>
                <DatePicker date={filtros.dataInicial} onSelect={(date) => handleFiltroChange("dataInicial", date)} />
              </div>

              {/* Período - Data Final */}
              <div>
                <Label>Data Final</Label>
                <DatePicker date={filtros.dataFinal} onSelect={(date) => handleFiltroChange("dataFinal", date)} />
              </div>

              {/* Botão Aplicar */}
              <Button className="w-full" onClick={aplicarFiltros} disabled={isLoading}>
                {isLoading ? "Carregando..." : "Aplicar (F9)"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Área de resultados */}
        <div className="md:col-span-3">
          {isLoading ? (
            <Card>
              <CardContent className="p-8">
                <div className="flex justify-center">
                  <p>Carregando dados...</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Tabs value={tabAtiva} onValueChange={setTabAtiva}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
                <TabsTrigger value="historico">Histórico Cronológico</TabsTrigger>
                <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
              </TabsList>

              {/* Conteúdo da aba Visão Geral */}
              <TabsContent value="visao-geral" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total de Equipamentos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dadosIndicadores.totalEquipamentos}</div>
                      <p className="text-xs text-muted-foreground">
                        {dadosIndicadores.equipamentosAtivos} ativos, {dadosIndicadores.equipamentosInativos} inativos
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Gastos no Período</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">R$ {dadosIndicadores.gastosPeriodo.toFixed(2)}</div>
                      <p className="text-xs text-muted-foreground">Manutenções preventivas e corretivas</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Manutenções Pendentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dadosIndicadores.manutencoesPendentes}</div>
                      <p className="text-xs text-muted-foreground">Intervenções sem data de término</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Custos Mensais
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <BarChart data={dadosGraficos.custosMensais} />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PieChartIcon className="h-5 w-5" />
                        Tipos de Intervenção
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <PieChart data={dadosGraficos.tiposIntervencao} />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Conteúdo da aba Histórico Cronológico */}
              <TabsContent value="historico">
                <Card>
                  <CardHeader>
                    <CardTitle>Histórico Cronológico</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Timeline items={timelineItems} />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Conteúdo da aba Relatórios */}
              <TabsContent value="relatorios">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Relatório de Custos</CardTitle>
                    <Button variant="outline" size="sm" onClick={exportarCSV} className="flex items-center gap-2">
                      <DownloadIcon className="h-4 w-4" />
                      Exportar CSV
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      <div>
                        <h3 className="text-lg font-medium mb-4">Custos por Tipo de Intervenção</h3>
                        <LineChart data={dadosGraficos.custoPorTipo} />
                      </div>

                      <div className="rounded-md border">
                        <table className="min-w-full divide-y divide-border">
                          <thead>
                            <tr className="bg-muted/50">
                              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Tipo de Intervenção
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Quantidade
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Custo Total (R$)
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Custo Médio (R$)
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-background divide-y divide-border">
                            {dadosGraficos.custoPorTipo.map((item, index) => {
                              const quantidade =
                                dadosGraficos.tiposIntervencao.find((t) => t.tipo === item.tipo)?.quantidade || 0
                              const custoMedio = quantidade > 0 ? item.valor / quantidade : 0

                              return (
                                <tr key={index}>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm">{item.tipo}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm">{quantidade}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm">{item.valor.toFixed(2)}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm">{custoMedio.toFixed(2)}</td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  )
}
