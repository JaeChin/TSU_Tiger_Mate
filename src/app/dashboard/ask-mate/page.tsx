"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { MessageCircle, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const suggestedPrompts = [
  "What resources are available for freshmen?",
  "Help me plan my first semester",
  "Where can I get financial aid help?",
  "What events are happening this week?",
] as const;

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function getSimulatedResponse(input: string): string {
  const lower = input.toLowerCase();

  if (lower.includes("financial aid") || lower.includes("fafsa") || lower.includes("scholarship")) {
    return "Great question! The Office of Financial Aid is located in the Bell Building, 2nd Floor. They can help with FAFSA applications, scholarships, grants, and work-study programs. You can reach them at (713) 313-7071 or email financialaid@tsu.edu. Hours are Mon-Fri 8:00 AM - 5:00 PM.\n\nThere's also a FAFSA & Financial Aid Workshop coming up — check the Events page for the latest date and time. Make sure to bring your FSA ID and tax documents!";
  }

  if (lower.includes("freshmen") || lower.includes("freshman") || lower.includes("new student") || lower.includes("first year")) {
    return "Welcome to the TSU family! Here are the top resources for freshmen:\n\n1. **Academic Advising Center** — MLK Building, Suite 105. Get help with course selection and degree planning.\n2. **Tutoring Center** — Library Learning Center, 3rd Floor. Free peer tutoring in math, science, English, and more.\n3. **Counseling Center** — Sterling Student Life Center, Suite 230. Free, confidential mental health services.\n4. **New Tiger Orientation** — Check the Events page for the next orientation session.\n\nDon't hesitate to visit any of these offices — they're here specifically to help you succeed!";
  }

  if (lower.includes("semester") || lower.includes("plan") || lower.includes("schedule") || lower.includes("classes") || lower.includes("course")) {
    return "Here's how to plan a solid first semester at TSU:\n\n1. **Meet with your advisor** at the Academic Advising Center (MLK Building, Suite 105) to map out your required courses.\n2. **Check your degree audit** on the myTSU portal to see what credits you still need.\n3. **Balance your load** — 15 credit hours is standard. Mix harder courses with lighter ones.\n4. **Use the To-Do Manager** right here in Tiger M.A.T.E to track your deadlines and assignments.\n5. **Register early** — priority registration dates are announced each semester. Check the Events page for info sessions.\n\nNeed help with a specific major or department? Just ask!";
  }

  if (lower.includes("event") || lower.includes("happening") || lower.includes("activities") || lower.includes("things to do")) {
    return "There's always something happening on campus! Check the **Events** page in your dashboard for the full list. Here are some highlights:\n\n- **Tiger Fest** — TSU's biggest back-to-school celebration with live music, free food, and giveaways.\n- **Fall Career Fair** — Over 75 employers recruiting TSU students for internships and jobs.\n- **Homecoming Week** — Step show, concert, and more.\n- **Midterm Study Jam** — Free tutoring and study spaces during midterm season.\n\nYou can filter events by category (academic, social, sports, career, health) to find what interests you most.";
  }

  if (lower.includes("tutor") || lower.includes("study") || lower.includes("help with class") || lower.includes("academic support")) {
    return "TSU has excellent academic support! The **Tutoring & Academic Support Center** is on the 3rd Floor of the Library Learning Center. They offer:\n\n- Free peer tutoring in math, science, English, and more\n- Drop-in tutoring and scheduled appointments\n- Study groups for popular courses\n\nHours: Mon-Thu 9:00 AM - 7:00 PM, Fri 9:00 AM - 3:00 PM. Call (713) 313-1843 or email tutoring@tsu.edu.\n\nAlso check out the **Midterm Study Jam** events — free tutoring, snacks, and quiet study spaces during midterm week!";
  }

  if (lower.includes("health") || lower.includes("sick") || lower.includes("doctor") || lower.includes("mental health") || lower.includes("counseling")) {
    return "TSU has you covered for both physical and mental health:\n\n**Student Health Center** — Health & Wellness Building, 3100 Cleburne St. Primary care, immunizations, and pharmacy services. Most services are free or low-cost. Call (713) 313-7173.\n\n**Counseling Center** — Sterling Student Life Center, Suite 230. Free, confidential mental health services including individual counseling, group therapy, and crisis intervention. No insurance needed. Call (713) 313-7804.\n\nBoth are open Mon-Fri 8:00 AM - 5:00 PM. For emergencies, call TSU Police at (713) 313-7000 (available 24/7).";
  }

  if (lower.includes("housing") || lower.includes("dorm") || lower.includes("roommate") || lower.includes("apartment")) {
    return "The **Office of Residential Life & Housing** handles everything housing-related. They're located at University Courtyard Apartments, Leasing Office. Contact them at (713) 313-4968 or housing@tsu.edu.\n\nThey can help with:\n- On-campus housing applications\n- Room assignments and roommate requests\n- Maintenance requests\n- Residence life programming\n\nHours: Mon-Fri 8:00 AM - 5:00 PM. Apply early — on-campus housing fills up fast!";
  }

  if (lower.includes("career") || lower.includes("job") || lower.includes("internship") || lower.includes("resume")) {
    return "The **Career Services Center** is your go-to for professional development! Located in MLK Building, Room 108. Contact: (713) 313-7225 or careers@tsu.edu.\n\nThey offer:\n- Resume reviews and building\n- Mock interviews\n- Internship and job postings\n- Career fairs (the Fall Career Fair has 75+ employers!)\n- LinkedIn profile optimization workshops\n\nCheck the Events page for upcoming career workshops and the Fall Career Fair date. Start building your career from day one — it's never too early!";
  }

  if (lower.includes("food") || lower.includes("hungry") || lower.includes("eat") || lower.includes("meal") || lower.includes("dining")) {
    return "No Tiger goes hungry! Here's what's available:\n\n**Tiger Food Pantry** — Sterling Student Life Center, Room 139. Free groceries and meal assistance. Confidential — just bring your TSU ID. Open Mon, Wed, Fri 10:00 AM - 2:00 PM. Call (713) 313-4968.\n\nThe campus also has various dining options in the Sterling Student Life Center and surrounding area. Your meal plan (if you have one) can be managed through the myTSU portal.";
  }

  if (lower.includes("safety") || lower.includes("police") || lower.includes("emergency") || lower.includes("security")) {
    return "**TSU Police Department** is available 24/7 for your safety. They're located at the Public Safety Building, 3200 Cleburne St.\n\n- **Emergency:** Call (713) 313-7000\n- **Email:** police@tsu.edu\n\nServices include:\n- Emergency response\n- Campus escorts (great for late-night walks)\n- Lost property\n- Incident reports\n\n**Save this number in your phone right now:** (713) 313-7000. It's the most important number for any TSU student to have.";
  }

  if (lower.includes("tech") || lower.includes("wifi") || lower.includes("password") || lower.includes("blackboard") || lower.includes("computer")) {
    return "The **IT Help Desk** can solve your tech issues! Located on the 1st Floor of the Library Learning Center.\n\n- **Phone:** (713) 313-4357\n- **Email:** helpdesk@tsu.edu\n- **Hours:** Mon-Fri 8:00 AM - 6:00 PM, Sat 10:00 AM - 2:00 PM\n\nThey help with:\n- TSU email setup\n- Wi-Fi connectivity\n- myTSU portal issues\n- Blackboard access\n- Password resets\n- Campus computer labs\n\nFor password issues, try the self-service reset on the myTSU portal first — it's usually the fastest fix!";
  }

  // Generic fallback
  return "That's a great question! While I'm still learning about that specific topic, here are some resources that might help:\n\n- **Academic Advising** — MLK Building, Suite 105, (713) 313-7981\n- **Student Health Center** — (713) 313-7173\n- **Career Services** — MLK Building, Room 108, (713) 313-7225\n- **IT Help Desk** — (713) 313-4357\n\nYou can also browse the **Resources** page in your dashboard for a complete directory of campus offices and services. Is there something more specific I can help you with?";
}

