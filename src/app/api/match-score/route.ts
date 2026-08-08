import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { calculateAtsMatchScore } from "@/lib/atsUtils";
import { getErrorMessage, isRecord } from "@/lib/errors";

interface MatchScoreRequestBody {
  resume?: string;
  jobDescription?: string;
  jobTitle?: string;
  apiKey?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: MatchScoreRequestBody = await req.json();

    const resume = body.resume?.trim() || "";
    const jobDescription = body.jobDescription?.trim() || "";
    const jobTitle = body.jobTitle?.trim() || "Target Position";
    const apiKey = body.apiKey?.trim() || process.env.GEMINI_API_KEY || "";

    if (!resume || !jobDescription) {
      return NextResponse.json(
        {
          success: false,
          error: "Both resume and jobDescription are required to calculate a match score.",
        },
        { status: 400 }
      );
    }

    // Try Gemini API if key is available
    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        let model;
        try {
          model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" },
          });
        } catch {
          model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" },
          });
        }

        const prompt = `
You are an expert ATS (Applicant Tracking System) parser and talent acquisition specialist.
Analyze the candidate's Resume against the Job Description for the position of "${jobTitle}".

RESUME:
"""
${resume}
"""

JOB DESCRIPTION:
"""
${jobDescription}
"""

Provide a thorough analysis in JSON format with the following keys:
{
  "score": <number between 0 and 100 indicating match percentage>,
  "matchedKeywords": [<list of matched skills, tools, technologies, or domain terms found in both>],
  "missingKeywords": [<list of important skills/keywords required in job description but missing or weak in resume>],
  "strengths": [<list of 2-3 specific strengths of candidate for this role>],
  "recommendations": [<list of 2-3 actionable advice items to improve candidate alignment>]
}
`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();
        const parsed: unknown = JSON.parse(responseText);

        if (!isRecord(parsed)) throw new Error("AI returned an invalid ATS analysis.");

        const stringArray = (value: unknown): string[] =>
          Array.isArray(value)
            ? value.filter((item): item is string => typeof item === "string").slice(0, 20)
            : [];

        const numericScore = typeof parsed.score === "number"
          ? parsed.score
          : Number(parsed.score);

        return NextResponse.json({
          success: true,
          score: Number.isFinite(numericScore)
            ? Math.min(100, Math.max(0, Math.round(numericScore)))
            : 0,
          matchedKeywords: stringArray(parsed.matchedKeywords),
          missingKeywords: stringArray(parsed.missingKeywords),
          strengths: stringArray(parsed.strengths),
          recommendations: stringArray(parsed.recommendations),
          method: "gemini",
        });
      } catch (geminiError: unknown) {
        console.warn("Gemini API match-score failed, using algorithmic fallback:", getErrorMessage(geminiError, "Unknown error"));
      }
    }

    // Algorithmic Fallback Engine
    const analysis = calculateAtsMatchScore(resume, jobDescription, jobTitle);

    return NextResponse.json({
      success: true,
      ...analysis,
      method: "fallback",
      note: apiKey ? "Gemini API encountered an issue; used fallback ATS analyzer." : "Analyzed using built-in intelligent ATS matching algorithm.",
    });

  } catch (error: unknown) {
    console.error("Error in /api/match-score:", error);
    return NextResponse.json(
      { success: false, error: getErrorMessage(error, "Failed to calculate match score") },
      { status: 500 }
    );
  }
}
