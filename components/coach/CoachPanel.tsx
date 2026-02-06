"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Loader2, X, MessageCircle } from "lucide-react";

interface CoachPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CoachPanel({ isOpen, onClose }: CoachPanelProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const messages = useQuery(api.coachMessages.getMessages);
  const sendMessage = useAction(api.coachMessages.sendMessage);
  const userContext = useQuery(api.coachMessages.getUserContext);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    try {
      await sendMessage({ userMessage });
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Fehler beim Senden der Nachricht. Bitte versuche es erneut.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Slide-in Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full md:w-[500px] z-50
          transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          flex flex-col
          dark:bg-[#0A0A0A] bg-[#FAFAFA]
          border-l dark:border-[rgba(255,152,0,0.2)] border-[rgba(245,124,0,0.3)]
          shadow-2xl`}
        style={{
          background: 'radial-gradient(ellipse at top right, rgba(255, 152, 0, 0.08) 0%, rgba(26, 26, 26, 1) 50%)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-[rgba(255,152,0,0.15)] border-[rgba(245,124,0,0.2)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full dark:bg-[rgba(255,152,0,0.15)] bg-[rgba(245,124,0,0.15)]
              flex items-center justify-center">
              <MessageCircle className="w-5 h-5 dark:text-[#FF9800] text-[#F57C00]" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-orbitron dark:text-[#FF9800] text-[#F57C00]">
                AI COACH
              </h2>
              <p className="text-xs dark:text-[#888888] text-[#666666]"
                style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                {userContext?.profile?.coachTone || "Personalized"} Mode
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="dark:text-[#888888] text-[#666666] dark:hover:text-[#FF9800] hover:text-[#F57C00]
              dark:hover:bg-white/5 hover:bg-black/5"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Messages Area */}
        {messages === undefined || userContext === undefined ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 dark:border-[#FF9800] border-[#F57C00]"></div>
          </div>
        ) : !userContext ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <p className="dark:text-[#888888] text-[#666666] text-center"
              style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
              Bitte vervollständige dein Profil, um den Coach zu nutzen.
            </p>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-4"
              style={{ scrollbarWidth: 'thin' }}
            >
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full
                    dark:bg-[rgba(255,152,0,0.1)] bg-[rgba(245,124,0,0.1)]
                    flex items-center justify-center">
                    <MessageCircle className="w-8 h-8 dark:text-[#FF9800] text-[#F57C00]" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 dark:text-[#E0E0E0] text-[#1A1A1A]"
                    style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                    Start a conversation
                  </h3>
                  <p className="text-sm dark:text-[#888888] text-[#666666]"
                    style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                    Ask me anything about your goals, habits, or progress.
                  </p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "assistant" && (
                      <Avatar className="w-8 h-8 mt-1 flex-shrink-0">
                        <AvatarFallback className="dark:bg-[rgba(255,152,0,0.2)] bg-[rgba(245,124,0,0.2)]
                          dark:text-[#FF9800] text-[#F57C00] text-xs font-bold">
                          AI
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                        msg.role === "user"
                          ? "dark:bg-[rgba(255,152,0,0.15)] bg-[rgba(245,124,0,0.15)] dark:text-[#E0E0E0] text-[#1A1A1A]"
                          : "dark:bg-white/[0.05] bg-black/[0.05] dark:text-[#E0E0E0] text-[#1A1A1A]"
                      }`}
                    >
                      <p
                        className="text-sm leading-relaxed whitespace-pre-wrap"
                        style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
                      >
                        {msg.content}
                      </p>
                    </div>
                    {msg.role === "user" && (
                      <Avatar className="w-8 h-8 mt-1 flex-shrink-0">
                        <AvatarFallback className="dark:bg-white/[0.1] bg-black/[0.1]
                          dark:text-[#E0E0E0] text-[#1A1A1A] text-xs font-bold">
                          {userContext?.profile?.name?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <Avatar className="w-8 h-8 mt-1 flex-shrink-0">
                    <AvatarFallback className="dark:bg-[rgba(255,152,0,0.2)] bg-[rgba(245,124,0,0.2)]
                      dark:text-[#FF9800] text-[#F57C00] text-xs font-bold">
                      AI
                    </AvatarFallback>
                  </Avatar>
                  <div className="dark:bg-white/[0.05] bg-black/[0.05] px-4 py-3 rounded-2xl">
                    <Loader2 className="w-4 h-4 animate-spin dark:text-[#888888] text-[#666666]" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-6 border-t dark:border-[rgba(255,152,0,0.15)] border-[rgba(245,124,0,0.2)]">
              <div className="flex gap-3">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask your coach..."
                  disabled={isLoading}
                  className="flex-1 min-h-[60px] max-h-[120px] resize-none
                    dark:bg-white/[0.03] bg-black/[0.02]
                    dark:border-[rgba(255,152,0,0.2)] border-[rgba(245,124,0,0.25)]
                    dark:text-[#E0E0E0] text-[#1A1A1A]
                    placeholder:dark:text-[#888888]/50 placeholder:text-[#666666]/50
                    focus:dark:border-[#FF9800] focus:border-[#F57C00]
                    focus:ring-2 focus:dark:ring-[#FF9800]/20 focus:ring-[#F57C00]/20"
                  style={{ fontFamily: '"Courier New", "Monaco", monospace', fontSize: '14px' }}
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="self-end px-6 dark:bg-[#FF9800] bg-[#F57C00]
                    dark:text-black text-white
                    dark:hover:bg-[#F57C00] hover:bg-[#E64A19]
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-200"
                  style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
