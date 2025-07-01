
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Clock, BookOpen } from 'lucide-react';

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

interface TILBoardProps {
  sessions: LearningSession[];
  onStartNew: () => void;
}

const TILBoard: React.FC<TILBoardProps> = ({ sessions, onStartNew }) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getTopicColor = (index: number) => {
    const colors = [
      'from-blue-400 to-blue-600',
      'from-green-400 to-green-600', 
      'from-purple-400 to-purple-600',
      'from-pink-400 to-pink-600',
      'from-yellow-400 to-yellow-600',
      'from-indigo-400 to-indigo-600',
      'from-red-400 to-red-600',
      'from-teal-400 to-teal-600'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">나의 TIL 보드</h2>
          <p className="text-gray-600">학습한 내용들을 한눈에 확인해보세요</p>
        </div>
        <Button onClick={onStartNew} className="bg-gradient-to-r from-blue-600 to-green-600">
          <Plus className="w-4 h-4 mr-2" />
          새로운 학습 시작
        </Button>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-500 mb-2">
            아직 학습한 내용이 없습니다
          </h3>
          <p className="text-gray-400 mb-6">
            첫 번째 TIL을 만들어보세요!
          </p>
          <Button onClick={onStartNew} variant="outline">
            학습 시작하기
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session, index) => (
            <Card 
              key={session.id} 
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 overflow-hidden"
            >
              <div className={`h-2 bg-gradient-to-r ${getTopicColor(index)}`} />
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg font-bold text-gray-800 leading-tight">
                    {session.topic}
                  </CardTitle>
                  <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                    완료
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(session.startTime)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {session.startTime.toLocaleTimeString('ko-KR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-gray-600 leading-relaxed line-clamp-4">
                    {session.summary || '학습 요약이 없습니다.'}
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t">
                    <span>퀴즈 {session.messages.filter(m => m.role === 'user').length}개 완료</span>
                    <span>{session.messages.length}개 메시지</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {sessions.length > 0 && (
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              총 {sessions.length}개의 주제를 학습했습니다! 🎉
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TILBoard;
