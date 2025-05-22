import { createClient } from "@supabase/supabase-js"

// Tipos para as tabelas do Supabase
export type Equipamento = {
  id: number
  patrimonio: string
  marca: string | null
  modelo: string | null
  numero_serie: string | null
  local_inicial: string
  peso: number | null
  cor: string | null
  potencia: number | null
  capacidade: number | null
  voltagem: string | null
  tipo: string | null
  observacoes: string | null
  data_entrada: string
  created_at: string
}

export type Intervencao = {
  id: number
  patrimonio: string
  tipo: string
  descricao: string | null
  data_inicio: string
  data_termino: string | null
  local_origem: string | null
  local_destino: string | null
  custo: number
  responsavel: string | null
  observacoes: string | null
  created_at: string
}

export type Local = {
  id: number
  nome: string
  created_at: string
}

// Criação do cliente Supabase para o servidor
export const supabaseServer = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// Funções de acesso aos dados para o servidor
export async function getLocais() {
  const { data, error } = await supabaseServer.from("locais").select("*").order("nome")

  if (error) {
    console.error("Erro ao buscar locais:", error)
    return []
  }

  return data as Local[]
}

export async function getEquipamentos() {
  const { data, error } = await supabaseServer.from("equipamentos").select("*").order("patrimonio")

  if (error) {
    console.error("Erro ao buscar equipamentos:", error)
    return []
  }

  return data as Equipamento[]
}

export async function getEquipamentoByPatrimonio(patrimonio: string) {
  const { data, error } = await supabaseServer.from("equipamentos").select("*").eq("patrimonio", patrimonio).single()

  if (error) {
    console.error(`Erro ao buscar equipamento ${patrimonio}:`, error)
    return null
  }

  return data as Equipamento
}

export async function getIntervencoes() {
  const { data, error } = await supabaseServer
    .from("intervencoes")
    .select("*")
    .order("data_inicio", { ascending: false })

  if (error) {
    console.error("Erro ao buscar intervenções:", error)
    return []
  }

  return data as Intervencao[]
}

export async function getIntervencoesByPatrimonio(patrimonio: string) {
  const { data, error } = await supabaseServer
    .from("intervencoes")
    .select("*")
    .eq("patrimonio", patrimonio)
    .order("data_inicio", { ascending: false })

  if (error) {
    console.error(`Erro ao buscar intervenções do equipamento ${patrimonio}:`, error)
    return []
  }

  return data as Intervencao[]
}
