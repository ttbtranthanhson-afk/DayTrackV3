import type { PlanInput, PlanOption, PlanResult } from '../ai';

export interface ValidationIssue {
  id: string;
  reasons: string[];
}

function toMin(value: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(value ?? '').trim());
  if (!m) return null;
  const h = +m[1];
  const mm = +m[2];
  if (h > 23 || mm > 59) return null;
  return h * 60 + mm;
}

function validateOption(option: PlanOption): string[] {
  const reasons: string[] = [];
  const blocks = option.blocks ?? [];
  if (!blocks.length) reasons.push('empty');

  const spans: Array<{ title: string; start: number; end: number }> = [];
  for (const block of blocks) {
    const start = toMin(block.start);
    const end = toMin(block.end);
    if (start == null || end == null) {
      reasons.push(`${block.title}:bad-time`);
      continue;
    }
    const overnight = end <= start;
    if (!overnight) {
      if (start < 0 || start > 1380) reasons.push(`${block.title}:out-of-range`);
      if (end > 1440) reasons.push(`${block.title}:out-of-range`);
      if (end - start < 5) reasons.push(`${block.title}:too-short`);
      spans.push({ title: block.title, start, end });
    } else if (start < 18 * 60) {
      reasons.push(`${block.title}:bad-overnight`);
    }
  }

  spans.sort((a, b) => a.start - b.start);
  for (let i = 1; i < spans.length; i += 1) {
    if (spans[i].start < spans[i - 1].end) {
      reasons.push(`overlap:${spans[i - 1].title}/${spans[i].title}`);
    }
  }

  return reasons;
}

export function hardGate(result: PlanResult | undefined, _input: PlanInput): { result: PlanResult; rejected: ValidationIssue[] } {
  const options = result?.options ?? [];
  const valid: PlanOption[] = [];
  const rejected: ValidationIssue[] = [];

  const seen = new Set<string>();
  for (const option of options) {
    const fingerprint = option.blocks.map(b => `${b.title}${b.start}${b.end}`).join('|');
    if (seen.has(fingerprint)) {
      rejected.push({ id: option.id, reasons: ['duplicate'] });
      continue;
    }
    const reasons = validateOption(option);
    if (reasons.length === 0) {
      seen.add(fingerprint);
      valid.push(option);
    } else {
      rejected.push({ id: option.id, reasons });
    }
  }

  return { result: { options: valid }, rejected };
}
