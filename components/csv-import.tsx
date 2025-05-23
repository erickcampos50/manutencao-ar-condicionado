"use client"

import React, { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Upload, Download, FileText, AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { adicionarEquipamento } from "@/app/actions"
import { addLocalClient, getLocaisClient } from "@/lib/supabase/client"

interface CSVImportProps {
  onImportComplete?: () => void
}

interface ImportResult {
  success: number
  errors: Array<{ row: number; error: string; data: any }>
  total: number
}

export function CSVImport({ onImportComplete }: CSVImportProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [showResult, setShowResult] = useState(false)

  // Validação do patrimônio
  const validarPatrimonio = (valor: string) => {
    return /^[A-Za-z0-9]{3,20}$/.test(valor)
  }

  // Função para baixar template CSV
  const downloadTemplate = () => {
    const headers = [
      "patrimonio",
      "marca", 
      "modelo",
      "numeroSerie",
      "localInicial",
      "peso",
      "cor",
      "potencia",
      "capacidade",
      "voltagem",
      "tipo",
      "observacoes",
      "dataEntrada"
    ]

    const exampleData = [
      "AC001",
      "Samsung",
      "AR12TRHQCWK",
      "SN12345678",
      "Sala 101",
      "12.5",
      "branco",
      "1500",
      "12000",
      "220",
      "split",
      "Equipamento novo",
      "2024-01-15"
    ]

    const csvContent = [
      headers.join(","),
      exampleData.join(",")
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "template_equipamentos.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Função para processar CSV
  const parseCSV = (text: string): any[] => {
    const lines = text.trim().split("\n")
    if (lines.length < 2) {
      throw new Error("Arquivo CSV deve conter pelo menos um cabeçalho e uma linha de dados")
    }

    const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, ""))
    const data = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map(v => v.trim().replace(/"/g, ""))
      const row: any = {}
      
      headers.forEach((header, index) => {
        row[header] = values[index] || ""
      })
      
      data.push(row)
    }

    return data
  }

  // Função para validar dados do equipamento
  const validateEquipmentData = (data: any, rowNumber: number) => {
    const errors = []

    // Validações obrigatórias
    if (!data.patrimonio || !validarPatrimonio(data.patrimonio)) {
      errors.push(`Linha ${rowNumber}: Patrimônio inválido ou ausente`)
    }

    if (!data.localInicial) {
      errors.push(`Linha ${rowNumber}: Local inicial é obrigatório`)
    }

    // Validações de tipo
    if (data.peso && isNaN(Number(data.peso))) {
      errors.push(`Linha ${rowNumber}: Peso deve ser um número`)
    }

    if (data.potencia && isNaN(Number(data.potencia))) {
      errors.push(`Linha ${rowNumber}: Potência deve ser um número`)
    }

    if (data.capacidade && isNaN(Number(data.capacidade))) {
      errors.push(`Linha ${rowNumber}: Capacidade deve ser um número`)
    }

    // Validação de data
    if (data.dataEntrada && isNaN(Date.parse(data.dataEntrada))) {
      errors.push(`Linha ${rowNumber}: Data de entrada inválida`)
    }

    return errors
  }

  // Função para importar equipamentos
  const importEquipments = async (equipments: any[]) => {
    const result: ImportResult = {
      success: 0,
      errors: [],
      total: equipments.length
    }

    // Carregar locais existentes
    const locaisExistentes = await getLocaisClient()
    const locaisSet = new Set(locaisExistentes.map(l => l.nome))

    for (let i = 0; i < equipments.length; i++) {
      const equipment = equipments[i]
      const rowNumber = i + 2 // +2 porque começamos da linha 2 (linha 1 é cabeçalho)

      try {
        // Validar dados
        const validationErrors = validateEquipmentData(equipment, rowNumber)
        if (validationErrors.length > 0) {
          result.errors.push({
            row: rowNumber,
            error: validationErrors.join("; "),
            data: equipment
          })
          continue
        }

        // Adicionar local se não existir
        if (equipment.localInicial && !locaisSet.has(equipment.localInicial)) {
          try {
            await addLocalClient(equipment.localInicial)
            locaisSet.add(equipment.localInicial)
          } catch (error) {
            console.error("Erro ao adicionar local:", error)
          }
        }

        // Criar FormData
        const formData = new FormData()
        formData.append("patrimonio", equipment.patrimonio)
        formData.append("marca", equipment.marca || "")
        formData.append("modelo", equipment.modelo || "")
        formData.append("numeroSerie", equipment.numeroSerie || "")
        formData.append("localInicial", equipment.localInicial)
        formData.append("peso", equipment.peso || "")
        formData.append("cor", equipment.cor || "")
        formData.append("potencia", equipment.potencia || "")
        formData.append("capacidade", equipment.capacidade || "")
        formData.append("voltagem", equipment.voltagem || "")
        formData.append("tipo", equipment.tipo || "")
        formData.append("observacoes", equipment.observacoes || "")
        
        // Data de entrada
        const dataEntrada = equipment.dataEntrada ? new Date(equipment.dataEntrada) : new Date()
        formData.append("dataEntrada", dataEntrada.toISOString())

        // Salvar equipamento
        const resultado = await adicionarEquipamento(formData)
        
        if (resultado.success) {
          result.success++
        } else {
          result.errors.push({
            row: rowNumber,
            error: resultado.message || "Erro desconhecido",
            data: equipment
          })
        }
      } catch (error) {
        result.errors.push({
          row: rowNumber,
          error: error instanceof Error ? error.message : "Erro desconhecido",
          data: equipment
        })
      }

      // Atualizar progresso
      setImportProgress(Math.round(((i + 1) / equipments.length) * 100))
    }

    return result
  }

  // Função para processar arquivo
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo CSV.",
        variant: "destructive",
      })
      return
    }

    setIsImporting(true)
    setImportProgress(0)
    setShowResult(false)

    try {
      const text = await file.text()
      const equipments = parseCSV(text)

      if (equipments.length === 0) {
        throw new Error("Nenhum equipamento encontrado no arquivo")
      }

      const result = await importEquipments(equipments)
      setImportResult(result)
      setShowResult(true)

      if (result.success > 0) {
        toast({
          title: "Importação concluída",
          description: `${result.success} equipamentos importados com sucesso.`,
        })
        
        if (onImportComplete) {
          onImportComplete()
        }
      }

      if (result.errors.length > 0) {
        toast({
          title: "Alguns erros ocorreram",
          description: `${result.errors.length} equipamentos não puderam ser importados.`,
          variant: "destructive",
        })
      }

    } catch (error) {
      console.error("Erro na importação:", error)
      toast({
        title: "Erro na importação",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      })
    } finally {
      setIsImporting(false)
      setImportProgress(0)
      
      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Importar Equipamentos via CSV
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Instruções */}
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>
            Faça upload de um arquivo CSV com os dados dos equipamentos. 
            Use o template abaixo para garantir o formato correto.
          </AlertDescription>
        </Alert>

        {/* Botão para baixar template */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadTemplate} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Baixar Template CSV
          </Button>
        </div>

        {/* Upload de arquivo */}
        <div className="space-y-2">
          <Label htmlFor="csvFile">Arquivo CSV</Label>
          <Input
            id="csvFile"
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleFileUpload}
            disabled={isImporting}
          />
        </div>

        {/* Progresso da importação */}
        {isImporting && (
          <div className="space-y-2">
            <Label>Importando equipamentos...</Label>
            <Progress value={importProgress} className="w-full" />
            <p className="text-sm text-muted-foreground">{importProgress}% concluído</p>
          </div>
        )}

        {/* Resultado da importação */}
        {showResult && importResult && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Sucesso</p>
                      <p className="text-2xl font-bold text-green-600">{importResult.success}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="text-sm font-medium">Erros</p>
                      <p className="text-2xl font-bold text-red-600">{importResult.errors.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">Total</p>
                      <p className="text-2xl font-bold text-blue-600">{importResult.total}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lista de erros */}
            {importResult.errors.length > 0 && (
              <div className="space-y-2">
                <Label>Erros encontrados:</Label>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {importResult.errors.map((error, index) => (
                    <Alert key={index} variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        {error.error}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
