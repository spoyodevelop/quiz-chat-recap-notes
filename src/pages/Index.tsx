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
  ArrowLeft,
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

  // 더미 데이터 생성 함수
  const createDummyData = (): LearningSession[] => {
    const baseTime = new Date();

    return [
      {
        id: "dummy-1",
        topic: "React Hooks의 이해",
        startTime: new Date(baseTime.getTime() - 5 * 24 * 60 * 60 * 1000), // 5일 전
        messages: [
          {
            role: "assistant",
            content:
              "React Hooks에 대해 함께 학습해보겠습니다! useState와 useEffect의 차이점을 설명해주세요.",
            timestamp: new Date(baseTime.getTime() - 5 * 24 * 60 * 60 * 1000),
          },
          {
            role: "user",
            content:
              "useState는 상태 관리를 위한 Hook이고, useEffect는 생명주기와 부수효과를 처리하는 Hook입니다.",
            timestamp: new Date(
              baseTime.getTime() - 5 * 24 * 60 * 60 * 1000 + 3 * 60000
            ), // 3분 후
          },
          {
            role: "assistant",
            content:
              "정확합니다! 그렇다면 useEffect에서 cleanup 함수는 언제 사용하나요?",
            timestamp: new Date(
              baseTime.getTime() - 5 * 24 * 60 * 60 * 1000 + 5 * 60000
            ), // 5분 후
          },
          {
            role: "user",
            content:
              "컴포넌트가 언마운트되거나 dependency가 변경될 때 이전 effect를 정리하기 위해 사용합니다.",
            timestamp: new Date(
              baseTime.getTime() - 5 * 24 * 60 * 60 * 1000 + 8 * 60000
            ), // 8분 후
          },
          {
            role: "assistant",
            content:
              "완벽합니다! 마지막으로 커스텀 Hook을 만드는 이유는 무엇인가요?",
            timestamp: new Date(
              baseTime.getTime() - 5 * 24 * 60 * 60 * 1000 + 12 * 60000
            ), // 12분 후
          },
          {
            role: "user",
            content:
              "상태 로직을 재사용하고 컴포넌트 간에 공유하기 위해서입니다.",
            timestamp: new Date(
              baseTime.getTime() - 5 * 24 * 60 * 60 * 1000 + 18 * 60000
            ), // 18분 후
          },
        ],
        isCompleted: true,
        summary:
          "React의 핵심 Hooks인 useState와 useEffect에 대해 학습했습니다. 상태 관리의 기본 원리와 부수효과 처리 방법, cleanup 함수의 중요성을 이해했습니다.",
      },
      {
        id: "dummy-2",
        topic: "JavaScript 비동기 처리",
        startTime: new Date(baseTime.getTime() - 3 * 24 * 60 * 60 * 1000), // 3일 전
        messages: [
          {
            role: "assistant",
            content:
              "JavaScript의 비동기 처리에 대해 알아보겠습니다. Promise와 async/await의 차이점은 무엇인가요?",
            timestamp: new Date(baseTime.getTime() - 3 * 24 * 60 * 60 * 1000),
          },
          {
            role: "user",
            content:
              "Promise는 비동기 작업의 결과를 나타내는 객체이고, async/await는 Promise를 더 읽기 쉽게 작성할 수 있는 문법입니다.",
            timestamp: new Date(
              baseTime.getTime() - 3 * 24 * 60 * 60 * 1000 + 4 * 60000
            ), // 4분 후
          },
          {
            role: "assistant",
            content:
              "좋습니다! 그렇다면 콜백 지옥(Callback Hell)이 무엇이고, 어떻게 해결할 수 있나요?",
            timestamp: new Date(
              baseTime.getTime() - 3 * 24 * 60 * 60 * 1000 + 7 * 60000
            ), // 7분 후
          },
          {
            role: "user",
            content:
              "콜백 함수가 중첩되어 코드가 복잡해지는 문제입니다. Promise나 async/await를 사용해서 해결할 수 있습니다.",
            timestamp: new Date(
              baseTime.getTime() - 3 * 24 * 60 * 60 * 1000 + 11 * 60000
            ), // 11분 후
          },
          {
            role: "assistant",
            content:
              "정확합니다! 마지막으로 try-catch를 async/await와 함께 사용하는 방법을 설명해주세요.",
            timestamp: new Date(
              baseTime.getTime() - 3 * 24 * 60 * 60 * 1000 + 15 * 60000
            ), // 15분 후
          },
          {
            role: "user",
            content:
              "async 함수 내에서 await 구문을 try 블록에 넣고, catch 블록에서 에러를 처리합니다.",
            timestamp: new Date(
              baseTime.getTime() - 3 * 24 * 60 * 60 * 1000 + 22 * 60000
            ), // 22분 후
          },
        ],
        isCompleted: true,
        summary:
          "JavaScript 비동기 처리의 핵심 개념을 학습했습니다. Promise, async/await, 콜백 지옥 해결 방법과 에러 처리까지 종합적으로 이해했습니다.",
      },
      {
        id: "dummy-3",
        topic: "CSS Grid vs Flexbox",
        startTime: new Date(baseTime.getTime() - 2 * 24 * 60 * 60 * 1000), // 2일 전
        messages: [
          {
            role: "assistant",
            content: "CSS 레이아웃에서 Grid와 Flexbox는 언제 사용해야 할까요?",
            timestamp: new Date(baseTime.getTime() - 2 * 24 * 60 * 60 * 1000),
          },
          {
            role: "user",
            content:
              "Flexbox는 1차원 레이아웃에, Grid는 2차원 레이아웃에 적합합니다.",
            timestamp: new Date(
              baseTime.getTime() - 2 * 24 * 60 * 60 * 1000 + 2 * 60000
            ), // 2분 후
          },
          {
            role: "assistant",
            content:
              "맞습니다! 그렇다면 justify-content와 align-items의 차이점은?",
            timestamp: new Date(
              baseTime.getTime() - 2 * 24 * 60 * 60 * 1000 + 5 * 60000
            ), // 5분 후
          },
          {
            role: "user",
            content:
              "justify-content는 주축 방향 정렬, align-items는 교차축 방향 정렬을 담당합니다.",
            timestamp: new Date(
              baseTime.getTime() - 2 * 24 * 60 * 60 * 1000 + 8 * 60000
            ), // 8분 후
          },
          {
            role: "assistant",
            content:
              "완벽합니다! Grid에서 grid-template-areas를 사용하는 장점은 무엇인가요?",
            timestamp: new Date(
              baseTime.getTime() - 2 * 24 * 60 * 60 * 1000 + 12 * 60000
            ), // 12분 후
          },
          {
            role: "user",
            content:
              "직관적으로 레이아웃을 시각화할 수 있고, 반응형 디자인에서 쉽게 재배치할 수 있습니다.",
            timestamp: new Date(
              baseTime.getTime() - 2 * 24 * 60 * 60 * 1000 + 16 * 60000
            ), // 16분 후
          },
        ],
        isCompleted: true,
        summary:
          "CSS의 두 가지 주요 레이아웃 방법인 Grid와 Flexbox의 특징과 사용 시기를 명확히 구분할 수 있게 되었습니다. 각각의 속성과 활용법도 함께 학습했습니다.",
      },
      {
        id: "dummy-4",
        topic: "TypeScript 제네릭",
        startTime: new Date(baseTime.getTime() - 1 * 24 * 60 * 60 * 1000), // 1일 전
        messages: [
          {
            role: "assistant",
            content:
              "TypeScript의 제네릭에 대해 알아보겠습니다. 제네릭을 사용하는 이유는 무엇인가요?",
            timestamp: new Date(baseTime.getTime() - 1 * 24 * 60 * 60 * 1000),
          },
          {
            role: "user",
            content:
              "타입 안정성을 유지하면서 재사용 가능한 컴포넌트를 만들기 위해서입니다.",
            timestamp: new Date(
              baseTime.getTime() - 1 * 24 * 60 * 60 * 1000 + 3 * 60000
            ), // 3분 후
          },
          {
            role: "assistant",
            content:
              "정확합니다! 제네릭 제약 조건(Generic Constraints)은 언제 사용하나요?",
            timestamp: new Date(
              baseTime.getTime() - 1 * 24 * 60 * 60 * 1000 + 6 * 60000
            ), // 6분 후
          },
          {
            role: "user",
            content:
              "특정 속성이나 메서드를 가진 타입으로만 제한하고 싶을 때 extends 키워드를 사용합니다.",
            timestamp: new Date(
              baseTime.getTime() - 1 * 24 * 60 * 60 * 1000 + 10 * 60000
            ), // 10분 후
          },
          {
            role: "assistant",
            content:
              "훌륭합니다! 유틸리티 타입 중 Pick과 Omit의 차이점을 설명해주세요.",
            timestamp: new Date(
              baseTime.getTime() - 1 * 24 * 60 * 60 * 1000 + 14 * 60000
            ), // 14분 후
          },
          {
            role: "user",
            content:
              "Pick은 특정 속성만 선택해서 새로운 타입을 만들고, Omit은 특정 속성을 제외하고 새로운 타입을 만듭니다.",
            timestamp: new Date(
              baseTime.getTime() - 1 * 24 * 60 * 60 * 1000 + 19 * 60000
            ), // 19분 후
          },
        ],
        isCompleted: true,
        summary:
          "TypeScript 제네릭의 개념과 활용법을 학습했습니다. 타입 매개변수, 제약 조건, 유틸리티 타입까지 실무에 바로 적용할 수 있는 수준으로 이해했습니다.",
      },
      {
        id: "dummy-5",
        topic: "웹 접근성 기초",
        startTime: new Date(baseTime.getTime() - 12 * 60 * 60 * 1000), // 12시간 전
        messages: [
          {
            role: "assistant",
            content: "웹 접근성이 중요한 이유와 ARIA 속성에 대해 설명해주세요.",
            timestamp: new Date(baseTime.getTime() - 12 * 60 * 60 * 1000),
          },
          {
            role: "user",
            content:
              "모든 사용자가 웹을 이용할 수 있도록 하기 위해서이고, ARIA는 스크린 리더 등 보조 기술에 추가 정보를 제공합니다.",
            timestamp: new Date(
              baseTime.getTime() - 12 * 60 * 60 * 1000 + 5 * 60000
            ), // 5분 후
          },
          {
            role: "assistant",
            content:
              "훌륭합니다! 그렇다면 키보드 네비게이션을 고려한 설계는 어떻게 해야 할까요?",
            timestamp: new Date(
              baseTime.getTime() - 12 * 60 * 60 * 1000 + 8 * 60000
            ), // 8분 후
          },
          {
            role: "user",
            content:
              "Tab 키로 모든 요소에 접근 가능해야 하고, focus 상태가 명확히 보여야 하며, 논리적인 순서로 이동해야 합니다.",
            timestamp: new Date(
              baseTime.getTime() - 12 * 60 * 60 * 1000 + 12 * 60000
            ), // 12분 후
          },
          {
            role: "assistant",
            content:
              "완벽합니다! 색상 대비와 관련된 접근성 가이드라인은 무엇인가요?",
            timestamp: new Date(
              baseTime.getTime() - 12 * 60 * 60 * 1000 + 15 * 60000
            ), // 15분 후
          },
          {
            role: "user",
            content:
              "WCAG 기준으로 일반 텍스트는 4.5:1, 큰 텍스트는 3:1 이상의 대비율을 유지해야 합니다.",
            timestamp: new Date(
              baseTime.getTime() - 12 * 60 * 60 * 1000 + 20 * 60000
            ), // 20분 후
          },
        ],
        isCompleted: true,
        summary:
          "웹 접근성의 중요성과 실제 구현 방법을 학습했습니다. ARIA 속성, 키보드 네비게이션, 색상 대비 등 포괄적인 접근성 고려사항을 이해했습니다.",
      },
      {
        id: "dummy-6",
        topic: "Git 브랜치 전략",
        startTime: new Date(baseTime.getTime() - 2 * 60 * 60 * 1000), // 2시간 전
        messages: [
          {
            role: "assistant",
            content: "Git Flow와 GitHub Flow의 차이점에 대해 설명해주세요.",
            timestamp: new Date(baseTime.getTime() - 2 * 60 * 60 * 1000),
          },
          {
            role: "user",
            content:
              "Git Flow는 복잡한 릴리즈 주기에 적합하고, GitHub Flow는 단순하고 지속적인 배포에 적합합니다.",
            timestamp: new Date(
              baseTime.getTime() - 2 * 60 * 60 * 1000 + 4 * 60000
            ), // 4분 후
          },
          {
            role: "assistant",
            content:
              "정확합니다! 그렇다면 feature branch에서 작업할 때 주의사항은 무엇인가요?",
            timestamp: new Date(
              baseTime.getTime() - 2 * 60 * 60 * 1000 + 7 * 60000
            ), // 7분 후
          },
          {
            role: "user",
            content:
              "작은 단위로 커밋하고, 명확한 커밋 메시지를 작성하며, 정기적으로 main 브랜치와 동기화해야 합니다.",
            timestamp: new Date(
              baseTime.getTime() - 2 * 60 * 60 * 1000 + 11 * 60000
            ), // 11분 후
          },
          {
            role: "assistant",
            content:
              "훌륭합니다! merge와 rebase의 차이점과 각각의 사용 시기는?",
            timestamp: new Date(
              baseTime.getTime() - 2 * 60 * 60 * 1000 + 14 * 60000
            ), // 14분 후
          },
          {
            role: "user",
            content:
              "merge는 히스토리를 보존하고, rebase는 깔끔한 히스토리를 만듭니다. 공유 브랜치에서는 merge, 개인 브랜치에서는 rebase를 사용합니다.",
            timestamp: new Date(
              baseTime.getTime() - 2 * 60 * 60 * 1000 + 18 * 60000
            ), // 18분 후
          },
        ],
        isCompleted: true,
        summary:
          "효과적인 Git 브랜치 전략에 대해 학습했습니다. 프로젝트 규모와 팀 상황에 따른 최적의 브랜치 전략 선택 방법을 이해했습니다.",
      },
    ];
  };

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
    } else {
      // localStorage가 비어있을 때 더미 데이터 설정
      const dummyData = createDummyData();
      setCompletedSessions(dummyData);
      localStorage.setItem("completed-sessions", JSON.stringify(dummyData));
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
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            AI와 함께하는 대화형 학습!
            <br />
            주제를 입력하고 퀴즈를 통해 학습한 후, 나만의 TIL 노트를
            만들어보세요.
          </p>
        </header>

        {learningPhase === "setup" && (
          <div className="max-w-2xl mx-auto">
            <ApiKeySetup
              onApiKeySet={handleApiKeySet}
              currentApiKey={apiKey}
              onBack={() => setLearningPhase("board")}
              completedSessions={completedSessions}
              onSessionSelect={handleSessionSelect}
            />
          </div>
        )}

        {learningPhase === "input" && (
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <Button
                variant="outline"
                onClick={() => setLearningPhase("board")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                TIL 보드로
              </Button>
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
