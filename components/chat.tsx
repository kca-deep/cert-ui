'use client';

import { useState, useRef, useEffect } from 'react';
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
import { Send, Sparkles, RotateCcw, Download, Trash2 } from 'lucide-react';
import { KcaLogo } from '@/components/kca-logo';
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

  const [streamingContent, setStreamingContent] = useState('');
  const streamingContentRef = useRef('');

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
    setStreamingContent('');
    streamingContentRef.current = '';

    try {
      await sendMessageStream(
        input,
        conversationId,
        (text) => {
          setStreamingContent(text);
          streamingContentRef.current = text;
        },
        (newConversationId, finalAnswer) => {
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
                } as Message,
              ];
            });
          }
        }
      );
    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);
      setStreamingContent('');
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '오류가 발생했습니다. 다시 시도해주세요.',
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
    <div className="flex h-full w-full flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <KcaLogo />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Sparkles className="h-4 w-4 text-gray-400" />
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

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-6">
          <div className="space-y-6">
            {messages.length === 0 && (
              <div className="flex flex-col items-center gap-6 py-12">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    무엇을 도와드릴까요?
                  </h2>
                  <p className="text-gray-500 text-sm">
                    국가기술자격검정에 대해 궁금한 점을 질문해주세요.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 w-full max-w-lg">
                  {[
                    '국가기술자격검정 시험 일정이 궁금해요',
                    '자격증 시험 접수 방법을 알려주세요',
                    '합격 기준은 어떻게 되나요?',
                    '시험 준비는 어떻게 하면 좋을까요?',
                  ].map((question) => (
                    <Button
                      key={question}
                      variant="outline"
                      className="h-auto whitespace-normal text-left px-4 py-3 text-sm text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
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
                  <div className="flex justify-end">
                    <div className="max-w-[80%] rounded-2xl bg-blue-600 px-4 py-2 text-white">
                      <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full border-l-4 border-red-500 pl-4">
                    <div className="prose prose-sm max-w-none text-gray-700 break-words">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="w-full border-l-4 border-red-500 pl-4">
                {streamingContent ? (
                  <div className="prose prose-sm max-w-none text-gray-700 break-words">
                    <ReactMarkdown>{streamingContent}</ReactMarkdown>
                    <span className="inline-block w-2 h-4 bg-blue-600 animate-pulse ml-1" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400 animate-pulse">
                      답변을 생성중입니다...
                    </p>
                    <Skeleton className="h-4 w-64 bg-gray-100" />
                    <Skeleton className="h-4 w-48 bg-gray-100" />
                  </div>
                )}
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-gray-100 bg-white px-4 py-4">
        <div className="mx-auto max-w-3xl">
          <form onSubmit={handleSubmit} className="relative">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 shadow-sm overflow-hidden">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="메시지를 입력하세요... (Enter로 전송, Shift+Enter로 줄바꿈)"
                disabled={isLoading}
                className="min-h-[52px] max-h-32 resize-none border-0 bg-transparent px-4 py-3 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                rows={1}
              />
              <div className="flex items-center justify-between px-3 py-2 border-t border-gray-100">
                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-gray-600"
                        onClick={handleReset}
                        disabled={messages.length === 0}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>대화 초기화</TooltipContent>
                  </Tooltip>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="submit"
                      disabled={isLoading || !input.trim()}
                      size="icon"
                      className="h-8 w-8 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 disabled:opacity-30"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>메시지 전송</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
