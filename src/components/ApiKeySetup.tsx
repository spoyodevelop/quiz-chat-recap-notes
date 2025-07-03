import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Key, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";

interface ApiKeySetupProps {
  onApiKeySet: (apiKey: string) => void;
  currentApiKey?: string;
}

const ApiKeySetup: React.FC<ApiKeySetupProps> = ({
  onApiKeySet,
  currentApiKey,
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

  return (
    <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Key className="w-6 h-6 text-blue-600" />
          대화를 시작하려면 Gemini API 키가 필요해요
        </CardTitle>
        <p className="text-gray-600 mt-2">
          AI와 함께 학습하기 위해 Google Gemini API 키를 입력해주세요
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
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
  );
};

export default ApiKeySetup;
