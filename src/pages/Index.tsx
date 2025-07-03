import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  MessageCircle,
  CheckSquare,
  Sparkles,
  Settings,
} from "lucide-react";
import LearningChat, { LearningSession } from "@/components/LearningChat";
import TILBoard from "@/components/TILBoard";
import TILDetail from "@/components/TILDetail";
import ApiKeySetup from "@/components/ApiKeySetup";

const Index = () => {
  const [currentTopic, setCurrentTopic] = useState("");
  const [learningPhase, setLearningPhase] = useState<
    "setup" | "input" | "chat" | "board" | "detail"
  >("board");
  const [currentSession, setCurrentSession] = useState<LearningSession | null>(
    null
  );
  const [completedSessions, setCompletedSessions] = useState<LearningSession[]>(
    []
  );
  const [selectedSession, setSelectedSession] =
    useState<LearningSession | null>(null);

  // 완료된 세션들 localStorage에서 불러오기
  useEffect(() => {
    const savedSessions = localStorage.getItem("completed-sessions");
    if (savedSessions) {
      try {
        const sessions = JSON.parse(savedSessions);
        // Date 객체로 변환
        const sessionsWithDates = sessions.map((session: unknown) => {
          const sessionData = session as LearningSession;
          return {
            ...sessionData,
            startTime: new Date(sessionData.startTime),
            messages: sessionData.messages.map((msg) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            })),
          };
        });
        setCompletedSessions(sessionsWithDates);
      } catch (error) {
        console.error("Failed to load sessions from localStorage:", error);
      }
    }
  }, []);
  const [apiKey, setApiKey] = useState<string>("");

  // localStorage에서 완료된 세션만 불러오기 (API 키는 제외)

  const handleApiKeySet = (newApiKey: string) => {
    setApiKey(newApiKey);
    if (newApiKey) {
      // API 키가 설정되면 새 학습 시작을 위해 input 단계로
      setLearningPhase("input");
    } else {
      setLearningPhase("setup");
    }
  };

  const startLearning = () => {
    if (!currentTopic.trim()) return;

    const newSession: LearningSession = {
      id: Date.now().toString(),
      topic: currentTopic,
      startTime: new Date(),
      messages: [],
      isCompleted: false,
    };

    setCurrentSession(newSession);
    setLearningPhase("chat");
  };

  const completeSession = (session: LearningSession, summary: string) => {
    const completedSession = { ...session, isCompleted: true, summary };
    const updatedSessions = [...completedSessions, completedSession];
    setCompletedSessions(updatedSessions);

    // localStorage에 저장
    localStorage.setItem("completed-sessions", JSON.stringify(updatedSessions));

    setCurrentSession(null);
    setCurrentTopic("");
    setLearningPhase("board");
  };

  const startNewSession = () => {
    // 항상 API 키 입력부터 시작
    setLearningPhase("setup");
  };

  const handleSessionSelect = (session: LearningSession) => {
    setSelectedSession(session);
    setLearningPhase("detail");
  };

  const handleBackToBoard = () => {
    setSelectedSession(null);
    setLearningPhase("board");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              TIL Maker
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            AI와 함께하는 대화형 학습! 주제를 입력하고 퀴즈를 통해 학습한 후,
            나만의 TIL 노트를 만들어보세요.
          </p>
        </header>

        {learningPhase === "setup" && (
          <div className="max-w-2xl mx-auto">
            <ApiKeySetup onApiKeySet={handleApiKeySet} currentApiKey={apiKey} />
          </div>
        )}

        {learningPhase === "input" && (
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-end mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLearningPhase("setup")}
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                API 설정
              </Button>
            </div>
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Sparkles className="w-6 h-6 text-yellow-500" />
                  오늘 무엇을 학습하시겠어요?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Input
                    placeholder="예: React Hooks, 머신러닝 기초, 영어 문법..."
                    value={currentTopic}
                    onChange={(e) => setCurrentTopic(e.target.value)}
                    className="text-lg h-14 border-2 border-blue-100 focus:border-blue-400 transition-colors"
                    onKeyPress={(e) => e.key === "Enter" && startLearning()}
                  />
                  <Button
                    onClick={startLearning}
                    disabled={!currentTopic.trim()}
                    className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 transition-all duration-300"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    대화 시작하기
                  </Button>
                </div>

                {completedSessions.length > 0 && (
                  <div className="pt-6 border-t">
                    <h3 className="text-sm font-semibold text-gray-600 mb-3">
                      최근 학습 주제
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {completedSessions
                        .slice(-5)
                        .reverse()
                        .map((session) => (
                          <Badge
                            key={session.id}
                            variant="secondary"
                            className="bg-blue-100 text-blue-700"
                          >
                            {session.topic}
                          </Badge>
                        ))}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setLearningPhase("board")}
                      className="w-full mt-4"
                    >
                      <CheckSquare className="w-4 h-4 mr-2" />
                      TIL 보드 보기
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {learningPhase === "chat" && currentSession && (
          <LearningChat
            session={currentSession}
            onSessionComplete={completeSession}
            onBack={() => setLearningPhase("input")}
            apiKey={apiKey}
          />
        )}

        {learningPhase === "board" && (
          <TILBoard
            sessions={completedSessions}
            onStartNew={startNewSession}
            onSessionSelect={handleSessionSelect}
          />
        )}

        {learningPhase === "detail" && selectedSession && (
          <TILDetail session={selectedSession} onBack={handleBackToBoard} />
        )}
      </div>
    </div>
  );
};

export default Index;
