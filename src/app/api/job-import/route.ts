import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { getErrorMessage, isRecord } from "@/lib/errors";

interface JobImportRequestBody {
  url?: string;
  model?: string;
  apiKey?: string;
}

const COMMON_SKILLS_LIST = [
  "React", "Next.js", "TypeScript", "JavaScript", "Node.js", "Express", "Python",
  "Django", "FastAPI", "Java", "Spring Boot", "C++", "C#", ".NET", "Go", "Rust",
  "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "GraphQL", "REST APIs",
  "Docker", "Kubernetes", "AWS", "Google Cloud", "Azure", "CI/CD", "Git",
  "System Design", "Microservices", "Agile", "Scrum", "Product Strategy",
  "Data Analysis", "Machine Learning", "PyTorch", "TensorFlow", "Tailwind CSS",
  "HTML5/CSS3", "Redux", "Unit Testing", "Jest", "Cypress", "Leadership",
  "Project Management", "Communication", "Problem Solving", "UI/UX Design"
];

export async function POST(req: NextRequest) {
  try {
    const body: JobImportRequestBody = await req.json();
    let rawUrl = body.url?.trim() || "";

    if (!rawUrl) {
      return NextResponse.json(
        { success: false, error: "A valid job posting URL is required." },
        { status: 400 }
      );
    }

    if (!rawUrl.startsWith("http://") && !rawUrl.startsWith("https://")) {
      rawUrl = `https://${rawUrl}`;
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(rawUrl);
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid URL format provided." },
        { status: 400 }
      );
    }

    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return NextResponse.json(
        { success: false, error: "Only HTTP and HTTPS job posting URLs are supported." },
        { status: 400 }
      );
    }

    if (parsedUrl.username || parsedUrl.password) {
      return NextResponse.json(
        { success: false, error: "URLs containing credentials are not supported." },
        { status: 400 }
      );
    }

    const geminiKey = body.apiKey?.trim() || process.env.GEMINI_API_KEY || "";
    const requestedModel = body.model || "gemini-2.5-flash";

    let fetchedHtml = "";
    let fetchErrorMsg = "";

    try {
      const response = await fetchPublicPage(parsedUrl);

      if (response.ok) {
        const contentType = response.headers.get("content-type")?.toLowerCase() || "";
        if (contentType && !contentType.includes("text/") && !contentType.includes("json")) {
          fetchErrorMsg = `Unsupported content type: ${contentType.split(";")[0]}`;
        } else {
          fetchedHtml = await readLimitedText(response, 2_000_000);
        }
      } else {
        fetchErrorMsg = `HTTP ${response.status} ${response.statusText}`;
      }
    } catch (err: unknown) {
      fetchErrorMsg = getErrorMessage(err, "Network request failed");
    }

    const cleanText = fetchedHtml ? stripHtmlToText(fetchedHtml) : "";
    const jsonLdData = fetchedHtml ? extractJsonLd(fetchedHtml) : null;
    const metaData = fetchedHtml ? extractMetaTags(fetchedHtml) : null;

    if (!fetchedHtml.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: fetchErrorMsg
            ? `Could not retrieve the job posting: ${fetchErrorMsg}.`
            : "The job posting returned no readable content.",
        },
        { status: 422 }
      );
    }

    // 1. Primary Extraction: Gemini 2.5 Flash
    if (geminiKey && (cleanText.length > 50 || jsonLdData || metaData)) {
      try {
        const genAI = new GoogleGenerativeAI(geminiKey);
        let targetModel = "gemini-2.5-flash";
        
        if (requestedModel.includes("2.5-pro") || requestedModel.includes("pro")) {
          targetModel = "gemini-2.5-pro";
        }

        let model;
        try {
          model = genAI.getGenerativeModel({
            model: targetModel,
            generationConfig: { responseMimeType: "application/json" },
          });
        } catch {
          model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" },
          });
        }

        const sampleText = cleanText.slice(0, 20000);
        const prompt = `
You are Google Gemini 2.5 Flash, an expert AI ATS parser and job scraper.
Extract structured details from the following web page content.

URL: ${parsedUrl.toString()}

${jsonLdData ? `STRUCTURED JSON-LD DATA:\n${JSON.stringify(jsonLdData, null, 2)}\n` : ""}
${metaData ? `META TAGS:\n${JSON.stringify(metaData, null, 2)}\n` : ""}

PAGE CONTENT:
"""
${sampleText}
"""

Return ONLY a JSON object with the following schema:
{
  "jobTitle": "Exact job title (e.g. Senior Software Engineer)",
  "companyName": "Company name",
  "location": "Location (e.g. Remote, San Francisco CA, Hybrid)",
  "jobDescription": "Full job description including overview, responsibilities, and requirements formatted in clean paragraph markdown text",
  "keySkills": ["skill1", "skill2", "skill3", "skill4", "skill5"]
}
`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();
        const parsed: unknown = JSON.parse(responseText);

        if (isRecord(parsed) && (parsed.jobTitle || parsed.jobDescription)) {
          return NextResponse.json({
            success: true,
            jobTitle: cleanString(parsed.jobTitle) || metaData?.title || extractFallbackTitleFromUrl(parsedUrl),
            companyName: cleanString(parsed.companyName) || metaData?.company || "Target Company",
            location: cleanString(parsed.location) || "Remote / Unspecified",
            jobDescription: cleanString(parsed.jobDescription) || cleanText.slice(0, 3000),
            keySkills: sanitizeKeySkills(parsed.keySkills, cleanText),
            method: "gemini",
          });
        }
      } catch (geminiError: unknown) {
        console.warn("Gemini API job import failed, falling back to regex parser:", getErrorMessage(geminiError, "Unknown error"));
      }
    }

    // 2. Secondary Fallback Regex & Heuristic Parser
    const fallbackData = runFallbackParser(fetchedHtml, parsedUrl, cleanText, jsonLdData, metaData);

    return NextResponse.json({
      success: true,
      jobTitle: fallbackData.jobTitle,
      companyName: fallbackData.companyName,
      location: fallbackData.location,
      jobDescription: fallbackData.jobDescription,
      keySkills: fallbackData.keySkills,
      method: "fallback",
      ...(fetchErrorMsg ? { note: `Direct URL fetch encountered: ${fetchErrorMsg}. Parsed available meta and URL parameters.` } : {}),
    });

  } catch (error: unknown) {
    console.error("Error in /api/job-import:", error);
    return NextResponse.json(
      {
        success: false,
        error: getErrorMessage(error, "Failed to import job details from URL."),
      },
      { status: 500 }
    );
  }
}

