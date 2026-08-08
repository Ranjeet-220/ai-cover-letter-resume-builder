/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

type ActionType = "shorten" | "confident" | "leadership" | "grammar" | "tailor";

interface ImproveRequestBody {
  text?: string;
  action?: ActionType;
  jobDescription?: string;
  apiKey?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: ImproveRequestBody = await req.json();

    const text = body.text?.trim() || "";
    const action = body.action || "grammar";
    const jobDescription = body.jobDescription?.trim() || "";
    const apiKey = body.apiKey?.trim() || process.env.GEMINI_API_KEY || "";

    if (!text) {
      return NextResponse.json(
        { success: false, error: "Text to improve is required." },
        { status: 400 }
      );
    }

    // Try Gemini API if key is available
    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        let model;
        try {
          model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });
        } catch {
          model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });
        }

        let actionPromptInstruction = "";
        switch (action) {
          case "shorten":
            actionPromptInstruction = "Make the text significantly more concise (reduce length by ~25-35%), removing fluff while retaining core achievements and impact.";
            break;
          case "confident":
            actionPromptInstruction = "Elevate the tone to sound exceptionally confident, assertive, and high-achieving. Remove passive or weak phrasing (e.g. 'I believe', 'I assisted with') and replace with strong action verbs (e.g. 'spearheaded', 'orchestrated').";
            break;
          case "leadership":
            actionPromptInstruction = "Infuse strong executive leadership framing. Emphasize strategic direction, cross-functional ownership, scaling teams, and driving high-level business impact.";
            break;
          case "grammar":
            actionPromptInstruction = "Fix all grammar, punctuation, sentence flow, and stylistic errors while preserving the original intent and tone.";
            break;
          case "tailor":
            actionPromptInstruction = `Align the text directly with the requirements, keywords, and phrasing found in this job description:\n"""\n${jobDescription}\n"""`;
            break;
        }

        const prompt = `
You are an expert career editor and copywriter. Refine the following cover letter text based on the specific instruction below.

INSTRUCTION:
${actionPromptInstruction}

ORIGINAL TEXT:
"""
${text}
"""

OUTPUT INSTRUCTION:
Return ONLY the refined, improved cover letter text. Do not include markdown meta-commentary, introductory notes, or quotes around the output.
`;

        const result = await model.generateContent(prompt);
        const improvedText = result.response.text().trim();

        if (improvedText) {
          return NextResponse.json({
            success: true,
            improvedText,
            action,
            method: "gemini",
          });
        }
      } catch (geminiError: any) {
        console.warn("Gemini API improve failed, falling back to rule-based engine:", geminiError?.message || geminiError);
      }
    }

    // Smart Fallback Engine
    const fallbackText = improveFallback(text, action, jobDescription);

    return NextResponse.json({
      success: true,
      improvedText: fallbackText,
      action,
      method: "fallback",
      note: apiKey ? "Gemini API encountered an issue; used fallback editor." : "Refined using smart fallback editor.",
    });

  } catch (error: any) {
    console.error("Error in /api/improve:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to improve text" },
      { status: 500 }
    );
  }
}

/**
 * Fallback text improvement engine
 */
function improveFallback(text: string, action: ActionType, jobDescription: string): string {
  let result = text;

  if (action === "shorten") {
    // Trimming verbose phrases
    const verboseReplacements: [RegExp, string][] = [
      [/I am writing to express my interest in/gi, "I am applying for"],
      [/In order to/gi, "To"],
      [/I believe that I would be a great fit/gi, "I am uniquely qualified"],
      [/with the goal of/gi, "to"],
      [/due to the fact that/gi, "because"],
      [/at the present time/gi, "currently"],
      [/has the ability to/gi, "can"],
      [/in spite of the fact that/gi, "although"],
    ];

    for (const [pattern, replacement] of verboseReplacements) {
      result = result.replace(pattern, replacement);
    }
  } else if (action === "confident") {
    // Strong active verb replacements
    const weakPhraseReplacements: [RegExp, string][] = [
      [/worked on/gi, "spearheaded"],
      [/helped with/gi, "orchestrated"],
      [/assisted in/gi, "drove"],
      [/I think I can/gi, "I am prepared to"],
      [/I hope to/gi, "I will"],
      [/I tried to/gi, "I successfully"],
      [/responsible for/gi, "championed"],
      [/good at/gi, "expert in"],
    ];

    for (const [pattern, replacement] of weakPhraseReplacements) {
      result = result.replace(pattern, replacement);
    }
  } else if (action === "leadership") {
    // Leadership & Strategic terminology insertion
    result = result
      .replace(/\bled\b/gi, "spearheaded and scaled")
      .replace(/\bmanaged\b/gi, "directed cross-functional execution for")
      .replace(/\bcreated\b/gi, "architected strategic initiatives for");

    if (!result.toLowerCase().includes("roi") && !result.toLowerCase().includes("strategic")) {
      result = result.replace(
        /(Sincerely,|Best regards,|Thank you for)/i,
        "With a focus on driving measurable ROI, strategic growth, and operational scaling, I look forward to taking on key leadership priorities.\n\n$1"
      );
    }
  } else if (action === "grammar") {
    // Basic grammar & spacing cleanup
    result = result
      .replace(/  +/g, " ")
      .replace(/\s+([.,!?:;])/g, "$1")
      .replace(/\b(i)\b/g, "I")
      .replace(/\bteh\b/gi, "the")
      .replace(/\breceieve\b/gi, "receive");
  } else if (action === "tailor" && jobDescription) {
    // Inject key words from job description into relevant paragraphs
    const keywordsMatches = jobDescription.match(/\b(React|TypeScript|Python|AWS|Docker|Node\.js|GraphQL|Leadership|API|CI\/CD|SQL|Agile|Product Strategy)\b/gi);
    if (keywordsMatches && keywordsMatches.length > 0) {
      const uniqueKeywords = Array.from(new Set(keywordsMatches.map(k => k.trim()))).slice(0, 3);
      const injectedPhrase = ` My background strongly leverages ${uniqueKeywords.join(", ")}, which directly aligns with your current team focus.`;
      
      const paragraphs = result.split("\n\n");
      if (paragraphs.length >= 2) {
        paragraphs[1] += injectedPhrase;
        result = paragraphs.join("\n\n");
      }
    }
  }

  return result;
}
