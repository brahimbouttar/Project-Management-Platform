import { useState, useEffect, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { pageApi } from '../../api/page.api';
import { Save } from 'lucide-react';

interface PageEditorProps {
  pageId: string;
  initialTitle?: string;
  initialContent?: string;
}

const PageEditor = ({ pageId, initialTitle = 'Untitled', initialContent = '' }: PageEditorProps) => {
  const [title, setTitle] = useState(initialTitle);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Start writing... Press "/" for commands' }),
    ],
    content: initialContent ? JSON.parse(initialContent) : '',
    onUpdate: () => setSaved(false),
  });

  const save = useCallback(async () => {
    if (saved) return;
    setSaving(true);
    try {
      await pageApi.update(pageId, {
        title,
        content: editor ? JSON.stringify(editor.getJSON()) : '',
      });
      setSaved(true);
    } catch {
      
    } finally {
      setSaving(false);
    }
  }, [pageId, title, editor, saved]);

  useEffect(() => {
    if (saved) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(save, 2000);
    return () => clearTimeout(timerRef.current);
  }, [save, saved]);

  if (!editor) return null;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : saved ? 'Saved' : 'Unsaved changes'}
        </div>
      </div>

      <input
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          setSaved(false);
        }}
        className="mb-4 w-full text-4xl font-bold text-gray-900 outline-none border-none bg-transparent placeholder-gray-300"
        placeholder="Untitled"
      />

      <div className="prose prose-sm max-w-none">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default PageEditor;
