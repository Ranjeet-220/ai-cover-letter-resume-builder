import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names with Tailwind CSS class merge optimization
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats an ISO date string or timestamp into a readable date string
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

/**
 * Calculates word count from a text string
 */
export function calculateWordCount(text: string): number {
  if (!text || !text.trim()) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Calculates estimated reading time in minutes based on average 200 wpm
 */
export function calculateReadTime(text: string): number {
  const wordCount = calculateWordCount(text);
  if (wordCount === 0) return 0;
  return Math.max(1, Math.ceil(wordCount / 200));
}
