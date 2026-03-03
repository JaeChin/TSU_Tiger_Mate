"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { MessageCircle, Send, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface StudentProfile {
  preferred_name: string;
  major: string;
  classification: string;
  college: string;
  interests: string[];
  career_goals: string[];
  involvement: string[];
}

const suggestedPrompts = [
  "What events match my interests?",
  "Help me plan my semester",
  "Where do I find tutoring for my major?",
  "What career resources are available?",
  "Tell me about student organizations",
  "How do I get involved on campus?",
] as const;

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export default function AskMatePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch profile on mount
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("profiles")
        .select(
          "preferred_name, major, classification, college, interests, career_goals, campus_involvement"
        )
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setProfile({
              preferred_name: data.preferred_name || "",
              major: data.major || "",
              classification: data.classification || "",
              college: data.college || "",
              interests: data.interests || [],
              career_goals: data.career_goals || [],
              involvement: data.campus_involvement || [],
            });
          }
        });
    });
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  async function sendMessage(content: string) {
    if (!content.trim() || isTyping) return;

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: content.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Build history for API (last 20 messages, mapped to user/model roles)
    const allMessages = [...messages, userMessage];
    const history = allMessages.slice(-20).map((msg) => ({
      role: msg.role === "user" ? ("user" as const) : ("model" as const),
      content: msg.content,
    }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content.trim(),
          history: history.slice(0, -1), // Don't include the current message in history
          profile: profile || {
            preferred_name: "",
            major: "",
            classification: "",
            college: "",
            interests: [],
            career_goals: [],
            involvement: [],
          },
        }),
      });

      const data = await res.json();

      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content:
          data.reply ||
          data.error ||
          "Sorry, I couldn't process that. Please try again.",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const errorMessage: Message = {
        id: generateId(),
        role: "assistant",
        content:
          "Sorry, I'm having trouble connecting right now. Please check your internet and try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    }

    setIsTyping(false);
    inputRef.current?.focus();
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    sendMessage(input);
  }

  function handleSuggestion(prompt: string) {
    sendMessage(prompt);
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col lg:h-[calc(100vh-5rem)]">
      {/* Header */}
      <header className="shrink-0 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-100 dark:bg-gold-900/30">
            <MessageCircle
              className="h-5 w-5 text-gold-700 dark:text-gold-400"
              aria-hidden="true"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-maroon-950 dark:text-[#F5F5F5] sm:text-3xl">
              Ask M.A.T.E
            </h1>
            <p className="text-sm text-surface-600 dark:text-[#A0A0A0]">
              Your AI campus assistant
            </p>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto rounded-2xl border border-surface-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A] p-4"
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
      >
        {isEmpty && !isTyping ? (
          /* Welcome + Suggested Prompts */
          <div className="flex h-full flex-col items-center justify-center text-center px-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gold-100 dark:bg-gold-900/30">
              <MessageCircle
                className="h-8 w-8 text-gold-700 dark:text-gold-400"
                aria-hidden="true"
              />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-surface-900 dark:text-[#F5F5F5]">
              Hi{profile?.preferred_name ? `, ${profile.preferred_name}` : ""}!
              How can I help?
            </h2>
            <p className="mt-1 text-sm text-surface-500 dark:text-[#A0A0A0] max-w-sm">
              Ask me anything about TSU campus life, classes, resources, or
              events.
            </p>

            <div className="mt-6 grid gap-2 sm:grid-cols-2 w-full max-w-lg">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleSuggestion(prompt)}
                  className="rounded-xl border border-surface-200 dark:border-[#2A2A2A] bg-surface-50 dark:bg-[#252525] px-4 py-3 text-left text-sm text-surface-700 dark:text-[#A0A0A0] transition-colors hover:bg-surface-100 dark:hover:bg-[#2A2A2A] hover:border-surface-300 dark:hover:border-surface-600"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Message List */
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div className="max-w-[85%] sm:max-w-[75%]">
                  {msg.role === "assistant" && (
                    <span className="mb-1 block text-xs font-medium text-gold-700 dark:text-gold-400">
                      M.A.T.E
                    </span>
                  )}
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
                      msg.role === "user"
                        ? "bg-maroon-900 text-white rounded-br-md"
                        : "bg-surface-100 dark:bg-[#252525] text-surface-900 dark:text-[#F5F5F5] rounded-bl-md"
                    )}
                  >
                    {msg.role === "assistant" ? (
                      <FormattedResponse content={msg.content} />
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div>
                  <span className="mb-1 block text-xs font-medium text-gold-700 dark:text-gold-400">
                    M.A.T.E
                  </span>
                  <div className="inline-flex items-center gap-1 rounded-2xl rounded-bl-md bg-surface-100 dark:bg-[#252525] px-4 py-3">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-surface-400 [animation-delay:0ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-surface-400 [animation-delay:150ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-surface-400 [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="mt-3 flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about campus life, classes, resources..."
          disabled={isTyping}
          maxLength={1000}
          className="input-field flex-1"
          aria-label="Type your message"
        />
        <button
          type="submit"
          disabled={isTyping || !input.trim()}
          className="btn-primary shrink-0 px-4 py-3 disabled:opacity-60 disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          {isTyping ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          ) : (
            <Send className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </form>
    </div>
  );
}

function FormattedResponse({ content }: { content: string }) {
  // Render bold text (**text**) and preserve line breaks
  const parts = content.split(/(\*\*[^*]+\*\*)/g);

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
