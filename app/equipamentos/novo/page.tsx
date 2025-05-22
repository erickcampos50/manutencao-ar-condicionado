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

// Locais fictícios para demonstração
const locais = [
  { label: "Sala 101", value: "sala-101" },
  { label: "Sala 102", value: "sala-102" },
  { label: "Recepção", value: "recepcao" },
  { label: "Almoxarifado", value: "almoxarifado" },
  { label: "Escritório Administrativo", value: "escritorio-admin" },
]

export default function NovoEquipamento() {
  const router = useRouter()
  const { toast } = useToast()
  const patrimonioRef = useRef<HTMLInputElement>(null)

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleComboboxChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({ ...prev, dataEntrada: date }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validação básica
    if (!formData.patrimonio || !validarPatrimonio(formData.patrimonio)) {
      toast({
        title: "Erro de validação",
        description: "Número de patrimônio inválido. Use de 3 a 20 caracteres alfanuméricos.",
        variant: "destructive",
      })
      return
    }

    if (!formData.localInicial) {
      toast({
        title: "Erro de validação",
        description: "Local inicial é obrigatório.",
        variant: "destructive",
      })
      return
    }

    // Simulação de salvamento (em produção, isso seria uma chamada API ou IndexedDB)
    try {
      // Aqui seria a lógica para salvar no banco de dados
      console.log("Salvando equipamento:", formData)

      // Exibir toast de sucesso
      toast({
        title: "Registro salvo",
        description: `Equipamento ${formData.patrimonio} cadastrado com sucesso.`,
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
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar o equipamento.",
        variant: "destructive",
      })
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

  // Atalhos de teclado
  useKeyboardShortcut("F9", handleSubmit)
  useKeyboardShortcut("F4", handleClear)
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
              <Button type="button" variant="outline" onClick={handleClear}>
                Cancelar (F4)
              </Button>
              <Button type="submit">Salvar (F9)</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
