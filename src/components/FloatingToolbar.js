import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiBold,
  FiItalic,
  FiUnderline,
  FiCode,
  FiLink,
  FiImage,
  FiAlignLeft,
  FiAlignCenter,
  FiAlignRight,
  FiAlignJustify,
  FiList,
  FiCheckSquare
} from 'react-icons/fi';

const FloatingToolbar = ({ editor, position }) => {
  const [showToolbar, setShowToolbar] = useState(false);
  const toolbarRef = useRef(null);

  useEffect(() => {
    if (!editor) return;

    const updateToolbar = () => {
      const { from, to } = editor.state.selection;
      
      // Only show toolbar if text is selected
      if (from !== to) {
        setShowToolbar(true);
      } else {
        setShowToolbar(false);
      }
    };

    editor.on('selectionUpdate', updateToolbar);
    editor.on('focus', updateToolbar);
    editor.on('blur', () => {
      // Delay hiding to allow clicking on toolbar buttons
      setTimeout(() => setShowToolbar(false), 200);
    });

    return () => {
      editor.off('selectionUpdate', updateToolbar);
      editor.off('focus', updateToolbar);
      editor.off('blur');
    };
  }, [editor]);

  if (!editor || !showToolbar) return null;

  const { from, to } = editor.state.selection;
  const isEmpty = from === to;

  if (isEmpty) return null;

  // Get selected text position
  const { view } = editor;
  const { state } = view;
  const { from: start, to: end } = state.selection;
  
  const startPos = view.coordsAtPos(start);
  const endPos = view.coordsAtPos(end);

  // Calculate toolbar position
  const left = (startPos.left + endPos.left) / 2;
  const top = startPos.top - 10;

  return (
    <AnimatePresence>
      <motion.div
        ref={toolbarRef}
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="fixed z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl p-1 flex items-center gap-1"
        style={{
          left: `${left}px`,
          top: `${top - 60}px`,
          transform: 'translateX(-50%)',
        }}
      >
        {/* Text Formatting */}
        <div className="flex items-center gap-0.5 px-1 border-r border-slate-200 dark:border-slate-700">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
              editor.isActive('bold')
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-300'
            }`}
            title="Bold (Ctrl+B)"
          >
            <FiBold className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
              editor.isActive('italic')
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-300'
            }`}
            title="Italic (Ctrl+I)"
          >
            <FiItalic className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
              editor.isActive('underline')
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-300'
            }`}
            title="Underline (Ctrl+U)"
          >
            <FiUnderline className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
              editor.isActive('code')
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-300'
            }`}
            title="Code (Ctrl+E)"
          >
            <FiCode className="w-4 h-4" />
          </button>
        </div>

        {/* Text Alignment */}
        <div className="flex items-center gap-0.5 px-1 border-r border-slate-200 dark:border-slate-700">
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
              editor.isActive({ textAlign: 'left' })
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-300'
            }`}
            title="Align Left"
          >
            <FiAlignLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
              editor.isActive({ textAlign: 'center' })
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-300'
            }`}
            title="Align Center"
          >
            <FiAlignCenter className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
              editor.isActive({ textAlign: 'right' })
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-300'
            }`}
            title="Align Right"
          >
            <FiAlignRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={`p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
              editor.isActive({ textAlign: 'justify' })
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-300'
            }`}
            title="Justify"
          >
            <FiAlignJustify className="w-4 h-4" />
          </button>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-0.5 px-1 border-r border-slate-200 dark:border-slate-700">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
              editor.isActive('bulletList')
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-300'
            }`}
            title="Bullet List"
          >
            <FiList className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
              editor.isActive('orderedList')
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-300'
            }`}
            title="Numbered List"
          >
            <FiCheckSquare className="w-4 h-4" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0.5 px-1">
          <button
            onClick={() => {
              const url = window.prompt('Enter URL:');
              if (url) {
                editor.chain().focus().setLink({ href: url }).run();
              }
            }}
            className="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
            title="Add Link"
          >
            <FiLink className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              const url = window.prompt('Enter image URL:');
              if (url) {
                editor.chain().focus().setImage({ src: url }).run();
              }
            }}
            className="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
            title="Add Image"
          >
            <FiImage className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FloatingToolbar;

