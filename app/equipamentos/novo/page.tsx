"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Combobox } from "@/components/combobox"
import { useToast } from "@/hooks/use-toast"
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut"
import { DatePicker } from "@/components/date-picker"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { adicionarEquipamento, atualizarEquipamento, buscarEquipamentoPorPatrimonio } from "@/app/actions"
import { getLocaisClient, addLocalClient, getEquipamentosClient } from "@/lib/supabase/client"
import { CSVImport } from "@/components/csv-import"

// Tipos de equipamento
const tiposEquipamento = [
  { label: "Split", value: "split" },
  { label: "Janela", value: "janela" },
  { label: "Cassete", value: "cassete" },
  { label: "Piso-Teto", value: "piso-teto" },
  { label: "Portátil", value: "portatil" },
]

// Voltagens disponíveis
const voltagens = [
  { label: "110V", value: "110" },
  { label: "220V", value: "220" },
  { label: "Bivolt", value: "bivolt" },
]

// Cores disponíveis
const cores = [
  { label: "Branco", value: "branco" },
  { label: "Preto", value: "preto" },
  { label: "Prata", value: "prata" },
  { label: "Bege", value: "bege" },
]

export default function NovoEquipamento() {
  const router = useRouter()
  const { toast } = useToast()
  const patrimonioRef = useRef<HTMLInputElement>(null)
  const [locais, setLocais] = useState<{ label: string; value: string }[]>([])
  const [equipamentos, setEquipamentos] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [modoEdicao, setModoEdicao] = useState(false)
  const [equipamentoEditando, setEquipamentoEditando] = useState<any>(null)

  const [formData, setFormData] = useState({
    patrimonio: "",
    marca: "",
    modelo: "",
    numeroSerie: "",
    localInicial: "",
    peso: "",
    cor: "",
    potencia: "",
    capacidade: "",
    voltagem: "",
    tipo: "",
    dataEntrada: new Date(),
    observacoes: "",
  })

  // Carregar locais e equipamentos do Supabase
  useEffect(() => {
    async function carregarDados() {
      try {
        // Carregar locais
        const locaisData = await getLocaisClient()
        setLocais(
          locaisData.map((local) => ({
            label: local.nome,
            value: local.nome,
          })),
        )

        // Carregar equipamentos
        const equipamentosData = await getEquipamentosClient()
        setEquipamentos(equipamentosData)
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados.",
          variant: "destructive",
        })
      }
    }

    carregarDados()
  }, [toast])

  // Foco inicial no primeiro campo
  useEffect(() => {
    if (patrimonioRef.current) {
      patrimonioRef.current.focus()
    }
  }, [])

  // Validação do patrimônio
  const validarPatrimonio = (valor: string) => {
    return /^[A-Za-z0-9]{3,20}$/.test(valor)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleComboboxChange = async (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Se for um novo local, adicionar ao banco de dados
    if (name === "localInicial" && value && !locais.some((local) => local.value === value)) {
      try {
        const novoLocal = await addLocalClient(value)
        setLocais((prev) => [...prev, { label: novoLocal.nome, value: novoLocal.nome }])
        toast({
          title: "Local adicionado",
          description: `O local "${value}" foi adicionado com sucesso.`,
        })
      } catch (error) {
        console.error("Erro ao adicionar novo local:", error)
        toast({
          title: "Erro",
          description: "Não foi possível adicionar o novo local.",
          variant: "destructive",
        })
      }
    }
  }

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({ ...prev, dataEntrada: date }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Validação básica
    if (!formData.patrimonio || !validarPatrimonio(formData.patrimonio)) {
      toast({
        title: "Erro de validação",
        description: "Número de patrimônio inválido. Use de 3 a 20 caracteres alfanuméricos.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (!formData.localInicial) {
      toast({
        title: "Erro de validação",
        description: "Local inicial é obrigatório.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      // Criar FormData para enviar ao servidor
      const formDataObj = new FormData()
      formDataObj.append("patrimonio", formData.patrimonio)
      formDataObj.append("marca", formData.marca)
      formDataObj.append("modelo", formData.modelo)
      formDataObj.append("numeroSerie", formData.numeroSerie)
      formDataObj.append("localInicial", formData.localInicial)
      formDataObj.append("peso", formData.peso)
      formDataObj.append("cor", formData.cor)
      formDataObj.append("potencia", formData.potencia)
      formDataObj.append("capacidade", formData.capacidade)
      formDataObj.append("voltagem", formData.voltagem)
      formDataObj.append("tipo", formData.tipo)
      formDataObj.append("observacoes", formData.observacoes)
      formDataObj.append("dataEntrada", formData.dataEntrada.toISOString())

      // Enviar para o servidor
      const resultado = await adicionarEquipamento(formDataObj)

      if (resultado.success) {
        toast({
          title: "Registro salvo",
          description: resultado.message,
        })

        // Limpar formulário
        setFormData({
          patrimonio: "",
          marca: "",
          modelo: "",
          numeroSerie: "",
          localInicial: "",
          peso: "",
          cor: "",
          potencia: "",
          capacidade: "",
          voltagem: "",
          tipo: "",
          dataEntrada: new Date(),
          observacoes: "",
        })

        // Retornar foco ao primeiro campo
        if (patrimonioRef.current) {
          patrimonioRef.current.focus()
        }
      } else {
        toast({
          title: "Erro ao salvar",
          description: resultado.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao salvar equipamento:", error)
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar o equipamento.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    setFormData({
      patrimonio: "",
      marca: "",
      modelo: "",
      numeroSerie: "",
      localInicial: "",
      peso: "",
      cor: "",
      potencia: "",
      capacidade: "",
      voltagem: "",
      tipo: "",
      dataEntrada: new Date(),
      observacoes: "",
    })

    if (patrimonioRef.current) {
      patrimonioRef.current.focus()
    }
  }

  // Função chamada após importação CSV bem-sucedida
  const handleImportComplete = () => {
    // Recarregar locais caso novos tenham sido adicionados
    async function recarregarLocais() {
      try {
        const locaisData = await getLocaisClient()
        setLocais(
          locaisData.map((local) => ({
            label: local.nome,
            value: local.nome,
          })),
        )
      } catch (error) {
        console.error("Erro ao recarregar locais:", error)
      }
    }
    
    recarregarLocais()
  }

  // Atalhos de teclado
  useKeyboardShortcut("F9", (e) => {
    e.preventDefault()
    void handleSubmit(e as unknown as React.FormEvent)
  })
  useKeyboardShortcut("F4", handleClear)
  useKeyboardShortcut("F1", () => {
    toast({
      title: "Ajuda",
      description: "F9: Salvar | F4: Cancelar/Limpar | F1: Ajuda",
    })
  })

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="max-w-4xl mx-auto">
        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="manual">Entrada Manual</TabsTrigger>
            <TabsTrigger value="editar">Editar Equipamento</TabsTrigger>
            <TabsTrigger value="csv">Importar CSV</TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual">
            <Card>
              <CardHeader>
                <CardTitle>Entrada de Equipamento</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-4">
                  {/* Número de Patrimônio */}
                  <div className="col-span-12 md:col-span-6">
                    <Label htmlFor="patrimonio" className="mb-1 block">
                      Número de Patrimônio *
                    </Label>
                    <Input
                      id="patrimonio"
                      name="patrimonio"
                      ref={patrimonioRef}
                      value={formData.patrimonio}
                      onChange={handleInputChange}
                      placeholder="Ex: AC12345"
                      className="w-full"
                      required
                    />
                  </div>

                  {/* Marca */}
                  <div className="col-span-12 md:col-span-6">
                    <Label htmlFor="marca" className="mb-1 block">
                      Marca
                    </Label>
                    <Input
                      id="marca"
                      name="marca"
                      value={formData.marca}
                      onChange={handleInputChange}
                      placeholder="Ex: Samsung"
                      className="w-full"
                    />
                  </div>

                  {/* Modelo */}
                  <div className="col-span-12 md:col-span-6">
                    <Label htmlFor="modelo" className="mb-1 block">
                      Modelo
                    </Label>
                    <Input
                      id="modelo"
                      name="modelo"
                      value={formData.modelo}
                      onChange={handleInputChange}
                      placeholder="Ex: AR12TRHQCWK"
                      className="w-full"
                    />
                  </div>

                  {/* Número de Série */}
                  <div className="col-span-12 md:col-span-6">
                    <Label htmlFor="numeroSerie" className="mb-1 block">
                      Nº de Série
                    </Label>
                    <Input
                      id="numeroSerie"
                      name="numeroSerie"
                      value={formData.numeroSerie}
                      onChange={handleInputChange}
                      placeholder="Ex: SN12345678"
                      className="w-full"
                    />
                  </div>

                  {/* Local Inicial */}
                  <div className="col-span-12 md:col-span-6">
                    <Label htmlFor="localInicial" className="mb-1 block">
                      Local Inicial *
                    </Label>
                    <Combobox
                      items={locais}
                      value={formData.localInicial}
                      onChange={(value) => handleComboboxChange("localInicial", value)}
                      placeholder="Selecione o local inicial"
                      allowCustomValue={true}
                    />
                  </div>

                  {/* Peso */}
                  <div className="col-span-12 md:col-span-6">
                    <Label htmlFor="peso" className="mb-1 block">
                      Peso (kg)
                    </Label>
                    <Input
                      id="peso"
                      name="peso"
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.peso}
                      onChange={handleInputChange}
                      placeholder="Ex: 12.5"
                      className="w-full"
                    />
                  </div>

                  {/* Cor */}
                  <div className="col-span-12 md:col-span-6">
                    <Label htmlFor="cor" className="mb-1 block">
                      Cor
                    </Label>
                    <Combobox
                      items={cores}
                      value={formData.cor}
                      onChange={(value) => handleComboboxChange("cor", value)}
                      placeholder="Selecione a cor"
                    />
                  </div>

                  {/* Potência */}
                  <div className="col-span-12 md:col-span-6">
                    <Label htmlFor="potencia" className="mb-1 block">
                      Potência (W)
                    </Label>
                    <Input
                      id="potencia"
                      name="potencia"
                      type="number"
                      min="0"
                      value={formData.potencia}
                      onChange={handleInputChange}
                      placeholder="Ex: 1500"
                      className="w-full"
                    />
                  </div>

                  {/* Capacidade */}
                  <div className="col-span-12 md:col-span-6">
                    <Label htmlFor="capacidade" className="mb-1 block">
                      Capacidade (BTU)
                    </Label>
                    <Input
                      id="capacidade"
                      name="capacidade"
                      type="number"
                      min="0"
                      value={formData.capacidade}
                      onChange={handleInputChange}
                      placeholder="Ex: 12000"
                      className="w-full"
                    />
                  </div>

                  {/* Voltagem */}
                  <div className="col-span-12 md:col-span-6">
                    <Label htmlFor="voltagem" className="mb-1 block">
                      Voltagem
                    </Label>
                    <Combobox
                      items={voltagens}
                      value={formData.voltagem}
                      onChange={(value) => handleComboboxChange("voltagem", value)}
                      placeholder="Selecione a voltagem"
                    />
                  </div>

                  {/* Tipo */}
                  <div className="col-span-12 md:col-span-6">
                    <Label htmlFor="tipo" className="mb-1 block">
                      Tipo
                    </Label>
                    <Combobox
                      items={tiposEquipamento}
                      value={formData.tipo}
                      onChange={(value) => handleComboboxChange("tipo", value)}
                      placeholder="Selecione o tipo"
                    />
                  </div>

                  {/* Observações */}
                  <div className="col-span-12 md:col-span-6">
                    <Label htmlFor="observacoes" className="mb-1 block">
                      Observações
                    </Label>
                    <Textarea
                      id="observacoes"
                      name="observacoes"
                      value={formData.observacoes}
                      onChange={handleInputChange}
                      placeholder="Observações adicionais"
                      className="w-full"
                      rows={3}
                    />
                  </div>

                  {/* Data de Entrada */}
                  <div className="col-span-12 md:col-span-6">
                    <Label htmlFor="dataEntrada" className="mb-1 block">
                      Data de Entrada
                    </Label>
                    <DatePicker date={formData.dataEntrada} onSelect={handleDateChange} />
                  </div>

                  {/* Botões de ação */}
                  <div className="col-span-12 flex justify-end gap-4 mt-6">
                    <Button type="button" variant="outline" onClick={handleClear} disabled={isLoading}>
                      Cancelar (F4)
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Salvando..." : "Salvar (F9)"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="editar">
            <Card>
              <CardHeader>
                <CardTitle>Editar Equipamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Seleção de equipamento para editar */}
                  <div>
                    <Label>Selecione um equipamento para editar</Label>
                    <div className="max-h-64 overflow-y-auto border rounded-md mt-2">
                      <table className="min-w-full divide-y divide-border">
                        <thead className="sticky top-0 bg-muted/50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Patrimônio
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Marca
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Modelo
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Local
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Ações
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-background divide-y divide-border">
                          {equipamentos.map((equip) => (
                            <tr
                              key={equip.id}
                              className={`cursor-pointer hover:bg-muted transition-colors ${
                                equipamentoEditando?.id === equip.id ? "bg-blue-50 border-blue-200" : ""
                              }`}
                            >
                              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">{equip.patrimonio}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">{equip.marca || "-"}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">{equip.modelo || "-"}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">{equip.local_inicial}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEquipamentoEditando(equip)
                                    setModoEdicao(true)
                                    setFormData({
                                      patrimonio: equip.patrimonio,
                                      marca: equip.marca || "",
                                      modelo: equip.modelo || "",
                                      numeroSerie: equip.numero_serie || "",
                                      localInicial: equip.local_inicial,
                                      peso: equip.peso?.toString() || "",
                                      cor: equip.cor || "",
                                      potencia: equip.potencia?.toString() || "",
                                      capacidade: equip.capacidade?.toString() || "",
                                      voltagem: equip.voltagem || "",
                                      tipo: equip.tipo || "",
                                      dataEntrada: new Date(equip.data_entrada),
                                      observacoes: equip.observacoes || "",
                                    })
                                  }}
                                >
                                  Editar
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Formulário de edição */}
                  {modoEdicao && equipamentoEditando && (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault()
                        setIsLoading(true)

                        try {
                          const formDataObj = new FormData()
                          formDataObj.append("patrimonio", formData.patrimonio)
                          formDataObj.append("marca", formData.marca)
                          formDataObj.append("modelo", formData.modelo)
                          formDataObj.append("numeroSerie", formData.numeroSerie)
                          formDataObj.append("localInicial", formData.localInicial)
                          formDataObj.append("peso", formData.peso)
                          formDataObj.append("cor", formData.cor)
                          formDataObj.append("potencia", formData.potencia)
                          formDataObj.append("capacidade", formData.capacidade)
                          formDataObj.append("voltagem", formData.voltagem)
                          formDataObj.append("tipo", formData.tipo)
                          formDataObj.append("observacoes", formData.observacoes)
                          formDataObj.append("dataEntrada", formData.dataEntrada.toISOString())

                          const resultado = await atualizarEquipamento(equipamentoEditando.id, formDataObj)

                          if (resultado.success) {
                            toast({
                              title: "Equipamento atualizado",
                              description: resultado.message,
                            })

                            // Recarregar equipamentos
                            const equipamentosData = await getEquipamentosClient()
                            setEquipamentos(equipamentosData)

                            // Limpar edição
                            setModoEdicao(false)
                            setEquipamentoEditando(null)
                            handleClear()
                          } else {
                            toast({
                              title: "Erro ao atualizar",
                              description: resultado.message,
                              variant: "destructive",
                            })
                          }
                        } catch (error) {
                          console.error("Erro ao atualizar equipamento:", error)
                          toast({
                            title: "Erro ao atualizar",
                            description: "Ocorreu um erro ao atualizar o equipamento.",
                            variant: "destructive",
                          })
                        } finally {
                          setIsLoading(false)
                        }
                      }}
                      className="grid grid-cols-12 gap-4 mt-6 p-4 border rounded-md bg-muted/20"
                    >
                      <div className="col-span-12">
                        <h3 className="text-lg font-medium">Editando: {equipamentoEditando.patrimonio}</h3>
                      </div>

                      {/* Campos do formulário - mesma estrutura da aba manual */}
                      <div className="col-span-12 md:col-span-6">
                        <Label htmlFor="edit-patrimonio">Número de Patrimônio *</Label>
                        <Input
                          id="edit-patrimonio"
                          name="patrimonio"
                          value={formData.patrimonio}
                          onChange={handleInputChange}
                          placeholder="Ex: AC12345"
                          required
                        />
                      </div>

                      <div className="col-span-12 md:col-span-6">
                        <Label htmlFor="edit-marca">Marca</Label>
                        <Input
                          id="edit-marca"
                          name="marca"
                          value={formData.marca}
                          onChange={handleInputChange}
                          placeholder="Ex: Samsung"
                        />
                      </div>

                      <div className="col-span-12 md:col-span-6">
                        <Label htmlFor="edit-modelo">Modelo</Label>
                        <Input
                          id="edit-modelo"
                          name="modelo"
                          value={formData.modelo}
                          onChange={handleInputChange}
                          placeholder="Ex: AR12TRHQCWK"
                        />
                      </div>

                      <div className="col-span-12 md:col-span-6">
                        <Label htmlFor="edit-numeroSerie">Nº de Série</Label>
                        <Input
                          id="edit-numeroSerie"
                          name="numeroSerie"
                          value={formData.numeroSerie}
                          onChange={handleInputChange}
                          placeholder="Ex: SN12345678"
                        />
                      </div>

                      <div className="col-span-12 md:col-span-6">
                        <Label htmlFor="edit-localInicial">Local Inicial *</Label>
                        <Combobox
                          items={locais}
                          value={formData.localInicial}
                          onChange={(value) => handleComboboxChange("localInicial", value)}
                          placeholder="Selecione o local inicial"
                          allowCustomValue={true}
                        />
                      </div>

                      <div className="col-span-12 md:col-span-6">
                        <Label htmlFor="edit-peso">Peso (kg)</Label>
                        <Input
                          id="edit-peso"
                          name="peso"
                          type="number"
                          min="0"
                          step="0.1"
                          value={formData.peso}
                          onChange={handleInputChange}
                          placeholder="Ex: 12.5"
                        />
                      </div>

                      <div className="col-span-12 md:col-span-6">
                        <Label htmlFor="edit-cor">Cor</Label>
                        <Combobox
                          items={cores}
                          value={formData.cor}
                          onChange={(value) => handleComboboxChange("cor", value)}
                          placeholder="Selecione a cor"
                        />
                      </div>

                      <div className="col-span-12 md:col-span-6">
                        <Label htmlFor="edit-potencia">Potência (W)</Label>
                        <Input
                          id="edit-potencia"
                          name="potencia"
                          type="number"
                          min="0"
                          value={formData.potencia}
                          onChange={handleInputChange}
                          placeholder="Ex: 1500"
                        />
                      </div>

                      <div className="col-span-12 md:col-span-6">
                        <Label htmlFor="edit-capacidade">Capacidade (BTU)</Label>
                        <Input
                          id="edit-capacidade"
                          name="capacidade"
                          type="number"
                          min="0"
                          value={formData.capacidade}
                          onChange={handleInputChange}
                          placeholder="Ex: 12000"
                        />
                      </div>

                      <div className="col-span-12 md:col-span-6">
                        <Label htmlFor="edit-voltagem">Voltagem</Label>
                        <Combobox
                          items={voltagens}
                          value={formData.voltagem}
                          onChange={(value) => handleComboboxChange("voltagem", value)}
                          placeholder="Selecione a voltagem"
                        />
                      </div>

                      <div className="col-span-12 md:col-span-6">
                        <Label htmlFor="edit-tipo">Tipo</Label>
                        <Combobox
                          items={tiposEquipamento}
                          value={formData.tipo}
                          onChange={(value) => handleComboboxChange("tipo", value)}
                          placeholder="Selecione o tipo"
                        />
                      </div>

                      <div className="col-span-12 md:col-span-6">
                        <Label htmlFor="edit-observacoes">Observações</Label>
                        <Textarea
                          id="edit-observacoes"
                          name="observacoes"
                          value={formData.observacoes}
                          onChange={handleInputChange}
                          placeholder="Observações adicionais"
                          rows={3}
                        />
                      </div>

                      <div className="col-span-12 md:col-span-6">
                        <Label htmlFor="edit-dataEntrada">Data de Entrada</Label>
                        <DatePicker date={formData.dataEntrada} onSelect={handleDateChange} />
                      </div>

                      <div className="col-span-12 flex justify-end gap-4 mt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setModoEdicao(false)
                            setEquipamentoEditando(null)
                            handleClear()
                          }}
                          disabled={isLoading}
                        >
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? "Atualizando..." : "Atualizar"}
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="csv">
            <CSVImport onImportComplete={handleImportComplete} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
