'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import type { TranslationDto } from '@/shared/types/translation.types';

export interface MultilingualValues {
  nameAr: string;
  nameEn: string;
  descAr?: string;
  descEn?: string;
}

export interface MultilingualNameInputProps {
  values: MultilingualValues;
  onChange: (values: MultilingualValues) => void;
  nameLabelAr?: string;
  nameLabelEn?: string;
  descLabelAr?: string;
  descLabelEn?: string;
  namePlaceholderAr?: string;
  namePlaceholderEn?: string;
  descPlaceholderAr?: string;
  descPlaceholderEn?: string;
  withDescription?: boolean;
  required?: boolean;
  disabled?: boolean;
  errors?: {
    nameAr?: string;
    nameEn?: string;
    descAr?: string;
    descEn?: string;
  };
  maxNameLength?: number;
  maxDescLength?: number;
}

/**
 * Converts form MultilingualValues to backend TranslationDto array
 */
export function toTranslationDtos(values: MultilingualValues): TranslationDto[] {
  const list: TranslationDto[] = [];
  if (values.nameAr?.trim()) {
    list.push({
      languageCode: 'ar',
      name: values.nameAr.trim(),
      description: values.descAr?.trim() || null,
    });
  }
  if (values.nameEn?.trim()) {
    list.push({
      languageCode: 'en',
      name: values.nameEn.trim(),
      description: values.descEn?.trim() || null,
    });
  }
  return list;
}

/**
 * Extracts MultilingualValues from entity translations with legacy fallback
 */
export function fromTranslationDtos(
  translations?: TranslationDto[] | null,
  legacyName = '',
  legacyDesc = ''
): MultilingualValues {
  const ar = translations?.find((t) => t.languageCode?.toLowerCase() === 'ar');
  const en = translations?.find((t) => t.languageCode?.toLowerCase() === 'en');

  return {
    nameAr: ar?.name || legacyName || '',
    nameEn: en?.name || '',
    descAr: ar?.description || legacyDesc || '',
    descEn: en?.description || '',
  };
}

export function MultilingualNameInput({
  values,
  onChange,
  nameLabelAr = 'الاسم بالعربية',
  nameLabelEn = 'Name in English',
  descLabelAr = 'الوصف بالعربية',
  descLabelEn = 'Description in English',
  namePlaceholderAr = 'أدخل الاسم باللغة العربية...',
  namePlaceholderEn = 'Enter name in English...',
  descPlaceholderAr = 'أدخل الوصف باللغة العربية (اختياري)...',
  descPlaceholderEn = 'Enter description in English (optional)...',
  withDescription = false,
  required = true,
  disabled = false,
  errors = {},
  maxNameLength = 256,
  maxDescLength = 1000,
}: MultilingualNameInputProps) {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<'ar' | 'en'>('ar');

  const handleTabChange = (_: React.SyntheticEvent, newTab: 'ar' | 'en') => {
    setActiveTab(newTab);
  };

  const handleFieldChange = (field: keyof MultilingualValues, val: string) => {
    onChange({
      ...values,
      [field]: val,
    });
  };

  const hasAr = Boolean(values.nameAr?.trim());
  const hasEn = Boolean(values.nameEn?.trim());

  return (
    <Box
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        p: 2,
        backgroundColor:
          theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.01)',
      }}
    >
      {/* Header Tabs */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2, borderBottom: `1px solid ${theme.palette.divider}`, pb: 0.5 }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
          sx={{ minHeight: 38 }}
        >
          <Tab
            value="ar"
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <span>عربي (AR)</span>
                {hasAr && (
                  <Chip
                    label="✓"
                    size="small"
                    color="success"
                    sx={{ height: 18, fontSize: '0.7rem', px: 0.5 }}
                  />
                )}
              </Stack>
            }
            sx={{ minHeight: 38, py: 0.5, fontWeight: activeTab === 'ar' ? 600 : 400 }}
          />
          <Tab
            value="en"
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <span>English (EN)</span>
                {hasEn && (
                  <Chip
                    label="✓"
                    size="small"
                    color="success"
                    sx={{ height: 18, fontSize: '0.7rem', px: 0.5 }}
                  />
                )}
              </Stack>
            }
            sx={{ minHeight: 38, py: 0.5, fontWeight: activeTab === 'en' ? 600 : 400 }}
          />
        </Tabs>
        <Typography variant="caption" color="text.secondary">
          {activeTab === 'ar' ? 'اللغة العربية (مطلوبة)' : 'English (Optional / Recommended)'}
        </Typography>
      </Stack>

      {/* Arabic Inputs */}
      {activeTab === 'ar' && (
        <Stack spacing={2} dir="rtl">
          <TextField
            fullWidth
            label={nameLabelAr}
            placeholder={namePlaceholderAr}
            value={values.nameAr}
            onChange={(e) => handleFieldChange('nameAr', e.target.value)}
            required={required}
            disabled={disabled}
            error={Boolean(errors.nameAr)}
            helperText={errors.nameAr || `${values.nameAr.length}/${maxNameLength}`}
            slotProps={{
              htmlInput: {
                maxLength: maxNameLength,
                dir: 'rtl',
              },
            }}
          />
          {withDescription && (
            <TextField
              fullWidth
              multiline
              rows={3}
              label={descLabelAr}
              placeholder={descPlaceholderAr}
              value={values.descAr || ''}
              onChange={(e) => handleFieldChange('descAr', e.target.value)}
              disabled={disabled}
              error={Boolean(errors.descAr)}
              helperText={errors.descAr || `${(values.descAr || '').length}/${maxDescLength}`}
              slotProps={{
                htmlInput: {
                  maxLength: maxDescLength,
                  dir: 'rtl',
                },
              }}
            />
          )}
        </Stack>
      )}

      {/* English Inputs */}
      {activeTab === 'en' && (
        <Stack spacing={2}>
          <TextField
            fullWidth
            label={nameLabelEn}
            placeholder={namePlaceholderEn}
            value={values.nameEn}
            onChange={(e) => handleFieldChange('nameEn', e.target.value)}
            disabled={disabled}
            error={Boolean(errors.nameEn)}
            helperText={errors.nameEn || `${values.nameEn.length}/${maxNameLength}`}
            slotProps={{
              htmlInput: {
                maxLength: maxNameLength,
                dir: 'ltr',
              },
            }}
          />
          {withDescription && (
            <TextField
              fullWidth
              multiline
              rows={3}
              label={descLabelEn}
              placeholder={descPlaceholderEn}
              value={values.descEn || ''}
              onChange={(e) => handleFieldChange('descEn', e.target.value)}
              disabled={disabled}
              error={Boolean(errors.descEn)}
              helperText={errors.descEn || `${(values.descEn || '').length}/${maxDescLength}`}
              slotProps={{
                htmlInput: {
                  maxLength: maxDescLength,
                  dir: 'ltr',
                },
              }}
            />
          )}
        </Stack>
      )}
    </Box>
  );
}
