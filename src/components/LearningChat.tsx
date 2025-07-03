import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Send,
  CheckCircle,
  Clock,
  Loader2,
  Lightbulb,
  Target,
  MessageCircle,
  ChevronRight,
} from "lucide-react";
import {
  createGeminiAPI,
  GeminiAPI,
  StructuredQuizResponse,
} from "@/lib/gemini";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

// 기존 메시지 타입 정의
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// 학습 세션 타입 정의
export interface LearningSession {
  id: string;
  topic: string;
  startTime: Date;
  messages: ChatMessage[];
  isCompleted: boolean;
  summary?: string;
}

// 구조화된 메시지 타입 (기존 메시지 타입 확장)
interface StructuredMessage extends ChatMessage {
  structuredData?: StructuredQuizResponse;
}

interface LearningChatProps {
  session: LearningSession;
  onSessionComplete: (session: LearningSession, summary: string) => void;
  onBack: () => void;
  apiKey: string;
}

const LearningChat: React.FC<LearningChatProps> = ({
  session,
  onSessionComplete,
  onBack,
  apiKey,
}) => {
  const [messages, setMessages] = useState<StructuredMessage[]>(
    session.messages.map((msg) => ({ ...msg, structuredData: undefined }))
  );
  const [currentMessage, setCurrentMessage] = useState("");
  const [isRecapping, setIsRecapping] = useState(false);
  const [recap, setRecap] = useState("");
  const [quizCount, setQuizCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [waitingForNext, setWaitingForNext] = useState(false);
  const [geminiAPI, setGeminiAPI] = useState<GeminiAPI | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const MAX_QUIZ_COUNT = 3;

  useEffect(() => {
    const api = createGeminiAPI(apiKey);
    setGeminiAPI(api);

    if (!api) {
      console.error("Gemini API not available - API key missing");
    }
  }, [apiKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // AI 첫 인사말
    if (messages.length === 0 && geminiAPI) {
      generateWelcomeMessage();
    }
  }, [geminiAPI]);

  // 에러 핸들링 함수 추가
  const handleApiError = (error: unknown) => {
    console.error("API Error:", error);

    if (error instanceof Error) {
      const errorMessage = error.message;

      // 네트워크 연결 문제
      if (
        errorMessage.includes("Failed to fetch") ||
        errorMessage.includes("NetworkError") ||
        errorMessage.includes("TypeError: fetch")
      ) {
        toast({
          variant: "destructive",
          title: "🌐 연결 오류",
          description: "인터넷 연결을 확인하고 다시 시도해주세요.",
        });
        return;
      }

      // HTTP 상태 코드별 처리
      if (errorMessage.includes("400")) {
        toast({
          variant: "destructive",
          title: "⚠️ 요청 오류",
          description: "입력 내용에 문제가 있습니다. 다시 시도해주세요.",
        });
        return;
      }

      if (errorMessage.includes("401") || errorMessage.includes("403")) {
        toast({
          variant: "destructive",
          title: "🔑 인증 오류",
          description:
            "API 키를 확인해주세요. 설정에서 올바른 키를 입력했는지 확인하세요.",
        });
        return;
      }

      if (errorMessage.includes("429")) {
        toast({
          variant: "destructive",
          title: "⏰ 사용량 초과",
          description:
            "API 사용량이 초과되었습니다. 잠시 후 다시 시도해주세요.",
        });
        return;
      }

      if (errorMessage.includes("503")) {
        toast({
          variant: "destructive",
          title: "🔧 서버 점검 중",
          description:
            "서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
        });
        return;
      }

      if (errorMessage.includes("504")) {
        toast({
          variant: "destructive",
          title: "⏱️ 시간 초과",
          description:
            "요청 처리 시간이 초과되었습니다. 더 짧은 내용으로 다시 시도해보세요.",
        });
        return;
      }

      // 5xx 기타 서버 오류
      if (
        errorMessage.includes("500") ||
        errorMessage.includes("502") ||
        errorMessage.includes("505")
      ) {
        toast({
          variant: "destructive",
          title: "🔧 서버 오류",
          description: "서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
        });
        return;
      }

      // CORS 오류
      if (errorMessage.includes("CORS")) {
        toast({
          variant: "destructive",
          title: "🔒 보안 정책 오류",
          description: "페이지를 새로고침하고 다시 시도해주세요.",
        });
        return;
      }

      // 안전 필터링 관련
      if (errorMessage.includes("SAFETY") || errorMessage.includes("BLOCKED")) {
        toast({
          variant: "destructive",
          title: "🛡️ 콘텐츠 필터링",
          description:
            "입력한 내용이 안전 정책에 위반됩니다. 다른 방식으로 질문해주세요.",
        });
        return;
      }
    }

    // 기본 오류 메시지
    toast({
      variant: "destructive",
      title: "❌ 오류 발생",
      description:
        "예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
    });
  };

  const generateWelcomeMessage = async () => {
    if (!geminiAPI) return;

    try {
      setIsLoading(true);
      const welcomeContent = await geminiAPI.generateWelcomeMessage(
        session.topic
      );
      const welcomeMessage: StructuredMessage = {
        role: "assistant" as const,
        content: welcomeContent,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    } catch (error) {
      handleApiError(error);
      // 폴백 메시지
      const fallbackMessage: StructuredMessage = {
        role: "assistant" as const,
        content: `안녕하세요! "${session.topic}"에 대해 함께 학습해보겠습니다. 

먼저 이 주제에 대해 간단히 설명해주시거나, 궁금한 점을 말씀해주세요. 그러면 맞춤형 퀴즈를 만들어드릴게요! 

준비되셨나요? 😊`,
        timestamp: new Date(),
      };
      setMessages([fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || !geminiAPI || isLoading) return;

    // 사용자가 답변을 입력하면 대기 상태 해제
    setWaitingForNext(false);

    const userMessage: StructuredMessage = {
      role: "user" as const,
      content: currentMessage,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    const currentInput = currentMessage;
    setCurrentMessage("");
    setIsLoading(true);

    try {
      let aiMessage: StructuredMessage;

      const shouldUseStructured = quizCount > 0 || newMessages.length > 1;

      if (shouldUseStructured) {
        setIsQuizMode(true);
        // 구조화된 응답 사용
        const structuredResponse =
          await geminiAPI.generateStructuredQuizResponse(
            session.topic,
            currentInput,
            quizCount,
            newMessages.map((msg) => ({
              role: msg.role,
              content: msg.content,
            }))
          );

        const formattedContent = formatStructuredResponse(structuredResponse);

        aiMessage = {
          role: "assistant" as const,
          content: formattedContent,
          timestamp: new Date(),
          structuredData: structuredResponse,
        };

        setWaitingForNext(true);
      } else {
        // 첫 인사말은 기존 방식 사용
        const aiResponse = await geminiAPI.generateQuizResponse(
          session.topic,
          currentInput,
          quizCount,
          newMessages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          }))
        );

        aiMessage = {
          role: "assistant" as const,
          content: aiResponse,
          timestamp: new Date(),
        };
      }

      setMessages((prev) => [...prev, aiMessage]);
      setQuizCount((prev) => prev + 1);
    } catch (error) {
      handleApiError(error);

      // 간단한 폴백 메시지만 추가 (토스트가 주요 알림 역할)
      const errorMessage: StructuredMessage = {
        role: "assistant" as const,
        content:
          "죄송합니다. 일시적인 오류가 발생했습니다. 위의 알림을 확인하고 다시 시도해주세요.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const nextQuestion = async () => {
    if (!geminiAPI || isLoading || quizCount >= MAX_QUIZ_COUNT) return;

    setWaitingForNext(false);
    setIsLoading(true);

    try {
      const structuredResponse = await geminiAPI.generateStructuredQuizResponse(
        session.topic,
        "다음 질문을 주세요",
        quizCount,
        messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }))
      );

      const formattedContent = formatStructuredResponse(structuredResponse);

      const aiMessage: StructuredMessage = {
        role: "assistant" as const,
        content: formattedContent,
        timestamp: new Date(),
        structuredData: structuredResponse,
      };

      setMessages((prev) => [...prev, aiMessage]);
      setQuizCount((prev) => prev + 1);

      if (quizCount + 1 >= MAX_QUIZ_COUNT) {
        setWaitingForNext(false);
      } else {
        setWaitingForNext(true);
      }
    } catch (error) {
      handleApiError(error);
      setWaitingForNext(true);
    } finally {
      setIsLoading(false);
    }
  };

  const startRecap = async () => {
    if (!geminiAPI) return;

    setIsRecapping(true);
    setIsLoading(true);

    try {
      const summary = await geminiAPI.generateRecapSummary(
        session.topic,
        // API 호출을 위해 기본 메시지 형태로 변환
        messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }))
      );
      setRecap(summary);
    } catch (error) {
      handleApiError(error);
      setRecap(`# ${session.topic}

## 학습 내용 요약
오늘 "${session.topic}"에 대해 학습했습니다.

이런 내용으로 오늘 학습한 내용을 요약했어요. 고치고 싶은 것이 있나요?

## 배운 점
- 대화를 통해 다양한 질문과 답변을 나누었습니다.

## 한줄 정리
AI와 함께하는 학습을 통해 "${session.topic}"에 대한 이해를 높일 수 있었습니다.`);
    } finally {
      setIsLoading(false);
    }
  };

  const completeSession = () => {
    if (!recap.trim()) return;

    const updatedSession: LearningSession = {
      ...session,
      // StructuredMessage를 기본 ChatMessage로 변환
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
      })),
      summary: recap,
    };

    onSessionComplete(updatedSession, recap);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 구조화된 응답을 사용자 친화적 형태로 변환
  const formatStructuredResponse = (
    structured: StructuredQuizResponse
  ): string => {
    let content = "";

    if (structured.feedback) {
      content += `📝 **피드백**\n${structured.feedback}\n\n`;
    }

    content += `💡 **핵심 질문**\n${structured.mainQuestion}\n\n`;

    if (structured.highlights && structured.highlights.length > 0) {
      content += `🎯 **주목해야 할 핵심 포인트**\n`;
      structured.highlights.forEach((highlight) => {
        content += `• ${highlight}\n`;
      });
      content += "\n";
    }

    if (structured.options && structured.options.length > 0) {
      content += `**선택지**\n`;
      structured.options.forEach((option) => {
        content += `${option}\n`;
      });
      content += "\n";
    }

    if (structured.hint) {
      content += `💭 **힌트**: ${structured.hint}`;
    }

    return content;
  };

  // 구조화된 메시지 렌더링 컴포넌트
  const StructuredMessageCard: React.FC<{ message: StructuredMessage }> = ({
    message,
  }) => {
    if (!message.structuredData) {
      return (
        <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
          {message.content}
        </div>
      );
    }

    const data = message.structuredData;

    return (
      <div className="space-y-4">
        {/* 1차 정보: 피드백과 핵심 질문 */}
        <div className="space-y-4">
          {data.feedback && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg mt-4 mb-6">
              <div className="flex items-start gap-3">
                <MessageCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-base font-medium text-blue-800 block mb-2">
                    답변 피드백
                  </span>
                  <p className="text-sm text-blue-700 leading-relaxed">
                    {data.feedback}
                  </p>
                </div>
              </div>
            </div>
          )}
          <hr className="my-4" />

          <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base font-medium text-green-800">
                    다음 질문
                  </span>
                  {data.questionType && (
                    <Badge
                      variant="secondary"
                      className="text-xs bg-green-100 text-green-700"
                    >
                      {data.questionType}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-green-900 leading-relaxed font-medium">
                  {data.mainQuestion}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 2차 정보: 부가 자료들 (더 작고 컴팩트하게) */}
        {(data.highlights || data.options || data.hint) && (
          <div className="space-y-2 pl-4 border-l-2 border-gray-200">
            {data.highlights && data.highlights.length > 0 && (
              <div className="bg-yellow-50/70 border border-yellow-200 p-2 rounded">
                <div className="flex items-start gap-2">
                  <Target className="h-3 w-3 text-yellow-600 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-xs font-medium text-yellow-800 block mb-1">
                      참고할 포인트
                    </span>
                    <ul className="space-y-0.5">
                      {data.highlights.map((highlight, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-1 text-xs text-yellow-900"
                        >
                          <span className="text-yellow-600 mt-0.5">•</span>
                          <span className="leading-relaxed">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {data.options && data.options.length > 0 && (
              <div className="bg-purple-50/70 border border-purple-200 p-2 rounded">
                <span className="text-xs font-medium text-purple-800 block mb-1">
                  선택지
                </span>
                <div className="space-y-0.5">
                  {data.options.map((option, index) => (
                    <div
                      key={index}
                      className="text-xs text-purple-900 bg-white/60 rounded px-2 py-0.5"
                    >
                      {option}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.hint && (
              <div className="bg-indigo-50/70 border border-indigo-200 p-2 rounded">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-3 w-3 text-indigo-600 mt-1 flex-shrink-0" />
                  <div>
                    <span className="text-xs font-medium text-indigo-800 block mb-1">
                      힌트
                    </span>
                    <p className="text-xs text-indigo-700 leading-relaxed">
                      {data.hint}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={onBack}
          size="sm"
          className="flex items-center gap-2 h-8"
        >
          <ArrowLeft className="w-4 h-4" />
          돌아가기
        </Button>
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-800">
            {session.topic}
          </h2>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            {formatTime(session.startTime)} 시작
          </div>
        </div>
        <Badge
          variant="secondary"
          className="bg-green-100 text-green-700 text-xs"
        >
          진행중
        </Badge>
      </div>

      {isQuizMode && !isRecapping && (
        <Card className="mb-4">
          <CardContent className="pt-4 pb-3">
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-600">
                <span>학습 진행도</span>
                <span>
                  {quizCount}/{MAX_QUIZ_COUNT}
                </span>
              </div>
              <Progress
                value={(quizCount / MAX_QUIZ_COUNT) * 100}
                className="w-full h-2"
              />
              <p className="text-xs text-gray-500 text-center">
                {quizCount >= MAX_QUIZ_COUNT
                  ? "모든 퀴즈 완료! TIL 작성 준비됨"
                  : `${MAX_QUIZ_COUNT - quizCount}개 질문 남음`}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {!isRecapping ? (
        <div className="space-y-4">
          <Card className="h-[600px] overflow-y-auto">
            <CardContent className="p-4">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          message.role === "user" ? "default" : "secondary"
                        }
                        className={
                          message.role === "user"
                            ? "bg-blue-600 text-xs"
                            : "bg-green-100 text-green-700 text-xs"
                        }
                      >
                        {message.role === "user" ? "나" : "AI"}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                    {message.role === "assistant" && message.structuredData ? (
                      <StructuredMessageCard message={message} />
                    ) : (
                      <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm">
                        {message.content}
                      </div>
                    )}
                    {index < messages.length - 1 && (
                      <Separator className="my-3" />
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">AI가 생각하고 있습니다...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="답변을 입력하세요..."
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && !isLoading && sendMessage()
                }
                className="flex-1 h-10"
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={!currentMessage.trim() || isLoading}
                size="sm"
                className="h-10 px-3"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>

            {waitingForNext && quizCount < MAX_QUIZ_COUNT && (
              <div className="text-center">
                <Button
                  onClick={nextQuestion}
                  disabled={isLoading}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 h-8 text-sm"
                >
                  {isLoading ? (
                    <Loader2 className="w-3 h-3 animate-spin mr-1" />
                  ) : (
                    <ChevronRight className="w-3 h-3 mr-1" />
                  )}
                  다음 질문
                </Button>
              </div>
            )}

            {quizCount >= MAX_QUIZ_COUNT && (
              <div className="text-center pt-2">
                <Button
                  onClick={startRecap}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 h-8 text-sm"
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  TIL 작성하기
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              학습 정리 📝
              {isLoading && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  AI가 요약을 작성 중입니다...
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8 space-y-4">
                <div className="flex items-center justify-center gap-2 text-blue-600">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span className="text-lg font-medium">
                    AI가 학습 내용을 정리하고 있습니다...
                  </span>
                </div>
                <p className="text-gray-500">
                  대화 내용을 바탕으로 맞춤형 TIL을 작성 중입니다. 잠시만
                  기다려주세요.
                </p>
              </div>
            ) : (
              <>
                <p className="text-gray-600">
                  AI가 생성한 학습 요약입니다. 내용을 확인하고 필요에 따라
                  수정해주세요. 이 내용은 TIL 보드에 표시됩니다.
                </p>
                <Textarea
                  placeholder="예: React Hooks의 useState와 useEffect를 학습했다. useState는 상태 관리, useEffect는 사이드 이펙트 처리에 사용한다..."
                  value={recap}
                  onChange={(e) => setRecap(e.target.value)}
                  rows={8}
                  className="resize-none"
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setIsRecapping(false)}
                  >
                    돌아가기
                  </Button>
                  <Button onClick={completeSession} disabled={!recap.trim()}>
                    완료하기
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LearningChat;
