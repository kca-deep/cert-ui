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
import { sendMessageStream, Message } from '@/lib/dify';
import { Send, RotateCcw, MessageSquare, Copy, Check } from 'lucide-react';
import { KcaLogo } from '@/components/kca-logo';
import { ModeToggle } from '@/components/mode-toggle';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeHighlight from 'rehype-highlight';

// 마크다운 렌더링을 위한 커스텀 컴포넌트
const markdownComponents = {
  table: ({ children }: any) => (
    <div className="my-4">
      <table className="w-full table-fixed divide-y divide-border border border-border rounded-lg">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }: any) => (
    <thead className="bg-muted/50">{children}</thead>
  ),
  tbody: ({ children }: any) => (
    <tbody className="divide-y divide-border bg-card">{children}</tbody>
  ),
  tr: ({ children }: any) => (
    <tr className="hover:bg-muted/30 transition-colors">{children}</tr>
  ),
  th: ({ children }: any) => (
    <th className="px-3 py-3 text-left text-sm font-semibold text-foreground break-words">
      {children}
    </th>
  ),
  td: ({ children }: any) => (
    <td className="px-3 py-3 text-sm text-foreground break-words whitespace-normal">
      {children}
    </td>
  ),
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground">
      {children}
    </blockquote>
  ),
  code: ({ inline, children, ...props }: any) => 
    inline ? (
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
        {children}
      </code>
    ) : (
      <code className="block bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono my-2" {...props}>
        {children}
      </code>
    ),
  a: ({ children, href }: any) => (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="text-primary hover:underline"
    >
      {children}
    </a>
  ),
};

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [activeButton, setActiveButton] = useState<string | null>(null);
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

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
      }
      if (timeoutTimerRef.current) {
        clearTimeout(timeoutTimerRef.current);
      }
    };
  }, []);

  const [streamingContent, setStreamingContent] = useState('');
  const streamingContentRef = useRef('');
  const throttleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateTimeRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestStartTimeRef = useRef<number>(0); // 요청 시작 시간
  const timeoutTimerRef = useRef<NodeJS.Timeout | null>(null); // 150초 타임아웃 타이머

  const RESPONSE_TIMEOUT = 150000; // 150초 타임아웃

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

  // 메시지 전송 공통 로직
  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    // 요청 시작 시간 저장
    requestStartTimeRef.current = Date.now();

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setStreamingContent('');
    streamingContentRef.current = '';
    lastUpdateTimeRef.current = 0;

    // 이전 요청 취소하고 새 AbortController 생성
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    // 이전 타임아웃 타이머 정리
    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current);
      timeoutTimerRef.current = null;
    }

    // 150초 타임아웃 설정
    timeoutTimerRef.current = setTimeout(() => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
        throttleTimerRef.current = null;
      }
      setIsLoading(false);
      setStreamingContent('');
      const timeoutMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '⚠️ 응답 시간이 초과되었습니다 (150초). 서버 연결에 문제가 있을 수 있습니다. 다시 질문해 주세요.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, timeoutMessage]);
    }, RESPONSE_TIMEOUT);

    try {
      await sendMessageStream(
        messageText,
        conversationId,
        (text) => {
          updateStreamingContent(text);
        },
        (newConversationId, finalAnswer) => {
          // 타임아웃 타이머 정리
          if (timeoutTimerRef.current) {
            clearTimeout(timeoutTimerRef.current);
            timeoutTimerRef.current = null;
          }
          // 마지막 업데이트 강제 적용
          if (throttleTimerRef.current) {
            clearTimeout(throttleTimerRef.current);
            throttleTimerRef.current = null;
          }
          
          // 소요 시간 계산 (초 단위, 소수점 1자리)
          const duration = Math.round((Date.now() - requestStartTimeRef.current) / 100) / 10;
          
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
                  duration: duration,
                } as Message,
              ];
            });
          }
        },
        abortControllerRef.current.signal
      );
    } catch (error) {
      // 타임아웃 타이머 정리
      if (timeoutTimerRef.current) {
        clearTimeout(timeoutTimerRef.current);
        timeoutTimerRef.current = null;
      }
      // AbortError는 사용자가 취소한 것이므로 무시
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
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
        content: '죄송합니다. 오류가 발생했습니다. 다시 시도해 주세요.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage(input);
  };

  // 예시 버튼 클릭 시 바로 전송
  const handleExampleClick = (question: string) => {
    // Remove "(예시N)" prefix from the question
    const cleanQuestion = question.replace(/^\(예시\d+\)\s*/, '');
    sendMessage(cleanQuestion);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleReset = () => {
    // 진행 중인 요청 취소
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    // 타이머 정리
    if (throttleTimerRef.current) {
      clearTimeout(throttleTimerRef.current);
      throttleTimerRef.current = null;
    }
    // 타임아웃 타이머 정리
    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current);
      timeoutTimerRef.current = null;
    }
    // 상태 초기화
    setMessages([]);
    setConversationId(undefined);
    setInput('');
    setIsLoading(false);
    setStreamingContent('');
    streamingContentRef.current = '';
  };

  const handleCopy = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // 글자 크기 클래스
  const fontSizeClasses = {
    small: 'text-[11px]',
    medium: 'text-[13px]',
    large: 'text-[15px]',
  };

  // 유의사항용 작은 폰트 크기 (기본 text-xs 기준으로 상대적 조정)
  const disclaimerFontSizeClasses = {
    small: 'text-[10px]',
    medium: 'text-xs',
    large: 'text-[14px]',
  };

  // 예시 버튼용 폰트 크기 (기본 text-sm 기준으로 상대적 조정)
  const exampleFontSizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
  };

  const proseSizeClasses = {
    small: '[&_*]:text-[11px]',
    medium: '[&_*]:text-[13px]',
    large: '[&_*]:text-[15px]',
  };

  return (
    <div className="flex h-full w-full flex-col bg-chat-area-bg">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 px-4 py-4 bg-header-bg backdrop-blur-sm shadow-sm">
      <div className="mx-auto max-w-3xl flex items-center justify-between">
        <KcaLogo />
        <div className="flex items-center gap-1.5">
          {/* 글자 크기 버튼 */}
          <div className="flex items-center gap-0.5 px-1.5 py-1 rounded-lg bg-muted/50">
            <button
              onClick={() => setFontSize('small')}
              className={`px-2 py-1 text-xs font-bold rounded transition-all ${
                fontSize === 'small' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              T
            </button>
            <button
              onClick={() => setFontSize('medium')}
              className={`px-2 py-1 text-sm font-bold rounded transition-all ${
                fontSize === 'medium' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              T
            </button>
            <button
              onClick={() => setFontSize('large')}
              className={`px-2 py-1 text-base font-bold rounded transition-all ${
                fontSize === 'large' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              T
            </button>
          </div>
          
          {/* 초기화 버튼 */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleReset}
                className="h-9 w-9 hover:bg-destructive/10 hover:text-destructive focus:outline-none focus:ring-2 focus:ring-destructive/20 rounded-lg transition-all"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>대화 초기화</TooltipContent>
          </Tooltip>

          <ModeToggle />
        </div>
      </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 bg-chat-area-bg pt-[72px]">
        <div className="mx-auto max-w-3xl px-4 py-4 sm:py-6 bg-chat-area-bg">
          <div className="space-y-4">
            {/* 초기 화면 - 항상 표시 */}
            <div className="flex flex-col items-center gap-3 sm:gap-6 py-4 sm:py-12">
              <KcaLogo size="large" useAvatar={true} />
              <div className="text-center">
                <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-1 sm:mb-2">
                자격검정 AI 챗봇에 오신걸 환영합니다.
                </h2>
                <p className="text-muted-foreground text-sm">
                  
                </p>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:gap-2.5 sm:grid-cols-2 w-full max-w-2xl">
                {[
                  '(예시1) 정보보안기사 시험정보를 알려줘',
                  '(예시2) 정보통신기사 합격률 정보',
                  '(예시3) 통신보안교육 대상자 기준은?',
                  '(예시4) 지역본부 주소 및 연락처',
                ].map((question) => (
                  <button
                    key={question}
                    disabled={isLoading}
                    className={`group relative h-auto whitespace-normal text-left transition-all duration-200 rounded-xl border backdrop-blur-sm overflow-hidden touch-manipulation ${
                      activeButton === question
                        ? 'scale-[0.98] shadow-lg bg-gradient-to-br from-blue-500/15 via-cyan-500/10 to-blue-400/15 border-blue-500/50'
                        : 'hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/10 bg-gradient-to-br from-card via-card to-muted/30 hover:from-blue-500/10 hover:via-cyan-500/5 hover:to-blue-400/10 border-border/50 hover:border-blue-500/30'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
                    onTouchStart={() => setActiveButton(question)}
                    onTouchEnd={() => setActiveButton(null)}
                    onMouseDown={() => setActiveButton(question)}
                    onMouseUp={() => setActiveButton(null)}
                    onMouseLeave={() => setActiveButton(null)}
                    onClick={() => handleExampleClick(question)}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br from-transparent via-blue-500/5 to-transparent transition-opacity duration-200 ${
                      activeButton === question ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`} />
                    <div className="relative flex items-stretch h-full">
                      <div className={`bg-gradient-to-b from-blue-500 via-cyan-400 to-blue-400 transition-all duration-200 flex-shrink-0 ${
                        activeButton === question ? 'w-1.5' : 'w-1 group-hover:w-1.5'
                      }`} />
                      <div className={`flex-1 px-4 py-3 transition-colors font-medium leading-snug ${exampleFontSizeClasses[fontSize]} ${
                        activeButton === question ? 'text-primary' : 'group-hover:text-primary'
                      }`}>
                        {question}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {messages.map((message) => (
              <div key={message.id}>
                {message.role === 'user' ? (
                  <div className="flex flex-col items-end gap-1">
                    <div className="max-w-[80%] rounded-3xl bg-chat-bubble-user px-4 py-2.5 text-foreground">
                      <p className={`whitespace-pre-wrap ${fontSizeClasses[fontSize]}`}>{message.content}</p>
                    </div>
                    <div className="flex items-center gap-2 mr-1">
                      <span className="text-xs text-muted-foreground">
                        {message.timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(message.content, message.id)}
                        className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                      >
                        {copiedId === message.id ? (
                          <>
                            <Check className="h-3 w-3 mr-1" />
                            복사됨
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 mr-1" />
                            복사
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 max-w-[95%]">
                    <div className="flex items-center gap-2">
                      <KcaLogo size="small" useAvatar={true} />
                      <span className="text-sm font-medium text-foreground">자격검정 AI챗봇</span>
                    </div>
                    <div className="bg-muted/50 rounded-2xl px-4 py-3 border border-border">
                      <div className={`prose ${proseSizeClasses[fontSize]} dark:prose-invert max-w-none text-foreground break-words`}>
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm, remarkBreaks]}
                          rehypePlugins={[rehypeHighlight]}
                          components={markdownComponents}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(message.content, message.id)}
                        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                      >
                        {copiedId === message.id ? (
                          <>
                            <Check className="h-3 w-3 mr-1" />
                            복사됨
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 mr-1" />
                            복사
                          </>
                        )}
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        {message.timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                        {message.duration !== undefined && (
                          <span className="ml-1 text-blue-500">({message.duration}초)</span>
                        )}
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
      <div className="bg-header-bg px-4 py-3 border-t border-border/40">
        <div className="mx-auto max-w-3xl">
          <form onSubmit={handleSubmit} className="relative">
            <div className="rounded-2xl border-2 border-input bg-chat-bubble overflow-hidden focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] transition-all duration-200">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="입력하신 내용은 인공지능(AI)을 통해 자동 분석 및 학습되므로, 개인정보 및 민감정보는 입력하지 말아주세요."
                disabled={isLoading}
                className={`min-h-[52px] max-h-32 resize-none border-0 bg-transparent px-4 py-3 ${fontSizeClasses[fontSize]} text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none`}
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
          <p className={`text-center ${disclaimerFontSizeClasses[fontSize]} text-muted-foreground mt-2 font-bold`}>
            (유의사항) AI 챗봇 답변에는 부정확한 정보가 포함될 수 있습니다.<br /> <br />
            중요한 정보는 반드시 CQ홈페이지(www.CQ.or.kr) 안내사항 또는 유선문의(1688-0013)를 
            통해 최종 확인하여 주시기 바랍니다. <br />
          </p>
        </div>
      </div>
    </div>
  );
}

// Memoized streaming message component to reduce re-renders
const StreamingMessage = ({ content }: { content: string }) => {
  const [showAltMessage, setShowAltMessage] = useState(false);

  useEffect(() => {
    if (!content) {
      const interval = setInterval(() => {
        setShowAltMessage(prev => !prev);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [content]);

  const renderedMarkdown = useMemo(() => {
    if (!content) return null;
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeHighlight]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    );
  }, [content]);

  return (
    <div className="flex flex-col gap-2 max-w-[95%]">
      <div className="flex items-center gap-2">
        <KcaLogo size="small" useAvatar={true} />
        <span className="text-sm font-medium text-foreground">자격검정 AI챗봇</span>
      </div>
      <div className="bg-muted/50 rounded-2xl px-4 py-3 border border-border">
        {content ? (
          <div className="prose prose-sm dark:prose-invert max-w-none text-foreground break-words">
            {renderedMarkdown}
            <span className="inline-block w-2 h-5 bg-muted-foreground animate-pulse ml-1 rounded-sm" />
          </div>
        ) : (
          <div className="flex flex-col gap-3 py-3">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm text-muted-foreground animate-pulse transition-opacity duration-1000 ease-in-out">
                {showAltMessage ? '자료 수집에 약 30초가 소요됩니다.' : '답변을 준비하고 있습니다...'}
              </span>
            </div>
            <div className="relative w-full h-1 bg-muted rounded-full overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 animate-[shimmer_2s_ease-in-out_infinite]" 
                   style={{ 
                     backgroundSize: '200% 100%',
                     animation: 'shimmer 2s ease-in-out infinite'
                   }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
