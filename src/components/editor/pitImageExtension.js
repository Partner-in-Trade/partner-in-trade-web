import Image from '@tiptap/extension-image';

/** Journal images: blob preview locally, `data-upload-id` until save uploads to ImageKit. */
export const PitImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      uploadId: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-upload-id'),
        renderHTML: (attributes) =>
          attributes.uploadId ? { 'data-upload-id': attributes.uploadId } : {},
      },
    };
  },
});
