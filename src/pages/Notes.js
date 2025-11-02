import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import {
  FiSend,
  FiCode,
  FiTag,
  FiSearch,
  FiStar,
  FiEdit2,
  FiTrash2,
  FiBookmark ,
  FiCopy,
  FiCheck,
  FiFilter,
  FiDownload,
  FiX,
  FiFolder,
  FiHash,
  FiPlus,
  FiMessageSquare
} from 'react-icons/fi';
import { noteService } from '../services/noteService';
import { toast } from 'react-toastify';
import CodeBlock from '../components/CodeBlock';
import NotesSidebar from '../components/NotesSidebar';

const Notes = () => {
  const { t } = useTranslation();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTag, setSelectedTag] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  const [tags, setTags] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [isCodeBlock, setIsCodeBlock] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const codeLanguages = [
    'javascript', 'python', 'html', 'css', 'java', 'cpp', 'csharp',
    'php', 'ruby', 'go', 'rust', 'sql', 'json', 'xml', 'yaml', 'bash'
  ];

  // Load notes
  useEffect(() => {
    loadNotes();
    loadTags();
    loadCategories();
  }, [selectedCategory, selectedTag, searchQuery, showPinnedOnly]);

  // Auto scroll to bottom when new notes arrive
  useEffect(() => {
    scrollToBottom();
  }, [notes]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadNotes = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (selectedTag) params.tag = selectedTag;
      if (searchQuery) params.search = searchQuery;
      if (showPinnedOnly) params.pinned = 'true';

      const response = await noteService.getNotes(params);
      setNotes(response.notes || []);
    } catch (error) {
      toast.error('Failed to load notes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadTags = async () => {
    try {
      const response = await noteService.getTags();
      setTags(response.tags || []);
    } catch (error) {
      console.error('Failed to load tags:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await noteService.getCategories();
      setCategories(response.categories || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() && !isCodeBlock) return;

    try {
      setSending(true);
      const noteData = {
        content: inputValue.trim(),
        type: isCodeBlock ? 'code' : 'note',
        codeLanguage: isCodeBlock ? codeLanguage : null,
        category: selectedCategory !== 'all' ? selectedCategory : 'general',
        conversationId: activeConversation
      };

      const response = await noteService.createNote(noteData);

      setNotes(prev => [...prev, response.note]);

      if (!activeConversation) {
        setActiveConversation(response.note.conversationId);
      }

      setInputValue('');
      setIsCodeBlock(false);
      setCodeLanguage('javascript');
      inputRef.current?.focus();
    } catch (error) {
      toast.error('Failed to create note');
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  const handleEdit = async (noteId, newContent) => {
    try {
      const response = await noteService.updateNote(noteId, {
        content: newContent
      });

      setNotes(prev =>
        prev.map(note =>
          note._id === noteId ? response.note : note
        )
      );
      setEditingNote(null);
      toast.success('Note updated');
    } catch (error) {
      toast.error('Failed to update note');
    }
  };

  const handleDelete = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    try {
      await noteService.deleteNote(noteId);
      setNotes(prev => prev.filter(note => note._id !== noteId));
      toast.success('Note deleted');
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  const handleTogglePin = async (note) => {
    try {
      const response = await noteService.updateNote(note._id, {
        pinned: !note.pinned
      });
      setNotes(prev =>
        prev.map(n =>
          n._id === note._id ? response.note : n
        )
      );
    } catch (error) {
      toast.error('Failed to update note');
    }
  };

  const handleToggleImportant = async (note) => {
    try {
      const response = await noteService.updateNote(note._id, {
        important: !note.important
      });
      setNotes(prev =>
        prev.map(n =>
          n._id === note._id ? response.note : n
        )
      );
    } catch (error) {
      toast.error('Failed to update note');
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isCodeBlock) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTimestamp = (date) => {
    const now = new Date();
    const noteDate = new Date(date);
    const diffInMinutes = Math.floor((now - noteDate) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return noteDate.toLocaleDateString() + ' ' + noteDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleExport = async (format) => {
    try {
      await noteService.exportNotes(format, activeConversation);
      toast.success(`Notes exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export notes');
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Sidebar */}
      <NotesSidebar
        categories={categories}
        tags={tags}
        selectedCategory={selectedCategory}
        selectedTag={selectedTag}
        onCategoryChange={setSelectedCategory}
        onTagChange={setSelectedTag}
        onExport={handleExport}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full">
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <FiMessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Notes & Snippets
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <motion.button
                onClick={() => setShowPinnedOnly(!showPinnedOnly)}
                className={`p-2 rounded-lg transition-colors ${showPinnedOnly
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Show pinned only"
              >
                <FiBookmark  className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Messages/Notes Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900/50">
          {loading && notes.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <motion.div
                className="w-8 h-8 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </div>
          ) : notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <FiMessageSquare className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
              <p className="text-slate-500 dark:text-slate-400 text-lg">
                No notes found. Start by creating your first note!
              </p>
            </div>
          ) : (
            notes.map((note, index) => (
              <NoteMessage
                key={note._id}
                note={note}
                index={index}
                editingNote={editingNote}
                onEdit={setEditingNote}
                onSave={handleEdit}
                onDelete={handleDelete}
                onTogglePin={handleTogglePin}
                onToggleImportant={handleToggleImportant}
                onCopyCode={handleCopyCode}
                formatTimestamp={formatTimestamp}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
          {isCodeBlock && (
            <div className="mb-2 flex items-center space-x-2">
              <select
                value={codeLanguage}
                onChange={(e) => setCodeLanguage(e.target.value)}
                className="px-3 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              >
                {codeLanguages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
              <motion.button
                onClick={() => {
                  setIsCodeBlock(false);
                  setCodeLanguage('javascript');
                }}
                className="p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FiX className="w-4 h-4" />
              </motion.button>
            </div>
          )}
          <div className="flex items-end space-x-2">
            <motion.button
              onClick={() => setIsCodeBlock(!isCodeBlock)}
              className={`p-2 rounded-lg transition-colors ${isCodeBlock
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Code block"
            >
              <FiCode className="w-5 h-5" />
            </motion.button>
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isCodeBlock ? "Enter your code snippet..." : "Type your note or question..."}
              className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={isCodeBlock ? 10 : 3}
            />
            <motion.button
              onClick={handleSend}
              disabled={sending || (!inputValue.trim() && !isCodeBlock)}
              className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: sending ? 1 : 1.05 }}
              whileTap={{ scale: sending ? 1 : 0.95 }}
            >
              {sending ? (
                <motion.div
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              ) : (
                <FiSend className="w-5 h-5" />
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Note Message Component
const NoteMessage = ({
  note,
  index,
  editingNote,
  onEdit,
  onSave,
  onDelete,
  onTogglePin,
  onToggleImportant,
  onCopyCode,
  formatTimestamp
}) => {
  const [editValue, setEditValue] = useState(note.content);
  const isEditing = editingNote === note._id;

  const handleSave = () => {
    if (editValue.trim()) {
      onSave(note._id, editValue.trim());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`group relative p-4 rounded-lg ${note.pinned
        ? 'bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-200 dark:border-blue-800'
        : note.important
          ? 'bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800'
          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
        }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {formatTimestamp(note.createdAt)}
          </span>
          {note.tags && note.tags.length > 0 && (
            <div className="flex items-center space-x-1">
              {note.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
          {note.category && note.category !== 'general' && (
            <span className="px-2 py-0.5 text-xs bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 rounded">
              {note.category}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <motion.button
            onClick={() => onTogglePin(note)}
            className={`p-1.5 rounded ${note.pinned
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FiBookmark  className="w-4 h-4" />
          </motion.button>
          <motion.button
            onClick={() => onToggleImportant(note)}
            className={`p-1.5 rounded ${note.important
              ? 'text-yellow-600 dark:text-yellow-400'
              : 'text-slate-400 hover:text-yellow-600 dark:hover:text-yellow-400'
              }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FiStar className="w-4 h-4" />
          </motion.button>
          {!isEditing && (
            <>
              <motion.button
                onClick={() => onEdit(note._id)}
                className="p-1.5 rounded text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FiEdit2 className="w-4 h-4" />
              </motion.button>
              <motion.button
                onClick={() => onDelete(note._id)}
                className="p-1.5 rounded text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FiTrash2 className="w-4 h-4" />
              </motion.button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            rows={4}
            autoFocus
          />
          <div className="flex space-x-2">
            <motion.button
              onClick={handleSave}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Save
            </motion.button>
            <motion.button
              onClick={() => {
                onEdit(null);
                setEditValue(note.content);
              }}
              className="px-3 py-1 text-sm bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-300 dark:hover:bg-slate-600"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Cancel
            </motion.button>
          </div>
        </div>
      ) : note.type === 'code' ? (
        <CodeBlock
          code={note.content}
          language={note.codeLanguage || 'javascript'}
          onCopy={() => onCopyCode(note.content)}
        />
      ) : (
        <p className="text-slate-900 dark:text-slate-100 whitespace-pre-wrap">
          {note.content}
        </p>
      )}
    </motion.div>
  );
};

export default Notes;

