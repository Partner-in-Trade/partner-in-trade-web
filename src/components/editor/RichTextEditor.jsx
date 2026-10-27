import React, { useEffect, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { PitImage } from '@/components/editor/pitImageExtension';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  ListChecks,
  Heading1,
  Heading2,
  Heading3,
  Link2,
  ImagePlus,
  Quote,
  Code,
} from 'lucide-react';

const MAX_INLINE_IMAGE_BYTES = 2_000_000;

function ToolbarButton({ onClick, active, children, label }) {
  return (
    <button
      type="button"
      aria-label={label}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`p-1.5 rounded-md text-slate-300 hover:bg-slate-700/80 ${active ? 'bg-slate-700 text-white' : ''}`}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({
  value = '',
  onChange,
  placeholder = 'Write here…',
  minHeight = '12rem',
  compactToolbar = false,
  registerPendingUpload,
}) {
  const imageInputRef = useRef(null);

  const debouncedOnChange = useCallback(
    (html) => {
      onChange?.(html);
    },
    [onChange]
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      Link.configure({ openOnClick: false }),
      PitImage.configure({
        HTMLAttributes: {
          class: 'pit-rich-text-image',
        },
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'pit-rich-text focus:outline-none px-3 py-2 text-slate-100',
        style: `min-height: ${minHeight}`,
      },
    },
    onUpdate: ({ editor: ed }) => {
      debouncedOnChange(ed.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const next = value || '';
    if (current !== next) {
      editor.commands.setContent(next, false);
    }
  }, [editor, value]);

  const addLink = () => {
    if (!editor) return;
    const url = window.prompt('Link URL');
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };

  const insertImageFromFile = (file) => {
    if (!editor || !file) return;
    if (!file.type.startsWith('image/')) {
      window.alert('Please choose an image file.');
      return;
    }
    if (file.size > MAX_INLINE_IMAGE_BYTES) {
      window.alert('Image must be under 2 MB');
      return;
    }
    const uploadId = crypto.randomUUID();
    const objectUrl = URL.createObjectURL(file);
    registerPendingUpload?.(uploadId, file);
    editor
      .chain()
      .focus()
      .setImage({ src: objectUrl, uploadId })
      .run();
  };

  const onImageFileChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    insertImageFromFile(file);
  };

  const openImagePicker = () => {
    imageInputRef.current?.click();
  };

  if (!editor) {
    return (
      <div
        className="rounded-lg border border-pit-border bg-pit-bg/60 text-slate-500 text-sm px-3 py-2"
        style={{ minHeight }}
      >
        Loading editor…
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-pit-border bg-[#0d1118] overflow-hidden" style={{ minHeight }}>
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onImageFileChange}
        aria-hidden
        tabIndex={-1}
      />
      <div className="flex flex-wrap items-center gap-0.5 border-b border-pit-border px-2 py-1.5 bg-slate-900/60">
        {!compactToolbar && (
          <>
            <ToolbarButton label="H1" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })}>
              <Heading1 className="w-3.5 h-3.5" />
            </ToolbarButton>
            <ToolbarButton label="H2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}>
              <Heading2 className="w-3.5 h-3.5" />
            </ToolbarButton>
            <ToolbarButton label="H3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })}>
              <Heading3 className="w-3.5 h-3.5" />
            </ToolbarButton>
          </>
        )}
        <ToolbarButton label="Bold" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>
          <Bold className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton label="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>
          <Italic className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton label="Underline" onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')}>
          <UnderlineIcon className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton label="Bullet list" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}>
          <List className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton label="Ordered list" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}>
          <ListOrdered className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton label="Task list" onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive('taskList')}>
          <ListChecks className="w-3.5 h-3.5" />
        </ToolbarButton>
        {!compactToolbar && (
          <>
            <ToolbarButton label="Link" onClick={addLink} active={editor.isActive('link')}>
              <Link2 className="w-3.5 h-3.5" />
            </ToolbarButton>
            <ToolbarButton label="Insert image from device" onClick={openImagePicker}>
              <ImagePlus className="w-3.5 h-3.5" />
            </ToolbarButton>
            <ToolbarButton label="Quote" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')}>
              <Quote className="w-3.5 h-3.5" />
            </ToolbarButton>
            <ToolbarButton label="Code" onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')}>
              <Code className="w-3.5 h-3.5" />
            </ToolbarButton>
          </>
        )}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
