import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiBookmark,
  FiStar,
  FiClock,
  FiTag,
  FiFileText,
  FiChevronRight
} from 'react-icons/fi';

const NotesSidebarList = ({
  notes,
  selectedNote,
  onSelectNote,
  onTogglePin,
  onToggleImportant,
  loading
}) => {
  const [hoveredNote, setHoveredNote] = useState(null);

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffInMinutes = Math.floor((now - d) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const stripHtml = (html) => {
    if (!html) return '';
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const getPreview = (content, maxLength = 100) => {
    const plainText = stripHtml(content || '');
    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength) + '...';
  };

  const NoteItem = ({ note, index, isPinnedSection = false }) => {
    const isSelected = selectedNote?._id === note._id;
    const isHovered = hoveredNote === note._id;

    return (
      <motion.div
        key={note._id}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.02 }}
        onMouseEnter={() => setHoveredNote(note._id)}
        onMouseLeave={() => setHoveredNote(null)}
        onClick={() => onSelectNote(note)}
        className={`group relative px-4 py-3 mx-2 rounded-lg cursor-pointer transition-all duration-200 ${
          isSelected
            ? 'bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500 dark:border-blue-400 shadow-sm'
            : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 border-l-4 border-transparent hover:border-slate-300 dark:hover:border-slate-600'
        }`}
      >
        {/* Note Title */}
        <div className="flex items-start justify-between mb-1">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              {note.pinned && (
                <FiBookmark className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              )}
              {note.important && !note.pinned && (
                <FiStar className="w-3.5 h-3.5 text-yellow-500 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              )}
              <h3 className={`font-semibold text-sm truncate ${
                isSelected
                  ? 'text-blue-900 dark:text-blue-100'
                  : 'text-slate-900 dark:text-slate-100'
              }`}>
                {note.title || 'Untitled Note'}
              </h3>
            </div>
          </div>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center space-x-1 ml-2"
              onClick={(e) => e.stopPropagation()}
            >
              {!note.pinned && (
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTogglePin(note);
                  }}
                  className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Pin note"
                >
                  <FiBookmark className="w-3.5 h-3.5" />
                </motion.button>
              )}
              {!note.important && (
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleImportant(note);
                  }}
                  className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-400 dark:text-slate-500 hover:text-yellow-500 dark:hover:text-yellow-400"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Mark as important"
                >
                  <FiStar className="w-3.5 h-3.5" />
                </motion.button>
              )}
            </motion.div>
          )}
        </div>

        {/* Last Updated Time */}
        <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1.5">
          <FiClock className="w-3 h-3" />
          <span>{formatDate(note.updatedAt || note.createdAt)}</span>
        </div>

        {/* Tags Preview */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex items-center space-x-1.5 mt-2 flex-wrap gap-1">
            <FiTag className="w-3 h-3 text-slate-400 dark:text-slate-500 flex-shrink-0" />
            {note.tags.slice(0, 2).map((tag, idx) => (
              <span
                key={idx}
                className="px-1.5 py-0.5 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded"
              >
                {tag}
              </span>
            ))}
            {note.tags.length > 2 && (
              <span className="text-xs text-slate-400 dark:text-slate-500">
                +{note.tags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Category Badge */}
        {note.category && note.category !== 'general' && (
          <div className="mt-1.5">
            <span className="inline-block px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
              {note.category}
            </span>
          </div>
        )}

        {/* Hover Tooltip */}
        <AnimatePresence>
          {isHovered && !isSelected && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute left-full ml-2 top-0 w-64 p-3 bg-slate-900 dark:bg-slate-800 text-white text-xs rounded-lg shadow-xl z-50 pointer-events-none border border-slate-700"
            >
              <div className="font-semibold mb-1.5 text-white">{note.title || 'Untitled Note'}</div>
              <div className="text-slate-300 line-clamp-3 leading-relaxed">
                {getPreview(note.content)}
              </div>
              {note.tags && note.tags.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-700 flex flex-wrap gap-1">
                  {note.tags.map((tag, idx) => (
                    <span key={idx} className="px-1.5 py-0.5 text-xs bg-slate-700 text-slate-300 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected Indicator */}
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute right-2 top-1/2 -translate-y-1/2"
          >
            <FiChevronRight className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          </motion.div>
        )}
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-8">
        <motion.div
          className="w-6 h-6 border-3 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <FiFileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
        <p className="text-sm text-slate-500 dark:text-slate-500">
          No notes found
        </p>
      </div>
    );
  }

  // Separate pinned and unpinned notes
  const pinnedNotes = notes.filter(note => note.pinned);
  const unpinnedNotes = notes.filter(note => !note.pinned);

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="py-2">
        {/* Pinned Notes Section */}
        {pinnedNotes.length > 0 && (
          <>
            <div className="px-4 py-2 mb-1">
              <div className="flex items-center space-x-2">
                <FiBookmark className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Pinned
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">({pinnedNotes.length})</span>
              </div>
            </div>
            {pinnedNotes.map((note, index) => (
              <NoteItem key={note._id} note={note} index={index} isPinnedSection={true} />
            ))}
            
            {unpinnedNotes.length > 0 && (
              <div className="px-4 py-3 mt-2 mb-1 border-t border-slate-200 dark:border-slate-700">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  All Notes
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500 ml-1">({unpinnedNotes.length})</span>
              </div>
            )}
          </>
        )}

        {/* Unpinned Notes */}
        {unpinnedNotes.map((note, index) => (
          <NoteItem key={note._id} note={note} index={pinnedNotes.length + index} isPinnedSection={false} />
        ))}
      </div>
    </div>
  );
};

export default NotesSidebarList;
