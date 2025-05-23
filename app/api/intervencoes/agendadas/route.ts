import { NextResponse } from "next/server"
import { getScheduledIntervencoes } from "@/app/actions"

export async function GET() {
  const result = await getScheduledIntervencoes()
  if (result.success) {
    return NextResponse.json(result.data)
  } else {
    return NextResponse.json({ error: result.message }, { status: 500 })
  }
}
