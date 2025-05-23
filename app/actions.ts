"use server"

import { revalidatePath } from "next/cache"
import { supabaseServer, getEquipamentoByPatrimonio } from "@/lib/supabase/server"

// Ação para adicionar um novo equipamento
export async function adicionarEquipamento(formData: FormData) {
  try {
    const patrimonio = formData.get("patrimonio") as string
    const marca = formData.get("marca") as string
    const modelo = formData.get("modelo") as string
    const numeroSerie = formData.get("numeroSerie") as string
    const localInicial = formData.get("localInicial") as string
    const peso = formData.get("peso") ? Number.parseFloat(formData.get("peso") as string) : null
    const cor = formData.get("cor") as string
    const potencia = formData.get("potencia") ? Number.parseFloat(formData.get("potencia") as string) : null
    const capacidade = formData.get("capacidade") ? Number.parseFloat(formData.get("capacidade") as string) : null
    const voltagem = formData.get("voltagem") as string
    const tipo = formData.get("tipo") as string
    const observacoes = formData.get("observacoes") as string
    const dataEntrada = formData.get("dataEntrada") as string

    // Verificar se o patrimônio já existe
    const equipamentoExistente = await getEquipamentoByPatrimonio(patrimonio)
    if (equipamentoExistente) {
      return { success: false, message: "Número de patrimônio já cadastrado." }
    }

    // Inserir o novo equipamento
    const { data, error } = await supabaseServer
      .from("equipamentos")
      .insert({
        patrimonio,
        marca: marca || null,
        modelo: modelo || null,
        numero_serie: numeroSerie || null,
        local_inicial: localInicial,
        peso: peso || null,
        cor: cor || null,
        potencia: potencia || null,
        capacidade: capacidade || null,
        voltagem: voltagem || null,
        tipo: tipo || null,
        observacoes: observacoes || null,
        data_entrada: dataEntrada || new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Erro ao adicionar equipamento:", error)
      return { success: false, message: error.message }
    }

    // Revalidar o cache
    revalidatePath("/equipamentos")
    revalidatePath("/")

    return {
      success: true,
      message: `Equipamento ${patrimonio} cadastrado com sucesso.`,
      data,
    }
  } catch (error) {
    console.error("Erro ao adicionar equipamento:", error)
    return {
      success: false,
      message: "Ocorreu um erro ao salvar o equipamento.",
    }
  }
}

// Ação para adicionar uma nova intervenção
export async function adicionarIntervencao(formData: FormData) {
  try {
    const patrimonio = formData.get("patrimonio") as string
    const tipo = formData.get("tipo") as string
    const descricao = formData.get("descricao") as string
    const dataInicio = formData.get("dataInicio") as string
    const dataTermino = (formData.get("dataTermino") as string) || null
    const localOrigem = (formData.get("localOrigem") as string) || null
    const localDestino = (formData.get("localDestino") as string) || null
    const custo = formData.get("custo") ? Number.parseFloat(formData.get("custo") as string) : 0
    const responsavel = formData.get("responsavel") as string
    const observacoes = formData.get("observacoes") as string

    // Verificar se o equipamento existe
    const equipamento = await getEquipamentoByPatrimonio(patrimonio)
    if (!equipamento) {
      return { success: false, message: "Equipamento não encontrado." }
    }

    // Inserir a nova intervenção
    const { data, error } = await supabaseServer
      .from("intervencoes")
      .insert({
        patrimonio,
        tipo,
        descricao: descricao || null,
        data_inicio: dataInicio || new Date().toISOString(),
        data_termino: dataTermino || null,
        local_origem: localOrigem || null,
        local_destino: localDestino || null,
        custo,
        responsavel: responsavel || null,
        observacoes: observacoes || null,
      })
      .select()
      .single()

    if (error) {
      console.error("Erro ao adicionar intervenção:", error)
      return { success: false, message: error.message }
    }

    // Revalidar o cache
    revalidatePath("/intervencoes")
    revalidatePath("/consultas")

    return {
      success: true,
      message: "Intervenção registrada com sucesso.",
      data,
    }
  } catch (error) {
    console.error("Erro ao adicionar intervenção:", error)
    return {
      success: false,
      message: "Ocorreu um erro ao salvar a intervenção.",
    }
  }
}

// Ação para adicionar um novo local
export async function adicionarLocal(nome: string) {
  try {
    const { data, error } = await supabaseServer.from("locais").insert({ nome }).select().single()

    if (error) {
      console.error("Erro ao adicionar local:", error)
      return { success: false, message: error.message }
    }

    // Revalidar o cache
    revalidatePath("/equipamentos/novo")
    revalidatePath("/intervencoes/registrar")

    return {
      success: true,
      message: `Local ${nome} adicionado com sucesso.`,
      data,
    }
  } catch (error) {
    console.error("Erro ao adicionar local:", error)
    return {
      success: false,
      message: "Ocorreu um erro ao adicionar o local.",
    }
  }
}

// Ação para buscar equipamento por patrimônio
export async function buscarEquipamentoPorPatrimonio(patrimonio: string) {
  try {
    const equipamento = await getEquipamentoByPatrimonio(patrimonio)

    if (!equipamento) {
      return { success: false, message: "Equipamento não encontrado." }
    }

    return {
      success: true,
      data: equipamento,
    }
  } catch (error) {
    console.error("Erro ao buscar equipamento:", error)
    return {
      success: false,
      message: "Ocorreu um erro ao buscar o equipamento.",
    }
  }
}

// Ação para buscar intervenções por patrimônio
export async function buscarIntervencoesPorPatrimonio(patrimonio: string) {
  try {
    const { data, error } = await supabaseServer
      .from("intervencoes")
      .select("*")
      .eq("patrimonio", patrimonio)
      .order("data_inicio", { ascending: false })

    if (error) {
      console.error("Erro ao buscar intervenções:", error)
      return { success: false, message: error.message }
    }

    return {
      success: true,
      data,
    }
  } catch (error) {
    console.error("Erro ao buscar intervenções:", error)
    return {
      success: false,
      message: "Ocorreu um erro ao buscar as intervenções.",
    }
  }
}

// Ação para atualizar um equipamento existente
export async function atualizarEquipamento(id: string, formData: FormData) {
  try {
    const patrimonio = formData.get("patrimonio") as string
    const marca = formData.get("marca") as string
    const modelo = formData.get("modelo") as string
    const numeroSerie = formData.get("numeroSerie") as string
    const localInicial = formData.get("localInicial") as string
    const peso = formData.get("peso") ? Number.parseFloat(formData.get("peso") as string) : null
    const cor = formData.get("cor") as string
    const potencia = formData.get("potencia") ? Number.parseFloat(formData.get("potencia") as string) : null
    const capacidade = formData.get("capacidade") ? Number.parseFloat(formData.get("capacidade") as string) : null
    const voltagem = formData.get("voltagem") as string
    const tipo = formData.get("tipo") as string
    const observacoes = formData.get("observacoes") as string
    const dataEntrada = formData.get("dataEntrada") as string

    // Verificar se o patrimônio já existe em outro equipamento
    const { data: equipamentoExistente, error: errorBusca } = await supabaseServer
      .from("equipamentos")
      .select("id")
      .eq("patrimonio", patrimonio)
      .neq("id", id)
      .single()

    if (equipamentoExistente) {
      return { success: false, message: "Número de patrimônio já cadastrado em outro equipamento." }
    }

    // Atualizar o equipamento
    const { data, error } = await supabaseServer
      .from("equipamentos")
      .update({
        patrimonio,
        marca: marca || null,
        modelo: modelo || null,
        numero_serie: numeroSerie || null,
        local_inicial: localInicial,
        peso: peso || null,
        cor: cor || null,
        potencia: potencia || null,
        capacidade: capacidade || null,
        voltagem: voltagem || null,
        tipo: tipo || null,
        observacoes: observacoes || null,
        data_entrada: dataEntrada || new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Erro ao atualizar equipamento:", error)
      return { success: false, message: error.message }
    }

    // Revalidar o cache
    revalidatePath("/equipamentos")
    revalidatePath("/")

    return {
      success: true,
      message: `Equipamento ${patrimonio} atualizado com sucesso.`,
      data,
    }
  } catch (error) {
    console.error("Erro ao atualizar equipamento:", error)
    return {
      success: false,
      message: "Ocorreu um erro ao atualizar o equipamento.",
    }
  }
}
