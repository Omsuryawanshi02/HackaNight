/**
 * Formats a photo upload or capture timestamp for display.
 * Default timezone: Asia/Kolkata (IST).
 * Format example: "10 Oct 2026, 10:42 AM IST"
 * If no timestamp exists, returns neutral "-" without fabricated dates.
 */
export function formatUploadTimestamp(isoStr) {
  if (!isoStr || typeof isoStr !== 'string' || isoStr.trim() === '') {
    return '-';
  }

  try {
    const date = new Date(isoStr);
    if (isNaN(date.getTime())) {
      return '-';
    }

    // Format for Asia/Kolkata timezone
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const formatted = formatter.format(date);
    // Replace am/pm with AM/PM and append IST
    const withAmPmUpper = formatted.replace(/\b(am|pm)\b/i, (m) => m.toUpperCase());
    return `${withAmPmUpper} IST`;
  } catch {
    return '-';
  }
}
