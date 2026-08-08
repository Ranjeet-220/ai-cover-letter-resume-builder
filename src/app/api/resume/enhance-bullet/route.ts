/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Anthropic from "@anthropic-ai/sdk";

interface EnhanceBulletRequestBody {
  bullet?: string;
  targetRole?: string;
  model?: string;
  apiKey?: string;
  anthropicApiKey?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: EnhanceBulletRequestBody = await req.json();

    const rawBullet = body.bullet?.trim() || "";
    const targetRole = body.targetRole?.trim() || "Professional Role";
    const requestedModel = body.model || "gemini-2.5-flash";

    if (!rawBullet) {
      return NextResponse.json({ error: "Bullet point text is required" }, { status: 400 });
    }

    const geminiKey = body.apiKey?.trim() || process.env.GEMINI_API_KEY || "";
    const anthropicKey = body.anthropicApiKey?.trim() || process.env.ANTHROPIC_API_KEY || "";

    const prompt = `
You are Google Gemini 2.5 Flash (High Precision Bullet Metric Enhancer).
Transform the following raw resume bullet point into a high-impact statement using the Google XYZ Formula:
"Accomplished [X] as measured by [Y], by doing [Z]"

RAW BULLET:
"${rawBullet}"

TARGET ROLE: "${targetRole}"

DIRECTIVES:
1. Start with a strong action verb (e.g. Architected, Spearheaded, Orchestrated, Optimized, Scaled).
2. Preserve every fact. Use a metric only if that metric is explicitly present in the raw bullet; never invent or estimate numbers.
3. Mention a technical methodology or tool only if it is explicitly present in the raw bullet.
4. Return ONLY the enhanced bullet point text without bullet symbols or markdown quotes.
`;

    // 1. Anthropic Claude Sonnet 4
    if (requestedModel.includes("claude") && anthropicKey) {
      try {
        const anthropic = new Anthropic({ apiKey: anthropicKey });
        const response = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 200,
          temperature: 0.3,
          messages: [{ role: "user", content: prompt }],
        });

        const textBlock = response.content.find((c) => c.type === "text");
        if (textBlock && textBlock.text) {
          return NextResponse.json({
            success: true,
            enhancedBullet: textBlock.text.trim(),
            modelUsed: "Claude Sonnet 4",
          });
        }
      } catch (err: any) {
        console.warn("Claude bullet enhancement failed:", err?.message);
      }
    }

    // 2. Google Gemini 2.5 Flash / 2.5 Pro
    if (geminiKey) {
      try {
        const genAI = new GoogleGenerativeAI(geminiKey);
        let modelName = "gemini-2.5-flash";
        let displayModel = "Gemini 2.5 Flash (High)";

        if (requestedModel.includes("2.5-pro") || requestedModel.includes("pro")) {
          modelName = "gemini-2.5-pro";
          displayModel = "Gemini 2.5 Pro";
        }

        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();

        if (responseText) {
          return NextResponse.json({
            success: true,
            enhancedBullet: responseText,
            modelUsed: displayModel,
          });
        }
      } catch (err: any) {
        console.warn("Gemini bullet enhancement failed:", err?.message);
      }
    }

    // Fallback Enhancement
    // Never invent metrics when no model is available; preserve the candidate's facts.
    const enhanced = rawBullet;

    return NextResponse.json({
      success: true,
      enhancedBullet: enhanced,
      modelUsed: "Gemini 2.5 Flash Engine (Fallback)",
    });

  } catch (error: any) {
    console.error("Error in /api/resume/enhance-bullet:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to enhance bullet point" },
      { status: 500 }
    );
  }
}
