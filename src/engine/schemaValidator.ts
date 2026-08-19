import { z } from 'zod';
import { JobListing, SchemaValidationStatus } from '../types/ingestion';

export const StrictJobPostingSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(2),
  company: z.string().min(1),
  location: z.string().min(1),
  salary: z.string().optional(),
  tags: z.array(z.string()).default([]),
  descriptionSnippet: z.string().min(10),
  sourceUrl: z.string().url(),
  scrapedAt: z.string(),
  sourceName: z.string(),
});

export class SchemaValidator {
  /**
   * Security Filter: Mask PII (Personal Email & Phone Numbers) and sanitize HTML XSS vectors
   */
  private static sanitizeText(input: string): string {
    if (!input) return '';
    return input
      // 1. Remove dangerous XSS tags (<script>, <iframe>, <object>, etc.)
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
      .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, '')
      .replace(/<[^>]+>/g, '')
      // 2. Mask Email PII (e.g. recruiter@company.com -> [PII EMAIL MASKED])
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[CONFIDENTIAL EMAIL MASKED]')
      // 3. Mask Phone PII (e.g. +91 9876543210 -> [PII PHONE MASKED])
      .replace(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, '[CONFIDENTIAL PHONE MASKED]')
      .trim();
  }

  /**
   * Security Filter: Enforce safe HTTP/HTTPS URL protocols to prevent javascript: or data: URI XSS attacks
   */
  private static sanitizeUrl(rawUrl?: string): string {
    if (!rawUrl) return 'https://acdyon.com/careers';
    const trimmed = rawUrl.trim();
    if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
      return trimmed;
    }
    return 'https://acdyon.com/careers';
  }

  public static validateAndSanitize(
    raw: Partial<JobListing>,
    strategyUsed: JobListing['parsingStrategyUsed']
  ): JobListing {
    const id = raw.id || `job-${Math.random().toString(36).substring(2, 9)}`;
    const scrapedAt = raw.scrapedAt || new Date().toISOString();
    const sourceName = raw.sourceName || 'Unknown';
    const sourceUrl = this.sanitizeUrl(raw.sourceUrl);

    const candidate = {
      id,
      title: this.sanitizeText(raw.title || 'Untitled Position'),
      company: this.sanitizeText(raw.company || 'Unknown Enterprise'),
      location: this.sanitizeText(raw.location || 'Remote / Unspecified'),
      salary: this.sanitizeText(raw.salary || '₹25,00,000 - ₹40,00,000 PA'),
      tags: Array.isArray(raw.tags) && raw.tags.length > 0 
        ? raw.tags.map((t) => this.sanitizeText(t)).filter(Boolean) 
        : ['Full-Time', 'Engineering'],
      descriptionSnippet: this.sanitizeText(raw.descriptionSnippet || 'No detailed description snippet extracted from source HTML payload.'),
      sourceUrl,
      scrapedAt,
      sourceName,
    };

    const result = StrictJobPostingSchema.safeParse(candidate);

    let schemaStatus: SchemaValidationStatus = 'VALID';
    if (!result.success) {
      schemaStatus = 'PARTIAL';
    } else if (strategyUsed !== 'PRIMARY_JSON_LD') {
      schemaStatus = 'RECOVERED_FALLBACK';
    }

    return {
      ...candidate,
      schemaStatus,
      parsingStrategyUsed: strategyUsed,
      rawPayloadPreview: raw.rawPayloadPreview || JSON.stringify(candidate, null, 2)
    };
  }
}
