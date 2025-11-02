import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useEnhancedTheme } from '../context/EnhancedThemeContext';
import { FiCopy, FiCheck } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const CodeBlock = ({ code, language = 'javascript', onCopy }) => {
  const { theme } = useEnhancedTheme();
  const [copied, setCopied] = useState(false);
  const isDark = theme === 'dark' || theme === 'cyberpunk';

  const handleCopy = () => {
    if (onCopy) {
      onCopy();
    } else {
      navigator.clipboard.writeText(code);
      toast.success('Code copied to clipboard');
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <div className="absolute top-2 right-2 z-10">
        <motion.button
          onClick={handleCopy}
          className="p-2 bg-slate-700/80 hover:bg-slate-600 text-white rounded transition-colors backdrop-blur-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Copy code"
        >
          {copied ? (
            <FiCheck className="w-4 h-4 text-green-400" />
          ) : (
            <FiCopy className="w-4 h-4" />
          )}
        </motion.button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={isDark ? vscDarkPlus : prism}
        customStyle={{
          borderRadius: '0.5rem',
          padding: '1rem',
          fontSize: '0.875rem',
          margin: 0
        }}
        showLineNumbers
        wrapLines
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;

