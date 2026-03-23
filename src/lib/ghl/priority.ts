// Applicant Priority Service — deterministic ranking for resident applicants.
// Runs server-side. Reads contact custom fields, computes priority, writes back.

import { ghl } from './client';

interface ApplicantPriorityInput {
  id: string;
  underContract: boolean;
  contractDate: string | null; // ISO date
  communityCommitmentDate: string | null; // ISO date
  profileCompleteness: number; // 0-100
  createdAt: string; // ISO date
}

interface PriorityResult {
  bucket: 'A - Under Contract' | 'B - Committed' | 'C - Interested' | 'D - General';
  score: number; // higher = higher priority
  reason: string;
}

function computePriority(input: ApplicantPriorityInput): PriorityResult {
  let score = 0;
  let bucket: PriorityResult['bucket'] = 'D - General';
  const reasons: string[] = [];

  const now = Date.now();
  const dayMs = 86400000;

  // Rule 1: under contract > not under contract
  if (input.underContract) {
    score += 10000;
    bucket = 'A - Under Contract';
    reasons.push('Under contract');

    // Rule 2: earlier contract date > later
    if (input.contractDate) {
      const contractTs = new Date(input.contractDate).getTime();
      const daysUntil = Math.max(0, (contractTs - now) / dayMs);
      score += Math.max(0, 5000 - Math.round(daysUntil * 5));
      reasons.push(`Contract date: ${input.contractDate}`);
    }
  } else {
    // Rule 3: community commitment date
    if (input.communityCommitmentDate) {
      score += 5000;
      bucket = 'B - Committed';
      const commitTs = new Date(input.communityCommitmentDate).getTime();
      const daysUntil = Math.max(0, (commitTs - now) / dayMs);
      score += Math.max(0, 3000 - Math.round(daysUntil * 3));
      reasons.push(`Committed: ${input.communityCommitmentDate}`);
    } else {
      bucket = 'C - Interested';
      score += 1000;
      reasons.push('Interested, no commitment date');
    }
  }

  // Rule 4: profile completeness tiebreaker
  score += Math.round((input.profileCompleteness || 0) * 2);
  if (input.profileCompleteness >= 80) reasons.push('Profile mostly complete');

  // Rule 5: deterministic fallback by creation date (earlier = higher)
  if (input.createdAt) {
    const createdTs = new Date(input.createdAt).getTime();
    const ageInDays = Math.max(0, (now - createdTs) / dayMs);
    score += Math.min(500, Math.round(ageInDays));
  }

  return { bucket, score, reason: reasons.join('; ') };
}

export async function calculateAndWritePriority(contactId: string): Promise<PriorityResult | null> {
  try {
    const contact = await ghl.getContact(contactId);
    if (!contact?.contact) return null;
    const c = contact.contact;
    const cf = c.customField || {};

    const input: ApplicantPriorityInput = {
      id: contactId,
      underContract: cf.under_contract === true || cf.under_contract === 'true',
      contractDate: cf.contract_date || null,
      communityCommitmentDate: cf.community_commitment_date || null,
      profileCompleteness: Number(cf.profile_completeness) || 0,
      createdAt: c.dateAdded || new Date().toISOString(),
    };

    const result = computePriority(input);

    await ghl.updateContact(contactId, {
      customField: {
        priority_bucket: result.bucket,
        priority_score: result.score,
        priority_reason: result.reason,
        priority_last_calculated_at: new Date().toISOString(),
      },
    });

    return result;
  } catch (err) {
    console.error('Priority calculation failed for contact', contactId, err);
    return null;
  }
}

export async function rankAllApplicants(): Promise<number> {
  try {
    const res = await ghl.getContacts({ limit: '100' });
    const contacts = res.contacts || [];

    // Calculate priority for all
    const results: { id: string; score: number; result: PriorityResult }[] = [];
    for (const c of contacts) {
      const result = await calculateAndWritePriority(c.id);
      if (result) results.push({ id: c.id, score: result.score, result });
    }

    // Sort by score descending, assign ranks
    results.sort((a, b) => b.score - a.score);
    for (let i = 0; i < results.length; i++) {
      await ghl.updateContact(results[i].id, {
        customField: { priority_rank: i + 1 },
      });
    }

    return results.length;
  } catch (err) {
    console.error('Rank all applicants failed:', err);
    return 0;
  }
}

// Export for testing
export { computePriority };
export type { ApplicantPriorityInput, PriorityResult };
