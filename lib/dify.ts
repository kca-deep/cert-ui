export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  duration?: number; // 답변 소요 시간 (초)
}

export async function sendMessageStream(
  message: string,
  conversationId: string | undefined,
  onChunk: (text: string) => void,
  onComplete: (conversationId: string, finalAnswer: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, conversationId }),
    signal,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to send message');
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let fullAnswer = '';
  let lastConversationId = conversationId || '';
  let completed = false;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          if (data.conversationId) {
            lastConversationId = data.conversationId;
          }
          if (data.error) {
            throw new Error(data.error);
          }
          if (data.done) {
            completed = true;
            onComplete(data.conversationId || lastConversationId, fullAnswer);
          } else if (data.delta) {
            // delta를 누적하여 전체 답변 구성
            fullAnswer += data.delta;
            onChunk(fullAnswer);
          }
        } catch (e) {
          // JSON 파싱 에러는 무시, 다른 에러는 throw
          if (e instanceof SyntaxError) {
            // Skip invalid JSON
          } else {
            throw e;
          }
        }
      }
    }
  }

  // 스트림이 끝났는데 완료 이벤트가 없었다면 여기서 처리
  if (!completed && fullAnswer) {
    onComplete(lastConversationId, fullAnswer);
  }
}
