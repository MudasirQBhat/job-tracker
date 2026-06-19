// Derive "needs follow-up" purely from existing data — no backend changes needed.

export const daysSince = (date) => {
  if (!date) return 0;
  const ms = Date.now() - new Date(date).getTime();
  return Math.max(0, Math.floor(ms / 86400000));
};

// Open applications that have gone quiet deserve a nudge.
// Applied with no movement for 10+ days, or Interviewing for 7+ days.
export const needsFollowUp = (job) => {
  if (!job || job.status === 'Offer' || job.status === 'Rejected') return false;
  const d = daysSince(job.applied_date);
  if (job.status === 'Applied') return d >= 10;
  if (job.status === 'Interviewing') return d >= 7;
  return false;
};
