import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";

/* ============================================================
   Rate Limiter (in-memory, per user)
   ============================================================ */

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

/* ============================================================
   System Prompt Builder
   ============================================================ */

interface StudentProfile {
  preferred_name: string;
  major: string;
  classification: string;
  college: string;
  interests: string[];
  career_goals: string[];
  involvement: string[];
}

function buildSystemPrompt(profile: StudentProfile): string {
  return `You are M.A.T.E (My Academic Transition Experience), the official AI assistant for TigerMate at Texas Southern University.

## Your Identity
- You are friendly, supportive, and knowledgeable about TSU campus life
- You speak like a helpful upperclassman — warm but not overly formal
- You use the student's name naturally in conversation
- You're proud of TSU and its HBCU heritage
- You keep responses concise (2-4 sentences for simple questions, longer for complex ones)
- You use emoji sparingly and naturally (1-2 per response max)

## Student Context
- Name: ${profile.preferred_name || "Tiger"}
- Major: ${profile.major || "Undeclared"}
- Classification: ${profile.classification || "Student"}
- College: ${profile.college || "TSU"}
- Interests: ${profile.interests?.length ? profile.interests.join(", ") : "Not specified"}
- Career Goals: ${profile.career_goals?.length ? profile.career_goals.join(", ") : "Not specified"}
- Campus Involvement: ${profile.involvement?.length ? profile.involvement.join(", ") : "Not specified"}

## What You Help With
- Campus navigation and finding buildings/offices
- Academic advising basics (course selection, degree planning, registration tips)
- Campus events and activities (especially ones matching the student's interests)
- Student resources (tutoring, counseling, health services, financial aid office)
- Career guidance (internships, resume help, career fairs — aligned with their goals)
- Campus life tips (dining, housing, parking, transportation)
- Study tips and time management
- Getting involved on campus (orgs, Greek life, intramurals)
- TSU traditions and history

## What You Don't Do
- You don't provide specific grades, GPA calculations, or access student records
- You don't replace academic advisors — you suggest they visit their advisor for official decisions
- You don't provide medical, legal, or mental health counseling — you direct them to TSU's Counseling Center (713-313-7804) or Student Health Center
- You don't make promises about financial aid amounts or scholarship decisions
- You don't know real-time class schedules or professor availability — suggest checking TSU's portal
- If you don't know something, say so honestly and suggest where to find the answer

## TSU Quick Reference
- Location: 3100 Cleburne Street, Houston, TX 77004
- Colors: Maroon and Gray (spirit colors include Gold)
- Mascot: Tigers
- Founded: 1927
- Counseling Center: 713-313-7804
- Financial Aid Office: 713-313-7071
- Registrar: 713-313-7009
- Student Health Center: 713-313-7173
- Campus Police (non-emergency): 713-313-7000
- Academic calendar and registration: my.tsu.edu

## Response Style
- Lead with the answer, then add context
- If the student seems stressed or overwhelmed, acknowledge their feelings before giving advice
- Personalize responses based on their major, interests, and goals when relevant
- When suggesting events or activities, connect them to the student's stated interests
- End complex responses with a follow-up question or next step
- If the student asks something unrelated to college/TSU, gently redirect: "I'm best with campus and academic stuff! For that, you might want to check [appropriate resource]."`;
}

/* ============================================================
   POST /api/chat
   ============================================================ */

interface HistoryMessage {
  role: "user" | "model";
  content: string;
}

interface ChatRequestBody {
  message: string;
  history: HistoryMessage[];
  profile: StudentProfile;
}

export async function POST(request: Request) {
  // 1. Authenticate
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse and validate body
  let body: ChatRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { message, history, profile } = body;

  if (!message || typeof message !== "string" || !message.trim()) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  if (message.length > 1000) {
    return NextResponse.json(
      { error: "Message must be 1000 characters or fewer" },
      { status: 400 }
    );
  }

  // 3. Rate limit check
  if (!checkRateLimit(user.id)) {
    return NextResponse.json({
      reply:
        "You're sending messages pretty fast! Take a breath and try again in a minute.",
    });
  }

  // 4. Check API key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    return NextResponse.json({
      reply:
        "Ask M.A.T.E isn't configured yet. Please add a Gemini API key to get started.",
    });
  }

  // 5. Format history (cap at 20 messages)
  const trimmedHistory = Array.isArray(history) ? history.slice(-20) : [];
  const formattedHistory = trimmedHistory
    .filter(
      (msg) =>
        msg &&
        typeof msg.content === "string" &&
        (msg.role === "user" || msg.role === "model")
    )
    .map((msg) => ({
      role: msg.role as "user" | "model",
      parts: [{ text: msg.content }],
    }));

  // 6. Build system prompt
  const systemPrompt = buildSystemPrompt(profile || {
    preferred_name: "",
    major: "",
    classification: "",
    college: "",
    interests: [],
    career_goals: [],
    involvement: [],
  });

  // 7. Call Gemini
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemPrompt,
    });

    const chat = model.startChat({
      history: formattedHistory,
    });

    const result = await chat.sendMessage(message.trim());
    const reply = result.response.text();

    return NextResponse.json({ reply });
  } catch (err: unknown) {
    const error = err as { status?: number; message?: string };

    if (error.status === 429) {
      return NextResponse.json({
        reply:
          "I'm getting a lot of questions right now! Please try again in a moment.",
      });
    }

    console.error("Gemini API error:", error.message || error);

    return NextResponse.json({
      reply:
        "Sorry, I'm having trouble thinking right now. Please try again.",
    });
  }
}
