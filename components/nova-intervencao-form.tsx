"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/date-picker"
import { Combobox } from "@/components/combobox"
import { useToast } from "@/hooks/use-toast"
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut"
import { tiposIntervencao } from "@/app/intervencoes/page"
import { EquipamentoDetalhes } from "@/components/equipamento-detalhes"
import { EquipamentoHistorico } from "@/components/equipamento-historico"
import {
  getLocaisClient,
  getEquipamentosClient,
  getEquipamentoByPatrimonioClient,
  getIntervencoesByPatrimonioClient,
  addLocalClient,
} from "@/lib/supabase/client"
import { adicionarIntervencao } from "@/app/actions"

interface NovaIntervencaoFormProps {
  onSubmit: (data: any) => void
  onCancel: () => void
}

export function NovaIntervencaoForm({ onSubmit, onCancel }: NovaIntervencaoFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [locais, setLocais] = useState<{ label: string; value: string }[]>([])
  const [patrimonios, setPatrimonios] = useState<{ label: string; value: string }[]>([])

  const [mostrarTabelaEquipamentos, setMostrarTabelaEquipamentos] = useState(false)

  const [formData, setFormData] = useState({
    patrimonio: "",
    tipo: "",
    descricao: "",
    dataInicio: new Date(),
    dataTermino: null as Date | null,
    localDestino: "",
    custo: "",
    responsavel: "Usuário Atual", // Em um sistema real, seria o usuário logado
    observacoes: "",
  })

  const [equipamentoSelecionado, setEquipamentoSelecionado] = useState<any>(null)
  const [historicoEquipamento, setHistoricoEquipamento] = useState<any[]>([])

  // Carregar dados iniciais
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

        // Carregar patrimônios
        const equipamentosData = await getEquipamentosClient()
        setPatrimonios(
          equipamentosData.map((equip) => ({
            label: equip.patrimonio,
            value: equip.patrimonio,
          })),
        )
      } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados iniciais.",
          variant: "destructive",
        })
      }
    }

    carregarDados()
  }, [toast])

  // Efeito para buscar detalhes do equipamento quando o patrimônio muda
  useEffect(() => {
    async function buscarDetalhesEquipamento() {
      if (!formData.patrimonio) {
        setEquipamentoSelecionado(null)
        setHistoricoEquipamento([])
        return
      }

      try {
        // Buscar equipamento
        const equipamento = await getEquipamentoByPatrimonioClient(formData.patrimonio)

        if (equipamento) {
          setEquipamentoSelecionado({
            patrimonio: equipamento.patrimonio,
            marca: equipamento.marca || "",
            modelo: equipamento.modelo || "",
            capacidade: equipamento.capacidade ? `${equipamento.capacidade} BTU` : "",
            localAtual: equipamento.local_inicial,
          })

          // Buscar histórico do equipamento
          const historico = await getIntervencoesByPatrimonioClient(formData.patrimonio)
          setHistoricoEquipamento(
            historico.map((item) => ({
              id: item.id,
              tipo: item.tipo,
              descricao: item.descricao || "",
              dataInicio: new Date(item.data_inicio),
              dataTermino: item.data_termino ? new Date(item.data_termino) : null,
              responsavel: item.responsavel || "",
            })),
          )
        } else {
          setEquipamentoSelecionado(null)
          setHistoricoEquipamento([])
        }
      } catch (error) {
        console.error("Erro ao buscar detalhes do equipamento:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar os detalhes do equipamento.",
          variant: "destructive",
        })
      }
    }

    buscarDetalhesEquipamento()
  }, [formData.patrimonio, toast])

  // Efeito para ajustar campos visíveis com base no tipo de intervenção
  useEffect(() => {
    if (formData.tipo === "reserva") {
      setFormData((prev) => ({
        ...prev,
        localDestino: "",
      }))
    }
  }, [formData.tipo])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleComboboxChange = async (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Se for um novo local, adicionar ao banco de dados
    if (name === "localDestino" && value && !locais.some((local) => local.value === value)) {
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

  const handleDateChange = (name: string, date: Date | undefined) => {
    setFormData((prev) => ({ ...prev, [name]: date }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Validação básica
    if (!formData.patrimonio) {
      toast({
        title: "Erro de validação",
        description: "Número de patrimônio é obrigatório.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (!formData.tipo) {
      toast({
        title: "Erro de validação",
        description: "Tipo de intervenção é obrigatório.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    // Validações específicas por tipo
    if (formData.tipo === "reserva" && !formData.dataTermino) {
      toast({
        title: "Erro de validação",
        description: "Data de término é obrigatória para reservas.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (formData.tipo === "movimentacao" && !formData.localDestino) {
      toast({
        title: "Erro de validação",
        description: "Local de destino é obrigatório para movimentações.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      // Criar FormData para enviar ao servidor
      const formDataObj = new FormData()
      formDataObj.append("patrimonio", formData.patrimonio)
      formDataObj.append("tipo", formData.tipo)
      formDataObj.append("descricao", formData.descricao)
      formDataObj.append("dataInicio", formData.dataInicio.toISOString())

      if (formData.dataTermino) {
        formDataObj.append("dataTermino", formData.dataTermino.toISOString())
      }

      if (equipamentoSelecionado?.localAtual) {
        formDataObj.append("localOrigem", equipamentoSelecionado.localAtual)
      }

      if (formData.localDestino) {
        formDataObj.append("localDestino", formData.localDestino)
      }

      formDataObj.append("custo", formData.custo || "0")
      formDataObj.append("responsavel", formData.responsavel)
      formDataObj.append("observacoes", formData.observacoes)

      // Enviar para o servidor
      const resultado = await adicionarIntervencao(formDataObj)

      if (resultado.success) {
        toast({
          title: "Registro salvo",
          description: resultado.message,
        })

        // Chamar a função onSubmit passada como prop
        onSubmit(resultado.data)
      } else {
        toast({
          title: "Erro ao salvar",
          description: resultado.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao salvar intervenção:", error)
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar a intervenção.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Atalhos de teclado
  useKeyboardShortcut("F9", (e) => {
    e.preventDefault()
    void handleSubmit(e as unknown as React.FormEvent)
  })
  useKeyboardShortcut("F4", onCancel)

  // Verificar se o campo deve ser visível com base no tipo
  const isFieldVisible = (field: string) => {
    switch (field) {
      case "localDestino":
        return formData.tipo === "movimentacao"
      default:
        return true
    }
  }

  // Verificar se o campo é obrigatório com base no tipo
  const isFieldRequired = (field: string) => {
    switch (field) {
      case "dataTermino":
        return formData.tipo === "reserva"
      case "localDestino":
        return formData.tipo === "movimentacao"
      default:
        return false
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Número de Patrimônio */}
      <div>
        <Label htmlFor="patrimonio" className="mb-1 block">
          Número de Patrimônio *
        </Label>
        <Button
          variant="outline"
          className="mb-2"
          onClick={() => setMostrarTabelaEquipamentos((prev) => !prev)}
        >
          {mostrarTabelaEquipamentos ? "Ocultar tabela de equipamentos" : "Mostrar tabela de equipamentos"}
        </Button>
        {mostrarTabelaEquipamentos && (
          <div className="max-h-48 overflow-y-auto border rounded-md mb-4">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Patrimônio
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Marca
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Modelo
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-border">
                {patrimonios.map((equip) => (
                  <tr
                    key={equip.value}
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => {
                      handleComboboxChange("patrimonio", equip.value)
                      setMostrarTabelaEquipamentos(false)
                    }}
                  >
                    <td className="px-4 py-2 whitespace-nowrap text-sm">{equip.label}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                      {equipamentoSelecionado?.marca || "-"}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                      {equipamentoSelecionado?.modelo || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Combobox
          items={patrimonios}
          value={formData.patrimonio}
          onChange={(value) => handleComboboxChange("patrimonio", value)}
          placeholder="Selecione o patrimônio"
          allowCustomValue={false}
        />
      </div>

      {/* Detalhes do Equipamento */}
      <EquipamentoDetalhes equipamento={equipamentoSelecionado} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tipo de Intervenção */}
        <div>
          <Label htmlFor="tipo" className="mb-1 block">
            Tipo *
          </Label>
          <Combobox
            items={tiposIntervencao}
            value={formData.tipo}
            onChange={(value) => handleComboboxChange("tipo", value)}
            placeholder="Selecione o tipo"
          />
        </div>

        {/* Local Destino */}
        {isFieldVisible("localDestino") && (
          <div>
            <Label htmlFor="localDestino" className="mb-1 block">
              Local Destino {isFieldRequired("localDestino") && "*"}
            </Label>
            <Combobox
              items={locais}
              value={formData.localDestino}
              onChange={(value) => handleComboboxChange("localDestino", value)}
              placeholder="Selecione o local de destino"
              allowCustomValue={true}
            />
          </div>
        )}

        {/* Data Início */}
        <div>
          <Label htmlFor="dataInicio" className="mb-1 block">
            Data Início
          </Label>
          <DatePicker date={formData.dataInicio} onSelect={(date) => handleDateChange("dataInicio", date)} />
        </div>

        {/* Data Término */}
        <div>
          <Label htmlFor="dataTermino" className="mb-1 block">
            Data Término {isFieldRequired("dataTermino") && "*"}
          </Label>
          <DatePicker date={formData.dataTermino ?? undefined} onSelect={(date) => handleDateChange("dataTermino", date)} />
        </div>

        {/* Custo */}
        <div>
          <Label htmlFor="custo" className="mb-1 block">
            Custo (R$)
          </Label>
          <Input
            id="custo"
            name="custo"
            type="number"
            min="0"
            step="0.01"
            value={formData.custo}
            onChange={handleInputChange}
            placeholder="0.00"
          />
        </div>

        {/* Responsável */}
        <div>
          <Label htmlFor="responsavel" className="mb-1 block">
            Responsável Técnico
          </Label>
          <Input
            id="responsavel"
            name="responsavel"
            value={formData.responsavel}
            onChange={handleInputChange}
            placeholder="Nome do responsável"
          />
        </div>
      </div>

      {/* Descrição */}
      <div>
        <Label htmlFor="descricao" className="mb-1 block">
          Descrição
        </Label>
        <Textarea
          id="descricao"
          name="descricao"
          value={formData.descricao}
          onChange={handleInputChange}
          placeholder="Descreva a intervenção"
          rows={3}
        />
      </div>

      {/* Observações */}
      <div>
        <Label htmlFor="observacoes" className="mb-1 block">
          Observações
        </Label>
        <Textarea
          id="observacoes"
          name="observacoes"
          value={formData.observacoes}
          onChange={handleInputChange}
          placeholder="Observações adicionais"
          rows={3}
        />
      </div>

      {/* Botões de ação */}
      <div className="flex justify-end gap-4 mt-6">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar (F4)
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Salvando..." : "Salvar (F9)"}
        </Button>
      </div>

      {/* Histórico do Equipamento */}
      <EquipamentoHistorico patrimonio={formData.patrimonio} intervencoes={historicoEquipamento} />
    </form>
  )
}
