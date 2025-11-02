import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiShare2, FiX, FiCopy, FiCheck, FiEdit, FiEye, FiMail, 
  FiLink, FiGlobe, FiLock, FiClock, FiUsers, FiSend,
  FiLinkedin, FiMessageCircle
} from 'react-icons/fi';
import { toast } from 'react-toastify';

const ShareNoteModal = ({ isOpen, onClose, note, onShare, onRevoke, onUpdate }) => {
  const [permissions, setPermissions] = useState(note?.sharePermissions || 'view');
  const [expiresInDays, setExpiresInDays] = useState(null);
  const [sharedWithEmails, setSharedWithEmails] = useState('');
  const [shareUrl, setShareUrl] = useState(note?.shareToken ? `${window.location.origin}/shared-note/${note.shareToken}` : '');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('link'); // 'link' or 'people'
  const [emailInput, setEmailInput] = useState('');

  const isShared = note?.isPubliclyShared || false;
  const shareExpiry = note?.shareExpiry;

  // Update state when note changes
  React.useEffect(() => {
    if (note) {
      setPermissions(note.sharePermissions || 'view');
      if (note.shareToken) {
        setShareUrl(`${window.location.origin}/shared-note/${note.shareToken}`);
      } else {
        setShareUrl('');
      }
      if (note.shareExpiry) {
        const expiryDate = new Date(note.shareExpiry);
        const now = new Date();
        const diffTime = expiryDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setExpiresInDays(diffDays > 0 ? diffDays : null);
      } else {
        setExpiresInDays(null);
      }
      // Set sharedWith emails if any
      if (note.sharedWith && note.sharedWith.length > 0) {
        setSharedWithEmails(note.sharedWith.map(s => s.email).filter(Boolean).join(', '));
      } else {
        setSharedWithEmails('');
      }
    }
  }, [note]);

  const handleShare = async () => {
    try {
      setLoading(true);
      const emails = sharedWithEmails
        .split(',')
        .map(email => email.trim())
        .filter(email => email && email.includes('@'));

      const shareData = {
        permissions,
        expiresInDays: expiresInDays ? parseInt(expiresInDays) : null,
        sharedWithEmails: emails
      };

      const response = await onShare(note._id, shareData);
      setShareUrl(response.shareUrl);
      toast.success('Note shared successfully!');
      setActiveTab('link');
      // Don't close, show the link
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to share note');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async () => {
    if (!window.confirm('Are you sure you want to revoke sharing for this note?')) {
      return;
    }

    try {
      setLoading(true);
      await onRevoke(note._id);
      setShareUrl('');
      toast.success('Sharing revoked successfully');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to revoke sharing');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const emails = sharedWithEmails
        .split(',')
        .map(email => email.trim())
        .filter(email => email && email.includes('@'));

      const shareData = {
        permissions,
        expiresInDays: expiresInDays ? parseInt(expiresInDays) : null,
        sharedWithEmails: emails.length > 0 ? emails : undefined
      };

      const response = await onUpdate(note._id, shareData);
      setShareUrl(response.shareUrl);
      toast.success('Share settings updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update share settings');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Share link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const addEmail = () => {
    if (emailInput.trim() && emailInput.includes('@')) {
      const emails = sharedWithEmails ? sharedWithEmails.split(',').map(e => e.trim()) : [];
      if (!emails.includes(emailInput.trim())) {
        setSharedWithEmails([...emails, emailInput.trim()].join(', '));
        setEmailInput('');
      }
    }
  };

  const removeEmail = (emailToRemove) => {
    const emails = sharedWithEmails.split(',').map(e => e.trim()).filter(e => e !== emailToRemove);
    setSharedWithEmails(emails.join(', '));
  };

  const shareToSocial = (platform) => {
    const text = encodeURIComponent(`Check out this note: ${note?.title || 'Untitled Note'}`);
    const url = encodeURIComponent(shareUrl);
    
    const urls = {
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      whatsapp: `https://wa.me/?text=${text}%20${url}`
    };

    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400');
    }
  };

  if (!isOpen) return null;

  const emailList = sharedWithEmails ? sharedWithEmails.split(',').map(e => e.trim()).filter(Boolean) : [];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl mx-auto max-h-[90vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-700"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 pb-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                  <FiShare2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {isShared ? 'Manage Sharing' : 'Share Note'}
                  </h2>
                  <p className="text-blue-100 text-sm">
                    {isShared ? 'Update sharing settings' : 'Share this note with others'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Tab Switcher */}
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg p-1 border border-white/20">
              <button
                onClick={() => setActiveTab('link')}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'link'
                    ? 'bg-white text-blue-600 shadow-lg'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <FiLink className="w-4 h-4" />
                  <span>Share Link</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('people')}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'people'
                    ? 'bg-white text-blue-600 shadow-lg'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <FiUsers className="w-4 h-4" />
                  <span>Share with People</span>
                </div>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 dark:bg-slate-900">
            {/* Share Link Tab */}
            {activeTab === 'link' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Share Link Section */}
                {isShared && shareUrl ? (
                  <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-2">
                          <FiLink className="w-4 h-4" />
                          <span>Shareable Link</span>
                        </label>
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full flex items-center space-x-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Active</span>
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm text-slate-700 dark:text-slate-300 break-all">
                          {shareUrl}
                        </div>
                        <motion.button
                          onClick={copyToClipboard}
                          className={`px-4 py-3 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                            copied
                              ? 'bg-green-500 hover:bg-green-600 text-white'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {copied ? (
                            <>
                              <FiCheck className="w-4 h-4" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <FiCopy className="w-4 h-4" />
                              <span>Copy</span>
                            </>
                          )}
                        </motion.button>
                      </div>
                      {shareExpiry && (
                        <div className="mt-3 flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
                          <FiClock className="w-3 h-3" />
                          <span>Expires: {new Date(shareExpiry).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</span>
                        </div>
                      )}
                    </div>

                    {/* Social Share Buttons */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 block">
                        Share to Social Media
                      </label>
                      <div className="grid grid-cols-4 gap-3">
                        {[
                          { name: 'LinkedIn', icon: FiLinkedin, color: 'bg-indigo-600 hover:bg-indigo-700', platform: 'linkedin' },
                          { name: 'WhatsApp', icon: FiMessageCircle, color: 'bg-green-500 hover:bg-green-600', platform: 'whatsapp' },
                        ].map((social) => {
                          const Icon = social.icon;
                          return (
                            <motion.button
                              key={social.name}
                              onClick={() => shareToSocial(social.platform)}
                              className={`${social.color} text-white p-3 rounded-lg flex flex-col items-center justify-center space-y-1 transition-all`}
                              whileHover={{ scale: 1.05, y: -2 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Icon className="w-5 h-5" />
                              <span className="text-xs font-medium">{social.name}</span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 text-center">
                    <FiGlobe className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-600 dark:text-slate-400 mb-1">No share link created yet</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">Configure settings below and click "Share Note" to generate a link</p>
                  </div>
                )}

                {/* Permissions */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 block">
                    Access Permissions
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <motion.button
                      onClick={() => setPermissions('view')}
                      className={`p-5 rounded-xl border-2 transition-all text-left ${
                        permissions === 'view'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50 dark:bg-slate-900/50'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          permissions === 'view' ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-700'
                        }`}>
                          <FiEye className={`w-5 h-5 ${permissions === 'view' ? 'text-white' : 'text-slate-500'}`} />
                        </div>
                        <div>
                          <div className={`font-semibold ${permissions === 'view' ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'}`}>
                            View Only
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            Read access
                          </div>
                        </div>
                      </div>
                    </motion.button>
                    <motion.button
                      onClick={() => setPermissions('edit')}
                      className={`p-5 rounded-xl border-2 transition-all text-left ${
                        permissions === 'edit'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50 dark:bg-slate-900/50'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          permissions === 'edit' ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-700'
                        }`}>
                          <FiEdit className={`w-5 h-5 ${permissions === 'edit' ? 'text-white' : 'text-slate-500'}`} />
                        </div>
                        <div>
                          <div className={`font-semibold ${permissions === 'edit' ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'}`}>
                            Can Edit
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            Read & write
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  </div>
                </div>

                {/* Expiry Settings */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center space-x-2">
                        <FiClock className="w-4 h-4" />
                        <span>Link Expiration</span>
                      </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="number"
                      min="1"
                      placeholder="Days (optional)"
                      value={expiresInDays || ''}
                      onChange={(e) => setExpiresInDays(e.target.value || null)}
                      className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">days</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    Leave empty for no expiration. Link will expire after the specified number of days.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Share with People Tab */}
            {activeTab === 'people' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Email Input */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center space-x-2">
                    <FiMail className="w-4 h-4" />
                    <span>Share with Email Addresses</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="email"
                      placeholder="Enter email address"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addEmail()}
                      className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <motion.button
                      onClick={addEmail}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center space-x-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FiSend className="w-4 h-4" />
                      <span>Add</span>
                    </motion.button>
                  </div>
                </div>

                {/* Email List */}
                {emailList.length > 0 && (
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 block">
                      Shared With ({emailList.length})
                    </label>
                    <div className="space-y-2">
                      {emailList.map((email, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                              {email.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm text-slate-700 dark:text-slate-300">{email}</span>
                          </div>
                          <button
                            onClick={() => removeEmail(email)}
                            className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400 transition-colors"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 flex items-center justify-between">
            <div>
              {isShared && (
                <motion.button
                  onClick={handleRevoke}
                  className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium transition-colors flex items-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={loading}
                >
                  <FiLock className="w-4 h-4" />
                  <span>Revoke Access</span>
                </motion.button>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <motion.button
                onClick={isShared ? handleUpdate : handleShare}
                disabled={loading}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: loading ? 1 : 1.05 }}
                whileTap={{ scale: loading ? 1 : 0.95 }}
              >
                {loading ? (
                  <motion.div
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                ) : (
                  <>
                    <FiShare2 className="w-4 h-4" />
                    <span>{isShared ? 'Update Settings' : 'Share Note'}</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ShareNoteModal;
