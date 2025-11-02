import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSave,
  FiPlus,
  FiSearch,
  FiBookmark,
  FiStar,
  FiTag,
  FiFolder,
  FiTrash2,
  FiX,
  FiDownload,
  FiFileText,
  FiCode,
  FiChevronRight,
  FiChevronLeft,
  FiCheck,
  FiAlertCircle,
  FiShare2
} from 'react-icons/fi';
import { noteService } from '../services/noteService';
import { toast } from 'react-toastify';
import EnhancedRichTextEditor from '../components/EnhancedRichTextEditor';
import CodeBlock from '../components/CodeBlock';
import NotesSidebarList from '../components/NotesSidebarList';
import ShareNoteModal from '../components/ShareNoteModal';
import { convert } from 'html-to-text';
import jsPDF from 'jspdf';

const EnhancedNotes = () => {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tags, setTags] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTag, setSelectedTag] = useState(null);
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  const [noteTags, setNoteTags] = useState([]);
  const [noteCategory, setNoteCategory] = useState('general');
  const [isCodeMode, setIsCodeMode] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [codeContent, setCodeContent] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved'); // 'saving', 'saved', 'error'
  const [showShareModal, setShowShareModal] = useState(false);
  const autoSaveTimerRef = useRef(null);
  const lastSaveRef = useRef(null);

  const codeLanguages = [
    'javascript', 'python', 'html', 'css', 'java', 'cpp', 'csharp',
    'php', 'ruby', 'go', 'rust', 'sql', 'json', 'xml', 'yaml', 'bash'
  ];

  // Load notes
  useEffect(() => {
    const fetchData = async () => {
      await loadNotes();
      await loadTags();
      await loadCategories();
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedTag, searchQuery, showPinnedOnly]);

  // Auto-save functionality
  useEffect(() => {
    if (selectedNote && !isCreating && (content || codeContent)) {
      // Don't auto-save if content hasn't changed
      const currentContent = isCodeMode ? codeContent : content;
      const contentHash = JSON.stringify({ content: currentContent, title });
      
      // Skip if content hasn't changed since last save
      if (lastSaveRef.current === contentHash) {
        return;
      }

      // Clear previous timer
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      // Set new timer for auto-save (2 seconds after typing stops)
      autoSaveTimerRef.current = setTimeout(() => {
        handleAutoSave();
      }, 2000);

      return () => {
        if (autoSaveTimerRef.current) {
          clearTimeout(autoSaveTimerRef.current);
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, codeContent, title, selectedNote, isCreating, isCodeMode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      // Ctrl/Cmd + N to create new note
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleNewNote();
      }
      // Escape to close note
      if (e.key === 'Escape' && selectedNote) {
        handleCloseNote();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNote, content, codeContent]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (selectedTag) params.tag = selectedTag;
      if (searchQuery) params.search = searchQuery;
      if (showPinnedOnly) params.pinned = 'true';

      const response = await noteService.getNotes(params);
      // Backend returns { success: true, notes: [...] } or { success: true, count: X, notes: [...] }
      if (response && response.notes) {
        setNotes(Array.isArray(response.notes) ? response.notes : []);
      } else if (Array.isArray(response)) {
        setNotes(response);
      } else {
        console.warn('Unexpected response format:', response);
        setNotes([]);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load notes';
      toast.error(errorMessage);
      setNotes([]); // Set empty array on error to prevent UI issues
    } finally {
      setLoading(false);
    }
  };

  const loadTags = async () => {
    try {
      const response = await noteService.getTags();
      if (response && response.tags) {
        setTags(Array.isArray(response.tags) ? response.tags : []);
      } else if (Array.isArray(response)) {
        setTags(response);
      } else {
        setTags([]);
      }
    } catch (error) {
      console.error('Failed to load tags:', error);
      setTags([]); // Set empty array on error
    }
  };

  const loadCategories = async () => {
    try {
      const response = await noteService.getCategories();
      if (response && response.categories) {
        setCategories(Array.isArray(response.categories) ? response.categories : []);
      } else if (Array.isArray(response)) {
        setCategories(response);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
      setCategories([]); // Set empty array on error
    }
  };

  const handleNewNote = async () => {
    // Check for unsaved changes
    if (selectedNote) {
      const currentContent = isCodeMode ? codeContent : content;
      if (currentContent.trim() && currentContent !== selectedNote.content) {
        const shouldSave = window.confirm('You have unsaved changes. Do you want to save before creating a new note?');
        if (shouldSave) {
          await handleSave();
        }
      }
    }
    
    setSelectedNote(null);
    setContent('');
    setTitle('');
    setNoteTags([]);
    setNoteCategory('general');
    setIsCodeMode(false);
    setCodeContent('');
    setCodeLanguage('javascript');
    setIsCreating(true); // Set create mode to show editor
    lastSaveRef.current = null;
  };

  const handleSelectNote = async (note) => {
    // Check for unsaved changes before switching
    if (selectedNote || isCreating) {
      const currentContent = isCodeMode ? codeContent : content;
      const originalContent = selectedNote?.type === 'code' ? selectedNote.content : selectedNote?.content || '';
      
      if (currentContent.trim() && selectedNote && currentContent !== originalContent) {
        const shouldSave = window.confirm('You have unsaved changes. Do you want to save before switching?');
        if (shouldSave) {
          await handleSave();
        }
      }
    }
    
    // Load the selected note
    setSelectedNote(note);
    setContent(note.type === 'code' ? '' : (note.content || ''));
    setTitle(note.title || '');
    setNoteTags(note.tags || []);
    setNoteCategory(note.category || 'general');
    setIsCodeMode(note.type === 'code');
    setCodeContent(note.type === 'code' ? (note.content || '') : '');
    setCodeLanguage(note.codeLanguage || 'javascript');
    setIsCreating(false); // Exit create mode when selecting a note
    setAutoSaveStatus('saved'); // Reset auto-save status
    setShowShareModal(false); // Close share modal when switching notes
    // Update lastSaveRef with all note data for change detection
    lastSaveRef.current = JSON.stringify({ 
      content: note.type === 'code' ? '' : (note.content || ''), 
      title: note.title || '',
      tags: note.tags || [],
      category: note.category || 'general',
      type: note.type || 'note',
      codeLanguage: note.codeLanguage || undefined
    });
  };

  const handleCloseNote = async () => {
    const currentContent = isCodeMode ? codeContent : content;
    const originalContent = selectedNote?.type === 'code' ? selectedNote.content : selectedNote?.content || '';
    
    if (selectedNote && currentContent.trim() && currentContent !== originalContent) {
      if (window.confirm('You have unsaved changes. Do you want to save?')) {
        await handleSave();
      }
    }
    setSelectedNote(null);
    setContent('');
    setCodeContent('');
    setTitle('');
    setNoteTags([]);
    setNoteCategory('general');
    setIsCodeMode(false);
    setCodeLanguage('javascript');
    setIsCreating(false);
    setAutoSaveStatus('saved');
    lastSaveRef.current = null;
  };

  const handleAutoSave = useCallback(async () => {
    if (!selectedNote) return;
    
    const currentContent = isCodeMode ? codeContent : content;
    if (!currentContent.trim()) return;
    
    // Include all relevant fields in hash for proper change detection
    const contentHash = JSON.stringify({ 
      content: currentContent, 
      title,
      tags: noteTags,
      category: noteCategory,
      type: isCodeMode ? 'code' : 'note',
      codeLanguage: isCodeMode ? codeLanguage : undefined
    });
    if (lastSaveRef.current === contentHash) return; // No changes

    try {
      setAutoSaveStatus('saving');
      await noteService.updateNote(selectedNote._id, {
        content: currentContent.trim(),
        title: title.trim() || undefined,
        tags: noteTags,
        category: noteCategory,
        type: isCodeMode ? 'code' : 'note',
        codeLanguage: isCodeMode ? codeLanguage : undefined
      });
      setAutoSaveStatus('saved');
      
      // Update the note in the list (fetch updated note to get AI-generated title if applicable)
      const updatedNote = await noteService.getNote(selectedNote._id);
      const savedNote = updatedNote.note || selectedNote;
      
      setNotes(prev =>
        prev.map(n =>
          n._id === selectedNote._id
            ? savedNote
            : n
        )
      );
      
      // Update title if AI generated one
      if (savedNote?.title && savedNote.title !== title) {
        setTitle(savedNote.title);
      }
      
      // Update lastSaveRef with the actual saved note data
      lastSaveRef.current = JSON.stringify({ 
        content: savedNote.type === 'code' ? savedNote.content : (savedNote.content || ''), 
        title: savedNote.title || '',
        tags: savedNote.tags || [],
        category: savedNote.category || 'general',
        type: savedNote.type || 'note',
        codeLanguage: savedNote.codeLanguage || undefined
      });
    } catch (error) {
      console.error('Auto-save failed:', error);
      setAutoSaveStatus('error');
    }
  }, [selectedNote, content, codeContent, title, noteTags, noteCategory, isCodeMode, codeLanguage]);

  const handleSave = async () => {
    const currentContent = isCodeMode ? codeContent : content;
    if (!currentContent.trim()) {
      toast.error('Note content cannot be empty');
      return;
    }

    try {
      setSaving(true);
      const noteData = {
        content: isCodeMode ? codeContent.trim() : content.trim(),
        type: isCodeMode ? 'code' : 'note',
        title: title.trim() || undefined,
        tags: noteTags,
        category: noteCategory || 'general',
        codeLanguage: isCodeMode ? codeLanguage : undefined
      };

      if (selectedNote) {
        // Update existing note
        const response = await noteService.updateNote(selectedNote._id, noteData);
        setNotes(prev =>
          prev.map(note =>
            note._id === selectedNote._id ? response.note : note
          )
        );
        setSelectedNote(response.note);
        
        // Update title if AI generated one during update
        if (response.note.title && response.note.title !== title && !title.trim()) {
          setTitle(response.note.title);
        }
        
        setAutoSaveStatus('saved');
        toast.success('Note saved');
      } else {
        // Create new note
        setAutoSaveStatus('saving');
        const response = await noteService.createNote(noteData);
        setNotes(prev => [response.note, ...prev]);
        setSelectedNote(response.note);
        setIsCreating(false); // Exit create mode after successful creation
        
        // Update title if AI generated one
        if (response.note.title && response.note.title !== title) {
          setTitle(response.note.title);
          toast.info(`Title generated: ${response.note.title}`, { autoClose: 3000 });
        }
        
        setAutoSaveStatus('saved');
        toast.success('Note created');
      }
      // Update lastSaveRef with all note data for change detection
      lastSaveRef.current = JSON.stringify({ 
        content: noteData.content, 
        title: noteData.title || '',
        tags: noteData.tags,
        category: noteData.category,
        type: noteData.type,
        codeLanguage: noteData.codeLanguage
      });
      await loadTags();
      await loadCategories();
    } catch (error) {
      toast.error('Failed to save note');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    try {
      await noteService.deleteNote(noteId);
      setNotes(prev => prev.filter(note => note._id !== noteId));
      if (selectedNote && selectedNote._id === noteId) {
        handleNewNote();
      }
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
      if (selectedNote && selectedNote._id === note._id) {
        setSelectedNote(response.note);
      }
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
      if (selectedNote && selectedNote._id === note._id) {
        setSelectedNote(response.note);
      }
    } catch (error) {
      toast.error('Failed to update note');
    }
  };

  const handleShare = async (noteId, shareData) => {
    const response = await noteService.shareNote(noteId, shareData);
    // Reload the note to get updated sharing info
    const updatedNote = await noteService.getNote(noteId);
    setNotes(prev =>
      prev.map(n =>
        n._id === noteId ? updatedNote.note : n
      )
    );
    if (selectedNote && selectedNote._id === noteId) {
      setSelectedNote(updatedNote.note);
    }
    return response;
  };

  const handleRevokeShare = async (noteId) => {
    await noteService.revokeShare(noteId);
    // Reload the note to get updated sharing info
    const updatedNote = await noteService.getNote(noteId);
    setNotes(prev =>
      prev.map(n =>
        n._id === noteId ? updatedNote.note : n
      )
    );
    if (selectedNote && selectedNote._id === noteId) {
      setSelectedNote(updatedNote.note);
    }
  };

  const handleUpdateShare = async (noteId, shareData) => {
    const response = await noteService.updateShareSettings(noteId, shareData);
    // Reload the note to get updated sharing info
    const updatedNote = await noteService.getNote(noteId);
    setNotes(prev =>
      prev.map(n =>
        n._id === noteId ? updatedNote.note : n
      )
    );
    if (selectedNote && selectedNote._id === noteId) {
      setSelectedNote(updatedNote.note);
    }
    return response;
  };

  const handleExport = async (format) => {
    try {
      if (format === 'pdf' && (selectedNote || content)) {
        // Export single note as PDF
        const doc = new jsPDF();
        const currentContent = content || selectedNote?.content || '';
        const currentTitle = title || selectedNote?.title || 'Untitled Note';
        const text = convert(currentContent, {
          wordwrap: 100
        });
        doc.setFontSize(16);
        doc.text(currentTitle, 10, 10);
        doc.setFontSize(12);
        const lines = doc.splitTextToSize(text, 180);
        let yPosition = 20;
        lines.forEach((line) => {
          if (yPosition > 280) {
            doc.addPage();
            yPosition = 10;
          }
          doc.text(line, 10, yPosition);
          yPosition += 7;
        });
        doc.save(`note-${Date.now()}.pdf`);
        toast.success('Note exported as PDF');
      } else {
        await noteService.exportNotes(format, selectedNote?.conversationId);
        toast.success(`Notes exported as ${format.toUpperCase()}`);
      }
    } catch (error) {
      toast.error('Failed to export notes');
      console.error(error);
    }
  };

  const filteredNotes = notes.filter(note => {
    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = (
        (note.content && note.content.toLowerCase().includes(query)) ||
        (note.title && note.title.toLowerCase().includes(query)) ||
        (note.tags && note.tags.some(tag => tag.toLowerCase().includes(query)))
      );
      if (!matchesSearch) return false;
    }

    // Category filter
    if (selectedCategory && selectedCategory !== 'all') {
      if (note.category !== selectedCategory) return false;
    }

    // Tag filter
    if (selectedTag) {
      if (!note.tags || !note.tags.includes(selectedTag)) return false;
    }

    // Pinned filter
    if (showPinnedOnly && !note.pinned) return false;

    return true;
  });

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    // Pinned notes first
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    // Important notes next
    if (a.important !== b.important) return a.important ? -1 : 1;
    // Then by most recently updated
    const dateA = new Date(a.updatedAt || a.createdAt);
    const dateB = new Date(b.updatedAt || b.createdAt);
    return dateB - dateA;
  });

  return (
    <div className="h-full flex bg-white dark:bg-slate-900 overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col overflow-hidden shadow-sm"
          >
            {/* Sidebar Header - Notion Style */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    All Notes
                  </h2>
                </div>
                <motion.button
                  onClick={handleNewNote}
                  className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-sm hover:shadow-md"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="New Note (Ctrl/Cmd + N)"
                >
                  <FiPlus className="w-4 h-4" />
                </motion.button>
              </div>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
                />
              </div>
            </div>

            {/* Filters & Quick Actions */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 space-y-4 bg-slate-50 dark:bg-slate-900/50">
              {/* Quick Filters */}
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={() => setShowPinnedOnly(!showPinnedOnly)}
                  className={`flex items-center space-x-2 px-3 py-2 text-sm rounded-lg font-medium transition-all ${
                    showPinnedOnly
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FiBookmark className="w-4 h-4" />
                  <span>Pinned</span>
                </motion.button>
              </div>
              
              {/* Categories */}
              {categories.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <FiFolder className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Categories</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                        selectedCategory === 'all'
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700'
                      }`}
                    >
                      All
                    </button>
                    {categories.slice(0, 6).map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                          selectedCategory === cat
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {tags.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <FiTag className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Tags</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.slice(0, 8).map(tag => (
                      <button
                        key={tag}
                        onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                        className={`px-2.5 py-1 text-xs rounded-full font-medium transition-all ${
                          selectedTag === tag
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700'
                        }`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Notes Sidebar List - Always visible clean list */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <NotesSidebarList
                notes={sortedNotes}
                selectedNote={selectedNote}
                onSelectNote={handleSelectNote}
                onTogglePin={handleTogglePin}
                onToggleImportant={handleToggleImportant}
                loading={loading}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Toggle Sidebar Button - Fixed at top to avoid overlapping content */}
        {!sidebarOpen && (
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setSidebarOpen(true)}
            className="fixed left-0 top-20 z-30 p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-r-lg shadow-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Show sidebar"
          >
            <FiChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </motion.button>
        )}
        
        {sidebarOpen && (
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed left-[320px] top-20 z-30 p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-r-lg shadow-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Hide sidebar"
          >
            <FiChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </motion.button>
        )}
        {(selectedNote || isCreating || content) ? (
          <>
            {/* Editor Header */}
            <div className="border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 p-4 shadow-sm">
              {/* Auto-save Status */}
              {selectedNote && (
                <div className="mb-2 flex items-center justify-end">
                  <div className="flex items-center space-x-2 text-xs">
                    {autoSaveStatus === 'saving' && (
                      <>
                        <motion.div
                          className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        <span className="text-blue-600 dark:text-blue-400 font-medium">Saving...</span>
                      </>
                    )}
                    {autoSaveStatus === 'saved' && (
                      <>
                        <FiCheck className="w-3 h-3 text-green-500" />
                        <span className="text-green-600 dark:text-green-400 font-medium">Saved</span>
                      </>
                    )}
                    {autoSaveStatus === 'error' && (
                      <>
                        <FiAlertCircle className="w-3 h-3 text-red-500" />
                        <span className="text-red-600 dark:text-red-400 font-medium">Save failed</span>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                <div className="flex-1 mr-4">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Untitled Note..."
                    className="w-full text-3xl font-bold bg-transparent border-none outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:placeholder-slate-300 transition-colors"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  {selectedNote && (
                    <>
                      <motion.button
                        onClick={() => handleTogglePin(selectedNote)}
                        className={`p-2 rounded-lg transition-colors ${
                          selectedNote.pinned
                            ? 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title="Pin note"
                      >
                        <FiBookmark className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        onClick={() => handleToggleImportant(selectedNote)}
                        className={`p-2 rounded-lg transition-colors ${
                          selectedNote.important
                            ? 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title="Mark as important"
                      >
                        <FiStar className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        onClick={() => setShowShareModal(true)}
                        className={`p-2 rounded-lg transition-colors ${
                          selectedNote.isPubliclyShared
                            ? 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title={selectedNote.isPubliclyShared ? "Share settings" : "Share note"}
                      >
                        <FiShare2 className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        onClick={() => handleDelete(selectedNote._id)}
                        className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title="Delete note"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </motion.button>
                    </>
                  )}
                  <motion.button
                    onClick={handleSave}
                    disabled={saving || (!content.trim() && !codeContent.trim())}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-md hover:shadow-lg font-medium"
                    whileHover={{ scale: saving ? 1 : 1.05 }}
                    whileTap={{ scale: saving ? 1 : 0.95 }}
                    title="Save (Ctrl/Cmd + S)"
                  >
                    {saving ? (
                      <motion.div
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                    ) : (
                      <FiSave className="w-4 h-4" />
                    )}
                    <span>Save</span>
                  </motion.button>
                  {selectedNote && (
                    <motion.button
                      onClick={handleCloseNote}
                      className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title="Close (Esc)"
                    >
                      <FiX className="w-5 h-5" />
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Tags and Category */}
              <div className="flex items-center flex-wrap gap-3">
                <div className="flex items-center space-x-2 flex-1 min-w-[200px]">
                  <FiTag className="w-4 h-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="#tag1 #tag2"
                    value={noteTags.map(t => `#${t}`).join(' ')}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Extract tags from #tag format
                      const tagMatches = value.match(/#(\w+)/g) || [];
                      const newTags = tagMatches.map(t => t.replace('#', '').trim()).filter(t => t);
                      setNoteTags(newTags);
                    }}
                    className="flex-1 px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <FiFolder className="w-4 h-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                  <select
                    value={noteCategory}
                    onChange={(e) => setNoteCategory(e.target.value)}
                    className="px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="general">General</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <motion.button
                  onClick={() => setIsCodeMode(!isCodeMode)}
                  className={`px-4 py-2 text-sm rounded-lg font-medium transition-all ${
                    isCodeMode
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiCode className="w-4 h-4 inline mr-1.5" />
                  Code Mode
                </motion.button>
                <motion.button
                  onClick={() => handleExport('pdf')}
                  className="px-4 py-2 text-sm bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center space-x-1.5"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiDownload className="w-4 h-4" />
                  <span>Export PDF</span>
                </motion.button>
              </div>
            </div>

            {/* Editor Content */}
            <div className="flex-1 overflow-hidden bg-white dark:bg-slate-900 flex flex-col">
              {isCodeMode ? (
                <div className="h-full flex flex-col p-4">
                  <div className="mb-4 flex items-center space-x-2">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Language:</label>
                    <select
                      value={codeLanguage}
                      onChange={(e) => setCodeLanguage(e.target.value)}
                      className="px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                    >
                      {codeLanguages.map(lang => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                  </div>
                  <textarea
                    value={codeContent}
                    onChange={(e) => setCodeContent(e.target.value)}
                    placeholder="Enter your code snippet..."
                    className="flex-1 w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  {codeContent && (
                    <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-4">
                      <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Preview:</h3>
                      <CodeBlock
                        code={codeContent}
                        language={codeLanguage}
                        onCopy={() => {
                          navigator.clipboard.writeText(codeContent);
                          toast.success('Code copied to clipboard');
                        }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 overflow-hidden bg-white dark:bg-slate-900">
                  <EnhancedRichTextEditor
                    value={content}
                    onChange={setContent}
                    placeholder="Start typing your note..."
                    onSave={handleSave}
                    saving={saving}
                  />
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center p-8 max-w-md"
            >
              <div className="mb-6">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl mb-4">
                  <FiFileText className="w-12 h-12 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                Welcome to Notes
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
                Create your first note or select an existing one to get started. Your ideas are safe here.
              </p>
              <motion.button
                onClick={handleNewNote}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all flex items-center space-x-2 mx-auto shadow-lg hover:shadow-xl text-lg"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiPlus className="w-6 h-6" />
                <span>Create New Note</span>
              </motion.button>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-500">
                Press <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-xs font-mono">Ctrl/Cmd + N</kbd> for quick access
              </p>
            </motion.div>
          </div>
        )}
      </div>

      {/* Share Note Modal */}
      {selectedNote && (
        <ShareNoteModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          note={selectedNote}
          onShare={handleShare}
          onRevoke={handleRevokeShare}
          onUpdate={handleUpdateShare}
        />
      )}
    </div>
  );
};

export default EnhancedNotes;

