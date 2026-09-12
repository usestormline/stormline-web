export function formatSensitivity(sensitivity: number) {
  if (sensitivity >= 3) return 'Direct';
  if (sensitivity === 2) return 'Sector';
  if (sensitivity === 1) return 'Broad';
  return 'None';
}

export function formatStormRating(rating: number) {
  if (rating >= 4) return 'Severe';
  if (rating === 3) return 'High';
  if (rating === 2) return 'Elevated';
  if (rating === 1) return 'Guarded';
  return 'Unknown';
}

export function getStormColor(rating: number) {
  if (rating >= 4) return 'bg-black text-white border-black';
  if (rating === 3) return 'bg-red-600 text-white border-red-700';
  if (rating === 2) return 'bg-gray-100 text-black border-line-strong';
  return 'bg-white text-muted border-line';
}

export function getSensitivityColor(sensitivity: number) {
  if (sensitivity >= 3) return 'border-black bg-black text-white';
  if (sensitivity === 2) return 'border-black bg-white text-black';
  return 'border-line-strong bg-gray-50 text-muted';
}

export function currentUtcWeek() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const day = start.getUTCDay();
  start.setUTCDate(start.getUTCDate() - (day === 0 ? 6 : day - 1));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 6);
  return {
    from: start.toISOString().slice(0, 10),
    to: end.toISOString().slice(0, 10),
  };
}

export function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function addUtcDays(date: Date, days: number) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

export function formatEventTime(dateStr: string) {
  return new Date(dateStr).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  });
}
