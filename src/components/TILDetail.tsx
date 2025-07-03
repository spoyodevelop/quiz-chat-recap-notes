import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MessageSquare,
  Bot,
  User,
} from "lucide-react";

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

interface TILDetailProps {
  session: LearningSession;
  onBack: () => void;
}

const TILDetail: React.FC<TILDetailProps> = ({ session, onBack }) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          목록으로
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800">{session.topic}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(session.startTime)}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatTime(session.startTime)}
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              완료
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* TIL 요약 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              TIL 정리
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-[500px] overflow-y-auto">
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {session.summary || "요약이 없습니다."}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 대화 내용 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-600" />
              대화 내용
            </CardTitle>
            <p className="text-sm text-gray-600">
              총 {session.messages.length}개의 메시지
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {session.messages.map((message, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-shrink-0">
                    {message.role === "user" ? (
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-green-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-800">
                        {message.role === "user" ? "나" : "AI"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">
                      {message.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 통계 정보 */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {session.messages.filter((m) => m.role === "user").length}
              </div>
              <div className="text-sm text-gray-600">내 질문/답변</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {session.messages.filter((m) => m.role === "assistant").length}
              </div>
              <div className="text-sm text-gray-600">AI 응답</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {session.messages.length}
              </div>
              <div className="text-sm text-gray-600">총 메시지</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {Math.floor(
                  (Date.now() - session.startTime.getTime()) / (1000 * 60)
                )}
                분
              </div>
              <div className="text-sm text-gray-600">학습 시간</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TILDetail;
