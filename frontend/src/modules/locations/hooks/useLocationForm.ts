'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import type { WorkLocation, CreateLocationRequest, UpdateLocationRequest } from '../types';

interface UseLocationFormProps {
  mode: 'create' | 'edit';
  location: WorkLocation | null;
  open: boolean;
  onSubmit: (data: CreateLocationRequest | UpdateLocationRequest) => Promise<void>;
}

export function useLocationForm({ mode, location, open, onSubmit }: UseLocationFormProps) {
  const t = useTranslations();
  const locale = useLocale();
  const isAr = locale.startsWith('ar');

  const [formData, setFormData] = useState<{
    name: string;
    nameAr: string;
    nameEn: string;
    address: string;
    addressAr: string;
    addressEn: string;
    latitude: string;
    longitude: string;
    radiusMeters: string;
    accuracyThresholdMeters: string;
    isActive: boolean;
  }>({
    name: '',
    nameAr: '',
    nameEn: '',
    address: '',
    addressAr: '',
    addressEn: '',
    latitude: '',
    longitude: '',
    radiusMeters: '150',
    accuracyThresholdMeters: '50',
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSecondaryLanguage, setShowSecondaryLanguage] = useState(false);
  const [isCapturingGps, setIsCapturingGps] = useState(false);
  const [capturedAccuracy, setCapturedAccuracy] = useState<number | null>(null);

  useEffect(() => {
    if (mode === 'edit' && location) {
      const enName = location.nameEn || location.name || '';
      const arName = location.nameAr || '';
      const enAddress = location.addressEn || location.address || '';
      const arAddress = location.addressAr || '';

      setFormData({
        name: enName,
        nameEn: enName,
        nameAr: arName,
        address: enAddress,
        addressEn: enAddress,
        addressAr: arAddress,
        latitude: location.latitude !== undefined ? location.latitude.toString() : '',
        longitude: location.longitude !== undefined ? location.longitude.toString() : '',
        radiusMeters: (location.radiusMeters || 150).toString(),
        accuracyThresholdMeters: (location.accuracyThresholdMeters || 50).toString(),
        isActive: location.isActive ?? true,
      });

      const hasSecondary = isAr ? Boolean(enName || enAddress) : Boolean(arName || arAddress);
      setShowSecondaryLanguage(hasSecondary);
    } else {
      setFormData({
        name: '',
        nameAr: '',
        nameEn: '',
        address: '',
        addressAr: '',
        addressEn: '',
        latitude: '',
        longitude: '',
        radiusMeters: '150',
        accuracyThresholdMeters: '50',
        isActive: true,
      });
      setShowSecondaryLanguage(false);
    }
    setErrors({});
    setCapturedAccuracy(null);
  }, [mode, location, open, isAr]);

  const handleCaptureCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setErrors((prev) => ({ ...prev, latitude: 'Geolocation is not supported by your browser.' }));
      return;
    }

    setIsCapturingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsCapturingGps(false);
        setFormData((prev) => ({
          ...prev,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
        setCapturedAccuracy(pos.coords.accuracy);
        setErrors((prev) => {
          const updated = { ...prev };
          delete updated.latitude;
          delete updated.longitude;
          return updated;
        });
      },
      (err) => {
        setIsCapturingGps(false);
        setErrors((prev) => ({
          ...prev,
          latitude:
            err.code === err.PERMISSION_DENIED
              ? 'Permission denied. Please allow location access.'
              : 'Failed to acquire current location.',
        }));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, []);

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (isAr) {
      if (!formData.nameAr.trim()) {
        newErrors.nameAr = t('LocationNameRequired');
      } else if (formData.nameAr.length > 200) {
        newErrors.nameAr = t('LocationNameMaxLength');
      }
    } else {
      const en = (formData.nameEn || formData.name).trim();
      if (!en) {
        newErrors.nameEn = t('LocationNameRequired');
      } else if (en.length > 200) {
        newErrors.nameEn = t('LocationNameMaxLength');
      }
    }

    const lat = parseFloat(formData.latitude);
    if (!formData.latitude.trim() || isNaN(lat)) {
      newErrors.latitude = t('LatitudeRequired');
    } else if (lat < -90 || lat > 90) {
      newErrors.latitude = t('LatitudeRangeError');
    }

    const lng = parseFloat(formData.longitude);
    if (!formData.longitude.trim() || isNaN(lng)) {
      newErrors.longitude = t('LongitudeRequired');
    } else if (lng < -180 || lng > 180) {
      newErrors.longitude = t('LongitudeRangeError');
    }

    const radius = parseFloat(formData.radiusMeters);
    if (!formData.radiusMeters.trim() || isNaN(radius)) {
      newErrors.radiusMeters = t('RadiusRequired');
    } else if (radius <= 0 || radius > 10000) {
      newErrors.radiusMeters = t('RadiusRangeError');
    }

    const accuracy = parseFloat(formData.accuracyThresholdMeters);
    if (!formData.accuracyThresholdMeters.trim() || isNaN(accuracy)) {
      newErrors.accuracyThresholdMeters = t('AccuracyThresholdRequired');
    } else if (accuracy <= 0 || accuracy > 1000) {
      newErrors.accuracyThresholdMeters = t('AccuracyThresholdRangeError');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, isAr, t]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const enName = formData.nameEn.trim() || formData.name.trim();
    const arName = formData.nameAr.trim();
    const primaryName = isAr ? (arName || enName) : (enName || arName);

    const enAddress = formData.addressEn.trim() || formData.address.trim();
    const arAddress = formData.addressAr.trim();

    const payload: CreateLocationRequest | UpdateLocationRequest = {
      name: enName || primaryName,
      nameEn: enName || null,
      nameAr: arName || null,
      address: enAddress || null,
      addressEn: enAddress || null,
      addressAr: arAddress || null,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      radiusMeters: parseFloat(formData.radiusMeters),
      accuracyThresholdMeters: parseFloat(formData.accuracyThresholdMeters),
      isActive: formData.isActive,
    };

    await onSubmit(payload);
  }, [validate, formData, isAr, onSubmit]);

  const updateField = useCallback((field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  return {
    formData,
    setFormData,
    updateField,
    errors,
    showSecondaryLanguage,
    setShowSecondaryLanguage,
    isAr,
    isCapturingGps,
    capturedAccuracy,
    onCaptureCurrentLocation: handleCaptureCurrentLocation,
    onSubmit: handleSubmit,
    validate,
  };
}
