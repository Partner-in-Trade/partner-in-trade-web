export const MAX_JOURNAL_IMAGE_BYTES = 2_000_000;

const HTML_FIELDS = ['marketOverview', 'whatWentWell', 'whatToImprove'];

export function isPersistedImageUrl(url) {
  return typeof url === 'string' && /^https?:\/\//i.test(url);
}

export function dataUrlToFile(dataUrl, fallbackName = 'image') {
  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
  if (!match) {
    throw new Error('Invalid image data');
  }
  const mime = match[1];
  const binary = atob(match[2]);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  const ext = mime.split('/')[1] || 'png';
  return new File([bytes], `${fallbackName}.${ext}`, { type: mime });
}

async function rewriteHtmlImages(html, pendingUploads, ensureUploaded) {
  if (!html || typeof html !== 'string') return html || '';
  if (typeof DOMParser === 'undefined') {
    return html;
  }

  const doc = new DOMParser().parseFromString(html, 'text/html');
  const images = doc.querySelectorAll('img');

  for (const img of images) {
    const src = img.getAttribute('src') || '';
    const uploadId = img.getAttribute('data-upload-id');

    if (uploadId && pendingUploads[uploadId]) {
      const url = await ensureUploaded(uploadId, pendingUploads[uploadId]);
      img.setAttribute('src', url);
      img.removeAttribute('data-upload-id');
      continue;
    }

    if (isPersistedImageUrl(src)) {
      continue;
    }

    if (src.startsWith('data:')) {
      const id = uploadId || `legacy-${src.length}`;
      const file = dataUrlToFile(src, id);
      const url = await ensureUploaded(id, file);
      img.setAttribute('src', url);
      img.removeAttribute('data-upload-id');
      continue;
    }

    if (src.startsWith('blob:')) {
      throw new Error('An inline image is missing upload data. Re-insert the image and try saving again.');
    }
  }

  return doc.body.innerHTML;
}

/**
 * Upload pending blobs/data URLs, return a form safe to PUT as JSON (HTTPS image URLs only).
 */
export async function prepareJournalFormForSave({ journalDate, form, pendingUploads, uploadFile }) {
  const urlByKey = new Map();

  const ensureUploaded = async (key, file) => {
    if (!file) {
      throw new Error('Missing image file');
    }
    if (file.size > MAX_JOURNAL_IMAGE_BYTES) {
      throw new Error('Image must be under 2 MB');
    }
    if (urlByKey.has(key)) {
      return urlByKey.get(key);
    }
    const res = await uploadFile(file, journalDate);
    const url = res?.data?.url ?? res?.url;
    if (!url) {
      throw new Error('Image upload did not return a URL');
    }
    urlByKey.set(key, url);
    return url;
  };

  const screenshots = await Promise.all(
    (form.screenshots || []).map(async (shot) => {
      const pending = pendingUploads[shot.id];
      if (pending) {
        const url = await ensureUploaded(shot.id, pending);
        return { ...shot, imageUrl: url };
      }
      if (shot.imageUrl?.startsWith('data:')) {
        const file = dataUrlToFile(shot.imageUrl, shot.id);
        const url = await ensureUploaded(shot.id, file);
        return { ...shot, imageUrl: url };
      }
      return shot;
    })
  );

  const next = { ...form, screenshots };
  for (const field of HTML_FIELDS) {
    next[field] = await rewriteHtmlImages(form[field], pendingUploads, ensureUploaded);
  }
  return next;
}
