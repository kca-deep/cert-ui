'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { sendMessageStream, Message } from '@/lib/dify';
import { Send, MoreVertical, RotateCcw, Download, MessageSquare, Bot, Loader2 } from 'lucide-react';
import { KcaLogo } from '@/components/kca-logo';
import { ModeToggle } from '@/components/mode-toggle';
import ReactMarkdown from 'react-markdown';

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>();
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!isLoading) {
      textareaRef.current?.focus();
    }
  }, [isLoading]);

  // Cleanup throttle timer on unmount
  useEffect(() => {
    return () => {
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
      }
    };
  }, []);

  const [streamingContent, setStreamingContent] = useState('');
  const streamingContentRef = useRef('');
  const throttleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateTimeRef = useRef(0);

  // Throttled update function (100ms 간격)
  const updateStreamingContent = useCallback((text: string) => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateTimeRef.current;

    streamingContentRef.current = text;

    // 100ms 이내에 업데이트가 있었으면 throttle
    if (timeSinceLastUpdate < 100) {
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
      }
      throttleTimerRef.current = setTimeout(() => {
        setStreamingContent(streamingContentRef.current);
        lastUpdateTimeRef.current = Date.now();
      }, 100 - timeSinceLastUpdate);
    } else {
      setStreamingContent(text);
      lastUpdateTimeRef.current = now;
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setStreamingContent('');
    streamingContentRef.current = '';
    lastUpdateTimeRef.current = 0;

    try {
      await sendMessageStream(
        input,
        conversationId,
        (text) => {
          updateStreamingContent(text);
        },
        (newConversationId, finalAnswer) => {
          // 마지막 업데이트 강제 적용
          if (throttleTimerRef.current) {
            clearTimeout(throttleTimerRef.current);
            throttleTimerRef.current = null;
          }
          setConversationId(newConversationId);
          setIsLoading(false);
          setStreamingContent('');
          if (finalAnswer) {
            setMessages((prev) => {
              // 중복 방지: 마지막 메시지가 같은 내용이면 추가하지 않음
              const lastMsg = prev[prev.length - 1];
              if (lastMsg?.role === 'assistant' && lastMsg.content === finalAnswer) {
                return prev;
              }
              return [
                ...prev,
                {
                  id: (Date.now() + 1).toString(),
                  role: 'assistant',
                  content: finalAnswer,
                  timestamp: new Date(),
                } as Message,
              ];
            });
          }
        }
      );
    } catch (error) {
      console.error('Error:', error);
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
        throttleTimerRef.current = null;
      }
      setIsLoading(false);
      setStreamingContent('');
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '오류가 발생했습니다. 다시 시도해주세요.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setConversationId(undefined);
    setInput('');
  };

  const handleExport = () => {
    const content = messages
      .map((m) => `${m.role === 'user' ? '사용자' : 'AI'}: ${m.content}`)
      .join('\n\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-full w-full flex-col bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border px-4 py-3 bg-background">
      <div className="mx-auto max-w-3xl flex items-center justify-between">
        <KcaLogo />
        <div className="flex items-center gap-2">
          <ModeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring/20 rounded-lg">
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleReset}>
                <RotateCcw className="mr-2 h-4 w-4" />
                대화 초기화
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleExport} disabled={messages.length === 0}>
                <Download className="mr-2 h-4 w-4" />
                대화 내보내기
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 bg-background">
        <div className="mx-auto max-w-3xl px-4 py-6 bg-background">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center gap-6 py-12">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary shadow-lg">
                  <MessageSquare className="h-8 w-8 text-primary-foreground" />
                </div>
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    무엇을 도와드릴까요?
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    국가기술자격검정에 대해 궁금한 점을 질문해주세요.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 w-full max-w-lg">
                  {[
                    '정보보안기사 2025년 시험 일정이 궁금해요',
                    '정보보안산업기사 응시 자격은 어떻게 되나요?',
                    '정보보안기사 시험 과목과 합격 기준을 알려주세요',
                    '정보보안기사와 산업기사 차이점이 뭔가요?',
                  ].map((question) => (
                    <Button
                      key={question}
                      variant="outline"
                      className="h-auto whitespace-normal text-left px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring/20"
                      onClick={() => {
                        setInput(question);
                        textareaRef.current?.focus();
                      }}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id}>
                {message.role === 'user' ? (
                  <div className="flex flex-col items-end gap-1">
                    <div className="max-w-[80%] rounded-3xl bg-chat-bubble-user px-4 py-2.5 text-foreground">
                      <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                    </div>
                    <span className="text-xs text-muted-foreground mr-1">
                      {message.timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-chat-ai-bg flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                      <div className="prose prose-sm dark:prose-invert max-w-none text-foreground break-words">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                      <span className="text-xs text-muted-foreground ml-1">
                        {message.timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <StreamingMessage content={streamingContent} />
            )}
            <div ref={scrollRef} />
          </div>
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="bg-background px-4 py-3">
        <div className="mx-auto max-w-3xl">
          <form onSubmit={handleSubmit} className="relative">
            <div className="rounded-2xl border border-input bg-chat-bubble overflow-hidden focus-within:border-ring transition-all">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="메시지를 입력하세요..."
                disabled={isLoading}
                className="min-h-[52px] max-h-32 resize-none border-0 bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
                rows={1}
              />
              <div className="flex items-center justify-end px-3 py-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="submit"
                      disabled={isLoading || !input.trim()}
                      size="icon"
                      className={`h-8 w-8 rounded-full transition-all duration-200 ${
                        input.trim()
                          ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      } disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-ring/20`}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>메시지 전송</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </form>
          <p className="text-center text-xs text-muted-foreground mt-2">
            AI 챗봇은 실수를 할 수 있습니다. 중요한 정보는 재차 확인하세요.
          </p>
        </div>
      </div>
    </div>
  );
}

// Memoized streaming message component to reduce re-renders
const StreamingMessage = ({ content }: { content: string }) => {
  const renderedMarkdown = useMemo(() => {
    if (!content) return null;
    return <ReactMarkdown>{content}</ReactMarkdown>;
  }, [content]);

  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-chat-ai-bg flex items-center justify-center">
        <Bot className="h-4 w-4 text-white" />
      </div>
      <div className="flex-1">
        {content ? (
          <div className="prose prose-sm dark:prose-invert max-w-none text-foreground break-words">
            {renderedMarkdown}
            <span className="inline-block w-2 h-5 bg-muted-foreground animate-pulse ml-1 rounded-sm" />
          </div>
        ) : (
          <div className="flex items-center gap-1.5 py-2">
            <span className="flex gap-1">
              <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
