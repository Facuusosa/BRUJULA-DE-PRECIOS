import { put, list } from "@vercel/blob"
import { NextResponse } from "next/server"

const BLOB_KEY = "outreach-state.json"
const PW = process.env.OUTREACH_PW ?? "brujula2025"

function checkPw(req: Request): boolean {
  const url = new URL(req.url)
  return url.searchParams.get("pw") === PW
}

export async function GET(req: Request) {
  if (!checkPw(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  try {
    const { blobs } = await list({ prefix: BLOB_KEY })
    if (!blobs.length) return NextResponse.json({ estado: {}, reportes: [] })
    const res = await fetch(blobs[0].url)
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ estado: {}, reportes: [] })
  }
}

export async function POST(req: Request) {
  if (!checkPw(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    await put(BLOB_KEY, JSON.stringify(body), {
      access: "public",
      addRandomSuffix: false,
    })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
