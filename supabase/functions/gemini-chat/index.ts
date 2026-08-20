import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface Profile {
  name: string | null;
  grade: string | null;
  favorite_subject: string | null;
  strongest_subject: string | null;
  weakest_subject: string | null;
  hobbies: string[];
  hobby_skills: string[];
  goal_percentage: number | null;
  last_year_percentage: number | null;
}

interface CognitiveScore {
  ability: string;
  score: number;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface RequestBody {
  messages: ChatMessage[];
  profile: Profile;
  cognitiveScores: CognitiveScore[];
  documentText?: string;
  mode?: "chat" | "quiz";
  quizAnswers?: number[];
  quizQuestions?: QuizQuestion[];
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body: RequestBody = await req.json();
    const apiKey = Deno.env.get("GEMINI_API_KEY");

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Gemini API key not configured. Set the GEMINI_API_KEY secret in Supabase." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemInstruction = buildSystemInstruction(body.profile, body.cognitiveScores);

    // Quiz generation mode
    if (body.mode === "quiz") {
      return await handleQuizGeneration(apiKey, systemInstruction, body);
    }

    // Quiz answer grading mode
    if (body.mode === "quiz" && body.quizQuestions && body.quizAnswers) {
      return await handleQuizGrading(apiKey, systemInstruction, body);
    }

    // Normal chat mode
    return await handleChat(apiKey, systemInstruction, body);
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function buildSystemInstruction(profile: Profile, scores: CognitiveScore[]): string {
  const parts: string[] = [];

  parts.push("You are an AI study tutor integrated into the Smart Study Blueprint app. Your role is to help students learn, understand concepts, and study effectively.");

  // Profile-based personalization
  const profileParts: string[] = [];
  if (profile.name) profileParts.push(`The student's name is ${profile.name}.`);
  if (profile.grade) profileParts.push(`They are in ${profile.grade}.`);
  if (profile.favorite_subject) profileParts.push(`Their favorite subject is ${profile.favorite_subject}.`);
  if (profile.strongest_subject) profileParts.push(`Their strongest subject is ${profile.strongest_subject}.`);
  if (profile.weakest_subject) profileParts.push(`Their weakest subject is ${profile.weakest_subject}.`);
  if (profile.hobbies && profile.hobbies.length > 0) {
    profileParts.push(`Their hobbies are: ${profile.hobbies.join(", ")}.`);
  }
  if (profile.hobby_skills && profile.hobby_skills.length > 0) {
    profileParts.push(`Skills from their hobbies: ${profile.hobby_skills.join(", ")}.`);
  }
  if (profile.goal_percentage) profileParts.push(`Their goal is to reach ${profile.goal_percentage}%.`);
  if (profile.last_year_percentage) profileParts.push(`Last year they scored ${profile.last_year_percentage}%.`);

  if (profileParts.length > 0) {
    parts.push(`Student profile:\n${profileParts.join(" ")}`);
  }

  // Cognitive score-based personalization
  if (scores && scores.length > 0) {
    const scoreMap = new Map<string, number>();
    for (const s of scores) scoreMap.set(s.ability, s.score);

    const cognitiveParts: string[] = [];
    const memory = scoreMap.get("memory");
    const attention = scoreMap.get("attention");
    const processingSpeed = scoreMap.get("processing_speed");
    const activeRecall = scoreMap.get("active_recall");
    const focus = scoreMap.get("focus");
    const patternRecog = scoreMap.get("pattern_recognition");
    const logicalReasoning = scoreMap.get("logical_reasoning");
    const reactionTime = scoreMap.get("reaction_time");

    if (memory !== undefined) cognitiveParts.push(`Memory: ${memory}`);
    if (attention !== undefined) cognitiveParts.push(`Attention: ${attention}`);
    if (processingSpeed !== undefined) cognitiveParts.push(`Processing Speed: ${processingSpeed}`);
    if (activeRecall !== undefined) cognitiveParts.push(`Active Recall: ${activeRecall}`);
    if (focus !== undefined) cognitiveParts.push(`Focus: ${focus}`);
    if (patternRecog !== undefined) cognitiveParts.push(`Pattern Recognition: ${patternRecog}`);
    if (logicalReasoning !== undefined) cognitiveParts.push(`Logical Reasoning: ${logicalReasoning}`);
    if (reactionTime !== undefined) cognitiveParts.push(`Reaction Time: ${reactionTime}ms`);

    if (cognitiveParts.length > 0) {
      parts.push(`Cognitive assessment results:\n${cognitiveParts.join(", ")}`);

      // Adaptive instruction style
      const adaptations: string[] = [];
      if (attention !== undefined && attention < 50) {
        adaptations.push("The student's attention score is lower, so use shorter paragraphs, bullet points, and frequent engagement checks.");
      }
      if (memory !== undefined && memory < 50) {
        adaptations.push("The student's memory score is lower, so repeat key points and use mnemonics where possible.");
      }
      if (processingSpeed !== undefined && processingSpeed < 50) {
        adaptations.push("The student's processing speed is lower, so pace explanations gradually and avoid overwhelming with too much at once.");
      }
      if (focus !== undefined && focus < 50) {
        adaptations.push("The student's focus is lower, so keep explanations concise and use clear section headers.");
      }
      if (logicalReasoning !== undefined && logicalReasoning >= 70) {
        adaptations.push("The student has strong logical reasoning, so you can use more complex reasoning chains and ask probing questions.");
      }
      if (patternRecog !== undefined && patternRecog >= 70) {
        adaptations.push("The student has strong pattern recognition, so use analogies and visual pattern descriptions.");
      }

      if (adaptations.length > 0) {
        parts.push(`Adapt your teaching style:\n${adaptations.join(" ")}`);
      }
    }
  }

  // Relate to hobbies
  if (profile.hobbies && profile.hobbies.length > 0) {
    parts.push(`When explaining concepts, relate them to the student's hobbies (${profile.hobbies.join(", ")}) where it feels natural. For example, if they like basketball, use basketball analogies for physics or math problems. Do not force connections if they don't fit.`);
  }

  parts.push("Be encouraging, friendly, and concise. Use markdown formatting (headers, bold, lists) where helpful. If the student uploads a document, you can reference its content. If they ask to be quizzed or you think it would help, suggest generating a quiz from their document.");

  return parts.join("\n\n");
}

async function handleChat(apiKey: string, systemInstruction: string, body: RequestBody): Promise<Response> {
  const contents = body.messages.map((m) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.content }],
  }));

  // If document text is provided, prepend it to the conversation context
  if (body.documentText) {
    const lastUserIdx = contents.findIndex((c) => c.role === "user");
    if (lastUserIdx !== -1) {
      contents[lastUserIdx] = {
        ...contents[lastUserIdx],
        parts: [{ text: `[Document context]: ${body.documentText.slice(0, 8000)}\n\n[User message]: ${contents[lastUserIdx].parts[0].text}` }],
      };
    }
  }

  const geminiBody = {
    system_instruction: { parts: [{ text: systemInstruction }] },
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
  };

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiBody),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    return new Response(
      JSON.stringify({ error: `Gemini API error: ${response.status}`, details: errText }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "I could not generate a response. Please try again.";

  return new Response(
    JSON.stringify({ text }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleQuizGeneration(apiKey: string, systemInstruction: string, body: RequestBody): Promise<Response> {
  const docContext = body.documentText
    ? `Based on the following document content, generate a 5-question multiple-choice quiz:\n\n${body.documentText.slice(0, 8000)}`
    : "Generate a 5-question multiple-choice quiz based on the student's favorite subject or a general educational topic.";

  const quizPrompt = `${docContext}

Create exactly 5 multiple-choice questions. Each question should have 4 options and one correct answer. Personalize the questions by relating them to the student's hobbies where natural.

Return ONLY a JSON array (no markdown, no code fences) with this exact format:
[
  {
    "question": "The question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": 0,
    "explanation": "Brief explanation of why this is correct"
  }
]

The correct_answer is the zero-based index of the correct option.`;

  const geminiBody = {
    system_instruction: { parts: [{ text: systemInstruction }] },
    contents: [{ role: "user", parts: [{ text: quizPrompt }] }],
    generationConfig: {
      temperature: 0.8,
      maxOutputTokens: 4096,
      responseMimeType: "application/json",
    },
  };

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiBody),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    return new Response(
      JSON.stringify({ error: `Gemini API error: ${response.status}`, details: errText }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";

  let questions: QuizQuestion[];
  try {
    questions = JSON.parse(text);
  } catch {
    return new Response(
      JSON.stringify({ error: "Failed to parse quiz questions from AI response" }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ questions }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
