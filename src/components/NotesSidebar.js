import React from 'react';
import { motion } from 'framer-motion';
import {
  FiFolder,
  FiHash,
  FiDownload,
  FiX,
  FiPlus,
  FiPin
} from 'react-icons/fi';

const NotesSidebar = ({
  categories,
  tags,
  selectedCategory,
  selectedTag,
  onCategoryChange,
  onTagChange,
  onExport
}) => {
  return (
    <div className="w-64 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Filters
        </h2>
      </div>

      {/* Categories */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center">
            <FiFolder className="w-4 h-4 mr-2" />
            Categories
          </h3>
        </div>
        <div className="space-y-1">
          <motion.button
            onClick={() => onCategoryChange('all')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              selectedCategory === 'all'
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.98 }}
          >
            All Categories
          </motion.button>
          {categories.map((category) => (
            <motion.button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
            >
              {category}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center">
            <FiHash className="w-4 h-4 mr-2" />
            Tags
          </h3>
          {selectedTag && (
            <motion.button
              onClick={() => onTagChange(null)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FiX className="w-3 h-3" />
            </motion.button>
          )}
        </div>
        {tags.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            No tags yet
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <motion.button
                key={tag}
                onClick={() => onTagChange(tag)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  selectedTag === tag
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                #{tag}
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Export */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Export
        </h3>
        <div className="space-y-2">
          <motion.button
            onClick={() => onExport('txt')}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiDownload className="w-4 h-4" />
            <span>Export as TXT</span>
          </motion.button>
          <motion.button
            onClick={() => onExport('md')}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiDownload className="w-4 h-4" />
            <span>Export as Markdown</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default NotesSidebar;

