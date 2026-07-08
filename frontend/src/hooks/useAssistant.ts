import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiPost } from "@/lib/api";
import type { ChatMessage } from "@/types";

export function useAssistant(workspaceId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const chatMutation = useMutation({
    mutationFn: (message: string) =>
      apiPost<{ reply: ChatMessage }>("/assistant/chat", {
        workspace_id: workspaceId,
        message,
        history: messages,
      }),
    onSuccess: (data) => {
      setMessages((prev) => [...prev, data.data.reply]);
    },
  });

  const sendMessage = useCallback(
    (content: string) => {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);
      chatMutation.mutate(content);
    },
    [chatMutation]
  );

  return {
    messages,
    sendMessage,
    isThinking: chatMutation.isPending,
    error: chatMutation.error,
  };
}
