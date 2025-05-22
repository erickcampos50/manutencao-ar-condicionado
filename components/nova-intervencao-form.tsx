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

// Locais para seleção
const locais = [
  { label: "Sala 101", value: "sala-101" },
  { label: "Sala 102", value: "sala-102" },
  { label: "Recepção", value: "recepcao" },
  { label: "Almoxarifado", value: "almoxarifado" },
  { label: "Escritório Administrativo", value: "escritorio-admin" },
]

// Patrimônios de exemplo
const patrimonios = [
  { label: "AC12345", value: "AC12345" },
  { label: "AC67890", value: "AC67890" },
  { label: "AC54321", value: "AC54321" },
  { label: "AC98765", value: "AC98765" },
]

interface NovaIntervencaoFormProps {
  onSubmit: (data: any) => void
  onCancel: () => void
}

export function NovaIntervencaoForm({ onSubmit, onCancel }: NovaIntervencaoFormProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    patrimonio: "",
    tipo: "",
    descricao: "",
    dataInicio: new Date(),
    dataTermino: null as Date | null,
    localOrigem: "",
    localDestino: "",
    custo: "",
    responsavel: "Usuário Atual", // Em um sistema real, seria o usuário logado
    observacoes: "",
  })

  // Efeito para ajustar campos visíveis com base no tipo de intervenção
  useEffect(() => {
    // Resetar campos condicionais quando o tipo muda
    if (formData.tipo === "reserva") {
      setFormData((prev) => ({
        ...prev,
        localOrigem: "",
        localDestino: "",
      }))
    } else if (formData.tipo === "movimentacao") {
      // Nada a fazer, ambos os campos são necessários
    } else if (formData.tipo === "desinstalacao") {
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

  const handleComboboxChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDateChange = (name: string, date: Date | undefined) => {
    setFormData((prev) => ({ ...prev, [name]: date }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validação básica
    if (!formData.patrimonio) {
      toast({
        title: "Erro de validação",
        description: "Número de patrimônio é obrigatório.",
        variant: "destructive",
      })
      return
    }

    if (!formData.tipo) {
      toast({
        title: "Erro de validação",
        description: "Tipo de intervenção é obrigatório.",
        variant: "destructive",
      })
      return
    }

    // Validações específicas por tipo
    if (formData.tipo === "reserva" && !formData.dataTermino) {
      toast({
        title: "Erro de validação",
        description: "Data de término é obrigatória para reservas.",
        variant: "destructive",
      })
      return
    }

    if (formData.tipo === "movimentacao") {
      if (!formData.localOrigem || !formData.localDestino) {
        toast({
          title: "Erro de validação",
          description: "Local de origem e destino são obrigatórios para movimentações.",
          variant: "destructive",
        })
        return
      }
    }

    if (formData.tipo === "desinstalacao" && !formData.localOrigem) {
      toast({
        title: "Erro de validação",
        description: "Local de origem é obrigatório para desinstalações.",
        variant: "destructive",
      })
      return
    }

    // Converter custo para número
    const custoNumerico = formData.custo ? Number.parseFloat(formData.custo) : 0

    // Enviar dados
    onSubmit({
      ...formData,
      custo: custoNumerico,
    })
  }

  // Atalhos de teclado
  useKeyboardShortcut("F9", handleSubmit)
  useKeyboardShortcut("F4", onCancel)

  // Verificar se o campo deve ser visível com base no tipo
  const isFieldVisible = (field: string) => {
    switch (field) {
      case "localOrigem":
        return formData.tipo === "movimentacao" || formData.tipo === "desinstalacao"
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
      case "localOrigem":
        return formData.tipo === "movimentacao" || formData.tipo === "desinstalacao"
      case "localDestino":
        return formData.tipo === "movimentacao"
      default:
        return false
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Número de Patrimônio */}
        <div>
          <Label htmlFor="patrimonio" className="mb-1 block">
            Número de Patrimônio *
          </Label>
          <Combobox
            items={patrimonios}
            value={formData.patrimonio}
            onChange={(value) => handleComboboxChange("patrimonio", value)}
            placeholder="Selecione o patrimônio"
            allowCustomValue={true}
          />
        </div>

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

        {/* Descrição */}
        <div className="md:col-span-2">
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
          <DatePicker date={formData.dataTermino} onSelect={(date) => handleDateChange("dataTermino", date)} />
        </div>

        {/* Local Origem */}
        {isFieldVisible("localOrigem") && (
          <div>
            <Label htmlFor="localOrigem" className="mb-1 block">
              Local Origem {isFieldRequired("localOrigem") && "*"}
            </Label>
            <Combobox
              items={locais}
              value={formData.localOrigem}
              onChange={(value) => handleComboboxChange("localOrigem", value)}
              placeholder="Selecione o local de origem"
              allowCustomValue={true}
            />
          </div>
        )}

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

        {/* Observações */}
        <div className="md:col-span-2">
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
      </div>

      {/* Botões de ação */}
      <div className="flex justify-end gap-4 mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar (F4)
        </Button>
        <Button type="submit">Salvar (F9)</Button>
      </div>
    </form>
  )
}
