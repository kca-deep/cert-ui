import { NextRequest, NextResponse } from 'next/server';

const DIFY_API_URL = process.env.DIFY_API_URL || 'https://api.dify.ai/v1';
const DIFY_API_KEY = process.env.DIFY_API_KEY || '';

export async function POST(request: NextRequest) {
  const { message, conversationId } = await request.json();

  const response = await fetch(`${DIFY_API_URL}/chat-messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DIFY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: {},
      query: message,
      response_mode: 'blocking',
      user: 'default-user',
      ...(conversationId && { conversation_id: conversationId }),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    return NextResponse.json({ error }, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json({
    answer: data.answer,
    conversationId: data.conversation_id,
  });
}
