/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Anthropic from "@anthropic-ai/sdk";

interface ResumeGenerateRequestBody {
  targetRole?: string;
  pastExperience?: string;
  keySkills?: string[] | string;
  education?: string;
  tone?: string;
  model?: string;
  apiKey?: string;
  anthropicApiKey?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: ResumeGenerateRequestBody = await req.json();

    const targetRole = body.targetRole?.trim() || "Professional Role";
    const pastExperience = body.pastExperience?.trim() || "";
    const education = body.education?.trim() || "";
    const requestedModel = body.model || "gemini-3.1-flash-lite";

    if (!pastExperience) {
      return NextResponse.json(
        { success: false, error: "Past experience is required to generate a grounded summary." },
        { status: 400 }
      );
    }

    let skillsList: string[] = [];
    if (Array.isArray(body.keySkills)) {
      skillsList = body.keySkills.map((s) => s.trim()).filter(Boolean);
    } else if (typeof body.keySkills === "string" && body.keySkills) {
      skillsList = body.keySkills.split(",").map((s) => s.trim()).filter(Boolean);
    }

    const geminiKey = body.apiKey?.trim() || process.env.GEMINI_API_KEY || "";
    const anthropicKey = body.anthropicApiKey?.trim() || process.env.ANTHROPIC_API_KEY || "";

    const systemPrompt = `
You are Google Gemini 3.1 Flash Lite (High Precision Career Engine), an expert executive resume writer and ATS optimization specialist.
Write a powerful 3-sentence Professional Executive Summary for a candidate targeting the position of "${targetRole}".

CANDIDATE INPUTS:
- Target Role: ${targetRole}
- Past Experience: ${pastExperience || "Experienced in relevant domain"}
- Key Skills: ${skillsList.join(", ")}
- Education: ${education}

DIRECTIVES:
1. Highlight core competencies and technical domain expertise.
2. Highlight quantified impact only when the exact metric exists in the candidate input.
3. Never invent experience, credentials, tools, responsibilities, or metrics.
4. Return ONLY the executive summary text. Do NOT use markdown quotes or extra headers.
`;

    // 1. Anthropic Claude Sonnet 4
    if (requestedModel.includes("claude") && anthropicKey) {
      try {
        const anthropic = new Anthropic({ apiKey: anthropicKey });
        const response = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 300,
          temperature: 0.3,
          messages: [{ role: "user", content: systemPrompt }],
        });

        const textBlock = response.content.find((c) => c.type === "text");
        if (textBlock && textBlock.text) {
          return NextResponse.json({
            success: true,
            summary: textBlock.text.trim(),
            modelUsed: "Claude Sonnet 4",
          });
        }
      } catch (err: any) {
        console.warn("Claude summary generation failed:", err?.message);
      }
    }

    // 2. Google Gemini 3.1 Flash Lite / 2.5 Pro / 2.5 Flash
    if (geminiKey) {
      try {
        const genAI = new GoogleGenerativeAI(geminiKey);
        let modelName = "gemini-3.1-flash-lite";
        let displayModel = "Gemini 3.1 Flash Lite (High)";

        if (requestedModel.includes("2.5-pro") || requestedModel.includes("pro")) {
          modelName = "gemini-3.1-pro-preview";
          displayModel = "Gemini 3.1 Pro";
        }

        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(systemPrompt);
        const responseText = result.response.text().trim();

        if (responseText) {
          return NextResponse.json({
            success: true,
            summary: responseText,
            modelUsed: displayModel,
          });
        }
      } catch (err: any) {
        console.warn("Gemini summary generation failed:", err?.message);
      }
    }

    // Fallback Summary
    const experienceSummary = pastExperience
      .replace(/[\[\]{}\"]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 500);
    const skillSummary = skillsList.length > 0
      ? ` Core skills listed by the candidate include ${skillsList.slice(0, 5).join(", ")}.`
      : "";
    const fallbackSummary = `${targetRole} candidate with the following documented background: ${experienceSummary}.${skillSummary}`;

    return NextResponse.json({
      success: true,
      summary: fallbackSummary,
      modelUsed: "Gemini 3.1 Flash Lite Engine (Fallback)",
    });

  } catch (error: any) {
    console.error("Error in /api/resume/generate:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate resume summary" },
      { status: 500 }
    );
  }
}
