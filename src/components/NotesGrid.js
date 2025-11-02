import React from 'react';
import { motion } from 'framer-motion';
import {
  FiFileText,
  FiBookmark,
  FiStar,
  FiTrash2,
  FiClock,
  FiTag
} from 'react-icons/fi';

const NotesGrid = ({
  notes,
  selectedNote,
  onSelectNote,
  onTogglePin,
  onToggleImportant,
  onDelete,
  loading
}) => {
  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffInMinutes = Math.floor((now - d) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return d.toLocaleDateString();
  };

  const stripHtml = (html) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html || '';
    return tmp.textContent || tmp.innerText || '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <motion.div
          className="w-8 h-8 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <FiFileText className="w-24 h-24 text-slate-300 dark:text-slate-600 mb-4" />
        <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-2">
          No notes found
        </h3>
        <p className="text-slate-500 dark:text-slate-500">
          Create your first note to get started
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 auto-rows-max">
        {notes.map((note, index) => {
          const plainText = stripHtml(note.content || '');
          const preview = plainText.substring(0, 150);
          const isSelected = selectedNote?._id === note._id;

          return (
            <motion.div
              key={note._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelectNote(note)}
              className={`group relative h-72 flex flex-col rounded-xl border-2 transition-all duration-200 cursor-pointer hover:shadow-xl hover:scale-[1.02] ${
                isSelected
                  ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/30 shadow-md'
                  : note.pinned
                    ? 'border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-700'
                    : note.important
                      ? 'border-yellow-200 dark:border-yellow-800 bg-white dark:bg-slate-800 hover:border-yellow-300 dark:hover:border-yellow-700'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between p-5 pb-3 border-b border-slate-100 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-700/30 dark:to-transparent rounded-t-xl">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 truncate text-lg mb-2">
                    {note.title || 'Untitled Note'}
                  </h3>
                  <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
                    <FiClock className="w-3 h-3" />
                    <span>{formatDate(note.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1.5 ml-2">
                  {note.pinned && (
                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                      <FiBookmark className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    </div>
                  )}
                  {note.important && (
                    <div className="p-1.5 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg">
                      <FiStar className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                    </div>
                  )}
                </div>
              </div>

              {/* Card Content */}
              <div className="flex-1 p-5 pt-3 overflow-hidden">
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-4 leading-relaxed mb-3">
                  {preview || 'No content'}
                  {plainText.length > 150 && '...'}
                </p>
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {note.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-300 rounded-full border border-purple-200 dark:border-purple-700"
                      >
                        <FiTag className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                    {note.tags.length > 3 && (
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                        +{note.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
                {note.category && note.category !== 'general' && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 rounded-lg border border-blue-200 dark:border-blue-700">
                      {note.category}
                    </span>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity bg-slate-50/50 dark:bg-slate-700/20 rounded-b-xl">
                <div className="flex items-center space-x-2">
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTogglePin(note);
                    }}
                    className={`p-1.5 rounded transition-colors ${
                      note.pinned
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/50'
                        : 'text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title={note.pinned ? 'Unpin' : 'Pin'}
                  >
                    <FiBookmark className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleImportant(note);
                    }}
                    className={`p-1.5 rounded transition-colors ${
                      note.important
                        ? 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/50'
                        : 'text-slate-400 dark:text-slate-500 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title={note.important ? 'Unmark important' : 'Mark important'}
                  >
                    <FiStar className="w-4 h-4" />
                  </motion.button>
                </div>
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Are you sure you want to delete this note?')) {
                      onDelete(note._id);
                    }
                  }}
                  className="p-1.5 rounded text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Delete note"
                >
                  <FiTrash2 className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default NotesGrid;