export default function AskMatePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

    // Simulate response delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const response = getSimulatedResponse(content);
    const assistantMessage: Message = {
      id: generateId(),
      role: "assistant",
      content: response,
    };

    setMessages((prev) => [...prev, assistantMessage]);
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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-100">
            <MessageCircle
              className="h-5 w-5 text-gold-700"
              aria-hidden="true"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-maroon-950 sm:text-3xl">
              Ask M.A.T.E
            </h1>
            <p className="text-sm text-surface-600">
              Your AI campus assistant
            </p>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto rounded-2xl border border-surface-200 bg-white p-4"
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
      >
        {isEmpty && !isTyping ? (
          /* Welcome + Suggested Prompts */
          <div className="flex h-full flex-col items-center justify-center text-center px-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gold-100">
              <MessageCircle
                className="h-8 w-8 text-gold-700"
                aria-hidden="true"
              />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-surface-900">
              Hi, Tiger! How can I help?
            </h2>
            <p className="mt-1 text-sm text-surface-500 max-w-sm">
              Ask me anything about TSU campus life, classes, resources, or events.
            </p>

            <div className="mt-6 grid gap-2 sm:grid-cols-2 w-full max-w-lg">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleSuggestion(prompt)}
                  className="rounded-xl border border-surface-200 bg-surface-50 px-4 py-3 text-left text-sm text-surface-700 transition-colors hover:bg-surface-100 hover:border-surface-300"
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
                <div
                  className={cn(
                    "max-w-[85%] sm:max-w-[75%]",
                    msg.role === "user" ? "order-1" : "order-1"
                  )}
                >
                  {msg.role === "assistant" && (
                    <span className="mb-1 block text-xs font-medium text-gold-700">
                      M.A.T.E
                    </span>
                  )}
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
                      msg.role === "user"
                        ? "bg-maroon-900 text-white rounded-br-md"
                        : "bg-surface-100 text-surface-900 rounded-bl-md"
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
                  <span className="mb-1 block text-xs font-medium text-gold-700">
                    M.A.T.E
                  </span>
                  <div className="inline-flex items-center gap-1 rounded-2xl rounded-bl-md bg-surface-100 px-4 py-3">
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
      <form
        onSubmit={handleSubmit}
        className="mt-3 flex items-center gap-2"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about campus life, classes, resources..."
          disabled={isTyping}
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
  // Simple markdown-like rendering for bold text and line breaks
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
