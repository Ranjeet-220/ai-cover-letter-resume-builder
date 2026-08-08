/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface ColdEmailRequestBody {
  coverLetter?: string;
  jobTitle?: string;
  targetCompany?: string;
  hiringManagerName?: string;
  tone?: string;
  apiKey?: string;
}

interface MessageOutput {
  subject: string;
  body: string;
  fullText: string;
  wordCount: number;
}

interface ColdEmailResponse {
  success: boolean;
  coldEmail?: MessageOutput;
  linkedInInMail?: MessageOutput;
  generatedWith?: "gemini" | "fallback";
  note?: string;
  error?: string;
}

export async function POST(req: NextRequest): Promise<NextResponse<ColdEmailResponse>> {
  try {
    const body: ColdEmailRequestBody = await req.json();

    const coverLetter = body.coverLetter?.trim() || "";
    const jobTitle = body.jobTitle?.trim() || "";
    const targetCompany = body.targetCompany?.trim() || "";
    const hiringManagerName = body.hiringManagerName?.trim() || "Hiring Manager";
    const tone = body.tone?.trim() || "Direct & Value-driven";
    const apiKey = body.apiKey?.trim() || process.env.GEMINI_API_KEY || "";

    if (!coverLetter) {
      return NextResponse.json(
        { success: false, error: "Cover letter content is required." },
        { status: 400 }
      );
    }

    // Try Gemini API if API key is available
    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        let model;
        try {
          model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });
        } catch {
          model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });
        }

        const prompt = `
You are an expert executive headhunter and top-tier direct-response copywriter.
Convert the provided Cover Letter into a high-converting, punchy 150-word Cold Email and a ultra-concise LinkedIn InMail message for hiring managers.

INPUT COVER LETTER:
"""
${coverLetter}
"""

CONTEXT DETAILS:
- Target Role: ${jobTitle || "Role mentioned in cover letter"}
- Target Company: ${targetCompany || "Company mentioned in cover letter"}
- Hiring Manager / Recruiter Name: ${hiringManagerName}
- Desired Tone: ${tone}

RULES & CONSTRAINTS:
1. Cold Email:
   - Must be strictly ~120-160 words total (high converting, no filler).
   - Catchy, high-open subject line customized for hiring managers.
   - Attention-grabbing opening hook demonstrating specific interest in ${targetCompany || "the company"}.
   - Top 1-2 quantifiable metrics or key value-add points distilled from the cover letter.
   - Low-friction Call To Action (CTA) asking for a brief 10-minute chat.
   
2. LinkedIn InMail / DM:
   - Must be strictly ~80-120 words.
   - Short, conversational, high-converting direct message.
   - Punchy subject line / header.
   - Clear value prop & low-friction CTA.

OUTPUT FORMAT:
Return ONLY a valid raw JSON object (no markdown backticks, no markdown formatting) with this exact schema:
{
  "coldEmail": {
    "subject": "Subject line text",
    "body": "Full body text of the cold email"
  },
  "linkedInInMail": {
    "subject": "Subject line text",
    "body": "Full body text of the LinkedIn message"
  }
}
`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();

        // Clean json output from markdown fences if any
        const cleanedJsonText = responseText
          .replace(/^```json\s*/i, "")
          .replace(/^```\s*/i, "")
          .replace(/\s*```$/i, "")
          .trim();

        const parsed = JSON.parse(cleanedJsonText);

        if (parsed.coldEmail?.body && parsed.linkedInInMail?.body) {
          const coldEmailFull = `Subject: ${parsed.coldEmail.subject}\n\n${parsed.coldEmail.body}`;
          const linkedInFull = `Subject: ${parsed.linkedInInMail.subject}\n\n${parsed.linkedInInMail.body}`;

          return NextResponse.json({
            success: true,
            coldEmail: {
              subject: parsed.coldEmail.subject,
              body: parsed.coldEmail.body,
              fullText: coldEmailFull,
              wordCount: countWords(parsed.coldEmail.body),
            },
            linkedInInMail: {
              subject: parsed.linkedInInMail.subject,
              body: parsed.linkedInInMail.body,
              fullText: linkedInFull,
              wordCount: countWords(parsed.linkedInInMail.body),
            },
            generatedWith: "gemini",
          });
        }
      } catch (geminiError: any) {
        console.warn(
          "Gemini API conversion failed, falling back to intelligent conversion generator:",
          geminiError?.message || geminiError
        );
      }
    }

    // Fallback Generator if Gemini is not configured or failed
    const fallbackResult = generateFallbackColdMessages({
      coverLetter,
      jobTitle,
      targetCompany,
      hiringManagerName,
      tone,
    });

    return NextResponse.json({
      success: true,
      coldEmail: fallbackResult.coldEmail,
      linkedInInMail: fallbackResult.linkedInInMail,
      generatedWith: "fallback",
      note: apiKey
        ? "Gemini API encountered an issue; used built-in intelligent fallback conversion engine."
        : "Converted using built-in intelligent cold outreach conversion engine.",
    });
  } catch (error: any) {
    console.error("Error in /api/cold-email:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to convert cover letter into cold email.",
      },
      { status: 500 }
    );
  }
}

/**
 * Utility to accurately count words in a string
 */
function countWords(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * High-converting Fallback Cold Email & LinkedIn InMail Generator
 */
function generateFallbackColdMessages({
  coverLetter,
  jobTitle,
  targetCompany,
  hiringManagerName,
  tone,
}: {
  coverLetter: string;
  jobTitle: string;
  targetCompany: string;
  hiringManagerName: string;
  tone: string;
}): { coldEmail: MessageOutput; linkedInInMail: MessageOutput } {
  // Extract context from cover letter text if not explicitly provided
  let extractedJobTitle = jobTitle;
  if (!extractedJobTitle) {
    const titleMatch = coverLetter.match(/(?:for the|as a|position of)\s+([A-Za-z0-9\s\-]+?)(?:\s+role|\s+position|\s+at|\.|,)/i);
    extractedJobTitle = titleMatch ? titleMatch[1].trim() : "Target Position";
  }

  let extractedCompany = targetCompany;
  if (!extractedCompany) {
    const companyMatch = coverLetter.match(/(?:at|with|join)\s+([A-Z][A-Za-z0-9\s\&]+?)(?:\s+team|\s+engineering|\.|,|\s+as)/);
    extractedCompany = companyMatch ? companyMatch[1].trim() : "Target Company";
  }

  // Extract candidate name if available at the bottom of cover letter
  const lines = coverLetter.split("\n").map((l) => l.trim()).filter(Boolean);
  let candidateName = "Candidate Name";
  for (let i = lines.length - 1; i >= Math.max(0, lines.length - 4); i--) {
    const line = lines[i];
    if (
      !line.toLowerCase().includes("sincerely") &&
      !line.toLowerCase().includes("regards") &&
      !line.includes("@") &&
      !line.match(/^\(?\d{3}\)?[\s\-\.]?\d{3}/) &&
      line.length < 40
    ) {
      candidateName = line;
      break;
    }
  }

  // Extract top value highlights or key achievements from middle paragraphs
  const middleParagraphs = lines.filter(
    (l) =>
      !l.toLowerCase().startsWith("dear") &&
      !l.toLowerCase().startsWith("re:") &&
      !l.toLowerCase().includes("sincerely") &&
      !l.toLowerCase().includes("thank you for your time") &&
      l.length > 50
  );

  const primaryHighlight =
    middleParagraphs.length > 0
      ? middleParagraphs[0]
      : `I bring proven experience delivering scalable, high-quality outcomes in ${extractedJobTitle} roles.`;

  // Build Cold Email (~140-150 words)
  const coldEmailSubject = `Quick question re: ${extractedJobTitle} role at ${extractedCompany}`;
  
  let coldEmailBody = "";
  if (tone.toLowerCase().includes("enthusiastic")) {
    coldEmailBody = `Hi ${hiringManagerName},

I was excited to see ${extractedCompany} expanding its team for the ${extractedJobTitle} role!

With a track record of driving impactful results, I wanted to share how my background directly fits your current growth goals.

${primaryHighlight}

I know your schedule is busy, so I'll get straight to the point: I would love 10 minutes to discuss how I can bring this same momentum to ${extractedCompany}.

Are you open to a brief conversation next Tuesday or Wednesday?

Best regards,

${candidateName}`;
  } else if (tone.toLowerCase().includes("executive")) {
    coldEmailBody = `Dear ${hiringManagerName},

I am reaching out regarding strategic execution for the ${extractedJobTitle} position at ${extractedCompany}.

Throughout my career, I have focused on driving measurable performance improvements, scaling operations, and fostering technical excellence.

Key Value Delivered:
- ${primaryHighlight}

I would welcome a brief conversation to explore how my experience aligns with ${extractedCompany}'s key priorities for this quarter.

Are you available for a 10-minute intro call next week?

Sincerely,

${candidateName}`;
  } else {
    // Default Direct & Value-driven
    coldEmailBody = `Hi ${hiringManagerName},

I noticed ${extractedCompany} is currently hiring for a ${extractedJobTitle}, and I wanted to reach out directly to introduce myself.

My background aligns closely with the core requirements of this role:

${primaryHighlight}

I know how valuable your time is, so I'll keep this brief: I'm eager to help your team hit its upcoming performance targets and streamline key initiatives.

Would you be open to a quick 10-minute chat next Tuesday or Wednesday to see if my background matches your team's needs?

Best regards,

${candidateName}`;
  }

  // Build LinkedIn InMail (~100-110 words)
  const inMailSubject = `${extractedJobTitle} Candidate - Brief Inquiry`;
  const inMailBody = `Hi ${hiringManagerName},

I hope you're having a great week! I saw that ${extractedCompany} is growing and hiring for a ${extractedJobTitle}.

Having spent time building high-impact solutions, I was particularly drawn to your team's mission. In my past work, ${primaryHighlight.slice(0, 140)}...

I'd love to connect here on LinkedIn or jump on a brief 5-minute call to see if my background aligns with what you're looking for.

Best,
${candidateName}`;

  const coldEmailFullText = `Subject: ${coldEmailSubject}\n\n${coldEmailBody}`;
  const inMailFullText = `Subject: ${inMailSubject}\n\n${inMailBody}`;

  return {
    coldEmail: {
      subject: coldEmailSubject,
      body: coldEmailBody,
      fullText: coldEmailFullText,
      wordCount: countWords(coldEmailBody),
    },
    linkedInInMail: {
      subject: inMailSubject,
      body: inMailBody,
      fullText: inMailFullText,
      wordCount: countWords(inMailBody),
    },
  };
}
