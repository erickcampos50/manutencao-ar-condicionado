"use client"

import { useState } from "react"
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

// Tipos de intervenção para filtro
const tiposIntervencao = [
  { id: "reclamacao", label: "Reclamação" },
  { id: "manutencao-preventiva", label: "Manutenção Preventiva" },
  { id: "manutencao-corretiva", label: "Manutenção Corretiva" },
  { id: "reserva", label: "Reserva" },
  { id: "movimentacao", label: "Movimentação" },
  { id: "desinstalacao", label: "Desinstalação" },
]

// Locais para filtro
const locais = [
  { label: "Sala 101", value: "sala-101" },
  { label: "Sala 102", value: "sala-102" },
  { label: "Recepção", value: "recepcao" },
  { label: "Almoxarifado", value: "almoxarifado" },
  { label: "Escritório Administrativo", value: "escritorio-admin" },
]

// Dados de exemplo para demonstração
const dadosIndicadores = {
  totalEquipamentos: 15,
  gastosPeriodo: 2450.75,
  manutencoesPendentes: 3,
  equipamentosAtivos: 12,
  equipamentosInativos: 3,
}

// Dados de exemplo para o histórico
const dadosHistorico = [
  {
    id: 1,
    data: new Date("2023-05-10"),
    patrimonio: "AC12345",
    tipo: "Manutenção Preventiva",
    descricao: "Limpeza de filtros e verificação geral",
    responsavel: "João Silva",
  },
  {
    id: 2,
    data: new Date("2023-06-15"),
    patrimonio: "AC12345",
    tipo: "Movimentação",
    descricao: "Transferência para nova sala",
    responsavel: "Maria Oliveira",
  },
  {
    id: 3,
    data: new Date("2023-07-20"),
    patrimonio: "AC67890",
    tipo: "Reclamação",
    descricao: "Equipamento com ruído excessivo",
    responsavel: "Carlos Santos",
  },
  {
    id: 4,
    data: new Date("2023-07-25"),
    patrimonio: "AC67890",
    tipo: "Manutenção Corretiva",
    descricao: "Substituição de ventilador interno",
    responsavel: "Pedro Técnico",
  },
  {
    id: 5,
    data: new Date("2023-08-01"),
    patrimonio: "AC54321",
    tipo: "Reserva",
    descricao: "Reserva para instalação em nova sala",
    responsavel: "Ana Planejamento",
  },
]

// Dados de exemplo para os gráficos
const dadosGraficos = {
  custosMensais: [
    { mes: "Jan", valor: 350 },
    { mes: "Fev", valor: 420 },
    { mes: "Mar", valor: 180 },
    { mes: "Abr", valor: 0 },
    { mes: "Mai", valor: 650 },
    { mes: "Jun", valor: 200 },
    { mes: "Jul", valor: 320 },
    { mes: "Ago", valor: 180 },
    { mes: "Set", valor: 0 },
    { mes: "Out", valor: 150 },
    { mes: "Nov", valor: 0 },
    { mes: "Dez", valor: 0 },
  ],
  tiposIntervencao: [
    { tipo: "Manutenção Preventiva", quantidade: 8 },
    { tipo: "Manutenção Corretiva", quantidade: 5 },
    { tipo: "Reclamação", quantidade: 3 },
    { tipo: "Movimentação", quantidade: 4 },
    { tipo: "Reserva", quantidade: 2 },
    { tipo: "Desinstalação", quantidade: 1 },
  ],
  custoPorTipo: [
    { tipo: "Manutenção Preventiva", valor: 1200 },
    { tipo: "Manutenção Corretiva", valor: 2800 },
    { tipo: "Movimentação", valor: 450 },
  ],
}

export default function Consultas() {
  const [filtros, setFiltros] = useState({
    patrimonio: "",
    tiposIntervencao: [] as string[],
    local: "",
    dataInicial: null as Date | null,
    dataFinal: null as Date | null,
  })

  const [tabAtiva, setTabAtiva] = useState("visao-geral")
  const [resultadosFiltrados, setResultadosFiltrados] = useState(dadosHistorico)

  // Atualizar filtros
  const handleFiltroChange = (campo: string, valor: any) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }))
  }

  // Aplicar filtros
  const aplicarFiltros = () => {
    // Aqui seria implementada a lógica real de filtragem
    // Por enquanto, apenas simulamos o resultado
    console.log("Filtros aplicados:", filtros)

    // Simulação de filtragem por patrimônio
    let resultados = dadosHistorico
    if (filtros.patrimonio) {
      resultados = resultados.filter((item) => item.patrimonio.toLowerCase().includes(filtros.patrimonio.toLowerCase()))
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
          new Date(item.data).toLocaleDateString("pt-BR"),
          item.patrimonio,
          item.tipo,
          `"${item.descricao.replace(/"/g, '""')}"`, // Escapar aspas
          item.responsavel,
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

  // Atalho de teclado para aplicar filtros
  useKeyboardShortcut("F9", aplicarFiltros)

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
              <Button className="w-full" onClick={aplicarFiltros}>
                Aplicar (F9)
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Área de resultados */}
        <div className="md:col-span-3">
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
                  <Timeline items={resultadosFiltrados} />
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
        </div>
      </div>
    </div>
  )
}
