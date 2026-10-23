import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Send, Loader2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useState, useRef, useEffect } from "react";
import { useAssistant } from "@/hooks/useAssistant";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { cn } from "@/lib/utils";

export default function RightPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentWorkspace } = useWorkspace();
  const workspaceId = currentWorkspace?._id ?? "";
  const { messages, sendMessage, isThinking, error } = useAssistant(workspaceId);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;
    sendMessage(input.trim());
    setInput("");
  };

  const handleCopy = async (content: string, index: number) => {
    await navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!workspaceId) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-4 bottom-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all"
      >
        <Sparkles className="h-5 w-5" />
      </motion.button>
    );
  }

  return (
    <>
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-4 bottom-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all"
      >
        <Sparkles className="h-5 w-5" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 z-40 h-full w-80 border-l bg-card shadow-xl flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">AI Assistant</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <ScrollArea className="flex-1 p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
                  <Sparkles className="h-8 w-8 mb-3 opacity-50" />
                  <p className="text-sm">Ask about your research workspace</p>
                  <p className="text-xs mt-1">Try: "Summarize the key findings" or "What are the research gaps?"</p>
                </div>
              ) : (
                <>
                  {messages.map((msg, i) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.05 }}
                      className={cn(
                        "flex gap-3 max-w-full",
                        msg.role === "user" ? "flex-row-reverse" : ""
                      )}
                    >
                      <div
                        className={cn(
                          "flex-1 min-w-0 p-3 rounded-2xl",
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground rounded-tr-none"
                            : "bg-muted rounded-tl-none"
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        {msg.role === "assistant" && msg.citations?.length && (
                          <details className="mt-2">
                            <summary className="text-xs text-muted-foreground cursor-pointer">
                              Citations ({msg.citations.length})
                            </summary>
                            <ul className="mt-1 text-xs text-muted-foreground space-y-1">
                              {msg.citations.map((c: string, ci: number) => (
                                <li key={ci}>• {c}</li>
                              ))}
                            </ul>
                          </details>
                        )}
                        {msg.confidence && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                            <span>Confidence: {Math.round(msg.confidence * 100)}%</span>
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="mt-1 h-6 w-6 opacity-0 group-hover:opacity-100"
                          onClick={() => handleCopy(msg.content, i)}
                          aria-label="Copy message"
                        >
                          {copiedIndex === i ? (
                            <Check className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
              {isThinking && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <div className="flex-1 min-w-0 p-3 rounded-2xl bg-muted rounded-tl-none">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Assistant is thinking…</span>
                    </div>
                  </div>
                </motion.div>
              )}
              {error && (
                <div className="text-center text-sm text-destructive p-2">
                  Error: {error.message}
                </div>
              )}
            </ScrollArea>
            
            <Separator />
            <form onSubmit={handleSubmit} className="p-4 space-y-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about papers, methods, gaps…"
                className="h-20 resize-none"
                disabled={isThinking}
              />
              <Button type="submit" disabled={!input.trim() || isThinking} className="w-full">
                {isThinking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Thinking…
                  </>
                ) : (
                  <>
                    Send <Send className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}