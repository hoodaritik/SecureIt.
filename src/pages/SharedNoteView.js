import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiFileText, FiCalendar, FiLock, FiEdit, FiEye, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import CodeBlock from '../components/CodeBlock';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import axios from 'axios';

const SharedNoteView = () => {
  const { token } = useParams();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSharedNote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const loadSharedNote = async () => {
    try {
      setLoading(true);
      setError(null);
      // Create a new axios instance without auth token for public shared notes
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003';
      const response = await axios.get(`${API_BASE_URL}/api/notes/shared/${token}`);
      setNote(response.data.note);
    } catch (error) {
      console.error('Error loading shared note:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load shared note';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <motion.div
          className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center max-w-md mx-auto px-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <FiAlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </motion.div>
          <motion.h1
            className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {error}
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link
              to="/login"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-xl"
            >
              <FiArrowLeft className="w-4 h-4 mr-2" />
              Go to Login
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!note) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <FiArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                  <FiFileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    {note.title || 'Shared Note'}
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center">
                    <FiCalendar className="w-3 h-3 mr-1" />
                    {formatDate(note.updatedAt || note.createdAt)}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`px-3 py-1.5 rounded-lg flex items-center space-x-2 ${
                note.sharePermissions === 'edit'
                  ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
                  : 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
              }`}>
                {note.sharePermissions === 'edit' ? (
                  <>
                    <FiEdit className="w-4 h-4" />
                    <span className="text-sm font-medium">Can Edit</span>
                  </>
                ) : (
                  <>
                    <FiEye className="w-4 h-4" />
                    <span className="text-sm font-medium">View Only</span>
                  </>
                )}
              </div>
              {note.shareExpiry && (
                <div className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 flex items-center space-x-2">
                  <FiLock className="w-4 h-4" />
                  <span className="text-sm">Expires: {formatDate(note.shareExpiry)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 sm:p-8"
        >
          {/* Tags */}
          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {note.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Category */}
          {note.category && note.category !== 'general' && (
            <div className="mb-6">
              <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg text-sm font-medium">
                {note.category}
              </span>
            </div>
          )}

          {/* Note Content */}
          <div className="prose dark:prose-invert max-w-none">
            {note.type === 'code' ? (
              <div>
                <CodeBlock
                  code={note.content}
                  language={note.codeLanguage || 'javascript'}
                  onCopy={() => {
                    navigator.clipboard.writeText(note.content);
                    toast.success('Code copied to clipboard');
                  }}
                />
              </div>
            ) : (
              <div className="note-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {note.content}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
              {`This note was shared with you via ${process.env.REACT_APP_APP_NAME}`}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SharedNoteView;

