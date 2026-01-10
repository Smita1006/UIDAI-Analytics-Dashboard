"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Send,
  X,
  Minimize2,
  Maximize2,
  Bot,
  User,
  BarChart3,
  Map,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  suggestedActions?: string[];
  relatedCharts?: string[];
}

interface GeminiChatBotProps {
  onHighlightChart?: (chartType: string) => void;
}

export function GeminiChatBot({ onHighlightChart }: GeminiChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      type: "bot",
      content: `🤖 **Hi! I'm your UIDAI Analytics Assistant**

I can help you analyze patterns, trends, and anomalies in the Aadhaar data. Try asking:

• "Which districts showed abnormal biometric spikes last week?"
• "Compare enrollment trends between Maharashtra and UP"
• "Why is Bihar flagged as high-risk today?"
• "What happens if enrollment growth continues at this rate?"

What would you like to know?`,
      timestamp: new Date(),
    },
  ]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: "user",
      content: currentMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setCurrentMessage("");
    setIsLoading(true);

    try {
      // Call Gemini API
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${API_BASE_URL}/api/gemini/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: currentMessage,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const result = await response.json();

      if (result.success) {
        const botMessage: ChatMessage = {
          id: `bot-${Date.now()}`,
          type: "bot",
          content: result.data.response,
          timestamp: new Date(),
          suggestedActions: result.data.suggested_actions || [],
          relatedCharts: result.data.related_charts || [],
        };

        setMessages((prev) => [...prev, botMessage]);

        // If there are related charts, highlight them
        if (result.data.related_charts?.length > 0 && onHighlightChart) {
          onHighlightChart(result.data.related_charts[0]);
        }
      } else {
        throw new Error(result.message || "Failed to get response");
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        type: "bot",
        content:
          "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);

      toast({
        title: "Connection Error",
        description: "Unable to reach the insights service.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickQuestion = (question: string) => {
    setCurrentMessage(question);
    setTimeout(() => handleSendMessage(), 100);
  };

  const formatMessageContent = (content: string) => {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/•/g, "•")
      .split("\n")
      .map((line, i) => (
        <div
          key={i}
          className="mb-1"
          dangerouslySetInnerHTML={{ __html: line }}
        />
      ));
  };

  const quickQuestions = [
    "What are the top anomalies this week?",
    "Show me Bihar's performance trends",
    "Which states need more enrollment centers?",
    "Explain the current risk factors",
  ];

  // Floating chat button
  if (!isOpen) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full h-14 w-14 bg-blue-600 hover:bg-blue-700 shadow-lg"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
        <div className="absolute -top-12 right-0 bg-black text-white text-sm px-3 py-1 rounded-lg whitespace-nowrap">
          Ask UIDAI Data
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.8 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
          height: isMinimized ? "60px" : "600px",
        }}
        exit={{ opacity: 0, y: 100, scale: 0.8 }}
        className={`fixed bottom-6 right-6 z-50 w-96 bg-white rounded-lg shadow-2xl border overflow-hidden transition-all duration-300`}
      >
        {/* Header */}
        <CardHeader className="pb-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5" />
              <span>Ask UIDAI Data</span>
              <Badge variant="secondary" className="text-xs">
                AI Insights
              </Badge>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
              >
                {isMinimized ? (
                  <Maximize2 className="h-4 w-4" />
                ) : (
                  <Minimize2 className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>

        {/* Chat Area */}
        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-[520px]">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-2 ${
                      message.type === "user"
                        ? "flex-row-reverse space-x-reverse"
                        : ""
                    }`}
                  >
                    <div
                      className={`p-2 rounded-full ${
                        message.type === "user"
                          ? "bg-blue-100"
                          : "bg-purple-100"
                      }`}
                    >
                      {message.type === "user" ? (
                        <User className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Bot className="h-4 w-4 text-purple-600" />
                      )}
                    </div>
                    <div
                      className={`max-w-[280px] p-3 rounded-lg ${
                        message.type === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <div className="text-sm">
                        {formatMessageContent(message.content)}
                      </div>
                      <div className="text-xs opacity-70 mt-2">
                        {message.timestamp.toLocaleTimeString()}
                      </div>

                      {/* Suggested Actions */}
                      {message.suggestedActions &&
                        message.suggestedActions.length > 0 && (
                          <div className="mt-3 space-y-1">
                            <div className="text-xs font-medium opacity-80">
                              Suggested Actions:
                            </div>
                            {message.suggestedActions
                              .slice(0, 2)
                              .map((action, i) => (
                                <Button
                                  key={i}
                                  variant="outline"
                                  size="sm"
                                  className="h-auto p-2 text-xs text-left justify-start max-w-full text-wrap whitespace-normal"
                                  onClick={() => handleQuickQuestion(action)}
                                >
                                  <span className="truncate">{action}</span>
                                </Button>
                              ))}
                          </div>
                        )}

                      {/* Related Charts */}
                      {message.relatedCharts &&
                        message.relatedCharts.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {message.relatedCharts.map((chart, i) => (
                              <Button
                                key={i}
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={() => onHighlightChart?.(chart)}
                              >
                                {chart === "geographic-map" && (
                                  <Map className="h-3 w-3 mr-1" />
                                )}
                                {chart === "time-series" && (
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                )}
                                {chart === "overview" && (
                                  <BarChart3 className="h-3 w-3 mr-1" />
                                )}
                                View {chart.replace("-", " ")}
                              </Button>
                            ))}
                          </div>
                        )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-start space-x-2">
                    <div className="p-2 rounded-full bg-purple-100">
                      <Bot className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Analyzing data...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Quick Questions */}
            {messages.length <= 1 && (
              <div className="p-4 bg-gray-50 border-t">
                <div className="text-xs font-medium text-gray-600 mb-2">
                  Quick Questions:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {quickQuestions.map((question, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      className="h-auto p-2 text-xs text-left justify-start"
                      onClick={() => handleQuickQuestion(question)}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <Input
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about UIDAI patterns, trends, anomalies..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!currentMessage.trim() || isLoading}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
