import { UserProfile, Message, ContextPayload } from "../types";

export const sendMessageToAI = async (
  currentMessage: string,
  profile: UserProfile,
  history: Message[],
  context?: ContextPayload
): Promise<string> => {
  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: currentMessage,
        profile,
        history,
        context,
      }),
    });

    if (!response.ok) {
      console.error('AI proxy error:', response.status, await response.text());
      return "Tizimda vaqtincha nosozlik yuz berdi. Iltimos, keyinroq urinib ko'ring.";
    }

    const data = (await response.json()) as { text?: string; error?: string };
    if (data.text && data.text.trim()) return data.text;
    if (data.error) console.error('AI proxy response error:', data.error);

    return "Javob olinmadi. Iltimos, savolni soddaroq qilib yozing yoki aniqroq hujjat/qaror raqamini kiriting.";

  } catch (error) {
    console.error("AI Service Error:", error);
    return "Tizimda vaqtincha nosozlik yuz berdi. Iltimos, keyinroq urinib ko'ring.";
  }
};
