import 'server-only';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Anthropic from '@anthropic-ai/sdk';
import { BadRequestError, readObjectBody } from '@/server/validation';

type ActionType = "shorten" | "confident" | "leadership" | "grammar" | "tailor";

interface ImproveRequestBody {
  text?: string;
  action?: ActionType;
  jobDescription?: string;
  apiKey?: string;
  anthropicApiKey?: string;
  model?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await readObjectBody<ImproveRequestBody>(req, {
      text: 'string', action: 'string', jobDescription: 'string', apiKey: 'string',
      anthropicApiKey: 'string', model: 'string',
    });

    const text = body.text?.trim() || "";
    const action = body.action || "grammar";
    if (!['shorten', 'confident', 'leadership', 'grammar', 'tailor'].includes(action)) {
      throw new BadRequestError('Invalid improve action.');
    }
    const jobDescription = body.jobDescription?.trim() || "";
    const apiKey = body.apiKey?.trim() || process.env.GEMINI_API_KEY || "";
    const anthropicApiKey = body.anthropicApiKey?.trim() || process.env.ANTHROPIC_API_KEY || '';
    const requestedModel = body.model || 'gemini-3.1-flash-lite';

    if (!text) {
      return NextResponse.json(
        { success: false, error: "Text to improve is required." },
        { status: 400 }
      );
    }

    if (requestedModel.includes('claude') && anthropicApiKey) {
      try {
        const anthropic = new Anthropic({ apiKey: anthropicApiKey });
        const response = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          messages: [{ role: 'user', content: `Improve this cover letter using the action "${action}". Preserve every factual claim and outcome. Do not add skills, qualifications, metrics, or results that are absent from the original text. Return only the improved letter.\n\nOriginal letter:\n${text}\n\nJob description for context only:\n${jobDescription}` }],
        });
        const improvedText = response.content.find((item) => item.type === 'text')?.text.trim();
        if (improvedText) {
          return NextResponse.json({ success: true, improvedText, action, method: 'claude' });
        }
      } catch (anthropicError) {
        console.warn('Claude improve failed, using fallback editor:', anthropicError);
      }
    }

    // Try Gemini API if selected and a key is available.
    if (!requestedModel.includes('claude') && apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        let model;
        try {
          model = genAI.getGenerativeModel({ model: requestedModel === 'gemini-3.1-pro-preview' ? requestedModel : 'gemini-3.1-flash-lite' });
        } catch (modelError: any) {
          console.warn("Falling back to default Gemini model:", modelError?.message || modelError);
          model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        }

        let actionPromptInstruction = "";
        switch (action) {
          case "shorten":
            actionPromptInstruction = "Make the text significantly more concise (reduce length by ~25-35%), removing fluff while retaining core achievements and impact.";
            break;
          case "confident":
            actionPromptInstruction = "Use a direct, confident tone while preserving the candidate's actual role, contribution, and outcomes.";
            break;
          case "leadership":
            actionPromptInstruction = "Highlight leadership responsibilities already stated in the text without inventing ownership, team size, scale, or business impact.";
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
Preserve all facts and outcomes in the original text. Do not add qualifications, skills, metrics, or achievements from the job description unless they are already present in the original text.
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
      note: requestedModel.includes('claude')
        ? (anthropicApiKey ? 'Claude API encountered an issue; used fallback editor.' : 'Claude key unavailable; used fallback editor.')
        : (apiKey ? 'Gemini API encountered an issue; used fallback editor.' : 'Refined using fallback editor.'),
    });

  } catch (error: any) {
    if (error instanceof BadRequestError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
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
      [/I believe that I would be a great fit/gi, "I would be a good fit"],
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
    // Remove hedging without changing the candidate's contribution or outcome.
    const weakPhraseReplacements: [RegExp, string][] = [
      [/I think I can/gi, "I can"],
      [/I believe I can/gi, "I can"],
      [/I feel that I/gi, "I"],
    ];

    for (const [pattern, replacement] of weakPhraseReplacements) {
      result = result.replace(pattern, replacement);
    }
  } else if (action === "leadership") {
    // Keep the candidate's original leadership scope and outcomes intact.
    result = result.replace(/\bI was responsible for managing\b/gi, 'I managed');
  } else if (action === "grammar") {
    // Basic grammar & spacing cleanup
    result = result
      .replace(/  +/g, " ")
      .replace(/\s+([.,!?:;])/g, "$1")
      .replace(/\b(i)\b(?!\.)/g, "I")
      .replace(/\bteh\b/gi, "the")
      .replace(/\breceieve\b/gi, "receive");
  } else if (action === "tailor" && jobDescription) {
    // Without source evidence, a fallback cannot safely claim job-description skills.
    result = result.trim();
  }

  return result;
}
