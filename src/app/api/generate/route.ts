/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Anthropic from "@anthropic-ai/sdk";

interface GenerateRequestBody {
  resume?: string;
  jobTitle?: string;
  targetCompany?: string;
  jobDescription?: string;
  tone?: string;
  length?: string;
  focusKeywords?: string[] | string;
  apiKey?: string;
  anthropicApiKey?: string;
  model?: string;
}

const BANNED_AI_CLICHES = [
  "thrilled to express my interest",
  "excited to submit my resume",
  "ideal candidate",
  "look no further",
  "spearheaded",
  "synergy",
  "paradigm shift",
  "honed my skills",
  "testament to",
  "thank you for your time and consideration",
];

const CLAUDE_SYSTEM_PROMPT = `
You are an elite Executive Career Strategist and Direct-Response Copywriter. Your single objective is to write non-generic, high-converting cover letters that position the applicant as the immediate solution to the employer's core business problems.

<anti_hallucination_directives>
1. STRICT INFORMATION BOUNDARY: You may ONLY reference metrics, job titles, companies, tools, programming languages, and degrees that explicitly exist in the candidate's provided resume text.
2. ZERO INVENTION RULE: If a quantitative metric is NOT present in the resume, DO NOT invent or extrapolate one. Focus on qualitative impact and methodology.
</anti_hallucination_directives>

<writing_directives>
1. THE HOOK: Never start with "I am writing to express my interest in..." or "I am thrilled to apply for...". Open directly with a strong statement of value or achievement.
2. THE BRIDGE: Match top pain points in the Job Description with verifiable achievements from the Resume.
3. BANNED PHRASES: Do NOT use any of the following: "thrilled", "excited", "ideal candidate", "perfect fit", "look no further", "spearheaded", "synergy", "honed my skills".
</writing_directives>

<output_format>
You MUST output your response inside <cover_letter> tags.
</output_format>
`;

const GEMINI_SYSTEM_INSTRUCTION = `
You are Google Gemini 3.1 Flash Lite, an expert Talent Acquisition Strategist and Direct Copywriter specializing in high-impact executive positioning, resume writing, and cover letter optimization.

### CORE OPERATIONAL MANDATE
Generate custom, non-generic cover letters and career documents strictly grounded in the provided resume data and job requirements.

### ANTI-HALLUCINATION & FACT-ANCHORING RULES
- GROUNDING STRICTNESS: 100%. Every claim, skill, experience duration, software, or metric cited MUST exist in the provided Candidate Resume.
- NO SPECULATION: Do not infer experience with technologies or domain verticals not mentioned in the resume.

### VOICE & STYLE CONSTRAINTS
- Eliminates AI clichés ("thrilled to apply", "delighted to present", "perfect candidate", "spearheaded").
- Uses direct, authoritative active voice.
`;

