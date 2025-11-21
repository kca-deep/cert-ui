'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { sendMessage, Message } from '@/lib/dify';
import { Send } from 'lucide-react';
import { KcaLogo } from '@/components/kca-logo';
import ReactMarkdown from 'react-markdown';

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendMessage(input, conversationId);
      setConversationId(response.conversationId);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.answer,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '오류가 발생했습니다. 다시 시도해주세요.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="flex h-full w-full flex-col rounded-none border-0">
      <div className="flex items-center border-b-2 border-border bg-card px-24 py-4 md:px-48 lg:px-96">
        <KcaLogo className="scale-150" />
      </div>

      <div className="flex-1 overflow-y-auto px-24 py-4 md:px-48 lg:px-96">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center gap-4">
              <p className="text-center text-foreground/70 font-medium">
                메시지를 입력하여 대화를 시작하세요.
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {[
                  '국가기술자격검정 시험 일정이 궁금해요',
                  '자격증 시험 접수 방법을 알려주세요',
                  '합격 기준은 어떻게 되나요?',
                  '시험 준비는 어떻게 하면 좋을까요?',
                ].map((question) => (
                  <Button
                    key={question}
                    variant="outline"
                    className="h-auto whitespace-normal text-left px-4 py-3 border-2 hover:bg-primary hover:text-primary-foreground"
                    onClick={() => {
                      setInput(question);
                      inputRef.current?.focus();
                    }}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {message.role === 'user' ? 'U' : 'AI'}
                </AvatarFallback>
              </Avatar>
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {message.role === 'user' ? (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                ) : (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <div className="rounded-lg bg-muted px-4 py-2">
                <p className="animate-pulse">입력 중...</p>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </div>

      <CardFooter className="border-t-2 border-border bg-card px-24 py-4 md:px-48 lg:px-96">
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="메시지를 입력하세요..."
            disabled={isLoading}
            className="bg-background border-2 border-border focus:border-primary"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
