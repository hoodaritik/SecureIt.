import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { passwordService } from '../services/passwordService';
import { noteService } from '../services/noteService';
import { 
  FiKey, 
  FiStar, 
  FiShield, 
  FiPlus, 
  FiSearch, 
  FiZap, 
  FiTrendingUp, 
  FiActivity, 
  FiEye, 
  FiClock, 
  FiAlertTriangle, 
  FiLock,
  FiFileText,
  FiBookmark,
  FiCode,
  FiTag
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const Dashboard = () => {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [passwordStats, setPasswordStats] = useState({
    total: 0,
    categories: 0,
    favorites: 0,
    securityScore: 85
  });
  const [noteStats, setNoteStats] = useState({
    total: 0,
    pinned: 0,
    code: 0,
    tags: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [quickNotes, setQuickNotes] = useState([]);

  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load passwords
      const passwordsResponse = await passwordService.getPasswords();
      const passwords = passwordsResponse.passwords || [];
      
      // Calculate password stats
      const uniqueCategories = new Set(passwords.map(p => p.category).filter(Boolean));
      const favorites = passwords.filter(p => p.isFavorite).length;
      
      setPasswordStats({
        total: passwords.length,
        categories: uniqueCategories.size,
        favorites: favorites,
        securityScore: calculateSecurityScore(passwords)
      });

      // Load notes
      const notesResponse = await noteService.getNotes({ limit: 100 });
      const notes = notesResponse.notes || [];
      
      // Calculate note stats
      const pinnedNotes = notes.filter(n => n.pinned).length;
      const codeNotes = notes.filter(n => n.type === 'code').length;
      const allTags = new Set();
      notes.forEach(note => {
        if (note.tags && note.tags.length > 0) {
          note.tags.forEach(tag => allTags.add(tag));
        }
      });

      setNoteStats({
        total: notes.length,
        pinned: pinnedNotes,
        code: codeNotes,
        tags: allTags.size
      });

      // Get recent notes (for quick access)
      const recentNotes = notes
        .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
        .slice(0, 3);
      setQuickNotes(recentNotes);

      // Combine recent activities
      const activities = [];
      
      // Add recent password activities
      passwords
        .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
        .slice(0, 2)
        .forEach(p => {
          activities.push({
            title: p.isFavorite ? 'Favorite Password' : 'Password Updated',
            description: p.title || 'Untitled Password',
            time: formatTimeAgo(p.updatedAt || p.createdAt),
            type: 'update',
            icon: FiKey,
            href: '/passwords'
          });
        });

      // Add recent note activities
      recentNotes.forEach(n => {
        activities.push({
          title: n.pinned ? 'Pinned Note Updated' : 'Note Updated',
          description: n.title || 'Untitled Note',
          time: formatTimeAgo(n.updatedAt || n.createdAt),
          type: 'update',
          icon: FiFileText,
          href: '/notes'
        });
      });

      // Sort activities by time
      activities.sort((a, b) => {
        // Extract time for sorting (this is simplified - you might want to parse dates properly)
        return 0;
      });

      setRecentActivity(activities.slice(0, 5));

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSecurityScore = (passwords) => {
    if (passwords.length === 0) return 100;
    
    let totalScore = 0;
    passwords.forEach(p => {
      let score = 0;
      const pass = p.password || '';
      
      // Length check
      if (pass.length >= 12) score += 25;
      else if (pass.length >= 8) score += 15;
      else score += 5;
      
      // Complexity check
      if (/[a-z]/.test(pass)) score += 10;
      if (/[A-Z]/.test(pass)) score += 10;
      if (/[0-9]/.test(pass)) score += 10;
      if (/[^a-zA-Z0-9]/.test(pass)) score += 15;
      
      totalScore += Math.min(score, 70); // Max 70 per password
    });
    
    return Math.round((totalScore / passwords.length) * 100 / 70);
  };

  const formatTimeAgo = (date) => {
    if (!date) return 'Recently';
    const now = new Date();
    const then = new Date(date);
    const diffInMinutes = Math.floor((now - then) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return then.toLocaleDateString();
  };

  const stripHtml = (html) => {
    if (!html) return '';
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const stats = [
    {
      title: 'Total Passwords',
      value: passwordStats.total.toString(),
      change: passwordStats.total > 0 ? '+' : '',
      changeType: 'neutral',
      icon: FiKey,
      description: 'Stored securely',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50',
      textColor: 'text-blue-600 dark:text-blue-400',
      borderColor: 'border-blue-200 dark:border-blue-800'
    },
    {
      title: 'Total Notes',
      value: noteStats.total.toString(),
      change: noteStats.total > 0 ? '+' : '',
      changeType: 'neutral',
      icon: FiFileText,
      description: 'Notes & snippets',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50',
      textColor: 'text-purple-600 dark:text-purple-400',
      borderColor: 'border-purple-200 dark:border-purple-800'
    },
    {
      title: 'Pinned Items',
      value: (passwordStats.favorites + noteStats.pinned).toString(),
      change: (passwordStats.favorites + noteStats.pinned) > 0 ? '+' : '',
      changeType: 'neutral',
      icon: FiBookmark,
      description: 'Favorites & pinned',
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'from-yellow-50 to-orange-50 dark:from-yellow-950/50 dark:to-orange-950/50',
      textColor: 'text-yellow-600 dark:text-yellow-400',
      borderColor: 'border-yellow-200 dark:border-yellow-800'
    },
    {
      title: 'Security Score',
      value: `${passwordStats.securityScore}%`,
      change: passwordStats.securityScore >= 80 ? 'Excellent' : passwordStats.securityScore >= 60 ? 'Good' : 'Fair',
      changeType: passwordStats.securityScore >= 80 ? 'positive' : passwordStats.securityScore >= 60 ? 'neutral' : 'warning',
      icon: FiShield,
      description: 'Password strength',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50',
      textColor: 'text-green-600 dark:text-green-400',
      borderColor: 'border-green-200 dark:border-green-800'
    },
  ];

  const quickActions = [
    {
      title: 'Add Password',
      description: 'Store a new password securely',
      icon: FiPlus,
      href: '/passwords',
      color: 'from-blue-500 to-purple-500',
      bgColor: 'from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50'
    },
    {
      title: 'New Note',
      description: 'Create a note or code snippet',
      icon: FiFileText,
      href: '/notes',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50'
    },
    {
      title: 'View Passwords',
      description: 'Browse your password vault',
      icon: FiSearch,
      href: '/passwords',
      color: 'from-indigo-500 to-blue-500',
      bgColor: 'from-indigo-50 to-blue-50 dark:from-indigo-950/50 dark:to-blue-950/50'
    },
    {
      title: 'View Notes',
      description: 'Access your notes library',
      icon: FiFileText,
      href: '/notes',
      color: 'from-violet-500 to-purple-500',
      bgColor: 'from-violet-50 to-purple-50 dark:from-violet-950/50 dark:to-purple-950/50'
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          className="w-12 h-12 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Professional Welcome Header */}
      <motion.div
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 p-6 sm:p-8 lg:p-10 text-white shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <motion.div
                className="flex items-center space-x-3 mb-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <span className="text-white font-semibold text-lg">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold">
                    Welcome back, {user?.username}! 👋
                  </h1>
                  <p className="text-blue-100 text-base lg:text-lg">
                    Manage your passwords and notes securely
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="flex flex-wrap items-center gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                  <FiShield className="w-3 h-3 mr-1" />
                  All Systems Secure
                </Badge>
                {passwordStats.total > 0 && (
                  <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                    <FiKey className="w-3 h-3 mr-1" />
                    {passwordStats.total} Password{passwordStats.total !== 1 ? 's' : ''}
                  </Badge>
                )}
                {noteStats.total > 0 && (
                  <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                    <FiFileText className="w-3 h-3 mr-1" />
                    {noteStats.total} Note{noteStats.total !== 1 ? 's' : ''}
                  </Badge>
                )}
              </motion.div>
            </div>

            <motion.div
              className="hidden md:flex flex-col items-center space-y-2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                <FiShield className="w-10 h-10 text-white" />
              </div>
              <div className="text-center">
                <div className="text-sm font-medium">Security Score</div>
                <div className="text-2xl font-bold">
                  {passwordStats.securityScore >= 80 ? 'Excellent' : passwordStats.securityScore >= 60 ? 'Good' : 'Fair'}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Background decorative elements */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/3 rounded-full blur-3xl"></div>
      </motion.div>

      {/* Professional Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
            >
              <Card className={`bg-gradient-to-br ${stat.bgColor} border ${stat.borderColor} hover:shadow-xl transition-all duration-300 hover:border-opacity-50`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <motion.div
                      className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </motion.div>
                    <div className="text-right">
                      {stat.change && stat.changeType !== 'neutral' && (
                        <Badge
                          variant="secondary"
                          className={`text-xs font-medium ${
                            stat.changeType === 'positive'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                              : stat.changeType === 'warning'
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {stat.change}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div>
                    <CardTitle className={`text-3xl font-bold mb-1 ${stat.textColor}`}>
                      {stat.value}
                    </CardTitle>
                    <CardDescription className="text-sm font-medium mb-2">
                      {stat.title}
                    </CardDescription>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {stat.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Professional Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card className="border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors duration-300">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <FiZap className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Get started with common tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <motion.div
                    key={action.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link to={action.href}>
                      <Card className={`h-full bg-gradient-to-br ${action.bgColor} border border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group`}>
                        <CardContent className="p-6 text-center">
                          <motion.div
                            className={`w-16 h-16 bg-gradient-to-br ${action.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                          >
                            <Icon className="w-8 h-8 text-white" />
                          </motion.div>
                          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {action.title}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {action.description}
                          </CardDescription>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Notes & Recent Activity Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Notes */}
        {quickNotes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card className="border-slate-200 dark:border-slate-700 h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-xl">
                    <FiFileText className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
                    Recent Notes
                  </CardTitle>
                  <Link to="/notes" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                    View All
                  </Link>
                </div>
                <CardDescription>
                  Your most recently updated notes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {quickNotes.map((note, index) => {
                    const preview = stripHtml(note.content || '').substring(0, 60);
                    return (
                      <motion.div
                        key={note._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                        whileHover={{ scale: 1.01 }}
                      >
                        <Link to="/notes">
                          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                                {note.pinned && <FiBookmark className="w-4 h-4 text-blue-500" />}
                                {note.type === 'code' && <FiCode className="w-4 h-4 text-purple-500" />}
                                <span className="truncate">{note.title || 'Untitled Note'}</span>
                              </h4>
                            </div>
                            {preview && (
                              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">
                                {preview}...
                              </p>
                            )}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
                                <FiClock className="w-3 h-3" />
                                <span>{formatTimeAgo(note.updatedAt || note.createdAt)}</span>
                              </div>
                              {note.tags && note.tags.length > 0 && (
                                <div className="flex items-center space-x-1">
                                  <FiTag className="w-3 h-3 text-slate-400" />
                                  <span className="text-xs text-slate-500">{note.tags.length}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Recent Activity Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card className="border-slate-200 dark:border-slate-700 h-full">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <FiClock className="w-5 h-5 mr-2 text-slate-600 dark:text-slate-400" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Your latest activities across the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => {
                    const Icon = activity.icon;
                    const getActivityColor = () => {
                      switch (activity.type) {
                        case 'add': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50';
                        case 'update': return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50';
                        case 'warning': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/50';
                        default: return 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800';
                      }
                    };

                    return (
                      <motion.div
                        key={index}
                        className="flex items-center space-x-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                        whileHover={{ scale: 1.01 }}
                      >
                        <Link to={activity.href || '#'} className="flex items-center space-x-4 w-full">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getActivityColor()}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                              {activity.title}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                              {activity.description}
                            </p>
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {activity.time}
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    <FiActivity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No recent activity</p>
                    <p className="text-sm mt-1">Start by adding passwords or notes!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Feature Highlights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-800 dark:text-blue-200">
              <FiTrendingUp className="w-5 h-5 mr-2" />
              Feature Highlights
            </CardTitle>
            <CardDescription className="text-blue-700 dark:text-blue-300">
              Explore the powerful features available in your vault
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3 p-4 rounded-lg bg-white/70 dark:bg-slate-800/70">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                  <FiKey className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-1">Password Manager</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Securely store, organize, and manage all your passwords with encryption
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 rounded-lg bg-white/70 dark:bg-slate-800/70">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50">
                  <FiFileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-1">Notes & Snippets</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    AI-powered note-taking with code syntax highlighting and organization
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 rounded-lg bg-white/70 dark:bg-slate-800/70">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/50">
                  <FiShield className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-1">Security Features</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Two-factor authentication, encryption, and security scoring
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 rounded-lg bg-white/70 dark:bg-slate-800/70">
                <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/50">
                  <FiStar className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-1">Organization</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Categories, tags, favorites, and smart search for easy access
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Security Tips Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <Card className="border-green-200 dark:border-green-800 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
          <CardHeader>
            <CardTitle className="flex items-center text-green-800 dark:text-green-200">
              <FiShield className="w-5 h-5 mr-2" />
              Security Tips
            </CardTitle>
            <CardDescription className="text-green-700 dark:text-green-300">
              Keep your data secure with these best practices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3 p-4 rounded-lg bg-white/50 dark:bg-slate-800/50">
                <FiLock className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-800 dark:text-green-200">Use Strong Passwords</h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Always use complex passwords with letters, numbers, and symbols
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 rounded-lg bg-white/50 dark:bg-slate-800/50">
                <FiEye className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-800 dark:text-green-200">Enable 2FA</h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Add an extra layer of security to your accounts
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 rounded-lg bg-white/50 dark:bg-slate-800/50">
                <FiFileText className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-800 dark:text-green-200">Organize Your Notes</h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Use tags and categories to keep your notes organized and searchable
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 rounded-lg bg-white/50 dark:bg-slate-800/50">
                <FiAlertTriangle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-800 dark:text-green-200">Stay Updated</h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Keep your software and security tools updated
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;
