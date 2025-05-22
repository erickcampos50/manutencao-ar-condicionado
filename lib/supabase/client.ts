"use client"

import { createClient } from "@supabase/supabase-js"
import type { Equipamento, Intervencao, Local } from "./server"

// Criação do cliente Supabase para o cliente (padrão singleton)
let supabaseClient: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!supabaseClient) {
    console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log("Supabase ANON KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    supabaseClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  }
  return supabaseClient
}

// Funções de acesso aos dados para o cliente
export async function getLocaisClient() {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("locais").select("*").order("nome")

  if (error) {
    console.error("Erro ao buscar locais:", error)
    return []
  }

  return data as Local[]
}

export async function addLocalClient(nome: string) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("locais").insert({ nome }).select().single()

  if (error) {
    console.error("Erro ao adicionar local:", error)
    throw new Error(error.message)
  }

  return data as Local
}

export async function getEquipamentosClient() {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("equipamentos").select("*").order("patrimonio")

  if (error) {
    console.error("Erro ao buscar equipamentos:", error)
    return []
  }

  return data as Equipamento[]
}

export async function getEquipamentoByPatrimonioClient(patrimonio: string) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("equipamentos").select("*").eq("patrimonio", patrimonio).single()

  if (error) {
    if (error.code === "PGRST116") {
      // Equipamento não encontrado
      return null
    }
    console.error(`Erro ao buscar equipamento ${patrimonio}:`, error)
    return null
  }

  return data as Equipamento
}

export async function addEquipamentoClient(equipamento: Omit<Equipamento, "id" | "created_at">) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("equipamentos").insert(equipamento).select().single()

  if (error) {
    console.error("Erro ao adicionar equipamento:", error)
    throw new Error(error.message)
  }

  return data as Equipamento
}

export async function getIntervencoesClient() {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("intervencoes").select("*").order("data_inicio", { ascending: false })

  if (error) {
    console.error("Erro ao buscar intervenções:", error)
    return []
  }

  return data as Intervencao[]
}

export async function getIntervencoesByPatrimonioClient(patrimonio: string) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
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

export async function addIntervencaoClient(intervencao: Omit<Intervencao, "id" | "created_at">) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("intervencoes").insert(intervencao).select().single()

  if (error) {
    console.error("Erro ao adicionar intervenção:", error)
    throw new Error(error.message)
  }

  return data as Intervencao
}
