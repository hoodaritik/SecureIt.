import React, { useState, useEffect } from 'react';
import { useEnhancedTheme, THEME_PRESETS } from '../context/EnhancedThemeContext';
import { FiCheck, FiDroplet } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

const ThemeSelector = () => {
  const { t } = useTranslation();
  const { themePreset, customAccentColor, isCustom, updateTheme, setIsCustom } = useEnhancedTheme();
  const [previewColor, setPreviewColor] = useState(customAccentColor || THEME_PRESETS[themePreset]?.accent || '#3B82F6');
  const [loading, setLoading] = useState(false);

  // Update preview color when customAccentColor or themePreset changes
  useEffect(() => {
    if (isCustom && customAccentColor) {
      setPreviewColor(customAccentColor);
    } else if (!isCustom && THEME_PRESETS[themePreset]) {
      setPreviewColor(THEME_PRESETS[themePreset].accent);
    }
  }, [customAccentColor, themePreset, isCustom]);

  const handleThemeSelect = async (presetName) => {
    try {
      setLoading(true);
      await updateTheme(presetName, null);
      setIsCustom(false);
      setPreviewColor(THEME_PRESETS[presetName]?.accent || '#3B82F6'); // Set preview to preset accent
      toast.success(t('settings.theme.presets.' + presetName) + ' ' + t('common.save'));
    } catch (error) {
      toast.error(t('errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  const handleCustomColor = async (color, baseTheme = null) => {
    try {
      setLoading(true);
      setPreviewColor(color);
      const base = baseTheme || themePreset; // Use current themePreset as base if not provided
      await updateTheme(base, color);
      setIsCustom(true);
      toast.success(t('settings.theme.customColor') + ' ' + t('common.save'));
    } catch (error) {
      toast.error(t('errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  const handleColorInputChange = (e) => {
    const color = e.target.value;
    setPreviewColor(color);
    // Apply preview immediately without saving
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', color);
    root.style.setProperty('--theme-secondary', color);
    root.style.setProperty('--theme-accent', color);
  };

  const applyCustomColor = async () => {
    await handleCustomColor(previewColor, themePreset);
  };

  // Preset color options for quick selection
  const presetColors = [
    '#3B82F6', // Blue
    '#8B5CF6', // Purple
    '#EF4444', // Red
    '#10B981', // Green
    '#F59E0B', // Orange
    '#EC4899', // Pink
    '#6366F1', // Indigo
    '#14B8A6'  // Teal
  ];

  return (
    <div className="space-y-6">
      {/* Theme Presets */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
          {t('settings.theme.selectTheme')}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.values(THEME_PRESETS).map((preset) => (
            <motion.button
              key={preset.name}
              onClick={() => handleThemeSelect(preset.name)}
              disabled={loading}
              className={`relative p-4 rounded-lg border-2 transition-all ${
                !isCustom && themePreset === preset.name
                  ? 'border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/30'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div
                className="w-full h-12 rounded mb-2"
                style={{
                  background: `linear-gradient(135deg, ${preset.colors.primary} 0%, ${preset.colors.secondary} 100%)`
                }}
              />
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300 text-center">
                {t(`settings.theme.presets.${preset.name}`)}
              </p>
              {!isCustom && themePreset === preset.name && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-blue-600 dark:bg-blue-400 rounded-full flex items-center justify-center">
                  <FiCheck className="w-3 h-3 text-white" />
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Custom Color Picker */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
          {t('settings.theme.customColor')}
        </label>
        
        <div className="space-y-4">
          {/* Quick Color Presets */}
          <div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
              {t('settings.theme.pickColor')}
            </p>
            <div className="flex flex-wrap gap-2">
              {presetColors.map((color) => (
                <motion.button
                  key={color}
                  onClick={() => handleCustomColor(color, themePreset)}
                  className={`w-10 h-10 rounded-lg border-2 ${
                    isCustom && customAccentColor === color
                      ? 'border-blue-600 dark:border-blue-400 scale-110'
                      : 'border-slate-200 dark:border-slate-700 hover:scale-110'
                  }`}
                  style={{ backgroundColor: color }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Custom Color Input */}
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={previewColor}
                onChange={handleColorInputChange}
                className="w-16 h-16 rounded-lg border-2 border-slate-200 dark:border-slate-700 cursor-pointer"
              />
              <input
                type="text"
                value={previewColor}
                onChange={handleColorInputChange}
                placeholder="#3B82F6"
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono text-sm"
              />
            </div>
            
            {/* Live Preview */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                {t('settings.theme.preview')}
              </p>
              <div className="flex items-center space-x-3">
                <div
                  className="flex-1 h-12 rounded-lg flex items-center justify-center text-white font-medium"
                  style={{ backgroundColor: previewColor }}
                >
                  Sample Button
                </div>
                <div
                  className="w-12 h-12 rounded-lg border-2"
                  style={{
                    borderColor: previewColor,
                    backgroundColor: `${previewColor}20`
                  }}
                />
              </div>
            </div>

            <motion.button
              onClick={applyCustomColor}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiDroplet className="w-4 h-4" />
              <span>{t('common.save')}</span>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSelector;

