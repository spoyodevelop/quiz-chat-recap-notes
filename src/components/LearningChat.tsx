import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Send,
  Bot,
  User,
  CheckCircle,
  Clock,
  Loader2,
} from "lucide-react";
import { createGeminiAPI, GeminiAPI } from "@/lib/gemini";

type LearningSession = {
  id: string;
  topic: string;
  startTime: Date;
  messages: Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
  }>;
  isCompleted: boolean;
  summary?: string;
};

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
  const [messages, setMessages] = useState(session.messages);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isRecapping, setIsRecapping] = useState(false);
  const [recap, setRecap] = useState("");
  const [quizCount, setQuizCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [geminiAPI, setGeminiAPI] = useState<GeminiAPI | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const generateWelcomeMessage = async () => {
    if (!geminiAPI) return;

    try {
      setIsLoading(true);
      const welcomeContent = await geminiAPI.generateWelcomeMessage(
        session.topic
      );
      const welcomeMessage = {
        role: "assistant" as const,
        content: welcomeContent,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    } catch (error) {
      console.error("Welcome message generation failed:", error);
      // 폴백 메시지
      const fallbackMessage = {
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

    const userMessage = {
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
      const aiResponse = await geminiAPI.generateQuizResponse(
        session.topic,
        currentInput,
        quizCount,
        newMessages
      );

      const aiMessage = {
        role: "assistant" as const,
        content: aiResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setQuizCount((prev) => prev + 1);
    } catch (error) {
      console.error("AI response generation failed:", error);

      let errorText = "죄송합니다. 응답을 생성하는 중 오류가 발생했습니다.";

      if (error instanceof Error) {
        console.error("Error details:", error.message);
        if (
          error.message.includes("Failed to fetch") ||
          error.message.includes("NetworkError")
        ) {
          errorText += "\n\n🌐 네트워크 연결을 확인해주세요.";
        } else if (
          error.message.includes("401") ||
          error.message.includes("403")
        ) {
          errorText +=
            "\n\n🔑 API 키를 확인해주세요. API 설정에서 올바른 키를 입력했는지 확인하세요.";
        } else if (
          error.message.includes("quota") ||
          error.message.includes("limit")
        ) {
          errorText +=
            "\n\n⏰ API 사용량이 초과되었습니다. 잠시 후 다시 시도해주세요.";
        } else if (error.message.includes("CORS")) {
          errorText +=
            "\n\n🔒 CORS 정책 문제입니다. 페이지를 새로고침 후 다시 시도해주세요.";
        }
        errorText += `\n\n상세 오류: ${error.message}`;
      }

      const errorMessage = {
        role: "assistant" as const,
        content: errorText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
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
        messages
      );
      setRecap(summary);
    } catch (error) {
      console.error("Summary generation failed:", error);
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

    const updatedSession = {
      ...session,
      messages: messages,
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          돌아가기
        </Button>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800">
            {session.topic}
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
            <Clock className="w-4 h-4" />
            {formatTime(session.startTime)} 시작
          </div>
        </div>
        <Badge variant="secondary" className="bg-green-100 text-green-700">
          진행중
        </Badge>
      </div>

      {!isRecapping ? (
        <div className="space-y-4">
          <Card className="h-96 flex flex-col">
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-sm md:max-w-md px-4 py-3 rounded-lg whitespace-pre-wrap ${
                      message.role === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {message.content}
                  </div>
                  {message.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Input
              placeholder="답변을 입력하세요..."
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && !isLoading && sendMessage()
              }
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={!currentMessage.trim() || isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>

          {quizCount >= 3 && (
            <div className="text-center pt-4">
              <Button
                onClick={startRecap}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                학습 완료 및 정리하기
              </Button>
            </div>
          )}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>학습 정리 📝</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              오늘 "{session.topic}"에 대해 학습한 내용을 간단히 요약해주세요.
              이 내용은 TIL 보드에 표시됩니다.
            </p>
            <Textarea
              placeholder="예: React Hooks의 useState와 useEffect를 학습했다. useState는 상태 관리, useEffect는 사이드 이펙트 처리에 사용한다..."
              value={recap}
              onChange={(e) => setRecap(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsRecapping(false)}>
                돌아가기
              </Button>
              <Button onClick={completeSession} disabled={!recap.trim()}>
                완료하기
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LearningChat;
