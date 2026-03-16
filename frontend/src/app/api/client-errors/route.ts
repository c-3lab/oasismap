import { NextRequest, NextResponse } from 'next/server'

type ClientErrorBody = {
  environment?: { userAgent?: string }
  actionLog?: { entries?: unknown[] }
  error?: {
    message?: string
    stack?: string
    url?: string
    occurredAt?: string
  }
}

function validate(body: unknown): body is ClientErrorBody {
  if (body == null || typeof body !== 'object') return false
  const b = body as Record<string, unknown>
  const env = b.environment as Record<string, unknown> | undefined
  const err = b.error as Record<string, unknown> | undefined
  return (
    typeof env?.userAgent === 'string' &&
    typeof err?.message === 'string' &&
    typeof err?.url === 'string' &&
    typeof err?.occurredAt === 'string'
  )
}

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!validate(body)) {
    return NextResponse.json(
      {
        error:
          'Missing required fields: environment.userAgent, error.message, error.url, error.occurredAt',
      },
      { status: 400 }
    )
  }

  // 1 リクエストあたり 1 行の JSON で stdout に出力
  console.log(JSON.stringify(body))

  return new NextResponse(null, { status: 204 })
}
