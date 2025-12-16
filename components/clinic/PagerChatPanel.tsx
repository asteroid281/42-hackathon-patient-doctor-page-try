"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  text: string;
  from: "doctor" | "patient";
  timestamp: string;
  isRead?: boolean;
}

interface PagerChatPanelProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  appointmentInfo?: {
    doctorName: string;
    patientName: string;
    time: string;
  };
  isOnline?: boolean;
  showUnreadBadge?: number;
}

/**
 * PagerChatPanel Component
 * Sticky chat window for real-time communication
 * Features:
 * - Fixed positioning at bottom-right
 * - Accessibility: keyboard navigation, ARIA labels
 * - Unread message indicator
 * - Read status indicators
 * - Mobile responsive
 */
export const PagerChatPanel = React.forwardRef<HTMLDivElement, PagerChatPanelProps>(
  (
    {
      isOpen,
      onOpenChange,
      messages,
      onSendMessage,
      appointmentInfo,
      isOnline = true,
      showUnreadBadge = 0,
    },
    ref
  ) => {
    const [inputValue, setInputValue] = React.useState("");
    const messagesEndRef = React.useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    React.useEffect(() => {
      if (isOpen) {
        scrollToBottom();
      }
    }, [messages, isOpen]);

    const handleSend = () => {
      if (inputValue.trim()) {
        onSendMessage(inputValue.trim());
        setInputValue("");
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    };

    if (!isOpen) {
      return (
        <div
          ref={ref}
          className="fixed bottom-4 right-4 z-40 sm:bottom-6 sm:right-6"
        >
          <Button
            onClick={() => onOpenChange(true)}
            className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-shadow"
            aria-label={`Chat aç${showUnreadBadge > 0 ? ` (${showUnreadBadge} okunmamış mesaj)` : ""}`}
            aria-expanded="false"
          >
            <span className="text-xl">💬</span>
            {showUnreadBadge > 0 && (
              <Badge
                className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0"
                variant="destructive"
              >
                {showUnreadBadge > 9 ? "9+" : showUnreadBadge}
              </Badge>
            )}
          </Button>
        </div>
      );
    }

    return (
      <section
        ref={ref}
        className="fixed bottom-4 right-4 z-50 w-full max-w-sm sm:bottom-6 sm:right-6 sm:w-96"
        aria-label="Doktor-hasta iletişim paneli"
      >
        <Card className="flex h-96 flex-col shadow-2xl">
          {/* Header */}
          <CardHeader className="border-b p-3 sm:p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-sm sm:text-base truncate">
                  {appointmentInfo?.doctorName || "Doktor"}
                </CardTitle>
                <CardDescription className="text-xs flex items-center gap-1 mt-1">
                  <span
                    className={cn(
                      "inline-block h-2 w-2 rounded-full",
                      isOnline ? "bg-green-500" : "bg-gray-400"
                    )}
                    aria-hidden="true"
                  />
                  {isOnline ? "Aktif" : "Aktif değil"}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                aria-label="Sohbeti kapat"
                className="h-8 w-8 p-0"
              >
                ✕
              </Button>
            </div>
          </CardHeader>

          {/* Messages */}
          <CardContent className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center">
                <p className="text-sm text-muted-foreground">
                  Henüz mesaj yok. Doktor sohbete başlayacak.
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <article
                  key={msg.id}
                  className={cn(
                    "flex gap-2",
                    msg.from === "doctor" ? "justify-start" : "justify-end"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-xs rounded-lg p-2 text-sm",
                      msg.from === "doctor"
                        ? "bg-muted text-muted-foreground"
                        : "bg-primary text-primary-foreground"
                    )}
                  >
                    <p>{msg.text}</p>
                    <p
                      className={cn(
                        "mt-1 text-xs",
                        msg.from === "doctor"
                          ? "text-muted-foreground"
                          : "text-primary-foreground/70"
                      )}
                    >
                      {msg.timestamp}
                      {msg.from === "patient" && msg.isRead && (
                        <span aria-label="okundu" title="Doktor tarafından okundu">
                          {" "}
                          ✓✓
                        </span>
                      )}
                    </p>
                  </div>
                </article>
              ))
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Input */}
          <div className="border-t p-3 sm:p-4 space-y-2">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Mesaj yazınız..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                aria-label="Mesaj giriş alanı"
                disabled={!isOnline}
                className="text-sm"
              />
              <Button
                size="sm"
                onClick={handleSend}
                disabled={!inputValue.trim() || !isOnline}
                aria-label="Mesajı gönder"
                className="px-3"
              >
                Gönder
              </Button>
            </div>
            {!isOnline && (
              <p className="text-xs text-amber-600 dark:text-amber-500">
                ⚠️ Doktor çevrimdışı. Mesaj alınmayabilir.
              </p>
            )}
          </div>
        </Card>
      </section>
    );
  }
);

PagerChatPanel.displayName = "PagerChatPanel";
