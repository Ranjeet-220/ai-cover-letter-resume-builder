/**
 * ATS Match Analysis & Keyword Auto-Weaving Utilities
 */

export interface AtsAnalysisResult {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  strengths: string[];
  recommendations: string[];
}

const COMMON_TECH_KEYWORDS = [
  'React', 'Next.js', 'TypeScript', 'JavaScript', 'Node.js', 'Express', 'Python',
  'Django', 'FastAPI', 'Java', 'Spring Boot', 'C++', 'C#', '.NET', 'Go', 'Rust',
  'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'GraphQL', 'REST API', 'REST APIs',
  'Docker', 'Kubernetes', 'AWS', 'Google Cloud', 'Azure', 'CI/CD', 'Git',
  'System Design', 'Microservices', 'Agile', 'Scrum', 'Product Strategy',
  'Data Analysis', 'Machine Learning', 'PyTorch', 'TensorFlow', 'Tailwind CSS',
  'HTML5', 'CSS3', 'Redux', 'Unit Testing', 'Jest', 'Cypress', 'Leadership',
  'Project Management', 'Communication', 'Problem Solving', 'UI/UX Design',
  'Scalability', 'Performance Optimization', 'Security', 'DevOps'
];

const FALLBACK_STOP_WORDS = new Set([
  'about', 'after', 'before', 'being', 'could', 'having', 'other', 'should',
  'their', 'there', 'these', 'those', 'which', 'where', 'would', 'years',
  'experience', 'looking', 'required', 'requirements', 'responsibilities',
]);

/** Matches a term as a complete token/phrase instead of as an arbitrary substring. */
export function containsKeyword(text: string, keyword: string): boolean {
  const normalizedKeyword = keyword.trim();
  if (!normalizedKeyword) return false;

  const escaped = normalizedKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const startsWithWord = /[\p{L}\p{N}]/u.test(normalizedKeyword[0]);
  const endsWithWord = /[\p{L}\p{N}]/u.test(normalizedKeyword[normalizedKeyword.length - 1]);
  const prefix = startsWithWord ? '(?<![\\p{L}\\p{N}_])' : '';
  const suffix = endsWithWord ? '(?![\\p{L}\\p{N}_])' : '';

  return new RegExp(`${prefix}${escaped}${suffix}`, 'iu').test(text);
}

/**
 * Calculates ATS match score and extracts matched/missing keywords algorithmically
 */
export function calculateAtsMatchScore(
  documentText: string,
  jobDescription: string,
  jobTitle: string = ''
): AtsAnalysisResult {
  if (!jobDescription.trim()) {
    return {
      score: 85,
      matchedKeywords: ['Communication', 'Problem Solving', 'Leadership'],
      missingKeywords: [],
      strengths: ['Clear structure and tone.', 'Professional presentation.'],
      recommendations: ['Paste a Job Description to compute exact ATS keyword match.'],
    };
  }

  // 1. Find keywords present in Job Description
  const targetKeywordsSet = new Set<string>();

  COMMON_TECH_KEYWORDS.forEach((kw) => {
    if (containsKeyword(jobDescription, kw)) {
      targetKeywordsSet.add(kw);
    }
  });

  // Extract significant words (> 4 chars) from JD if few common keywords matched
  if (targetKeywordsSet.size < 4) {
    const words = jobDescription
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 4 && !FALLBACK_STOP_WORDS.has(w.toLowerCase()));

    const wordCounts: Record<string, number> = {};
    words.forEach((w) => {
      const lower = w.toLowerCase();
      wordCounts[lower] = (wordCounts[lower] || 0) + 1;
    });

    const sortedWords = Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    sortedWords.forEach(([w]) => {
      const formatted = w.charAt(0).toUpperCase() + w.slice(1);
      targetKeywordsSet.add(formatted);
    });
  }

  const targetKeywords = Array.from(targetKeywordsSet);
  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  targetKeywords.forEach((kw) => {
    if (containsKeyword(documentText, kw)) {
      matchedKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  });

  // 2. Score Calculation
  const total = targetKeywords.length || 1;
  const matchRatio = matchedKeywords.length / total;

  let rawScore = Math.round(matchRatio * 55 + 40);

  if (jobTitle && containsKeyword(documentText, jobTitle)) {
    rawScore += 5;
  }

  if (documentText.length > 250) {
    rawScore += 5;
  }

  const score = Math.min(100, Math.max(35, rawScore));

  // 3. Strengths & Recommendations
  const strengths: string[] = [];
  if (matchedKeywords.length > 0) {
    strengths.push(`Matched ${matchedKeywords.length} key requirements including ${matchedKeywords.slice(0, 3).join(', ')}.`);
  }
  if (jobTitle && containsKeyword(documentText, jobTitle)) {
    strengths.push(`Explicitly addresses target role: ${jobTitle}.`);
  }
  if (strengths.length === 0) {
    strengths.push('Good foundation and clear document layout.');
  }

  const recommendations: string[] = [];
  if (missingKeywords.length > 0) {
    recommendations.push(`Weave missing keywords (${missingKeywords.slice(0, 3).join(', ')}) into your document.`);
  } else {
    recommendations.push('Excellent keyword alignment! All extracted JD requirements are present.');
  }
  recommendations.push('Quantify key achievements with measurable metrics (e.g. % increase, latency reduction).');

  return {
    score,
    matchedKeywords,
    missingKeywords,
    strengths,
    recommendations,
  };
}

