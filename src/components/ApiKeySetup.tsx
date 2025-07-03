import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Key,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  ExternalLink,
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

interface ApiKeySetupProps {
  onApiKeySet: (apiKey: string) => void;
  currentApiKey?: string;
  onBack?: () => void;
  completedSessions?: LearningSession[];
  onSessionSelect?: (session: LearningSession) => void;
}

const ApiKeySetup: React.FC<ApiKeySetupProps> = ({
  onApiKeySet,
  currentApiKey,
  onBack,
  completedSessions = [],
  onSessionSelect,
}) => {
  const [apiKey, setApiKey] = useState(currentApiKey || "");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  useEffect(() => {
    if (currentApiKey) {
      setApiKey(currentApiKey);
      setValidationStatus("success");
    }
  }, [currentApiKey]);

  const validateApiKey = async (key: string): Promise<boolean> => {
    if (!key || key.length < 10) {
      return false;
    }

    try {
      const response = await fetch(`/api/gemini/models?key=${key}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      return response.ok;
    } catch (error) {
      console.error("API key validation error:", error);
      return false;
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) return;

    setIsValidating(true);
    setValidationStatus("idle");

    const isValid = await validateApiKey(apiKey.trim());

    if (isValid) {
      setValidationStatus("success");
      onApiKeySet(apiKey.trim());
    } else {
      setValidationStatus("error");
    }

    setIsValidating(false);
  };

  const handleRemoveApiKey = () => {
    setApiKey("");
    setValidationStatus("idle");
    onApiKeySet("");
  };

  const handlePreviewTIL = () => {
    if (completedSessions.length > 0 && onSessionSelect) {
      // React Hooks 관련 TIL을 찾거나 첫 번째 TIL 선택
      const reactHooksTIL = completedSessions.find(
        (session) =>
          session.topic.includes("React") || session.topic.includes("Hook")
      );
      const selectedTIL = reactHooksTIL || completedSessions[0];
      onSessionSelect(selectedTIL);
    }
  };

  return (
    <div>
      {onBack && (
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            돌아가기
          </Button>
        </div>
      )}
      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Key className="w-6 h-6 text-blue-600" />
            대화를 시작하려면 Gemini API 키가 필요해요
          </CardTitle>

          <p className="text-gray-600 mt-2 text-sm">
            AI와 함께 학습하기 위해 Google Gemini API 키를 입력해주세요
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* TIL 미리보기 섹션 */}
          {completedSessions.length > 0 && onSessionSelect && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="text-2xl">🤔</div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 mb-3">
                    <strong>API키를 넣기에 망설이시나요?</strong>
                    <br />
                    TIL 보드가 어떤 내용을 만들어내는지 미리 확인해보세요!
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviewTIL}
                    className="flex items-center gap-2 text-blue-700 hover:text-blue-800 border-blue-300 hover:border-blue-400 bg-white hover:bg-blue-50 shadow-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    예시 TIL 미리보기
                  </Button>
                </div>
              </div>
            </div>
          )}
          <div className="space-y-2">
            <div className="relative">
              <Input
                type={showApiKey ? "text" : "password"}
                placeholder="gemini-api-key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="pr-10"
                disabled={isValidating}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-8 w-8 p-0"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSaveApiKey}
                disabled={!apiKey.trim() || isValidating}
                className="flex-1"
              >
                {isValidating ? "검증 중..." : "저장하기"}
              </Button>
              {validationStatus === "success" && (
                <Button
                  variant="outline"
                  onClick={handleRemoveApiKey}
                  className="text-red-600 hover:text-red-700"
                >
                  제거
                </Button>
              )}
            </div>
          </div>

          {validationStatus === "success" && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                API 키가 성공적으로 설정되었습니다!
              </AlertDescription>
            </Alert>
          )}

          {validationStatus === "error" && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                유효하지 않은 API 키입니다. Google AI Studio에서 발급받은 키를
                확인해주세요.
              </AlertDescription>
            </Alert>
          )}

          <div className="text-sm text-gray-600 space-y-2">
            <p>
              <strong>API 키 획득 방법:</strong>
            </p>
            <ol className="list-decimal list-inside space-y-1 text-xs">
              <li>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Google AI Studio
                </a>
                에 접속
              </li>
              <li>Google 계정으로 로그인</li>
              <li>"Create API key" 버튼 클릭</li>
              <li>생성된 키를 복사하여 위에 입력</li>
            </ol>
            <p className="text-xs text-gray-500">
              ⚠️ API 키는 현재 세션에만 사용되며, 새로고침 시 다시 입력하셔야
              합니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiKeySetup;
