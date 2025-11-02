import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { TextStyle, Color } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import './RichTextEditor.css';

const RichTextEditor = ({ value, onChange, placeholder = "Start typing your note..." }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Configure starter kit extensions
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 dark:text-blue-400 underline',
        },
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Underline,
      Placeholder.configure({
        placeholder: placeholder,
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] p-4',
      },
    },
  });

  // Update editor content when value prop changes externally
  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div className="rich-text-editor-loading">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const MenuBar = ({ editor }) => {
    if (!editor) {
      return null;
    }

    return (
      <div className="rich-text-toolbar border-b border-slate-200 dark:border-slate-700 p-2 flex flex-wrap gap-1">
        {/* Headings */}
        <div className="flex items-center border-r border-slate-200 dark:border-slate-700 pr-2 mr-2">
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 ${
              editor.isActive('heading', { level: 1 })
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                : 'text-slate-700 dark:text-slate-300'
            }`}
            title="Heading 1"
          >
            H1
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 ${
              editor.isActive('heading', { level: 2 })
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                : 'text-slate-700 dark:text-slate-300'
            }`}
            title="Heading 2"
          >
            H2
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 ${
              editor.isActive('heading', { level: 3 })
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                : 'text-slate-700 dark:text-slate-300'
            }`}
            title="Heading 3"
          >
            H3
          </button>
        </div>

        {/* Text formatting */}
        <div className="flex items-center border-r border-slate-200 dark:border-slate-700 pr-2 mr-2">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 font-bold ${
              editor.isActive('bold')
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                : 'text-slate-700 dark:text-slate-300'
            }`}
            title="Bold (Ctrl+B)"
          >
            <strong>B</strong>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 italic ${
              editor.isActive('italic')
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                : 'text-slate-700 dark:text-slate-300'
            }`}
            title="Italic (Ctrl+I)"
          >
            <em>I</em>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 underline ${
              editor.isActive('underline')
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                : 'text-slate-700 dark:text-slate-300'
            }`}
            title="Underline (Ctrl+U)"
          >
            <u>U</u>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 line-through ${
              editor.isActive('strike')
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                : 'text-slate-700 dark:text-slate-300'
            }`}
            title="Strikethrough"
          >
            <s>S</s>
          </button>
        </div>

        {/* Lists */}
        <div className="flex items-center border-r border-slate-200 dark:border-slate-700 pr-2 mr-2">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 ${
              editor.isActive('bulletList')
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                : 'text-slate-700 dark:text-slate-300'
            }`}
            title="Bullet List"
          >
            • List
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 ${
              editor.isActive('orderedList')
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                : 'text-slate-700 dark:text-slate-300'
            }`}
            title="Numbered List"
          >
            1. List
          </button>
        </div>

        {/* Code */}
        <div className="flex items-center border-r border-slate-200 dark:border-slate-700 pr-2 mr-2">
          <button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 font-mono ${
              editor.isActive('codeBlock')
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                : 'text-slate-700 dark:text-slate-300'
            }`}
            title="Code Block"
          >
            {'</>'}
          </button>
        </div>

        {/* Link */}
        <div className="flex items-center">
          <button
            onClick={() => {
              const url = window.prompt('Enter URL:');
              if (url) {
                editor.chain().focus().setLink({ href: url }).run();
              }
            }}
            className={`p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 ${
              editor.isActive('link')
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                : 'text-slate-700 dark:text-slate-300'
            }`}
            title="Add Link"
          >
            🔗
          </button>
          {editor.isActive('link') && (
            <button
              onClick={() => editor.chain().focus().unsetLink().run()}
              className="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-red-600 dark:text-red-400"
              title="Remove Link"
            >
              Unlink
            </button>
          )}
        </div>

        {/* Clear formatting */}
        <div className="flex items-center ml-auto">
          <button
            onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
            className="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
            title="Clear Formatting"
          >
            Clear
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="rich-text-editor h-full flex flex-col bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      <MenuBar editor={editor} />
      <div className="flex-1 overflow-y-auto relative">
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  );
};

export default RichTextEditor;
