export interface GeminiMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
  }>;
}

export class GeminiAPI {
  private apiKey: string;
  private baseUrl = "https://generativelanguage.googleapis.com/v1beta";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateContent(
    prompt: string,
    conversationHistory: GeminiMessage[] = []
  ): Promise<string> {
    try {
      const messages: GeminiMessage[] = [
        ...conversationHistory,
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ];

      const response = await fetch(
        `${this.baseUrl}/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: messages,
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Response:", response.status, errorText);
        throw new Error(
          `API request failed: ${response.status} - ${errorText}`
        );
      }

      const data: GeminiResponse = await response.json();

      if (!data.candidates || data.candidates.length === 0) {
        console.error("API Response data:", data);
        throw new Error("No response from Gemini API");
      }

      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error("Gemini API error:", error);
      if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        throw new Error("네트워크 연결 실패: API 서버에 연결할 수 없습니다.");
      }
      throw error;
    }
  }

  async generateQuizResponse(
    topic: string,
    userInput: string,
    quizCount: number,
    conversationHistory: Array<{
      role: "user" | "assistant";
      content: string;
    }> = []
  ): Promise<string> {
    const systemPrompt = `당신은 친근하고 교육적인 AI 학습 도우미입니다. "${topic}"에 대해 사용자와 대화하며 퀴즈를 통해 학습을 도와주세요.

역할:
1. 사용자의 답변에 대해 피드백 제공
2. 점진적으로 난이도를 높이는 퀴즈 생성
3. 친근하고 격려하는 톤으로 대화
4. 한국어로 응답

현재 퀴즈 번호: ${quizCount + 1}

다음 중 하나를 수행하세요:
- 퀴즈 1-2번: 기본 개념 확인 (객관식 또는 단답형)
- 퀴즈 3-4번: 응용 문제 (예시 들기, 설명하기)
- 퀴즈 5번 이상: 종합 문제 (비교, 분석, 창의적 사고)

퀴즈가 5개 이상 진행되었으면 학습 완료를 제안하세요.

사용자 답변: "${userInput}"`;

    // 대화 히스토리를 Gemini 형식으로 변환
    const geminiHistory: GeminiMessage[] = conversationHistory.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    return this.generateContent(systemPrompt, geminiHistory);
  }

  async generateWelcomeMessage(topic: string): Promise<string> {
    const prompt = `"${topic}"에 대해 학습하려는 사용자에게 친근한 환영 메시지를 작성해주세요. 
    
다음을 포함해주세요:
1. 친근한 인사
2. 해당 주제에 대한 간단한 소개
3. 학습 방법 안내 (대화를 통한 퀴즈)
4. 시작을 독려하는 메시지

한국어로 작성하고, 이모지를 적절히 사용해 친근한 분위기를 만들어주세요.`;

    return this.generateContent(prompt);
  }

  async generateSummary(
    topic: string,
    messages: Array<{ role: string; content: string }>
  ): Promise<string> {
    const conversationText = messages
      .map((msg) => `${msg.role === "user" ? "사용자" : "AI"}: ${msg.content}`)
      .join("\n");

    const prompt = `다음은 "${topic}"에 대한 학습 대화입니다. 이를 바탕으로 TIL(Today I Learned) 형식의 요약을 작성해주세요.

대화 내용:
${conversationText}

다음 형식으로 요약해주세요:
# ${topic}

## 핵심 개념
- (배운 주요 개념들을 나열)

## 새롭게 알게 된 점
- (특별히 인상깊었던 내용)

## 추가 학습이 필요한 부분
- (더 깊이 공부하면 좋을 내용)

## 한줄 정리
(오늘 학습한 내용을 한 문장으로 요약)

마크다운 형식으로 작성하고, 간결하면서도 핵심적인 내용을 담아주세요.`;

    return this.generateContent(prompt);
  }

  async generateRecapSummary(
    topic: string,
    messages: Array<{ role: string; content: string }>
  ): Promise<string> {
    const conversationText = messages
      .map((msg) => `${msg.role === "user" ? "사용자" : "AI"}: ${msg.content}`)
      .join("\n");

    const prompt = `다음은 "${topic}"에 대한 학습 대화입니다. 사용자가 정리하기 버튼을 눌러서 학습 내용을 정리하려고 합니다.

대화 내용:
${conversationText}

다음 형식으로 요약을 작성하되, 마지막에 사용자에게 수정 의견을 묻는 친근한 메시지를 포함해주세요:

# ${topic}

## 핵심 개념
- (배운 주요 개념들을 나열)

## 새롭게 알게 된 점
- (특별히 인상깊었던 내용)

## 추가 학습이 필요한 부분
- (더 깊이 공부하면 좋을 내용)

## 한줄 정리
(오늘 학습한 내용을 한 문장으로 요약)

---

이런 내용으로 오늘 학습한 내용을 요약했어요! 🎯
고치고 싶은 부분이나 추가하고 싶은 내용이 있다면 언제든 말씀해주세요. 😊

마크다운 형식으로 작성하고, 친근하고 격려하는 톤으로 작성해주세요.`;

    return this.generateContent(prompt);
  }
}

export const getStoredApiKey = (): string | null => {
  return localStorage.getItem("gemini_api_key");
};

export const createGeminiAPI = (apiKey?: string): GeminiAPI | null => {
  const key = apiKey || getStoredApiKey();
  if (!key) return null;
  return new GeminiAPI(key);
};
