export function emptyDailyJournalForm() {
  return {
    title: '',
    quickSummary: '',
    marketOverview: '',
    whatWentWell: '',
    whatToImprove: '',
    screenshots: [],
  };
}

export function todayIsoDate() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function htmlHasContent(html) {
  if (!html || !String(html).trim()) return false;
  const t = String(html).trim();
  if (t === '<p></p>' || t === '<p><br></p>' || t === '<p><br/></p>') return false;
  const text = t.replace(/<[^>]+>/g, '').trim();
  return text.length > 0 || /<img[\s>]/i.test(t);
}

export function journalFormHasContent(form) {
  if (!form) return false;
  return Boolean(
    form.title?.trim() ||
      form.quickSummary?.trim() ||
      htmlHasContent(form.marketOverview) ||
      htmlHasContent(form.whatWentWell) ||
      htmlHasContent(form.whatToImprove) ||
      (Array.isArray(form.screenshots) && form.screenshots.length > 0)
  );
}

export function formatJournalDateHeader(dateStr) {
  const date = new Date(`${dateStr}T12:00:00`);
  const long = date.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const weekday = date.toLocaleDateString(undefined, { weekday: 'long' });
  return { long, weekday };
}
