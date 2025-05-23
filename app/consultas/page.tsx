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
import { MultiSelect } from "@/components/multi-select"
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
  const [locais, setLocais] = useState<{ id: string; label: string }[]>([])
  const [intervencoes, setIntervencoes] = useState<Intervencao[]>([])
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([])

  const [filtros, setFiltros] = useState({
    patrimonio: "",
    tiposIntervencao: [] as string[],
    locais: [] as string[], // vários locais
    marca: "",
    potencia: "",
    local: "", // manter para compatibilidade, mas será substituído por locais
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
            id: local.nome,
            label: local.nome,
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

  // Limpar filtros
  const limparFiltros = () => {
    setFiltros({
      patrimonio: "",
      tiposIntervencao: [],
      locais: [],
      marca: "",
      potencia: "",
      local: "",
      dataInicial: null,
      dataFinal: null,
    })
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

    // Filtrar por vários locais (origem ou destino)
    if (filtros.locais && filtros.locais.length > 0) {
      resultados = resultados.filter(
        (item) =>
          (item.local_origem && filtros.locais.includes(item.local_origem)) ||
          (item.local_destino && filtros.locais.includes(item.local_destino)),
      )
    }

    // Filtrar por marca
    if (filtros.marca) {
      resultados = resultados.filter((item) => {
        const eq = equipamentos.find((e) => e.patrimonio === item.patrimonio)
        return eq && eq.marca && eq.marca.toLowerCase().includes(filtros.marca.toLowerCase())
      })
    }

    // Filtrar por potência
    if (filtros.potencia) {
      resultados = resultados.filter((item) => {
        const eq = equipamentos.find((e) => e.patrimonio === item.patrimonio)
        return eq && eq.potencia && eq.potencia.toString().includes(filtros.potencia)
      })
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

  // Aplicar filtros automaticamente quando os filtros mudarem
  useEffect(() => {
    aplicarFiltros()
  }, [filtros, intervencoes, equipamentos])

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
    // Filtrar equipamentos conforme filtros aplicados (marca e potência)
    const equipamentosFiltrados = equipamentos.filter((eq) => {
      if (filtros.marca && !eq.marca?.toLowerCase().includes(filtros.marca.toLowerCase())) {
        return false
      }
      if (filtros.potencia && !eq.potencia?.toString().includes(filtros.potencia)) {
        return false
      }
      if (filtros.locais && filtros.locais.length > 0 && !filtros.locais.includes(eq.local_inicial)) {
        return false
      }
      return true
    })

    const totalEquipamentos = equipamentosFiltrados.length

    // Calcular custos totais com intervenções filtradas
    const custoTotal = resultadosFiltrados.reduce((total, item) => total + (item.custo || 0), 0)

    // Contar manutenções pendentes (sem data de término) nas intervenções filtradas
    const manutencoesPendentes = resultadosFiltrados.filter(
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

    // Calcular custos por mês nas intervenções filtradas
    resultadosFiltrados.forEach((item) => {
      const data = new Date(item.data_inicio)
      const mes = data.getMonth()
      custosMensais[mes].valor += item.custo || 0
    })

    // Contar tipos de intervenção nas intervenções filtradas
    const tiposCount: Record<string, number> = {}
    resultadosFiltrados.forEach((item) => {
      tiposCount[item.tipo] = (tiposCount[item.tipo] || 0) + 1
    })

    const tiposIntervencaoData = Object.entries(tiposCount).map(([tipo, quantidade]) => ({
      tipo: formatarTipoIntervencao(tipo),
      quantidade,
    }))

    // Calcular custo por tipo nas intervenções filtradas
    const custosPorTipo: Record<string, number> = {}
    resultadosFiltrados.forEach((item) => {
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

  // Filtrar equipamentos para exibição na tabela
  const equipamentosFiltrados = equipamentos.filter((eq) => {
    // Filtrar por patrimônio
    if (filtros.patrimonio && !eq.patrimonio.toLowerCase().includes(filtros.patrimonio.toLowerCase())) {
      return false
    }
    
    // Filtrar por marca
    if (filtros.marca && !eq.marca?.toLowerCase().includes(filtros.marca.toLowerCase())) {
      return false
    }
    
    // Filtrar por potência
    if (filtros.potencia && !eq.potencia?.toString().includes(filtros.potencia)) {
      return false
    }
    
    // Filtrar por locais
    if (filtros.locais && filtros.locais.length > 0 && !filtros.locais.includes(eq.local_inicial)) {
      return false
    }
    
    return true
  })

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

  // Identificar equipamentos desinstalados disponíveis para instalação
  const equipamentosDesinstalados = equipamentos.filter((eq) => {
    // Buscar a última intervenção de desinstalação para este equipamento
    const ultimaDesinstalacao = intervencoes
      .filter((int) => int.patrimonio === eq.patrimonio && int.tipo === "desinstalacao")
      .sort((a, b) => new Date(b.data_inicio).getTime() - new Date(a.data_inicio).getTime())[0]

    if (!ultimaDesinstalacao) return false

    // Verificar se não há movimentação ou instalação posterior à desinstalação
    const intervencoesPosterior = intervencoes.filter(
      (int) =>
        int.patrimonio === eq.patrimonio &&
        (int.tipo === "movimentacao" || int.tipo === "instalacao") &&
        new Date(int.data_inicio) > new Date(ultimaDesinstalacao.data_inicio)
    )

    // Se não há intervenções posteriores, o equipamento está disponível
    return intervencoesPosterior.length === 0
  })

  // Filtrar equipamentos desinstalados conforme filtros aplicados
  const equipamentosDesinstaladosFiltrados = equipamentosDesinstalados.filter((eq) => {
    // Filtrar por patrimônio
    if (filtros.patrimonio && !eq.patrimonio.toLowerCase().includes(filtros.patrimonio.toLowerCase())) {
      return false
    }
    
    // Filtrar por marca
    if (filtros.marca && !eq.marca?.toLowerCase().includes(filtros.marca.toLowerCase())) {
      return false
    }
    
    // Filtrar por potência
    if (filtros.potencia && !eq.potencia?.toString().includes(filtros.potencia)) {
      return false
    }
    
    return true
  })

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

              {/* Vários Locais */}
              <div>
                <Label>Locais</Label>
                <MultiSelect
                  items={locais}
                  selectedItems={filtros.locais}
                  onChange={(selected) => handleFiltroChange("locais", selected)}
                  placeholder="Selecione locais..."
                />
              </div>

              {/* Marca */}
              <div>
                <Label htmlFor="marca">Marca</Label>
                <Input
                  id="marca"
                  value={filtros.marca}
                  onChange={(e) => handleFiltroChange("marca", e.target.value)}
                  placeholder="Ex: LG, Samsung"
                />
              </div>

              {/* Potência */}
              <div>
                <Label htmlFor="potencia">Potência</Label>
                <Input
                  id="potencia"
                  value={filtros.potencia}
                  onChange={(e) => handleFiltroChange("potencia", e.target.value)}
                  placeholder="Ex: 12000"
                />
              </div>

              {/* Período - Data Inicial */}
              <div>
                <Label>Data Inicial</Label>
                <DatePicker date={filtros.dataInicial ?? undefined} onSelect={(date) => handleFiltroChange("dataInicial", date)} />
              </div>

              {/* Período - Data Final */}
              <div>
                <Label>Data Final</Label>
                <DatePicker date={filtros.dataFinal ?? undefined} onSelect={(date) => handleFiltroChange("dataFinal", date)} />
              </div>

              {/* Botões de ação */}
              <div className="flex gap-2">
                <Button className="w-1/2" onClick={aplicarFiltros} disabled={isLoading}>
                  {isLoading ? "Carregando..." : "Aplicar (F9)"}
                </Button>
                <Button className="w-1/2" variant="outline" onClick={limparFiltros} disabled={isLoading}>
                  Limpar
                </Button>
              </div>
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
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
                <TabsTrigger value="historico">Histórico Cronológico</TabsTrigger>
                <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
                <TabsTrigger value="equipamentos">Equipamentos</TabsTrigger>
                <TabsTrigger value="desinstalados">Desinstalados</TabsTrigger>
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

              {/* Conteúdo da aba Equipamentos */}
              <TabsContent value="equipamentos" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Equipamentos Registrados ({equipamentosFiltrados.length} de {equipamentos.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-border">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Patrimônio
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Marca
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Modelo
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Número de Série
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Local Inicial
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Potência
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Capacidade
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Voltagem
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Tipo
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Data Entrada
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-background divide-y divide-border">
                          {equipamentosFiltrados.map((eq) => (
                            <tr key={eq.id}>
                              <td className="px-4 py-3 whitespace-nowrap text-sm">{eq.patrimonio}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm">{eq.marca || "-"}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm">{eq.modelo || "-"}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm">{eq.numero_serie || "-"}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm">{eq.local_inicial}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm">{eq.potencia || "-"}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm">{eq.capacidade || "-"}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm">{eq.voltagem || "-"}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm">{eq.tipo || "-"}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm">{new Date(eq.data_entrada).toLocaleDateString("pt-BR")}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Conteúdo da aba Equipamentos Desinstalados */}
              <TabsContent value="desinstalados" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Equipamentos Desinstalados - Disponíveis para Instalação ({equipamentosDesinstaladosFiltrados.length} de {equipamentosDesinstalados.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {equipamentosDesinstaladosFiltrados.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">Nenhum equipamento desinstalado encontrado com os filtros aplicados.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-border">
                          <thead>
                            <tr className="bg-muted/50">
                              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Patrimônio
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Marca
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Modelo
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Número de Série
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Potência
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Capacidade
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Voltagem
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Tipo
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Última Desinstalação
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-background divide-y divide-border">
                            {equipamentosDesinstaladosFiltrados.map((eq) => {
                              // Buscar a última desinstalação
                              const ultimaDesinstalacao = intervencoes
                                .filter((int) => int.patrimonio === eq.patrimonio && int.tipo === "desinstalacao")
                                .sort((a, b) => new Date(b.data_inicio).getTime() - new Date(a.data_inicio).getTime())[0]

                              return (
                                <tr key={eq.id} className="hover:bg-muted/50">
                                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{eq.patrimonio}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm">{eq.marca || "-"}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm">{eq.modelo || "-"}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm">{eq.numero_serie || "-"}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm">{eq.potencia || "-"}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm">{eq.capacidade || "-"}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm">{eq.voltagem || "-"}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm">{eq.tipo || "-"}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                                    {ultimaDesinstalacao ? new Date(ultimaDesinstalacao.data_inicio).toLocaleDateString("pt-BR") : "-"}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      Disponível
                                    </span>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
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
