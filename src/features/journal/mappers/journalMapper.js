import { emptyDailyJournalForm } from '@/constants/journal';

function mapScreenshotsFromApi(list) {
  if (!Array.isArray(list)) return [];
  return list.map((s) => ({
    id: s.id || crypto.randomUUID(),
    caption: s.caption ?? '',
    imageUrl: s.imageUrl ?? '',
  }));
}

export function dailyJournalFromApi(data) {
  if (!data) return emptyDailyJournalForm();
  return {
    title: data.title ?? '',
    quickSummary: data.quickSummary ?? '',
    marketOverview: data.marketOverview ?? data.preMarketPlan ?? '',
    whatWentWell: data.whatWentWell ?? '',
    whatToImprove: data.whatToImprove ?? data.postMarketPlan ?? data.postMarketReview ?? '',
    screenshots: mapScreenshotsFromApi(data.screenshotsJson),
  };
}

export function dailyJournalToApi(form) {
  const body = {};
  if (form.title != null) body.title = form.title;
  if (form.quickSummary != null) body.quickSummary = form.quickSummary;
  if (form.marketOverview != null) body.marketOverview = form.marketOverview;
  if (form.whatWentWell != null) body.whatWentWell = form.whatWentWell;
  if (form.whatToImprove != null) body.whatToImprove = form.whatToImprove;
  if (form.screenshots != null) {
    body.screenshotsJson = form.screenshots.map((s) => ({
      id: s.id,
      caption: s.caption || null,
      imageUrl: s.imageUrl,
    }));
  }
  return body;
}

export function summaryMapFromList(summaries) {
  const map = {};
  (summaries || []).forEach((s) => {
    map[s.journalDate] = s;
  });
  return map;
}
