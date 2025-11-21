export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export async function sendMessage(
  message: string,
  conversationId?: string
): Promise<{ answer: string; conversationId: string }> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, conversationId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to send message');
  }

  return response.json();
}