/**
 * Strips script tags, style tags, HTML comments, and formatting to clean text
 */
function stripHtmlToText(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, " ")
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<br\s*[\/]?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extracts schema.org JobPosting JSON-LD
 */
function extractJsonLd(html: string): Record<string, unknown> | null {
  try {
    const jsonLdMatches = html.match(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
    if (!jsonLdMatches) return null;

    for (const match of jsonLdMatches) {
      const content = match.replace(/<script[^>]*>/i, "").replace(/<\/script>/i, "").trim();
      try {
        const parsed: unknown = JSON.parse(content);
        const findJob = (obj: unknown): Record<string, unknown> | null => {
          if (!obj) return null;
          if (Array.isArray(obj)) {
            for (const item of obj) {
              const res = findJob(item);
              if (res) return res;
            }
          } else if (isRecord(obj)) {
            if (obj["@type"] === "JobPosting" || (typeof obj["@type"] === "string" && obj["@type"].includes("JobPosting"))) {
              return obj;
            }
            if (obj["@graph"] && Array.isArray(obj["@graph"])) {
              return findJob(obj["@graph"]);
            }
          }
          return null;
        };

        const jobPosting = findJob(parsed);
        if (jobPosting) return jobPosting;
      } catch {
        continue;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Extracts OpenGraph and Meta tags
 */
function extractMetaTags(html: string): { title?: string; company?: string; location?: string; description?: string } {
  const getMeta = (prop: string): string => {
    const match =
      html.match(new RegExp(`<meta\\s+(?:property|name)=["']${prop}["']\\s+content=["']([^"']+)["']`, "i")) ||
      html.match(new RegExp(`<meta\\s+content=["']([^"']+)["']\\s+(?:property|name)=["']${prop}["']`, "i"));
    return match ? match[1].trim() : "";
  };

  const titleTagMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const rawTitle = titleTagMatch ? titleTagMatch[1].trim() : "";

  return {
    title: getMeta("og:title") || getMeta("twitter:title") || rawTitle,
    company: getMeta("og:site_name") || getMeta("author") || getMeta("publisher"),
    description: getMeta("og:description") || getMeta("description") || getMeta("twitter:description"),
  };
}

/**
 * Fallback Regex and Heuristic parser for ATS platforms (Greenhouse, Lever, LinkedIn, Indeed, Workday, etc.)
 */
function runFallbackParser(
  html: string,
  url: URL,
  cleanText: string,
  jsonLd: Record<string, unknown> | null,
  meta: { title?: string; company?: string; location?: string; description?: string } | null
): {
  jobTitle: string;
  companyName: string;
  location: string;
  jobDescription: string;
  keySkills: string[];
} {
  let jobTitle = "";
  let companyName = "";
  let location = "";
  let jobDescription = "";
  let keySkills: string[] = [];

  // JSON-LD extraction
  if (jsonLd) {
    if (typeof jsonLd.title === "string") jobTitle = jsonLd.title;
    if (jsonLd.hiringOrganization) {
      companyName = typeof jsonLd.hiringOrganization === "string" 
        ? jsonLd.hiringOrganization 
        : isRecord(jsonLd.hiringOrganization) && typeof jsonLd.hiringOrganization.name === "string"
          ? jsonLd.hiringOrganization.name
          : "";
    }
    if (jsonLd.jobLocation) {
      if (typeof jsonLd.jobLocation === "string") {
        location = jsonLd.jobLocation;
      } else if (isRecord(jsonLd.jobLocation) && isRecord(jsonLd.jobLocation.address)) {
        const addr = jsonLd.jobLocation.address;
        location = [addr.addressLocality, addr.addressRegion, addr.addressCountry]
          .filter((part): part is string => typeof part === "string" && Boolean(part))
          .join(", ");
      }
    }
    if (typeof jsonLd.description === "string") {
      jobDescription = stripHtmlToText(jsonLd.description);
    }
  }

  // Meta parsing if title or company missing
  if (!jobTitle && meta?.title) {
    jobTitle = meta.title;
  }
  if (!companyName && meta?.company) {
    companyName = meta.company;
  }
  if (!jobDescription && meta?.description) {
    jobDescription = meta.description;
  }

  // Title Regex refinement (e.g. "Senior Software Engineer - Google - Mountain View, CA")
  if (jobTitle) {
    const parts = jobTitle.split(/\s+[-|•:]\s+/);
    if (parts.length >= 2) {
      if (!companyName) {
        // e.g. "Software Engineer | Netflix"
        companyName = parts[1].replace(/careers|jobs|hiring|inc|llc/gi, "").trim();
      }
      jobTitle = parts[0].trim();
    }
  }

  // Domain specific fallback hints
  const hostname = url.hostname.toLowerCase();
  if (hostname.includes("greenhouse.io")) {
    const ghCompany = url.pathname.split("/")[1] || "";
    if (!companyName && ghCompany) {
      companyName = capitalize(ghCompany);
    }
  } else if (hostname.includes("lever.co")) {
    const leverCompany = url.pathname.split("/")[1] || "";
    if (!companyName && leverCompany) {
      companyName = capitalize(leverCompany);
    }
  } else if (hostname.includes("linkedin.com")) {
    if (!companyName) companyName = "LinkedIn Posting";
  } else if (hostname.includes("indeed.com")) {
    if (!companyName) companyName = "Indeed Job";
  }

  // Fallbacks if still empty
  if (!jobTitle) jobTitle = extractFallbackTitleFromUrl(url);
  if (!companyName) companyName = extractFallbackCompanyFromUrl(url);
  if (!location) location = "Remote / On-site";
  if (!jobDescription) {
    jobDescription = cleanText.length > 100 
      ? cleanText.slice(0, 2500) 
      : `Job posting imported from ${url.hostname}. Key details and requirements extracted from position announcement.`;
  }

  // Extract skills from text
  keySkills = extractSkillsFromText(cleanText || jobDescription);

  return {
    jobTitle: cleanString(jobTitle),
    companyName: cleanString(companyName),
    location: cleanString(location),
    jobDescription: cleanString(jobDescription),
    keySkills,
  };
}

function extractSkillsFromText(text: string): string[] {
  const textLower = text.toLowerCase();
  const matched: string[] = [];

  COMMON_SKILLS_LIST.forEach((skill) => {
    const skillLower = skill.toLowerCase();
    const regex = new RegExp(`\\b${escapeRegExp(skillLower)}\\b`, "i");
    if (regex.test(textLower)) {
      matched.push(skill);
    }
  });

  if (matched.length < 3) {
    // Add default core professional skills
    ["Communication", "Problem Solving", "Strategic Thinking", "Teamwork"].forEach((s) => {
      if (!matched.includes(s)) matched.push(s);
    });
  }

  return matched.slice(0, 8);
}

function sanitizeKeySkills(skills: unknown, text: string): string[] {
  if (Array.isArray(skills)) {
    const cleaned = skills
      .map((s) => String(s).trim())
      .filter((s) => s.length > 0 && s.length < 40);
    if (cleaned.length > 0) return cleaned.slice(0, 10);
  } else if (typeof skills === "string") {
    const split = skills.split(",").map((s) => s.trim()).filter(Boolean);
    if (split.length > 0) return split.slice(0, 10);
  }

  return extractSkillsFromText(text);
}

function extractFallbackTitleFromUrl(url: URL): string {
  const path = url.pathname;
  const segments = path.split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1] || "";
  
  if (lastSegment && !/^\d+$/.test(lastSegment)) {
    const words = lastSegment
      .replace(/[-_]/g, " ")
      .replace(/\.(html|php|aspx)$/i, "")
      .replace(/\b(jobs?|view|detail|careers?)\b/gi, "")
      .trim();
    if (words.length > 3) {
      return capitalizeWords(words);
    }
  }
  return "Target Position";
}

function extractFallbackCompanyFromUrl(url: URL): string {
  const host = url.hostname.replace(/^www\./, "");
  const parts = host.split(".");
  if (parts.length >= 2) {
    const name = parts[parts.length - 2];
    if (["greenhouse", "lever", "workday", "indeed", "linkedin"].includes(name.toLowerCase()) && parts.length > 2) {
      return capitalize(parts[0]);
    }
    return capitalize(name);
  }
  return "Target Company";
}

function cleanString(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/\s+/g, " ")
    .trim();
}

function capitalize(s: string): string {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function capitalizeWords(str: string): string {
  return str
    .split(" ")
    .map((w) => capitalize(w))
    .join(" ");
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function fetchPublicPage(initialUrl: URL): Promise<Response> {
  let currentUrl = initialUrl;

  for (let redirects = 0; redirects <= 3; redirects += 1) {
    await assertPublicHostname(currentUrl.hostname);
    const response = await fetch(currentUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; CoverCraftJobImporter/1.0)",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "manual",
      signal: AbortSignal.timeout(12000),
    });

    if (![301, 302, 303, 307, 308].includes(response.status)) return response;
    const location = response.headers.get("location");
    if (!location) throw new Error("Job site returned an invalid redirect.");
    currentUrl = new URL(location, currentUrl);
    if (currentUrl.protocol !== "http:" && currentUrl.protocol !== "https:") {
      throw new Error("Job site redirected to an unsupported URL.");
    }
  }

  throw new Error("Job site redirected too many times.");
}

async function assertPublicHostname(hostname: string): Promise<void> {
  const normalized = hostname.toLowerCase().replace(/\.$/, "");
  if (normalized === "localhost" || normalized.endsWith(".localhost") || normalized.endsWith(".local")) {
    throw new Error("Private or local network URLs are not allowed.");
  }

  const addresses = isIP(normalized)
    ? [{ address: normalized }]
    : await lookup(normalized, { all: true, verbatim: true });

  if (addresses.length === 0 || addresses.some(({ address }) => isPrivateAddress(address))) {
    throw new Error("Private or local network URLs are not allowed.");
  }
}

function isPrivateAddress(address: string): boolean {
  const value = address.toLowerCase();
  if (value.includes(":")) {
    if (value.startsWith("::ffff:")) {
      const mapped = value.slice(7);
      if (mapped.includes(".")) return isPrivateAddress(mapped);
      const groups = mapped.split(":");
      if (groups.length === 2 && groups.every((group) => /^[0-9a-f]{1,4}$/.test(group))) {
        const high = Number.parseInt(groups[0], 16);
        const low = Number.parseInt(groups[1], 16);
        return isPrivateAddress(
          `${high >> 8}.${high & 255}.${low >> 8}.${low & 255}`
        );
      }
      return true;
    }
    return value === "::1" || value === "::" || value.startsWith("fc") || value.startsWith("fd") ||
      value.startsWith("fe8") || value.startsWith("fe9") || value.startsWith("fea") || value.startsWith("feb") ||
      value.startsWith("2001:db8:");
  }

  const octets = value.split(".").map(Number);
  if (octets.length !== 4 || octets.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return true;
  const [a, b] = octets;
  return a === 0 || a === 10 || a === 127 || a >= 224 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19));
}

async function readLimitedText(response: Response, maxBytes: number): Promise<string> {
  const declaredLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw new Error("Job page is too large to import.");
  }
  if (!response.body) return "";

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      throw new Error("Job page is too large to import.");
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}
