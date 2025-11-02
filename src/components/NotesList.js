import React from 'react';
import { motion } from 'framer-motion';
import {
  FiFileText,
  FiBookmark,
  FiStar,
  FiTrash2,
  FiClock,
  FiTag,
  FiEdit2
} from 'react-icons/fi';

const NotesList = ({
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
      <div className="space-y-2">
        {notes.map((note, index) => {
          const plainText = stripHtml(note.content || '');
          const preview = plainText.substring(0, 200);
          const isSelected = selectedNote?._id === note._id;

          return (
            <motion.div
              key={note._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => onSelectNote(note)}
              className={`group relative flex items-start p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer hover:shadow-md ${
                isSelected
                  ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/30 shadow-md'
                  : note.pinned
                    ? 'border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-700'
                    : note.important
                      ? 'border-yellow-200 dark:border-yellow-800 bg-white dark:bg-slate-800 hover:border-yellow-300 dark:hover:border-yellow-700'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {/* Note Icon */}
              <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${
                note.pinned ? 'bg-blue-100 dark:bg-blue-900' :
                note.important ? 'bg-yellow-100 dark:bg-yellow-900' :
                'bg-slate-100 dark:bg-slate-700'
              }`}>
                <FiFileText className={`w-6 h-6 ${
                  note.pinned ? 'text-blue-600 dark:text-blue-400' :
                  note.important ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-slate-600 dark:text-slate-400'
                }`} />
              </div>

              {/* Note Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate text-lg mb-1">
                      {note.title || 'Untitled Note'}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">
                      {preview || 'No content'}
                      {plainText.length > 200 && '...'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1 ml-4">
                    {note.pinned && (
                      <FiBookmark className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    )}
                    {note.important && (
                      <FiStar className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                    )}
                  </div>
                </div>

                {/* Meta Info */}
                <div className="flex items-center flex-wrap gap-3 mt-3">
                  <div className="flex items-center space-x-1 text-xs text-slate-500 dark:text-slate-400">
                    <FiClock className="w-3 h-3" />
                    <span>{formatDate(note.createdAt)}</span>
                  </div>
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {note.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full"
                        >
                          <FiTag className="w-3 h-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                      {note.tags.length > 3 && (
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          +{note.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                  {note.category && note.category !== 'general' && (
                    <span className="inline-flex items-center px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                      {note.category}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTogglePin(note);
                  }}
                  className={`p-2 rounded-lg transition-colors ${
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
                  className={`p-2 rounded-lg transition-colors ${
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
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Are you sure you want to delete this note?')) {
                      onDelete(note._id);
                    }
                  }}
                  className="p-2 rounded-lg text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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

export default NotesList;

