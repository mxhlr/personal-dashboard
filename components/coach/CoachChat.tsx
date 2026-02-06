"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { logger } from "@/lib/logger";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Loader2 } from "lucide-react";

export function CoachChat() {
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
      logger.error("Failed to send message:", error);
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

  if (messages === undefined || userContext === undefined) {
    return (
      <div
        className="flex items-center justify-center h-[600px] relative overflow-hidden rounded-2xl"
        style={{
          background: 'radial-gradient(ellipse at center, var(--daily-log-bg-start) 0%, var(--daily-log-bg-end) 100%)'
        }}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 dark:border-[#FF9800] border-[#F57C00]"></div>
      </div>
    );
  }

  if (!userContext) {
    return (
      <div
        className="flex items-center justify-center h-[600px] relative overflow-hidden rounded-2xl"
        style={{
          background: 'radial-gradient(ellipse at center, var(--daily-log-bg-start) 0%, var(--daily-log-bg-end) 100%)'
        }}
      >
        <p className="dark:text-[#888888] text-[#666666]">
          Bitte vervollständige dein Profil, um den Coach zu nutzen.
        </p>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-[700px] relative overflow-hidden rounded-2xl"
      style={{
        background: 'radial-gradient(ellipse at center, var(--daily-log-bg-start) 0%, var(--daily-log-bg-end) 100%)'
      }}
    >
      {/* Subtle grid overlay for HUD effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 152, 0, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 152, 0, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Animated scanline effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          background: 'linear-gradient(transparent 40%, rgba(255, 152, 0, 0.2) 50%, transparent 60%)',
          backgroundSize: '100% 4px',
          animation: 'scanline 8s linear infinite'
        }}
      />

      {/* Header */}
      <div className="relative p-4 dark:border-b border-b dark:border-[rgba(255,152,0,0.15)] border-[rgba(255,152,0,0.2)]">
        <div className="flex items-center gap-3">
          <Avatar className="dark:border-[rgba(255,152,0,0.3)] border-[rgba(255,152,0,0.2)] border-2">
            <AvatarFallback className="dark:bg-gradient-to-br dark:from-[#FF9800] dark:to-[#F57C00] bg-gradient-to-br from-[#F57C00] to-[#E65100] text-white text-lg">
              🤖
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-bold font-orbitron dark:text-[#FF9800] text-[#F57C00]">PERSONAL COACH</h3>
            <p className="text-xs dark:text-[#888888] text-[#666666] uppercase tracking-wider">
              Ton: {userContext.profile.coachTone}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4 relative" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="dark:text-[#FF9800] text-[#F57C00] font-orbitron text-lg mb-4">
                👋 Hey {userContext.profile.name}!
              </p>
              <p className="text-sm dark:text-[#888888] text-[#666666] max-w-md mx-auto">
                Ich bin dein Personal Coach. Frag mich was du willst - über deine
                Ziele, deine Fortschritte, oder lass uns einfach über deinen Tag
                sprechen.
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message._id}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <Avatar className="h-8 w-8 dark:border-[rgba(255,152,0,0.3)] border-[rgba(255,152,0,0.2)] border-2 flex-shrink-0">
                    <AvatarFallback className="dark:bg-gradient-to-br dark:from-[#FF9800] dark:to-[#F57C00] bg-gradient-to-br from-[#F57C00] to-[#E65100] text-white text-xs">
                      🤖
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[70%] rounded-2xl p-4 shadow-sm transition-all duration-200 ${
                    message.role === "user"
                      ? "dark:bg-gradient-to-br dark:from-[#00E5FF] dark:to-[#00B8D4] bg-gradient-to-br from-[#0077B6] to-[#005F8F] text-white dark:border-[rgba(0,229,255,0.3)] border-[rgba(0,119,182,0.3)] border dark:shadow-[0_0_10px_rgba(0,229,255,0.2)] shadow-[0_4px_8px_rgba(0,119,182,0.2)]"
                      : "dark:bg-card/50 bg-white/80 dark:border-[rgba(255,152,0,0.15)] border-[rgba(255,152,0,0.2)] border dark:text-[#E0E0E0] text-[#1A1A1A]"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </p>
                  <p className={`text-xs mt-2 ${
                    message.role === "user"
                      ? "text-white/70"
                      : "dark:text-[#888888] text-[#666666]"
                  }`}>
                    {new Date(message.timestamp).toLocaleTimeString("de-DE", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {message.role === "user" && (
                  <Avatar className="h-8 w-8 dark:border-[rgba(0,229,255,0.3)] border-[rgba(0,119,182,0.3)] border-2 flex-shrink-0">
                    <AvatarFallback className="dark:bg-gradient-to-br dark:from-[#00E5FF] dark:to-[#00B8D4] bg-gradient-to-br from-[#0077B6] to-[#005F8F] text-white text-xs font-bold">
                      {userContext.profile.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8 dark:border-[rgba(255,152,0,0.3)] border-[rgba(255,152,0,0.2)] border-2 flex-shrink-0">
                <AvatarFallback className="dark:bg-gradient-to-br dark:from-[#FF9800] dark:to-[#F57C00] bg-gradient-to-br from-[#F57C00] to-[#E65100] text-white text-xs">
                  🤖
                </AvatarFallback>
              </Avatar>
              <div className="dark:bg-card/50 bg-white/80 dark:border-[rgba(255,152,0,0.15)] border-[rgba(255,152,0,0.2)] border rounded-2xl p-4">
                <Loader2 className="h-4 w-4 animate-spin dark:text-[#FF9800] text-[#F57C00]" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="relative p-4 dark:border-t border-t dark:border-[rgba(255,152,0,0.15)] border-[rgba(255,152,0,0.2)]">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Schreib eine Nachricht... (Enter zum Senden)"
            className="min-h-[60px] resize-none dark:bg-card/50 bg-white/80 dark:border-[rgba(255,152,0,0.15)] border-[rgba(255,152,0,0.2)] dark:text-[#E0E0E0] text-[#1A1A1A] dark:placeholder:text-[#666666] placeholder:text-[#999999] dark:focus:border-[rgba(255,152,0,0.4)] focus:border-[rgba(255,152,0,0.5)] focus:ring-1 dark:focus:ring-[rgba(255,152,0,0.3)] focus:ring-[rgba(255,152,0,0.4)] transition-all duration-200"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-[60px] w-[60px] dark:bg-gradient-to-r dark:from-[#FF9800] dark:to-[#F57C00] bg-gradient-to-r from-[#F57C00] to-[#E65100] text-white font-bold font-orbitron dark:border-[#FF9800]/30 border-[#F57C00]/30 dark:shadow-[0_0_15px_rgba(255,152,0,0.3)] shadow-[0_4px_12px_rgba(245,124,0,0.3)] dark:hover:shadow-[0_0_25px_rgba(255,152,0,0.5)] hover:shadow-[0_6px_20px_rgba(245,124,0,0.5)] hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
        <p className="text-xs dark:text-[#888888] text-[#666666] mt-2">
          Shift + Enter für Zeilenumbruch
        </p>
      </div>
    </div>
  );
}
