'use client';

import React, { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import type { SxProps, Theme } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import { IconUser } from '@tabler/icons-react';
import { useAuthenticatedPhotoUrl } from '@/shared/hooks/useAuthenticatedPhotoUrl';

export interface ProfilePhotoAvatarProps {
  /**
   * The backend StoredFiles GUID. If provided, the image is fetched with bearer authentication.
   */
  photoId?: string | null;
  /**
   * Direct image URL, typically used for local file picker previews before submission.
   * If provided, overrides photoId fetching.
   */
  src?: string | null;
  /**
   * Full name of the user or employee, used for initials fallback and accessible alt text.
   */
  name?: string | null;
  /**
   * Diameter in pixels (number) or responsive dimensions. Defaults to 40.
   */
  size?: number;
  /**
   * Accessible alt text. Defaults to name.
   */
  alt?: string;
  /**
   * Avatar shape variant: 'circular' | 'rounded' | 'square'. Defaults to 'circular'.
   */
  variant?: 'circular' | 'rounded' | 'square';
  /**
   * Additional MUI Sx styling overrides.
   */
  sx?: SxProps<Theme>;
  /**
   * Custom icon node when neither image nor name initials are available.
   */
  iconFallback?: React.ReactNode;
  /**
   * Visual style scheme for the avatar container:
   * - 'solid': primary.main background with high-contrast text (header, profile banners)
   * - 'soft': primary.light background with primary.main text (table cells, list items)
   */
  colorScheme?: 'solid' | 'soft';
}

/**
 * Extracts 1-2 character uppercase initials from a full name.
 */
function getInitials(name?: string | null): string {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    const first = parts[0].charAt(0);
    const last = parts[parts.length - 1].charAt(0);
    return `${first}${last}`.toUpperCase();
  }
  return parts[0].charAt(0).toUpperCase();
}

/**
 * Enterprise Profile Photo Avatar component for NASAQ.
 * Handles authenticated file downloads, in-flight deduplication, blob caching,
 * local upload previews, and graceful Modernize-styled initials/icon fallbacks.
 */
export const ProfilePhotoAvatar: React.FC<ProfilePhotoAvatarProps> = ({
  photoId,
  src,
  name,
  size = 40,
  alt,
  variant = 'circular',
  sx,
  iconFallback,
  colorScheme = 'solid',
}) => {
  const theme = useTheme();
  const [hasImageError, setHasImageError] = useState(false);

  // Authenticated blob URL resolution via custom hook
  const authenticatedUrl = useAuthenticatedPhotoUrl(photoId);

  // Direct src (local preview) takes precedence, then authenticated URL
  const effectiveSrc = src || authenticatedUrl || undefined;

  const displayName = name || alt || '';
  const initials = getInitials(displayName);
  const iconSize = Math.max(16, Math.round(size * 0.5));
  const fontSize = Math.max(11, Math.round(size * 0.38));

  const isSoft = colorScheme === 'soft';

  // If effectiveSrc changes, reset error state
  React.useEffect(() => {
    setHasImageError(false);
  }, [effectiveSrc]);

  return (
    <Avatar
      src={!hasImageError && effectiveSrc ? effectiveSrc : undefined}
      alt={displayName || 'Avatar'}
      variant={variant}
      slotProps={{
        img: {
          onError: () => setHasImageError(true),
        },
      }}
      sx={{
        width: size,
        height: size,
        fontSize: `${fontSize}px`,
        fontWeight: 700,
        flexShrink: 0,
        bgcolor: isSoft ? 'primary.light' : 'primary.main',
        color: isSoft ? 'primary.main' : 'primary.contrastText',
        ...sx,
      }}
    >
      {(!effectiveSrc || hasImageError) && (
        initials ? initials : (iconFallback || <IconUser size={iconSize} />)
      )}
    </Avatar>
  );
};

export default ProfilePhotoAvatar;