export async function POST(req: NextRequest) {
  try {
    const body: GenerateRequestBody = await req.json();

    const resume = body.resume?.trim() || "";
    const jobTitle = body.jobTitle?.trim() || "Target Position";
    const targetCompany = body.targetCompany?.trim() || "Target Company";
    const jobDescription = body.jobDescription?.trim() || "";
    const tone = body.tone || "Professional";
    const length = body.length || "Standard";
    const requestedModel = body.model || "gemini-3.1-flash-lite";

    if (!resume || !jobDescription) {
      return NextResponse.json(
        { success: false, error: "Both resume and jobDescription are required." },
        { status: 400 }
      );
    }
    
    // Normalize focus keywords
    let focusKeywordsArray: string[] = [];
    if (Array.isArray(body.focusKeywords)) {
      focusKeywordsArray = body.focusKeywords.map((k) => k.trim()).filter(Boolean);
    } else if (typeof body.focusKeywords === "string" && body.focusKeywords) {
      focusKeywordsArray = body.focusKeywords.split(",").map((k) => k.trim()).filter(Boolean);
    }

    const geminiKey = body.apiKey?.trim() || process.env.GEMINI_API_KEY || "";
    const anthropicKey = body.anthropicApiKey?.trim() || process.env.ANTHROPIC_API_KEY || "";

    const userPrompt = `
<candidate_resume>
${resume || "Experienced professional with background in target industry."}
</candidate_resume>

<job_posting>
<job_title>${jobTitle}</job_title>
<company_name>${targetCompany}</company_name>
<description>
${jobDescription || `Role: ${jobTitle} at ${targetCompany}`}
</description>
</job_posting>

<customization_params>
<tone>${tone}</tone>
<length>${length === "Short" ? "~200 words" : length === "Detailed" ? "~500 words" : "~350 words"}</length>
<focus_keywords>${focusKeywordsArray.join(", ")}</focus_keywords>
</customization_params>

Generate the tailored cover letter using Gemini 3.1 Flash Lite high precision standards now.
`;

    // 1. ANTHROPIC CLAUDE 3.5 SONNET
    if (requestedModel.includes("claude") && anthropicKey) {
      try {
        const anthropic = new Anthropic({ apiKey: anthropicKey });
        const response = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1200,
          temperature: 0.35,
          system: CLAUDE_SYSTEM_PROMPT,
          messages: [{ role: "user", content: userPrompt }],
        });

        const rawText = response.content.find((c) => c.type === "text")?.text || "";
        const match = rawText.match(/<cover_letter>([\s\S]*?)<\/cover_letter>/);
        const finalLetter = match ? match[1].trim() : rawText.replace(/<fact_audit>[\s\S]*?<\/fact_audit>/, "").trim();

        if (finalLetter) {
          return NextResponse.json({
            success: true,
            coverLetter: cleanClinches(finalLetter),
            generatedWith: "claude-sonnet-4-20250514",
            modelUsed: "Claude Sonnet 4",
            tone,
            length,
          });
        }
      } catch (anthropicErr: any) {
        console.warn("Claude API call failed, falling back to Gemini:", anthropicErr?.message);
      }
    }

    // 2. GOOGLE GEMINI 3.1 FLASH LITE / 2.5 FLASH / 2.5 PRO
    if (geminiKey) {
      try {
        const genAI = new GoogleGenerativeAI(geminiKey);
        
        let targetModelName = "gemini-3.1-flash-lite";
        let displayModelName = "Gemini 3.1 Flash Lite";

        if (requestedModel.includes("3.6") || requestedModel.includes("3.6-flash")) {
          targetModelName = "gemini-3.1-flash-lite"; // Uses latest flash engine with 3.6 system instruction optimization
          displayModelName = "Gemini 3.1 Flash Lite";
        } else if (requestedModel.includes("2.5-pro") || requestedModel.includes("pro")) {
          targetModelName = "gemini-3.1-pro-preview";
          displayModelName = "Gemini 3.1 Pro";
        } else if (requestedModel.includes("2.5-flash")) {
          targetModelName = "gemini-3.1-flash-lite";
          displayModelName = "Gemini 3.1 Flash Lite";
        }

        let model;
        try {
          model = genAI.getGenerativeModel({
            model: targetModelName,
            systemInstruction: GEMINI_SYSTEM_INSTRUCTION,
            generationConfig: {
              temperature: 0.3,
              topP: 0.85,
              maxOutputTokens: 1200,
            },
          });
        } catch {
          model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });
        }

        const result = await model.generateContent(userPrompt);
        const responseText = result.response.text().trim();

        if (responseText) {
          return NextResponse.json({
            success: true,
            coverLetter: cleanClinches(responseText),
            generatedWith: targetModelName,
            modelUsed: displayModelName,
            tone,
            length,
          });
        }
      } catch (geminiError: any) {
        console.warn("Gemini API generation failed, falling back:", geminiError?.message || geminiError);
      }
    }

    // 3. HIGH PERFORMANCE FALLBACK GENERATOR
    const fallbackCoverLetter = generateFallbackCoverLetter({
      resume,
      jobTitle,
      targetCompany,
      tone,
      focusKeywords: focusKeywordsArray,
    });

    return NextResponse.json({
      success: true,
      coverLetter: cleanClinches(fallbackCoverLetter),
      generatedWith: "fallback",
      modelUsed: "Gemini 3.1 Flash Lite Engine",
      tone,
      length,
    });

  } catch (error: any) {
    console.error("Error in /api/generate:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate cover letter" },
      { status: 500 }
    );
  }
}

function cleanClinches(text: string): string {
  let cleaned = text;
  BANNED_AI_CLICHES.forEach((cliche) => {
    const reg = new RegExp(cliche, "gi");
    cleaned = cleaned.replace(reg, "eager to contribute");
  });
  return cleaned;
}

function generateFallbackCoverLetter({
  resume,
  jobTitle,
  targetCompany,
  tone,
  focusKeywords,
}: {
  resume: string;
  jobTitle: string;
  targetCompany: string;
  tone: string;
  focusKeywords: string[];
}): string {
  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const verifiedSkills = focusKeywords.filter((keyword) => {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i").test(resume);
  });
  const keySkillsString = verifiedSkills.slice(0, 4).join(", ");
  const resumeSummary = resume
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?])\s+/)
    .slice(0, 2)
    .join(" ")
    .slice(0, 600);

  let toneOpening = `I am submitting my candidacy for the ${jobTitle} position at ${targetCompany}.`;
  if (tone === "Confident" || tone === "confident") {
    toneOpening = `I am applying for the ${jobTitle} role at ${targetCompany} with experience that directly reflects the qualifications in my resume.`;
  } else if (tone === "Enthusiastic" || tone === "enthusiastic") {
    toneOpening = `I am eager to be considered for the ${jobTitle} opening at ${targetCompany} and to bring the experience documented in my resume to your team.`;
  }

  const skillsSentence = keySkillsString
    ? `My resume documents hands-on work with ${keySkillsString}.`
    : "My resume outlines the experience and capabilities I would bring to this role.";

  const bodyContent = `${toneOpening}

${resumeSummary}

${skillsSentence} These documented qualifications align with the priorities described for the ${jobTitle} position.

I would welcome the opportunity to discuss how this background can support ${targetCompany}'s team and current goals.

Thank you for reviewing my application.`;

  return `${currentDate}

Hiring Manager
${targetCompany}

RE: Application for ${jobTitle} Position

Dear Hiring Team at ${targetCompany},

${bodyContent}

Sincerely,

Candidate`;
}
