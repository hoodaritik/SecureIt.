import React, { useState } from 'react';
import { usePasswords } from '../hooks/usePasswords';
import {Button} from '../components/ui/button';
import {Input} from '../components/ui/input';
import {Textarea} from '../components/ui/textarea';
import {Card, CardHeader, CardTitle, CardDescription, CardContent} from '../components/ui/card';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger} from '../components/ui/dialog';
import {Label} from '../components/ui/label';
import {Badge} from '../components/ui/badge';
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiEye, FiEyeOff, FiStar, FiGlobe, FiShield, FiKey, FiCopy } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

const PasswordManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPassword, setEditingPassword] = useState(null);

  const {
    passwords,
    isLoading,
    createPassword,
    updatePassword,
    deletePassword,
    isCreating,
    isUpdating,
    isDeleting,
  } = usePasswords();

  // Filter and sort passwords
  const filteredPasswords = passwords
    .filter(password => {
      if (!searchTerm) return true;
      const query = searchTerm.toLowerCase();
      return (
        password.title.toLowerCase().includes(query) ||
        password.username?.toLowerCase().includes(query) ||
        password.category?.toLowerCase().includes(query) ||
        password.notes?.toLowerCase().includes(query) ||
        password.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    })
    .sort((a, b) => {
      // Favorites first
      if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
      // Then by most recently modified
      const dateA = new Date(a.lastModified || a.updatedAt || a.createdAt);
      const dateB = new Date(b.lastModified || b.updatedAt || b.createdAt);
      return dateB - dateA;
    });

  const handleCreatePassword = async (formData) => {
    try {
      await createPassword(formData);
      setShowAddModal(false);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleUpdatePassword = async (formData) => {
    try {
      await updatePassword({ id: editingPassword._id, data: formData });
      setEditingPassword(null);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleDeletePassword = async (id) => {
    if (window.confirm('Are you sure you want to delete this password?')) {
      try {
        await deletePassword(id);
      } catch (error) {
        // Error handled by hook
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <motion.div
            className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full mx-auto"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.p
            className="text-slate-600 dark:text-slate-400 font-medium"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Loading your passwords...
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Professional Header */}
      <motion.div
        className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex-1">
          <motion.h1
            className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Password SecureIt
          </motion.h1>
          <motion.p
            className="mt-2 text-base md:text-lg text-slate-600 dark:text-slate-400 leading-relaxed"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Securely manage and organize all your passwords in one place
          </motion.p>
        </div>

        <motion.div
          className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Dialog open={showAddModal} onOpenChange={(open) => {
            setShowAddModal(open);
            // Reset form state when closing
            if (!open) {
              // The PasswordForm will reset automatically when password prop is null
            }
          }}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto">
                <FiPlus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span className="text-sm sm:text-base">Add Password</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto mx-4">
              <DialogHeader>
                <DialogTitle className="text-xl sm:text-2xl font-semibold">Add New Password</DialogTitle>
                <DialogDescription className="text-sm sm:text-base">
                  Store a new password securely in your SecureIt. All data is encrypted end-to-end.
                </DialogDescription>
              </DialogHeader>
              <PasswordForm
                key={showAddModal ? 'new' : 'closed'} // Force reset when modal opens/closes
                password={null}
                onSubmit={handleCreatePassword}
                onCancel={() => setShowAddModal(false)}
                isLoading={isCreating}
              />
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            className="px-4 sm:px-6 py-2 sm:py-3 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 w-full sm:w-auto"
          >
            <FiSearch className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            <span className="text-sm sm:text-base">Advanced Search</span>
          </Button>
        </motion.div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-4 sm:p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search passwords, usernames, categories, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 text-base bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 rounded-lg"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="whitespace-nowrap text-sm">
              <FiStar className="w-4 h-4 mr-2" />
              <span className="hidden xs:inline">Favorites</span>
              <span className="xs:hidden">★</span>
            </Button>
            <Button variant="outline" size="sm" className="whitespace-nowrap text-sm">
              <FiShield className="w-4 h-4 mr-2" />
              <span className="hidden xs:inline">Strong Only</span>
              <span className="xs:hidden">🛡️</span>
            </Button>
            <Button variant="outline" size="sm" className="whitespace-nowrap text-sm">
              <FiKey className="w-4 h-4 mr-2" />
              <span className="hidden xs:inline">All Passwords</span>
              <span className="xs:hidden">🔑</span>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Password SecureIt Content */}
      <AnimatePresence mode="wait">
        {filteredPasswords.length === 0 ? (
          <motion.div
            className="text-center py-12 sm:py-16 lg:py-20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 sm:mb-8 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-lg"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2, type: "spring" }}
            >
              <FiShield className="w-12 h-12 sm:w-16 sm:h-16 text-blue-600 dark:text-blue-400" />
            </motion.div>
            <motion.h3
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-3 sm:mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {searchTerm ? 'No passwords found' : 'Your SecureIt is empty'}
            </motion.h3>
            <motion.p
              className="text-base sm:text-lg text-slate-600 dark:text-slate-400 mb-6 sm:mb-8 max-w-md mx-auto leading-relaxed px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {searchTerm
                ? 'Try adjusting your search terms or check your spelling. You can search by title, username, category, or notes.'
                : 'Start building your secure password collection. Add your first credential to get started with world-class security.'
              }
            </motion.p>
            {!searchTerm && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Button
                  onClick={() => setShowAddModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-6 sm:px-8 py-3 sm:py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-base sm:text-lg"
                >
                  <FiPlus className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                  Add Your First Password
                </Button>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Results Summary */}
            <motion.div
              className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 rounded-lg flex items-center justify-center">
                  <FiKey className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {filteredPasswords.length} password{filteredPasswords.length !== 1 ? 's' : ''} found
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {searchTerm ? `Results for "${searchTerm}"` : 'All passwords in your SecureIt'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  <FiStar className="w-3 h-3 mr-1" />
                  {filteredPasswords.filter(p => p.isFavorite).length} favorites
                </Badge>
              </div>
            </motion.div>

            {/* Password Grid */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {filteredPasswords.map((password, index) => (
                <motion.div
                  key={password._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="group"
                >
                  <Card className="h-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 overflow-hidden group hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <CardHeader className="pb-3 sm:pb-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                          <motion.div
                            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-105 ${
                              password.isFavorite
                                ? 'bg-gradient-to-br from-yellow-400 to-orange-400'
                                : 'bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50'
                            }`}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                          >
                            <FiStar className={`w-5 h-5 sm:w-6 sm:h-6 ${password.isFavorite ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} />
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                              {password.title}
                            </CardTitle>
                            {password.username && (
                              <CardDescription className="text-slate-600 dark:text-slate-400 font-medium text-sm truncate">
                                {password.username}
                              </CardDescription>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons - Always visible on touch devices */}
                        <div className="flex items-center space-x-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                          <Dialog open={editingPassword?._id === password._id} onOpenChange={(open) => {
                            if (!open) setEditingPassword(null);
                            else setEditingPassword(password);
                          }}>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-blue-50 dark:hover:bg-blue-950/50 touch:opacity-100"
                                onClick={() => setEditingPassword(password)}
                              >
                                <FiEdit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto mx-4">
                              <DialogHeader>
                                <DialogTitle className="text-xl sm:text-2xl font-semibold">Edit Password</DialogTitle>
                                <DialogDescription className="text-sm sm:text-base">
                                  Update your password information and security details.
                                </DialogDescription>
                              </DialogHeader>
                              <PasswordForm
                                key={password._id} // Force re-render when password changes
                                password={password}
                                onSubmit={handleUpdatePassword}
                                onCancel={() => setEditingPassword(null)}
                                isLoading={isUpdating}
                              />
                            </DialogContent>
                          </Dialog>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeletePassword(password._id)}
                            disabled={isDeleting}
                            className="h-8 w-8 hover:bg-red-50 dark:hover:bg-red-950/50 text-red-500 hover:text-red-700 touch:opacity-100"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0 space-y-3 sm:space-y-4">
                      {password.url && (
                        <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                          <FiGlobe className="w-4 h-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                          <a
                            href={password.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors truncate text-sm font-medium min-w-0"
                          >
                            {password.url}
                          </a>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {password.category && (
                          <Badge variant="secondary" className="text-xs font-medium px-2 py-1">
                            {password.category}
                          </Badge>
                        )}
                        {password.isFavorite && (
                          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 text-xs px-2 py-1">
                            <FiStar className="w-3 h-3 mr-1" />
                            Favorite
                          </Badge>
                        )}
                      </div>

                      {password.notes && (
                        <div className="p-2 sm:p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                            {password.notes}
                          </p>
                        </div>
                      )}

                      {/* Password Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-green-600 dark:text-green-400 font-medium">Secured</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs hover:bg-blue-50 dark:hover:bg-blue-950/50 text-blue-600 dark:text-blue-400"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(password.password);
                            toast.success('Password copied to clipboard!', { autoClose: 2000 });
                          }}
                        >
                          <FiCopy className="w-3 h-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

// Professional Password Form Component
const PasswordForm = ({ password, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    title: password?.title || '',
    username: password?.username || '',
    password: password?.password || '',
    url: password?.url || '',
    notes: password?.notes || '',
    category: password?.category || '',
    tags: password?.tags?.join(', ') || '',
    isFavorite: password?.isFavorite || false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(null);

  // Reset form when password prop changes
  React.useEffect(() => {
    if (!password) {
      // New password - reset form completely
      setFormData({
        title: '',
        username: '',
        password: '',
        url: '',
        notes: '',
        category: '',
        tags: '',
        isFavorite: false,
      });
      setPasswordStrength(null);
      setShowPassword(false);
    } else {
      // Editing existing password - populate form
      setFormData({
        title: password.title || '',
        username: password.username || '',
        password: password.password || '',
        url: password.url || '',
        notes: password.notes || '',
        category: password.category || '',
        tags: password.tags?.join(', ') || '',
        isFavorite: password.isFavorite || false,
      });
      // Calculate initial password strength if editing
      if (password.password) {
        const strength = {
          score: Math.min(password.password.length * 10, 100),
          label: password.password.length < 6 ? 'Weak' : password.password.length < 10 ? 'Medium' : 'Strong'
        };
        setPasswordStrength(strength);
      } else {
        setPasswordStrength(null);
      }
    }
  }, [password]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Update password strength when password changes
    if (name === 'password' && value) {
      // Simple password strength calculation
      const strength = {
        score: Math.min(value.length * 10, 100),
        label: value.length < 6 ? 'Weak' : value.length < 10 ? 'Medium' : 'Strong'
      };
      setPasswordStrength(strength);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    };
    onSubmit(submitData);
  };

  const getStrengthColor = (strength) => {
    if (!strength) return 'bg-slate-200 dark:bg-slate-700';
    switch (strength.label) {
      case 'Weak': return 'bg-red-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Strong': return 'bg-green-500';
      default: return 'bg-slate-200 dark:bg-slate-700';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Title *
            </Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Gmail, Bank Account, Netflix"
              required
              className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Username / Email
            </Label>
            <Input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="username@example.com"
              className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 h-11"
            />
          </div>
        </div>

        {/* Password Field with Strength Indicator */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Password *
          </Label>
          <div className="space-y-3">
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter a strong password"
                required
                className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 pr-12 h-11"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <FiEyeOff className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                ) : (
                  <FiEye className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                )}
              </Button>
            </div>

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2 max-w-32">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${getStrengthColor(passwordStrength)}`}
                        style={{ width: passwordStrength ? `${Math.min(passwordStrength.score, 100)}%` : '0%' }}
                      />
                    </div>
                    <span className={`text-xs font-medium ${
                      passwordStrength?.label === 'Strong' ? 'text-green-600 dark:text-green-400' :
                      passwordStrength?.label === 'Medium' ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-red-600 dark:text-red-400'
                    }`}>
                      {passwordStrength?.label || 'Enter password'}
                    </span>
                  </div>
                </div>
                {passwordStrength && (
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {passwordStrength.label === 'Strong'
                      ? 'Excellent! Your password is very secure.'
                      : passwordStrength.label === 'Medium'
                      ? 'Good password. Consider adding numbers and symbols for better security.'
                      : 'Weak password. Please use at least 6 characters with mixed case, numbers, and symbols.'
                    }
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Website and Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="url" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Website URL
            </Label>
            <Input
              id="url"
              name="url"
              type="url"
              value={formData.url}
              onChange={handleChange}
              placeholder="https://example.com"
              className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Category
            </Label>
            <Input
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g., Email, Banking, Social Media, Work"
              className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 h-11"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Notes
          </Label>
          <Textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            placeholder="Additional notes, security questions, or any other important information..."
            className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none"
          />
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label htmlFor="tags" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Tags
          </Label>
          <Input
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="work, personal, important, banking (separate with commas)"
            className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 h-11"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
            <FiStar className="w-3 h-3 mr-1 text-yellow-500" />
            Separate tags with commas for better organization
          </p>
        </div>

        {/* Favorite Toggle */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <FiStar className={`w-5 h-5 ${formData.isFavorite ? 'text-yellow-500' : 'text-slate-400'}`} />
            <div>
              <Label htmlFor="isFavorite" className="text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                Mark as Favorite
              </Label>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Favorite passwords appear at the top of your SecureIt
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            id="isFavorite"
            name="isFavorite"
            checked={formData.isFavorite}
            onChange={handleChange}
            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600 rounded"
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 px-6 py-2"
        >
          Cancel
        </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <>
                    <motion.div
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <FiShield className="w-4 h-4 mr-2" />
                    {password ? 'Update Password' : 'Save Password'}
                  </>
                )}
              </Button>
      </div>
    </form>
  );
};

export default PasswordManager;
