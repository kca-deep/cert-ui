import { NextRequest } from 'next/server';

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
      response_mode: 'streaming',
      user: 'default-user',
      ...(conversationId && { conversation_id: conversationId }),
    }),
    signal: AbortSignal.timeout(60000),
  });

  if (!response.ok) {
    const error = await response.text();
    return new Response(JSON.stringify({ error }), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  let lastConversationId = conversationId || '';

  const stream = new ReadableStream({
    async start(controller) {
      const reader = response.body?.getReader();
      if (!reader) {
        controller.close();
        return;
      }

      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (!data || data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);

                // conversation_id 저장
                if (parsed.conversation_id) {
                  lastConversationId = parsed.conversation_id;
                }

                // 메시지 이벤트 처리 (message, agent_message) - delta만 전송
                if (parsed.event === 'message' || parsed.event === 'agent_message') {
                  const delta = parsed.answer || '';
                  if (delta) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                      delta,
                      conversationId: lastConversationId,
                    })}\n\n`));
                  }
                }
                // 메시지 종료 이벤트
                else if (parsed.event === 'message_end') {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                    done: true,
                    conversationId: lastConversationId,
                  })}\n\n`));
                }
                // 에러 이벤트
                else if (parsed.event === 'error') {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                    error: parsed.message || 'Unknown error',
                  })}\n\n`));
                }
              } catch {
                // Skip invalid JSON
              }
            }
          }
        }

        // 남은 버퍼 처리
        if (buffer.startsWith('data: ')) {
          const data = buffer.slice(6).trim();
          if (data && data !== '[DONE]') {
            try {
              const parsed = JSON.parse(data);
              if (parsed.event === 'message' || parsed.event === 'agent_message') {
                const delta = parsed.answer || '';
                if (delta) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                    delta,
                    conversationId: lastConversationId,
                  })}\n\n`));
                }
              }
            } catch {
              // Skip
            }
          }
        }

      } finally {
        reader.releaseLock();
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
