
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send, Bot, User, CheckCircle, Clock } from 'lucide-react';

type LearningSession = {
  id: string;
  topic: string;
  startTime: Date;
  messages: Array<{
    role: 'user' | 'assistant';
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
}

const LearningChat: React.FC<LearningChatProps> = ({ session, onSessionComplete, onBack }) => {
  const [messages, setMessages] = useState(session.messages);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isRecapping, setIsRecapping] = useState(false);
  const [recap, setRecap] = useState('');
  const [quizCount, setQuizCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // AI 첫 인사말
    if (messages.length === 0) {
      const welcomeMessage = {
        role: 'assistant' as const,
        content: `안녕하세요! "${session.topic}"에 대해 함께 학습해보겠습니다. 

먼저 이 주제에 대해 간단히 설명해주시거나, 궁금한 점을 말씀해주세요. 그러면 맞춤형 퀴즈를 만들어드릴게요! 

준비되셨나요? 😊`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  const sendMessage = () => {
    if (!currentMessage.trim()) return;

    const userMessage = {
      role: 'user' as const,
      content: currentMessage,
      timestamp: new Date()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setCurrentMessage('');

    // AI 응답 시뮬레이션
    setTimeout(() => {
      const aiResponse = generateAIResponse(currentMessage, quizCount);
      const aiMessage = {
        role: 'assistant' as const,
        content: aiResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setQuizCount(prev => prev + 1);
    }, 1000);
  };

  const generateAIResponse = (userInput: string, currentQuizCount: number): string => {
    const responses = [
      `좋은 답변이네요! 이제 "${session.topic}"에 대한 퀴즈를 내보겠습니다.

**퀴즈 ${currentQuizCount + 1}**: 방금 설명해주신 내용을 바탕으로, 다음 중 올바른 것은?

A) 첫 번째 선택지
B) 두 번째 선택지  
C) 세 번째 선택지

어떤 답이 맞다고 생각하시나요? 이유도 함께 설명해주세요!`,

      `정답입니다! 👏 이해도가 높으시네요.

**퀴즈 ${currentQuizCount + 1}**: 조금 더 심화된 질문을 해보겠습니다.

"${session.topic}"을 실제 상황에 어떻게 적용할 수 있을까요? 구체적인 예시 하나를 들어주세요.`,

      `훌륭한 예시입니다! 

**퀴즈 ${currentQuizCount + 1}**: 마지막 질문입니다.

"${session.topic}"을 다른 사람에게 가르친다면, 가장 중요하게 강조하고 싶은 포인트 3가지는 무엇인가요?`
    ];

    if (currentQuizCount >= 3) {
      return `정말 잘 하셨습니다! 🎉 

"${session.topic}"에 대해 충분히 학습하신 것 같네요. 이제 오늘 학습한 내용을 정리해보겠습니다.

학습을 완료하시겠어요?`;
    }

    return responses[Math.min(currentQuizCount, responses.length - 1)];
  };

  const startRecap = () => {
    setIsRecapping(true);
  };

  const completeSession = () => {
    if (!recap.trim()) return;
    
    const updatedSession = {
      ...session,
      messages: messages,
      summary: recap
    };
    
    onSessionComplete(updatedSession, recap);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          돌아가기
        </Button>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800">{session.topic}</h2>
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
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-sm md:max-w-md px-4 py-3 rounded-lg whitespace-pre-wrap ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {message.content}
                  </div>
                  {message.role === 'user' && (
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
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1"
            />
            <Button onClick={sendMessage} disabled={!currentMessage.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {quizCount >= 3 && (
            <div className="text-center pt-4">
              <Button onClick={startRecap} className="bg-green-600 hover:bg-green-700">
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