/**
 * Naturally weaves a missing keyword into document text
 */
export function weaveKeywordIntoText(documentText: string, keyword: string): string {
  const trimmedKw = keyword.trim();
  if (!trimmedKw) return documentText;

  // If already present, return unchanged
  if (containsKeyword(documentText, trimmedKw)) {
    return documentText;
  }

  // Handle empty text
  if (!documentText.trim()) {
    return `Experienced professional proficient in ${trimmedKw}.`;
  }

  // Pattern 1: Look for existing skill lists like "React, TypeScript, and Node.js."
  const listRegex = /(including|proficient in|experience with|expertise in|skills in|technologies such as|using|with)\s+([A-Za-z0-9\s,\.\-\/\+]+)/i;
  const match = documentText.match(listRegex);

  if (match && match[0] && !match[0].includes('\n\n')) {
    // Insert into existing list
    const originalPhrase = match[0];
    let newPhrase = '';

    if (originalPhrase.includes(' and ')) {
      newPhrase = originalPhrase.replace(/\s+and\s+/, `, ${trimmedKw}, and `);
    } else if (originalPhrase.endsWith('.')) {
      newPhrase = originalPhrase.slice(0, -1) + `, and ${trimmedKw}.`;
    } else {
      newPhrase = `${originalPhrase}, ${trimmedKw}`;
    }

    return documentText.replace(originalPhrase, newPhrase);
  }

  // Pattern 2: Insert natural sentence before closing signature or last paragraph
  const paragraphs = documentText.split(/\n\n+/);
  const weaveSentence = `Additionally, I bring hands-on experience with ${trimmedKw}, applying it to drive technical efficiency and project outcomes.`;

  if (paragraphs.length >= 2) {
    // Insert into paragraph 2 or last paragraph before closing
    let insertIdx = paragraphs.length - 2;
    if (insertIdx < 1) insertIdx = 1;

    // Avoid inserting into signature paragraph (Sincerely, Best regards, etc.)
    const lastPara = paragraphs[paragraphs.length - 1].toLowerCase();
    if (lastPara.startsWith('sincerely') || lastPara.startsWith('best regards') || lastPara.startsWith('thank you')) {
      insertIdx = Math.max(0, paragraphs.length - 2);
    }

    paragraphs[insertIdx] = `${paragraphs[insertIdx]} ${weaveSentence}`;
    return paragraphs.join('\n\n');
  }

  // Fallback: Append sentence
  return `${documentText.trim()}\n\n${weaveSentence}`;
}
