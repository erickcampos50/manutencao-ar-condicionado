import { NextResponse } from "next/server"
import { adicionarIntervencao } from "@/app/actions"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const formData = new FormData()
    formData.append("patrimonio", body.patrimonio)
    formData.append("tipo", body.tipo)
    if (body.descricao) formData.append("descricao", body.descricao)
    if (body.dataInicio) formData.append("dataInicio", body.dataInicio)
    if (body.dataTermino) formData.append("dataTermino", body.dataTermino)
    if (body.localOrigem) formData.append("localOrigem", body.localOrigem)
    if (body.localDestino) formData.append("localDestino", body.localDestino)
    if (body.custo) formData.append("custo", body.custo.toString())
    if (body.responsavel) formData.append("responsavel", body.responsavel)
    if (body.observacoes) formData.append("observacoes", body.observacoes)

    const result = await adicionarIntervencao(formData)
    if (result.success) {
      return NextResponse.json({ message: result.message })
    } else {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({ error: "Erro ao registrar intervenção." }, { status: 500 })
  }
}
